# Clean-Slate New Games Starter Batch v1.0

## Purpose

Use this prompt when starting a fresh batch of new games from the large backlog (the 270+ game list) and you need a disciplined, clean-slate implementation flow to get started from zero on a new batch.

The goal is to start a new batch the right way: ship real, verified, integrated games in small batches from scratch in the live codebase. Build the real game files directly, wire them fully, verify them, and report progress honestly.

This prompt must be used within the repo's normal execution lifecycle in `AGENTS.md`:

1. Analysis
2. Document
3. Plan
4. Research
5. Document
6. Implement
7. Test
8. Document

Do not jump straight to code if the game mechanics, learning goal, interaction pattern, or asset needs are still ambiguous.

## Scope Rules

- Work in a small batch only: default 3 games, maximum 5 per pass
- Use the canonical files directly
- Do not create `*Refactored.tsx` sidecar page files
- Do not claim batch completion until each game is integrated and verified
- If a game is only partially built, leave it clearly marked `IN_PROGRESS` in the worklog and list exactly what is missing

## Required Inputs

1. The selected game names from the backlog
   - Prefer the source backlog doc or list that contains the 270+ candidates
   - If the user has not picked the games yet, start by choosing the next best 3 candidates and explain why
2. Existing architecture references:
   - `src/frontend/src/components/GamePage.tsx`
   - `src/frontend/src/components/GameShell.tsx`
   - `src/frontend/src/data/gameRegistry.ts`
   - `src/frontend/src/App.tsx`
3. Relevant existing game pages and logic modules to copy patterns from
4. Current worklog addendum ticket for the batch

## Mandatory Workflow

### 1. Start With a Real Batch Plan

Before coding, write down:

- which exact games are in this batch
- why these games were chosen now
- what they each teach or train
- what is explicitly out of scope

Default batch size:

- 3 games for complex or interaction-heavy work
- 5 games maximum for simpler games

### 1.5. Do the Required Research Before Building

Before implementing any game, research enough to define the real mechanic:

- confirm what the game is supposed to teach or practice
- identify the core interaction loop
- identify age-band expectations and difficulty shape
- identify whether camera / hand-tracking / pointer fallback is appropriate
- identify required assets, sounds, and copy

Research sources should be used in this order:

1. existing repo sources first
   - related backlog docs
   - existing game pages
   - existing logic modules
   - worklog and research docs
2. if the repo is not enough, do targeted external research on the game mechanic or teaching pattern
3. document what was `Observed`, what was `Inferred`, and what remains `Unknown`

If a mechanic is still unclear after research, stop and mark that game `BLOCKED` rather than inventing a fake-complete version.

### 2. Build in the Real App Structure

Implement using the repo’s real patterns:

- canonical page in `src/frontend/src/pages/`
- logic module in `src/frontend/src/games/` when appropriate
- registration in `src/frontend/src/data/gameRegistry.ts`
- route wiring in `src/frontend/src/App.tsx`
- existing shared components/hooks instead of one-off copies

Prefer adapting a nearby working game over inventing a new structure, but produce a real new implementation, not a cosmetic clone.

When choosing patterns, explicitly inspect similar existing games first and state which files are being used as references.

### 3. No Placeholder or Fake Progress

Do not:

- add comments or headings that claim a feature is done when the wrapper/logic is not actually present
- leave imports or scaffolding without wiring the real behavior
- create orphan pages that are not routed or not registered
- mark `Status: DONE` while `Next Actions:` still contain unfinished implementation steps

### 4. Implement Fully, Game by Game

For each game, complete all of:

1. page file exists and compiles
2. logic/state is connected
3. game is registered
4. route is wired
5. access/progress/wellness wrappers are applied where appropriate
6. obvious broken imports/types are fixed

Finish one game cleanly before moving to the next whenever possible. A partially wired game does not count as complete.

### 5. Verify Before Claiming Completion

Minimum required verification for each batch:

1. targeted typecheck or full frontend typecheck
2. route/registry sanity check for every newly added game
3. at least one direct test, smoke check, or explicit runtime verification note per game
4. note any missing assets, copy, or design inputs that still need follow-up

If verification is missing, say so explicitly and do not claim the batch is complete.

## Required Deliverable Format

### Findings / Risks First

Start by listing:

- blockers
- ambiguous game specs
- missing assets
- open mechanic questions
- any research gaps that could change implementation decisions

### Per-Game Status Table

For every game in the batch, report:

- game name
- page file
- logic file (if any)
- research basis / reference games
- route added: yes/no
- registry entry added: yes/no
- verification run
- status: `DONE`, `IN_PROGRESS`, or `BLOCKED`

### Batch Summary

End with:

- what is fully complete
- what is partially complete
- what must happen next

### If Anything Is Partial

List exactly:

- what is missing
- what blocked it
- what the next concrete implementation step is

## Hard Rules

- No `*Refactored.tsx` files
- No batch larger than 5 games without explicit user approval
- No `100% complete` claims unless every game in the stated batch is verified
- No `DONE` status while numbered `Next Actions:` still exist in the same ticket
- No deletion of existing code/assets unless value is preserved or the user explicitly approves deletion
- No “starter scaffolds” committed as if they were finished games

## Required Worklog Trace

When using this prompt, add this line to the active worklog entry:

`Prompt Trace: prompts/implementation/new-game-batch-implementation-v1.0.md`

## Suggested Execution Pattern

1. choose the next 3 games from the 270+ list if the user has not already specified them
2. inspect similar existing games already in the app
3. research the mechanic and learning goal if anything is unclear
4. write a concrete mini-plan for those 3 games
5. implement the first game fully
6. verify it
7. repeat for the remaining games
8. run batch-level verification
9. update worklog honestly
10. only then mark completed items `DONE`
