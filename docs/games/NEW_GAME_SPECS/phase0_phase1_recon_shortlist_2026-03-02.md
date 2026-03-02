# Phase 0-1: Repo Recon And Game Shortlist (2026-03-02)

## Scope

This document captures the completed Phase 0 and Phase 1 outputs:

1. Repo/system recon for game architecture and constraints
2. New game candidate shortlist
3. Rubric-based selection of top games for deeper specs

---

## Phase 0: Repo Recon Summary

### Existing Games And Entrypoints

1. Game metadata is centralized in `src/frontend/src/data/gameRegistry.ts` with ~50 listed games and world/vibe/cv/drop metadata.
2. Route entrypoints are explicitly wired in `src/frontend/src/App.tsx`, so adding a game requires both registry entry and route/lazy import wiring.
3. Gallery/discovery is driven by registry data in `src/frontend/src/pages/Games.tsx`.

### Rendering Stack

1. Main runtime is React + DOM + Tailwind + Framer Motion.
2. Canvas 2D is used where needed for game loops and overlays; no Phaser/Pixi/Three runtime dependency.
3. Shared canvas utility exists in `src/frontend/src/components/game/GameCanvas.tsx`.

### Input Architecture

1. Hand tracking abstraction is strong via `src/frontend/src/hooks/useGameHandTracking.ts` with worker/main-thread mode, smoothing, pinch state, and FPS targeting.
2. Reusable interaction primitives are available:
   - `src/frontend/src/components/game/TargetSystem.tsx`
   - `src/frontend/src/components/game/DragDropSystem.tsx`
   - `src/frontend/src/components/game/GameCursor.tsx`
   - `src/frontend/src/components/game/HandTrackingStatus.tsx`
3. Camera/no-camera resilience patterns are present:
   - `src/frontend/src/components/routing/CameraSafeRoute.tsx`
   - `src/frontend/src/components/NoCameraFallback.tsx`
   - `src/frontend/src/store/settingsStore.ts` camera toggle

### State, Audio, Rewards, Progress

1. Common game state pattern is short-loop flow (`start -> playing -> complete`) with 30-180s rounds.
2. Shared feedback systems are available:
   - Audio via `src/frontend/src/utils/audioManager.ts` and `src/frontend/src/utils/hooks/useAudio.ts`
   - Haptics via `src/frontend/src/utils/haptics.ts`
   - Celebration overlays/components
3. Deterministic-capable progression and rewards exist:
   - `src/frontend/src/components/GamePage.tsx`
   - `src/frontend/src/services/progressQueue.ts`
   - `src/frontend/src/hooks/useGameDrops.ts`
   - `src/frontend/src/store/inventoryStore.ts`

### What Is Easy Vs Expensive Here

1. Easy: target hit, drag-drop, sequence/ordering, timer-score loops, audio/TTS reinforcement, deterministic completion rewards.
2. Medium: moving-object canvas loops with collision and pacing control.
3. Expensive: net-new engine architecture, heavy procedural systems, complex multi-agent runtime logic.

### Performance And UX Guardrails

1. 30 FPS target patterns already exist in `useGameLoop` and hand-tracking loops.
2. Route-level lazy loading is already used for games.
3. Child-friendly UI conventions are established: large hit areas, bold visual hierarchy, low text load, optional voice cues.

---

## Phase 1: Candidate Shortlist (14)

Each candidate includes one-line pitch, loop summary, skills, controls, fit, and effort.

