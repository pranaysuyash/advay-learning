# AI Agent Coordination Guide

> **🎮 Active Work Notice:** Game Specification Audit in progress (Hermes Agent via LM Studio). See [docs/games/README.md](docs/games/README.md) for details. Critical drift cases (5/5) complete. 105 games remaining.

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
source Docs/context/agent-start/STEP1_ENV.sh
# Or (no file read) print exports and eval:
/Users/pranay/Projects/agent-start --print-step1 --skip-index
```

### Step 2 (generate aligned context pack)
```bash
/Users/pranay/Projects/agent-start
```

Outputs:
- Canonical project-local pack:
  - `Docs/context/agent-start/SESSION_CONTEXT.md`
  - `Docs/context/agent-start/AGENT_KICKOFF_PROMPT.txt`
  - `Docs/context/agent-start/STEP1_ENV.sh`
- Compatibility mirrors when present:
  - `.agent/SESSION_CONTEXT.md`
  - `.agent/AGENT_KICKOFF_PROMPT.txt`
  - `.agent/STEP1_ENV.sh`
  - `frontend/docs/context/agent-start/*`

### Automation (already configured)
- Terminal auto-loads `Docs/context/agent-start/STEP1_ENV.sh` when you `cd` into a project under `/Users/pranay/Projects` (zsh hook).
- VS Code/Antigravity can run `agent-start --skip-index` on folder open via `.vscode/tasks.json`.

### How agents should use this
- Provide the canonical `Docs/context/agent-start/AGENT_KICKOFF_PROMPT.txt` and `Docs/context/agent-start/SESSION_CONTEXT.md` as the first context for the agent.
- If sources conflict, the agent must cite concrete file paths and ask before proceeding.
- If the canonical context pack is missing or stale, run `/Users/pranay/Projects/agent-start --skip-index` before planning changes.
- Treat `.agent/` files as compatibility mirrors only.
- Do not start implementation until `Docs/context/agent-start/AGENT_KICKOFF_PROMPT.txt` and `Docs/context/agent-start/SESSION_CONTEXT.md` are loaded.

### Mandatory agent operating mandate
- Begin every substantial task by refreshing ground truth: read the applicable instruction stack, repo-local `AGENTS.md`/`CLAUDE.md`, and any Qwen, Codex, Copilot, or other agent-specific instruction files relevant to the repo.
- Check the current codebase, docs, worklogs, and project status before planning or coding. Parallel agents may have changed files, decisions, or docs since the last session.
- Treat drift as normal: before editing and again before finalizing, re-check the files and docs you rely on, then adapt rather than assuming older context still holds.
- Use relevant skills and workflow guidance after checking the configured skill locations. Do not default to one toolset when a better domain skill exists.
- Think from first principles and optimize for long-term, scalable, architecturally sound solutions. Existing code is evidence, not a boundary; if current implementation no longer fits the product reality or architecture, propose or implement the proper path.
- Avoid building duplicate or parallel systems. Extend canonical routes, pipelines, validation, docs, and tools unless the project explicitly calls for a new replacement path.
- Git safety: read-only git inspection is allowed; no destructive commands, staging, commits, pushes, resets, or checkouts without explicit permission in the current conversation.
- Research online when facts may be current, external, or uncertain; cite sources when research affects decisions.
- Test changes, verify for regressions, and document findings, decisions, open questions, and follow-up work in durable project artifacts.

### Mandatory commit gate
Install or refresh the managed repo-local git hooks. They resolve the repo's effective hook path, block commit creation in `prepare-commit-msg` until the current full `motto_v3.md` has a fresh attestation, then enforce objective diff checks plus commit trailers in `pre-commit` and `commit-msg`:
```bash
python3 /Users/pranay/Projects/workspace_memory/scripts/install_git_precommit_agent_hook.py
```

Refresh the current repo's motto attestation before committing:
```bash
python3 /Users/pranay/Projects/workspace_memory/scripts/attest_motto.py --repo "$PWD"
```

### Shared Idea Pad Protocol (Required)
- Canonical file: `/Users/pranay/Projects/idea_pad/IDEA_PAD.md`
- Raw capture file: `/Users/pranay/Projects/idea_pad/IDEA_DUMP.md`
- Do not create per-model primary copies of the idea pad.
- Do not overwrite the whole file; use append/update workflow with validation.
- Capture rough ideas in `IDEA_DUMP.md`, then promote high-signal items into `IDEA_PAD.md`.
- Before edits:
```bash
python3 /Users/pranay/Projects/idea_pad/scripts/idea_pad_tool.py validate
```
- Add new ideas safely:
```bash
python3 /Users/pranay/Projects/idea_pad/scripts/idea_pad_tool.py add --title "<title>" --owner "<agent>" --type build
```
- After updates, refresh shared memory index:
```bash
cd /Users/pranay/Projects
./projects-memory index
```

<!-- PROJECTS_MEMORY_AGENT_ALIGNMENT_END -->

## ⚠️ Skills Discovery Protocol (CRITICAL)

**Agents: DO NOT default to using `.claude` skills or `gstack`.** We have an extensive skills ecosystem across multiple locations.

### Complete Skills Reference

For a complete catalog of ALL available skills across the workspace, see:
**`/Users/pranay/Projects/SKILLS_CATALOG.md`**

### Check ALL Skills Locations (in order)

1. `~/.claude/skills/*/` — ~72 skills (Claude Code)
2. `~/.agents/skills/*/` — ~98 skills (includes Azure/Marketing)
3. `~/Projects/skills/*/` — **47 skills (most curated, engineering focus, often missed!)**
4. `~/Projects/external-skills/*/` — 2,898+ community skills
5. `~/Projects/openai-skills/` — OpenAI Codex skills (official standard repo copy)
6. `$CODEX_HOME/skills/*/` — Codex runtime-installed skills (when CODEX_HOME is set)
7. `~/.codex/skills/*/` — Codex local saved skills (default path)
8. `~/.codex/skills/.system/*/` — Codex app bundled/system skills (read-only baseline)

**gstack is NOT your primary testing tool.** Use specialized alternatives instead:

- For browser testing: `browse` skill (faster)
- For QA: `qa` or `qa-only` skills (systematic)
- For E2E: `webapp-testing` or `e2e-testing` skills (comprehensive)
- For debugging: `systematic-debugging` skill (methodology)

See `/Users/pranay/Projects/SKILLS_CATALOG.md` for complete skills reference.

## Overview

This document governs how AI agents (including myself and others) work on the Advay Vision Learning project. It ensures consistency, quality, and proper coordination across all development activities.

**Version**: 2.0  
**Last Updated**: 2026-03-15  
**Applies To**: All AI agents working on this codebase

---

## 🎯 MULTI-MODAL VISION PLATFORM — TOP PRIORITY

> **This is a vision-first learning platform. Every game uses camera-based computer vision as its primary interaction method. This is NOT optional — it is the core identity of the app.**

### What This Means

This app is a **multi-modal vision platform** where children interact with games using:

- **Hand tracking** (index finger pointing, pinch-to-grab, hand gestures)
- **Face tracking** (head tilt, facial expressions)
- **Pose tracking** (full-body movements, arm positions, jumping)
- **Voice input** (speech recognition for voice-controlled games)

**Each game can require different combinations of these modes.** A game might need only hand tracking, or hand + face, or all three visual modes. The specific combination is determined by the game's design requirements.

### Mandatory Rules for ALL Agents

1. **EVERY game MUST have at least one CV control mode** (`hand`, `face`, `pose`, or `voice`)
   - This applies to ALL existing games and ALL new games
   - No exceptions for "simple" games — even simple tap games should use hand tracking

2. **When working on ANY game file**, first check what CV modes it uses:
   - Look at `cv: [...]` in the game registry (`src/frontend/src/data/gameRegistry.ts`)
   - Look at which tracking hooks are used in the game file
   - If CV is missing or incomplete, it's a P0 bug to fix

3. **When creating a new game**, CV integration is Step 1, not an afterthought:
   - Design the game around its vision mode(s)
   - Register the correct `cv: [...]` array in the game manifest
   - Use the appropriate hooks: `useGameHandTracking`, `useGamePoseTracking`, `useGameFaceTracking`
   - Reference: `docs/CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md`

4. **The `cv` field in gameRegistry is authoritative**:
   - If `cv: ['hand']` — game MUST work with hand tracking
   - If `cv: ['pose']` — game MUST work with pose tracking
   - If `cv: ['hand', 'face']` — game MUST work with BOTH
   - If `cv: []` or missing — this is a bug that needs fixing

5. **Camera gating matters**:
   - Games with CV should be wrapped with `CameraSafeRoute` in App.tsx
   - The camera preview should be visible and functional

### Current State (as of 2026-07-08 - VERIFIED)

Registry-level CV compliance was audited in `docs/audit/CV_REGISTRY_AUDIT_2026-07-08.md`.

- **148 total registry entries** across 12 worlds (literal games + factory-generated 3D games)
- **148 listed games** appear in the gallery / are selectable by children
- **145 listed games have an explicit `cv` declaration** in their registry object
- **3 listed 3D games rely on the factory default `cv: ['hand']`** (`digital-jenga`, `pattern-pop-3d-2`, `color-match-garden-3d`)
- **0 listed games are missing a `cv` mode** when factory defaults are counted
- **0 games are unlisted** — all games now have functional CV integration
- **All declared CV modes match the actual implementation** — hand/pose/face hooks are present and wired in the corresponding game components
- **Camera-safe routing (`cameraSafe: true`) is in place for CV games**

> ✅ **LAUNCH READY**: All 148 games satisfy the mandatory CV control mode mandate. Every listed game has functional hand tracking (or pose/face/voice) wired into gameplay.

**Agents working on games should focus on runtime polish, content expansion, and performance optimization.**

### Key Files for Vision Implementation

| File                                                  | Purpose                              |
| ----------------------------------------------------- | ------------------------------------ |
| `src/frontend/src/hooks/useGameHandTracking.ts`       | Hand tracking hook                   |
| `src/frontend/src/hooks/useGamePoseTracking.ts`       | Pose tracking hook                   |
| `src/frontend/src/hooks/useGameFaceTracking.ts`       | Face tracking hook                   |
| `docs/CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md` | Implementation guide                 |
| `src/frontend/src/data/gameRegistry.ts`               | Game manifest with `cv: [...]` field |
| `docs/audit/CONTROL_MODE_AUDIT_2026-03-12.md`         | Full audit of CV vs pointer status   |

### Why This Matters

The app's unique value proposition is **camera-based, hands-free learning** for young children (ages 3-8). Kids this age can't use keyboards or mice reliably — that's why vision is the core interaction method. Every game that lacks CV controls is failing the core product promise.

---

## Core Principles

### 1. Evidence-First Development

- Every claim must be backed by evidence
- Evidence types: `Observed` (directly verified), `Inferred` (logical implication), `Unknown` (cannot determine)
- Never upgrade `Inferred` to `Observed`

### 2. Single Source of Truth

- **Worklog**: `docs/WORKLOG_ADDENDUM_*.md` - All work tracking
- **Audits**: `docs/audit/<sanitized-file>.md` - Audit artifacts
- **Claims**: `docs/CLAIMS.md` - Append-only claim registry (prevents cross-agent contradictions)
- **Prompts**: `prompts/` - All AI prompts
- **Code**: Repository itself

### 2.1 Worklog Write Policy (Supersedes Legacy Mentions)

- Active task updates must be written to `docs/WORKLOG_ADDENDUM_*.md`.
- `docs/WORKLOG_TICKETS.md` is protected and treated as a curated index/history file.
- Direct edits to `docs/WORKLOG_TICKETS.md` are allowed only for explicit curation tasks and require intentional override in local gates.
- If any instruction below says “update `docs/WORKLOG_TICKETS.md`”, interpret it as “update a `docs/WORKLOG_ADDENDUM_*.md` file” unless the user explicitly requests ticket-file curation.
- **`docs/WORKLOG_ADDENDUM_*.md` files may be directly edited only to update ticket fields within an existing ticket entry** (e.g. changing `Status:`, adding an `Execution log:` line, appending `Status updates:`). All other changes must be pure appends — new tickets or new sections added at the end. Never delete lines, reorganize sections, or rewrite narrative outside of ticket fields.
- **Do not use `ALLOW_WORKLOG_REWRITE=1` for ticket status updates.** Ticket field edits (Status, Execution log, Status updates) are legitimate in-place modifications exempt from the append-only restriction. The `ALLOW_WORKLOG_REWRITE` flag is reserved only for intentional bulk curation/rewrite tasks explicitly requested by the user.

### 2.2 GitHub Issues + Project Mirror (Required)

- Collaboration mirror is mandatory in GitHub Issues + Project:
  - Board: `Advay Engineering Board` (`https://github.com/users/pranaysuyash/projects/1`)
