# MediaPipe + React UI Interaction Architecture (Primary + Secondary UI)

**Date:** 2026-02-28  
**Type:** Research + Implementation Planning  
**Status:** Documentation complete (no code changes in this document)  
**Scope:** How kids can control both canvas gameplay and standard React UI elements using MediaPipe, with robust fallback/secondary UI behavior.

---

## 1) Why this document exists

This document defines the **first implementation contract** before coding:

1. How to support **camera-based hand interaction** for kids across the app.
2. How to support **React component interaction** (buttons/cards/modals/routes) via gestures.
3. How to provide **secondary UI/fallback modes** when camera tracking is weak/unavailable.
4. How to roll out safely across existing games/pages with measurable quality gates.

---

## 2) Current-state inventory (Observed in repo)

### 2.1 Shared hand runtime and provider foundation

- `src/frontend/src/hooks/useGameHandTracking.ts`
  - High-level orchestration for tracking lifecycle, runtime mode, pinch state, cursor, FPS.
- `src/frontend/src/hooks/useHandTrackingRuntime.ts`
  - Main-thread runtime loop, frame extraction, pinch-state lifecycle.
- `src/frontend/src/hooks/useVisionWorkerRuntime.ts`
  - Worker-mode execution path with fallback support.
- `src/frontend/src/workers/vision.worker.ts`
  - Worker-side MediaPipe frame processing.
- `src/frontend/src/components/game/HandDetectionProvider.tsx`
  - Context provider exposing cursor, pinch, webcamRef, meta.
- `src/frontend/src/components/game/HandDetectionContext.tsx`
- `src/frontend/src/components/game/useHandDetection.ts`

### 2.2 Coordinate and hit utilities

- `src/frontend/src/utils/coordinateTransform.ts`
  - Normalized ↔ pixel conversion, cover mapping, target checks, KalmanFilter.
- `src/frontend/src/utils/__tests__/coordinateTransform.test.ts`

### 2.3 Existing DOM/React gesture bridge

- `src/frontend/src/hooks/useHandClick.ts`
  - Uses viewport coordinate projection + `document.elementFromPoint`.
  - Triggers synthetic click on pinch start.
  - Adds hover ring classes and touch-like click feedback.
  - Supports selector set: `button`, `a`, and `[data-hand-interactable="true"]`.

### 2.4 UX surfaces already available

- `src/frontend/src/components/GameContainer.tsx`
  - Standard game shell with `isHandDetected`, camera thumbnail support.
- `src/frontend/src/components/game/HandTrackingStatus.tsx`
  - Friendly hand-lost prompts and optional voice guidance.
- `src/frontend/src/components/game/CursorEmbodiment.tsx`
  - Shared cursor/hand visual embodiment.

### 2.5 Usage examples in pages

- `src/frontend/src/pages/MirrorDraw.tsx`
  - Uses `useGameHandTracking` and `useHandClick(...)` for UI click bridging.
- `src/frontend/src/pages/StorySequence.tsx`
  - Uses pinch + drag/drop interaction model.
- `src/frontend/src/pages/MediaPipeTest.tsx`
  - Test harness for hands/face/pose/gesture diagnostics.

---

## 3) Problem statement

Current capabilities are strong but fragmented:

1. Hand interaction patterns differ across pages.
2. Gesture-to-React click strategy is present but not standardized app-wide.
3. Secondary/fallback UI behavior is not centrally defined (pinch-only is brittle in real child environments).
4. No single interaction contract for all modalities (pinch/dwell/touch) and all surfaces (canvas + DOM).

---

## 4) Target interaction model

### 4.1 Primary UI mode (default)

**Point + Pinch**

- Pointer source: index fingertip (smoothed).
- Select: pinch transition edge (`false -> true`).
- Drag: pinch hold + cursor movement.
- Release: pinch release edge.

Applies to:

- Canvas targets (game interactions)
- Standard React DOM targets (buttons, links, cards, modal CTAs)

