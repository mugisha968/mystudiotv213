# MyStudioTV231

Trilingual (Kinyarwanda / English / French) digital news platform: React SPA + Express/SQLite server with role-based dashboards (admin → manager → journalist).

## Quick start

```bash
npm install
npm run dev        # web on http://localhost:5173, API proxied to :4000
npm run build      # client + server, output in dist/ + dist-server/
npm run start      # production server (NODE_ENV=production)
```

On first boot the server applies the SQLite migrations automatically (see `server/db/migrations/`) and creates `data/mystudio.db`.

## Architecture

- **Frontend (`src/`)** — React 18 + TypeScript + Vite.
  - `src/pages/public/` — public-facing pages (Home, Article, News, Category, Videos, About, Journalists, Not Found).
  - `src/pages/dashboard/` — role-based admin/manager/journalist dashboards.
  - `src/components/` — shared UI/news components (ArticleCard, CoverImage, AdSlot, BreakingNewsBar, PublicLayout, etc.).
  - `src/i18n/` — trilingual dictionaries (`en`, `rw`, `fr`).
  - `src/auth/` — authentication context (JWT session cookie).
- **Backend (`server/`)** — Express + SQLite (better-sqlite3).
  - `server/routes/` — REST API: auth, articles, categories, journalists, managers, stats, uploads, advertisements.
  - `server/db/` — migrations (`migrations/*.sql`) and DB helpers.
  - `server/auth/` — session/password handling, JWT, password reset.
  - Uploaded images are served verbatim from `uploads/` at original quality (no server-side resizing).
- **Build** — `npm run build` compiles the client to `dist/` and the server to `dist-server/`, copying static assets.

## Environment variables

Copy `.env.example` to `.env` and adjust. All variables are optional (sane defaults exist):

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `PORT` | `4000` | HTTP port for the API server (dev proxy also uses this). |
| `NODE_ENV` | `development` | Set to `production` for the production server. |
| `DATABASE_PATH` | `./data/mystudio.db` | Location of the SQLite database file. |
| `UPLOADS_DIR` | `./uploads` | Directory where uploaded images are stored. |
| `PUBLIC_URL` | `http://localhost:5173` | Public base URL used when building password-reset links. |
| `SESSION_TTL_DAYS` | `30` | Session cookie lifetime. |
| `RESET_TOKEN_TTL_HOURS` | `1` | Password-reset token lifetime. |
| `SMTP_HOST` | — | When unset, reset links are printed to the server console instead of emailed. |
| `SMTP_PORT` | `587` | SMTP port. |
| `SMTP_USER` | — | SMTP username. |
| `SMTP_PASS` | — | SMTP password. |
| `SMTP_FROM` | — | From address used for emailed reset links. |
| `SMTP_SECURE` | `false` | Use TLS for SMTP. |

## Development login credentials

Seeded in the local SQLite database (`data/mystudio.db`):

| Role       | Email                  | Password       |
| ---------- | ---------------------- | -------------- |
| Admin      | `admin@mystudio.rw`    | `AdminPassw0rd` |
| Manager    | `manager@mystudio.rw`  | `Passw0rd123!` |
| Journalist | `journalist@mystudio.rw` | `Passw0rd123!` |

Sign in at `http://localhost:5173/login` and you are redirected to your role's dashboard.

The primary admin can be recreated/reset with:

```bash
npm run create-admin -- --email admin@mystudio.rw --password YourPassword --name "Your Name" --force
```

## Relation to the Vite template

This project started from the official `react-ts` Vite template and keeps its default npm scripts plus the Oxlint configuration. Refer to the [Vite documentation](https://vitejs.dev) and the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for more detail.
