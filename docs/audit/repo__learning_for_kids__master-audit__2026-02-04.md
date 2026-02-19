# Master Audit (Full Repo) - learning_for_kids

**Ticket:** TCK-20260204-003
**Date:** 2026-02-04
**Repo:** learning_for_kids
**Base:** main@6537dbd6c32c482238562aaa3ef4b17b6d9b5959
**Prompt:** `prompts/audit/master-audit-agent-v1.0.md`

---

## Evidence Discipline

This report separates:

- **Observed**: Verified from repository files and command outputs.
- **Inferred**: Logical interpretation based on observed evidence.
- **Unknown**: Cannot be determined without running services, inspecting secrets, or real device testing.

Where this report references external best practices and standards, links are provided in the **Research Appendix**.

---

# PASS 1 — Comprehension Only (No Recommendations)

## A) Repo Inventory + Coverage Plan

### Top-level directories (Observed)

- `src/`: application code (backend + frontend + shared)
- `docs/`: extensive documentation, plans, audits, research
- `prompts/`: agent prompts (audit/remediation/hardening/etc.)
- `scripts/`: helper scripts (e2e runners, gates)
- `tests/`: non-backend test artifacts (in addition to `src/backend/tests` and `src/frontend/*test*`)

### Entrypoints (Observed)

- **Frontend**:
  - `src/frontend/src/main.tsx` mounts the React app.
  - `src/frontend/src/App.tsx` defines routes and `ProtectedRoute` boundaries.
  - `src/frontend/vite.config.ts` exists (build/dev proxy configuration).
- **Backend**:
  - `src/backend/app/main.py` is the FastAPI entrypoint.
  - `src/backend/app/api/v1/api.py` wires routers: `/auth`, `/users`, `/progress`.
- **Root Python CLI placeholder**:
  - `src/main.py` prints a placeholder message and references directories; it is not a runnable app shell.

### Build / deploy / environment configs (Observed)

- Root python metadata: `pyproject.toml` (declares `requires-python = ">=3.13"`).
- Backend python metadata: `src/backend/pyproject.toml`.
- Frontend node metadata: `src/frontend/package.json`.
- Test DB config: `src/backend/.env.test` uses PostgreSQL `advay_learning_test`.

### Coverage strategy (Observed + Inferred)

- **Observed**: `rg --files | wc -l` reports ~847 tracked files (respects `.gitignore`, so `node_modules/` is excluded).
- **Plan**:
  - Deep-read: entrypoints, routing, auth, progress storage/queueing, game surfaces, camera hooks, core docs: `README.md`, `docs/ARCHITECTURE.md`, `docs/security/SECURITY.md`, `docs/INPUT_METHODS_SPECIFICATION.md`.
  - Skim: small UI components, style helpers, snapshot-only content.
  - Exclude: generated build output and vendored dependencies.

**Skipped/Excluded areas (Observed)**:

- `src/frontend/node_modules/`, `src/frontend/dist/`, caches (`.ruff_cache`, `.pytest_cache`, etc.).

## B) Product Behavior Reconstruction

### What it is today (Observed)

- A web app with:
  - **Parent auth** (register/login/logout/refresh, cookie-based auth).
  - **Parent dashboard** (progress summaries; current analytics emphasis is Alphabet Tracing-centric).
  - Multiple games under `/games/*` routes:
    - Alphabet Tracing (`/games/alphabet-tracing`)
    - Finger Number Show (`/games/finger-number-show`)
    - Connect The Dots (`/games/connect-the-dots`)
    - Letter Hunt (`/games/letter-hunt`)
  - A CV test surface: `/test/mediapipe`.

### Key flows (Observed)

#### Flow: Parent authentication

User -> React auth pages -> FastAPI `/api/v1/auth/*` -> DB.

- Frontend uses axios with `withCredentials: true` in `src/frontend/src/services/api.ts`.
- Backend sets cookies in `src/backend/app/api/v1/endpoints/auth.py`.

