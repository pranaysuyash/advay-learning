# Command Toolkit (rg-first)

This repo prefers fast, reproducible discovery commands. Default to `rg` over `grep`.

## Always Run (First 2 minutes)

```bash
# Ticket scan (helps avoid collisions and see current work)
rg -n "TCK-\\d{8}-\\d{3}" docs/WORKLOG_TICKETS.md | tail -n 30

# Find TODOs / fixmes
rg -n "TODO|FIXME|HACK" -S src docs prompts || true

# Quick inventory (docs + prompts)
find docs -maxdepth 2 -type f -name '*.md' | sort
find prompts -maxdepth 3 -type f -name '*.md' | sort
```

## Local Workflow Gate (No PR Required)

```bash
# Ensure repo-managed hooks are enabled
git config core.hooksPath .githooks
git config --get core.hooksPath

# Run the workflow gate against staged changes
./scripts/agent_gate.sh --staged
```

## Canonical File Finding

```bash
# Find where a feature is actually wired/used
rg -n "<keyword>" -S src

# Frontend entrypoints/routes
rg -n "react-router|Routes\\b|<Route\\b" -S src/frontend/src

# Backend routing
rg -n "include_router\\(|APIRouter\\(|@router\\.(get|post|put|delete)" -S src/backend/app
```

## “No Parallel Versions” Check

```bash
# Detect suspicious duplicates
find src -maxdepth 8 -type f \\( -name '*_v2.*' -o -name '*_new.*' -o -name '*copy*' -o -name '*backup*' -o -name '*old*' \\)
```

## Refactor Thresholds (Lightweight)

```bash
wc -l <file>
rg -n "<symbol>" <file>
```

## Backend Verification (preferred)

```bash
cd src/backend && uv run pytest -q
```

## Frontend Verification (preferred)

```bash
npm -C src/frontend run type-check
```

## Notes

- If `rg` is missing, install ripgrep or document the blocker as `Unknown`.
- If git is unavailable, record it and avoid git-only claims.
