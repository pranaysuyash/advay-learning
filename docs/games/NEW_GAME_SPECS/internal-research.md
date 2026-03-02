# Game Research - Internal Mechanics Analysis

## Overview

This document catalogs internal research findings for 15 candidate games, identifying reusable components and new work required.

---

## Research Summary Table

| # | Game | Reusable % | Key Reusable Components | New Components |
|---|------|------------|------------------------|----------------|
| 1 | Pop the Number | 80% | numberBubblePopLogic.ts | Sequential ordering logic |
| 2 | Shape Stacker | 60% | digitalJengaLogic, colorSortLogic | 2D physics, drag-stack |
| 3 | Rainbow Bridge | 90% | pathFollowingLogic.ts, ConnectTheDots | Rainbow visuals |
| 4 | Feed the Monster | 80% | emojiMatchLogic, weatherMatchLogic | Monster character |
| 5 | Beat Bounce | 85% | rhythmTapLogic, musicConductorLogic | Bouncing ball |
| 6 | Shadow Match | 70% | shadowPuppetLogic, fingerCounting | Silhouette matching |
| 7 | Number Bowling | 60% | fruitNinjaAir, velocity detection | Bowling physics |
| 8 | Color Splash | 85% | colorSortGameLogic, OddOneOutLogic | Splash effects |
| 9 | Fishing Math | 75% | MathMonstersLogic, LetterCatcherLogic | Fishing theme |
| 10 | Train Sequence | 80% | StorySequenceLogic | Train assets |
| 11 | Petal Catch | 80% | letterCatcherLogic | Petal graphics |
| 12 | Sound Match | 90% | animalSoundsLogic | Audio files |
| 13 | Bug Hunt | 40% | oddOneOutLogic (minimal) | Hidden positions |
| 14 | Bubble Count | 70% | numberBubblePop, virtualBubbles | Group counting |
| 15 | Dance Pattern | 85% | followTheLeaderLogic | Sequence UI |

---

## Detailed Findings

### Game 1: Pop the Number

**Core Mechanic**: Numbers 1-N appear in random positions, player taps them in sequential order.

**Reusable from repo**:
- `numberBubblePopLogic.ts` - Bubble generation with random positioning
- Click detection with answer validation
- Round progression system
- Level configs with difficulty

**New to build**:
- Sequential ordering validation (1→2→3 not 3→1→2)
- Visual number path/line showing next expected number
- Chain combo for consecutive correct taps

**Key files to reference**:
- `src/frontend/src/games/numberBubblePopLogic.ts`
- `src/frontend/src/pages/NumberBubblePop.tsx`

---

### Game 2: Shape Stacker

**Core Mechanic**: Shapes fall from top, player drags to stack them on matching outlines.

**Reusable from repo**:
- `digitalJengaLogic.ts` - Block positioning
- `colorSortLogic.ts` - Matter.js physics
- `shapeSafariLogic.ts` - Path/tolerance detection

**New to build**:
- 2D falling shapes with gravity
- Drag gesture handling
- Toppling/stability detection
- Stack height tracking

**Key files to reference**:
- `src/frontend/src/games/digitalJengaLogic.ts`
- `src/frontend/src/games/colorSortLogic.ts`

---

### Game 3: Rainbow Bridge

**Core Mechanic**: Tap numbered dots in sequence to reveal a rainbow bridge.

**Reusable from repo**:
- `pathFollowingLogic.ts` - Path generation and detection
- `ConnectTheDots.tsx` - Full dot-connecting game

**New to build**:
- Rainbow arc visual rendering
- Color progression (ROYGBIV)
- Bridge completion animation

**Key files to reference**:
- `src/frontend/src/games/pathFollowingLogic.ts`
- `src/frontend/src/pages/ConnectTheDots.tsx`

---

### Game 4: Feed the Monster

**Core Mechanic**: Monster shows emotion, player selects food that matches.

