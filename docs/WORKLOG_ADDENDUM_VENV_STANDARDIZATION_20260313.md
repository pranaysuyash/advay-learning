# Worklog Addendum: Venv Standardization

**Date:** 2026-03-13
**Agent:** codex

---

## TCK-20260313-002 :: Standardize repo Python environment to root .venv

Ticket Stamp: STAMP-20260313T181800-venv-standardization

Type: IMPROVEMENT
Owner: Pranay
Created: 2026-03-13
Status: **DONE**
Priority: P2
Prompt Trace: prompts/hardening/hardening-v1.1.md, prompts/review/local-pre-commit-review-v1.0.md
Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md

### Scope contract

- In-scope:
  - Standardize local scripts and setup docs on a single Python 3.13 environment.
  - Remove redundant nested backend virtual environments after verification.
- Out-of-scope:
  - Rewriting historical worklog entries that mention previous local env paths.
  - Changing branch protection or CI workflow behavior.
- Behavior change allowed: YES

### Findings

- Observed: the repo had three local virtual environments on disk: `/.venv`, `src/backend/.venv`, and `src/backend/venv`.
- Observed: root `/.venv` is Python 3.13.4 and already imports backend dependencies (`fastapi`, `sqlalchemy`, `alembic`, `pytest`, `ruff`, `uvicorn`, `asyncpg`, `redis`).
- Observed: runtime scripts and docs were inconsistent; some preferred `src/backend/.venv` while setup and editor config already preferred `/.venv`.
- Observed: `bash scripts/check.sh --quick` still fails on an unrelated repo-wide formatting backlog (`black --check` on legacy backend/script files), so that command is not yet a clean verification target for this cleanup scope.
- Inferred: keeping multiple active 3.13 envs increases drift risk and makes local verification dependent on whichever shell path gets activated first.

### Fix

- Standardized setup and helper scripts to activate only the repo root `/.venv`.
- Updated setup instructions to install both root and backend editable packages into the same env.
- Documented `src/backend/.venv` and `src/backend/venv` as legacy local environments.
- Removed the redundant nested backend env directories from the local workspace after verification.

### Verification

Commands executed:

```bash
git rev-parse HEAD
.venv/bin/python --version
.venv/bin/python - <<'PY'
mods=['fastapi','sqlalchemy','alembic','pytest','ruff','uvicorn','asyncpg','redis']
for m in mods:
    __import__(m)
    print(m, 'OK')
PY
bash -n scripts/check.sh scripts/dev.sh scripts/run-e2e.sh scripts/test-db-bootstrap.sh scripts/init-db.sh scripts/setup.sh
source .venv/bin/activate && cd src/backend && pytest tests/test_auth.py tests/test_cache_service.py -q
source .venv/bin/activate && bash scripts/check.sh --quick
```

### Status updates

- [2026-03-13 18:18 IST] **DONE** — standardized on repo root `/.venv`, updated scripts/docs, removed nested backend env directories locally, and fixed the pre-existing `src/main.py` lint error surfaced during verification.
- [2026-03-13 18:34 IST] **DONE** — confirmed the env cleanup itself is healthy; remaining `scripts/check.sh --quick` failure is an unrelated pre-existing Black backlog outside this ticket.
