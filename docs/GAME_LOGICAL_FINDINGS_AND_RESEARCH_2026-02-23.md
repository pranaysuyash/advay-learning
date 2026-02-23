# Game Logical Findings + Research Log (Rolling)

Date: 2026-02-23  
Owner: Codex (execution), Pranay (project owner)  
Ticket: `TCK-20260223-900`  
Workflow: Analysis -> Document -> Plan -> Research -> Document -> Implement -> Test -> Document

## Purpose

Central evidence-first tracker for game-by-game logical issue analysis and related research.  
Detailed per-file audits are kept in `docs/audit/`.

## Current Coverage

| Game | Analysis Status | Findings | Audit Artifact |
| --- | --- | --- | --- |
| FreeDraw | Complete (analysis/doc) | 3 (2 High, 1 Medium) | `docs/audit/src__frontend__src__pages__FreeDraw.tsx.md` |
| EmojiMatch | Partial (S1 remediation completed, logic audit pending) | S1 UX blockers addressed; full logic pass pending | `docs/WORKLOG_TICKETS.md` (`TCK-20260223-004`) |
| Next game | Pending | - | - |

## Findings Snapshot (FreeDraw)

1. `HIGH` - Clear action does not fully reset drawing state.
2. `HIGH` - Tracking loop active while start menu is visible.
3. `MEDIUM` - Canvas backing resolution not synchronized with rendered size.

Source: `docs/audit/src__frontend__src__pages__FreeDraw.tsx.md`

## Research Track: On-Screen Embodied Hands (Rayman-style) vs VR

### Decision (Current)

- Recommendation: implement on-screen embodied hand avatar first; do not pursue full VR now.

### Evidence and Rationale

- `Observed`: current architecture is camera + browser + MediaPipe-based and optimized for low-friction access.
  - `src/frontend/src/hooks/useGameHandTracking.ts`
  - `docs/V2_ARCHITECTURE_PROPOSALS.md`
- `Observed`: active P0 focus is stability/performance on standard browsers (worker fallback + boundaries + image optimization), not XR stack migration.
  - `docs/V2_ARCHITECTURE_PROPOSALS.md`
  - `docs/DEMO_READINESS_ASSESSMENT.md`
- `Inferred`: on-screen avatar hands improve agency/clarity for kids with far lower delivery risk than adding headset-dependent UX and XR rendering/perf constraints.

### Applied Research Direction

1. Build as an extension of current cursor system, not a new platform.
2. Prioritize visibility + feedback:
   - palm/finger silhouette
   - pinch state animation
   - forgiving hit feedback/trail
3. Start with one game pilot (`EmojiMatch`) behind a feature flag, then expand cohort-by-cohort.

## Next Execution Queue (One Game at a Time)

1. `FreeDraw` remediation implementation + targeted tests.
2. `EmojiMatch` full logical pass (post-S1 UX changes).
3. `ShapeSequence` logical pass.
4. `NumberTapTrail` logical pass.

## Documentation Rules for this Program

1. Every game analyzed gets one audit artifact in `docs/audit/`.
2. Every finding is labeled `Observed` / `Inferred` / `Unknown`.
3. Every remediation must link back to finding IDs and ticket IDs.
4. Keep this file as the rolling index; keep details in per-game audit files.

---

## Update: P0 Closure + Floating Hand Pilot (2026-02-23 13:15 IST)

### P0 Closure Verification

- `Observed`: current branch now passes frontend quality gates and targeted P0 suites.
  - `cd src/frontend && npm run -s type-check`
  - `cd src/frontend && npm run -s lint`
  - targeted tests for worker/boundary/image/smoke.

### Floating Hand Pilot Evidence

- `Observed`: `EmojiMatch` cursor path now uses `CursorEmbodiment` with hand-vs-dot fallback.
  - `src/frontend/src/pages/EmojiMatch.tsx`
- `Observed`: soft cartoon hand component and adapter are implemented.
  - `src/frontend/src/components/game/HandAvatarCursor.tsx`
  - `src/frontend/src/components/game/CursorEmbodiment.tsx`
  - `src/frontend/src/components/game/cursorEmbodimentConfig.ts`
- `Observed`: unit coverage added for hand rendering, coordinate mapping, and variant resolution.
  - `src/frontend/src/components/game/__tests__/HandAvatarCursor.test.tsx`
  - `src/frontend/src/components/game/__tests__/CursorEmbodiment.test.tsx`

### Decision Log

- `Observed`: chosen embodiment style is Soft Cartoon Hand.
- `Observed`: rollout policy is Pilot then Expand.
- `Inferred`: this minimizes regression risk while immediately improving agency feedback in the highest-priority game.

### Next Queue (unchanged)

1. FreeDraw remediation implementation (from audit findings).
2. Cohort A cursor embodiment expansion (`ShapeSequence`, `NumberTapTrail`).
3. Cohort B cursor embodiment expansion (`ColorMatchGarden`, `LetterHunt`, `WordBuilder`).

### Cohort A Rollout Update (2026-02-23 13:19 IST)

- `Observed`: Cohort A pages now on shared embodiment adapter.
  - `src/frontend/src/pages/ShapeSequence.tsx`
  - `src/frontend/src/pages/NumberTapTrail.tsx`
- `Observed`: `CursorEmbodiment` keeps fallback path to dot cursor when flag/game allowlist does not enable hand avatar.
- `Observed`: Post-rollout checks pass (`type-check`, `lint`, targeted tests).
- `Inferred`: adapter approach is stable for applying the same migration pattern to Cohort B without gameplay logic rewrites.
