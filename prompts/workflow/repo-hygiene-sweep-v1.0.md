# Repo Hygiene Sweep Prompt v1.0

**Purpose**: Ensure an agent run leaves the repository clean, organized, and reproducible—no stray files, no ad-hoc variants, and no “mystery changes”.

**Use When**:
- After finishing any work (code or docs)
- Before handoff
- When you suspect prior runs left scratch artifacts behind

---

## Non-Negotiable Rules

1) **Preservation first**: Do not delete contributor work unless clearly inferior and you record why.
2) **Append-only tracking**: Update `docs/WORKLOG_TICKETS.md` without rewriting history.
3) **No loose artifacts**: No random files in project root, `src/`, or `docs/` outside intended folders.
4) **Evidence-first**: Every non-trivial claim must be labeled Observed / Inferred / Unknown.

---

## Step 0 — Confirm Work Type + Scope

Write a 3-line scope contract:
- In-scope:
- Out-of-scope:
- Behavior change allowed: YES/NO/UNKNOWN

If you cannot state scope clearly, STOP and run `prompts/workflow/agent-entrypoint-v1.0.md`.

---

## Step 1 — Discovery (Mandatory)

If git is available:
```bash
git status --porcelain
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Always:
```bash
ls -la
find . -maxdepth 3 -type f -name '*.tmp' -o -name '*.bak' -o -name '*~' -o -name '.DS_Store' -o -name '*.log'
find . -maxdepth 4 -type d -name '__pycache__' -o -name '.pytest_cache' -o -name '.mypy_cache' -o -name '.ruff_cache'
rg -n "TEMP|SCRATCH|WIP_ONLY|DO_NOT_COMMIT" -S . || true
```

Evidence log format:
- **Command**: `...`
- **Output**: (raw)
- **Interpretation**: Observed/Inferred/Unknown — one sentence

---

## Step 2 — Classify Any Stray Files (Do Not Delete Blindly)

For each suspicious file, label it:
- **Generated** (cache/output): safe to remove if not intentionally committed
- **Scratch** (ad-hoc experiments): must be moved into a proper place or removed
- **Untracked dependency** (e.g., `node_modules`): keep out of git; confirm `.gitignore`
- **New canonical artifact**: must be placed under an appropriate folder with clear naming

Examples of “stray”:
- `test.py`, `scratch.ts`, `notes.txt` in repo root
- `Game_v2.tsx` or `main_new.py` parallel versions
- Unscoped docs sitting in `docs/` without a home

---

## Step 3 — Repo Organization Rules (Apply Only If Needed)

### A) Where files belong
- Prompts → `prompts/<category>/...`
- Audits → `docs/audit/<sanitized-file>.md`
- Plans → `docs/plans/<ticket>-...md`
- General documentation → `docs/` (must be linked from an index doc if it’s core)
- One-off notes → `docs/project-management/` (if process-related) or convert into a ticket

### B) Naming rules
- No `*_v2`, `*_final`, `*_new` for canonical code.
- Prefer refactoring the original file, or a rename/move with explicit rationale.

### C) If you must remove a file
Only remove if:
1) You can prove it’s generated or inferior, and
2) You record the decision in the worklog ticket with evidence.

---

## Step 4 — Verify `.gitignore` (If git exists)

Check that common artifacts are ignored:
- Python caches: `__pycache__/`, `.pytest_cache/`
- Node: `node_modules/`, `dist/`
- OS: `.DS_Store`

If adding new ignore rules:
- Keep them minimal and specific
- Record rationale in worklog

---

## Step 5 — Final Verification Gate (Required)

1) Re-run discovery:
```bash
git status --porcelain
```
2) Ensure no unintended outputs or caches were committed.
3) Ensure the worklog ticket includes:
- Scope contract
- Evidence (commands + outputs)
- Final status (DONE/BLOCKED)
- Next action

---

## Output (Required)

Produce a short report:
- **Stray artifacts found**: (none or list)
- **Actions taken**: (moved/removed/ignored)
- **Remaining risks**: (Unknowns)
- **Worklog update**: ticket ID + status change

STOP after the repo is clean and the ticket is updated.
