# WORKLOG UPDATE PROMPT v1.0

**Goal**: Ensure every agent run leaves a durable trail in `docs/WORKLOG_TICKETS.md` so another agent can resume work later.

---

## HARD RULES

1) Append-only: do not rewrite or reorder prior entries.
2) Evidence-first: include raw command outputs (or mark Unknown if not runnable).
3) Scope contract required for every ticket.
4) Status must be one of: OPEN | IN_PROGRESS | DONE | BLOCKED | DROPPED.

---

## WHEN TO CREATE A NEW TICKET

Create a new ticket when:

- starting a new audit/remediation/hardening effort
- starting a new feature slice
- starting a new QA/security/release effort

If continuing an existing ticket, append a “Status update” block to that ticket instead.

---

## REQUIRED TICKET FIELDS

Use this format (copy/paste and fill):

```markdown
### TCK-YYYYMMDD-### :: <Short title>
Type: <AUDIT|REMEDIATION|HARDENING|REVIEW|VERIFICATION|POST_MERGE|TRIAGE|FEATURE|TESTING|SECURITY|RELEASE|PRODUCT>
Owner: <name>
Created: <YYYY-MM-DD HH:MM TZ>
Status: **<OPEN|IN_PROGRESS|DONE|BLOCKED|DROPPED>**
Priority: <P0|P1|P2|P3>

Description:
<What is being done and why>

Scope contract:
- In-scope:
  - <explicit files or scope>
- Out-of-scope:
  - <explicit non-goals>
- Behavior change allowed: <YES|NO|UNKNOWN>

Targets:
- Repo: <name>
- File(s): <paths>
- Branch/PR: <branch or PR URL or Unknown>
- Range: <base..head or Unknown>
Git availability:
- <YES|NO|UNKNOWN> (if NO, Branch/PR and Range should typically be Unknown)

Acceptance Criteria:
- [ ] <testable>
- [ ] <testable>

Execution log:
- [YYYY-MM-DD HH:MM TZ] <action> | Evidence:
  - **Command**: `<command>`
  - **Output**:
    ```
    <raw output>
    ```
  - **Interpretation**: <Observed/Inferred/Unknown> — <one sentence>

Status updates:
- [YYYY-MM-DD HH:MM TZ] <status change> - <reason>

Next actions:
1) ...

Risks/notes:
- ...
```

---

## WIP UPDATE BLOCK (append inside ticket)

```markdown
Status updates:
- [YYYY-MM-DD HH:MM TZ] IN_PROGRESS - <what started>

Execution log:
- [YYYY-MM-DD HH:MM TZ] <what you tried> | Evidence: <command + output>

Next actions:
1) <next>
```

---

## DONE UPDATE BLOCK (append inside ticket)

```markdown
Acceptance Criteria:
- [x] <met>
- [x] <met>

Status updates:
- [YYYY-MM-DD HH:MM TZ] DONE - <summary>
```
