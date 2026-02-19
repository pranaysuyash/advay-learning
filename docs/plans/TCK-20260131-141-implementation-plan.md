# IMPLEMENTATION PLAN: TCK-20260131-141

## Hand Tracking Centralization

**Date:** 2026-01-31  
**Status:** IN_PROGRESS  
**Owner:** AI Assistant  

---

## Discovery Summary

### Observed (from code analysis)

**File: `src/frontend/src/pages/AlphabetGame.tsx`**

- Contains hand tracking loop at lines 413-553
- Has `smoothPoints()` function with 3-point moving average
- Uses hysteresis: start 0.05, release 0.07
- Has debug logging with `DEBUG_TRACKING` flag
- Full canvas redraw each frame with glow effect

**File: `src/frontend/src/pages/LetterHunt.tsx`**

- Has its own hand initialization (lines 52-79)
- Pinch detection without hysteresis (line 275: `pinchDistance < 0.05`)
- No frame skipping
- GPU only, no CPU fallback

**File: `src/frontend/src/games/FingerNumberShow.tsx`**

- Has hand initialization (lines 323-351)
- Has frame skipping (lines 392-396: `frameSkipRef.current % 2`)
- Lower confidence thresholds (0.3)
- Duplicate `countExtendedFingersFromLandmarks()` function

**Command Output:**

```bash
$ rg -l "HandLandmarker" src/frontend/src
src/frontend/src/pages/AlphabetGame.tsx
src/frontend/src/pages/LetterHunt.tsx
src/frontend/src/games/FingerNumberShow.tsx
```

### Inferred

- Each game implements hand tracking independently
- No shared utilities exist for hand tracking
- Refactoring one game won't affect others without shared hooks
- AlphabetGame has the most mature implementation

### Unknown

- Performance impact of centralization (needs testing)
- Browser compatibility of shared hooks
- Bundle size impact

---

## Options Considered

| Option | Approach | Pros | Cons | Risk |
|--------|----------|------|------|------|
| A | Create shared hooks (recommended) | DRY, consistent, maintainable | Requires refactoring | MED |
| B | Copy-paste best patterns | Quick, low risk | Still duplicated, hard to maintain | LOW |
| C | Library (external) | Battle-tested | Adds dependency, may not fit needs | HIGH |

**Recommendation:** Option A - Create shared hooks. The duplication is significant enough to justify the refactoring effort.

---

## Implementation Plan

### Phase 1: Core Hooks (TCK-20260131-142)

**Files to create:**

1. `src/frontend/src/hooks/useHandTracking.ts`
2. `src/frontend/src/hooks/useGameLoop.ts`
3. `src/frontend/src/types/tracking.ts`

**useHandTracking hook:**

```typescript
interface UseHandTrackingOptions {
  numHands?: number;
  minDetectionConfidence?: number;
  minHandPresenceConfidence?: number;
  minTrackingConfidence?: number;
  delegate?: 'GPU' | 'CPU';
  enableFallback?: boolean;
}

interface UseHandTrackingReturn {
  landmarker: HandLandmarker | null;
  isLoading: boolean;
  error: Error | null;
  isReady: boolean;
  initialize: () => Promise<void>;
}
```

**Key features:**

- Automatic GPU→CPU fallback
- Consistent default confidence (0.3)
- Error handling with user-friendly messages
- Cleanup on unmount

**useGameLoop hook:**

```typescript
interface UseGameLoopOptions {
  onFrame: (deltaTime: number, fps: number) => void;
  isRunning: boolean;
  targetFps?: number;
}
```

**Key features:**

- RAF management
- FPS limiting
- Delta time calculation
- Automatic cleanup

### Phase 2: Drawing Utilities (TCK-20260131-143)

**File to create:** `src/frontend/src/utils/drawing.ts`

**Functions:**

```typescript
// Smooth points using moving average
export function smoothPoints(
  points: Point[], 
  windowSize?: number
): Point[];

// Build segments separated by break points (NaN)
export function buildSegments(
  points: Point[]
): Point[][];

// Draw segments with glow effect
export function drawSegments(
  ctx: CanvasRenderingContext2D,
  segments: Point[][],
  options: DrawOptions
): void;

// Setup canvas to match video dimensions
export function setupCanvas(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
): boolean;

// Draw letter hint outline
export function drawLetterHint(
  ctx: CanvasRenderingContext2D,
  letter: string,
  options: HintOptions
): void;
```

### Phase 3: Pinch Detection (TCK-20260131-144)

**File to create:** `src/frontend/src/utils/pinchDetection.ts`

```typescript
interface PinchState {
  isPinching: boolean;
  distance: number;
  startThreshold: number;
  releaseThreshold: number;
}

interface PinchResult {
  state: PinchState;
  transition: 'start' | 'continue' | 'release' | 'none';
}

export function detectPinch(
  landmarks: Landmark[],
  previousState: PinchState | null,
  options?: PinchOptions
): PinchResult;

export function createDefaultPinchState(): PinchState;
```