#### Flow: Progress tracking

Game event -> local store/queue -> API -> DB -> Dashboard.

- Backend progress endpoints exist:
  - `GET /api/v1/progress/?profile_id=...`
  - `POST /api/v1/progress/?profile_id=...`
  - `POST /api/v1/progress/batch` supports idempotency key dedupe.
- Dashboard currently computes many stats from a client-side `progressStore` (Alphabet-focused).

#### Flow: Camera + input methods

Camera permission -> MediaPipe inference -> gesture mapping -> game interaction.

- Input method specification enumerates 6 input methods and statuses in `docs/INPUT_METHODS_SPECIFICATION.md`.
- Phase 1 completion claims added camera feature detection + permission prompting components in `docs/PHASE_1_COMPLETION.md`.

### Core entities / data model sketch (Inferred)

- **User** (parent): email/password, verification fields.
- **Profile** (child): owned by parent user.
- **Progress**: keyed by profile, activity_type/content_id, optionally deduped by idempotency key.

### Notable documentation mismatch (Observed)

- `docs/security/SECURITY.md` describes local-only storage (SQLite) and no PII.
- `README.md` and `docs/SETUP.md` describe PostgreSQL and a web deployment model.
- `src/backend/.env.test` confirms PostgreSQL is used in tests.

---

# PASS 2 — Audit + External Research + Roadmap

## 1) Executive Summary (Condensed)

### What it is now (Observed)

A React + FastAPI learning app aimed at kids 2–8 with camera-driven interactions via MediaPipe, with parent accounts, child profiles, progress endpoints, and several games.

### What it aims to become (Observed + Inferred)

- A camera-first, mobile-friendly learning platform with multiple input methods (camera gestures + touch fallback) and a richer parent dashboard powered by unified analytics across all games.

### Top 5 risks (Inferred; evidence-backed below)

1. **Docs and system reality drift** (storage model, environment requirements, security posture).
2. **Test environment fragility** (backend tests assume DB exists; errors are easy to hit).
3. **Auth/product contract drift** (registration response model and enumeration behavior require coherent frontend + tests + docs).
4. **Camera/permission UX inconsistency across games** (needs consistent gate + fallbacks in all game routes).
5. **Analytics architecture incompleteness** (tracking is still Alphabet-centric; TODOs indicate missing multi-game tracking).

### Top 5 leverage opportunities (Inferred; evidence-backed below)

1. Standardize tracking pipeline: event schema -> local queue -> batch endpoint -> dashboard insights.
2. Unify camera permission + feature detection wrappers around all games.
3. Reduce repo drift by reconciling “local-first” vs “web backend” in a single canonical architecture doc.
4. Strengthen auth + account protections aligned with modern guidance and test them deterministically.
5. Make setup reproducible: one command to boot DB + run tests locally.

---

## 2) Product & Architecture Overview

### Components and boundaries (Observed)

- Frontend (`src/frontend`): React (React Router), Zustand stores, MediaPipe tasks, per-game pages.
- Backend (`src/backend`): FastAPI routers for auth/users/progress, SQLAlchemy models/services.
- DB: PostgreSQL (Observed in setup docs and `.env.test`).

### Deployment model (Inferred)

- Dev: Vite on `5173`, FastAPI on `8001` (Observed in README and docs).
- Prod: likely similar separation or reverse-proxy; exact deployment strategy is not fully specified (Unknown).

---

## 3) Audit Findings

Format per finding:

- **ID**: category-number
- **Severity**: Blocker/High/Med/Low
- **Confidence**: High/Med/Low
- **Evidence**: repo anchors
- **Impact**: user/business/ops
- **Recommendation**: concrete action
- **Effort/Risk**: S/M/L; rollout risk

### FINDINGS

#### ARCH-001 — Conflicting storage model docs (SQLite vs PostgreSQL)

