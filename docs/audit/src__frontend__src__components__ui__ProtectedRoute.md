# Audit: ProtectedRoute.tsx

**Target**: `src/frontend/src/components/ui/ProtectedRoute.tsx`  
**Date**: 2026-02-25  
**Source Ticket**: `TCK-20260225-004`  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 2, Complexity 1, Changeability 2, Learning 1 = **10/25**

---

## Why This File?

This is the **Protected Route component** - authentication guard that redirects unauthenticated users to login.

---

## Scoring Rationale

| Criterion     | Score | Justification            |
| ------------- | ----- | ------------------------ |
| Impact        | 4     | Critical - security gate |
| Risk          | 2     | Medium - auth flow       |
| Complexity    | 1     | Simple routing logic     |
| Changeability | 2     | Easy to extend           |
| Learning      | 1     | Standard React patterns  |

---

## Finding: PROT-01 — class vs className (P0)

**Evidence** (line 37): `className="min-h-screen..."` is correct, but line 40 uses `class=` in comment - no actual bug found.

Wait - checking line 37-41: Uses correct className. However checkAuth() in useEffect has no dependency array consideration - runs on every mount.

---

## Finding: PROT-02 — checkAuth in useEffect No Deps (P1)

**Evidence** (lines 16-26): checkAuth called but not in dependency array properly.

**Root Cause**: Could cause infinite loops in some cases.

**Fix Idea**: Add proper dependencies.

---

## Finding: PROT-03 — Double Loading State (P2)

**Evidence** (line 32): Both isLoading from store AND local isChecking state.

**Root Cause**: Redundant state.

**Fix Idea**: Use single source of truth.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix                    |
| ------- | ----------- | -------- | ------ | ---------------------- |
| PROT-02 | Reliability | P1       | 1h     | Fix dependency array   |
| PROT-03 | DX          | P2       | 0.5h   | Simplify loading state |

---

## Related Artifacts

- `src/frontend/src/store/authStore.ts`
