# Git Workflow

## Overview

This repo uses a **main-first workflow** optimised for a single owner with multiple concurrent AI agents.

## Branch Structure

```
origin/main  ←  all merged work
    ↑
codex/wip-<scope>  ←  created only when PR is needed
```

There is no `develop` branch. There are no `feature/*`, `fix/*`, `hotfix/*`, or `release/*` branches.

## Day-to-Day Workflow

### 1. Work directly on local `main`

All iterative work — commits, experiments, incremental changes — happens on local `main`. This includes work from multiple concurrent agents. There is no friction creating a branch just to commit.

```bash
# Work, stage, commit freely on local main
git add -A
git commit -m "feat(games): improve pinch detection threshold"
```

### 2. When the user asks to open a PR

Run the **only approved branch creation command**:

```bash
./scripts/start_wip_branch.sh <ticket-or-scope>
# Examples:
./scripts/start_wip_branch.sh TCK-20260316-010
./scripts/start_wip_branch.sh cv-coordinate-fixes
```

This script automatically:
1. Creates `codex/wip-<scope>` at the current `HEAD` (carries all local-main commits)
2. Resets local `main` back to `origin/main` (so `main` is clean for the next task)
3. Pushes `codex/wip-<scope>` to `origin`
4. Opens a PR against `main`

After this, local `main` is ready for the next batch of work while the PR is under review.

### 3. While PR is under review

Continue committing new work to local `main` as normal.

### 4. After PR is merged

```bash
git checkout main
git pull origin main
```

Local `main` is now synced. Any new local-main commits are still there, ready for the next PR.

## Enforcement

**Agents MUST NOT create branches with any other command.** The following are prohibited:

```bash
# ❌ ALL of these are blocked
git switch -c <branch>
git checkout -b <branch>
git branch <branch>
```

The `pre-commit` hook blocks commits on any branch not created via `start_wip_branch.sh`.  
The `pre-push` hook blocks:
- Any push directly to `origin/main`
- Any push of a new branch not created via `start_wip_branch.sh`

## Multiple Concurrent PRs

Multiple WIP branches are allowed when the user explicitly requests parallel PRs (e.g., multiple agents each handling a distinct scope). Each agent runs `start_wip_branch.sh` with its own scope name.

## Commit Message Format

```
<type>(<scope>): <description>

<body — optional>

Refs: TCK-YYYYMMDD-NNN
```

**Types:** `feat` · `fix` · `docs` · `refactor` · `test` · `chore`

**No `Co-authored-by:` trailers.** All commits are authored by the repo owner (pranaysuyash) only.

## Merge Strategy

- Squash merge into `main`
- Delete WIP branch after merge
- `git pull origin main` on local `main` to sync

## Common Commands

```bash
# Check status
git status
git log --oneline origin/main..HEAD   # commits not yet in a PR

# Start PR workflow (only when asked)
./scripts/start_wip_branch.sh <scope>

# Sync local main after a PR merges
git checkout main && git pull origin main

# Recover if you accidentally need to check what's in a PR branch
git fetch origin codex/wip-<scope>
git diff main origin/codex/wip-<scope>
```

