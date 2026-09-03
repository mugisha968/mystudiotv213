import { randomUUID } from 'node:crypto'
import { Router, type Request } from 'express'

import {
  getCurrentUser,
  getUserFromRequest,
  requireActiveJournoOrStaff,
  requireAuth,
  requireStaff,
} from '../auth/guards.js'
import { countArticles, queryArticles } from '../db/articles.js'
import { db, sqlNow } from '../db/index.js'
import type {
  ArticleRow,
  ArticleStatus,
  ArticleWithRelations,
  CategoryRow,
  ProfileRow,
} from '../types.js'
import { ApiError } from '../util/http.js'
import { serializeArticle } from '../util/serialize.js'
import {
  asLanguage,
  asOptionalId,
  asOptionalString,
  asString,
  asStringArray,
  asBoolean,
  isValidUrl,
  isValidYouTubeUrl,
  parseRouteId,
} from '../util/validators.js'

export const articlesRouter = Router()

const MAX_LIMIT = 50

const VALID_STATUSES: ArticleStatus[] = [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'scheduled',
  'published',
  'archived',
]

function asQuery(req: Request): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') out[key] = value
  }
  return out
}

function parseLimitOffset(req: Request): string {
  const query = asQuery(req)
  const rawLimit = Number.parseInt(query.limit ?? '20', 10)
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
    : 20
  const offset = Math.max(Number.parseInt(query.offset ?? '0', 10) || 0, 0)
  return `limit ${limit} offset ${offset}`
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function uniqueSlug(base: string, excludeId?: number): string {
  const root = base || `article-${randomUUID().slice(0, 8)}`
  let candidate = root
  let n = 2
  for (;;) {
    const row = db
      .prepare('select id from articles where slug = ?')
      .get(candidate) as { id: number } | undefined
    if (!row || row.id === excludeId) return candidate
    candidate = `${root}-${n}`
    n += 1
  }
}

function findCategory(categoryId: number | null): number | null {
  if (categoryId === null) return null
  const row = db
    .prepare('select id from categories where id = ?')
    .get(categoryId) as { id: number } | undefined
  if (!row) {
    throw new ApiError(400, 'invalid_request', 'Selected category does not exist')
  }
  return row.id
}

function requireArticleAccess(user: { id: number; role: string }, article: ArticleRow): void {
  const isOwner = article.author_id === user.id
  const isStaff = user.role === 'admin' || user.role === 'manager'
  if (!isOwner && !isStaff) {
    throw new ApiError(403, 'forbidden', 'You do not have permission to modify this article')
  }
}

function parseArticleInput(body: unknown, partial: boolean): Partial<ArticleRow> {
  const input = (body ?? {}) as Record<string, unknown>
  const data: Partial<ArticleRow> = {}

  const title = partial ? asOptionalString(input.title, 'title', 180) : asString(input.title, 'title', 180)
  if (title !== undefined && title !== null) data.title = title

  if (input.content !== undefined) {
    const content = asOptionalString(input.content, 'content', 200_000)
    data.content = content ?? ''
  }

  if (input.category_id !== undefined) {
    data.category_id = findCategory(asOptionalId(input.category_id, 'category_id'))
  }

  if (input.article_language !== undefined) {
    data.article_language = asLanguage(input.article_language)
  }

  if (input.featured_image !== undefined) {
    const url = asOptionalString(input.featured_image, 'featured_image')
    if (url && !isValidUrl(url) && !url.startsWith('/uploads/')) {
      throw new ApiError(400, 'invalid_request', 'Featured image must be a valid URL or uploaded path')
    }
    data.featured_image = url
  }

  if (input.images !== undefined) {
    const images = asStringArray(input.images, 'images')
    for (const image of images) {
      if (!isValidUrl(image) && !image.startsWith('/uploads/')) {
        throw new ApiError(400, 'invalid_request', 'Images must be valid URLs or uploaded paths')
      }
    }
    data.images = JSON.stringify(images)
  }

  if (input.tags !== undefined) {
    data.tags = JSON.stringify(asStringArray(input.tags, 'tags'))
  }

  if (input.youtube_url !== undefined) {
    const url = asOptionalString(input.youtube_url, 'youtube_url')
    if (url && !isValidYouTubeUrl(url)) {
      throw new ApiError(400, 'invalid_request', 'Invalid YouTube URL')
    }
    data.youtube_url = url
  }

  if (input.scheduled_at !== undefined) {
    data.scheduled_at = parseScheduledAt(input.scheduled_at)
  }

  return data
}

function parseScheduledAt(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string') {
    throw new ApiError(400, 'invalid_request', 'scheduled_at must be an ISO date string')
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, 'invalid_request', 'scheduled_at must be a valid date')
  }
  if (date.getTime() <= Date.now()) {
    throw new ApiError(
      400,
      'invalid_request',
      'scheduled_at must be in the future',
    )
  }
  return date.toISOString()
}

