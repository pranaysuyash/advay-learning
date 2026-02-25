# Audit: gameStore.ts

**Target**: `src/frontend/src/store/gameStore.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 3, Changeability 3, Learning 2 = **15/25**

---

## Why This File?

This is the **Zustand game state store** for managing hand tracking data, drawing strokes, and game state (score, level, time).

---

## Scoring Rationale

| Criterion     | Score | Justification                        |
| ------------- | ----- | ------------------------------------ |
| Impact        | 4     | Central game state management        |
| Risk          | 3     | State bugs affect all games          |
| Complexity    | 3     | Zustand store with multiple concerns |
| Changeability | 3     | Game-specific state                  |
| Learning      | 2     | Standard Zustand patterns            |

---

## Finding: GS-01 — Mixed Concerns in One Store (P2)

**Evidence**: Lines 1-70 - handles game state, hand tracking, AND drawing.

**Root Cause**: No separation of concerns.

**Fix Idea**: Split into useGameStateStore, useHandTrackingStore, useDrawingStore.

---

## Finding: GS-02 — HandData Interface Duplicated (P2)

**Evidence** (line 2-8): HandData defined here, also in tracking.ts.

**Root Cause**: No single source.

**Fix Idea**: Import from tracking.ts instead.

---

## Finding: GS-03 — tick() Called But No Interval Set (P2)

**Evidence** (line 68): tick() decrements timeLeft, but no interval in store.

**Root Cause**: Consumer must set interval.

**Fix Idea**: Add optional auto-tick or document requirement.

---

## Finding: GS-04 — timeLeft Hardcoded to 30s (P2)

**Evidence** (line 20, 43, 46): 30s everywhere.

**Root Cause**: Not configurable.

**Fix Idea**: Accept initial config in startGame.

---

## Prioritized Backlog

| ID    | Category     | Severity | Effort | Fix                           |
| ----- | ------------ | -------- | ------ | ----------------------------- |
| GS-01 | Architecture | P2       | 3h     | Split into separate stores    |
| GS-02 | DRY          | P2       | 0.5h   | Import HandData from tracking |
| GS-03 | DX           | P2       | 0.5h   | Document interval requirement |
| GS-04 | Flexibility  | P2       | 1h     | Accept config in startGame    |

---

## Related Artifacts

- `src/frontend/src/types/tracking.ts`
- `src/frontend/src/pages/SteadyHandLab.tsx`
