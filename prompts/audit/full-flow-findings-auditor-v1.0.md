# Full-Flow Findings Auditor v1.0

Purpose: run a reality-first, stakeholder-driven audit across live app flows and surrounding code, and document every concrete finding immediately when discovered, not only at the end.

This prompt is for broad, evidence-first auditing of the repo as it actually behaves:
- runtime flow breakages
- logic bugs
- hidden failure paths
- poor UX or misleading product promises
- reliability risks
- test gaps
- performance and optimization opportunities
- structural/maintainability issues such as duplicate folders, stray files, redundant implementations, or avoidable complexity

This is a report-and-document prompt. Default behavior is no code changes unless explicitly paired with a remediation prompt.

## 0) When To Use

Use this prompt when the user wants one or more of the following:
- “simulate the app”
- “pick flows and audit them”
- “act like different stakeholders”
- “find anything wrong, including logic/optimization/duplication”
- “document issues as you see them”
- “do a broad codebase pass, not just one test failure”

Use it especially when the user wants:
- multiple user journeys
- both runtime and code review
- findings beyond the active slice
- immediate preservation of discoveries in repo docs

## 1) Non-Negotiable Rules

1. Evidence-first:
- Every non-trivial claim must be labeled as `Observed`, `Inferred`, or `Unknown`.

2. Immediate finding capture:
- The moment you verify a concrete issue, document it in repo artifacts.
- Do not wait until the final report to preserve it.
- If the finding is outside the currently traced flow, still record it under out-of-scope or adjacent findings.

3. Broad findings count:
- A “finding” includes:
  - runtime failures
  - logic defects
  - UX friction
  - broken promises between copy and behavior
  - misleading errors
  - degraded fallback behavior
  - test coverage blind spots
  - documentation drift
  - structural duplication
  - stray or generated artifacts living in source paths
  - overlapping or redundant implementations
  - clear optimization opportunities with concrete evidence

4. Preserve parallel work:
- Do not delete, revert, or “clean up” repo files during the audit unless explicitly asked.
- Structural issues must be documented first, not silently fixed.

5. Repo-native outputs only:
- Save prompt-driven findings into repo docs/worklogs, not chat alone.

## 2) Inputs

- Repo root: `<PROJECT_ROOT>`
- User request: `<AUDIT_GOAL>`
- Optional focus areas: `<FOCUS_AREAS>`
- Optional stakeholder set: `<PERSONAS_OR_FLOWS>`

If stakeholder set is not provided, choose at least 3:
- New visitor / demo user
- New parent / account creator
- Returning parent / subscribed user
- Child / learner starting a game
- Parent in settings / privacy / controls flow
- User in degraded conditions (offline, denied camera, expired session, failed backend dependency)

## 3) Required Prompt Pairing

Before or alongside this prompt, read:
- `AGENTS.md`
- `prompts/README.md`
- `prompts/workflow/worklog-v1.0.md`

Recommended companion prompts:
- `prompts/review/generalized-code-review-audit-v1.0.md`
- `prompts/ux/ux-flow-analysis-v1.0.md`
- `prompts/workflow/agent-entrypoint-v1.0.md`

## 4) Outputs You Must Create

1. Worklog update in `docs/WORKLOG_ADDENDUM_*.md`
- Create or continue a ticket for the audit
- Append evidence as work happens

2. Main audit report
- Preferred path:
  - `docs/reviews/<DESCRIPTIVE_NAME>_YYYY-MM-DD.md`

3. Optional issue-specific companion notes
- If a major out-of-scope or cross-cutting issue is found, add it to:
  - the active report under `Out-of-scope findings`, or
  - a dedicated review/audit doc if needed

## 5) Work Sequence

### Step 1: Orientation

Run and record:

```bash
git status --porcelain
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
pwd
ls -la
find . -maxdepth 3 -type d | sed -n '1,200p'
rg -n "TODO|FIXME|HACK" src docs prompts -S || true
rg -n "duplicate|legacy|deprecated|Refactored|old|backup|copy" src docs -S || true
rg --files src docs prompts | sed -n '1,300p'
```

Record:
- repo state
- branch
- active parallel work
- candidate high-risk areas

### Step 2: Reality Map

Inspect and record:
- frontend entrypoint
- backend entrypoint
- route definitions
- auth/session system
- progress persistence
- gating systems (subscription, profile, camera, onboarding)
- any feature flags or fallback layers

At minimum inspect:
- `README.md`
- frontend app entry
- backend app entry
- route files
- auth store/service
- progress store/service
- settings store/service

### Step 3: Choose Stakeholder Flows

Select at least 3 complete flows.

Each flow must include:
- entry point
- happy-path intent
- failure/edge expectations
- concrete completion definition

Example flow list:

1. Visitor:
- Home -> CTA -> demo/game entry

