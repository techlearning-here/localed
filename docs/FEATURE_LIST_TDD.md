# localed.info — Feature List (Test-Driven Development)

**TDD-oriented feature list for MVP: Health, Sites, Public site, Contact form, Editor, QR code, then Auth last.**

*Document Version: 1.4*

---

## Design principle: professional look

Published sites (customer sites at **localed.info/[slug]**) and our templates must present a **professional look**. This applies to layout, typography, spacing, and overall polish so that local businesses are represented credibly. When adding or changing public templates and the published site UI, keep this standard in mind.

---

## TDD is mandatory

To avoid feature breakage during new feature work and integration, **test-driven development is required** for this project.

| Rule | Requirement |
|------|-------------|
| **New features** | Write failing test(s) first (from this document’s acceptance criteria). Implement until tests pass, then refactor. Do not merge feature code without corresponding tests. |
| **Bug fixes** | Add or extend a test that reproduces the bug, then fix. Merge only when the test passes. |
| **Refactors / changes to existing behavior** | Ensure existing tests still pass; add tests for any new or changed behavior before changing code. |
| **CI** | All tests must pass before merge. The pipeline runs `npm run test` and `npm run build`. A red build blocks integration. |
| **Before push** | Run `npm run test` locally. Fix any failures before pushing. |

**Why:** Tests act as a safety net. When you add or change code, existing tests catch regressions. New tests document and lock in the behavior of new features. Making TDD mandatory reduces “it worked on my machine” and prevents new features from silently breaking existing ones.

**Where tests live:** Next to the code under test (e.g. `route.test.ts` next to `route.ts`) or in a `__tests__` directory. Use the acceptance criteria IDs from this document (e.g. `SITES-01.1`) in test descriptions where applicable.

---

## Data we collect (editor fields)

All fields the business owner can fill in the editor and that drive the published site are defined in **[DATA_WE_COLLECT.md](./DATA_WE_COLLECT.md)**. That document is the single source of truth for:

- **Identity and branding:** business name, tagline, logo, favicon  
- **Location and contact:** address, phone, email, WhatsApp, location/area served  
- **Business description:** short description, about (long), year established  
- **Media:** hero image, gallery, images per service, YouTube links  
- **Services (or equivalent):** name, description, image, duration, price  
- **Business hours:** regular hours, special/holiday hours  
- **Social and external links:** Facebook, Instagram, YouTube, Twitter/X, LinkedIn, TikTok, WhatsApp, other  
- **Appointments (paid tier):** booking on/off, services, slot duration, buffer  
- **SEO (optional):** meta title, meta description, keywords; category/business type (already collected)  
- **Other:** team, testimonials, certifications, payment methods, FAQ, CTA button  

**Must-have for MVP (minimum to build and publish):** Business name, short description, at least one of phone/email (or contact form), address, business hours, business type, and at least one hero or gallery image (recommended; placeholder fallback allowed).  

**Nice-to-have:** Tagline, logo, long about, gallery, services list, social links, testimonials, team, FAQ, booking settings, meta fields.  

**Per-language:** All text fields are stored per selected language; media is shared across languages unless we add per-language media later.  

When adding or changing editor fields or templates, update [DATA_WE_COLLECT.md](./DATA_WE_COLLECT.md) first, then implement and add/update acceptance criteria here.

---

## How to Use This Document

- **TDD flow:** For each item, write the test(s) first (Red), then implement until tests pass (Green), then refactor (Refactor).
- **Test levels:** **U** = Unit, **I** = Integration, **E** = End-to-end. Implement the suggested level first; add others as needed.
- **Order:** We implement **features first, auth last** so you can build and test core flows (sites, public pages, contact, editor, QR) without login. See Implementation Order and "Auth last" strategy below.
- **Tables:** All localed.info data uses the `localed_` prefix in the same Supabase project (see [SUPABASE_REUSE.md](./SUPABASE_REUSE.md)).
- **URL scheme:** We use **path-based** URLs only: customer sites live at **`localed.info/[slug]`** (e.g. `localed.info/joes-salon`). No subdomains. See [SUBDOMAIN_VS_PATH.md](./SUBDOMAIN_VS_PATH.md).

