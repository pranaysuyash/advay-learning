# GitHub Issues Workflow (Issue Register Canonical)

This repo uses **two layers** of tracking:

1) **Canonical issue status**: `docs/audit/ISSUE_REGISTER.md` (deduped, decision-facing register)
2) **Execution log**: `docs/WORKLOG_ADDENDUM_*.md` (append-only; evidence-first; scope contract required)
3) **Collaboration mirror**: **GitHub Issues** (labels, assignees, discussion, PR linking)

## Rules

1. **The issue register is the source of truth for status.**
   - Scope and status live in `docs/audit/ISSUE_REGISTER.md`.
   - Detailed evidence and execution chronology live in worklog addendums.
   - Issues are a mirror for visibility and collaboration.

2. **1:1 mapping for important work**
   - Create a GitHub Issue for every **P0/P1** worklog ticket.
   - P2/P3 are optional unless they block others.

3. **Naming convention**
   - Issue title must start with ticket ID:
     - `TCK-YYYYMMDD-### :: <Short title>`

4. **Cross-linking**
   - The worklog ticket should include: `Issue: #<num>` or `Issue: Unknown`.
   - PRs should reference the Issue and ticket ID.

5. **Status semantics**
   - Close the Issue when the ticket is marked **DONE** in the worklog.
   - If work pauses, keep the Issue open but mark ticket `BLOCKED` or `OPEN` with next actions.

6. **No scope creep via Issues**
   - Extra requests in an Issue must become a **new** worklog ticket (append-only).

## When GitHub Is Not Available

If the workspace is not a git checkout or GH auth is not configured:

- Work normally using the worklog only.
- Set `Issue: Unknown` and record why under Evidence (Observed/Unknown).
