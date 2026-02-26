# Audit: ConnectTheDots.tsx

**Target**: `src/frontend/src/pages/ConnectTheDots.tsx`  
**Date**: 2026-02-25  
**Source Ticket**: `TCK-20260225-004`  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 3, Changeability 2, Learning 1 = **13/25**

---

## Why This File?

This is the **Connect the Dots game** - hand-tracking number sequence game with levels and difficulty scaling.

---

## Scoring Rationale

| Criterion     | Score | Justification                  |
| ------------- | ----- | ------------------------------ |
| Impact        | 4     | Educational hand-tracking game |
| Risk          | 3     | High - complex game logic      |
| Complexity    | 3     | Medium - hand tracking         |
| Changeability | 2     | Limited - game-specific        |
| Learning      | 1     | Standard React patterns        |

---

## Finding: CTD-01 — Multiple useEffects for Ref Sync (P2)

**Evidence** (lines 260-280): Five separate useEffects for syncing refs with state.

**Root Cause**: Code duplication.

**Fix Idea**: Combine into single useEffect.

---

## Finding: CTD-02 — Stale Closure in onClick (P2)

**Evidence** (line 377): onClick handler uses `dots` directly instead of `dotsRef.current`.

**Root Cause**: Could cause stale data issues.

**Fix Idea**: Use dotsRef for consistency.

---

## Finding: CTD-03 — Extra Whitespace in GAME_COLORS (P1)

**Evidence** (line 50): `'cursorPinch: '#E85D04', // pip-orange` has extra space.

**Root Cause**: Whitespace inconsistency.

**Fix Idea**: Fix spacing.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                |
| ------ | ----------- | -------- | ------ | ------------------ |
| CTD-01 | Performance | P2       | 1h     | Combine useEffects |
| CTD-02 | Correctness | P2       | 0.5h   | Use dotsRef        |
| CTD-03 | DX          | P1       | 0.25h  | Fix whitespace     |

---

## Related Artifacts

- `src/frontend/src/hooks/useGameHandTracking.ts`
