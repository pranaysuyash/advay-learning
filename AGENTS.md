# AI Agent Coordination Guide

<!-- PROJECTS_MEMORY_AGENT_ALIGNMENT_BEGIN -->

## Projects-Level Agent Alignment (Workspace Memory)

**Purpose:** ensure any agent/LLM (Codex, Copilot, Claude Code, Qwen, GLM, etc.) starts aligned with the same workspace memory + project context.

### Step 0 (first time in this folder)
Generate the per-project context pack:
```bash
/Users/pranay/Projects/agent-start
```

### Step 1 (per shell)
Load the shared defaults for this project session:
```bash
source .agent/STEP1_ENV.sh
# Or (no file read) print exports and eval:
/Users/pranay/Projects/agent-start --print-step1 --skip-index
```

### Step 2 (generate aligned context pack)
```bash
/Users/pranay/Projects/agent-start
```

Outputs:
- `.agent/SESSION_CONTEXT.md`
- `.agent/AGENT_KICKOFF_PROMPT.txt`
- `.agent/STEP1_ENV.sh`

### Automation (already configured)
- Terminal auto-loads `.agent/STEP1_ENV.sh` when you `cd` into a project under `/Users/pranay/Projects` (zsh hook).
- VS Code/Antigravity can run `agent-start --skip-index` on folder open via `.vscode/tasks.json`.

### How agents should use this
- Provide `.agent/AGENT_KICKOFF_PROMPT.txt` and `.agent/SESSION_CONTEXT.md` as the first context for the agent.
- If sources conflict, the agent must cite concrete file paths and ask before proceeding.
- If `.agent` files are missing or stale, run `/Users/pranay/Projects/agent-start --skip-index` before planning changes.
- Do not start implementation until `.agent/AGENT_KICKOFF_PROMPT.txt` and `.agent/SESSION_CONTEXT.md` are loaded.

### Optional commit safety net
Install repo-local git pre-commit hooks that refresh and stage `.agent/*` before commit:
```bash
python3 /Users/pranay/Projects/workspace_memory/scripts/install_git_precommit_agent_hook.py
```

<!-- PROJECTS_MEMORY_AGENT_ALIGNMENT_END -->

## Overview

This document governs how AI agents (including myself and others) work on the Advay Vision Learning project. It ensures consistency, quality, and proper coordination across all development activities.

**Version**: 1.5  
**Last Updated**: 2026-02-20  
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
- **Claims**: `docs/CLAIMS.md` - Append-only claim registry (prevents cross-agent contradictions)
- **Prompts**: `prompts/` - All AI prompts
- **Code**: Repository itself

### 3. Scope Discipline

- One audit = One file
- One PR = One audit remediation OR one hardening scope
- No scope creep without explicit approval

### 4. Preservation First + Implementation Over Deletion

**Principle:** Don't just delete unused code. Understand why it exists, see if it can make the app better, and implement functionality rather than delete.

**Guidelines:**

- Never discard contributor code unless clearly inferior
- Keep meaningful comments/tests/docs unless incorrect
- Prefer merging both sides when resolving conflicts
- **Investigate before deleting**: When you find unused code, investigate its history and purpose
- **Prefer activation**: If code is 70%+ complete and adds value, complete it rather than delete
- **See**: `docs/process/CODE_PRESERVATION_GUIDELINES.md` for detailed workflow

**No deletions without explicit approval**:

- Never delete files (code, docs, audits, tickets, assets) unless the user explicitly asks for deletion **or** there is explicit, recorded approval in the active ticket.
- If cleanup is needed, move to an `archive/` folder and leave a pointer note (preserve history).
- **Exception**: Deletion is acceptable after completing the investigation workflow in CODE_PRESERVATION_GUIDELINES.md and documenting why deletion was chosen over implementation.

### 5. Staging Is Always Comprehensive

- Always stage changes with: `git add -A`
- Do not “selectively stage” unless the user explicitly asks.
- Do not use staging as a mechanism to “drop” other agents’ work.

### 6. Branch and Parallel Work Preservation (CRITICAL)

**🚫 NEVER create new git branches unless explicitly asked by the user.**

- Always work on the current branch (main)
- If a feature branch already exists, the user created it - work there
- Do not create `feature/`, `fix/`, `hotfix/`, or any other branches

**🚫 NEVER delete or revert files with unrecognized changes.**

- Unrecognized changes may be from parallel agents working simultaneously
- If you see changes you do not recognize, PRESERVE them
- Only modify/delete files you are explicitly tasked to work on
- When in doubt, ask the user before removing anything

### 7. Create Reusable Tools, Not One-Off Scripts

**Principle:** When you create helpful code (analyzers, converters, validators, test harnesses), save it as a documented, reusable tool for future use—by any project.

