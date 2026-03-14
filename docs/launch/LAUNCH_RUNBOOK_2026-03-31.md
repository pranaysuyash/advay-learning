# March 31, 2026 Launch Runbook

## Scope
Public beta launch. Free access during beta only. Parent trust surfaces, consent, export/delete flows, and first-party analytics are in scope.
Local AI runtimes (Kokoro/Whisper/Transformers.js) are enabled by default for launch builds; set `VITE_BETA_LOCAL_AI_ENABLED=false` if you need to build without them (e.g., smaller download footprint for a constrained environment).
3D game routes are enabled by default for launch builds; set `VITE_BETA_3D_GAMES_ENABLED=false` to disable them.

Supporting references:
- `docs/launch/SUPPORTED_DEVICE_MATRIX_2026-03-12.md`
- `docs/launch/BETA_GAME_INVENTORY_2026-03-12.md`

## Required secrets
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PORT`
- `DEPLOY_PATH`
- `DEPLOY_SSH_KEY`
- `UPTIME_URL`
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `RESEND_API_KEY`
- `SENTRY_DSN`

## Pre-launch checklist
- Confirm `RESEND_API_KEY` is present in the backend runtime environment and `EMAIL_FROM`, `FRONTEND_URL`, `BACKEND_URL`, and `SUPPORT_EMAIL` are set in production.
- Confirm `BETA_FREE_ACCESS=true` and `CHILD_PHOTO_UPLOADS_ENABLED=false` in production.
- Confirm `ALLOWED_ORIGINS` matches the production frontend origin exactly.
- Confirm the full public beta roster in `docs/launch/BETA_GAME_INVENTORY_2026-03-12.md` still matches the shipped route set. `src/frontend/src/config/betaGames.ts` should remain empty unless a route must be deliberately held back again.
- Run backend tests and frontend tests locally.
- Run `FRONTEND_URL=<staging-frontend> BACKEND_URL=<staging-backend> ./scripts/check-uptime.sh` against staging.
- Trigger `.github/workflows/db-backup.yml` once manually and verify the backup lands on the server.

## Deploy order
1. Push the release commit to `main`.
2. Wait for backend/frontend/docker jobs in `.github/workflows/deploy.yml` to pass.
3. Confirm the deploy job succeeds and runs `scripts/deploy-remote.sh`.
4. Validate frontend `/` and backend `/health` using `FRONTEND_URL=<prod-frontend> BACKEND_URL=<prod-backend> ./scripts/post-deploy-smoke.sh`.
5. Verify login, create child profile, consent, first game launch, export, and settings deletion controls manually.

## Smoke test path
- Home page loads with beta messaging.
- Register account.
- Verify email.
- Login.
- Create child profile.
- Complete parental consent.
- Launch a game.
- Confirm progress persists.
- Export data from Settings.

## Rollback triggers
- `/health` fails after deploy.
- Login, consent, or export flow broken.
- Unexpected blocking subscription gates during beta.
- Severe client-side errors reported in Sentry.

## Rollback path
1. SSH to the production host.
2. `cd "$DEPLOY_PATH"`
3. Restore the previous image tags or previous compose revision.
4. `docker compose up -d --remove-orphans`
5. If a database rollback is required, restore from the latest verified dump with `./scripts/restore-db.sh <dump>`.
6. Re-run `FRONTEND_URL=<prod-frontend> BACKEND_URL=<prod-backend> ./scripts/post-deploy-smoke.sh`.

## Launch-day ownership
- Deploy owner: founder
- Support inbox: `support@advay.app`
- Error monitoring: Sentry project for backend + frontend
- Uptime monitoring: `.github/workflows/uptime-monitor.yml`