- For implementation work, maintain 1:1 linkage between:
  - Worklog ticket (`TCK-...`)
  - GitHub Issue (`#...`)
  - PR (`Closes #...`, `TCK-...` in PR body)
- Do not open or merge a PR without both references in the PR description.
- Use repository issue forms in `.github/ISSUE_TEMPLATE/` (bug, feature, audit-remediation, ci-failure).
- Keep issue labels current using shared taxonomy:
  - `priority/*`, `status/*`, `area/*`, `type/*`, `agent/*`
- Automation sources of truth:
  - `.github/workflows/pr-link-gate.yml`
  - `.github/workflows/pr-failure-narrative-gate.yml`
  - `.github/workflows/pr-path-labeler.yml`
  - `.github/workflows/project-and-issue-automation.yml`

### 3. Scope Discipline

- One audit = One file
- One PR = One audit remediation OR one hardening scope
- No scope creep without explicit approval

### 4. Replace Legacy Code When The New Code Is Better

**Principle:** This repo is pre-launch. Do not preserve legacy implementations just to avoid deleting them. If a new implementation is more correct, more comprehensive, and maintainable, prefer removing the superseded code instead of carrying both paths as tech debt.

**Guidelines:**

- Do not keep duplicate legacy and replacement implementations unless there is a current, documented migration need.
- Prefer one canonical implementation per behavior.
- Remove older code when the replacement is demonstrably better or fully covers the intended behavior.
- Keep comments/tests/docs only when they remain correct for the surviving implementation.
- Prefer merging useful behavior into the canonical implementation, then delete the redundant path.
- **Investigate before deleting**: confirm what the old code does, what the new code covers, and whether any unique behavior still needs to be preserved.
- **Required evidence for deletion/replacement**: document why the replacement is better or comprehensive enough, and record the verification that supports removing the old path.
- **See**: `docs/process/CODE_PRESERVATION_GUIDELINES.md` for additional workflow guidance where relevant.

