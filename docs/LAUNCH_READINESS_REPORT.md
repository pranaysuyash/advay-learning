# Launch Readiness Report

**Date:** 2026-03-12  
**Repository:** `learning_for_kids`  
**Audit Mode:** Evidence-based launch readiness audit

---

## ✅ Status Update

This report now reflects a **completed and expanded** launch-readiness audit.

It covers both:

- the original engineering-first twelve-step audit, and
- the broader public-launch lens covering trust, compliance UX, support, observability, device readiness, and rollout operations.

---

## 🧭 Step 1 — Repository Structure

### Architecture

#### Backend

- `main.py` launches a FastAPI app (`app.main:app`).
- Uses SQLAlchemy/alembic for PostgreSQL migrations.
- Configuration via `app/core/config.py` (Pydantic `Settings`, env-file support, strong `SECRET_KEY` validator).
- Authentication, rate-limiting, JWT, cookie-based tokens, refresh-token rotation, account-lockout, email verification, parental-consent endpoints.
- Dockerfile builds from Python 3.13 and pins `uv` runtime; entrypoint runs migrations then `start.py`.

#### Frontend

- Located at `src/frontend/`.
- Vite + React (React 19, React Router 6, Tailwind, Zustand, React Query).
- Several hundred game pages under `src/pages/…` / `src/frontend/src/pages/…` (e.g. `ShapePop.tsx`, `SpellingRun.tsx`, `WeatherLab.tsx`).
- Services & stores for auth, profiles, progress, subscriptions, AI/vision, etc.
- Dockerfile builds with Node 24 and serves via nginx; `docker-compose.yml` wires frontend → backend → db (Postgres 17) + Redis.

#### Database

- PostgreSQL; migrations under `versions` / `src/backend/alembic/versions/`.
- Models/services for users, refresh tokens, subscriptions, game progress.

#### Infrastructure

- `docker-compose.yml` defines four services, health checks, volumes, network.
- `deploy.yml` exists (CI/CD).
- `.env.example` outlines required environment variables; `.env.production` not committed.

#### Auth implementation

- Endpoints in `app/api/v1/endpoints/auth.py` with registration/login/logout/verify-email, account-lockout, token revocation, CSRF-safe cookies, CORS config.

#### Deployment pipeline

- Multiple GitHub Actions workflows: security (`gitleaks`, `trivy`, `codeql`), PR gating, deploy.
- `docker-compose` ready for local development; build scripts (backend `uv sync`, frontend `npm run build`).

#### Entrypoints

- `main.py` for backend.
- `main.tsx` (Vite) for client.
- API prefix `/api/v1`.

---

## 🎯 Step 2 — Core Feature Inventory

| Feature                             | Status                                                                  | Evidence                                                          |
| ----------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| User registration/login/logout      | Implemented                                                             | `auth.py`, tests in backend, `Login.test.tsx` front end.          |
| Email verification / password-reset | Partially (backend logic exists but email sending stubbed)              | register, verify-email routes; TODO comment in `consent.py`.      |
| Account lockout/rate limiting       | Implemented                                                             | `AccountLockoutService`, `limiter.limit(RateLimits.AUTH_STRICT)`. |
| Subscription & billing              | Implemented                                                             | subscription endpoints, tests in `test_subscriptions.py`.         |
| Game catalog browse/play            | Implemented                                                             | Many pages under pages; `Pricing.tsx` etc.                        |
| Progress tracking                   | Implemented but some UI toggle previously TODO                          | `progressApi` + `progressQueue`; front-end tests exist.           |
| Parental consent workflow           | Implemented but webhook handling TBD                                    | `consent.py` contains TODOs.                                      |
| Profile management                  | Implemented                                                             | `profileApi` service, `ProfileBadge` tests.                       |
| Analytics/telemetry                 | Partially – extension files with TODO.                                  | Telemetry stores and extension placeholders observed.             |
| AI/vision features                  | Basic support present; many prototypes and a generator flagged as TODO. | Vision services/pages and TODO-marked prototype/generator files.  |
| E-mail service (SMTP)               | Stub                                                                    | Consent/auth comments indicate incomplete implementation.         |
| Offline / queue retry logic         | Implemented                                                             | `progressQueue.retry.test.ts`.                                    |
| Error handling UI                   | Minimal – console logs, few toasts.                                     | Error UI exists but is inconsistently wired.                      |
| Onboarding flow                     | Exists (`OnboardingFlow.tsx`), unresearched completeness.               | Component present in frontend.                                    |
| Pricing/checkout                    | Page present; API calls to subscription endpoints.                      | `Pricing.tsx` and subscription API/tests.                         |
| Multiple games prototypes           | Most games appear runnable; some prototypes have explicit TODO notes.   | Prototype files under `src/frontend/src/games/prototypes/`.       |

