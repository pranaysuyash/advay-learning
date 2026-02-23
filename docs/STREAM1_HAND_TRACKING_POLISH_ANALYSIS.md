# Stream 1: Hand-Tracking Premium Polish

## Analysis Date

2026-02-23

## Summary

Analysis of 11 modern-pattern games requiring premium polish.

## Findings

### Games Already Well-Polished (3)

- AirCanvas - Full premium polish
- MirrorDraw - Full premium polish
- PhonicsSounds - Full premium polish

### Games Needing Minor Polish (8)

#### SteadyHandLab.tsx

| Area                 | Status                         | Evidence                                                               |
| -------------------- | ------------------------------ | ---------------------------------------------------------------------- |
| useHandTracking hook | ✅ Using `useGameHandTracking` | `const { isLoading: isModelLoading, isReady: isHandTrackingReady... }` |
| AssetLoader          | ✅ Full integration            | `import { assetLoader, SOUND_ASSETS, WEATHER_BACKGROUNDS }`            |
| Coordinate transform | ⚠️ Using normalized            | Uses `coordinateSpace='normalized'`                                    |
| Audio feedback       | ✅ Has sounds                  | `assetLoader.playSound('pop', 0.3)`, playSuccess(), playError()        |
| Accessibility        | ⚠️ Partial                     | Some buttons missing aria-labels                                       |
| Lifecycle            | ✅ Good                        | Uses refs for state guards                                             |

#### WordBuilder.tsx

| Area                 | Status                         | Evidence                                                            |
| -------------------- | ------------------------------ | ------------------------------------------------------------------- |
| useHandTracking hook | ✅ Using `useGameHandTracking` | `const { isReady, startTracking, webcamRef } = useGameHandTracking` |
| AssetLoader          | ✅ Full integration            | Imports assetLoader, SOUND_ASSETS                                   |
| Coordinate transform | ⚠️ Using normalized            | Uses normalized coordinates                                         |
| Audio feedback       | ✅ Has sounds                  | Success/error sounds implemented                                    |
| Accessibility        | ⚠️ Partial                     | Needs aria-labels on buttons                                        |
| Lifecycle            | ✅ Good                        | Proper cleanup                                                      |

#### ConnectTheDots.tsx

| Area                 | Status                         | Evidence                        |
| -------------------- | ------------------------------ | ------------------------------- |
| useHandTracking hook | ✅ Using `useGameHandTracking` | Standard hook usage             |
| AssetLoader          | ✅ Imports                     | Imports assetLoader             |
| Coordinate transform | ⚠️ Using normalized            | Needs mapNormalizedPointToCover |
| Audio feedback       | ✅ Has sounds                  | Sound effects in place          |
| Accessibility        | ⚠️ Partial                     | Needs aria-labels               |
| Lifecycle            | ✅ Good                        | Proper refs                     |

## Implementation Plan

### Priority 1: Coordinate Transformation Fix

For all games using normalized coordinates, update to use screen coordinates:

```typescript
import { mapNormalizedPointToCover } from '../utils/coordinateTransform';

const screenPoint = mapNormalizedPointToCover(
  frame.indexTip,
  webcamRef.current,
);
```

### Priority 2: Accessibility Audit

Add aria-labels to all interactive elements:

- Buttons
- Game controls
- Navigation elements

### Priority 3: Lifecycle Verification

Ensure all games have:

- Ref-based guards for async operations
- Animation frame cleanup
- Timeout cleanup in useEffect returns

## Games to Polish (Priority Order)

1. **SteadyHandLab** - Complex hand interactions
2. **WordBuilder** - Gesture-based
3. **ConnectTheDots** - Drawing game
4. **EmojiMatch** - Standard interactions
5. **ColorMatchGarden** - Color matching
6. **LetterHunt** - Letter hunting
7. **NumberTapTrail** - Number tracing
8. **ShapeSequence** - Shape sequencing

## Effort Estimate

- Per game: 30-60 minutes
- Total: 4-8 hours

## Evidence

- Analysis from subagent research
- Code inspection of SteadyHandLab.tsx, WordBuilder.tsx, ConnectTheDots.tsx

---

## Soft Cartoon Hand Embodiment Spec (Pilot Locked 2026-02-23)

### Goal
Improve control clarity for young kids by replacing abstract dot-only cursor feedback with a friendly floating hand embodiment while preserving gameplay logic.

### Visual States
- `idle`: subtle bob/tilt
- `tracking`: stable follow with short trail
- `pinching`: finger-close pose + green pulse ring
- `success`: quick sparkle pulse

### UX Constraints
- Minimum visible size: 72px
- High-contrast outline required
- Preserve existing smoothing and avoid jitter amplification
- Keep a dot-cursor fallback path via feature flags

### Implemented Pilot
- New: `src/frontend/src/components/game/HandAvatarCursor.tsx`
- New: `src/frontend/src/components/game/CursorEmbodiment.tsx`
- Config: `src/frontend/src/components/game/cursorEmbodimentConfig.ts`
- Pilot integration: `src/frontend/src/pages/EmojiMatch.tsx`

### Feature Flags
- `VITE_HAND_AVATAR_ENABLED`
- `VITE_HAND_AVATAR_GAMES` (default allowlist includes `EmojiMatch`)

### Test Evidence
- `src/frontend/src/components/game/__tests__/HandAvatarCursor.test.tsx`
- `src/frontend/src/components/game/__tests__/CursorEmbodiment.test.tsx`

### Cohort A Embodiment Rollout Status (2026-02-23)

- `ShapeSequence`: migrated to `CursorEmbodiment` (soft hand capable + dot fallback)
- `NumberTapTrail`: migrated to `CursorEmbodiment` (soft hand capable + dot fallback)

Regression status after migration:
- Type-check: pass
- Lint: pass
- Smoke + cursor tests: pass
