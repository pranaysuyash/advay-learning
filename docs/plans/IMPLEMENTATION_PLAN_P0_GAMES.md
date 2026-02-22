# P0 Games Implementation Plan

**Status:** Ready for Implementation  
**Created:** 2026-02-22  
**Target Completion:** 4 weeks  

---

## Overview

Five P0 priority games to implement, filling critical gaps in the platform:

| Priority | Game | Gap Filled | Effort | Age |
|----------|------|------------|--------|-----|
| 1 | Story Sequence | Logic/Reasoning (0→1) | 1 week | 4-6 |
| 2 | Shape Safari | Shapes (1→2) | 1 week | 3-5 |
| 3 | Rhyme Time | Phonics | 1 week | 4-6 |
| 4 | Free Draw | Creativity | 3 days | 2-6 |
| 5 | Math Monsters | Math Operations | 2 weeks | 5-8 |

---

## Game 1: Story Sequence

### Why First?
Fills the CRITICAL gap of Logic/Reasoning (currently 0 games).

### Technical Spec

**Route:** `/games/story-sequence`  
**File:** `src/frontend/src/pages/StorySequence.tsx`  
**Logic Module:** `src/frontend/src/games/storySequenceLogic.ts`

### Architecture

```
StorySequence.tsx
├── Header: Progress, Exit
├── Game Area
│   ├── Slots: [1] [2] [3] [4] (drop zones)
│   └── Cards: Scrambled sequence cards (draggable)
├── Instructions: TTS narration
└── Success: Celebration overlay
```

### Data Structures

```typescript
// src/frontend/src/games/storySequenceLogic.ts

export interface SequenceStory {
  id: string;
  theme: 'lifeCycle' | 'dailyRoutine' | 'cooking' | 'growth' | 'weather' | 'building';
  difficulty: 1 | 2 | 3;  // 3, 4, or 5 cards
  title: string;
  cards: SequenceCard[];
}

export interface SequenceCard {
  id: string;
  image: string;        // CC0 illustration
  description: string;  // For TTS
  correctPosition: number;
}

export const STORY_SEQUENCES: SequenceStory[] = [
  {
    id: 'chicken-life',
    theme: 'lifeCycle',
    difficulty: 1,
    title: 'From Egg to Chicken',
    cards: [
      { id: 'egg', image: '/assets/sequences/egg.png', description: 'Egg', correctPosition: 0 },
      { id: 'hatching', image: '/assets/sequences/hatching.png', description: 'Hatching chick', correctPosition: 1 },
      { id: 'chick', image: '/assets/sequences/chick.png', description: 'Baby chick', correctPosition: 2 },
      { id: 'chicken', image: '/assets/sequences/chicken.png', description: 'Grown chicken', correctPosition: 3 },
    ]
  },
  // More stories...
];

export function shuffleCards(cards: SequenceCard[]): SequenceCard[] {
  return [...cards].sort(() => Math.random() - 0.5);
}

export function checkSequence(slots: (SequenceCard | null)[]): boolean {
  return slots.every((card, index) => card?.correctPosition === index);
}

export function getHint(cards: SequenceCard[], slots: (SequenceCard | null)[]): string {
  // Find first incorrect slot and give hint
  for (let i = 0; i < slots.length; i++) {
    if (!slots[i] || slots[i].correctPosition !== i) {
      const correctCard = cards.find(c => c.correctPosition === i);
      return `Look for the card that shows ${correctCard?.description}`;
    }
  }
  return '';
}
```

### Hand Tracking Integration

```typescript
// Uses existing useHandTracking + useHandTrackingRuntime
// Pinch to grab card
// Drag to slot
// Release to drop (with snap-to-slot)

const PINCH_THRESHOLD = 0.05;  // Thumb-index distance

interface DragState {
  isDragging: boolean;
  cardId: string | null;
  position: { x: number; y: number };
}
```

### UI Layout

```
┌─────────────────────────────────────┐
│  Story Sequence    Exit  [||||]     │  ← Header
├─────────────────────────────────────┤
│                                     │
│  Order these pictures:              │
│                                     │
│  [ 1 ]  [ 2 ]  [ 3 ]  [ 4 ]         │  ← Drop slots
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [🥚]  [🐣]  [🐤]  [🐔]             │  ← Scrambled cards
│   ↑ Draggable                       │
│                                     │
│  [🔊 Hint]                          │
└─────────────────────────────────────┘
```

