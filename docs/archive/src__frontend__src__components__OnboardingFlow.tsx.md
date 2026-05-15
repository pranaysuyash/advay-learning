# File Audit: OnboardingFlow.tsx

**Auditor:** Qwen Code  
**Date:** 2026-03-20 15:15 IST  
**Prompt Used:** `prompts/audit/audit-v1.5.1.md`  
**Evidence Discipline:** All claims labeled (Observed/Inferred/Unknown)

---

## 1. Orientation

### 1.1 File Identity

| Property | Value |
|----------|-------|
| **Path** | `src/frontend/src/components/OnboardingFlow.tsx` |
| **Size** | 374 lines |
| **Language** | TypeScript (React functional component) |
| **Git Status** | Tracked, no local modifications |
| **Base Commit** | `3ae642cc0454df4ba5ff5b4378866747f538602f` |

### 1.2 Purpose (Observed)

**Observed:** Component manages 3-step onboarding flow for new users:
1. Welcome screen with mascot introduction
2. Camera permission request ("Magic Vision")
3. Gesture tutorial (pinch to draw)

**Observed:** Persists completion state to `useSettingsStore` (Zustand).

### 1.3 Dependencies (Observed)

| Import | Source | Usage |
|--------|--------|-------|
| `useState, useEffect, useRef, useCallback` | `react` | State and lifecycle management |
| `motion, AnimatePresence` | `framer-motion` | Animation primitives |
| `useSettingsStore` | `../store` | Settings persistence |
| `Mascot` | `./Mascot` | Mascot character component |
| `Button` | `./ui/Button` | Primary action buttons |

**Observed:** 5 direct dependencies. No transitive dependencies analyzed.

---

## 2. Discovery Appendix

### 2.1 Git History (Observed)

```bash
$ git log --oneline src/frontend/src/components/OnboardingFlow.tsx | head -10
3ae642c fix: CV integration and visual polish
e2d01b0 chore: enforce main-first workflow
08871af docs: no co-author trailers
...
```

**Observed:** 8+ commits modifying this file. File has active development history.

### 2.2 Test Coverage (Observed)

```bash
$ ls src/frontend/src/components/__tests__/OnboardingFlow*
No files found
```

**Observed:** Zero test coverage. No `*.test.tsx` file exists.

### 2.3 Call Sites (Observed)

```bash
$ rg "OnboardingFlow" src/frontend/src --type tsx
src/frontend/src/pages/Home.tsx:121: {!onboardingCompleted && <OnboardingFlow />}
```

**Observed:** Single call site in `Home.tsx`. Conditional render based on `onboardingCompleted` state.

### 2.4 Type Surface (Observed)

```typescript
interface OnboardingFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
}
```

**Observed:** Two optional callbacks. No required props.

---

## 3. Structural Analysis

### 3.1 Component Architecture (Observed)

```
OnboardingFlow (main component)
├── WelcomeStep (sub-component)
├── MagicVisionStep (sub-component)
│   └── useEffect for auto-advance timer
└── GestureStep (sub-component)
```

**Observed:** 3 sub-components defined in same file. All defined as functions (not memoized).

### 3.2 State Variables (Observed)

| Variable | Type | Initial Value | Purpose |
|----------|------|---------------|---------|
| `currentStep` | `Step` | `'welcome'` | Tracks current onboarding step |
| `cameraStatus` | `'pending' \| 'success' \| 'error'` | `'pending'` | Camera permission state |
| `visible` | `boolean` | `false` | Controls modal visibility |
| `videoRef` | `RefObject<HTMLVideoElement>` | `null` | Video preview element |
| `streamRef` | `RefObject<MediaStream>` | `null` | Camera stream reference |

### 3.3 Callbacks (Observed)

| Callback | Dependencies | Called By |
|----------|--------------|-----------|
| `cleanup` | `[]` | `handleComplete`, `handleSkip`, `useEffect` cleanup |
| `handleComplete` | `[cleanup, updateSettings, onComplete]` | `GestureStep`, auto-advance |
| `handleSkip` | `[cleanup, updateSettings, onSkip]` | All steps' skip buttons |
| `handleNext` | `[currentIndex, steps, handleComplete]` | `WelcomeStep`, `MagicVisionStep` |
| `testCamera` | `[updateSettings]` | `useEffect` when step = 'magicVision' |

---

## 4. Findings

### Finding 1.1: Camera Stream Cleanup Race Condition

**Severity:** HIGH  
**Priority:** P0  
**Evidence Label:** Observed

**Description:** Race condition exists when user skips during camera permission request.

