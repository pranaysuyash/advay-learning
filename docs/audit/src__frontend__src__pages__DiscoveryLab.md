# Audit: DiscoveryLab.tsx

**Target**: `src/frontend/src/pages/DiscoveryLab.tsx`  
**Date**: 2026-02-25  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 3, Risk 2, Complexity 2, Changeability 3, Learning 1 = **11/25**

---

## Why This File?

This is the **Discovery Lab** - crafting/combining game where kids combine collected items to discover new things with science facts.

---

## Scoring Rationale

| Criterion     | Score | Justification            |
| ------------- | ----- | ------------------------ |
| Impact        | 3     | Discovery gameplay       |
| Risk          | 2     | Low risk - isolated      |
| Complexity    | 2     | Medium - inventory logic |
| Changeability | 3     | Easy to extend           |
| Learning      | 1     | Standard React patterns  |

---

## Finding: DLAB-01 — Missing CurrentProfile ID Check (P1)

**Evidence** (line 45): `currentProfileId` used without null check in recordProgressActivity.

**Root Cause**: Could fail if no profile.

**Fix Idea**: Add null check.

---

## Finding: DLAB-02 — Inline RecipeCard Component (P2)

**Evidence** (lines 220-320): RecipeCard defined inline in same file.

**Root Cause**: Could be extracted for reusability.

**Fix Idea**: Extract to separate file.

---

## Finding: DLAB-03 — Unused location in useEffect (P2)

**Evidence** (line 12): `useLocation` imported but location used only for pathname.

**Root Cause**: Minor - could use location.pathname directly.

**Fix Idea**: Simplify usage.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix               |
| ------- | ----------- | -------- | ------ | ----------------- |
| DLAB-01 | Reliability | P1       | 0.5h   | Add null check    |
| DLAB-02 | DX          | P2       | 1h     | Extract component |
| DLAB-03 | DX          | P2       | 0.25h  | Simplify location |

---

## Related Artifacts

- `src/frontend/src/store/inventoryStore.ts`
- `src/frontend/src/data/recipes.ts`
