# Audit: socialStore.ts

**Target**: `src/frontend/src/store/socialStore.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 3, Risk 2, Complexity 4, Changeability 3, Learning 2 = **14/25**

---

## Why This File?

This is the **social store** for social-emotional learning activities, multiplayer sessions, and metrics tracking. Includes character integration (Pip, Lumi).

---

## Scoring Rationale

| Criterion     | Score | Justification                                 |
| ------------- | ----- | --------------------------------------------- |
| Impact        | 3     | Future feature - social learning is secondary |
| Risk          | 2     | Future feature, not in production             |
| Complexity    | 4     | Multiplayer sessions, metrics, activities     |
| Changeability | 3     | Feature in development                        |
| Learning      | 2     | Standard patterns                             |

---

## Finding: SOC-01 — Missing Persistence (P2)

**Evidence**: Uses devtools but no persist middleware.

**Root Cause**: Noted for future - metrics lost on refresh.

**Fix Idea**: Add persist middleware.

---

## Finding: SOC-02 — Date Objects Not Serialized (P2)

**Evidence** (lines 58, 62, 154): Uses Date objects directly.

**Root Cause**: Won't serialize to localStorage.

**Fix Idea**: Use ISO strings or timestamps.

---

## Finding: SOC-03 — recordSocialAction Complex (P2)

**Evidence** (lines 184-227): 40+ line function updates 3 different metrics.

**Root Cause**: Too many responsibilities.

**Fix Idea**: Split into separate updaters.

---

## Finding: SOC-04 — Sample Activities Hardcoded (P3)

**Evidence** (lines 100-148): sampleActivities defined in store.

**Root Cause**: Should come from API.

**Fix Idea**: Fetch from backend.

---

## Finding: SOC-05 — No Error Handling (P2)

**Evidence**: All actions assume success.

**Root Cause**: Missing error handling.

**Fix Idea**: Add error state.

---

## Prioritized Backlog

| ID     | Category     | Severity | Effort | Fix                      |
| ------ | ------------ | -------- | ------ | ------------------------ |
| SOC-01 | Persistence  | P2       | 1h     | Add persist middleware   |
| SOC-02 | Correctness  | P2       | 1h     | Use ISO strings          |
| SOC-03 | Complexity   | P2       | 2h     | Split recordSocialAction |
| SOC-04 | Architecture | P3       | 1h     | Fetch from API           |
| SOC-05 | Correctness  | P2       | 1h     | Add error state          |

---

## Related Artifacts

- `src/frontend/src/store/characterStore.ts`
- `docs/LUMI_COMPANION_CHARACTER_PLAN.md`
