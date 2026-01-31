# Camera Integration Guide

**For AI Agents and Developers**

**Purpose**: Step-by-step guide to add MediaPipe hand tracking to any game in Advay Vision Learning.

**Last Updated**: 2026-02-01  
**Reference Implementation**: ConnectTheDots (TCK-20260201-012, commit 6962ce7)

---

## Core Principle

**ALL GAMES MUST USE CAMERA** - This is a gesture-based learning app using MediaPipe and computer vision technology.

No game should be mouse/touch-only. Camera/hand tracking is the primary interaction method, with mouse/touch as fallback for accessibility.

---

## Prerequisites

Before adding camera to a game:

1. ✅ `useHandTracking` hook exists (`src/frontend/src/hooks/useHandTracking.ts`)
2. ✅ `pinchDetection` utility exists (`src/frontend/src/utils/pinchDetection.ts`)
3. ✅ `react-webcam` package installed
4. ✅ MediaPipe tasks-vision dependencies in package.json
5. ✅ Type definitions for tracking (`src/frontend/src/types/tracking.ts`)

---

## Step-by-Step Integration

### Step 1: Import Dependencies

Add to the top of your game component:

```typescript
import { useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import { useHandTracking } from '../hooks/useHandTracking';
import { detectPinch, createDefaultPinchState } from '../utils/pinchDetection';
import type { PinchState, Landmark } from '../types/tracking';
```

### Step 2: Add State Variables

Inside your component:

```typescript
// Refs
const webcamRef = useRef<Webcam>(null);
const pinchStateRef = useRef<PinchState>(createDefaultPinchState());
const animationFrameRef = useRef<number | null>(null);

// Hand tracking state
const [isHandTrackingEnabled, setIsHandTrackingEnabled] = useState(false);
const [isPinching, setIsPinching] = useState(false);
const [handCursor, setHandCursor] = useState<{ x: number; y: number } | null>(null);

// Camera permission state
const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
const [showPermissionWarning, setShowPermissionWarning] = useState(false);

// Initialize hand tracking hook
const {
  landmarker,
  isReady: isHandTrackingReady,
  initialize: initializeHandTracking,
} = useHandTracking({
  numHands: 1, // Or 2 if game needs both hands
  minDetectionConfidence: 0.3,
  minHandPresenceConfidence: 0.3,
  minTrackingConfidence: 0.3,
  delegate: 'GPU',
  enableFallback: true,
});
```

### Step 3: Camera Permission Check

Add this useEffect to check camera permissions on mount:

```typescript
useEffect(() => {
  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      });
      setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
      
      if (result.state === 'denied') {
        setShowPermissionWarning(true);
      }
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
        setShowPermissionWarning(result.state === 'denied');
      });
    } catch (error) {
      console.warn('[YourGame] Camera permission check not supported', error);
    }
  };
  
  checkCameraPermission();
}, []);
```

### Step 4: Initialize Hand Tracking

Add this useEffect to start hand tracking when enabled:

```typescript
useEffect(() => {
  if (gameStarted && isHandTrackingEnabled && !landmarker) {
    initializeHandTracking();
  }
}, [gameStarted, isHandTrackingEnabled, landmarker, initializeHandTracking]);
```

### Step 5: Hand Tracking Loop

Add the tracking loop function:

```typescript
const runHandTracking = useCallback(async () => {
  if (
    !webcamRef.current?.video ||
    !landmarker ||
    !isHandTrackingReady ||
    !isHandTrackingEnabled
  ) {
    return;
  }

  const video = webcamRef.current.video;

  if (video.readyState < 2) {
    animationFrameRef.current = requestAnimationFrame(runHandTracking);
    return;
  }

  try {
    const results = landmarker.detectForVideo(video, performance.now());

    if (results?.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0] as Landmark[];
      
      // Get index finger tip (landmark 8) for cursor
      const indexTip = landmarks[8];
      if (indexTip) {
        // Mirror X coordinate (webcam is mirrored)
        const mirroredX = 1 - indexTip.x;
        
        // Map to your coordinate system (adjust for canvas/screen)
        const x = mirroredX * YOUR_WIDTH;
        const y = indexTip.y * YOUR_HEIGHT;
        
        setHandCursor({ x, y });
        
        // Detect pinch gesture
        const pinchResult = detectPinch(
          landmarks,
          pinchStateRef.current,
          { startThreshold: 0.05, releaseThreshold: 0.07 }
        );
        
        pinchStateRef.current = pinchResult.state;
        setIsPinching(pinchResult.state.isPinching);
        
        // When pinching starts, perform action
        if (pinchResult.transition === 'start') {
          handlePinchAction(x, y);
        }
      }
    } else {
      // No hand detected
      setHandCursor(null);
      setIsPinching(false);
    }
  } catch (error) {
    console.error('[YourGame] Hand tracking error:', error);
  }

  animationFrameRef.current = requestAnimationFrame(runHandTracking);
}, [landmarker, isHandTrackingReady, isHandTrackingEnabled]);
```

