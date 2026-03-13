# Worklog Addendum: Architecture Audit Remediation
Date: 2026-03-13

### TCK-20260313-001 :: [Frontend Architecture Audit Remediation]

Type: AUDIT_FINDING
Owner: Antigravity
Status: OPEN
Priority: P1
Link: # (Pending GitHub issue)

**Description:**
Implement findings from the ChatGPT frontend architecture audit (files checked: `main.tsx`, `App.tsx`, `lazyPages.tsx`, `config.ts`, `I18nProvider.tsx`, `registerServiceWorker.ts`, `itemsManifest.ts`). 
Key changes involve moving top-level effects to a bootstrap hook, standardizing route mappings with a configuration array in `App.tsx`, adding type guards and error caching fixes for manifests, and centralizing i18n configs cleanly.

**Acceptance Criteria:**
- `main.tsx` initializes logic safely and throws on missing `#root`.
- `App.tsx` routes are driven by an `AppRoute` configuration array.
- `lazyPages.tsx` uses a standard `lazyNamed` wrapper.
- `i18n/config.ts` prevents re-initialization.
- `itemsManifest.ts` safely catches fetch errors.

**Execution log:**
- 2026-03-13: Ticket created. Evaluated audit findings. Drafted implementation plan.

**Status updates:**
- 2026-03-13: Awaiting implementation plan approval.

---

### TCK-20260313-005 :: App.tsx Audit Fixes + SETUP/AGENTS.md Version Fixes

Type: AUDIT_FINDING
Owner: Codex
Status: IN_PROGRESS
Priority: P2
Link: # (Pending GitHub issue)
Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md

**Description:**
Audit of App.tsx and documentation files found multiple issues:
1. App.tsx: Duplicate useEffect hooks for pathname tracking (dead code bug)
2. App.tsx: Wasteful redirect route element (<></> instead of null)
3. App.tsx: 77 game routes missing cameraSafe/gameName metadata
4. SETUP.md: Port 5173→6173, Node 18→22, PostgreSQL 17→16
5. AGENTS.md: Node 18→22

**Execution log:**
- 2026-03-13: Audit completed, fixes applied

**Status updates:**
- 2026-03-13: Code fixes complete, preparing commit
