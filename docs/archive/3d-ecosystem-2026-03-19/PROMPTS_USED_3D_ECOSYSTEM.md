# Three.js Ecosystem - Prompts Used

**Date:** 2026-03-19  
**Session:** Audit Follow-up & Loop Closure  
**Prompts Used:** 2

---

## Prompt 1: Audit-Doc Work Planner

**Purpose:** Find audit docs, extract findings, create worklist

**Full Prompt:**
```
You are an Audit-Doc Work Planner agent operating inside a code repo.

MISSION
Find existing audit/review/design docs, select ONE doc to focus on, extract what it says (explicit), infer what it implies (implicit), and produce a prioritized, actionable worklist plus a local "PR" breakdown plan.

DEFINITION
- Explicit: directly stated issues, TODOs, recommendations, risks, decisions.
- Implicit: gaps, inconsistencies, missing tests, missing docs, architectural debt, UX problems, performance risks that logically follow from the audit content and the current repo state.

CONSTRAINTS
- Do NOT implement anything. This is analysis + planning only.
- Use repo evidence. Every claim should reference file paths and (when possible) line ranges.
- If you are unsure, label it Unknown and describe what evidence would resolve it.
- Keep quotes short (max 25 words).
- Prefer tangible acceptance criteria and testable outcomes.
- Assume workflow: analysis → document → plan → research → document → implement → test → document.
- "PR" means a local, stepwise implementation unit: locally tested, committed, documented.

STEP 0: ORIENT
1) Identify the repo root and list key folders (src, apps, packages, docs, tests, scripts, infra).
2) Capture basic signals: language(s), framework(s), package manager, test runner, linting, CI config (even if CI not used).

STEP 1: FIND AUDIT DOCS
Search for audit-like docs and collect candidates with paths:
- Filenames/keywords: audit, review, design review, postmortem, retro, notes, findings, tech debt, checklist, RFC, ADR, TODO.
- Directories: docs/, notes/, .github/, planning/, design/, architecture/, adr/, reports/.
Commands you may use (examples): rg, fd/find, ls, git log, git grep.

Output: "Audit Doc Inventory"
- Path
- Title/header (first meaningful heading)
- Last modified (git log -1)
- One-line summary (your best guess)
- Why it might be high leverage

STEP 2: PICK ONE DOC (EXPLAIN WHY)
Pick ONE document using these criteria in order:
1) Highest risk or most blocking issues
2) Most recent and still relevant
3) Most connected to multiple systems (cross-cutting)
4) Contains concrete repro steps or measurable metrics

Output: "Chosen Doc"
- Path
- Selection rationale (2–5 bullets)

STEP 3: READ + MAP THE DOC
Produce a structured map:
A) "Doc Outline"
- Sections and what each is about (1–2 lines each)

B) "Key Claims"
For each claim:
- Claim statement
- Tag: Observed / Inferred / Unknown
- Evidence: quote (<=25 words) + location (path + line range if available)

C) "Open Questions"
- Unknowns that block accurate planning
- Exactly what repo evidence or quick experiment would resolve each

STEP 4: TRANSLATE INTO WORK
Create a prioritized backlog that includes BOTH explicit and implicit items.

Output: "Worklist"
Group into:
1) Explicit Work Items (directly mentioned)
2) Implicit Work Items (you inferred)

For EACH work item include:
- Title (verb first, specific)
- Category: bug / refactor / performance / UX / reliability / security / tooling / docs / tests
- Source:
  - Explicit: quote snippet + doc location
  - Implicit: reasoning in 2–4 bullets, plus repo evidence links
- Priority: P0 (urgent), P1, P2, P3
- Impact: user-facing / developer-facing / cost / latency / correctness
- Risk if not done
- Proposed approach (short, concrete)
- Affected areas: files/modules
- Acceptance criteria (bullet list, testable)
- Test plan: unit/integration/e2e + what to assert
- Docs to update (if any)
- Dependencies (other items, migrations, feature flags)
- Effort estimate: S (<=1 day), M (2–4 days), L (1–2 weeks), XL

STEP 5: LOCAL PR PLAN (IMPLEMENTATION UNITS)
Convert the worklist into a "PR Plan":
- PR-1, PR-2, … in safe dependency order
For each PR:
- Goal
- Scope (what is in/out)
- Files likely touched
- Tests to run locally
- Documentation updates
- Rollback plan (if applicable)
- Validation checklist

STEP 6: RESEARCH TODOs (ONLY IF NEEDED)
If any work item requires external validation (library behavior, best practice, security guidance), list:
- What to look up
- Why it matters
- What decision it will change

FINAL DELIVERABLE FORMAT
Return a single Markdown report with these sections in order:
1) Repo Orientation
2) Audit Doc Inventory
3) Chosen Doc
4) Doc Outline
5) Key Claims (Observed/Inferred/Unknown)
6) Open Questions
7) Worklist (Explicit then Implicit)
8) PR Plan
9) Research TODOs (optional)

QUALITY BAR
- Make the work items concrete enough that an engineer could start implementing without more interpretation.
- Prefer fewer, higher-leverage items over a giant vague list.
- Be brutally honest about uncertainty and missing evidence.
```

