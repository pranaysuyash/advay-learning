# Process Reminder (Run Before Work)

**Single source of truth**: `docs/WORKLOG_TICKETS.md`  
**Do first**: `prompts/workflow/pre-flight-check-v1.0.md`

## Must Do (in order)

1. Read `AGENTS.md`.
2. Run `prompts/workflow/agent-entrypoint-v1.0.md`.
3. Create/confirm ticket in `docs/WORKLOG_TICKETS.md` (append-only, unique ID).
4. Plan with the right prompt (e.g., `prompts/planning/implementation-planning-v1.0.md`) before coding.
5. Code within the scope contract (one scope only).
6. Verify and clean: `prompts/workflow/pre-merge-clean-room-check-v1.0.md`.
7. Update ticket with evidence and final status.

## Anti-Drift Rules

- No ticket → no code.
- One scope per ticket; new findings = new ticket.
- Preservation first: no `*_v2` forks; refactor in place.
- Evidence-first: Observed / Inferred / Unknown labels.
- Append-only: never rewrite past worklog entries.

## If Things Look Messy

- Run `prompts/workflow/ticket-hygiene-v1.0.md` (duplicate IDs).
- Run `prompts/workflow/repo-hygiene-sweep-v1.0.md` (stray files).
- Run `prompts/workflow/preservation-first-upgrade-v1.0.md` (parallel versions).
