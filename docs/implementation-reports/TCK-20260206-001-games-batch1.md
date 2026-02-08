# TCK-20260206-001 - Games Batch 1 Implementation Report

Date: 2026-02-06
Ticket: TCK-20260206-001
Status: DONE

## Scope

Batch objective was to convert hand tracking to a reusable base runtime and implement a concrete game batch on top of it.

### Planned Batch (selected from documented catalog + new adaptations)

1. Finger Number Show runtime migration (existing game)
2. Music Pinch Beat (new game; pinch lane rhythm)
3. Steady Hand Lab (new game; hold-inside-target control)

## Architecture Outcome

### Base Tracking (shared)

Added:
- `src/frontend/src/hooks/useHandTrackingRuntime.ts`
- `src/frontend/src/utils/handTrackingFrame.ts`

Shared responsibilities:
- Pull video frame from webcam
- Execute `detectForVideo` through centralized loop
- Normalize hand output to `TrackedHandFrame`
- Provide mirrored index tip and pinch transition state
- Hand off frame to per-game callbacks

### Game-Specific Customization

- Finger Number Show: counts extended fingers across detected hands, applies stable-match success window, and scoring.
- Music Pinch Beat: maps fingertip x-position to rhythm lane and scores on pinch-start transitions.
- Steady Hand Lab: computes distance-to-target and time-based hold progress with decay.

This keeps base tracking behavior consistent while allowing each game to define its own logic.

## Implementation

### New files

- `src/frontend/src/hooks/useHandTrackingRuntime.ts`
- `src/frontend/src/utils/handTrackingFrame.ts`
- `src/frontend/src/pages/MusicPinchBeat.tsx`
- `src/frontend/src/pages/SteadyHandLab.tsx`
- `src/frontend/src/games/musicPinchLogic.ts`
- `src/frontend/src/games/steadyHandLogic.ts`
- `src/frontend/src/utils/__tests__/handTrackingFrame.test.ts`
- `src/frontend/src/games/__tests__/musicPinchLogic.test.ts`
- `src/frontend/src/games/__tests__/steadyHandLogic.test.ts`

### Updated files

- `src/frontend/src/games/FingerNumberShow.tsx` (migrated to shared runtime)
- `src/frontend/src/App.tsx` (added new game routes)
- `src/frontend/src/pages/Games.tsx` (added game cards)

## Verification

### Command

`cd src/frontend && npm run type-check`

Result:
- Passed

### Command

`cd src/frontend && npm run test -- --run src/utils/__tests__/handTrackingFrame.test.ts src/games/__tests__/musicPinchLogic.test.ts src/games/__tests__/steadyHandLogic.test.ts`

Result:
- 3 test files passed
- 11 tests passed

## Prompt + Persona Traceability

- Prompt: `prompts/implementation/feature-implementation-v1.0.md`
- Prompt: `prompts/workflow/worklog-v1.0.md`
- Lens: shared infrastructure + child-game interaction consistency

## Notes

- Existing parallel workspace changes were preserved without stashing/removal.
- This batch focused on hand tracking runtime. Pose/face runtime unification remains future scope.