### Asset Requirements

| Asset | Count | Source | Notes |
|-------|-------|--------|-------|
| Sequence images | 40 | CC0 illustrations | 10 stories × 4 cards |
| Background | 1 | Gradient/abstract | Consistent with other games |
| Success animation | 1 | Reuse CelebrationOverlay | Confetti + stars |

### Stories to Include (MVP)

1. **Egg to Chicken** (lifeCycle, difficulty 1)
2. **Plant Growth** (growth, difficulty 1)
3. **Morning Routine** (dailyRoutine, difficulty 2)
4. **Making a Sandwich** (cooking, difficulty 2)
5. **Rain to Rainbow** (weather, difficulty 1)

### Implementation Checklist

- [ ] Create storySequenceLogic.ts with data structures
- [ ] Create StorySequence.tsx page component
- [ ] Implement drag-and-drop with hand tracking
- [ ] Add snap-to-slot behavior
- [ ] Add success detection
- [ ] Add celebration animation
- [ ] Add TTS narration
- [ ] Add smoke test
- [ ] Add to Games.tsx gallery
- [ ] Update routing

### Test Scenarios

1. Drag card to correct slot → Snaps in place
2. Drag card to wrong slot → Returns to pool
3. Complete sequence → Celebration plays
4. Click hint → Audio guidance
5. All 5 stories playable

---

## Game 2: Shape Safari

### Technical Spec

**Route:** `/games/shape-safari`  
**File:** `src/frontend/src/pages/ShapeSafari.tsx`  
**Logic Module:** `src/frontend/src/games/shapeSafariLogic.ts`

### Architecture

```
ShapeSafari.tsx
├── Header: Progress, Exit
├── Scene Canvas
│   ├── Background image
│   ├── Shape outlines (hidden until traced)
│   └── Tracing path overlay
├── HUD: Shapes remaining counter
└── Celebration: On scene complete
```

### Data Structures

```typescript
// src/frontend/src/games/shapeSafariLogic.ts

export type ShapeType = 'circle' | 'square' | 'triangle' | 'rectangle' | 'star' | 'oval' | 'diamond';

export interface HiddenShape {
  id: string;
  type: ShapeType;
  path: string;              // SVG path data
  position: { x: number; y: number };
  size: { width: number; height: number };
  isFound: boolean;
  hiddenObject: {
    type: 'animal' | 'object' | 'character';
    name: string;
    image: string;
  };
}

export interface SafariScene {
  id: string;
  theme: 'jungle' | 'ocean' | 'space' | 'farm' | 'city';
  backgroundImage: string;
  difficulty: 1 | 2 | 3;
  shapes: HiddenShape[];
  targetShape: ShapeType;
  targetCount: number;
}

export const SAFARI_SCENES: SafariScene[] = [
  {
    id: 'jungle-circles',
    theme: 'jungle',
    backgroundImage: '/assets/scenes/jungle.png',
    difficulty: 1,
    targetShape: 'circle',
    targetCount: 5,
    shapes: [
      {
        id: 'circle1',
        type: 'circle',
        path: 'M 100 100 A 30 30 0 1 1 100 160 A 30 30 0 1 1 100 100',
        position: { x: 100, y: 100 },
        size: { width: 60, height: 60 },
        isFound: false,
        hiddenObject: { type: 'animal', name: 'Monkey', image: '/assets/animals/monkey.png' }
      },
      // More circles...
    ]
  },
  // More scenes...
];

export function checkTracingAccuracy(
  tracedPath: Point[],
  targetPath: string,
  tolerance: number = 20
): boolean {
  // Use path similarity algorithm
  // Return true if traced path follows target path within tolerance
}

export function getProgress(scene: SafariScene): { found: number; total: number } {
  const found = scene.shapes.filter(s => s.isFound).length;
  return { found, total: scene.shapes.length };
}
```

### Tracing Algorithm

```typescript
// Adapted from AlphabetGame tracing logic
interface TracingState {
  isTracing: boolean;
  currentPath: Point[];
  targetShape: HiddenShape | null;
}

// Steps:
// 1. Detect finger near shape outline
// 2. Start tracing when finger touches outline
// 3. Sample points along path
// 4. Check if points follow shape contour
// 5. Complete when path is sufficiently traced
// 6. Trigger reveal animation
```