- Severity: High
- Confidence: High
- Evidence:
  - `docs/security/SECURITY.md` claims local SQLite and local-only posture.
  - `README.md` and `docs/SETUP.md` require PostgreSQL.
  - `src/backend/.env.test` uses PostgreSQL `advay_learning_test`.
- Impact:
  - Misleads contributors and future agents; increases security and privacy mistakes (wrong assumptions about threat surface).
- Recommendation:
  - Pick a single canonical statement of record: “web app w/ backend + Postgres” vs “local-only app w/ SQLite”. Update `docs/ARCHITECTURE.md` and `docs/security/SECURITY.md` to match.
- Effort/Risk: M / Low (docs-only, but must be careful about stated privacy posture).

#### DEVEX-001 — Node version requirements inconsistent across docs

- Severity: Med
- Confidence: High
- Evidence:
  - `README.md`: Node.js 18+
  - `docs/SETUP.md`: Node.js 24+
  - `src/frontend/package.json`: engines `node >=24.0.0`
- Impact:
  - Onboarding failures and CI inconsistencies; increases time-to-first-run.
- Recommendation:
  - Standardize on one version range; update README/setup/engines together.
- Effort/Risk: S / Low

#### TEST-001 — Backend test suite fails without explicit DB creation

- Severity: High
- Confidence: High
- Evidence:
  - `src/backend/.env.test` points to `advay_learning_test`.
  - Running pytest can error with “database does not exist” if DB isn’t created (Observed in local runs).
- Impact:
  - Breaks developer confidence; discourages running tests; increases regression risk.
- Recommendation:
  - Provide a test bootstrap script to create the test DB (or use ephemeral DB in CI/local).
  - Update `docs/SETUP.md` and `docs/project-management/TESTING.md` accordingly.
- Effort/Risk: M / Med (DB bootstrap changes can affect CI).

#### SEC-001 — Password policy uses composition rules (may conflict with modern guidance)

- Severity: Med
- Confidence: Med
- Evidence:
  - `src/backend/app/schemas/user.py` enforces upper/lower/digit/special and includes a common-password denylist.
- Impact:
  - Composition rules can decrease usability and lead to predictable patterns.
- Recommendation:
  - Consider aligning with NIST 800-63B guidance (length + breached password checks; avoid overly rigid composition rules).
- Effort/Risk: M / Med (user-facing behavior change).

#### SEC-002 — Account lockout implementation is in-memory

- Severity: Med
- Confidence: High
- Evidence:
  - `src/backend/app/services/account_lockout_service.py` stores lockouts in a class-level dict.
- Impact:
  - Lockout resets on restart; doesn’t work across multiple backend instances; harder to reason about abuse.
- Recommendation:
  - Persist lockout state (e.g., Redis) and add observability/metrics for lockouts.
- Effort/Risk: M / Med

#### AUTH-001 — Registration contract likely needs harmonization across frontend/tests

- Severity: High
- Confidence: High
- Evidence:
  - Backend register endpoint exists in `src/backend/app/api/v1/endpoints/auth.py`.
  - Frontend registration uses `authApi.register` in `src/frontend/src/services/api.ts`.
  - Tests reference `/api/v1/auth/register` in `src/backend/tests/*`.
- Impact:
  - If register response shape differs from prior expectations, it can break clients/tests and cause inconsistent UX.
- Recommendation:
  - Decide on the API contract: either return a minimal message or a full User model; update frontend + tests together.
- Effort/Risk: S–M / Med

#### ANALYTICS-001 — Unified analytics tracking still incomplete

- Severity: Med
- Confidence: High
- Evidence:
  - `docs/audit/ANALYTICS_RESEARCH_COMPLETE_2026-01-31.md` shows 1/4 games tracked and explicitly calls out missing games.
  - `src/frontend/src/pages/Dashboard.tsx` contains a TODO to replace with unified tracking.
  - Backend progress supports `activity_type` and `meta_data`, plus a batch endpoint (`src/backend/app/api/v1/endpoints/progress.py`).
- Impact:
  - Parent dashboard insights remain shallow; product iteration slower; learning outcomes harder to measure.
