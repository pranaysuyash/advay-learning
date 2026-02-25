# Audit: languages.ts

**Target**: `src/frontend/src/data/languages.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 3, Risk 1, Complexity 1, Changeability 3, Learning 1 = **9/25**

---

## Why This File?

This is the **language configuration** - static config for supported languages (en, hi, kn, te, ta) with code, name, nativeName, and flag icon.

---

## Scoring Rationale

| Criterion     | Score | Justification                        |
| ------------- | ----- | ------------------------------------ |
| Impact        | 3     | Important for i18n but limited scope |
| Risk          | 1     | Static config, very low risk         |
| Complexity    | 1     | Simple array                         |
| Changeability | 3     | Easy to add languages                |
| Learning      | 1     | Simple pattern                       |

---

## Finding: LANG-01 — Duplicate flagIcon (P3)

**Evidence** (lines 4-8): All Indian languages use same flagIcon '/assets/icons/ui/flag-in.svg'.

**Root Cause**: No per-language flags.

**Fix Idea**: Add language-specific flag icons or use flags in nativeName.

---

## Finding: LANG-02 — No getAllLanguages Helper (P3)

**Evidence**: No helper to get all languages.

**Fix Idea**: Add getAllLanguages() function.

---

## Prioritized Backlog

| ID      | Category | Severity | Effort | Fix                         |
| ------- | -------- | -------- | ------ | --------------------------- |
| LANG-01 | DX       | P3       | 1h     | Add language-specific flags |
| LANG-02 | DX       | P3       | 0.5h   | Add helper function         |

---

## Related Artifacts

- `src/frontend/src/pages/Settings.tsx`
