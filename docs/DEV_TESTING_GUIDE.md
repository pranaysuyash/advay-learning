# Developer Testing Guide 🔧

This short guide explains the recommended local test and visual verification workflow for the frontend.

## Unit tests
- Run unit tests from the frontend package to avoid Playwright e2e files being picked up:
  - cd src/frontend && npx vitest --run
- A root-level `vitest.config.ts` is present to allow `npx vitest --run` from the repo root and excludes `**/e2e/**`.

## Build
- Build the frontend (verifies TypeScript and bundling):
  - cd src/frontend && npm run build

## Playwright visual checks (screenshots)
- Ensure a dev server is running (Vite). If the server picks another port, pass it to Playwright via `PLAYWRIGHT_BASE_URL`.
  - Example: PLAYWRIGHT_BASE_URL=http://localhost:6174 npx playwright test e2e/ui_screenshots_after.spec.ts --project=chromium
- The repo has `e2e/ui_screenshots.spec.ts` ("before") and `e2e/ui_screenshots_after.spec.ts` ("after") to capture target pages.
- New: `e2e/ui_visual.spec.ts` contains Playwright visual snapshot tests that compare rendered pages to stored snapshots. To record or update snapshots run:
  - `PLAYWRIGHT_BASE_URL=http://localhost:6173 npx playwright test e2e/ui_visual.spec.ts --update-snapshots --project=chromium`

## CI recommendations
- Add a CI job to:
  1. Run unit tests (Vitest) with `vite`/`npm`
  2. Build the frontend (`npm run build`)
  3. Optionally run Playwright snapshot tests (headless) and fail on diffs
- Keep Playwright visuals in a dedicated step so unit tests remain fast; use `--project=chromium` and a fixed `PLAYWRIGHT_BASE_URL` when running in CI.

## Notes on current repo state
- Root `vitest.config.ts` added to exclude `**/e2e/**` so running `npx vitest --run` at the repo root does not import Playwright tests.
- Follow-up cleanup ticket created in `docs/WORKLOG_TICKETS.md` to sweep remaining faint border usages and improve visual test coverage.

---

If you want, I can also add a small `.github/workflows/ci.yml` proposal file (no CI runs locally) or run the Playwright screenshots now — but I won't run anything unless you say so.