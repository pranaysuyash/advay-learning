# Audit: Skeleton.tsx

**Target**: `src/frontend/src/components/ui/Skeleton.tsx`  
**Date**: 2026-02-25  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 2, Risk 1, Complexity 1, Changeability 3, Learning 1 = **8/25**

---

## Why This File?

This is the **Skeleton component** - loading placeholder with pre-built variants (Card, Stat, Avatar, Text).

---

## Scoring Rationale

| Criterion     | Score | Justification              |
| ------------- | ----- | -------------------------- |
| Impact        | 2     | Low - utility component    |
| Risk          | 1     | Very low risk - isolated   |
| Complexity    | 1     | Simple - static components |
| Changeability | 3     | Easy to extend             |
| Learning      | 1     | Standard React patterns    |

---

## Finding: SKE-01 — getSizeClass Recreated Every Render (P2)

**Evidence** (lines 35-40): getSizeClass function defined inside file, called each render.

**Root Cause**: Minor performance issue.

**Fix Idea**: Use useMemo or move outside.

---

## Finding: SKE-02 — Magic Numbers in Maps (P2)

**Evidence** (lines 12-28): Hardcoded size values in maps.

**Root Cause**: Not configurable.

**Fix Idea**: Document expected values.

---

## Finding: SKE-03 — Loading Wrapper Renders Fragments (P3)

**Evidence** (lines 118-122): Loading returns fragments `<>...</>`.

**Root Cause**: Extra DOM nodes.

**Fix Idea**: Use React.Fragment explicitly if needed.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                |
| ------ | ----------- | -------- | ------ | ------------------ |
| SKE-01 | Performance | P2       | 0.5h   | Use useMemo        |
| SKE-02 | DX          | P2       | 0.5h   | Document values    |
| SKE-03 | Performance | P3       | 0.5h   | Optimize fragments |

---

## Related Artifacts

- `src/frontend/src/components/ui/index.ts`
