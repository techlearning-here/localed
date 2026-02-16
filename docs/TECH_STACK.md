# localed.info — Tech Stack

**Purpose:** Recommended technology choices for the dashboard, editor, published sites, and supporting services. Aligns with [HOSTING_STRATEGY.md](./HOSTING_STRATEGY.md) and product scope (template-based sites, multi-tenant, multi-language, payments).

---

## 1. Overview

| Layer | Recommended | Alternatives |
|-------|-------------|--------------|
| **Frontend (dashboard + editor)** | Next.js 14+ (App Router), React, TypeScript, Tailwind CSS | Remix; separate SPA + API |
| **Published sites (customer-facing)** | Same Next.js app; dynamic routes by path/subdomain; content from DB | Static export per site at publish (more complex) |
| **Backend / API** | Next.js API routes (or Route Handlers) | Separate Node/Python API |
| **Database** | Supabase (PostgreSQL + Auth) | Neon, PlanetScale, Turso |
| **Auth** | Supabase Auth (email + optional OAuth) | NextAuth.js, Clerk |
| **Images / media** | ImageKit (one account, our bucket) | Cloudflare Images, S3 + CDN |
| **Payments** | Stripe (subscriptions + add-ons) | Paddle, Lemon Squeezy |
| **Email** | Resend or SendGrid (transactional) | Postmark, Supabase + provider |
| **Hosting** | Cloudflare Pages (preferred) or Vercel Pro | Netlify, Render |

*Fits the existing StartupSaathi stack (Next.js, Supabase, Tailwind) so the team can reuse patterns and skills.*

---

## 2. Frontend: dashboard and editor

- **Next.js 14+** with App Router, **React 18**, **TypeScript**.
- **Tailwind CSS** for UI (dashboard and editor).
- **State:** React state + URL for editor; optional Zustand or React Query for server state.
- **Forms:** React Hook Form + Zod (or similar) for onboarding and edit forms.
- **Editor UX:** In-context editing on a preview of the site (same template components used for publish). No full page-builder SDK in v1; form-like fields per section (e.g. “Hero headline”, “About text”, “Services list”).

**Why Next.js:** One codebase for dashboard, editor, and published sites; SSR/SSG where needed; API routes in the same repo; aligns with your current project.

---

## 3. Published sites (customer sites)

**Approach:** **Single Next.js app** that serves all customer sites.

- **Routing:** 
  - **Path-based:** `localed.info/[siteSlug]` and `localed.info/[siteSlug]/[pageSlug]` (e.g. `localed.info/joes-salon/about`).
  - **Or subdomain:** `[siteSlug].localed.info` (requires wildcard DNS and host-based routing in the app).
- **Data:** On each request, resolve `siteSlug` (from path or host) → load site + page content from DB (and template id) → render the right template component with that content.
- **Caching:** Cache rendered output or API response at CDN (Cloudflare/Vercel) by `siteSlug` + `pageSlug` + language; short TTL or purge on republish.
- **Templates:** One React component per template (e.g. `SalonTemplate`, `ClinicTemplate`); each receives content blob and locale.

**Alternative (later):** “Publish” generates a static export (e.g. HTML per page) and deploys to CDN for that site. Faster and more scalable but needs a build/deploy pipeline per site; start with dynamic + cache.

---

## 4. Backend and API

- **Next.js API routes** (or App Router Route Handlers) for:
  - Dashboard: CRUD sites, pages, content, user profile.
  - Editor: save draft, publish (update published content + optional purge cache).
  - Contact form: validate, store, send email.
  - Bookings (paid): create slot, list availability, confirm/cancel.
  - Webhooks: Stripe (subscription events), optional ImageKit.
- **Serverless** on Cloudflare Pages (Functions) or Vercel (Serverless Functions); no long-running server.

### Where does the site builder run?

| Part | Where it runs |
|------|----------------|
| **Editor UI** (forms, in-context edit, preview) | **User’s browser** — React/Next.js client. The dashboard and editor pages are served from our app; the actual editing and preview render in the visitor’s device. |
| **Save draft / Publish / Load site data** | **Our single deployment** (Cloudflare Pages Functions or Vercel Serverless). The browser calls our API (e.g. `POST /api/dashboard/sites/[id]`, `POST /api/dashboard/sites/[id]/publish`); those API routes run on Cloudflare/Vercel and read/write **Supabase** (`localed_sites.draft_content`, `published_content`, etc.). |
| **Stored content** | **Supabase** (PostgreSQL). No site content is stored on our “server”; it’s in the DB. |

So: **site builder operations** (save, publish, load) run in **our one app deployment** (serverless), which talks to **Supabase**. The editor experience itself runs in the **user’s browser**.

---

## 5. Database (Supabase)

