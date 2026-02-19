# Hand Tracking Centralization Research

**Date:** 2026-01-31  
**Ticket:** TCK-20260131-117  
**Status:** Research Complete  

---

## Executive Summary

Analysis of camera-based games reveals significant code duplication and inconsistent implementations across the codebase. Centralizing core hand tracking mechanics will improve maintainability, ensure consistent UX, and make improvements propagate to all games automatically.

---

## Current State Analysis

### Games Using Hand Tracking

| Game | File | Status | Hand Tracking | Drawing | Pinch Detection |
|------|------|--------|---------------|---------|-----------------|
| AlphabetGame | `pages/AlphabetGame.tsx` | ✅ Active | Yes | Yes (tracing) | Yes |
| FingerNumberShow | `games/FingerNumberShow.tsx` | ✅ Active | Yes | No | No (finger counting) |
| LetterHunt | `pages/LetterHunt.tsx` | ✅ Active | Yes | No (cursor) | Yes |
| ConnectTheDots | `pages/ConnectTheDots.tsx` | ⚠️ Mouse Only | No | No | No |

### Identified Duplication

#### 1. HandLandmarker Initialization (Duplicated 4+ times)

**Pattern found in:**

- `AlphabetGame.tsx` - lines 91-147
- `FingerNumberShow.tsx` - lines 323-351
- `LetterHunt.tsx` - lines 52-79

**Inconsistencies:**

```typescript
// AlphabetGame - tries GPU then CPU fallback
const delegatesToTry = preferredDelegate === 'GPU' ? ['GPU', 'CPU'] : ['CPU', 'GPU'];

// FingerNumberShow - GPU only, no fallback
delegate: 'GPU'

// LetterHunt - GPU only, no fallback
delegate: 'GPU'
```

#### 2. Pinch Detection (Duplicated 3+ times)

**Threshold inconsistencies:**

| Game | Start Threshold | Release Threshold | Hysteresis |
|------|-----------------|-------------------|------------|
| AlphabetGame | 0.08 | Same (0.08) | ❌ No |
| LetterHunt | 0.05 | Same (0.05) | ❌ No |
| Old Game.tsx | 0.05 | 0.07 | ✅ Yes |

#### 3. Frame Loop Boilerplate (Duplicated 4+ times)

Every game repeats:

```typescript
const loop = () => {
  if (!canvas || !video || !ctx) { rafIdRef.current = requestAnimationFrame(loop); return; }
  if (video.readyState < 2) { rafIdRef.current = requestAnimationFrame(loop); return; }
  // ... detection logic
  rafIdRef.current = requestAnimationFrame(loop);
};
```

#### 4. Canvas Setup (Duplicated)

```typescript
if (canvas.width !== video.videoWidth) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
}
```

#### 5. Video Time Deduplication

Some games check `video.currentTime !== lastVideoTimeRef.current`, others don't.

---

## Critical Issues Found

### Issue 1: ConnectTheDots Has NO Hand Tracking

**Status:** Mouse/touch only  
**Impact:** Game is not "camera-first" as designed  
**Ticket:** TCK-20260131-118 exists for this

### Issue 2: Inconsistent Confidence Thresholds

| Game | minHandDetectionConfidence | minHandPresenceConfidence | minTrackingConfidence |
|------|---------------------------|--------------------------|----------------------|
| AlphabetGame | ❌ Not set (uses default 0.5) | ❌ Not set | ❌ Not set |
| FingerNumberShow | 0.3 | 0.3 | 0.3 |
| LetterHunt | 0.3 | 0.3 | 0.3 |

### Issue 3: Missing Frame Skipping in Some Games

- ✅ FingerNumberShow: Skips every other frame
- ❌ AlphabetGame: No frame skipping
- ❌ LetterHunt: No frame skipping

### Issue 4: No Shared Drawing Utilities

Each game that draws implements its own:

- Point smoothing
- Line rendering
- Glow effects
- Canvas clearing/redraw

---

## Recommendations

### P0: Create Core Hand Tracking Hook

**New File:** `src/frontend/src/hooks/useHandTracking.ts`

```typescript
interface UseHandTrackingOptions {
  numHands?: number;
  minDetectionConfidence?: number;
  delegate?: 'GPU' | 'CPU';
  enableFallback?: boolean;
  frameSkip?: number;
}

interface UseHandTrackingReturn {
  landmarker: HandLandmarker | null;
  isLoading: boolean;
  error: Error | null;
  results: HandLandmarkerResult | null;
  initialize: () => Promise<void>;
}
```

**Benefits:**

- Single source of truth for initialization
- Automatic GPU→CPU fallback
- Consistent confidence thresholds
- Centralized error handling

### P0: Create Drawing Utilities

**New File:** `src/frontend/src/utils/drawing.ts`

