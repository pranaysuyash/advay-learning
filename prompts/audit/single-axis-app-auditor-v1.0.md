# SINGLE-AXIS APP AUDITOR v1.0

## Purpose

Run a whole-app audit for **exactly one** consistency “axis” at a time (frontend / backend / docs), producing an evidence-first report, a single app-wide standard for that axis, a compliance matrix, and a migration + enforcement plan.

This is designed for a MediaPipe-based kids learning web app (camera + low-latency interaction + kid/parent trust constraints).

## Use When

- You want a repo-grounded audit across the app for one axis (e.g., accessibility, error UX, state patterns).
- You want a consistent “one best way” forward, not a grab-bag of suggestions.
- You want the output to be report-only (no code changes in that run).

## Non-negotiable Rules

1) **One axis only**. Do not drift into other topics.
2) **Evidence-first**: every non-trivial claim must be supported by one of:
   - file path + short code excerpt
   - screenshot (if UI axis)
   - reproduction step
   - command output
3) **No code changes** in this run. Report + recommendations only.
4) **Do not restart already-running services** unless explicitly instructed.
5) **Prefer repo truth over speculation**. If unknown: state what you checked and what would confirm it.

Evidence labels (required for non-trivial claims):

- **Observed** (directly verified)
- **Inferred** (logical implication)
- **Unknown** (cannot determine)

## Inputs (Provided by the User Each Run)

1) **Audit axis** (pick ONE, or user-defined):
   - A) UI design system consistency
   - B) Component architecture and reuse
   - C) Error handling and user-facing error UX
   - D) Loading/empty/success state patterns
   - E) Accessibility (keyboard, focus, contrast, reduced motion)
   - F) Performance (rendering, camera pipeline, bundle, memory)
   - G) Routing and page workflow coherence
   - H) State management patterns (data flow, caching, side effects)
   - I) Logging/telemetry and debuggability
   - J) Security posture in UI flows (permissions, privacy cues)
2) **Target surface**: frontend / backend / both
3) **Special constraints** (optional): e.g. “must use Playwright”, “no tool installs”, “focus only on /client”.

Suggested one-line request format:
> “Audit axis: Error handling and user-facing error UX. Surface: frontend + API boundary. Must use Playwright screenshots.”

## Step 0: Declare Scope (3 lines)

- Axis:
- In-scope surfaces:
- Out-of-scope (explicit exclusions):

## Step 1: Build the Evidence Map (Docs + Code)

1) Read docs first (repo truth):
   - `README.md`, `docs/`, `AGENTS.md`, ADRs, architecture notes, design guidelines, API docs.
2) Scan code for the chosen axis:
   - Use `rg` searches based on axis keywords.
   - Identify all pages/routes and core components affected by the axis.
   - Record file paths and minimal key snippets.

## Step 2: Define “The Standard” for This App

Choose a standard that fits:

- Kids app constraints (fun, clarity, forgiving UX)
- Camera/MediaPipe constraints (latency, jitter, permission flows)
- The existing code structure (do not recommend an alien architecture)

Output a crisp **Standard Spec**:

- Principles (5–10)
- Allowed patterns (with short examples)
- Disallowed patterns (with short examples)
- Required states (loading/empty/error/success) if relevant
- Naming conventions and folder boundaries if relevant
- Accessibility requirements if relevant
- Visual tokens if relevant (colors, type scale, spacing, radii)

## Step 3: Coverage Audit Across the Whole App

Enumerate the app surface (pages, key components, workflows). For each item, mark:

- Compliant
- Partially compliant
- Non-compliant

For non-compliant items:

- Explain what violates the standard
- Explain user impact (kid, parent, teacher)
- Point to exact evidence (path + short excerpt; screenshot if applicable)

## Step 4: Visual Confirmation (Only When Axis Touches UI)

If the axis is UI/UX/design/workflows/accessibility:

- Use Playwright (preferred) or equivalent to capture evidence:
  - Screenshots at desktop/tablet/mobile breakpoints
  - Key states: permission prompt, camera off, tracking lost, error, empty, loading, success
  - One main workflow video/trace if possible
- Produce a **Screenshot Index**: filename → route/state → what it proves

## Step 5: Decide “The One Best Way” Forward

- Pick one best approach and justify it in this app context.
- Show trade-offs and why you chose it.
- Explicitly call out what **NOT** to do (to prevent inconsistency).

## Step 6: Migration Plan and Enforcement

Migration plan (stepwise):

- Day 0–1 (quick wins)
- Week 1 (core refactor)
- Week 2+ (hardening)

Enforcement mechanisms (axis-specific examples):

- lint rules
- unit tests for error boundaries
- visual regression snapshots
- component API guards
- design token restrictions
- “forbid inline styles” policy (if chosen)

Propose a PR “Definition of Done” checklist for PRs touching this axis.

## Required Output Format (Strict)

# 1) Scope and axis

- Axis:
- In-scope:
- Out-of-scope:

# 2) Executive verdict

- Current consistency score (0–10) for this axis
- Biggest 3 risks to product quality (for this axis only)
- Biggest 3 opportunities (for this axis only)

# 3) Evidence map

- Docs consulted (paths)
- Code areas reviewed (paths)
- Key searches performed (queries)
- Optional: pages/routes list if relevant

# 4) Standard Spec (the app-wide rulebook for this axis)

- Principles
- Allowed patterns (with short examples)
- Disallowed patterns (with short examples)
- Required states/behaviors (if applicable)

# 5) Compliance matrix

For each page/component/workflow:

- Item:
- Status: Compliant / Partial / Non-compliant
- Evidence:
- Notes:

# 6) Top issues (ranked)

For each:

- Severity: Blocker / High / Medium / Low
- Where:
- Evidence:
- User impact:
- Fix direction:

# 7) Migration plan

- Day 0–1 (quick wins)
- Week 1 (core refactor)
- Week 2+ (hardening)

# 8) Enforcement plan

- Automated checks
- PR checklist
- Ongoing audit cadence

# 9) Appendix

- Screenshot Index (if any)
- Short code excerpts (only the minimum needed)
- Open questions (only those that block certainty)

## Axis-Specific Guidance (Pick Only What Matches the Axis)

If Axis = **Component architecture and reuse**:

- Identify component boundaries, prop API consistency, duplication hotspots, “one-off” variants.
- Output: a component inventory + recommended canonical components + anti-pattern list.

If Axis = **Error handling and error UX**:

- Identify all error sources (API, camera, permissions, model init, unsupported browser).
- Audit: how errors are surfaced, whether recoverable, and whether kids can proceed.
- Output: a single error taxonomy + UI patterns for errors + where current code diverges.

If Axis = **UI design system consistency**:

- Audit tokens, typography scale, spacing, radii, shadows, color usage, motion.
- Output: a minimal token set + component style rules + page-by-page violations.

If Axis = **Workflows and routing coherence**:

- Map workflows end-to-end and look for dead ends, confusing nav, broken back behavior.
- Output: workflow diagrams in text + recommended route structure + guardrails.

## Quality Gate (PASS/FAIL)

PASS only if all are true:

- You audited exactly **one axis** (explicitly stated in Scope).
- Every non-trivial claim is labeled Observed/Inferred/Unknown and has evidence.
- The “Standard Spec” is app-contextual (kids + camera constraints) and not alien to the repo.
- Compliance matrix covers the whole target surface.
- You did **not** write code or refactor anything.
- You listed enforcement mechanisms appropriate to the axis.

FAIL if any are true:

- Multiple axes are mixed.
- Output format deviates from the strict required sections.
- Claims are generic without repo evidence.
- Recommendations imply changes that weren’t verified against repo structure.

## Stop Condition

Stop when the report is complete in the strict output format and contains sufficient evidence to reproduce/verify each key finding.
