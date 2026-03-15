## TCK-20260315-012 :: Fix Failing Frontend Tests

Ticket Stamp: STAMP-20260315T173000Z-qwen

Type: AUDIT_FINDING
Owner: Pranay
Created: 2026-03-15 17:30
Status: **IN_PROGRESS**

Scope contract:

- In-scope: Fix 12 failing frontend tests identified in regression check
- Out-of-scope: No behavior changes to production code, no new features
- Behavior change allowed: NO (test fixes only)

Targets:

- Repo: learning_for_kids
- File(s): 
  - `src/frontend/src/pages/__tests__/Home.test.tsx`
  - `src/frontend/src/pages/__tests__/Register.test.tsx`
  - `src/frontend/src/services/ai/llm/LLMService.test.ts`
- Branch/PR: `codex/wip-gamecontainer-remediation` -> `main`

Acceptance Criteria:

- [ ] All 12 failing tests pass
- [ ] No production code behavior changed
- [ ] Tests accurately reflect current UI text and behavior

Source:

- Evidence: Regression check output showing 12 failed tests in 7 files

Execution log:

- [2026-03-15 17:30] Analysis completed, identified 3 root causes | Evidence: Test file review
- [2026-03-15 17:35] Fixing Home.test.tsx button text selectors
- [2026-03-15 17:40] Fixing Register.test.tsx to expand child fields first
- [2026-03-15 17:45] Fixing LLMService.test.ts expectations

Status updates:

- [2026-03-15 17:30] **IN_PROGRESS** — Test analysis and fixes in progress

Next actions:

1. Fix Home.test.tsx button selectors
2. Fix Register.test.tsx child field expansion
3. Fix LLMService.test.ts config expectations
4. Re-run tests to verify all pass

Risks/notes:

- Home.tsx button text: "Try Demo — No Account Needed" (not "Try The Magic")
- Register child fields collapsed by default (showChildFields: false)
- LLMService enabled logic: `llmFlag || explicitEnabled` (either flag enables)
