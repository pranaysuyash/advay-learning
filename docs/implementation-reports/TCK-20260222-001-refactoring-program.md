# TCK-20260222-001 Implementation Report

Date: 2026-02-22
Prompt traceability:
- `prompts/planning/implementation-planning-v1.0.md`
- `AGENTS.md` workflow/evidence discipline

## Summary
Implemented the refactoring program core phases with evidence-first execution and preservation-first archival.

## Delivered

### 1) Shared utilities
- Added `src/frontend/src/utils/haptics.ts`
- Added `src/frontend/src/utils/random.ts`

### 2) Duplicate helper elimination
- Removed local `triggerHaptic`/`random01` helpers from active game pages.
- Replaced usage with shared imports (`triggerHaptic`, `randomFloat01`).

### 3) Archival (no deletion)
- Moved stale backup files to `archive/backups/frontend-src-2026-02-22/`.
- Archived `ShapePopRefactored.tsx` and retained canonical `ShapePop.tsx`.

### 4) Hand tracking migration batch
- Migrated to `useGameHandTracking`:
  - `ShapePop.tsx`
  - `SteadyHandLab.tsx`
  - `WordBuilder.tsx`
  - `NumberTapTrail.tsx`
  - `ShapeSequence.tsx`
  - `ColorMatchGarden.tsx`
  - `EmojiMatch.tsx`
- Extended `useGameHandTracking` with controlled runtime options for incremental migration.

### 5) Types/store organization
- Added `src/frontend/src/types/game.ts`
- Added `src/frontend/src/types/index.ts`
- Added alias `src/frontend/src/store/socialStore.ts`
- Updated `src/frontend/src/store/index.ts`

### 6) Tests
- Added utility tests for haptics/random.
- Updated brittle smoke assertions in `GamePages.smoke.test.tsx`.

## Verification

### Command
`cd src/frontend && npm run type-check`

### Result
Pass (`tsc --noEmit` completed without errors)

### Command
`cd src/frontend && npx vitest run src/utils/__tests__/haptics.test.ts src/utils/__tests__/random.test.ts src/pages/__tests__/GamePages.smoke.test.tsx`

### Result
Pass (24/24 tests)

### Command
`cd src/frontend && npm run lint`

### Result
Pass.

## Follow-up
- Complete visual interaction standardization breadth (`GameCursor`/`TargetSystem`) where still custom.
- Finish full `store/` vs `stores/` import migration and canonical directory consolidation.

## 2026-02-22 Additional Migration Wave

### Added migrations (hand-tracking)
- `src/frontend/src/pages/StorySequence.tsx`
- `src/frontend/src/pages/ShapeSafari.tsx`
- `src/frontend/src/pages/FreeDraw.tsx`
- `src/frontend/src/pages/RhymeTime.tsx`
- `src/frontend/src/pages/MathMonsters.tsx`
- `src/frontend/src/pages/MusicPinchBeat.tsx`
- `src/frontend/src/pages/ConnectTheDots.tsx`
- `src/frontend/src/pages/LetterHunt.tsx`
- `src/frontend/src/pages/PhonicsSounds.tsx`
- `src/frontend/src/pages/BubblePopSymphony.tsx`
- `src/frontend/src/pages/MirrorDraw.tsx`
- `src/frontend/src/pages/DressForWeather.tsx`
- `src/frontend/src/pages/AirCanvas.tsx`
- `src/frontend/src/pages/VirtualChemistryLab.tsx`
- `src/frontend/src/pages/FreezeDance.tsx` (hand phase standardized; pose remains direct)
- `src/frontend/src/pages/AlphabetGame.tsx`
- `src/frontend/src/games/FingerNumberShow.tsx`

### Migration verification commands
- `rg -n "useHandTracking\\(" src/frontend/src/pages src/frontend/src/games` -> no matches
- `rg -n "useHandTrackingRuntime\\(" src/frontend/src/pages src/frontend/src/games` -> no matches
- `rg -n "detectForVideo\\(" src/frontend/src/pages src/frontend/src/games` -> only pose/test pages (`FreezeDance` pose path, `SimonSays`, `YogaAnimals`, `MediaPipeTest`)

### Post-migration checks
- `cd src/frontend && npm run type-check` -> pass
- `cd src/frontend && npx vitest run src/utils/__tests__/haptics.test.ts src/utils/__tests__/random.test.ts src/pages/__tests__/GamePages.smoke.test.tsx` -> pass (24/24)
- `cd src/frontend && npm run lint` -> pass

## 2026-02-22 Visual + Store Standardization Pass

### Cursor standardization
- Enhanced `src/frontend/src/components/game/GameCursor.tsx` with normalized coordinates support:
  - `coordinateSpace?: 'viewport' | 'normalized'`
  - `containerRef?: RefObject<HTMLElement | null>`
- Migrated pages to shared cursor rendering:
  - `src/frontend/src/pages/NumberTapTrail.tsx`
  - `src/frontend/src/pages/ShapeSequence.tsx`
  - `src/frontend/src/pages/WordBuilder.tsx`
  - `src/frontend/src/pages/ColorMatchGarden.tsx`
  - `src/frontend/src/pages/PhonicsSounds.tsx`
  - `src/frontend/src/pages/ShapePop.tsx`
  - `src/frontend/src/pages/SteadyHandLab.tsx`
  - `src/frontend/src/pages/LetterHunt.tsx`
  - `src/frontend/src/pages/ConnectTheDots.tsx`

### Store canonicalization
- Canonicalized social store to `src/frontend/src/store/socialStore.ts`.
- Converted `src/frontend/src/stores/socialStore.ts` to a compatibility shim:
  - `export * from '../store/socialStore';`
  - `export { default } from '../store/socialStore';`

### Verification for this pass
- `cd src/frontend && npx eslint src/components/game/GameCursor.tsx src/pages/NumberTapTrail.tsx src/pages/ShapeSequence.tsx src/pages/WordBuilder.tsx src/pages/ColorMatchGarden.tsx src/pages/PhonicsSounds.tsx src/pages/ShapePop.tsx src/pages/SteadyHandLab.tsx src/pages/LetterHunt.tsx src/pages/ConnectTheDots.tsx src/store/socialStore.ts src/stores/socialStore.ts` -> pass
- `cd src/frontend && npx vitest run src/pages/__tests__/GamePages.smoke.test.tsx` -> pass (18/18)
- `cd src/frontend && npm run type-check` -> pass

## Scope Clarification
- Effective rule for this program execution: in-repo frontend blockers found during implementation (lint/type/tests) are treated as in-scope and remediated in the same pass unless explicitly excluded by owner direction.
