# localed.info

Self-service web presence for small local businesses. See [docs/](docs/) for product and tech specs.

## Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS
- Supabase (PostgreSQL + Auth; dev uses `LOCALED_DEV_OWNER_ID` only; OAuth later)

## Setup

```bash
npm install
cp .env.example .env.local   # add NEXT_PUBLIC_SUPABASE_* and optional LOCALED_DEV_OWNER_ID
npm run dev
```

## Database

Run the migration in your Supabase project (SQL Editor):

- `supabase/migrations/000_combined_localed_schema.sql` — tables + RLS (idempotent)
- If the table already existed before `archived_at` was added: `supabase/migrations/001_add_archived_at.sql`
- `supabase/migrations/002_feature_flags_and_admin.sql` — feature flags table and seed (for admin panel)

To remove everything: `supabase/migrations/000_cleanup_localed.sql`

## Auth (development only)

Development uses **LOCALED_DEV_OWNER_ID** only — no Google OAuth setup required. Set it in `.env.local` to a user UUID from Supabase Auth → Users; dashboard APIs will use that as the current user. Google OAuth can be added later for production.

**How to get `LOCALED_DEV_OWNER_ID`:**

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select the project.
2. Go to **Authentication** → **Users**.
3. Either use an existing user or click **Add user** → **Create new user** (e.g. email + password, or sign in with Google once you have OAuth set up).
4. In the users table, copy the **UUID** from the **User UID** column (or click the user and copy the `id` from the details).
5. Put it in `.env.local`:  
   `LOCALED_DEV_OWNER_ID=your-uuid-here`

With that set, dashboard APIs use this user as the owner in development when no session is present (no need to send `X-Dev-User-Id` from the browser). You can still override per-request with the `X-Dev-User-Id` header.

## Admin panel

The **Admin** panel at `/admin` lets you turn product features on or off (feature flags). Only users listed in **LOCALED_ADMIN_IDS** can access it.

1. In `.env.local`, set `LOCALED_ADMIN_IDS` to a comma-separated list of Supabase user UUIDs (e.g. the same UUID as `LOCALED_DEV_OWNER_ID` for development).
2. Run the feature-flags migration: `supabase/migrations/002_feature_flags_and_admin.sql`.
3. Open `/admin` (or click **Admin** from the dashboard). Toggle flags; changes take effect immediately. The app hides archive UI when the `archive` flag is off.

## Scripts

- `npm run dev` — start dev server (default http://localhost:3000)
- `npm run build` / `npm run start` — production
- `npm run test` — run Vitest (health endpoint tests)
- `npm run lint` — ESLint

## API

- `GET /api/health` — health check (no auth)
- `GET /api/dashboard/sites` — list my sites (requires session or in dev `LOCALED_DEV_OWNER_ID`)
- `POST /api/dashboard/sites` — create site (body: `{ business_type, slug, languages }`)
- `GET /api/dashboard/sites/[id]` — get site
- `PATCH /api/dashboard/sites/[id]` — update draft (`draft_content`)
- `POST /api/dashboard/sites/[id]/publish` — publish site

Public site and contact form APIs to follow.
