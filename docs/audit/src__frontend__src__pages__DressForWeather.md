# Audit: DressForWeather.tsx

**Target**: `src/frontend/src/pages/DressForWeather.tsx`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Source Ticket**: TCK-20260225-004
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 4, Changeability 3, Learning 2 = **16/25**

---

## Why This File?

This is the **Dress for Weather game page** - a drag-and-drop clothing matching game. Uses DragDropSystem, hand tracking, and voice instructions.

---

## Scoring Rationale

| Criterion     | Score | Justification                                  |
| ------------- | ----- | ---------------------------------------------- |
| Impact        | 4     | Educational game - weather awareness           |
| Risk          | 3     | Multiple systems integrated                    |
| Complexity    | 4     | Hand tracking + drag-drop + voice + game state |
| Changeability | 3     | Game-specific code                             |
| Learning      | 2     | Standard game patterns                         |

---

## Finding: DW-01 — Duplicate lastHandStateRef Pattern (P2)

**Evidence** (lines 183-197): Same lastHandStateRef pattern as other games.

**Root Cause**: No shared hook for hand detection state.

**Fix Idea**: Extract to useHandDetection hook.

---

## Finding: DW-02 — setTimeout in Callback (P2)

**Evidence** (lines 334-345): setTimeout inside callback for level progression.

**Root Cause**: Side effect in callback.

**Fix Idea**: Use useEffect triggered by correctlyPlaced change.

---

## Finding: DW-03 — screenDims State Duplicates window Size (P2)

**Evidence** (lines 206-214): Manual resize handling, but could use useWindowSize hook.

**Root Cause**: Custom implementation.

**Fix Idea**: Extract to useWindowSize hook.

---

## Finding: DW-04 — Hardcoded Magic Numbers (P2)

**Evidence** (lines 279, 286, 301): `100`, `140`, `200`, `120`, `350` scattered.

**Root Cause**: No constants.

**Fix Idea**: Add constants at top.

---

## Finding: DW-05 — Incorrect winter-hat Emoji (P2)

**Evidence** (line 67): Uses '🎩' (top hat) instead of '🧶' or '🎿'.

**Root Cause**: Wrong emoji selected.

**Fix Idea**: Fix emoji to match winter-hat.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                          |
| ----- | ----------- | -------- | ------ | ---------------------------- |
| DW-01 | DX          | P2       | 2h     | Extract hand detection hook  |
| DW-02 | Correctness | P2       | 1h     | Move setTimeout to useEffect |
| DW-03 | DX          | P2       | 1h     | Extract useWindowSize hook   |
| DW-04 | DX          | P2       | 0.5h   | Add constants                |
| DW-05 | Correctness | P2       | 0.5h   | Fix winter-hat emoji         |

---

## Related Artifacts

- `src/frontend/src/components/game/DragDropSystem.tsx`
- `src/frontend/src/hooks/useGameHandTracking.ts`
