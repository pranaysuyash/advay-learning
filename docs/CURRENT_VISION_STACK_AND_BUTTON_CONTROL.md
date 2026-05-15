# Current Vision Stack & Button Control via CV/MediaPipe

**Date:** March 18, 2026  
**Project:** Learning for Kids (Advay)  
**Purpose:** Document current models in use + how buttons are controllable via hand tracking

---

## Part 1: Current Models in Use

### Primary Models (Already Integrated)

| Model | Source | Purpose | License | Status |
|-------|--------|---------|---------|--------|
| **HandLandmarker** | @mediapipe/tasks-vision | 21-point hand tracking | Apache-2.0 | ✓ Active |
| **FaceLandmarker** | @mediapipe/tasks-vision | Face mesh + expressions | Apache-2.0 | ✓ Active |
| **PoseLandmarker** | @mediapipe/tasks-vision | 33-point body pose | Apache-2.0 | ✓ Active |

**Version:** 0.10.8 (loaded from CDN)  
**Package:** `@mediapipe/tasks-vision`  
**Runtime:** Browser (WebAssembly + WebGL)  
**License:** Apache-2.0 ✓ (Commercial-safe)

---

### Model Capabilities

#### 1. HandLandmarker (Primary Interaction Model)

**What it provides:**
- 21 hand landmarks (wrist + 4 fingers × 4 joints + thumb)
- Normalized coordinates (0-1)
- Handedness (left/right)
- Detection confidence

**Key landmarks for UI control:**
```
Landmark 8: INDEX_FINGER_TIP   ← Primary cursor position
Landmark 4: THUMB_TIP          ← Pinch detection (with index)
Landmark 12: MIDDLE_FINGER_TIP ← Secondary interaction
```

**Confidence thresholds:**
- Detection: 0.3 (default)
- Presence: 0.3
- Tracking: 0.3

---

#### 2. FaceLandmarker (Expression & Attention)

**What it provides:**
- 468 face landmarks (dense mesh)
- 52 blendshape scores (expressions)
- Head rotation angles
- Face presence detection

**Use cases:**
- Smile detection (blendshape: `jawOpen`, `mouthSmile`)
- Attention check (face presence + eye openness)
- Head direction (yaw, pitch, roll)

---

#### 3. PoseLandmarker (Body Movement)

**What it provides:**
- 33 body landmarks
- Full skeleton tracking
- Multi-person support (BlazePose)

**Use cases:**
- Dance games
- Pose mimicry
- Full-body actions

---

## Part 2: Architecture Flow - Hand to Button Control

### System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         BROWSER / REACT APP                             │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Webcam → MediaPipe HandLandmarker                                        │
│              │                                                             │
│              └──────── Landmark Results (normalized 0-1)                 │
│                        │                                                   │
│                        ▼                                                   │
│              ┌─────────────────────────────────────────┐             │
│              │  useGameHandTracking Hook                       │             │
│              │  (or useHandTrackingRuntime)                   │             │
│              ├─────────────────────────────────────────┤             │
│              │  - Extract index finger tip (landmark 8)       │             │
│              │  - Apply smoothing (One-Euro filter)            │             │
│              │  - Detect pinch (thumb + index distance)        │             │
│              │  - Convert to screen coordinates                │             │
│              └─────────────────────────────────────────┘             │
│                        │                                                   │
│                        ▼                                                   │
│              ┌─────────────────────────────────────────┐             │
│              │  SpatialInputContext                            │             │
│              │  (Global cursor state)                          │             │
│              ├─────────────────────────────────────────┤             │
│              │  cursor: {                                      │             │
│              │    position: { x, y },    // Screen pixels      │             │
│              │    isActive: boolean,     // Hand detected?     │             │
│              │    isPinching: boolean    // Pinch gesture?     │             │
│              │  }                                               │             │
│              └─────────────────────────────────────────┘             │
│                        │                                                   │
│           ┌────────────┼────────────┐                                 │
│           │         │                   │                                 │
│           ▼         ▼                   ▼                                 │
│  ┌────────────────┐   ┌────────────────┐   ┌─────────────────────┐             │
│  │ KenneyHandCursor │   │ VisionButton     │   │ Game Components   │             │
│  │ (Visual cursor)  │   │ (CV-clickable)   │   │ (Hit testing)     │             │
│  ├────────────────┤   ├────────────────┤   ├─────────────────────┤             │
│  │ Shows hand pos   │   │ Detects hover    │   │ Custom hit test   │             │
│  │ on screen        │   │ Detects pinch    │   │ Drag/drop         │             │
│  │ States: point,   │   │ Triggers click   │   │ Drawing, etc.     │             │
│  │   pinch, grab    │   │                  │   │                   │             │
│  └────────────────┘   └────────────────┘   └─────────────────────┘             │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 3: How Button Control Works

