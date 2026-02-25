# Audit: alphabets.ts

**Target**: `src/frontend/src/data/alphabets.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 2, Complexity 3, Changeability 4, Learning 2 = **16/25**

---

## Why This File?

This is the **multi-language alphabet data** - 5 languages (en, hi, kn, te, ta) with 25-46 letters each. Critical for all alphabet learning games.

---

## Scoring Rationale

| Criterion     | Score | Justification                         |
| ------------- | ----- | ------------------------------------- |
| Impact        | 5     | Core learning content for 5 languages |
| Risk          | 2     | Static config, low risk               |
| Complexity    | 3     | Large data file with 100+ letters     |
| Changeability | 4     | Easy to add languages                 |
| Learning      | 2     | Complex multi-language patterns       |

---

## Finding: ALPH-01 — Icon Path References (P2)

**Evidence**: All icons use `/assets/icons/*` paths - need to verify they exist.

**Root Cause**: Many icon references could be missing.

**Fix Idea**: Add validation script to check all icon paths.

---

## Finding: ALPH-02 — Duplicate languageCodeMap (P2)

**Evidence** (lines 188-198): languageCodeMap is duplicate of alphabet key mapping.

**Root Cause**: Redundant mapping.

**Fix Idea**: Use alphabets object keys directly.

---

## Finding: ALPH-02 — Missing Hindi from i18n (P3)

**Evidence**: config.ts has 15 languages but alphabets only has 5.

**Root Cause**: Not all i18n languages have alphabet data.

**Fix Idea**: Add more language alphabets or document limitation.

---

## Prioritized Backlog

| ID      | Category     | Severity | Effort | Fix                         |
| ------- | ------------ | -------- | ------ | --------------------------- |
| ALPH-01 | Correctness  | P2       | 2h     | Add icon path validation    |
| ALPH-02 | DRY          | P3       | 1h     | Consolidate language map    |
| ALPH-03 | Completeness | P3       | 8h     | Add more language alphabets |

---

## Related Artifacts

- `src/frontend/src/i18n/config.ts`
- `src/frontend/src/pages/alphabet-game/`
