# HANDOFF PROMPT v1.0

**Goal**: Write a handoff note that lets another agent pick up immediately without re-discovery.

---

## INPUTS

- Ticket ID: `<TCK-...>`
- Work type: `<AUDIT/REMEDIATION/HARDENING/etc>`
- Current status: `<OPEN/IN_PROGRESS/BLOCKED/etc>`
- What was changed (files): `<list>`
- What is not yet done: `<list>`
- Evidence: `<commands + outputs>` (or Unknown)

---

## OUTPUT (paste into the existing ticket in `docs/WORKLOG_TICKETS.md`)

```markdown
Handoff note:
- Current state: <1–3 sentences>
- What’s done: <bullets>
- What’s next (ordered): <bullets>
- Blockers: <if any>
- Key evidence:
  - **Command**: `...`
  - **Output**:
    ```
    ...
    ```
```

---

## QUALITY BAR

- No “should be fine” language.
- If you didn’t run a command, mark the related claim Unknown.
- Include the exact file paths and commands required to continue.