**Hysteresis logic:**

- Start pinch: distance < 0.05
- Release pinch: distance > 0.07
- Transition events: 'start', 'continue', 'release', 'none'

### Phase 4: AlphabetGame Refactor (TCK-20260131-145)

**Changes to `src/frontend/src/pages/AlphabetGame.tsx`:**

1. Replace hand tracking useEffect with useHandTracking hook
2. Replace drawing logic with drawing utilities
3. Replace pinch detection with pinchDetection utility
4. Add useGameLoop for frame management
5. Keep existing UI and game logic

**Migration steps:**

1. Import new hooks/utilities
2. Replace initialization
3. Replace detection loop
4. Replace drawing logic
5. Test thoroughly

### Phase 5: Other Games Refactor (TCK-20260131-146)

**LetterHunt changes:**

- Use useHandTracking hook
- Use detectPinch utility
- Add useGameLoop

**FingerNumberShow changes:**

- Use useHandTracking hook
- Use useGameLoop
- Keep custom finger counting (game-specific)

---

## Testing Strategy

### Unit Tests

**drawing.test.ts:**

- smoothPoints with various inputs
- buildSegments with break points
- drawSegments with empty segments

**pinchDetection.test.ts:**

- Hysteresis behavior
- Transition detection
- Edge cases (null landmarks)

**useHandTracking.test.ts:**

- Hook renders without error
- Initialize function exists
- Cleanup on unmount

### Integration Tests

- AlphabetGame works with new hooks
- LetterHunt works with new hooks
- FingerNumberShow works with new hooks

### Manual Verification

1. Start each game
2. Verify hand tracking initializes
3. Test pinch-to-draw (AlphabetGame)
4. Test pinch-to-select (LetterHunt)
5. Test finger counting (FingerNumberShow)
6. Verify smooth drawing
7. Verify glow effects

---

## Verification Checklist

- [ ] useHandTracking hook created and tested
- [ ] useGameLoop hook created and tested
- [ ] drawing utilities created and tested
- [ ] pinchDetection utility created and tested
- [ ] AlphabetGame refactored and working
- [ ] LetterHunt refactored and working
- [ ] FingerNumberShow refactored and working
- [ ] All tests pass (npm test)
- [ ] Build passes (npm run build)
- [ ] No console errors
- [ ] Performance acceptable (no lag)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing games | MED | HIGH | Incremental refactoring, tests after each phase |
| Performance regression | LOW | MED | Frame skipping, profiling before/after |
| Browser compatibility | LOW | MED | Test on multiple browsers, graceful degradation |
| Bundle size increase | LOW | LOW | Tree shaking, code splitting if needed |

---

## Rollback Plan

If critical issues are found:

1. Restore original game files from git:

   ```bash
   git checkout HEAD -- src/frontend/src/pages/AlphabetGame.tsx
   git checkout HEAD -- src/frontend/src/pages/LetterHunt.tsx
   git checkout HEAD -- src/frontend/src/games/FingerNumberShow.tsx
   ```

2. Remove new files:

   ```bash
   git rm src/frontend/src/hooks/useHandTracking.ts
   git rm src/frontend/src/hooks/useGameLoop.ts
   git rm src/frontend/src/utils/drawing.ts
   git rm src/frontend/src/utils/pinchDetection.ts
   git rm src/frontend/src/components/TrackingCanvas.tsx
   ```

3. Revert worklog status to BLOCKED

---

## Files to Create/Modify

### New Files (5)

```
src/frontend/src/
├── hooks/
│   ├── useHandTracking.ts
│   ├── useGameLoop.ts
│   └── __tests__/
│       ├── useHandTracking.test.ts
│       └── useGameLoop.test.ts
├── utils/
│   ├── drawing.ts
│   ├── pinchDetection.ts
│   └── __tests__/
│       ├── drawing.test.ts
│       └── pinchDetection.test.ts
├── components/
│   └── TrackingCanvas.tsx
└── types/
    └── tracking.ts
```

### Modified Files (3)

```
src/frontend/src/
├── pages/
│   ├── AlphabetGame.tsx
│   └── LetterHunt.tsx
└── games/
    └── FingerNumberShow.tsx
```

---

## Dependencies

No new external dependencies required. All utilities use:

- React built-in hooks
- MediaPipe tasks-vision (already installed)
- Canvas API (browser native)

---

## Estimates

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 1: Core Hooks | 2-3 hours | Low |
| Phase 2: Drawing Utilities | 2-3 hours | Low |
| Phase 3: Pinch Detection | 1-2 hours | Low |
| Phase 4: AlphabetGame | 3-4 hours | Medium |
| Phase 5: Other Games | 2-3 hours | Medium |
| **Total** | **10-15 hours** | **Medium** |
