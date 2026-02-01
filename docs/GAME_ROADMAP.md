# Game Roadmap & Activity Catalog
## Advay Vision Learning - Future Games & Learning Activities

**Created:** 2026-02-01  
**Last Updated:** 2026-02-01  
**Status:** Living Document - Add ideas here!

---

## Executive Summary

This document catalogs all planned, researched, and brainstormed games/activities for the Advay Vision Learning platform. It serves as the single source of truth for product expansion.

### Current Games (4)
| Game | Status | Coverage |
|------|--------|----------|
| Alphabet Tracing | ✅ Live | Literacy, Motor |
| Finger Number Show | ✅ Live | Numeracy |
| Connect the Dots | 🔜 Coming Soon | Motor Skills |
| Letter Hunt | 🔜 Coming Soon | Literacy |

### Proposed Games (7+)
See detailed sections below.

---

## Skill Coverage Matrix

| Skill Area | Current | Proposed | Gap Level |
|------------|---------|----------|-----------|
| **Literacy** | 2 games | +2 | Low |
| **Numeracy** | 1 game | +2 | Medium |
| **Motor Skills** | 1 game | +3 | Low |
| **Logic/Reasoning** | 0 games | +2 | High ❗ |
| **Creativity** | 0 games | +3 | High ❗ |
| **Music/Rhythm** | 0 games | +1 | Medium |
| **Science/Nature** | 0 games | +1 | High ❗ |

---

## Priority Tiers

### 🔴 Tier 1: Next Sprint (2-4 weeks)
High impact, leverages existing infrastructure

