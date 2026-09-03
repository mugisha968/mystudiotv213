import fs from 'node:fs'
import path from 'node:path'

import express from 'express'

import { config } from './config.js'
import { runMigrations } from './db/migrate.js'
import { authRouter } from './routes/auth.js'
import { articlesRouter } from './routes/articles.js'
import { categoriesRouter } from './routes/categories.js'
import { journalistsRouter } from './routes/journalists.js'
import { managersRouter } from './routes/managers.js'
import { statsRouter } from './routes/stats.js'
import { uploadsRouter } from './routes/uploads.js'
import { advertisementsRouter } from './routes/advertisements.js'
import { errorHandler, notFoundHandler } from './util/http.js'

runMigrations()

fs.mkdirSync(config.uploadsDir, { recursive: true })

const app = express()

app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRouter)
app.use('/api/articles', articlesRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/journalists', journalistsRouter)
app.use('/api/managers', managersRouter)
app.use('/api/dashboard/stats', statsRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/advertisements', advertisementsRouter)

app.use('/uploads', express.static(config.uploadsDir))

if (config.isProduction) {
  const distDir = path.join(process.cwd(), 'dist')
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/uploads')
    ) {
      res.sendFile(path.join(distDir, 'index.html'))
      return
    }
    next()
  })
}

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`[server] MyStudioTV231 API running on http://localhost:${config.port}`)
})