# Deprecation Policy Prompt v1.0

**Purpose**: Provide a consistent, low-risk way to retire old code paths without deleting contributor work prematurely or causing regressions.

**Use When**:
- Replacing an endpoint/component/module
- Removing a feature or “alternate implementation”
- Consolidating duplicated files
- Changing public APIs or behavior

---

## Non-Negotiable Rules

1) **Preservation first**: do not delete existing code without justification + evidence.
2) **Single source of truth**: one canonical implementation in active use.
3) **Testable migration**: critical flows must have tests or an executable verification script.
4) **Scope discipline**: one deprecation scope per ticket.
5) **Worklog evidence**: record what changed and how it was verified.

---

## Step 1 — Identify Deprecation Target

Write:
- What is being deprecated (file/symbol/endpoint)
- Why (bug risk, duplication, performance, maintainability)
- Replacement target (canonical path)

Prove usage:
- **Frontend**: routed/imported component is canonical (Observed via imports/routes)
- **Backend**: router inclusion shows which endpoints are active (Observed via `include_router`)

---

## Step 2 — Choose a Deprecation Strategy

### Strategy A: Soft-deprecate (preferred)
- Keep old interface working
- Emit warnings in logs (avoid user-facing noise for kids)
- Document the new path
- Set a removal date or condition

### Strategy B: Bridge-and-replace
- Keep old entrypoint
- Internally delegate to new implementation
- Keep compatibility tests for old behavior

### Strategy C: Hard-remove (rare)
Only if:
- Unused (Observed) and
- Clearly harmful or unmaintainable and
- Removal is required for safety/security

---

## Step 3 — Migration Checklist (Required)

For each deprecated item:
- [ ] Identify all references (`rg -n "<name>" -S src`)
- [ ] Update references to the canonical path
- [ ] Add/adjust tests verifying critical behavior
- [ ] Update docs where the old path is mentioned

If you cannot update all references safely:
- keep deprecation “soft” and open a follow-up ticket

---

## Step 4 — Verification Gate

Run the minimal applicable verification:
- Frontend: `npm -C src/frontend run type-check`
- Backend: `cd src/backend && uv run pytest`

Record outputs in the worklog.

---

## Step 5 — Worklog Requirements

Append to `docs/WORKLOG_TICKETS.md`:
- what was deprecated and why
- what became canonical and why (Observed)
- what verification was run (commands + outputs)
- what remains (follow-ups)

---

## Output (Required)

- Deprecation summary: target → replacement
- Reference update evidence
- Verification evidence
- Ticket status update (DONE/BLOCKED)

---

## Stop Condition

Stop when there is:
- one canonical path in use, and
- a documented migration/deprecation note, and
- verification evidence in the worklog.
