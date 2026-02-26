# Audit: PlatformerRunner.tsx

**Target**: `src/frontend/src/pages/PlatformerRunner.tsx`  
**Date**: 2026-02-26  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 2, Complexity 4, Changeability 3, Learning 2 = **16/25**
**Source Ticket**: TCK-20260225-004

---

## Why This File?

This is **Platformer Runner** - infinite runner platform game using hand tracking for vertical player control with Kenney assets.

---

## Scoring Rationale

| Criterion     | Score | Justification         |
| ------------- | ----- | --------------------- |
| Impact        | 5     | Full game with assets |
| Risk          | 2     | Canvas game loop      |
| Complexity    | 4     | Physics + tracking    |
| Changeability | 3     | Modular asset system  |
| Learning      | 2     | Game loop patterns    |

---

## Finding: PR-01 — Hardcoded Canvas Size (P2)

**Evidence** (lines 61-62): `CANVAS_WIDTH = 800`, `CANVAS_HEIGHT = 600` hardcoded.

**Root Cause**: Not responsive to container.

**Fix Idea**: Make canvas size responsive.

---

## Finding: PR-02 — useCallback Missing Dependencies (P1)

**Evidence** (line 232): `update` callback missing `onGameComplete`, `triggerEasterEgg`.

**Root Cause**: Incomplete dependency array.

**Fix Idea**: Add dependencies or use refs.

---

## Finding: PR-03 — Images Not Unloaded on Cleanup (P2)

**Evidence**: Image cache created but no cleanup on unmount.

**Root Cause**: Memory leak potential.

**Fix Idea**: Add cleanup in useEffect return.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                    |
| ----- | ----------- | -------- | ------ | ---------------------- |
| PR-02 | Reliability | P1       | 0.5h   | Fix useCallback deps   |
| PR-01 | DX          | P2       | 1h     | Make canvas responsive |
| PR-03 | Reliability | P2       | 0.5h   | Add image cleanup      |

---

## Related Artifacts

- `src/frontend/src/hooks/useGameHandTracking.ts`
