# Hand UI Phase 1 Implementation Spec (No-Code Contract)

**Date:** 2026-02-28  
**Status:** Ready for implementation  
**Scope:** Phase 1 only (foundation), derived from consolidated research docs.

---

## 1) Purpose

Define an implementation-ready contract for Phase 1 without starting broad refactors.

Phase 1 goal:

- establish a shared interaction layer for hand-driven React UI semantics,
- keep existing game behavior stable,
- ship behind a feature flag.

---

## 2) Inputs and dependencies

This spec is derived from:

- `docs/research/HAND_UI_RESEARCH_CONSOLIDATED_2026-02-28.md`
- `docs/research/MEDIAPIPE_REACT_UI_INTERACTION_ARCHITECTURE_2026-02-28.md`
- `docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md`
- `docs/audit/src__frontend__src__components__game__HandDetectionProvider.tsx.md`
- `docs/audit/src__frontend__src__utils__coordinateTransform.ts.md`

Existing runtime dependencies (reuse, do not replace in Phase 1):

- `src/frontend/src/hooks/useGameHandTracking.ts`
- `src/frontend/src/hooks/useVisionWorkerRuntime.ts`
- `src/frontend/src/hooks/useHandTrackingRuntime.ts`
- `src/frontend/src/workers/vision.worker.ts`
- `src/frontend/src/utils/handTrackingFrame.ts`
- `src/frontend/src/utils/pinchDetection.ts`
- `src/frontend/src/utils/oneEuroFilter.ts`

---

## 3) Phase 1 deliverables

### 3.1 New shared modules

1. `src/frontend/src/input/hand/useHandInteractionController.ts`
2. `src/frontend/src/input/hand/interactionModeResolver.ts`
3. `src/frontend/src/input/hand/targetResolver.ts`
4. `src/frontend/src/input/hand/types.ts`

### 3.2 Optional helper component (phase 1 light)

5. `src/frontend/src/input/hand/HandInteractable.tsx` (minimal wrapper)

### 3.3 Non-invasive integration points

6. Feature-flag wiring in one pilot page only (`MirrorDraw.tsx` or `MediaPipeTest.tsx`)
7. Keep existing `useHandClick` behavior operational while introducing controller path.

---

## 4) Feature flag contract

Add new flags (frontend):

- `VITE_HAND_UI_INTERACTION_ENGINE=true|false` (default: false)
- `VITE_HAND_UI_MODE=pinch|dwell|auto` (default: auto)
- `VITE_HAND_UI_DWELL_MS=<number>` (default: 850)

Behavior:

- If engine flag is off, existing page behavior remains unchanged.
- If engine flag is on, controller path is used for pilot page only.

---

## 5) Data model contract

### 5.1 Core types (`types.ts`)

```ts
export type HandUIMode = 'pinch' | 'dwell' | 'touch-only';

export type HandInteractionQuality = {
  handPresent: boolean;
  stable: boolean;
  jitterPx?: number;
  fps?: number;
};

export type HandCursor = {
  norm: { x: number; y: number } | null;
  viewport: { x: number; y: number } | null;
};

export type HandInteractionEvent =
  | { type: 'hoverStart'; targetId: string }
  | { type: 'hoverEnd'; targetId: string }
  | { type: 'dwellProgress'; targetId: string; progress01: number }
  | { type: 'select'; targetId: string; method: 'pinch' | 'dwell' }
  | { type: 'modeChange'; mode: HandUIMode; reason: string };
```

Note: this is a contract definition; implementation can extend with metadata.

---

## 6) Controller behavior contract

### 6.1 `useHandInteractionController`

Inputs:

- runtime frame stream (from existing tracking hooks)
- interaction surface element/ref
- mode config + thresholds
- callbacks for emitted events

Outputs:

- current cursor
- active mode
- hovered target id
- dwell progress
- select event stream

Required behavior:

1. Cursor mapping:
   - use index tip as primary pointer source
   - clamp normalized coordinates to $[0,1]$
   - map to viewport/surface coordinates

2. Target resolution:
   - phase 1 default path: DOM hit-testing (`elementFromPoint`)
   - recognize `button`, `a`, `[role="button"]`, `[data-hand-interactable="true"]`

3. Select methods:
   - pinch select on pinch start edge
   - dwell select by stable hover timeout

4. Safety:
   - select cooldown (default 300 ms)
   - ignore hidden/disabled elements
   - cancel dwell on target change

5. Emitted events:
   - hoverStart/hoverEnd
   - dwellProgress (0..1)
   - select
   - modeChange

---

## 7) Mode resolver contract

### 7.1 `interactionModeResolver`

Purpose:

- choose among `pinch`, `dwell`, `touch-only`.

Inputs:

- runtime stability
- hand visibility uptime
- recent selection error indicators
- optional user preference override

Rules (Phase 1 baseline):

1. If no hand present for > 8 s -> recommend `touch-only` prompt.
2. If pinch unstable (rapid oscillation / false starts) -> switch to `dwell`.
3. If user explicitly sets mode -> respect override unless runtime unavailable.
4. In `auto`, start with dwell for non-canvas UI routes.

---

## 8) `useHandClick` compatibility strategy

Observed risk: usage patterns may differ across pages.

Phase 1 requirement:

- add compatibility adapter so both legacy and controller path can coexist,
- do not remove existing hook behavior in Phase 1,
- document deprecation path after pilot validation.

---

## 9) Pilot page acceptance criteria

Pilot = one page only.

Must pass:

- [ ] page remains fully usable via touch/mouse
- [ ] hand hover highlight appears on interactable targets
- [ ] dwell selection works on at least 3 core controls
- [ ] pinch selection works (if enabled)
- [ ] no duplicate click triggers under cooldown window
- [ ] no crash on hand lost/reacquire

---

## 10) Test plan for Phase 1

### 10.1 Unit tests

1. mode resolver transitions
2. dwell timer state machine
3. pinch-edge select trigger
4. cooldown suppression
5. hidden/disabled target filtering

### 10.2 Integration tests

1. cursor mapping from normalized coordinates to target resolution
2. hover transitions and dwell progress
3. selection event emission order

### 10.3 Manual QA checklist

1. low light scenario
2. hand occlusion/re-entry
3. user switches to touch while hand cursor visible
4. accidental parent-control proximity handling

---

## 11) Telemetry contract (Phase 1 minimal)

Capture these events:

- `hand_ui_mode_change`
- `hand_ui_select`
- `hand_ui_select_blocked_cooldown`
- `hand_ui_no_hand_timeout`

Suggested event fields:

- mode
- target type (button/link/custom)
- method (pinch/dwell)
- timestamp
- route/page id

---

## 12) Non-goals for Phase 1

Do **not** include in Phase 1:

- full app-wide migration
- push/tap depth-based selection
- full registered target registry rollout
- broad visual redesign of controls

---

## 13) Exit criteria to move to Phase 2

Proceed only when:

- [ ] pilot page stable under feature flag
- [ ] false-select rate acceptable in QA
- [ ] fallback messaging and touch continuity validated
- [ ] no regressions in existing interaction flows

---

## 14) Implementation sequencing (recommended)

1. Add types + resolver + controller scaffolding
2. wire feature flags
3. integrate one pilot page
4. add tests
5. run QA checklist
6. decide phase-2 expansion

---

## 15) Final note

This document is intentionally strict and limited to reduce risk.  
It enables implementation without reopening architecture debates and keeps existing game interactions safe during rollout.
