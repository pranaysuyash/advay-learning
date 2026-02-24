# Audit: ShapePop.tsx

**Target**: `src/frontend/src/pages/ShapePop.tsx`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 3, Changeability 3, Learning 2 = **15/25**

---

## Why This File?

This is the **Shape Pop game page** - a hand tracking game where users pinch to pop shapes. Uses normalized coordinates and integrates with hand tracking system.

---

## Scoring Rationale

| Criterion     | Score | Justification                                |
| ------------- | ----- | -------------------------------------------- |
| Impact        | 4     | Popular hand tracking game                   |
| Risk          | 3     | Game logic complexity                        |
| Complexity    | 3     | Hand tracking + game state + TTS integration |
| Changeability | 3     | Game-specific code                           |
| Learning      | 2     | Standard game patterns                       |

---

## Finding: SP-01 — scoreRef Manual Sync (P2)

**Evidence** (lines 50-52): Manual useEffect syncs scoreRef on every score change.

**Root Cause**: Could use functional update instead.

**Fix Idea**: Use functional updates in handleFrame.

---

## Finding: SP-02 — Missing useCallback Dependencies (P2)

**Evidence** (lines 83-120): handleFrame depends on cursor, targetCenter but uses them directly.

**Root Cause**: Potential stale closures in frame callback.

**Fix Idea**: Use refs for values needed in callback.

---

## Finding: SP-03 — setTimeout in render (P2)

**Evidence** (line 104): `setTimeout(() => setShowCelebration(false), 3000)` inside callback.

**Root Cause**: Side effect in callback function.

**Fix Idea**: Move to useEffect.

---

## Finding: SP-04 — Conditional void Calls (P2)

**Evidence** (lines 96, 98, 108, etc.): `void speak(...)`, `void playPop()` - ignoring promises.

**Root Cause**: Fire-and-forget pattern without error handling.

**Fix Idea**: Add .catch() or use toast for errors.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                          |
| ----- | ----------- | -------- | ------ | ---------------------------- |
| SP-01 | Performance | P2       | 1h     | Use functional updates       |
| SP-02 | Correctness | P2       | 1h     | Fix callback dependencies    |
| SP-03 | Correctness | P2       | 0.5h   | Move setTimeout to useEffect |
| SP-04 | Reliability | P2       | 1h     | Add promise error handling   |

---

## Related Artifacts

- `src/frontend/src/hooks/useGameHandTracking.ts`
- `src/frontend/src/components/game/GameCursor.tsx`
