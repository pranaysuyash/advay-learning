# Audit: inventoryStore.ts

**Target**: `src/frontend/src/store/inventoryStore.ts`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 4, Complexity 4, Changeability 3, Learning 2 = **17/25**

---

## Why This File?

This is the **inventory store** for collectibles, crafting, easter eggs, and persistence. Complex gacha/drop system.

---

## Scoring Rationale

| Criterion     | Score | Justification                      |
| ------------- | ----- | ---------------------------------- |
| Impact        | 4     | Player progression & rewards       |
| Risk          | 4     | Persistence bugs = lost progress   |
| Complexity    | 4     | Drop tables, crafting, easter eggs |
| Changeability | 3     | Core feature, stable               |
| Learning      | 2     | Standard game patterns             |

---

## Finding: INV-01 — get() Called in Loop (P2)

**Evidence** (lines 127-143): processGameCompletion calls get() in loop.

**Root Cause**: Inefficient.

**Fix Idea**: Capture state once before loop.

---

## Finding: INV-02 — Duplicate getItem Lookups (P2)

**Evidence** (lines 130, 138): getItem called multiple times.

**Root Cause**: Not cached.

**Fix Idea**: Store in variable.

---

## Finding: INV-03 — No Validation on addItem (P2)

**Evidence** (lines 60-85): addItem doesn't validate itemId exists.

**Root Cause**: Could add invalid items.

**Fix Idea**: Add validation.

---

## Finding: INV-04 — Silent Failures in craft (P2)

**Evidence** (lines 151-181): Returns error object but caller may ignore.

**Root Cause**: No error thrown.

**Fix Idea**: Consider throwing or Result type.

---

## Finding: INV-05 — Missing Type Export (P2)

**Evidence**: OwnedItem, CraftResult, ItemDrop exported but no index.

**Root Cause**: Manual exports.

**Fix Idea**: Add barrel export.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                       |
| ------ | ----------- | -------- | ------ | ------------------------- |
| INV-01 | Performance | P2       | 0.5h   | Capture state before loop |
| INV-02 | Performance | P2       | 0.5h   | Cache getItem results     |
| INV-03 | Correctness | P2       | 1h     | Add itemId validation     |
| INV-04 | DX          | P2       | 1h     | Add Result type           |
| INV-05 | DX          | P3       | 0.5h   | Add barrel export         |

---

## Related Artifacts

- `src/frontend/src/data/collectibles.ts`
- `src/frontend/src/data/gameRegistry.ts`
- `src/frontend/src/hooks/useGameDrops.ts`