**Reusable from repo**:
- `emojiMatchLogic.ts` - Emotion data and matching
- `weatherMatchLogic.ts` - Category pairing
- `memoryMatchLogic.ts` - Matching validation

**New to build**:
- Monster character with expressions
- Food→emotion pairing logic
- Feeding animation

**Key files to reference**:
- `src/frontend/src/games/emojiMatchLogic.ts`
- `src/frontend/src/games/weatherMatchLogic.ts`

---

### Game 5: Beat Bounce

**Core Mechanic**: Ball bounces to musical beat, tap at right moment to score.

**Reusable from repo**:
- `rhythmTapLogic.ts` - Timing validation
- `musicConductorLogic.ts` - BPM calculations
- `useGameLoop.ts` - Game loop

**New to build**:
- Bouncing ball physics synced to BPM
- Beat visualization
- Multi-ball patterns at higher levels

**Key files to reference**:
- `src/frontend/src/games/rhythmTapLogic.ts`
- `src/frontend/src/games/musicConductorLogic.ts`

---

### Game 6: Shadow Match

**Core Mechanic**: Match hand shadow to correct silhouette.

**Reusable from repo**:
- `shadowPuppetLogic.ts` - Finger pattern definitions
- `fingerCounting.ts` - Extended finger detection
- Gesture recognition utilities

**New to build**:
- Silhouette rendering
- Shape matching algorithm
- Progressive hint system

**Key files to reference**:
- `src/frontend/src/games/shadowPuppetLogic.ts`
- `src/frontend/src/games/fingerCounting.ts`

---

### Game 7: Number Bowling

**Core Mechanic**: Swipe to roll ball, knock down numbered pins in order.

**Reusable from repo**:
- `fruitNinjaAirLogic.ts` - Swipe detection
- Velocity calculations from `airCanvasLogic.ts`
- Matter.js for collisions

**New to build**:
- Bowling lane rendering
- Pin physics (triangle formation)
- Traditional scoring (strike/spare)

**Key files to reference**:
- `src/frontend/src/games/fruitNinjaAirLogic.ts`
- `src/frontend/src/games/colorSortLogic.ts` (Matter.js)

---

### Game 8: Color Splash

**Core Mechanic**: Tap all objects of target color to splash them.

**Reusable from repo**:
- `colorSortGameLogic.ts` - Color items and levels
- `OddOneOutLogic.ts` - Category object banks

**New to build**:
- Splash particle effects
- Target color selection
- Multi-color rounds

**Key files to reference**:
- `src/frontend/src/games/colorSortGameLogic.ts`
- `src/frontend/src/games/oddOneOutLogic.ts`

---

### Game 9: Fishing Math

**Core Mechanic**: Solve math problem, catch fish with correct answer.

**Reusable from repo**:
- `mathMonstersLogic.ts` - Problem generation (all operations)
- `letterCatcherLogic.ts` - Falling objects with targets
- `fruitNinjaAirLogic.ts` - Swipe to catch

**New to build**:
- Fish with answer numbers
- Fishing line mechanics
- Underwater visuals

**Key files to reference**:
- `src/frontend/src/games/mathMonstersLogic.ts`
- `src/frontend/src/games/letterCatcherLogic.ts`

---

### Game 10: Train Sequence

**Core Mechanic**: Arrange train cars in correct order (engine→caboose).

**Reusable from repo**:
- `StorySequenceLogic.ts` - Complete sequence system
- `ShapeSequence.tsx` - Ordered selection
- `PatternPlayLogic.ts` - Pattern generation

**New to build**:
- Train car graphics
- Coupling animation
- Rule: engine first, caboose last

**Key files to reference**:
- `src/frontend/src/games/storySequenceLogic.ts`
- `src/frontend/src/pages/ShapeSequence.tsx`

---

### Game 11: Petal Catch

**Core Mechanic**: Catch falling petals with basket/hand.

**Reusable from repo**:
- `letterCatcherLogic.ts` - Complete falling system
  - `spawnLetter()`, `updatePositions()`, `checkCatch()`