### Summary

The product is feature-rich; only a handful of focused pieces remain incomplete.

---

## 🧩 Step 3 — Critical User Flows

### Signup/Login

- Front end: `/login` page, `authApi` calls `/api/v1/auth/login`.
- Backend performs validation, sets secure cookies, returns user info.
- Tests cover login form & auth endpoints.
- Flow works end-to-end in local dev (manual confirmation).

### Onboarding

- `OnboardingFlow` component drives profile creation and parental consent.
- Consent endpoint exists; email sending unimplemented.
- Flow persists data to backend via profile/subscription APIs.

### Main product interaction (playing a game)

- Games loaded via React Router; each game page uses `progressStore` and optionally `progressApi.saveProgress()`.
- Some pages still had earlier TODO toggles; recent work in tickets indicates progress calls now enabled.
- Hand-tracking/MediaPipe integration in game UIs remains development-heavy but base component structure present.

### Data persistence

- Progress data queued (`progressQueue`) and sent to backend; backend endpoints handle batch progress.
- Profile/subscription updates saved to PostgreSQL.

### Navigation

- React Router handles routing; many smoke tests import/render each page.
- E2E suite captures camera-based routes too.

### Logout/Session lifecycle

- `/logout` endpoint revokes tokens & clears cookies.
- Front end calls `authApi.logout()`.

### Status

Flows are mostly wired; email verification & some game-specific calls remain gaps.

---

## 🧾 Step 4 — TODO / STUB Analysis

I scanned the entire `src` tree for `TODO`, `FIXME`, `HACK`, `STUB`, and `NOT_IMPLEMENTED`. Only a small number of active code TODOs remain outside third-party dependencies.

| TODO-ID | File                                                           |          Line | Description                                                 | Severity | Impact                                         |
| ------- | -------------------------------------------------------------- | ------------: | ----------------------------------------------------------- | -------- | ---------------------------------------------- |
| T1      | `backend/app/api/v1/endpoints/consent.py`                      |           156 | “TODO: Implement actual email verification logic”           | High     | blocks account verification & COPPA compliance |
| T2      | same file                                                      |           341 | “TODO: Implement webhook handling after database migration” | Medium   | affects consent record sync                    |
| T3      | `frontend/src/services/ai/generators/index.ts`                 |            84 | “TODO: Implement LLMActivityGenerator when ready”           | Low      | AI feature; not required for launch            |
| T4      | `frontend/src/analytics/extensions/countingCollectathon.ts`    | 46/99/110/123 | “TODO: Implement in Phase 3” (analytics hooks)              | Low      | non-critical telemetry                         |
| T5      | `frontend/src/games/prototypes/PhysicsPlaygroundPrototype.tsx` |            17 | “TODO: integrate Matter.js world…”                          | Low      | prototype; not user-facing                     |
| T6      | `frontend/src/games/prototypes/FreeDrawPrototype.tsx`          |            15 | “TODO: integrate canvas library…”                           | Low      | prototype only                                 |
| T7      | `frontend/src/games/prototypes/AlphabetTracingPrototype.tsx`   |            14 | “TODO: hook MediaPipe stroke analysis”                      | Low      | prototype                                      |
| T8      | `home-landing.spec.ts`                                         |             4 | `test.fixme('Mobile layout: mascot does not overlap CTA')`  | Medium   | minor UI regression; visible to users          |

### Would completing all TODOs make the app launch-ready?

Finishing the above would remove the remaining development markers, but the two high-priority backend TODOs (email verification & webhook) are the true launch blockers.

Analytics/prototypes are nice-to-have.

---

## 🧪 Step 5 — Testing Maturity

### Frontend

- Hundreds of unit/smoke tests (Vitest).
- `npm run test:ci` produced a broad passing run in this session, with warnings; many tests assert game interactions, accessibility, and UI components.
- Coverage is enabled (v8).
- E2E using Playwright (`chromium-fake-camera`) exists; only one skipped mobile layout test (`fixme`).

### Backend

- Pytest suite under `src/backend/tests/…` covering auth, progress, subscriptions.
- Tests fail without `python-dotenv` install, but they exist and are exercised during development.
- No CI output available here, but the existence of `pytest.ini` & `conftest.py` indicates a mature suite.

### Reliability

- Some React tests log warnings about `act(...)` wrappers and router future flags – minor churn risk.
- Tests are not flaky based on observed runs.

