# Audit: authStore.ts

**Target**: `src/frontend/src/store/authStore.ts`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 4, Complexity 3, Changeability 3, Learning 2 = **17/25**

---

## Why This File?

This is the **authentication store** for parent/child login, guest sessions, and cookie-based auth.

---

## Scoring Rationale

| Criterion     | Score | Justification                                |
| ------------- | ----- | -------------------------------------------- |
| Impact        | 5     | Auth = gatekeeper for entire app             |
| Risk          | 4     | Security-critical, auth bugs = data exposure |
| Complexity    | 3     | HTTP-only cookies + guest sessions           |
| Changeability | 3     | Stable auth flow                             |
| Learning      | 2     | Standard patterns                            |

---

## Finding: AUTH-01 — getErrorMessage Uses any (P2)

**Evidence** (lines 50-68): `getErrorMessage(error: any)`

**Root Cause**: No typed errors.

**Fix Idea**: Use unknown + type guard.

---

## Finding: AUTH-02 — Guest Session Not Persisted Properly (P2)

**Evidence** (lines 165-188): loginAsGuest creates session with Date.now().

**Root Cause**: Fresh ID each load, but persisted.

**Fix Idea**: Use stable ID or validate on load.

---

## Finding: AUTH-03 — checkAuth Swallows Errors (P2)

**Evidence** (lines 218-228): catch block sets isAuthenticated=false without logging.

**Root Cause**: Silent failure.

**Fix Idea**: Add logging or error tracking.

---

## Finding: AUTH-04 — Logout Error Only Logged (P2)

**Evidence** (lines 133-141): console.error but continues.

**Root Cause**: Not critical, but could mask issues.

**Fix Idea**: Consider user notification.

---

## Finding: AUTH-05 — fetchUser Fails Silently (P2)

**Evidence** (lines 200-210): Sets isAuthenticated=false on any error.

**Root Cause**: Could be network error, not auth.

**Fix Idea**: Distinguish auth vs network errors.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix                      |
| ------- | ----------- | -------- | ------ | ------------------------ |
| AUTH-01 | Correctness | P2       | 1h     | Use unknown + type guard |
| AUTH-02 | Correctness | P2       | 1h     | Validate guest session   |
| AUTH-03 | DX          | P2       | 0.5h   | Add logging              |
| AUTH-04 | UX          | P3       | 0.5h   | Consider notification    |
| AUTH-05 | Correctness | P2       | 1h     | Distinguish error types  |

---

## Related Artifacts

- `src/frontend/src/services/api.ts`
- `src/frontend/src/pages/Dashboard.tsx`
