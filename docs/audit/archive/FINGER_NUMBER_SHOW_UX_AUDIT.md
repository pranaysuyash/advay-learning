# Finger Number Show - Comprehensive UX Audit (ARCHIVED)

**Status:** ARCHIVED - All remediation tickets created  
**Original Ticket:** TCK-20260130-014  
**Date:** 2026-01-30  
**Auditor:** AI Assistant  
**File:** `src/frontend/src/games/FingerNumberShow.tsx`  
**Lines of Code:** 619

## Remediation Status

| Finding | Status | Ticket | Description |
|---------|--------|--------|-------------|
| FNS-01 | ✅ DONE | TCK-20260130-015 | Add Language/Alphabet Support + Thumb Fix + Duo Mode |
| FNS-02 | 🟡 IN_PROGRESS | TCK-20260130-020 | Camera-First Layout |
| FNS-03 | 🔵 OPEN | TCK-20260130-040 | Fix Button Visibility |
| FNS-04 | 🔵 OPEN | TCK-20260130-041 | Add Hold Progress Indicator |
| FNS-05 | 🔵 OPEN | TCK-20260130-042 | Unify Prompt Placement |
| FNS-06 | 🔵 OPEN | TCK-20260130-043 | Add Accessibility Features |

### Completed Updates (2026-01-31)

**FNS-01 Completed with additional fixes:**

1. **Language/Alphabet Support** ✅
   - Added game mode toggle (Numbers 🔢 vs Letters 🔤)
   - Language selector for English, Hindi, Kannada, Telugu, Tamil
   - Letter matching: A=1, B=2, C=3, etc.

2. **Thumb Detection Fix** ✅
   - Fixed issue where full hand counted only 4 fingers
   - New 3-heuristic algorithm with majority voting (2/3)
   - More forgiving for children's hand positions

3. **Duo Mode (Multiplayer)** ✅
   - Supports up to 4 hands (was 2)
   - New difficulty level: 0-20 fingers
   - Perfect for parent-child play

4. **Success Detection Fix** ✅
   - Fixed letter mode comparing against wrong target (was using reset targetNumber=0)
   - Now correctly compares against letter value (A=1, B=2, etc.)

5. **Infinite Loop Fix** ✅
   - Fixed circular dependency causing infinite re-renders
   - Removed currentCount from detectAndDraw dependency array

6. **HMR/Fast Refresh Fix** ✅
   - Extracted countExtendedFingersFromLandmarks to separate file
   - Eliminated Vite HMR warning about inconsistent exports  

---

## Executive Summary

The Finger Number Show game has **6 critical UX issues** ranging from visibility problems to missing accessibility features. While the core hand tracking logic is solid, the user interface presents significant usability barriers for children and parents.

| Severity | Count | Categories |
|----------|-------|------------|
| 🔴 Critical | 2 | Missing language support, Layout issues |
| 🟠 High | 2 | Button visibility, Feedback confusion |
| 🟡 Medium | 2 | Visual hierarchy, Accessibility |

---

## 1. 🔴 CRITICAL: No Language Selection / Alphabet Support

**Finding ID:** FNS-01  
**Location:** Component level (missing feature)  
**Severity:** CRITICAL  

### Current State

- Game only supports numbers 0-10
- No language selection UI
- No alphabet tracing capability
- Hardcoded English number names only

### Expected Behavior (per design)

Users should be able to:

- Select language: English, Hindi, Kannada, Telugu, Tamil
- Trace alphabet letters (like in Game/AlphabetGame)
- See native script and transliteration

### User Impact

- **High** - Users cannot practice non-English alphabets
- Children learning native languages cannot use this game mode
- Inconsistent with AlphabetGame.tsx which supports 5 languages

### Evidence

```tsx
// Line 27-39: Only English number names
const NUMBER_NAMES = [
  'Zero', 'One', 'Two', ..., 'Ten'
] as const;

// No language selection UI anywhere in component
// No getLettersForGame integration
```

### Recommendation

**Priority: P1**

Add language selection similar to AlphabetGame.tsx:

```tsx
// Add language selector UI
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  // ... etc
];

// Support alphabet letters in addition to numbers
// Integrate with existing alphabet data system
```

---

## 2. 🔴 CRITICAL: Camera/Canvas Layout - Numbers Above Camera

**Finding ID:** FNS-02  
**Location:** Lines 507-537  
**Severity:** CRITICAL  

### Current State

- Numbers display appears ABOVE camera feed
- Camera takes up only middle section
- Layout: Header → Difficulty → Feedback → Numbers → Camera → Instructions
- Target number shown in center overlay initially, then moves to top-left

### User Report
>
> "Camera and canvas area positioned BELOW number displays. User suggests camera should take up CENTER screen."

### Problems

1. **Visual hierarchy is backwards** - Numbers (the prompt) dominate, camera (the input) is secondary
2. **Screen space wasted** - Camera should be the focal point
3. **Child confusion** - Children look at numbers, not camera when making gestures
4. **Not optimized for small screens** - Vertical stacking wastes space

### Evidence

