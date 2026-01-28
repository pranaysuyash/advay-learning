# Ownership Policy (One Codebase)

- There is **one codebase**. “Preexisting” or “someone else wrote it” is not a reason to ignore a problem.
- **Find it → Ticket it**: Every discovered bug/tech-debt item must have a worklog ticket (`docs/WORKLOG_TICKETS.md`, append-only).
- **Fix or file**: If it’s in-scope, fix it now. If not, create a new ticket and keep your current scope clean.
- **No scope creep**: New findings go to new tickets; don’t silently expand the current one.
- **Evidence-first**: Observed / Inferred / Unknown for every claim.
- **Preservation-first**: Don’t delete contributor code unless clearly inferior and recorded.
- **Verification required**: Changes tied to a finding must include minimal verification (tests/typechecks) recorded in the worklog.