**Code Evidence:**
```typescript
// Line 27-30: cleanup function
const cleanup = useCallback(() => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }
}, []);

// Line 56-68: testCamera function
const testCamera = useCallback(async () => {
  try {
    setCameraStatus('pending');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;  // ← Line 60: Assignment happens HERE
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    updateSettings({ cameraPermissionState: 'granted', cameraEnabled: true });
    setCameraStatus('success');
  } catch {
    updateSettings({ cameraPermissionState: 'denied' });
    setCameraStatus('error');
  }
}, [updateSettings]);
```

**Race Scenario (Observed):**
1. User clicks "Let's Get Started" → camera permission dialog opens
2. User clicks "Skip for Now" BEFORE permission granted
3. `handleSkip()` calls `cleanup()` → `streamRef.current` is `null`, nothing happens
4. Permission granted asynchronously → Line 60 executes → `streamRef.current = stream`
5. Component unmounts → `useEffect` cleanup runs → `cleanup()` called again
6. **BUG:** Stream is stopped, but there's a window where stream is active after skip

**Impact:**
- Camera LED may stay on briefly after skip
- Privacy concern: user thinks camera is off, but it's still active
- Battery drain from unnecessary stream

**Remediation Plan:**
```typescript
// Add abort controller to cancel pending stream request
const abortControllerRef = useRef<AbortController | null>(null);

const testCamera = useCallback(async () => {
  try {
    setCameraStatus('pending');
    abortControllerRef.current = new AbortController();
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true,
      signal: abortControllerRef.current.signal 
    });
    // Only assign if not aborted
    if (abortControllerRef.current.signal.aborted) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    streamRef.current = stream;
    // ...
  } catch {
    // ...
  }
}, []);

const handleSkip = useCallback(() => {
  // Abort pending camera request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
  }
  cleanup();
  // ...
}, [cleanup, updateSettings, onSkip]);
```

---

### Finding 1.2: Auto-Advance Timer Not Cleared on Skip

**Severity:** MEDIUM  
**Priority:** P1  
**Evidence Label:** Observed

**Description:** Timer set in `MagicVisionStep` is only cleared on unmount, not on skip.

**Code Evidence:**
```typescript
// Lines 200-209: MagicVisionStep useEffect
useEffect(() => {
  if (status === 'success') {
    const timer = setTimeout(() => {
      onNext();
    }, 2000); // 2 seconds to see the success state
    return () => clearTimeout(timer); // ← Only clears on unmount
  }
}, [status, onNext]);
```

**Issue (Observed):**
- Timer cleanup only happens when component unmounts
- If user clicks "Skip for Now" before 2 seconds, timer still fires
- `onNext()` called after skip, potentially advancing to GestureStep unexpectedly

**Impact:**
- Confusing UX: user skips, but still sees next step briefly
- Potential state inconsistency

**Remediation Plan:**
```typescript
// Move timer ref to parent component
const timerRef = useRef<NodeJS.Timeout | null>(null);

const handleSkip = useCallback(() => {
  // Clear pending timer
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
  cleanup();
  // ...
}, [cleanup, updateSettings, onSkip]);

// In MagicVisionStep useEffect:
useEffect(() => {
  if (status === 'success') {
    timerRef.current = setTimeout(() => {
      onNext();
    }, 2000);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }
}, [status, onNext]);
```

---

### Finding 2.1: No Error Details for Camera Failures

**Severity:** MEDIUM  
**Priority:** P1  
**Evidence Label:** Observed

**Description:** Camera permission errors are swallowed without logging or type detection.

**Code Evidence:**
```typescript
// Lines 66-70: Error handling
} catch {
  updateSettings({ cameraPermissionState: 'denied' });
  setCameraStatus('error');
}
```

**Issue (Observed):**
- Empty `catch {}` block swallows all errors
- No distinction between:
  - User denied permission
  - No camera device available
  - HTTPS requirement not met
  - Browser not supported
- No error logging for debugging

**Impact:**
- Cannot debug camera issues in production
- Users see generic error for all failure modes
- No analytics on failure reasons

**Remediation Plan:**
```typescript
const testCamera = useCallback(async () => {
  try {
    setCameraStatus('pending');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // ...
  } catch (error) {
    const isNotAllowedError = error.name === 'NotAllowedError';
    const isNotFoundError = error.name === 'NotFoundError';
    const isNotSupportedError = error.name === 'NotSupportedError';
    
    console.error('[OnboardingFlow] Camera error:', {
      name: error.name,
      message: error.message,
      isNotAllowedError,
      isNotFoundError,
    });
    
    updateSettings({ 
      cameraPermissionState: isNotAllowedError ? 'denied' : 'error',
      cameraErrorType: error.name 
    });
    setCameraStatus('error');
  }
}, [updateSettings]);
```

