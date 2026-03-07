# File Audit: src/frontend/src/hooks/useHandTracking.ts

**Audit Date:** 2026-03-06  
**Auditor:** Code Agent  
**Prompt Version:** audit-v1.5.1  
**File Version:** 49bc97a (HEAD)  
**Lines of Code:** 198  

---

## Execution Environment Declaration

- **Repo access:** YES
- **Git availability:** YES

---

## Executive Summary

**Status:** STABLE PRODUCTION CODE with minor gaps  
**Risk Level:** LOW  
**Recommended Action:** Document-only; no immediate remediation required

The `useHandTracking` hook is a well-engineered, production-ready abstraction for MediaPipe HandLandmarker initialization. It provides automatic GPU→CPU fallback, React Strict Mode compatibility, and proper cleanup. **This hook is the de facto hand tracking API** used by 15+ files across the codebase, explaining why the newer `VisionService` abstraction is orphaned.

---

## 1. File Purpose & Contract

**Observed:** This hook provides a React interface for initializing and managing MediaPipe's `HandLandmarker` instance.

**Public Interface:**
```typescript
function useHandTracking(options?: UseHandTrackingOptions): UseHandTrackingReturn
```

**Key Capabilities:**
- Lazy initialization (caller controls when to initialize)
- Automatic GPU→CPU delegate fallback
- React Strict Mode safe (mount/unmount tracking)
- Duplicate initialization prevention
- Proper resource cleanup

---

## 2. Code Quality Assessment

### 2.1 Strengths ✅

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| **Documentation** | Excellent | Header JSDoc with usage example (lines 1-22) |
| **Type Safety** | Strong | Uses imported types from `../types/tracking` |
| **Error Handling** | Good | Try-catch with delegate fallback loop (lines 100-128) |
| **Resource Management** | Excellent | `landmarker.close()` on unmount (lines 177-186) |
| **React Patterns** | Correct | `useRef` for mount/init flags, `useCallback` for stable references |
| **Strict Mode Safe** | Yes | `isMountedRef` checks before state updates (lines 130-151) |

### 2.2 Issues Found ⚠️

#### Issue-001: No Direct Unit Tests
- **Severity:** MEDIUM
- **Observed:** `ls src/frontend/src/hooks/__tests__/useHandTracking*` returns no files
- **Inferred:** Test coverage relies on `useGameHandTracking` tests (indirect)
- **Impact:** Regression risk if hook behavior changes

#### Issue-002: `any` Type in Return Interface
- **Severity:** LOW
- **Observed:** Line 64 in `types/tracking.ts`: `landmarker: any | null`
- **Inferred:** Loses MediaPipe type safety for consumers
- **Root Cause:** Import type not defined in shared types

#### Issue-003: Hard-coded CDN URLs
- **Severity:** LOW
- **Observed:** 
  - Line 87: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm`
  - Line 109: `https://storage.googleapis.com/mediapipe-models/...`
- **Inferred:** Version lock may cause drift with package.json
- **Unknown:** Whether these versions match the npm dependency

#### Issue-004: Missing VisionService Integration
- **Severity:** INFO (architectural observation)
- **Observed:** This hook directly uses `@mediapipe/tasks-vision`
- **Inferred:** `VisionService` (in `services/ai/vision/`) provides similar abstraction but is **not used**
- **Impact:** Two parallel abstractions for same capability

---

## 3. Dependencies Analysis

### 3.1 Load-Bearing Dependencies

| Dependency | Usage | Load-Bearing |
|------------|-------|--------------|
| `@mediapipe/tasks-vision` | `FilesetResolver`, `HandLandmarker` | **YES** - Core functionality |
| `react` (useState, useCallback, useRef, useEffect) | State management | **YES** - React primitive |
| `../types/tracking` | Type definitions | NO - TypeScript only |

### 3.2 External Asset Dependencies

**Observed:** Two external CDN fetches at runtime:

1. **WASM runtime** (line 87):
   - URL: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm`
   - Purpose: MediaPipe vision task runtime

2. **Hand Landmarker Model** (line 109):
   - URL: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`
   - Size: ~3MB (float16 quantized)
   - Purpose: Hand landmark detection model

**Risk:** External CDN dependency for core functionality. No offline fallback.

---

## 4. Usage Analysis

### 4.1 Direct Consumers (Observed via grep)

**Hooks (3):**
- `useHandTrackingRuntime.ts` - Runtime wrapper
- `useGameHandTracking.ts` - Game-specific wrapper (has tests)
- `useVisionWorkerRuntime.ts` - Web worker integration

