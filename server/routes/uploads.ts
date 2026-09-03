import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'

import { Router, type NextFunction, type Request, type Response } from 'express'
import multer from 'multer'

import { getCurrentUser, requireAuth, requireActiveJournoOrStaff } from '../auth/guards.js'
import { config } from '../config.js'
import { ApiError } from '../util/http.js'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
])

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED_IMAGE_TYPES.has(file.mimetype))
  },
})

export const uploadsRouter = Router()

interface UploadEntry {
  url: string
  user_id: number | null
  size_bytes: number
  modified_at: string
  kind: 'avatar' | 'article-image'
}

function listFilesUnder(dir: string): string[] {
  const out: string[] = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...listFilesUnder(full))
    } else {
      out.push(full)
    }
  }
  return out
}

uploadsRouter.get('/', requireAuth, requireActiveJournoOrStaff, (_req, res) => {
  const user = getCurrentUser(res)
  const isStaff = user.role === 'admin' || user.role === 'manager'
  const entries: UploadEntry[] = []

  for (const kind of ['avatars', 'article-images'] as const) {
    const base = path.join(config.uploadsDir, kind)
    const urls = listFilesUnder(base)
    for (const file of urls) {
      const relative = path.relative(config.uploadsDir, file)
      const parts = relative.split(path.sep)
      const userId = parts.length >= 3 ? Number.parseInt(parts[1], 10) : null
      if (!isStaff && userId !== user.id) continue
      const stat = fs.statSync(file)
      entries.push({
        url: `/uploads/${parts.join('/')}`,
        user_id: Number.isFinite(userId) ? userId : null,
        size_bytes: stat.size,
        modified_at: stat.mtime.toISOString(),
        kind: kind === 'avatars' ? 'avatar' : 'article-image',
      })
    }
  }

  entries.sort((a, b) => b.modified_at.localeCompare(a.modified_at))
  res.json({ media: entries })
})

uploadsRouter.post(
  '/',
  requireAuth,
  upload.single('file'),
  (req, res) => {
    const user = getCurrentUser(res)
    const dest = req.body.dest === 'avatar' ? 'avatars' : 'article-images'

    if (!req.file || !EXTENSIONS[req.file.mimetype]) {
      throw new ApiError(
        400,
        'invalid_file',
        'A valid image is required (png, jpg, gif, webp or avif, up to 5MB)',
      )
    }

    const extension = EXTENSIONS[req.file.mimetype]
    const filename = `${user.id}_${Date.now()}_${randomBytes(6).toString('hex')}.${extension}`
    const dir = path.join(config.uploadsDir, dest, String(user.id))

    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, filename), req.file.buffer)

    res.status(201).json({ url: `/uploads/${dest}/${user.id}/${filename}` })
  },
)

uploadsRouter.use(
  (err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({
        error: {
          code: 'invalid_file',
          message: 'A valid image is required (png, jpg, gif, webp or avif, up to 5MB)',
        },
      })
      return
    }
    next(err)
  },
)