# Audit: i18n/config.ts

**Target**: `src/frontend/src/i18n/config.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 2, Complexity 2, Changeability 4, Learning 2 = **14/25**

---

## Why This File?

This is the **i18n configuration** - defines all 15 supported languages with code, name, nameLocal, and direction (RTL support). Critical for internationalization.

---

## Scoring Rationale

| Criterion     | Score | Justification             |
| ------------- | ----- | ------------------------- |
| Impact        | 4     | All i18n from this source |
| Risk          | 2     | Static config, low risk   |
| Complexity    | 2     | Simple array              |
| Changeability | 4     | Easy to add languages     |
| Learning      | 2     | i18next patterns          |

---

## Finding: I18N-01 — Language Count Mismatch (P0)

**Evidence**: config.ts has 15 languages but languages.ts only has 5 (en, hi, kn, te, ta).

**Root Cause**: Two separate sources of truth.

**Fix Idea**: Unify to single source (i18n/config.ts should be the source).

---

## Finding: I18N-02 — Missing RTL Flag Icons (P2)

**Evidence** (line 10): Arabic is RTL but no flag icon mapping in languages.ts.

**Root Cause**: Flag system doesn't handle RTL.

**Fix Idea**: Add RTL-aware flag handling.

---

## Finding: I18N-03 — No Lazy Load Error Handling (P2)

**Evidence** (line 68): Backend loadPath has no fallback if translation missing.

**Root Cause**: Could show blank text.

**Fix Idea**: Add fallback chain.

---

## Prioritized Backlog

| ID      | Category     | Severity | Effort | Fix                    |
| ------- | ------------ | -------- | ------ | ---------------------- |
| I18N-01 | Correctness  | P0       | 2h     | Unify to single source |
| I18N-02 | Completeness | P2       | 1h     | Add RTL flag handling  |
| I18N-03 | Reliability  | P2       | 1h     | Add fallback chain     |

---

## Related Artifacts

- `src/frontend/src/data/languages.ts`
- `src/frontend/src/i18n/I18nProvider.tsx`