---

### Finding 4.1: Framer Motion Not Lazy Loaded

**Severity:** LOW  
**Priority:** P3  
**Evidence Label:** Inferred

**Description:** Heavy animation library loaded for all users, even if onboarding completed.

**Code Evidence:**
```typescript
// Line 2: Import
import { motion, AnimatePresence } from 'framer-motion';
```

**Inferred:** Framer Motion adds ~14kb to bundle. Loaded for ALL users, even those with `onboardingCompleted: true`.

**Impact:**
- Unnecessary bundle size for returning users
- Initial page load slower

**Remediation Plan:**
```typescript
// Lazy load motion components
const motion = lazy(() => import('framer-motion'));
// Or use CSS transitions instead of framer-motion for simple animations
```

---

### Finding 4.2: Video Stream Constraints Not Optimized

**Severity:** LOW  
**Priority:** P2  
**Evidence Label:** Observed

**Description:** Camera stream requests default resolution, not optimized for preview.

**Code Evidence:**
```typescript
// Line 59: No constraints specified
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
```

**Observed:** Default resolution may be 1080p or higher. Preview is small (~300x200px).

**Impact:**
- Higher bandwidth usage
- Slower camera initialization
- Unnecessary CPU usage for decoding

**Remediation Plan:**
```typescript
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: { 
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: 'user'
  } 
});
```

---

### Finding 5.2: No HTTPS Enforcement

**Severity:** MEDIUM  
**Priority:** P2  
**Evidence Label:** Observed

**Description:** Camera API requires HTTPS, but no enforcement or helpful error message.

**Code Evidence:**
```typescript
// Line 59: No HTTPS check before camera request
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
```

**Observed:** `navigator.mediaDevices` is undefined on HTTP pages. Error message is generic.

**Impact:**
- Users on HTTP see cryptic error
- No guidance to use HTTPS

**Remediation Plan:**
```typescript
const testCamera = useCallback(async () => {
  // Check HTTPS before attempting camera
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    console.error('[OnboardingFlow] Camera requires HTTPS');
    updateSettings({ cameraErrorType: 'InsecureContextError' });
    setCameraStatus('error');
    return;
  }
  
  if (!navigator.mediaDevices) {
    console.error('[OnboardingFlow] Camera API not supported');
    setCameraStatus('error');
    return;
  }
  
  // ... rest of camera logic
}, [updateSettings]);
```

---

### Finding 6.1: No Error Logging

**Severity:** MEDIUM  
**Priority:** P1  
**Evidence Label:** Observed

**Description:** No `console.error` or logging calls anywhere in component.

**Code Evidence:**
```bash
$ grep -n "console\." src/frontend/src/components/OnboardingFlow.tsx
# No matches found
```

**Observed:** Zero logging statements. Impossible to debug production issues.

**Impact:**
- Cannot diagnose camera failures
- No analytics on onboarding completion rate
- Silent failures

**Remediation Plan:**
Add logging at key points:
```typescript
console.log('[OnboardingFlow] Mounted');
console.log('[OnboardingFlow] Step changed:', currentStep);
console.error('[OnboardingFlow] Camera error:', error);
console.log('[OnboardingFlow] Completed:', onboardingCompleted);
```

---

### Finding 7.1: Zero Test Coverage

**Severity:** HIGH  
**Priority:** P0  
**Evidence Label:** Observed

**Description:** No test file exists for this critical onboarding component.

**Code Evidence:**
```bash
$ ls src/frontend/src/components/__tests__/OnboardingFlow*
No files found
```

**Observed:** Component has:
- Camera permission logic
- State management
- Multiple user flows (complete, skip, error)
- Timer-based auto-advance
- **Zero automated tests**

**Impact:**
- Regressions undetected
- Broken onboarding can reach production
- Manual testing required for every change

**Remediation Plan:**
Create `src/frontend/src/components/__tests__/OnboardingFlow.test.tsx` with:
1. Welcome screen renders
2. Skip button works
3. Next button advances to camera step
4. Camera permission granted flow
5. Camera permission denied flow
6. Auto-advance timer fires
7. Skip during camera request clears timer
8. Gesture step renders
9. Complete button calls onComplete
10. Settings persisted correctly
11. Cleanup called on unmount
12. Camera stream stopped on skip
13. HTTPS error handling
14. Store hydration wait
15. Already completed users don't see onboarding
16. Accessibility (keyboard navigation)

---

## 5. UX Audit Findings (External Context)

### UX Finding: 1m45s Time-to-Gameplay

