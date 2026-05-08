# Repository Guidelines

## Project Overview

**Kindleah Investment Tutoring Platform** — a full-stack web application connecting tutors, students, and admins. Supports session booking, real-time chat (WebSocket), video calls (PeerJS/WebRTC), document sharing, and file uploads. User roles: `student`, `tutor`, `admin`.

## Project Structure & Module Organization

```
client/src/        React SPA (Vite)
  pages/           Role-scoped dashboards: admin-dashboard/, tutor-dashboard/, student-dashboard/
  components/ui/   shadcn/ui component library (Radix UI-based)
  components/chat/ WebSocket chat UI
  components/video-call/ PeerJS video call UI
  components/file-upload.tsx  Real file upload via XHR to /api/upload
server/            Express server
  auth.ts          Passport.js local strategy, session setup, rate limiting
  routes.ts        REST API + WebSocket + PeerJS signaling + multer upload + nodemailer contact
  storage.ts       IStorage interface with MemStorage and DatabaseStorage implementations
  db.ts            Drizzle ORM + MySQL pool
shared/
  schema.ts        Drizzle table definitions + Zod insert schemas + inferred types
uploads/           Disk-stored uploaded files (served at /uploads/*)
logs/              PM2 log output (gitignored)
dist/              Production build output (gitignored)
ecosystem.config.cjs  PM2 process manager config
```

**Key architectural pattern:** `shared/schema.ts` is the single source of truth — Drizzle tables, Zod validators, and TypeScript types all derived here.

**Storage switching:** If `MYSQL_DATABASE_URL`/`DATABASE_URL` is set, `DatabaseStorage` (MySQL) is used; otherwise `MemStorage` (in-memory with seeded default tutor `sam`).

**Path aliases:** `@/*` → `client/src/*`, `@shared/*` → `shared/*`

## Build, Test, and Development Commands

```bash
npm run dev          # Dev server (tsx + Vite middleware)
npm run build        # Production build → dist/
npm start            # Run production build (NODE_ENV=production node dist/index.js)
npm run check        # TypeScript type-check (tsc --noEmit)
npm run db:push      # Push Drizzle schema to MySQL (requires MYSQL_DATABASE_URL)

# PM2 (production process manager)
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 logs kindleah-tutoring
pm2 restart kindleah-tutoring
```

No test framework is configured.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MYSQL_DATABASE_URL` | No (falls back to MemStorage) | MySQL connection string |
| `SESSION_SECRET` | **Yes in production** | Express session secret (128-char hex min) |
| `PORT` | No (default 5000) | Server port |
| `ALLOWED_ORIGINS` | No (default `http://localhost:5000`) | Comma-separated CORS allowlist |
| `ADMIN_USERNAME` | No (default `admin`) | Admin account username |
| `ADMIN_PASSWORD` | **Change before going live** | Admin account password |
| `SMTP_HOST` | No | SMTP server for contact form emails |
| `SMTP_PORT` | No (default 587) | SMTP port |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | Sender email address |
| `CONTACT_EMAIL` | No | Destination for contact form submissions |
| `SSL_CERT_PATH` | No | Path to TLS cert (enables direct HTTPS) |
| `SSL_KEY_PATH` | No | Path to TLS private key |

## Coding Style & Naming Conventions

- **TypeScript strict mode** (`"strict": true` in `tsconfig.json`)
- **ESM modules** throughout (`"type": "module"`, `"module": "ESNext"`)
- No linter or formatter config files present
- New database entities defined in `shared/schema.ts` using Drizzle helpers + `createInsertSchema` from `drizzle-zod`
- All REST endpoints guard with `if (!req.isAuthenticated()) return res.sendStatus(401)`
- Admin-only endpoints additionally use the `requireAdmin` middleware
- POST/PUT bodies validated with Zod schemas before processing

## Architecture: Real-time & Security

- **WebSocket auth:** Session cookie parsed server-side on upgrade; `userId` is never trusted from the client. Unauthenticated connections closed with code `1008`.
- **Session fixation:** `req.session.regenerate()` called before `req.login()` on login and register.
- **Rate limiting:** `/api/login` and `/api/register` limited to 20 requests / 15 min via `express-rate-limit`.
- **File uploads:** `multer` disk storage under `uploads/`, 20 MB limit, served statically at `/uploads/*`. Client uploads via XHR to `POST /api/upload` (authenticated), then registers document via `POST /api/documents`.
- **Email:** `nodemailer` wired to `POST /api/contact`. Falls back to console log if SMTP env vars are not set.
- **CORS:** Manual middleware using `ALLOWED_ORIGINS` env var allowlist.
- **HTTPS:** If `SSL_CERT_PATH` + `SSL_KEY_PATH` are set and files exist, an HTTPS server is created; otherwise runs HTTP (intended behind Nginx/proxy).
- **Video calls:** PeerJS signaling at `/peerjs`; WebSocket relays `call_request`, `peer_id`, `call_end` between users.

## Default Seeded Accounts

- **Tutor:** `sam` / `inw73KYI!` (MemStorage only, scrypt-hashed)
- **Admin:** username/password from `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars (default `admin`/`admin123` — **change before going live**)
