# Worklog Addendum - Production Infrastructure Hardening

**Date**: 2026-03-09  
**Context**: SaaS hygiene audit revealed 4 P1 production blockers

---

## TCK-20260309-002 :: Database Backup Automation

**Ticket Stamp**: STAMP-20260309T130000Z-audit

**Type**: HARDENING  
**Owner**: Pranay  
**Status**: **OPEN**  
**Priority**: P1

### Scope Contract

- **In-scope**: Automated PostgreSQL backups with retention
- **Out-of-scope**: Disaster recovery runbook, point-in-time recovery
- **Behavior change allowed**: YES (ops only, no app code)

### Plan

1. Research backup strategies for PostgreSQL
2. Choose: managed service backups vs pg_dump cron
3. Implement backup script or enable managed backups
4. Add retention policy (7 days daily, 4 weeks weekly)
5. Test restore procedure

### Risks

- Backups without tested restore = no backup

---

## TCK-20260309-003 :: Monitoring and Alerting

**Ticket Stamp**: STAMP-20260309T130100Z-audit

**Type**: HARDENING  
**Owner**: Pranay  
**Status**: **OPEN**  
**Priority**: P1

### Scope Contract

- **In-scope**: 
  - Health monitoring (uptime)
  - Error tracking (Sentry or similar)
  - Basic alerting (email/Slack)
- **Out-of-scope**: APM, complex dashboards
- **Behavior change allowed**: YES (ops only)

### Plan

1. Add Sentry for error tracking
2. Add uptime monitoring (UptimeRobot or similar)
3. Configure alerting for: health check failures, error spikes
4. Document runbook for common alerts

---

## TCK-20260309-004 :: Deployment Configuration

**Ticket Stamp**: STAMP-20260309T130200Z-audit

**Type**: HARDENING  
**Owner**: Pranay  
**Status**: **OPEN**  
**Priority**: P1

### Scope Contract

- **In-scope**: Replace placeholder in deploy.yml with actual deployment
- **Out-of-scope**: Blue/green, canary, complex CD
- **Behavior change allowed**: YES

### Plan

1. Determine hosting target (Railway, Render, Fly.io, AWS, etc.)
2. Configure deployment action for chosen platform
3. Set up secrets in GitHub Actions
4. Test deployment flow
5. Document rollback procedure

---

## TCK-20260309-005 :: Redis for Account Lockout

**Ticket Stamp**: STAMP-20260309T130300Z-audit

**Type**: HARDENING  
**Owner**: Pranay  
**Status**: **OPEN**  
**Priority**: P1

### Scope Contract

- **In-scope**: Migrate in-memory lockout to Redis
- **Out-of-scope**: Full Redis caching layer
- **Behavior change allowed**: YES

### Plan

1. Add Redis dependency and configuration
2. Update AccountLockoutService to use Redis
3. Keep fallback to in-memory for single-worker dev
4. Test lockout works across multiple workers

### Evidence Needed

- Redis connection string in env
- Lockout persists across requests to different workers

---

## Summary

4 P1 issues identified from audit. All are operational infrastructure gaps that block production deployment.

---

## TCK-20260309-006 :: CI Pipeline Remediation (PR #15)

**Ticket Stamp**: STAMP-20260309T141500Z-ci

**Type**: HARDENING  
**Owner**: Pranay  
**Status**: **DONE**  
**Priority**: P1

### Scope Contract

- **In-scope**:
  - Fix failing `frontend-test` dependency/build pipeline errors
  - Fix backend lint/test regressions blocking reliable CI verification
- **Out-of-scope**:
  - Broader refactors unrelated to current CI failures
  - Deployment workflow changes
- **Behavior change allowed**: YES (test/build pipeline stability)

### Prompt Trace

- `prompts/review/local-pre-commit-review-v1.0.md`
- `AGENTS.md` §8 default lifecycle
Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md

### Execution Log

- 2026-03-09: Upgraded frontend PWA/tooling deps to versions compatible with Vite 7.
- 2026-03-09: Updated `vite.config.js` Workbox cache size threshold to prevent build failure on large `tts.worker` chunk.
- 2026-03-09: Ran frontend checks (`npm ci`, `npm run lint`, `npm run type-check`, `npm run build`) and verified pass locally.
- 2026-03-09: Fixed backend lint findings via Ruff autofix + cleanup and revalidated lint.
- 2026-03-09: Aligned backend tests with current auth API behavior (`400` for invalid reset/verify tokens).
- 2026-03-09: Fixed `test_progress_service` fixture regressions (`email_verified` field + unique progress IDs) to remove DB key collisions.
- 2026-03-09: Ran backend tests and verified pass locally (`290 passed, 1 skipped`).

### Status Updates

- 2026-03-09: **DONE** - Local CI-equivalent backend/frontend checks are green; changes ready for commit/push for PR re-run.
- 2026-03-09: **IN PROGRESS** - Follow-up lockfile normalization for Node 24 `npm ci` sync error (AJV/Rollup mismatch) after first PR rerun.
