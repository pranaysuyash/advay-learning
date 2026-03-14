# Control Mode Audit

Ticket: TCK-20260312-003
Date: 2026-03-12
Scope: Routed `/games/*` pages in `src/frontend/src/App.tsx`

## Executive Summary

- Total routed game pages audited: **114**
- Routes wrapped with `CameraSafeRoute`: **50**
- Routes with CV signals in page code: **65**
- Routes with pointer signals in page code: **112**
- Classification counts:
  - `CV_PRIMARY_OR_INTENDED`: **45**
  - `CV_SIGNAL_NO_GUARD`: **1**
  - `HYBRID_CV_PLUS_POINTER`: **19**
  - `POINTER_PRIMARY`: **49**

## Method

- Parsed route declarations from `App.tsx` for `/games/*` paths.
- Mapped routed components to `src/frontend/src/pages/*.tsx` files.
- Scanned each file for CV and pointer interaction signals.
- Classification is heuristic; manual validation recommended for edge cases.

## Workspace-wide Signal Snapshot (includes non-routed pages)

- Total `pages/*.tsx` (excluding tests): **133**
- CV-signal pages: **66**
- Pointer-signal pages: **128**
- CV + pointer pages: **64**
- CV-only pages: **2**
- Pointer-only pages: **64**

## Priority Risk Slice: Camera-gated but Pointer-Primary

These routes were camera-gated in routing but showed pointer-primary signals in page logic. CV integration has been implemented for high-priority games.

### ✅ COMPLETED - CV Integrated
- `/games/target-practice` → `AirGuitarHero` ✅ CV aim + pinch to shoot (TCK-20260314-005)
- `/games/kaleidoscope-hands` → `KaleidoscopeHands` ✅ CV hand tracking for drawing (TCK-20260314-005)

### ⏳ PENDING - CV Integration Required
- `/games/air-guitar-hero` → `AirGuitarHero` - Hand tracking for strumming gestures
- `/games/phonics-tracing` → `PhonicsTracing` - Pinch-to-trace functionality
- `/games/shadow-puppet-theater` → `ShadowPuppetTheater` - Hand pose detection

## Full Route Matrix

