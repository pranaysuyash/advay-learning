# SaaS Application Hygiene Audit Report

**Project**: Advay Vision Learning  
**Audit Date**: 2026-03-09  
**Auditor**: AI Security Review  
**Ticket**: TCK-20260309-001  
**Scope**: Full SaaS infrastructure audit (security, auth, data safety, billing, operations)

---

## 1. System Overview

### Architecture Summary

| Component | Technology | Status |
|-----------|------------|--------|
| **Frontend** | React 18 + TypeScript + Vite | ✅ Implemented |
| **Backend** | Python 3.13 + FastAPI | ✅ Implemented |
| **Database** | PostgreSQL (asyncpg) | ✅ Implemented |
| **Cache** | Redis (optional) | ⚠️ Optional |
| **Auth** | JWT (HS256) + HttpOnly Cookies | ✅ Implemented |
| **Payments** | DodoPayments | ✅ Implemented |
| **Hosting** | Docker (not fully configured) | ⚠️ Partial |

### Key Files

- Backend Entry: `src/backend/app/main.py`
- Config: `src/backend/app/core/config.py`
- Auth: `src/backend/app/api/v1/endpoints/auth.py`
- Payments: `src/backend/app/services/dodo_payment_service.py`
- Deployment: `.github/workflows/deploy.yml`

### Data Flow

```
Browser (React + MediaPipe) → FastAPI Backend → PostgreSQL
                                    ↓
                              DodoPayments (webhooks)
```

---

## 2. SaaS Hygiene Checklist Results

### A) AUTHENTICATION

| Check | Status | Evidence |
|-------|--------|----------|
| Login/Signup flow | ✅ EXISTS | `auth.py:109-170` (login), `auth.py:81-106` (register) |
| Password security (bcrypt) | ✅ CORRECT | `security.py:20-26` - bcrypt with rounds=12 |
| OAuth support | ❌ MISSING | No OAuth providers configured |
| Session management | ✅ CORRECT | JWT + HttpOnly cookies, `auth.py:42-72` |
| Token expiration | ✅ CORRECT | 15min access, 7 days refresh (`config.py:66-67`) |
| Refresh tokens | ✅ CORRECT | Rotation implemented, `auth.py:279-337` |
| Logout behavior | ✅ CORRECT | Revokes both tokens, `auth.py:173-197` |
| Brute-force protection | ✅ CORRECT | Account lockout service, 5 attempts / 15 min lockout |
| Email verification | ✅ CORRECT | Token-based verification, `auth.py:200-209` |
| Password reset flow | ✅ CORRECT | Token-based reset, `auth.py:237-276` |

**Security Assessment**:

- ✅ Tokens stored in HttpOnly cookies (not localStorage)
- ✅ SameSite=strict for CSRF protection
- ✅ Secure flag in production
- ✅ Account enumeration protection on registration
- ⚠️ **GAP**: In-memory lockout service (not Redis) - will not work across multiple workers/instances

**Questions Answered**:

- Can accounts be hijacked? **No** - Strong password hashing, token rotation, lockout
- Are tokens stored securely? **Yes** - HttpOnly cookies with proper flags
- Is session fixation possible? **No** - New tokens issued on login, old revoked

---

### B) AUTHORIZATION (Access Control)

| Check | Status | Evidence |
|-------|--------|----------|
| Role-based access control | ✅ EXISTS | `permissions.py:11-34` - `require_roles()` |
| Resource ownership validation | ✅ CORRECT | `permissions.py:47-70` - `assert_access()` |
| API permission checks | ✅ CORRECT | All endpoints use `get_current_user` or role checks |
| Frontend-only protection | ❌ N/A | Backend enforces all access |

**Evidence of Proper Authorization**:

- `users.py:58` - Profile ownership check
- `subscriptions.py:518-522` - Subscription ownership check
- `progress.py:42-46` - Profile ownership before progress access
- `games.py:314` - Admin-only game creation with `require_roles([UserRole.ADMIN])`

**No Issues Found** - Authorization is properly implemented on backend.

