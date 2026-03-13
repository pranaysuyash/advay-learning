# Implementation Plan - React Stabilization & Asset Migration Repair

## Problem Description
1.  **Maximum update depth exceeded**: The console log shows a cascade starting from `useGameLoop` -> `useGameHandTracking` -> `useState` and also `checkSpeaking` in `useTTS`. This indicates synchronous state updates triggered by frame loops or intervals without proper stabilization.
2.  **Duplicate Key Error**: `CircuitBuilder.tsx` is throwing errors because multiple children have the key `bulb`. This happens when `CHALLENGES` or dynamic components use non-unique identifiers (like type name) as React keys.
3.  **Broken Asset Migration**: A previous attempt to migrate from emojis to high-fidelity icons failed, leaving the app referencing non-existent PNG files in `/assets/items/`. This causes 404 errors and missing visuals in `collectibles.ts`, `YogaAnimals.tsx`, and `EmojiMatch.tsx`.

## Proposed Changes

### [Frontend] Core Hooks Stabilization

#### [MODIFY] [useGameHandTracking.ts](file:///Users/pranay/Projects/learning_for_kids/src/frontend/src/hooks/useGameHandTracking.ts)
- Stabilize `setFps` and `setAverageFps` in the `useGameLoop` callback.
- Add checks to prevent updating state if the value hasn't changed meaningfully.
- Ensure props like `smoothing` or `pinch` options are stable (memoized) if they impact effect dependencies.

#### [MODIFY] [useTTS.ts](file:///Users/pranay/Projects/learning_for_kids/src/frontend/src/hooks/useTTS.ts)
- Change `setInterval(checkSpeaking, 100)` to only update state if `ttsService.isSpeaking()` actual value changes.
- Ensure `mountedRef` is checked *after* the service call.

### [Frontend] Game Logic & Components

#### [MODIFY] [circuitBuilderLogic.ts](file:///Users/pranay/Projects/learning_for_kids/src/frontend/src/games/circuitBuilderLogic.ts)
- Update `CHALLENGES` definitions to ensure `requiredComponents` map-based rendering uses unique keys (e.g., `index` or component type concatenated with index).

#### [MODIFY] [CircuitBuilder.tsx](file:///Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/CircuitBuilder.tsx)
- Standardize key usage in loops (Challenges menu, Toolbox, and Canvas components).
- Ensure `comp.id` is used consistently for the canvas components.

### [Frontend] Asset Migration Repair

#### [NEW] High-Fidelity Icons
- Generate 25+ new icons for Creatures, Elements, and Emotions categories using the `generate_image` tool.
- **Creatures**: Cat, Dog, Lion, Butterfly, Owl, Dragon, Unicorn, Bird, Tree.
- **Elements**: Hydrogen, Oxygen, Carbon, Nitrogen, Sodium, Chlorine, Iron, Gold, Helium, Sulfur.
- **Emotions**: Happy, Sad, Angry, Surprised, Scared, Silly, Sleepy, Love.

#### [VERIFY] File Integrity
- Ensure every `icon` path referenced in `src/frontend/src/data/collectibles.ts`, `emojiMatchLogic.ts`, and `YogaAnimals.tsx` exists on disk.
- Update `/assets/items/manifest.json` to include these new mappings if necessary (though current code uses direct paths).

---

## Verification Plan

### Automated Tests
- Run `npm test` in `src/frontend` to ensure no regressions in existing hook tests.
- Run Playwright E2E tests for `CircuitBuilder`:
  ```bash
  npx playwright test src/frontend/e2e/workflow_tests/circuit_builder_flow.spec.ts
  ```

### Manual Verification
1.  **Console Audit**: Open the browser console in the dev environment and verify:
    - No "Maximum update depth exceeded" errors after starting a game with hand tracking.
    - No "Duplicate key" warnings in the `CircuitBuilder` menu and during gameplay.
2.  **Asset Audit**:
    - Verify all game icons display correctly (no 404s).
    - Check the gallery/collectibles screen to ensure new high-fidelity assets appear.
3.  **Performance Check**: Use `react-scan` (which we just enabled) to verify that `useGameHandTracking` is not causing excessive re-renders of the entire component tree on every frame.