```tsx
// Lines 476-509: Current layout order
<div className="relative">
  {!isPlaying ? (
    // ... start screen
  ) : (
    <div className="space-y-4">
      {/* Camera is here, but numbers appear in overlay ABOVE it */}
      <div className="relative bg-black rounded-xl aspect-video">
        <Webcam ... />
        <canvas ... />
        {/* Overlay with target number */}
        {promptStage === 'center' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-7xl md:text-8xl font-black">{targetNumber}</div>
          </div>
        )}
```

### Recommendation

**Priority: P1**

**Option A: Full-screen camera with overlay (Recommended)**

```tsx
// Camera should fill more vertical space
<div className="relative h-[70vh] min-h-[500px]">
  <Webcam className="absolute inset-0 w-full h-full object-cover" ... />
  {/* Target number as overlay, not separate element */}
  <div className="absolute top-4 left-1/2 -translate-x-1/2">
    Show {targetNumber}
  </div>
</div>
```

**Option B: Split-screen layout**

```tsx
<div className="flex flex-col lg:flex-row gap-4">
  <div className="lg:w-2/3">{/* Camera */}</div>
  <div className="lg:w-1/3">{/* Target & instructions */}</div>
</div>
```

---

## 3. 🟠 HIGH: Start Game Button Visibility Issue

**Finding ID:** FNS-03  
**Location:** Lines 493-503  
**Severity:** HIGH  

### Current State

```tsx
<button
  type="button"
  onClick={startGame}
  className="px-8 py-3 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust transition shadow-soft hover:shadow-soft-lg"
>
  Start Game
</button>
```

### User Report
>
> "User had to use console to highlight and click button. Button exists but may be hidden or obscured. No visual affordance that it's interactive."

### Analysis

- Button styling looks correct in code
- Possible issues:
  1. **Z-index layering** - Camera preview or overlays may obscure button
  2. **Color contrast** - May blend with background in certain themes
  3. **Touch target size** - 48px height may be small for children
  4. **Loading state** - Button appears/disappears based on `isModelLoading`

### Recommendation

**Priority: P2**

1. **Ensure z-index is correct:**

```tsx
<button
  className="relative z-10 ..." // Ensure button is above overlays
>
```

1. **Increase touch target:**

```tsx
<button className="px-8 py-4 min-h-[56px] ...">
```

1. **Add more prominent visual cues:**

```tsx
<button className="... ring-2 ring-white/30 ring-offset-2 ring-offset-transparent">
  <span className="flex items-center gap-2">
    <UIIcon name="play" size={20} />
    Start Game
  </span>
</button>
```

1. **Add loading skeleton:**

```tsx
{isModelLoading ? (
  <div className="px-8 py-4 bg-gray-200 animate-pulse rounded-lg">
    Loading...
  </div>
) : (
  <button>...</button>
)}
```

---

## 4. 🟠 HIGH: Number Completion Feedback Confusion

**Finding ID:** FNS-04  
**Location:** Lines 341-371 (success logic), Lines 539-560 (UI display)  
**Severity:** HIGH  

### Current State

- Success requires holding number for 450ms (`stableMatchRef`)
- When matched, shows "Great! {NUMBER}! +{points} points" for 1.8 seconds
- Then auto-advances to next target
- Current count shown in top-left overlay

### User Report
>
> "You're showing [number] appears when number matched. User correctly boxed number green but game didn't proceed. No indication of waiting state or expected next action. Confusing - is it waiting for timer? expecting more input?"

### Problems

1. **No "holding" indicator** - User doesn't know they need to HOLD the pose
2. **Green border feedback missing** - User expected visual confirmation
3. **Timeout not visible** - No progress indicator for the 450ms hold
4. **Auto-advance surprise** - Next number appears without clear transition

### Evidence

```tsx
// Line 356: 450ms hold requirement
} else if (!successLockRef.current && nowMs - (stable.startAt ?? nowMs) >= 450) {

// Lines 364-369: Immediate feedback then auto-advance
setFeedback(`Great! ${NUMBER_NAMES[totalFingers]}! +${points} points`);
setTimeout(() => {
  setShowCelebration(false);
  setNextTarget(difficulty);  // Auto-advance without user action
}, 1800);
```

### Recommendation

**Priority: P2**

1. **Add hold progress indicator:**

```tsx
// When match detected but not yet held long enough
{isDetectedMatch && !successLockRef.current && (
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
    <div className="text-white text-lg font-bold mb-2">Hold it!</div>
    <div className="w-48 h-2 bg-white/30 rounded-full overflow-hidden">
      <motion.div 
        className="h-full bg-green-400"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.45 }}
      />
    </div>
  </div>
)}
```

1. **Add clear visual states:**

```tsx
// Detected match indicator
<div className={`
  px-4 py-2 rounded-full font-bold transition-all duration-200
  ${isDetectedMatch 
    ? 'bg-green-500 text-white ring-4 ring-green-400/50 scale-110' 
    : 'bg-black/50 text-white'
  }
`}>
  Detected: {currentCount}
</div>
```

