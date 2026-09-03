import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import { db } from './index.js'

const migrationsDir = fileURLToPath(new URL('./migrations', import.meta.url))

export function runMigrations(): void {
  db.exec(`
    create table if not exists _migrations (
      name text primary key,
      applied_at text not null default (current_timestamp)
    )
  `)

  const applied = new Set(
    db
      .prepare('select name from _migrations')
      .all()
      .map((row) => (row as { name: string }).name),
  )

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  const applyAll = db.transaction(() => {
    for (const file of files) {
      if (applied.has(file)) continue
      const sql = fs.readFileSync(`${migrationsDir}/${file}`, 'utf8')
      db.exec(sql)
      db.prepare('insert into _migrations (name) values (?)').run(file)
      console.log(`[db] applied migration: ${file}`)
    }
  })

  applyAll()
}