---

## Implementation Order (Suggested) — Auth last

**Phase 1 — Features first (no login):** Build and test with a **development owner** so dashboard APIs work without real auth.

1. **Backend:** Health → Sites API (create, get, update draft, publish) → Public site (get by slug) → Contact form API. For dashboard APIs, use a **dev owner** (e.g. fixed seed user id, or `X-Dev-User-Id` header only when `NODE_ENV=development`).
2. **Frontend:** Landing → Dashboard (list sites) → Create site (business type, language) → Editor (load, save draft, preview, publish) → QR code (generate + download). Dashboard and editor are reachable without login in Phase 1; API calls send dev owner id.
3. **Public:** Published site at **localed.info/[slug]** (path-based), contact form submit.

**Phase 2 — Auth last:** Add registration and authentication; lock down dashboard and switch to real sessions.

4. **Auth:** Session / protected API (AUTH-02) → Google OAuth sign-in (AUTH-03) → Sign out (AUTH-04). Remove dev-owner bypass; require valid Supabase session for all dashboard APIs and dashboard/editor routes. Redirect unauthenticated users to login.

**Why auth last:** You can exercise create site → edit → publish → view public site → contact form → QR without configuring OAuth or signing in. Add auth once the core flows work and tests pass.

**Dev owner in Phase 1:** Use one of: (a) a fixed seed user id in `auth.users` (e.g. create one via Supabase dashboard), and in dev have dashboard APIs accept that id when there is no session; (b) optional header `X-Dev-User-Id` only when `NODE_ENV=development` so tests and UI can pass an owner id. Remove this bypass when adding AUTH-02.

---

## Legend

| Level | Meaning |
|-------|--------|
| **U** | Unit test (single function/component in isolation) |
| **I** | Integration test (API + DB, or frontend + API mock/real) |
| **E** | End-to-end test (browser + real backend + DB) |

---

# Module 1: Health

## AUTH-01 — Health endpoint (backend)

| Field | Value |
|-------|--------|
| **Feature** | `GET /api/health` (or `/health`) returns 200 and status payload |
| **Test level** | U, I |
| **Depends on** | None |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| AUTH-01.1 | Backend is running | `GET /api/health` is called | Response status is 200 |
| AUTH-01.2 | Backend is running | `GET /api/health` is called | Response body contains `"status": "ok"` (or similar) |
| AUTH-01.3 | Backend is running | `GET /api/health` is called | Response is JSON |

**TDD:** Write test for `GET /api/health` → implement route → refactor.

---

# Module 2: Sites (backend API)

Site rows store `draft_content` and `published_content` as JSON. The structure of that content (which fields exist per locale) follows the field list in [DATA_WE_COLLECT.md](./DATA_WE_COLLECT.md); templates initialize and render from that structure.

## SITES-01 — Create site (backend)

| Field | Value |
|-------|--------|
| **Feature** | `POST /api/dashboard/sites` creates a site for the authenticated user with business_type, slug, languages; draft_content initialized from template |
| **Test level** | U, I |
| **Depends on** | **Phase 1:** `localed_sites` table; use dev owner (seed user or `X-Dev-User-Id` in dev). **Phase 2:** AUTH-02 (require session; 401 when no session). |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| SITES-01.1 | Phase 1: dev owner id available. Phase 2: valid session. Body `{ "business_type": "salon", "slug": "joes-salon", "languages": ["en"] }` | `POST /api/dashboard/sites` | Response 201, row in `localed_sites` with `owner_id` = current user (or dev owner in Phase 1), `draft_content` from template |
| SITES-01.2 | Same owner, slug already exists | `POST` with same slug | Response 409 (or 422) conflict |
| SITES-01.3 | Valid request, slug invalid (e.g. spaces, special chars) | `POST` | Response 422 validation error |
| SITES-01.4 | **Phase 2 only:** No session | `POST /api/dashboard/sites` | Response 401 |
| SITES-01.5 | Valid request, body `{ "business_type": "salon", "slug": "joes-salon", "languages": ["en","hi"] }` | `POST` | Site created with `languages` = ["en","hi"] |

