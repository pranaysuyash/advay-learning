# Audit: useGameLoop.ts
**Ticket:** TCK-20260223-018

**Target**: `src/frontend/src/hooks/useGameLoop.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 3, Complexity 4, Changeability 4, Learning 4 = **20/25**

---

## Why This File?

The hook is the **core game loop** for ALL games. It manages requestAnimationFrame timing, FPS limiting, and cleanup. It's used by every game component that needs a timing loop.

---

## Scoring Rationale

| Criterion     | Score | Justification                                               |
| ------------- | ----- | ----------------------------------------------------------- |
| Impact        | 5     | All games use this for timing loop                          |
| Risk          | 3     | Bugs cause frame drops/jank but less critical than tracking |
| Complexity    | 4     | rAF, accumulator pattern, FPS math, cleanup                 |
| Changeability | 4     | Well-isolated, easy to modify                               |
| Learning      | 4     | Good example of rAF patterns, controlled component          |

---

## Finding: GL-01 — Return Values Are Stale (P1)

**Evidence** (lines 217-222):

```typescript
return {
  fps: currentFpsRef.current,
  averageFps: averageFpsRef.current,
  isRunning,
  requestStart,
  requestStop,
};
```

**Root Cause**: `fps` and `averageFps` are read from refs on every render, but refs don't trigger re-renders. The values are stale until the consumer re-renders.

**Fix Idea**: Use `useState` to trigger updates when FPS changes, or document that consumers must use `onFrame` callback for real-time FPS.

---

## Finding: GL-02 — No Error Handling for RAF Failures (P2)

**Evidence** (lines 107-110):

```typescript
rafIdRef.current = requestAnimationFrame(loop);
```

**Root Cause**: `requestAnimationFrame` can fail in background tabs (returns undefined). No check for failure.

**Fix Idea**: Add guard: `if (rafIdRef.current === undefined) { /* handle error */ }`

---

## Finding: GL-03 — Target FPS Change Not Reactive (P2)

**Evidence** (lines 76-80):

```typescript
useEffect(() => {
  targetFpsRef.current = targetFps;
}, [targetFps]);
```

**Root Cause**: While the ref is updated, the running loop uses `targetFpsRef.current` which is fine—but changing FPS mid-loop could cause timing artifacts.

**Fix Idea**: Document that changing `targetFps` mid-run is not recommended, or reset accumulator on change.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                                         |
| ----- | ----------- | -------- | ------ | ------------------------------------------- |
| GL-01 | Correctness | P1       | 1h     | Add state for FPS updates OR document stale |
| GL-02 | Reliability | P2       | 0.5h   | Add RAF failure guard                       |
| GL-03 | DX          | P2       | 0.5h   | Document mid-run targetFps change behavior  |

---

## Suggested Experiments

### Exp 1: Adaptive FPS

- **Hypothesis**: Can dynamically adjust targetFps based on frame callback latency
- **Method**: Measure callback duration, auto-reduce FPS if > 16ms
- **Success**: Consistent frame time even under load

---

## Local PR Plan (GL-01 Fix)

**Scope**: Add state for FPS updates

**Steps**:

1. Add `const [fps, setFps] = useState(0)`
2. Call `setFps(currentFpsRef.current)` in the FPS update block
3. Return `fps` instead of ref value

---

## Related Artifacts

- `src/frontend/src/hooks/useGameHandTracking.ts` (uses this hook)
