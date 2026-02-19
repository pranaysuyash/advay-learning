# External Feedback Verification & Integration Prompt v1.0

## Purpose

Provide a disciplined, evidence-first workflow for triaging every piece of external feedback so it can influence the codebase only after it is verified, scoped, and logged.

## Use When

- You receive external feedback (user, teammate, reviewer, customer, or automated guardrail) that might drive code, UX, or process changes.
- The feedback is not yet tied to a tracked ticket or audit finding.
- You are acting as the “Working Agent” for the repo and must evaluate whether to accept, defer, or reject the suggestion.

## Non-negotiable Rules

- **External feedback is a hypothesis**; test it with repo artifacts, running sessions, or audit frameworks before accepting.
- **Do NOT implement changes in this run.** The goal is verification, not execution.
- Do not restart services unless explicitly asked.
- Evidence must be labeled **Observed/Inferred/Unknown** wherever conclusions are drawn.
- If you can’t verify something because of missing access, document the blocker and request the minimum evidence (screenshots, routes, credentials, etc.) without repeating already-supplied info.

## Inputs

- Verbatim external feedback text.
- Context: environment (local/staging/prod), page/route, device details (if provided).
- Desired outcome (accept/ignore, backlog, rebuttal, etc.).
- Project audit frameworks (Single-Axis Auditor, UI Audit, etc.) referenced by the repo.

## Preconditions

- Repository is open.
- Any relevant services (frontend/backend) that were already running remain active; do not restart them.
- You know the current audit frameworks (e.g., Single-Axis Audits) and where to look for them.

## Steps

1. **Step 0 – Normalize the feedback**
   - Restate the text in three buckets: Claims (with testable statements), Recommendations, and Implied Goals.
   - Convert each Claim into a statement that can be verified/falsified.
2. **Step 1 – Choose a single audit framework**
   - Pick the axis that best matches the feedback (UI design, workflow coherence, error UX, performance, etc.).
   - Document: selected axis, why it fits, and explicit out-of-scope items from the feedback.
3. **Step 2 – Build a verification plan**
   - For every testable claim, note where to check (files/routes/components), reproduction steps (click path/commands), evidence required (code snippet, DOM text, screenshot, log), and pass/fail criteria.
   - If UI-related, include a visual confirmation pass with at least two breakpoints (desktop + mobile) and key states (loading, empty, error, success); define screenshot names.
   - If code-related, identify relevant files and ripgrep queries to locate canonical implementations and divergences.
4. **Step 3 – Execute verification (observe only)**
   - Follow the plan: gather facts, reproduction steps, and evidence references (screenshots, file paths, excerpts).
   - Record blockers (missing env, auth, feature gates) and stop; do not fix issues.
5. **Step 4 – Classify feedback**
   - For each claim/recommendation assign Status, Confidence, Impact, Scope, Risk, and supporting notes.
6. **Step 5 – Triage decision**
   - One of: Accept now, Accept later, Needs clarification/data, Reject, Split (partially accept).
7. **Step 6 – Translate decisions**
   - For Accept now/later items, write backlog-ready specs (title, problem, evidence, proposed change, success criteria, risks, test plan).
   - For Reject items, craft rebuttals (claim, checks, evidence, reason, alternative).
8. **Step 7 – Enforce pattern consistency**
   - If the feedback touches a pattern (component, error handling, design tokens), document the canonical standard, pages that comply, divergences, migration plan, and guardrails (lint rules, PR checklist, visual snapshots).

## Output Format

Produce the report exactly in the required section order with headings and bullets:

```
# 1) External feedback summary
- Source:
- Raw feedback (quoted briefly):
- Normalized claims:
- Normalized recommendations:
- Implied goal:
...
```

Follow the remaining sections (audit framework, verification plan, evidence log, findings matrix, decision, backlog-ready specs, consistency enforcement, what would change your mind) per the instructions.

## Stop Condition

- Enough evidence collected to classify each claim and produce backlog entries or rebuttals.
- No code changes have been made; you can now hand off the verified feedback for implementation.
