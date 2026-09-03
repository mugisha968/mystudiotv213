import { db } from '../db/index.js'
import { runMigrations } from '../db/migrate.js'
import { hashPassword } from '../auth/passwords.js'

interface CliArgs {
  email: string
  password: string
  name: string
  force: boolean
}

function parseArgs(argv: string[]): CliArgs {
  const args: Record<string, string | boolean> = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const value = argv[i + 1]
      if (key === 'force') {
        args[key] = true
      } else if (value !== undefined && !value.startsWith('--')) {
        args[key] = value
        i += 1
      } else {
        args[key] = true
      }
    }
  }

  return {
    email: String(args.email ?? ''),
    password: String(args.password ?? ''),
    name: String(args.name ?? ''),
    force: Boolean(args.force),
  }
}

function validate(email: string, password: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('error: a valid --email is required')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('error: --password must be at least 8 characters')
    process.exit(1)
  }
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  validate(args.email, args.password)

  runMigrations()

  const normalizedEmail = args.email.trim().toLowerCase()
  const existingAdmin = db
    .prepare("select id from profiles where role = 'admin'")
    .get() as { id: number } | undefined

  if (existingAdmin && !args.force) {
    console.error(
      'error: a primary admin already exists. Pass --force to adopt a new primary admin (this replaces the current one).',
    )
    process.exit(1)
  }

  const name = args.name.trim() || normalizedEmail.split('@')[0]
  const passwordHash = hashPassword(args.password)
  const existing = db
    .prepare('select id from profiles where lower(email) = lower(?)')
    .get(normalizedEmail) as { id: number } | undefined

  if (existing) {
    db.prepare(
      `update profiles
       set role = 'admin', status = 'active', password_hash = ?,
           full_name = ?, updated_at = ?
       where id = ?`,
    ).run(passwordHash, name, new Date().toISOString(), existing.id)
    console.log(`admin updated: ${normalizedEmail}`)
  } else {
    db.prepare(
      `insert into profiles (email, full_name, role, password_hash, status, verified, blue_badge)
       values (?, ?, 'admin', ?, 'active', 1, 1)`,
    ).run(normalizedEmail, name, passwordHash)
    console.log(`admin created: ${normalizedEmail}`)
  }
}

main()