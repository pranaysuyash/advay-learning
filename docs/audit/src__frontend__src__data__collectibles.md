# Audit: collectibles.ts

**Target**: `src/frontend/src/data/collectibles.ts`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 2, Complexity 2, Changeability 3, Learning 1 = **12/25**

---

## Why This File?

This is the **collectibles data module** - master catalog of all items (elements, colors, shapes, creatures, etc.) with rarity, drop tables, and item lookup functions.

---

## Scoring Rationale

| Criterion     | Score | Justification                           |
| ------------- | ----- | --------------------------------------- |
| Impact        | 4     | All game rewards come from this catalog |
| Risk          | 2     | Static data, low risk                   |
| Complexity    | 2     | Simple data arrays                      |
| Changeability | 3     | Easy to add new items                   |
| Learning      | 1     | Standard data patterns                  |

---

## Finding: COLL-01 — Duplicate Emoji in Notes (P2)

**Evidence** (lines 68-75): note-do, note-re, note-mi all use same emoji '🎵'.

**Root Cause**: Not differentiated.

**Fix Idea**: Use different emojis per note.

---

## Finding: COLL-02 — Duplicate Emoji in Shapes (P2)

**Evidence** (line 61, 64): shape-triangle '🔺' vs '🔻' missing.

**Root Cause**: Missing variant.

**Fix Idea**: Add triangle variants.

---

## Finding: COLL-03 — RARITY_CONFIG Exported Late (P3)

**Evidence** (lines 20-25): Defined at line 20 but could be at top.

**Root Cause**: Code organization.

**Fix Idea**: Move to top for consistency.

---

## Finding: COLL-04 — No Validation in rollDropsFromTable (P2)

**Evidence** (lines 167-176): No validation that itemId exists in ITEMS_BY_ID.

**Root Cause**: Could reference invalid items.

**Fix Idea**: Add validation.

---

## Finding: COLL-05 — Missing Fun Facts (P3)

**Evidence**: Not all items have funFact field.

**Root Cause**: Incomplete data.

**Fix Idea**: Add fun facts to all items.

---

## Prioritized Backlog

| ID      | Category     | Severity | Effort | Fix                       |
| ------- | ------------ | -------- | ------ | ------------------------- |
| COLL-01 | Correctness  | P2       | 0.5h   | Fix note emojis           |
| COLL-02 | Correctness  | P2       | 0.5h   | Add triangle variant      |
| COLL-03 | DX           | P3       | 0.5h   | Move RARITY_CONFIG to top |
| COLL-04 | Correctness  | P2       | 1h     | Add itemId validation     |
| COLL-05 | Completeness | P3       | 2h     | Add fun facts             |

---

## Related Artifacts

- `src/frontend/src/store/inventoryStore.ts`
- `src/frontend/src/data/gameRegistry.ts`
