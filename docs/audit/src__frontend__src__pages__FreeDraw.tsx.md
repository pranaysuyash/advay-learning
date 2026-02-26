# Audit: `src/frontend/src/pages/FreeDraw.tsx`

Ticket: `TCK-20260223-900`  
Date: 2026-02-23  
Source Ticket: TCK-20260225-004
Prompt Traceability: `prompts/audit/audit-v1.5.1.md` + `prompts/remediation/implementation-v1.6.1.md` (findings-only pass, no fixes in this artifact)

## Scope Contract

- In-scope:
  - Logical/runtime issues in `FreeDraw` hand-tracking + drawing flow
  - Evidence-backed findings with severity and reproduction logic
  - Research notes tied to findings
- Out-of-scope:
  - Full remediation patch in this artifact
  - Other game pages (tracked separately, one game at a time)
- Behavior change allowed: `NO` (audit only)

## Findings

### F1: Clear action does not fully reset drawing session state

- Severity: `HIGH`
- Evidence:
  - `Observed`: `clearCanvas()` only resets strokes/current stroke/undo-redo and does not reset `isDrawing` or `lastPoint` in `src/frontend/src/games/freeDrawLogic.ts:275`.
  - `Observed`: drawing flow depends on `gameState.isDrawing` transitions in `src/frontend/src/pages/FreeDraw.tsx:103`.
- Risk:
  - `Inferred`: if clear is triggered during pinch/draw transitions, state can remain logically "drawing" while canvas is reset, causing inconsistent next-stroke behavior.

### F2: Hand tracking remains active while start menu is visible

- Severity: `HIGH`
- Evidence:
  - `Observed`: `useGameHandTracking({ isRunning: true, ... })` in `src/frontend/src/pages/FreeDraw.tsx:118`.
  - `Observed`: start menu is controlled by `showMenu` in `src/frontend/src/pages/FreeDraw.tsx:54` and rendered at `src/frontend/src/pages/FreeDraw.tsx:361`.
  - `Observed`: frame callback mutates drawing state (`startStroke`/`continueStroke`/`endStroke`) in `src/frontend/src/pages/FreeDraw.tsx:103`.
- Risk:
  - `Inferred`: state updates may occur before user taps "Start Drawing", violating user expectation and increasing CPU usage on menu screen.

### F3: Canvas backing resolution is not synchronized to displayed box

- Severity: `MEDIUM`
- Evidence:
  - `Observed`: rendering uses `canvas.width` and `canvas.height` in `src/frontend/src/pages/FreeDraw.tsx:131`.
  - `Observed`: no resize/sync code found setting backing dimensions from CSS size (`clientWidth/clientHeight`) on mount/resize.
  - `Observed`: pointer coordinates are normalized from DOM rect (`rect.width/height`) in `src/frontend/src/pages/FreeDraw.tsx:276`, but draw raster uses backing dimensions.
- Risk:
  - `Inferred`: mismatch can cause blur, offset, and non-uniform stroke fidelity across devices/DPR values.

## Research Notes

### R1: Menu-gated camera/game loops reduce accidental interactions

- `Observed`: project architecture and UX docs emphasize controlled start flows and child clarity (`docs/UX_ANALYSIS_FRAMEWORK.md`, `docs/CHILD_UX_TESTING_GUIDE.md`).
- `Inferred`: tying `isRunning` to explicit gameplay state (`!showMenu`) aligns with that guidance and reduces hidden side effects.

### R2: State reset symmetry prevents hard-to-reproduce interaction bugs

- `Observed`: the logic module explicitly tracks drawing session state (`isDrawing`, `lastPoint`) in `src/frontend/src/games/freeDrawLogic.ts:52`.
- `Inferred`: any "hard reset" action (`clear`) should reset all session-coupled fields, not only stroke buffers.

### R3: Canvas size synchronization is a standard requirement for precision drawing

- `Observed`: this page mixes normalized input and raster output (`src/frontend/src/pages/FreeDraw.tsx:276`, `src/frontend/src/pages/FreeDraw.tsx:131`).
- `Inferred`: explicit backing-size sync is needed to maintain correct coordinate mapping and visual quality on high-DPI and responsive layouts.

## Recommended Remediation Plan (Next Step)

1. Update `clearCanvas()` to reset `isDrawing` and `lastPoint`.
2. Gate `useGameHandTracking` with `isRunning: !showMenu`.
3. Add `syncCanvasResolution()` on mount + resize, with DPR-aware sizing.
4. Add targeted tests:
   - clear resets active drawing session state
   - no hand-frame-driven mutation while menu is visible
   - canvas resize path preserves pointer/stroke alignment

## Status

- Audit complete: `YES`
- Fix implemented in this artifact: `NO`
- Ready for remediation ticket execution: `YES`
