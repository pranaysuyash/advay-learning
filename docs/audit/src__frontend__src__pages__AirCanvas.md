# Audit: AirCanvas.tsx

**Target**: `src/frontend/src/pages/AirCanvas.tsx`  
**Date**: 2026-02-25  
**Source Ticket**: `TCK-20260225-004`  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 4, Changeability 2, Learning 1 = **14/25**

---

## Why This File?

This is the **Air Canvas game** - hand-tracking air painting game with particle effects, multiple brushes, and webcam integration.

---

## Scoring Rationale

| Criterion     | Score | Justification             |
| ------------- | ----- | ------------------------- |
| Impact        | 4     | Core game - hand painting |
| Risk          | 3     | High - complex game logic |
| Complexity    | 4     | Very complex - tracking   |
| Changeability | 2     | Limited - game-specific   |
| Learning      | 1     | Standard React patterns   |

---

## Finding: AIR-01 — setParticles in render Loop (P0)

**Evidence** (lines 199-242): setParticles called inside detectHand callback - causes infinite re-render.

**Root Cause**: State update in animation frame callback.

**Fix Idea**: Use useRef for particles, render in separate effect.

---

## Finding: AIR-02 — Duplicate brushState in useState (P2)

**Evidence** (lines 76-77): Both selectedBrush and selectedColor use separate state.

**Root Cause**: Could consolidate.

**Fix Idea**: Use single brush state object.

---

## Finding: AIR-03 — Hardcoded Canvas Size (P2)

**Evidence** (line 316): `width={1280} height={720}` hardcoded.

**Root Cause**: Not responsive.

**Fix Idea**: Use window size or state.

---

## Finding: AIR-04 — unused onGameComplete (P2)

**Evidence** (line 75): `_onGameComplete` with underscore prefix - unused.

**Root Cause**: Dead code.

**Fix Idea**: Remove or use.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                 |
| ------ | ----------- | -------- | ------ | ------------------- |
| AIR-01 | Correctness | P0       | 2h     | Fix state in render |
| AIR-02 | DX          | P2       | 1h     | Consolidate state   |
| AIR-03 | Flexibility | P2       | 1h     | Make responsive     |
| AIR-04 | DX          | P2       | 0.5h   | Remove dead code    |

---

## Related Artifacts

- `src/frontend/src/hooks/useGameHandTracking.ts`
- `src/frontend/src/utils/coordinateTransform.ts`
