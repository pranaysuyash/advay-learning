# Audit: Tooltip.tsx

**Target**: `src/frontend/src/components/ui/Tooltip.tsx`  
**Date**: 2026-02-25  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 2, Risk 1, Complexity 1, Changeability 3, Learning 1 = **8/25**

---

## Why This File?

This is the **Tooltip component** - hover/focus triggered tooltip with positioning, delay, and arrow. Includes HelpTooltip variant.

---

## Scoring Rationale

| Criterion     | Score | Justification            |
| ------------- | ----- | ------------------------ |
| Impact        | 2     | Low - utility component  |
| Risk          | 1     | Very low risk - isolated |
| Complexity    | 1     | Simple timer logic       |
| Changeability | 3     | Easy to extend           |
| Learning      | 1     | Standard React patterns  |

---

## Finding: TOOL-01 — positions/arrowPositions Inside Component (P2)

**Evidence** (lines 30-40): Objects defined inside component, recreated each render.

**Root Cause**: Minor performance issue.

**Fix Idea**: Move outside component.

---

## Finding: TOOL-02 — delay Default 0.3s Too Long (P2)

**Evidence** (line 13): Default delay of 0.3s (300ms) feels sluggish.

**Root Cause**: UX issue.

**Fix Idea**: Consider 0.2s default.

---

## Finding: TOOL-03 — Missing Keyboard Support (P3)

**Evidence**: Only mouse events, limited keyboard accessibility.

**Root Cause**: Accessibility gap.

**Fix Idea**: Add keyboard listeners.

---

## Prioritized Backlog

| ID      | Category      | Severity | Effort | Fix                  |
| ------- | ------------- | -------- | ------ | -------------------- |
| TOOL-01 | Performance   | P2       | 0.5h   | Move objects outside |
| TOOL-02 | UX            | P2       | 0.5h   | Reduce default delay |
| TOOL-03 | Accessibility | P3       | 1h     | Add keyboard support |

---

## Related Artifacts

- `src/frontend/src/components/ui/index.ts`
