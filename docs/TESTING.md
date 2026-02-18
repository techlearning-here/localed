# Testing (TDD)

**TDD is mandatory.** See [FEATURE_LIST_TDD.md](./FEATURE_LIST_TDD.md) for the policy and acceptance criteria.

## Run tests

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

## Stack

- **Vitest** — test runner (unit + integration-style API tests).
- Config: [vitest.config.ts](../vitest.config.ts) — Node environment, `@` alias, `**/*.test.ts` and `**/*.spec.ts`.

## Where tests live (colocated vs separate folder)

**We use colocated tests:** each test file sits **next to the source** it tests (e.g. `route.test.ts` beside `route.ts`). No separate `tests/` or `__tests__/` tree.

| Approach | Example | Common in |
|----------|---------|-----------|
| **Colocated** (our choice) | `app/api/health/route.ts` + `app/api/health/route.test.ts` | Next.js, Vite, React, many JS/TS frontends |
| **Separate folder** | `app/api/health/route.ts` + `tests/api/health/route.test.ts` (or `__tests__/` mirroring `app/`) | Some Java/Maven, Python, or teams that want strict src vs test separation |

**Why colocated here:**

- **Next.js/JS norm:** The usual pattern in the Next.js and React ecosystem is “test next to source.” Vitest and Jest both discover `*.test.ts` anywhere, so a single `tests/` folder is optional, not required.
- **Easier to maintain:** When you change or delete a file, the test is right there; you’re less likely to leave orphan tests or wrong paths.
- **Clear ownership:** It’s obvious which test covers which module without a parallel folder structure.
- **Same as backend “mirror” layout:** Colocated is similar to `src/main/...` and `src/test/...` mirroring the same package path, but with the test file in the same directory as the source.

**If you prefer a separate folder:** You can put tests under `__tests__/` or `tests/` and mirror the app structure (e.g. `tests/app/api/health/route.test.ts`). Vitest will still pick them up. We’re not doing that by default so we stay aligned with common Next.js practice.

**Naming:** `*.test.ts` or `*.spec.ts`. Vitest includes both.

## Current coverage

| Area | File | What’s tested |
|------|------|----------------|
| Health | `app/api/health/route.test.ts` | AUTH-01: GET/HEAD 200, JSON body |
| Templates | `lib/templates.test.ts` | SITES-01: `isValidSlug`, `buildInitialDraftContent` |
| Dashboard sites list/create | `app/api/dashboard/sites/route.test.ts` | SITES-01/02: 401, 422 invalid body/slug |
| Dashboard site by id | `app/api/dashboard/sites/[id]/route.test.ts` | SITES-03 GET 401/403/200; SITES-04 PATCH 401, 422 invalid JSON |
| Public site by slug | `app/api/sites/[slug]/route.test.ts` | PUBLIC-01: 503, 404, 200 with content |
| Contact form | `app/api/sites/[slug]/contact/route.test.ts` | CONTACT-01: 503, 422 missing fields, invalid JSON |

API route tests **mock** `@/lib/supabase/server` (e.g. `getDashboardSupabase`, `createSupabaseServer`) so no real DB is needed.

## Adding tests (TDD)

1. Open [FEATURE_LIST_TDD.md](./FEATURE_LIST_TDD.md) and find the feature (e.g. SITES-04).
2. Write a test file that implements the **Given/When/Then** acceptance criteria. Use `vi.mock()` for Supabase or other deps.
3. Run `npm run test` — expect failures (Red).
4. Implement or fix the code until tests pass (Green).
5. Refactor if needed; keep tests green.

## Manual testing

Use this to verify the app end-to-end in the browser (dashboard, wizard, public site, contact form, meta/OG).

### 1. Setup