2. New parent:
- Register -> learner setup -> login -> first dashboard

3. Returning parent:
- Login -> dashboard -> progress -> settings -> sign out

4. Child:
- Games gallery -> game start -> in-game feedback -> exit/restart

5. Degraded user:
- denied camera / offline / expired session / failed subscription service

### Step 4: Execute Flows

For each chosen flow:

1. Trace code path first
2. Run it in the browser or through local runtime tools where feasible
3. Check backend/API behavior as needed
4. Compare promise vs reality

Use:
- Playwright or repo browser tooling for UI/runtime checks
- curl/http client for API reproduction
- targeted tests if they help validate or expose coverage gaps

### Step 5: Immediate Finding Capture

As soon as a concrete issue is verified:

1. Add it to the active report immediately
2. Add an execution-log note in the worklog if it materially changes understanding
3. Mark whether it is:
- in-scope
- adjacent
- out-of-scope but important

Do this even if:
- you have not finished the flow
- the finding belongs to another subsystem
- it is “just” a duplicate folder or structural smell
- it is an optimization or cleanup opportunity rather than a crash

## 6) What Counts As A Finding

Record all of the following when supported by evidence:

### A. Runtime / Logic
- broken routes
- API contract mismatches
- silent failures
- hidden exceptions
- impossible or incomplete flows
- stale state after navigation
- fallback behavior that does not actually fallback

### B. UX / Product Truth
- button/copy promise does not match behavior
- user progress is silently dropped
- error messages mislead users
- child-facing flow is blocked by parent-only assumptions
- onboarding/tutorial causes friction or loops

### C. Reliability / Testability
- untested critical endpoint
- tests passing while live path fails
- invalid mocks masking real integration breakage
- fragile state coupling

### D. Performance / Optimization
- repeated network calls
- duplicated fetches
- unnecessary expensive checks on hot paths
- heavy startup behavior with weak justification
- background tasks running when auth/session state makes them pointless

### E. Structural / Maintainability
- duplicate folders
- multiple files doing the same job
- dead-looking but still referenced paths
- generated caches or artifact folders inside source trees
- split abstractions with conflicting contracts
- misleading names
- obsolete files still shaping behavior

## 7) Report Format

Use this structure:

# Full-Flow Audit: `<PROJECT>`

Date: `YYYY-MM-DD`
Repo: `<PROJECT_ROOT>`
Primary angle: `<chosen>`
Secondary angles: `<chosen>`

## 1) Executive Summary

- concise bullets
- what is actually broken
- what only looks broken
- what is risky but not yet confirmed

## 2) Repo Reality Map

- structure
- entrypoints
- run path
- critical systems affecting flows

## 3) Stakeholder Journeys

For each flow:
- goal
- path
- expected completion
- actual result
- evidence

## 4) Findings

For each finding:

### F-XXX `<Title>` (Severity: Critical/High/Medium/Low)

What it is:
- clear statement

Evidence:
- `Observed`:
  - commands
  - runtime behavior
  - file anchors
- `Inferred`:
  - only if needed
- `Unknown`:
  - what still needs proof

Why it matters:
- user/system impact

Recommended direction:
- files/systems likely involved
- no patch required unless the task includes implementation

## 5) Out-of-Scope But Important Findings

- flat list with brief explanation

## 6) Optimization / Simplification Opportunities

- only include evidence-backed items
- prefer opportunities that materially reduce duplication, confusion, or cost

## 7) Testing Gaps

- which failing realities are not covered
- which existing tests are misleadingly green

## 8) Suggested Next Work Units

- max 5
- each with scope contract and acceptance criteria

## 9) Appendix: Evidence Log

- commands run
- key outputs
- files reviewed

## 8) Required Audit Behavior Around Scope

If you find something outside the original test slice:
- do not ignore it
- do not silently expand into implementation
- document it immediately
- classify it clearly

If you find a likely cleanup or simplification:
- do not delete or move files during the audit
- record the evidence and why the current structure is weaker

If you find duplication:
- prove both locations exist
- determine whether they are both live, partially live, or stale
- record which file appears canonical and why

## 9) Good Audit Heuristics

Ask repeatedly:
- Does the app do what the UI says it does?
- Does the runtime do what the code comments imply?
- Do tests reflect the actual user journey?
- Is this fallback real or only nominal?
- Is this complexity justified?
- Is this file/folder structure telling the truth about ownership and runtime behavior?
- Is there a simpler, more canonical shape already in the repo?

## 10) Stop Conditions

Pause and escalate only if:
- multiple conflicting canonical paths cannot be resolved from code evidence
- local runtime is unavailable and flows cannot be simulated
- the user’s request changes from audit to remediation
- documenting a finding would expose secrets or unsafe data

Otherwise continue, document, and preserve.
