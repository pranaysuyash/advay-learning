# Contributing Guidelines

## Development Workflow

### Branch Strategy

This repo uses a **main-first workflow**. There is no `develop` branch, no `feature/*`, `fix/*`, or `hotfix/*` branches.

```
origin/main  ←  all merged work
    ↑
codex/wip-<scope>  ←  created only when a PR is needed
```

**All local work is committed directly to local `main`.** A branch is created only when the user explicitly asks to open a PR.

### Starting New Work

```bash
# Work directly on local main — no branch needed
git add -A
git commit -m "feat(hand_tracking): add pinch gesture detection"

# When the user says "open a PR" / "start git workflow":
./scripts/start_wip_branch.sh <ticket-or-scope>
# This creates codex/wip-<scope>, resets local main, pushes, and opens the PR.
```

**Agents MUST NOT run** `git switch -c`, `git checkout -b`, or `git branch <new>`. The `start_wip_branch.sh` script is the only approved way to create a branch.

### Commit Message Convention

Format: `<type>(<scope>): <description>`

**Types:** `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore`

**No `Co-authored-by:` trailers.** All commits belong to the repo owner (pranaysuyash) only.

**Always include a ticket reference:**
```
feat(hand_tracking): implement pinch-to-draw gesture

Refs: TCK-20260316-010
```

### Pull Request Guidelines

#### Before Creating PR

- [ ] Code follows project style (ruff, black)
- [ ] Type hints added/updated
- [ ] Tests pass locally (`pytest`)
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] CHANGELOG.md updated for user-facing changes

#### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if UI changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

#### PR Size Limits

To ensure quality reviews:

| Metric | Warning | Block |
|--------|---------|-------|
| Lines Changed | > 300 | > 500 |
| Files Changed | > 10 | > 20 |
| New Dependencies | > 3 | > 5 |

**If your PR exceeds limits:**

1. Split into smaller, logical PRs
2. Document the dependency between PRs
3. Get explicit approval for large changes

### Code Review Process

1. **Self-Review**: Author reviews their own PR first
2. **Automated Checks**: Pre-commit hooks must pass
3. **Manual Review**: At least one approval required
4. **Testing**: Reviewer pulls branch and tests locally
5. **Merge**: Author merges after approval

### Merge Management

#### LOC Change Checking

Before merging, verify change size:

```bash
# Check LOC changed against main
git diff --stat main...HEAD
```

**Guidelines:**

- Prefer small, focused PRs
- Large refactors should be discussed in an issue first
- Document architectural decisions for significant changes

#### Quality Gates (Manual)

Before merging to `main`:

- [ ] All tests pass (`cd src/frontend && npx vitest run` / `pytest`)
- [ ] Type checking passes (`cd src/frontend && npx tsc --noEmit`)
- [ ] Linting passes
- [ ] PR review approval received
- [ ] All review threads resolved

### Release Process

1. Update version in `pyproject.toml`
2. Update `CHANGELOG.md`
3. Commit to local `main`, then run `./scripts/start_wip_branch.sh release-vX.Y.Z`
4. Merge the PR after final review
5. Tag release on `main`: `git tag -a vX.Y.Z -m "Release X.Y.Z" && git push origin vX.Y.Z`

## Development Environment

### Setup

```bash
# Run setup script
./scripts/setup.sh

# Activate environment
source .venv/bin/activate

# Verify setup
./scripts/check.sh
```

### Daily Development

```bash
# Start development session
./scripts/dev.sh

# Run specific test
pytest tests/unit/test_hand_tracking.py -v

# Run with coverage
pytest --cov=src --cov-report=html
```

## Code Standards

### Python Style

- Follow PEP 8 (enforced by ruff/black)
- Maximum line length: 88 characters (black default)
- Use type hints for all function signatures
- Docstrings for all public functions/classes

### Import Order

```python
# 1. Standard library
import os
from pathlib import Path

# 2. Third-party
import numpy as np
from PyQt6.QtWidgets import QApplication

# 3. Local
from src.hand_tracking import HandDetector
from src.config import Settings
```

### Error Handling

```python
# Use specific exceptions
try:
    result = process_frame(frame)
except CVError as e:
    logger.error("Frame processing failed", error=str(e))
    raise HandTrackingError("Could not process hand tracking") from e
```

### Logging

```python
from structlog import get_logger

logger = get_logger(__name__)

# Use structured logging
logger.info("hand_detected", hand_id=hand_id, confidence=confidence)
```

## Testing Guidelines

### Test Structure

```python
# tests/unit/hand_tracking/test_detector.py
import pytest
from src.hand_tracking.detector import HandDetector


class TestHandDetector:
    def test_detect_single_hand(self, sample_frame):
        detector = HandDetector()
        hands = detector.detect(sample_frame)
        assert len(hands) == 1
    
    def test_detect_no_hands(self, empty_frame):
        detector = HandDetector()
        hands = detector.detect(empty_frame)
        assert len(hands) == 0
```

### Test Data

- Use fixtures in `conftest.py`
- Use `factory-boy` for complex object creation
- Store test assets in `tests/assets/`

### Coverage Requirements

- Minimum 80% coverage for new code
- Critical paths (tracking, storage) should have 90%+

## Documentation

### Code Documentation

- Docstrings for all public APIs
- Type hints for all parameters
- Examples in docstrings for complex functions

### Project Documentation

- Update relevant docs when adding features
- Keep ROADMAP.md current
- Document architectural decisions in `docs/architecture/decisions/`

## Communication

### Questions?

- Check existing documentation first
- Create issue for bugs or feature requests
- Use clear, descriptive titles

### Reporting Bugs

Include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment details (OS, Python version)
5. Screenshots if UI-related
