# Audit: useGameDrops.ts

**Target**: `src/frontend/src/hooks/useGameDrops.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 2, Changeability 2, Learning 2 = **13/25**

---

## Why This File?

This is the **game drops hook** for the item/gacha system. Integrates with inventory store to reward players with items after completing games.

---

## Scoring Rationale

| Criterion     | Score | Justification                                   |
| ------------- | ----- | ----------------------------------------------- |
| Impact        | 4     | Game progression rewards system                 |
| Risk          | 3     | Rewards system, issues affect player engagement |
| Complexity    | 2     | Simple wrapper around inventory store           |
| Changeability | 2     | Stable API                                      |
| Learning      | 2     | Standard Zustand patterns                       |

---

## Finding: GD-01 — 1000ms Debounce May Be Too Short (P2)

**Evidence** (line 29): `if (now - lastProcessedRef.current < 1000) return [];`

**Root Cause**: Could still trigger double-drops in fast restart scenarios.

**Fix Idea**: Increase to 2000ms or use game session ID.

---

## Finding: GD-02 — Console.warn Instead of Error Tracking (P3)

**Evidence** (line 46): `console.warn()` for unregistered easter eggs.

**Root Cause**: Soft error handling.

**Fix Idea**: Consider error tracking service.

---

## Finding: GD-03 — Missing Validation for gameId (P2)

**Evidence**: No validation that gameId exists in registry.

**Root Cause**: Could silently fail.

**Fix Idea**: Add validation or throw.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                    |
| ----- | ----------- | -------- | ------ | ---------------------- |
| GD-01 | Reliability | P2       | 0.5h   | Increase debounce time |
| GD-02 | DX          | P3       | 0.5h   | Add error tracking     |
| GD-03 | Correctness | P2       | 0.5h   | Add gameId validation  |

---

## Related Artifacts

- `src/frontend/src/store/inventoryStore.ts`
- `src/frontend/src/data/gameRegistry.ts`
