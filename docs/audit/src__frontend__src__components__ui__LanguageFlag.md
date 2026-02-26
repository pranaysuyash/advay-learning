# Audit: LanguageFlag.tsx

**Target**: `src/frontend/src/components/ui/LanguageFlag.tsx`  
**Date**: 2026-02-25  
**Source Ticket**: `TCK-20260225-004`  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 2, Risk 1, Complexity 1, Changeability 3, Learning 1 = **8/25**

---

## Why This File?

This is the **Language Flag component** - CSS-based flags using SVG. Includes LanguageFlag and LanguageSelector.

---

## Scoring Rationale

| Criterion     | Score | Justification            |
| ------------- | ----- | ------------------------ |
| Impact        | 2     | Low - utility component  |
| Risk          | 1     | Very low risk - isolated |
| Complexity    | 1     | Simple - SVG rendering   |
| Changeability | 3     | Easy to extend           |
| Learning      | 1     | Standard React patterns  |

---

## Finding: LANG-01 — sizeClasses Inside Component (P2)

**Evidence** (lines 16-20): sizeClasses defined inside component.

**Root Cause**: Recreated each render.

**Fix Idea**: Move outside component.

---

## Finding: LANG-02 — Only en and in Flags (P2)

**Evidence** (lines 24-82): Only English and Indian flags implemented.

**Root Cause**: Limited language support.

**Fix Idea**: Add more country flags.

---

## Finding: LANG-03 — class vs className (P1)

**Evidence** (lines 27, 84): Uses `class` instead of `className` - JSX error.

**Root Cause**: Syntax error.

**Fix Idea**: Change to className.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix                    |
| ------- | ----------- | -------- | ------ | ---------------------- |
| LANG-03 | Correctness | P1       | 0.5h   | Fix class → className  |
| LANG-01 | Performance | P2       | 0.5h   | Move outside component |
| LANG-02 | Feature     | P2       | 2h     | Add more flags         |

---

## Related Artifacts

- `src/frontend/src/data/languages.ts`
