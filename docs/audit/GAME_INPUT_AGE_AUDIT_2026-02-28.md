# Game Input + Age Audit Report (2026-02-28)
**Ticket Reference**: TCK-20260228-001 (Source Audit), TCK-20260302-001 (Feature Flag Implementation)

## 1) Architecture Snapshot
- App entry and routing are defined in `src/frontend/src/main.tsx` and `src/frontend/src/App.tsx`; game routes are lazy-loaded and mostly guarded with `CameraSafeRoute` plus `ProtectedRoute`.
- Game metadata (age range, CV modality, drops/easter eggs) is centralized in `GAME_REGISTRY` (`src/frontend/src/data/gameRegistry.ts`, symbol `GAME_REGISTRY`).
- Hand/camera pipeline: `useGameHandTracking` orchestrates `useHandTrackingRuntime` and optional worker mode (`useVisionWorkerRuntime`); gesture smoothing/pinch detection are in shared tracking utilities.
- Camera failover: `CameraSafeRoute` catches camera/runtime crashes and flips to `CameraCrashFallback`; `NoCameraFallback` exists but currently suggests only 3 games.
- Safety controls: parent gate exists in `Settings` (`ParentGate` in `src/frontend/src/pages/Settings.tsx`) but is not part of per-game purchase/loot flows.

Evidence anchors for this section: `App` route graph (`src/frontend/src/App.tsx`), `GAME_REGISTRY` (`src/frontend/src/data/gameRegistry.ts`), `useGameHandTracking` + `useHandTrackingRuntime` + `useVisionWorkerRuntime` (`src/frontend/src/hooks/*`), `CameraSafeRoute` (`src/frontend/src/components/routing/CameraSafeRoute.tsx`), `NoCameraFallback` (`src/frontend/src/components/NoCameraFallback.tsx`).