**TDD:** Write tests for validation, slug uniqueness, and insert into `localed_sites` → implement endpoint → refactor.

---

## SITES-02 — List my sites (backend)

| Field | Value |
|-------|--------|
| **Feature** | `GET /api/dashboard/sites` returns only the authenticated user's sites (or dev owner's in Phase 1) |
| **Test level** | I |
| **Depends on** | **Phase 1:** SITES-01, dev owner. **Phase 2:** AUTH-02, SITES-01. |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| SITES-02.1 | Owner A has 2 sites, Owner B has 1 site (Phase 1: use dev owner id; Phase 2: session) | Owner A calls `GET /api/dashboard/sites` | Response 200, list of 2 sites, all `owner_id` = A |
| SITES-02.2 | Owner has no sites | `GET /api/dashboard/sites` | Response 200, empty list |
| SITES-02.3 | **Phase 2 only:** No session | `GET /api/dashboard/sites` | Response 401 |

**TDD:** Write tests for list + ownership → implement GET → refactor.

---

## SITES-03 — Get single site (backend)

| Field | Value |
|-------|--------|
| **Feature** | `GET /api/dashboard/sites/{id}` returns site only if owned by authenticated user (or dev owner in Phase 1) |
| **Test level** | I |
| **Depends on** | SITES-01; **Phase 2:** resolve owner from session (AUTH-02). |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| SITES-03.1 | User A owns site S | User A calls `GET /api/dashboard/sites/{S.id}` | Response 200, site S (including draft_content) |
| SITES-03.2 | User B does not own site S | User B calls `GET /api/dashboard/sites/{S.id}` | Response 404 (or 403) |
| SITES-03.3 | Invalid id | `GET /api/dashboard/sites/invalid` | Response 422 or 404 |

**TDD:** Write tests for get-by-id and ownership → implement → refactor.

---

## SITES-04 — Update draft (backend)

| Field | Value |
|-------|--------|
| **Feature** | `PATCH /api/dashboard/sites/{id}` updates `draft_content` only if owned by user (or dev owner in Phase 1); does not change published_content |
| **Test level** | I |
| **Depends on** | SITES-03 |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| SITES-04.1 | User A owns site S | User A sends `PATCH` with `{ "draft_content": { "en": { "businessName": "Joe's Salon" } } }` | Response 200, site's draft_content updated, published_content unchanged |
| SITES-04.2 | User B does not own site S | User B sends `PATCH` to S | Response 404 (or 403) |
| SITES-04.3 | Valid update | `PATCH` | `updated_at` is updated |

**TDD:** Write tests for partial update and ownership → implement PATCH → refactor.

---

## SITES-05 — Publish site (backend)

| Field | Value |
|-------|--------|
| **Feature** | `POST /api/dashboard/sites/{id}/publish` copies draft_content to published_content and sets published_at; only owner |
| **Test level** | I |
| **Depends on** | SITES-04 |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| SITES-05.1 | User A owns site S with draft_content | User A calls `POST /api/dashboard/sites/{S.id}/publish` | Response 200, `published_content` = copy of `draft_content`, `published_at` set |
| SITES-05.2 | User B does not own site S | User B calls publish on S | Response 404 (or 403) |
| SITES-05.3 | Site already published | Publish again after editing draft | published_content and published_at updated to new values |

**TDD:** Write tests for publish action and ownership → implement → refactor.

---

# Module 3: Public site (unauthenticated)

## PUBLIC-01 — Get published site by slug (backend)

