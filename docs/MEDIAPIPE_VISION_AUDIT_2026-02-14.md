# MediaPipe Vision Audit — Advay Vision Learning

**Date**: 2026-02-14  
**Auditor**: AI Agent (Amp)  
**Ticket**: TCK-20260214-001  
**Prompt used**: Custom MediaPipe Vision Audit (6-phase)  
**Scope**: All MediaPipe pipelines, camera UX, tracking utilities, game integrations  
**App version**: Current `main` as of 2026-02-14  

---

## Table of Contents

1. [Phase 0: Target Group & Product Intent](#phase-0-target-group--product-intent)
2. [Phase 1: MediaPipe Implementation Map](#phase-1-mediapipe-implementation-map)
3. [Phase 2: UX State Audit](#phase-2-ux-state-audit)
4. [Phase 3: Capability Matrix](#phase-3-capability-matrix)
5. [Phase 4: Docs-to-Code Traceability](#phase-4-docs-to-code-traceability)
6. [Phase 5: Web Research & External Standards](#phase-5-web-research--external-standards)
7. [Phase 6: Recommendations](#phase-6-recommendations)
   - [Top 10 Must-Fix](#top-10-must-fix)
   - [Next 20 High-Leverage](#next-20-high-leverage)
   - [PR-by-PR Implementation Plan](#pr-by-pr-implementation-plan)
   - [Measurement Plan](#measurement-plan)

---

## Phase 0: Target Group & Product Intent

### TG Reality Sheet

| Dimension | Detail |
|---|---|
| **Primary users** | Children ages 2–8 (three bands: 3–4 Pre-K, 5–6 K-1, 7–8 Grade 2–3). Named for creator's child "Advay." |
| **Secondary users** | Parents — dashboard, settings, consent flows. |
| **Environment** | Home setting. Variable lighting (overhead, window glare, dim evening). Tablet or laptop. Seated at desk or table, often at non-ideal angles. |
| **Attention span** | 3–5 min (age 3–4), 5–8 min (5–6), 8–12 min (7–8). Per `docs/AGE_BANDS.md`. |
| **Motor control** | Limited. Imprecise finger movements, small hands (palm ~6–8 cm). Pinch gestures are hard for ages < 5. |
| **Literacy** | Cannot read (3–4), emerging/early (5–6), basic (7–8). Voice/icon cues are essential. |
| **Failure tolerance** | Very low. 2–3 consecutive failures trigger frustration → rage-quit. Need immediate positive reinforcement. |
| **Accessibility** | Large tap targets (≥ 48px), sound/voice cues, high contrast, motion sensitivity options, COPPA compliance. |
| **Success metrics** | Session length, task completion rate, letter/number mastery improvement, return rate (next-day, next-week). |

### Product: "What It's Supposed to Be" vs "What It Currently Is"

| Aspect | Vision (per docs) | Reality (per code) |
|---|---|---|
| Tracking pipelines | Hand + Face + Pose + Holistic + Segmentation | Hand (fully integrated), Face (hook only, dev page), Pose (hook only, dev page) |
| Games using camera | All camera games (~10) | 3 production games: FingerNumberShow, MusicPinchBeat, AlphabetGamePage |
| Input methods | 6 modes (Button, Pinch, Dwell, Two-Handed, Mouse, Touch) | 4 modes (Button, Pinch, Mouse, Touch). Dwell + Two-Handed not implemented. |
| Age adaptation | Per-band thresholds, session limits, adaptive difficulty | Fixed thresholds. No session limits enforced. No adaptive difficulty. |
| Parent features | Dashboard, progress, consent, camera controls | Dashboard exists. Camera toggle exists in settings. No session-limit enforcement. |
| Educational domains | 9 domains per `MEDIAPIPE_EDUCATIONAL_FEATURES.md` | 2 domains active (Numbers via FingerNumberShow, Letters via Alphabet games). Music partially. |

**Bottom line**: The hand-tracking pipeline is solid and well-engineered. Face and pose hooks are functional but not integrated into any production game. The gap between documented vision and shipped code is ~85%.

---

## Phase 1: MediaPipe Implementation Map

### Pipeline 1: HandLandmarker (PRIMARY — Fully Integrated)

**Status**: ✅ Production-ready with known gaps

| Component | File | Role | Evidence |
|---|---|---|---|
| Initialization hook | `src/frontend/src/hooks/useHandTracking.ts` | Centralized init. GPU→CPU fallback. Model from Google CDN (`hand_landmarker/float16/1`). Confidence: 0.3/0.3/0.3. | `Observed`: Lines 86–128, delegate loop with try/catch fallback. |
| Runtime loop | `src/frontend/src/hooks/useHandTrackingRuntime.ts` | Reads webcam frames, calls `detectForVideo`, dispatches `onFrame`. Uses `useGameLoop` at 30fps. | `Observed`: Lines 87–130, `useGameLoop` integration. |
| Frame builder | `src/frontend/src/utils/handTrackingFrame.ts` | Builds `TrackedHandFrame`: primary hand, raw/mirrored indexTip, pinch state. | `Observed`: Lines 66–102. |
| Pinch detection | `src/frontend/src/utils/pinchDetection.ts` | Hysteresis-based. Start: 0.05, Release: 0.07. Landmarks [4, 8] (thumb tip, index tip). | `Observed`: Lines 84–147. |
| Gesture recognition | `src/frontend/src/utils/gestureRecognizer.ts` | Class-based. 8 types: OPEN_PALM, FIST, THUMBS_UP/DOWN, POINT, OK_SIGN, PEACE_SIGN, ROCK_ON. Confidence + duration tracking. | `Observed`: Lines 140–335. |
| Finger counting | `src/frontend/src/games/fingerCounting.ts` | Multi-heuristic with palm center. Counts extended fingers per hand. | `Observed`: Referenced in FingerNumberShow. |
| Landmark normalization | `src/frontend/src/utils/landmarkUtils.ts` | Handles MediaPipe API shape drift (array vs object results). | `Observed`: Referenced in useHandTrackingRuntime. |
| Game loop | `src/frontend/src/hooks/useGameLoop.ts` | Accumulator pattern. FPS limiting via frame skipping. Configurable target FPS. | `Observed`: Lines 125–175. |
| Types | `src/frontend/src/types/tracking.ts` | Point, Landmark, PinchState, PinchResult, PinchOptions, UseHandTrackingOptions, UseGameLoopOptions, etc. | `Observed`: Referenced across all tracking files. |

**Games using HandLandmarker**:

| Game | File | Uses | Notes |
|---|---|---|---|
| FingerNumberShow | `src/frontend/src/games/FingerNumberShow.tsx` | `useHandTracking` + `useHandTrackingRuntime` + finger counting | Full integration. 4 difficulty levels + letter mode. |
| MusicPinchBeat | `src/frontend/src/games/MusicPinchBeat.tsx` | `useHandTracking` + `useHandTrackingRuntime` + pinch detection | Pinch-to-hit lanes. Uses indexTip for cursor. |
| AlphabetGamePage | `src/frontend/src/pages/AlphabetGamePage.tsx` | `useHandTracking` + pinch-to-draw | Draw letters with pinch gesture. |
| MediaPipeTest | `src/frontend/src/pages/MediaPipeTest.tsx` | `useHandTracking` + full landmark overlay | Dev/test page only. Full skeleton visualization. |

**Architecture flow**:

```
Camera (react-webcam / getUserMedia)
  → MediaPipe HandLandmarker.detectForVideo(video, timestamp)
    → landmarkUtils.getHandLandmarkLists(results)  // normalize API shape
      → handTrackingFrame.buildTrackedHandFrame({hands, pinchState, pinchOptions})
        ├── toMirroredPoint(primaryHand[8])  // indexTip for cursor
        ├── detectPinch(primaryHand, previousState)  // hysteresis
        └── TrackedHandFrame { hands, handCount, primaryHand, rawIndexTip, indexTip, pinch }
          → game-specific onFrame(frame, meta) callback
            → Canvas/DOM overlay rendering
```

### Pipeline 2: FaceLandmarker (Implemented, Underutilized)

**Status**: ⚠️ Hook exists, not used in any production game

| Component | File | Role | Evidence |
|---|---|---|---|
| Eye tracking hook | `src/frontend/src/hooks/useEyeTracking.ts` | Blink detection via Eye Aspect Ratio (EAR). Threshold 0.25. 200ms debounce. | `Observed`: Lines 59–114 (init), 117–228 (processVideoFrame). |

**Issues** (all `Observed`):

1. **No GPU→CPU fallback** — hardcoded `delegate: 'GPU'` (line 71). Will fail on older devices.
2. **Uncapped FPS** — uses raw `requestAnimationFrame` loop (line 228) with no throttle. Will consume excessive CPU.
3. **Redundant null check** — `faceLandmarkerRef.current` checked twice (lines 118, 121).
4. **Only used in MediaPipeTest** — no game integration.
5. **EAR threshold 0.25** — reasonable for adults, `Unknown` whether appropriate for children (larger eyes, different proportions).

### Pipeline 3: PoseLandmarker (Implemented, Underutilized)

**Status**: ⚠️ Hook exists, not used in any production game

| Component | File | Role | Evidence |
|---|---|---|---|
| Posture detection hook | `src/frontend/src/hooks/usePostureDetection.ts` | Shoulder alignment + spine curvature scoring. Throttled to 10fps. | `Observed`: Lines 35–78 (init), 81–121 (processFrame). |

**Issues** (all `Observed`):

1. **No GPU→CPU fallback** — hardcoded `delegate: 'GPU'` (line 46). Will fail silently on older devices.
2. **Stale closure in cleanup** — `poseLandmarker` referenced in `useEffect` cleanup (line 71) but not in dependency array (line 78). Will fail to close if landmarker changes.
3. **`startMonitoring` race condition** — checks `isMonitoring` (line 127) before the state update from `setIsMonitoring(true)` (line 126) has flushed. First call never starts rAF.
4. **No visual overlay** — no landmarks rendered; only data computed.
5. **Only used in MediaPipeTest** — no production integration.
6. **Alert thresholds not validated for children** — spine curvature + shoulder alignment thresholds are adult-biased. `Unknown` if suitable for child proportions.

### Model Loading & CDN

All three pipelines load models from Google CDN:

| Pipeline | Model URL | Size (approx) |
|---|---|---|
| HandLandmarker | `storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task` | ~5 MB |
| FaceLandmarker | `storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task` | ~4 MB |
| PoseLandmarker | `storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task` | ~3 MB |
| WASM runtime | `cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm` | ~2 MB |

**Risk**: All models loaded from external CDNs at runtime. No service worker caching. No preload hints. First-load latency on slow connections = poor UX (child staring at loading screen).

---

## Phase 2: UX State Audit

### Camera Permission Flow

| State | Component | What Happens | TG Issue |
|---|---|---|---|
| **Pre-permission** | `CameraPermissionPrompt.tsx` | Shows prompt with explanation, camera icon, "Start Camera" button. "Play with Touch Instead" fallback. Privacy notice present. | ✅ Good copy. Touch fallback is essential for young users. |
| **Permission denied** | `CameraPermissionPrompt.tsx` | Shows error message. **Auto-dismisses after 2 seconds.** | ❌ **2 seconds is too fast for a parent to read.** Parent may not be watching. No retry button. |
| **Permission granted** | Transitions to game | No calibration step. No distance check. No "hold your hand here" guidance. | ❌ **Child doesn't know if tracking is working.** First experience = confusion. |
| **Camera unavailable** | `NoCameraFallback.tsx` | Generic "Camera not available" message. **Wrong SVG icon (house icon, not camera).** No links to camera-free games. | ❌ **Dead end.** Child can't navigate to alternative games. Icon is confusing. |

### Game State Machine (Current vs Needed)

**Current** (all camera games):

```
[Menu] → [Playing] → [Menu]
              ↕
        [Celebration]
```

**Needed**:

```
[Menu] → [Calibrating] → [Playing] → [Menu]
                              ↕
                        [Celebration]
                              ↓
                     [Tracking Lost] → [Playing]  (auto-recovers when hand reappears)
                              ↓
                     [Degraded] → [Playing]  (low confidence, show hint)
```

### UX State Table

| State | Current Behavior | TG Impact | Needed Behavior |
|---|---|---|---|
| **No camera** | `NoCameraFallback` with wrong icon, no navigation | Child stuck on dead-end screen | Camera icon, "Try these games instead" links, parent instructions |
| **Permission denied** | Error auto-dismisses in 2s | Parent misses error | Persistent error with retry button, step-by-step browser instructions |
| **Loading model** | Spinner or disabled button | Child waits with no engagement | Progress indicator, fun animation, preload models in background |
| **Calibration** | Does not exist | Child doesn't know where to put hand | "Show your hand here" overlay with target zone, distance check |
| **Tracking active** | No visual confirmation | Child doesn't know if camera "sees" them | Subtle hand skeleton or confidence dot |
| **Hand lost (< 2s)** | Silently stops updating game state | Game appears frozen, child confused | "I can't see your hand" toast with arrow pointing to camera |
| **Hand lost (> 5s)** | Still silent | Child may have left, wasting resources | Pause game, show "Wave to continue!" overlay, stop rAF |
| **Low confidence** | No indication | Jittery cursor, false finger counts | "Move into the light" or "Move a bit further" hint |
| **Pinch too hard** | Pinch thresholds may not match small hands | Can't draw / interact | Adaptive thresholds per age band, or calibration pinch |
| **Too close** | No detection | MediaPipe fails (hand fills frame) | "Scoot back a little!" with arrow |
| **Too far** | Weak detection | Landmarks unreliable, jitter | "Come a bit closer!" with arrow |
| **Too dark** | No detection or low confidence | Silent failure | "Turn on a light!" with lightbulb icon |
| **Multiple children** | Picks first hand (primaryHand = hands[0]) | Unpredictable behavior in group play | Explicit "I see 2 hands!" message, or pick closest |
| **Session timeout** | Not enforced | Child plays indefinitely against AGE_BANDS.md rules | Gentle "Let's take a break!" per age-band limits |

### Overlay & Feedback Inventory

| Game | Webcam visible | Landmark overlay | Cursor/pointer | Count/target HUD | Celebration | Sound | TTS |
|---|---|---|---|---|---|---|---|
| FingerNumberShow | ✅ | ❌ | ❌ | ✅ (HUD component) | ✅ | ✅ | ✅ |
| MusicPinchBeat | ✅ | ❌ | ✅ (indexTip) | ✅ (lanes) | ✅ | ✅ | ❌ |
| AlphabetGamePage | ✅ | ❌ | ✅ (pinch draw) | ✅ (letter template) | ✅ | ✅ | ✅ |
| MediaPipeTest | ✅ | ✅ (full skeleton) | ❌ | ❌ (dev info) | ❌ | ❌ | ❌ |

**Key gap**: No production game renders any landmark visualization. The child gets no visual confirmation that the camera "sees" their hand.

---

## Phase 3: Capability Matrix

### A — Present (Ship-ready with polish)

| # | Capability | File(s) | TG Value |
|---|---|---|---|
| A1 | Centralized hand tracking init with GPU→CPU fallback | `useHandTracking.ts` | Reliable startup across devices |
| A2 | Pinch detection with hysteresis | `pinchDetection.ts` | Stable draw/select interactions |
| A3 | Gesture recognition (8 types) | `gestureRecognizer.ts` | Foundation for gesture-based games |
| A4 | Finger counting (multi-heuristic) | `fingerCounting.ts` | Core of number learning game |
| A5 | Game loop with FPS control | `useGameLoop.ts` | Consistent 30fps across devices |
| A6 | Camera permission flow | `CameraPermissionPrompt.tsx` | Parent-friendly consent |
| A7 | Touch fallback | `CameraPermissionPrompt.tsx` | Works without camera |
| A8 | TTS for prompts | `useTTS.ts` | Non-readers can hear instructions |
| A9 | Sound effects + celebration | `useSoundEffects.ts`, `CelebrationOverlay.tsx` | Positive reinforcement |
| A10 | Landmark normalization (API drift) | `landmarkUtils.ts` | Robustness across MP versions |
| A11 | Settings store with camera toggle | `settingsStore.ts` | Parent control |

### B — Possible via Small Changes (1–3 day PRs)

| # | Capability | Files to Touch | TG Value | Effort |
|---|---|---|---|---|
| B1 | Temporal smoothing (One-Euro or EMA filter) | New `utils/landmarkSmoother.ts`, modify `handTrackingFrame.ts` | Eliminates cursor jitter — critical for drawing and pointing games | 1 day |
| B2 | Confidence gating (min quality threshold) | Modify `useHandTrackingRuntime.ts`, add confidence field to `TrackedHandFrame` | Prevents false counts/gestures when hand is partially visible | 0.5 day |
| B3 | "Hand lost" UI state | New `components/TrackingLostOverlay.tsx`, modify game components | Child knows camera lost their hand, reduces confusion | 1 day |
| B4 | Calibration check on game start | New `components/CalibrationOverlay.tsx` | Ensures child is at right distance/lighting before play | 1.5 days |
| B5 | GPU→CPU fallback for face/pose hooks | Modify `useEyeTracking.ts`, `usePostureDetection.ts` | Same robustness as hand tracking | 0.5 day |
| B6 | Throttle eye tracking to 10–15fps | Modify `useEyeTracking.ts` | Prevents CPU burn | 0.5 day |
| B7 | Landmark overlay in production games | New `components/HandSkeletonOverlay.tsx`, modify game components | Child sees "the camera sees me" — builds trust | 1 day |
| B8 | Age-band threshold adaptation | Modify `pinchDetection.ts`, `gestureRecognizer.ts`, `fingerCounting.ts` | Small hands work better. Wider thresholds for younger kids. | 1 day |
| B9 | Fix NoCameraFallback icon + add game links | Modify `NoCameraFallback.tsx` | Not a dead end | 0.5 day |
| B10 | Fix permission error auto-dismiss + add retry | Modify `CameraPermissionPrompt.tsx` | Parent can read error, retry | 0.5 day |
| B11 | Model preloading / caching | Add service worker, modify `useHandTracking.ts` | Faster second load, offline model availability | 1.5 days |
| B12 | Session time limits per age band | New `hooks/useSessionTimer.ts`, modify game wrappers | Enforce `AGE_BANDS.md` rules | 1 day |
| B13 | Distance/lighting heuristics | Analyze landmark spread + confidence in `handTrackingFrame.ts` | "Move closer/further" and "more light" hints | 1 day |
| B14 | Progressive difficulty ramping | Modify `FingerNumberShow.tsx`, add scoring heuristic | Auto-level-up after N successes, auto-level-down after N failures | 1 day |

### C — Possible via New Pipelines (1–2 week projects)

| # | Capability | Pipeline | TG Value | Effort |
|---|---|---|---|---|
| C1 | Image segmentation (background blur/replace) | `ImageSegmenter` | Visual fun, privacy (hide messy room), focus child attention on hands | 1 week |
| C2 | Object detection (scavenger hunt game) | `ObjectDetector` | "Find something red!" — connects physical world to learning | 1–2 weeks |
| C3 | Face expression matching | `FaceLandmarker` (existing) + expression analysis | Emotion learning, social skills, engagement detection | 1 week |
| C4 | Custom gesture classifier | Model Maker + `GestureRecognizer` | ASL letters, custom learning gestures | 2 weeks |
| C5 | Holistic landmarker (hand + face + pose unified) | `HolisticLandmarker` | Full-body interactive games, dance/movement | 2 weeks |

---

## Phase 4: Docs-to-Code Traceability

### Traceability Table

| Document | Claims | Code Reality | Gap | Severity |
|---|---|---|---|---|
| `docs/MEDIAPIPE_EDUCATIONAL_FEATURES.md` | 9 educational domains, dozens of features including ASL, body movement, posture monitoring, emotion recognition | < 5% implemented. Only finger counting + pinch + basic gesture exist. | ~95% gap | LOW (aspirational roadmap) |
| `docs/architecture/HAND_TRACKING_ARCHITECTURE.md` | Describes future `useHandTracking` hook with fallback | Hook exists and works. Doc describes it as "planned." | **Doc is stale — code is ahead of docs.** | MEDIUM (misleading for new contributors) |
| `docs/architecture/CAMERA_INTEGRATION_GUIDE.md` | Camera setup, permissions, constraints, fallback | Accurately describes current implementation. | ✅ No gap | — |
| `docs/AGE_BANDS.md` | 3 age bands with session time limits (3–5 min, 5–8 min, 8–12 min), break reminders, stop conditions | **Not enforced anywhere in code.** No session timer exists. No break reminders. | 100% gap | HIGH (core TG requirement) |
| `docs/INPUT_METHODS_SPECIFICATION.md` | 6 input modes: A (Button Toggle), B (Pinch), C (Dwell), D (Two-Handed), E (Mouse), F (Touch) | Modes A, B, E, F implemented. **Dwell (C) and Two-Handed (D) not implemented.** | 33% gap | MEDIUM (Dwell is important for younger kids who can't pinch) |
| `docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md` | Describes centralization plan for hand tracking | Plan was executed. `useHandTracking` + `useHandTrackingRuntime` exist. | ✅ Code matches (doc could note completion) | LOW |
| `docs/RESEARCH_GESTURE_CONTROL_SYSTEM.md` | Describes gesture control architecture | `GestureRecognizer` class exists and implements it. | ✅ Code matches | LOW |

### Key Stale Docs Needing Update

1. **`HAND_TRACKING_ARCHITECTURE.md`** — Describes hook as "planned"; it's shipped. Update to "implemented" with current API.
2. **`MEDIAPIPE_EDUCATIONAL_FEATURES.md`** — Mark each feature as IMPLEMENTED / PLANNED / NOT STARTED to set accurate expectations.
3. **`AGE_BANDS.md`** — Add "NOT YET ENFORCED IN CODE" banner until session timer is built.

---

## Phase 5: Web Research & External Standards

### MediaPipe Latest Findings

| Finding | Source | Impact on This App |
|---|---|---|
| **Smoothing removed from Task APIs** — client must implement temporal smoothing | [medium.com/@debasishraut.dev](https://medium.com/@debasishraut.dev) | Explains cursor jitter in drawing/pointing games. Must add One-Euro or EMA filter. |
| **One-Euro filter** — best practice for interactive landmark smoothing (low latency, adaptive) | [gery.casiez.net/1euro](https://gery.casiez.net/1euro/) | Recommended over simple EMA for cursor-like use (responds quickly to fast moves, smooths slow moves). |
| **LIVE_STREAM mode** — alternative to VIDEO mode, handles timing internally | MediaPipe docs | Could simplify `useHandTrackingRuntime` but VIDEO mode works fine with current game loop. Low priority. |
| **Model Maker** — create custom gesture recognizers from training data | MediaPipe docs | Path to ASL letter recognition (C4 capability). |
| **WebGPU support** — emerging in Chrome, potential 2–3x speedup | Chrome Platform Status | Future opportunity. Current GPU delegate uses WebGL. |

### Kid UX Research

| Principle | Source | Current Status | Action |
|---|---|---|---|
| **Every action = visible + audible feedback** | [uxdesign.cc/Rubens Cantuni](https://uxdesign.cc/) | Celebration exists ✅, but tracking-active/lost has no feedback ❌ | Add visual tracking indicator |
| **Avoid sensitive triggers (accidental taps)** | Same | Touch fallback exists ✅, but some buttons are small ❌ | Audit all interactive elements for 48px min |
| **Settings behind parent gates** | Same | Settings page exists but no gate ❌ | Add simple parent gate (e.g., "slide to unlock" or math problem) |
| **Minimize loading / launch immediately** | [uxmag.com/Karina Ibarra](https://uxmag.com/) | Model loading blocks game start ❌ | Preload models on app mount, or show engaging loading animation |
| **Age-matched challenge/reward** | Same | Fixed difficulty per level, no adaptation ❌ | Add adaptive difficulty (B14) |
| **Large targets, forgiving touch areas** | Same | Mostly good, some icons small ❌ | Audit hit targets |
| **2–3 need guidance, 4–5 enjoy challenges, 6+ want to win** | Same | No age-differentiated UX ❌ | Use age-band from settings to adjust prompts/difficulty |

### COPPA Compliance Check

| Requirement | Status | Notes |
|---|---|---|
| No data collection from < 13 without parental consent | ✅ `Observed` | No user accounts, no data sent to servers. All processing client-side. |
| Camera data not stored | ✅ `Observed` | Video frames processed in-memory only. No recording. |
| Privacy notice present | ✅ `Observed` | `CameraPermissionPrompt.tsx` includes privacy text. |
| Camera indicator when active | ⚠️ Partial | Browser shows camera indicator. App does not show its own. |
| Easy to stop camera | ✅ `Observed` | Games have stop button. Settings has camera toggle. |

---

## Phase 6: Recommendations

### Top 10 Must-Fix

These are issues that directly cause child frustration, parent confusion, or tracking failure. Each connects to a TG need, a model signal, and a concrete UI behavior.

| # | Issue | TG Need | Model Signal | UI Behavior | File(s) | Effort |
|---|---|---|---|---|---|---|
| **M1** | **No temporal smoothing — cursor jitter in drawing/pointing** | Children's imprecise hand movements amplified by raw landmarks → wobbly lines, erratic cursor | Raw `landmark.x/y` passed through `toMirroredPoint()` without filtering | Add One-Euro filter to `buildTrackedHandFrame()`. Smooth `indexTip` and `rawIndexTip` outputs. All games using `TrackedHandFrame.indexTip` benefit automatically. | New `utils/oneEuroFilter.ts`, modify `handTrackingFrame.ts` | 1 day |
| **M2** | **No "hand lost" state — game silently freezes** | Child thinks game is broken when hand leaves frame. 2–3 "broken" moments → quit. | `handCount === 0` in `TrackedHandFrame` — no consumer acts on it | Add `TrackingStatusOverlay` component. When `handCount === 0` for > 1.5s, show "I can't see your hand! 👋" with wave animation. Auto-dismiss when hand returns. | New `components/TrackingStatusOverlay.tsx`, modify `FingerNumberShow.tsx`, `MusicPinchBeat.tsx`, `AlphabetGamePage.tsx` | 1 day |
| **M3** | **Camera permission error auto-dismisses in 2 seconds** | Parent may not be watching. Error disappears before they can read it. No retry path. | N/A (UI-only) | Change to persistent error with retry button. Add step-by-step browser instructions (Chrome, Safari, Firefox). Remove `setTimeout` auto-dismiss. | Modify `CameraPermissionPrompt.tsx` | 0.5 day |
| **M4** | **NoCameraFallback has wrong icon and no navigation** | Child on device without camera sees dead-end screen with confusing house icon | N/A (UI-only) | Replace house SVG with camera-off icon. Add "Try these games!" section linking to touch/mouse games (ConnectTheDots, NumberTapTrail, etc.). | Modify `NoCameraFallback.tsx` | 0.5 day |
| **M5** | **No calibration step — child doesn't know if tracking works** | First-time user sees webcam but no confirmation tracking is active. Starts playing with hand in wrong position. | `HandLandmarker` confidence and `handCount` available but not shown pre-game | Add pre-game calibration overlay: "Show your hand here!" with target zone. Check distance (landmark spread heuristic) and lighting (confidence > threshold). Green checkmark when ready. | New `components/CalibrationOverlay.tsx`, integrate into camera game wrappers | 1.5 days |
| **M6** | **Eye tracking hook runs at uncapped FPS** | Burns CPU/GPU. Device heats up. Other hooks slow down. Battery drain on laptop. | `requestAnimationFrame` loop with no frame skip (line 228) | Add frame interval throttle (target 10–15fps). Use same accumulator pattern as `useGameLoop`. | Modify `useEyeTracking.ts` | 0.5 day |
| **M7** | **Face/Pose hooks have no GPU→CPU fallback** | Older devices fail silently. Parent sees error once, gives up. | `delegate: 'GPU'` hardcoded in both hooks | Apply same fallback pattern from `useHandTracking.ts`: try GPU, catch, retry CPU. Log which succeeded. | Modify `useEyeTracking.ts`, `usePostureDetection.ts` | 0.5 day |
| **M8** | **Pinch thresholds not calibrated for small hands** | Children ages 3–5 have smaller hands (~6 cm palm). Normalized landmark distances are proportionally larger → pinch harder to trigger/release. | `startThreshold: 0.05, releaseThreshold: 0.07` hardcoded in `pinchDetection.ts` | Add age-band-aware defaults. Pre-K (3–4): start 0.07, release 0.09. K-1 (5–6): start 0.06, release 0.08. Grade 2–3 (7–8): current values. Source thresholds from settings store age band. | Modify `pinchDetection.ts`, `settingsStore.ts` | 1 day |
| **M9** | **Session time limits from `AGE_BANDS.md` not enforced** | Child plays indefinitely. Eye strain, fatigue, loss of learning effectiveness. Violates own documented standards. | N/A (behavioral) | New `useSessionTimer` hook. Reads age band from settings. Shows gentle "Let's take a break!" overlay at limit. Parent can extend. Log session duration for progress tracking. | New `hooks/useSessionTimer.ts`, new `components/BreakTimeOverlay.tsx`, integrate into game wrappers | 1 day |
| **M10** | **No landmark visualization in production games** | Child never sees "the camera sees my hand." Tracking feels like magic that randomly works/breaks. No trust-building. | Full skeleton data available in `TrackedHandFrame.primaryHand` (21 landmarks) | Add optional `HandSkeletonOverlay` component. Render simplified hand outline (5 fingertips + wrist connected by lines). Toggle via settings (`showTrackingOverlay`). Default ON for first 3 sessions, then OFF. | New `components/HandSkeletonOverlay.tsx`, modify game components, modify `settingsStore.ts` | 1 day |

### Next 20 High-Leverage

| # | Enhancement | TG Need | Model Signal | UI Behavior | Files | Effort |
|---|---|---|---|---|---|---|
| H1 | **Distance heuristic** — detect too-close / too-far | Small children sit at random distances | Landmark spread (palm width in normalized coords): < 0.05 = too far, > 0.35 = too close | "Scoot back!" / "Come closer!" arrow overlay | `handTrackingFrame.ts`, new `utils/distanceHeuristic.ts` | 1 day |
| H2 | **Lighting heuristic** — detect too dark | Variable home lighting | Average confidence score from `HandLandmarker` results | "Turn on a light! 💡" overlay when confidence < 0.5 for > 3 seconds | `useHandTrackingRuntime.ts`, `TrackingStatusOverlay.tsx` | 0.5 day |
| H3 | **Adaptive difficulty** | 2–3 failures = frustration, too-easy = boredom | Track consecutive successes/failures in game state | Auto-level-down after 3 consecutive failures. Auto-level-up after 5 consecutive successes. Visual "Level Up!" celebration. | Modify `FingerNumberShow.tsx`, add `useAdaptiveDifficulty.ts` | 1 day |
| H4 | **Dwell input mode** (from INPUT_METHODS_SPECIFICATION.md Mode C) | Young children (3–4) can't pinch | `indexTip` position held steady for > 1.5s over a target | Target fills with color radially (progress ring), triggers on complete | New `utils/dwellDetection.ts`, new `components/DwellTarget.tsx` | 1.5 days |
| H5 | **Model preloading on app mount** | First game load takes 3–5s (model download) | N/A (network) | Preload hand model WASM + weights on first app mount (background). Cache in service worker. Subsequent loads instant. | New `utils/modelPreloader.ts`, modify `App.tsx`, add service worker | 1.5 days |
| H6 | **Posture detection integration** | Children slouch during long sessions → back pain, eye strain | Pose landmarks from existing `usePostureDetection.ts` | Gentle posture reminder every 5 minutes if posture score < 0.7. Friendly character says "Sit up tall like a giraffe! 🦒" | Modify `usePostureDetection.ts`, new `components/PostureReminder.tsx`, integrate into game wrappers | 1.5 days |
| H7 | **Blink detection integration** (face tracking in games) | Engagement metric + "Blink Break" game | EAR from existing `useEyeTracking.ts` | New mini-game: "Blink to pop bubbles!" Accessibility: detect fatigue (low blink rate = screen fatigue warning). | Modify `useEyeTracking.ts`, new game component | 2 days |
| H8 | **Confidence dot overlay** | Child/parent wants to know tracking quality | `HandLandmarker` confidence score | Small colored dot in corner: 🟢 (good) 🟡 (okay) 🔴 (poor). Tooltip on hover for parent. | New `components/ConfidenceDot.tsx`, integrate into game wrappers | 0.5 day |
| H9 | **Parent gate for settings** | Child changes settings (difficulty, camera off) accidentally | N/A (UX pattern) | Simple gate: "What's 3 + 4?" or "Slide to unlock" before entering settings | Modify `Settings.tsx` or settings route guard | 0.5 day |
| H10 | **Gesture-based game navigation** | Hands-free UX — child's hands are already up | `GestureRecognizer` detects OPEN_PALM, THUMBS_UP, POINT | OPEN_PALM (2s hold) = start game. THUMBS_UP = next. POINT = select. Overlay shows detected gesture with emoji. | Modify game menus, add `useGestureNavigation.ts` | 2 days |
| H11 | **Two-handed input mode** (Mode D) | Duo Mode in FingerNumberShow already supports 2 hands for counting, but no two-handed gestures | `hands.length === 2` in `TrackedHandFrame` | "Clap to start!" detection (both palms close together). "Spread wide to celebrate!" (both hands open, far apart). | New `utils/twoHandGestures.ts` | 1 day |
| H12 | **Error boundary for MediaPipe crashes** | MediaPipe WASM can segfault on malformed video | `try/catch` in `useHandTrackingRuntime` catches per-frame errors but not init crashes | React error boundary around camera games. Shows "Oops! Let's try again" with restart button. Logs error for debugging. | New `components/TrackingErrorBoundary.tsx` | 1 day |
| H13 | **Finger counting threshold adaptation per age** | Small hands have different proportions (shorter fingers relative to palm) | `extensionThreshold` and thumb heuristics in `fingerCounting.ts` | Widen extension threshold for ages 3–4 (fingers are stubbier). Source age band from settings. | Modify `fingerCounting.ts`, `settingsStore.ts` | 0.5 day |
| H14 | **Update stale architecture docs** | New contributors misled by outdated docs | N/A | Update `HAND_TRACKING_ARCHITECTURE.md` to reflect implemented hooks. Mark features in `MEDIAPIPE_EDUCATIONAL_FEATURES.md` as IMPLEMENTED/PLANNED/NOT STARTED. | Modify doc files | 0.5 day |
| H15 | **Gesture confidence visualization** | GestureRecognizer detects but user doesn't see confidence | `GestureResult.confidence` and `holdProgress` | Show gesture emoji + progress ring that fills based on `holdProgress`. Satisfying visual when gesture "locks in." | New `components/GestureConfidenceRing.tsx` | 1 day |
| H16 | **Camera indicator in app** | COPPA — app should show its own "camera active" indicator | N/A | Small pulsing 🔴 dot + "Camera on" text when camera is active. Matches browser indicator but is in-app visible. | New `components/CameraActiveIndicator.tsx` | 0.5 day |
| H17 | **Multi-child detection** | Siblings crowd the camera | `hands.length > expectedMaxHands` or multiple face landmarks | "I see too many hands! One player at a time 😊" message. Or: explicit "2 player mode" selection. | Modify `useHandTrackingRuntime.ts`, add overlay | 0.5 day |
| H18 | **Landmark recording for debugging** | Parent reports "tracking doesn't work" — no way to reproduce | All landmark data available in memory | Dev mode: record last 30 seconds of landmark data to JSON. Button in settings (behind parent gate). | New `utils/landmarkRecorder.ts`, modify settings | 1 day |
| H19 | **Background model loading with progress** | "Loading..." is boring for a 4-year-old | Model download progress from fetch | Animated character "waking up" as model loads. Progress bar styled as caterpillar/snake. Sound effect on ready. | Modify `useHandTracking.ts` (add progress callback), new loading component | 1.5 days |
| H20 | **Posture detection cleanup: fix stale closure + startMonitoring race** | Production bug if posture detection is ever integrated | `poseLandmarker` not in cleanup deps; `isMonitoring` state race | Add `poseLandmarker` to `useEffect` deps. Use ref for immediate `isMonitoring` check in `startMonitoring`. | Modify `usePostureDetection.ts` | 0.5 day |

### PR-by-PR Implementation Plan

Ordered by impact-to-effort ratio, with dependency chains respected.

#### Sprint 1: Foundation (Week 1) — "Stop the Bleeding"

| PR | Items | Dependencies | Files | Est. |
|---|---|---|---|---|
| **PR-1: Temporal smoothing** | M1 | None | New `utils/oneEuroFilter.ts`, modify `handTrackingFrame.ts` | 1 day |
| **PR-2: Camera UX fixes** | M3, M4, M9 | None | Modify `CameraPermissionPrompt.tsx`, `NoCameraFallback.tsx` | 1 day |
| **PR-3: Tracking status overlay** | M2 | None | New `components/TrackingStatusOverlay.tsx`, modify 3 game files | 1 day |
| **PR-4: Eye/Pose hook hardening** | M6, M7, H20 | None | Modify `useEyeTracking.ts`, `usePostureDetection.ts` | 1 day |

#### Sprint 2: Child Experience (Week 2) — "Make It Work for Kids"

| PR | Items | Dependencies | Files | Est. |
|---|---|---|---|---|
| **PR-5: Calibration overlay** | M5 | PR-1 (smoothing makes calibration more reliable) | New `components/CalibrationOverlay.tsx`, modify game wrappers | 1.5 days |
| **PR-6: Age-band thresholds** | M8, H13 | None | Modify `pinchDetection.ts`, `fingerCounting.ts`, `settingsStore.ts` | 1 day |
| **PR-7: Landmark overlay** | M10 | PR-1 (smoothed landmarks look better) | New `components/HandSkeletonOverlay.tsx`, modify game components, `settingsStore.ts` | 1 day |
| **PR-8: Session timer** | M9 | None | New `hooks/useSessionTimer.ts`, new `components/BreakTimeOverlay.tsx` | 1 day |

#### Sprint 3: Polish (Week 3) — "Make It Delightful"

| PR | Items | Dependencies | Files | Est. |
|---|---|---|---|---|
| **PR-9: Distance + lighting heuristics** | H1, H2 | PR-3 (uses TrackingStatusOverlay) | New `utils/distanceHeuristic.ts`, modify `handTrackingFrame.ts`, `useHandTrackingRuntime.ts` | 1 day |
| **PR-10: Adaptive difficulty** | H3 | None | New `hooks/useAdaptiveDifficulty.ts`, modify `FingerNumberShow.tsx` | 1 day |
| **PR-11: Confidence dot + camera indicator** | H8, H16 | None | New `components/ConfidenceDot.tsx`, `components/CameraActiveIndicator.tsx` | 1 day |
| **PR-12: Model preloading** | H5 | None | New `utils/modelPreloader.ts`, service worker, modify `App.tsx` | 1.5 days |

#### Sprint 4: Expand (Week 4) — "New Interactions"

| PR | Items | Dependencies | Files | Est. |
|---|---|---|---|---|
| **PR-13: Dwell input mode** | H4 | PR-1 (smoothing needed for steady dwell) | New `utils/dwellDetection.ts`, `components/DwellTarget.tsx` | 1.5 days |
| **PR-14: Parent gate + error boundary** | H9, H12 | None | New `components/TrackingErrorBoundary.tsx`, modify `Settings.tsx` | 1 day |
| **PR-15: Gesture navigation** | H10 | None | New `hooks/useGestureNavigation.ts`, modify game menus | 2 days |
| **PR-16: Doc updates** | H14 | After Sprint 1–3 (code must be stable) | Modify `HAND_TRACKING_ARCHITECTURE.md`, `MEDIAPIPE_EDUCATIONAL_FEATURES.md`, `AGE_BANDS.md` | 0.5 day |

#### Future Sprints: New Pipelines (C-tier)

| PR | Items | Dependencies | Est. |
|---|---|---|---|
| PR-17: Posture reminders in games | H6 | PR-4 (hardened pose hook) | 1.5 days |
| PR-18: Blink game | H7 | PR-4 (throttled eye hook) | 2 days |
| PR-19: Image segmentation | C1 | None | 1 week |
| PR-20: Object detection game | C2 | None | 1–2 weeks |
| PR-21: Custom gesture classifier | C4 | Model Maker setup | 2 weeks |

### Measurement Plan

Each Must-Fix and High-Leverage item should be validated against concrete metrics:

#### Tracking Quality Metrics (instrument in code)

| Metric | How to Measure | Target | Baseline (est.) |
|---|---|---|---|
| **Landmark jitter** | Standard deviation of `indexTip.x` over 30 frames when hand is stationary | < 0.005 normalized | ~0.02 (no smoothing) |
| **Pinch false positive rate** | Count of `transition === 'start'` events per minute when user is NOT intending to pinch | < 2/min | `Unknown` |
| **Pinch false negative rate** | Count of intended pinches that don't register (manual QA with 3–6 year old) | < 5% | `Unknown` |
| **Finger count accuracy** | Percentage of frames where detected count matches actual fingers shown (manual QA) | > 95% for ages 5+ | `Unknown` |
| **Hand detection latency** | Time from hand entering frame to first `handCount > 0` | < 300ms | ~200ms (`Inferred` from MediaPipe benchmarks) |
| **Model load time** | Time from `initialize()` call to `isReady === true` | < 3s (cached), < 8s (first load) | ~5s first load (`Inferred`) |
| **Frame processing time** | `performance.now()` delta around `detectForVideo()` | < 20ms at 30fps target | ~12ms GPU, ~30ms CPU (`Inferred`) |

#### UX Metrics (instrument via analytics events)

| Metric | How to Measure | Target | Baseline |
|---|---|---|---|
| **Session duration** | Time from game start to game stop, per age band | Within ±2 min of AGE_BANDS.md targets | `Unknown` (no session tracking) |
| **Task completion rate** | Successful matches / total attempts in FingerNumberShow | > 80% within 3 attempts per target | `Unknown` |
| **Tracking-lost frequency** | Count of `handCount === 0` events > 1.5s per session | < 3 per 5-min session | `Unknown` |
| **Camera permission grant rate** | Grants / (Grants + Denials + Dismissals) | > 70% | `Unknown` |
| **Touch fallback usage** | Sessions using touch vs camera | < 30% (camera should be preferred) | `Unknown` |
| **Return rate** | Users who return within 7 days | > 40% | `Unknown` |
| **Frustration signal** | Rapid repeated taps, game quits within 30s of start | < 10% of sessions | `Unknown` |

#### QA Test Protocol

For each PR, perform these tests with a real child (or simulate child behavior):

1. **Distance test**: Hold hand at 20cm, 40cm, 60cm, 80cm from camera. Record tracking quality at each.
2. **Lighting test**: Test in bright room, dim room, backlit (window behind).
3. **Small hand test**: Use a child's hand (or simulate with partially closed adult hand).
4. **Quick movement test**: Wave hand rapidly. Check for lost tracking.
5. **Multi-hand test**: Put two hands in frame. Verify correct primary hand selection.
6. **Recovery test**: Remove hand, wait 3 seconds, return hand. Verify game resumes.
7. **Permission test**: Deny camera, verify error message persists and retry works.
8. **Fallback test**: Test on device without camera. Verify NoCameraFallback shows correct icon and links.

---

## Appendix A: File Inventory

All files involved in MediaPipe vision tracking:

### Hooks

| File | Purpose | Pipeline |
|---|---|---|
| `src/frontend/src/hooks/useHandTracking.ts` | Hand landmarker init + fallback | Hand |
| `src/frontend/src/hooks/useHandTrackingRuntime.ts` | Per-frame hand tracking loop | Hand |
| `src/frontend/src/hooks/useGameLoop.ts` | rAF loop with FPS control | Shared |
| `src/frontend/src/hooks/useEyeTracking.ts` | Face landmarker + blink detection | Face |
| `src/frontend/src/hooks/usePostureDetection.ts` | Pose landmarker + posture scoring | Pose |

### Utilities

| File | Purpose | Pipeline |
|---|---|---|
| `src/frontend/src/utils/handTrackingFrame.ts` | Frame builder (TrackedHandFrame) | Hand |
| `src/frontend/src/utils/pinchDetection.ts` | Pinch with hysteresis | Hand |
| `src/frontend/src/utils/gestureRecognizer.ts` | 8-gesture recognition | Hand |
| `src/frontend/src/utils/landmarkUtils.ts` | API shape normalization | Hand |
| `src/frontend/src/games/fingerCounting.ts` | Multi-heuristic finger counter | Hand |

### Types

| File | Purpose |
|---|---|
| `src/frontend/src/types/tracking.ts` | Point, Landmark, PinchState, PinchResult, PinchOptions, UseHandTrackingOptions, UseGameLoopOptions, TrackedHandFrame types |

### Components (Camera UX)

| File | Purpose |
|---|---|
| `src/frontend/src/components/CameraPermissionPrompt.tsx` | Permission request UI |
| `src/frontend/src/components/NoCameraFallback.tsx` | No-camera fallback UI |
| `src/frontend/src/components/CelebrationOverlay.tsx` | Success celebration |
| `src/frontend/src/components/GameContainer.tsx` | Game wrapper with header |
| `src/frontend/src/components/GameControls.tsx` | Standardized game controls |

### Games (Camera-based)

| File | Pipeline Used |
|---|---|
| `src/frontend/src/games/FingerNumberShow.tsx` | Hand (counting) |
| `src/frontend/src/games/MusicPinchBeat.tsx` | Hand (pinch + cursor) |
| `src/frontend/src/pages/AlphabetGamePage.tsx` | Hand (pinch-to-draw) |
| `src/frontend/src/pages/MediaPipeTest.tsx` | Hand + Face + Pose (dev only) |

### Settings

| File | Relevant Flags |
|---|---|
| `src/frontend/src/store/settingsStore.ts` | `cameraEnabled`, `handTrackingDelegate`, `showHints` |

---

## Appendix B: Evidence Labels

All factual claims in this audit use the following evidence discipline:

- **`Observed`**: Directly verified from source code file contents or command output.
- **`Inferred`**: Logically implied from observed facts (e.g., "if this function is never called, feature is unused").
- **`Unknown`**: Cannot be determined without runtime testing or user research (marked explicitly).

No claim has been upgraded from `Inferred` to `Observed` without direct verification.

---

## Appendix C: Glossary

| Term | Definition |
|---|---|
| **EAR** | Eye Aspect Ratio — ratio of vertical to horizontal eye landmark distances. Used to detect blinks. |
| **Hysteresis** | Using different thresholds for state entry vs exit to prevent flickering. |
| **One-Euro filter** | Adaptive low-pass filter that smooths slow movements more than fast ones. Ideal for cursor smoothing. |
| **EMA** | Exponential Moving Average — simpler smoothing filter. Less adaptive than One-Euro. |
| **TrackedHandFrame** | Data structure containing processed hand landmarks, indexTip (raw + mirrored), pinch state for one frame. |
| **rAF** | `requestAnimationFrame` — browser API for animation loops synced to display refresh rate. |
| **Accumulator pattern** | Technique for FPS limiting: accumulate time each rAF, only execute game logic when enough time has passed. |
| **Delegate** | MediaPipe execution backend: GPU (WebGL) or CPU (WASM). |
| **COPPA** | Children's Online Privacy Protection Act — US law regulating data collection from children under 13. |

---

*End of audit. Next action: Create worklog ticket TCK-20260214-001 and begin PR-1 (temporal smoothing).*
