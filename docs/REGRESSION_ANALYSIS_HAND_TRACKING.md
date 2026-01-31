# Hand Tracking Regression Analysis

## Summary
**Regression ID:** REG-20260201-001  
**Date Discovered:** 2026-02-01  
**Severity:** Medium (UI feedback incorrect, core functionality works)  
**Status:** FIXED

## What Regressed
The mascot's feedback message always displayed "Camera tracking unavailable" even when the hand tracking model loaded successfully.

## Root Cause Analysis

### Timeline of Changes

| Commit | Date | Description | Impact |
|--------|------|-------------|--------|
| `5742d1c` | 2026-01-31 | Restore lost tracing improvements | ✅ Working hand tracking with local variable pattern |
| `a8575e7` | 2026-01-31 | Refactor: AlphabetGame uses centralized hooks | ❌ **Introduced regression** - stale state bug |
| `b3177dc` | 2026-02-01 | Current HEAD | Still broken until today's fix |

### Code Comparison

**✅ Working Pattern (before refactor - `5742d1c`):**
```tsx
// Local variable - synchronous, no stale state issue
let loadedDelegate: 'GPU' | 'CPU' | null = null;

for (const delegate of delegatesToTry) {
  try {
    const landmarker = await HandLandmarker.createFromOptions(...);
    landmarkerRef.current = landmarker;
    loadedDelegate = delegate;  // ✅ Local variable, available immediately
    break;
  } catch (e) { /* fallback */ }
}

// ✅ Check happens AFTER the loop completes
if (loadedDelegate) {
  setFeedback('Camera ready!');
} else {
  setFeedback('Camera tracking unavailable...');
}
```

**❌ Broken Pattern (after refactor - `a8575e7`):**
```tsx
// React state - asynchronous, prone to stale state
if (!isHandTrackingReady) {
  await initializeHandTracking();  // State updates async, NOT immediately
}

// ❌ BUG: isHandTrackingReady is still false here! 
// React state doesn't update mid-function
if (isHandTrackingReady) {  
  setFeedback('Camera ready!');  // Never reached!
} else {
  setFeedback('Camera tracking unavailable...');  // Always shown!
}
```

### Additional Issues Found

1. **React Strict Mode Double-Mount:** In `useHandTracking.ts`, the cleanup effect closes the landmarker on unmount, but `isInitializingRef.current` remained `true`, blocking reinitialization on remount.

2. **Posture Model 404:** `usePostureDetection.ts` used a non-existent model path (`pose_landmarker_heavy.task`).

## Fixes Applied

### 1. Fixed Stale State in `AlphabetGame.tsx`
```tsx
// Don't check state synchronously - use useEffect to monitor it
if (!isHandTrackingReady) {
  setFeedback('Loading hand tracking...');
  initializeHandTracking(); // Don't await
} else {
  setFeedback('Camera ready!');
}

// Added useEffect to update when ready
useEffect(() => {
  if (isPlaying && isHandTrackingReady) {
    setFeedback('Camera ready!');
    console.log('[AlphabetGame] Hand tracking became ready during gameplay');
  }
}, [isPlaying, isHandTrackingReady]);
```

### 2. Fixed React Strict Mode in `useHandTracking.ts`
```tsx
useEffect(() => {
  isMountedRef.current = true;  // Reset on remount
  return () => {
    isMountedRef.current = false;
    isInitializingRef.current = false;  // Allow reinit on remount
  };
}, []);
```

### 3. Fixed Posture Model Path
Changed from non-existent `pose_landmarker_heavy.task` to valid `pose_landmarker_lite.task`.

## Prevention Recommendations

### 1. Add Integration Test for Hand Tracking Feedback
Create a test that verifies the feedback message changes to "Camera ready!" after model initialization.

### 2. Refactoring Checklist
When refactoring async initialization patterns:
- [ ] Check if original code used local variables for synchronous flow
- [ ] If converting to React state, add `useEffect` monitors for state changes
- [ ] Test in React Strict Mode (dev mode) for double-mount issues
- [ ] Verify cleanup/reinit cycle works correctly

### 3. Pre-Commit Hook
Add a pre-commit check that runs the Alphabet Game E2E test:
```bash
npm run test:e2e -- --grep "hand tracking feedback"
```

### 4. Documentation Standards
When implementing centralized hooks, document:
- The async nature of state updates
- Required `useEffect` patterns for consumers
- React Strict Mode considerations

## Files Modified in Fix
- `src/frontend/src/pages/AlphabetGame.tsx` - Stale state fix + useEffect monitor
- `src/frontend/src/hooks/useHandTracking.ts` - React Strict Mode fix
- `src/frontend/src/hooks/usePostureDetection.ts` - Model path fix

## Verification
- ✅ Build succeeds
- ✅ Browser test confirms "Loading hand tracking..." → "Camera ready!" transition works
- ✅ Console log `[AlphabetGame] Hand tracking became ready during gameplay` appears