**Deletion/replacement policy**:

- Legacy code may be deleted without separate user approval when it is being replaced by a better/comprehensive implementation in the same scoped change.
- Do not keep side-by-side legacy files, compatibility wrappers, or dead exports unless they are still required by a verified migration plan.
- Do not delete unrecognized parallel-agent work just because it looks obsolete; first confirm it is actually superseded by the replacement.
- For non-legacy project assets such as docs, audits, tickets, or user-authored content, preserve existing approval discipline unless the current task explicitly covers their removal.

### 5. Staging Is Always Comprehensive

- Always stage changes with: `git add -A`
- Do not “selectively stage” unless the user explicitly asks.
- Do not use staging as a mechanism to “drop” other agents’ work.
- Once `git add -A` has been run, every staged file is in scope for that commit/PR.
- For staged files, treat failures as current branch code issues to resolve, not as “pre-existing/unrelated” exemptions.
- Parallel-agent changes included by `git add -A` are part of the same commit and merge workflow by default.

### 6. Branch and Parallel Work Preservation (CRITICAL)

**Default branch workflow (required):**

- **ALL local work happens directly on `main`.** Multiple concurrent agents each commit to their local `main`. No branch is ever needed for day-to-day iteration.
- **Agents MUST NOT create branches manually** (`git switch -c`, `git checkout -b`, `git branch <new>`). This is enforced by `pre-commit` and `pre-push` hooks.
- **The only approved way to create a branch** is:
  ```bash
  ./scripts/start_wip_branch.sh <ticket-or-scope>
  ```
  This is run **only when the user explicitly says** "start the git workflow", "open a PR", or "create a branch". It:
  1. Creates `codex/wip-<scope>` at the current `HEAD` (carries all local-main commits)
  2. Resets local `main` back to `origin/main` (keeps `main` clean for the next task)
  3. Pushes `codex/wip-<scope>` and opens a PR
- **Never push directly to `origin/main`.** All code reaches `main` via merged PRs only.
- Multiple WIP branches are allowed when the user explicitly requests parallel PRs.
- Delete WIP branch after merge. Run `git pull origin main` to sync local `main`.

**Branch discipline:**

- Do not proactively create branches. Wait for explicit user instruction.
- Do not create `feature/*`, `fix/*`, `hotfix/*`, or `release/*` branches unless user explicitly asks.
- Multiple concurrent WIP branches are OK when the user explicitly requests them.
- Delete stale/merged branches immediately after merge.

**🚫 NEVER delete or revert files with unrecognized changes.**

- Unrecognized changes may be from parallel agents working simultaneously
- Multiple agents are expected to work in parallel in this repo; treat all Source Control entries (including `??` untracked files) as part of active project work by default.
- Do not delete, rename, move, or “clean up” files just because they are untracked; only mark files to be untracked via `.gitignore` when the user explicitly requests that outcome.
- If you see changes you do not recognize, PRESERVE them
- Only modify/delete files you are explicitly tasked to work on
- When in doubt, ask the user before removing anything

### 6.1 Refactor Sidecar Files Policy

**Purpose:** Prevent temporary side-by-side refactor files (for example `*Refactored.tsx`) from silently accumulating in live source directories, drifting from canonical files, or being deleted before their useful changes are preserved.

**Definitions:**

- **Canonical file**: the runtime source-of-truth file currently used by the app (for example `Foo.tsx`)
- **Refactor sidecar**: a temporary alternate implementation created during migration or restructuring (for example `FooRefactored.tsx`)

