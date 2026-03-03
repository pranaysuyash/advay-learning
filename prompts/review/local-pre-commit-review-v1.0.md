# Local Pre-Commit Review (Findings-First Commit Gate) v1.0

## Purpose

Use this prompt immediately before any code-changing commit to perform a local, findings-first code review on the staged diff. The goal is to catch bugs, regressions, broken integrations, incomplete refactors, missing tests, and misleading documentation before the commit lands.

This is a local commit gate, not a PR review replacement.

## When To Use

- Any commit that changes `src/`
- Any commit that changes `docs/audit/`
- Any commit that changes hooks, build scripts, or shared workflow tooling

## Core Review Stance

Review the staged diff as if you are the strict reviewer for a teammate's PR.

- Findings first
- Prefer concrete defects over broad summaries
- Assume regressions are possible in any refactor
- Treat missing verification as a real risk
- If something looks partial, prove it is complete before allowing commit

## Required Inputs

1. Staged diff
2. Relevant prior version(s) for touched files
3. Any touched tests
4. Any touched docs/worklog entries

## Review Checklist

### 1. Scope Integrity

- Does the diff match the ticket scope?
- Did unrelated behavior move accidentally?
- Are there partial migrations, half-finished renames, or duplicate implementations left behind?

### 2. Findings-First Defect Sweep

Check for:

- Broken imports / missing exports
- Incorrect types / contract drift
- Removed behavior without replacement
- Stale routes, registries, or references
- Dead code or orphaned components
- Duplicate declarations or unreachable branches
- Comment/documentation claims that do not match the real code

### 3. Refactor Safety

For refactors, splits, or wrapper migrations:

- Compare old vs new behavior directly
- Confirm the new implementation is additive or better
- Confirm no user-facing flow was dropped
- If work was split across files, verify the combined result is complete

### 4. Integration Review

- Are imports, routes, registries, and entrypoints aligned?
- Are tests still targeting the real canonical files?
- Are assets/scripts/docs still pointing at correct paths?

### 5. Validation Coverage

- What tests or checks were run?
- Do the checks actually cover the changed behavior?
- If no direct verification was run, call that out as a risk

### 6. Merge/Commit Recommendation

End with one of:

- `PASS` - no material findings found
- `PASS WITH RISKS` - commit is acceptable, but specific risks remain
- `BLOCK` - concrete issues must be fixed before commit

## Required Output Format

1. Findings (ordered by severity, with file references)
2. Open risks / verification gaps
3. Short summary of commit readiness

If there are no findings, state that explicitly and still list residual risks or gaps.

## Required Trace In Worklog

For any code/audit change that uses this review gate, the updated worklog addendum must include:

`Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md`

This trace is required so later agents can confirm the local review gate was actually used.
