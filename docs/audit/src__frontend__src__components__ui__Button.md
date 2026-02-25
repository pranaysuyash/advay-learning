# Audit: Button.tsx

**Target**: `src/frontend/src/components/ui/Button.tsx`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 2, Complexity 2, Changeability 3, Learning 1 = **12/25**

---

## Why This File?

This is the **Button component** - primary UI component with 5 variants, 3 sizes, loading state, icons. Used throughout the app.

---

## Scoring Rationale

| Criterion     | Score | Justification                          |
| ------------- | ----- | -------------------------------------- |
| Impact        | 4     | Primary button component used app-wide |
| Risk          | 2     | Low risk - well-tested UI component    |
| Complexity    | 2     | Medium - styled components             |
| Changeability | 3     | Easy to add variants                   |
| Learning      | 1     | Standard patterns                      |

---

## Finding: BTN-01 — Duplicated iconSizes (P2)

**Evidence** (lines 81-85, 154-158): iconSizes defined in both Button and ButtonLink.

**Root Cause**: Code duplication.

**Fix Idea**: Extract to shared constant.

---

## Finding: BTN-02 — Magic Numbers in Styles (P3)

**Evidence** (lines 37, 46-50): Hardcoded shadow values like '0*6px_0_0*#000000'.

**Root Cause**: Not using design tokens.

**Fix Idea**: Use CSS variables.

---

## Finding: BTN-03 — Missing children Prop Validation (P2)

**Evidence**: children is required but no runtime validation.

**Root Cause**: Could render empty buttons.

**Fix Idea**: Add PropTypes or runtime check.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                           |
| ------ | ----------- | -------- | ------ | ----------------------------- |
| BTN-01 | DRY         | P2       | 0.5h   | Extract iconSizes to constant |
| BTN-02 | DX          | P3       | 2h     | Use CSS variables             |
| BTN-03 | Correctness | P2       | 1h     | Add validation                |

---

## Related Artifacts

- `src/frontend/src/components/ui/Icon.tsx`
- `src/frontend/src/utils/hooks/useAudio.ts`
