# Pose Action Feature Blueprint (2026-03-09)

## Purpose

Define a concrete `features/pose-action-games/*` architecture to remove repeated in-page pose runtime code and standardize how pose-driven games are built.

Target games in first wave:

1. `FreezeDance`
2. `SimonSays`
3. `FollowTheLeader`
4. `BalloonPopFitness`
5. `MusicalStatues`
6. `ObstacleCourse`
7. `YogaAnimals`

## Why This Module

These games duplicate MediaPipe runtime bootstrap and GPU->CPU fallback in pages.

Evidence examples:

1. `src/frontend/src/pages/FreezeDance.tsx:93-120`
2. `src/frontend/src/pages/SimonSays.tsx:227-254`
3. `src/frontend/src/pages/FollowTheLeader.tsx:81-104`
4. `src/frontend/src/pages/BalloonPopFitness.tsx:88-116`
5. `src/frontend/src/pages/MusicalStatues.tsx:73-96`
6. `src/frontend/src/pages/ObstacleCourse.tsx:222-249`
7. `src/frontend/src/pages/YogaAnimals.tsx:208-235`

## Proposed Folder Structure

```text
src/frontend/src/features/pose-action-games/
  index.ts

  runtime/
    usePoseLandmarkerRuntime.ts
    poseLandmarkerConfig.ts
    poseFrameLoop.ts
    poseRuntimeErrors.ts

  adapters/
    webcamFrameAdapter.ts
    landmarkNormalization.ts
    visibilityGuards.ts

  scoring/
    movementWindow.ts
    holdTracker.ts
    comboScoring.ts

  ui/
    PoseRuntimeStatusBadge.tsx
    PoseCalibrationPanel.tsx
    PoseDebugOverlay.tsx

  types/
    poseRuntime.ts
    poseScoring.ts
    poseActions.ts

  __tests__/
    usePoseLandmarkerRuntime.test.ts
    poseFrameLoop.test.ts
    holdTracker.test.ts
    comboScoring.test.ts
```

## Design Boundaries

1. `pages/*` remain route entrypoints and game orchestration shells.
2. `features/pose-action-games/*` owns camera+pose runtime lifecycle and generic scoring helpers.
3. Game-specific rules stay in each game domain (`pages` now, later `features/<game>`), not in shared runtime.
4. Existing `useGameHandTracking` remains separate and can be composed alongside pose runtime.

## Public API (First Draft)

```ts
// runtime
export function usePoseLandmarkerRuntime(options: {
  enabled: boolean;
  webcamRef: React.RefObject<import('react-webcam').default | null>;
  targetFps?: number;
  onLandmarks?: (frame: PoseRuntimeFrame) => void;
  onError?: (error: PoseRuntimeError) => void;
}): PoseRuntimeState;

// scoring
export function createHoldTracker(params: {
  requiredMs: number;
  tolerance: number;
}): HoldTracker;

export function calculateComboScore(params: {
  basePoints: number;
  streak: number;
  maxBonus: number;
}): number;
```

## Migration Plan (Phased)

### Phase 0: Baseline and Safety

1. Add shared feature module skeleton + tests.
2. Add adapter tests for GPU->CPU fallback behavior.
3. Add a tiny dev-only runtime badge for visual verification.

### Phase 1: Runtime Extraction Only

1. Move pose bootstrap/init cleanup logic from all 7 games into `usePoseLandmarkerRuntime`.
2. Keep all game scoring logic in place.
3. Verify each game still starts and tracks poses correctly.

### Phase 2: Scoring Primitive Extraction

1. Extract hold-window and combo/streak primitives where duplicated.
2. Keep game-specific thresholds in game files.

### Phase 3: Optional UI Consolidation

1. Standardize calibration/status/error UI where appropriate.
2. Preserve game personality by allowing custom wrappers/branding.

## Suggested Pilot Order

1. `ObstacleCourse` (already uses clear phase model; easy runtime boundary).
2. `FreezeDance` (high impact and large file).
3. `SimonSays`.
4. Remaining 4 games in batch.

## Acceptance Criteria For Blueprint Adoption

1. No game page directly calls `FilesetResolver.forVisionTasks` after Phase 1 in migrated games.
2. Runtime init/fallback tests exist and pass for shared feature module.
3. At least 2 pilot games reduced by >= 20% LOC while behavior remains stable.
4. Smoke tests for migrated games pass.

## Risks And Mitigations

1. Runtime regressions in camera lifecycle: mitigate with feature-level tests and page-level smoke tests.
2. Over-abstraction of game-specific behavior: keep scoring thresholds/rules in game domain.
3. Merge churn while many games are active: migrate one pilot at a time.
