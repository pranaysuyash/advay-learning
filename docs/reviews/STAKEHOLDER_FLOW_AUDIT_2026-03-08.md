# Stakeholder Flow Audit: Advay Vision Learning

Date: 2026-03-08
Repo: `/Users/pranay/Projects/learning_for_kids`
Primary angle: UX flows
Secondary angles: Reliability / ops, Feature completeness

## 1) Executive Summary

- `Observed`: The app is locally runnable on frontend `http://localhost:6173` and backend `http://localhost:8001`.
- `Observed`: The top-of-funnel demo promise is broken. Clicking `Try The Magic` from Home sets `demoMode` but still routes into the protected `/games` flow and lands on `/login`.
- `Observed`: Parent registration silently drops learner-profile creation. The UI calls `POST /users/me/profiles` immediately after registration, but the user is not authenticated yet, so the call returns `401` and the form still proceeds to login.
- `Observed`: Authenticated subscription lookup is crashing in production-like runtime, not just failing gracefully. `GET /api/v1/subscriptions/current` returns `500 Internal Server Error` for the documented test account.
- `Observed`: Child game access is coupled to authenticated subscription checks. Guest/demo users and regular users affected by the subscription endpoint failure are both blocked by premium gates before gameplay starts.
- `Observed`: The current automated tests do not cover the failing `/subscriptions/current` path or the actual Home CTA navigation outcome.
- `Inferred`: Multiple stakeholder journeys are currently non-completable without manual workarounds:
  - marketing/demo visitor
  - newly registered parent
  - returning subscribed parent
  - child trying to start a game through either guest or signed-in flows

## 2) Repo Reality Map

- Structure:
  - Frontend: React + Vite app under `src/frontend/src`
  - Backend: FastAPI app under `src/backend/app`
  - Shared process/docs: `AGENTS.md`, `prompts/`, `docs/WORKLOG_ADDENDUM_*.md`
- Entrypoints:
  - Frontend: `src/frontend/src/main.tsx` -> `src/frontend/src/App.tsx`
  - Backend: `src/backend/app/main.py`
- Current run path:
  - `Observed`: `lsof -i :6173` showed a Node process listening on port `6173`
  - `Observed`: `lsof -i :8001` showed Python processes listening on port `8001`
  - `Observed`: Vite proxy targets backend `http://localhost:8001` via `src/frontend/vite.config.js`

## 3) Stakeholder Journeys

### Flow A: Demo / Marketing Visitor

Goal:
- Land on Home
- Click `Try The Magic`
- Start a child-safe trial flow without account friction

Observed runtime:
- Home renders with tutorial overlay first.
- After dismissing onboarding, clicking `Try The Magic` redirected to `/login`, not to a playable demo.
- `console` also showed repeated `401` calls to `/api/v1/auth/me` and `/api/v1/auth/refresh` during the bounce.

Relevant code:
- `src/frontend/src/pages/Home.tsx:95-99`

### Flow B: New Parent Registration

Goal:
- Create parent account
- Optionally create learner profile during signup
- Reach first-login state with clear next step

Observed runtime:
- Registration succeeded and redirected to `/login?registered=true`.
- The page attempted learner-profile creation immediately after registration.
- The profile call returned `401 Unauthorized`.
- The only user-facing signal was the login redirect; the learner-profile failure was console-only.

Relevant code:
- `src/frontend/src/pages/Register.tsx:53-71`
- `src/backend/tests/test_profiles.py:29-35`

### Flow C: Returning Parent

Goal:
- Log in
- Reach dashboard with subscription, profiles, progress, and settings intact

Observed runtime:
- Logging in as `testquarterly@example.com` / `TestPass123!` succeeded.
- Dashboard then made `GET /api/v1/subscriptions/current` and got `500`.
- Curl reproduced the failure with a backend traceback:
  - `TypeError: can't subtract offset-naive and offset-aware datetimes`

Relevant code:
- `src/backend/app/api/v1/endpoints/subscriptions.py:446-480`

### Flow D: Child Starts a Game

Goal:
- Enter a game from Dashboard or Games
- Reach playable screen

Observed runtime:
- Signed-in account path: starting `Alphabet Tracing` showed a premium lock screen.
- Guest path: `Try as Guest` on login did reach dashboard, but starting `Alphabet Tracing` still showed a premium lock screen.
- Guest game check called `/subscriptions/current?user_id=guest-...`, got `401`, then the game treated the guest user as unsubscribed and blocked play.

Relevant code:
- `src/frontend/src/hooks/useSubscription.ts:15-38`
- `src/frontend/src/services/subscriptionApi.ts:69-118`
- `src/frontend/src/pages/AlphabetGame.tsx:131-145`
- `src/frontend/src/components/ui/AccessDenied.tsx:13-16`

## 4) Findings

### F-001 Demo CTA routes into auth instead of a playable demo (Severity: High)

What it is:
- The Home page advertises a no-friction demo, but `startDemo()` only sets `demoMode` and then navigates to `/games`, which is protected by `ProtectedRoute`.

