# Audit: tracking.ts

**Target**: `src/frontend/src/types/tracking.ts`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 5, Complexity 2, Changeability 2, Learning 2 = **15/25**

---

## Why This File?

This is the **shared types** file for hand tracking. All camera-based games import types from here. Breaking changes ripple to every game.

---

## Scoring Rationale

| Criterion     | Score | Justification                                           |
| ------------- | ----- | ------------------------------------------------------- |
| Impact        | 4     | All games depend on these types                         |
| Risk          | 5     | Breaking changes affect ALL games; high regression risk |
| Complexity    | 2     | Simple type definitions, mostly straightforward         |
| Changeability | 2     | Types are stable; changes need broad testing            |
| Learning      | 2     | Standard TypeScript patterns                            |

---

## Finding: TT-01 — `any` Type in UseHandTrackingReturn (P1)

**Evidence** (line 69):

```typescript
export interface UseHandTrackingReturn {
  /** The HandLandmarker instance (null if not initialized) */
  landmarker: any | null;
  // ...
}
```

**Root Cause**: MediaPipe's HandLandmarker type not imported.

**Fix Idea**: Import and use actual MediaPipe HandLandmarker type.

---

## Finding: TT-02 — Duplicate Types Across Files (P2)

**Evidence**: `Point`, `Point3D`, `Landmark` defined here AND in `coordinateTransform.ts`.

**Root Cause**: Types copied between utility and type files.

**Fix Idea**: Consolidate to single source (tracking.ts).

---

## Finding: TT-03 — Missing Test Types (P2)

**Evidence**: No mock types for testing.

**Root Cause**: Testing utilities not defined.

**Fix Idea**: Add `MockHandTrackingReturn`, `MockTrackedHandFrame` for tests.

---

## Prioritized Backlog

| ID    | Category        | Severity | Effort | Fix                                  |
| ----- | --------------- | -------- | ------ | ------------------------------------ |
| TT-01 | Correctness     | P1       | 0.5h   | Import MediaPipe HandLandmarker type |
| TT-02 | Maintainability | P2       | 1h     | Consolidate duplicate types          |
| TT-03 | Test            | P2       | 1h     | Add mock types for testing           |

---

## Related Artifacts

- `src/frontend/src/hooks/useGameHandTracking.ts`
- `src/frontend/src/utils/coordinateTransform.ts`