**Allowed use (all required):**

- The work is an explicit migration, decomposition, or pattern-adoption task
- A worklog addendum ticket exists for the refactor
- The sidecar has a documented promotion/removal plan
- The canonical file remains the runtime entrypoint until verification is complete
- Sidecars are temporary only; if the replacement is ready and verified, promote it and remove the sidecar before merge

**Every sidecar must document:**

- Why the sidecar exists
- Which canonical file it corresponds to
- What useful behavior it is expected to add
- How it will be verified
- What must happen before deletion
- Whether it is expected to be promoted, archived, or discarded

**Required review before merge:**

1. Diff the canonical file against the sidecar directly
2. Identify any useful unique behavior in the sidecar
3. Integrate only verified improvements into the canonical file
4. Verify the canonical file still compiles and preserves expected behavior
5. Remove the sidecar once its useful behavior is fully preserved or proven unnecessary in the canonical implementation

**Prohibited patterns:**

- Do not bulk-create sidecars without a cleanup plan
- Do not leave sidecars in live runtime directories indefinitely
- Do not treat comments, renamed headers, or import stubs as a completed refactor
- Do not keep sidecars after the replacement is verified unless the ticket explicitly requires temporary coexistence
- Do not bulk-delete multiple sidecars without per-file audit evidence

**Main branch rule:**

- `*Refactored.tsx` files should not land on `main` by default
- If temporary sidecars must exist, they are WIP-only and require an explicit override plus a worklog note
- Promotion into the canonical file and removal of the sidecar should happen before merge whenever possible

**Override policy:**

- No sidecar bypass override is permitted in local hooks.
- Promote/refactor cleanly before committing.

### 6.2 Merge Quality Gate (Mandatory)

**Purpose:** A merge to `main` is a quality decision, not a branch-closure action.

**Rules:**

- Do not merge a branch into `main` unless there is positive evidence the resulting code is at least non-regressive and preferably additive (better/comprehensive behavior, or explicit accepted tradeoff).
- Do not use strategy merges (for example `-s ours`) to mark branches as merged unless the user explicitly asks for administrative closure-only behavior in the current chat.
- Before merging, run and record the canonical checks for the merged result (lint/type/tests/build or repo-equivalent gates).
- If conflicts occur, resolve semantically with intent-first analysis (preserve good changes from both sides when possible), not by mechanical discard.
- If a branch cannot be merged without reducing quality or violating acceptance criteria, stop and escalate with options instead of force-merging.
- Treat local-only merges the same as remote merges: same quality bar, same regression checks, same documentation/evidence requirements.

**Required evidence before merge:**

- Diff review summary of what improves/preserves behavior.
- Command evidence showing checks pass on the merge result.
- Explicit note of any known risks/follow-ups.

### 6.3 No-Shortcut Merge Protocol (Mandatory, Effective 2026-03-12)

**Purpose:** prevent premature merges and ensure every branch follows full review-to-closure workflow.

Rules (hard requirements):

- Do not merge until all **review required** files are explicitly reviewed and logged in the active worklog addendum ticket.
- Do not merge with unresolved PR threads/comments. Verify with:
  - `gh pr view <number> --comments`
  - review-thread query (GraphQL) showing `isResolved=true` for all threads.
- Do not merge if any regression gate fails (including flaky tests). Fix or isolate with explicit evidence first; no silent bypasses.
- Do not mark work as `DONE` while linked issue(s) remain open, any review thread is unresolved, required non-thread PR comments remain unaddressed, or in-scope code scanning findings remain open.
- Before requesting merge approval, publish a **pre-merge checklist snapshot** in the ticket/PR comment with:
  - gate results
  - review-thread status
  - issue status
  - code-scanning status
- If any gate is ambiguous, unavailable, or requires bypass/override, stop and ask the user for explicit approval before proceeding.

Enforcement note:

- CI/branch-protection currently enforces PR metadata, review status, unresolved thread status, code-scanning policy, and regression checks.
- Linked-issue closure state, follow-up on required non-thread PR comments, and pre-merge checklist snapshot remain mandatory reviewer/agent process obligations and must be recorded in worklog/PR notes.
- `.github/workflows/merge-readiness-gate.yml` enforces review thread resolution (`reviewThreads.isResolved`) and open code-scanning alert checks; non-thread comment follow-ups remain manual obligations to document.

### 7. Create Reusable Tools, Not One-Off Scripts

**Principle:** When you create helpful code (analyzers, converters, validators, test harnesses), save it as a documented, reusable tool for future use—by any project.

**Guidelines:**

- **Save to `tools/` directory**: Store standalone helper utilities in the project's `tools/` folder
- **Make it standalone**: Tools should work independently with minimal dependencies
- **Document in `tools/README.md`**: Add purpose, use cases, how-to-use, and examples
- **Never use `/tmp` or any path outside the project for project work.** All scripts, helpers, intermediate files, and artifacts must be created inside the project directory. Use `tools/` for reusable utilities, `docs/` for documentation, the project source tree for code. `/tmp` does not count as saved work — anything written there is considered lost.
- **Migrate from temp paths immediately**: If a helper was accidentally created in `/tmp`, move it into `tools/` before completing the task
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

### 7.1 Saving Inline Utility Scripts

**When creating helpful scripts during tasks** (e.g., checking GitHub threads, parsing logs, analyzing data), always save them to `tools/` even if they were created inline:

```python
# Example: You create a script inline to check PR review threads
# Instead of leaving it as a one-off, save it:

# 1. Save to tools/ with descriptive name
#    tools/check_review_threads.py
#    tools/resolve_github_threads.py
#    tools/find_unresolved_pr_comments.py

# 2. Update tools/README.md with:
#    - Purpose
#    - Usage examples
#    - What patterns it excludes/handles

# 3. Make it reusable with argparse for different inputs
python3 tools/check_review_threads.py --pr 50 --filter-bot
```

**Common utility categories to save:**

