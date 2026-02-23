# Audit: useGameHandTracking.ts
**Ticket:** TCK-20260223-018

**Target**: `src/frontend/src/hooks/useGameHandTracking.ts`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 4, Complexity 5, Changeability 3, Learning 5 = **22/25**

---

## Why This File?

The hook is the **central orchestration layer** for hand tracking across ALL camera-based games in the application. It's the recommended entry point per `docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md` and directly impacts every game using hand input (Alphabet Tracing, Emoji Match, Bubble Pop Symphony, etc.).

---

## Scoring Rationale

| Criterion     | Score | Justification                                                        |
| ------------- | ----- | -------------------------------------------------------------------- |
| Impact        | 5     | All camera-based games depend on this hook                           |
| Risk          | 4     | Bugs affect all games; coordinate issues documented in emoji audit   |
| Complexity    | 5     | Manages worker/main-thread, 5 internal hooks, complex fallback logic |
| Changeability | 3     | Well-structured but tight coupling to internal hooks                 |
| Learning      | 5     | Excellent example of React hooks composition, Web Worker integration |

---

## Finding: GT-01 — Race Condition in Pinch State (P0)

**Evidence** (lines 210-285):

```typescript
// Worker callback - updates refs
onFrame: useCallback((frame: TrackedHandFrame, meta: HandTrackingRuntimeMeta) => {
  // ... sets cursor, pinch state
  previousPinchRef.current = currentPinch;
  pinchStateRef.current = currentPinch;
  onFrame?.(frame, meta);
}, [onFrame]),

// Main-thread callback - also updates refs
onFrame: useCallback((frame: TrackedHandFrame, meta: HandTrackingRuntimeMeta) => {
  // ... sets cursor, pinch state
  previousPinchRef.current = currentPinch;
  pinchStateRef.current = currentPinch;
  onFrame?.(frame, meta);
}, [activeRuntimeMode, onFrame, pinch, resetPinchOnNoHand, smoothing]),
```

**Root Cause**: Both worker and main-thread runtime paths independently update `previousPinchRef` and `pinchStateRef`. When runtime mode switches (line 230-237), both paths could briefly execute, corrupting state.

**Fix Idea**: Add mutex-style guard or consolidate to single callback path with explicit runtime mode in state.

---

## Finding: GT-02 — No Initialization Timeout (P1)

**Evidence** (lines 180-196):

```typescript
const {
  landmarker,
  isLoading: isModelLoading,
  error: handTrackingError,
  isReady: isHandTrackingReady,
  initialize: initializeHandTracking,
  reset: resetHandTracking,
} = useHandTracking({
  numHands: 1,
  minDetectionConfidence: 0.3,
  // ...
});
```

**Root Cause**: If MediaPipe model fails to load (network, CDN), `isLoading` remains true indefinitely.

**Fix Idea**: Add 10-second timeout in `startTracking()` with fallback to mouse/touch-only mode.

---

## Finding: GT-03 — Missing Test Coverage (P0)

**Evidence**: No test file exists at `src/frontend/src/hooks/__tests__/useGameHandTracking.test.ts`

**Root Cause**: New hook, prioritized for functionality over testing.

**Fix Idea**: Create test file with mocked MediaPipe. Critical paths: runtime mode resolution, pinch transitions, fallback behavior.

---

## Finding: GT-04 — Underdocumented Runtime Fallback Logic (P2)

**Evidence** (lines 116-127):

```typescript
export function resolveHandTrackingRuntimeMode(params: {
  requestedMode?: GameHandTrackingRuntimeMode;
  workerConfig?: WorkerRuntimeConfig;
  workerSupported: boolean;
}): GameHandTrackingRuntimeMode {
  if (VISION_WORKER_FORCE_MAIN_THREAD) return 'main-thread';
  if (params.requestedMode === 'main-thread') return 'main-thread';
  if (!VISION_WORKER_ENABLED_BY_ENV) return 'main-thread';
  if (params.workerConfig && !params.workerConfig.enabled) return 'main-thread';
  if (!params.workerSupported) return 'main-thread';
  return params.requestedMode ?? 'worker';
}
```

**Root Cause**: Complex fallback chain not visualized in JSDoc.

**Fix Idea**: Add decision tree diagram to hook's JSDoc header.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                                     |
| ----- | ----------- | -------- | ------ | --------------------------------------- |
| GT-01 | Correctness | P0       | 2h     | Add mutex guard for pinch refs          |
| GT-02 | Reliability | P1       | 1h     | Add 10s initialization timeout          |
| GT-03 | Test        | P0       | 4h     | Create test file with mocked MediaPipe  |
| GT-04 | DX          | P2       | 1h     | Add runtime mode decision tree to JSDoc |

---

## Suggested Experiments

### Exp 1: Auto-Device-Tier Detection

- **Hypothesis**: Can automatically detect device capability and set optimal `targetFps` and `delegate`
- **Method**: Measure baseline FPS with 30fps target on startup, auto-adjust
- **Success**: > 20fps maintained on mid-range devices

### Exp 2: Pinch Prediction

- **Hypothesis**: Can predict pinch start 100ms before it happens using velocity
- **Method**: Train simple classifier on landmark trajectory
- **Success**: < 50ms false positive rate

### Exp 3: Multi-Hand Latency Budget

- **Hypothesis**: Can quantify latency budget per additional hand
- **Method**: Measure frame delta with 1 vs 2 hands
- **Success**: < 5ms additional latency per hand

---

## Local PR Plan (GT-01 Fix)

**Scope**: Fix race condition in pinch state management

**Invariants**:

- Public API unchanged
- Runtime mode switching behavior identical
- Pinch detection thresholds unchanged

**Steps**:

1. Add test for rapid runtime mode switch
2. Consolidate pinch ref updates to single function
3. Verify: `npm run type-check && npm run test -- useGameHandTracking`
4. Benchmark frame callback overhead
5. Document decision tree in JSDoc

---

## Related Artifacts

- `docs/HAND_TRACKING_REFACTORING_GUIDE.md`
- `docs/HAND_TRACKING_REFACTORING_SUMMARY.md`
- `EMOJI_MATCH_COMPREHENSIVE_VIDEO_AUDIT_COLLATION_2026-02-20.md` (coordinate bug)
