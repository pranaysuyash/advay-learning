# Pull Request Checklist

Use this checklist before creating and merging PRs.

---

## Pre-Submission Checklist

### Code Quality

- [ ] Code follows project style (run `./scripts/check.sh`)
- [ ] All functions have type hints
- [ ] Docstrings for public functions/classes
- [ ] No hardcoded values (use constants/config)
- [ ] Error handling is appropriate
- [ ] No debug print statements (use logging)
- [ ] No commented-out code

### Testing

- [ ] New code has unit tests
- [ ] All tests pass (`pytest`)
- [ ] Test coverage maintained or improved
- [ ] Edge cases are tested
- [ ] Manual testing completed (for UI changes)

### Documentation

- [ ] Code comments explain "why" not "what"
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] CHANGELOG.md updated for user-facing changes
- [ ] Architecture Decision Records (ADRs) added for significant changes

### PR Hygiene

- [ ] Branch is up-to-date with target branch
- [ ] Commits are logically organized
- [ ] Commit messages follow convention
- [ ] PR description is complete
- [ ] PR size is reasonable (< 300 LOC preferred)

---

## PR Size Check

### Quick Check

```bash
# Check LOC changed
git diff --numstat develop...HEAD | awk '{add+=$1; del+=$2} END {print "Added:", add, "Deleted:", del, "Total:", add+del}'

# Check files changed
git diff --name-only develop...HEAD | wc -l
```

### Size Guidelines

| Metric | Target | Warning | Block |
|--------|--------|---------|-------|
| Total LOC | < 200 | 200-400 | > 400 |
| Files Changed | < 8 | 8-15 | > 15 |
| New Dependencies | < 2 | 2-3 | > 3 |

### If PR is Too Large

1. **Split by feature**: Separate independent features
2. **Split by layer**: UI in one PR, logic in another
3. **Extract foundation**: Base changes in separate PR first
4. **Document dependencies**: Note PR relationships

---

## Review Checklist

### For Authors

Before requesting review:

- [ ] Self-review completed
- [ ] All checklist items above addressed
- [ ] PR description explains what and why
- [ ] Screenshots attached (for UI changes)
- [ ] Testing notes included

### For Reviewers

#### Code Review

- [ ] Understand the change purpose
- [ ] Check logic correctness
- [ ] Verify error handling
- [ ] Check for security issues
- [ ] Verify test coverage
- [ ] Check performance implications

#### Style Review

- [ ] Naming is clear and consistent
- [ ] Functions are appropriately sized
- [ ] No code duplication
- [ ] Imports are organized
- [ ] Type hints are correct

#### Functional Review

- [ ] Pull branch and test locally
- [ ] Verify acceptance criteria met
- [ ] Check edge cases manually
- [ ] Verify no regressions

---

## Merge Checklist

### Pre-Merge

- [ ] All review comments resolved
- [ ] At least one approval received
- [ ] All status checks pass
- [ ] Branch is up-to-date with target
- [ ] No merge conflicts

### Merge Strategy

**For feature branches:**

```bash
git checkout develop
git merge --no-ff feature/branch-name
```

**For hotfixes:**

```bash
git checkout main
git merge --no-ff hotfix/branch-name
git checkout develop
git merge main
```

### Post-Merge

- [ ] Branch deleted (local and remote)
- [ ] CHANGELOG.md updated (if not done)
- [ ] Related issues closed
- [ ] Feature status updated in ROADMAP

---

## PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring

## Related Issues
Fixes #123
Relates to #456

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

Describe test approach:

## Screenshots (if UI changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if needed)

## Breaking Changes
List any breaking changes and migration steps:

## Additional Notes
Any other context or notes for reviewers
```

---

## Common PR Issues

### Issue: Too Many Files Changed

**Solution**:

- Split into multiple PRs
- Extract refactoring into separate PR
- Use stacked PRs for dependent changes

### Issue: Mix of Concerns

**Solution**:

- Separate feature work from refactoring
- Separate bug fixes from features
- One logical change per PR

### Issue: Missing Tests

**Solution**:

- Add unit tests for new functions
- Add integration tests for new flows
- Update existing tests for changed behavior

### Issue: Unclear Description

**Solution**:

- Explain the problem being solved
- Describe the approach taken
- List specific changes made
- Include before/after if applicable

---

## Quality Gates Summary

| Gate | Requirement | Enforced By |
|------|-------------|-------------|
| Style | ruff, black pass | pre-commit |
| Types | mypy passes | pre-commit |
| Tests | pytest passes | manual check |
| Coverage | No decrease | manual check |
| Size | < 400 LOC | PR review |
| Review | 1+ approval | PR review |
| Docs | Updated if needed | PR review |