**When Used:** Initial audit of `3D_ECOSYSTEM_FINAL_STATUS.md`  
**Output:** 5 explicit + 5 implicit findings identified

---

## Prompt 2: Loop Closure Execution

**Purpose:** Execute findings, close loop, update docs

**Full Prompt:**
```
You have produced findings from an audit doc and a derived worklist. Now turn that into an execution plan using Pranay's workflow, and "close the loop" by updating the repo docs/mentions where issues were found (explicitly or implicitly).

MISSION
1) Prioritize and categorize the findings into a backlog.
2) Drive execution using the workflow: analysis → document → plan → research → document → implement → test → document.
3) For every issue you address, update the original sources where the issue was mentioned (explicit) or implied (implicit): audit docs, TODO lists, ADRs, READMEs, issues.md, comments, etc. Add resolution notes, status, and any new learnings.
4) Produce an implementation-unit plan (Unit-1, Unit-2, …) as small, safe, dependency-ordered batches. Do NOT include anything about committing.

CONSTRAINTS
- Use repo evidence for repo-specific claims. Cite file paths and line ranges.
- No vague items. Every backlog item must have acceptance criteria and a test plan.
- If something is uncertain, label Unknown and specify what evidence/experiment resolves it.
- Keep quotes short (<=25 words).
- Keep changes small and reversible. Prefer feature flags where risk is high.
- Do not delete user-facing behavior without noting trade-offs.
- When research is required, you MAY use online sources and MUST cite them (URLs or source titles) and summarize why they change decisions.

INPUTS YOU ALREADY HAVE
- The Audit Doc Inventory
- The Chosen Doc + Key Claims
- The Worklist (explicit + implicit)
If any of these are missing, reconstruct them quickly from the repo before proceeding.

STEP 1: CONSOLIDATE + DEDUPE
Create a single "Issue Register" by deduplicating overlapping items:
For each issue:
- Canonical ID (ISSUE-001…)
- Title
- Category (bug/refactor/perf/UX/reliability/security/tooling/docs/tests)
- Source mentions: list all places it appears
  - Explicit: direct quotes + path + line
  - Implicit: reasoning + repo evidence links (paths/lines)
- Impact and risk
- Dependencies

STEP 2: PRIORITIZE
Use a simple rubric and show the score:
- Severity (user harm / correctness / security / data loss)
- Frequency/Blast radius
- Effort
- Confidence (evidence strength)
Output:
- P0 / P1 / P2 / P3 queue
- "Quick wins" bucket (high impact, low effort)
- "Risky changes" bucket (needs safeguards)

STEP 3: WORKFLOW EXECUTION PLAN (PER ISSUE)
For each issue in priority order, produce a mini-plan that follows the workflow:

A) ANALYSIS
- Current behavior (what happens today)
- Root cause hypothesis
- Evidence (paths/lines)
- Edge cases

B) DOCUMENT
- Update/append a short note in the relevant audit doc or tracking doc:
  - status: Planned / In Progress / Done
  - chosen approach
  - acceptance criteria summary
  - pointer to implementation unit(s)

C) PLAN
- Concrete implementation steps
- Rollback plan
- Migration/compat notes

D) RESEARCH (repo + online as needed)
- What to verify (library behavior, best practice, security guidance, perf trade-offs)
- Where you looked:
  - Repo files (paths)
  - Online sources (titles/URLs)
- What decision it changes (be explicit)

E) DOCUMENT (pre-implementation)
- Add/update README/ADR/docs if this changes intended behavior or architecture

F) IMPLEMENT
- Scoped changes only (list files/modules)

G) TEST
- Tests to add/update
- Commands to run locally
- Manual validation steps if needed

H) DOCUMENT (post-implementation)
- Update the original mention sources with resolution notes
- Add a CHANGELOG entry if user-facing
- Add "lessons learned" if the audit doc is meant to evolve

STEP 4: IMPLEMENTATION-UNIT PLAN (NO COMMIT TALK)
Convert the prioritized issues into Unit-1, Unit-2, … with dependency order.
For each unit:
- Goal
- Issues covered (ISSUE-IDs)
- Scope (in/out)
- Files likely touched
- Tests to run (lint/test/build)
- Documentation edits included

STEP 5: "CLOSE THE LOOP" DOC UPDATES (MANDATORY)
Create a "Mentions Update Plan" table:
For each ISSUE-ID:
- Mention location(s): path + line
- Update action:
  - add status badge or checklist item
  - add resolution note + date
  - link to unit number (Unit-1 etc.)
  - if implicit: add explicit note explaining the inference and how it was resolved

If the repo lacks a canonical tracker doc, create one:
- docs/audit/ISSUE_REGISTER.md (or similar)
- Include: issue list, status, unit links, acceptance criteria summary

FINAL DELIVERABLE
Return ONE Markdown report:
1) Issue Register (deduped)
2) Prioritization (rubric + queues)
3) Execution Plan by Issue (workflow steps, including online research citations where used)
4) Implementation-Unit Plan
5) Mentions Update Plan (where/how docs will be updated)

THEN TAKE ACTION
After the report, begin Unit-1 immediately:
- Make changes
- Run tests
- Update docs/mentions
- Summarize what changed + what's next
Repeat for subsequent units until you hit a natural stopping point.
```

