import type { IncomingMessage, ServerResponse } from 'node:http'
import { createHash, randomBytes } from 'node:crypto'

import { config } from '../config.js'
import { db } from '../db/index.js'
import type { ProfileRow } from '../types.js'

export interface SessionLookup {
  profile: ProfileRow
  sessionId: number
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function readToken(req: IncomingMessage): string | null {
  const header = req.headers.cookie
  if (!header) return null
  const prefix = `${config.cookieName}=`
  for (const part of header.split(';')) {
    const entry = part.trim()
    if (entry.startsWith(prefix)) {
      return decodeURIComponent(entry.slice(prefix.length)) || null
    }
  }
  return null
}

export function createSession(userId: number): string {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(
    Date.now() + config.sessionTtlDays * 24 * 60 * 60 * 1000,
  ).toISOString()

  db.prepare(
    'insert into sessions (user_id, token_hash, expires_at) values (?, ?, ?)',
  ).run(userId, hashToken(token), expiresAt)

  return token
}

export function getSessionUser(req: IncomingMessage): SessionLookup | null {
  const token = readToken(req)
  if (!token) return null

  const row = db
    .prepare(
      `select s.id as session_id, s.expires_at, p.*
       from sessions s
       join profiles p on p.id = s.user_id
       where s.token_hash = ?`,
    )
    .get(hashToken(token)) as (ProfileRow & {
      session_id: number
      expires_at: string
    }) | undefined

  if (!row) return null

  if (row.expires_at < new Date().toISOString()) {
    db.prepare('delete from sessions where id = ?').run(row.session_id)
    return null
  }

  db.prepare('update sessions set last_seen_at = ? where id = ?').run(
    new Date().toISOString(),
    row.session_id,
  )

  return {
    profile: {
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      role: row.role,
      password_hash: row.password_hash,
      avatar_path: row.avatar_path,
      bio: row.bio,
      verified: row.verified,
      blue_badge: row.blue_badge,
      preferred_language: row.preferred_language,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    sessionId: row.session_id,
  }
}

export function deleteSession(req: IncomingMessage): void {
  const token = readToken(req)
  if (!token) return
  db.prepare('delete from sessions where token_hash = ?').run(hashToken(token))
}

function serializeCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (config.isProduction) parts.push('Secure')
  return parts.join('; ')
}

export function setSessionCookie(res: ServerResponse, token: string): void {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(config.cookieName, token, config.sessionTtlDays * 86400),
  )
}

export function clearSessionCookie(res: ServerResponse): void {
  res.setHeader('Set-Cookie', serializeCookie(config.cookieName, '', 0))
}