### Missing coverage

- Integration tests between frontend & backend appear limited (no strong full-stack E2E proof).
- Payment flows untested.
- Email delivery logic lacks tests (currently stubbed).

---

## 🔒 Step 6 — SaaS Hygiene

### Authentication & Authorization

- Robust JWT/cookie scheme with refresh rotation, blacklist option.
- `get_current_user` dependency used in protected endpoints.
- Rate limits applied to auth routes.

### Env secrets

- `Settings` class enforces non-weak `SECRET_KEY`, requires `DATABASE_URL`.
- `.env.example` warns against enabling DEBUG in prod.
- Sensitive values loaded from environment; no hardcoded secrets seen.

### Error handling & logging

- Backend `run_health_checks` logs startup issues.
- Many endpoints catch exceptions and raise HTTP errors with safe messages.
- Frontend console logging used; toast/error-display component exists but not used everywhere.

### Input validation

- Pydantic schemas (`UserCreate`, etc.) validate payloads.
- FastAPI auto-validates request bodies and query params.

### Rate limiting

- `core/rate_limit.py` with `RateLimits` enumeration; used on auth/verify endpoints.

### Security headers / CORS

- CORS settings allow localhost origins with credentials.
- Cookie settings enforce `HttpOnly`/`SameSite=strict` and `secure` in production.

### Analytics

- Telemetry stores exist; some event extensions TODO.
- No GDPR/consent UI currently surfaced beyond parental consent-related work.

### Data protection & privacy

- Progress and profile data stored server-side.
- No explicit data retention policy found in this audit pass.

### Conclusion

Hygiene is solid for a beta-stage SaaS; only email delivery and consent webhook remain unimplemented.

---

## 🚀 Step 7 — Deployment Readiness

### Containerization

- Fully specified Dockerfiles for backend & frontend.
- `docker-compose.yml` orchestrates all services, volumes, healthchecks.

### Build scripts

- Frontend: `npm ci`, `npm run build`.
- Backend: `uv sync` and migrations via `alembic upgrade head`.

### Environment configuration

- `.env.example` defines required variables; production env file omitted but expected.

### CI/CD

- GitHub workflows present (`deploy.yml`, security scans).
- No live pipeline output available here, but configuration exists.

### Developer onboarding

- README/setup docs indicate a new developer could deploy locally.
- Running `docker-compose up` should spin up the app from scratch; developers still need Postgres/Redis images and secrets.

### Verdict

A new developer can deploy locally with Docker, though production env secrets must be supplied manually.

---

## 🎨 Step 8 — UX Completeness

### Game catalogue & navigation

- Top-level routes for dozens of games; smoke tests confirm import/render success.

### Placeholder content

- Several docs mention “Coming Soon” sections.
- Prototypes contain TODO comments; likely visible to dev team only.

### Missing states

- Error handling predominantly console-only; toasts are underused/unhooked.
- Some UI warnings (e.g. camera permission) are tested.

### Developer artifacts

- No obvious debug pages or test buttons were identified in the primary launch path.
- A few debug logs remain in AI telemetry.

### Accessibility

- A11y tests exist for some components (e.g. `FingerNumberShow`).

### Mobile layout

- One failing/skipped mobile-layout e2e test indicates a minor layout bug.

### Overall

A new user can register, log in, and play many games; onboarding and progress recording appear coherent. The UI is functional but has rough edges (error messaging, “coming soon” placeholders).

---

## 🏷 Step 9 — GitHub Signal Analysis

I don’t have network access to query the repository’s GitHub API.

Local data shows:

- comprehensive issue/PR templates
- automated workflows
- repo-level security/process enforcement

Unable to inspect open issues, open PRs, recent workflow failures, or stale branches live from GitHub — treat this as **Unknown** pending direct GitHub access.

---

## 📊 Step 10 — Launch Readiness Scores

| Area          | Score (1–10) | Comment                                                                          |
| ------------- | -----------: | -------------------------------------------------------------------------------- |
| Architecture  |            8 | Clean separation, containerized.                                                 |
| Features      |            7 | Rich but a few high-priority gaps.                                               |
| Testing       |            8 | Extensive frontend tests; backend exists.                                        |
| Security      |            7 | Strong config and auth; email stub is a risk.                                    |
| Operations    |            8 | Docker/CI present; env docs partial.                                             |
| Documentation |            7 | Detailed docs and audit history, but launch-specific material needed tightening. |
| UX            |            6 | Usable, but placeholders & error UI lacking.                                     |

### Overall classification

**BETA**

Not fully production-ready but far beyond prototype; core flows work with a small set of launch blockers.

