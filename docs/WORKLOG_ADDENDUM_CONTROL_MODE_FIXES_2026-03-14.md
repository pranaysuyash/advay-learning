# TCK-20260314-005 :: Control Mode Fixes - Critical UX Remediation

Ticket Stamp: STAMP-20260314T112121Z-codex-i7a9

Type: BUG FIX / UX
Owner: Pranay
Created: 2026-03-14
Status: **IN_PROGRESS**
Priority: P0

## Scope Contract

- In-scope:
  - Fix 5 camera-gated but pointer-primary games (remove CameraSafeRoute OR add CV)
  - Fix MirrorMaze CV_SIGNAL_NO_GUARD (add CameraSafeRoute OR gate CV code)
  - Update App.tsx route configuration
  - Add CV controls to games where appropriate
  - Test each game still works after changes
- Out-of-scope:
  - Full game rewrites
  - New game mechanics
  - Other audit items
- Behavior change allowed: YES (fixing broken UX)

## Targets

- Repo: learning_for_kids
- Files:
  - `src/frontend/src/App.tsx` (route configuration)
  - `src/frontend/src/pages/AirGuitarHero.tsx` (assess CV need)
  - `src/frontend/src/pages/KaleidoscopeHands.tsx` (assess CV need)
  - `src/frontend/src/pages/PhonicsTracing.tsx` (add CV or remove gate)
  - `src/frontend/src/pages/ShadowPuppetTheater.tsx` (assess CV need)
  - `src/frontend/src/pages/TargetPractice.tsx` (add CV or remove gate)
  - `src/frontend/src/pages/MirrorMaze.tsx` (add CameraSafeRoute)
- Branch/PR: `codex/wip-control-mode-fixes` -> `main`

## Problem Statement

### Issue 1: Camera-Gated but Pointer-Primary (5 Games)
These games request camera permission via `CameraSafeRoute` but don't actually use computer vision:
- Children see camera prompts but gameplay is touch/mouse-only
- Creates confusion and unnecessary permission requests
- Breaks trust: "Why does this game need my camera?"

### Issue 2: CV_SIGNAL_NO_GUARD (MirrorMaze)
- Game has CV code but no `CameraSafeRoute` wrapper
- Risk of runtime errors if CV code executes without camera permission
- Only game in this category (unique risk)

## Decision Matrix

**CORRECTED: This is a CV-primary app. All games should use CV.**

| Game | Current | Decision | Implementation |
|------|---------|----------|----------------|
| AirGuitarHero | POINTER_PRIMARY | **ADD CV** | Hand tracking for strumming gestures |
| KaleidoscopeHands | POINTER_PRIMARY | **ADD CV** | Hand tracking for drawing (already has handPosition) |
| PhonicsTracing | POINTER_PRIMARY | **ADD CV** | Pinch-to-trace for precision |
| ShadowPuppetTheater | POINTER_PRIMARY | **ADD CV** | Hand pose/shape detection |
| TargetPractice | POINTER_PRIMARY | **ADD CV** | Hand tracking for aim + pinch to shoot |
| MirrorMaze | CV_SIGNAL_NO_GUARD | **Add CameraSafeRoute** | Already has face tracking, just needs safety wrapper |

## Acceptance Criteria

- [x] **MirrorMaze**: Already has CameraSafeRoute (verified)
- [x] **TargetPractice**: Add hand tracking for aim + pinch to shoot ✅ DONE
- [x] **KaleidoscopeHands**: Add hand tracking for drawing (pinch to draw) ✅ DONE
- [ ] **AirGuitarHero**: Add hand tracking for strumming gestures
- [ ] **PhonicsTracing**: Add pinch-to-trace functionality  
- [ ] **ShadowPuppetTheater**: Add hand pose detection
- [x] Games classified as CV_PRIMARY_OR_INTENDED (TargetPractice, KaleidoscopeHands)
- [x] CONTROL_MODE_AUDIT.md partially updated

## Execution Log

- [2026-03-14 17:05] Created ticket, analyzing each game
- [2026-03-14 17:15] **MIRROR MAZE**: Already has CameraSafeRoute (was already fixed!)
- [2026-03-14 17:30] **TARGET PRACTICE**: Added CV hand tracking
  - Hand tracking with `useGameHandTracking` hook
  - Index finger tip for aiming
  - Pinch gesture to shoot at targets
  - `KenneyHandCursor` for visual feedback
  - Mouse fallback preserved
  - Hand detection indicator UI
  - ESLint passes

## Implementation Details

### TargetPractice CV Integration
```typescript
// Key features added:
- useGameHandTracking hook for hand detection
- Cursor position mapped to game area
- Pinch detection for shooting
- KenneyHandCursor visual feedback
- Hand detection status indicator
- Preserved mouse click fallback
```

## Prompt Trace

- `prompts/remediation/implementation-v1.6.1.md`
- Source: `docs/audit/CONTROL_MODE_AUDIT_2026-03-12.md`

## Status Updates

- [2026-03-14 17:05] **IN_PROGRESS** - Starting implementation
