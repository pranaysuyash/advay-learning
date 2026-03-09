# Story Sequence - Game Specification

## Overview
**Game ID**: `story-sequence`
**Educational Focus**: Sequencing, temporal understanding, narrative comprehension, logical reasoning
**Target Age**: 4-6 years
**Code Location**: `src/frontend/src/games/storySequenceLogic.ts`

## Game Description
Children arrange picture cards in the correct temporal order to complete a story. This teaches sequencing skills, temporal concepts (before/after), and narrative understanding through drag-and-drop gameplay.

## Educational Goals
1. Temporal reasoning (before/after)
2. Sequencing and ordering
3. Narrative comprehension
4. Logical thinking
5. Cause and effect understanding

## Game Logic

### Interfaces

```typescript
type SequenceTheme = 
  | 'lifeCycle' 
  | 'dailyRoutine' 
  | 'cooking' 
  | 'growth' 
  | 'weather' 
  | 'building'
  | 'transformation';

interface SequenceCard {
  id: string;              // Unique card identifier
  image: string;           // Image asset ID
  description: string;     // Card description text
  correctPosition: number; // Position in sequence (0-indexed)
  emoji: string;           // Emoji representation
}

interface SequenceStory {
  id: string;              // Unique story identifier
  theme: SequenceTheme;    // Story category/theme
  difficulty: 1 | 2 | 3;   // 1=3 cards, 2=4 cards, 3=5 cards
  title: string;           // Story title
  description: string;     // Story description
  cards: SequenceCard[];   // Array of story cards
  narration: string;       // TTS intro narration
}

interface DragState {
  isDragging: boolean;       // Currently dragging
  cardId: string | null;     // Card being dragged
  position: Point;           // Current drag position
  sourceIndex: number | null; // null=pool, number=slot index
}

interface GameState {
  currentStory: SequenceStory | null;
  slots: (SequenceCard | null)[];  // Placement slots
  pool: SequenceCard[];            // Available cards
  completed: boolean;
  attempts: number;
  hintsUsed: number;
}
```

### Story Database (8 stories)

| ID | Theme | Difficulty | Cards | Title |
|----|-------|------------|-------|-------|
| chicken-life | lifeCycle | 1 | 4 | From Egg to Chicken |
| plant-growth | growth | 1 | 4 | A Seed Grows |
| morning-routine | dailyRoutine | 2 | 5 | Getting Ready for School |
| caterpillar-butterfly | transformation | 1 | 3 | Caterpillar to Butterfly |
| rainbow-weather | weather | 1 | 4 | After the Rain |
| building-house | building | 2 | 5 | Building a House |
| making-pizza | cooking | 2 | 5 | Making Pizza |
| frog-life | lifeCycle | 2 | 4 | From Tadpole to Frog |

### Difficulty Levels

| Level | Card Count | Description |
|-------|------------|-------------|
| 1 | 3 cards | Simple sequences for beginners |
| 2 | 4 cards | Medium complexity |
| 3 | 5 cards | Advanced sequences (not used in current stories) |

### Themes (7 types)

| Theme | Display Name | Stories |
|-------|-------------|---------|
| lifeCycle | Life Cycle | 2 stories |
| growth | Growing | 1 story |
| dailyRoutine | Daily Routine | 1 story |
| transformation | Magic Change | 1 story |
| weather | Weather | 1 story |
| building | Building | 1 story |
| cooking | Cooking | 1 story |

### Core Functions

#### `getStoriesByDifficulty(difficulty?: 1 | 2 | 3): SequenceStory[]`
Returns stories filtered by difficulty level.

**Behavior**:
- No difficulty → Returns all 8 stories
- With difficulty → Returns only matching stories

#### `getRandomStory(difficulty?: 1 | 2 | 3): SequenceStory`
Returns a random story from the story database.

**Behavior**:
- Filters by difficulty if provided
- Randomly selects one story
- Uses `Math.random()` for selection

#### `getStoryById(id: string): SequenceStory | undefined`
Returns a specific story by its ID.

#### `shuffleCards(cards: SequenceCard[]): SequenceCard[]`
Shuffles cards using random sort.

**Note**: Uses `sort(() => Math.random() - 0.5)` which is not a true Fisher-Yates shuffle.

#### `initializeGame(story: SequenceStory): GameState`
Creates a new game state for a story.

**Behavior**:
- Creates empty slots array (same length as cards)
- Shuffles story cards into the pool
- Sets completed, attempts, hintsUsed to initial values

#### `checkSequence(slots: (SequenceCard | null)[]): boolean`
Validates if all cards are in correct positions.

**Returns**: `true` if every card's `correctPosition` matches its slot index.

#### `isSlotCorrect(slots: (SequenceCard | null)[], slotIndex: number): boolean`
Checks if a specific slot has the correct card.

#### `getCorrectCount(slots: (SequenceCard | null)[]): number`
Returns the number of correctly placed cards.

#### `getHint(gameState: GameState): { slotIndex: number; hint: string } | null`
Gets a hint for the first empty or incorrect slot.

**Behavior**:
- Finds first slot that's empty or has wrong card
- Returns hint text describing the correct card for that slot
- Returns `null` if all slots correct

#### `areAllSlotsFilled(slots: (SequenceCard | null)[]): boolean`
Checks if every slot has a card (no nulls).

#### `canPlaceCard(slotIndex: number, slots: (SequenceCard | null)[]): boolean`
Validates if a slot index is within bounds.

