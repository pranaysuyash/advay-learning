# Audit: WordBuilder.tsx

**Target**: `src/frontend/src/pages/WordBuilder.tsx`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 4, Changeability 3, Learning 2 = **16/25**

---

## Why This File?

This is the **Word Builder game page** - a spelling game where users pinch letters in order. Has even more refs than other games.

---

## Scoring Rationale

| Criterion     | Score | Justification                           |
| ------------- | ----- | --------------------------------------- |
| Impact        | 4     | Educational game - spelling             |
| Risk          | 3     | Multiple game state variables           |
| Complexity    | 4     | 5 refs needing sync, complex game logic |
| Changeability | 3     | Game-specific code                      |
| Learning      | 2     | Standard game patterns                  |

---

## Finding: WB-01 — 5 Refs Need Manual Sync (P1)

**Evidence** (lines 62-90): targetsRef, stepIndexRef, wordRef, levelRef, timeLeftRef all manually synced.

**Root Cause**: Excessive ref-based state management.

**Fix Idea**: Use useReducer or consolidate state.

---

## Finding: WB-02 — Same Ref Pattern as Other Games (P2)

**Evidence**: Same pattern as ShapePop, SteadyHandLab.

**Root Cause**: No shared abstraction.

**Fix Idea**: Extract shared useGameState hook.

---

## Finding: WB-03 — levelTimeoutRef Not Cleaned on Reset (P2)

**Evidence** (lines 248-263): resetGame() clears timeout but could miss edge cases.

**Root Cause**: Manual cleanup required.

**Fix Idea**: Use useEffect cleanup.

---

## Finding: WB-04 — Same Void Promise Pattern (P2)

**Evidence** (lines 200, 203, 211, etc.): void speak(), void playX() everywhere.

**Root Cause**: Fire-and-forget without error handling.

**Fix Idea**: Create safeSpeak utility.

---

## Finding: WB-05 — Memory Leak in setInterval (P2)

**Evidence** (lines 130-142): Timer created but cleanup depends on isPlaying.

**Root Cause**: Could leak if component unmounts during play.

**Fix Idea**: Always cleanup in useEffect return.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                          |
| ----- | ----------- | -------- | ------ | ---------------------------- |
| WB-01 | Performance | P1       | 2h     | Consolidate state management |
| WB-02 | DX          | P2       | 4h     | Extract shared game hook     |
| WB-03 | Reliability | P2       | 1h     | Add useEffect cleanup        |
| WB-04 | Reliability | P2       | 1h     | Create safeSpeak utility     |
| WB-05 | Reliability | P2       | 1h     | Fix timer cleanup            |

---

## Related Artifacts

- `src/frontend/src/pages/ShapePop.tsx`
- `src/frontend/src/pages/SteadyHandLab.tsx`
