# AI Agent Coordination Guide

## Overview

This document governs how AI agents (including myself and others) work on the Advay Vision Learning project. It ensures consistency, quality, and proper coordination across all development activities.

**Version**: 1.0  
**Last Updated**: 2024-01-28  
**Applies To**: All AI agents working on this codebase

---

## Core Principles

### 1. Evidence-First Development
- Every claim must be backed by evidence
- Evidence types: `Observed` (directly verified), `Inferred` (logical implication), `Unknown` (cannot determine)
- Never upgrade `Inferred` to `Observed`

### 2. Single Source of Truth
- **Worklog**: `docs/WORKLOG_TICKETS.md` - All work tracking
- **Audits**: `docs/audit/<sanitized-file>.md` - Audit artifacts
- **Prompts**: `prompts/` - All AI prompts
- **Code**: Repository itself

### 3. Scope Discipline
- One audit = One file
- One PR = One audit remediation OR one hardening scope
- No scope creep without explicit approval

### 4. Preservation First
- Never discard contributor code unless clearly inferior
- Keep meaningful comments/tests/docs unless incorrect
- Prefer merging both sides when resolving conflicts

---

## Agent Workflow

### Phase 1: Intake

Before starting ANY work, determine:

```
1. What type of work?
   - New file audit
   - Remediation PR (from audit)
   - Hardening PR (one scope area)
   - PR Review / Verification
   - Merge conflict resolution
   - Post-merge validation

2. Define scope contract:
   - Target file OR hardening scope
   - Behavior change allowed: YES/NO
   - Explicit non-goals
   - Acceptance criteria
   - Base branch: main

3. Ticket Action (MANDATORY):
   - Create or update docs/WORKLOG_TICKETS.md
   - Append-only discipline
```

### Phase 2: Work Execution

Based on work type, follow the appropriate prompt:

| Work Type | Prompt File | Purpose |
|-----------|-------------|---------|
| File Audit | `prompts/audit/audit-v1.5.1.md` | Comprehensive single-file audit |
| Remediation | `prompts/remediation/implementation-v1.6.1.md` | Fix audit findings |
| Hardening | `prompts/hardening/hardening-v1.1.md` | Production hardening |
| PR Review | `prompts/review/pr-review-v1.6.1.md` | Review existing PR |
| Verification | `prompts/verification/verification-v1.2.md` | Verify remediation |
| Merge Conflict | `prompts/merge/merge-conflict-v1.2.md` | Resolve conflicts |
| Post-Merge | `prompts/merge/post-merge-v1.0.md` | Validate after merge |
| Triage | `prompts/triage/out-of-scope-v1.0.md` | Queue next audits |

### Phase 3: Documentation

Every work unit MUST produce:

1. **Worklog Entry** in `docs/WORKLOG_TICKETS.md`
2. **Audit Artifact** (for audits) in `docs/audit/<file>.md`
3. **Verifier Pack** (for PRs) in PR description
4. **Evidence Log** with raw command outputs

---

## Mandatory Checklists

### Before Starting Any Work

```markdown
- [ ] Read AGENTS.md (this file)
- [ ] Check docs/WORKLOG_TICKETS.md for existing work
- [ ] Determine work type and select correct prompt
- [ ] Define scope contract (invariants, non-goals, acceptance criteria)
- [ ] Create or update worklog ticket
- [ ] Verify environment (Python 3.11+, Node 18+, uv installed)
- [ ] Check existing venv (don't create duplicates)
```

### Before Code Changes

```markdown
- [ ] Run discovery commands (git status, git log, rg searches)
- [ ] Identify exact code locations (semantic anchors, not line numbers)
- [ ] Check for existing tests
- [ ] Verify no uncommitted changes in unrelated files
- [ ] Confirm scope contract is clear
- [ ] Stage changes appropriately:
  - Use `git add -A` for comprehensive audit sessions
  - Use `git add <specific-files>` for focused code changes
```

### Before Creating PR

```markdown
- [ ] All changes map to finding IDs (for remediation)
- [ ] Invariants preserved (or Behavior change: YES declared)
- [ ] Tests added for HIGH/MEDIUM findings
- [ ] Local verification run (typecheck, lint, tests)
- [ ] Diff limited to scope + tests
- [ ] Docs match diff (no brittle line numbers)
- [ ] VERIFIER PACK v1.0 filled with real outputs
- [ ] Out-of-scope findings listed
- [ ] Next audit queue provided (if applicable)
- [ ] Worklog ticket updated
```

