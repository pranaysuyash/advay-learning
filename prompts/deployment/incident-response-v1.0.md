# INCIDENT RESPONSE PROMPT v1.0

**Goal**: Handle a production/staging incident with clear triage, mitigation, comms, and follow-up tickets.

---

## INPUTS

- Incident summary: `<what broke>`
- Impact: `<who/what>`
- Start time: `<timestamp>`
- Environment: `<staging/prod>`
- Evidence: `<logs/errors/screenshots>`

---

## OUTPUT (REQUIRED)

### A) Incident classification
- Severity: SEV-1/2/3
- Customer impact summary

### B) Immediate mitigation plan
- “Stop the bleeding” actions (no heroics)
- Rollback options
- Safety/privacy implications (kid + camera)

### C) Investigation plan
- Top hypotheses (Inferred unless proven)
- Commands to run / data to gather

### D) Communications
- Short stakeholder update (template)

### E) Follow-up tickets (append-ready)
- 2–6 tickets: fix, tests, monitoring, docs

---

## STOP CONDITION

Stop after mitigation plan + tickets + comms template.
