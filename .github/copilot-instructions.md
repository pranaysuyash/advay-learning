# GitHub Copilot Workspace Instructions

**Version:** 0.1  
**Last Updated:** 2026-03-13

This file is the *primary workspace instruction* for GitHub Copilot (and related AI assistants) working in **learning_for_kids**.

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

### ✅ Track work in the worklog
- Any code change must be linked to a ticket in `docs/WORKLOG_ADDENDUM_*.md`.
- Add a new ticket (or update an existing one) with the required fields (Status, Execution log, Evidence, etc.).

### ✅ Preserve parallel work
- This repo expects multiple agents can modify the same branch. **Do not discard or revert unrelated edits.**
- Use `git add -A` so all staged changes are included in commits.

### ✅ Run the pre-commit gates
- Commits are protected by pre-commit hooks (see `scripts/agent_gate.sh`).
- Fix any failures; do **not** bypass with `--no-verify` unless explicitly approved.

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
