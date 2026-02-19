# Pre-Merge Clean Room Check Prompt v1.0

**Purpose**: A strict “gate” prompt to run right before a PR/merge (or before handing work to another agent) to ensure the repo is clean, changes are intentional, and verification evidence exists.

**Use When**:

- Before opening a PR
- Before merging
- Before declaring a ticket DONE
- After resolving a merge conflict

---

## Non-Negotiable Rules

1) **No surprises**: every modified file must be explained by the ticket scope.
2) **No stray artifacts**: caches/logs/db/temp files must not be committed.
3) **Evidence-first**: provide command outputs; label Observed / Inferred / Unknown.
4) **Append-only worklog**: update `docs/WORKLOG_TICKETS.md` with verification evidence.

---

## Step 1 — Identify the Work Unit

State:

- Ticket ID:
- Scope contract:
  - In-scope:
  - Out-of-scope:
  - Behavior change allowed: YES/NO/UNKNOWN

If the ticket is unclear, STOP and run `prompts/workflow/agent-entrypoint-v1.0.md`.

---

## Step 2 — Clean Room Discovery (Mandatory)

If git is available:

```bash
git status --porcelain
git diff --stat
```

Always:

```bash
find . -maxdepth 4 -type f -name '.DS_Store' -o -name '*.log' -o -name '*.tmp' -o -name '*.bak' -o -name '*~'
find . -maxdepth 4 -type d -name '__pycache__' -o -name '.pytest_cache' -o -name '.mypy_cache' -o -name '.ruff_cache'
```

If you find artifacts:

- classify them (generated vs intentionally committed)
- remove/move only with explicit justification and worklog evidence

---

## Step 3 — Verification Commands (Pick the Minimal Set)

Run only what applies to the touched area(s).

### Frontend (if `src/frontend` changed)

```bash
npm -C src/frontend run type-check
npm -C src/frontend run lint
npm -C src/frontend test
```

### Backend (if `src/backend` changed)

Prefer project environment:

```bash
cd src/backend && uv run pytest
```

Optional:

```bash
cd src/backend && uv run ruff check .
cd src/backend && uv run mypy app/
```

### Docs-only changes

Minimum:

```bash
rg -n "TODO|FIXME|TBD" docs -S || true
```

If a command cannot be run, mark the claim as `Unknown` and state why.

---

## Step 4 — Scope Gate

For each modified file:

- Explain why it is in scope (1 sentence)
- If not in scope:
  - revert it, or
  - split into a new ticket

---

## Step 5 — Completion Report + Worklog Update (Required)

Append to the ticket in `docs/WORKLOG_TICKETS.md`:

- commands run and raw outputs
- summary of what changed
- whether acceptance criteria are met
- status change (DONE/BLOCKED)

If any acceptance criteria are not met:

- keep status IN_PROGRESS or BLOCKED
- list exact next actions

---

## Stop Condition

Stop after:

- repo is clean (no stray artifacts), and
- verification evidence is recorded, and
- ticket status is correctly updated.
