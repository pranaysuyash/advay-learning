# Audit: easterEggs.ts

**Target**: `src/frontend/src/data/easterEggs.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Ticket**: `TCK-20260224-032`  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 2, Complexity 2, Changeability 3, Learning 1 = **12/25**

---

## Why This File?

This is the **easter egg definitions** - hidden discoverable items within games. Contains triggers, rewards, hints, and difficulty levels for 17 easter eggs.

---

## Scoring Rationale

| Criterion     | Score | Justification                         |
| ------------- | ----- | ------------------------------------- |
| Impact        | 4     | Enhances gameplay with hidden content |
| Risk          | 2     | Static config, low risk               |
| Complexity    | 2     | Simple array                          |
| Changeability | 3     | Easy to add new easter eggs           |
| Learning      | 1     | Simple pattern                        |

---

## Finding: EGGS-01 — Duplicate eggs in Registry (P2)

**Evidence**: Many eggs are defined in both gameRegistry.ts AND easterEggs.ts.

**Root Cause**: Redundant definitions.

**Fix Idea**: Consolidate to one source.

---

## Finding: EGGS-02 — Typo in trigger (P2)

**Evidence** (line 95): 'perfect-streak-10' used in simon-says but egg says 'perfect-streak-10'.

**Root Cause**: Need to verify consistency.

**Fix Idea**: Verify all triggers match game logic.

---

## Finding: EGGS-03 — EASTER_EGGS_BY_GAME Computed at Import (P2)

**Evidence** (lines 189-193): Loop runs at import time.

**Root Cause**: Side effect at module load.

**Fix Idea**: Use getter function instead.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix                        |
| ------- | ----------- | -------- | ------ | -------------------------- |
| EGGS-01 | DRY         | P2       | 2h     | Consolidate to one source  |
| EGGS-02 | Correctness | P2       | 0.5h   | Verify trigger consistency |
| EGGS-03 | Performance | P3       | 1h     | Use lazy computation       |

---

## Related Artifacts

- `src/frontend/src/data/gameRegistry.ts`
- `src/frontend/src/store/inventoryStore.ts`
