# Prompt Quality Gate Prompt v1.0

**Purpose**: Evaluate and iteratively improve a prompt (new or existing) so it is clear, testable, non-drifting, and aligned with this repo’s workflow.

**Use When**:
- A prompt produces inconsistent outputs
- Agents keep missing steps (tickets, evidence, scope)
- You are about to “publish” a new prompt into `prompts/`

---

## Inputs

- Target prompt file: `<path>`
- Intended users: `<audit|implementer|reviewer|qa|pm|workflow>`
- Intended work type: `<AUDIT|HARDENING|REMEDIATION|FEATURE|TRIAGE|DOCS|...>`

---

## PASS/FAIL Rubric

PASS only if all are true:
- **R1 Scope clarity**: Explicit in-scope/out-of-scope and stop condition.
- **R2 Evidence discipline**: Requires Observed/Inferred/Unknown labels for non-trivial claims.
- **R3 Deterministic output**: Required sections and “must include” fields.
- **R4 Non-duplication**: Prevents parallel versions (`*_v2`) and references preservation-first.
- **R5 Verification**: Includes verification commands or explicitly states why not.
- **R6 Repo integration**: References `docs/WORKLOG_TICKETS.md` and `prompts/README.md` indexing rules.

If any rubric item fails, revise the prompt and re-check.

---

## Step 1 — Static Review

Answer (briefly):
- What does this prompt produce?
- When should it be used?
- What does it forbid?
- What is the stop condition?

If any answer is unclear, update the prompt.

---

## Step 2 — “Failure Mode” Checklist

Add guardrails if missing:
- Agents start coding before ticket/plan exists
- Agents expand scope mid-run
- Agents omit evidence or claim “done” without verification
- Agents create duplicate files instead of refactoring
- Agents leave stray artifacts behind

Where possible, point to existing workflow prompts:
- `prompts/workflow/pre-flight-check-v1.0.md`
- `prompts/workflow/pre-merge-clean-room-check-v1.0.md`
- `prompts/workflow/preservation-first-upgrade-v1.0.md`
- `prompts/workflow/repo-hygiene-sweep-v1.0.md`
- `prompts/workflow/tech-debt-handling-v1.0.md`

---

## Step 3 — Minimal Test Cases

Define 2–3 “tabletop” test scenarios and expected outputs, e.g.:
- Scenario A: “User asks to fix one failing test”
- Scenario B: “User asks for a new feature with unclear scope”
- Scenario C: “User asks to import external prompt”

For each scenario:
- Expected scope contract
- Expected work type selection
- Expected required evidence
- Expected stop condition behavior

If the prompt doesn’t force the right output for the scenarios, revise it.

---

## Step 4 — Publish Gate

Before marking the prompt ready:
- Ensure it is indexed in `prompts/README.md`.
- Ensure there is a worklog ticket recording the change (append-only).

---

## Output (Required)

- PASS/FAIL + failed rubric items
- Proposed edits (bulleted)
- Test scenarios + expected behavior
- Worklog ticket to create/update
