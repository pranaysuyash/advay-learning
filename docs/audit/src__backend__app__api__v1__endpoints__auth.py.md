# AUDIT v1.5.1 :: src/backend/app/api/v1/endpoints/auth.py

**Date:** 2026-01-28
**Audited file:** `src/backend/app/api/v1/endpoints/auth.py`
**Base commit SHA:** Unknown (git not available in environment)
**Auditor:** GitHub Copilot

---

## 0) Repo access declaration

- Repo access: YES (I can read files in the workspace)
- Git availability: NO (attempted git commands failed: "fatal: not a git repository (or any of the parent directories): .git")

All git-derived conclusions are therefore **Unknown**.

---

## 1) Discovery appendix (commands executed / attempted)

Commands executed (high-signal):

- `git rev-parse --is-inside-work-tree` -> **Observed**: failed (not a git repo)
- File reads: `src/backend/app/api/v1/endpoints/auth.py`, `src/backend/app/core/security.py`, `src/backend/app/services/user_service.py`, `src/backend/app/db/models/user.py`, `src/backend/tests/test_auth.py`, `src/backend/tests/conftest.py` (Observed)
- Searches: looked for rate-limiting and brute-force protections (no implementation found) (Observed)

---

## 2) Artifact written/appended

- Artifact path: `docs/audit/src__backend__app__api__v1__endpoints__auth.py.md`
- Artifact written/appended: YES

---

## 3) What this file actually does (Observed)

Provides authentication endpoints under `/auth`: `POST /register` to create users, `POST /login` to authenticate and return JWT access/refresh tokens, and `POST /refresh` to exchange a refresh token for new tokens. It uses `UserService` for user CRUD/authentication and `app.core.security` helpers for hashing and token generation.

---

## 4) Key components (Observed)

- `register(user_in: UserCreate)` — checks email uniqueness with `UserService.get_by_email`, creates user with `UserService.create`, returns `User` model (response_model=User).
- `login(form_data: OAuth2PasswordRequestForm)` — authenticates with `UserService.authenticate`, returns `Token` response with `access_token` and `refresh_token`.
- `refresh_token(refresh_token: str)` — decodes `refresh_token` using `jose.jwt` and `settings.SECRET_KEY`, verifies user exists and is active, and issues new tokens.

---

## 5) Dependencies and contracts

### 5a) Outbound dependencies (Observed)

- `UserService` (load-bearing): `get_by_email`, `create`, `authenticate`, `get_by_id`.
- `app.core.security.create_access_token` and `create_refresh_token` (Observed): use `settings.SECRET_KEY` and expiry settings.
- `jose.jwt` (Observed) for token encoding/decoding.

### 5b) Inbound dependencies (Observed/Inferred)

- Tests in `src/backend/tests/test_auth.py` call these endpoints and assert specific behaviors (Observed).
- Other parts of the API depend on token semantics (e.g., `TokenPayload.sub` usage) (Inferred).

---

## 6) Capability surface

### 6a) Direct capabilities (Observed)

- User registration (creates persisted user) and basic validation for duplicate emails.
- Authentication with JWT access and refresh tokens.
- Refresh exchange to rotate tokens.

### 6b) Implied capabilities (Inferred)

- Tokens are the primary bearer auth used across the API; correctness here affects authorization across the system.

---

## 7) Gaps and missing functionality

- No explicit `status_code=201` on `register` (Observed). Tests expect 201 (Observed in `tests/test_auth.py`), so the route should explicitly declare `status_code=201` to make contract deterministic.
- No rate-limiting/brute-force protection around authentication endpoints (Observed: search found no limiter). (Inferred: may be implemented elsewhere, but not found.)
- Token refresh does not appear to implement revocation or rotation safeguards (Inferred): old refresh tokens remain valid unless revoked elsewhere.
- `refresh_token` endpoint accepts raw `refresh_token: str` — no explicit request schema or validation model (Observed).
- The `register` duplicate-email error message (`"Email already registered"`) does not match the test's expected substring (`"already exists"`) — inconsistent (Observed).

