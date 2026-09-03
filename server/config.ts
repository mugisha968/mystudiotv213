import 'dotenv/config'

import path from 'node:path'

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

function parseOrigins(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

/**
 * Origins allowed to call this API with credentials (cookies). Never use `*`
 * when credentials are involved. Defaults to the Vercel frontend plus local
 * development origins so both production and local dev work out of the box.
 * Override entirely with the CORS_ORIGINS environment variable.
 */
const DEFAULT_CORS_ORIGINS = [
  'https://mystudiotv.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]

function resolveSameSite(): 'none' | 'lax' | 'strict' {
  const value = (process.env.COOKIE_SAMESITE ?? '').toLowerCase()
  if (value === 'none' || value === 'lax' || value === 'strict') return value
  // Cross-site (frontend on Vercel, API on Render) requires SameSite=None so
  // the session cookie is sent with credentialed fetch requests. In dev the
  // Vite proxy keeps everything same-origin, where Lax is stronger.
  return IS_PRODUCTION ? 'none' : 'lax'
}

const sameSite = resolveSameSite()

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: IS_PRODUCTION,
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? '0.0.0.0',
  databasePath:
    process.env.DATABASE_PATH ??
    path.join(process.cwd(), 'data', 'mystudio.db'),
  uploadsDir: process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'uploads'),
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS ?? 30),
  resetTokenTtlHours: Number(process.env.RESET_TOKEN_TTL_HOURS ?? 1),
  publicUrl: process.env.PUBLIC_URL ?? 'http://localhost:5173',
  cookieName: 'mystudio_session',
  cookieSameSite: sameSite,
  cookieSecure: IS_PRODUCTION || sameSite === 'none',
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS).length
    ? parseOrigins(process.env.CORS_ORIGINS)
    : DEFAULT_CORS_ORIGINS,
  smtp: {
    enabled: Boolean(process.env.SMTP_HOST),
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? 'MyStudioTV231 <no-reply@mystudiotv231.local>',
    secure: process.env.SMTP_SECURE === 'true',
  },
} as const

export type AppConfig = typeof config
