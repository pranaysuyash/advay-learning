# Stream 2: Face/Pose Expansion Analysis

## Analysis Date

2026-02-23

## Summary

Research into face and pose tracking capabilities. **MAJOR DISCOVERY: Existing infrastructure found!**

---

## 🚨 MAJOR FINDING: Infrastructure Already Exists!

### Existing Hooks Found

1. **`useEyeTracking.ts`** - Already uses FaceLandmarker!
   - Uses 468-point face landmarks
   - Extracts eye tracking data
   - Located in: `src/frontend/src/hooks/useEyeTracking.ts`

2. **`usePostureDetection.ts`** - Already uses PoseLandmarker!
   - Uses 33-point pose landmarks
   - Tracks nose, shoulders, hips
   - Located in: `src/frontend/src/hooks/usePostureDetection.ts`

---

## Current Architecture Pattern

### Hand Tracking (Reference)

```
useHandTracking.ts (Model init) → useHandTrackingRuntime.ts (Frame loop) → useGameHandTracking.ts (Unified API)
```

### Face Tracking (Existing but Underutilized)

```
useEyeTracking.ts (Exists!) → Needs unified API wrapper
```

### Pose Tracking (Existing but Underutilized)

```
usePostureDetection.ts (Exists!) → Needs unified API wrapper
```

---

## Technical Implementation Plan

### Phase 1: Unified Hooks (Week 1)

#### 1.1 Create `useFaceTracking.ts`

```typescript
// New unified face tracking hook
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// Export face state type
export interface TrackedFaceFrame {
  landmarks: NormalizedLandmark[];
  blendshapes: FaceBlendshape[]; // 478 blendshapes for emotion
  timestamp: number;
}

// Hook provides:
// - isReady: boolean
// - startTracking: () => void
// - faceRef: RefObject<TrackedFaceFrame | null>
// - expressions: { smile: number, surprise: number, anger: number, ... }
```

#### 1.2 Create `usePoseTracking.ts`

```typescript
// New unified pose tracking hook
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// Export pose state type
export interface TrackedPoseFrame {
  landmarks: NormalizedLandmark[]; // 33 points
  worldLandmarks: Landmark[]; // 3D coordinates
  timestamp: number;
}

// Hook provides:
// - isReady: boolean
// - startTracking: () => void
// - poseRef: RefObject<TrackedPoseFrame | null>
// - posture: { standing: boolean, armsRaised: boolean, ... }
```

#### 1.3 Create `useFacialExpression.ts` (Emotion Detection)

```typescript
// High-level emotion API
// Uses FaceLandmarker blendshapes

export interface EmotionState {
  joy: number; // 0-1
  sorrow: number; // 0-1
  anger: number; // 0-1
  surprise: number; // 0-1
  dominant: 'joy' | 'sorrow' | 'anger' | 'surprise' | 'neutral';
}
```

---

### Phase 2: Game Integration (Week 2)

#### 2.1 Face-Enabled Games

| Game                | Face Input      | Learning Target        |
| ------------------- | --------------- | ---------------------- |
| Emotion Mirror      | Copy expression | Emotional intelligence |
| Silly Face Contest  | Make funny face | Creativity, humor      |
| Expression Charades | Act out emotion | Emotional vocabulary   |
| Calm Down           | Relax face      | Self-regulation        |

#### 2.2 Pose-Enabled Games

| Game              | Pose Input     | Learning Target      |
| ----------------- | -------------- | -------------------- |
| Yoga Poses        | Static posture | Balance, flexibility |
| Freeze Dance      | Hold pose      | Self-control         |
| Statues           | Hold position  | Balance, patience    |
| Follow the Leader | Copy pose      | Coordination         |

#### 2.3 Multi-Modal Games (Hand + Face + Pose)

| Game           | Inputs            | Learning Target |
| -------------- | ----------------- | --------------- |
| Puppet Show    | Hand + Voice      | Storytelling    |
| Conducting     | Hand + Face focus | Leadership      |
| Exercise Count | Pose + Voice      | Math + fitness  |

---

### Phase 3: Advanced Features (Week 3-4)

1. **Real-time emotion feedback** - Detect frustration/joy
2. **Pip reactions** - Pip responds to child's emotions
3. **Attention tracking** - Is child looking at screen?
4. **Multi-person detection** - Sibling/co-op support

---

## MediaPipe Capabilities

### FaceLandmarker

- **478 Blendshapes** for facial expressions
- **468 Landmarks** for face mesh
- Real-time at 30fps+
- Works with front-facing camera

### PoseLandmarker

- **33 Landmarks** for body pose
- **World Landmarks** for 3D coordinates
- Full body detection
- Works at distance

---

## Dependencies Required

- `@mediapipe/tasks-vision` (already installed)
- No new packages needed!

---

## Effort Estimate

- Phase 1 (Unified hooks): 1 week
- Phase 2 (Game integration): 1-2 weeks
- Phase 3 (Advanced): 2 weeks
- **Total: 4-5 weeks**

---

## Evidence

- Subagent research found `useEyeTracking.ts` using FaceLandmarker
- Subagent research found `usePostureDetection.ts` using PoseLandmarker
- MediaPipe documentation confirms 478 blendshapes available
