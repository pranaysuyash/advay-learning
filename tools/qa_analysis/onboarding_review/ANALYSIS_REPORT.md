# Onboarding & Alphabet Tracing — Video Analysis Report

**Source:** `~/Desktop/1.mov` (132MB, 2:23, 2306×1042 @ 60fps)
**Compressed:** `1_compressed.mp4` (8.8MB, 1280×578, CRF 23)
**Date:** 2026-03-17
**Analyst:** Amp (frame-by-frame analysis at 2fps = 287 frames)

---

## Timeline Summary

| Time | Screen | Notes |
|------|--------|-------|
| 0:00 | Welcome modal ("Learn with Your Hands!") | Pip mascot intro |
| 0:02 | "Activate Magic Vision!" modal | Camera permission + preview |
| 0:07 | Still on Magic Vision | User stays ~5s here |
| 0:10 | "The Pinch Gesture" tutorial | Pinch = Draw / Open = Stop |
| 0:17 | Click "Start Playing!" → dashboard loads | |
| 0:20 | Dashboard — "Number Catch" demo briefly shows | Rapid transition |
| 0:25 | Dashboard — "For You / Trending" section | Browsing game cards |
| 0:30 | Games grid — scrolling through games | |
| 0:35-0:50 | Explore / Games pages — browsing | Multiple placeholder icons visible |
| 0:55 | Progress page | Shows 47% complete, 68/100 avg |
| 1:00 | Back to Games — "Play & Discover" | Browsing categories |
| 1:05 | Alphabet Tracing — "How to Play" Step 1 | Camera access — "Trying..." button |
| 1:10 | Step 1 → Step 2: "Show Your Hands" | VoiceButton shows "Speaking..." |
| 1:15 | Step 2 → Step 3: "Pinch Your Fingers" | "Speaking..." button visible |
| 1:20 | "Trace with Your Finger!" overlay | |
| 1:25 | Still on trace overlay | User doesn't dismiss for ~10s |
| 1:30 | "Ready to Learn?" language modal | English selected |
| 1:40 | Switched to Telugu alphabet "అ" | **Broken image placeholder** visible |
| 1:45 | Back to English, starts tracing | |
| 1:50 | Hand seen — "pinch to draw" status | Tracing begins |
| 2:00 | Active tracing — red brush strokes | Strokes wildly outside letter bounds |
| 2:10 | Continues tracing — accuracy still 0% | |
| 2:19 | "Show your hand to start" — hand lost | |
| 2:23 | End of recording — accuracy still 0% | |

---

## 🔴 Critical Issues (P0)

### 1. TTS/Voiceover Lags Behind Screen Transitions (USER REPORTED)

**Evidence:** At ~1:10-1:15, the VoiceButton shows "Speaking..." while the user has already moved to the next step. The Mascot component has a **400ms debounce** + **1500ms rate-limit** (`Mascot.tsx:184-196`), so when a user clicks through steps quickly, TTS from the previous step is still playing (or just starting) when the new step renders.

**Root cause (code-level):**
- `Mascot.tsx:184` — 400ms `setTimeout` debounce before speaking
- `Mascot.tsx:191` — 1500ms rate-limit (`if now - lastSpokenAt < 1500 return`)
- `TTSService.speak()` calls `this.stop()` first, but the Mascot debounce delays the _new_ speak call by 400ms, during which the _old_ speech continues
- Kokoro TTS itself has model inference latency (WebGPU/WASM), adding further delay
- The `GameTutorial` VoiceButton has `autoPlay={false}` so step instructions aren't auto-spoken — but the "Speaking..." label at 1:10 shows _something_ is speaking (likely Mascot or a different TTS caller)

**Fix needed:** When step/page changes, **immediately cancel** any in-flight TTS before starting the debounce timer. The `stop()` should be called at step-change time, not inside the debounced callback.

### 2. Tracing Accuracy Stuck at 0% Despite Extensive Drawing

**Evidence:** Frames 220-287 (1:50-2:23) show significant red brush strokes covering the letter A, yet accuracy meter shows 0% throughout. The tracing detection is either:
- Not matching strokes to the letter template path
- Threshold too strict (Goal: 70-75%)
- Stroke coordinates not being compared against the letter bounding path

### 3. Telugu Alphabet — Broken Image Placeholder

**Evidence:** Frame 200 (~1:40) shows the Telugu letter "అ" with a broken/loading image icon where the word illustration should be. The word "అన్నం" ("annam") is shown with translation "a as in about" but the associated image fails to load.

---

## 🟠 High Issues (P1)

