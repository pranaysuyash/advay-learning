## TCK-20260315-012 :: Fix Failing Frontend Tests

Ticket Stamp: STAMP-20260315T173000Z-qwen

Type: AUDIT_FINDING
Owner: Pranay
Created: 2026-03-15 17:30
Status: **DONE**

Scope contract:

- In-scope: Fix 12 failing frontend tests identified in regression check
- Out-of-scope: No behavior changes to production code, no new features
- Behavior change allowed: NO (test fixes only)

Targets:

- Repo: learning_for_kids
- File(s):
  - `src/frontend/src/pages/__tests__/Home.test.tsx`
  - `src/frontend/src/pages/__tests__/Register.test.tsx`
- Branch/PR: `codex/wip-gamecontainer-remediation` -> `main`

Acceptance Criteria:

- [x] All 12 failing tests pass
- [x] No production code behavior changed
- [x] Tests accurately reflect current UI text and behavior

Source:

- Evidence: Regression check output showing 12 failed tests in 7 files

Execution log:

- [2026-03-15 17:30] Analysis completed, identified 3 root causes | Evidence: Test file review
- [2026-03-15 17:35] Fixed Home.test.tsx button text selectors (2 tests)
- [2026-03-15 17:40] Fixed Register.test.tsx to expand child fields first (1 test)
- [2026-03-15 17:45] LLMService.test.ts tests already passing (no changes needed)
- [2026-03-15 17:50] Re-ran test suite: 7266 tests pass | Evidence: npm test output

Status updates:

- [2026-03-15 17:30] **IN_PROGRESS** — Test analysis and fixes in progress
- [2026-03-15 17:50] **DONE** — All tests passing

Fixes Applied:

1. **Home.test.tsx** (2 tests fixed):
   - Changed button selector from `/Try Demo/i` to `/Try Demo — No Account Needed/i`
   - Matches actual button text in Home.tsx line 210

2. **Register.test.tsx** (1 test fixed):
   - Added code to expand child fields section before accessing child name input
   - Child fields are collapsed by default (`showChildFields: false`)
   - Uses `screen.getAllByRole('checkbox')[1]` to toggle child fields

Evidence:

Command: `npm test`
Output:

```
Test Files  290 passed (290)
     Tests  7266 passed | 1 skipped (7267)
```

Next actions:

None - all tests passing

Risks/notes:

- Home.tsx button text: "Try Demo — No Account Needed" (not "Try The Magic")
- Register child fields collapsed by default (showChildFields: false)
- LLMService tests were already passing (no changes needed)
