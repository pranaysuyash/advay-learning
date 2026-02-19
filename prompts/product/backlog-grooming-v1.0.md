# BACKLOG GROOMING PROMPT v1.0 (PM)

**Goal**: Turn an unstructured backlog (tickets, ideas, bugs) into a prioritized queue with clear next actions.

---

## INPUTS

- Backlog source: `<paste ticket list, issues, or notes>`
- Constraints: `<time/budget/priority theme>`
- Stakeholder priorities (optional): `<list>`

---

## OUTPUT (REQUIRED)

### A) Dedupe + normalize

- Merge duplicates
- Rewrite titles to be action-oriented

### B) Prioritize

For each item:

- Priority: P0/P1/P2/P3
- Why now (1 sentence)
- Dependencies (ticket IDs if any)

### C) Next 1–3 work units

Pick the next work units with:

- In-scope/out-of-scope
- Acceptance criteria
- Recommended prompt to run next

---

## STOP CONDITION

Stop after prioritized queue + next work units.
