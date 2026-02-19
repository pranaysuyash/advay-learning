# Worklog → GitHub Issues Triage Prompt v1.0

**Purpose**: Convert a batch of OPEN/P0–P1 worklog tickets into GitHub Issues with consistent labels, and append Issue links back into the worklog.

**Use When**:

- The worklog is becoming hard to scan
- You want team visibility without changing the canonical worklog process

---

## Inputs

- Ticket filter: (default) `Priority P0/P1 and Status OPEN/IN_PROGRESS`
- Max issues to create this run: (default) 5

---

## Non-Negotiable Rules

1) Worklog is canonical; Issues are mirrors.
2) Append-only edits to `docs/WORKLOG_TICKETS.md`.
3) Do not create duplicate Issues for the same ticket ID.
4) If GH auth/repo is unavailable, stop after generating a “ready-to-create” list.

---

## Step 1 — Collect Candidate Tickets

From `docs/WORKLOG_TICKETS.md`, list tickets matching the filter:

- Ticket ID, title
- Type, priority, status
- One-line summary

Evidence:

```bash
rg -n "### TCK-" docs/WORKLOG_TICKETS.md
```

---

## Step 2 — For Each Ticket (Up to Max)

1) Check if an Issue already exists:

```bash
gh issue list --search "<ticket-id>" --state all
```
1) If none exists, create one using `prompts/workflow/issue-sync-v1.0.md`.
2) Append `Issue: #...` to the ticket with evidence.

---

## Output (Required)

- Issues created: list `ticket → #issue`
- Issues skipped: list with reason
- Remaining queue: next 5 tickets to process

---

## Stop Condition

Stop after reaching the max issues or you hit an auth/repo blocker (record it).