### UI Layout

```
┌─────────────────────────────────────┐
│  Shape Safari      Exit  [|||]      │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │      Jungle Scene           │    │
│  │                             │    │
│  │    ○  ○  ○                  │    │  ← Hidden circles
│  │   (tree) (fruit)            │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Find: ○ Circles (3 left)           │
│                                     │
└─────────────────────────────────────┘
```

### Asset Requirements

| Asset | Count | Source |
|-------|-------|--------|
| Scene backgrounds | 10 | CC0 illustrations |
| Hidden object sprites | 30 | CC0 animal/object art |
| Shape outline overlays | 7 types | SVG paths |
| Reveal animations | 5 | Particle effects |

### Scenes to Include (MVP)

1. **Jungle Circles** (find 5 circles) → Monkeys, fruits
2. **Ocean Squares** (find 4 squares) → Windows, boxes
3. **Space Triangles** (find 5 triangles) → Stars, rockets
4. **Farm Mixed** (find 3 circles, 2 squares, 2 triangles)
5. **City Shapes** (find all shape types)

### Implementation Checklist

- [ ] Create shapeSafariLogic.ts
- [ ] Create ShapeSafari.tsx page
- [ ] Implement SVG path tracing detection
- [ ] Add shape reveal animations
- [ ] Add progress tracking
- [ ] Add scene completion celebration
- [ ] Add TTS shape names
- [ ] Add smoke test
- [ ] Add to Games.tsx gallery
- [ ] Update routing

---

## Game 3: Rhyme Time

### Technical Spec

**Route:** `/games/rhyme-time`  
**File:** `src/frontend/src/pages/RhymeTime.tsx`  
**Logic Module:** `src/frontend/src/games/rhymeTimeLogic.ts`

### Architecture

```
RhymeTime.tsx
├── Header: Score, Exit
├── Question: "What rhymes with..."
├── Target: Word + Image (large)
├── Options: 3-4 rhyme options (pinch to select)
├── Feedback: Correct/Incorrect indicator
└── Celebration: Streak rewards
```

### Data Structures

```typescript
// src/frontend/src/games/rhymeTimeLogic.ts

export interface RhymeFamily {
  family: string;      // -at, -an, -ig, etc.
  words: RhymeWord[];
}

export interface RhymeWord {
  word: string;
  image: string;
  audio: string;
}

export interface RhymeRound {
  targetWord: RhymeWord;
  rhymeFamily: string;
  options: RhymeOption[];    // 3-4 options, 1 correct
  correctAnswer: string;
}

export interface RhymeOption {
  word: RhymeWord;
  isCorrect: boolean;
}

export const RHYME_FAMILIES: RhymeFamily[] = [
  {
    family: '-at',
    words: [
      { word: 'cat', image: '/assets/rhymes/cat.png', audio: '/audio/cat.mp3' },
      { word: 'bat', image: '/assets/rhymes/bat.png', audio: '/audio/bat.mp3' },
      { word: 'hat', image: '/assets/rhymes/hat.png', audio: '/audio/hat.mp3' },
      { word: 'mat', image: '/assets/rhymes/mat.png', audio: '/audio/mat.mp3' },
      { word: 'rat', image: '/assets/rhymes/rat.png', audio: '/audio/rat.mp3' },
    ]
  },
  {
    family: '-an',
    words: [
      { word: 'can', image: '/assets/rhymes/can.png', audio: '/audio/can.mp3' },
      { word: 'fan', image: '/assets/rhymes/fan.png', audio: '/audio/fan.mp3' },
      { word: 'man', image: '/assets/rhymes/man.png', audio: '/audio/man.mp3' },
      { word: 'pan', image: '/assets/rhymes/pan.png', audio: '/audio/pan.mp3' },
      { word: 'van', image: '/assets/rhymes/van.png', audio: '/audio/van.mp3' },
    ]
  },
  // More families...
];

export function generateRound(families: RhymeFamily[], difficulty: number): RhymeRound {
  // Pick random family
  const family = families[Math.floor(Math.random() * families.length)];
  
  // Pick target word
  const targetIndex = Math.floor(Math.random() * family.words.length);
  const targetWord = family.words[targetIndex];
  
  // Generate options: 1 correct + 2-3 incorrect from other families
  const options: RhymeOption[] = [{ word: targetWord, isCorrect: true }];
  
  // Add distractors from other families
  const otherFamilies = families.filter(f => f.family !== family.family);
  const distractorCount = difficulty === 1 ? 2 : 3;
  
  for (let i = 0; i < distractorCount; i++) {
    const randomFamily = otherFamilies[Math.floor(Math.random() * otherFamilies.length)];
    const randomWord = randomFamily.words[Math.floor(Math.random() * randomFamily.words.length)];
    options.push({ word: randomWord, isCorrect: false });
  }
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  
  return {
    targetWord,
    rhymeFamily: family.family,
    options,
    correctAnswer: targetWord.word
  };
}
```