- Recommendation:
  - Ship a single event schema per game and push through the batch endpoint with idempotency.
- Effort/Risk: L / Med

#### UX-001 — Permission flow needs consistent enforcement at route boundaries

- Severity: Med
- Confidence: Med
- Evidence:
  - `docs/PHASE_1_COMPLETION.md` claims new permission gating components and fallbacks.
  - `src/frontend/src/App.tsx` routes to games directly; consistency depends on per-page behavior.
- Impact:
  - Users can hit confusing dead ends on devices without camera support or denied permissions.
- Recommendation:
  - Standardize an app-level wrapper for camera-required routes with graceful fallback.
- Effort/Risk: M / Med

---

## 4) Prioritized Roadmap

### 0–2 weeks: “stabilize”

1. **Docs Reality Alignment** (Owner: Tech Lead)
   - Goal: remove contradictions (storage model, node version, privacy posture).
   - Dependencies: none.
   - Acceptance criteria:
     - `README.md`, `docs/ARCHITECTURE.md`, `docs/security/SECURITY.md`, `docs/SETUP.md` agree on DB, env, and threat model.

2. **Test DB Bootstrap** (Owner: Backend Engineer)
   - Goal: make `pytest` runnable with one command.
   - Dependencies: PostgreSQL install.
   - Acceptance criteria:
     - `make test`/script creates `advay_learning_test` if missing and runs backend tests.

3. **Auth Contract Freeze** (Owner: Backend + Frontend)
   - Goal: lock and test `/auth/register` and related flows.
   - Dependencies: register endpoint contract choice.
   - Acceptance criteria:
     - Frontend register UX and backend tests agree on response shape/status.

### 2–6 weeks: “build leverage”

1. **Unified Analytics Event Schema + Ingestion** (Owner: Product Eng)
   - Goal: track all games with a shared schema and per-game extensions.
   - Dependencies: event schema decision; profile_id available in game contexts.
   - Acceptance criteria:
     - Each game emits events via the progress batch endpoint with idempotency keys.
     - Dashboard shows cross-game metrics (literacy/numeracy/motor/engagement).

2. **Camera Permission + Feature Detection Standardization** (Owner: Frontend)
   - Goal: every camera-first route has a consistent permission UX and touch fallback.
   - Dependencies: shared wrapper components.
   - Acceptance criteria:
     - All `/games/*` routes share the same camera gating behavior.

### 6–12 weeks: “scale and polish”

1. **Stronger Security Posture for Production Deployments** (Owner: Security/Infra)
   - Goal: align with OWASP guidance (session handling, rate limits, account protections, secret management).
   - Dependencies: deployment model choice.
   - Acceptance criteria:
     - Documented threat model matches runtime config and CI checks exist.

2. **Device Lab / Cross-Device QA** (Owner: QA)
   - Goal: validate camera + touch across real devices.
   - Dependencies: stable permission flows.
   - Acceptance criteria:
     - A repeatable test matrix exists for iOS/Android/Desktop.

---

## 5) Research Appendix (Primary Sources + Comparables)

### Standards and best-practice references

- JWT (RFC 7519): <https://www.rfc-editor.org/rfc/rfc7519>
- HTTP cookies (RFC 6265): <https://www.rfc-editor.org/rfc/rfc6265>
- MDN SameSite cookies: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#samesite_attribute>
- OWASP ASVS (Application Security Verification Standard): <https://owasp.org/www-project-application-security-verification-standard/>
- FTC COPPA Rule (children’s privacy in the US): <https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa>
- MDN getUserMedia: <https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia>
- W3C Permissions Policy: <https://www.w3.org/TR/permissions-policy-1/>

### Notes on how research influences recommendations (Inferred)

- Cookie/session guidance and OWASP verification practices inform the auth + contract-freeze + rate limiting roadmap.
- COPPA/children’s privacy guidance informs the urgency of reconciling privacy posture docs with the actual deployment model.
