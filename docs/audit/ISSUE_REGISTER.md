# Canonical Issue Register

Ticket Reference: `TCK-20260305-018`

This is the single canonical issue register for consolidated audit and execution tracking.

## Canonical Policy

1. Use this file for deduped issue status across audits, plans, and worklogs.
2. Use `docs/WORKLOG_ADDENDUM_*.md` for execution logs and evidence transcripts.
3. Legacy ticket indices are preserved as references, not status authorities.

Last Updated: 2026-03-05

---

## Active Consolidation Issues

| ID | Status | Category | Summary | Primary Evidence |
|---|---|---|---|---|
| ISSUE-010 | DONE 2026-03-04 | process/docs | Established this canonical register as the deduped source for issue status. | `docs/audit/ISSUE_REGISTER.md` |
| ISSUE-005 | DONE 2026-03-04 | tooling/reliability | Resolved CI contradiction between `ci.yml` and active workflow strategy. | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` |
| ISSUE-007 | DONE 2026-03-04 | tests/reliability | Added route/registry contract tests and removed duplicate game route definitions. | `src/frontend/src/pages/__tests__/RouteRegistryConsistency.test.ts`, `src/frontend/src/App.tsx` |
| ISSUE-001 | OPEN (progress 2026-03-05) | reliability/UX/tests | Close systemic game quality gaps across game portfolio. Added smoke-test infra stabilization for canvas gradient APIs used by PhysicsPlayground. | `docs/audit/GAME_QUALITY_AUDIT_SUMMARY.md`, `src/frontend/src/test/setup.ts`, `docs/WORKLOG_ADDENDUM_v3.md` |
| ISSUE-002 | OPEN | docs/tooling/process | Unify work tracking sources and remove contradictory guidance. | `AGENTS.md`, `README.md`, `src/frontend/docs/WORKLOG_TICKETS.md` |
| ISSUE-003 | OPEN | tooling/docs | Repair audit-to-ticket automation and source discovery. | `scripts/audit_review.sh`, `docs/AUDIT_BACKLOG.md` |
| ISSUE-004 | PARTIAL 2026-03-04 | architecture/reliability | Route duplication drift identified and duplicate paths removed in app routing table. | `src/frontend/src/App.tsx` |
| ISSUE-006 | OPEN | bug/revenue-reliability | Complete Dodo product ID mapping and remove placeholder checkout behavior. | `src/backend/app/services/dodo_payment_service.py` |
| ISSUE-008 | OPEN | docs | Reconcile stale roadmap/setup/changelog claims with actual repo state. | `README.md`, `CHANGELOG.md`, `docs/GAME_ROADMAP.md` |
| ISSUE-009 | OPEN | docs/analysis integrity | Resolve conflicting audit counts and status narratives across reports. | `docs/audit/GAME_QUALITY_AUDIT_SUMMARY.md`, `docs/audit/GAME_QUALITY_REMEDIATION_PLAN.md` |

---

## Legacy Register Snapshot (Preserved)

The previous security-focused register is preserved here for traceability.

| Legacy ID | Legacy Status | Description | Unit |
|---|---|---|---|
| ISSUE-001 (legacy) | DONE 2026-02-27 | Harden access token security with blacklist and secure cookies | Unit-1 |
| ISSUE-002 (legacy) | IN_PROGRESS | Enforce authorization checks on every endpoint (games & users started) | Unit-2 |
| ISSUE-003 (legacy) | IN_PROGRESS | Apply comprehensive rate limiting to auth endpoints (verify-email, resend added) | Unit-3 |
| ISSUE-004 (legacy) | DONE 2026-02-27 | Strengthen password policy enforcement (schema already includes strong rules) | N/A |
| ISSUE-005 (legacy) | OPEN | Secure session management (rotation/fixation) | TBD |
| ISSUE-006 (legacy) | DONE 2026-02-27 | Add security headers to API responses | N/A |
| ISSUE-007 (legacy) | OPEN | Expand auth/security test coverage | TBD |
| ISSUE-008 (legacy) | OPEN | Document authentication/authorization flows & invariants | TBD |
| ISSUE-009 (legacy) | OPEN | Add monitoring/alerts for auth security events | TBD |
| ISSUE-010 (legacy) | OPEN | Evaluate third-party authentication provider | TBD |
| SEC-001 | DONE 2026-02-27 | Stream Issue Report video uploads to disk to prevent OOM | Unit-1 |
| CONC-001 | DONE 2026-02-27 | Migrate Issue Report session state to Redis from in-memory dict | Unit-1 |
| DX-001 | DONE 2026-02-27 | Fix Frontend React Fast Refresh warnings | Unit-1 |
| DOCS-001 | DONE 2026-02-27 | Standardize docs to pnpm and fix SECURITY.md path | Unit-1 |
| ERR-001 | DONE 2026-02-27 | Tighten broad exception catches in cache_service.py | Unit-2 |
| OBS-001 | DONE 2026-02-27 | Implement structured logging (JSON) using structlog | Unit-3 |
| PERF-001 | DONE 2026-02-27 | Add lazy="joined" to Progress.profile ORM model | Unit-4 |
| PERF-003 | DONE 2026-02-27 | Extract large rendering chunks in AlphabetGame.tsx | Unit-4 |
