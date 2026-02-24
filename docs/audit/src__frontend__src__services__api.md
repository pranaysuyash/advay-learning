# Audit: api.ts

**Target**: `src/frontend/src/services/api.ts`  
**Date**: 2026-02-24  
**Ticket**: `TCK-20260224-031`  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 4, Complexity 3, Changeability 3, Learning 2 = **17/25**

---

## Why This File?

This is the **API service** - central Axios client with interceptors for auth, token refresh, all API endpoints (auth, user, profile, progress, issue reports).

---

## Scoring Rationale

| Criterion     | Score | Justification                 |
| ------------- | ----- | ----------------------------- |
| Impact        | 5     | All API calls go through this |
| Risk          | 4     | Auth bugs = security issue    |
| Complexity    | 3     | Axios with interceptors       |
| Changeability | 3     | Stable API                    |
| Learning      | 2     | Standard patterns             |

---

## Finding: API-01 — Syntax Error (P0)

**Evidence** (line 60): `apiClient.post('/auth/login', new URLSearchParams({ username, password }), {` - extra brace.

**Root Cause**: Syntax error.

**Fix Idea**: Fix bracket placement.

---

## Finding: API-02 — import.meta as any (P2)

**Evidence** (line 8): `const env = (import.meta as any).env ?? {};`

**Root Cause**: TypeScript workaround.

**Fix Idea**: Use proper Vite env typing.

---

## Finding: API-03 — No Request Timeout Configurable (P2)

**Evidence** (line 15): Hardcoded timeout: 10000ms.

**Root Cause**: Not configurable.

**Fix Idea**: Accept timeout in options.

---

## Finding: API-04 — Missing Generic on Some Calls (P2)

**Evidence** (lines 70, 85, etc.): apiClient.get calls missing generic type.

**Root Cause**: Less type safety.

**Fix Idea**: Add response types.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                       |
| ------ | ----------- | -------- | ------ | ------------------------- |
| API-01 | Correctness | P0       | 0.5h   | Fix syntax error          |
| API-02 | Type Safety | P2       | 1h     | Use proper Vite types     |
| API-03 | Flexibility | P2       | 0.5h   | Make timeout configurable |
| API-04 | DX          | P2       | 2h     | Add generic types         |

---

## Related Artifacts

- `src/frontend/src/store/authStore.ts`
- `src/frontend/src/store/profileStore.ts`