## 2) Game Inventory
| Game ID/Route | Definition (path + symbol) | Primary control mode | Existing fallback controls | Session/win/score | Target age in repo | Known mentions |
|---|---|---|---|---|---|---|
| `/games/alphabet-tracing` | `src/frontend/src/App.tsx` L418 route -> `AlphabetGame` | CV-hand,face | pointer/touch, keyboard | levels; has win/lose states; score tracked | `2-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/finger-number-show` | `src/frontend/src/App.tsx` L443 route -> `FingerNumberShow` | CV-hand | keyboard | levels; has win/lose states; score tracked | `3-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/connect-the-dots` | `src/frontend/src/App.tsx` L453 route -> `ConnectTheDots` | CV-hand | not explicit | levels; has win/lose states; score tracked | `3-6` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/letter-hunt` | `src/frontend/src/App.tsx` L463 route -> `LetterHunt` | CV-hand | not explicit | levels; has win/lose states; score tracked | `2-6` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/music-pinch-beat` | `src/frontend/src/App.tsx` L473 route -> `MusicPinchBeat` | CV-hand | not explicit | levels; has win/lose states; score tracked | `3-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/steady-hand-lab` | `src/frontend/src/App.tsx` L483 route -> `SteadyHandLab` | CV-hand | not explicit | levels; has win/lose states; score tracked | `4-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/shape-pop` | `src/frontend/src/App.tsx` L493 route -> `ShapePop` | CV-hand | not explicit | levels; has win/lose states; score tracked | `3-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/color-match-garden` | `src/frontend/src/App.tsx` L503 route -> `ColorMatchGarden` | CV-hand | not explicit | levels; unknown; score tracked | `3-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/color-by-number` | `src/frontend/src/App.tsx` L513 route -> `ColorByNumber` | non-CV | not explicit | levels; has win/lose states; score tracked | `4-6` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/memory-match` | `src/frontend/src/App.tsx` L521 route -> `MemoryMatch` | inferred-CV | not explicit | levels; has win/lose states; score tracked | `4-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/number-tracing` | `src/frontend/src/App.tsx` L529 route -> `NumberTracing` | non-CV | pointer/touch | levels; has win/lose states; score tracked | `4-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/number-tap-trail` | `src/frontend/src/App.tsx` L537 route -> `NumberTapTrail` | CV-hand | not explicit | levels; has win/lose states; score tracked | `4-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/shape-sequence` | `src/frontend/src/App.tsx` L547 route -> `ShapeSequence` | CV-hand | not explicit | levels; has win/lose states; score tracked | `4-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/yoga-animals` | `src/frontend/src/App.tsx` L557 route -> `YogaAnimals` | CV-pose | not explicit | levels; has win/lose states; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/balloon-pop-fitness` | `src/frontend/src/App.tsx` L565 route -> `BalloonPopFitness` | CV-pose | not explicit | levels; has win/lose states; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/follow-the-leader` | `src/frontend/src/App.tsx` L585 route -> `FollowTheLeader` | CV-pose | not explicit | levels; has win/lose states; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/musical-statues` | `src/frontend/src/App.tsx` L595 route -> `MusicalStatues` | CV-pose | not explicit | levels; has win/lose states; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/freeze-dance` | `src/frontend/src/App.tsx` L605 route -> `FreezeDance` | CV-pose | not explicit | levels; has win/lose states; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/simon-says` | `src/frontend/src/App.tsx` L615 route -> `SimonSays` | CV-pose | not explicit | levels; unknown; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/chemistry-lab` | `src/frontend/src/App.tsx` L625 route -> `VirtualChemistryLab` | CV-hand | not explicit | levels; has win/lose states; score tracked | `4-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/word-builder` | `src/frontend/src/App.tsx` L635 route -> `WordBuilder` | CV-hand | not explicit | levels; has win/lose states; score tracked | `3-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/emoji-match` | `src/frontend/src/App.tsx` L645 route -> `EmojiMatch` | CV-hand | not explicit | levels; has win/lose states; score tracked | `3-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/air-canvas` | `src/frontend/src/App.tsx` L655 route -> `AirCanvas` | CV-hand | not explicit | rounds; has win/lose states; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/mirror-draw` | `src/frontend/src/App.tsx` L665 route -> `MirrorDraw` | CV-hand | not explicit | levels; has win/lose states; score tracked | `4-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/phonics-sounds` | `src/frontend/src/App.tsx` L675 route -> `PhonicsSounds` | CV-hand | not explicit | levels; has win/lose states; score tracked | `3-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/phonics-tracing` | `src/frontend/src/App.tsx` L685 route -> `PhonicsTracing` | CV-hand | pointer/touch | levels; has win/lose states; score tracked | `4-6` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/beginning-sounds` | `src/frontend/src/App.tsx` L695 route -> `BeginningSounds` | CV-hand,voice | not explicit | levels; has win/lose states; score tracked | `3-6` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/odd-one-out` | `src/frontend/src/App.tsx` L703 route -> `OddOneOut` | CV-hand | not explicit | levels; unknown; score tracked | `3-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/shadow-puppet-theater` | `src/frontend/src/App.tsx` L711 route -> `ShadowPuppetTheater` | CV-hand | not explicit | levels; unknown; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/virtual-bubbles` | `src/frontend/src/App.tsx` L721 route -> `VirtualBubbles` | CV-hand,voice | pointer/touch | levels; has win/lose states; score tracked | `2-6` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/kaleidoscope-hands` | `src/frontend/src/App.tsx` L731 route -> `KaleidoscopeHands` | CV-hand | pointer/touch | levels; unknown; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/air-guitar-hero` | `src/frontend/src/App.tsx` L741 route -> `AirGuitarHero` | CV-hand | not explicit | levels; unknown; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/fruit-ninja-air` | `src/frontend/src/App.tsx` L751 route -> `FruitNinjaAir` | CV-hand | pointer/touch | levels; unknown; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/counting-objects` | `src/frontend/src/App.tsx` L761 route -> `CountingObjects` | non-CV | not explicit | levels; unknown; score tracked | `3-6` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/more-or-less` | `src/frontend/src/App.tsx` L769 route -> `MoreOrLess` | non-CV | not explicit | levels; has win/lose states; score tracked | `3-6` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/blend-builder` | `src/frontend/src/App.tsx` L777 route -> `BlendBuilder` | non-CV | keyboard | levels; unknown; score tracked | `4-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/syllable-clap` | `src/frontend/src/App.tsx` L785 route -> `SyllableClap` | non-CV | not explicit | levels; unknown; score tracked | `3-6` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/sight-word-flash` | `src/frontend/src/App.tsx` L793 route -> `SightWordFlash` | non-CV | not explicit | levels; has win/lose states; score tracked | `4-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/maze-runner` | `src/frontend/src/App.tsx` L801 route -> `MazeRunner` | non-CV | keyboard | levels; has win/lose states; score tracked | `4-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/path-following` | `src/frontend/src/App.tsx` L809 route -> `PathFollowing` | non-CV | mouse | levels; has win/lose states; score tracked | `3-6` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/rhythm-tap` | `src/frontend/src/App.tsx` L817 route -> `RhythmTap` | non-CV | not explicit | levels; has win/lose states; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/animal-sounds` | `src/frontend/src/App.tsx` L825 route -> `AnimalSounds` | non-CV | not explicit | levels; unknown; score tracked | `2-5` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/body-parts` | `src/frontend/src/App.tsx` L833 route -> `BodyParts` | non-CV | not explicit | levels; unknown; score tracked | `2-5` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/voice-stories` | `src/frontend/src/App.tsx` L841 route -> `VoiceStories` | non-CV | not explicit | levels; unknown; score tracked | `3-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/math-smash` | `src/frontend/src/App.tsx` L849 route -> `MathSmash` | non-CV | not explicit | levels; unknown; score tracked | `4-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/bubble-pop-symphony` | `src/frontend/src/App.tsx` L857 route -> `BubblePopSymphony` | CV-hand | not explicit | rounds; has win/lose states; score tracked | `3-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/dress-for-weather` | `src/frontend/src/App.tsx` L867 route -> `DressForWeather` | CV-hand | not explicit | levels; has win/lose states; score tracked | `3-7` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/story-sequence` | `src/frontend/src/App.tsx` L877 route -> `StorySequence` | CV-hand | mouse | rounds; has win/lose states; score unclear | `4-8` | `src/frontend/docs/ux-analysis/ux-analysis-report.md` |
| `/games/shape-safari` | `src/frontend/src/App.tsx` L887 route -> `ShapeSafari` | CV-hand | mouse | rounds; has win/lose states; score tracked | `3-5` | `src/frontend/docs/ux-analysis/ux-analysis-report.md` |
| `/games/free-draw` | `src/frontend/src/App.tsx` L897 route -> `FreeDraw` | CV-hand | mouse | rounds; has win/lose states; score unclear | `2-6` | `src/frontend/docs/ux-analysis/ux-analysis-report.md` |
| `/games/math-monsters` | `src/frontend/src/App.tsx` L907 route -> `MathMonsters` | CV-hand | not explicit | levels; has win/lose states; score tracked | `5-8` | `src/frontend/docs/ux-analysis/ux-analysis-report.md` |
| `/games/platformer-runner` | `src/frontend/src/App.tsx` L917 route -> `PlatformerRunner` | CV-hand | not explicit | single-loop; has win/lose states; score tracked | `3-8` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |
| `/games/bubble-pop` | `src/frontend/src/App.tsx` L927 route -> `BubblePop` | CV-voice | not explicit | levels; has win/lose states; score tracked | `3-8` | `src/frontend/docs/ux-analysis/ux-analysis-report.md` |
| `/games/rhyme-time` | `src/frontend/src/App.tsx` L935 route -> `RhymeTime` | CV-hand | not explicit | rounds; has win/lose states; score tracked | `4-6` | `src/frontend/docs/ux-analysis/ux-analysis-report.md` |
| `/games/physics-demo` | `src/frontend/src/App.tsx` L945 route -> `PhysicsDemo` | non-CV | not explicit | levels; unknown; score tracked | `Unknown` | `docs/GAME_IMPLEMENTATION_STATUS.md`/worklogs (varies) |

## 3) Runtime Evidence Matrix
| Game | Evidence Method | Artifact(s) | Status |
|---|---|---|---|
| `alphabet-tracing` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `finger-number-show` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `connect-the-dots` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `letter-hunt` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `music-pinch-beat` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `steady-hand-lab` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `shape-pop` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `color-match-garden` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `color-by-number` | Option A (Playwright automated exploratory run) | `src/frontend/docs/ux-analysis/ux-analysis-report.md` + screenshot timestamps in `src/frontend/docs/ux-analysis/screenshots/*color-by-number*` | Observed |
| `memory-match` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `number-tracing` | Option A (Playwright automated exploratory run) | `src/frontend/docs/ux-analysis/ux-analysis-report.md` + screenshot timestamps in `src/frontend/docs/ux-analysis/screenshots/*number-tracing*` | Observed |
| `number-tap-trail` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `shape-sequence` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `yoga-animals` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `balloon-pop-fitness` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `follow-the-leader` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `musical-statues` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `freeze-dance` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `simon-says` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `chemistry-lab` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `word-builder` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `emoji-match` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `air-canvas` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `mirror-draw` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `phonics-sounds` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `phonics-tracing` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `beginning-sounds` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `odd-one-out` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `shadow-puppet-theater` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `virtual-bubbles` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `kaleidoscope-hands` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `air-guitar-hero` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `fruit-ninja-air` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `counting-objects` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `more-or-less` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `blend-builder` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `syllable-clap` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `sight-word-flash` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `maze-runner` | Option A (Playwright automated exploratory run) | `src/frontend/docs/ux-analysis/ux-analysis-report.md` + screenshot timestamps in `src/frontend/docs/ux-analysis/screenshots/*maze-runner*` | Observed |
| `path-following` | Option A (Playwright automated exploratory run) | `src/frontend/docs/ux-analysis/ux-analysis-report.md` + screenshot timestamps in `src/frontend/docs/ux-analysis/screenshots/*path-following*` | Observed |
| `rhythm-tap` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `animal-sounds` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `body-parts` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `voice-stories` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `math-smash` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `bubble-pop-symphony` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `dress-for-weather` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `story-sequence` | Option A (Playwright automated exploratory run) | `src/frontend/docs/ux-analysis/ux-analysis-report.md` + screenshot timestamps in `src/frontend/docs/ux-analysis/screenshots/*story-sequence*` | Observed |
| `shape-safari` | Option A (Playwright automated exploratory run) | `src/frontend/docs/ux-analysis/ux-analysis-report.md` + screenshot timestamps in `src/frontend/docs/ux-analysis/screenshots/*shape-safari*` | Observed |
| `free-draw` | Option A (Playwright automated exploratory run) | `src/frontend/docs/ux-analysis/ux-analysis-report.md` + screenshot timestamps in `src/frontend/docs/ux-analysis/screenshots/*free-draw*` | Observed |
| `math-monsters` | Option A (Playwright automated exploratory run) | `src/frontend/docs/ux-analysis/ux-analysis-report.md` + screenshot timestamps in `src/frontend/docs/ux-analysis/screenshots/*math-monsters*` | Observed |
| `platformer-runner` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |
| `bubble-pop` | Option A (Playwright automated exploratory run) | `src/frontend/docs/ux-analysis/ux-analysis-report.md` + screenshot timestamps in `src/frontend/docs/ux-analysis/screenshots/*bubble-pop*` | Observed |
| `rhyme-time` | Option A (Playwright automated exploratory run) | `src/frontend/docs/ux-analysis/ux-analysis-report.md` + screenshot timestamps in `src/frontend/docs/ux-analysis/screenshots/*rhyme-time*` | Observed |
| `physics-demo` | Option C (not observed in this run) | Required capture: 1) full game start-to-finish recording with camera-permission path, 2) one tracking-loss event, 3) one fallback-control success path | Unknown |

Run note (Observed): during this Playwright execution, Vite logged parse/import errors for `src/frontend/src/pages/BubblePop.tsx` (`useNavigate` redeclaration) and `src/frontend/src/pages/ColorByNumber.tsx` (syntax error near default export). The suite still completed, but these are active reliability defects outside this audit’s scoped remediation edits.

## 4) Age Rubric
| Band | Motor assumptions | Cognitive assumptions | Session length target | Reading dependence | UI constraints |
|---|---|---|---|---|---|
| A (2.0–3.0) | Gross motor only, low precision, one-step gestures | Single-goal, immediate feedback, no branching | 2–5 min | None | 2cm+ targets, audio prompts, no timers, large contrast |
| B (3.0–4.0) | Tap/drag with errors; limited bimanual coordination | 1–2 step tasks, simple matching/sequencing | 3–7 min | Minimal | 2cm targets, persistent goal icon, optional dwell assist |
| C (4.0–6.0) | Better control, still jitter-prone for precise drag | Can follow short rules and simple progression | 5–10 min | Low-to-medium | 1.5–2cm targets, retry-friendly failure, lightweight text + voice |
| D (6.0–8.0) | Emerging precision and keyboard support | Multi-step goals, score/progression comprehension | 8–15 min | Medium | 1–1.5cm min targets, explicit challenge scaling, readable score states |

Sources used to tune this rubric: CDC milestones (2y/3y/4y/5y), NNGroup child motor UX guidance, FTC/ICO dark-pattern guidance for children.

## 5) Audit Cards (All Games)
Legend: `Observed` = runtime artifact available in this run, `Unknown` = requires capture listed in matrix.

### Draw Letters (`alphabet-tracing`)
1. Game Summary: Route `/games/alphabet-tracing` backed by `AlphabetGame`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand,face`; existing fallback `pointer/touch, keyboard`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `2-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking, usePostureDetection, useAttentionDetection`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Finger Counting (`finger-number-show`)
1. Game Summary: Route `/games/finger-number-show` backed by `FingerNumberShow`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `keyboard`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Connect Dots (`connect-the-dots`)
1. Game Summary: Route `/games/connect-the-dots` backed by `ConnectTheDots`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Find the Letter (`letter-hunt`)
1. Game Summary: Route `/games/letter-hunt` backed by `LetterHunt`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `2-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Music Pinch Beat (`music-pinch-beat`)
1. Game Summary: Route `/games/music-pinch-beat` backed by `MusicPinchBeat`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Steady Hand Lab (`steady-hand-lab`)
1. Game Summary: Route `/games/steady-hand-lab` backed by `SteadyHandLab`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Shape Pop (`shape-pop`)
1. Game Summary: Route `/games/shape-pop` backed by `ShapePop`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Color Match Garden (`color-match-garden`)
1. Game Summary: Route `/games/color-match-garden` backed by `ColorMatchGarden`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Color by Number (`color-by-number`)
1. Game Summary: Route `/games/color-by-number` backed by `ColorByNumber`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Observed runtime.
4. UX Clarity: `Observed` exploratory score 80/100 in `src/frontend/docs/ux-analysis/ux-analysis-report.md`; instructions were detected but no explicit start interaction was completed during this run.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; exploratory navigation measured 58ms in the Playwright run.
7. Failure Mode Catalog: Failure mode=`start-state discoverability`; Observable signal=`child never triggers explicit Start action in lightweight probe` (Observed); Current behavior=`interactive elements exist but first action remains ambiguous`; Desired behavior=`single obvious first-action CTA for first-time players`; Proposed fix=`add persistent first-action coachmark until first successful paint action`; Acceptance=`>=80% first-action success within 30s in 5-session sample`; Test plan=`Playwright probe asserts first-action completion event without manual retries`.
8. Issues List: `First-action discoverability gap (observed)`. Impact: Child may stall at initial scene despite seeing controls, reducing completion for lower-reading cohorts. Recommendation: Add always-visible first-step prompt and confirm-state transition after first color placement. Acceptance criteria: first-action completion rate >=80% for age band C in 5-session sample. Test plan: scripted smoke + moderated proxy run with event timestamps.

### Memory Match (`memory-match`)
1. Game Summary: Route `/games/memory-match` backed by `MemoryMatch`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV inferred from hooks/route wrapper`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Number Tracing (`number-tracing`)
1. Game Summary: Route `/games/number-tracing` backed by `NumberTracing`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `pointer/touch`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Observed runtime.
4. UX Clarity: `Observed` exploratory score 55/100 in `src/frontend/docs/ux-analysis/ux-analysis-report.md`; interactive elements were present but no clear instruction or explicit start path was detected.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; exploratory navigation measured 59ms in the Playwright run.
7. Failure Mode Catalog: Failure mode=`instruction invisibility`; Observable signal=`child probe found controls but no guidance text` (Observed); Current behavior=`interaction surface exists without explicit teaching cue`; Desired behavior=`short visual/audio onboarding for first trace`; Proposed fix=`show first-trace ghost stroke + audio cue until first success`; Acceptance=`>=80% first trace within 30s`; Test plan=`Playwright checks for onboarding cue and first successful stroke telemetry`.
8. Issues List: `Instruction clarity gap (observed)`. Impact: Pre-literate users can miss how to begin tracing even when controls are visible. Recommendation: Add first-trace tutorial overlay with tap-to-dismiss memory. Acceptance criteria: first objective completion rate >=80% for age band C in 5-session sample. Test plan: scripted smoke + moderated proxy run with event timestamps.

### Number Tap Trail (`number-tap-trail`)
1. Game Summary: Route `/games/number-tap-trail` backed by `NumberTapTrail`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Shape Sequence (`shape-sequence`)
1. Game Summary: Route `/games/shape-sequence` backed by `ShapeSequence`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Yoga Animals (`yoga-animals`)
1. Game Summary: Route `/games/yoga-animals` backed by `YogaAnimals`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV pose`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Balloon Pop Fitness (`balloon-pop-fitness`)
1. Game Summary: Route `/games/balloon-pop-fitness` backed by `BalloonPopFitness`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV pose`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Follow the Leader (`follow-the-leader`)
1. Game Summary: Route `/games/follow-the-leader` backed by `FollowTheLeader`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV pose`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Musical Statues (`musical-statues`)
1. Game Summary: Route `/games/musical-statues` backed by `MusicalStatues`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV pose`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Freeze Dance (`freeze-dance`)
1. Game Summary: Route `/games/freeze-dance` backed by `FreezeDance`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV pose`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Simon Says (`simon-says`)
1. Game Summary: Route `/games/simon-says` backed by `SimonSays`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV pose`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Chemistry Lab (`chemistry-lab`)
1. Game Summary: Route `/games/chemistry-lab` backed by `VirtualChemistryLab`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Word Builder (`word-builder`)
1. Game Summary: Route `/games/word-builder` backed by `WordBuilder`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Emoji Match (`emoji-match`)
1. Game Summary: Route `/games/emoji-match` backed by `EmojiMatch`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Air Canvas (`air-canvas`)
1. Game Summary: Route `/games/air-canvas` backed by `AirCanvas`; session model is `rounds` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Mirror Draw (`mirror-draw`)
1. Game Summary: Route `/games/mirror-draw` backed by `MirrorDraw`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Phonics Sounds (`phonics-sounds`)
1. Game Summary: Route `/games/phonics-sounds` backed by `PhonicsSounds`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Phonics Tracing (`phonics-tracing`)
1. Game Summary: Route `/games/phonics-tracing` backed by `PhonicsTracing`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `pointer/touch`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Beginning Sounds (`beginning-sounds`)
1. Game Summary: Route `/games/beginning-sounds` backed by `BeginningSounds`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand,voice`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Odd One Out (`odd-one-out`)
1. Game Summary: Route `/games/odd-one-out` backed by `OddOneOut`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Shadow Puppet Theater (`shadow-puppet-theater`)
1. Game Summary: Route `/games/shadow-puppet-theater` backed by `ShadowPuppetTheater`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Virtual Bubbles (`virtual-bubbles`)
1. Game Summary: Route `/games/virtual-bubbles` backed by `VirtualBubbles`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand,voice`; existing fallback `pointer/touch`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `2-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Kaleidoscope Hands (`kaleidoscope-hands`)
1. Game Summary: Route `/games/kaleidoscope-hands` backed by `KaleidoscopeHands`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `pointer/touch`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Air Guitar Hero (`air-guitar-hero`)
1. Game Summary: Route `/games/air-guitar-hero` backed by `AirGuitarHero`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Fruit Ninja Air (`fruit-ninja-air`)
1. Game Summary: Route `/games/fruit-ninja-air` backed by `FruitNinjaAir`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `pointer/touch`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Counting Objects (`counting-objects`)
1. Game Summary: Route `/games/counting-objects` backed by `CountingObjects`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### More or Less (`more-or-less`)
1. Game Summary: Route `/games/more-or-less` backed by `MoreOrLess`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Blend Builder (`blend-builder`)
1. Game Summary: Route `/games/blend-builder` backed by `BlendBuilder`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `keyboard`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Syllable Clap (`syllable-clap`)
1. Game Summary: Route `/games/syllable-clap` backed by `SyllableClap`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Sight Word Flash (`sight-word-flash`)
1. Game Summary: Route `/games/sight-word-flash` backed by `SightWordFlash`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Maze Runner (`maze-runner`)
1. Game Summary: Route `/games/maze-runner` backed by `MazeRunner`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `keyboard`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Observed runtime.
4. UX Clarity: `Observed` exploratory score 55/100 in `src/frontend/docs/ux-analysis/ux-analysis-report.md`; gameplay surface is visible but no clear first-step instruction surfaced in the lightweight run.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; exploratory navigation measured 64ms in the Playwright run.
7. Failure Mode Catalog: Failure mode=`onboarding ambiguity`; Observable signal=`interactive elements discovered but no explicit objective cue` (Observed); Current behavior=`child can interact but may not infer win condition`; Desired behavior=`goal and controls shown on first view`; Proposed fix=`add persistent objective badge + one-line control cue for first session`; Acceptance=`>=80% objective comprehension within 30s`; Test plan=`Playwright asserts visible goal cue and first valid move within 30s`.
8. Issues List: `Onboarding discoverability gap (observed)`. Impact: Children may wander in the maze UI without understanding success condition, reducing progression completion. Recommendation: Add clear first-goal and first-move coaching cues. Acceptance criteria: first objective completion rate >=80% for age band D in 5-session sample. Test plan: scripted smoke + moderated proxy run with event timestamps.

### Path Following (`path-following`)
1. Game Summary: Route `/games/path-following` backed by `PathFollowing`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `mouse`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Observed runtime.
4. UX Clarity: `Observed` exploratory score 55/100 in `src/frontend/docs/ux-analysis/ux-analysis-report.md`; scene loaded quickly with visible controls but no clear first-action instruction in probe output.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; exploratory navigation measured 58ms in the Playwright run.
7. Failure Mode Catalog: Failure mode=`instruction discoverability`; Observable signal=`interactive elements found but no explicit “follow this path” guidance surfaced` (Observed); Current behavior=`children can attempt interaction but may not know success path`; Desired behavior=`first-level guidance visible until first successful path segment`; Proposed fix=`add animated first-segment hint + optional narration`; Acceptance=`>=80% first-path engagement within 30s`; Test plan=`Playwright asserts hint visibility and first valid path interaction`.
8. Issues List: `Guidance visibility gap (observed)`. Impact: Younger children may not understand the core tracing objective quickly enough, increasing abandonment risk. Recommendation: Add first-path visual cue and optional narration toggle. Acceptance criteria: first objective completion rate >=80% for age bands B/C in 5-session sample. Test plan: scripted smoke + moderated proxy run with event timestamps.

### Rhythm Tap (`rhythm-tap`)
1. Game Summary: Route `/games/rhythm-tap` backed by `RhythmTap`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Animal Sounds (`animal-sounds`)
1. Game Summary: Route `/games/animal-sounds` backed by `AnimalSounds`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `2-5`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Body Parts (`body-parts`)
1. Game Summary: Route `/games/body-parts` backed by `BodyParts`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `2-5`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Voice Stories (`voice-stories`)
1. Game Summary: Route `/games/voice-stories` backed by `VoiceStories`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Math Smash (`math-smash`)
1. Game Summary: Route `/games/math-smash` backed by `MathSmash`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Bubble Pop Symphony (`bubble-pop-symphony`)
1. Game Summary: Route `/games/bubble-pop-symphony` backed by `BubblePopSymphony`; session model is `rounds` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Dress For Weather (`dress-for-weather`)
1. Game Summary: Route `/games/dress-for-weather` backed by `DressForWeather`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-7`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Story Sequence (`story-sequence`)
1. Game Summary: Route `/games/story-sequence` backed by `StorySequence`; session model is `rounds` with `has win/lose states` and `score unclear` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `mouse`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Observed runtime.
4. UX Clarity: `Observed` exploratory score 30/100 in `src/frontend/docs/ux-analysis/ux-analysis-report.md` with notes: no obvious start button plus missing first-load instruction/feedback.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking`; load 69ms in Playwright exploratory report.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Observed); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Runtime UX issue observed in exploratory run`. Impact: Observed confusion or discoverability friction in automated child-flow run may reduce completion and increase abandonment. Recommendation: Implement explicit first-action coachmark + persistent retry cue until first successful interaction. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Shape Safari (`shape-safari`)
1. Game Summary: Route `/games/shape-safari` backed by `ShapeSafari`; session model is `rounds` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `mouse`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-5`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Observed runtime.
4. UX Clarity: `Observed` exploratory score 65/100 in `src/frontend/docs/ux-analysis/ux-analysis-report.md`; no explicit issue was filed, but first-run start/instruction cues were not detected in this run.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking`; load 65ms in Playwright exploratory report.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Observed); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Free Draw (`free-draw`)
1. Game Summary: Route `/games/free-draw` backed by `FreeDraw`; session model is `rounds` with `has win/lose states` and `score unclear` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `mouse`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `2-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Observed runtime.
4. UX Clarity: `Observed` exploratory score 60/100 in `src/frontend/docs/ux-analysis/ux-analysis-report.md` with note: brush/tool options not clearly visible.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking`; load 62ms in Playwright exploratory report.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Observed); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Runtime UX issue observed in exploratory run`. Impact: Observed confusion or discoverability friction in automated child-flow run may reduce completion and increase abandonment. Recommendation: Implement explicit first-action coachmark + persistent retry cue until first successful interaction. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Math Monsters (`math-monsters`)
1. Game Summary: Route `/games/math-monsters` backed by `MathMonsters`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `5-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Observed runtime.
4. UX Clarity: `Observed` exploratory score 30/100 in `src/frontend/docs/ux-analysis/ux-analysis-report.md` with notes: monster prominence issue plus missing finger-answer instruction cue.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking, useHandTracking`; load 58ms in Playwright exploratory report.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Observed); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Runtime UX issue observed in exploratory run`. Impact: Observed confusion or discoverability friction in automated child-flow run may reduce completion and increase abandonment. Recommendation: Implement explicit first-action coachmark + persistent retry cue until first successful interaction. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Platform Runner (`platformer-runner`)
1. Game Summary: Route `/games/platformer-runner` backed by `PlatformerRunner`; session model is `single-loop` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Bubble Pop (`bubble-pop`)
1. Game Summary: Route `/games/bubble-pop` backed by `BubblePop`; session model is `levels` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV voice`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `3-8`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Observed runtime.
4. UX Clarity: `Observed` exploratory score 80/100 in `src/frontend/docs/ux-analysis/ux-analysis-report.md`; microphone prompt was detected in this run with no additional issue logged.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useMicrophoneInput`; load 63ms in Playwright exploratory report.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Observed); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Runtime UX issue observed in exploratory run`. Impact: Observed confusion or discoverability friction in automated child-flow run may reduce completion and increase abandonment. Recommendation: Implement explicit first-action coachmark + persistent retry cue until first successful interaction. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### Rhyme Time (`rhyme-time`)
1. Game Summary: Route `/games/rhyme-time` backed by `RhymeTime`; session model is `rounds` with `has win/lose states` and `score tracked` (repo-derived).
2. Controls Spec: current mode `CV hand`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `4-6`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Observed runtime.
4. UX Clarity: `Observed` exploratory score 75/100 in `src/frontend/docs/ux-analysis/ux-analysis-report.md`; no explicit issue was logged, but start-state discovery remains weak in this run.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `useGameHandTracking`; load 2170ms in Playwright exploratory report.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Observed); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

### PhysicsDemo (`physics-demo`)
1. Game Summary: Route `/games/physics-demo` backed by `PhysicsDemo`; session model is `levels` with `unknown` and `score tracked` (repo-derived).
2. Controls Spec: current mode `non-CV`; existing fallback `none explicit in component`; proposed fallback `add big-target tap mode + optional keyboard arrows/space + pause on tracking-loss`.
3. Age-Fit A–D: Repo target age is `Unknown`. Fit call: A/B must avoid reading and precision drag; C/D can support light scoring. Evidence confidence: Unknown runtime.
4. UX Clarity: `Unknown` (no fresh runtime artifact in this run). Capture needed: start screen comprehension + first successful interaction within 30s.
5. Difficulty + Progression: Verify progression fairness against age band by checking first 3 rounds/levels and one failure recovery; current confidence is Inferred from component state machine only.
6. Tech + Performance: Uses hooks `none CV-specific in page`; no per-game runtime timing in this run.
7. Failure Mode Catalog: Failure mode=`input breakdown`; Observable signal=`cursor jitter / no-hand frame / pinch misfire` (Unknown); Current behavior=`not consistently standardized across games`; Desired behavior=`pause + prompt + immediate fallback toggle without losing round`; Proposed fix=`add standard tracking-loss state + dwell/snap assist + fallback CTA`; Acceptance=`child can recover to successful action within <=10s after failure`; Test plan=`Playwright script injects failure condition and asserts recovery UI + successful action`.
8. Issues List: `Fallback-control parity gap (CV-first game)`. Impact: If tracking degrades, game completion may block for younger children who cannot recalibrate camera setup alone. Recommendation: Ship deterministic non-CV fallback path mapped to same game loop (tap/dwell/snap), behind feature flag `features.controls.fallbackV1`. Acceptance criteria: first objective completion rate >=80% for target band in 5-session sample; no blocked session due to input failure. Test plan: scripted smoke + moderated 5-child equivalent proxy run with timestamped recordings and event logs.

## 6) Comparative Analysis
### Per-Game Scorecard (1–5)
| Game | Gameplay clarity | Control robustness | Age fit | Accessibility | Performance | Safety | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| `alphabet-tracing` | 3 | 2 | 4 | 3 | 3 | 3 | No fresh runtime capture |
| `finger-number-show` | 3 | 2 | 4 | 3 | 3 | 3 | No fresh runtime capture |
| `connect-the-dots` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `letter-hunt` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `music-pinch-beat` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `steady-hand-lab` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `shape-pop` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `color-match-garden` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `color-by-number` | 4 | 4 | 4 | 3 | 4 | 3 | Observed via Playwright (lightweight) |
| `memory-match` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `number-tracing` | 3 | 4 | 4 | 3 | 4 | 3 | Observed via Playwright (lightweight) |
| `number-tap-trail` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `shape-sequence` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `yoga-animals` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `balloon-pop-fitness` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `follow-the-leader` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `musical-statues` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `freeze-dance` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `simon-says` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `chemistry-lab` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `word-builder` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `emoji-match` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `air-canvas` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `mirror-draw` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `phonics-sounds` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `phonics-tracing` | 3 | 2 | 4 | 3 | 3 | 3 | No fresh runtime capture |
| `beginning-sounds` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `odd-one-out` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `shadow-puppet-theater` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `virtual-bubbles` | 3 | 2 | 4 | 3 | 3 | 3 | No fresh runtime capture |
| `kaleidoscope-hands` | 3 | 2 | 4 | 3 | 3 | 3 | No fresh runtime capture |
| `air-guitar-hero` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `fruit-ninja-air` | 3 | 2 | 4 | 3 | 3 | 3 | No fresh runtime capture |
| `counting-objects` | 3 | 4 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `more-or-less` | 3 | 4 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `blend-builder` | 3 | 4 | 4 | 3 | 3 | 3 | No fresh runtime capture |
| `syllable-clap` | 3 | 4 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `sight-word-flash` | 3 | 4 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `maze-runner` | 3 | 4 | 4 | 3 | 4 | 3 | Observed via Playwright (lightweight) |
| `path-following` | 3 | 4 | 4 | 3 | 4 | 3 | Observed via Playwright (lightweight) |
| `rhythm-tap` | 3 | 4 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `animal-sounds` | 3 | 4 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `body-parts` | 3 | 4 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `voice-stories` | 3 | 4 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `math-smash` | 3 | 4 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `bubble-pop-symphony` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `dress-for-weather` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `story-sequence` | 2 | 2 | 4 | 2 | 4 | 3 | Observed via Playwright (start clarity regression) |
| `shape-safari` | 3 | 2 | 4 | 2 | 4 | 3 | Observed via Playwright |
| `free-draw` | 3 | 2 | 4 | 2 | 4 | 3 | Observed via Playwright |
| `math-monsters` | 2 | 2 | 4 | 2 | 4 | 3 | Observed via Playwright (instruction visibility issue) |
| `platformer-runner` | 3 | 2 | 4 | 2 | 3 | 3 | No fresh runtime capture |
| `bubble-pop` | 4 | 2 | 4 | 3 | 4 | 3 | Observed via Playwright |
| `rhyme-time` | 3 | 2 | 4 | 2 | 2 | 3 | Observed via Playwright |
| `physics-demo` | 3 | 4 | 2 | 2 | 3 | 2 | No fresh runtime capture |

### Default Control Standard (Proposed)
| Standard element | Default | Why |
|---|---|---|
| Smoothing + dead zone | One-Euro smoothing + 3–5% dead zone | Reduce jitter for young users |
| Dwell click | 350–500ms dwell alternative to pinch | Helps children with inconsistent pinch |
| Snap-to-target | 24–40px magnetic radius (age-adaptive) | Converts near-miss into success |
| Adaptive target sizing | Increase target after 2 misses | Prevent frustration loops |
| Pause on tracking loss | Auto-pause + audible guidance within 1s | Avoid “frozen confusion” |
| Onboarding micro-tutorial | <=30s, skippable, replayable | Quick start for both child and adult assist |
| Feature flag rollout | `features.controls.fallbackV1` | Reversible deployment for risk control |

### Compliance Against Standard
| Category | Games | Status |
|---|---|---|
| Partial (some fallback present) | `free-draw`, `story-sequence`, `shape-safari`, `number-tracing`, `phonics-tracing`, `path-following`, `maze-runner`, `blend-builder` | Partial |
| Missing explicit fallback parity in CV loops | Most `CameraSafeRoute` CV games | Missing |
| Non-CV baseline games | counting/word/math non-camera routes | Compliant for camera independence, but age-fit still needs runtime validation |

## 7) Safety And Dark-Pattern Checklist
| Game | No gacha-like RNG / coercive loop | Purchase gate clarity | Adult-only gates where needed | No accidental destructive exits | Age-safe audio/visual tone | Notes |
|---|---|---|---|---|---|---|
| `alphabet-tracing` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `finger-number-show` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `connect-the-dots` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `letter-hunt` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `music-pinch-beat` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `steady-hand-lab` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `shape-pop` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `color-match-garden` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `color-by-number` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `memory-match` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `number-tracing` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `number-tap-trail` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `shape-sequence` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `yoga-animals` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `balloon-pop-fitness` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `follow-the-leader` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `musical-statues` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `freeze-dance` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `simon-says` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `chemistry-lab` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `word-builder` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `emoji-match` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `air-canvas` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `mirror-draw` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `phonics-sounds` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `phonics-tracing` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `beginning-sounds` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `odd-one-out` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `shadow-puppet-theater` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `virtual-bubbles` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `kaleidoscope-hands` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `air-guitar-hero` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `fruit-ninja-air` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `counting-objects` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `more-or-less` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `blend-builder` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `syllable-clap` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `sight-word-flash` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `maze-runner` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `path-following` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `rhythm-tap` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `animal-sounds` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `body-parts` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `voice-stories` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `math-smash` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `bubble-pop-symphony` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `dress-for-weather` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `story-sequence` | Partial | Pass | Partial | Partial | Pass | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `shape-safari` | Partial | Pass | Partial | Partial | Pass | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `free-draw` | Partial | Pass | Partial | Partial | Pass | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `math-monsters` | Partial | Pass | Partial | Partial | Pass | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `platformer-runner` | Partial | Pass | Partial | Partial | Unknown | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `bubble-pop` | Partial | Pass | Partial | Partial | Pass | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `rhyme-time` | Partial | Pass | Partial | Partial | Pass | Random drop tables in GAME_REGISTRY should be reviewed against deterministic-reward policy. |
| `physics-demo` | Unknown | Pass | Partial | Partial | Unknown | No registry metadata available. |

## 8) Research Notes (Only Decision-Changing)
1. NNGroup child motor research (https://www.nngroup.com/articles/children-ux-physical-development/) changed control recommendations: 2cm targets, avoid high-precision drag for younger cohorts, and prefer simple gestures for under-9.
2. FTC dark-pattern report (https://www.ftc.gov/system/files/ftc_gov/pdf/P214800+Dark+Patterns+Report+9.14.2022+-+FINAL.pdf) changed backlog priority for unauthorized purchases and deceptive progression cues, especially in child-directed interfaces.
3. ICO children nudge guidance (https://ico.org.uk/for-organisations/advice-and-services/audits/data-protection-audit-framework/toolkits/age-appropriate-design/nudge-techniques/) changed policy around countdown-pressure offers, loot-box usage minimization, and parent-controlled paid features.
4. FTC Genshin enforcement (https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental) changed recommendation to avoid child-facing randomized reward monetization patterns and require transparent odds/consent if any paid randomness exists.

## 9) Prioritized Backlog
| ID | Title | Category | Affected games / bands | Severity | Frequency | Effort | Confidence | Priority | Acceptance criteria | Test plan |
|---|---|---|---|---|---|---|---|---|---|---|
| APP-001 | Standardize CV fallback parity (tap/dwell/snap) | Input resilience | All CV/voice games; A-D | High | High | M | High | P0 | Every CV game can complete core loop without camera in <=2 interactions to enable fallback. | Playwright + forced no-camera + scripted core loop completion. |
| APP-002 | Tracking-loss pause/recovery standard | Input resilience | All CV games; A-C critical | High | High | M | High | P0 | Tracking loss shows pause overlay within 1s with retry/fallback options; no silent freeze. | Inject no-frame in runtime hook and assert overlay + resume/fallback. |
| APP-003 | Age-band target sizing and dwell defaults | Age appropriateness | All touch games; A-C | High | Medium | S | High | P0 | A/B targets >=2cm equivalent and dwell alternative active by default. | Visual regression + interaction tests with miss-rate thresholds. |
| APP-004 | Deterministic child reward model (replace RNG drop pressure) | Safety | All games with random drops metadata | High | Medium | M | Medium | P1 | Kids always get deterministic progress reward; no chance-based “near miss” loop. | Unit tests on reward function determinism + UX copy audit. |
| APP-005 | 30-second onboarding micro-tutorial pattern | UX clarity | All games; A-D | Medium | High | M | High | P1 | First-time player can start meaningful interaction <=30s. | Playwright onboarding timing assertions + event logs. |
| APP-006 | Cross-game control settings panel (sensitivity, dwell, narration) | Accessibility | All games | Medium | Medium | M | Medium | P1 | Parent/teacher can set control profile once and apply globally. | Settings integration tests + per-game adapter contract tests. |
| APP-007 | Runtime evidence automation expansion | Quality | All games currently Option C | Medium | High | M | High | P1 | At least one automated exploratory artifact per game route weekly. | CI Playwright matrix with screenshot/video retention. |
| APP-008 | Voice-game fallback parity | Input resilience | bubble-pop, virtual-bubbles, beginning-sounds | Medium | Medium | S | Medium | P2 | Voice-unavailable state offers equivalent tap mode without session loss. | Mic-denied simulation + touch fallback completion tests. |
| APP-009 | Exit/confirmation consistency for destructive actions | Safety | All games | Medium | Medium | S | Medium | P2 | No accidental exit from active session without confirm in child mode. | Keyboard/touch accidental-trigger tests. |
| APP-010 | Doc sync: game registry vs routes vs statuses | Governance | All games | Low | High | S | High | P2 | Single source table generated and consumed by docs/pages. | Static check compares route map and registry map on CI. |

Quick wins: APP-003, APP-008, APP-010. Risky changes (feature-flag): APP-001, APP-002, APP-004.  
**Update (2026-03-02)**: Feature flag system now implemented (Unit-0). Flags: `controls.fallbackV1`, `safety.pauseOnTrackingLoss`, `rewards.deterministicV1`, `controls.voiceFallbackV1`.

## 10) Implementation-Unit Plan

> **Status Update (2026-03-02)**: Unit-0 implemented — Feature flag foundation now exists. See `src/frontend/src/config/features.ts` and `docs/adr/ADR-007-FEATURE_FLAGS.md`.

1. **Unit-0 (Feature Flag Foundation)**: ✅ **DONE** — Implemented type-safe feature flag system with env > user > default hierarchy. Enables safe rollout of APP-001, APP-002, APP-004. Files: `features.ts`, `useFeatureFlag.ts`, ADR-007.
2. Unit-1 (Inventory Foundation): APP-010 + APP-007; establish reliable inventory and artifact pipeline before gameplay changes.
3. Unit-2 (Safety Baseline): APP-002 + APP-009; unify pause/recovery and accidental-exit protection. **Uses flag: `safety.pauseOnTrackingLoss`**.
4. Unit-3 (Core Input Resilience): APP-001 + APP-003 with feature flag `features.controls.fallbackV1`.
5. Unit-4 (Clarity And Accessibility): APP-005 + APP-006; improve onboarding and global control profiles.
6. Unit-5 (Economy/Safety Hardening): APP-004 deterministic rewards refactor with migration plan and child-safe copy checks. **Uses flag: `rewards.deterministicV1`**.
7. Unit-6 (Specialized Voice Flows): APP-008 after Unit-3 shared fallback primitives are available. **Uses flag: `controls.voiceFallbackV1`**.

## 11) Mentions Update Plan (Close The Loop)
| Location | Current mention/problem | Update action |
|---|---|---|
| `docs/GAME_IMPLEMENTATION_STATUS.md` | Legacy status list had no runtime evidence method or age/input quality gate tie-in. | Completed in this pass: added `2026-02-28 Audit Linkage Update` with evidence method/date table for 10 observed games and direct link to audit artifact. |
| `docs/COLLECTIBLES_SYSTEM_RESEARCH.md` | Gacha-risk recommendation existed but was not explicitly tied to execution backlog. | Completed in this pass: linked deterministic rewards recommendation to backlog item `APP-004` and added migration milestones/acceptance checks. |
| `src/frontend/src/components/NoCameraFallback.tsx` | Fallback UI promotes only three alternatives and implies touch support for routes not validated. | Replace static list with generated “verified fallback-ready” list from route metadata. |
| `src/frontend/src/App.tsx` | Duplicate `/games/balloon-pop-fitness` route and mixed camera-wrapped/non-wrapped patterns are undocumented. | Document route anomalies and normalize through generated route manifest validation. |
| `src/frontend/docs/ux-analysis/ux-analysis-report.md` | 2026-02-28 run now covers 10 games and includes explicit inventory coverage gap tracking. | Completed in this pass: added `Coverage Gap vs Full Inventory` section and lightweight probes for `number-tracing`, `path-following`, `maze-runner`, `color-by-number`; continue expanding observed set toward full inventory. |
| `docs/AGE_BANDS.md` | Age bands not consistently mapped to current game routes. | Rebuild table from `GAME_REGISTRY` + route map and include A/B/C/D mapping column. |
