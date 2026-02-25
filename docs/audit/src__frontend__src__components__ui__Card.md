# Audit: Card.tsx

**Ticket**: TCK-20260225-901

**Target**: `src/frontend/src/components/ui/Card.tsx`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 3, Risk 2, Complexity 2, Changeability 3, Learning 1 = **11/25**

---

## Why This File?

This is the **Card component** - base card with variants (StatCard, FeatureCard). Uses Framer Motion for animations.

---

## Scoring Rationale

| Criterion     | Score | Justification                      |
| ------------- | ----- | ---------------------------------- |
| Impact        | 3     | Used for dashboard cards           |
| Risk          | 2     | Low risk - well-isolated component |
| Complexity    | 2     | Medium - framer-motion             |
| Changeability | 3     | Easy to extend                     |
| Learning      | 1     | Standard React patterns            |

---

## Finding: CARD-01 — Magic Numbers in Animation (P3)

**Evidence** (line 34): Hardcoded `y: -4, boxShadow: '0 12px 0 0 rgba(0, 0, 0, 0.05)'`.

**Root Cause**: Not using design tokens.

**Fix Idea**: Use CSS variables.

---

## Finding: CARD-02 — Missing Type for onClick Prop (P2)

**Evidence** (line 6): onClick type is `() => void` - not standard ButtonHTMLAttributes.

**Root Cause**: Inconsistent with React patterns.

**Fix Idea**: Extend proper HTML attributes.

---

## Finding: CARD-03 — Inline Padding Object (P2)

**Evidence** (lines 16-21): paddings object defined inside component.

**Root Cause**: Recreated on every render.

**Fix Idea**: Move outside component or use useMemo.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix                    |
| ------- | ----------- | -------- | ------ | ---------------------- |
| CARD-01 | DX          | P3       | 1h     | Use design tokens      |
| CARD-02 | Type Safety | P2       | 1h     | Extend HTML attributes |
| CARD-03 | Performance | P2       | 0.5h   | Move outside component |

---

## Related Artifacts

- `src/frontend/src/components/ui/Button.tsx`
