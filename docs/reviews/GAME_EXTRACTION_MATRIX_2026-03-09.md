# Game Extraction Matrix (All Game Pages)

## Purpose

Decision sheet for modularization across all game pages. This matrix covers all 86 game routes (non-account/non-shell pages excluded) and classifies each as:

1. `Extract Now`
2. `Extract Later`
3. `Keep As-Is`
4. `Already Featureized`

## Reason Codes

1. `R1`: Shares duplicated in-page pose bootstrap/runtime setup with other pose-action games.
2. `R2`: Large page with embedded logic and no dedicated logic module import.
3. `R3`: Very large route page; split orchestration from game domain runtime/components.
4. `R4`: Medium-large page; schedule after shared runtime extraction wave.
5. `R5`: Canonical feature module already exists; keep page as route shell and consolidate legacy overlap.
6. `R6`: Current size/complexity acceptable; continue using shared hooks/components.

## Summary Counts

1. `Extract Now`: 12
2. `Extract Later`: 16
3. `Keep As-Is`: 57
4. `Already Featureized`: 1

## Full Matrix

| Game | LOC | MediaPipe In Page | Decision | Proposed Module | Reason |
|---|---:|:---:|---|---|---|
| AirCanvas | 667 | No | Extract Later | `features/air-canvas` | R4 |
| AirGuitarHero | 492 | No | Keep As-Is | `n/a` | R6 |
| AlphabetGame | 2011 | No | Extract Now | `features/alphabet-game` | R3 |
| AnimalSounds | 449 | No | Keep As-Is | `n/a` | R6 |
| BalloonPopFitness | 703 | Yes | Extract Now | `features/pose-action-games` | R1 |
| BeatBounce | 402 | No | Keep As-Is | `n/a` | R6 |
| BeginningSounds | 548 | No | Keep As-Is | `n/a` | R6 |
| BlendBuilder | 323 | No | Keep As-Is | `n/a` | R6 |
| BodyParts | 345 | No | Keep As-Is | `n/a` | R6 |
| BubbleCount | 335 | No | Keep As-Is | `n/a` | R6 |
| BubblePop | 588 | No | Extract Later | `features/bubble-pop` | R4 |
| BubblePopSymphony | 472 | No | Keep As-Is | `n/a` | R6 |
| ColorByNumber | 411 | No | Keep As-Is | `n/a` | R6 |
| ColorMatchGarden | 634 | No | Extract Later | `features/color-match-garden` | R4 |
| ColorMixing | 278 | No | Keep As-Is | `n/a` | R6 |
| ColorSortGame | 267 | No | Keep As-Is | `n/a` | R6 |
| ColorSplash | 210 | No | Keep As-Is | `n/a` | R6 |
| ConnectTheDots | 953 | No | Extract Now | `features/connect-the-dots` | R2 |
| CountingCollectathon | 477 | No | Keep As-Is | `n/a` | R6 |
| CountingObjects | 316 | No | Keep As-Is | `n/a` | R6 |
| DigitalJenga | 373 | No | Keep As-Is | `n/a` | R6 |
| DiscoveryLab | 667 | No | Extract Later | `features/discovery-lab` | R4 |
| DressForWeather | 649 | No | Extract Later | `features/dress-for-weather` | R4 |
| EmojiMatch | 976 | No | Extract Now | `features/emoji-match` | R3 |
| EndingSounds | 174 | No | Keep As-Is | `n/a` | R6 |
| FeedTheMonster | 441 | No | Keep As-Is | `n/a` | R6 |
| FollowTheLeader | 499 | Yes | Extract Now | `features/pose-action-games` | R1 |
| FractionPizza | 435 | No | Keep As-Is | `n/a` | R6 |
| FreeDraw | 441 | No | Keep As-Is | `n/a` | R6 |
| FreezeDance | 893 | Yes | Extract Now | `features/pose-action-games` | R1 |
| FruitNinjaAir | 377 | No | Keep As-Is | `n/a` | R6 |
| KaleidoscopeHands | 279 | No | Keep As-Is | `n/a` | R6 |
| LetterCatcher | 293 | No | Keep As-Is | `n/a` | R6 |
| LetterHunt | 844 | No | Extract Now | `features/letter-hunt` | R3 |
| LetterSoundMatch | 171 | No | Keep As-Is | `n/a` | R6 |
| MathMonsters | 670 | No | Extract Later | `features/math-monsters` | R4 |
| MathSmash | 356 | No | Keep As-Is | `n/a` | R6 |
| MazeRunner | 384 | No | Keep As-Is | `n/a` | R6 |
| MemoryMatch | 791 | No | Extract Later | `features/memory-match` | R4 |
| MirrorDraw | 625 | No | Extract Later | `features/mirror-draw` | R4 |
| MoneyMatch | 288 | No | Keep As-Is | `n/a` | R6 |
| MoreOrLess | 292 | No | Keep As-Is | `n/a` | R6 |
| MusicConductor | 483 | No | Keep As-Is | `n/a` | R6 |
| MusicPinchBeat | 341 | No | Keep As-Is | `n/a` | R6 |
| MusicalStatues | 477 | Yes | Extract Now | `features/pose-action-games` | R1 |
| NumberBubblePop | 196 | No | Keep As-Is | `n/a` | R6 |
| NumberSequence | 288 | No | Keep As-Is | `n/a` | R6 |
| NumberTapTrail | 533 | No | Keep As-Is | `n/a` | R6 |
| NumberTracing | 338 | No | Keep As-Is | `n/a` | R6 |
| ObstacleCourse | 940 | Yes | Extract Now | `features/pose-action-games` | R1 |
| OddOneOut | 360 | No | Keep As-Is | `n/a` | R6 |
| PathFollowing | 285 | No | Keep As-Is | `n/a` | R6 |
| PatternPlay | 211 | No | Keep As-Is | `n/a` | R6 |
| PhonicsSounds | 647 | No | Extract Later | `features/phonics-sounds` | R4 |
| PhonicsTracing | 568 | No | Extract Later | `features/phonics-tracing` | R4 |
| PhysicsDemo | 432 | No | Keep As-Is | `n/a` | R6 |
| PhysicsPlayground | 671 | No | Already Featureized | `features/physics-playground` | R5 |
| PlatformerRunner | 525 | No | Keep As-Is | `n/a` | R6 |
| PopTheNumber | 277 | No | Keep As-Is | `n/a` | R6 |
| RainbowBridge | 325 | No | Keep As-Is | `n/a` | R6 |
| ReadingAlong | 186 | No | Keep As-Is | `n/a` | R6 |
| RhymeTime | 728 | No | Extract Later | `features/rhyme-time` | R4 |
| RhythmTap | 345 | No | Keep As-Is | `n/a` | R6 |
| SameAndDifferent | 184 | No | Keep As-Is | `n/a` | R6 |
| ShadowMatch | 172 | No | Keep As-Is | `n/a` | R6 |
| ShadowPuppetTheater | 283 | No | Keep As-Is | `n/a` | R6 |
| ShapePop | 679 | No | Extract Later | `features/shape-pop` | R4 |
| ShapeSafari | 687 | No | Extract Later | `features/shape-safari` | R4 |
| ShapeSequence | 573 | No | Extract Later | `features/shape-sequence` | R4 |
| ShapeStacker | 341 | No | Keep As-Is | `n/a` | R6 |
| SightWordFlash | 326 | No | Keep As-Is | `n/a` | R6 |
| SimonSays | 927 | Yes | Extract Now | `features/pose-action-games` | R1 |
| SizeSorting | 280 | No | Keep As-Is | `n/a` | R6 |
| SpellPainter | 305 | No | Keep As-Is | `n/a` | R6 |
| SteadyHandLab | 410 | No | Keep As-Is | `n/a` | R6 |
| StoryBuilder | 194 | No | Keep As-Is | `n/a` | R6 |
| StorySequence | 695 | No | Extract Later | `features/story-sequence` | R4 |
| SyllableClap | 330 | No | Keep As-Is | `n/a` | R6 |
| TimeTell | 398 | No | Keep As-Is | `n/a` | R6 |
| VirtualBubbles | 529 | No | Keep As-Is | `n/a` | R6 |
| VirtualChemistryLab | 695 | No | Extract Later | `features/virtual-chemistry-lab` | R4 |
| VoiceStories | 136 | No | Keep As-Is | `n/a` | R6 |
| WeatherMatch | 234 | No | Keep As-Is | `n/a` | R6 |
| WordBuilder | 1030 | No | Extract Now | `features/word-builder` | R3 |
| WordSearch | 225 | No | Keep As-Is | `n/a` | R6 |
| YogaAnimals | 804 | Yes | Extract Now | `features/pose-action-games` | R1 |
