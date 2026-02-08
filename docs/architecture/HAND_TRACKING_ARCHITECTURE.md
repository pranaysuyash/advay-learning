# Hand Tracking Architecture

**Document ID:** ARCH-HAND-001  
**Status:** In Progress (Migration Active)  
**Last Updated:** 2026-02-05

---

## Problem Statement

**Current State (Problem):**
Each game implements hand tracking independently:
- `LetterHunt.tsx` - inline `results?.landmarks?.[0]` pattern
- `ConnectTheDots.tsx` - inline normalization
- `AlphabetGamePage.tsx` - direct MediaPipe access
- `MediaPipeTest.tsx` - test-specific implementation

**Issues:**
1. Inconsistent hand data handling
2. Duplicate code across games
3. Different coordinate systems
4. Varying fallback behavior
5. Hard to update/fix bugs (change in 4+ places)

---

## Solution: Centralized Hand Tracking

### Decision: Unified Hand Tracking Service

**Central Utility:** `src/frontend/src/utils/landmarkUtils.ts`

**Function:**
```typescript
export function getHandLandmarkLists(results: HandLandmarkerResult): {
  landmarks: NormalizedLandmark[][];
  worldLandmarks: Landmark[][];
} {
  // Handles both API versions (landmarks vs normalizedLandmarks)
  // Returns consistent structure regardless of MediaPipe version
}
```

**Benefits:**
- ✅ Single source of truth for hand data normalization
- ✅ Handles API version drift automatically
- ✅ Consistent coordinate system across games
- ✅ Easier testing (one function to test)
- ✅ Simpler updates (change in one place)

---

## Migration Plan

### Ticket: TCK-20260203-050

**Scope:** Update all game files to use centralized utility

**Files to Update:**
1. `LetterHunt.tsx`
2. `ConnectTheDots.tsx`
3. `AlphabetGamePage.tsx`
4. `MediaPipeTest.tsx`

**Pattern Change:**

```typescript
// BEFORE (in each game file):
const landmarks = results?.landmarks?.[0];
// or
const landmarks = results?.normalizedLandmarks?.[0];
// inconsistent, fragile

// AFTER (all games use):
import { getHandLandmarkLists } from '../utils/landmarkUtils';

const { landmarks } = getHandLandmarkLists(results);
const hand = landmarks[0]; // Always consistent
```

**Status:** OPEN (awaiting implementation)

---

## Future: Hand Tracking Hook (Post-Migration)

### Proposed: `useHandTracking` Hook

After utility migration, next step is a React hook:

```typescript
// src/frontend/src/hooks/useHandTracking.ts

interface UseHandTrackingOptions {
  onHandMove?: (hand: HandData) => void;
  onPinch?: (pinch: PinchData) => void;
  onHandEnter?: () => void;
  onHandExit?: () => void;
}

interface UseHandTrackingReturn {
  // State
  isInitialized: boolean;
  isTracking: boolean;
  hasPermission: boolean;
  error: Error | null;
  
  // Data
  hand: HandData | null;
  
  // Actions
  start: () => void;
  stop: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useHandTracking(options?: UseHandTrackingOptions): UseHandTrackingReturn;
```

**Usage in Games:**
```typescript
function LetterHunt() {
  const { hand, isTracking, error } = useHandTracking({
    onHandMove: (hand) => {
      // Handle hand movement
    },
    onPinch: (pinch) => {
      // Handle pinch gesture
    }
  });

  if (error) return <CameraError />;
  if (!isTracking) return <Loading />;
  
  return <GameCanvas hand={hand} />;
}
```

**Benefits:**
- Games don't touch MediaPipe directly
- Declarative API (react to events)
- Automatic lifecycle management
- Built-in error handling

---

## Hand Data Standard

### Normalized Hand Data Structure

All games receive hand data in this format:

```typescript
interface HandData {
  // 21 landmarks, each with x, y, z (normalized 0-1)
  landmarks: {
    // Fingertips
    thumbTip: Landmark;      // index 4
    indexTip: Landmark;      // index 8
    middleTip: Landmark;     // index 12
    ringTip: Landmark;       // index 16
    pinkyTip: Landmark;      // index 20
    
    // Finger bases
    thumbBase: Landmark;     // index 2
    indexBase: Landmark;     // index 5
    // ... etc
    
    // All 21 landmarks as array
    all: Landmark[];
  };
  
  // Derived data (calculated by service)
  pinch: {
    isPinching: boolean;
    strength: number; // 0-1
    location: Landmark;
  };
  
  // Bounding box
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Timestamp for sync
  timestamp: number;
}

interface Landmark {
  x: number; // 0-1 (normalized)
  y: number; // 0-1 (normalized)
  z: number; // relative depth
}
```

