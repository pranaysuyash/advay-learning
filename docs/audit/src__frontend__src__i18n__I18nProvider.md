# Audit: I18nProvider.tsx

**Target**: `src/frontend/src/i18n/I18nProvider.tsx`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 3, Risk 2, Complexity 1, Changeability 2, Learning 1 = **9/25**

---

## Why This File?

This is the **i18n provider** - wraps app with i18n context, syncs settings language with i18n, handles RTL direction.

---

## Scoring Rationale

| Criterion     | Score | Justification               |
| ------------- | ----- | --------------------------- |
| Impact        | 3     | Handles language sync + RTL |
| Risk          | 2     | Simple component, low risk  |
| Complexity    | 1     | Two simple useEffects       |
| Changeability | 2     | Stable API                  |
| Learning      | 1     | Standard React patterns     |

---

## Finding: I18P-01 — Missing Dependency in useEffect (P2)

**Evidence** (line 22): useEffect missing 'i18n' in deps array.

**Root Cause**: Could cause stale closure.

**Fix Idea**: Add i18n to dependency array.

---

## Finding: I18P-02 — Re-export useTranslation (P2)

**Evidence** (line 32): Re-exports useTranslation from react-i18next.

**Root Cause**: Indirection without value.

**Fix Idea**: Import directly from react-i18next.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix                    |
| ------- | ----------- | -------- | ------ | ---------------------- |
| I18P-01 | Correctness | P2       | 0.5h   | Add i18n to deps array |
| I18P-02 | DX          | P3       | 0.5h   | Remove re-export       |

---

## Related Artifacts

- `src/frontend/src/i18n/config.ts`
- `src/frontend/src/store/settingsStore.ts`