### Step 6: Start/Stop Tracking Loop

Add this useEffect:

```typescript
useEffect(() => {
  if (gameStarted && isHandTrackingEnabled && isHandTrackingReady) {
    runHandTracking();
  }

  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };
}, [gameStarted, isHandTrackingEnabled, isHandTrackingReady, runHandTracking]);
```

### Step 7: Add Webcam Component to JSX

In your render, add the webcam (hidden, used only for detection):

```tsx
{isHandTrackingEnabled && (
  <div className='absolute top-0 left-0 w-full h-full pointer-events-none opacity-0'>
    <Webcam
      ref={webcamRef}
      audio={false}
      mirrored={true}
      videoConstraints={{
        facingMode: 'user',
        width: 1280,
        height: 720,
      }}
      className='w-full h-full object-cover'
    />
  </div>
)}
```

### Step 8: Add Hand Cursor Visualization

Add visual feedback for the hand cursor:

```tsx
{/* In your SVG or canvas overlay */}
{handCursor && isHandTrackingEnabled && (
  <g>
    <circle
      cx={handCursor.x}
      cy={handCursor.y}
      r={isPinching ? 15 : 12}
      fill={isPinching ? '#FFFF00' : '#00D9FF'}
      fillOpacity={0.7}
      stroke='#FFFFFF'
      strokeWidth='2'
    />
    {isPinching && (
      <circle
        cx={handCursor.x}
        cy={handCursor.y}
        r={25}
        fill='none'
        stroke='#FFFF00'
        strokeWidth='2'
        opacity='0.5'
      />
    )}
  </g>
)}
```

### Step 9: Add Mode Toggle Button

Add UI control to enable/disable hand tracking:

```tsx
{cameraPermission === 'granted' && (
  <button
    onClick={() => setIsHandTrackingEnabled(!isHandTrackingEnabled)}
    className={`px-4 py-2 rounded-lg transition ${
      isHandTrackingEnabled
        ? 'bg-green-500 hover:bg-green-600 text-white'
        : 'bg-white/10 hover:bg-white/20 backdrop-blur'
    }`}
  >
    <UIIcon name={isHandTrackingEnabled ? 'camera' : 'eye'} size={16} />
    {isHandTrackingEnabled ? 'Hand Mode' : 'Mouse Mode'}
  </button>
)}
```

### Step 10: Add Status Indicators

Show current input mode:

```tsx
<div className={`px-3 py-1 rounded-full text-xs ${
  isHandTrackingEnabled ? 'text-green-400' : 'text-blue-400'
}`}>
  <UIIcon name={isHandTrackingEnabled ? 'hand' : 'target'} size={12} />
  {isHandTrackingEnabled 
    ? handCursor ? 'Hand Detected' : 'Show Hand'
    : 'Mouse/Click Mode'
  }
</div>
```

### Step 11: Camera Permission Warning

Show warning when camera denied:

```tsx
{showPermissionWarning && cameraPermission === 'denied' && (
  <div className='bg-amber-500/20 border border-amber-500/50 px-3 py-2 rounded-lg text-xs'>
    <div className='font-semibold text-amber-400'>Camera Unavailable</div>
    <div className='text-white/70'>
      Using mouse/click mode. Enable camera in browser settings for hand tracking.
    </div>
  </div>
)}
```

---

## Coordinate Mapping Guide

Different games use different coordinate systems. Here's how to map hand landmarks:

### For Canvas-Based Games

If your canvas has fixed internal dimensions (e.g., 800x600):

```typescript
const canvas = canvasRef.current;
const mirroredX = 1 - indexTip.x;
const canvasX = mirroredX * canvas.width;  // e.g., 800
const canvasY = indexTip.y * canvas.height; // e.g., 600
```

