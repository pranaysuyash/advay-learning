# Pre-Flight Check Prompt v1.0 (Anti-Drift)

**Purpose**: Enforce the required workflow order before any agent does work. Run this first; if it fails, stop and fix the gaps.

---

## Non-Negotiable Order
1) Read `AGENTS.md` (scope, evidence-first, preservation).
2) Run `prompts/workflow/agent-entrypoint-v1.0.md` to pick work type + scope.
3) Append/confirm ticket in `docs/WORKLOG_TICKETS.md` (append-only, unique ID).
4) If implementation/remediation/hardening: run `prompts/planning/implementation-planning-v1.0.md` (or the role-appropriate planner) before coding.
5) After changes: run `prompts/workflow/pre-merge-clean-room-check-v1.0.md`.

You must not code before steps 1–4 are done.

---

## Step 0 — Inputs
- Request summary: `<what the user asked>`
- Repo access: YES/NO/UNKNOWN
- Git available: YES/NO/UNKNOWN

If git or repo access is missing, record `Unknown` and continue with what’s possible.

---

## Step 1 — Quick Drift Scan
Run:
```bash
rg -n "TCK-" docs/WORKLOG_TICKETS.md | tail -n 30
```
If you see:
- Duplicate ticket IDs → run `prompts/workflow/ticket-hygiene-v1.0.md` first.
- Missing ticket for current work → create it now (stop until done).

---

## Step 2 — Scope Contract (Required)
Capture (one scope only):
- In-scope:
- Out-of-scope:
- Behavior change allowed: YES/NO/UNKNOWN

If unclear, stop and clarify.

---

## Step 3 — Select Next Prompt
- Implementation/hardening → `prompts/planning/implementation-planning-v1.0.md`
- Audit → `prompts/audit/audit-v1.5.1.md`
- Remediation → `prompts/remediation/implementation-v1.6.1.md`
- Verification → `prompts/verification/verification-v1.2.md`
- Review → `prompts/review/pr-review-v1.6.1.md`

---

## Step 4 — Gate to Coding
Coding can start only after:
- Ticket exists and is IN_PROGRESS
- Plan prompt completed (for implementation/hardening/remediation)
- Acceptance criteria captured

---

## Step 5 — Evidence Block (to append into ticket)
Record:
- Commands run (status/git)
- Ticket ID and status
- Scope contract
- Next prompt chosen

---

## Stop Condition
Stop when a valid ticket exists, scope is clear, and the correct “next prompt” is specified. Only then proceed to code with the chosen prompt.
