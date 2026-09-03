import { cpSync, mkdirSync } from 'node:fs'

mkdirSync('dist-server/db/migrations', { recursive: true })
cpSync('server/db/migrations', 'dist-server/db/migrations', { recursive: true })
console.log('[build] copied server migrations to dist-server')