### UI Layout

```
┌─────────────────────────────────────┐
│  Rhyme Time        Exit  Score: 50  │
├─────────────────────────────────────┤
│                                     │
│  What rhymes with...                │
│                                     │
│        🐱                           │
│       CAT                           │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [🐕 DOG]  [🦇 BAT]  [🚗 CAR]       │
│             ↑ Correct               │
│                                     │
│  🔊 Tap to hear words               │
│                                     │
└─────────────────────────────────────┘
```

### Asset Requirements

| Asset | Count | Source |
|-------|-------|--------|
| Word images | 50 | CC0 illustrations |
| Audio pronunciations | 50 | TTS or recordings |
| Background | 1 | Reuse existing |
| Success sounds | 3 | Reuse shared |

### Rhyme Families (MVP)

1. **-at** family: cat, bat, hat, mat, rat, sat
2. **-an** family: can, fan, man, pan, van, ran
3. **-ig** family: big, dig, fig, pig, wig
4. **-op** family: cop, hop, mop, pop, top
5. **-ug** family: bug, hug, jug, mug, rug

### Implementation Checklist

- [ ] Create rhymeTimeLogic.ts
- [ ] Create RhymeTime.tsx page
- [ ] Implement pinch-to-select
- [ ] Add TTS/word audio
- [ ] Add correct/incorrect feedback
- [ ] Add scoring system
- [ ] Add streak celebration
- [ ] Add smoke test
- [ ] Add to Games.tsx gallery
- [ ] Update routing

---

## Game 4: Free Draw

### Technical Spec

**Route:** `/games/free-draw`  
**File:** `src/frontend/src/pages/FreeDraw.tsx`  
**Logic Module:** `src/frontend/src/games/freeDrawLogic.ts`

### Architecture

```
FreeDraw.tsx
├── Header: Exit, Clear, Save
├── Canvas: Full-screen drawing area
├── Toolbar: Color picker, brush size, brush type
└── Gesture hints: Shake to clear
```

### Key Features

```typescript
// src/frontend/src/games/freeDrawLogic.ts

export interface FreeDrawConfig {
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  brushes: BrushType[];
  defaultBrush: BrushType;
  colors: string[];
}

export type BrushType = 
  | 'round'      // Standard round brush
  | 'flat'       // Flat brush
  | 'spray'      // Spray paint effect
  | 'glitter'    // Sparkle particles
  | 'neon'       // Glow effect
  | 'rainbow';   // Cycles through colors

export interface BrushSettings {
  type: BrushType;
  size: number;        // 5-50 pixels
  color: string;
  opacity: number;     // 0-1
}

export const DEFAULT_CONFIG: FreeDrawConfig = {
  canvas: {
    width: 1280,
    height: 720,
    backgroundColor: '#ffffff'
  },
  brushes: ['round', 'flat', 'spray', 'glitter', 'neon', 'rainbow'],
  defaultBrush: 'round',
  colors: [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'
  ]
};

// Color mixing
export function mixColors(color1: string, color2: string): string {
  // Implement subtractive color mixing
  // red + blue = purple
  // red + yellow = orange
  // blue + yellow = green
  // all mixed = brown
}

// Gesture detection
export function detectShake(velocityHistory: number[][]): boolean {
  // Detect rapid direction changes
  // Return true if shake detected
}
```

### Hand Tracking Integration

```typescript
// Uses Air Canvas drawing system
// Index finger tip = brush position
// Pinch = color picker (hover over color)
// Two hands = two brushes
// Shake = clear canvas
```

### UI Layout

