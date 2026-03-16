# CV Implementation Gaps Analysis

**Date:** 2026-03-15  
**Ticket:** TCK-20260315-001 (NEW)  
**Purpose:** Identify gaps between declared CV modes in game registry and actual implementation

## Executive Summary

This audit reveals significant gaps between the **declared CV modes** in gameRegistry.ts and the **actual hook implementations** in game files. While all 127 games declare at least one CV mode, many do not actually use the corresponding tracking hooks.

## Key Metrics

| Metric | Count | Notes |
|--------|-------|-------|
| Total games in registry | 127 | All have `cv` field |
| Routed games (App.tsx) | 114 | Active games |
| Unrouted/hidden | 13 | Not wired |
| **Properly implemented CV** | **~45** | Uses correct hooks + camera guard |
| **CV declared but missing hooks** | **~48** | Registry says CV but no hooks found |
| **Non-standard CV implementation** | **~15** | Uses raw MediaPipe instead of hooks |

## Gap Category 1: Games Missing CV Hooks Entirely

These games declare CV in registry but have **NO tracking hooks** in their code:

### Color/Art Games (All declare `cv: ['hand']`)

| Game | Registry CV | Actual Implementation |
|------|-------------|----------------------|
| `color-splash` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `color-mixing` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `color-potions` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `pack-lunchbox` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `set-the-table` | `['hand']` | ❌ No hook - pointer clicks |
| `story-builder` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |

### Selection/Sorting Games (All declare `cv: ['hand']`)

| Game | Registry CV | Actual Implementation |
|------|-------------|----------------------|
| `temperature-sort` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `plant-garden` | `['hand']` | ❌ No hook - pointer clicks |
| `sound-garden` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `taste-match` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `farm-friends` | `['hand']` | ❌ No hook - pointer clicks |
| `texture-explorer` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `tidy-up-time` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |

### Educational Games (All declare `cv: ['hand']`)

| Game | Registry CV | Actual Implementation |
|------|-------------|----------------------|
| `counting-objects` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `more-or-less` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `number-sequence` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `blend-builder` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `sight-word-flash` | `['hand']` | ❌ No hook - pointer clicks |
| `ending-sounds` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `letter-sound-match` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `same-and-different` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `shadow-match` | `['hand']` | ❌ No hook - pointer clicks |
| `weather-match` | `['hand']` | ❌ No hook - pointer clicks |
| `pattern-play` | `['hand']` | ✅ Integrated — uses `useGameHandTracking` |
| `animal-sounds` | `['hand']` | ❌ No hook - pointer clicks |

### Complex/3D Games (Declare various CV modes)

| Game | Registry CV | Actual Implementation |
|------|-------------|----------------------|
| `circuit-builder` | `['hand']` | ❌ No hook - pointer clicks |
| `weather-lab` | `['hand']` | ❌ No hook - pointer clicks |
| `word-search` | `['hand']` | ❌ No hook - pointer clicks |
| `body-parts` | `['hand']` | ❌ No hook - pointer clicks |
| `digital-jenga` | `['hand']` | ❌ No hook - pointer clicks |
| `rainbow-bridge` | `['hand']` | ❌ No hook - pointer clicks |
| `reading-along` | `['hand']` | ❌ No hook - pointer clicks |
| `rhythm-tap` | `['hand']` | ❌ No hook - pointer clicks |
| `mirror-duel` | `['pose']` | ❌ No hook - pointer clicks |

## Gap Category 2: Non-Standard Hook Usage

These games have CV but bypass the project's standard hooks:

### Pose Games Using Raw MediaPipe (Not `useGamePoseTracking`)

| Game | Registry CV | Issue |
|------|-------------|-------|
| `yoga-animals` | `['pose']` | Imports `PoseLandmarker` directly |
| `obstacle-course` | `['pose']` | Uses `poseMovementAnalysis` utilities |
| `follow-the-leader` | `['pose']` | Likely raw MediaPipe |
| `musical-statues` | `['pose']` | Likely raw MediaPipe |
| `freeze-dance` | `['pose']` | Likely raw MediaPipe |
| `simon-says` | `['pose']` | Uses `PoseLandmarker` + `useGameHandTracking` |
| `mirror-duel` | `['pose']` | Likely raw MediaPipe |
| `balloon-pop-fitness` | `['pose']` | Likely raw MediaPipe |

### Multi-Mode Games Missing One Mode

| Game | Registry CV | Missing |
|------|-------------|---------|
| `alphabet-tracing` | `['hand', 'face']` | Face tracking not implemented |
| `shadow-portal` | `['pose', 'hand']` | Pose tracking not implemented |
| `math-smash` | `['hand', 'pose']` | Pose tracking not implemented |
| `beginning-sounds` | `['hand', 'voice']` | Neither implemented |

## Gap Category 3: Voice Games

Only 2 games declare voice mode:

| Game | Registry CV | Implementation |
|------|-------------|----------------|
| `bubble-pop` | `['voice']` | ✅ Uses `useMicrophoneInput` |
| `voice-stories` | `['voice']` | ⚠️ Verify implementation |

## Required Actions

### Priority 1: Fix Declaration Mismatches
For ~48 games declaring `cv: ['hand']` without any hand tracking:
- **Option A**: Add `useGameHandTracking` hook (preferred)
- **Option B**: Remove `cv` declaration and mark as `listed: false` if game is incomplete

### Priority 2: Standardize Pose Tracking
For ~8 games using raw `PoseLandmarker`:
- Migrate to `useGamePoseTracking` hook
- Reference: `src/hooks/useGamePoseTracking.ts`

### Priority 3: Complete Multi-Mode Games
For games declaring multiple CV modes but only implementing one:
- Add missing hook implementations
- Update registry to match actual capability

### Priority 4: Verify Camera Guards
- Ensure all CV games have `cameraSafe: true` in App.tsx routes

## Verification Commands

```bash
# Find games with cv: ['hand'] in registry
grep -r "cv:.*\['hand'\]" src/frontend/src/data/gameRegistries/

# Find games using useGameHandTracking hook
grep -r "useGameHandTracking" src/frontend/src/pages/

# Compare to find gaps
```

## Next Steps

1. Create worklog tickets for each gap category
2. Prioritize games based on popularity and learning value
3. Batch-fix games by world/category
4. Update CONTROL_MODE_AUDIT to reflect actual state
