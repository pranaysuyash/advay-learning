# Audit: Layout.tsx

**Ticket**: TCK-20260225-901

**Target**: `src/frontend/src/components/ui/Layout.tsx`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 2, Complexity 2, Changeability 2, Learning 1 = **11/25**

---

## Why This File?

This is the **main Layout component** - wraps all pages with header, footer, demo mode banner, skip links. Critical for accessibility.

---

## Scoring Rationale

| Criterion     | Score | Justification                     |
| ------------- | ----- | --------------------------------- |
| Impact        | 4     | Wraps all pages - critical for UX |
| Risk          | 2     | Low risk - isolated component     |
| Complexity    | 2     | Medium - nav, routing, demo mode  |
| Changeability | 2     | Stable API                        |
| Learning      | 1     | Standard layout patterns          |

---

## Finding: LAY-01 — window.location.href (P1)

**Evidence** (line 15): Uses `window.location.href = '/'` instead of React Router.

**Root Cause**: Could cause full page reload.

**Fix Idea**: Use useNavigate hook.

---

## Finding: LAY-02 — Missing useCalmModeContext Provider (P2)

**Evidence** (line 6): Uses useCalmModeContext but no default.

**Root Cause**: Could crash if provider missing.

**Fix Idea**: Add fallback or document requirement.

---

## Finding: LAY-03 — Hardcoded Nav Links (P2)

**Evidence** (lines 21-26): navLinks defined inside component.

**Root Cause**: Not configurable.

**Fix Idea**: Move to config or props.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                         |
| ------ | ----------- | -------- | ------ | --------------------------- |
| LAY-01 | Performance | P1       |        | Use use0.5hNavigate instead |
| LAY-02 | Reliability | P2       | 1h     | Add fallback or document    |
| LAY-03 | Flexibility | P2       | 1h     | Make configurable           |

---

## Related Artifacts

- `src/frontend/src/store/settingsStore.ts`
- `src/frontend/src/components/CalmModeProvider.tsx`