---

### C) DATA SECURITY

| Check | Status | Evidence |
|-------|--------|----------|
| Secrets in repo | ✅ NONE | `.gitignore` excludes `.env`, `.env.*` |
| Environment variable handling | ✅ CORRECT | Pydantic Settings, validation |
| Database access restrictions | ⚠️ UNKNOWN | Depends on deployment |
| Encryption usage | ⚠️ PARTIAL | Passwords hashed, no field-level encryption |
| HTTPS enforcement | ✅ CORRECT | HSTS header, `security_headers.py:17` |
| CORS configuration | ✅ CORRECT | Validated, no wildcard + credentials in prod |

**Security Headers Present** (`security_headers.py`):

```python
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(self), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**CORS Validation** (`main.py:25-44`):

- ✅ Blocks wildcard + credentials in production
- ✅ Explicit origin list required

**Issues**:

- ⚠️ `.env` file exists locally with `SECRET_KEY=dev-secret-key-not-for-production` - **WEAK KEY**
- ⚠️ No field-level encryption for sensitive data (e.g., child names)

---

### D) USER DATA SAFETY

| Check | Status | Evidence |
|-------|--------|----------|
| Backups | ❌ MISSING | No backup configuration found |
| Data retention | ❌ MISSING | No retention policy implemented |
| Account deletion | ✅ CORRECT | `users.py:104-155` with password verification |
| GDPR export | ✅ CORRECT | `data_export.py` - full data export |
| Soft delete vs hard delete | ⚠️ HARD | Cascade delete on user deletion |
| Migration safety | ✅ CORRECT | Alembic migrations, startup validation |

**Account Deletion Flow** (`users.py:104-155`):

1. Requires password re-authentication
2. Logs deletion with audit trail
3. Cascade deletes profiles, progress, subscriptions
4. Cannot be undone

**GDPR Export** (`data_export.py`):

- ✅ Exports user info, profiles, progress, subscriptions
- ✅ JSON and CSV formats
- ✅ Authenticated endpoint

**Critical Gaps**:

- ❌ **No database backups configured**
- ❌ **No data retention policy**
- ❌ **Hard delete only** - no recovery option

---

### E) BILLING / PAYMENTS

| Check | Status | Evidence |
|-------|--------|----------|
| Payment verification | ✅ CORRECT | Server-side verification via Dodo API |
| Webhook security | ✅ CORRECT | HMAC signature verification, `dodo_payment_service.py:130-191` |
| Duplicate charge protection | ✅ CORRECT | Idempotency on `payment_reference`, `subscription_service.py:147-150` |
| Idempotency | ✅ CORRECT | Webhook deduplication, `subscriptions.py:219-249` |
| Subscription lifecycle | ✅ CORRECT | Create, upgrade, game selection |
| Refund handling | ❌ MISSING | No refund flow implemented |

**Webhook Security** (`dodo_payment_service.py:130-191`):

- ✅ HMAC-SHA256 signature verification
- ✅ Timestamp validation (5 min window) - prevents replay attacks
- ✅ Constant-time comparison
- ⚠️ Diagnostic mode available (test only)

**Payment Flow Security**:

1. Checkout session created server-side (`subscriptions.py:52-92`)
2. Payment verified via Dodo API (`subscriptions.py:95-154`)
3. Webhook processed with signature verification (`subscriptions.py:166-443`)
4. Idempotency on `payment_reference` prevents duplicates

**Issues**:

- ⚠️ `ALLOW_PLACEHOLDER_MODE` could bypass product validation in test
- ❌ No refund handling flow

---

### F) API HYGIENE

| Check | Status | Evidence |
|-------|--------|----------|
| Authentication on endpoints | ✅ CORRECT | All sensitive endpoints require auth |
| Rate limiting | ✅ CORRECT | `rate_limit.py` - slowapi with IP-based limits |
| Input validation | ✅ CORRECT | Pydantic schemas, UUID validation |
| Schema validation | ✅ CORRECT | Pydantic models for all endpoints |
| Error handling | ✅ CORRECT | Custom exceptions, error middleware |
| Pagination | ✅ CORRECT | `games.py:112-142` - page/page_size params |
| Versioning | ✅ CORRECT | `/api/v1/` prefix |

**Rate Limits** (`rate_limit.py`):

| Category | Limit | Purpose |
|----------|-------|---------|
| AUTH_STRICT | 5/min | Login, register |
| AUTH_MEDIUM | 10/min | Password reset, verification |
| API_GENERAL | 100/min | Most operations |
| API_HEAVY | 20/min | Exports, stats |
| PROGRESS_WRITE | 60/min | Game progress saves |

**Open Endpoints** (intentionally public):

- `GET /` - Root info
- `GET /health` - Health check
- `GET /docs`, `/redoc` - API documentation
- `POST /api/v1/auth/register` - Registration
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/subscriptions/webhook` - Payment webhook (signature verified)
- `GET /api/v1/games/` - Game catalog (public)
- `GET /api/v1/games/{id}` - Game details (public)
- `GET /api/v1/games/stats` - Global stats (public)

