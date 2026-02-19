# Generalized Triage Prompt (Local Review, No PR Language, No Code Changes)

You are an AI agent working in [PROJECT_ROOT] under AGENTS.md rules (evidence-first, scope discipline, append-only worklog).

## Work type: TRIAGE

No code changes in this run.

## Goal

Propose the single next work unit for moving this project toward a "full app" (frontend + backend + safety controls), based on the current repo state. Your output must be specific enough that another implementer can execute it without guessing.

## Inputs you must incorporate

- Repo layout as observed locally (actual folders, actual runnable entrypoints).
- Existing TODO stubs and drift in scripts/docs.
- Any stated constraints in AGENTS.md or project docs (platform, offline, security posture, etc).
- The "Observed repo facts" list provided below by the requester (treat it as claims that must be verified or falsified with evidence).

## Observed repo facts (to verify locally)

Paste the requester-provided bullets here, then do evidence collection to confirm each claim:

- [PASTE FACTS HERE]

## Required output (do all)

1) Append a new ticket to WORKLOG_TICKETS.md (append-only).
2) In that ticket, propose ONE next work unit only (one hardening scope area OR one remediation OR one feature slice).
3) Write a scope contract for that work unit:
   - In-scope files (explicit list)
   - Out-of-scope (explicit)
   - Behavior change allowed: YES/NO
   - Acceptance criteria (testable)
   - Local review checklist (what a reviewer should run/verify)
4) Propose the "full app" path in 3 phases (P0/P1/P2), but select only ONE phase as the next work unit and justify why it unblocks the most.
5) Include an evidence log with commands + raw outputs (Observed/Inferred/Unknown labels). Use only local commands. Cite exact anchors using rg and sed -n (or equivalent).

## Constraints

- Do not implement code.
- Do not change more than one scope area.
- Prefer the smallest work unit that unblocks the next one.
- If the repo is not a git repository in this workspace, use file paths and code anchors, not commit SHAs.

## How to do evidence (minimum)

Run and capture outputs (adapt paths if needed):

- pwd
- ls -la
- find . -maxdepth 3 -type d | sed -n '1,120p'
- rg -n "TODO|FIXME|HACK" . -S
- rg -n "[OLD_LAYOUT_ANCHOR]|[KNOWN_DRIFT_PATTERN]" . -S
- For each claimed fact: rg -n "<unique string>" <likely file/dir> -S, then sed -n "<line1>,<line2>p" <file>

## Decision framework (pick ONE work unit)

Pick the option that most unblocks the full app path. You may propose different options than below, but you must keep it to ONE.

### Suggested work unit options (pick one)

A) "Core engine integration MVP"

- Minimal end-to-end wiring from input (camera/files/sensors) to a working interaction loop in the UI.
B) "Auth/data persistence end-to-end"
- Real auth/session handling plus persistence for user state/progress/settings.
C) "Safety/controls hardening"
- Parent gate, privacy controls, indicators, delete/export flows, and enforcement wiring.
D) "Docs/scripts drift hardening"
- Make the project runnable for contributors by aligning scripts/docs with the actual layout and entrypoints.

In your ticket, include:

- Choice: A/B/C/D (or your own)
- Justification with evidence (Observed quotes and anchors)
- What this enables next (explicit follow-on work unit)

## Ticket format to append to WORKLOG_TICKETS.md

Use this exact structure:

```markdown
## [YYYY-MM-DD] Ticket: [Concise title of the chosen work unit]
Status: Proposed

### Summary
- [1 to 3 bullets: what we will do, and why]

### Scope Contract
In-scope files:
- [explicit list]

Out-of-scope:
- [explicit list]

Behavior change allowed: [YES/NO]
Notes:
- [any constraints]

### Acceptance Criteria (testable)
- [criterion 1]
- [criterion 2]
- [criterion 3]

### Local Review Checklist
- [command or manual check 1]
- [command or manual check 2]
- [expected outcomes]

### Full App Path (3 phases)
P0:
- [...]
P1:
- [...]
P2:
- [...]
Next work unit chosen: [P0 or P1 or P2] with justification.

### Evidence Log
Observed:
- Command:
  Output:
- Anchor:
  File:
  Snippet:

Inferred:
- [clearly marked reasoning based on observed evidence]

Unknown:
- [unknowns that matter]
- Blocking questions (only if truly blocking):
  - [...]
- Non-blocking questions:
  - [...]
Assumptions if unanswered:
- [...]
```
