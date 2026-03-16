# CV/MediaPipe Controls Implementation Guide

**Date:** 2026-03-14  
**Purpose:** MANDATORY guide for adding computer vision controls to ALL games

## Overview

This document provides a comprehensive guide for adding CV (Computer Vision) controls to games using MediaPipe.

> **⚠️ MANDATORY: ALL games MUST have at least one form of CV control: `hand`, `pose`, `face`, or `voice`.**
> This is NOT optional — it is the core identity of the platform. See `AGENTS.md` → "🎯 MULTI-MODAL VISION PLATFORM" for full requirements.

## Available CV Control Types

| Type | Hook | Use Case | Detection |
|------|------|----------|------------|
| `hand` | `useGameHandTracking` | Finger pointing, pinching, grabbing | Hand landmarks |
| `pose` | `useGamePoseTracking` | Body movements, jumping, arm positions | Full body pose |
| `face` | `useGameFaceTracking` | Head tilting, facial expressions | Face landmarks |

## Quick Implementation Templates

### 1. Hand Tracking (Most Common)

```typescript
// Game page imports
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import Webcam from 'react-webcam';

function MyGame() {
  const webcamRef = useRef<Webcam>(null);
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0 });

  const handleHandFrame = useCallback((landmarks) => {
    // Get index finger tip position (landmark 8)
    const indexTip = landmarks[8];
    setHandPosition({ x: indexTip.x, y: indexTip.y });
  }, []);

  const { handVisible } = useGameHandTracking({
    gameName: 'My Game',
    webcamRef,
    onFrame: handleHandFrame,
    isRunning: isPlaying,
    // To force main-thread mode explicitly (skipping worker startup) pass:
    // runtimeMode: 'main-thread'
    // Otherwise the hook defaults to worker mode and auto-falls back to
    // main-thread when worker support is not available.
  });

  return (
    <GameContainer
      title="My Game"
      isPlaying={isPlaying}
      isHandDetected={handVisible}
      webcamRef={webcamRef}
    >
      {/* Game content */}
    </GameContainer>
  );
}
```

### 2. Pose Tracking (Full Body)

```typescript
import { useGamePoseTracking } from '../hooks/useGamePoseTracking';

function MyGame() {
  const webcamRef = useRef<Webcam>(null);
  const [bodyPosition, setBodyPosition] = useState({ x: 0, y: 0 });

  const handlePoseFrame = useCallback((landmarks) => {
    // Get nose position (landmark 0)
    const nose = landmarks[0];
    setBodyPosition({ x: nose.x, y: nose.y });
  }, []);

  const { poseDetected } = useGamePoseTracking({
    gameName: 'My Game',
    webcamRef,
    onFrame: handlePoseFrame,
    enabled: isPlaying,
  });

  return (
    <GameContainer
      title="My Game"
      isPlaying={isPlaying}
      isHandDetected={poseDetected}
      webcamRef={webcamRef}
    >
      {/* Game content */}
    </GameContainer>
  );
}
```

### 3. Face Tracking (Head Movement)

```typescript
import { useGameFaceTracking } from '../hooks/useGameFaceTracking';
import { type HeadPose } from '../utils/headPose';

function MyGame() {
  const webcamRef = useRef<Webcam>(null);
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0 });

  const handleFaceFrame = useCallback((pose: HeadPose) => {
    // pose.roll: side-to-side tilt (-90 to 90)
    // pose.pitch: up/down nod (-90 to 90)
    // pose.yaw: left/right turn (-90 to 90)
    setHeadTilt({ x: pose.roll, y: pose.pitch });
  }, []);

  const { faceDetected } = useGameFaceTracking({
    gameName: 'My Game',
    webcamRef,
    onFrame: handleFaceFrame,
    enabled: isPlaying,
  });

  return (
    <GameContainer
      title="My Game"
      isPlaying={isPlaying}
      isHandDetected={faceDetected}
      webcamRef={webcamRef}
    >
      {/* Game content */}
    </GameContainer>
  );
}
```

## Registry Updates

After adding CV controls, update the game registry entry:

```typescript
// src/data/gameRegistries/[world].ts
{
  id: 'my-game',
  name: 'My Game',
  tagline: 'Play with your hands!',
  path: '/games/my-game',
  icon: 'sparkles',
  worldId: 'my-world',
  vibe: 'active',
  ageRange: '3-8',
  isNew: true,
  cv: ['hand'], // Add this line with appropriate type
  listed: true,
  // ... rest of config
}
```

## Common Patterns by Game Type