### The VisionButton Component

**Location:** `src/components/ui/VisionButton.tsx`

**What it does:**
1. Wraps a regular `KenneyButton`
2. Subscribes to `SpatialInputContext` (global cursor state)
3. Performs hit-testing between cursor and button
4. Detects pinch gesture as "click"
5. Provides visual feedback (hover state)

**Code flow:**

```tsx
// 1. Get cursor from global context
const { cursor } = useSpatialInput();

// 2. Check if cursor is over button (hit testing)
useEffect(() => {
  const rect = buttonRef.current.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const radius = (Math.max(rect.width, rect.height) / 2) * 1.5; // Hitbox multiplier
  
  const hit = isWithinTarget(cursor.position, { x: centerX, y: centerY }, radius);
  setIsSpatialHovered(hit);
}, [cursor.position]);

// 3. Detect pinch = click
useEffect(() => {
  if (isSpatialHovered && cursor.isPinching && !wasPinching) {
    onClick(); // Trigger button click
  }
  setWasPinching(cursor.isPinching);
}, [cursor.isPinching, isSpatialHovered]);
```

---

### Visual Feedback

When hand hovers over button:
- Button scales up (110%)
- Brightness increases (125%)
- Yellow pulse border appears
- Smooth 200ms transition

```tsx
<KenneyButton
  className={`
    ${isSpatialHovered ? 'scale-110 !brightness-125' : ''}
    transition-all duration-200
  `}
>
  {isSpatialHovered && (
    <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg animate-pulse" />
  )}
  {children}
</KenneyButton>
```

---

## Part 4: Using VisionButton in Your Games

### Basic Usage

```tsx
import { VisionButton } from '../components/ui/VisionButton';

function MyGame() {
  const handleStart = () => {
    console.log('Game started!');
  };

  return (
    <div>
      <h1>Ready to play?</h1>
      
      {/* This button is now controllable via hand tracking */}
      <VisionButton 
        onClick={handleStart}
        color="green"
        size="large"
        hitboxMultiplier={1.5}  // Larger hit area (easier for kids)
      >
        Start Game
      </VisionButton>
    </div>
  );
}
```

---

### With Hand Cursor Visible

```tsx
import { VisionButton } from '../components/ui/VisionButton';
import { KenneyHandCursor } from '../components/game/KenneyHandCursor';
import { useSpatialInput } from '../context/SpatialInputContext';

function MyGame() {
  const { cursor } = useSpatialInput();
  
  return (
    <div>
      {/* Show hand cursor on screen */}
      <KenneyHandCursor
        position={cursor.position}
        state={cursor.isPinching ? 'pinch' : 'point'}
        isHandDetected={cursor.isActive}
        color="yellow"
        size={64}
      />
      
      {/* Buttons kids can "touch" with their hand */}
      <VisionButton onClick={() => console.log('Option 1')} color="blue">
        Option 1
      </VisionButton>
      
      <VisionButton onClick={() => console.log('Option 2')} color="green">
        Option 2
      </VisionButton>
    </div>
  );
}
```

---

## Part 5: Coordinate Transformation

### Landmark → Screen Coordinates

MediaPipe returns **normalized coordinates** (0-1). You need to convert to screen pixels.

```typescript
// From: src/utils/coordinateTransform.ts

export function getCanvasCoordinates(
  canvas: HTMLCanvasElement,
  normalizedPoint: { x: number; y: number }
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  return {
    x: normalizedPoint.x * rect.width * dpr,
    y: normalizedPoint.y * rect.height * dpr,
  };
}
```

