# Audit: gameRegistry.ts

**Target**: `src/frontend/src/data/gameRegistry.ts`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 2, Complexity 2, Changeability 3, Learning 1 = **13/25**

---

## Why This File?

This is the **game registry** - single source of truth for all games. Defines manifests, drop tables, easter eggs, worlds, vibes. Critical for the entire platform.

---

## Scoring Rationale

| Criterion     | Score | Justification                       |
| ------------- | ----- | ----------------------------------- |
| Impact        | 5     | Gatekeeper for entire game platform |
| Risk          | 2     | Static config, low risk             |
| Complexity    | 2     | Large but simple array              |
| Changeability | 3     | Easy to add games                   |
| Learning      | 1     | Standard registry pattern           |

---

## Finding: REG-01 — Duplicate shape-star Drop (P2)

**Evidence** (line 198): shape-star appears in both finger-number-show AND number-tap-trail with same 0.05 chance.

**Root Cause**: Could consolidate.

**Fix Idea**: Keep unique per game for variety.

---

## Finding: REG-02 — worldId vs vibe Inconsistency (P2)

**Evidence** (lines 207-213): shape-sequence has worldId='mind-maze' but should be 'shape-garden'.

**Root Cause**: Copy-paste error.

**Fix Idea**: Fix worldId to 'shape-garden'.

---

## Finding: REG-03 — Duplicate emoji in icon (P3)

**Evidence**: Multiple games use icon: 'sparkles'.

**Root Cause**: Not differentiated.

**Fix Idea**: Use more specific icons.

---

## Finding: REG-04 — color-bubble Not Defined (P2)

**Evidence** (line 423): drops includes 'color-bubble' but collectibles.ts doesn't have this item.

**Root Cause**: Invalid item reference.

**Fix Idea**: Add color-bubble to collectibles or fix drop.

---

## Finding: REG-05 — usesItems Never Used (P3)

**Evidence** (line 36): usesItems field defined but no games use it.

**Root Cause**: Not implemented.

**Fix Idea**: Document or remove.

---

## Prioritized Backlog

| ID     | Category     | Severity | Effort | Fix                          |
| ------ | ------------ | -------- | ------ | ---------------------------- |
| REG-01 | DRY          | P3       | 0.5h   | Consolidate duplicate drops  |
| REG-02 | Correctness  | P2       | 0.5h   | Fix worldId mismatch         |
| REG-03 | DX           | P3       | 1h     | Use specific icons           |
| REG-04 | Correctness  | P2       | 0.5h   | Add or fix color-bubble      |
| REG-05 | Completeness | P3       | 1h     | Document or remove usesItems |

---

## Related Artifacts

- `src/frontend/src/data/collectibles.ts`
- `src/frontend/src/pages/index.tsx`
