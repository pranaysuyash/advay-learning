# Randomized Exploratory Testing Prompt Pack v1.0

## Purpose
Pair structured technical verification with persona-driven random exploration to uncover regressions, confusion, or fun-failures that scripted tests miss in the MediaPipe-based kids learning experience.

## Use When
- You are acting as a QA/Tester or Working Agent verifying a release, audit remediation, or large UX change.
- You want the reproducibility of formal checks plus the creativity of chaotic user testing.
- The feature touches UI/UX, camera tracking, or learning flows.

## Non-negotiable Rules
- Evidence-first: every issue must include reproduction steps, environment, and either a screenshot, log, or code reference.
- Do NOT restart services unless explicitly instructed.
- Do NOT implement any fixes in the same run—this prompt is observation-only.
- Random exploration is required (three sessions minimum, persona guided).
- Keep a single primary audit axis for the structured check, then evaluate issues against that axis.
- Do not stop after tests pass; continue with random walks.

## Inputs
- Repo context (branch, changes, relevant PR or ticket).
- Services already running (frontend/backend).
- Target audit axis (UI consistency, error UX, performance, etc.).
- Access to automated suites (unit tests, lint, typecheck, Playwright/E2E if present).

## Preconditions
- Local environment is configured; running services remain untouched.
- You have a timer available (physical/mental) for persona sessions.
- You know how to capture screenshots and record console logs.

## Steps
1. **Step 0 – Run metadata prep**
   - Note the audit axis, environment (local/staging), which services were already running, and confirm you will not restart or code change.
2. **Step 1 – Structured checks**
   - Run relevant unit/integration tests, typechecks, lint, or Playwright/E2E suites (only the minimal set that applies).
   - Record commands, results, and any notable logs (failures, warnings, runtime errors).
3. **Step 2 – Randomized persona exploration**
   - Pick one audit axis (e.g., UI design) and evaluate each finding against it.
   - Perform at least three persona sessions (Personas 1–12 listed; you can add more but document them).
   - For each session:
     * Set a 5–12 minute timer (use persona-specific durations when provided).
     * Follow the randomization method:
       - First 60 seconds: use only random actions 1–8.
       - Next: perform 3 camera stress actions (choose from 9–14).
       - Then: perform 3 state probing actions (choose from 15–20).
       - Repeat until time expires.
     * Use at least 10 random actions per session.
     * Log persona, duration, click path, action order, axis violations, delight moments, and any issues (severity, steps, expected vs actual).
4. **Step 3 – Consolidate findings**
   - Compile top issues (ranked by severity), patterns tied to the primary axis, and recommend the next audit focus (only one axis).
   - Summaries should include blockers or stuck states if encountered.

## Required Outputs
Follow the strict “SINGLE RUN OUTPUT FORMAT”:

```
# 1) Run metadata
- Audit axis:
- Environment:
- What was already running:
- What you did NOT do (no restarts, no code changes):

# 2) Structured checks
- Commands run:
- Results:
- Notable logs:

# 3) Random exploration sessions
## Session A
- Persona:
- Duration:
- Click path:
- Action log:
- Issues found:
- Axis violations found:
- Delight moment:

## Session B
...

# 4) Consolidated findings
- Top 10 issues ranked by severity
- Patterns behind the issues (axis-specific)
- Recommended next audit focus (one axis only)
```

Include persona prompts verbatim when using provided personas; custom personas must be documented in the required format.

## Stop Condition
- Completed all structured checks and at least three persona sessions with logs.
- Documented all issues with evidence (screenshots, console logs, DOM notes).
