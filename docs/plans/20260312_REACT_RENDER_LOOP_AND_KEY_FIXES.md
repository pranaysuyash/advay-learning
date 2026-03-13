# IMPLEMENTATION PLAN - REACT RENDER LOOP AND KEY FIXES

**Date**: 2026-03-12
**Ticket**: TCK-20260312-001
**Source**: User-reported console errors

## Problem Statement
1.  **Infinite Render Loop**: `useGameHandTracking` -> `setFps` -> `useGameLoop` -> `onFrame` cycle causing "Maximum update depth exceeded".
2.  **Duplicate Keys**: `CircuitBuilder.tsx` rendering multiple components with key `bulb`.

## Proposed Changes

### 1. Stabilization of Frontend Hooks
- **useGameHandTracking.ts**: Add `useRef` or `memo` to `options` to prevent effect re-runs. Only update `fps` and `averageFps` if the change is significant (> 1 FPS).
- **useTTS.ts**: Wrap `checkSpeaking` in `useCallback` and only call `setIsSpeaking` if the value returned from `ttsService.isSpeaking()` has actually toggled.

### 2. UI Key Collision Fixes
- **CircuitBuilder.tsx**:
    - Update `requiredComponents` map to use `${type}-${index}` as key.
    - Ensure toolbox items use unique IDs.
- **CHALLENGES (circuitBuilderLogic.ts)**: Ensure validations and meta-data are stable.

## Verification Plan
1.  **Manual**: Open Circuit Builder, add 3 bulbs. Check console for "Duplicate key" warnings.
2.  **Performance**: Start `ShapePop` or `ShapeStacker` with hand tracking. Verify FPS counter update doesn't trigger component-wide deep re-renders using `react-scan`.
3.  **Automated**: `npm test src/frontend/src/hooks/__tests__/useGameHandTracking.test.ts` (if exists, else create).
