# Audit: GameCanvas.tsx

**Target**: `src/frontend/src/components/game/GameCanvas.tsx`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 4, Complexity 3, Changeability 3, Learning 2 = **17/25**

---

## Why This File?

This is the **core canvas rendering component** used by ALL games. It wraps HTML canvas with coordinate transformation, high-DPI support, and drawing utilities.

---

## Scoring Rationale

| Criterion     | Score | Justification                                            |
| ------------- | ----- | -------------------------------------------------------- |
| Impact        | 5     | All canvas-based games depend on this component          |
| Risk          | 4     | Rendering bugs affect all games; breaking changes likely |
| Complexity    | 3     | React + canvas + animation loop = moderate complexity    |
| Changeability | 3     | Well-contained, but changes ripple to all games          |
| Learning      | 2     | Standard canvas patterns                                 |

---

## Finding: GC-01 — Unused Props (P2)

**Evidence**: `videoWidth` and `videoHeight` props defined (lines 42-43) but not used.

**Root Cause**: Props added for coordinate transformation but never wired.

**Fix Idea**: Wire props to coordinate transformation or remove.

---

## Finding: GC-02 — Background Image Reloads Every Frame (P1)

**Evidence** (lines 131-137):

```typescript
// Redraw background image if provided
if (backgroundImage) {
  const img = new Image();
  img.src = backgroundImage;
  if (img.complete) {
    ctx!.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
  }
}
```

**Root Cause**: Creates new Image() every frame - inefficient.

**Fix Idea**: Cache loaded image in useRef, only load once.

---

## Finding: GC-03 — Missing useEffect Dependencies (P2)

**Evidence** (lines 112-152): Animation loop useEffect missing `canvasSize` in dependency array but uses it.

**Root Cause**: Potential stale closure.

**Fix Idea**: Add all used values to dependency array.

---

## Finding: GC-04 — CanvasUtils Not Exported from Main (P2)

**Evidence**: `CanvasUtils` object defined but must be imported separately.

**Root Cause**: API design issue.

**Fix Idea**: Export CanvasUtils as named export alongside component.

---

## Finding: GC-05 — No TypeScript Generics for Custom Render (P2)

**Evidence**: `onRender` uses untyped callback.

**Root Cause**: Missing generic type parameter.

**Fix Idea**: Add generic type to allow typed game state.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                              |
| ----- | ----------- | -------- | ------ | -------------------------------- |
| GC-01 | Dead code   | P2       | 0.5h   | Remove unused video props        |
| GC-02 | Performance | P1       | 1h     | Cache background image in useRef |
| GC-03 | Correctness | P2       | 0.5h   | Fix useEffect dependencies       |
| GC-04 | DX          | P2       | 0.5h   | Export CanvasUtils by default    |
| GC-05 | DX          | P2       | 1h     | Add generic type to onRender     |

---

## Related Artifacts

- `src/frontend/src/utils/coordinateTransform.ts`
- `src/frontend/src/components/game/GameCursor.tsx`
