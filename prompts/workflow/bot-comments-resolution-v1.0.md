# Bot Comments Resolution Prompt v1.0

**Purpose**: Ensure automated review feedback (CI checks, bots, linters, security tools) is acknowledged and resolved before merge.

**Use When**:
- A PR has failing checks or bot comments
- You want a consistent “no ignored bot feedback” policy

---

## Non-Negotiable Rules

1) No merge with failing required checks (unless explicitly waived in worklog with rationale).
2) Address bot comments with evidence: fixed, won’t-fix (justified), or false positive (proven).
3) Don’t silence warnings by weakening rules unless approved.

---

## Step 1 — Collect Bot Feedback (Observed)

If using GitHub:
- List checks (CI) status
- List bot comments (linters/security)

If GH CLI is available:
```bash
gh pr checks <PR_NUMBER>
gh pr view <PR_NUMBER> --comments
```

If unavailable, request the user to paste:
- failing check logs
- bot comment text

---

## Step 2 — Classify Each Finding

For each bot item:
- Type: LINT | TEST | TYPECHECK | SECURITY | PERFORMANCE | DOCS
- Severity: HIGH/MED/LOW
- Action: FIX | SUPPRESS | WAIVE | FALSE_POSITIVE

Rules:
- Prefer FIX.
- SUPPRESS only with narrow scope and justification.
- WAIVE only with explicit owner approval + worklog record.

---

## Step 3 — Resolve + Verify

For each FIX:
- implement minimal change
- rerun the relevant command
- record output in the worklog ticket

For SUPPRESS/WAIVE/FALSE_POSITIVE:
- add evidence and rationale
- record decision in the worklog ticket

---

## Output (Required)

- List of bot findings with status: FIXED / NOT FIXED (why) / FALSE POSITIVE
- Verification commands + outputs
- Worklog ticket updated? YES/NO

---

## Stop Condition

Stop when:
- all required checks pass, and
- remaining items are explicitly waived with evidence.
