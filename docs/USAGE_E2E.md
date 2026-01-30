# Running E2E tests locally (Playwright)

This project runs E2E tests locally (offline) using Playwright. Follow these steps:

Prereqs:

- Ensure the repo venv is configured and activated using `uv` (see AGENTS.md / setup.sh)
- Node and npm installed for frontend (Node 18 recommended)

Steps:

1. Activate venv:

```bash
. .venv/bin/activate
```

2. Install backend dev deps (if not installed):

```bash
uv pip install -e '.[dev]'
```

3. Ensure frontend deps installed and Playwright browsers present:

```bash
cd src/frontend
npm ci
npx playwright install --with-deps
```

4. Run the e2e script (it will start backend & frontend if necessary, wait for health, run tests, then teardown):

```bash
# The script will detect running services and skip starting them if present
bash scripts/run-e2e.sh
# Or run Playwright directly against existing services:
cd src/frontend && npx playwright test --config=playwright.config.ts
```

Notes:

- The script detects and _skips_ starting backend/frontend if they are already running (it will not stop processes it did not start).
- The script uses the repo `.venv` and `uv` to start the backend when needed to match local dev patterns.
- If you need to run tests headful for debugging, set `HEADLESS=false` in env when invoking Playwright via `npx playwright test`.
- The Playwright tests are scaffolded and may need to be extended to handle real auth flows; see `src/frontend/e2e/offline_sync.spec.ts` for the initial flow.