**When Used:** After findings identified, to execute and close loop  
**Output:** 5 implementation units, all docs updated, 100% findings closed

---

## How They Work Together

**Workflow:**
1. **Prompt 1** → Find audit doc, extract findings (explicit + implicit)
2. **Prompt 2** → Execute findings, update docs, close loop

**Sequence:**
```
Prompt 1 (Audit-Doc Work Planner)
  ↓
Findings Identified (5 explicit + 5 implicit)
  ↓
Prompt 2 (Loop Closure Execution)
  ↓
Execution Units Created (5 units)
  ↓
All Findings Closed (10/10 - 100%)
  ↓
Docs Updated & Archived
```

---

## Results Achieved

**Using These Two Prompts:**
- ✅ 10 audit findings identified
- ✅ 10 findings closed (100%)
- ✅ 5 implementation units executed
- ✅ 16 documents archived
- ✅ 2 active docs updated
- ✅ Issue register created
- ✅ All loops closed

**Time Spent:** ~2 hours total

---

## When to Use

**Use Prompt 1 When:**
- You need to find what's wrong
- Audit docs exist but findings not extracted
- You need explicit + implicit issues identified

**Use Prompt 2 When:**
- Findings already identified
- You need to execute and close loops
- You need docs updated with resolution status

**Use Both Together When:**
- Complete audit-to-closure workflow needed
- End-to-end issue resolution required
- Documentation must be updated

---

**Saved For:** Future audit and loop-closure work  
**Archive Location:** `docs/PROMPTS_USED_3D_ECOSYSTEM.md`