**All other endpoints require authentication.**

---

### G) ABUSE / ATTACK PROTECTION

| Check | Status | Evidence |
|-------|--------|----------|
| Rate limiting | ✅ CORRECT | IP-based, multiple tiers |
| Bot protection | ⚠️ PARTIAL | Rate limiting only |
| Upload validation | ⚠️ UNKNOWN | Profile photos endpoint exists |
| File size limits | ⚠️ UNKNOWN | Not explicitly checked |
| Content validation | ⚠️ UNKNOWN | Not explicitly checked |

**Profile Photos** (`profile_photos.py`):

- Endpoint exists but validation details need review
- No explicit file size or type validation visible in endpoint

---

### H) OPERATIONS & OBSERVABILITY

| Check | Status | Evidence |
|-------|--------|----------|
| Logging | ✅ CORRECT | Structured logging with structlog |
| Structured logs | ✅ CORRECT | JSON in production, console in dev |
| Monitoring | ❌ MISSING | No APM/monitoring configured |
| Error tracking | ❌ MISSING | No Sentry/error tracking |
| Health checks | ✅ CORRECT | `/health` endpoint with DB check |
| Uptime checks | ❌ MISSING | No uptime monitoring |
| Alerting | ❌ MISSING | No alerting configured |

**Logging Configuration** (`logging_config.py`):

- ✅ Structured logging with structlog
- ✅ JSON output in production
- ✅ ISO timestamps
- ❌ No log aggregation configured

**Health Check** (`health.py`):

- ✅ Database connectivity check
- ✅ Response time metrics
- ⚠️ Only database checked (no Redis, no external services)

**Critical Gaps**:

- ❌ No monitoring/alerting
- ❌ No error tracking (Sentry, etc.)
- ❌ No log aggregation (CloudWatch, Datadog, etc.)

---

### I) DEPLOYMENT SAFETY

| Check | Status | Evidence |
|-------|--------|----------|
| Environment separation | ⚠️ PARTIAL | `.env` vs `.env.production` |
| Dev vs prod configs | ✅ CORRECT | `APP_ENV` controls behavior |
| Secret management | ⚠️ UNKNOWN | Depends on hosting |
| CI/CD pipeline | ⚠️ PARTIAL | GitHub Actions exists but incomplete |
| Migrations on deploy | ✅ CORRECT | `Dockerfile:33` - `alembic upgrade head` |
| Rollback safety | ❌ MISSING | No rollback procedure |

**CI/CD Pipeline** (`deploy.yml`):

- ✅ Backend tests run
- ✅ Frontend tests run
- ✅ Linting enforced
- ⚠️ Docker images pushed to `your-registry/advay-*` (placeholder)
- ❌ Deploy step is placeholder: `echo "Deploying to production..."`

**Docker Configuration** (`Dockerfile`):

- ✅ Runs migrations on startup
- ✅ Production mode flag
- ⚠️ No health check in Dockerfile
- ⚠️ No resource limits

