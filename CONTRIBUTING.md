# Contributing to localed.info

## TDD is mandatory

To avoid feature breakage during new feature work and integration, **test-driven development (TDD) is required** for all code changes that affect behavior.

- **New features:** Write failing test(s) first (from [docs/FEATURE_LIST_TDD.md](docs/FEATURE_LIST_TDD.md) acceptance criteria). Implement until tests pass, then refactor. Do not merge without tests.
- **Bug fixes:** Add or update a test that reproduces the bug, then fix. Merge only when the test passes.
- **Refactors / behavior changes:** Ensure existing tests still pass; add tests for new or changed behavior before changing code.

See **[docs/FEATURE_LIST_TDD.md](docs/FEATURE_LIST_TDD.md)** for the full policy, feature list, acceptance criteria, and test levels (U/I/E). For how to run and add tests, see **[docs/TESTING.md](docs/TESTING.md)**.

## Before you push

1. Run tests: `npm run test`
2. Run lint: `npm run lint`
3. Run build: `npm run build`

Fix any failures before pushing. CI runs the same steps and must pass before merge.

## CI

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push and pull requests to `main`/`master`:

- `npm ci` → `npm run test` → `npm run lint` → `npm run build`

A red CI blocks integration. Keep tests green.