**New to build**:
- Petal emojis/graphics
- Wind drift effect
- Basket movement controls

**Key files to reference**:
- `src/frontend/src/games/letterCatcherLogic.ts`
- `src/frontend/src/pages/LetterCatcher.tsx`

---

### Game 12: Sound Match

**Core Mechanic**: Hear sound, tap matching animal/object.

**Reusable from repo**:
- `animalSoundsLogic.ts` - Complete implementation!
  - Animal data: Dog, Cat, Cow, Pig, Duck, Rooster, Sheep, Lion, Elephant, Monkey, Frog

**New to build**:
- Audio file integration
- Sound playback UI

**Key files to reference**:
- `src/frontend/src/games/animalSoundsLogic.ts`
- `src/frontend/src/pages/AnimalSounds.tsx`

---

### Game 13: Bug Hunt

**Core Mechanic**: Find hidden bugs in scene, tap to reveal.

**Reusable from repo**:
- `OddOneOutLogic.ts` - Minimal (grid display)

**New to build**:
- Hidden position system
- Scene backgrounds (garden, forest, kitchen)
- Bug types: ant, beetle, ladybug, spider, caterpillar
- Reveal animations

**Key files to reference**:
- `src/frontend/src/games/oddOneOutLogic.ts`

---

### Game 14: Bubble Count

**Core Mechanic**: Groups of bubbles show numbers, tap correct group.

**Reusable from repo**:
- `numberBubblePopLogic.ts` - Bubbles with numbers
- `virtualBubblesLogic.ts` - Floating bubble physics
- `countingObjectsLogic.ts` - Counting verification

**New to build**:
- Grouping logic (multiple bubbles = one number)
- Floating behavior
- Count verification

**Key files to reference**:
- `src/frontend/src/games/numberBubblePopLogic.ts`
- `src/frontend/src/games/virtualBubblesLogic.ts`

---

### Game 15: Dance Pattern

**Core Mechanic**: Watch dance sequence, repeat poses in order.

**Reusable from repo**:
- `followTheLeaderLogic.ts` - Complete pose matching!
  - 6 movements: penguin-walk, frog-hop, tiptoe-quiet, march-soldier, fly-bird, swim-fish
  - `checkPoseMatch()` with confidence scores
- `rhythmTapLogic.ts` - Pattern sequences

**New to build**:
- Sequence demo UI
- Move card visuals
- Multi-move patterns

**Key files to reference**:
- `src/frontend/src/games/followTheLeaderLogic.ts`
- `src/frontend/src/pages/FollowTheLeader.tsx`

---

## Common Utilities Available

| Utility | Purpose |
|---------|---------|
| `hitTestRects()` | Point-rectangle collision |
| `useGameLoop()` | RAF-based game loop |
| `useAudio` hook | Sound effects (playClick, playSuccess, etc.) |
| `pickSpacedPoints()` | Grid positioning |
| `distanceToSegment()` | Path distance |
| Matter.js | Physics engine |
| MediaPipe | Hand/pose tracking |

---

## Implementation Priority Recommendations

Based on reusability and complexity:

1. **Pop the Number** (80%) - Quickest
2. **Rainbow Bridge** (90%) - Direct adaptation
3. **Color Splash** (85%) - Straightforward
4. **Sound Match** (90%) - Already exists as Animal Sounds
5. **Petal Catch** (80%) - Simple adaptation
6. **Train Sequence** (80%) - StorySequenceLogic direct use
7. **Beat Bounce** (85%) - Rhythm logic ready
8. **Feed the Monster** (80%) - EmojiMatch base
9. **Bubble Count** (70%) - Bubble mechanics ready
10. **Dance Pattern** (85%) - Pose matching ready
11. **Fishing Math** (75%) - Math system ready
12. **Shadow Match** (70%) - Shadow puppet base
13. **Number Bowling** (60%) - More physics work
14. **Shape Stacker** (60%) - Physics heavy
15. **Bug Hunt** (40%) - Most new work