| Field | Value |
|-------|--------|
| **Feature** | `GET /api/sites/{slug}` (or similar) returns published site content for the given slug; used to render **path-based** page at **localed.info/[slug]**; no auth required |
| **Test level** | I |
| **Depends on** | SITES-05 |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| PUBLIC-01.1 | Site S with slug "joes-salon" is published | `GET /api/sites/joes-salon` (or `GET /api/public/sites/joes-salon`) | Response 200, published_content (and template_id, languages) |
| PUBLIC-01.2 | Site S is not published (published_at null) | `GET /api/sites/joes-salon` | Response 404 |
| PUBLIC-01.3 | No site with slug "unknown" | `GET /api/sites/unknown` | Response 404 |
| PUBLIC-01.4 | No auth header | `GET` with valid slug | Response 200 (public endpoint) |

**TDD:** Write tests for get-by-slug and published check → implement public API → refactor.

---

## PUBLIC-02 — Render published site page (frontend)

| Field | Value |
|-------|--------|
| **Feature** | Path-based route: **`/[siteSlug]`** (e.g. `/joes-salon`) and `/[siteSlug]/[pageSlug]` (e.g. `/joes-salon/about`) render the published site. Canonical URL is **localed.info/[siteSlug]**. |
| **Test level** | I, E |
| **Depends on** | PUBLIC-01 |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| PUBLIC-02.1 | Site "joes-salon" is published | User visits **localed.info/joes-salon** (path-based) | Page shows site with business name, content from published_content |
| PUBLIC-02.2 | Site is not published | User visits localed.info/joes-salon | 404 or "not found" |
| PUBLIC-02.3 | Site has multiple languages | User visits and selects language | Content for selected language is shown |

**TDD:** Write test that fetches site by slug and renders template with content → implement page and template → refactor.

---

# Module 4: Contact form

## CONTACT-01 — Submit contact form (backend)

| Field | Value |
|-------|--------|
| **Feature** | `POST /api/sites/{slug}/contact` (or `/api/public/contact`) accepts name, email, message; stores in `localed_contact_submissions`; optional: send email to site owner |
| **Test level** | I |
| **Depends on** | PUBLIC-01 (site exists and is published) |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| CONTACT-01.1 | Site "joes-salon" is published, body `{ "name": "Jane", "email": "j@example.com", "message": "Hi" }` | `POST /api/sites/joes-salon/contact` | Response 200 or 201, row in `localed_contact_submissions` with site_id, name, email, message |
| CONTACT-01.2 | Invalid body (e.g. missing email) | `POST` | Response 422 validation error |
| CONTACT-01.3 | Site slug does not exist or not published | `POST` | Response 404 |
| CONTACT-01.4 | Valid submit | `POST` | Optional: email sent to site owner (mock in test) |

**TDD:** Write tests for validation, insert, and optional email → implement endpoint → refactor.

---

## CONTACT-02 — Contact form on published site (frontend)

| Field | Value |
|-------|--------|
| **Feature** | Published site has a contact form; submit sends to contact API and shows success/error |
| **Test level** | I, E |
| **Depends on** | CONTACT-01, PUBLIC-02 |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| CONTACT-02.1 | User on published site | User fills name, email, message and submits | Request sent to contact API; success message shown |
| CONTACT-02.2 | API returns validation error | User submits invalid data | Error message shown |

**TDD:** Write test for form submit and feedback → implement form and API call → refactor.

---

# Module 5: Editor (frontend)

## EDITOR-01 — Create site flow (frontend)

| Field | Value |
|-------|--------|
| **Feature** | User can start "Create site": choose business type, slug, languages; on submit, site is created and user is taken to editor |
| **Test level** | I, E |
| **Depends on** | SITES-01. **Phase 1:** Dashboard/editor open without login; API uses dev owner. **Phase 2:** AUTH-03; redirect to login when not signed in. |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| EDITOR-01.1 | User on dashboard (Phase 1: no login; Phase 2: signed in) | User clicks "Create site", selects business type "salon", slug "joes-salon", language "English", submits | Site created via API; user redirected to editor for that site |
| EDITOR-01.2 | User submits duplicate slug | Create with slug that already exists | Error shown (409/422), stay on form |
| EDITOR-01.3 | **Phase 2 only:** User not signed in | User tries to open create-site page (or /dashboard) | Redirect to login |

