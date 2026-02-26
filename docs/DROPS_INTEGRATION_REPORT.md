# Item Drop System — Integration Report

**Date:** 2026-02-26  
**Scope:** Wiring `useGameDrops` hook into all game components  
**Status:** Complete (with known gaps documented below)

---

## Architecture Overview

```
Player completes game round
        │
        ▼
useGameDrops(gameId)          ← hook per game component
  ├── onGameComplete(score?)  ← rolls drops from game's manifest
  │     │
  │     ▼
  │   inventoryStore.processGameCompletion(gameId, score)
  │     ├── getDropTable(gameId)       ← reads from gameRegistry.ts
  │     ├── rollDropsFromTable(table)  ← RNG per entry, respects minScore
  │     ├── addItem() per drop         ← updates inventory
  │     └── set lastDrops + showDropToast  ← triggers toast UI
  │
  ├── triggerEasterEgg(eggId) ← one-time hidden discoveries
  │     ├── hasFoundEasterEgg(eggId)      ← idempotent guard
  │     ├── getRegistryEasterEggs(gameId) ← validates egg belongs to game
  │     └── inventoryStore.findEasterEgg(eggId) ← adds reward item
  │
  └── isEggFound(eggId)       ← check if already discovered
```

### Key Design Decisions

1. **Single source of truth**: `gameRegistry.ts` defines both drop tables and easter eggs per game. The old `easterEggs.ts` file still exists but is no longer imported by the store.

2. **StrictMode safety**: `useGameDrops` debounces `onGameComplete` with a 1-second cooldown via `lastProcessedRef` to prevent React 18 StrictMode double-processing.

3. **Reconciliation**: `inventoryStore.ts` was updated to import `getRegistryEasterEggById` from `gameRegistry.ts` instead of `getEasterEggById` from `easterEggs.ts`. The registry is now the canonical source.

4. **Inventory persistence**: Zustand's `persist` middleware saves to `localStorage` under key `advay-inventory`. Only `ownedItems`, `discoveredRecipes`, `foundEasterEggs`, and `totalDiscoveries` are persisted.

---

## Integration Status — All Games

### Games with `onGameComplete` wired and actively called