### 4. Multiple Placeholder Game Icons

**Evidence:** Frames 90-100 (~0:45-0:50) show multiple game cards with orange question-mark placeholder icons instead of proper thumbnails: "Spelling Run", "Story Builder", "Phonics Sounds", "Phonics Tracing", "Ending Sounds"

### 5. Hand Tracking Lost During Active Gameplay

**Evidence:** Frame 280 (~2:19) shows "Show your hand to start" while the user is clearly visible in the webcam feed. Hand tracking dropped out during active tracing, resetting the session state.

### 6. Drawing Goes Wildly Outside Letter Bounds

**Evidence:** Frames 240-260 (~2:00-2:10) show thick red strokes extending far beyond the letter "A" boundaries. No constraint/guide system prevents drawing outside the template area. For a toddler, this makes the task frustrating since any movement registers as drawing.

### 7. "Trying..." Camera Button Stuck State

**Evidence:** Frame 130 (~1:05) shows the camera permission button stuck on "Trying..." with a loading icon. The step doesn't auto-advance after camera is granted, requiring manual "Next" click.

---

## 🟡 Medium Issues (P2)

### 8. Onboarding Steps Don't Auto-Speak Instructions

The `GameTutorial` VoiceButton has `autoPlay={false}` (line 254). For pre-readers (ages 3-8), instructions should auto-speak. The button just shows "🔊 Listen" requiring a manual click.

### 9. Number Catch Demo Flash

**Evidence:** Around frame 40 (~0:20), a "Number Catch" game briefly flashes on screen during the transition from onboarding to dashboard. Appears to be a routing/render issue where the demo game momentarily renders before the dashboard.

### 10. Progress Page Shows 26% Accuracy for Number-Tap-Trail

**Evidence:** Frame 110 (~0:55) shows the progress page with "number-tap-trail" at 26% accuracy — for a demo/guest user this data is either stale or incorrectly populated.

### 11. No Visual Feedback on Correct vs Incorrect Tracing

During the tracing gameplay (1:50-2:23), there's no visual distinction between strokes that follow the letter template and strokes that go off-path. All strokes render as the same red brush regardless.

### 12. Webcam Feed Overlay Text Truncated

**Evidence:** Frame 240 shows the bottom-left webcam overlay with a truncated text "... you!" — the full message is cut off by the small overlay size.

---

## 🟢 Minor Issues (P3)

### 13. "128 GAMES READY" Badge

Frame 120 shows "128 GAMES READY" — this is a high number that may set unrealistic expectations if many games are placeholder/incomplete.

### 14. Pinch Gesture Tutorial Duration

The Pinch Gesture tutorial screen (frames 20-35, ~0:10-0:17) stays visible for ~7 seconds which is appropriate, but doesn't animate the actual pinch motion clearly enough for young children.

### 15. Timer Overlay (Recording Artifact)

The orange timer overlay (`00:00:XX.500`) from the demo mode is prominent and overlaps with game UI elements.

---

## Voiceover/TTS Sync Issue — Technical Deep Dive

### Current Flow (Buggy)
```
User clicks "Next" on Step 1
  → Step 2 renders
  → Mascot.useEffect fires (message changed)
  → 400ms debounce timer starts
  → ... user clicks "Next" on Step 2 (before 400ms or before speech finishes)
  → Step 3 renders
  → Mascot.useEffect fires again
  → Old debounce cleared, NEW 400ms timer starts
  → But previous step's speech may STILL be playing via Kokoro/WebSpeech
  → New speech starts only after old finishes + 400ms
  → Result: Voice says Step 1 content while Step 3 is visible
```

### Recommended Fix
```
User clicks "Next"
  → IMMEDIATELY call ttsService.stop()  ← cancel in-flight speech
  → Step N+1 renders
  → Mascot.useEffect fires
  → Short debounce (200ms) then speak new content
  → No rate-limit blocking (reset lastSpokenAt on step change)
```

**Key files to modify:**
- `src/frontend/src/components/Mascot.tsx` — Add immediate `stop()` on message change before debounce
- `src/frontend/src/components/OnboardingFlow.tsx` — Call `ttsService.stop()` in `handleNext()`
- `src/frontend/src/components/GameTutorial.tsx` — Call `ttsService.stop()` when `currentStep` changes

---

## Files

| File | Description |
|------|-------------|
| `1_compressed.mp4` | Compressed recording (8.8MB) |
| `1_audio.m4a` | Extracted audio track (2.3MB) |
| `frames/f_0001.jpg` - `f_0287.jpg` | Key frames at 2fps with timestamps |
