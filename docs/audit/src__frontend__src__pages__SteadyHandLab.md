# Audit: SteadyHandLab.tsx

**Target**: `src/frontend/src/pages/SteadyHandLab.tsx`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 3, Changeability 3, Learning 2 = **15/25**

---

## Why This File?

This is the **Steady Hand Lab game page** - a hand tracking game where users hold their finger steady inside target rings. Similar patterns to ShapePop.

---

## Scoring Rationale

| Criterion     | Score | Justification                                |
| ------------- | ----- | -------------------------------------------- |
| Impact        | 4     | Popular hand tracking game                   |
| Risk          | 3     | Game logic complexity                        |
| Complexity    | 3     | Hold progress tracking + hand tracking + TTS |
| Changeability | 3     | Game-specific code                           |
| Learning      | 2     | Standard game patterns                       |

---

## Finding: SH-01 — holdProgressRef Manual Sync (P2)

**Evidence** (lines 62-65): Manual useEffect syncs holdProgressRef.

**Root Cause**: Could use functional updates.

**Fix Idea**: Use refs only for values needed in callbacks.

---

## Finding: SH-02 — Duplicate Code with ShapePop (P2)

**Evidence**: Very similar patterns to ShapePop.tsx (startGame, handleFrame, etc.)

**Root Cause**: No shared game hook abstraction.

**Fix Idea**: Extract shared useHandTrackingGame hook.

---

## Finding: SH-03 — setTimeout Pattern in Callback (P2)

**Evidence** (lines 170-174): setTimeout inside callback like ShapePop.

**Root Cause**: Side effect in callback.

**Fix Idea**: Move to useEffect.

---

## Finding: SH-04 — Same void Promise Pattern (P2)

**Evidence** (lines 151, 155, 158, etc.): Same void speak(), void playX() pattern.

**Root Cause**: Fire-and-forget without error handling.

**Fix Idea**: Extract to utility function with error handling.

---

## Finding: SH-05 — Asset Preload on Every Mount (P2)

**Evidence** (lines 70-86): Asset preloading in useEffect on every mount.

**Root Cause**: Could be done once globally.

**Fix Idea**: Move to app initialization.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                          |
| ----- | ----------- | -------- | ------ | ---------------------------- |
| SH-01 | Performance | P2       | 1h     | Refactor ref usage           |
| SH-02 | DX          | P2       | 4h     | Extract shared game hook     |
| SH-03 | Correctness | P2       | 0.5h   | Move setTimeout to useEffect |
| SH-04 | Reliability | P2       | 1h     | Add promise error handling   |
| SH-05 | Performance | P2       | 2h     | Global asset preloading      |

---

## Related Artifacts

- `src/frontend/src/pages/ShapePop.tsx`
- `src/frontend/src/hooks/useGameHandTracking.ts`