```
┌─────────────────────────────────────┐
│  Free Draw    Clear  💾  Exit       │
├─────────────────────────────────────┤
│                                     │
│                                     │
│      [Canvas Area]                  │
│      Finger draws here              │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  🖌️  ●──────○  🎨                   │
│   Brush  Size   Colors              │
│                                     │
│  🔴🟠🟡🟢🔵🟣⚫⚪                     │
│  ⬜⬜⬜⬜⬜⬜⬜⬜                     │
└─────────────────────────────────────┘
```

### Brush Effects

| Brush | Visual | Implementation |
|-------|--------|----------------|
| Round | Solid circle | Standard canvas arc |
| Flat | Oval | Scaled circle |
| Spray | Scattered dots | Random point cloud |
| Glitter | Sparkles | Animated particles |
| Neon | Glow | Shadow blur effect |
| Rainbow | Cycling colors | HSL color increment |

### Implementation Checklist

- [ ] Create freeDrawLogic.ts
- [ ] Create FreeDraw.tsx page
- [ ] Implement canvas drawing with hand tracking
- [ ] Add brush system
- [ ] Add color picker
- [ ] Add color mixing
- [ ] Add shake-to-clear gesture
- [ ] Add save/download feature
- [ ] Add smoke test
- [ ] Add to Games.tsx gallery
- [ ] Update routing

---

## Game 5: Math Monsters

### Technical Spec

**Route:** `/games/math-monsters`  
**File:** `src/frontend/src/pages/MathMonsters.tsx`  
**Logic Module:** `src/frontend/src/games/mathMonstersLogic.ts`

### Architecture

```
MathMonsters.tsx
├── Header: Level, Score, Streak
├── Monster: Animated character with speech bubble
├── Problem: Visual math problem
├── Hand Display: Camera view with finger overlay
├── Feedback: Correct/Incorrect
└── Celebration: Level up animation
```

### Data Structures

```typescript
// src/frontend/src/games/mathMonstersLogic.ts

export type Operation = 'recognition' | 'addition' | 'subtraction' | 'mixed';

export interface MathProblem {
  id: string;
  operation: Operation;
  num1: number;
  num2: number;
  answer: number;
  visual: VisualRepresentation;
}

export interface VisualRepresentation {
  type: 'objects' | 'numberLine' | 'fingers' | 'equation';
  images?: string[];        // For object counting
  equation: string;         // "3 + 2 = ?"
}

export interface Monster {
  id: string;
  name: string;
  appearance: string;       // Image/asset reference
  personality: 'hungry' | 'sleepy' | 'playful' | 'grumpy';
  phrases: {
    correct: string[];
    incorrect: string[];
    hungry: string[];
  };
}

export const MONSTERS: Monster[] = [
  {
    id: 'munchy',
    name: 'Munchy',
    appearance: '/assets/monsters/munchy.png',
    personality: 'hungry',
    phrases: {
      correct: ['Yum! Tasty number!', 'More! More!', 'Delicious!'],
      incorrect: ['Eww, not that!', 'Yucky!', 'That makes my tummy hurt!'],
      hungry: ['Feed me!', 'I\'m hungry!', 'Show me a number!']
    }
  },
  // More monsters...
];

export function generateProblem(
  operation: Operation,
  maxNumber: number = 10
): MathProblem {
  let num1: number, num2: number, answer: number;
  
  switch (operation) {
    case 'recognition':
      num1 = Math.floor(Math.random() * maxNumber) + 1;
      return {
        id: `rec-${Date.now()}`,
        operation,
        num1,
        num2: 0,
        answer: num1,
        visual: {
          type: 'fingers',
          equation: `Show ${num1}!`
        }
      };
      
    case 'addition':
      num1 = Math.floor(Math.random() * (maxNumber / 2)) + 1;
      num2 = Math.floor(Math.random() * (maxNumber / 2)) + 1;
      answer = num1 + num2;
      return {
        id: `add-${Date.now()}`,
        operation,
        num1,
        num2,
        answer,
        visual: {
          type: 'objects',
          images: [
            ...Array(num1).fill('/assets/objects/apple.png'),
            ...Array(num2).fill('/assets/objects/apple.png')
          ],
          equation: `${num1} + ${num2} = ?`
        }
      };
      
    case 'subtraction':
      num1 = Math.floor(Math.random() * maxNumber) + 1;
      num2 = Math.floor(Math.random() * num1);
      answer = num1 - num2;
      return {
        id: `sub-${Date.now()}`,
        operation,
        num1,
        num2,
        answer,
        visual: {
          type: 'objects',
          equation: `${num1} - ${num2} = ?`
        }
      };
  }
}

export function checkAnswer(shownFingers: number, expectedAnswer: number): boolean {
  return shownFingers === expectedAnswer;
}
```