| Category         | Example Filenames                                          | Purpose                           |
| ---------------- | ---------------------------------------------------------- | --------------------------------- |
| GitHub PR mgmt   | `check_unresolved_threads.py`, `resolve_review_threads.py` | Thread resolution, gate debugging |
| CI/CD debugging  | `check_workflow_status.py`, `parse_ci_logs.py`             | Analyze CI failures               |
| Code analysis    | `count_exports.py`, `find_unused_imports.py`               | Static analysis helpers           |
| Data parsing     | `parse_test_results.py`, `extract_metrics.py`              | Parse outputs for reporting       |
| Asset management | `validate_assets.py`, `check_image_sizes.py`               | Asset pipeline helpers            |

**Why save even "temporary" scripts:**

- Future agents face the same problems
- GitHub API patterns (GraphQL pagination, thread resolution) are reusable
- CI debugging patterns repeat across PRs
- Builds institutional knowledge in `tools/` directory

### 7.2 Kenney Asset Source Policy

**Canonical local source for this repo:**

- `/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0`
- Local bundle snapshot added: `2026-03-03`
- Tracked pack payload timestamps (runtime-synced packs): `2D assets/New Platformer Pack` = `2025-12-03`

**Required workflow when an agent needs Kenney assets:**

1. Check whether the asset already exists in the project under `src/frontend/public/assets/kenney/`.
2. If it exists, reuse that in-project runtime asset instead of importing a duplicate.
3. If it does not exist, source it from the local purchased Kenney bundle above.
4. For `New Platformer Pack` assets, use `tools/sync_kenney_platformer_assets.sh` instead of ad-hoc copying.
5. For non-platformer packs in the all-in-one bundle, copy only the required files into `src/frontend/public/assets/kenney/<pack-or-domain>/` and document the import in `assets/kenney/README.md`.
6. If the local bundle is replaced with a newer Kenney download, update the recorded snapshot dates in `AGENTS.md`, `docs/SETUP.md`, and `assets/kenney/README.md` as part of the same change.

**Do not:**

- Re-download a Kenney pack if the purchased local bundle already contains it.
- Introduce a second runtime asset path when `src/frontend/public/assets/kenney/` already covers the use case.
- Treat `assets/kenney/` as the canonical runtime source; it is documentation only.

### 8. Default Execution Lifecycle (Mandatory Unless User Overrides)

For normal task execution in this repo, agents should follow this sequence by default:

1. Analysis
2. Document (baseline scope/evidence anchors)
3. Plan
4. Research
5. Document (decision log)
6. Implement
7. Test
8. Document (results/evidence)

Interpretation rules:

- This lifecycle is the normal path for any new task unless the user explicitly asks to skip/reorder.
- “Document” steps must update the appropriate repo artifacts (for example worklog, audits, implementation reports) with Observed/Inferred/Unknown discipline.
- Documentation should be persisted as soon as each meaningful phase output is ready; do not wait for a chat checkpoint before writing repo docs.
- For very small requests, steps can be compressed, but evidence and final documentation updates still apply when code or docs are changed.

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
   - Create or update docs/WORKLOG_ADDENDUM_*.md
   - Append-only discipline
```

### Phase 2: Work Execution

Based on work type, follow the appropriate prompt:

| Work Type               | Prompt File                                      | Purpose                          |
| ----------------------- | ------------------------------------------------ | -------------------------------- |
| File Audit              | `prompts/audit/audit-v1.5.1.md`                  | Comprehensive single-file audit  |
| Remediation             | `prompts/remediation/implementation-v1.6.1.md`   | Fix audit findings               |
| Hardening               | `prompts/hardening/hardening-v1.1.md`            | Production hardening             |
| PR Review               | `prompts/review/pr-review-v1.6.1.md`             | Review existing PR               |
| Local pre-commit review | `prompts/review/local-pre-commit-review-v1.0.md` | Findings-first local commit gate |
| Verification            | `prompts/verification/verification-v1.2.md`      | Verify remediation               |
| Merge Conflict          | `prompts/merge/merge-conflict-v1.2.md`           | Resolve conflicts                |
| Post-Merge              | `prompts/merge/post-merge-v1.0.md`               | Validate after merge             |
| Triage                  | `prompts/triage/out-of-scope-v1.0.md`            | Queue next audits                |

### Phase 3: Documentation

Every work unit MUST produce:

1. **Worklog Entry** in `docs/WORKLOG_ADDENDUM_*.md`
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
   rg "TCK-YYYYMMDD-NNN" docs/WORKLOG_*.md

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
   - Branch/PR: `codex/wip-<scope>` -> `main`

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
- [ ] Check `docs/WORKLOG_*.md` for existing work
- [ ] Confirm/create linked GitHub Issue and set status label (`status/inbox` or `status/in-progress`)
- [ ] Confirm the issue appears on Advay Engineering Board (or record blocker with evidence)
- [ ] Ensure local workflow gate is enabled (`git config core.hooksPath .githooks`)
- [ ] Find the correct prompt in prompts/README.md and follow it
- [ ] Determine work type and select correct prompt
- [ ] Re-check prompt/instruction alignment before implementation; if user asks for remediation, perform remediation (not cleanup-by-deletion)
- [ ] Define scope contract (invariants, non-goals, acceptance criteria)
- [ ] Create or update worklog ticket
- [ ] Verify environment (Python 3.13+, Node 22+, uv installed)
- [ ] Check existing venv (don't create duplicates)
- [ ] Check running servers (frontend on 6173, backend on 8001)
- [ ] **Resolve all console errors, warnings, and API failures found**: When encountering runtime errors (e.g., 422 API errors, uncaught exceptions), fix them immediately. Do not create separate issues - resolve them as part of the current task.
- [ ] **Document every user inquiry or idea**: whenever a user asks for ideas, feedback, analysis, or requests, create or append an appropriate file under `docs/` (e.g. `BRAINSTORM_IDEAS.md`). Requests are a mandate, not optional.
- [ ] **Translate brainstorms into tickets**: after recording ideas, create worklog ticket(s) in `docs/tickets/` and open corresponding GitHub issues; reference the brainstorm doc and update the living architecture.
```

### Before Code Changes

