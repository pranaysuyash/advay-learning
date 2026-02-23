# Parallel Implementation Plan - 2026-02-23

## Overview

Three parallel work streams following the lifecycle: Analysis → Document → Plan → Research → Document → Implement → Test → Document

Cross-stream finding log:
- `docs/GAME_LOGICAL_FINDINGS_AND_RESEARCH_2026-02-23.md`
- Per-game artifacts in `docs/audit/` (one game per file)

---

## STREAM 1: Hand-Tracking Premium Polish

### ✅ Analysis (COMPLETE)

- Reviewed SteadyHandLab, WordBuilder, ConnectTheDots
- Found: Already using modern hooks, mostly well-polished
- Gap: Coordinate transformation (normalized → screen)

### 📋 Document (COMPLETE)

- Created: `docs/STREAM1_HAND_TRACKING_POLISH_ANALYSIS.md`
- Added rolling findings index: `docs/GAME_LOGICAL_FINDINGS_AND_RESEARCH_2026-02-23.md`
- Added first game audit: `docs/audit/src__frontend__src__pages__FreeDraw.tsx.md`

### 📅 Plan

1. Fix coordinate transformation in 8 games
2. Add accessibility labels
3. Verify lifecycle patterns
4. Execute one-game-at-a-time logical audits with evidence labels

### 🔬 Research

- Need to check exact coordinate usage in each game

### 📋 Document (Next)

- Create implementation checklist

### 🛠️ Implement

- Apply fixes per game

### 🧪 Test

- Run smoke tests (16/16 pass)

### 📋 Document (Complete)

- Mark completion in worklog

---

## STREAM 2: Face/Pose Expansion

### ✅ Analysis (COMPLETE)

- FOUND: `useEyeTracking.ts` (FaceLandmarker)
- FOUND: `usePostureDetection.ts` (PoseLandmarker)
- These hooks exist but need unified API wrapper

### 📋 Document (COMPLETE)

- Created: `docs/STREAM2_FACE_POSE_EXPANSION_ANALYSIS.md`

### 📅 Plan

1. Create `useFaceTracking.ts` unified hook
2. Create `usePoseTracking.ts` unified hook
3. Create `useFacialExpression.ts` emotion detection
4. Integrate into games

### 🔬 Research

- MediaPipe blendshapes for emotion detection
- Game design for face/pose interactions

### 📋 Document (Next)

- Create technical specifications

### 🛠️ Implement

- Build unified hooks
- Build example games

### 🧪 Test

- Verify face/pose detection

### 📋 Document (Complete)

- Document usage patterns

---

## STREAM 3: Pip AI Integration

### ✅ Analysis (COMPLETE)

- Emotion detection: Foundation exists (FaceLandmarker)
- Conversational AI: Not yet implemented
- Need: WebLLM for local LLM

### 📋 Document (COMPLETE)

- Created: `docs/STREAM3_PIP_AI_INTEGRATION_ANALYSIS.md`

### 📅 Plan

1. Create `useEmotionDetection.ts`
2. Build Pip reaction system
3. Create Pip component
4. Integrate WebLLM

### 🔬 Research

- WebLLM integration
- Blendshape emotion mapping
- Child safety considerations

### 📋 Document (Next)

- Create Pip technical spec

### 🛠️ Implement

- Build emotion detection
- Build Pip character

### 🧪 Test

- Verify emotion detection

### 📋 Document (Complete)

- Document capabilities

---

## Parallel Execution Strategy

```
Week 1:
  Stream 1: Coordinate fix on 3 games
  Stream 2: Create useFaceTracking.ts
  Stream 3: Create useEmotionDetection.ts

Week 2:
  Stream 1: Coordinate fix on 5 games
  Stream 2: Create usePoseTracking.ts
  Stream 3: Build Pip reaction system

Week 3:
  Stream 1: Accessibility audit
  Stream 2: Face games integration
  Stream 3: Build Pip component

Week 4:
  Stream 1: Lifecycle verification
  Stream 2: Pose games integration
  Stream 3: WebLLM integration

Week 5-6:
  Stream 2: Advanced features
  Stream 3: Advanced features
```

---

## Key Discoveries

1. **Infrastructure exists** - Face and pose hooks already in codebase
2. **No new dependencies** - @mediapipe/tasks-vision already installed
3. **Proven pattern** - Hand tracking hooks are the template
4. **Privacy-first** - Local LLM (WebLLM) keeps data on device

---

## Dependencies

| Package                 | Purpose                 | Stream |
| ----------------------- | ----------------------- | ------ |
| @mediapipe/tasks-vision | Face/Pose/Hand tracking | All    |
| @mlc-ai/web-llm         | Local LLM               | 3      |
| transformers.js         | Backup LLM              | 3      |

---

## Success Criteria

- [ ] All 19 hand-tracking games polished
- [ ] Face tracking unified API created
- [ ] Pose tracking unified API created
- [ ] Emotion detection working
- [ ] Pip character responding to emotions
- [ ] Basic conversational AI (demo)
- [ ] Smoke tests pass (16/16)
- [ ] No regressions

---

**Created**: 2026-02-23
**Status**: Planning Complete - Ready for Implementation

---

## Program Addendum: P0 Closure First + Floating Hand Embodiment (2026-02-23)

### Workflow Enforcement
Analysis -> Document -> Plan -> Research -> Document -> Implement -> Test -> Document

### Checkpoint Status

1. P0 closure checkpoint: ✅ Complete
- Fresh gates verified on current branch:
  - `cd src/frontend && npm run -s type-check`
  - `cd src/frontend && npm run -s lint`
  - Targeted worker/boundary/image + smoke test suites

2. Hand pilot checkpoint (EmojiMatch): ✅ Complete
- Added `HandAvatarCursor` + `CursorEmbodiment` with feature-flag fallback.
- Pilot integrated in `src/frontend/src/pages/EmojiMatch.tsx`.

3. Cohort expansion checkpoint: ⏳ Pending
- Cohort A: `ShapeSequence`, `NumberTapTrail`
- Cohort B: `ColorMatchGarden`, `LetterHunt`, `WordBuilder`
- Cohort C: remaining camera games

### Acceptance Gates (Locked)

- No merge/closure claim without fresh command evidence.
- Feature-flag fallback must allow dot cursor path.
- Gameplay logic parity required (cursor embodiment only).

### Tracking
- Ticket: `TCK-20260223-910`
- Research/log index: `docs/GAME_LOGICAL_FINDINGS_AND_RESEARCH_2026-02-23.md`

### Phase 5 Progress Update (2026-02-23 13:19 IST)

- ✅ Cohort A completed:
  - `src/frontend/src/pages/ShapeSequence.tsx`
  - `src/frontend/src/pages/NumberTapTrail.tsx`
- Implementation detail: both pages now use `CursorEmbodiment` with `gameName` routing and dot fallback.
- Validation:
  - `cd src/frontend && npm run -s type-check` (pass)
  - `cd src/frontend && npm run -s lint` (pass)
  - `cd src/frontend && npm run -s test -- src/pages/__tests__/GamePages.smoke.test.tsx src/pages/__tests__/CameraRoutes.smoke.test.tsx src/components/game/__tests__/CursorEmbodiment.test.tsx src/components/game/__tests__/HandAvatarCursor.test.tsx` (pass)
- Next: Cohort B (`ColorMatchGarden`, `LetterHunt`, `WordBuilder`).