**Guidelines:**

- **Save to `tools/` directory**: Store standalone helper utilities in the project's `tools/` folder
- **Make it standalone**: Tools should work independently with minimal dependencies
- **Document in `tools/README.md`**: Add purpose, use cases, how-to-use, and examples
- **Migrate from temp paths immediately**: If a helper was created in `/tmp`, move it into `tools/` before completing the task
- **Use descriptive names**: `video_frame_analyzer.html` not `temp_analyzer.html` or `tool1.py`
- **Prefer portable formats**: HTML/JS for UI tools (works offline), Python for CLI tools
- **Think cross-project**: Design tools that could be useful in other codebases
- **Examples**: Video analyzers, contrast calculators, screenshot differs, log parsers, test harnesses

**Why this matters:**

- Prevents re-creating the same utility multiple times
- Builds a library of battle-tested helpers
- Makes tools discoverable for other agents and projects
- Enables reuse across different codebases

**Bad practice:**
```bash
# Creating one-off scripts in /tmp or random locations
cat > /tmp/quick_check.py << 'EOF'
# ... helpful analysis code ...
EOF
python /tmp/quick_check.py  # Lost after reboot
```

**Good practice:**
```bash
# Save as a documented tool
cat > tools/video_frame_analyzer.html << 'EOF'
<!-- Reusable frame-by-frame video analyzer -->
EOF
echo "Added to tools/README.md with usage examples"
```

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

2.5. Select the correct repo prompt (MANDATORY):
   - Use `prompts/README.md` to find the appropriate prompt for the work type.
   - Open and follow that prompt’s required steps + required artifacts.
   - If the user provides an external prompt, curate it into `prompts/` (repo-native) and add it to `prompts/README.md` so future agents use the same source of truth.

3. Ticket Action (MANDATORY):
   - Create or update docs/WORKLOG_TICKETS.md
   - Append-only discipline
