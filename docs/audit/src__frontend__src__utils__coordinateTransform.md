# Audit: coordinateTransform.ts
**Ticket:** TCK-20260223-018

**Target**: `src/frontend/src/utils/coordinateTransform.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 4, Complexity 3, Changeability 3, Learning 3 = **17/25**

---

## Why This File?

This is a **critical math utilities** file for hand tracking. It transforms MediaPipe normalized coordinates (0-1) to screen pixel coordinates. It already contains fixes for a critical bug documented in the emoji audit (2787px offset).

---

## Scoring Rationale

| Criterion     | Score | Justification                                      |
| ------------- | ----- | -------------------------------------------------- |
| Impact        | 4     | All cursor positioning depends on this             |
| Risk          | 4     | Bug caused 2787px offset; high user-visible impact |
| Complexity    | 3     | Pure math functions, straightforward               |
| Changeability | 3     | Well-isolated, easy to modify                      |
| Learning      | 3     | Standard coordinate math patterns                  |

---

## Finding: CT-01 — Inconsistent Function Signatures (P2)

**Evidence**:

- `handToScreenCoordinates()` (line 102): 6 params
- `landmarksToScreenCoordinates()` (line 165): Uses `Parameters<typeof ...>` which is indirect
- `mapNormalizedPointToCover()` (line 49): Returns `NormalizedLandmark` not `ScreenCoordinate`

**Root Cause**: Multiple transformation functions with different return types.

**Fix Idea**: Standardize on `ScreenCoordinate` return type, add unified interface.

---

## Finding: CT-02 — No Unit Tests (P1)

**Evidence**: No test file at `src/frontend/src/utils/__tests__/coordinateTransform.test.ts`

**Root Cause**: Math functions assumed correct, not tested.

**Fix Idea**: Add tests for all functions. Documented testing requirements already in file (lines 319-335).

---

## Finding: CT-03 — KalmanFilter Not Used (P2)

**Evidence**: `KalmanFilter` class exists (lines 214-249) but not imported anywhere.

**Root Cause**: SmoothPosition (EMA) is simpler and sufficient for most cases.

**Fix Idea**: Either remove KalmanFilter or document when to use it over EMA.

---

## Prioritized Backlog

| ID    | Category        | Severity | Effort | Fix                             |
| ----- | --------------- | -------- | ------ | ------------------------------- |
| CT-01 | Maintainability | P2       | 1h     | Standardize return types        |
| CT-02 | Test            | P1       | 2h     | Add unit tests                  |
| CT-03 | DX              | P2       | 0.5h   | Document or remove KalmanFilter |

---

## Related Artifacts

- `EMOJI_MATCH_COMPREHENSIVE_VIDEO_AUDIT_COLLATION_2026-02-20.md` (2787px bug)
- `src/frontend/src/hooks/useGameHandTracking.ts`
