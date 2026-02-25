# Audit: ProfileSelector.tsx

**Ticket**: TCK-20260225-901

**Target**: `src/frontend/src/components/ui/ProfileSelector.tsx`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 3, Risk 2, Complexity 2, Changeability 2, Learning 1 = **10/25**

---

## Why This File?

This is the **Profile Selector dropdown** - allows switching between child profiles. Uses Framer Motion for animations.

---

## Scoring Rationale

| Criterion     | Score | Justification                         |
| ------------- | ----- | ------------------------------------- |
| Impact        | 3     | Profile switching UI - used in header |
| Risk          | 2     | Low risk - isolated component         |
| Complexity    | 2     | Medium - dropdown with animations     |
| Changeability | 2     | Easy to extend                        |
| Learning      | 1     | Standard React patterns               |

---

## Finding: PROF-01 — null.toUpperCase() Error (P0)

**Evidence** (line 101): `profile.preferred_language.toUpperCase()` could crash if undefined.

**Root Cause**: No null check.

**Fix Idea**: Add optional chaining.

---

## Finding: PROF-02 — onSelect?.(null as any) (P2)

**Evidence** (line 91): Type cast to `any` to pass null.

**Root Cause**: Type mismatch in callback.

**Fix Idea**: Fix onSelect type signature.

---

## Finding: PROF-03 — positionClasses Inside Component (P2)

**Evidence** (lines 37-42): positionClasses defined inside component.

**Root Cause**: Recreated on every render.

**Fix Idea**: Move outside component.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix                    |
| ------- | ----------- | -------- | ------ | ---------------------- |
| PROF-01 | Correctness | P0       | 0.5h   | Add null check         |
| PROF-02 | Type Safety | P2       | 1h     | Fix type signature     |
| PROF-03 | Performance | P2       | 0.5h   | Move outside component |

---

## Related Artifacts

- `src/frontend/src/store/profileStore.ts`
