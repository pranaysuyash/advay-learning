### TCK-20260303-018 :: Document Shell Write and False-Completion Guardrails
Ticket Stamp: STAMP-20260303T090948Z-codex-5qne

Type: IMPROVEMENT
Owner: Pranay (human owner, agent: Codex)
Created: 2026-03-03
Status: DONE
Priority: P2

Scope contract:

- In-scope: document agent failure patterns around heredoc usage, `/tmp` scratch files, invalid verification commands, and premature completion claims; update repo workflow guidance
- Out-of-scope: code changes to enforce these rules automatically in hooks, changes to the referenced gameplay/spec work itself
- Behavior change allowed: YES (workflow guidance only)

Targets:

- Repo: learning_for_kids
- File(s): `AGENTS.md`, `docs/SETUP.md`, `docs/process/AGENT_SHELL_WRITE_AND_COMPLETION_GUARDRAILS.md`
- Branch/PR: `codex/wip-agent-shell-write-guardrails` -> `main`

Acceptance Criteria:

- [x] Repo documents why heredoc-style shell writes are unsafe for tracked files
- [x] Repo documents that `/tmp` scratch output is not a saved deliverable
- [x] Repo documents the required post-write verification commands
- [x] Repo documents the “do not mark parent complete before children” completion rule

Prompt Trace: direct user instruction with repo workflow applied

Execution log:

- [2026-03-03T09:09:48Z] Captured the failure pattern from the supplied transcript: multi-line shell writes, `/tmp` scratch docs, invalid verification commands, and premature checklist completion. | Evidence: user-provided transcript
- [2026-03-03T09:09:48Z] Added a dedicated process guardrail doc for shell writes and completion proof. | Evidence: `docs/process/AGENT_SHELL_WRITE_AND_COMPLETION_GUARDRAILS.md`
- [2026-03-03T09:09:48Z] Extended core repo guidance in `AGENTS.md` and `docs/SETUP.md` with required post-write verification and scratch-file rules. | Evidence: repo diffs in target files

Status updates:

- [2026-03-03T09:09:48Z] DONE — Workflow guidance now explicitly covers heredoc misuse, `/tmp` false deliverables, and false completion claims