### Touch/Click Games → Hand Tracking
- **Games:** Color Match, Shape Pop, Bubble Pop
- **Pattern:** Detect index finger position for click detection
- **Landmark:** Index finger tip (landmark 8)

### Movement Games → Pose Tracking
- **Games:** Obstacle Course, Follow The Leader, Yoga Animals
- **Pattern:** Track body position or specific joint positions
- **Landmark:** Nose (0), wrists (15/16), ankles (27/28)

### Steering Games → Face Tracking
- **Games:** Mirror Maze, steering games
- **Pattern:** Track head tilt (roll/pitch)
- **Use:** HeadPose.roll, HeadPose.pitch

### Drawing Games → Hand Tracking
- **Games:** Air Canvas, Mirror Draw, Tracing
- **Pattern:** Track index finger tip for drawing path
- **Landmark:** Index finger tip (8) with history

## Games Needing CV Controls (57 Total)

### Priority 1: Simple Touch Games (Easiest)
1. color-splash - Hand tracking for color selection
2. color-mixing - Hand tracking for mixing colors
3. color-by-number - Hand tracking for number selection
4. color-potions - Hand tracking for ingredient selection
5. pack-lunchbox - Hand tracking for food items
6. set-the-table - Hand tracking for utensils
7. memory-match - Hand tracking for card flipping
8. story-builder - Hand tracking for word cards

### Priority 2: Selection/Sorting Games
9. temperature-sort - Hand tracking
10. plant-garden - Hand tracking
11. sound-garden - Hand tracking
12. taste-match - Hand tracking
13. farm-friends - Hand tracking
14. texture-explorer - Hand tracking
15. dinosaur-dig - Hand tracking
16. light-painter - Hand tracking for drawing
17. tidy-up-time - Hand tracking

### Priority 3: Educational/Quiz Games
18. number-tracing - Hand tracking for tracing
19. counting-objects - Hand tracking for selection
20. more-or-less - Hand tracking for selection
21. number-sequence - Hand tracking for selection
22. blend-builder - Hand tracking
23. syllable-clap - Pose tracking (clapping)
24. sight-word-flash - Hand tracking
25. letter-catcher - Hand tracking
26. number-bubble-pop - Hand tracking
27. pop-the-number - Hand tracking
28. bubble-count - Hand tracking
29. shape-stacker - Hand tracking
30. size-sorting - Hand tracking
31. weather-match - Hand tracking
32. fraction-pizza - Hand tracking
33. time-tell - Hand tracking (clock hands)
34. money-match - Hand tracking
35. pattern-play - Hand tracking
36. color-sort - Hand tracking
37. path-following - Hand tracking
38. rhythm-tap - Hand tracking (tapping)
39. animal-sounds - Hand tracking
40. body-parts - Pose tracking (pointing)
41. target-practice - Hand tracking

### Priority 4: Story/Voice Games
42. voice-stories - Voice only (no CV needed)
43. reading-along - Hand tracking for word selection
44. story-sequence - Hand tracking (already has)
45. ending-sounds - Hand tracking
46. letter-sound-match - Hand tracking
47. same-and-different - Hand tracking
48. shadow-match - Hand tracking

### Priority 5: 3D/Complex Games
49. virtual-bubbles-3d - Hand tracking
50. nasa-sky-hunt - Hand tracking
51. planet-sandbox - Hand tracking for dragging
52. earth-time-machine - Hand tracking
53. iss-docking - Hand tracking
54. logic-box-push - Hand tracking
55. music-conductor - Hand tracking (beat detection)
56. feed-the-monster - Hand tracking

## Testing Checklist

After implementing CV controls:

- [ ] Camera permission is requested
- [ ] Hand/pose/face is detected
- [ ] Game responds to movements
- [ ] Visual feedback shows detection status
- [ ] Fallback keyboard controls still work
- [ ] Performance is acceptable (30fps+)
- [ ] Registry has correct `cv: [...]` entry

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Verify webcamRef is passed to GameContainer
- Check for HTTPS requirement (cameras require secure context)

### Detection Not Working
- Verify lighting conditions
- Check if MediaPipe models are loading (Network tab)
- Add console logging to callback functions
- Check `enabled` prop is true during gameplay

### Performance Issues
- Reduce detection frequency
- Lower video resolution
- Use `enabled` prop to disable when not needed

## References

- Hand Tracking: `src/hooks/useGameHandTracking.ts`
- Pose Tracking: `src/hooks/useGamePoseTracking.ts`
- Face Tracking: `src/hooks/useGameFaceTracking.ts`
- Example: `src/pages/MirrorMaze.tsx` (face tracking)
- Example: `src/pages/ColorMatchGarden.tsx` (hand tracking)
