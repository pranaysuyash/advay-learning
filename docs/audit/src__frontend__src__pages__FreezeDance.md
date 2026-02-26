# Audit: FreezeDance.tsx

**Target**: `src/frontend/src/pages/FreezeDance.tsx`  
**Date**: 2026-02-25  
**Source Ticket**: `TCK-20260225-004`  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 4, Complexity 4, Changeability 2, Learning 1 = **15/25**

---

## Why This File?

This is the **Freeze Dance game** - dual computer vision game using both pose detection (MediaPipe Pose) and hand tracking for finger challenges.

---

## Scoring Rationale

| Criterion     | Score | Justification                  |
| ------------- | ----- | ------------------------------ |
| Impact        | 4     | Educational dual-CV game       |
| Risk          | 4     | High - complex dual tracking   |
| Complexity    | 4     | Very complex - dual CV systems |
| Changeability | 2     | Limited - game-specific        |
| Learning      | 1     | Standard React patterns        |

---

## Finding: FRZ-01 — Nested setTimeout Cleanup Issues (P0)

**Evidence** (lines 207-250): Multiple nested setTimeout calls in useEffect with incomplete cleanup.

**Root Cause**: Race conditions in timer cleanup can cause memory leaks.

**Fix Idea**: Use useRef for timer IDs, proper cleanup in useEffect return.

---

## Finding: FRZ-02 — Dual CV Loading Performance (P1)

**Evidence** (lines 83-130): Loads both PoseLandmarker AND useGameHandTracking.

**Root Cause**: Heavy resource usage on low-end devices.

**Fix Idea**: Lazy load hand tracking only when finger challenge starts.

---

## Finding: FRZ-03 — any Type for lastPoseRef (P2)

**Evidence** (line 52): `lastPoseRef = useRef<any>(null)`.

**Root Cause**: Type safety issue.

**Fix Idea**: Define proper PoseLandmark type.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                     |
| ------ | ----------- | -------- | ------ | ----------------------- |
| FRZ-01 | Reliability | P0       | 2h     | Fix timer cleanup       |
| FRZ-02 | Performance | P1       | 2h     | Lazy load hand tracking |
| FRZ-03 | DX          | P2       | 0.5h   | Add proper type         |

---

## Related Artifacts

- `src/frontend/src/hooks/useGameHandTracking.ts`
- `src/frontend/src/games/fingerCounting.ts`