Evidence:
- `Observed`:
  - File anchor: `src/frontend/src/pages/Home.tsx:95-99`
  - Runtime: `Try The Magic` -> `/login`
  - Browser snapshot showed `/login` immediately after clicking the CTA.
- `Observed`:
  - Home test covers only state mutation, not the actual routed outcome:
  - `src/frontend/src/pages/__tests__/Home.test.tsx:35-59`

Why it matters:
- The main acquisition/demo path is non-functional.
- Parent or investor trying the app from the landing page hits auth friction immediately.

Recommendations:
- Fix approach A:
  - Convert `Try The Magic` into a real guest bootstrap:
  - create guest auth state before navigating, or route to a public demo shell instead of protected `/games`
  - likely files: `src/frontend/src/pages/Home.tsx`, `src/frontend/src/components/ui/ProtectedRoute.tsx`, guest/bootstrap flow
- Fix approach B:
  - Route the CTA to `/login` intentionally and rename the button/copy so the promise matches behavior

Acceptance criteria:
- Clicking `Try The Magic` reaches a playable demo path without requiring login.
- A browser test asserts URL and visible playable state, not just store mutation.

### F-002 Registration silently loses learner profile creation (Severity: High)

What it is:
- The register flow tries to create a learner profile immediately after `register()`, but registration does not authenticate the user. The backend profile endpoint requires auth, so learner-profile creation fails with `401`.

Evidence:
- `Observed`:
  - File anchor: `src/frontend/src/pages/Register.tsx:53-71`
  - Runtime console: `Failed to create child profile: AxiosError: Request failed with status code 401`
  - Network: `POST /api/v1/users/me/profiles => 401 Unauthorized`
- `Observed`:
  - Backend tests explicitly require auth for profile creation:
  - `src/backend/tests/test_profiles.py:29-35`

Why it matters:
- Parent believes setup is complete, but dashboard/progress later show no learner profiles.
- The app loses the high-intent onboarding data it just asked the parent to enter.

Recommendations:
- Fix approach A:
  - Defer learner-profile creation until verified login/authenticated session
  - preserve child form data locally and resume after login
- Fix approach B:
  - Change signup UX copy so the form clearly creates only the parent account first
  - move learner-profile setup into post-login onboarding

Acceptance criteria:
- A parent-created learner profile either exists after first successful authenticated entry or the UI explicitly states it has not been created yet.
- Registration flow includes a tested success path for learner-profile persistence.

### F-003 Subscription status endpoint crashes for signed-in users (Severity: Critical)

What it is:
- The backend subscription status endpoint subtracts timezone-aware `datetime.now(timezone.utc)` from a naive `subscription.end_date`, causing a runtime `TypeError`.

Evidence:
- `Observed`:
  - File anchor: `src/backend/app/api/v1/endpoints/subscriptions.py:464`
  - Curl:
    - login `POST /api/v1/auth/login => 200`
    - `GET /api/v1/subscriptions/current => 500`
  - Error body:
    - `can't subtract offset-naive and offset-aware datetimes`
- `Observed`:
  - Frontend runtime also logs `Failed to fetch subscription status: HTTP 500: can't subtract offset-naive and offset-aware datetimes`

Why it matters:
- Returning paid users cannot reliably load subscription state.
- Game access, dashboard upsell/state, and pricing-related UX all become misleading or broken.

Recommendations:
- Fix approach A:
  - normalize subscription datetimes to timezone-aware UTC at the model/service boundary
  - keep endpoint arithmetic fully aware-aware
- Fix approach B:
  - if DB currently stores naive timestamps, normalize before subtraction inside the endpoint as an immediate guard

Acceptance criteria:
- `GET /api/v1/subscriptions/current` returns `200` for seeded subscription users.
- Backend tests cover the current-status endpoint with realistic subscription timestamps.
- No frontend runtime `500` occurs on dashboard/game load for subscribed users.

### F-004 Game access logic blocks guest/demo and masks backend failures as “premium” (Severity: Critical)

What it is:
- Subscription gating is treated as mandatory for gameplay, even for guest/demo users.
- The frontend subscription service passes `user_id` in the query string, but the backend endpoint authorizes via cookies and ignores that query param.
- Any API error is treated as “no subscription,” which then renders a premium lock screen.

Evidence:
- `Observed`:
  - Hook logic:
  - `src/frontend/src/hooks/useSubscription.ts:22-33` and `:40-52`
- `Observed`:
  - API wrapper:
  - `src/frontend/src/services/subscriptionApi.ts:69-118`
- `Observed`:
  - Game gate:
  - `src/frontend/src/pages/AlphabetGame.tsx:131-145`
- `Observed`:
  - Guest runtime:
    - `GET /api/v1/subscriptions/current?user_id=guest-... => 401`
    - console: `Failed to fetch subscription status: HTTP 401: No refresh token provided`
    - result: premium lock screen instead of demo gameplay
- `Inferred`:
  - Signed-in users also see the same lockout pattern whenever subscription lookup fails, because `api_error` collapses into `hasActiveSubscription: false`.

