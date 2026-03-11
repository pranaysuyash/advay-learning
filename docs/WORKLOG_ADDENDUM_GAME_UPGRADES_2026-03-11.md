## Game Upgrade Brainstorm Capture

Ticket Stamp: STAMP-20260311T000000Z-codex

Type: IMPROVEMENT
Owner: Copilot (AI)
Created: 2026-03-11
Status: **OPEN**
Priority: P2

Scope contract:

- In-scope: Document suggested enhancements for existing games (Free Draw, Alphabet Tracing, Physics Demo, Air Guitar Hero, Hand Pong) and initiate ticket creation.
- Out-of-scope: Implementing the features (will happen in future tickets).
- Behavior change allowed: YES (should lead to new features).

Targets:

- Repo: learning_for_kids
- Files: docs/BRAINSTORM_IDEAS.md, docs/PLAYGROUND_ARCHITECTURE_LIVING.md
- Branch/PR: `codex/wip-upgrade-ideas`

Inputs:

- Prompt used: sequential-thought brainstorming and user instructions
- Source artifacts: brainstorm ideas captured; Architecture living doc updated

Plan:

1. Append upgrade ideas to brainstorm vault (completed).
2. Update architecture document with upgrade section (completed).
3. Create individual ticket files for each game improvement (soon).
4. Open corresponding GitHub issues.

Execution log:

- [2026-03-11] Brainstorm ideas and document capture | Evidence: docs/BRAINSTORM_IDEAS.md contents
- [2026-03-11] Architecture doc updated with upgrade opportunities | Evidence: docs/PLAYGROUND_ARCHITECTURE_LIVING.md 

Status updates:

- [2026-03-11] **OPEN** — Initial capture complete, preparing tickets.
- [2026-03-11] **OPEN** — Created tickets TCK-20260311-001 through TCK-20260311-005 covering each game upgrade area.
- [2026-03-11] **OPEN** — Drafted GitHub issue templates and documented them in `docs/github_issues_to_open.md` for later creation.
- [2026-03-11] **OPEN** — Began planning prototypes for the highest-priority upgrades (Physics Playground P0, Free Draw & Alphabet Tracing P1).

Next actions:

1. Create TCK files for each game enhancement idea. (done)
2. Draft GitHub issues from TCKs. (draft templates created)
3. Link issues in worklog ticket. (pending, see article `docs/github_issues_to_open.md`)
4. Start prototypes for Physics Playground (P0), Free Draw (P1), Alphabet Tracing (P1).
5. Apply audit/priority scoring to brainstorm vault and queue further ideas. (tags added to entries; see BRAINSTORM_IDEAS.md)

Status updates:
- [2026-03-11] **OPEN** — Annotated brainstorm ideas with priority tags; scoring framework added to vault.
- [2026-03-11] **OPEN** — Completed refactor of ColorMatchGarden to use shared scoring util; garden types centralized.
- [2026-03-11] **OPEN** — GitHub issues opened for each TCK:
  - Free Draw: https://github.com/pranaysuyash/advay-learning/issues/23
  - Physics Playground: https://github.com/pranaysuyash/advay-learning/issues/24
  - Alphabet Tracing: https://github.com/pranaysuyash/advay-learning/issues/25
  - Game Quality Audit: https://github.com/pranaysuyash/advay-learning/issues/26
  - Brainstorm Scoring: https://github.com/pranaysuyash/advay-learning/issues/27
- [2026-03-11] **OPEN** — Linked issue URLs into worklog and confirmed all five issues exist. Manual step completed.
- [2026-03-11] **OPEN** — Added type export test to ensure index.ts covers new files.

Risks/notes:

- Ideas may still evolve; tickets should reference dynamic brainstorm document to keep sync.