**Important notes:**
- MediaPipe x=0 is LEFT, x=1 is RIGHT
- MediaPipe y=0 is TOP, y=1 is BOTTOM
- Mirror horizontally if using front-facing camera ( selfie mode)

---

### Mirroring (Selfie Mode)

For front-facing camera, mirror the x-coordinate:

```typescript
const mirroredX = 1 - landmark.x;  // Flip horizontally
```

**Why:** When you move your hand right, it should move right on screen (like a mirror).

---

## Part 6: Pinch Detection

### How Pinch Works

Pinch = Thumb tip (landmark 4) close to Index tip (landmark 8)

```typescript
function detectPinch(landmarks: NormalizedLandmark[]): boolean {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  
  // Euclidean distance in normalized space
  const distance = Math.sqrt(
    Math.pow(thumbTip.x - indexTip.x, 2) +
    Math.pow(thumbTip.y - indexTip.y, 2)
  );
  
  // Threshold: < 0.05 is a pinch (tune as needed)
  return distance < 0.05;
}
```

**Visual feedback:**
- Cursor changes from "point" to "pinch" state
- Kids see their hand closing = about to click

---

### Pinch-to-Click Timing

In `VisionButton`:
- Detects transition: **not pinching → pinching**
- Triggers `onClick()` on that transition
- Prevents multiple clicks (uses `wasPinching` state)

---

## Part 7: Complete Example - Game with CV Buttons

```tsx
// src/games/HandControlledGame.tsx

import { useEffect } from 'react';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useSpatialInput } from '../context/SpatialInputContext';
import { VisionButton } from '../components/ui/VisionButton';
import { KenneyHandCursor } from '../components/game/KenneyHandCursor';

export function HandControlledGame() {
  // 1. Initialize hand tracking
  const { isReady, startTracking, stopTracking } = useGameHandTracking({
    gameName: 'HandControlledGame',
    targetFps: 30,
  });
  
  // 2. Get cursor position from global context
  const { cursor } = useSpatialInput();
  
  // 3. Start/stop tracking with game lifecycle
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);
  
  // 4. Game logic
  const handleOptionA = () => console.log('Selected A');
  const handleOptionB = () => console.log('Selected B');
  const handleBack = () => console.log('Go back');
  
  if (!isReady) return <div>Loading hand tracking...</div>;
  
  return (
    <div className="game-container">
      {/* Visual hand cursor */}
      <KenneyHandCursor
        position={cursor.position}
        state={cursor.isPinching ? 'pinch' : 'point'}
        isHandDetected={cursor.isActive}
        color="yellow"
        size={64}
        showTrail={true}
      />
      
      <h1>Choose an option:</h1>
      
      {/* CV-controllable buttons */}
      <div className="button-grid">
        <VisionButton 
          onClick={handleOptionA}
          color="blue"
          size="large"
          hitboxMultiplier={2.0}  // Extra large for kids
        >
          Option A
        </VisionButton>
        
        <VisionButton 
          onClick={handleOptionB}
          color="green"
          size="large"
          hitboxMultiplier={2.0}
        >
          Option B
        </VisionButton>
      </div>
      
      <VisionButton 
        onClick={handleBack}
        color="gray"
        size="small"
        hitboxMultiplier={1.5}
      >
        ← Back
      </VisionButton>
      
      {/* Instructions */}
      <div className="instructions">
        <p>Point at a button and pinch your fingers to click!</p>
        {!cursor.isActive && (
          <p className="warning">⚠️ Show your hand to the camera</p>
        )}
      </div>
    </div>
  );
}
```

---

## Part 8: Configuration & Customization

### VisionButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | - | Click handler |
| `color` | `KenneyButtonColor` | `'blue'` | Button color theme |
| `size` | `KenneyButtonSize` | `'default'` | Button size |
| `hitboxMultiplier` | `number` | `1.5` | Multiplier for hit area (larger = easier) |
| `disabled` | `boolean` | `false` | Disable interaction |