- **Supabase:** Create a project and get URL + anon key + service role key.
- **Env (Next.js dev):** Create `.env.local` in the project root with at least:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `LOCALED_DEV_OWNER_ID` — a UUID from Supabase Auth → Users (or create a user and copy its id)
- **Optional:** `NEXT_PUBLIC_SITE_URL` (e.g. `https://localed.info`) for canonical URLs and OG links. For local dev you can leave it unset or use `http://localhost:3000`.
- **Preview (Workers):** For `npm run preview`, copy `.dev.vars.example` to `.dev.vars` and fill the same keys so the dashboard works at http://localhost:8787 without login.

### 2. Run the app

```bash
npm run dev
```

Open **http://localhost:3000**. (Or use `npm run preview` and open **http://localhost:8787**.)

### 3. Dashboard and create flow

1. Go to **Dashboard** (e.g. http://localhost:3000/dashboard). You should see “My sites” (empty or list).
2. Click **Create site** (or open `/dashboard/sites/new/edit`).
3. **Step 1 — Site settings:** Enter a site name (e.g. `my-salon`), choose business type, country, languages. Click **Check availability**; wait for “available.” Click **Next**.
4. **Step 2 — Basic info:** Fill business name, short description, etc. Click **Next**.
5. **Step 3 — Contact:** Fill address, phone, email. Click **Next**.
6. **Step 4 — Business hours:** Set timezone and hours. Click **Next**.
7. **Step 5 — Template:** Choose **Modern** or **Classic**. Click **Next**.
8. **Step 6 — Template details:** If the template has extra fields, fill them; otherwise click **Next**.
9. **Step 7 — Media:** Optionally add hero image URL, gallery, YouTube. Click **Next** to reach the bottom.
10. Click **Save draft** or **Save and publish**. You should be redirected to the edit page for the new site (or see an error in the red banner; fix env/slug and try again).

### 4. Edit and contact submissions

- On the edit page, change steps via the progress bar or Previous/Next. Edit fields and click **Save draft** to persist.
- If the site is published, scroll down: the **Contact submissions** section should load (one request in the terminal). If there are no submissions, it shows “No contact submissions yet.”

### 5. Public site and contact form

1. Publish the site if it isn’t already (edit page → **Publish**).
2. Open the public URL: **http://localhost:3000/{slug}** (e.g. http://localhost:3000/my-salon).
3. Check that business name, description, contact, and hours appear.
4. Submit the **contact form** (name, email, message). You should see a success message.
5. Back on the edit page, refresh or scroll to **Contact submissions** — the new submission should appear.

### 6. Meta and Open Graph (PUBLIC-03)

1. Publish a site that has **business name**, **short description**, and ideally a **hero image** (or logo) URL.
2. Open the public page: **http://localhost:3000/{slug}**.
3. **View page source** (e.g. right‑click → View Page Source) and confirm:
   - `<meta name="description" content="...">` with the short description
   - `<meta property="og:title" ...>`, `og:description`, `og:image`, `og:url`
   - `<link rel="canonical" href="...">` if `NEXT_PUBLIC_SITE_URL` is set
4. **Preview sharing:** Use a tool like [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or [Twitter Card Validator](https://cards-dev.twitter.com/validator) with your deployed URL (e.g. `https://your-domain.com/your-slug`) to see how the link preview looks. For localhost, these tools often can’t fetch the page; deploy to a public URL to test OG previews.

### 7. Quick checks

| What | How |
|------|-----|
| 401 on dashboard | Set `LOCALED_DEV_OWNER_ID` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (or `.dev.vars` for preview). |
| Save draft “not working” | Ensure you clicked **Check availability** and the site name is available; check the red error banner. |
| Double GET /submissions | Fixed with a ref dedupe; you should see a single request per edit page load. |
| No OG preview when sharing | Set `NEXT_PUBLIC_SITE_URL` and deploy; use a public URL in sharing validators. |

---

## CI

CI runs `npm run test` and `npm run build`. All tests must pass before merge. See [CONTRIBUTING.md](../CONTRIBUTING.md).