---

## Coordinate System

### Screen Coordinates

Games receive coordinates normalized to screen:

```
(0,0) ---------> (1,0)     x increases left to right
  |                |
  |    SCREEN      |
  |                |
(0,1) ---------> (1,1)     y increases top to bottom
```

**Conversion to pixels:**
```typescript
const pixelX = hand.landmarks.indexTip.x * canvas.width;
const pixelY = hand.landmarks.indexTip.y * canvas.height;
```

**Mirroring:**
- Camera feed is mirrored for natural feel
- Hand coordinates are adjusted accordingly
- Games receive "corrected" coordinates

---

## Gesture Detection

### Built-in Gestures (Future)

Central service will detect common gestures:

```typescript
interface GestureDetection {
  // Current gesture
  gesture: 'point' | 'pinch' | 'grab' | 'open_palm' | 'closed_fist' | 'none';
  
  // Gesture confidence
  confidence: number;
  
  // Gesture-specific data
  data: {
    point?: { x: number; y: number }; // For 'point'
    pinch?: { strength: number; location: Landmark }; // For 'pinch'
    grab?: { items: string[] }; // For 'grab' (if collision detection)
  };
}
```

**Games subscribe to gestures, not raw data:**
```typescript
const { gesture } = useHandTracking({
  onGesture: (g) => {
    if (g.gesture === 'pinch') {
      // Handle pinch
    }
  }
});
```

---

## Fallback Strategy

### Touch/Mouse Fallback

When camera is unavailable:

```typescript
interface HandTrackingFallback {
  mode: 'camera' | 'touch' | 'mouse';
  
  // In fallback modes, hand is simulated
  hand: HandData | null;
  
  // True input source
  inputSource: 'camera' | 'touch' | 'mouse';
}
```

**Automatic Fallback:**
1. Try camera
2. If denied/fails → switch to touch/mouse
3. Game receives same `HandData` interface
4. No game code changes needed

---

## Performance Considerations

### Optimization Strategies

1. **Throttling:** Hand tracking at 30fps (not 60fps)
2. **Region of Interest:** Track only visible area
3. **Worker Thread:** MediaPipe runs in web worker
4. **Lazy Initialization:** Start tracking only when game active
5. **Pause on Hide:** Stop tracking when tab hidden

**Target Performance:**
- < 5ms processing time per frame
- < 10% CPU usage on mid-range devices
- Smooth 30fps even on tablets

---

## Error Handling

### Error Types

```typescript
type HandTrackingError =
  | { type: 'PERMISSION_DENIED'; message: string }
  | { type: 'CAMERA_NOT_FOUND'; message: string }
  | { type: 'INITIALIZATION_FAILED'; message: string }
  | { type: 'TRACKING_LOST'; message: string; recoverable: boolean }
  | { type: 'PERFORMANCE_DEGRADED'; message: string };
```

**Recovery Strategies:**
- `PERMISSION_DENIED` → Show touch fallback option
- `CAMERA_NOT_FOUND` → Auto-switch to touch mode
- `TRACKING_LOST` → Retry for 3s, then pause game
- `PERFORMANCE_DEGRADED` → Reduce tracking rate

---

## Testing Strategy

### Unit Testing

```typescript
// Mock hand data for testing
test('detects pinch correctly', () => {
  const mockHand = createMockHand({
    thumbTip: { x: 0.5, y: 0.5 },
    indexTip: { x: 0.51, y: 0.51 }, // Close to thumb
  });
  
  expect(detectPinch(mockHand)).toBe(true);
});
```

### Integration Testing

```typescript
test('game receives hand data', async () => {
  render(<LetterHunt />);
  
  // Simulate hand tracking
  simulateHandMove({ x: 0.5, y: 0.5 });
  
  // Verify game responds
  expect(screen.getByTestId('cursor')).toBeAtPosition(0.5, 0.5);
});
```

---

## Related Documents

- `docs/architecture/GAME_ARCHITECTURE_PRINCIPLES.md` - Overall game architecture
- `docs/architecture/CAMERA_INTEGRATION_GUIDE.md` - Camera specifics
- `docs/INPUT_METHODS_SPECIFICATION.md` - All input methods

---

## Tickets

- `TCK-20260203-050` - **ACTIVE** - Adopt centralized `getHandLandmarkLists()` utility
- Future: Create `useHandTracking` hook (post-migration)
- Future: Add gesture detection layer
- Future: Implement touch/mouse fallback simulation
