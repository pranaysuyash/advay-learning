# Hand UI Research Consolidated (MediaPipe + React + Child UX)

**Date:** 2026-02-28  
**Status:** Documentation-first complete  
**Purpose:** Consolidate **all inputs** (user-provided research + repo-validated analysis + existing audit artifacts) into one implementation-ready reference before coding.

---

## 1) Sources consolidated in this document

### A. User-provided research input (this conversation)

- "Hand-Based Pointing and Clicking in React With MediaPipe Hands for Children"
- Key assertions included:
  - four-layer architecture (provider/cursor/interaction/targets)
  - dwell/pinch/tap selection trade-offs for children
  - worker-first rationale for synchronous detection APIs
  - child-safe UI requirements (large targets, hysteresis, safe corner, fallback modes)
  - migration plan: DOM hit-testing first, registered targets second

### B. Repo-validated architecture work (already documented)

- `docs/research/MEDIAPIPE_REACT_UI_INTERACTION_ARCHITECTURE_2026-02-28.md`
- Includes:
  - current inventory of hand/runtime hooks and components
  - primary + secondary UI model
  - rollout and testing strategy
  - external research cross-check section

### C. Existing hand-tracking centralization research (historical)

- `docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md`

### D. Relevant audit inputs

- `docs/audit/src__frontend__src__components__game__HandDetectionProvider.tsx.md`
- `docs/audit/src__frontend__src__utils__coordinateTransform.ts.md`

---

## 2) Current-state truth snapshot (repo-grounded)

The repository already has most foundational infrastructure needed for hand-driven UI:

- Runtime orchestration and fallback:
  - `src/frontend/src/hooks/useGameHandTracking.ts`
  - `src/frontend/src/hooks/useHandTrackingRuntime.ts`
  - `src/frontend/src/hooks/useVisionWorkerRuntime.ts`
  - `src/frontend/src/workers/vision.worker.ts`
- Detection context abstraction:
  - `src/frontend/src/components/game/HandDetectionProvider.tsx`
  - `src/frontend/src/components/game/HandDetectionContext.tsx`
  - `src/frontend/src/components/game/useHandDetection.ts`
- Smoothing and gesture primitives:
  - `src/frontend/src/utils/oneEuroFilter.ts`
  - `src/frontend/src/utils/pinchDetection.ts`
  - `src/frontend/src/utils/handTrackingFrame.ts`
- Coordinate mapping:
  - `src/frontend/src/utils/coordinateTransform.ts`
- Existing cursor/feedback surfaces:
  - `src/frontend/src/components/game/GameCursor.tsx`
  - `src/frontend/src/components/game/CursorEmbodiment.tsx`
  - `src/frontend/src/components/game/HandTrackingStatus.tsx`

**Conclusion:** This is not a greenfield tracking problem. It is a **standardization and interaction-layer problem**.

---

## 3) Consolidated architecture decision

Adopt a four-layer model, adapted to this repo:

1. **HandInteractionProvider** (new, app-level interaction scope)
   - wraps/consumes existing tracking runtime
   - exposes frame + health + mode state

2. **CursorController** (new)
   - indexTip -> interaction surface mapping
   - smoothing + clamping + optional magnetism

3. **InteractionEngine** (new)
   - converts cursor + gesture state into semantic intents:
     - hoverStart, hoverEnd, select, dragStart/Move/End
   - supports dwell and pinch with guardrails

4. **TargetResolver** (new)
   - path A: DOM hit-testing (`elementFromPoint`)
   - path B: registered targets (`useHandTarget`) for deterministic critical flows

---

## 4) Child-first interaction policy (canonical)

### Default policy

- **Generic UI (menus/cards/modals/buttons):** Dwell-first
- **Game-specific precision interactions:** Pinch-first where appropriate
- **Touch/mouse always available** as immediate fallback

### Safety and anti-error guardrails

- click debounce window (minimum interval)
- hysteresis on gesture transitions
- hover stability threshold before activation
- sticky hover + exit halo for jitter tolerance
- safe-corner policy for parent/admin actions:
  - longer dwell and/or 2-step confirmation

---

## 5) Secondary UI / fallback model (canonical)

When tracking degrades or camera is unavailable:

1. **Dwell mode** (if pinch unstable)
2. **Large-target scan mode** (simplified focus path)
3. **Touch/mouse continuity mode** (always available)

User-facing messaging must remain friendly:

- "Show me your hand 👋"
- "Camera is having trouble — you can tap to continue"

No hard lock-out on camera failure.

---

## 6) Migration strategy (everything first, then code)

### Phase 0 (this stage) — Documentation complete

Artifacts now available:

- architecture plan
- external-research cross-check
- consolidated master document (this file)
- linked audit findings

### Phase 1 — Foundation implementation (next, limited scope)

- Build shared controller + mode resolver only
- Do not mass-refactor pages yet
- Feature-flag interaction engine

### Phase 2 — Pilot pages

- `MediaPipeTest.tsx`
- `MirrorDraw.tsx`
- one non-canvas DOM-heavy page

### Phase 3 — Broad migration

- prioritize pages with bespoke pinch/click logic
- move critical controls to registered targets

### Phase 4 — Hardening

- instrumentation + threshold tuning
- age/device profile calibration

---

## 7) Open questions that must be calibrated (not assumed)

1. Primary target platform profile(s): desktop/tablet/TV
2. Typical camera/environment quality (distance, lighting)
3. Age-band defaults:
   - 3–5: slower dwell, larger targets
   - 6–8: faster dwell or mixed pinch+dwell options
4. Runtime transfer mode defaults (`bitmap` vs `imageData`) per device class
5. Parent corner unlock UX details

---

## 8) Known caveats from repo review

1. `useHandClick` usage appears inconsistent across pages (positional vs object-style patterns).
2. Provider naming needs separation between raw detection context and app-level interaction layer.
3. Worker mode is strong directionally but requires measured transfer/perf tuning, not assumptions.

These are now documented as explicit Phase-1 hardening tasks.

---

## 9) Canonical implementation acceptance criteria (pre-code signoff)

Before coding proceeds beyond pilot:

- [ ] Shared interaction state contract finalized (cursor/gesture/mode/quality)
- [ ] Dwell + pinch rule set finalized with default thresholds
- [ ] Safe-corner protection policy agreed
- [ ] Fallback behavior copy and UX states approved
- [ ] Telemetry fields approved (false-select, mode-switch, hand-lost)

---

## 10) What this document changes

This document does **not** implement code. It does:

- unify all current research inputs (yours + mine + existing repo docs)
- establish one decision baseline for implementation
- prevent fragmented design decisions during migration

---

## 11) Recommended immediate next step

Proceed with a **Phase-1 implementation spec** (interfaces + defaults + tests) under feature flag, using this consolidated document as the source of truth.