**Critical Gaps**:

- ❌ Deployment not configured (placeholder)
- ❌ No rollback procedure
- ❌ No blue/green or canary deployment

---

### J) USER LIFECYCLE FLOWS

| Flow | Status | Evidence |
|------|--------|----------|
| Signup | ✅ COMPLETE | Register → Email verification → Login |
| Onboarding | ⚠️ UNKNOWN | Frontend flow not audited |
| Login | ✅ COMPLETE | Email + password → JWT cookies |
| Logout | ✅ COMPLETE | Token revocation + cookie clear |
| Password reset | ✅ COMPLETE | Email token → New password |
| Email verification | ✅ COMPLETE | Token verification |
| Account deletion | ✅ COMPLETE | Password verification → Cascade delete |
| Subscription upgrade | ✅ COMPLETE | Prorated credit calculation |
| Subscription downgrade | ❌ MISSING | No downgrade flow |

**Missing Flows**:

- ❌ Subscription downgrade
- ❌ Subscription cancellation
- ❌ Refund request

---

## 3. User Journey Audit

### Journey 1: New User Signup

```
1. POST /api/v1/auth/register
   ✅ Creates unverified user
   ✅ Sends verification email
   ✅ Returns generic message (no enumeration)

2. GET /verify-email?token=xxx
   ✅ Verifies email
   ✅ User can now login

3. POST /api/v1/auth/login
   ✅ Checks email verified
   ✅ Creates JWT + refresh token
   ✅ Sets HttpOnly cookies
```

**Status**: ✅ Complete and secure

---

### Journey 2: Returning User Login

```
1. POST /api/v1/auth/login
   ✅ Account lockout check
   ✅ Password verification (bcrypt)
   ✅ Email verification check
   ✅ Token creation + cookie setting

2. Subsequent requests
   ✅ Token validated from cookie
   ✅ Token blacklist checked
   ✅ User active status checked
```

**Status**: ✅ Complete and secure

---

### Journey 3: User Subscription Upgrade

```
1. POST /api/v1/subscriptions/purchase
   ✅ Creates Dodo checkout session
   ✅ Returns checkout URL

2. User completes payment on Dodo

3. POST /api/v1/subscriptions/webhook
   ✅ Signature verified
   ✅ Idempotency check
   ✅ Subscription created

4. GET /api/v1/subscriptions/payment-success
   ✅ Verifies payment with Dodo API
   ✅ User ID match check
   ✅ Creates subscription
```

**Status**: ✅ Complete and secure

---

### Journey 4: User Data Access

```
1. GET /api/v1/users/me
   ✅ Returns current user info

2. GET /api/v1/users/me/profiles
   ✅ Returns user's child profiles
   ✅ Only owned profiles returned
```

**Status**: ✅ Complete and secure

---

### Journey 5: Account Deletion

```
1. DELETE /api/v1/users/me
   ✅ Requires password re-auth
   ✅ Audit log created
   ✅ Cascade deletes all data
   ✅ Cannot be undone
```

**Status**: ✅ Complete and secure

**Gap**: No data recovery option

---

## 4. Security Red Flags

### CRITICAL Issues

| ID | Issue | Location | Risk |
|----|-------|----------|------|
| **CRIT-001** | Weak SECRET_KEY in local `.env` | `.env:15` | Token forgery possible in dev |

### HIGH Issues

| ID | Issue | Location | Risk |
|----|-------|----------|------|
| **HIGH-001** | In-memory account lockout | `account_lockout_service.py:14-15` | Lockout bypass in multi-worker |
| **HIGH-002** | No database backups | N/A | Data loss risk |
| **HIGH-003** | No monitoring/alerting | N/A | Undetected outages |
| **HIGH-004** | Deployment not configured | `deploy.yml:145-152` | Cannot deploy to production |

### MEDIUM Issues

