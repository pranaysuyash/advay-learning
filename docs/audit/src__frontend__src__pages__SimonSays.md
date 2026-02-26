# Audit: SimonSays.tsx

**Target**: `src/frontend/src/pages/SimonSays.tsx`  
**Date**: 2026-02-26  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 3, Complexity 5, Changeability 2, Learning 1 = **16/25**
**Source Ticket**: TCK-20260225-004

---

## Why This File?

This is the **Simon Says game** - body pose detection game using MediaPipe PoseLandmarker with hand tracking combo mode.

---

## Scoring Rationale

| Criterion     | Score | Justification             |
| ------------- | ----- | ------------------------- |
| Impact        | 5     | Full-body pose game       |
| Risk          | 3     | Complex CV - dual systems |
| Complexity    | 5     | MediaPipe + hand tracking |
| Changeability | 2     | Game-specific             |
| Learning      | 1     | Standard patterns         |

---

## Finding: SS-01 — Missing UseEffect Cleanup for Pose (P1)

**Evidence** (lines 150-165): PoseLandmarker loaded but no cleanup on unmount.

**Root Cause**: Memory leak potential.

**Fix Idea**: Add cleanup in return function.

---

## Finding: SS-02 — Unused FilesetResolver Import (P2)

**Evidence** (line 6): `FilesetResolver` imported but used inside useEffect.

**Root Cause**: Works but could be cleaner.

**Fix Idea**: Load dynamically.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                  |
| ----- | ----------- | -------- | ------ | -------------------- |
| SS-01 | Reliability | P1       | 0.5h   | Add cleanup function |
| SS-02 | DX          | P2       | 0.25h  | Refactor import      |

---

## Related Artifacts

- `src/frontend/src/games/fingerCounting.ts`
