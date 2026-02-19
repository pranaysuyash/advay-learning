# RESEARCH-015 :: “Make It A Hit” Launch Hitlist (Top 10)

Date: 2026-01-31  
Scope: Frontend + Backend + UX + Content (planning only; no code changes here)  
Audience: PM/Design/Engineering/QA  

## Goal

Identify the 10 highest-leverage changes that will make Advay feel “instantly good” to a parent + child in the first session (camera-first, modern UI, clear prompts, reliable tracking, visible progress).

## Discovery Summary (Evidence-First)

**Observed**:

- Brand system exists with explicit palette + typography guidance in `docs/BRAND_KIT.md`.
- Competitor / brand analysis exists in `docs/BRAND_GUIDELINES_ANALYSIS.md`.
- Camera-game UX issues + overlay overload are documented in `docs/audit/ui__camera_game_screen_ux_audit_2026-01-30.md` and `docs/audit/CAMERA_GAME_UX_DEEP_ANALYSIS_2026-01-30.md`.
- Analytics/progress gaps are documented in `docs/audit/ANALYTICS_TRACKING_AUDIT.md`.
- Gradients/“flashy” styling patterns exist in the frontend codebase.
  - Command: `rg -n "bg-gradient-to" src/frontend/src -S | head -n 20`
  - Output (excerpt):
    - `src/frontend/src/pages/Home.tsx:19: ... bg-gradient-to-r ...`
    - `src/frontend/src/components/WellnessTimer.tsx:114: ... bg-gradient-to-r ...`
    - `src/frontend/src/components/WellnessReminder.tsx:91: ... bg-gradient-to-br ...`

**Inferred**:

- The product’s differentiation (camera-as-primary mechanic) is currently undermined when UI overlays compete with the camera feed and when some games fall back to mouse interactions.
- The “AI giveaway” look/feel is primarily driven by color/gradient choices + inconsistent component styling, not by the underlying product concept.

**Unknown**:

- Actual on-device FPS and CPU usage across target devices without profiling runs.
- The exact failure modes for “tracking not working” across games without reproducing each user scenario and capturing logs.

## Top 10 “Hit Right Away” Changes

Each item includes: *Why it matters*, *What users feel*, and *How we’ll know it worked*.

### 1) Brand-forward, non-AI UI theme (remove “purple gradient” vibe)

- Why: First impressions decide trust; parents quickly judge “quality” from typography, color, and spacing.
- User feeling: “This is a polished kids product,” not a demo.
- Success: Core pages + game shells use `docs/BRAND_KIT.md` tokens; no default Tailwind “rainbow gradient” look in primary UI surfaces.

### 2) Camera is the hero (overlay budget enforcement)

- Why: The app’s core promise is “learn with your hands.”
- User feeling: “The camera is the game.”
- Success: During active play, camera feed occupies ≥70% vertical space; ≤3 persistent overlays (goal pill, minimal status, one primary CTA).

### 3) Reliable hand tracking (works in the 80th percentile of real conditions)

- Why: If tracking feels flaky, kids quit and parents label it “broken.”
- User feeling: “It just works.”
- Success: Define a reproducible tracking QA checklist (lighting, distance, thumb visibility, 1–2 hands) and pass it per game.

### 4) Fix Connect-the-Dots as a camera-first mechanic (no “broken” mode)

- Why: A single broken game poisons overall trust.
- User feeling: “Every game works.”
- Success: Connect-the-Dots can be played end-to-end using hand controls (pinch/point) with clear success feedback.

### 5) Finger counting correctness (0–10, two hands, thumb edge cases)

- Why: Kids immediately test limits (0, 5, 10); failures feel unfair.
- User feeling: “It recognizes what I’m doing.”
- Success: “Show 0”, “Show 5”, “Show 10” succeed with clear, stable detection rules; 2-hand sum is correct.

### 6) Kid-legible prompts + audio (two-stage prompt + TTS, consistent)

- Why: Non-readers rely on audio; readers need large prompts.
- User feeling: “I always know what to do.”
- Success: Every camera game uses: big center goal (≈1.8s) → compact side goal; TTS replay available via user gesture.

### 7) First 30 seconds flow (permission → camera ready → play)

- Why: Drop-off happens before the first success moment.
- User feeling: “I’m playing already.”
- Success: A child can reach first success within ~20–30 seconds (after camera permission), with minimal navigation.

### 8) Visible learning progress (parent dashboard that’s actually useful)

- Why: Parents need proof; kids need a sense of advancement.
- User feeling: “My child is improving,” “We’re making progress.”
- Success: Cross-game progress shows: recent activity, counts, and simple “next up” suggestions (no metric overload).

### 9) Rewards pacing + anti-runaway streaks

- Why: If streaks inflate too fast, rewards feel fake and distracting.
- User feeling: “I earned this.”
- Success: Success events require stable holds and are rate-limited; celebrations are burst-only (no persistent pulsing).

### 10) Performance + stability guardrails (especially camera)

- Why: Jank + crashes are “broken,” even if rare.
- User feeling: “Smooth and safe.”
- Success: Define and track basic perf metrics; add user-friendly camera error states + recovery paths.

## Ticket Mapping (Single Source of Truth)

Planned implementation tickets live in `docs/WORKLOG_TICKETS.md`. The umbrella execution plan is:

- `docs/plans/TCK-20260131-115-implementation-plan.md`
