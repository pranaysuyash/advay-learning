# Audit: GameCursor.tsx

**Target**: `src/frontend/src/components/game/GameCursor.tsx`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 3, Complexity 2, Changeability 3, Learning 2 = **15/25**

---

## Why This File?

This is the **hand tracking cursor** component used by all games. It renders the visual cursor following the user's hand. Already contains fixes from emoji match audit (size 70px, contrast, z-index).

---

## Scoring Rationale

| Criterion     | Score | Justification                                       |
| ------------- | ----- | --------------------------------------------------- |
| Impact        | 5     | All games use this for hand cursor visibility       |
| Risk          | 3     | Visual component; bugs are visible but not critical |
| Complexity    | 2     | Simple React + Framer Motion                        |
| Changeability | 3     | Changes may affect game feel                        |
| Learning      | 2     | Standard animation patterns                         |

---

## Finding: CURSOR-01 — Trail Memory Leak Potential (P2)

**Evidence** (lines 101-109):

```typescript
setTrail((prev) => {
  const updated = [...prev, newPoint];
  return updated.filter((p) => now - p.timestamp < 300).slice(-5);
});
```

**Root Cause**: State update every frame; could cause excessive re-renders.

**Fix Idea**: Use useRef for trail storage, only trigger state for render.

---

## Finding: CURSOR-02 — Duplicate z-index Constants (P2)

**Evidence**: `zIndex: 9999` (line 148) and `zIndex: 9998` (line 131) hardcoded.

**Root Cause**: Magic numbers scattered.

**Fix Idea**: Extract to named constants at top.

---

## Finding: CURSOR-03 — Missing useMemo for Trail Calculation (P2)

**Evidence** (lines 96-109): Trail filtering happens in useEffect state setter.

**Root Cause**: Logic in state update is inefficient.

**Fix Idea**: Calculate in useMemo, sync to state.

---

## Finding: CURSOR-04 — Accessibility Label Incomplete (P3)

**Evidence** (lines 188-195): Screen reader only announces state, not position.

**Root Cause**: Position data not announced (intentional, could be noisy).

**Fix Idea**: Document why position is not announced.

---

## Prioritized Backlog

| ID        | Category    | Severity | Effort | Fix                                  |
| --------- | ----------- | -------- | ------ | ------------------------------------ |
| CURSOR-01 | Performance | P2       | 1h     | Use useRef for trail, reduce renders |
| CURSOR-02 | DX          | P2       | 0.5h   | Extract z-index to constants         |
| CURSOR-03 | Performance | P2       | 1h     | Move trail calc to useMemo           |
| CURSOR-04 | A11y        | P3       | 0.5h   | Document accessibility decisions     |

---

## Related Artifacts

- `src/frontend/src/hooks/useGameHandTracking.ts`
- `src/frontend/src/utils/coordinateTransform.ts`
- `EMOJI_MATCH_COMPREHENSIVE_VIDEO_AUDIT_COLLATION_2026-02-20.md`