```markdown
- [ ] Run discovery commands (git status, git log, rg searches)
- [ ] Identify exact code locations (semantic anchors, not line numbers)
- [ ] Check for existing tests
- [ ] Preserve uncommitted parallel work; do not drop unrecognized files/edits
- [ ] Confirm scope contract is clear
- [ ] For lint/type cleanup (unused variables/imports/functions), apply intent-first remediation and preserve behavior; only delete code when deadness is proven and documented
- [ ] Stage changes using `git add -A` (unless user explicitly requests partial staging)
```

### Before Committing (Agent Self-Check)

```markdown
- [ ] Review your diff: `git diff --staged` or `git diff HEAD`
- [ ] Run a findings-first local code review using `prompts/review/local-pre-commit-review-v1.0.md`
- [ ] Record `Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md` in the updated worklog addendum for code/audit changes
- [ ] Do not mark a ticket `DONE` if it still has numbered `Next Actions:`; finish them, move them, or keep the ticket open
- [ ] Do not claim `100% complete` for refactor migrations while transitional sidecar files still exist unless they are explicitly marked retained
- [ ] **FEATURE REGRESSION CHECK** (critical for >10% LOC changes):
  - [ ] For modified files with significant changes, compare to previous version
  - [ ] Ask: "Does the new version IMPROVE on the old (not just preserve)?"
  - [ ] Verify ADDITIVE changes: new features, better code quality = ✅ GOOD
  - [ ] For REFACTORS that split files: check ALL files together for comprehensiveness
  - [ ] Check for accidentally removed functions, state variables, exports
  - [ ] Check for orphaned components (built but not used)
  - [ ] If functionality removed: document WHY and what replaces it, or RESTORE it
- [ ] Run pre-commit checks locally: `./scripts/agent_gate.sh --staged`
- [ ] If any gate/test/typecheck fails, fix failures completely, rerun checks, then retry commit (do not bypass unless user explicitly authorizes)
- [ ] Do not use shorthand claims like “pre-existing/unrelated failures”; the agent who encounters the issue resolves it before commit/push
- [ ] Ensure worklog addendum is updated for code changes
- [ ] Write meaningful commit message explaining WHAT and WHY
- [ ] **Commit authorship: ALL commits use the repo owner name only. Never add `Co-authored-by:` trailers of any kind (no Copilot, no bot, no AI attribution). Every commit belongs to pranaysuyash.**
- [ ] **WAIT for explicit user approval before running `git commit` or `git push`** — never commit/push autonomously
```

### Before Creating PR

```markdown
- [ ] All changes map to finding IDs (for remediation)
- [ ] PR body includes `Closes #<issue-number>` and `TCK-YYYYMMDD-NNN`
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
- [ ] All review-required files have explicit review notes in the current worklog addendum ticket
- [ ] PR Review completed (APPROVE/REQUEST CHANGES/BLOCK)
- [ ] `gh pr view <number> --comments` checked; no unresolved review conversations
- [ ] Review-thread GraphQL check confirms all threads `isResolved=true`
- [ ] Verification audit passed
- [ ] All findings marked FIXED/PARTIAL/NOT FIXED/REGRESSED/NA
- [ ] Regression gates pass (including flaky-test handling with explicit evidence)
- [ ] CI/status checks pass (required gates are merge blockers)
- [ ] Linked issue(s) are closed, review threads are resolved, required non-thread PR comments are addressed, and in-scope code scanning findings are closed/resolved
- [ ] Pre-merge checklist snapshot posted (gates + review threads + issues + code scanning)
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
uv venv --python python3.13 && source .venv/bin/activate
```

**Canonical env**: use the repo root `/.venv` for backend and repo tooling.

**NEVER create nested venvs.** `src/backend/.venv` and `src/backend/venv` are legacy local environments and should not be recreated.

**For tests and scripts: always activate the existing `.venv` first. Do not create a new venv.**

```bash
# Correct — reuse existing
source .venv/bin/activate && python -m pytest ...

