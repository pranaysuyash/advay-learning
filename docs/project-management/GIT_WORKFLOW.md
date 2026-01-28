# Git Workflow

## Overview

We use a **simplified Git Flow** optimized for a small team (you and AI assistant) with emphasis on code quality over automation.

## Branch Structure

```
main (production)
  ↑
develop (integration)
  ↑
feature/*  fix/*  docs/*
```

### Branch Purposes

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production-ready, stable releases | Manual verification required |
| `develop` | Integration branch, feature collection | PR review required |
| `feature/*` | New features | None (work branches) |
| `fix/*` | Bug fixes | None (work branches) |
| `docs/*` | Documentation | None (work branches) |
| `hotfix/*` | Critical production fixes | Fast-track review |

## Workflow Steps

### 1. Starting a New Feature

```bash
# Update local develop
git checkout develop
git pull origin develop

# Create feature branch with descriptive name
git checkout -b feature/hand-tracking-basics

# Alternative naming examples:
# git checkout -b feature/alphabet-hindi-module
# git checkout -b feature/drawing-canvas-ui
# git checkout -b fix/camera-initialization-error
```

### 2. Making Commits

```bash
# Stage changes
git add src/hand_tracking/detector.py

# Commit with conventional message
git commit -m "feat(hand_tracking): add hand landmark detection

- Implement MediaPipe hand tracking integration
- Add coordinate normalization
- Include confidence threshold filtering

Relates to: #12"
```

#### Commit Message Format

```
<type>(<scope>): <subject>

<body> (optional)

<footer> (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

**Scopes:**
- `hand_tracking`
- `face_tracking`
- `ui`
- `games`
- `alphabet`
- `words`
- `storage`
- `auth`
- `config`
- `deps`

### 3. Keeping Branch Updated

```bash
# While on feature branch, update from develop
git fetch origin
git rebase origin/develop

# Or merge if preferred
git merge origin/develop
```

### 4. Pre-Push Checks

```bash
# Run quality checks
./scripts/check.sh

# Check test coverage
pytest --cov=src --cov-report=term-missing

# Check LOC changed
git diff --stat develop...HEAD
```

### 5. Creating Pull Request

```bash
# Push branch
git push -u origin feature/hand-tracking-basics

# Create PR (using GitHub CLI or web)
gh pr create --title "feat(hand_tracking): add hand landmark detection" \
             --body-file .github/pull_request_template.md
```

### 6. PR Review Checklist

**Author Checklist:**
- [ ] Branch is up-to-date with develop
- [ ] All tests pass
- [ ] Code is formatted (black)
- [ ] Linting passes (ruff)
- [ ] Type checking passes (mypy)
- [ ] PR size is reasonable (< 300 LOC preferred)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if user-facing)

**Reviewer Checklist:**
- [ ] Code logic is correct
- [ ] Edge cases handled
- [ ] Error handling appropriate
- [ ] Tests cover new functionality
- [ ] No security concerns
- [ ] Performance acceptable

### 7. Merging

```bash
# After approval, merge to develop
git checkout develop
git merge --no-ff feature/hand-tracking-basics

# Delete feature branch
git branch -d feature/hand-tracking-basics
git push origin --delete feature/hand-tracking-basics
```

## PR Size Management

### Why Size Matters

- Smaller PRs = faster reviews = fewer bugs
- Easier to understand context
- Quicker to test and merge

### Size Guidelines

| Metric | Target | Maximum |
|--------|--------|---------|
| Lines Changed | < 200 | 400 |
| Files Changed | < 8 | 15 |
| Commits | < 5 | 10 |

### Checking PR Size

```bash
# Script to check LOC against develop
./scripts/check_pr_size.sh

# Manual check
echo "=== Files Changed ==="
git diff --name-only develop...HEAD

echo "=== LOC Changed ==="
git diff --stat develop...HEAD

echo "=== Total LOC ==="
git diff --numstat develop...HEAD | awk '{add+=$1; del+=$2} END {print "Added:", add, "Deleted:", del, "Total:", add+del}'
```

### Splitting Large PRs

If PR is too large:

1. **Identify logical chunks**: Can features be separated?
2. **Extract foundation**: Base changes in separate PR
3. **Stack PRs**: Build dependent PRs on top of each other
4. **Document dependencies**: Note which PR needs to merge first

Example:
```
PR #1: feat(hand_tracking): add detector base class
PR #2: feat(hand_tracking): implement gesture recognition (depends on #1)
PR #3: feat(games): add drawing game using hand tracking (depends on #2)
```

## Release Workflow

### Preparing Release

```bash
# 1. Ensure develop is stable
# Run full test suite
pytest

# 2. Update version
# Edit pyproject.toml version = "0.2.0"

# 3. Update CHANGELOG.md
# Add version section with changes

# 4. Create release branch
git checkout -b release/v0.2.0

# 5. Final testing on release branch
# Manual smoke tests

# 6. Merge to main
git checkout main
git merge --no-ff release/v0.2.0

# 7. Tag release
git tag -a v0.2.0 -m "Release version 0.2.0

Features:
- Hand tracking with pinch gesture
- Alphabet tracing module (English)
- Basic drawing canvas

Fixes:
- Camera initialization on macOS"

# 8. Push
git push origin main
git push origin v0.2.0

# 9. Merge back to develop
git checkout develop
git merge main
```

## Hotfix Workflow

For critical production fixes:

```bash
# 1. Create from main
git checkout main
git checkout -b hotfix/camera-crash-fix

# 2. Fix and test

# 3. PR to main (fast-track)
# 4. After merge, also merge to develop
```

## Git Configuration

### Recommended Settings

```bash
# Set up commit template
git config --local commit.template .gitmessage

# Enable useful features
git config --local pull.rebase true
git config --local rebase.autoStash true

# Better diffs
git config --local diff.algorithm histogram
```

### Git Hooks

Pre-commit hooks run automatically:

```bash
# Install hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files
```

## Common Commands Reference

```bash
# Start feature
git checkout develop && git pull && git checkout -b feature/name

# Update feature branch
git fetch && git rebase origin/develop

# Check status
git status
git log --oneline --graph --all -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo and discard changes
git reset --hard HEAD~1

# Stash changes
git stash push -m "work in progress"
git stash pop

# View diff
git diff develop...HEAD

# Clean up merged branches
git branch --merged develop | grep -v develop | xargs git branch -d
```

## Troubleshooting

### Merge Conflicts

```bash
# During rebase
git rebase --continue  # after fixing conflicts
git rebase --abort     # to cancel

# During merge
git merge --abort      # to cancel
```

### Recovering Lost Work

```bash
# View reflog
git reflog

# Recover commit
git checkout -b recovery-branch HEAD@{2}
```
