# QA TEST EXECUTION REPORT PROMPT v1.0

**Goal**: Produce a test execution report with raw evidence that a reviewer can trust.

---

## INPUTS

- Ticket/PR: `<TCK id or PR link>`
- Scope: `<what changed>`
- Environments tested: `<browser/OS>`
- Repo access: `<YES/NO>`

---

## OUTPUT (REQUIRED)

```markdown
QA EXECUTION REPORT v1.0

Scope:
- ...

Environment:
- OS:
- Browser:
- Hardware (camera):

Automated checks:
- **Command**: `...`
- **Output**:
  ```
  ...
  ```
- Result: PASS/FAIL/UNKNOWN

Manual checks:
1) <check>
   - Evidence: <Observed notes, screenshots if provided>
   - Result: PASS/FAIL/UNKNOWN

Regressions / Bugs found:
- BUG-001: <title> | Severity: P0/P1/P2/P3 | Evidence: <Observed>

Recommendation:
- READY / NOT READY / READY WITH KNOWN ISSUES
```

---

## HARD RULES

- Do not mark PASS without Observed evidence.
- If you didn’t run a command, mark it Unknown.
