# Audit: TargetSystem.tsx

**Target**: `src/frontend/src/components/game/TargetSystem.tsx`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 3, Complexity 3, Changeability 3, Learning 2 = **16/25**

---

## Why This File?

This is the **target hit detection system** for ALL interactive games. It handles collision detection, magnetic snapping, and visual feedback for touch/pinch interactions.

---

## Scoring Rationale

| Criterion     | Score | Justification                             |
| ------------- | ----- | ----------------------------------------- |
| Impact        | 5     | All games with clickable targets use this |
| Risk          | 3     | Hit detection bugs cause frustration      |
| Complexity    | 3     | Collision math + animation + state        |
| Changeability | 3     | Changes affect game feel                  |
| Learning      | 2     | Standard game dev patterns                |

---

## Finding: TS-01 — enableMagneticSnap Not Implemented (P1)

**Evidence**: Props defined (lines 39-41) but no code applies magnetic snapping.

**Root Cause**: Feature declared but not wired to coordinate transformation.

**Fix Idea**: Import `magneticSnap` from coordinateTransform and apply to cursorPosition.

---

## Finding: TS-02 — Hit Detection Runs on Every Frame (P2)

**Evidence** (lines 76-102): useEffect runs on every cursorPosition change.

**Root Cause**: No throttling for performance.

**Fix Idea**: Add throttling or useRef for position comparison.

---

## Finding: TS-03 — Target Array Not Memoized (P2)

**Evidence**: `targets` prop iterated in multiple useEffects without memoization.

**Root Cause**: Potential unnecessary re-renders.

**Fix Idea**: Add useMemo for derived calculations.

---

## Finding: TS-04 — Missing Keyboard Accessibility (P3)

**Evidence**: No keyboard navigation support.

**Root Cause**: Hand tracking focus only.

**Fix Idea**: Add Tab/Enter support for non-hand-tracking mode.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                             |
| ----- | ----------- | -------- | ------ | ------------------------------- |
| TS-01 | Correctness | P1       | 1h     | Implement magnetic snap feature |
| TS-02 | Performance | P2       | 1h     | Add throttling to hit detection |
| TS-03 | Performance | P2       | 1h     | Memoize target calculations     |
| TS-04 | A11y        | P3       | 2h     | Add keyboard navigation         |

---

## Related Artifacts

- `src/frontend/src/utils/coordinateTransform.ts` (magneticSnap function)
- `src/frontend/src/components/game/GameCanvas.tsx`