// Canonical workflow transitions. `target` may be null to forbid an exit state.
const WORKFLOW: Record<ArticleStatus, Partial<Record<ArticleStatus, boolean>>> = {
  draft: { pending_review: true },
  pending_review: { approved: true, rejected: true, draft: true },
  approved: { pending_review: true, scheduled: true, published: true, draft: true },
  rejected: { pending_review: true, draft: true },
  scheduled: { pending_review: true, published: true, draft: true },
  published: { draft: true, archived: true },
  archived: { draft: true, published: true },
}

// Journalists may drive their own workflow only up to submission; staff
// (admin/manager) may additionally approve, reject, schedule and publish.
function isStaffRole(role: string): boolean {
  return role === 'admin' || role === 'manager'
}

export function canTransition(
  current: ArticleStatus,
  next: ArticleStatus,
  role: string,
): boolean {
  const allowed = WORKFLOW[current]?.[next]
  if (!allowed) return false
  if (isStaffRole(role)) return true
  // Staff-gated transitions below require an admin/manager.
  const staffOnly: Record<string, true> = {
    approved: true,
    rejected: true,
    scheduled: true,
    published: true,
    archived: true,
  }
  return !staffOnly[next]
}

function parseStatusInput(value: unknown): ArticleStatus | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string' || !(VALID_STATUSES as readonly string[]).includes(value)) {
    throw new ApiError(400, 'invalid_request', 'Invalid article status')
  }
  return value as ArticleStatus
}

function serializeOne(row: ArticleRow): ArticleWithRelations {
  const author = db
    .prepare('select * from profiles where id = ?')
    .get(row.author_id) as ProfileRow | undefined
  const category = row.category_id
    ? (db.prepare('select * from categories where id = ?').get(row.category_id) as CategoryRow | undefined)
    : undefined
  const reviewer =
    row.reviewed_by !== null
      ? (db.prepare('select * from profiles where id = ?').get(row.reviewed_by) as ProfileRow | undefined)
      : null
  return serializeArticle(row, author, category, reviewer)
}

articlesRouter.get('/', (req, res) => {
  const query = asQuery(req)
  const conditions: string[] = ["a.status = 'published'"]
  const filters: Array<string | number> = []

  if (query.featured === 'true') {
    conditions.push('a.featured = 1')
  }
  if (query.breaking === 'true') {
    conditions.push('a.breaking_news = 1')
  }
  if (query.category) {
    conditions.push('c.slug = ?')
    filters.push(query.category)
  }
  if (query.author) {
    const authorId = Number.parseInt(query.author, 10)
    if (Number.isFinite(authorId)) {
      conditions.push('a.author_id = ?')
      filters.push(authorId)
    }
  }
  if (query.language) {
    conditions.push('a.article_language = ?')
    filters.push(query.language)
  }
  if (query.q && query.q.trim()) {
    conditions.push('(a.title like ? or a.content like ?)')
    const pattern = `%${query.q.trim()}%`
    filters.push(pattern, pattern)
  }

  const joinCategories = query.category
    ? 'join categories c on c.id = a.category_id'
    : ''

  const articles = queryArticles({
    from: joinCategories,
    where: conditions.join(' and '),
    params: filters,
    limitOffset: parseLimitOffset(req),
  })

  const total = countArticles(
    joinCategories,
    conditions.join(' and '),
    filters,
  )

  res.json({ articles, total })
})

articlesRouter.get('/videos', (req, res) => {
  const articles = queryArticles({
    where:
      "a.status = 'published' and a.youtube_url is not null and a.youtube_url <> ''",
    limitOffset: parseLimitOffset(req),
  })
  res.json({ articles })
})

