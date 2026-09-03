import { Router } from 'express'

import { hashPassword } from '../auth/passwords.js'
import {
  getCurrentUser,
  requireActiveStaff,
  requireAuth,
  requireRole,
} from '../auth/guards.js'
import { db, sqlNow } from '../db/index.js'
import type { ProfileRow } from '../types.js'
import { ApiError } from '../util/http.js'
import { toPublicProfile } from '../util/serialize.js'
import {
  asBoolean,
  asOptionalString,
  asString,
  parseRouteId,
  EMAIL_RE,
} from '../util/validators.js'

export const journalistsRouter = Router()

export function withArticleCount<const T extends ProfileRow>(
  rows: T[],
  scope: 'all' | 'published' = 'published',
): Array<T & { article_count: number }> {
  const condition = scope === 'published' ? "and status = 'published'" : ''
  return rows.map((row) => {
    const total = db
      .prepare(
        `select count(*) as total from articles
         where author_id = ? ${condition}`,
      )
      .get(row.id) as { total: number }
    return { ...row, article_count: total.total }
  })
}

export function serializeStaffList(rows: Array<ProfileRow & { article_count: number }>) {
  return rows.map((row) => ({
    ...toPublicProfile(row),
    articleCount: row.article_count,
  }))
}

function readProfile(id: number): ProfileRow | undefined {
  return db.prepare('select * from profiles where id = ?').get(id) as
    | ProfileRow
    | undefined
}

function assertJournalist(row: ProfileRow): void {
  if (row.role !== 'journalist') {
    throw new ApiError(404, 'not_found', 'Journalist not found')
  }
}

journalistsRouter.get('/', (req, res) => {
  const query = req.query as Record<string, string | undefined>

  const byId = query.id
    ? (db.prepare('select * from profiles where id = ?').get(Number(query.id)) as
        | ProfileRow
        | undefined)
    : undefined
  if (byId) {
    if (byId.role !== 'journalist' || byId.status === 'inactive') {
      throw new ApiError(404, 'not_found', 'Journalist not found')
    }
    const count = db.prepare(
      "select count(*) as total from articles where author_id = ? and status = 'published'",
    ).get(byId.id) as { total: number }
    res.json({ journalist: toPublicProfile(byId), articleCount: count.total })
    return
  }

  const verifiedOnly = query.verifiedOnly === 'true'
  const conditions = ["role = 'journalist'", "status = 'active'"]
  const params: Array<string | number> = []
  if (verifiedOnly) {
    conditions.push('verified = 1')
  }

  const rows = db
    .prepare(
      `select p.*,
        (select count(*) from articles a where a.author_id = p.id and a.status = 'published') as article_count
       from profiles p
       where ${conditions.join(' and ')}
       order by p.full_name collate nocase`,
    )
    .all(...params) as (ProfileRow & { article_count: number })[]

  res.json({ journalists: serializeStaffList(rows) })
})

// Create journalist — staff (admin or manager)
journalistsRouter.post(
  '/dashboard/journalists',
  requireAuth,
  requireActiveStaff,
  (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>
    const email = asString(body.email, 'email', 160).toLowerCase()
    if (!EMAIL_RE.test(email)) {
      throw new ApiError(400, 'invalid_request', 'Enter a valid email address')
    }

    const fullName = asString(body.full_name, 'full_name', 120)
    const password = asString(body.password, 'password', 200)
    if (password.length < 8) {
      throw new ApiError(400, 'weak_password', 'Password must be at least 8 characters')
    }

    const exists = db
      .prepare('select id from profiles where lower(email) = lower(?)')
      .get(email) as { id: number } | undefined
    if (exists) {
      throw new ApiError(409, 'email_in_use', 'A profile with this email already exists')
    }

    const info = db
      .prepare(
        `insert into profiles
           (email, full_name, role, password_hash, bio, avatar_path,
            status, verified, blue_badge, preferred_language)
         values (?, ?, 'journalist', ?, ?, ?, 'pending', 0, 0, 'en')`,
      )
      .run(
        email,
        fullName,
        hashPassword(password),
        asOptionalString(body.bio, 'bio', 600),
        asOptionalString(body.avatar_path, 'avatar_path', 500),
      )

    const row = readProfile(info.lastInsertRowid as number)
    const count = db
      .prepare('select count(*) as total from articles where author_id = ?').get(row!.id) as {
      total: number
    }
    res.status(201).json({
      journalist: { ...toPublicProfile(row as ProfileRow), articleCount: count.total },
    })
  },
)