**Note**: Cards can always be placed in any slot; validation happens after placement.

#### `placeCard(card, slotIndex, slots, pool): { newSlots, newPool, displacedCard }`
Places a card in a slot, handling pool and displacement.

**Behavior**:
- Removes card from pool if present
- Places card in target slot
- Returns displaced card to pool (if any)

#### `moveCardBetweenSlots(fromIndex, toIndex, slots): slots`
Moves a card from one slot to another, swapping if target occupied.

#### `returnCardToPool(slotIndex, slots, pool): { newSlots, newPool }`
Returns a card from a slot back to the pool.

#### `getThemeDisplayName(theme: SequenceTheme): string`
Returns human-readable theme name.

#### `getDifficultyDisplay(difficulty: number): { label: string; color: string }`
Returns display info for difficulty level.

| Difficulty | Label | Color |
|------------|-------|-------|
| 1 | Easy | text-green-500 |
| 2 | Medium | text-yellow-500 |
| 3 | Hard | text-red-500 |

## Game Progression

### Story Complexity

| Theme | Pattern | Cards |
|-------|---------|-------|
| Life cycles | Growth transformation | 3-4 cards |
| Daily routines | Sequential activities | 5 cards |
| Cooking | Step-by-step process | 5 cards |
| Building | Construction phases | 5 cards |
| Weather | Natural progression | 4 cards |

### Difficulty Scaling

| Level | Stories | Cards | Challenge |
|-------|---------|-------|-----------|
| 1 | 5 stories | 3-4 cards | Clear temporal order |
| 2 | 3 stories | 4-5 cards | More steps, subtler transitions |

### Temporal Concepts Taught
- **First, next, then, finally** - Sequence words
- **Before/after** - Relative time
- **Cause/effect** - One thing leads to another
- **Beginning/middle/end** - Narrative structure

## Technical Notes

### Shuffle Implementation
```typescript
export function shuffleCards(cards: SequenceCard[]): SequenceCard[] {
  return [...cards].sort(() => Math.random() - 0.5);
}
```
**Note**: This is not a true Fisher-Yates shuffle and has minor bias. For an educational game, this is acceptable.

### Card Validation
The `correctPosition` property stores the intended index (0, 1, 2, ...). Validation compares:
```typescript
card.correctPosition === slotIndex
```

### Pool vs Slots
- **Pool**: Shuffled cards available for placement
- **Slots**: Ordered positions where cards are placed
- Cards move between pool and slots during gameplay

### Hint System
Hints identify the first problem slot and describe the correct card:
```typescript
hint: `Look for ${correctCard.description}\!`
```

### Edge Cases
- Empty story array → `getRandomStory()` returns `undefined` (would throw)
- Invalid slot index → `canPlaceCard()` returns `false`
- Missing card in pool → `placeCard()` handles gracefully (no-op on remove)

## Design Decisions

### 8 Stories
- Small pool allows content mastery
- Variety of themes (nature, daily life, construction)
- Different difficulty levels
- Culturally universal concepts

### Card Counts by Difficulty
- Level 1: 3-4 cards (manageable for beginners)
- Level 2: 4-5 cards (more complex sequences)
- Level 3: 5 cards (defined but not currently used)

### Drag-and-Drop Model
The game uses a pool-to-slots model:
1. Cards start in a shuffled pool
2. Child drags cards to ordered slots
3. Slots can be swapped
4. Cards can be returned to pool

### Emoji Illustrations
- Each card has an emoji for visual recognition
- Supports pre-readers
- Universal visual language
- Quick identification

### Hint System
- Finds first incorrect slot
- Describes the correct card
- Doesn't solve the entire puzzle
- Teaches through guidance

## Educational Design

### Sequencing Skills
- **Linear ordering**: First, second, third...
- **Pattern recognition**: Identifying sequence structure
- **Logical deduction**: "This must come before that"

### Temporal Understanding
- **Chronology**: Events happen in order
- **Causality**: One event causes another
- **Time concepts**: Before/after, first/last

### Narrative Comprehension
- **Story structure**: Beginning, middle, end
- **Plot progression**: Events build on each other
- **Character development**: Changes over time

### Age Appropriateness
| Age | Recommended Level |
|-----|-------------------|
| 4-5 | Level 1 (3-4 cards) |
| 5-6 | Level 2 (4-5 cards) |
| 6+ | Level 3 (5 cards, when implemented) |

## Extension Possibilities

### Additional Stories
Possible themes:
- **Seasons**: Spring → Summer → Fall → Winter
- **Holiday prep**: Decorating → Cooking → Celebrating
- **School day**: Arrival → Class → Lunch → Recess → Home

### Difficulty Levels
- **Level 3**: 5 cards (defined but unused)
- **Distractor cards**: Extra cards not in sequence
- **Time limit**: Add urgency for older kids

### Features
- **Narration**: Audio for each card description
- **Animation**: Cards animate when correctly placed
- **Progress**: Track completed stories
- **Custom stories**: User-created sequences

## Testing Notes

### Deterministic Testing
Challenging due to:
- `Math.random()` usage in shuffle and selection
- No RNG injection capability
- Multiple random sources

### Test Strategy
- Test story structure and data
- Test validation logic
- Test pool/slot operations
- Test hint generation
- Test edge cases (invalid inputs)

### Coverage Points
- Story database completeness
- Difficulty filtering
- Sequence validation
- Card placement logic
- Hint generation
- Pool management