**TDD:** Write test for create flow and API call → implement form and redirect → refactor.

---

## EDITOR-02 — Load and save draft (frontend)

| Field | Value |
|-------|--------|
| **Feature** | Editor loads site draft; user can edit fields per [DATA_WE_COLLECT.md](./DATA_WE_COLLECT.md) (identity, contact, description, media, services, hours, social, etc.); "Save" sends PATCH to update draft |
| **Test level** | I, E |
| **Depends on** | SITES-03, SITES-04 |

**Editor fields (see DATA_WE_COLLECT):** At minimum, editor supports must-have fields: business name, short description, phone and/or email, address, business hours, business type; optionally tagline, about, hero/gallery, services, social links, and other nice-to-have fields as the template and onboarding evolve.

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| EDITOR-02.1 | User owns site S, on editor | Editor loads | Draft content (e.g. business name, address, contact, hours) is shown in form/fields per DATA_WE_COLLECT |
| EDITOR-02.2 | User changes business name and clicks Save | Save clicked | PATCH /api/dashboard/sites/{id} called with updated draft_content |
| EDITOR-02.3 | Save succeeds | After save | UI shows "Saved" or no error; optional optimistic update |
| EDITOR-02.4 | User does not own site | User opens editor URL for another user's site | 404 or redirect |

**TDD:** Write test for load and save → implement editor state and API calls → refactor.

---

## EDITOR-03 — Preview and publish (frontend)

| Field | Value |
|-------|--------|
| **Feature** | User can toggle "Preview" to see site as it will look; "Publish" calls publish API and updates live site |
| **Test level** | I, E |
| **Depends on** | SITES-05, PUBLIC-02 |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| EDITOR-03.1 | User in editor | User clicks Preview | Preview mode shows site with current draft content (or new tab/modal) |
| EDITOR-03.2 | User in editor, draft saved | User clicks Publish | POST publish API called; on success, message "Published" and public site reflects new content |
| EDITOR-03.3 | Publish fails (e.g. 403) | User clicks Publish | Error shown |

**TDD:** Write test for preview and publish flow → implement → refactor.

---

# Module 6: QR code

## QR-01 — Generate and download QR code (frontend)

| Field | Value |
|-------|--------|
| **Feature** | In dashboard (or editor), when site is published, user can generate a QR code for the site URL and download as PNG |
| **Test level** | U, I |
| **Depends on** | PUBLIC-02 (site URL is known) |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| QR-01.1 | Site is published with slug "joes-salon" | User clicks "Get QR code" | QR image encodes **path-based** URL: **https://localed.info/joes-salon** |
| QR-01.2 | User clicks "Download PNG" | Download clicked | A PNG file is downloaded (or blob/link with correct URL) |
| QR-01.3 | Site is not published | User on site dashboard | "Get QR code" is disabled or message "Publish first" |
| QR-01.4 | Unit: QR lib given URL | Generate QR for "https://example.com" | Output (canvas/blob) contains correct encodable content (or snapshot) |

**TDD:** Write unit test for QR generation from URL; then test for download and "published" gate → implement client-side QR + download → refactor.

---

# Module 7: Auth (implement last)

Implement after Phase 1 features work. Removes dev-owner bypass and requires real Supabase session for dashboard APIs and dashboard/editor routes.

## AUTH-02 — Session / protected API (backend)

