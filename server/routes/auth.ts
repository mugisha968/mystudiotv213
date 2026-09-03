import { randomBytes } from 'node:crypto'
import { Router } from 'express'

import { hashPassword, verifyPassword } from '../auth/passwords.js'
import {
  clearSessionCookie,
  createSession,
  getSessionUser,
  hashToken,
  setSessionCookie,
} from '../auth/sessions.js'
import { getCurrentUser, getUserFromRequest, requireAuth } from '../auth/guards.js'
import { config } from '../config.js'
import { db, sqlNow } from '../db/index.js'
import type { ProfileRow } from '../types.js'
import { ApiError } from '../util/http.js'
import { sendEmail } from '../util/email.js'
import { toPublicProfile } from '../util/serialize.js'
import { asOptionalString, asString, EMAIL_RE } from '../util/validators.js'

export const authRouter = Router()

function parseCredentials(body: unknown): { email: string; password: string } {
  const email = (body as { email?: unknown })?.email
  const password = (body as { password?: unknown })?.password
  if (
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    !password.trim()
  ) {
    throw new ApiError(
      400,
      'invalid_credentials',
      'Email and password are required',
    )
  }
  return { email: email.trim(), password }
}

authRouter.post('/login', (req, res) => {
  const { email, password } = parseCredentials(req.body)

  const profile = db
    .prepare('select * from profiles where lower(email) = lower(?)')
    .get(email) as ProfileRow | undefined

  if (!profile || !verifyPassword(password, profile.password_hash)) {
    throw new ApiError(401, 'invalid_credentials', 'Incorrect email or password')
  }

  if (profile.status !== 'active') {
    throw new ApiError(
      403,
      'account_not_active',
      'This account is not active',
    )
  }

  const token = createSession(profile.id)
  setSessionCookie(res, token)
  res.json({ user: toPublicProfile(profile) })
})

authRouter.post('/logout', (req, res) => {
  const session = getSessionUser(req)
  if (session) {
    db.prepare('delete from sessions where id = ?').run(session.sessionId)
  }
  clearSessionCookie(res)
  res.status(204).send()
})

authRouter.get('/me', (req, res) => {
  const user = getUserFromRequest(req)
  if (!user) {
    throw new ApiError(401, 'unauthorized', 'Not signed in')
  }
  res.json({ user })
})

// Update the signed-in profile (name, bio, avatar, preferred language).
authRouter.patch('/me', requireAuth, (req, res) => {
  const current = getCurrentUser(res)
  const body = (req.body ?? {}) as Record<string, unknown>
  const updates: string[] = ['updated_at = ?']
  const params: Array<string | null | number> = [sqlNow()]

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
  if (body.email !== undefined) {
    const email = asString(body.email, 'email', 160).toLowerCase()
    if (!EMAIL_RE.test(email)) {
      throw new ApiError(400, 'invalid_request', 'Enter a valid email address')
    }
    const clash = db
      .prepare('select id from profiles where lower(email) = lower(?) and id <> ?')
      .get(email, current.id) as { id: number } | undefined
    if (clash) {
      throw new ApiError(409, 'email_in_use', 'A profile with this email already exists')
    }
    updates.push('email = ?')
    params.push(email)
  }
  if (body.preferred_language !== undefined) {
    const lang = asString(body.preferred_language, 'preferred_language')
    if (!['rw', 'en', 'fr'].includes(lang)) {
      throw new ApiError(400, 'invalid_request', 'Invalid language')
    }
    updates.push('preferred_language = ?')
    params.push(lang)
  }

  db.prepare(`update profiles set ${updates.join(', ')} where id = ?`).run(
    ...params,
    current.id,
  )

  const updated = db
    .prepare('select * from profiles where id = ?')
    .get(current.id) as ProfileRow
  res.json({ user: toPublicProfile(updated) })
})

// Change password while signed in (requires the current password).
authRouter.post('/change-password', requireAuth, (req, res) => {
  const current = getCurrentUser(res)
  const body = (req.body ?? {}) as Record<string, unknown>
  const currentPassword = asString(body.current_password, 'current_password')
  const newPassword = asString(body.new_password, 'new_password', 200)
  if (newPassword.length < 8) {
    throw new ApiError(400, 'weak_password', 'Password must be at least 8 characters')
  }
  if (newPassword === currentPassword) {
    throw new ApiError(
      400,
      'same_password',
      'The new password must be different from the current one',
    )
  }

  const row = db
    .prepare('select password_hash from profiles where id = ?')
    .get(current.id) as { password_hash: string } | undefined
  if (!row || !verifyPassword(currentPassword, row.password_hash)) {
    throw new ApiError(400, 'wrong_password', 'Your current password is incorrect')
  }

  db.prepare(
    "update profiles set password_hash = ?, updated_at = ? where id = ?",
  ).run(hashPassword(newPassword), sqlNow(), current.id)
  db.prepare('delete from sessions where user_id = ? and id <> ?').run(
    current.id,
    getSessionUser(req)?.sessionId ?? -1,
  )

  res.json({ ok: true })
})

authRouter.post('/reset-password', async (req, res) => {
  const email = (req.body as { email?: unknown })?.email
  if (typeof email !== 'string' || !email.trim()) {
    throw new ApiError(400, 'invalid_request', 'Email is required')
  }

  const profile = db
    .prepare('select * from profiles where lower(email) = lower(?)')
    .get(email.trim()) as ProfileRow | undefined

  if (profile) {
    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(
      Date.now() + config.resetTokenTtlHours * 60 * 60 * 1000,
    ).toISOString()

    db.prepare(
      `insert into password_reset_tokens (user_id, token_hash, expires_at)
       values (?, ?, ?)`,
    ).run(profile.id, hashToken(token), expiresAt)

    const resetUrl = `${config.publicUrl}/reset-password?token=${encodeURIComponent(token)}`

    await sendEmail({
      to: profile.email,
      subject: 'MyStudioTV231 — Password reset',
      text: `You requested a password reset for MyStudioTV231.\n\nOpen the link below to choose a new password. The link expires in ${config.resetTokenTtlHours} hour(s).\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    })
  }

  res.json({ ok: true })
})

authRouter.post('/reset-password/confirm', (req, res) => {
  const token = (req.body as { token?: unknown })?.token
  const password = (req.body as { password?: unknown })?.password

  if (typeof token !== 'string' || !token) {
    throw new ApiError(400, 'invalid_request', 'Reset token is required')
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new ApiError(
      400,
      'weak_password',
      'Password must be at least 8 characters',
    )
  }

  const row = db
    .prepare(
      `select * from password_reset_tokens
       where token_hash = ? and used = 0`,
    )
    .get(hashToken(token)) as
    | { id: number; user_id: number; expires_at: string }
    | undefined

  if (!row || row.expires_at < sqlNow()) {
    throw new ApiError(400, 'invalid_token', 'Reset link is invalid or expired')
  }

  const update = db.transaction(() => {
    db.prepare('update profiles set password_hash = ?, updated_at = ? where id = ?').run(
      hashPassword(password),
      sqlNow(),
      row.user_id,
    )
    db.prepare('update password_reset_tokens set used = 1 where id = ?').run(row.id)
    db.prepare('delete from sessions where user_id = ?').run(row.user_id)
  })

  update()
  clearSessionCookie(res)
  res.json({ ok: true })
})