**Recommended for kids:**
- `hitboxMultiplier={2.0}` - Extra forgiving
- `size="large"` - Easy to see and hit
- Bright colors (`green`, `blue`, `yellow`)

---

### KenneyHandCursor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `{x, y}` | - | Cursor position (screen pixels) |
| `state` | `HandCursorState` | `'idle'` | Visual state: idle, point, pinch, grab, open |
| `isHandDetected` | `boolean` | `false` | Show/hide cursor |
| `color` | `ThemeColor` | `'yellow'` | Cursor color |
| `size` | `number` | `48` | Cursor size in pixels |
| `showTrail` | `boolean` | `false` | Show motion trail |

---

## Part 9: Best Practices

### 1. Always Show the Cursor

Kids need to see where their hand is mapped:

```tsx
// ✓ Good: Always show cursor
<KenneyHandCursor position={cursor.position} ... />

// ✗ Bad: Invisible hand position
// Kids get frustrated not knowing where their hand is
```

---

### 2. Large Hit Areas

```tsx
// ✓ Good: Large hitbox for kids
<VisionButton hitboxMultiplier={2.0} ... />

// ✗ Bad: Small hitbox
<VisionButton hitboxMultiplier={1.0} ... />  // Too hard for kids
```

---

### 3. Visual Feedback

```tsx
// ✓ Good: Clear hover state
<VisionButton ... />  // Has built-in hover feedback

// ✓ Good: Change cursor on pinch
<KenneyHandCursor 
  state={cursor.isPinching ? 'pinch' : 'point'}
/>
```

---

### 4. Fallback for No Camera

```tsx
// Always provide touch fallback
<VisionButton onClick={handleClick} ... />
// Works with both hand tracking AND touch/mouse
```

---

### 5. Clear Instructions

```tsx
<div className="instructions">
  <p>Point at a button and pinch to click!</p>
  {!cursor.isActive && (
    <p>Show your hand to the camera</p>
  )}
</div>
```

---

## Part 10: Troubleshooting

### Cursor Not Moving

**Check:**
1. Is hand detected? (`cursor.isActive`)
2. Is webcam working? (Check permissions)
3. Is MediaPipe initialized? (`isReady`)

**Debug:**
```tsx
console.log('Hand detected:', cursor.isActive);
console.log('Cursor position:', cursor.position);
console.log('Is pinching:', cursor.isPinching);
```

---

### Pinch Not Registering

**Tune threshold:**
```typescript
// In pinch detection, adjust distance threshold
const PINCH_THRESHOLD = 0.05;  // Try 0.03 (harder) or 0.08 (easier)
```

---

### Cursor Jittery

**Enable smoothing:**
```tsx
const { cursor } = useGameHandTracking({
  smoothing: { minCutoff: 1.0, beta: 0.0 },  // One-Euro filter
});
```

---

### Buttons Too Hard to Hit

**Increase hitbox:**
```tsx
<VisionButton hitboxMultiplier={3.0} ... />  // Very forgiving
```

---

## Summary

### What You Have Now

1. **MediaPipe HandLandmarker** - 21-point hand tracking
2. **SpatialInputContext** - Global cursor state
3. **VisionButton** - CV-controllable buttons
4. **KenneyHandCursor** - Visual hand indicator
5. **Coordinate transformation** - Landmark → Screen pixels

### How It Works

1. MediaPipe detects hand landmarks (normalized 0-1)
2. `useGameHandTracking` extracts index finger tip
3. Converts to screen coordinates
4. Updates `SpatialInputContext` with cursor position
5. `VisionButton` subscribes to cursor, performs hit-testing
6. Pinch gesture triggers `onClick`
7. Visual feedback shows hover state

### What You Can Build

- ✓ CV-controlled buttons
- ✓ Hand-driven UI navigation  
- ✓ Pinch-to-click interactions
- ✓ Drag-and-drop with hand
- ✓ Drawing/trace with finger

---

**Next:** See `VISION_STACK_ARCHITECTURE_2026-03-18.md` for recommendations on when to add object detection (RF-DETR) and segmentation (MobileSAM).
