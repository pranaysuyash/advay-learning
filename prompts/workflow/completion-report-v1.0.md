# COMPLETION REPORT PROMPT v1.0

**Goal**: Standardize how an agent reports success/failure for a ticket so others can trust “DONE”.

---

## INPUTS

- Ticket ID: `<TCK-...>`
- What changed: `<files/areas>`
- Acceptance criteria: `<list>`
- Evidence: `<commands + outputs, screenshots/notes>`

---

## OUTPUT (paste into the existing ticket in `docs/WORKLOG_TICKETS.md`)

```markdown
Completion report:
- Acceptance criteria results:
  - [x] ...
  - [ ] ... (if not met, explain)
- Verification evidence:
  - **Command**: `...`
  - **Output**:
    ```
    ...
    ```
- Regressions checked: YES/NO/UNKNOWN (with evidence)
- Rollback plan: <steps or Unknown>
- Final status recommendation: DONE / BLOCKED / DROPPED
```

---

## HARD RULES

- Never mark DONE without evidence for each acceptance criterion (or mark it Unknown).
- If you couldn’t run a command, include the exact command another agent should run.
