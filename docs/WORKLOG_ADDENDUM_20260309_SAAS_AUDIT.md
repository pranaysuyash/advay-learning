# Worklog Addendum - Production Infrastructure Hardening (Revised)

**Date**: 2026-03-09  
**Context**: SaaS hygiene audit - focusing on real production blockers

---

## TCK-20260309-001 :: SaaS Audit Complete

**Ticket Stamp**: STAMP-20260309T130000Z-audit  
**Status**: **DONE**

**Evidence**: `docs/audit/SAAS_HYGIENE_AUDIT.md`

---

## TCK-20260309-002 :: Migrate Account Lockout to Redis

**Ticket Stamp**: STAMP-20260309T131000Z-audit

**Type**: HARDENING  
**Owner**: Pranay  
**Status**: **DONE**  
**Priority**: P1

### Analysis

**Original State** (`account_lockout_service.py:14-16`):

```python
_failed_attempts: Dict[str, list] = {}
_account_lockouts: Dict[str, datetime] = {}
```

**Problem**: In-memory dicts don't persist across workers. In production with multiple gunicorn workers or containers, lockout state is not shared.

### Solution

Migrated to Redis with graceful in-memory fallback:

- Uses `redis.asyncio` for async Redis operations
- Stores failed attempts as Redis lists with TTL
- Stores lockouts as Redis keys with TTL (15 min)
- Falls back to in-memory when Redis unavailable (dev mode)
- Reuses pattern from existing `cache_service.py`

### Evidence

**Command**: `python -c "
import asyncio
from app.services.account_lockout_service import AccountLockoutService

async def test():
email = 'test@example.com' # Record 5 failed attempts
for i in range(5):
await AccountLockoutService.record_failed_attempt(email) # Verify locked
is_locked = await AccountLockoutService.is_account_locked(email)
print(f'Locked: {is_locked}') # Clear and verify unlocked
await AccountLockoutService.clear_failed_attempts(email)
is_locked = await AccountLockoutService.is_account_locked(email)
print(f'After clear: {is_locked}')

asyncio.run(test())
"`

**Output**:

```
Locked: True
After clear: False
```

**Files Changed**:

- `src/backend/app/services/account_lockout_service.py` - Complete rewrite with Redis support

### Acceptance Criteria

- [x] Lockout state persists across multiple workers ✅
- [x] Lockout expiration handled by Redis TTL ✅
- [x] Dev mode works without Redis (graceful fallback) ✅
- [x] All existing tests pass ✅

---

## TCK-20260309-003 :: Add Error Tracking (Sentry)

**Ticket Stamp**: STAMP-20260309T131100Z-audit

**Type**: HARDENING  
**Owner**: Pranay  
**Status**: **DONE**  
**Priority**: P1

### Analysis

**Original State**: No error tracking. Logs go to stdout only.

**Problem**: Production errors are invisible. No stack traces, no alerting.

### Solution

Added Sentry SDK integration:

- Added `sentry-sdk[fastapi]>=2.2.0` to dependencies
- Initialized Sentry in `main.py` startup event
- Configured via `SENTRY_DSN` environment variable
- Graceful: No Sentry if DSN not configured (dev mode)

### Evidence

**Files Changed**:

- `src/backend/pyproject.toml` - Added sentry-sdk dependency
- `src/backend/app/main.py` - Added Sentry initialization in startup

**Configuration**:

```bash
# Add to .env.production
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**Behavior**:

- Production: All unhandled exceptions reported to Sentry
- Development: Sentry disabled (no DSN configured)
- Environment tag: Uses `APP_ENV` setting

### Acceptance Criteria

- [x] Unhandled exceptions reported to Sentry ✅
- [x] Request context included in error reports ✅
- [x] Can disable in dev mode (no DSN) ✅

---

## TCK-20260309-004 :: Add Uptime Monitoring

**Ticket Stamp**: STAMP-20260309T131200Z-audit

**Type**: HARDENING  
**Owner**: Pranay  
**Status**: **OPEN**  
**Priority**: P1

### Analysis

**Current State**: `/health` endpoint exists but no external monitoring.

**Problem**: Won't know if production is down until users complain.

### Scope Contract

- **In-scope**: External uptime monitoring service
- **Out-of-scope**: Complex alerting rules, multi-region checks
- **Behavior change allowed**: YES (external service, no code changes)

### Plan

**Options** (choose one):

1. **UptimeRobot** (free tier: 50 monitors, 5 min intervals)
2. **Better Uptime** (free tier: 10 monitors)
3. **Pingdom** (free tier available)

**Recommendation**: UptimeRobot - simple, free, sufficient

### Acceptance Criteria

- [ ] Uptime monitor configured for production URL
- [ ] Email alerts on downtime
- [ ] Health endpoint returns 200 when healthy

---

## TCK-20260309-005 :: Complete Deployment Workflow

**Ticket Stamp**: STAMP-20260309T131300Z-audit

**Type**: HARDENING  
**Owner**: Pranay  
**Status**: **OPEN**  
**Priority**: P1

### Analysis

**Current State**:

- ✅ `docker-compose.yml` exists and is complete
- ✅ `scripts/backup-db.sh` exists
- ❌ GitHub Actions deploy step is placeholder
- ❌ No backup automation

### Scope Contract

- **In-scope**:
  - Replace deploy.yml placeholder with actual SSH deploy
  - Add automated backup cron job
- **Out-of-scope**: Blue/green deployment, Kubernetes
- **Behavior change allowed**: YES

### Plan

**Deployment** (choose one):

1. **SSH Deploy**: Connect to VPS, `docker-compose pull && docker-compose up -d`
2. **Watchtower**: Auto-update on new Docker images
3. **GitHub Actions + SSH**: Trigger deploy via SSH

**Backup Automation**:

- Add cron job to VPS: `0 2 * * * /path/to/backup-db.sh`

### Acceptance Criteria

- [ ] Deploy workflow pushes to actual server
- [ ] Backups run automatically daily
- [ ] Tested: new image → deploy → live

---

## Summary

| Ticket  | Priority | Effort | Status                                                    |
| ------- | -------- | ------ | --------------------------------------------------------- |
| TCK-002 | P1       | Medium | DONE - Redis lockout                                      |
| TCK-003 | P1       | Low    | DONE - Sentry                                             |
| TCK-004 | P1       | Low    | OPEN - Uptime monitoring                                  |
| TCK-005 | P1       | Medium | OPEN - Deploy workflow + backup cron                      |
| TCK-003 | P0       | Medium | **IN PROGRESS** - Email verification (onboarding blocker) |

---

## TCK-20260312-001 :: Email Verification Implementation (Onboarding Blocker)

**Ticket Stamp**: STAMP-20260312T111500Z-codex  
**Status**: **IN_PROGRESS**  
**Priority**: P0  
**Type**: AUDIT_REMEDIATION  
**Owner**: Pranay

### Scope Contract

- In-scope:
  - Integrate real email service (Resend recommended)
  - Add frontend `/verify-email` route
  - Test end-to-end registration flow
- Out-of-scope:
  - Password reset email improvements (out of scope for onboarding fix)
- Behavior change allowed: YES (users can now verify email)

### Analysis

**Original Finding**: Audit confirmed onboarding not launch-safe:

- Backend email service is stub logger (`src/backend/app/core/email.py:51-60`)
- No frontend route for email verification link

**Evidence**: `docs/email_service_implementation_research.md`

### Research

- **Provider**: Resend (recommended per bas5minute TODO)
- **Reference**: `bas5minute/TODO.md` lines 79-96
- **Implementation pattern**:

```python
import resend
resend.emails.send({
  from: 'noreply@learningapp.com',
  to: email,
  subject: 'Verify your email',
  html: f'Click here: {verification_url}'
})
```

### Plan

- [ ] Backend: Install resend SDK, add API key config
- [ ] Backend: Update `email.py` to send via Resend
- [ ] Frontend: Add `/verify-email` route to App.tsx
- [ ] Frontend: Create VerifyEmailPage component
- [ ] Test: Full registration flow end-to-end

### Acceptance Criteria

- [ ] New user can register and receive verification email
- [ ] Email link completes verification
- [ ] Verified user can login successfully
- [ ] Password reset also works (same email service)

Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md

---

## TCK-20260312-002 :: Expand Launch Audit Coverage Beyond Engineering Steps

**Ticket Stamp**: STAMP-20260312T170500Z-codex  
**Status**: **DONE**  
**Priority**: P1  
**Type**: AUDIT  
**Owner**: Pranay

### Scope Contract

- In-scope:
  - Review whether the existing launch audit under-covered any material public-launch domains
  - Save a reusable expanded launch audit prompt
  - Save a companion report documenting the additional launch lenses and findings
- Out-of-scope:
  - Implementing any of the newly identified gaps
  - Replacing the original launch report
- Behavior change allowed: NO

### Analysis

**Observed**: The original `docs/LAUNCH_READINESS_REPORT.md` correctly captured core engineering blockers but did not fully center public-launch realities such as legal/trust surface, data-rights UX, observability maturity, support operations, and rollout governance.

**Observed evidence anchors**:

- `src/frontend/src/pages/Settings.tsx:672-705` links to `/privacy` and renders `Export Data`, but export is still a placeholder toast.
- `src/frontend/src/App.tsx:1-2000` contains no `/privacy` or `/terms` route in the audited route surface.
- `docs/WORKLOG_ADDENDUM_20260309_SAAS_AUDIT.md` still shows uptime monitoring and deployment workflow tickets open.
- `docs/REVIEW_REPORT.md` records missing frontend deletion UI despite backend capability.

### Files Created

- `prompts/audit/launch-readiness-expanded-v1.0.md` — reusable prompt for broader launch audits
- `docs/LAUNCH_READINESS_EXPANDED_REPORT_2026-03-12.md` — companion report listing what the original audit under-covered and the revised public-launch verdict

### Files Updated

- `docs/LAUNCH_READINESS_REPORT.md` — canonical launch report expanded to incorporate the broader public-launch findings directly into the main audit

### Evidence

**Command**: Review of repo files via editor reads and targeted search

**Observed outputs**:

- `Settings.tsx` includes `href="/privacy"`
- `App.tsx` does not define `/privacy` or `/terms`
- `Settings.tsx` `Export Data` action shows “will be available in the next update”
- Worklog still marks uptime monitoring and deployment workflow as open

### Status updates

- 2026-03-12 **DONE** — Expanded launch-audit coverage documented and saved as new prompt/report artifacts.
- 2026-03-12 **DONE** — Canonical `docs/LAUNCH_READINESS_REPORT.md` updated to include trust/compliance surface, parent data-rights UX, observability, support, device confidence, billing ops, and governance coverage.

Prompt Trace: prompts/audit/launch-readiness-expanded-v1.0.md; prompts/review/local-pre-commit-review-v1.0.md
