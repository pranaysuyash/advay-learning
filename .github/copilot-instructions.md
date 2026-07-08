# GitHub Copilot Workspace Instructions

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


**Version:** 0.1  
**Last Updated:** 2026-03-13

This file is the _primary workspace instruction_ for GitHub Copilot (and related AI assistants) working in **learning_for_kids**.

> ⚠️ **Primary source of truth:** This repository already has a large, authoritative coordination guide in `AGENTS.md`. **Always read and follow `AGENTS.md` first**. This Copilot instruction file is a lightweight companion that highlights the most actionable rules for Copilot-style agents.
>
> 🔁 **Sync note:** When updating this file, also update the corresponding section in `AGENTS.md` (see “Projects-Level Agent Alignment” / “Copilot-style agents” callout) to keep both documents aligned.

---

## 1) Where to Start (Required)

### 1.1 Load the agent context

1. Run the project alignment tool to build the shared context pack:
   ```bash
   /Users/pranay/Projects/agent-start
   ```
2. Ensure the per-shell defaults are loaded:
   ```bash
   source .agent/STEP1_ENV.sh
   # Or (no file read):
   /Users/pranay/Projects/agent-start --print-step1 --skip-index
   ```
3. Before making changes, confirm `.agent/AGENT_KICKOFF_PROMPT.txt` and `.agent/SESSION_CONTEXT.md` are available and up to date.

### 1.2 Read the central coordination document

- **`AGENTS.md`** is the canonical agent workflow doc. It contains the rules, pre-commit checks, ticketing requirements, and merge policies that all agents must follow.

---

## 2) How to Work in this Repo (Key Rules)

### ✅ Use the right prompt

- All work should be driven by one of the repository prompts in `prompts/`.
- Use `prompts/README.md` to pick the correct prompt for your task (audit, remediation, review, verification, etc.).
- Re-check prompt + user intent before editing: remediation tasks should remediate behavior, not default to deleting code to silence warnings.

### ✅ Track work in the worklog

- Any code change must be linked to a ticket in `docs/WORKLOG_ADDENDUM_*.md`.
- Add a new ticket (or update an existing one) with the required fields (Status, Execution log, Evidence, etc.).

### ✅ Preserve parallel work

- This repo expects multiple agents can modify the same branch. **Do not discard or revert unrelated edits.**
- Use `git add -A` so all staged changes are included in commits.

### ✅ Run the pre-commit gates

- Commits are protected by pre-commit hooks (see `scripts/agent_gate.sh`).
- Fix any failures; bypass/force-push is not permitted (except documented worklog curation overrides).
- Do not classify failures as “pre-existing/unrelated” to proceed; the agent who encounters the issue resolves it.

### ✅ Prefer intent-first remediation for lint/type fixes

- For unused variables/imports/functions, do not auto-delete by default.
- Preserve behavior and implementation intent; delete only when dead code is proven.
- Record rationale/evidence in the linked worklog ticket.

### ✅ Wait for explicit approval before commit/push

- **Never commit or push changes without explicit user approval** in the current conversation.
- Even if all checks pass, always wait for the user to say "commit", "push", "merge", or equivalent.

---

## 3) Key Paths & Patterns

### Core directories

- `src/frontend/` — React frontend (TypeScript)
- `src/backend/` — Backend services (Python)
- `prompts/` — Agent prompts (audit, remediation, verification, etc.)
- `docs/` — Audit artifacts, worklogs, architecture docs

### Important documents

- `AGENTS.md` — Agent coordination & workflow rules (primary)
- `docs/WORKLOG_ADDENDUM_*.md` — Active work tickets
- `docs/WORKLOG_TICKETS.md` — Curated ticket index

---

## 4) Common Operations (Quick Reference)

### Run frontend checks

```bash
cd src/frontend
npm test
npm run type-check
```

### Run backend checks

```bash
cd src/backend
pytest
```

### Verify local changes

```bash
git status --porcelain
git diff --stat origin/main...HEAD
```

---

## 5) When You’re Unsure

- **Ask**: If you are unsure about scope, expected behavior, or whether a change is allowed, ask the user or the human team.
- **Cite evidence**: When making claims (bug fixed, behavior changed), reference `git diff`, command output, or files.

---

## 6) Updating This Instruction

If you find gaps or missing guidance for Copilot-style agents, update this file. Keep it short, actionable, and aligned with `AGENTS.md`.
