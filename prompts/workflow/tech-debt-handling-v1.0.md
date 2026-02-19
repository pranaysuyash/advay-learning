# Tech Debt & Preexisting Issues Handling Prompt v1.0

**Purpose**: When an agent discovers bugs/tech debt (even if “preexisting”), they must take ownership: ticket it, scope it, or fix it within the current ticket—no deferring without a ticket.

---

## Non-Negotiable Rules

1) One codebase: no “not my code” excuses.
2) Every discovered issue gets a worklog ticket (append-only).
3) If in-scope to fix now, fix it; if not, create a new ticket and stop scope creep.
4) Evidence-first: Observed / Inferred / Unknown.
5) Preservation-first: don’t delete contributor work unless clearly inferior and recorded.

---

## Step 1 — Classify the Finding

- Type: BUG | TECH_DEBT | SECURITY | DOCS | TEST_FLAKE | UNKNOWN
- Impact: P0/P1/P2/P3 (justify)
- Area: frontend | backend | docs | infra | unknown

If classification is unclear, mark `UNKNOWN` and open a TRIAGE ticket.

---

## Step 2 — Decide Action Path

- **A) Fix now (within current ticket)**  
  - Only if it is squarely within the current ticket’s scope.  
  - Add acceptance criteria and verification for this finding.
- **B) New ticket**  
  - Create `TCK-YYYYMMDD-###` with scope contract, acceptance criteria, and evidence of the finding.  
  - Update current ticket “Out-of-scope” to reference the new ticket.
- **C) Blocked**  
  - Create ticket, set `Status: BLOCKED`, list blockers.

Never leave a finding un-ticketed.

---

## Step 3 — Evidence Block (append to ticket)

For each finding:

- Evidence command/output (Observed)
- Impact/priority rationale (Inferred)
- Action chosen (Fix now / New ticket / Blocked)

---

## Step 4 — Verification (if fixed now)

- Run the minimal verification relevant to the change (tests/typechecks).
- Record commands + outputs in the worklog.

---

## Stop Condition

- Every discovered issue is either fixed within scope **or** has its own ticket with status and next actions.  
- Current ticket’s scope remains clear (no silent scope creep).