| Game | Skill | Effort | Rationale |
|------|-------|--------|-----------|
| [Mirror Draw](#1-mirror-draw) | Motor + Creativity | 2 weeks | Reuses canvas, high engagement potential |
| [Shape Safari](#2-shape-safari) | Motor + Geometry | 1 week | Simple extension of tracing |

### 🟠 Tier 2: Near-Term (1-2 months)
New mechanics, medium complexity

| Game | Skill | Effort | Rationale |
|------|-------|--------|-----------|
| [Color by Number](#3-color-by-number) | Numeracy + Creativity | 1.5 weeks | Adds painting to platform |
| [Word Builder](#4-word-builder) | Phonics | 2 weeks | Critical for literacy progression |
| [Story Sequence](#5-story-sequence) | Logic | 1 week | New skill area coverage |

### 🟢 Tier 3: Future (3-6 months)
Advanced features, new tech

| Game | Skill | Effort | Rationale |
|------|-------|--------|-----------|
| [Math Monsters](#6-math-monsters) | Arithmetic | 2 weeks | Extends Finger Number Show |
| [Rhythm Tap](#7-rhythm-tap) | Music/Timing | 2 weeks | Requires gesture detection |
| [Nature Explorer](#8-nature-explorer) | Science | 3 weeks | AR/camera integration |

### 🔵 Tier 4: Backlog (Ideas)
Needs research/validation

- Memory Match
- Puzzle Pieces
- Voice Stories (TTS + following along)
- Emotion Cards
- Body Movement Games

---

## Detailed Game Designs

### 1. Mirror Draw
**Priority:** P0 | **Effort:** 2 weeks | **Age:** 4-7

#### Concept
Child completes a partially drawn symmetrical image by tracing the missing half. Paint mode unlocks after successful tracing.

#### Visual
```
┌─────────────────────────────────────┐
│     🦋 Complete the Butterfly       │
│  ┌───────────┬───────────┐          │
│  │  ╱ ╲      │           │          │
│  │ /   \     │  (mirror) │  ← Kid traces here
│  │/     \    │           │          │
│  │  (head)   │           │          │
│  └───────────┴───────────┘          │
│                                     │
│  [ 🎨 Paint It! ] (unlocks after)  │
└─────────────────────────────────────┘
```

#### Mechanics
- Left half shows template (SVG path)
- Right half is blank canvas
- Real-time mirror preview of strokes
- Accuracy scoring based on path matching
- Paint mode: fill colors after shape complete

#### Progression
| Level | Content | Accuracy Needed |
|-------|---------|-----------------|
| 1-5 | Simple shapes (heart, circle) | 50% |
| 6-10 | Objects (butterfly, face, leaf) | 60% |
| 11-15 | Complex (house, tree, animal) | 70% |
| 16-20 | Patterns (mandala-style) | 80% |

#### Templates Needed (20+)
- Butterfly, Heart, Star, Moon
- Face, Fish, Flower, Tree
- House, Car, Rocket, Robot
- Rangoli patterns, Mandalas

#### Technical Requirements
- [ ] Symmetry canvas component
- [ ] Path matching algorithm
- [ ] Paint fill system
- [ ] Template SVG format spec

#### Story Integration
> "Pip found half a treasure map! Can you draw the other half?"

---

### 2. Shape Safari
**Priority:** P0 | **Effort:** 1 week | **Age:** 3-5

#### Concept
Trace basic shapes hidden within illustrated scenes to reveal animals and objects.

#### Visual
```
┌─────────────────────────────────────┐
│     🌴 Find the Shapes!             │
│  ┌─────────────────────────────┐    │
│  │  Jungle scene with hidden   │    │
│  │  ○ ○ ○ (circles in trees)   │    │
│  │  □ (square = elephant body) │    │
│  │  △ (triangle = bird beak)   │    │
│  └─────────────────────────────┘    │
│                                     │
│  Find: ○ Circle (3 left)           │
└─────────────────────────────────────┘
```

#### Mechanics
- Scene with embedded shape outlines
- Trace shape accurately → reveals hidden element
- Collect all shapes in scene to complete

#### Shapes by Age
| Age 3 | Age 4 | Age 5 |
|-------|-------|-------|
| Circle | Square | Triangle |
| | Rectangle | Star |
| | | Diamond, Oval |

#### Scene Themes (10+)
- Jungle (animals in shapes)
- Ocean (fish, shells)
- Space (planets, rockets)
- Farm (animals, buildings)
- City (vehicles, buildings)

#### Technical Requirements
- [ ] Scene asset format (layered PNG/SVG)
- [ ] Shape detection within region
- [ ] Reveal animation system

#### Story Integration
> "The shape animals are hiding! Trace to find them!"

---

### 3. Color by Number
**Priority:** P1 | **Effort:** 1.5 weeks | **Age:** 4-6

#### Concept
Classic color-by-number adapted for touch. Kid selects color, then "paints" numbered regions by tracing inside them.

#### Visual
```
┌─────────────────────────────────────┐
│     🎨 Paint the Elephant           │
│  ┌─────────────────────────────┐    │
│  │      ___                    │    │
│  │     / 1 \___                │    │
│  │    |  1  | 2 |  (1=Gray)    │    │
│  │     \___/  3    (2=Pink)    │    │
│  │       |  3  |   (3=Green)   │    │
│  └─────────────────────────────┘    │
│                                     │
│  [1🔘] [2⚪] [3⚪] [4⚪] [5⚪]       │
└─────────────────────────────────────┘
```

#### Mechanics
- Image divided into numbered regions
- Color palette at bottom (number → color)
- Tap color, trace inside region
- Region fills when traced sufficiently
- Complete all regions for celebration

#### Template Categories
| Category | Examples |
|----------|----------|
| Animals | Elephant, Lion, Fish, Butterfly |
| Vehicles | Car, Train, Rocket, Boat |
| Nature | Tree, Flower, Mountain, Sun |
| Festivals | Diya, Rangoli, Christmas Tree |
| Characters | Pip, Robot, Princess, Superhero |

#### Technical Requirements
- [ ] Region-based fill detection
- [ ] Color palette component
- [ ] Template format with regions
- [ ] "In bounds" tracing detection

---

### 4. Word Builder
**Priority:** P1 | **Effort:** 2 weeks | **Age:** 4-7

#### Concept
Drag-and-drop letters to spell words shown in pictures.

#### Visual
```
┌─────────────────────────────────────┐
│     📖 Spell the Word!              │
│                                     │
│         🐱                          │
│      (picture of cat)               │
│                                     │
│     [ _ ] [ _ ] [ _ ]               │
│       ↑ Drop letters here           │
│                                     │
│   ○C  ○A  ○T  ○X  ○P  ○B            │
│    ↑ Drag from here                 │
└─────────────────────────────────────┘
```

#### Mechanics
- Picture shown with blank letter slots
- Scattered letters (correct + distractors)
- Drag letter to correct slot
- Audio: Pip sounds out each letter
- Complete word → Pip says full word

#### Word Lists by Level
| Level | Type | Examples |
|-------|------|----------|
| 1 | 3-letter CVC | cat, dog, sun, red |
| 2 | 3-letter blends | frog, clap, stop |
| 3 | 4-letter | fish, tree, bird |
| 4 | Sight words | the, and, is, you |
| 5 | 5-letter | apple, happy, water |

#### Multi-Language Support
- English (default)
- Hindi (start with basic words)
- Kannada, Telugu, Tamil (transliterated)

#### Technical Requirements
- [ ] Drag-and-drop with hand tracking
- [ ] Letter slot collision detection
- [ ] Audio pronunciation system
- [ ] Word database with images

---

### 5. Story Sequence
**Priority:** P1 | **Effort:** 1 week | **Age:** 4-6

#### Concept
Arrange scrambled picture cards in correct temporal order.

#### Visual
```
┌─────────────────────────────────────┐
│     📚 What Comes Next?             │
│                                     │
│   Scrambled:                        │
│   [🥚→🐣] [🐔] [🥚]                 │
│                                     │
│   Order them:                       │
│   [ 1 ] → [ 2 ] → [ 3 ]             │
│                                     │
│   (Drag cards to slots)             │
└─────────────────────────────────────┘
```

#### Sequence Themes
| Theme | Steps | Example |
|-------|-------|---------|
| Life Cycles | 3-4 | Egg → Chick → Chicken |
| Daily Routine | 4-5 | Wake → Brush → Eat → School → Sleep |
| Cooking | 4 | Crack egg → Mix → Cook → Eat |
| Growth | 4 | Seed → Sprout → Plant → Flower |
| Weather | 3 | Clouds → Rain → Rainbow |
| Building | 4 | Foundation → Walls → Roof → House |

#### Mechanics
- 3-5 cards shown scrambled
- Drag to numbered slots
- Correct sequence → animated story plays
- Incorrect → hint shows what's wrong

#### Technical Requirements
- [ ] Card drag-and-drop
- [ ] Sequence validation
- [ ] Animation playback system
- [ ] Hint system for errors

---

### 6. Math Monsters
**Priority:** P2 | **Effort:** 2 weeks | **Age:** 5-8

#### Concept
Extend Finger Number Show to arithmetic. Monsters request numbers, kid shows answer with fingers.

#### Visual
```
┌─────────────────────────────────────┐
│     🦖 Feed the Monster!            │
│                                     │
│         😋🦕                         │
│     "I'm hungry for 5!"             │
│                                     │
│      3 + 2 = ?                      │
│                                     │
│   [Show 5 fingers to feed me!]      │
│                                     │
│   🎥 Camera shows your hands        │
└─────────────────────────────────────┘
```

#### Progression
| Level | Operation | Range |
|-------|-----------|-------|
| 1 | Recognition | 1-5 |
| 2 | Recognition | 1-10 |
| 3 | Addition | 1+1 to 5+5 |
| 4 | Subtraction | 5-1 to 10-5 |
| 5 | Mixed | + and - |

#### Visual Problems
- 🍎🍎 + 🍎 = ? (Show 3)
- 🐟🐟🐟🐟 - 🐟 = ? (Show 3)

#### Technical Requirements
- [ ] Two-hand finger counting
- [ ] Problem generation logic
- [ ] Monster character animations
- [ ] Streak/combo system

---

### 7. Rhythm Tap
**Priority:** P2 | **Effort:** 2 weeks | **Age:** 4-7

#### Concept
Pip claps a rhythm pattern, kid repeats by clapping (detected via camera/audio).

#### Visual
```
┌─────────────────────────────────────┐
│     🎵 Repeat the Rhythm!           │
│                                     │
│     Pip:  👏 👏 _ 👏                │
│            ↑  ↑   ↑                 │
│           beat pattern              │
│                                     │
│     Your turn:                      │
│     [ ] [ ] [ ] [ ]                 │
│         ↑ clap to fill              │
│                                     │
│   🎵 Twinkle Twinkle Little Star    │
└─────────────────────────────────────┘
```

#### Detection Methods
1. **Audio detection** - Clap sound recognition
2. **Visual detection** - Hand clap gesture
3. **Touch fallback** - Tap screen

#### Pattern Complexity
| Level | Beats | Pattern |
|-------|-------|---------|
| 1 | 2 | 👏 👏 |
| 2 | 3 | 👏 _ 👏 |
| 3 | 4 | 👏 👏 _ 👏 |
| 4 | 4 | 👏 _ 👏 _ |
| 5+ | 6-8 | Song rhythms |

#### Song Integration
- Twinkle Twinkle
- Baa Baa Black Sheep
- Happy Birthday
- Indian nursery rhymes

#### Technical Requirements
- [ ] Audio clap detection
- [ ] Gesture recognition
- [ ] Timing tolerance system
- [ ] Music playback sync

---

### 8. Nature Explorer
**Priority:** P3 | **Effort:** 3 weeks | **Age:** 4-8

#### Concept
Camera-based nature identification. Point camera at leaf/flower, app identifies and teaches about it.

#### Visual
```
┌─────────────────────────────────────┐
│     🌿 Nature Explorer              │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │    📷 Camera viewfinder     │    │
│  │                             │    │
│  │    [ Point at a leaf! ]     │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Recent finds: 🍂 🌸 🌻 🍁          │
│                                     │
│  Collection: 12/50 items            │
└─────────────────────────────────────┘
```

#### Mechanics
- Camera identifies plants/insects
- Pip explains what it is
- Collection book fills up
- Quizzes on what you found

#### Technical Requirements
- [ ] Image classification model (on-device)
- [ ] Nature knowledge database
- [ ] Collection persistence
- [ ] Offline-first design

---

## Research Queue

### Ideas Needing Validation

| Idea | Question | Research Needed |
|------|----------|-----------------|
| Voice Stories | Can TTS engage kids? | A/B test vs recorded voice |
| AR Games | Worth the complexity? | Parent interviews |
| Multiplayer | Local co-op interest? | User testing |
| Body Movement | Full body tracking feasible? | Tech exploration |
| Emotion Cards | Age appropriate? | Child dev research |

### Prior Art Research

| Competitor | What They Do Well | What to Borrow |
|------------|-------------------|----------------|
| Duolingo Kids | Character unlocks | Progression system |
| Khan Academy Kids | Curriculum structure | Learning paths |
| Endless Alphabet | Monster animations | Delightful feedback |
| Homer | Personalized stories | Story integration |
| Toca Boca | Free play zones | Creative modes |

---

## Implementation Templates

### Game Design Document Template
```markdown
## [Game Name]
**Priority:** P# | **Effort:** X weeks | **Age:** X-Y

### Concept
One sentence describing the gameplay.

### Visual
ASCII diagram or description.

### Mechanics
- Bullet point gameplay rules.

### Progression
Level → Content → Difficulty table.

### Technical Requirements
- [ ] Component/feature needed
- [ ] Asset requirements

### Story Integration
> "Pip's narrative hook"
```

### Asset Requirements Template
```markdown
## [Game Name] Assets

### Visual Assets
| Asset | Format | Quantity | Notes |
|-------|--------|----------|-------|
| Templates | SVG | 20 | Path data for tracing |
| Backgrounds | PNG | 5 | Scene illustrations |
| Icons | SVG | 10 | UI elements |

### Audio Assets
| Asset | Format | Quantity | Notes |
|-------|--------|----------|-------|
| SFX | MP3 | 5 | Success, error, tap |
| Music | MP3 | 1 | Background loop |
| Voice | MP3 | 20 | Pip lines |
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-01 | Initial document creation | AI Assistant |
| | Added 8 game designs | |
| | Created priority tiers | |
| | Added templates | |

---

## Contributing

To add a new game idea:
1. Copy the Game Design Document Template
2. Fill in all sections
3. Add to appropriate priority tier
4. Update skill coverage matrix
5. Create worklog ticket if prioritized

**Owner:** Product Team  
**Review Cadence:** Monthly

---

*End of Document*
