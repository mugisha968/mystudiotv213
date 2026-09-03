import { Router } from 'express'

import { requireAuth, requireStaff } from '../auth/guards.js'
import { db, sqlNow } from '../db/index.js'
import type { AdvertisementRow, Advertisement, AdSlot, AdType } from '../types.js'
import { AD_SLOTS, AD_TYPES } from '../types.js'
import { ApiError } from '../util/http.js'
import {
  asBoolean,
  asOptionalString,
  asString,
  parseRouteId,
} from '../util/validators.js'

export const advertisementsRouter = Router()

const SLOT_SET = new Set<string>(AD_SLOTS)
const TYPE_SET = new Set<string>(AD_TYPES)

function serializeAd(row: AdvertisementRow): Advertisement {
  return {
    id: row.id,
    title: row.title,
    image_url: row.image_url,
    link_url: row.link_url,
    slot: row.slot,
    ad_type: row.ad_type,
    html_content: row.html_content,
    is_active: row.is_active === 1,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function findById(id: number): AdvertisementRow | undefined {
  return db
    .prepare('select * from advertisements where id = ?')
    .get(id) as AdvertisementRow | undefined
}

// Public: get active ads for a slot
advertisementsRouter.get('/slot/:slot', (req, res) => {
  const slot = req.params.slot
  if (!SLOT_SET.has(slot)) {
    throw new ApiError(400, 'invalid_request', 'Invalid ad slot')
  }
  const rows = db
    .prepare(
      'select * from advertisements where slot = ? and is_active = 1 order by sort_order asc, id asc',
    )
    .all(slot) as AdvertisementRow[]
  res.json({ ads: rows.map(serializeAd) })
})

// Public: get all active ads (grouped by slot)
advertisementsRouter.get('/active', (_req, res) => {
  const rows = db
    .prepare('select * from advertisements where is_active = 1 order by sort_order asc, id asc')
    .all() as AdvertisementRow[]
  const grouped: Record<string, Advertisement[]> = {}
  for (const row of rows) {
    if (!grouped[row.slot]) grouped[row.slot] = []
    grouped[row.slot].push(serializeAd(row))
  }
  res.json({ ads: grouped })
})

// Staff: list all ads (including inactive)
advertisementsRouter.get(
  '/',
  requireAuth,
  requireStaff,
  (_req, res) => {
    const rows = db
      .prepare('select * from advertisements order by slot asc, sort_order asc, id asc')
      .all() as AdvertisementRow[]
    res.json({ ads: rows.map(serializeAd) })
  },
)

// Staff: create ad
advertisementsRouter.post(
  '/',
  requireAuth,
  requireStaff,
  (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>
    const title = asString(body.title, 'title', 120)
    const image_url = asOptionalString(body.image_url, 'image_url', 500) ?? ''
    const link_url = asOptionalString(body.link_url, 'link_url', 500)
    const slot = asString(body.slot, 'slot', 30) as AdSlot
    const is_active = asBoolean(body.is_active, 'is_active', true)
    const sort_order =
      typeof body.sort_order === 'number' ? body.sort_order : 0

    const adTypeRaw = asString(body.ad_type, 'ad_type', 10) as AdType
    const ad_type = TYPE_SET.has(adTypeRaw) ? adTypeRaw : 'image'
    const html_content = asOptionalString(body.html_content, 'html_content', 100_000)

    if (!SLOT_SET.has(slot)) {
      throw new ApiError(400, 'invalid_request', 'Invalid ad slot')
    }

    if (ad_type === 'html' && !html_content) {
      throw new ApiError(400, 'invalid_request', 'HTML ads require html_content')
    }

    if (ad_type === 'image' && !image_url) {
      throw new ApiError(400, 'invalid_request', 'Image ads require image_url')
    }

    const info = db
      .prepare(
        `insert into advertisements (title, image_url, link_url, slot, ad_type, html_content, is_active, sort_order, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(title, image_url, link_url, slot, ad_type, html_content, is_active ? 1 : 0, sort_order, sqlNow())

    const row = findById(info.lastInsertRowid as number)
    res.status(201).json({ ad: serializeAd(row as AdvertisementRow) })
  },
)

// Staff: update ad
advertisementsRouter.put(
  '/:id',
  requireAuth,
  requireStaff,
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const existing = Number.isFinite(id) ? findById(id) : undefined
    if (!existing) {
      throw new ApiError(404, 'not_found', 'Advertisement not found')
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const updates: string[] = ['updated_at = ?']
    const params: Array<string | number | null> = [sqlNow()]

    if (body.title !== undefined) {
      updates.push('title = ?')
      params.push(asString(body.title, 'title', 120))
    }
    if (body.image_url !== undefined) {
      updates.push('image_url = ?')
      params.push(asOptionalString(body.image_url, 'image_url', 500) ?? '')
    }
    if (body.link_url !== undefined) {
      updates.push('link_url = ?')
      params.push(asOptionalString(body.link_url, 'link_url', 500))
    }
    if (body.slot !== undefined) {
      const slot = asString(body.slot, 'slot', 30) as AdSlot
      if (!SLOT_SET.has(slot)) {
        throw new ApiError(400, 'invalid_request', 'Invalid ad slot')
      }
      updates.push('slot = ?')
      params.push(slot)
    }
    if (body.ad_type !== undefined) {
      const adTypeRaw = asString(body.ad_type, 'ad_type', 10) as AdType
      const ad_type = TYPE_SET.has(adTypeRaw) ? adTypeRaw : 'image'
      updates.push('ad_type = ?')
      params.push(ad_type)
    }
    if (body.html_content !== undefined) {
      updates.push('html_content = ?')
      params.push(asOptionalString(body.html_content, 'html_content', 100_000))
    }
    if (body.is_active !== undefined) {
      updates.push('is_active = ?')
      params.push(asBoolean(body.is_active, 'is_active') ? 1 : 0)
    }
    if (body.sort_order !== undefined) {
      updates.push('sort_order = ?')
      params.push(typeof body.sort_order === 'number' ? body.sort_order : 0)
    }

    db.prepare(`update advertisements set ${updates.join(', ')} where id = ?`).run(
      ...params,
      id,
    )
    const row = findById(id)
    res.json({ ad: serializeAd(row as AdvertisementRow) })
  },
)

// Staff: delete ad
advertisementsRouter.delete(
  '/:id',
  requireAuth,
  requireStaff,
  (req, res) => {
    const id = parseRouteId(req.params.id)
    const existing = Number.isFinite(id) ? findById(id) : undefined
    if (!existing) {
      throw new ApiError(404, 'not_found', 'Advertisement not found')
    }
    db.prepare('delete from advertisements where id = ?').run(id)
    res.status(204).send()
  },
)
