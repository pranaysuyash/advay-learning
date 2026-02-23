# Stream 3: Pip AI Integration Analysis

## Analysis Date

2026-02-23

## Summary

Research into emotion detection and conversational AI for Pip the AI companion.

---

## Vision: Pip 2.0 - The Empathic Interface

From `docs/NORTH_STAR_VISION.md`:

> **"Pip the Red Panda is not just a UI element. Pip _is_ the UI."**

### Key Capabilities:

1. **Multimodal Feedback** - Backflips, confetti, sounds (not text boxes)
2. **Emotional Analyst** - Detects frustration via mic/camera
3. **Conversational Tutor** - Safe, local LLMs for "Why?" questions

---

## Current State

### Emotion Detection - FOUNDATION EXISTS

- MediaPipe FaceLandmarker provides **478 blendshapes**
- Can detect: smile, surprise, anger, sorrow, etc.
- Already have `useEyeTracking.ts` with FaceLandmarker

### Conversational AI - NOT YET IMPLEMENTED

- Need local LLM solution for privacy
- WebLLM is the leading option

---

## Technical Implementation Plan

### Phase 1: Emotion Detection (Week 1)

#### 1.1 Create `useEmotionDetection.ts`

```typescript
// Emotion detection hook using face blendshapes

export interface EmotionState {
  joy: number; // 0-1 (browUpLeft, browUpRight, mouthSmileLeft, mouthSmileRight)
  sorrow: number; // 0-1 (browOuterUpLeft, browOuterUpRight, mouthFrownLeft/Right)
  anger: number; // 0-1 (browOuterDownLeft, browOuterDownRight, eyeLookUpLeft/Right)
  surprise: number; // 0-1 (browOuterUpLeft, browOuterUpRight, jawOpen)
  fear: number; // 0-1 (browUpLeft, browUpRight, mouthShrugUpper)
  disgust: number; // 0-1 (mouthRollUpper, mouthRollLower)
  dominant: EmotionType;
  intensity: number; // 0-1 overall confidence
}

// Hook provides:
// - emotion: EmotionState
// - isFrustrated: boolean (sustained sorrow + low joy)
// - isExcited: boolean (high joy + high surprise)
// - isCalm: boolean (neutral + low intensity)
```

#### 1.2 Create Pip Reaction System

```typescript
// Pip responds to emotions

export interface PipReaction {
  type: 'celebrate' | 'comfort' | 'encourage' | 'calm' | 'excited';
  animation: string; // 'backflip', 'wave', 'bounce', 'nod'
  sound: string; // 'yay.mp3', 'aww.mp3', 'come_on.mp3'
  message?: string; // Optional vocalization
}

// Rules:
// - joy > 0.7 for 2+ seconds → celebrate
// - sorrow > 0.6 for 3+ seconds → comfort
// - anger > 0.5 for 2+ seconds → calm
// - surprise > 0.7 → excited acknowledgement
```

---

### Phase 2: Pip Character Implementation (Week 2)

#### 2.1 Pip Component

```typescript
// components/pip/Pip.tsx
interface PipProps {
  emotion: EmotionState;
  reaction: PipReaction;
  position: 'floating' | 'corner' | 'docked';
  onReact: (reaction: PipReaction) => void;
}
```

#### 2.2 Pip States

| State     | Visual              | Trigger               |
| --------- | ------------------- | --------------------- |
| Idle      | Bouncing slightly   | Default               |
| Happy     | Backflip, confetti  | Success, joy detected |
| Curious   | Tilting head        | New element, surprise |
| Concerned | Worried expression  | Frustration detected  |
| Excited   | Jumping, stars      | High energy, surprise |
| Calming   | Breathing animation | Anger, fear detected  |

#### 2.3 Integration Points

- Game success → Pip celebrates
- Repeated failure → Pip offers help
- Long silence → Pip checks in
- Child speaks → Pip responds (if voice enabled)

---

### Phase 3: Conversational AI (Week 3-4)

#### 3.1 Local LLM Options

| Option          | Pros              | Cons                    | Status              |
| --------------- | ----------------- | ----------------------- | ------------------- |
| **WebLLM**      | Fully local, fast | Large download (~400MB) | Recommended         |
| Transformers.js | Good accuracy     | Slower on mobile        | Backup              |
| WebSpeech API   | Free, simple      | Not intelligent         | Voice-only fallback |

#### 3.2 WebLLM Integration

```typescript
// Use WebLLM for on-device LLM
import { CreateMLCEngine } from '@mlc-ai/web-llm';

// Initialize with small model
const engine = await CreateMLCEngine('Llama-3.1-8B-Instruct-q4f32_1', {
  initProgressCallback: console.log,
});

// Generate response (local, private)
const response = await engine.chat.completions.create({
  messages: [
    { role: 'system', content: PIP_SYSTEM_PROMPT },
    { role: 'user', content: childQuestion },
  ],
});
```

#### 3.3 Safe Conversational Scope

For child safety, limit Pip's knowledge to:

- **ALLOWED**: Animals, colors, shapes, basic science, stories, feelings
- **BLOCKED**: Violence, personal info, dangerous activities, complex politics

---

### Phase 4: Advanced Features (Week 5-6)

1. **Attention Tracking** - Is child looking at screen?
2. **Fatigue Detection** - Yawning, eyes drooping
3. **Multi-child Detection** - Who's playing?
4. **Adaptive Difficulty** - Pip suggests easier/harder based on emotions

---

## Dependencies Required

| Package                   | Purpose          | Status            |
| ------------------------- | ---------------- | ----------------- |
| `@mediapipe/tasks-vision` | Face blendshapes | Already installed |
| `@mlc-ai/web-llm`         | Local LLM        | Needs install     |
| `transformers.js`         | Backup LLM       | Needs install     |

---

## Effort Estimate

- Phase 1 (Emotion detection): 1 week
- Phase 2 (Pip character): 1-2 weeks
- Phase 3 (Conversational AI): 2 weeks
- Phase 4 (Advanced): 2 weeks
- **Total: 6-7 weeks**

---

## Evidence

- North Star Vision document describes Pip 2.0 requirements
- MediaPipe provides 478 blendshapes for emotion detection
- WebLLM is the leading on-device LLM solution
- Existing `useEyeTracking.ts` uses FaceLandmarker

---

## Child Safety Considerations

1. **No voice recording storage** - All processing local
2. **No personal data** - LLM doesn't know family details
3. **Age-appropriate responses** - System prompt enforces safe scope
4. **Parental controls** - Can disable voice features
5. **COPPA compliant** - No personal data collection
