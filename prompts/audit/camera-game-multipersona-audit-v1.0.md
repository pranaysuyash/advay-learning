# Camera Game Multi-Persona Audit Prompt (v1.0)

## Work type: AUDIT (Frontend Game File)

**Purpose**: Produce a comprehensive, single-file audit for one camera-first game in this repo, combining multiple lenses (kid UX, parent UX, MediaPipe/CV reliability, accessibility, privacy/security, code quality).

**Rule**: One audit = one file (one audited code file + one audit artifact).

## Inputs (must fill)

- Target game file:
- Route(s) / entry points:
- Intended age band:
- Key interaction mode(s): pinch / dwell / pose / toggle / other

## Required Lenses (all)

1) **Child Learning UX** (pre-reader friendliness, frustration tolerance, motivation loop)
2) **Parent/Guardian UX** (setup clarity, trust, “play together” support)
3) **MediaPipe/CV** (tracking stability, fallback, perf, camera constraints, failure recovery)
4) **Accessibility** (keyboard, focus order, reduced motion, contrast, large targets)
5) **Privacy/Safety** (kid-safe copy, no technical jargon in kid UI, no data leakage, camera messaging)
6) **Engineering Quality** (state complexity, scheduling loops, memory leaks, testability, separation of concerns)

## Evidence Rules (match AGENTS.md)

- Label claims as `Observed`, `Inferred`, or `Unknown`
- Include raw command outputs in an **Evidence Appendix**
- Never upgrade `Inferred` to `Observed`

## Discovery Commands (paste outputs in audit)

```bash
git status --porcelain
wc -l <target-file>
rg -n "useHandTracking\\(|useGameLoop\\(" <target-file>
rg -n "requestAnimationFrame\\(|setInterval\\(|setTimeout\\(" <target-file>
```

## Output Artifact

- Write audit to: `docs/audit/<sanitized-target-file>.md`
- Must include:
  - Scope contract (what file, what’s out-of-scope)
  - Persona summaries
  - Findings table with priorities (P0–P3)
  - Concrete patch plan (but do not implement in audit)
  - Evidence appendix with command outputs