1. **Add "Next" button instead of auto-advance:**

```tsx
// After success, show next button
{successLockRef.current && (
  <button 
    onClick={() => setNextTarget(difficulty)}
    className="absolute bottom-8 left-1/2 -translate-x-1/2 ..."
  >
    Next Number →
  </button>
)}
```

---

## 5. 🟡 MEDIUM: Question/Prompt Placement Ambiguity

**Finding ID:** FNS-05  
**Location:** Lines 520-560  
**Severity:** MEDIUM  

### Current State

- Target number shown in two places:
  1. **Center overlay** (briefly, during `promptStage === 'center'`)
  2. **Top-left badge** (after 1.8s, `promptStage === 'side'`)
- Detected count shown in separate badge
- Instructions at bottom of screen

### User Report
>
> "Questions should be on same side or on right? No clear pattern in current code. Should questions be grouped with target/current count? Or separate screen?"

### Problems

1. **Dual locations for same info** - Target appears center then top-left
2. **Unclear visual grouping** - Target, detected, and instructions are scattered
3. **Animation may be missed** - Center prompt only shows for 1.8s
4. **No persistent target display** - After center stage, target is small

### Recommendation

**Priority: P3**

**Unified target display:**

```tsx
// Persistent target card (always visible)
<div className="absolute top-4 left-4 bg-white rounded-2xl p-4 shadow-lg">
  <div className="text-sm text-gray-500">Show me</div>
  <div className="text-4xl font-bold text-center">{targetNumber}</div>
  <div className="text-sm text-gray-500">{NUMBER_NAMES[targetNumber]}</div>
</div>

// Detected count (mirrors target position)
<div className={`
  absolute top-4 right-4 rounded-2xl p-4 shadow-lg
  ${isDetectedMatch ? 'bg-green-500 text-white' : 'bg-white'}
`}>
  <div className="text-sm opacity-80">You showed</div>
  <div className="text-4xl font-bold text-center">{currentCount}</div>
  <div className="text-sm opacity-80">
    {handsBreakdown || 'No hands detected'}
  </div>
</div>
```

---

## 6. 🟡 MEDIUM: Missing Accessibility Features

**Finding ID:** FNS-06  
**Location:** Various  
**Severity:** MEDIUM  

### Issues Found

1. **No keyboard navigation**
   - Cannot start game with keyboard
   - Cannot stop game with keyboard
   - No focus indicators

2. **Missing ARIA labels**

   ```tsx
   // Line 509-514: Webcam has no aria-label
   <Webcam
     ref={webcamRef}
     className="..."
     mirrored
     videoConstraints={{ width: 640, height: 480 }}
   />
   ```

3. **No screen reader announcements**
   - Score changes not announced
   - Target changes not announced
   - Success feedback not announced to screen readers

4. **Color-only feedback**
   - `isDetectedMatch` only shown via green ring
   - No text/sound alternative for colorblind users

### Recommendation

**Priority: P3**

```tsx
// Add ARIA live region for announcements
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {feedback}
</div>

// Add keyboard controls
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (!isPlaying) startGame();
      else stopGame();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isPlaying]);

// Add accessible webcam
<Webcam
  ref={webcamRef}
  aria-label="Camera feed for finger counting game"
  videoConstraints={{...}}
/>
```

---

## Additional Observations

### 7. Minor: Streak Fire Emoji Inconsistency

**Location:** Line 586-588  
**Issue:** Uses `🔥` emoji instead of UIIcon component

```tsx
<div className="...">
  🔥 {streak} streak!  // Should use <UIIcon name="flame" />
</div>
```

### 8. Minor: Hardcoded Strings

**Location:** Lines 191-194, 482-483  
**Issue:** English-only strings, not internationalized

```tsx
setFeedback(`Great! ${NUMBER_NAMES[totalFingers]}! +${points} points`);
// Not translatable
```

### 9. Minor: No Error Boundary

**Location:** Component level  
**Issue:** Camera or MediaPipe failures crash the game instead of graceful fallback

---

## Summary of Recommendations

| Priority | Finding | Effort | Impact |
|----------|---------|--------|--------|
| P1 | FNS-01: Add language/alphabet support | High | Critical |
| P1 | FNS-02: Fix camera layout | Medium | Critical |
| P2 | FNS-03: Fix button visibility | Low | High |
| P2 | FNS-04: Improve feedback clarity | Medium | High |
| P3 | FNS-05: Unify prompt placement | Low | Medium |
| P3 | FNS-06: Add accessibility | Medium | Medium |

---

## Testing Checklist for Fixes

- [ ] Test on mobile devices (touch targets)
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Test keyboard navigation
- [ ] Test with camera denied (fallback behavior)
- [ ] Test language switching (when implemented)
- [ ] Test with low-end devices (GPU fallback)
- [ ] Test with children (usability study)

---

**Next Actions:**

1. Create remediation tickets for P1 items
2. Schedule design review for layout changes
3. Plan accessibility audit with assistive technology users

---

*Audit Complete: 2026-01-30 16:45 IST*