**Components (3):**
- `HandDetectionContext.tsx` - Context provider
- `HandTrackingStatus.tsx` - UI component
- `GameCursor.tsx` - Cursor rendering

**Games/Pages (10+):**
- `AirCanvas.tsx`
- `ShapePop.tsx`
- `WordBuilder.tsx`
- `SteadyHandLab.tsx`
- `PhonicsSounds.tsx`
- (plus 10+ more via `useGameHandTracking`)

### 4.2 Indirect Consumers

**Inferred:** Most camera-based games use `useGameHandTracking` which wraps this hook.

---

## 5. Architecture Decision Record

### Why This Hook Exists (Instead of VisionService)

**Observed from git history:**
- Commit `49bc97a`: "Hand tracking feedback regression + React Strict Mode fix"
- Commit `3131c1f`: "Add implementation plan and worklog tickets"

**Inferred:**
This hook was created as part of a centralization effort (TCK-20260131-142) to consolidate duplicate MediaPipe initialization code across games. It predates the newer `VisionService` abstraction.

**Key Difference from VisionService:**

| Aspect | useHandTracking | VisionService |
|--------|-----------------|---------------|
| **Pattern** | React Hook | Service class |
| **State** | React state | Internal class state |
| **Re-renders** | Triggers React re-renders | External to React |
| **Usage** | Direct in components | Must bridge to React |
| **Adoption** | 15+ files | 0 files (orphaned) |

**Conclusion:** The hook is better suited for React component integration. VisionService would require a wrapper hook anyway.

---

## 6. Regression Analysis

### Git History

```
6537dbd - Comprehensive audits (2026-02-04)
49bc97a - React Strict Mode fix (2026-02-01) ← Most relevant
3131c1f - Initial implementation (2026-01-31)
```

### Key Fix (49bc97a)

**Problem:** React Strict Mode double-mount caused initialization failures.

**Solution:** Added `isInitializingRef` reset on unmount (lines 68-69):
```typescript
return () => {
  isMountedRef.current = false;
  isInitializingRef.current = false;  // ← Added
};
```

**Status:** Fix verified stable (no related commits since).

---

## 7. Security Assessment

| Vector | Status | Notes |
|--------|--------|-------|
| **XSS** | N/A | No user input handling |
| **CSP** | ⚠️ | External CDN URLs may require `script-src`/`connect-src` directives |
| **CORS** | N/A | CDN assets are public |
| **Secrets** | N/A | No secrets in code |

---

## 8. Performance Characteristics

| Aspect | Assessment |
|--------|------------|
| **Bundle Impact** | Low (dynamic imports from `@mediapipe/tasks-vision`) |
| **Runtime Memory** | Medium (holds HandLandmarker instance) |
| **Network** | High initial (~3MB model download) |
| **Re-render Efficiency** | Good (stable callbacks via `useCallback`) |

---

## 9. Testing Gap Analysis

| Test Type | Status | Gap |
|-----------|--------|-----|
| Unit tests | ❌ Missing | No `useHandTracking.test.ts` |
| Integration | ⚠️ Indirect | Via `useGameHandTracking.trackingLoss.test.ts` |
| E2E | Unknown | Not analyzed |

**Recommendation:** Add unit tests for:
- Initialization success path
- GPU→CPU fallback
- React Strict Mode double-mount behavior
- Cleanup on unmount

---

## 10. Findings Summary

### HIGH Priority
_None_

### MEDIUM Priority
1. **TEST-001:** Add dedicated unit tests for this hook

### LOW Priority
2. **TYPE-001:** Replace `any` with proper `HandLandmarker` type import
3. **CONFIG-001:** Align CDN version with package.json or make configurable

### INFO (No Action)
4. **ARCH-001:** VisionService remains orphaned by design - this hook is the canonical abstraction

---

## 11. Verification Commands

```bash
# Check test coverage
cd src/frontend && npm test -- useHandTracking

# Verify no duplicates
cd src/frontend && rg "HandLandmarker.createFromOptions" src/hooks --type ts

# Check type safety
cd src/frontend && npx tsc --noEmit src/hooks/useHandTracking.ts
```

---

## 12. Related Artifacts

- `docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md` - Original research
- `docs/REGRESSION_ANALYSIS_HAND_TRACKING.md` - Strict Mode fix details
- `src/frontend/src/types/tracking.ts` - Type definitions
- `src/frontend/src/hooks/useGameHandTracking.ts` - Primary consumer
- `src/frontend/src/services/ai/vision/VisionService.ts` - Unused alternative

---

**End of Audit**