**Severity:** HIGH  
**Priority:** P0  
**Evidence Label:** Inferred (from `docs/UX_AUDIT_INDEX_2026-03-17.md`)

**Description:** Users wait 1 minute 45 seconds through 7 modals before gameplay.

**Context (Inferred):** This component is part of larger onboarding flow:
1. Welcome modal
2. "Activate Magic Vision" camera modal
3. Pinch gesture tutorial
4. Dashboard browsing (48 seconds)
5. "How to Play" steps (3 more modals)
6. Language selection modal
7. **FINALLY: Gameplay**

**Target:** <5 seconds from click to gameplay.

**Remediation Options:**
1. **Remove onboarding for demo users** → Direct to game picker
2. **Make skippable** → Add "Skip All" button
3. **Inline tutorials** → Teach during first game
4. **Post-first-game onboarding** → Let users play first, then explain

---

## 6. Invariants

**Observed:** Load-bearing behaviors that MUST be preserved:

1. **Camera stream MUST be stopped on ANY exit path**
   - Unmount
   - Complete
   - Skip
   - Error

2. **Onboarding MUST NOT show if `onboardingCompleted === true`**
   - Line 84-88: `if (!visible) return null;`

3. **Settings MUST persist to localStorage**
   - Via `useSettingsStore.updateSettings()`

4. **Skip MUST be available at every step**
   - All 3 steps have skip button

---

## 7. Patch Plan

### P0 Patches (Critical)

| Finding | Files to Change | Lines | Risk |
|---------|-----------------|-------|------|
| 1.1 Camera cleanup race | `OnboardingFlow.tsx` | 56-70, 41-46 | Medium |
| 7.1 Test coverage | NEW: `OnboardingFlow.test.tsx` | ~400 lines | Low |
| UX Time-to-gameplay | `OnboardingFlow.tsx`, `Home.tsx` | TBD | High |

### P1 Patches (High Priority)

| Finding | Files to Change | Lines | Risk |
|---------|-----------------|-------|------|
| 1.2 Timer not cleared on skip | `OnboardingFlow.tsx` | 200-209, 41-46 | Low |
| 2.1 No error details | `OnboardingFlow.tsx` | 66-70 | Low |
| 6.1 No error logging | `OnboardingFlow.tsx` | Multiple | Low |

### P2 Patches (Medium Priority)

| Finding | Files to Change | Lines | Risk |
|---------|-----------------|-------|------|
| 5.2 No HTTPS enforcement | `OnboardingFlow.tsx` | 56-70 | Low |
| 4.2 Video constraints | `OnboardingFlow.tsx` | 59 | Low |

### P3 Patches (Low Priority)

| Finding | Files to Change | Lines | Risk |
|---------|-----------------|-------|------|
| 4.1 Framer Motion lazy load | `OnboardingFlow.tsx` | 2 | Medium |

---

## 8. Test Plan

### Unit Tests (Required for P0 Fix)

```typescript
// src/frontend/src/components/__tests__/OnboardingFlow.test.tsx

describe('OnboardingFlow', () => {
  it('stops camera stream when skipped during permission request', async () => {
    // Mock getUserMedia with delay
    const mockStop = vi.fn();
    getUserMediaMock.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ getTracks: () => [{ stop: mockStop }] });
        }, 1000);
      });
    });
    
    render(<OnboardingFlow />);
    // Click through to camera step
    fireEvent.click(screen.getByText("Let's Get Started!"));
    // Click skip BEFORE camera resolves
    fireEvent.click(screen.getByText('Skip for Now'));
    // Wait for camera to resolve
    await vi.advanceTimersByTimeAsync(1000);
    // Verify stream was stopped
    expect(mockStop).toHaveBeenCalled();
  });

  it('clears auto-advance timer when skipped', async () => {
    render(<OnboardingFlow />);
    // Navigate to camera step, simulate success
    // Click skip before 2 seconds
    // Verify onNext not called after skip
  });

  it('logs camera errors to console', async () => {
    console.error = vi.fn();
    getUserMediaMock.mockRejectedValue(new Error('NotAllowedError'));
    // Trigger camera request
    // Verify console.error called with error details
  });
});
```

### Integration Tests

```typescript
// src/frontend/src/pages/__tests__/Home.onboarding.test.tsx

describe('Home onboarding flow', () => {
  it('does not show OnboardingFlow if onboardingCompleted is true', () => {
    // Set onboardingCompleted in store
    // Render Home
    // Verify OnboardingFlow not rendered
  });

  it('persists onboarding completion to store', async () => {
    render(<Home />);
    // Complete onboarding
    // Verify store updated
    // Reload page
    // Verify onboarding not shown again
  });
});
```

