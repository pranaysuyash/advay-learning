# Audit: CollapsibleSection.tsx

**Target**: `src/frontend/src/components/ui/CollapsibleSection.tsx`  
**Date**: 2026-02-25  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 2, Risk 1, Complexity 1, Changeability 3, Learning 1 = **8/25**

---

## Why This File?

This is the **Collapsible Section component** - accordion-style expandable sections with Framer Motion animations.

---

## Scoring Rationale

| Criterion     | Score | Justification            |
| ------------- | ----- | ------------------------ |
| Impact        | 2     | Low - utility component  |
| Risk          | 1     | Very low risk - isolated |
| Complexity    | 1     | Simple animation         |
| Changeability | 3     | Easy to extend           |
| Learning      | 1     | Standard React patterns  |

---

## Finding: COLL-01 — Inverted Rotation Logic (P2)

**Evidence** (lines 34-36): `rotate: isOpen ? 0 : 90` - inverted from typical chevron behavior.

**Root Cause**: Counterintuitive.

**Fix Idea**: Use `isOpen ? 90 : 0`.

---

## Finding: COLL-02 — Title Sanitization in ID (P2)

**Evidence** (lines 28, 45): `title.replace(/\s+/g, '-').toLowerCase()` used for ID generation.

**Root Cause**: Could create invalid IDs with special chars.

**Fix Idea**: Use unique ID generator.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix                |
| ------- | ----------- | -------- | ------ | ------------------ |
| COLL-01 | UX          | P2       | 0.5h   | Fix rotation logic |
| COLL-02 | Correctness | P2       | 0.5h   | Use unique ID      |

---

## Related Artifacts

- `src/frontend/src/components/ui/index.ts`
