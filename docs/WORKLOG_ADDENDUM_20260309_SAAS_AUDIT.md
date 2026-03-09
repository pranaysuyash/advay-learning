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
    email = 'test@example.com'
    # Record 5 failed attempts
    for i in range(5):
        await AccountLockoutService.record_failed_attempt(email)
    # Verify locked
    is_locked = await AccountLockoutService.is_account_locked(email)
    print(f'Locked: {is_locked}')
    # Clear and verify unlocked
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

| Ticket | Priority | Effort | Status |
|--------|----------|--------|--------|
| TCK-002 | P1 | Medium | OPEN - Redis lockout |
| TCK-003 | P1 | Low | OPEN - Sentry |
| TCK-004 | P1 | Low | OPEN - Uptime monitoring |
| TCK-005 | P1 | Medium | OPEN - Deploy workflow + backup cron |

**What's Already Done** (no work needed):
- ✅ Docker Compose configured
- ✅ Backup script exists
- ✅ Health endpoint exists
- ✅ Security architecture solid
- ✅ Auth implementation correct
- ✅ Payment webhook verification

**Real Work Required**:
1. Redis for lockout (code change)
2. Sentry integration (code change)
3. Uptime monitoring (external service setup)
4. Deploy workflow + backup cron (ops setup)