// Update journalist — staff (managers manage profiles/verification; blue badge is admin-only)
journalistsRouter.patch(
  '/dashboard/journalists/:id',
  requireAuth,
  requireActiveStaff,
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const row = Number.isFinite(id) ? readProfile(id) : undefined
    if (!row) {
      throw new ApiError(404, 'not_found', 'Journalist not found')
    }
    assertJournalist(row)

    const user = getCurrentUser(res)
    const body = (req.body ?? {}) as Record<string, unknown>
    const updates: string[] = ['updated_at = ?']
    const params: Array<string | number | null> = [sqlNow()]

    if (body.email !== undefined) {
      const email = asString(body.email, 'email', 160).toLowerCase()
      if (!EMAIL_RE.test(email)) {
        throw new ApiError(400, 'invalid_request', 'Enter a valid email address')
      }
      const clash = db
        .prepare('select id from profiles where lower(email) = lower(?) and id <> ?')
        .get(email, id) as { id: number } | undefined
      if (clash) {
        throw new ApiError(409, 'email_in_use', 'A profile with this email already exists')
      }
      updates.push('email = ?')
      params.push(email)
    }
    if (body.full_name !== undefined) {
      updates.push('full_name = ?')
      params.push(asString(body.full_name, 'full_name', 120))
    }
    if (body.bio !== undefined) {
      updates.push('bio = ?')
      params.push(asOptionalString(body.bio, 'bio', 600))
    }
    if (body.avatar_path !== undefined) {
      updates.push('avatar_path = ?')
      params.push(asOptionalString(body.avatar_path, 'avatar_path', 500))
    }
    if (body.status !== undefined) {
      const status = asString(body.status, 'status')
      if (!['active', 'inactive', 'pending'].includes(status)) {
        throw new ApiError(400, 'invalid_request', 'Invalid account status')
      }
      updates.push('status = ?')
      params.push(status)
    }
    if (body.verified !== undefined) {
      updates.push('verified = ?')
      params.push(asBoolean(body.verified, 'verified') ? 1 : 0)
    }
    if (body.blue_badge !== undefined) {
      if (user.role !== 'admin') {
        throw new ApiError(
          403,
          'forbidden',
          'Only administrators can grant or remove the blue badge',
        )
      }
      updates.push('blue_badge = ?')
      params.push(asBoolean(body.blue_badge, 'blue_badge') ? 1 : 0)
    }
    if (body.preferred_language !== undefined) {
      const lang = asString(body.preferred_language, 'preferred_language')
      if (!['rw', 'en', 'fr'].includes(lang)) {
        throw new ApiError(400, 'invalid_request', 'Invalid language')
      }
      updates.push('preferred_language = ?')
      params.push(lang)
    }
    if (body.password !== undefined) {
      const password = asString(body.password, 'password', 200)
      if (password.length < 8) {
        throw new ApiError(400, 'weak_password', 'Password must be at least 8 characters')
      }
      updates.push('password_hash = ?')
      params.push(hashPassword(password))
    }

    db.prepare(`update profiles set ${updates.join(', ')} where id = ?`).run(
      ...params,
      id,
    )

    const updated = readProfile(id) as ProfileRow
    const count = db
      .prepare(
        'select count(*) as total from articles where author_id = ?',
      ).get(updated.id) as { total: number }
    res.json({
      journalist: { ...toPublicProfile(updated), articleCount: count.total },
    })
  },
)

// Delete journalist — staff may deactivate when the journalist has articles;
// hard delete (cascades their articles) is admin-only and only when there are no articles.
journalistsRouter.delete(
  '/dashboard/journalists/:id',
  requireAuth,
  requireRole('admin', 'manager'),
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const row = Number.isFinite(id) ? readProfile(id) : undefined
    if (!row) {
      throw new ApiError(404, 'not_found', 'Journalist not found')
    }
    assertJournalist(row)

    const user = getCurrentUser(res)
    const publishedCount = db
      .prepare(
        "select count(*) as total from articles where author_id = ? and status = 'published'",
      )
      .get(id) as { total: number }

    if (publishedCount.total > 0) {
      // Deactivate instead of destroying published journalism.
      db.prepare(
        `update profiles set status = 'inactive', updated_at = ? where id = ?`,
      ).run(sqlNow(), id)
      db.prepare('delete from sessions where user_id = ?').run(id)
      res.status(204).send()
      return
    }

    if (user.role !== 'admin') {
      throw new ApiError(
        403,
        'forbidden',
        'Only administrators can permanently delete a journalist account',
      )
    }

    db.prepare('delete from profiles where id = ?').run(id)
    res.status(204).send()
  },
)

journalistsRouter.get(
  '/dashboard/journalists',
  requireAuth,
  requireActiveStaff,
  (_req, res) => {
    const rows = db
      .prepare(
        `select * from profiles
         where role = 'journalist'
         order by created_at desc`,
      )
      .all() as ProfileRow[]
    res.json({ journalists: serializeStaffList(withArticleCount(rows, 'all')) })
  },
)

journalistsRouter.get(
  '/dashboard/managers',
  requireAuth,
  requireRole('admin'),
  (_req, res) => {
    const rows = db
      .prepare("select * from profiles where role = 'manager' order by created_at desc")
      .all() as ProfileRow[]
    res.json({ managers: rows.map(toPublicProfile) })
  },
)