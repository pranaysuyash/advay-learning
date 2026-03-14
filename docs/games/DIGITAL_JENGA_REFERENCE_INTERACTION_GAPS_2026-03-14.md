# Digital Jenga: Reference Interaction Gaps (2026-03-14)

## Scope
Comparison of the reference interaction feel described by user feedback vs current in-repo implementation at:
- `src/frontend/src/games/jenga/hooks/useGrabController.ts`
- `src/frontend/src/games/jenga/domain/GameState.ts`
- `src/frontend/src/pages/three/DigitalJenga3D.tsx`

## Findings First

1. **Observed**: Current implementation used explicit axis-mapped drag + velocity steering, not spring-constraint dragging.
- Evidence: `useGrabController.ts` computes `pixelsPerWorldUnit`, `screenPullDirection`, and sets velocity manually.
- Impact: More deterministic rules, less "wiggle through contact" feel.

2. **Observed**: Current interaction auto-promoted extraction and previously auto-placed immediately on release.
- Evidence: `useGrabController.ts` release flow called `completeExtract()` and then `placeOnTop()`.
- Impact: Kids lose agency and physics continuity; block appears to jump to top.

3. **Observed**: Drag threshold and speed were tuned conservatively (`EXTRACT_DISTANCE` high relative to perceived pull, lower max speed), which can feel heavy.
- Evidence: `config/constants.ts` drag constants.
- Impact: User reports "pull too hard" and low responsiveness.

4. **Observed**: Raycast path had avoidable per-pointer scene traversal.
- Evidence: `DigitalJenga3D.tsx` `raycastFromClient()` traversed `scene` every pointer move.
- Impact: FPS drop risk during active hover/drag.

5. **Inferred**: Reference implementation likely feels more seamless because force-driven constraints absorb imperfect input trajectories better than strict 1D pull projection.
- Evidence: user-provided reference summary; no direct source file in this repo to verify line-by-line.

## What was working in the reference block interaction and missing here

- Spring-like pull behavior where blocks are physically dragged toward pointer rather than strictly axis-projected.
- More permissive/free drag sensation before strict placement semantics.
- Better perception anchoring from explicit pointer alignment helpers.

## Decisions implemented in this pass

- Removed forced auto-placement after extraction; extraction now moves to explicit `place` phase.
- Reduced extraction friction via drag constant tuning.
- Added explicit HUD action path (`Place On Top`, `Oops, let go`) to improve kid control and recovery.
- Reduced pointer/raycast overhead (mesh caching + pointer update throttling).
- Kept game-state turn/phase model and educational mode structure (product constraints preserved).

## Follow-up recommendations

1. Add optional "Sandbox Physics" mode with spring/motor-based dragging for high physical satisfaction.
2. Keep current "Guided" mode for structured kid learning flow.
3. Add visual extraction meter/ghost placement to bridge realism + clarity.