Why it matters:
- The app’s child-facing core action, “start a game,” is blocked in both guest and degraded signed-in cases.
- It also misclassifies backend outages as entitlement failures, which erodes trust.

Recommendations:
- Fix approach A:
  - explicitly bypass subscription gating for guest/demo sessions
  - likely files: `useSubscription`, game-access wrappers, guest auth logic
- Fix approach B:
  - distinguish `api_error` from `no_subscription`
  - show recoverable error state on game entry instead of premium paywall
- Fix approach C:
  - align frontend and backend contracts for current-subscription lookup
  - remove unused `user_id` query coupling if backend is cookie-auth only

Acceptance criteria:
- Guest/demo users can open at least the promised demo games without authenticated subscription cookies.
- Subscription API failures produce a recoverable error state, not a misleading premium wall.
- Browser tests cover guest game launch and signed-in degraded subscription behavior.

## 5) Cross-cutting Risks

- `Observed`: The landing page and mascot path trigger speech-synthesis errors on first load:
  - console shows `Speech synthesis error: not-allowed`
  - likely source: auto-speaking TTS path before user gesture
- `Observed`: Test coverage is skewed toward purchase/webhook flows. `tests/test_subscriptions.py` does not cover `GET /subscriptions/current`.
- `Observed`: Home CTA tests validate `demoMode` state only; they do not assert routed reachability.
- `Inferred`: Current test strategy is not catching flow regressions that emerge only when frontend and backend contracts are exercised together.

## 6) Suggested Next Work Units

### Work Unit 1: Repair demo/guest entry

- In-scope:
  - Home CTA
  - guest bootstrap
  - protected-route interaction
  - one playable demo game
- Out-of-scope:
  - subscription refactor for paid users
- Why now:
  - this is the top-of-funnel breakage
- Acceptance criteria:
  - `Try The Magic` reaches playable guest flow
  - guest can launch at least one game
  - Playwright coverage added for the journey

### Work Unit 2: Fix subscription current endpoint + degrade gracefully

- In-scope:
  - backend `/subscriptions/current`
  - frontend subscription error handling
  - game access behavior on API failure
- Out-of-scope:
  - payment provider integration changes
- Why now:
  - this currently blocks signed-in game access
- Acceptance criteria:
  - endpoint returns `200` for seeded subscription user
  - failed lookup shows recoverable state, not premium wall
  - backend and frontend tests cover the case

### Work Unit 3: Rebuild post-registration onboarding truthfully

- In-scope:
  - register flow
  - learner-profile creation timing
  - first-login handoff
- Out-of-scope:
  - email-service provider changes
- Why now:
  - parent setup currently loses data silently
- Acceptance criteria:
  - learner profile survives the onboarding journey or the UI clearly states the deferred step
  - tests cover the selected onboarding contract

## 7) Appendix: Evidence Log

Commands run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
lsof -i :6173 -P -n
lsof -i :8001 -P -n
sed -n '1,260p' src/frontend/src/App.tsx
sed -n '1,260p' src/backend/app/main.py
cd src/backend && uv run pytest -q tests/test_auth.py tests/test_profiles.py tests/test_subscriptions.py
cd src/frontend && npm run -s test -- src/services/subscriptionApi.test.ts src/components/__tests__/GameShell.test.ts src/pages/__tests__/Home.test.tsx
curl -sS -c cookies.txt -b cookies.txt -X POST http://localhost:8001/api/v1/auth/login ...
curl -sS -c cookies.txt -b cookies.txt http://localhost:8001/api/v1/subscriptions/current
```

Key outputs:

```text
Frontend listening on :6173
Backend listening on :8001
50 backend tests passed
11 targeted frontend tests passed
GET /api/v1/subscriptions/current => 500
TypeError: can't subtract offset-naive and offset-aware datetimes
POST /api/v1/users/me/profiles => 401 after register
GET /api/v1/subscriptions/current?user_id=guest-... => 401 for guest gameplay
```

Browser-observed pages:

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/games`
- `/progress`
- `/settings`
- `/games/alphabet-tracing`

Files reviewed:

- `src/frontend/src/pages/Home.tsx`
- `src/frontend/src/pages/Register.tsx`
- `src/frontend/src/pages/Login.tsx`
- `src/frontend/src/pages/Dashboard.tsx`
- `src/frontend/src/pages/Games.tsx`
- `src/frontend/src/pages/Progress.tsx`
- `src/frontend/src/pages/Settings.tsx`
- `src/frontend/src/pages/AlphabetGame.tsx`
- `src/frontend/src/hooks/useSubscription.ts`
- `src/frontend/src/services/subscriptionApi.ts`
- `src/frontend/src/services/api.ts`
- `src/frontend/src/components/ui/ProtectedRoute.tsx`
- `src/frontend/src/components/ui/AccessDenied.tsx`
- `src/backend/app/api/v1/endpoints/subscriptions.py`
- `src/backend/tests/test_auth.py`
- `src/backend/tests/test_profiles.py`
- `src/backend/tests/test_subscriptions.py`
- `src/frontend/src/pages/__tests__/Home.test.tsx`
- `src/frontend/src/services/subscriptionApi.test.ts`
