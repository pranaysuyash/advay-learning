# Issue Register

**Ticket**: TCK-20260227-001

| ID | Status | Description | Unit |
|----|--------|-------------|------|
| ISSUE-001 | DONE 2026-02-27 | Harden access token security with blacklist and secure cookies | Unit-1 |
| ISSUE-002 | IN_PROGRESS | Enforce authorization checks on every endpoint (games & users started) | Unit-2 |
| ISSUE-003 | IN_PROGRESS | Apply comprehensive rate limiting to auth endpoints (verify-email, resend added) | Unit-3 |
| ISSUE-004 | DONE 2026-02-27 | Strengthen password policy enforcement (schema already includes strong rules) | N/A |
| ISSUE-005 | OPEN | Secure session management (rotation/fixation) | TBD |
| ISSUE-006 | DONE 2026-02-27 | Add security headers to API responses (implemented inline in main.py, redundant middleware file removed) | N/A |
| ISSUE-007 | OPEN | Expand auth/security test coverage | TBD |
| ISSUE-008 | OPEN | Document authentication/authorization flows & invariants | TBD |
| ISSUE-009 | OPEN | Add monitoring/alerts for auth security events | TBD |
| ISSUE-010 | OPEN | Evaluate third-party authentication provider | TBD |
| SEC-001 | DONE 2026-02-27 | Stream Issue Report video uploads to disk to prevent OOM | Unit-1 |
| CONC-001 | DONE 2026-02-27 | Migrate Issue Report session state to Redis from in-memory dict | Unit-1 |
| DX-001 | DONE 2026-02-27 | Fix Frontend React Fast Refresh Warnings | Unit-1 |
| DOCS-001 | DONE 2026-02-27 | Standardize docs to pnpm and fix SECURITY.md path | Unit-1 |
| ERR-001 | DONE 2026-02-27 | Tighten broad exception catches in cache_service.py | Unit-2 |
| OBS-001 | DONE 2026-02-27 | Implement structured logging (JSON) using structlog | Unit-3 |
| PERF-001 | DONE 2026-02-27 | Add lazy="joined" to Progress.profile ORM model | Unit-4 |
| PERF-003 | DONE 2026-02-27 | Extracted large rendering chunks in AlphabetGame.tsx | Unit-4 |
