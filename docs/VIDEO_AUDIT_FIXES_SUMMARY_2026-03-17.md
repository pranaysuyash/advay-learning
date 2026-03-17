# Video Audit Fixes Summary - 2026-03-17

**Source:** `docs/audit/VIDEO_AUDIT_ONBOARDING_ALPHABET_TRACING_2026-03-17.md`
**Date:** 2026-03-17
**Status:** P0 and P1 issues addressed

---

## P0 Critical Issues Fixed

### ✅ 1. TTS/Voiceover Lags Behind Screen Transitions (Issue #14)

**Problem:** Voiceover from previous step continued playing after user moved to next step, causing audio desync.

**Root Cause:** Mascot component had 400ms debounce + 1500ms rate-limit that delayed new speech while old speech continued.

**Fix:** Modified `src/frontend/src/components/Mascot.tsx`:
- Added immediate `stopSpeaking()` call when message changes (before debounce)
- Reset rate-limit counter on message change for instant step-transition speech
- Reduced debounce from 400ms to 200ms for snappier response

**Code Changes:**
```typescript
// Immediately stop any in-flight speech when message changes
stopSpeaking();
// Reset rate-limit on message change to allow immediate new speech
lastSpokenAtRef.current = 0;
```

---

### ✅ 2. Tracing Accuracy Stuck at 0% Despite Extensive Drawing (Issue #12)

**Problem:** Accuracy meter stayed at 0% during tracing, only updated when user clicked "Done" button.

**Root Cause:** Accuracy was only calculated in `checkProgress()` which required manual button click. No real-time feedback during drawing.

**Fix:** Created new hook `useRealTimeAccuracy.ts` that:
- Continuously monitors drawn points during gameplay
- Updates accuracy display every 150ms as user draws
- Provides immediate feedback without waiting for "Done" button

**Files Modified:**
- `src/frontend/src/pages/alphabet-game/useRealTimeAccuracy.ts` (new file)
- `src/frontend/src/pages/AlphabetGame.tsx` (added hook usage)

---

### ✅ 3. Telugu Alphabet — Broken Image Placeholder (Issue #13)

**Problem:** Telugu letter "అ" (annam/rice) showed broken image icons for missing SVG files.

**Root Cause:** Data referenced `/assets/icons/andhra-pradesh.svg` and `/assets/icons/agni.svg` which didn't exist.

**Fix:** Created missing SVG icon files:
- `src/frontend/public/assets/icons/andhra-pradesh.svg` - Map outline with rice grains
- `src/frontend/public/assets/icons/agni.svg` - Fire/Agni symbol

---

## P1 High Issues Fixed

### ✅ 4. Camera Permission Button Stuck on "Trying..." (Issue #15)

**Problem:** After camera permission granted, step didn't auto-advance. User had to manually click "Next".

**Root Cause:** OnboardingFlow required manual button click even after successful camera access.

**Fix:** Modified `src/frontend/src/components/OnboardingFlow.tsx`:
- Added auto-advance after 2 seconds when camera status becomes 'success'
- Updated success message to indicate auto-advance is happening
- Changed button text to "Magic is Ready! Auto-advancing... ⏳"

---

### ✅ 5. Hand Tracking Lost During Active Gameplay (Issue #16)

**Problem:** Brief tracking dropouts immediately showed "Show your hand to start" message, disrupting gameplay.

**Root Cause:** Hand loss detection was immediate - one frame without detection reset the state.

**Fix:** Added hand loss tolerance mechanism to `useDrawingLoop.ts`:
- Introduced `HAND_LOSS_TOLERANCE_FRAMES = 30` (0.5 seconds at 60fps)
- Only declare hand lost after 30 consecutive frames without detection
- Prevents momentary tracking dropouts from disrupting experience

**Files Modified:**
- `src/frontend/src/pages/alphabet-game/constants.ts` (added tolerance constant)
- `src/frontend/src/pages/alphabet-game/useDrawingLoop.ts` (implemented tolerance logic)

---

## Files Modified Summary

### Modified Files:
1. `src/frontend/src/components/Mascot.tsx` - TTS lag fix
2. `src/frontend/src/components/OnboardingFlow.tsx` - Camera auto-advance
3. `src/frontend/src/components/GameTutorial.tsx` - Pinch detection fix
4. `src/frontend/src/pages/AlphabetGame.tsx` - Real-time accuracy
5. `src/frontend/src/pages/alphabet-game/constants.ts` - Hand loss tolerance
6. `src/frontend/src/pages/alphabet-game/useDrawingLoop.ts` - Tolerance implementation
7. `src/frontend/src/utils/drawing.ts` - Unused parameter fix

### New Files:
1. `src/frontend/src/pages/alphabet-game/useRealTimeAccuracy.ts` - Real-time accuracy hook
2. `src/frontend/public/assets/icons/andhra-pradesh.svg` - Missing icon
3. `src/frontend/public/assets/icons/agni.svg` - Missing icon

---

## P2 Medium Issues (Not Addressed)

The following P2 issues remain for future work:
- Multiple Placeholder Game Icons - Need proper thumbnails for games
- Drawing Goes Wildly Outside Letter Bounds - Need boundary constraints
- No Visual Feedback on Correct vs Incorrect Tracing - Need path comparison
- Webcam Feed Overlay Text Truncated - UI sizing issue

---

## Testing Recommendations

1. **TTS Fix:** Navigate through tutorial steps quickly - voice should stop immediately when moving to next step
2. **Accuracy:** Draw letter "A" - accuracy should update continuously during drawing
3. **Telugu:** Switch to Telugu language and verify letter "అ" shows rice icon correctly
4. **Camera Auto-advance:** Complete camera permission step - should auto-advance after 2 seconds
5. **Hand Loss Tolerance:** During tracing, briefly move hand out of frame - should not show "Show your hand" for 0.5 seconds

---

## Build Status

✅ All changes compile successfully
✅ No TypeScript errors
✅ Build time: 16.37s