### 4.2 Secondary UI modes (fallback)

1. **Dwell Select**
   - If pinch confidence is unstable or repeated false triggers occur.
   - Hover target for $700$-$1000$ ms → trigger click.

2. **Large Target / Scan Mode**
   - Simplified navigation for younger children and low-stability sessions.
   - Highlight fewer, larger interactables in sequence.

3. **Touch/Mouse Continuity (always available)**
   - Never block progression when hand tracking is unavailable.
   - System provides clear, friendly fallback prompt.

---

## 5) Proposed architecture

### 5.1 New interaction orchestration layer

Introduce a central orchestrator (name suggestion):

- `useHandInteractionController` (new)

Responsibilities:

- Consume runtime frame stream from `useGameHandTracking`.
- Normalize interaction state:
  - `cursor`
  - `gesture` (`pinchStart`, `pinchHold`, `pinchEnd`, `dwellReady`)
  - `quality` (stability/confidence/hand-visible)
  - `mode` (`pinch`, `dwell`, `touch-only`)
- Emit high-level intents:
  - `select(target)`
  - `dragStart(target)`
  - `dragMove(position)`
  - `dragEnd(target)`

### 5.2 UI targeting contract

Use explicit semantic targeting with support for existing native controls:

- Native: `button`, `a`, `[role="button"]`
- Enhanced opt-in: `[data-hand-interactable="true"]`
- Optional priority hints:
  - `[data-hand-priority="high|normal|low"]`
  - `[data-hand-action="select|drag|nav"]`

### 5.3 Shared interaction wrapper component

Introduce optional helper component:

- `HandInteractable` (new)
  - Wraps any React component.
  - Registers target metadata.
  - Handles highlight, dwell ring, and disabled-state contract.

### 5.4 Mode resolver policy

Create deterministic resolver:

- `InteractionModeResolver` (new)

Inputs:

- hand visibility uptime
- pinch false-positive rate
- frame stability
- optional parent setting override

Outputs:

- active mode: pinch/dwell/touch-only
- user-facing prompt recommendation

---

## 6) Runtime behavior policy (state machine)

### 6.1 States

- `NO_HAND`
- `HAND_TRACKING_STABLE`
- `PINCH_READY`
- `DRAGGING`
- `DWELL_TARGETING`
- `FALLBACK_TOUCH`

### 6.2 Core transitions

- `NO_HAND -> HAND_TRACKING_STABLE` when hand present for threshold window.
- `HAND_TRACKING_STABLE -> PINCH_READY` when pinch confidence and jitter pass gate.
- `PINCH_READY -> DRAGGING` on pinch start over draggable target.
- `HAND_TRACKING_STABLE -> DWELL_TARGETING` when pinch deemed unstable.
- `ANY -> FALLBACK_TOUCH` on repeated runtime failure or denied camera.

### 6.3 Safety guardrails

- click debounce: min $250$ ms
- target hold threshold before click (micro-debounce)
- ignore disabled/hidden elements
- suppress repeated activation on same target unless cursor exits re-entry radius

---

## 7) Secondary UI design requirements (kid-friendly)

1. Language must be encouraging, not punitive:
   - “Show me your hand 👋” vs “Tracking error”.
2. Keep fallback explicit and immediate:
   - “Camera is having trouble — you can tap buttons too.”
3. Visuals:
   - large focus ring
   - dwell progress indicator
   - short, clear action text
4. Accessibility:
   - maintain keyboard/touch interoperability
   - keep ARIA semantics unchanged

---

## 8) Integration strategy by surface

### 8.1 Canvas-heavy games

- Continue using `useGameHandTracking` frame loop.
- Move gesture interpretation to shared controller.
- Keep page-level game logic pure (score/state), not detection-heavy.

### 8.2 DOM-heavy pages

- Replace ad-hoc click dispatch usage with centralized controller + target registry.
- Use `data-hand-interactable` for critical buttons first.