| # | Game ID | Component | Trigger Point | Score Passed? | Easter Eggs |
|---|---------|-----------|---------------|---------------|-------------|
| 1 | `alphabet-tracing` | AlphabetGame.tsx | All levels cleared | No | — |
| 2 | `letter-hunt` | LetterHunt.tsx | All levels cleared | No | `egg-treasure-hunter` ✅ |
| 3 | `finger-number-show` | FingerNumberShow.tsx | Session stop | No | — |
| 4 | `number-tap-trail` | NumberTapTrail.tsx | All levels cleared | No | `egg-golden-number` ✅ |
| 5 | `number-tracing` | NumberTracing.tsx | Round complete | Yes (score) | — |
| 6 | `word-builder` | WordBuilder.tsx | All levels cleared | No | `egg-first-word` ✅ |
| 7 | `phonics-sounds` | PhonicsSounds.tsx | All levels cleared | No | `egg-vowel-master` ✅ |
| 8 | `shape-pop` | ShapePop.tsx | Session stop | No | `egg-diamond-pop` ✅ |
| 9 | `shape-sequence` | ShapeSequence.tsx | All levels cleared | No | — |
| 10 | `color-match-garden` | ColorMatchGarden.tsx | All levels cleared | No | — |
| 11 | `color-by-number` | ColorByNumber.tsx | Picture completed | Yes (score) | — |
| 12 | `connect-the-dots` | ConnectTheDots.tsx | All levels cleared | No | `egg-star-connector` ✅ |
| 13 | `steady-hand-lab` | SteadyHandLab.tsx | Session stop | No | `egg-surgeon-hands` ✅ |
| 14 | `music-pinch-beat` | MusicPinchBeat.tsx | Session stop | No | `egg-full-scale` ✅ |
| 15 | `yoga-animals` | YogaAnimals.tsx | Session stop | No | `egg-spirit-animal` ✅ |
| 16 | `freeze-dance` | FreezeDance.tsx | Session stop | No | `egg-ice-sculpture` ✅ |
| 17 | `simon-says` | SimonSays.tsx | Session stop | No | `egg-simon-master` ✅ |
| 18 | `chemistry-lab` | VirtualChemistryLab.tsx | Session stop (button) | No | `egg-gold-reaction` ✅, `egg-periodic-key` ✅ |
| 19 | `emoji-match` | EmojiMatch.tsx | All levels cleared | No | `egg-emotion-master` ✅ |
| 20 | `air-canvas` | AirCanvas.tsx | *(see gap #1)* | — | `egg-rainbow-canvas` ✅ |
| 21 | `mirror-draw` | MirrorDraw.tsx | All levels cleared | No | `egg-perfect-symmetry` ✅ |
| 22 | `dress-for-weather` | DressForWeather.tsx | All outfits matched | No | — |
| 23 | `story-sequence` | StorySequence.tsx | All stories done | No | — |
| 24 | `shape-safari` | ShapeSafari.tsx | All shapes traced | No | — |
| 25 | `rhyme-time` | RhymeTime.tsx | All levels cleared | No | — |
| 26 | `math-monsters` | MathMonsters.tsx | All levels cleared | No | — |
| 27 | `platformer-runner` | PlatformerRunner.tsx | Game over | Yes (score) | `egg-coin-king` ✅ |
| 28 | `bubble-pop` | BubblePop.tsx | Session stop | No | — |
| 29 | `bubble-pop-symphony` | BubblePopSymphony.tsx | *(see gap #2)* | — | — |
| 30 | `free-draw` | FreeDraw.tsx | *(see gap #3)* | — | — |

**Totals:** 30 game components wired. 17 easter eggs triggered across 15 games.

---

## Known Gaps

### Gap 1: AirCanvas — `onGameComplete` not called

AirCanvas destructures only `triggerEasterEgg` (no `onGameComplete`). Since it's a continuous drawing tool with no "completion" concept, this is intentional. Drops only come from the easter egg (`egg-rainbow-canvas`). However, a session-end trigger could be added if desired.

### Gap 2: BubblePopSymphony — `_onGameComplete` aliased but never called

The hook is wired as `const { onGameComplete: _onGameComplete } = useGameDrops('bubble-pop-symphony')` — the underscore alias means it's imported but intentionally unused. Need to find the session-end or stop-game point and call it.

### Gap 3: FreeDraw — `_onGameComplete` aliased but never called

Same pattern as BubblePopSymphony. FreeDraw is a continuous creative tool with no completion state. To activate drops, either:
- Call on session stop (when user navigates away)
- Don't call at all (keep drops from easter eggs only, if any are added)

### Gap 4: Score not passed to most games

Only 3 games pass a score to `onGameComplete(score)`: ColorByNumber, PlatformerRunner, and NumberTracing. The `minScore` field on drop entries is therefore only effective in those 3 games. All other games call `onGameComplete()` without a score, meaning `minScore`-gated drops will never filter — they'll always be eligible.

**Impact:** Drop entries with `minScore` in gameRegistry.ts for games that don't pass score are silently ignored. This affects:
- `alphabet-tracing`: `color-rainbow` requires minScore 95, `tool-paintbrush` requires 85
- `letter-hunt`: `creature-owl` requires minScore 85
- `number-tap-trail`: `element-au` requires minScore 90
- `phonics-sounds`: `creature-owl` requires minScore 90
- `shape-pop`: `shape-diamond` requires minScore 90
- `math-monsters`: `element-au` requires minScore 90
- Many others

**Recommendation:** Either pass score from each game, or remove `minScore` gates from games that don't track numeric scores.

### Gap 5: `egg-golden-brush` (AirCanvas) not wired

The AirCanvas easter egg `egg-golden-brush` (trigger: `draw-circle`) requires circle shape detection, which is not implemented. Only `egg-rainbow-canvas` (use all colors) is wired.

### Gap 6: Duplicate egg definitions

Easter eggs are defined in both `easterEggs.ts` (the old file) and `gameRegistry.ts` (the new source of truth). The old file is no longer imported by the store but still exists. It should either be deleted or marked as deprecated to avoid confusion.

---

## Easter Egg Trigger Conditions

| Egg ID | Game | Condition in Code | Approximation Notes |
|--------|------|-------------------|---------------------|
| `egg-emotion-master` | EmojiMatch | `missCountRef.current === 0` at game completion | Exact: all levels, zero misses |
| `egg-first-word` | WordBuilder | Every `completeWord()` call | Triggers on first word only (idempotent via `hasFoundEasterEgg`) |
| `egg-golden-number` | NumberTapTrail | `levelRef.current >= MAX_LEVEL` | Approximation: completing all levels ≈ perfect trail. Max trail length is 9, not 10+. |
| `egg-vowel-master` | PhonicsSounds | Tracks correctly identified vowels in `correctVowelsRef` Set | Exact: all 5 vowels (A,E,I,O,U) correctly matched |
| `egg-diamond-pop` | ShapePop | `popWindowRef` tracks pops within 30-second sliding window, triggers at ≥20 | Exact implementation with rolling window |
| `egg-star-connector` | ConnectTheDots | `level >= 5` (all levels cleared) | Approximation: triggers on any game completion, not specifically star-shaped pictures |
| `egg-gold-reaction` | VirtualChemistryLab | `discoveredReactions.size + 1 >= 3` | Approximation: 3 unique reactions ≈ "3 perfect reactions in a row" (no streak tracking exists) |
| `egg-periodic-key` | VirtualChemistryLab | `discoveredReactions.size + 1 >= 5` | Exact: 5 unique reactions discovered |
| `egg-full-scale` | MusicPinchBeat | `playedLanesRef` Set tracks lanes, triggers when all `LANE_COUNT` (3) played | Note: game has 3 lanes (Sa, Re, Ga), not 7 notes as egg description says |
| `egg-surgeon-hands` | SteadyHandLab | `round + 1 >= 3` | Approximation: 3 completed holds ≈ "15 seconds steady" (actual hold duration per round unknown without reading logic file) |
| `egg-treasure-hunter` | LetterHunt | `foundCountRef.current >= 8` | Exact: 8 correct letter finds tracked via ref |
| `egg-spirit-animal` | YogaAnimals | `holdTime >= 10` (10-second perfect hold) | Pre-existing implementation — exact |
| `egg-ice-sculpture` | FreezeDance | `perfectFreezeStreakRef.current >= 5` | Pre-existing implementation — exact |
| `egg-simon-master` | SimonSays | `r + 1 >= 10` in `setRound` updater | Exact: 10 rounds completed (continuous game, no explicit failure) |
| `egg-rainbow-canvas` | AirCanvas | `usedColorsRef` Set, triggers when `size >= COLORS.length` (14 colors) | Exact: all 14 available colors selected |
| `egg-perfect-symmetry` | MirrorDraw | `result.accuracy >= 0.95` after match scoring | Exact: 95%+ accuracy on any drawing |
| `egg-coin-king` | PlatformerRunner | `score >= 20` at game over | Approximation: score counts coins (1 each) + gems (5 each), so 20 points ≠ exactly 20 coins |

---

## Data Flow Diagram

```
gameRegistry.ts (GAME_REGISTRY[])
  ├── drops: DropEntry[]          → used by inventoryStore.processGameCompletion()
  ├── easterEggs: EasterEgg[]     → used by useGameDrops.triggerEasterEgg()
  │                                  └── also used by inventoryStore.findEasterEgg()
  │                                       via getRegistryEasterEggById()
  └── (id, name, path, etc.)      → used by gallery, routing

collectibles.ts (ALL_ITEMS[])
  ├── item definitions (60+)      → used by inventoryStore.addItem() / getItem()
  └── rollDropsFromTable()        → RNG engine for drops

inventoryStore.ts (Zustand persist)
  ├── ownedItems                  → Inventory.tsx renders these
  ├── foundEasterEggs             → prevents re-discovery
  ├── discoveredRecipes           → crafting history
  ├── lastDrops + showDropToast   → ItemDropToast.tsx reads these
  └── totalDiscoveries            → stats display

useGameDrops.ts (React hook)
  └── thin wrapper connecting game components to the store
      with StrictMode debounce and egg validation
```

---

## Files Changed (This Session)

| File | Change |
|------|--------|
| `data/gameRegistry.ts` | Added `getRegistryEasterEggById()` lookup function |
| `store/inventoryStore.ts` | Switched import from `easterEggs.ts` → `gameRegistry.ts` |
| `pages/PlatformerRunner.tsx` | Added `useGameDrops`, `onGameComplete(score)`, `egg-coin-king` trigger |
| `pages/ColorByNumber.tsx` | Added `useGameDrops`, `onGameComplete(score)` on picture complete |
| `pages/EmojiMatch.tsx` | Added `triggerEasterEgg('egg-emotion-master')` on zero-miss completion |
| `pages/WordBuilder.tsx` | Added `triggerEasterEgg('egg-first-word')` on word completion |
| `pages/NumberTapTrail.tsx` | Added `triggerEasterEgg('egg-golden-number')` on final level |
| `pages/PhonicsSounds.tsx` | Added vowel tracking ref + `triggerEasterEgg('egg-vowel-master')` |
| `pages/ShapePop.tsx` | Added 30s sliding window + `triggerEasterEgg('egg-diamond-pop')` |
| `pages/ConnectTheDots.tsx` | Added `triggerEasterEgg('egg-star-connector')` on game complete |
| `pages/VirtualChemistryLab.tsx` | Added both `egg-gold-reaction` and `egg-periodic-key` triggers |
| `pages/MusicPinchBeat.tsx` | Added lane tracking + `triggerEasterEgg('egg-full-scale')` |
| `pages/SteadyHandLab.tsx` | Added `triggerEasterEgg('egg-surgeon-hands')` after 3 holds |
| `pages/LetterHunt.tsx` | Added found counter + `triggerEasterEgg('egg-treasure-hunter')` |
| `pages/SimonSays.tsx` | Added `triggerEasterEgg('egg-simon-master')` at round 10 |
| `pages/AirCanvas.tsx` | Added color tracking + `triggerEasterEgg('egg-rainbow-canvas')` |
| `pages/MirrorDraw.tsx` | Added `triggerEasterEgg('egg-perfect-symmetry')` at 95%+ accuracy |

**Not changed (already wired by prior work):**
- YogaAnimals — `egg-spirit-animal` was already implemented
- FreezeDance — `egg-ice-sculpture` was already implemented

---

## Open Questions for Research (Before Further Implementation)

1. **Is the drop probability model right for 3-8 year olds?** Common items at 0.5 chance and legendaries at 0.01 — will kids get frustrated? What drop cadence keeps engagement without gambling-like loops?

2. **Should `minScore` gates be removed?** Most games don't pass score. Either wire score into all games or simplify the drop model.

3. **Toast UX for non-readers:** The `showDropToast` system shows item drops — but can a 3-year-old understand what they got? Needs visual/audio design research.

4. **Easter egg discoverability:** 17 eggs exist but there's no hint system or progress indicator. Should there be an "egg tracker" UI?

5. **easterEggs.ts cleanup:** The old file should be deprecated or removed now that gameRegistry.ts is the source of truth.

6. **BubblePopSymphony and FreeDraw:** Should continuous/creative games have drops at all, or are they opt-out by design?
