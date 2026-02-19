# Generalized Implementer Prompt (Local Review, Single Scope Area, No PR Language)

You are the implementer agent for [PROJECT_ROOT]. Follow AGENTS.md (evidence-first, scope discipline, append-only worklog, no scope creep).

## Work type

HARDENING CHANGESET (one scope area):
"Make the repo runnable for contributors and align docs/scripts to the actual project layout and entrypoints."

## Why this work (must be evidence-backed)

You must first confirm drift exists via local evidence. Common patterns:

- Scripts/docs assume an old directory layout that does not exist.
- Quickstart instructions do not match the runnable code.
- Contributors will follow docs and get stuck.

## Scope Contract

Behavior change allowed: YES for dev tooling and docs behavior. NO for user-facing features. NO for adding new product functionality.

### In-scope (explicit files only)

You must enumerate the exact files after you discover them.
Typical categories (select only what is needed):

- Verification scripts (lint/typecheck/test scripts, network restriction checks)
- Contributor docs (README, QUICKSTART, IMPLEMENTATION_SUMMARY, PROJECT_STATUS)
- WORKLOG_TICKETS.md (append new ticket + evidence)

### Out-of-scope

- Any new features (including ML/vision/engine work)
- Any backend business logic expansion unrelated to "runnable + drift alignment"
- Dependency upgrades unless strictly required to make existing commands runnable
- Refactors outside the explicit in-scope list

## Acceptance Criteria (must be testable locally)

- Verification scripts point to the real source directories and do not assume nonexistent paths.
- Quickstart/contributor docs accurately describe how to run frontend/backend (or whatever the actual components are).
- A new WORKLOG_TICKETS.md entry exists with:
  - Exact commands run
  - Raw outputs
  - Observed/Inferred/Unknown labels
  - Clear "done" status
- Running the recommended "verify" path succeeds or fails with actionable errors (no misleading paths).

## Evidence commands you must run and paste into the worklog ticket

Run these (adapt to the repo):

- pwd
- ls -la
- find . -maxdepth 3 -type d | sed -n '1,120p'
- Identify runnable roots:
  - ls -la [frontend_dir] 2>/dev/null || echo "no [frontend_dir]"
  - ls -la [backend_dir] 2>/dev/null || echo "no [backend_dir]"
- Identify drift across scripts/docs:
  - rg -n "cd [OLD_DIR]|[OLD_DIR]/src|[OLD_LAYOUT_STRING]" . -S
  - rg -n "http\\(s\\)://" . -S
  - rg -n "TODO|FIXME" [key dirs] -S

## Deliverables

- Patch only the in-scope files.
- Keep changes minimal and preservation-first (do not delete large doc sections; correct them).
- Add a short "how to verify locally now" snippet in the primary contributor doc.
- Stop when acceptance criteria are met. Do not start implementing product features.

## Worklog ticket to append (append-only)

Use this exact structure:

```markdown
## [YYYY-MM-DD] Ticket: Hardening runnable layout and docs/scripts alignment
Status: Done

### Summary
- [What drift was fixed]
- [What commands now work]

### Scope Contract
In-scope files:
- [explicit list]
Out-of-scope:
- [explicit list]
Behavior change allowed: YES (dev tooling + docs), NO (user-facing)

### Changes Made
- [bullet list of edits by file]

### Acceptance Criteria Verification
- Command:
  Output:
- Command:
  Output:

### Local Review Notes
- What changed and why (short)
- What a reviewer should run:
  - [commands]
- Expected results:
  - [expected outcomes]

### Evidence Log
Observed:
- Command:
  Output:
- Anchor:
  File:
  Snippet:

Inferred:
- [if any]

Unknown:
- [if any]
```