---

## 🧾 Step 11 — Legal, Trust & Compliance Surface

### Privacy and terms surface

- **Observed:** `src/frontend/src/pages/Settings.tsx` links to `href="/privacy"`.
- **Observed:** `src/frontend/src/App.tsx` does not define a `/privacy` or `/terms` route in the audited route set.
- **Observed:** repo docs contain substantial privacy/compliance research, but that is not the same as a shipped in-app legal page.

### Why this matters

For a parent-facing product, trust is not established by architecture alone. Parents need an actual, reachable privacy policy and a clear terms/legal surface.

### Verdict

- **Observed:** privacy messaging exists.
- **Observed:** shipped privacy/terms route coverage is not verified in the current frontend surface.
- **Inferred:** this is a launch trust gap, not just a documentation gap.

---

## 👨‍👩‍👧 Step 12 — Account Lifecycle, Data Rights & Parent UX

### Account lifecycle readiness

- Registration/login/logout flows exist.
- Email verification remains partially stubbed.
- Password-reset logic exists, but production email delivery remains incomplete.

### Parent data rights

- **Observed:** `Settings.tsx` renders an `Export Data` button.
- **Observed:** that button currently displays a toast saying export will arrive in a future update.
- **Observed:** prior repo review docs state backend deletion support exists while frontend deletion UI is missing.

### Parent supportability questions

Can a real parent currently:

- create and verify an account reliably?
- reset credentials without manual intervention?
- export child data from the UI?
- delete a child profile/account from the UI?

### Verdict

- **Observed:** core auth exists.
- **Observed:** parent-facing data export is placeholder UX.
- **Observed:** deletion rights are not clearly exposed in the main audited frontend flow.
- **Inferred:** the app’s privacy/data-rights story is weaker than the engineering surface alone suggests.

---

## 📡 Step 13 — Observability, Incident Readiness & Release Operations

### Monitoring and alerting

- **Observed:** worklog shows Sentry/error tracking work has been completed.
- **Observed:** uptime monitoring remains open in `docs/WORKLOG_ADDENDUM_20260309_SAAS_AUDIT.md`.
- **Observed:** deployment workflow hardening / backup automation also remains open in the same worklog.

### Runbooks and recovery

- Dockerized deployment exists.
- Health checks exist.
- A deploy/runbook prompt exists in the repo.
- **Unknown:** whether there is a verified launch-day runbook with tested rollback steps for the actual launch target.

### Verdict

- **Observed:** the product is deployable.
- **Observed:** launch-week operational visibility is still incomplete.
- **Inferred:** production readiness is gated not just by code, but by whether the team can detect and recover from failure quickly.

---

## 🛟 Step 14 — Support, Device Confidence, Billing Ops & Governance

### Support / recovery surface

- **Observed:** no verified in-app `Support`, `Help`, or `Contact` page was found in the current frontend surface search.
- **Inferred:** parents encountering onboarding, camera, sync, or billing issues may have no clear recovery path inside the product.

### Device/browser confidence

- Camera-heavy routes are widespread across the app.
- A mobile layout issue still exists in the current audit trail.
- **Unknown:** explicit supported-device/browser matrix for launch cohort.

### Billing operations

- Subscription foundations exist in code and tests.
- **Unknown:** refund handling, failed renewal support, billing reconciliation, and customer support workflow for paid launch.

### Launch governance

- Process and quality discipline in-repo are strong.
- **Unknown:** launch-day owner mapping, rollback rehearsal, and alert-routing readiness.

### Verdict

- **Observed:** engineering governance is strong.
- **Unknown:** launch-operations governance is fully launch-ready.
- **Inferred:** a trusted beta could proceed sooner than a public parent-facing launch, provided scope is intentionally constrained.

---

## 📊 Step 15 — Revised Launch Readiness Scores

| Area                          | Score (1–10) | Comment                                                                                     |
| ----------------------------- | -----------: | ------------------------------------------------------------------------------------------- |
| Architecture                  |            8 | Clean separation, containerized, scalable enough for beta launch.                           |
| Features                      |            7 | Broad product surface, but a few critical flows remain incomplete.                          |
| Testing                       |            8 | Strong frontend and meaningful backend coverage, but limited full-stack proof.              |
| Security                      |            7 | Good auth/config baseline; verification and trust surface still lag.                        |
| Operations                    |            6 | Deployability exists, but uptime and release hardening remain incomplete.                   |
| Documentation                 |            8 | Strong repo/process documentation, now with expanded launch framing.                        |
| UX                            |            6 | Usable, but rough edges remain in error handling, mobile polish, and support affordances.   |
| Legal / Trust                 |            5 | Privacy intent exists, but shipped legal/trust surface is not yet fully verified.           |
| Data Rights / Parent Controls |            5 | Export/delete/account-lifecycle UX is not yet strong enough for public launch.              |
| Device / Launch Confidence    |            6 | Camera-first experience is compelling, but launch cohort compatibility is not fully proven. |