articlesRouter.get('/featured', (_req, res) => {
  const articles = queryArticles({
    where: "a.status = 'published' and a.featured = 1",
    limitOffset: 'limit 6',
  })
  res.json({ articles })
})

articlesRouter.get('/breaking', (_req, res) => {
  const articles = queryArticles({
    where: "a.status = 'published' and a.breaking_news = 1",
    limitOffset: 'limit 5',
  })
  res.json({ articles })
})

articlesRouter.get('/popular', (_req, res) => {
  const articles = queryArticles({
    where: "a.status = 'published'",
    order: 'order by a.views desc, a.published_at desc',
    limitOffset: 'limit 10',
  })
  res.json({ articles })
})

articlesRouter.get('/:slug', (req, res) => {
  const slug = req.params.slug
  const found = queryArticles({ where: 'a.slug = ?', params: [slug] })
  const article = found[0]

  if (!article) {
    throw new ApiError(404, 'not_found', 'Article not found')
  }

  if (article.status !== 'published') {
    const user = getUserFromRequest(req)
    const canView =
      user &&
      (user.id === article.author_id ||
        user.role === 'admin' ||
        user.role === 'manager')
    if (!canView) {
      throw new ApiError(404, 'not_found', 'Article not found')
    }
  }

  if (article.status === 'published') {
    db.prepare('update articles set views = views + 1 where id = ?').run(article.id)
    article.views += 1
  }

  res.json({ article })
})

articlesRouter.get(
  '/dashboard/journalist/articles',
  requireAuth,
  requireActiveJournoOrStaff,
  (req, res) => {
    const user = getCurrentUser(res)
    const query = asQuery(req)
    const status = query.status

    const conditions = ['a.author_id = ?']
    const params: Array<string | number> = [user.id]
    if (status && (VALID_STATUSES as readonly string[]).includes(status)) {
      conditions.push('a.status = ?')
      params.push(status)
    }

    const articles = queryArticles({
      where: conditions.join(' and '),
      params,
      order: 'order by a.updated_at desc',
    })

    res.json({ articles })
  },
)

articlesRouter.get(
  '/dashboard/articles',
  requireAuth,
  requireStaff,
  (req, res) => {
    const query = asQuery(req)
    const status = query.status
    const featuredOnly = query.featured === 'true'

    const conditions: string[] = []
    const params: Array<string | number> = []
    if (status && (VALID_STATUSES as readonly string[]).includes(status)) {
      conditions.push('a.status = ?')
      params.push(status)
    }
    if (featuredOnly) {
      conditions.push('a.featured = 1')
    }

    const articles = queryArticles({
      where: conditions.join(' and '),
      params,
      order: 'order by a.updated_at desc',
      limitOffset: parseLimitOffset(req),
    })

    res.json({ articles })
  },
)