---

## 9. Regression Analysis

**Status:** Unknown

**Observed:** File modified in recent commits (8+ commits in history).

**Unknown:** Actual line-level changes in most recent commit (`3ae642c`). Cannot determine if recent changes introduced bugs without diff output.

**Recommendation:** Run `git show 3ae642c:src/frontend/src/components/OnboardingFlow.tsx | diff - src/frontend/src/components/OnboardingFlow.tsx` to see recent changes.

---

## 10. Evidence Summary

| Claim | Evidence Label | Source |
|-------|---------------|--------|
| Camera cleanup race condition | Observed | Lines 27-30, 56-68 |
| Zero test coverage | Observed | File system check |
| Auto-advance timer not cleared on skip | Observed | Lines 200-209 |
| No error logging | Observed | `grep "console."` returned no matches |
| No HTTPS enforcement | Observed | Lines 56-70 |
| 1m45s time-to-gameplay | Inferred | `docs/UX_AUDIT_INDEX_2026-03-17.md` |
| Recent git changes | Observed | `git log` output |
| Recent diff contents | Unknown | Diff not retrieved |

---

## 11. Audit Artifact Status

**This Document:** `docs/audit/src__frontend__src__components__OnboardingFlow.tsx.md`

**Created:** 2026-03-20 15:15 IST

**Status:** RESOLVED (2026-03-20 22:05 IST)

**Resolution Summary:**

| Finding | Status | Resolution |
|---------|--------|------------|
| 1.1 Camera cleanup race | ✅ FIXED | AbortController pattern + finally cleanup |
| 1.2 Auto-advance timer | ✅ FIXED | `autoAdvanceTimerRef` cleared in `cleanup()` |
| 2.1 Error type detection | ✅ FIXED | `NotAllowedError`, `NotFoundError`, `NotSupportedError` detected |
| 5.2 HTTPS enforcement | ✅ FIXED | Protocol check before getUserMedia, error logged |
| 6.1 No error logging | ✅ FIXED | `console.error('[OnboardingFlow] Camera error:', ...)` added |
| 4.2 Video constraints | ✅ FIXED | 640x480 ideal resolution, facingMode: user |
| 7.1 Zero test coverage | ✅ FIXED | Created `OnboardingFlow.test.tsx` with 24 test cases |
| 4.1 Framer Motion lazy | ⚠️ N/A | Inline motion components require app-wide lazy loading refactor |

**Verification:**
- TypeScript: `npx tsc --noEmit` passes (via vite build)
- Tests: 291 files, 7290 tests passed (including 24 new OnboardingFlow tests)

---

## 12. Worklog Ticket

**Ticket:** `TCK-20260320-001`  
**Status:** DONE  
**Priority:** P0  
**Location:** `docs/WORKLOG_ADDENDUM_v3.md`

**Acceptance Criteria (Final 2026-03-20):**
- [x] Camera stream cleanup race fixed (Finding 1.1) - Implemented AbortController pattern
- [x] Auto-advance timer cleared on skip (Finding 1.2) - Added `autoAdvanceTimerRef`
- [x] Error logging added (Finding 6.1) - Added `console.error` with error details
- [x] Error type detection implemented (Finding 2.1) - Detects NotAllowed/NotFound/NotSupported
- [x] HTTPS enforcement added (Finding 5.2) - Protocol check + error message
- [x] Video constraints optimized (Finding 4.2) - 640x480 ideal resolution
- [x] Comprehensive test suite created (Finding 7.1) - Created `OnboardingFlow.test.tsx` with 24 tests
- [x] TypeScript compilation passes
- [x] All tests passing (7290 tests)
- [x] Pre-commit gates pass

**Notes:**
- Finding 4.1 (Framer Motion lazy load) requires app-wide refactor to lazy load framer-motion at the component level. Current inline `motion.div` usage doesn't benefit from React.lazy at the component declaration level. This is an architectural decision for app-wide bundle optimization.

---

## 13. Archive Note

**Archived:** 2026-03-20 22:22 IST  
**Reason:** ALL actionable findings resolved:
- 1.1, 1.2, 2.1, 5.2, 6.1, 7.1, 4.2 - FIXED
- 4.1 - Requires app-wide architectural refactor (out of scope for single-component audit)

**Files Changed:**
- `src/frontend/src/components/OnboardingFlow.tsx` - All bug fixes and improvements
- `src/frontend/src/components/__tests__/OnboardingFlow.test.tsx` - 24 test cases

**Verification:**
- TypeScript: ✅ Passes
- Tests: 291 files, 7290 tests ✅

---

**Audit Complete - Archived.**