```

### Phase 2: Work Execution

Based on work type, follow the appropriate prompt:

| Work Type      | Prompt File                                    | Purpose                         |
| -------------- | ---------------------------------------------- | ------------------------------- |
| File Audit     | `prompts/audit/audit-v1.5.1.md`                | Comprehensive single-file audit |
| Remediation    | `prompts/remediation/implementation-v1.6.1.md` | Fix audit findings              |
| Hardening      | `prompts/hardening/hardening-v1.1.md`          | Production hardening            |
| PR Review      | `prompts/review/pr-review-v1.6.1.md`           | Review existing PR              |
| Verification   | `prompts/verification/verification-v1.2.md`    | Verify remediation              |
| Merge Conflict | `prompts/merge/merge-conflict-v1.2.md`         | Resolve conflicts               |
| Post-Merge     | `prompts/merge/post-merge-v1.0.md`             | Validate after merge            |
| Triage         | `prompts/triage/out-of-scope-v1.0.md`          | Queue next audits               |

### Phase 3: Documentation

Every work unit MUST produce:

1. **Worklog Entry** in `docs/WORKLOG_TICKETS.md`
2. **Audit Artifact** (for audits) in `docs/audit/<file>.md`
3. **Verifier Pack** (for PRs) in PR description
4. **Evidence Log** with raw command outputs
5. **Docs updates** when you change behavior or workflow:
   - If you add or change prompts, update `prompts/README.md`.
   - If you add tooling/scripts/hooks, update `docs/SETUP.md` (and `scripts/setup.sh` if applicable).
6. **Prompt & persona traceability**: In every artifact (worklog entry, plan doc, reality check, audit, etc.) note which prompt(s) were used—single, combined, or sequential—along with the audit axis, personas, or lenses that guided the analysis so future agents can reproduce the reasoning.

---

## Audit-to-Ticket Workflow

### Overview

A critical gap identified: Audit reports contain comprehensive findings but ~90% are not systematically converted to worklog tickets. This causes important issues to be forgotten and context to be lost.

### Process

When reading audit documents and finding actionable issues:

1. **Immediate Action:**

   ```bash
   # Check if worklog ticket exists for the issue
   grep "TCK-YYYYMMDD-NNN" docs/WORKLOG_TICKETS.md

   # If NOT found, CREATE IT IMMEDIATELY
   # Even if status is OPEN - getting it tracked is priority over perfecting

   # Document the audit source and finding ID
   ```

2. **Ticket Creation Template:**

   ```markdown
   ### TCK-YYYYMMDD-NNN :: [Descriptive Title]

   Type: [AUDIT_FINDING | BUG | FEATURE | IMPROVEMENT]
   Owner: Pranay (human owner, agent name in execution log)
   Created: [Date]
   Status: **OPEN**
   Priority: [P0 | P1 | P2 | P3]

   Scope contract:

   - In-scope: [specific scope]
   - Out-of-scope: [what's not included]
   - Behavior change allowed: [YES/NO]

   Targets:

   - Repo: learning_for_kids
   - File(s): [files to modify]
   - Branch/PR: main

   Acceptance Criteria:

   - [ ] [specific acceptance criteria]
   - [ ] [more criteria...]

   Source:

   - Audit file: `docs/audit/[file-name].md`
   - Finding ID: Issue #[X] or Finding X from audit
   - Evidence: [Quote or specific reference]

   Execution log:

   - [timestamp] [action] | Evidence: [evidence]

   Status updates:

   - [timestamp] **OPEN** — Ticket created, awaiting implementation
   ```

3. **Audit Discovery Phase Best Practices:**
   - **Create tickets FIRST** before starting code changes
   - **Always link** to specific audit file and line numbers
   - **Use evidence** (quotes, screenshots, line numbers) from audit
   - **Don't batch** unrelated fixes in one ticket
   - **One issue = one ticket** (unless explicitly scoped)

### Regular Audit Review

Use the provided audit review script:

```bash
# Weekly task: Review audit docs for untracked findings
./scripts/audit_review.sh

# Should report:
# - Total findings reviewed: X
# - Tickets created: Y
# - Gap: Z (90%)
# - Action: Create missing tickets
```

### Ticket Creation Discipline

**CRITICAL:** When you discover an issue in an audit document:

1. **ALWAYS** create a worklog ticket (even OPEN) before starting implementation
2. **NEVER** just implement the fix without a tracking ticket
3. **ALWAYS** reference the specific audit file and finding ID
4. **ALWAYS** include the evidence from the audit

### Root Cause

The audit-to-ticket gap exists because:

1. **No systematic workflow** for converting audit findings → tickets
2. **Silent backlog building** - Audit docs contain "roadmaps" and "improvement plans" but aren't tracked
3. **Discovery disconnect** - Finding issues (Phase 1) isn't tracked, only remediation (Phase 2) is

### Required Actions

1. **Immediate:** Run `./scripts/audit_review.sh` and create tickets for all untracked findings
2. **Update:** This AGENTS.md with audit-to-ticket workflow guidance ✅
3. **Weekly:** Make audit review a recurring task to catch gaps early

---

## Mandatory Checklists

### Before Starting Any Work

```markdown
- [ ] Read AGENTS.md (this file)
- [ ] Check docs/WORKLOG_TICKETS.md for existing work
- [ ] Ensure local workflow gate is enabled (`git config core.hooksPath .githooks`)
- [ ] Find the correct prompt in prompts/README.md and follow it
- [ ] Determine work type and select correct prompt
- [ ] Define scope contract (invariants, non-goals, acceptance criteria)
- [ ] Create or update worklog ticket
- [ ] Verify environment (Python 3.13+, Node 18+, uv installed)
- [ ] Check existing venv (don't create duplicates)
- [ ] Check running servers (frontend on 6173, backend on 8001)
```

### Before Code Changes

```markdown
- [ ] Run discovery commands (git status, git log, rg searches)
- [ ] Identify exact code locations (semantic anchors, not line numbers)
- [ ] Check for existing tests
- [ ] Verify no uncommitted changes in unrelated files
- [ ] Confirm scope contract is clear
- [ ] Stage changes using `git add -A` (unless user explicitly requests partial staging)
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
# Check Python version
python --version  # Should be 3.13+

# Check if uv is installed
uv --version

# Check if venv already exists
ls -la .venv 2>/dev/null && echo "venv exists" || echo "venv missing"

# Check if activated
echo $VIRTUAL_ENV

# Check running servers
lsof -i :6173 2>/dev/null && echo "Frontend server running on 6173" || echo "Frontend server not running"
lsof -i :8001 2>/dev/null && echo "Backend server running on 8001" || echo "Backend server not running"

# If venv exists but not activated:
source .venv/bin/activate  # macOS/Linux
# or: .venv\Scripts\activate  # Windows

# If venv missing:
uv venv && source .venv/bin/activate
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

## Terminal & Git Workflow Issues

### Heredoc Corruption in Multi-Line Input

**Problem**: Pasting or echoing multi-line git commit messages (especially via heredoc) into terminal can cause:

- Cursor contamination and terminal state corruption
- Display shows mangled "cmdand heredoc>" prompts
- Actual file operations may succeed despite corrupted output

**Root Cause**: Unquoted heredoc delimiters allow shell expansion and cursor position corruption when pasted into certain terminal states.

**Solution - Three Safe Methods** (in order of preference):

1. **Quoted heredoc (BEST for complex messages)**:

   ```bash
   git commit -F - <<'DELIMITER'
   Subject line here

   Multi-line body text here
   More details...
   DELIMITER
   ```

   The single quotes around `'DELIMITER'` prevent shell expansion.

2. **File-based message**:

   ```bash
   echo "commit message" > /tmp/msg.txt
   git commit -F /tmp/msg.txt
   ```

   Avoids terminal input entirely.

3. **Configure git editor**:

   ```bash
   git config core.editor "nano"  # or vim, emacs, etc.
   git commit  # Will open editor, no terminal paste issues
   ```

**Always Verify**: After commit, check `git log --oneline -1` to confirm commit succeeded, even if terminal output looks corrupted.

### Parallel Work Preservation (CRITICAL)

**Principle**: Multiple agents may work simultaneously on the same branch. Never discard unrecognized changes.

**Rules**:

- **Preserve all staged/unstaged changes** from other agents
- **Never git reset/revert** without explicit user approval
- **When committing**, include all staged changes (use `git add -A` before committing)
- **If git status shows unrelated files**, they're from parallel work — leave them staged
- **Only unstage specific files** if explicitly instructed

**Example Scenario**:

```bash
# You see git status shows:
M  docs/WORKLOG_TICKETS.md       # Your work
A  src/components/NewFeature.tsx # Parallel agent's work

# CORRECT: Commit both together
git add -A && git commit -m "..."

# WRONG: Try to cherry-pick only your changes
git reset src/components/NewFeature.tsx  # ❌ Deletes other agent's work
```

**Evidence**: When commits include changes you didn't make, that's evidence of parallel work. Check git log to see who authored each change, don't assume it's a mistake.

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

| Claim Type    | Required Evidence          |
| ------------- | -------------------------- |
| Code behavior | Git diff, code snippet     |
| Test results  | Test command + output      |
| Performance   | Benchmark command + output |
| Security      | Security scan output       |
| Dependencies  | Package list + versions    |

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
?? docs/audit/server\_\_auth.py.md

```

**Interpretation**: `Observed` - One modified file, one untracked file
```

---

## Local Enforcement (No PR Required)

This repo enforces workflow discipline locally via git hooks (so agents cannot “forget” tickets/evidence).

Required one-time setup per clone:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/* scripts/agent_gate.sh
```

What is enforced at commit time:

1. If staged changes touch `src/` or `docs/audit/`, you must also update `docs/WORKLOG_TICKETS.md`.
2. Any modified/added `docs/audit/*.md` must reference a `TCK-YYYYMMDD-###`.
3. Any ticket set to `Status: DONE` must include an evidence section with at least one `Command:` (or explicit `Unknown:` markers).

Manual check (recommended before committing):

```bash
./scripts/agent_gate.sh --staged
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
9. **Never** run ad-hoc “process” work without curating it into repo prompts/docs (if it will be reused)
10. **Never** delete other agents' work/artifacts (docs, audits, tickets, assets) unless the user explicitly asks or explicitly approves it in the active ticket (recorded with evidence)
11. **Never** create one-off tools/scripts in `/tmp` or temporary locations—save reusable helpers to `tools/` with documentation and maintain them

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
- `docs/process/CODE_PRESERVATION_GUIDELINES.md` - When to delete vs. implement unused code
- `docs/ARCHITECTURE.md` - System design
- `docs/SECURITY.md` - Security guidelines
- `docs/SETUP.md` - Environment setup
- `docs/PROCESS_PROMPTS.md` - Prompt/persona registry + review cadence reminders

### Tools Directory

- `tools/` - Reusable development & QA utilities
- `tools/README.md` - Tool catalog with use cases and examples
- `tools/video_frame_analyzer.html` - Frame-by-frame video analysis for UX audits
- `tools/contrast_calculator.py` - WCAG contrast ratio calculator

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
Owner: Pranay
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

1. ...

Risks/notes:

- ...
```

---

## Version History

| Version | Date       | Changes                                                                                                            |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| 1.6     | 2026-02-20 | Strengthened reusable-tool policy: mandatory `/tmp` migration to `tools/` and long-term maintenance requirement  |
| 1.5     | 2026-02-20 | Added Core Principle #7: Create Reusable Tools; documented `tools/` directory; added prohibition #11              |
| 1.2     | 2026-01-31 | Require `git add -A` by default; prohibit deletions without explicit user approval; prefer archive + pointer notes |
| 1.1     | 2026-01-29 | Updated Python version to 3.13+, added mandatory checks for running servers on ports 6173 and 8001                 |
| 1.0     | 2024-01-28 | Initial version                                                                                                    |

---

**Remember**: Evidence first. Scope discipline. Preservation over perfection.
