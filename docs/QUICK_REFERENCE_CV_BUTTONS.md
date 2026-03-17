# Quick Reference: CV Button Control

**One-page cheat sheet for implementing hand-controlled buttons**

---

## 1. Import What You Need

```tsx
import { VisionButton } from '../components/ui/VisionButton';
import { KenneyHandCursor } from '../components/game/KenneyHandCursor';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useSpatialInput } from '../context/SpatialInputContext';
```

---

## 2. Basic Setup

```tsx
function MyGame() {
  // Initialize hand tracking
  const { isReady, startTracking, stopTracking } = useGameHandTracking({
    gameName: 'MyGame',
    targetFps: 30,
  });
  
  // Get cursor position
  const { cursor } = useSpatialInput();
  
  // Start tracking
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);
  
  if (!isReady) return <div>Loading...</div>;
  
  return (
    <div>
      {/* Show hand cursor */}
      <KenneyHandCursor
        position={cursor.position}
        state={cursor.isPinching ? 'pinch' : 'point'}
        isHandDetected={cursor.isActive}
        color="yellow"
        size={64}
      />
      
      {/* CV-controllable button */}
      <VisionButton 
        onClick={() => console.log('Clicked!')}
        color="green"
        size="large"
        hitboxMultiplier={2.0}
      >
        Click Me
      </VisionButton>
    </div>
  );
}
```

---

## 3. Cursor Position → Screen Coordinates

MediaPipe gives **normalized** coordinates (0-1):

```typescript
// Convert to screen pixels
const screenX = landmark.x * window.innerWidth;
const screenY = landmark.y * window.innerHeight;

// Mirror for selfie mode (front camera)
const mirroredX = (1 - landmark.x) * window.innerWidth;
```

---

## 4. Pinch Detection

```typescript
// Thumb tip (4) + Index tip (8)
const distance = Math.sqrt(
  Math.pow(landmarks[4].x - landmarks[8].x, 2) +
  Math.pow(landmarks[4].y - landmarks[8].y, 2)
);

const isPinching = distance < 0.05;  // Threshold
```

---

## 5. Key Landmarks

| Landmark | Index | Use |
|----------|-------|-----|
| Wrist | 0 | Reference point |
| Thumb tip | 4 | Pinch detection |
| Index tip | 8 | **Primary cursor** |
| Middle tip | 12 | Secondary cursor |
| Ring tip | 16 | - |
| Pinky tip | 20 | - |

---

## 6. VisionButton Props

| Prop | Default | Tip |
|------|---------|-----|
| `color` | `'blue'` | Use `'green'` for primary actions |
| `size` | `'default'` | Use `'large'` for kids |
| `hitboxMultiplier` | `1.5` | Use `2.0` for easier targeting |
| `disabled` | `false` | Disable during animations |

---

## 7. Cursor States

```tsx
// Point = normal
// Pinch = about to click
// Grab = holding something

<KenneyHandCursor
  state={cursor.isPinching ? 'pinch' : 'point'}
/>
```

---

## 8. Troubleshooting

| Problem | Solution |
|---------|----------|
| Cursor not moving | Check `cursor.isActive` (hand detected?) |
| Pinch not working | Lower threshold: `0.08` instead of `0.05` |
| Too jittery | Enable smoothing in `useGameHandTracking` |
| Can't hit buttons | Increase `hitboxMultiplier` to `3.0` |
| No visual feedback | Ensure `KenneyHandCursor` is rendered |

---

## 9. Models in Use

| Model | Package | License | Purpose |
|-------|---------|---------|---------|
| HandLandmarker | `@mediapipe/tasks-vision` | Apache-2.0 | 21-point hand tracking |
| FaceLandmarker | `@mediapipe/tasks-vision` | Apache-2.0 | Face mesh + expressions |
| PoseLandmarker | `@mediapipe/tasks-vision` | Apache-2.0 | Body pose |

**Version:** 0.10.8 (CDN)

---

## 10. Checklist for New Game

- [ ] Import `useGameHandTracking`
- [ ] Import `useSpatialInput`
- [ ] Import `VisionButton`
- [ ] Import `KenneyHandCursor`
- [ ] Initialize hand tracking with `startTracking()`
- [ ] Cleanup with `stopTracking()` on unmount
- [ ] Render `KenneyHandCursor` with cursor position
- [ ] Use `VisionButton` instead of regular buttons
- [ ] Set `hitboxMultiplier={2.0}` for kids
- [ ] Show instructions ("Point and pinch to click")
- [ ] Handle `!cursor.isActive` state (no hand detected)
- [ ] Test on iPad + Android tablet

---

## Example: Full Game Component

```tsx
import { useEffect } from 'react';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useSpatialInput } from '../context/SpatialInputContext';
import { VisionButton } from '../components/ui/VisionButton';
import { KenneyHandCursor } from '../components/game/KenneyHandCursor';

export default function MyGame() {
  const { isReady, startTracking, stopTracking } = useGameHandTracking({
    gameName: 'MyGame',
    targetFps: 30,
  });
  
  const { cursor } = useSpatialInput();
  
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);
  
  if (!isReady) return <div>Loading hand tracking...</div>;
  
  return (
    <div className="p-8">
      <KenneyHandCursor
        position={cursor.position}
        state={cursor.isPinching ? 'pinch' : 'point'}
        isHandDetected={cursor.isActive}
        color="yellow"
        size={64}
      />
      
      <h1 className="text-2xl mb-4">Choose an option:</h1>
      
      <div className="space-y-4">
        <VisionButton 
          onClick={() => console.log('A')}
          color="blue"
          size="large"
          hitboxMultiplier={2.0}
        >
          Option A
        </VisionButton>
        
        <VisionButton 
          onClick={() => console.log('B')}
          color="green"
          size="large"
          hitboxMultiplier={2.0}
        >
          Option B
        </VisionButton>
      </div>
      
      {!cursor.isActive && (
        <p className="text-orange-500 mt-4">
          ⚠️ Show your hand to the camera
        </p>
      )}
    </div>
  );
}
```

---

**Files:**
- Full docs: `CURRENT_VISION_STACK_AND_BUTTON_CONTROL.md`
- Architecture: `VISION_STACK_ARCHITECTURE_2026-03-18.md`
- Implementation: `IMPLEMENTATION_CHECKLIST_VISION_STACK.md`