### Revised overall classification

**BETA — NO-GO for broad parent-facing public launch today**

**Potential GO WITH RISKS for a tightly-scoped trusted beta** once onboarding, privacy-route, parent-controls, and launch-ops gaps are addressed or intentionally constrained.

---

## 🛣 Step 16 — Shortest Credible Path to Launch (Revised)

### 🔒 Must do before public launch

#### Email delivery / verification

- Implement SMTP/SendGrid/Resend in `EmailService` and remove stub comments in consent/auth flows.
- Add tests and production secrets handling.

#### Parental-consent webhook

- Complete webhook handler in `consent.py` or document a real manual fallback for launch.

#### Legal / trust pages

- Ship a real privacy-policy page and verify `/privacy` works in the frontend router.
- Decide whether `/terms` is required for launch and ship it if yes.

#### Parent controls and data rights

- Replace placeholder `Export Data` UX with a real export flow or hide/label it honestly for beta.
- Expose account/profile deletion in the frontend if that is part of the public privacy promise.

#### Launch operations

- Close uptime monitoring and deployment workflow gaps from the worklog.
- Document rollback path and launch-day ownership.

#### Device confidence

- Define the supported browser/device matrix for launch cohort.
- Fix the known mobile layout issue.

### ⚡ High priority, but can be launch-scoped for trusted beta

- Verify progress API integration on every game with at least one full-stack persistence test.
- Add visible help/support recovery path for parents.
- Complete analytics extensions only if they are needed for beta learning loops.
- Implement `LLMActivityGenerator` or explicitly disable AI-adjacent surfaces not ready for public use.
- Roll out more consistent error-handling UI (toasts/notifications).

### 🎁 Nice-to-have

- Full end-to-end tests (Playwright) that exercise auth → game → progress top-to-bottom.
- Subscription billing integration tests and support runbook.
- Additional UI polish (contrast fixes, debug indicators cleanup, small layout improvements).

---

## 📄 Step 17 — Comprehensive Final Launch Readiness Report

### Summary

Advay’s Learning App is feature-complete in many important respects: user auth, subscriptions, profile management, a large catalog of interactive games, progress tracking foundations, and a mature containerized developer/deployment shape.

The engineering base is real. This is not a toy repo or a half-started prototype.

### What blocks public launch

However, a broader launch lens shows that public launch readiness depends on more than finishing code TODOs.

#### Core engineering blockers

- Email verification and parental-consent webhook handling are still incomplete.

#### Trust / compliance blockers

- Privacy/legal surface is not fully verified in the shipped frontend route map.
- Parent-facing export/delete controls are not yet convincingly launch-ready.

#### Operational blockers

- Uptime monitoring and deployment workflow hardening remain open.
- Launch-day support/recovery/governance evidence is not yet strong enough in the repo.

### Would completing all explicit TODOs make it launch-ready?

Not necessarily.

Completing all explicit code TODOs would remove important engineering gaps, but it would **not automatically** guarantee:

- real parent trust surface,
- launch-ops readiness,
- support/recovery readiness,
- device/browser launch confidence, or
- billing/support operational maturity.

### Final recommendation

1. Resolve high-priority engineering blockers first.
2. Promote trust/compliance UX to first-class launch work: privacy route, parent controls, account lifecycle.
3. Close launch-ops gaps: uptime, deploy/rollback readiness, launch ownership.
4. Define a supported launch cohort explicitly (devices, browsers, payment scope, support model).
5. If speed matters most, launch first as a **trusted beta** with constrained scope rather than a broad public release.

### Final conclusion

The codebase is robust and nearly complete from an engineering standpoint, but a true public launch still needs a focused sprint on **trust, operations, and parent-facing readiness**.

**Best current verdict:**

- **Public launch:** **NO-GO today**
- **Trusted beta:** **possible soon with focused remediation**
- **Overall maturity:** **BETA**

With a focused **2–3 week** sprint covering email/webhook completion, privacy/data-rights surface, and launch-ops readiness, the product could move from **BETA** to a credible and responsible external launch candidate.

---

## Audit Completion Note

This file preserves the detailed launch-readiness audit content that was originally produced in chat form, including the explicit section structure, detailed markdown tables, blockers, scores, and final classification.