### 8.3 Hybrid pages (canvas + UI controls)

- Establish explicit interaction priority:
  1. Active drag target
  2. Canvas interaction region
  3. UI controls
- Require clear z-order policy to avoid accidental cross-surface clicks.

---

## 9) Rollout plan (document-first, then implementation)

### Phase 0 — Documentation + contract freeze (this document)

Deliverables:

- Architecture contract
- mode policy
- target semantics
- rollout/testing framework

### Phase 1 — Core controller foundation

Deliverables:

- `useHandInteractionController`
- `InteractionModeResolver`
- shared event schema
- no broad page migration yet

### Phase 2 — Pilot migration

Pilot pages:

1. `MediaPipeTest.tsx` (diagnostic)
2. `MirrorDraw.tsx` (hybrid)
3. one simple DOM page with buttons/cards

Exit criteria:

- false-click rate below agreed threshold
- fallback mode activation behaves deterministically

### Phase 3 — Shared game/page adoption

- Migrate pages with current manual pinch logic first.
- Adopt `data-hand-interactable` semantics for key controls.
- Add `HandInteractable` wrapper where appropriate.

### Phase 4 — Hardening + analytics

- Add telemetry events:
  - mode changes
  - click success/failure
  - fallback triggers
  - hand-lost durations
- tune thresholds based on child usage sessions.

---

## 10) Testing and quality gates

### 10.1 Unit tests

- pinch edge detection correctness
- dwell timing behavior
- mode resolver transitions
- target filtering (disabled/hidden)

### 10.2 Integration tests

- pointer projection + hit target resolution
- click debounce and re-entry behavior
- drag lifecycle across surfaces

### 10.3 Scenario QA (kid-realistic)

- hand leaves frame and re-enters
- low light / backlight instability
- sibling/extra hand enters scene
- long sessions with fatigue

### 10.4 Performance gates

- maintain target FPS in runtime mode
- no UI freeze from interaction layer
- worker fallback to main-thread remains graceful

---

## 11) Implementation backlog (recommended)

1. Define interaction event types in shared `tracking` types.
2. Build `useHandInteractionController` with pinch + dwell support.
3. Add `InteractionModeResolver` with deterministic thresholds.
4. Refactor `useHandClick` to become adapter layer under controller.
5. Add `HandInteractable` helper for DOM standardization.
6. Pilot migrate `MirrorDraw.tsx` and one non-canvas page.
7. Add telemetry instrumentation + tuning cycle.

---

## 12) Risks and mitigations

### Risk A: False activations in noisy environments

Mitigation:

- click debounce
- dwell fallback
- confidence gating

### Risk B: Fragmented behavior across pages

Mitigation:

- one controller contract
- migration checklist
- lint rule/check for direct ad-hoc interaction dispatch

### Risk C: Regressing accessibility and touch usability

Mitigation:

- touch/keyboard always enabled
- no replacement of native events without fallback

---

## 13) Acceptance criteria for “documentation-first complete”

- [x] Current architecture documented with concrete file references.
- [x] Primary interaction model documented.
- [x] Secondary UI/fallback model documented.
- [x] Deterministic rollout plan documented.
- [x] Testing and quality gates documented.
- [x] Risks + mitigations documented.

---

## 14) Recommended next action after this document

Proceed with **Phase 1 foundation only**:

- implement shared controller + resolver behind feature flag,
- migrate one pilot page,
- validate with test harness before broad rollout.

This keeps implementation incremental and low-risk while preserving current game stability.

---

## 15) External Research Cross-Check (User-provided, reviewed on 2026-02-28)

This section validates the user-provided research note titled:

> **"Hand-Based Pointing and Clicking in React With MediaPipe Hands for Children"**

### 15.1 Alignment summary

Overall assessment: **High alignment** with this repository’s current architecture and direction.

Your submission correctly identified:

- Existing hand-tracking foundations already present (provider/runtime/worker/smoothing/pinch).
- The primary gap is not model bootstrapping, but a **general-purpose interaction layer** for React UI semantics.
- Worker-first runtime is the right direction for UI responsiveness under synchronous MediaPipe APIs.
- Kid-first interaction defaults should emphasize error mitigation and fallback behavior.

### 15.2 Claim-by-claim repo validation

| External claim                                                           | Validation against repo   | Notes                                                                                                                                                                                    |
| ------------------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo already has most hard infra (runtime, smoothing, pinch, worker)     | **Confirmed**             | `useGameHandTracking`, `useHandTrackingRuntime`, `useVisionWorkerRuntime`, `vision.worker`, `oneEuroFilter`, `pinchDetection`, `handTrackingFrame` exist and are used across many pages. |
| Main missing piece is a unified interaction layer for React components   | **Confirmed**             | Current patterns are page-level and inconsistent; no shared controller for hover/focus/select semantics across normal React UI.                                                          |
| Four-layer design (provider/cursor/interaction/targets)                  | **Adopted**               | Matches this doc’s controller + resolver + target contract model.                                                                                                                        |
| Worker runtime is directionally correct because detection is synchronous | **Confirmed**             | Current implementation already supports worker mode and main-thread fallback.                                                                                                            |
| Dwell-first kid strategy with pinch optional is safer                    | **Conditionally adopted** | Will be default recommendation for menus/UI; pinch remains strong for drawing/gameplay-specific flows.                                                                                   |
| DOM hit-testing first, registered targets second                         | **Adopted**               | Fits incremental migration for current codebase and avoids broad rewrite.                                                                                                                |

### 15.3 Repo-specific corrections and caveats

1. **`useHandClick` API inconsistency risk**: Observed signature in `src/frontend/src/hooks/useHandClick.ts` is positional (`(isPinching, cursorCoordinate, enabled?)`). At least one page usage appears object-style (`FreeDraw.tsx`), while another is positional (`MirrorDraw.tsx`). This should be treated as a migration/hardening item in Phase 1.

2. **Provider naming overlap**: Repo already has `HandDetectionProvider` (game context). A new app-level provider should avoid ambiguous naming (suggested: `HandInteractionProvider` for controller/UI scope while keeping `HandDetectionProvider` for raw detection context).

3. **Worker mode detail**: Current worker path uses `runningMode: 'IMAGE'` in worker and frame transfer via `ImageBitmap`/`ImageData`. This is valid, but transfer overhead trade-offs should be measured, not assumed.

4. **Target safety requirements**: Parent/admin actions require explicit protection semantics beyond simple clickability. The "safe corner" policy is accepted and should be formalized with longer dwell/confirmation.

### 15.4 Parameters that remain intentionally undecided (must be calibrated)

The external note correctly calls these decision-critical unknowns. They remain **implementation calibration items**:

- Target device class (desktop/tablet/TV/kiosk)
- Camera resolution and effective framerate under real usage
- Typical lighting and camera distance in child environments
- Age-band profile defaults (3–5 vs 6–8)

### 15.5 Adoption decision

Decision: **Incorporate this external research as a reinforcement input** for implementation, with repo-specific guardrails above.

Concretely:

- Keep worker-capable runtime as default path where supported.
- Implement shared interaction controller before broad page migration.
- Use **dwell-first for generic UI**, preserve **pinch for game-specific precision flows**.
- Begin with DOM hit-testing for speed, then move critical paths to explicit target registration.

### 15.6 Immediate backlog deltas from this review

Add/clarify in implementation backlog:

1. Add compatibility shim/wrapper for `useHandClick` to unify call signatures.
2. Define parent-corner protection policy (`dwell >= 1500ms` + confirmation).
3. Add interaction telemetry fields for false-select and mode-switch diagnostics.
4. Add parameter tuning matrix per age band and per device profile.
