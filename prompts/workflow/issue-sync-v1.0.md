# Issue Sync Prompt v1.0 (Worklog ↔ GitHub Issues)

**Purpose**: Create/update/close GitHub Issues that mirror `docs/WORKLOG_TICKETS.md` tickets, while keeping the worklog as the single source of truth.

**Use When**:
- A ticket becomes P0/P1 and needs a GitHub Issue
- A ticket status changes (OPEN → IN_PROGRESS → DONE/BLOCKED)
- You want to ensure Issue titles/labels are consistent and non-duplicated

---

## Preconditions

- GitHub remote exists: **YES/NO/UNKNOWN**
- GH CLI available + authenticated: **YES/NO/UNKNOWN**

If either is NO/UNKNOWN, do not attempt to create Issues; update the worklog with `Issue: Unknown` and why.

---

## Non-Negotiable Rules

1) Worklog is canonical.
2) One ticket maps to at most one Issue.
3) Issue title must start with `TCK-YYYYMMDD-###`.
4) Append-only updates to `docs/WORKLOG_TICKETS.md`.

---

## Step 1 — Select Ticket + Extract Metadata

From the worklog ticket, extract:
- Ticket ID + title
- Type, Priority, Status
- Scope contract (in-scope/out-of-scope)
- Acceptance criteria
- Current risks/notes

If any are missing, stop and fix the ticket first.

---

## Step 2 — Check for Existing Issues (Avoid Duplicates)

Preferred (gh):
```bash
gh issue list --search "TCK-YYYYMMDD-###" --state all
```

If you find:
- 0 matches: create Issue
- 1 match: update Issue
- 2+ matches: stop and open a worklog “collision” note; do not create more

---

## Step 3 — Create or Update Issue

### Title
`TCK-YYYYMMDD-### :: <Short title>`

### Body Template
Include:
- Ticket link (path to `docs/WORKLOG_TICKETS.md` + ticket ID)
- Status + priority
- Scope contract (in/out)
- Acceptance criteria
- Verification commands (what to run)
- “Worklog is canonical” note + link to `docs/ISSUES_WORKFLOW.md`

### Labels (recommended)
- `type:bug` / `type:feature` / `type:docs` / `type:security` / `type:workflow`
- `priority:P0..P3`
- `status:open|in-progress|blocked`

---

## Step 4 — Sync Status

When ticket status changes:
- OPEN → Issue open
- IN_PROGRESS → Issue open + label `status:in-progress`
- BLOCKED → Issue open + label `status:blocked`
- DONE → close Issue

---

## Step 5 — Update Worklog

Append to the ticket:
- `Issue: #<num>` (or `Unknown`)
- Evidence commands + outputs used to create/update/close

---

## Stop Condition

Stop when:
- ticket has a linked Issue (or a recorded reason it cannot), and
- issue status matches ticket status.
