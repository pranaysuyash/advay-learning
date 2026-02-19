# GitHub Issue → Worklog Ticket Intake Prompt v1.0

**Purpose**: Convert a GitHub Issue into a properly-scoped, evidence-first worklog ticket in `docs/WORKLOG_TICKETS.md` (append-only).

**Use When**:

- A user reports a bug via GitHub
- A feature request comes in via Issues
- You want to ensure Issues don’t silently create scope creep

---

## Inputs

- Issue link or number: `#123`
- Issue title:
- Issue body (copy/paste):

---

## Non-Negotiable Rules

1) The worklog is canonical; Issues are mirrors.
2) Append-only: do not rewrite old tickets.
3) One issue → one ticket (unless the issue contains multiple unrelated requests; then split).
4) Evidence-first: if you cannot reproduce, mark key claims `Unknown`.

---

## Step 1 — Decompose the Issue

Extract:

- Problem statement
- Expected vs actual
- Repro steps (or missing info)
- Impact / priority
- Suspected area (frontend/backend/docs/unknown)

If missing repro steps:

- write a “Need info” question list
- still create a TRiAGE ticket with Status OPEN

---

## Step 2 — Assign Work Type

Pick exactly one:

- BUGFIX (HARDENING)
- FEATURE
- SECURITY
- DOCS
- TRIAGE

If the issue asks “why tests fail” without a finding: TRIAGE.

---

## Step 3 — Create Worklog Ticket (Append-only)

Create a new `TCK-YYYYMMDD-###` entry with:

- Scope contract (explicit file targets if known)
- Acceptance criteria (testable)
- Evidence plan (commands to run)
- Link back to the Issue: `Issue: #123`

---

## Step 4 — Recommend Next Prompt

Based on work type, point to the next prompt file:

- planning: `prompts/planning/implementation-planning-v1.0.md`
- audit: `prompts/audit/audit-v1.5.1.md`
- hardening: `prompts/hardening/hardening-v1.1.md`
- remediation: `prompts/remediation/implementation-v1.6.1.md`

---

## Stop Condition

Stop after the ticket is appended and the next prompt is specified.