### Before Merge

```markdown
- [ ] PR Review completed (APPROVE/REQUEST CHANGES/BLOCK)
- [ ] Verification audit passed
- [ ] All findings marked FIXED/PARTIAL/NOT FIXED/REGRESSED/NA
- [ ] CI status noted (signal, not gate)
- [ ] No merge conflicts (or resolved via Merge Conflict prompt)
- [ ] Post-merge validation plan ready
```

---

## Environment Management

### Python (Backend)

**ALWAYS check before creating venv:**

```bash
# Check if venv already exists
ls -la src/backend/.venv 2>/dev/null && echo "venv exists" || echo "venv missing"

# Check if activated
echo $VIRTUAL_ENV

# If venv exists but not activated:
cd src/backend && source .venv/bin/activate  # macOS/Linux
# or: .venv\Scripts\activate  # Windows

# If venv missing:
cd src/backend && uv venv && source .venv/bin/activate
```

**NEVER create nested venvs.**

### Node.js (Frontend)

```bash
# Check if node_modules exists
ls src/frontend/node_modules 2>/dev/null && echo "dependencies installed" || echo "need npm install"

# If missing:
cd src/frontend && npm install
```

---

## Security Checklist

### For Any Code Change

```markdown
- [ ] No secrets in code (use env vars)
- [ ] Input validation present
- [ ] No SQL injection (use parameterized queries/ORM)
- [ ] No XSS (escape output, validate input)
- [ ] Proper auth/authorization checks
- [ ] Rate limiting considered
- [ ] Error messages don't leak sensitive info
```

### For Authentication-Related Changes

```markdown
- [ ] Password hashing (bcrypt)
- [ ] JWT token expiration
- [ ] CSRF protection
- [ ] Session management
- [ ] Secure cookie flags
- [ ] Rate limiting on auth endpoints
```

### For Camera/Video Features

```markdown
- [ ] Explicit permission required
- [ ] No video storage (only processed data)
- [ ] Visual indicator when camera active
- [ ] Easy disable/stop mechanism
- [ ] Privacy policy compliance (COPPA)
```

---

## Evidence Discipline

### Required Evidence Types

| Claim Type | Required Evidence |
|------------|-------------------|
| Code behavior | Git diff, code snippet |
| Test results | Test command + output |
| Performance | Benchmark command + output |
| Security | Security scan output |
| Dependencies | Package list + versions |

### Evidence Labels

Every non-trivial claim MUST be labeled:

- **Observed**: Directly verified from file or command output
  - Example: "`Observed`: File exists at path (ls -la output)"
  
- **Inferred**: Logically implied from Observed facts
  - Example: "`Inferred`: Function is called based on import statement"
  
- **Unknown**: Cannot be determined from available evidence
  - Example: "`Unknown`: Runtime behavior without execution"

### Command Output Format

When including command output:

```markdown
**Command**: `git status --porcelain`

**Output**:
```
M src/backend/app/main.py
?? docs/audit/server__auth.py.md
```

**Interpretation**: `Observed` - One modified file, one untracked file
```

---

## File Naming Conventions

### Audit Artifacts

```
Original Path                    Audit Artifact Path
-------------                    -------------------
src/backend/app/auth.py          docs/audit/src__backend__app__auth.py.md
src/frontend/components/Button.tsx  docs/audit/src__frontend__components__Button.tsx.md
```

**Sanitization rules**:
- Replace `/` with `__`
- Replace `\` with `__`
- Keep original extension

### Worklog Tickets

```
TCK-YYYYMMDD-###