### Progression System

```typescript
export interface Level {
  number: number;
  operation: Operation;
  maxNumber: number;
  problemsToAdvance: number;
  monsters: string[];
}

export const LEVELS: Level[] = [
  { number: 1, operation: 'recognition', maxNumber: 5, problemsToAdvance: 5, monsters: ['munchy'] },
  { number: 2, operation: 'recognition', maxNumber: 10, problemsToAdvance: 5, monsters: ['munchy'] },
  { number: 3, operation: 'addition', maxNumber: 5, problemsToAdvance: 5, monsters: ['munchy', 'squeaky'] },
  { number: 4, operation: 'addition', maxNumber: 10, problemsToAdvance: 5, monsters: ['squeaky'] },
  { number: 5, operation: 'subtraction', maxNumber: 5, problemsToAdvance: 5, monsters: ['squeaky', 'grumble'] },
  { number: 6, operation: 'subtraction', maxNumber: 10, problemsToAdvance: 5, monsters: ['grumble'] },
  { number: 7, operation: 'mixed', maxNumber: 10, problemsToAdvance: 10, monsters: ['munchy', 'squeaky', 'grumble'] },
];
```

### UI Layout

```
┌─────────────────────────────────────┐
│  Math Monsters  Level 3  Score: 150 │
├─────────────────────────────────────┤
│                                     │
│        ┌─────────────┐              │
│        │   😋🦕      │  ← Monster   │
│        │  "I'm       │              │
│        │   hungry    │              │
│        │   for 5!"   │              │
│        └─────────────┘              │
│                                     │
│       🍎🍎🍎 + 🍎🍎 = ?             │  ← Visual problem
│                                     │
│  ┌─────────────────────────────┐    │
│  │     [Camera view]           │    │
│  │        ✋                   │    │  ← Hand tracking
│  │     Show 5 fingers!         │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Asset Requirements

| Asset | Count | Source |
|-------|-------|--------|
| Monster characters | 3-5 | Custom or CC0 |
| Object images | 10 | Apples, stars, etc. |
| Backgrounds | 3 | Monster habitats |
| Sound effects | 10 | Eating, happy, sad |

### Implementation Checklist

- [ ] Create mathMonstersLogic.ts
- [ ] Create MathMonsters.tsx page
- [ ] Integrate finger counting (reuse from FingerNumberShow)
- [ ] Create monster character animations
- [ ] Add problem generation
- [ ] Add visual representations
- [ ] Add progression system
- [ ] Add TTS for monster speech
- [ ] Add smoke test
- [ ] Add to Games.tsx gallery
- [ ] Update routing

---

## Implementation Order & Dependencies

```
Week 1:
├── Day 1-2: Story Sequence
│   └── Depends on: drag-drop system (existing)
├── Day 3-5: Shape Safari
│   └── Depends on: tracing system (from AlphabetGame)
│
Week 2:
├── Day 1-3: Rhyme Time
│   └── Depends on: pinch selection (existing)
├── Day 4-5: Free Draw
│   └── Depends on: canvas drawing (from AirCanvas)
│
Week 3-4:
└── Math Monsters
    └── Depends on: finger counting (from FingerNumberShow)
```

---

## Success Criteria

| Game | Min. Stories/Levels | Test Coverage | Integration |
|------|---------------------|---------------|-------------|
| Story Sequence | 5 stories | Unit + smoke | Gallery + routing |
| Shape Safari | 5 scenes | Unit + smoke | Gallery + routing |
| Rhyme Time | 5 families | Unit + smoke | Gallery + routing |
| Free Draw | All brushes | Smoke | Gallery + routing |
| Math Monsters | 7 levels | Unit + smoke | Gallery + routing |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Asset creation slow | Use CC0 assets, placeholders OK |
| Tracing accuracy issues | Start with generous tolerance |
| Finger counting unreliable | Add visual confirmation |
| Performance with canvas | Limit canvas size, optimize loops |

---

*Status: Ready for Implementation*  
*Next Step: Begin with Story Sequence*