### For Screen-Based Games

If you're using screen/viewport coordinates:

```typescript
const mirroredX = 1 - indexTip.x;
const screenX = mirroredX * window.innerWidth;
const screenY = indexTip.y * window.innerHeight;
```

### For Relative Positioning

If you need percentage-based positioning:

```typescript
const mirroredX = 1 - indexTip.x;
// Use mirroredX and indexTip.y directly (range 0-1)
// Apply via CSS: style={{ left: `${mirroredX * 100}%` }}
```

---

## Common Pitfalls

### ❌ DON'T: Forget to mirror X coordinate
```typescript
// WRONG - hand moves opposite direction
const x = indexTip.x * width;
```

```typescript
// CORRECT - natural hand-eye coordination
const x = (1 - indexTip.x) * width;
```

### ❌ DON'T: Use video readyState without checking
```typescript
// WRONG - may detect on black screen
const results = landmarker.detectForVideo(video, performance.now());
```

```typescript
// CORRECT - wait for video ready
if (video.readyState < 2) {
  animationFrameRef.current = requestAnimationFrame(runHandTracking);
  return;
}
```

### ❌ DON'T: Forget to cleanup animation frame
```typescript
// WRONG - memory leak, continues running after unmount
useEffect(() => {
  runHandTracking();
}, []);
```

```typescript
// CORRECT - cleanup on unmount
useEffect(() => {
  runHandTracking();
  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
}, [runHandTracking]);
```

---

## Testing Checklist

After integration, verify:

- [ ] Camera permission prompt appears on first load
- [ ] Warning shown when camera denied
- [ ] Hand cursor appears when hand in frame
- [ ] Hand cursor mirrors hand movement naturally (left → left)
- [ ] Pinch gesture changes cursor appearance
- [ ] Pinch gesture triggers expected action
- [ ] Mouse/click fallback works when hand tracking disabled
- [ ] Toggle button switches between modes correctly
- [ ] No console errors during hand tracking
- [ ] Performance acceptable (30+ FPS)
- [ ] TypeScript compilation passes

---

## Performance Optimization

Hand tracking can be CPU/GPU intensive. Optimize:

1. **Use appropriate detection confidence**
   - Start with 0.3 (good balance)
   - Lower = faster but less accurate
   - Higher = slower but more accurate

2. **Limit number of hands**
   - Use `numHands: 1` if only one hand needed
   - Reduces processing by ~50%

3. **Enable GPU with fallback**
   - `delegate: 'GPU'` with `enableFallback: true`
   - CPU fallback prevents crashes

4. **Debounce expensive operations**
   - Don't re-render entire UI every frame
   - Update only cursor position state

5. **Memoize callbacks**
   - Wrap `runHandTracking` in useCallback
   - Prevents unnecessary re-creation

---

## Reference Implementation

**ConnectTheDots** (commit 6962ce7) is the reference implementation:
- File: `src/frontend/src/pages/ConnectTheDots.tsx`
- Lines: 639 total (camera integration added ~250 lines)
- Features: Mode A + Mode B + mouse fallback

**AlphabetGame** is the original implementation:
- File: `src/frontend/src/pages/AlphabetGame.tsx`
- Features: Full hand tracking with drawing, camera permissions

---

## Related Documentation

- [INPUT_METHODS_SPECIFICATION.md](../INPUT_METHODS_SPECIFICATION.md) - All 6 input methods
- [useHandTracking hook](../../src/frontend/src/hooks/useHandTracking.ts) - Hook implementation
- [pinchDetection utility](../../src/frontend/src/utils/pinchDetection.ts) - Pinch detection
- [GAME_MECHANICS.md](../GAME_MECHANICS.md) - Interaction modes specification

---

## Support

If you encounter issues:

1. Check browser console for MediaPipe errors
2. Verify camera permissions in browser settings
3. Test with different lighting conditions
4. Verify GPU/WebGL support in browser
5. Check MediaPipe CDN availability (cdn.jsdelivr.net)

**Common Errors**:
- "Failed to load MediaPipe model" → Check network/CDN
- "Camera not available" → Check permissions
- "GPU delegate failed" → CPU fallback should activate
- Cursor moves opposite → Mirror X coordinate
