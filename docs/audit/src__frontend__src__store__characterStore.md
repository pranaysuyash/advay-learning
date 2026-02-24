# Audit: characterStore.ts

**Target**: `src/frontend/src/store/characterStore.ts`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 2, Complexity 3, Changeability 3, Learning 2 = **14/25**

---

## Why This File?

This is the **character store** for mascot animation state (Pip, Lumi) - controls idle, thinking, happy, waiting, celebrating, dancing states.

---

## Scoring Rationale

| Criterion     | Score | Justification                                   |
| ------------- | ----- | ----------------------------------------------- |
| Impact        | 4     | Mascots are core UX - children engage with them |
| Risk          | 2     | UI state only, low risk                         |
| Complexity    | 3     | Multiple characters + states + positions        |
| Changeability | 3     | Feature-specific, stable                        |
| Learning      | 2     | Standard Zustand patterns                       |

---

## Finding: CHAR-01 — Duplicate State Types (P3)

**Evidence** (lines 3-4): pip.state and lumi.state have identical type literals.

**Root Cause**: No shared type.

**Fix Idea**: Extract CharacterStateType.

---

## Finding: CHAR-02 — get() Called in Convenience Actions (P2)

**Evidence** (lines 108-132): showCelebration etc call get() multiple times.

**Root Cause**: Inefficient.

**Fix Idea**: Use set with functional update.

---

## Finding: CHAR-03 — No Type Export (P3)

**Evidence**: CharacterState and CharacterActions not exported.

**Root Cause**: Not needed externally.

**Fix Idea**: Export if needed for components.

---

## Finding: CHAR-04 — Persisted But Large (P3)

**Evidence**: Persists entire state including positions.

**Root Cause**: Could bloat localStorage.

**Fix Idea**: Only persist essential settings.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix                    |
| ------- | ----------- | -------- | ------ | ---------------------- |
| CHAR-01 | DRY         | P3       | 0.5h   | Extract shared type    |
| CHAR-02 | Performance | P2       | 1h     | Use functional set     |
| CHAR-03 | DX          | P3       | 0.5h   | Export types if needed |
| CHAR-04 | Performance | P3       | 1h     | Reduce persisted state |

---

## Related Artifacts

- `src/frontend/src/components/game/SuccessAnimation.tsx`
- `src/frontend/src/pages/Dashboard.tsx`