| ID | Issue | Location | Risk |
|----|-------|----------|------|
| **MED-001** | No OAuth providers | N/A | Limited auth options |
| **MED-002** | No refund flow | N/A | Customer support gap |
| **MED-003** | No subscription cancellation | N/A | Customer support gap |
| **MED-004** | No subscription downgrade | N/A | Customer support gap |
| **MED-005** | ALLOW_PLACEHOLDER_MODE in test | `dodo_payment_service.py:30` | Test-only, but risky if misconfigured |
| **MED-006** | No file upload validation details | `profile_photos.py` | Potential abuse |
| **MED-007** | Hard delete only | `users.py:154` | No data recovery |

---

## 5. Issue Register

### SAAS-001: Weak Development Secret Key

| Field | Value |
|-------|-------|
| **Category** | Security |
| **Evidence** | `.env:15` - `SECRET_KEY=dev-secret-key-not-for-production` |
| **Impact** | **HIGH** |
| **Risk** | JWT tokens can be forged if this key is used in any non-dev environment |
| **Fix** | Generate strong key with `openssl rand -hex 32`, ensure validation catches weak keys |

**Status**: ⚠️ Config validation exists but allows this key in dev mode

---

### SAAS-002: In-Memory Account Lockout

| Field | Value |
|-------|-------|
| **Category** | Security |
| **Evidence** | `account_lockout_service.py:14-15` - `_failed_attempts: Dict`, `_account_lockouts: Dict` |
| **Impact** | **HIGH** |
| **Risk** | In multi-worker or multi-instance deployment, lockout state is not shared. Attacker can bypass lockout by hitting different workers. |
| **Fix** | Use Redis for distributed lockout storage |

---

### SAAS-003: No Database Backups

| Field | Value |
|-------|-------|
| **Category** | Data Safety |
| **Evidence** | No backup configuration in repo, no backup scripts |
| **Impact** | **HIGH** |
| **Risk** | Data loss from database corruption, accidental deletion, or attack |
| **Fix** | Implement automated PostgreSQL backups (pg_dump, managed service backups, or PITR) |

---

### SAAS-004: No Monitoring/Alerting

| Field | Value |
|-------|-------|
| **Category** | Operations |
| **Evidence** | No APM, error tracking, or alerting configuration found |
| **Impact** | **HIGH** |
| **Risk** | Production issues go undetected until user reports |
| **Fix** | Integrate monitoring (Datadog, New Relic, Prometheus) and error tracking (Sentry) |

---

### SAAS-005: Deployment Not Configured

| Field | Value |
|-------|-------|
| **Category** | Operations |
| **Evidence** | `deploy.yml:145-152` - `echo "Deploying to production..."` (placeholder) |
| **Impact** | **HIGH** |
| **Risk** | Cannot deploy to production, manual deployment required |
| **Fix** | Configure actual deployment (SSH, kubectl, or deployment service) |

---

### SAAS-006: No Subscription Cancellation/Downgrade

| Field | Value |
|-------|-------|
| **Category** | Billing |
| **Evidence** | No cancellation or downgrade endpoints in `subscriptions.py` |
| **Impact** | **MEDIUM** |
| **Risk** | Users cannot cancel or downgrade subscriptions, leading to chargebacks and support burden |
| **Fix** | Implement cancellation flow with Dodo API integration |

---

### SAAS-007: No Refund Flow

| Field | Value |
|-------|-------|
| **Category** | Billing |
| **Evidence** | No refund handling in `dodo_payment_service.py` or `subscriptions.py` |
| **Impact** | **MEDIUM** |
| **Risk** | Manual refund processing, customer support burden |
| **Fix** | Implement refund flow via Dodo API |

---

### SAAS-008: Hard Delete Only

| Field | Value |
|-------|-------|
| **Category** | Data Safety |
| **Evidence** | `users.py:154` - `await UserService.delete(db, current_user)` with cascade |
| **Impact** | **MEDIUM** |
| **Risk** | Accidental deletion cannot be recovered |
| **Fix** | Consider soft delete with 30-day recovery period before hard delete |

---

### SAAS-009: No Data Retention Policy