| Game | One-Line Pitch | Core Loop | Skills | Controls (Mediapipe + Fallback) | Repo Fit | Effort |
|---|---|---|---|---|---|---|
| Parcel Pals | Match packages to shadow bins before the cart leaves. | Brief demo -> drag parcels to bins -> finish on all sorted or timer end | Categorization, fine motor | Pinch-drag + mouse/touch drag | Reuses drag-drop primitives | S |
| River Stone Hop | Hop stepping stones in safe color/number order across a river. | Show rule -> select stones in order -> reach finish bank | Sequencing, inhibition, number/color | Pinch select + tap/click | Reuses target + path patterns | S |
| Snack Stack Cafe | Build snack towers in exact top-to-bottom order from a picture card. | View card -> place stack layers -> validate tower | Working memory, ordering | Pinch-drop + touch/mouse drag | Reuses stack/sequence + drag-drop | M |
| Bubble Mail Route | Pop bubbles only on houses matching today’s delivery symbol. | Start route -> pop valid targets -> end route score | Selective attention, symbol matching | Pinch pop + tap/click | Extends bubble/target systems | S |
| Toy Cleanup Sprint | Sort toys into room zones under a calm countdown. | Start wave -> sort incoming toys -> finish on quota | Executive function, categorization | Pinch drag + touch/mouse drag | Reuses sort-zone mechanics | M |
| Glow Path Tracer | Follow a moving glow trail without leaving it too long. | Follow guide -> maintain trace -> score by accuracy | Motor control, sustained attention | Hand follow + mouse/touch hold | Reuses steady-hand/path logic | M |
| Shape Bakery Orders | Fill bakery boxes with exact shape counts shown by icon card. | Show order card -> place exact counts -> validate | Counting, one-to-one mapping | Pinch/tap pick-place + drag/tap | Reuses shape/count modules | S |
| Color Lantern Parade | Light lanterns in announced color rhythm patterns. | Hear pattern -> replay pattern -> complete rounds | Auditory memory, rhythm | Pinch select + keyboard/tap | Reuses rhythm + sequence checks | M |
| Little Builder Grid | Recreate a silhouette on a simple grid using blocks. | Show silhouette -> place blocks -> match threshold | Spatial reasoning, planning | Pinch place/remove + touch/mouse | Reuses grid/canvas utilities | M |
| Garden Water Dash | Water only thirsty plants while skipping happy plants. | Start wave -> target thirsty plants -> wave result | Attention switching, speed control | Pinch target + tap/click | Reuses good/bad target loops | S |
| Moonlight Firefly Count | Catch the exact number of fireflies shown by visual card. | Show target count -> catch fireflies -> exact/near result | Counting, impulse control | Pinch catch + tap/click | Reuses moving target/count checks | M |
| Zoo Gate Match | Open the correct animal gate from a sound cue. | Play cue -> choose gate -> streak rounds | Auditory discrimination, memory | Pinch select + tap/click | Reuses audio quiz mechanics | S |
| Pattern Train Conductor | Fill missing train cars in repeating patterns. | Show train blanks -> choose missing cars -> complete set | Pattern reasoning | Pinch/tap choose + keyboard | Reuses pattern-play logic | S |
| Mini Meteor Shield | Deflect friendly meteors into safe zones. | Start wave -> redirect only friendly meteors -> fixed-wave end | Visual tracking, coordination | Hand steer + mouse/touch steer | Reuses canvas loop + zone collision | L |

---

## Phase 1 Rubric Selection (Top 5)

Rubric dimensions:

1. Fun density
2. Implementation leverage
3. Robustness without mediapipe
4. Clarity for pre-literate kids
5. Differentiation from existing games

| Game | Fun | Leverage | No-MP Robustness | Pre-Literate Clarity | Differentiation | Total |
|---|---:|---:|---:|---:|---:|---:|
| Parcel Pals | 4 | 5 | 5 | 5 | 4 | 23 |
| River Stone Hop | 5 | 4 | 5 | 5 | 4 | 23 |
| Toy Cleanup Sprint | 4 | 5 | 5 | 5 | 3 | 22 |
| Shape Bakery Orders | 4 | 5 | 5 | 5 | 3 | 22 |
| Glow Path Tracer | 4 | 4 | 5 | 5 | 4 | 22 |

Selected for deep spec + implementation planning:

1. Parcel Pals
2. River Stone Hop
3. Toy Cleanup Sprint
4. Shape Bakery Orders
5. Glow Path Tracer

---

## Notes

1. All selected games are browser-first, pre-literate-friendly by default, and include non-mediapipe fallback control paths.
2. All selected games are scoped to deterministic completion and reward criteria.
3. Next artifacts should map to:
   - Per-game specs in `docs/games/NEW_GAME_SPECS/<game-slug>.md`
   - Shared implementation units in `docs/games/NEW_GAME_IMPLEMENTATION_UNITS.md`
