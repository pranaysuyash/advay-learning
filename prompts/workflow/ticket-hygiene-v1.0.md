# Ticket Hygiene Prompt v1.0

**Purpose**: Prevent ticket ID collisions, stale dashboards, and confusing “duplicate scope” tickets in `docs/WORKLOG_TICKETS.md`.

**Use When**:
- You are about to create a new ticket
- You see duplicated ticket IDs or contradictory status dashboards
- Multiple agents are working in parallel without git PR boundaries

---

## Non-Negotiable Rules

1) Append-only: never rewrite history.
2) Evidence-first: label claims Observed / Inferred / Unknown.
3) One work unit per ticket: don’t mix unrelated scopes.

---

## Step 1 — Find the Next Ticket ID (Mandatory)

Run:
```bash
rg -n "TCK-\\d{8}-\\d{3}" docs/WORKLOG_TICKETS.md | tail -n 30
```

Then:
- Choose the next available `###` number for today’s date.
- If IDs are non-sequential, still avoid collisions (pick a new unused number).

Record evidence in the new ticket:
- the `rg` command
- the output showing nearby IDs

---

## Step 2 — If You Find a Collision

If the same ID appears twice:
- Do NOT edit old entries.
- Append a “Worklog Correction” note:
  - `Observed`: where the collision exists
  - `Inferred`: what likely happened
  - `Resolution`: which ticket is canonical and what new ID will be used

---

## Step 3 — Dashboard Staleness

If the “Quick Status Dashboard” is stale or inconsistent:
- Do NOT rewrite old dashboard values.
- Append a new “Dashboard Refresh” block that:
  - states the new timestamp
  - states the current priority (with exact ticket ID)
  - optionally includes updated counts (Observed via grep/rg)

---

## Output (Required)

- Proposed ticket ID: `TCK-YYYYMMDD-###`
- Collision check: PASS/FAIL (with evidence)
- If FAIL: canonical ticket + correction appended