Examples:
TCK-20240128-001
TCK-20240128-002
```

---

## Communication Protocol

### When Starting Work

```markdown
**Agent**: [Agent Name]
**Action**: Starting [work type] on [target]
**Ticket**: TCK-YYYYMMDD-###
**Scope**: [brief description]
**Base**: main@[commit-sha]
```

### When Completing Work

```markdown
**Agent**: [Agent Name]
**Action**: Completed [work type] on [target]
**Ticket**: TCK-YYYYMMDD-###
**Status**: [OPEN/IN_PROGRESS/BLOCKED/DONE/DROPPED]
**Evidence**: [link to evidence/outputs]
**Next**: [next action or agent]
```

### When Blocked

```markdown
**Agent**: [Agent Name]
**Blocked On**: [specific issue]
**Evidence**: [what was attempted]
**Help Needed**: [specific question]
**Ticket**: TCK-YYYYMMDD-###
```

---

## Quality Gates

### Audit Gate

Pass if:
- [ ] Discovery appendix complete
- [ ] Evidence labels correct (Observed/Inferred/Unknown)
- [ ] Freeze rule used if contradictions
- [ ] Patch plan is scoped + testable
- [ ] Artifact exists or content provided

### Implementation Gate

Pass if:
- [ ] Diff limited to audited file + tests
- [ ] Each change maps to finding ID
- [ ] Invariants preserved (or Behavior change: YES)
- [ ] Tests/verification artifacts for HIGH/MED
- [ ] Docs/claims match diff
- [ ] Verifier pack filled with real outputs

### PR Review Gate

Pass if:
- [ ] Diff-only scope
- [ ] Findings-driven review
- [ ] Docs-truth verified
- [ ] Tests/verification gate passed
- [ ] CI status noted

### Verification Gate

Pass if:
- [ ] All findings marked (FIXED/PARTIAL/NOT FIXED/REGRESSED/NA)
- [ ] Evidence for each marking
- [ ] No regressions introduced
- [ ] Ready for merge

---

## Prohibited Actions

1. **Never** create multiple venvs
2. **Never** commit secrets to git
3. **Never** upgrade Inferred to Observed
4. **Never** mix unrelated fixes in one PR
5. **Never** delete contributor code without clear justification
6. **Never** skip worklog updates
7. **Never** claim "ready" without evidence
8. **Never** expand scope without explicit approval

---

## Resources

### Prompts Directory

```
prompts/
├── audit/
│   └── audit-v1.5.1.md
├── remediation/
│   └── implementation-v1.6.1.md
├── hardening/
│   └── hardening-v1.1.md
├── review/
│   ├── pr-review-v1.6.1.md
│   └── code-review-checklist.md
├── verification/
│   └── verification-v1.2.md
├── merge/
│   ├── merge-conflict-v1.2.md
│   └── post-merge-v1.0.md
├── triage/
│   └── out-of-scope-v1.0.md
└── workflow/
    └── worklog-v1.0.md
```

### Documentation

- `docs/WORKLOG_TICKETS.md` - Work tracking
- `docs/audit/*.md` - Audit artifacts
- `docs/ARCHITECTURE.md` - System design
- `docs/SECURITY.md` - Security guidelines
- `docs/SETUP.md` - Environment setup

---

## Quick Reference

### Common Commands

```bash
# Check git status
git status --porcelain

# Stage changes (choose based on context)
git add -A                    # Stage ALL changes (new, modified, deleted)
git add <file1> <file2>       # Stage specific files only

# Check diff stats
git diff --stat origin/main...HEAD

# Find references to symbol
rg -n "symbol_name" src/

# Run backend tests
cd src/backend && pytest

# Run frontend tests
cd src/frontend && npm test

# Type check
cd src/backend && mypy app/
cd src/frontend && npm run type-check

# Lint
cd src/backend && ruff check .
cd src/frontend && npm run lint
```

### Ticket Template

```markdown
## TCK-YYYYMMDD-### :: [Short Title]
Type: [AUDIT|REMEDIATION|HARDENING|REVIEW|VERIFICATION|POST_MERGE|TRIAGE]
Owner: [Agent Name]
Created: [YYYY-MM-DD HH:MM TZ]
Status: [OPEN|IN_PROGRESS|BLOCKED|DONE|DROPPED]

Scope contract:
- In-scope:
  - ...
- Out-of-scope:
  - ...
- Behavior change allowed: [YES|NO|UNKNOWN]

Targets:
- Repo: [name]
- File(s): [path]
- Branch/PR: [branch/PR link]
- Range: [base..head]

Inputs:
- Prompt used: [name + version]
- Source artifacts: [links]

Plan:
- ...

Execution log:
- [timestamp] [action] | Evidence: [output]

Status updates:
- [timestamp] [status change]

Next actions:
1) ...

Risks/notes:
- ...
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-28 | Initial version |

---

**Remember**: Evidence first. Scope discipline. Preservation over perfection.
