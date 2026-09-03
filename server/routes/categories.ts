import { Router } from 'express'

import { requireAuth, requireRole } from '../auth/guards.js'
import { db, sqlNow } from '../db/index.js'
import type { CategoryRow } from '../types.js'
import { ApiError } from '../util/http.js'
import { asOptionalString, asString, parseRouteId } from '../util/validators.js'

export const categoriesRouter = Router()

const RESERVED_SLUGS = new Set(['dashboard', 'admin', 'categories'])

function toCategory(row: CategoryRow & { published_count?: number }) {
  return {
    id: row.id,
    slug: row.slug,
    name_key: row.name_key,
    description_key: row.description_key,
    created_at: row.created_at,
    updated_at: row.updated_at,
    publishedCount: row.published_count ?? 0,
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function uniqueSlug(base: string): string {
  let candidate = base || 'category'
  let n = 2
  for (;;) {
    const row = db
      .prepare('select id from categories where slug = ?')
      .get(candidate) as { id: number } | undefined
    if (!row) return candidate
    candidate = `${base || 'category'}-${n}`
    n += 1
  }
}

function uniqueNameKey(base: string): string {
  let candidate = base || 'category'
  let n = 2
  for (;;) {
    const row = db
      .prepare('select id from categories where name_key = ?')
      .get(candidate) as { id: number } | undefined
    if (!row) return candidate
    candidate = `${base || 'category'}-${n}`
    n += 1
  }
}

function findById(id: number): CategoryRow | undefined {
  return db.prepare('select * from categories where id = ?').get(id) as
    | CategoryRow
    | undefined
}

categoriesRouter.get('/', (_req, res) => {
  const rows = db
    .prepare(
      `select c.*, 
        (select count(*) from articles a 
         where a.category_id = c.id and a.status = 'published') as published_count
       from categories c
       order by c.name_key asc`,
    )
    .all() as (CategoryRow & { published_count: number })[]

  res.json({ categories: rows.map(toCategory) })
})

categoriesRouter.get('/:slug', (req, res) => {
  const row = db
    .prepare(
      `select c.*, 
        (select count(*) from articles a 
         where a.category_id = c.id and a.status = 'published') as published_count
       from categories c
       where c.slug = ?`,
    )
    .get(req.params.slug) as (CategoryRow & { published_count: number }) | undefined

  if (!row) {
    throw new ApiError(404, 'not_found', 'Category not found')
  }
  res.json({ category: toCategory(row) })
})

categoriesRouter.post(
  '/',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>
    const name = asString(body.name, 'name', 80)
    const slugInput = asOptionalString(body.slug, 'slug', 80)
    const description = asOptionalString(body.description, 'description', 240)

    const slug = slugInput ? slugify(slugInput) : slugify(name)
    if (!slug || RESERVED_SLUGS.has(slug)) {
      throw new ApiError(400, 'invalid_request', 'Invalid category slug')
    }

    const nameKey = uniqueNameKey(slugify(name) || 'category')
    const info = db
      .prepare(
        `insert into categories (slug, name_key, description_key, updated_at)
         values (?, ?, ?, ?)`,
      )
      .run(uniqueSlug(slug), nameKey, description, sqlNow())

    const row = findById(info.lastInsertRowid as number)
    res.status(201).json({ category: toCategory(row as CategoryRow) })
  },
)

categoriesRouter.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const existing = Number.isFinite(id) ? findById(id) : undefined
    if (!existing) {
      throw new ApiError(404, 'not_found', 'Category not found')
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const updates: string[] = ['updated_at = ?']
    const params: Array<string | number | null> = [sqlNow()]

    if (body.name !== undefined) {
      const name = asString(body.name, 'name', 80)
      updates.push('name_key = ?')
      params.push(name)
    }
    if (body.description !== undefined) {
      const description = asOptionalString(body.description, 'description', 240)
      updates.push('description_key = ?')
      params.push(description)
    }
    if (body.slug !== undefined) {
      const slug = slugify(asString(body.slug, 'slug', 80))
      if (!slug || RESERVED_SLUGS.has(slug)) {
        throw new ApiError(400, 'invalid_request', 'Invalid category slug')
      }
      const clash = db
        .prepare('select id from categories where slug = ? and id <> ?')
        .get(slug, id) as { id: number } | undefined
      if (clash) {
        throw new ApiError(400, 'invalid_request', 'Slug is already in use')
      }
      updates.push('slug = ?')
      params.push(slug)
    }

    db.prepare(`update categories set ${updates.join(', ')} where id = ?`).run(
      ...params,
      id,
    )
    const row = findById(id)
    res.json({ category: toCategory(row as CategoryRow) })
  },
)

categoriesRouter.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const existing = Number.isFinite(id) ? findById(id) : undefined
    if (!existing) {
      throw new ApiError(404, 'not_found', 'Category not found')
    }

    const articles = db
      .prepare('select count(*) as total from articles where category_id = ?')
      .get(id) as { total: number }
    if (articles.total > 0) {
      throw new ApiError(
        400,
        'category_in_use',
        'Cannot delete a category that still has articles. Move the articles first.',
      )
    }

    db.prepare('delete from categories where id = ?').run(id)
    res.status(204).send()
  },
)