import 'dotenv/config'

import path from 'node:path'

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: IS_PRODUCTION,
  port: Number(process.env.PORT ?? 4000),
  databasePath:
    process.env.DATABASE_PATH ??
    path.join(process.cwd(), 'data', 'mystudio.db'),
  uploadsDir: process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'uploads'),
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS ?? 30),
  resetTokenTtlHours: Number(process.env.RESET_TOKEN_TTL_HOURS ?? 1),
  publicUrl: process.env.PUBLIC_URL ?? 'http://localhost:5173',
  cookieName: 'mystudio_session',
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