---

## 8) Problems and risks

1. ID: M1 - No rate limiting / brute-force protection on auth endpoints (MEDIUM)
   - Evidence: **Observed**: No code related to rate limiting or login attempt throttling was found in repository searches.
   - Failure mode: Attackers could attempt credential stuffing or brute-force attacks on `/login` or abuse `/register` to enumerate or create accounts.
   - Blast radius: User accounts and credential security; could lead to account takeovers or DoS on auth resources.
   - Suggested minimal fix direction: Add rate-limiting middleware for auth endpoints (e.g., per-IP and per-account thresholds) and add tests to verify limits are enforced. If a third-party service is preferred (e.g., Cloudflare, API gateway), document integration points and add feature flags.

2. ID: M2 - Token revocation and refresh rotation not implemented (MEDIUM)
   - Evidence: **Observed/Inferred**: `refresh_token` returns a new refresh token but no database-backed revocation or rotating token versioning is present in this file or clearly elsewhere.
   - Failure mode: Stolen refresh tokens remain valid until expiry; refresh token replay attacks are possible if rotation/invalidation is not enforced.
   - Blast radius: Compromised accounts remain at risk for up to refresh token TTL (default 7 days).
   - Suggested minimal fix direction: Implement refresh token revocation/rotation (store refresh token identifier/version in DB and update it on refresh, or maintain a revocation list). Add tests to ensure old tokens are invalidated.

3. ID: M3 - Inconsistent test expectation and error message for duplicate registration (MEDIUM)
   - Evidence: **Observed**: Route raises `HTTPException` with detail `"Email already registered"` while `tests/test_auth.py` asserts `"already exists"` in the error detail.
   - Failure mode: Tests could be brittle or failing depending on exact error text; this reduces confidence in test suite.
   - Blast radius: CI test failures and contributor confusion.
   - Suggested minimal fix direction: Make the error message and tests consistent; prefer either a generic message in the API or update the test to match the canonical message. Better: use a constant or helper for commonly asserted messages to avoid divergence.

4. ID: L1 - `refresh_token` accepts raw string and lacks explicit request schema (LOW)
   - Evidence: **Observed**: `async def refresh_token(refresh_token: str, ...)` will accept a JSON body `{ "refresh_token": "..." }` but we have no Pydantic schema to validate or provide clearer docs.
   - Failure mode: Client confusion, harder to evolve contract if a Pydantic model is not used.
   - Suggested minimal fix direction: Add a `TokenRefreshRequest` schema with a single `refresh_token: str` field and use it as the request body model.

5. ID: L2 - No tests for refresh endpoint and edge cases (LOW/MED)
   - Evidence: **Observed**: No tests for `/refresh` endpoint found in test suite (search yielded none).
   - Failure mode: Regression in refresh behavior may go unnoticed.
   - Suggested minimal fix direction: Add tests covering successful refresh, invalid token, and expired token cases.

---

## 9) Extremes and abuse cases

- High-frequency login attempts: Without rate limiting, this could be used to brute-force passwords or stress the DB (Observed).
- Token replay: If refresh rotation isn't implemented, stolen tokens can be replayed until expiry (Inferred).
- Enumeration via register: returning `Email already registered` allows attackers to test for account existence (Observed). Consider returning a non-enumerating response or rate-limiting registration attempts.

---

## 10) Inter-file impact analysis

10.1 Inbound impact

- Tests and any caller code expect `register` to behave in a particular way and expect a 201 on success (Observed). Changing status codes or messages without updating tests will break CI.
- Token semantics (claims, expirations) need to be preserved as callers rely on `TokenPayload.sub` to find user IDs (Inferred).

  10.2 Outbound impact

- Implementing refresh token revocation will require DB/redis storage and could affect scalability; callers that assume stateless refresh tokens may need to handle revocation errors (Inferred).

  10.3 Change impact per finding

