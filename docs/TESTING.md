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

## CI

CI runs `npm run test` and `npm run build`. All tests must pass before merge. See [CONTRIBUTING.md](../CONTRIBUTING.md).