```typescript
// Point smoothing with configurable window
export function smoothPoints(points: Point[], windowSize?: number): Point[];

// Draw segments with glow effects
export function drawSegments(
  ctx: CanvasRenderingContext2D,
  segments: Point[][],
  options: DrawOptions
): void;

// Canvas setup helper
export function setupCanvas(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
): void;

// Point compression for storage
export function compressPoints(points: Point[]): CompressedPoint[];
```

### P1: Create Pinch Detection Utility

**New File:** `src/frontend/src/utils/pinchDetection.ts`

```typescript
interface PinchState {
  isPinching: boolean;
  distance: number;
  startThreshold: number;
  releaseThreshold: number;
}

export function detectPinch(
  landmarks: Landmark[],
  previousState: PinchState,
  options?: PinchOptions
): PinchState;

// Hysteresis-enabled pinch detection
// Returns: 'start' | 'continue' | 'release' | 'none'
```

### P1: Create Game Loop Hook

**New File:** `src/frontend/src/hooks/useGameLoop.ts`

```typescript
interface UseGameLoopOptions {
  onFrame: (deltaTime: number) => void;
  isRunning: boolean;
  targetFps?: number;
}

// Centralized RAF loop with:
// - FPS limiting
// - Delta time calculation
// - Automatic cleanup
```

### P1: Standardize Canvas Components

**New File:** `src/frontend/src/components/TrackingCanvas.tsx`

```typescript
interface TrackingCanvasProps {
  webcamRef: RefObject<Webcam>;
  onFrame: (results: HandLandmarkerResult, canvas: HTMLCanvasElement) => void;
  showDrawing?: boolean;
  drawingOptions?: DrawingOptions;
}

// Unified canvas component that handles:
// - Video mirroring
// - Canvas sizing
// - Frame synchronization
// - Drawing overlay
```

### P2: Add Hand Tracking to ConnectTheDots

**Scope:** Add pinch-to-select dots functionality  
**Depends on:** Core hooks above

### P2: Performance Monitoring

**New File:** `src/frontend/src/utils/performance.ts`

```typescript
// FPS counter
// Detection latency tracking
// Memory usage monitoring
```

---

## Implementation Plan

### Phase 1: Foundation (1-2 days)

1. Create `useHandTracking` hook
2. Create drawing utilities
3. Refactor ONE game (AlphabetGame) to use new hooks
4. Verify all tests pass

### Phase 2: Migration (2-3 days)

1. Migrate FingerNumberShow
2. Migrate LetterHunt
3. Add hand tracking to ConnectTheDots
4. Update all tests

### Phase 3: Enhancements (1-2 days)

1. Add performance monitoring
2. Add pinch detection utility with hysteresis
3. Create reusable TrackingCanvas component
4. Document all APIs

---

## Code Quality Issues

### Anti-Patterns Found

1. **Type assertions everywhere:** `as any` used to bypass TypeScript
2. **Magic numbers:** Thresholds hardcoded without explanation
3. **Ref mutation:** Direct ref mutation in render loop
4. **Missing cleanup:** Some RAF loops don't clean up properly
5. **Duplicate types:** `Point`, `Landmark` interfaces defined multiple times

### Refactoring Priorities

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P0 | Centralize HandLandmarker init | Medium | High |
| P0 | Create drawing utilities | Medium | High |
| P1 | Add pinch hysteresis | Low | Medium |
| P1 | Standardize frame skipping | Low | Medium |
| P2 | Type consolidation | Medium | Low |

---

## Best Practices from MediaPipe

1. **Web Workers:** Run detection on separate thread to avoid blocking UI
2. **Video Time Check:** Always check `video.currentTime` to avoid redundant processing
3. **Confidence Tuning:** Lower confidence (0.3) for kid-friendly detection
4. **Multi-hand Support:** Always set `numHands` explicitly
5. **Delegate Fallback:** Always try GPU first, then CPU

---

## Files to Create

```
src/frontend/src/
├── hooks/
│   ├── useHandTracking.ts      # NEW: Core hand tracking
│   └── useGameLoop.ts          # NEW: RAF game loop
├── utils/
│   ├── drawing.ts              # NEW: Drawing utilities
│   ├── pinchDetection.ts       # NEW: Pinch detection
│   └── performance.ts          # NEW: Performance monitoring
├── components/
│   └── TrackingCanvas.tsx      # NEW: Unified canvas component
└── types/
    └── tracking.ts             # NEW: Shared types
```

---

## Conclusion

Centralizing hand tracking mechanics will:

- Reduce code duplication by ~60%
- Ensure consistent UX across games
- Make improvements propagate automatically
- Simplify testing and maintenance
- Enable faster feature development

**Estimated Effort:** 4-6 days  
**Recommended Priority:** P0  
**Dependencies:** None (can start immediately)