- **PostgreSQL** via Supabase. **Reuse your existing Supabase project** (same as LaunchMitra): same Google OAuth and same DB. Use **table prefix** `localed_` for all localed.info tables. See [SUPABASE_REUSE.md](./SUPABASE_REUSE.md).
- **Suggested tables (high level):**
  - `auth.users` (Supabase Auth — shared if same project).
  - `localed_sites`: id, owner_id, slug, business_type, template_id, plan (free|paid), languages[], published_at, draft_content (JSONB), published_content (JSONB), created_at, updated_at.
  - `localed_contact_submissions`: site_id, name, email, message, created_at.
  - `localed_bookings`: site_id, service_id, customer_name, email, slot_start, status, created_at.
  - Optional: `localed_media` or rely on ImageKit URLs in site content JSON.
- **Row Level Security (RLS):** Owner can only edit their sites; public read for published content (or serve via API with cache).
- **Multi-language:** Store content as JSONB per locale, e.g. `draft_content.en`, `draft_content.hi`, or nested `draft_content: { en: {...}, hi: {...} }`.

---

## 6. Auth (Supabase Auth)

- **Email + password** sign up / login.
- **Optional:** Magic link or “Sign in with Google” to reduce friction.
- **Sessions:** Supabase SSR helpers (e.g. `@supabase/ssr`) with cookies; protect dashboard and API by user/site ownership.

---

## 7. Images and media (ImageKit)

- **One ImageKit account** (ours); all customer uploads go there (see [HOSTING_STRATEGY.md](./HOSTING_STRATEGY.md)).
- **Flow:** Dashboard/editor uploads image → backend gets file → upload to ImageKit (server-side or signed client upload) → store ImageKit URL in site content.
- **Transformations:** Use ImageKit URLs with params (resize, crop) for thumbnails and responsive images in templates.
- **Fallback:** Placeholder or default image if none provided.

---

## 8. Payments (Stripe)

- **Products:** 
  - Paid plan: $4/mo (or $39/year).
  - Add-on: “Multi-language” (flat fee; TBD).
- **Stripe Billing:** Subscriptions for monthly/yearly; one-time or recurring for add-on. Webhooks to update `sites.plan` and “add-on: multi-language” in DB.
- **Checkout:** Stripe Checkout (hosted) or Stripe Elements in dashboard; link “Upgrade” in dashboard to create checkout session.

---

## 9. Email (transactional)

- **Provider:** Resend, SendGrid, or Postmark.
- **Use cases:** Signup verification, password reset (often via Supabase), contact form delivery to business owner, booking confirmation to customer and owner.
- **Implementation:** API route receives form submission or booking → call provider API to send email; store submission in DB.

---

## 10. Hosting and deployment

- **Preferred:** **Cloudflare Pages** (static + Functions). Deploy Next.js (static export for marketing/dashboard if possible, or use adapter for Pages). Commercial use allowed on free tier; 500 builds/mo.
- **Alternative:** **Vercel Pro** (~$20/mo). Full Next.js support; commercial use; single account for app + all customer sites (dynamic routing).
- **DNS:** Domain `localed.info`; for subdomain option, add wildcard `*.localed.info` → same deployment.
- **Env:** Secrets in Cloudflare/Vercel (Supabase URL/key, Stripe keys, ImageKit keys, email API key).

### How many servers do we need to run?

**Zero.** You don’t run or maintain any servers yourself.

| What | Who runs it | Count |
|------|-------------|--------|
| **Our app** (Next.js: dashboard, editor, published sites, API) | **One deployment** on Cloudflare Pages or Vercel (serverless / edge) | **1** deployment |
| **Database + Auth** | Supabase (managed) | 0 — we don’t run it |
| **Images** | ImageKit (managed) | 0 |
| **Payments** | Stripe (managed) | 0 |
| **Email** | Resend / SendGrid (managed) | 0 |

So: **one app deployment** is the only thing “we” run. That deployment uses Cloudflare or Vercel’s infrastructure (functions/edge); there are no VMs, no Docker, no SSH. Everything else is SaaS — we just configure and use it.

---

## 11. Summary diagram

```
[Business owner] → Browser → localed.info (dashboard + editor)
                              ↓
                    Next.js App (Cloudflare Pages or Vercel)
                    ├── /login, /signup, /dashboard, /dashboard/sites/[id]/edit
                    ├── /[siteSlug], /[siteSlug]/[pageSlug]  (published sites)
                    └── API: sites, publish, contact, bookings
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
   Supabase              ImageKit               Stripe
   (DB + Auth)           (images)               (payments)
        ↓                     ↓                     ↓
   Resend/SendGrid (email)
```

---

## 12. What we’re not using (v1)

- **No** separate CMS (content lives in Supabase).
- **No** per-customer Vercel/ImageKit accounts.
- **No** heavy page builder (e.g. Builder.io, custom blocks); template + form-like editing only.
- **No** custom domain in v1 (all sites on localed.info path or subdomain).

---

*Revisit this doc when adding custom domains, static export per site, or a separate API service.*