| Route | Component | CameraSafeRoute | CV Signal | Pointer Signal | Class | File |
|---|---|---:|---:|---:|---|---|
| `/games/air-canvas` | `AirCanvas ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/AirCanvas.tsx` |
| `/games/air-guitar-hero` | `AirGuitarHero ` | ✅ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/AirGuitarHero.tsx` |
| `/games/alphabet-tracing` | `AlphabetGame ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/AlphabetGame.tsx` |
| `/games/animal-sounds` | `AnimalSounds ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/AnimalSounds.tsx` |
| `/games/balance-beam` | `BalanceBeam ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/BalanceBeam.tsx` |
| `/games/balloon-pop-fitness` | `BalloonPopFitness ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/BalloonPopFitness.tsx` |
| `/games/beat-bounce` | `BeatBounce ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/BeatBounce.tsx` |
| `/games/beginning-sounds` | `BeginningSounds ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/BeginningSounds.tsx` |
| `/games/blend-builder` | `BlendBuilder ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/BlendBuilder.tsx` |
| `/games/body-parts` | `BodyParts ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/BodyParts.tsx` |
| `/games/bubble-biology` | `BubbleBiology ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/BubbleBiology.tsx` |
| `/games/bubble-count` | `BubbleCount ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/BubbleCount.tsx` |
| `/games/bubble-pop` | `BubblePop ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/BubblePop.tsx` |
| `/games/bubble-pop-symphony` | `BubblePopSymphony ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/BubblePopSymphony.tsx` |
| `/games/chemistry-lab` | `VirtualChemistryLab ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/VirtualChemistryLab.tsx` |
| `/games/circle-drawing` | `CircleDrawing ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/CircleDrawing.tsx` |
| `/games/circuit-builder` | `CircuitBuilder ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/CircuitBuilder.tsx` |
| `/games/color-by-number` | `ColorByNumber ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ColorByNumber.tsx` |
| `/games/color-match-garden` | `ColorMatchGarden ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ColorMatchGarden.tsx` |
| `/games/color-mixing` | `ColorMixing ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ColorMixing.tsx` |
| `/games/color-potions` | `ColorPotions ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ColorPotions.tsx` |
| `/games/color-sort` | `ColorSortGame ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ColorSortGame.tsx` |
| `/games/color-splash` | `ColorSplash ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ColorSplash.tsx` |
| `/games/connect-the-dots` | `ConnectTheDots ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ConnectTheDots.tsx` |
| `/games/counting-collectathon` | `CountingCollectathon ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/CountingCollectathon.tsx` |
| `/games/counting-objects` | `CountingObjects ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/CountingObjects.tsx` |
| `/games/cutting-practice` | `CuttingPractice ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/CuttingPractice.tsx` |
| `/games/digital-jenga` | `DigitalJenga ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/DigitalJenga.tsx` |
| `/games/dinosaur-dig` | `DinosaurDig ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/DinosaurDig.tsx` |
| `/games/dress-for-weather` | `DressForWeather ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/DressForWeather.tsx` |
| `/games/emoji-match` | `EmojiMatch ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/EmojiMatch.tsx` |
| `/games/ending-sounds` | `EndingSounds ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/EndingSounds.tsx` |
| `/games/farm-friends` | `FarmFriends ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/FarmFriends.tsx` |
| `/games/feed-the-monster` | `FeedTheMonster ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/FeedTheMonster.tsx` |
| `/games/finger-number-show` | `FingerNumberShow ` | ✅ | ✅ | ❌ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/games/FingerNumberShow.tsx` |
| `/games/follow-the-leader` | `FollowTheLeader ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/FollowTheLeader.tsx` |
| `/games/fraction-pizza` | `FractionPizza ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/FractionPizza.tsx` |
| `/games/free-draw` | `FreeDraw ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/FreeDraw.tsx` |
| `/games/freeze-dance` | `FreezeDance ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/FreezeDance.tsx` |
| `/games/fruit-ninja-air` | `FruitNinjaAir ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/FruitNinjaAir.tsx` |
| `/games/kaleidoscope-hands` | `KaleidoscopeHands ` | ✅ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/KaleidoscopeHands.tsx` |
| `/games/letter-catcher` | `LetterCatcher ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/LetterCatcher.tsx` |
| `/games/letter-hunt` | `LetterHunt ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/LetterHunt.tsx` |
| `/games/letter-sound-match` | `LetterSoundMatch ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/LetterSoundMatch.tsx` |
| `/games/light-painter` | `LightPainter ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/LightPainter.tsx` |
| `/games/math-jumpers` | `MathJumpers ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MathJumpers.tsx` |
| `/games/math-monsters` | `MathMonsters ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MathMonsters.tsx` |
| `/games/math-smash` | `MathSmash ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MathSmash.tsx` |
| `/games/maze-runner` | `MazeRunner ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MazeRunner.tsx` |
| `/games/memory-match` | `MemoryMatch ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MemoryMatch.tsx` |
| `/games/mirror-draw` | `MirrorDraw ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MirrorDraw.tsx` |
| `/games/mirror-duel` | `MirrorDuel ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MirrorDuel.tsx` |
| `/games/mirror-maze` | `MirrorMaze ` | ❌ | ✅ | ❌ | `CV_SIGNAL_NO_GUARD` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MirrorMaze.tsx` |
| `/games/money-match` | `MoneyMatch ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MoneyMatch.tsx` |
| `/games/more-or-less` | `MoreOrLess ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MoreOrLess.tsx` |
| `/games/music-conductor` | `MusicConductor ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MusicConductor.tsx` |
| `/games/music-pinch-beat` | `MusicPinchBeat ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MusicPinchBeat.tsx` |
| `/games/musical-statues` | `MusicalStatues ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/MusicalStatues.tsx` |
| `/games/number-bubble-pop` | `NumberBubblePop ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/NumberBubblePop.tsx` |
| `/games/number-sequence` | `NumberSequence ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/NumberSequence.tsx` |
| `/games/number-tap-trail` | `NumberTapTrail ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/NumberTapTrail.tsx` |
| `/games/number-tracing` | `NumberTracing ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/NumberTracing.tsx` |
| `/games/obstacle-course` | `ObstacleCourse ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ObstacleCourse.tsx` |
| `/games/odd-one-out` | `OddOneOut ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/OddOneOut.tsx` |
| `/games/pack-lunchbox` | `PackLunchbox ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/PackLunchbox.tsx` |
| `/games/path-following` | `PathFollowing ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/PathFollowing.tsx` |
| `/games/pattern-play` | `PatternPlay ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/PatternPlay.tsx` |
| `/games/phonics-sounds` | `PhonicsSounds ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/PhonicsSounds.tsx` |
| `/games/phonics-tracing` | `PhonicsTracing ` | ✅ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/PhonicsTracing.tsx` |
| `/games/physics-demo` | `PhysicsPlayground ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/PhysicsPlayground.tsx` |
| `/games/physics-playground` | `PhysicsPlayground ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/PhysicsPlayground.tsx` |
| `/games/pinch-practice` | `PinchPractice ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/PinchPractice.tsx` |
| `/games/plant-garden` | `PlantGarden ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/PlantGarden.tsx` |
| `/games/platformer-runner` | `PlatformerRunner ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/PlatformerRunner.tsx` |
| `/games/pop-the-number` | `PopTheNumber ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/PopTheNumber.tsx` |
| `/games/rainbow-bridge` | `RainbowBridge ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/RainbowBridge.tsx` |
| `/games/reading-along` | `ReadingAlong ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ReadingAlong.tsx` |
| `/games/rhyme-time` | `RhymeTime ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/RhymeTime.tsx` |
| `/games/rhythm-tap` | `RhythmTap ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/RhythmTap.tsx` |
| `/games/same-and-different` | `SameAndDifferent ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SameAndDifferent.tsx` |
| `/games/set-the-table` | `SetTheTable ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SetTheTable.tsx` |
| `/games/shadow-match` | `ShadowMatch ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ShadowMatch.tsx` |
| `/games/shadow-portal` | `ShadowPortal ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ShadowPortal.tsx` |
| `/games/shadow-puppet-theater` | `ShadowPuppetTheater ` | ✅ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ShadowPuppetTheater.tsx` |
| `/games/shape-pop` | `ShapePop ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ShapePop.tsx` |
| `/games/shape-safari` | `ShapeSafari ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ShapeSafari.tsx` |
| `/games/shape-sequence` | `ShapeSequence ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ShapeSequence.tsx` |
| `/games/shape-stacker` | `ShapeStacker ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/ShapeStacker.tsx` |
| `/games/sight-word-flash` | `SightWordFlash ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SightWordFlash.tsx` |
| `/games/simon-says` | `SimonSays ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SimonSays.tsx` |
| `/games/simple-addition` | `SimpleAddition ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SimpleAddition.tsx` |
| `/games/size-sorting` | `SizeSorting ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SizeSorting.tsx` |
| `/games/sound-garden` | `SoundGarden ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SoundGarden.tsx` |
| `/games/spell-painter` | `SpellPainter ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SpellPainter.tsx` |
| `/games/spelling-run` | `SpellingRun ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SpellingRun.tsx` |
| `/games/steady-hand-lab` | `SteadyHandLab ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SteadyHandLab.tsx` |
| `/games/story-builder` | `StoryBuilder ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/StoryBuilder.tsx` |
| `/games/story-sequence` | `StorySequence ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/StorySequence.tsx` |
| `/games/syllable-clap` | `SyllableClap ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/SyllableClap.tsx` |
| `/games/target-practice` | `TargetPractice ` | ✅ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/TargetPractice.tsx` |
| `/games/taste-match` | `TasteMatch ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/TasteMatch.tsx` |
| `/games/temperature-sort` | `TemperatureSort ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/TemperatureSort.tsx` |
| `/games/texture-explorer` | `TextureExplorer ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/TextureExplorer.tsx` |
| `/games/tidy-up-time` | `TidyUpTime ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/TidyUpTime.tsx` |
| `/games/time-tell` | `TimeTell ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/TimeTell.tsx` |
| `/games/virtual-bubbles` | `VirtualBubbles ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/VirtualBubbles.tsx` |
| `/games/voice-stories` | `VoiceStories ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/VoiceStories.tsx` |
| `/games/vowel-valley` | `VowelValley ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/VowelValley.tsx` |
| `/games/wash-hands-dance` | `WashHandsDance ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/WashHandsDance.tsx` |
| `/games/weather-lab` | `WeatherLab ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/WeatherLab.tsx` |
| `/games/weather-match` | `WeatherMatch ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/WeatherMatch.tsx` |
| `/games/word-builder` | `WordBuilder ` | ✅ | ✅ | ✅ | `CV_PRIMARY_OR_INTENDED` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/WordBuilder.tsx` |
| `/games/word-search` | `WordSearch ` | ❌ | ❌ | ✅ | `POINTER_PRIMARY` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/WordSearch.tsx` |
| `/games/yoga-animals` | `YogaAnimals ` | ❌ | ✅ | ✅ | `HYBRID_CV_PLUS_POINTER` | `/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/YogaAnimals.tsx` |