| Field | Value |
|-------|--------|
| **Feature** | Dashboard APIs require valid Supabase session; invalid/missing session returns 401 |
| **Test level** | U, I |
| **Depends on** | AUTH-01, Supabase Auth configured; Sites API already implemented (Phase 1). |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| AUTH-02.1 | No session / invalid token | Protected endpoint (e.g. `GET /api/dashboard/sites`) is called | Response is 401 Unauthorized |
| AUTH-02.2 | Valid Supabase session (Bearer or cookie) | Protected endpoint is called | Request is allowed and `user_id` (auth.uid()) is available |
| AUTH-02.3 | Valid session | `GET /api/dashboard/me` (or equivalent) | Response 200 and includes current user info |

**TDD:** Write tests for `get_current_user` (or equivalent) and one protected route → implement session validation → remove dev-owner bypass → refactor.

---

## AUTH-03 — Google OAuth sign-in (frontend)

| Field | Value |
|-------|--------|
| **Feature** | User can sign in with Google; after redirect, user is authenticated and can access dashboard |
| **Test level** | I, E |
| **Depends on** | Supabase Auth + Google provider, redirect URL for localed.info in Supabase |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| AUTH-03.1 | User on login/landing page | User clicks "Sign in with Google" | User is redirected to Google consent |
| AUTH-03.2 | User completes Google consent | Callback returns to app | User has valid Supabase session |
| AUTH-03.3 | User is signed in | User visits /dashboard | Dashboard is shown (not login) |
| AUTH-03.4 | User not signed in | User visits /dashboard | Redirect to login or landing |

**TDD:** Write E2E or integration test (mock or test Google OAuth) → implement sign-in flow and callback → refactor.

---

## AUTH-04 — Sign out (frontend)

| Field | Value |
|-------|--------|
| **Feature** | Signed-in user can sign out; session is cleared and user sees login/landing |
| **Test level** | I, E |
| **Depends on** | AUTH-03 |

**Acceptance criteria / Test cases:**

| ID | Given | When | Then |
|----|--------|------|------|
| AUTH-04.1 | User is signed in | User clicks "Sign out" | Supabase session is cleared |
| AUTH-04.2 | User signed out | User visits /dashboard | Redirect to login or landing |

**TDD:** Write test for sign-out and redirect → implement sign-out → refactor.

---

# Summary checklist

| Module | Features | Suggested test focus | Phase |
|--------|----------|----------------------|--------|
| 1. Health | AUTH-01 | I for health endpoint | 1 |
| 2. Sites | SITES-01 .. SITES-05 | I for all CRUD and publish | 1 |
| 3. Public (path-based localed.info/[slug]) | PUBLIC-01, PUBLIC-02 | I for API; I/E for render | 1 |
| 4. Contact | CONTACT-01, CONTACT-02 | I for API; I/E for form | 1 |
| 5. Editor | EDITOR-01 .. EDITOR-03 | I, E for flows | 1 |
| 6. QR | QR-01 | U for generate; I for UI | 1 |
| 7. Auth (last) | AUTH-02 .. AUTH-04 | I for API auth; E for login/logout | 2 |

---

*Extend this list when adding: appointments (embed), multi-language content save, hyper-local SEO (meta/schema), LocalBusiness JSON-LD, testimonials, ask-for-reviews/QR poster, reports/PDF export, workspaces, **WhatsApp extras** (pre-filled message, floating CTA, share via WhatsApp, WhatsApp QR — see [WHATSAPP_FEATURES.md](./WHATSAPP_FEATURES.md)), **AI features** (suggest copy, translation, SEO meta, “Improve this”, tips, alt text, contact summarization — see [AI_FEATURES.md](./AI_FEATURES.md)), or other features from [ADDITIONAL_FEATURES.md](./ADDITIONAL_FEATURES.md). Features identified from competitor analysis are listed there with a “From competitor analysis” note; see [CompetitorFeatureAnalysis.md](./CompetitorFeatureAnalysis.md) for the full mapping. When adding or changing editor or template fields, update [DATA_WE_COLLECT.md](./DATA_WE_COLLECT.md) first and keep feature acceptance criteria in sync.*
