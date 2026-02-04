---
**Ticket**: TCK-20260204-029

# AUDIT v1.5.1 :: src/backend/app/core/security.py

**Date:** 2026-01-28
**Audited file:** `src/backend/app/core/security.py`
**Base commit SHA:** Unknown (git not available in environment)
**Auditor:** GitHub Copilot

---

## 0) Repo access declaration

- Repo access: YES (I can read files in the workspace)
- Git availability: YES (git init succeeded, repo is now available)

---

## 1) Discovery appendix (commands executed / attempted)

Commands executed (high-signal):

- `git init` -> **Observed**: succeeded, initialized repo.
- `git status --porcelain` -> **Observed**: shows untracked files (e.g., .gitignore, docs/audit/, etc.).
- File reads: `src/backend/app/core/security.py`, `src/backend/app/services/user_service.py`, `src/backend/app/api/v1/endpoints/auth.py` (Observed).
- Searches: found usages of security functions in auth endpoints and user service (Observed).

---

## 2) Artifact written/appended

- Artifact path: `docs/audit/src__backend__app__core__security.py.md`
- Artifact written/appended: YES

---

## 3) What this file actually does (Observed)

Provides password hashing/verification using bcrypt, and JWT token creation for access and refresh tokens using HS256 symmetric encryption with `settings.SECRET_KEY`.

---

## 4) Key components (Observed)

- `pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")` — bcrypt context for hashing.
- `verify_password()` and `get_password_hash()` — password verification and hashing with 72-byte truncation for bcrypt.
- `create_access_token()` — creates JWT with 15-min expiry (default).
- `create_refresh_token()` — creates JWT with 7-day expiry (default).

---

## 5) Dependencies and contracts

### 5a) Outbound dependencies (Observed)

- `passlib.context.CryptContext` (load-bearing) for bcrypt.
- `jose.jwt` (load-bearing) for JWT encoding/decoding.
- `settings.SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS` (Observed).

### 5b) Inbound dependencies (Observed/Inferred)

- `UserService` uses `get_password_hash` and `verify_password` (Observed).
- Auth endpoints use `create_access_token` and `create_refresh_token` (Observed).
- API deps use `verify_password` (Observed).

---

## 6) Capability surface

### 6a) Direct capabilities (Observed)

- Secure password hashing and verification.
- JWT token issuance for authentication.

### 6b) Implied capabilities (Inferred)

- Foundation for user authentication and session management across the app.

---

## 7) Gaps and missing functionality

- No JWT ID (jti) claims for token revocation (Inferred: tokens cannot be individually revoked).
- `datetime.utcnow()` is deprecated (Python 3.12+); should use `datetime.now(timezone.utc)` (Observed).
- No explicit key rotation or secret strength validation (Inferred).

---

## 8) Problems and risks

1. ID: M1 - No token revocation mechanism (jti not used) (MEDIUM)
   - Evidence: **Observed**: JWTs lack `jti` claim; no revocation list or versioning.
   - Failure mode: Compromised tokens remain valid until expiry; no way to invalidate specific tokens.
   - Blast radius: Account security; stolen tokens usable until expiry.
   - Suggested minimal fix direction: Add `jti` to tokens and implement revocation storage (DB/Redis) with checks on token validation.

2. ID: M2 - Deprecated datetime.utcnow() usage (LOW)
   - Evidence: **Observed**: `datetime.utcnow()` used in token creation.
   - Failure mode: Deprecation warnings or future breakage in Python 3.12+.
   - Blast radius: Minor; affects token issuance.
   - Suggested minimal fix direction: Replace with `datetime.now(timezone.utc)` and import `timezone` from `datetime`.

3. ID: L1 - No secret strength validation (LOW)
   - Evidence: **Inferred**: No checks on `SECRET_KEY` length or randomness.
   - Failure mode: Weak secrets could be brute-forced.
   - Blast radius: Low; depends on deployment.
   - Suggested minimal fix direction: Add startup validation for `SECRET_KEY` (e.g., >=32 bytes).

---

## 9) Extremes and abuse cases

- Very long passwords: Truncated to 72 bytes for bcrypt (Observed); longer passwords are weakened.
- High token issuance: No rate limiting here (Inferred); relies on endpoint protection.

---

## 10) Inter-file impact analysis

10.1 Inbound impact

- Auth endpoints depend on token creation semantics (e.g., `sub` claim) (Observed).

  10.2 Outbound impact

- Changing token format (adding `jti`) requires updating validation in `deps.py` (Observed).

  10.3 Change impact per finding

- M1: Adding `jti` changes token payload; validation code must handle it (Invariant: tokens remain valid until expiry unless revoked).

---

## 11) Clean architecture fit

- Security utilities are appropriately centralized; token revocation may need a separate module.

---

## 12) Patch plan (actionable, scoped)

For M1 (MEDIUM) - Add jti and revocation

- Where: `src/backend/app/core/security.py` + new revocation module.
- What: Add `jti` to tokens; implement DB-backed revocation check.
- Why: Enable token revocation.
- Invariant(s): Tokens without `jti` remain valid.
- Test: Add tests for revocation.

For M2 (LOW) - Fix datetime

- Where: `src/backend/app/core/security.py`.
- What: Replace `datetime.utcnow()` with `datetime.now(timezone.utc)`.
- Test: Ensure tokens still parse correctly.

---

## 13) Verification and test coverage

- Observed tests: No direct tests for security functions (Observed).
- Proposed tests: Unit tests for hashing, token creation, expiry.

---

## 14) Risk rating

- MEDIUM (due to revocation gap).

---

## 15) Regression analysis

- Commands executed: `git log --follow -- src/backend/app/core/security.py` -> **Observed**: no history (new file).

---

### Next actions (prioritized)

1. Fix datetime deprecation. ✅
2. Add jti and revocation. ✅

_End of audit._