# Wrong — never do this before checking
uv venv && ...
```

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

### Safe Multi-Line File Writes (Required)

The heredoc warning above is not just about commit messages. Multi-line shell writes routinely cause false “saved” and false “done” claims when agents write docs/specs/code directly from the terminal.

Required rules:

- **Do not** use heredoc (`cat > file <<EOF`, `tee file <<EOF`) to create or overwrite tracked repo files
- Use structured file editing instead
- `/tmp` is scratch only and does **not** count as a saved project deliverable
- After any multi-line write, immediately verify the final repo file with:

```bash
sed -n '1,40p' <file>
git diff -- <file>
git status --short -- <file>
```

- Do not mark work complete based on terminal output alone
- Do not mark parent checklist items complete while child implementation items remain incomplete unless the document explicitly defines the parent as a coarse milestone

See `docs/process/AGENT_SHELL_WRITE_AND_COMPLETION_GUARDRAILS.md` for the full failure patterns and required workflow.

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
M  docs/WORKLOG_ADDENDUM_v3.md       # Your work
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

### Secret Remediation Scope (Required)

- If a secret scan fails, remediate by fixing tracked code/config files that contain hardcoded secrets (for example `src/**`, `scripts/**`, committed docs).
- **Do not edit `.env`, `.env.*`, or other local environment files unless the user explicitly asks in the current conversation.**
- Do not "fix" secret-scan failures by mutating local env files by default; prefer replacing hardcoded literals with `os.getenv(...)`/settings-based loading in actual code.
- If a committed sample/env file must be adjusted (e.g., `.env.example`), do so only with explicit user approval.
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

This repo enforces workflow discipline locally via git hooks (so agents cannot "forget" tickets/evidence).

Required one-time setup per clone:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/* scripts/*.sh
```

### What is Enforced at Commit Time

The pre-commit hook runs these checks in order:

| Check                         | Script                                | Purpose                                                                  | Skip Flag |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------------------------ | --------- |
| **1. Agent Gate**             | `scripts/agent_gate.sh`               | Worklog updates, audit artifacts, ticket evidence                        | None      |
| **2. Secret Scan**            | `scripts/secret_scan.sh`              | Block leaked credentials/API keys                                        | None      |
| **3. Static Maintainability** | `scripts/maintainability_guard.sh`    | Block oversized/high-complexity staged source files, including new files | None      |
| **4. Feature Regression**     | `scripts/feature_regression_check.sh` | Detect removed functionality in large refactors                          | None      |
| **5. Regression Tests**       | `scripts/regression_check.sh`         | Tests, export changes, TypeScript validation                             | None      |

#### 1. Agent Gate (`scripts/agent_gate.sh`)

- If staged changes touch `src/` or `docs/audit/`, you must also update `docs/WORKLOG_ADDENDUM_*.md`.
- If staged changes touch `src/` or `docs/audit/`, the updated addendum must include `Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md`.
- Any modified/added `docs/audit/*.md` must reference a `TCK-YYYYMMDD-###`.
- Any changed ticket entry must include a unique `Ticket Stamp: STAMP-YYYYMMDDTHHMMSSZ-agent[-abcd]`.
- Any ticket set to `Status: DONE` must include an evidence section with at least one `Command:` (or explicit `Unknown:` markers).
- Any ticket set to `Status: DONE` is blocked if it still contains numbered `Next Actions:`.
- Any bulk refactor ticket set to `Status: DONE` must include a concrete verification `Command:`.
- Completion claims for sidecar-based refactors are blocked while tracked `*Refactored.tsx` files still exist, unless the ticket explicitly declares `Sidecar Status: RETAINED`.

#### 2. Secret Scan (`scripts/secret_scan.sh`)

- Detects common secret patterns (API keys, passwords, tokens).
- Fails if any potential secrets are found in staged files.

#### 3. Static Maintainability Guard (`scripts/maintainability_guard.sh`)

**Critical:** Blocks newly added oversized source files and existing files whose maintainability metrics get materially worse.

**Checks staged blobs directly (including newly added files):**

- New files fail immediately if they exceed `MAX_FILE_LOC` (default: 1000), `MAX_FILE_BYTES` (default: 60000), or `MAX_FILE_CCN` (default: 60)
- Existing files fail when they cross a threshold from below
- Existing files already above a threshold fail only if they get materially worse again (size grows further or max CCN increases)

**Why this exists:**

- Diff-based checks only see how much changed in the current commit
- Very large files can keep passing when later commits touch only a few lines
- This guard enforces a static ceiling so files like `wordBuilderLogic.ts` cannot silently remain unflagged once touched

**When this check triggers - AGENT MUST:**

1. **Do not treat it as noise**
   - Large files are a maintainability risk even when behavior is unchanged

2. **Choose the right mitigation:**

   ```bash
   # Measure the file explicitly
   wc -l <file>
   wc -c <file>
   ```

3. **Reduce the risk intentionally:**
   - Split the file into cohesive modules
   - Move embedded datasets/assets into dedicated data files
   - Extract helpers or pure functions
   - Only override thresholds for an explicitly justified exception

4. **If an exception is truly intentional:**
   - Document why the file must remain large
   - Use an explicit env override for that commit

#### 4. Feature Regression Check (`scripts/feature_regression_check.sh`) ⭐ NEW

**Critical:** Detects when large refactors remove functionality.

**Triggers when:**

- Existing file has >10% **net LOC delta** (threshold configurable via `LOC_THRESHOLD`)
- Existing file has >10% **touched-line churn** (`added + deleted` vs old LOC; configurable via `TOUCHED_LOC_THRESHOLD`)
- Large file + meaningful edits: old LOC >= 500 and touched lines >= 20
- Complexity-risk edits: touched lines >= 20 and high complexity per analyzer (`lizard` max CCN / CCN delta; fallback heuristics only if analyzer unavailable)

**Detects:**

- Removed functions/methods
- Removed exports
- Removed component props
- Removed hooks
- Removed state variables

**When This Check Triggers - AGENT MUST:**

1. **Do not bypass checks**
   - This check exists because agents (including you) have accidentally removed features

2. **Manually compare old vs new versions:**

   ```bash
   git diff HEAD -- <file>
   ```

3. **Verify IMPROVEMENT (not just preservation):**
   | Change Type | Verdict | Action |
   |-------------|---------|--------|
   | **NEW** features/functions added | ✅ GOOD | Commit it |
   | **BETTER** code, same features | ✅ GOOD | Commit it |
   | **SPLIT** into multiple files | ⚠️ CHECK ALL | Verify sum is comprehensive |
   | **LESS** functionality | ❌ REGRESSION | Fix it |

4. **For REFACTORS that split files:**
   - Check ALL related files in the same commit together
   - Ask: "Is the SUM of new files ≥ original file in functionality?"
   - Verify no functions are orphaned (defined but never called)
   - Ensure state is comprehensively handled across all files
   - Check that moved functions are properly imported and used

5. **If functionality was removed UNINTENTIONALLY:**
   - STOP and restore it
   - Reference the old version: `git show HEAD:<file>`
   - Preserve user-facing behavior even if implementation changes
   - Remember: Additive changes are encouraged, reductive changes need justification

6. **If removal was INTENTIONAL (rare):**
   - Document WHY in your commit message
   - Explain what replaces the removed functionality
   - Example: "Consolidates handleCreateProfile and handleUpdateProfile into unified profileManager.ts for single source of truth"
   - Ensure no orphaned components exist

7. **When in doubt:**
   - Ask the user before committing
   - Better to verify than to regress

**Manual refactor review basis (required):**

- Surface/API: exports, route contracts, prop interfaces, side-effect entry points
- State & lifecycle: removed/renamed state vars, reducer transitions, effect dependencies/cleanup
- Behavior paths: happy path + error path + pause/recovery/edge-state path
- Complexity concentration: high-hook/high-branch sections touched by refactor
- Cross-file completeness: if split/extract happened, sum of new files must preserve prior behavior

**Core Principle:** New code should be **ADDITIVE** or **IMPROVEMENT**, never reductive unless explicitly discussed and justified.

**Example of what it catches:**
The Dashboard.tsx refactor (commit 29900a6) removed `handleCreateProfile`, `showAddModal`, and 5 state variables - breaking the "Add Child" feature. This check would have flagged:

```
⚠️  POTENTIAL REGRESSION DETECTED in src/frontend/src/pages/Dashboard.tsx
  Functions removed: 4
    - handleCreateProfile
    - handleOpenEditModal
    - handleUpdateProfile
    - formatTimeKidFriendly
  State variables removed: 5
    - showAddModal
    - newChildName
    ...
```

An agent seeing this should have:

1. Compared versions and noticed `handleCreateProfile` was gone
2. Checked if AddChildModal was still integrated (it wasn't)
3. Realized users couldn't add children anymore
4. Restored the functionality before committing

**Bypass policy:**

- Gate bypass is disallowed for commit/push checks.
- Only worklog curation flags are allowed:
  - `ALLOW_WORKLOG_TICKETS_EDIT=1`
  - `ALLOW_WORKLOG_REWRITE=1`

#### 4. Regression Tests (`scripts/regression_check.sh`)

- Runs all frontend tests (or related tests for changed files).
- Checks for removed exports (breaking changes).
- Validates TypeScript compilation.

### Manual Checks

Run individual checks before committing:

```bash
# Full pre-commit simulation
./scripts/agent_gate.sh --staged

# Feature regression only
./scripts/feature_regression_check.sh --staged

# All regression checks
./scripts/regression_check.sh --staged
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

### Ticket Naming & Stamp Rules

- `TCK-YYYYMMDD-###` remains the human-facing ticket id format.
- Every new/changed ticket entry must include a unique stamp line:
  - `Ticket Stamp: STAMP-YYYYMMDDTHHMMSSZ-agent[-abcd]`
- Generate stamp via:
  - `./scripts/new_ticket_stamp.sh <agent-name>`
- Uniqueness policy:
  - `TCK-...` may collide historically across parallel agents/files.
  - `Ticket Stamp` is the canonical uniqueness key and must be globally unique across `docs/WORKLOG_*.md`.
- Commit-time enforcement:
  - `scripts/agent_gate.sh` rejects changed tickets without valid stamp format.
  - `scripts/agent_gate.sh` rejects duplicate `Ticket Stamp` values.

Example:

```markdown
## TCK-20260224-033 :: Enforce No-Bypass Validation

Ticket Stamp: STAMP-20260224T180958Z-codex-2jxp
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
12. **Never** use `git commit --no-verify`, force-push, or non-worklog gate bypass flags
13. **Never** claim failures are “unrelated/pre-existing” as a reason to bypass checks when user scope is full-project; either fix, or stop and report concrete blockers
14. **Never** reclassify staged files as “out of scope” after running `git add -A`; staged changes must be carried through gate, PR, and merge workflow
15. **Never** modify `.env`/`.env.*` files while remediating secret scans unless the user explicitly instructs it; fix hardcoded secrets in tracked code instead
16. **Never** proceed to push after hook failures; first resolve failing checks, rerun them to green, then re-attempt commit/push
17. **Never** commit directly on `main`
18. **Never** commit or push changes without explicit user approval in the current conversation — even if all checks pass, always wait for the user to say "commit", "push", "merge", or equivalent
19. **Never** resolve lint/type warnings by defaulting to deletion; prefer intent-first remediation and only delete when dead code is proven with evidence in worklog notes
20. **Never** use “pre-existing/unrelated failures/tests” as a bypass narrative; if you encounter the issue, you resolve it

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

- `docs/WORKLOG_ADDENDUM_*.md` - Work tracking
- `docs/audit/*.md` - Audit artifacts
- `docs/process/CODE_PRESERVATION_GUIDELINES.md` - When to delete vs. implement unused code
- `docs/ARCHITECTURE.md` - System design
- `docs/security/SECURITY.md` - Security guidelines
- `docs/SETUP.md` - Environment setup
- `docs/PROCESS_PROMPTS.md` - Prompt/persona registry + review cadence reminders

### Tools Directory

- `tools/` - Reusable development & QA utilities
- `tools/README.md` - Tool catalog with use cases and examples
- `tools/video_frame_analyzer.html` - Frame-by-frame video analysis for UX audits
- `tools/contrast_calculator.py` - WCAG contrast ratio calculator

---

### Agent Protocols

- **Intent-First Implementor**: `docs/process/INTENT_FIRST_IMPLEMENTOR_PROTOCOL.md` — Protocol for resolving tests, type checks, lint, and build errors while preserving intended behavior. Use when fixing broken builds or integrating incomplete code.

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

Ticket Stamp: STAMP-YYYYMMDDTHHMMSSZ-agent-abcd

Type: [AUDIT|REMEDIATION|HARDENING|REVIEW|VERIFICATION|POST_MERGE|TRIAGE]
Owner: Pranay
Created: [YYYY-MM-DD HH:MM TZ]
Status: [OPEN|IN_PROGRESS|BLOCKED|DONE|DROPPED]

# Generate a unique stamp:

# scripts/new_ticket_stamp.sh <agent-name>

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

| Version | Date       | Changes                                                                                                              |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| 2.0     | 2026-03-15 | Added Multi-Modal Vision Platform section as TOP PRIORITY; made CV control mandatory for all games                   |
| 1.9     | 2026-03-12 | Added no-shortcut merge protocol metadata/wording alignment and clarified review-thread vs non-thread comment duties |
| 1.7     | 2026-02-26 | Added strict secret-remediation scope: do not touch `.env*` by default; remove hardcoded secrets in code/config      |
| 1.6     | 2026-02-20 | Strengthened reusable-tool policy: mandatory `/tmp` migration to `tools/` and long-term maintenance requirement      |
| 1.5     | 2026-02-20 | Added Core Principle #7: Create Reusable Tools; documented `tools/` directory; added prohibition #11                 |
| 1.2     | 2026-01-31 | Require `git add -A` by default; prohibit deletions without explicit user approval; prefer archive + pointer notes   |
| 1.1     | 2026-01-29 | Updated Python version to 3.13+, added mandatory checks for running servers on ports 6173 and 8001                   |
| 1.0     | 2024-01-28 | Initial version                                                                                                      |

---

**Remember**: Evidence first. Scope discipline. Preservation over perfection.
