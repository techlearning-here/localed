# Deploying localed to Cloudflare

This guide covers deploying the localed Next.js app to **Cloudflare Workers** using the OpenNext adapter. The app is full-stack (API routes, Supabase, dynamic routes), so we use Workers rather than static Pages.

**References:** [Cloudflare Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/), [OpenNext for Cloudflare](https://opennext.js.org/cloudflare).

---

## Overview

1. **Setup** — Install `wrangler` and `@opennextjs/cloudflare`; config files (`open-next.config.ts`, `wrangler.toml`) are already in the repo.
2. **Env** — For **local preview** use `.dev.vars` (same keys as `.env.local`). For **deploy** set variables in the Cloudflare dashboard or Git build config.
3. **Test locally** — `npm run preview` → open http://localhost:8787. With `.dev.vars` set, you can use the dashboard without login.
4. **Deploy** — `npx wrangler login` then `npm run deploy:cf`, or connect Git and use the build configuration below.

---

## Prerequisites

- **Node.js** 18+ and npm (or pnpm/yarn)
- **Cloudflare account** — [dash.cloudflare.com](https://dash.cloudflare.com)
- **Supabase project** — URL and keys ready (production or shared dev)

---

## 1. Install Cloudflare dependencies

From the project root:

```bash
npm install -D wrangler@latest
npm install @opennextjs/cloudflare@latest
```

---

## 2. Config files (already in repo)

- **`open-next.config.ts`** — OpenNext Cloudflare config.
- **`wrangler.toml`** — Worker name `localed`, `nodejs_compat`, assets from `.open-next/assets`. `compatibility_date` must be `2024-09-23` or later. For a custom domain, use Workers & Pages → your worker → Custom domains.

---

## 3. npm scripts

| Script | Purpose |
|--------|---------|
| `preview` | Build with OpenNext and run at http://localhost:8787 (Workers runtime). |
| `preview:env` | Same as `preview` but loads `.env.local` for the **build** (Worker runtime still needs `.dev.vars` for env at request time). |
| `build:cf` | Build only (OpenNext); no local server. |
| `deploy:cf` | Build and deploy to Cloudflare. |
| `cf-typegen` | Generate Cloudflare env types (optional). |

---

## 4. Environment variables

### Required for production

| Variable | Description | Where to set |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SITE_URL` | App URL (e.g. `https://<name>.<subdomain>.workers.dev`). Set after first deploy if needed. | Build + Worker |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Build + Worker |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Build + Worker |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | Worker (secret) |
| `LOCALED_ADMIN_IDS` | Comma-separated user UUIDs for `/admin` | Worker (secret) |

### Optional

| Variable | Description |
|----------|-------------|
| `LOCALED_DEV_OWNER_ID` | Dev bypass; usually unset in production. Required in `.dev.vars` for dashboard at localhost:8787. |
| `RESEND_API_KEY`, `RESEND_FROM` | Contact form email (Resend). |

### Where to set them

- **Local preview** (`npm run preview`): **`.dev.vars`** in the project root. Wrangler loads it for the Worker at http://localhost:8787. Copy from `.env.local` or use `.dev.vars.example` as a template. `.dev.vars` is gitignored.
- **Local deploy** (`npm run deploy:cf` from your machine): `.dev.vars` or `wrangler secret put <NAME>`.
- **Cloudflare dashboard**: Workers & Pages → your worker → Settings → Variables and Secrets.
- **Git/CI**: Build configuration → Variable name / Variable value (and Secrets). All vars must be available at **build** time for Next.js. See [OpenNext env vars](https://opennext.js.org/cloudflare/howtos/env-vars#workers-builds).

---

## 5. Test locally (preview)

Build and run in the Workers runtime:

```bash
npm run preview
```

Open **http://localhost:8787**. To use the **dashboard without login** (like `npm run dev`):

- Create **`.dev.vars`** in the project root with the same keys as `.env.local` (at least `LOCALED_DEV_OWNER_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). See `.dev.vars.example`.
- Restart preview after creating or changing `.dev.vars`.

Stop the server with Ctrl+C.

---

## 6. Deploy from your machine

1. Log in (once):

   ```bash
   npx wrangler login
   ```

2. Deploy:

   ```bash
   npm run deploy:cf
   ```

3. Use the printed URL (e.g. `https://localed.<subdomain>.workers.dev`). Set `NEXT_PUBLIC_SITE_URL` to this URL and redeploy if you need correct "View site" and QR links.

---

## 7. Deploy via Git (CI/CD)

1. In [Cloudflare Dashboard](https://dash.cloudflare.com) go to **Workers & Pages** → **Create application** → **Connect to Git**. Select repo and branch.
2. **Build configuration**:
   - **Build command:** `npm ci && npx opennextjs-cloudflare build`
   - **Deploy command:** `npx wrangler deploy`
   - **Non-production branch deploy command:** optional (e.g. `npx wrangler versions upload`)
   - **Path:** `/`
3. **Variables:** Add env vars from section 4 (Variable name / Variable value). Use Secrets for `SUPABASE_SERVICE_ROLE_KEY` and `LOCALED_ADMIN_IDS` if the UI offers it.
4. **API token:** Create new or use existing with Workers write access. Save and push to trigger a deploy.

---

## 8. Custom domain (optional)

You can run on the default `https://<name>.<subdomain>.workers.dev` URL. When you have a domain:

- Workers & Pages → your worker → **Custom domains** → add domain (e.g. `localed.info`).
- In your DNS provider, add the CNAME or A/AAAA records Cloudflare shows.
- Set `NEXT_PUBLIC_SITE_URL` to your domain and redeploy.

---

## 9. Supabase redirect URLs

In **Supabase** → **Authentication** → **URL configuration**:

- **Redirect URLs:** Add your production URL, e.g. `https://localed.<subdomain>.workers.dev/**`. Add custom domain later if needed.
- **Site URL:** Set to that same base URL.

---

## 10. Troubleshooting

| Issue | Suggestion |
|-------|------------|
| Build fails (missing env) | Set all `NEXT_PUBLIC_*` and server env vars for the **build** step (Git build config or shell before `npm run deploy:cf`). |
| 500 or runtime errors in production | Check Worker logs; ensure `SUPABASE_SERVICE_ROLE_KEY` and other secrets are set in the Worker environment. |
| Auth redirect broken | Add the exact deployment URL (and custom domain) to Supabase Redirect URLs and Site URL. |
| Dashboard redirects to login at localhost:8787 | Create `.dev.vars` with `LOCALED_DEV_OWNER_ID`, `SUPABASE_SERVICE_ROLE_KEY`, and Supabase URL/keys. Restart `npm run preview`. |
| `nodejs_compat` / compatibility | Keep `compatibility_flags = [ "nodejs_compat" ]` and `compatibility_date` ≥ `2024-09-23` in `wrangler.toml`. |
| Static assets 404 | Ensure `[assets]` in `wrangler.toml` points to `.open-next/assets` and `binding = "ASSETS"`. |

---

## Checklist

- [ ] `wrangler` and `@opennextjs/cloudflare` installed
- [ ] `open-next.config.ts` and `wrangler.toml` in project root
- [ ] For local preview: `.dev.vars` created (copy from `.env.local` or use `.dev.vars.example`)
- [ ] All required env vars set for build and Worker (section 4)
- [ ] Supabase redirect URLs include production (and workers.dev) URL
- [ ] `npm run preview` works at http://localhost:8787 (dashboard works with `.dev.vars`)
- [ ] `npm run deploy:cf` succeeds and app loads at the given URL
- [ ] `NEXT_PUBLIC_SITE_URL` set to workers.dev URL or custom domain