| Field | Value |
|-------|-------|
| **Category** | Data Safety |
| **Evidence** | No retention policy or data cleanup jobs |
| **Impact** | **MEDIUM** |
| **Risk** | Data grows indefinitely, potential GDPR/COPPA compliance issues |
| **Fix** | Implement data retention policy with cleanup jobs |

---

### SAAS-010: No OAuth Providers

| Field | Value |
|-------|-------|
| **Category** | Auth |
| **Evidence** | No OAuth configuration in `auth.py` or `config.py` |
| **Impact** | **MEDIUM** |
| **Risk** | Limited user convenience, higher friction signup |
| **Fix** | Add Google/Apple OAuth for kids' app (COPPA compliant) |

---

### SAAS-011: File Upload Validation Gap

| Field | Value |
|-------|-------|
| **Category** | Security |
| **Evidence** | `profile_photos.py` - endpoint exists but validation not fully audited |
| **Impact** | **MEDIUM** |
| **Risk** | Potential malicious file upload |
| **Fix** | Verify file type, size limits, and content validation |

---

### SAAS-012: No Rollback Procedure

| Field | Value |
|-------|-------|
| **Category** | Operations |
| **Evidence** | No rollback scripts or documentation |
| **Impact** | **MEDIUM** |
| **Risk** | Failed deployments cannot be quickly reversed |
| **Fix** | Document rollback procedure, consider blue/green deployment |

---

---

## 6. Prioritized Fix Plan

### P0 — Critical Security Risks (Fix Immediately)

| ID | Issue | Effort |
|----|-------|--------|
| CRIT-001 | Ensure strong SECRET_KEY in all environments | Low |

### P1 — Production Blockers (Fix Before Launch)

| ID | Issue | Effort |
|----|-------|--------|
| HIGH-001 | Migrate account lockout to Redis | Medium |
| HIGH-002 | Implement database backups | Medium |
| HIGH-003 | Add monitoring and alerting | Medium |
| HIGH-004 | Configure actual deployment | High |

### P2 — Reliability Improvements (Fix Soon)

| ID | Issue | Effort |
|----|-------|--------|
| MED-006 | Add file upload validation | Low |
| MED-007 | Implement soft delete with recovery | Medium |
| MED-009 | Add data retention policy | Medium |
| MED-012 | Document rollback procedure | Low |

### P3 — Polish / Best Practices (Fix Eventually)

| ID | Issue | Effort |
|----|-------|--------|
| MED-001 | Add OAuth providers | Medium |
| MED-002 | Implement refund flow | Medium |
| MED-003 | Add subscription cancellation | Medium |
| MED-004 | Add subscription downgrade | Medium |

---

### Quick Wins (Can Do Today)

1. ✅ Verify `.env` is in `.gitignore` (already is)
2. ✅ Generate strong SECRET_KEY for production
3. ✅ Add file size limits to profile photo uploads
4. ✅ Document deployment procedure

### High-Risk Changes (Plan Carefully)

1. ⚠️ Migrate account lockout to Redis (requires Redis dependency)
2. ⚠️ Implement database backups (requires infrastructure access)
3. ⚠️ Configure deployment (requires hosting provider setup)

---

## 7. Summary

### Overall Assessment: **PRODUCTION-READY WITH GAPS**

The application has a **solid security foundation** with:

- ✅ Proper authentication (JWT + HttpOnly cookies)
- ✅ Strong password hashing (bcrypt, rounds=12)
- ✅ Account lockout protection
- ✅ Rate limiting
- ✅ Security headers
- ✅ CORS validation
- ✅ Webhook signature verification
- ✅ GDPR data export
- ✅ Audit logging

**Critical gaps for production**:

- ❌ No database backups
- ❌ No monitoring/alerting
- ❌ Deployment not configured
- ⚠️ In-memory lockout (needs Redis for multi-worker)

**Recommendation**: Address P0 and P1 issues before production launch. The security architecture is sound, but operational infrastructure needs completion.

---

**Audit Complete**  
**Next Steps**: Create tickets for P0/P1 issues, begin remediation.