// Create article (journalist creates their own, staff may create with author_id)
articlesRouter.post(
  '/',
  requireAuth,
  requireActiveJournoOrStaff,
  (req, res) => {
    const user = getCurrentUser(res)
    const data = parseArticleInput(req.body, false)

    const title = data.title ?? 'Untitled'
    const slug = slugify(title) || `article-${randomUUID().slice(0, 8)}`

    let authorId = user.id
    if (user.role === 'admin' || user.role === 'manager') {
      const requestedAuthor = asOptionalId((req.body as Record<string, unknown>)?.author_id, 'author_id')
      if (requestedAuthor !== null) {
        const exists = db
          .prepare('select id from profiles where id = ? and role = ?')
          .get(requestedAuthor, 'journalist') as { id: number } | undefined
        if (!exists) {
          throw new ApiError(400, 'invalid_request', 'Author must be an existing journalist')
        }
        authorId = requestedAuthor
      }
    }

    const statusInput = parseStatusInput((req.body as Record<string, unknown>)?.status)
    const status = statusInput ?? 'draft'
    if (status !== 'draft' && status !== 'pending_review') {
      throw new ApiError(
        400,
        'invalid_request',
        'New articles may only be created as a draft or submitted for review',
      )
    }

    const publishedAt = null
    const submittedAt = status === 'pending_review' ? sqlNow() : null
    const scheduledAt = null
    const categoryId = data.category_id ?? null

    const info = db
      .prepare(
        `insert into articles
           (author_id, category_id, title, slug, content, featured_image, images,
            youtube_url, article_language, status, tags, published_at,
            scheduled_at, submitted_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        authorId,
        categoryId,
        title,
        uniqueSlug(slug),
        data.content ?? '',
        data.featured_image ?? null,
        data.images ?? '[]',
        data.youtube_url ?? null,
        data.article_language ?? 'en',
        status,
        data.tags ?? '[]',
        publishedAt,
        scheduledAt,
        submittedAt,
      )

    const row = db
      .prepare('select * from articles where id = ?')
      .get(info.lastInsertRowid as number) as ArticleRow
    res.status(201).json({ article: serializeOne(row) })
  },
)

articlesRouter.put(
  '/dashboard/article/:id',
  requireAuth,
  requireActiveJournoOrStaff,
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const row = Number.isFinite(id)
      ? (db.prepare('select * from articles where id = ?').get(id) as ArticleRow | undefined)
      : undefined
    if (!row) {
      throw new ApiError(404, 'not_found', 'Article not found')
    }

    const user = getCurrentUser(res)
    requireArticleAccess(user, row)

    const data = parseArticleInput(req.body, true)
    const statusInput = parseStatusInput((req.body as Record<string, unknown>)?.status)

    const fields: string[] = ['updated_at = ?']
    const params: Array<string | number | null> = [sqlNow()]

    for (const column of [
      'title',
      'content',
      'featured_image',
      'youtube_url',
      'article_language',
      'category_id',
      'images',
      'tags',
      'scheduled_at',
    ] as const) {
      if (data[column] !== undefined) {
        fields.push(`${column} = ?`)
        params.push(data[column] as string | number | null)
      }
    }

    if (data.title && data.title !== row.title) {
      fields.push('slug = ?')
      params.push(uniqueSlug(slugify(data.title), row.id))
    }

    // Status transitions are validated against the CURRENT database status,
    // never against a status supplied by the client. Only the owner or staff
    // may drive the workflow (see requireArticleAccess + canTransition).
    if (statusInput && statusInput !== row.status) {
      if (!canTransition(row.status, statusInput, user.role)) {
        throw new ApiError(
          400,
          'invalid_transition',
          `Cannot change an article from "${row.status}" to "${statusInput}"`,
        )
      }

      fields.push('status = ?')
      params.push(statusInput)

      // Audit timestamps for each stage of the workflow.
      if (statusInput === 'pending_review') {
        fields.push('submitted_at = ?')
        params.push(sqlNow())
        fields.push('reject_reason = null')
      }
      if (statusInput === 'approved') {
        fields.push('reviewed_by = ?')
        fields.push('reviewed_at = ?')
        params.push(user.id, sqlNow())
        fields.push('submitted_at = ?')
        if (row.submitted_at == null) params.push(sqlNow())
        else params.push(row.submitted_at)
      }
      if (statusInput === 'rejected') {
        fields.push('reviewed_by = ?')
        fields.push('reviewed_at = ?')
        params.push(user.id, sqlNow())
        const reason = asOptionalString(
          (req.body as Record<string, unknown>)?.reject_reason,
          'reject_reason',
          400,
        )
        fields.push('reject_reason = ?')
        params.push(reason)
      }
      if (statusInput === 'scheduled') {
        if (!row.scheduled_at && !data.scheduled_at) {
          throw new ApiError(
            400,
            'invalid_request',
            'A future scheduled_at date is required when scheduling an article',
          )
        }
      }
      if (statusInput === 'published') {
        fields.push('published_at = ?')
        if (row.published_at) params.push(row.published_at)
        else params.push(sqlNow())
        fields.push('scheduled_at = null')
        fields.push('submitted_at = ?')
        if (row.submitted_at == null) params.push(sqlNow())
        else params.push(row.submitted_at)
      }
      if (statusInput === 'draft') {
        fields.push('scheduled_at = null')
      }
    }

    db.prepare(`update articles set ${fields.join(', ')} where id = ?`).run(
      ...params,
      row.id,
    )

    const updated = db.prepare('select * from articles where id = ?').get(row.id) as ArticleRow
    res.json({ article: serializeOne(updated) })
  },
)

articlesRouter.delete(
  '/dashboard/article/:id',
  requireAuth,
  requireActiveJournoOrStaff,
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const row = Number.isFinite(id)
      ? (db.prepare('select * from articles where id = ?').get(id) as ArticleRow | undefined)
      : undefined
    if (!row) {
      throw new ApiError(404, 'not_found', 'Article not found')
    }

    const user = getCurrentUser(res)
    requireArticleAccess(user, row)

    db.prepare('delete from articles where id = ?').run(id)
    res.status(204).send()
  },
)

// Publish / unpublish / archive toggles
articlesRouter.post(
  '/dashboard/article/:id/publish',
  requireAuth,
  requireActiveJournoOrStaff,
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const row = Number.isFinite(id)
      ? (db.prepare('select * from articles where id = ?').get(id) as ArticleRow | undefined)
      : undefined
    if (!row) {
      throw new ApiError(404, 'not_found', 'Article not found')
    }
    const user = getCurrentUser(res)
    requireArticleAccess(user, row)

    const publishedAt = row.published_at ?? sqlNow()
    db.prepare(
      `update articles set status = 'published', published_at = ?,
        updated_at = ? where id = ?`,
    ).run(publishedAt, sqlNow(), id)

    const updated = db.prepare('select * from articles where id = ?').get(id) as ArticleRow
    res.json({ article: serializeOne(updated) })
  },
)

articlesRouter.post(
  '/dashboard/article/:id/unpublish',
  requireAuth,
  requireActiveJournoOrStaff,
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const row = Number.isFinite(id)
      ? (db.prepare('select * from articles where id = ?').get(id) as ArticleRow | undefined)
      : undefined
    if (!row) {
      throw new ApiError(404, 'not_found', 'Article not found')
    }
    const user = getCurrentUser(res)
    requireArticleAccess(user, row)

    db.prepare(
      `update articles set status = 'draft', updated_at = ? where id = ?`,
    ).run(sqlNow(), id)

    const updated = db.prepare('select * from articles where id = ?').get(id) as ArticleRow
    res.json({ article: serializeOne(updated) })
  },
)

articlesRouter.post(
  '/dashboard/article/:id/archive',
  requireAuth,
  requireActiveJournoOrStaff,
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const row = Number.isFinite(id)
      ? (db.prepare('select * from articles where id = ?').get(id) as ArticleRow | undefined)
      : undefined
    if (!row) {
      throw new ApiError(404, 'not_found', 'Article not found')
    }
    const user = getCurrentUser(res)
    requireArticleAccess(user, row)

    db.prepare(
      `update articles set status = 'archived', updated_at = ? where id = ?`,
    ).run(sqlNow(), id)

    const updated = db.prepare('select * from articles where id = ?').get(id) as ArticleRow
    res.json({ article: serializeOne(updated) })
  },
)

// Featured toggle — editorial (admin/manager) privilege only
articlesRouter.post(
  '/dashboard/article/:id/featured',
  requireAuth,
  requireStaff,
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const row = Number.isFinite(id)
      ? (db.prepare('select * from articles where id = ?').get(id) as ArticleRow | undefined)
      : undefined
    if (!row) {
      throw new ApiError(404, 'not_found', 'Article not found')
    }

    const featured = asBoolean(
      (req.body as Record<string, unknown>)?.featured,
      'featured',
    )
    db.prepare(
      'update articles set featured = ?, updated_at = ? where id = ?',
    ).run(featured ? 1 : 0, sqlNow(), id)

    const updated = db.prepare('select * from articles where id = ?').get(id) as ArticleRow
    res.json({ article: serializeOne(updated) })
  },
)

// Breaking news toggle — editorial (admin/manager) privilege only
articlesRouter.post(
  '/dashboard/article/:id/breaking',
  requireAuth,
  requireStaff,
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const row = Number.isFinite(id)
      ? (db.prepare('select * from articles where id = ?').get(id) as ArticleRow | undefined)
      : undefined
    if (!row) {
      throw new ApiError(404, 'not_found', 'Article not found')
    }

    const breaking = asBoolean(
      (req.body as Record<string, unknown>)?.breaking,
      'breaking',
    )
    db.prepare(
      'update articles set breaking_news = ?, updated_at = ? where id = ?',
    ).run(breaking ? 1 : 0, sqlNow(), id)

    const updated = db.prepare('select * from articles where id = ?').get(id) as ArticleRow
    res.json({ article: serializeOne(updated) })
  },
)