- M1 (rate limiting): Adding rate limiting won't break clients but may require exception handling for 429 responses — tests should be added to lock expected behavior.
- M2 (refresh rotation): Changing to rotating refresh tokens changes token lifecycle; tests must lock post-fix invariants (e.g., old token invalid after refresh).

---

## 11) Clean architecture fit

- Business logic (user creation/auth) resides in `UserService` which is good separation. Auth endpoints are correctly thin; heavier concerns (rate limiting, token revocation storage) may belong to separate modules or middleware.

---

## 12) Patch plan (actionable, scoped)

For M1 (MEDIUM) - Add rate limiting to auth endpoints

- Where: Implement middleware or decorate `auth` router endpoints (e.g., `src/backend/app/api/v1/endpoints/auth.py` or a dedicated rate limiter middleware module).
- What: Add per-IP and per-account rate limits (e.g., 5 login attempts per minute per IP, 10 per hour per account). Add tests to simulate excessive requests and assert 429 responses.
- Why: Prevent brute-force and enumeration abuse.
- Invariant(s): Auth endpoint paths remain the same; responses in normal flows are unchanged; excessive requests return 429.
- Test: `tests/test_auth_rate_limit.py::test_login_rate_limit` — simulate repeated failed logins and assert 429 after threshold.

For M2 (MEDIUM) - Implement refresh token rotation/revocation

- Where: Add storage for refresh tokens (DB table or Redis) and update `create_refresh_token()` to include a token identifier (jti) claim or version; update `refresh` endpoint to mark old refresh tokens invalid.
- What: Require store/lookup at refresh time; handle invalid/used tokens with 401.
- Why: Prevent replay of stolen refresh tokens.
- Invariant(s): After successful refresh, previous refresh token becomes invalid; access tokens generated remain valid until expiry.
- Test: `tests/test_refresh_rotation.py::test_refresh_rotates_and_invalidates_old_token` and `test_refresh_fails_with_reused_token`.

For M3 (MEDIUM) - Fix test/message inconsistency

- Where: `src/backend/app/api/v1/endpoints/auth.py` and `src/backend/tests/test_auth.py`.
- What: Decide on canonical error text for duplicate registration. Either adjust test to assert status code and generic presence of `detail`, or change API to return the expected text. Prefer constant message in a central place to avoid divergence.
- Why: Ensure tests are deterministic and meaningful.
- Test: Existing `test_register_duplicate_email` should be updated to assert the canonical text.

For L1/L2 (LOW) - Request schema and tests for `/refresh`

- Where: `src/backend/app/api/v1/endpoints/auth.py` + `src/backend/app/schemas/token.py` + tests folder.
- What: Add `TokenRefreshRequest` Pydantic model and replace raw `str` parameter with typed body. Add tests for refresh success, invalid, expired.
- Test: `tests/test_auth_refresh.py` with cases for valid token, invalid token, expired token.

---

## 13) Verification and test coverage

- Tests exist covering register and login success + failure (Observed) (`tests/test_auth.py`).
- Missing tests: `/refresh` endpoint and rate-limiting; duplicate message/content assertion inconsistency exists and should be fixed (Observed/Inferred).

---

## 14) Risk rating

- MEDIUM
  - Why at least MEDIUM: Authentication endpoints are security-critical; missing rate-limits and refresh token revocation can lead to account compromise and should be prioritized.
  - Why not HIGH: No immediate evidence of critical crypto misuse; standard JWT usage and bcrypt are in place. Mitigations are localized.

---

## 15) Regression analysis

- Could not run git history commands: **Unknown** (git not available). Recommended commands if git is enabled: `git log --follow -- src/backend/app/api/v1/endpoints/auth.py`, `git blame -- src/backend/app/api/v1/endpoints/auth.py`.

---

### Next actions (prioritized)

1. Add tests for `/refresh` behavior (success, invalid, expired). ✅
2. Make `/register` explicitly return `status_code=201` and reconcile error message vs tests. ✅
3. Implement rate-limiting for auth endpoints and add tests. ✅
4. Plan for refresh token revocation/rotation and implement storage + tests. ✅

_End of audit._
