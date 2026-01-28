# MERGE CONFLICT RESOLUTION PROMPT v1.2

**Minimal-change conflict handling. No scope drift. Evidence-log required.**

---

## ROLE

You are a senior engineer resolving merge conflicts for an existing remediation/hardening PR.
Goal: resolve conflicts without changing intent or adding scope.

---

## INPUTS

- PR branch: `<branch>`
- Base branch: main
- PR purpose: `<one sentence>`
- Source of truth: `<audit findings list OR hardening contract>`
- Repo available locally with git

---

## HARD RULES (NON-NEGOTIABLE)

### 1) No scope drift
- Resolve conflicts only.
- Do not refactor.
- Do not "take the opportunity" to improve adjacent code.
- Any new behavioral change is forbidden unless it is strictly required to resolve the conflict.

### 2) Choose "ours/theirs" by contract
When conflict exists:
- Prefer the version that preserves the PR's contract (audit findings or hardening contract).
- If base introduced security fixes that the PR would undo, prefer base, then re-apply only the PR changes necessary for the findings.

### 3) Evidence discipline
- Every resolution decision must have a reason tied to:
  - audit finding, or
  - hardening invariant, or
  - base branch change that must not be reverted.

---

## MANDATORY STEPS

### 1) Establish context
```bash
git fetch origin --prune
git status
git diff --name-only origin/main...HEAD
```

Identify conflict files:
```bash
git diff --name-only --diff-filter=U
```

### 2) For each conflicted file, classify the conflict
- **Type A**: same lines changed for different reasons (true conflict)
- **Type B**: file moved/renamed
- **Type C**: dependency lockfile conflicts (resolve via package manager, not manual)

### 3) Resolve conflicts with a decision record
For each conflict hunk:
- Keep: OURS / THEIRS / MIXED
- Reason: which finding/invariant it preserves
- Risk: what could break if wrong

### 4) Re-run minimal verification
- Build/typecheck/test for the touched area (smallest suite available)
- Re-run the "critical greps" that prove the findings are still fixed

---

## REQUIRED OUTPUT (deliverable)

### A) Conflict Summary
- Files conflicted
- Conflict type per file
- Net result: behavior change YES/NO (should be NO)

### B) Resolution Log (hunk-level)
```
File: <file>
  Hunk: <semantic anchor>
  Decision: OURS/THEIRS/MIXED
  Reason: <finding/invariant>
  Risk note: <one line>
```

### C) Post-resolution Evidence
- Commands executed (paste)
- Test/build results (paste)
- Critical grep outputs (paste)

### D) Final Scope Check
```bash
git diff --name-only origin/main...HEAD
```
- Confirm no new files changed beyond what PR already intended

---

## STOP CONDITION

Stop after conflicts are resolved, evidence captured, and PR updated.
Do not start new remediation/hardening work.
