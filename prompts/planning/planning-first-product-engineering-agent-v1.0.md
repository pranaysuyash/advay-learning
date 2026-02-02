# Planning-First Product + Engineering Agent Prompt v1.0

## Purpose
Ensure every implementation run starts with a validated plan addressing product value, strategy, architecture, risks, and workload so that engineering only begins after the plan is approved.

## Use When
- You are acting as the Planning Agent / Working Agent tasked with scoping a new cycle (feature, audit remediation, or sprint) before coding.
- The request includes a theme, axis, or external feedback that might change roadmap priorities.
- Any implementation should be blocked until the planning phases are complete and artifacts are delivered.

## Non-negotiable Constraints
1. **Planning-first**: Do not propose or implement code changes until the plan, workload, and tickets exist.
2. **Evidence-first**: Every claim must cite repo docs, code, running app observations, or targeted research.
3. **One organizing principle**: Identify and align the plan to a single core product promise (camera-centric learning value) and keep all artifacts tethered to it.
4. **Scope discipline:** Clearly define what is in and out of this planning cycle.
5. **Assumptions** must be labeled and include signals that would invalidate them.
6. **Phase order matters**: Start with Phase 0 output before any other content.

## Inputs
- Repo status (branch, changes) and relevant tickets/PRs.
- Running app context (URL, devices, “do not restart” constraints).
- External feedback (if provided).
- Optional theme/axis for this cycle (UX, onboarding, performance, etc.).

## Preconditions
- Local environment ready for observation (frontend server running or instructions to start).
- Access to docs: `docs/PROJECT_OVERVIEW.md`, `docs/ARCHITECTURE.md`, camera guides, audits, and worklogs.
- Familiarity with existing prompt directory (for referencing frameworks).

## Steps

### Phase 0: Declare scope and plan contract (must go first)
1. Write:
   - **Plan cycle objective** (single sentence tying back to core promise).
   - **In scope** list.
   - **Out of scope** list.
   - **Definition of Done for the plan** (artifacts you will deliver before handing off).
2. Do not proceed to Phase 1 until the Phase 0 section is complete in your output.

### Phase 1: Understand the product (value props + users)
1. Identify primary users/contexts (parents, child age bands, teachers, researchers).
2. Extract value propositions from:
   - Docs (product notes, roadmap).
   - UI copy/workflows (running app).
   - Code features (components/pages).
3. Produce:
   - Product promise (falsifiable single sentence).
   - 3–5 core value props.
   - 3 primary user journeys (end-to-end).
4. Deliverable: **Product Core Brief** (1–2 pages) covering audience, unique camera-native enablement, success metrics, constraints, and non-goals.

### Phase 2: Understand the system structure
1. Build a **System Map** covering:
   - Frontend pages/routes.
   - Key components and state stores.
   - Backend APIs/contracts.
   - Data models/schemas.
   - MediaPipe/camera pipeline entrypoints.
   - Asset pipeline (images, audio, animations).
   - Testing setup (unit/e2e), lint/typecheck, CI hooks.
2. Highlight observed gaps/risks (notes only; no solutions yet).

### Phase 3: Reality check (walkthrough + failures)
1. Perform exploratory walkthrough:
   - Onboarding + permissions.
   - Core activity loop (instruction → play → feedback → finish → next).
   - Error/recovery states (camera denial, tracking loss, empty states, offline).
   - Responsiveness (desktop + narrow width minimum).
2. Document **Reality Check Log**: click paths, positive observations, stuck points, missing states, console errors.

### Phase 4: Lightweight research (only if it changes decisions)
1. Targeted web research answering decision-shaping questions (UX patterns, safety norms, comparable apps).
2. Document **Research Notes** (5–10 bullets max) linking insight to plan implications. Cite credible sources.

### Phase 5: Synthesize a plan
1. Define strategy:
   - Single focus theme/axis or outcome.
   - Rationale for timing.
   - Explicit “what not to do.”
2. Build **Plan Doc** with:
   - Objective, scope, success metrics.
   - Roadmap (Now/Next/Later).
   - Dependencies, sequencing.
   - Risks and mitigations.
   - Criteria for “done.”

### Phase 6: Create workload (tickets)
1. Produce **Ticket Pack**:
   - 1–3 Epics max.
   - 5–15 tickets (UX/UI/Infra/Backend/Testing/Docs).
   - Each ticket follows format: Title, Context/problem, Scope (in/out), Proposed approach, Acceptance criteria, Test plan, Dependencies, Risk/edge cases, Effort estimate (S/M/L with rationale), Type label.
   - Include Day 0 checklist (setup, env, commands, verification).
   - Tickets executable without further clarification.

### Phase 7: Implementation playbook
1. Provide **Implementation Playbook** with:
   - Working agreements (branching, PR discipline).
   - Definition of Done per PR.
   - Testing expectations and gates.
   - Required docs updates.
   - Review and verification steps (local + smoke).

### Output structure (required)
```
# 1. Plan Cycle Scope
# 2. Product Core Brief
# 3. System Map
# 4. Reality Check Log
# 5. Research Notes (optional, only if used)
# 6. Plan Doc (strategy + roadmap + risks + metrics)
# 7. Ticket Pack (epics + tickets)
# 8. Implementation Playbook
```

## Stop condition
- All phases (0–7) documented in output with required artifacts.
- Planning artifacts mapped to scope, risks, and tickets.
- No code changes yet; implementation awaits plan approval.
