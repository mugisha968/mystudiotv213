import { Router } from 'express'

import { hashPassword } from '../auth/passwords.js'
import { requireAuth, requireRole } from '../auth/guards.js'
import { db, sqlNow } from '../db/index.js'
import type { ProfileRow } from '../types.js'
import { ApiError } from '../util/http.js'
import { toPublicProfile } from '../util/serialize.js'
import { asOptionalString, asString, parseRouteId, EMAIL_RE } from '../util/validators.js'

export const managersRouter = Router()

function readManager(id: number): ProfileRow | undefined {
  const row = db.prepare('select * from profiles where id = ?').get(id) as
    | ProfileRow
    | undefined
  if (row && row.role !== 'manager') return undefined
  return row
}

managersRouter.get('/', requireAuth, requireRole('admin'), (_req, res) => {
  const rows = db
    .prepare(
      `select p.*,
        (select count(*) from articles a where a.status in ('draft','archived')) as workload
       from profiles p
       where p.role = 'manager'
       order by p.created_at desc`,
    )
    .all() as (ProfileRow & { workload: number })[]
  res.json({ managers: rows.map((row) => toPublicProfile(row)) })
})

managersRouter.post('/', requireAuth, requireRole('admin'), (req, res) => {
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
       values (?, ?, 'manager', ?, ?, ?, 'active', 1, 0, 'en')`,
    )
    .run(
      email,
      fullName,
      hashPassword(password),
      asOptionalString(body.bio, 'bio', 600),
      asOptionalString(body.avatar_path, 'avatar_path', 500),
    )

  const row = readManager(info.lastInsertRowid as number)
  res.status(201).json({ manager: toPublicProfile(row as ProfileRow) })
})

managersRouter.patch('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const id = parseRouteId(req.params.id)
  const row = Number.isFinite(id) ? readManager(id) : undefined
  if (!row) {
    throw new ApiError(404, 'not_found', 'Manager not found')
  }

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
    if (status === 'inactive') {
      db.prepare('delete from sessions where user_id = ?').run(id)
    }
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

  const updated = readManager(id) as ProfileRow
  res.json({ manager: toPublicProfile(updated) })
})

managersRouter.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const id = parseRouteId(req.params.id)
  const row = Number.isFinite(id) ? readManager(id) : undefined
  if (!row) {
    throw new ApiError(404, 'not_found', 'Manager not found')
  }

  const adminCount = db
    .prepare("select count(*) as total from profiles where role = 'admin'")
    .get() as { total: number }
  if (row.role === 'admin' && adminCount.total <= 1) {
    throw new ApiError(
      400,
      'last_admin',
      'You cannot deactivate this account while it is the only administrator',
    )
  }

  db.prepare('delete from sessions where user_id = ?').run(id)
  db.prepare(
    `update profiles set status = 'inactive', updated_at = ? where id = ?`,
  ).run(sqlNow(), id)

  res.status(204).send()
})