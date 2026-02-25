# Audit: DragDropSystem.tsx

**Target**: `src/frontend/src/components/game/DragDropSystem.tsx`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 3, Complexity 3, Changeability 3, Learning 2 = **16/25**

---

## Why This File?

This is the **drag-and-drop interaction system** used by games like Dress for Weather. Handles item pickup, drag, magnetic snap to zones, and drop validation.

---

## Scoring Rationale

| Criterion     | Score | Justification                                    |
| ------------- | ----- | ------------------------------------------------ |
| Impact        | 5     | Critical for Dress for Weather and sorting games |
| Risk          | 3     | Drag bugs frustrate users but non-critical       |
| Complexity    | 3     | State-heavy with multiple interaction phases     |
| Changeability | 3     | Changes affect specific game types               |
| Learning      | 2     | Standard drag-drop patterns                      |

---

## Finding: DD-01 — Duplicate Hit Detection Logic (P2)

**Evidence**: Both TargetSystem.tsx and DragDropSystem.tsx implement isWithinTarget().

**Root Cause**: Shared utility not extracted.

**Fix Idea**: Create useHitDetection hook.

---

## Finding: DD-02 — State in useEffect Causes Stale Closures (P2)

**Evidence** (lines 106-176): Multiple useEffects depend on cursorPosition without proper refs.

**Root Cause**: Dependencies may be stale between renders.

**Fix Idea**: Use useRef for current position, update in effect.

---

## Finding: DD-03 — No Animation When Returning to Origin (P2)

**Evidence**: `onItemDroppedOutside` callback exists but no built-in animation.

**Root Cause**: Animation left to parent component.

**Fix Idea**: Add smooth return animation in component.

---

## Finding: DD-04 — Missing Touch Support (P2)

**Evidence**: Only pinch gesture supported, no touch events.

**Root Cause**: Designed for hand tracking only.

**Fix Idea**: Add touch event handlers as fallback.

---

## Prioritized Backlog

| ID    | Category      | Severity | Effort | Fix                            |
| ----- | ------------- | -------- | ------ | ------------------------------ |
| DD-01 | DX            | P2       | 1h     | Extract hit detection to hook  |
| DD-02 | Correctness   | P2       | 1h     | Fix stale closure with useRef  |
| DD-03 | UX            | P2       | 1h     | Add return-to-origin animation |
| DD-04 | Accessibility | P2       | 2h     | Add touch event support        |

---

## Related Artifacts

- `src/frontend/src/components/game/TargetSystem.tsx`
- `src/frontend/src/pages/DressForWeather.tsx`
