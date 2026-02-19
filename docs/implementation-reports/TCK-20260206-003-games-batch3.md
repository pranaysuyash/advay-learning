# TCK-20260206-003 - Games Batch 3 Implementation Report

Date: 2026-02-06
Ticket: TCK-20260206-003
Status: DONE

## Scope Delivered

1. Migrated `ConnectTheDots` from a custom per-page tracking loop to `useHandTrackingRuntime`.
2. Added reusable hit-target utility for circle-based pinch interactions.
3. Added two new runtime-based games:

- Number Tap Trail
- Shape Sequence
1. Added routes and game catalog entries for new games.
2. Added tests for new shared utility and verified type-check/tests.

## Shared Reuse Added

### Runtime migration

- `src/frontend/src/pages/ConnectTheDots.tsx` now uses `useHandTrackingRuntime`.
- Old in-page `requestAnimationFrame` + direct `detectForVideo` orchestration was removed.

### New shared interaction utility

Added:

- `src/frontend/src/games/hitTarget.ts`

Purpose:

- Locate the first circular target hit by a fingertip point + radius.

Used by:

- `src/frontend/src/pages/NumberTapTrail.tsx`
- `src/frontend/src/pages/ShapeSequence.tsx`

### Existing shared utilities reused

- `pickSpacedPoints` from `src/frontend/src/games/targetPracticeLogic.ts`
- `useHandTrackingRuntime` from `src/frontend/src/hooks/useHandTrackingRuntime.ts`

## New Game Summary

### Number Tap Trail

- Pattern: Ordered target collection
- Skill: Number sequence and accuracy
- Input: Fingertip cursor + pinch to select correct next number

### Shape Sequence

- Pattern: Memory sequence execution
- Skill: Sequence memory and attention
- Input: Fingertip cursor + pinch shapes in prompted order

## Routing and Catalog

Added routes:

- `/games/number-tap-trail`
- `/games/shape-sequence`

Catalog entries added in games list:

- `number-tap-trail`
- `shape-sequence`

## Verification

### Type-check

Command:

`cd src/frontend && npm run type-check`

Result:

- Passed

### Tests

Command:

`cd src/frontend && npm run test -- --run src/games/__tests__/hitTarget.test.ts src/games/__tests__/targetPracticeLogic.test.ts src/utils/__tests__/handTrackingFrame.test.ts`

Result:

- 3 files passed
- 11 tests passed

## Prompt + Persona Traceability

- Prompt: `prompts/implementation/feature-implementation-v1.0.md`
- Prompt: `prompts/workflow/worklog-v1.0.md`
- Lens: runtime extraction + reusable game mechanics

## Notes

- Existing parallel workspace changes were preserved.
- Batch 3 remains frontend-only by scope.
