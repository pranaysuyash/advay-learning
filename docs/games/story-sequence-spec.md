# Story Sequence - Game Specification

## Overview
**Game ID**: `story-sequence`
**Educational Focus**: Sequencing, logic, temporal understanding, narrative comprehension
**Target Age**: 4-6 years
**Code Location**: `src/frontend/src/games/storySequenceLogic.ts`

## Game Description
Children arrange picture cards in the correct temporal order to complete a story. Each story has a theme (life cycle, daily routine, cooking, etc.) and requires children to understand and apply logical sequencing skills.

## Educational Goals
1. Understand temporal concepts (before, after, first, last)
2. Develop logical reasoning and cause-and-effect understanding
3. Build narrative comprehension skills
4. Practice drag-and-drop fine motor skills

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
  id: string;
  image: string;
  description: string;
  correctPosition: number;
  emoji: string;
}

interface SequenceStory {
  id: string;
  theme: SequenceTheme;
  difficulty: 1 | 2 | 3;  // 3, 4, or 5 cards
  title: string;
  description: string;
  cards: SequenceCard[];
  narration: string;  // TTS narration for intro
}

interface DragState {
  isDragging: boolean;
  cardId: string | null;
  position: Point;
  sourceIndex: number | null;
}

interface GameState {
  currentStory: SequenceStory | null;
  slots: (SequenceCard | null)[];
  pool: SequenceCard[];
  completed: boolean;
  attempts: number;
  hintsUsed: number;
}
```

### Story Database (8 stories)

#### Difficulty 1 (3-4 cards)

| ID | Theme | Title | Cards |
|----|-------|-------|-------|
| `chicken-life` | lifeCycle | From Egg to Chicken | 4 (egg, hatching, chick, chicken) |
| `plant-growth` | growth | A Seed Grows | 4 (seed, sprout, plant, flower) |
| `caterpillar-butterfly` | transformation | Caterpillar to Butterfly | 3 (caterpillar, cocoon, butterfly) |
| `rainbow-weather` | weather | After the Rain | 4 (clouds, rain, sun, rainbow) |

#### Difficulty 2 (5 cards)

| ID | Theme | Title | Cards |
|----|-------|-------|-------|
| `morning-routine` | dailyRoutine | Getting Ready for School | 5 (wake, brush, breakfast, backpack, school) |
| `building-house` | building | Building a House | 5 (foundation, walls, roof, paint, home) |
| `making-pizza` | cooking | Making Pizza | 5 (dough, sauce, toppings, oven, pizza) |
| `frog-life` | lifeCycle | From Tadpole to Frog | 4 (eggs, tadpole, tadpole-legs, frog) |

### Core Functions

#### `getStoriesByDifficulty(difficulty?)`
Filters stories by difficulty level.

**Parameters:**
- `difficulty?: 1 | 2 | 3` - Optional difficulty filter

**Returns:** `SequenceStory[]`

**Behavior:**
- No difficulty specified: returns all stories
- Difficulty specified: returns only matching stories
- No matches: returns empty array

#### `getRandomStory(difficulty?)`
Gets a random story, optionally filtered by difficulty.

**Parameters:**
- `difficulty?: 1 | 2 | 3` - Optional difficulty filter

**Returns:** `SequenceStory | undefined`

**Note:** Returns `undefined` if no stories match the difficulty.

#### `getStoryById(id)`
Finds a specific story by its ID.

**Parameters:**
- `id: string` - Story identifier

**Returns:** `SequenceStory | undefined`

#### `initializeGame(story)`
Creates initial game state for a story.

**Parameters:**
- `story: SequenceStory` - Story to initialize

**Returns:** `GameState`

**Initial State:**
- All slots empty (null)
- Pool contains shuffled story cards
- completed = false
- attempts = 0
- hintsUsed = 0

#### `checkSequence(slots)`
Validates if all cards are in correct positions.

**Parameters:**
- `slots: (SequenceCard | null)[]` - Current slot arrangement

**Returns:** `boolean`

**Rules:**
- All slots must be non-null
- Each card's `correctPosition` must equal its slot index

#### `isSlotCorrect(slots, slotIndex)`
Checks if a specific slot has the correct card.

**Parameters:**
- `slots: (SequenceCard | null)[]`
- `slotIndex: number`

**Returns:** `boolean`

#### `getCorrectCount(slots)`
Counts how many cards are correctly placed.

**Parameters:**
- `slots: (SequenceCard | null)[]`

**Returns:** `number`

#### `getHint(gameState)`
Provides a hint for the next incorrect or empty slot.

**Parameters:**
- `gameState: GameState`

**Returns:** `{slotIndex: number; hint: string} | null`

**Behavior:**
- Finds first empty or incorrect slot
- Returns hint describing the correct card for that slot

#### `areAllSlotsFilled(slots)`
Checks if every slot has a card.

**Parameters:**
- `slots: (SequenceCard | null)[]`

**Returns:** `boolean`

#### `canPlaceCard(slotIndex, slots)`
Validates if a card can be placed in a slot.

**Parameters:**
- `slotIndex: number`
- `slots: (SequenceCard | null)[]`

**Returns:** `boolean`

**Validation:** Slot index must be within bounds.

#### `placeCard(card, slotIndex, slots, pool)`
Places a card in a slot, handling displacement.

**Parameters:**
- `card: SequenceCard` - Card to place
- `slotIndex: number` - Target slot
- `slots: (SequenceCard | null)[]` - Current slots
- `pool: SequenceCard[]` - Current card pool

**Returns:** `{newSlots, newPool, displacedCard}`

**Behavior:**
1. Removes card from pool if present
2. Gets existing card from slot (displaced)
3. Places new card in slot
4. Returns displaced card to pool if it existed

#### `moveCardBetweenSlots(fromIndex, toIndex, slots)`
Swaps cards between two slots.

**Parameters:**
- `fromIndex: number`
- `toIndex: number`
- `slots: (SequenceCard | null)[]`

**Returns:** Updated slots array

**Behavior:**
- If target slot is empty, moves card
- If target slot has card, swaps them

#### `returnCardToPool(slotIndex, slots, pool)`
Returns a card from a slot to the pool.

**Parameters:**
- `slotIndex: number`
- `slots: (SequenceCard | null)[]`
- `pool: SequenceCard[]`

**Returns:** `{newSlots, newPool}`

#### `getThemeDisplayName(theme)`
Gets human-readable theme name.

**Parameters:**
- `theme: SequenceTheme`

**Returns:** Display string

#### `getDifficultyDisplay(difficulty)`
Gets difficulty display info.

**Parameters:**
- `difficulty: number`

**Returns:** `{label: string; color: string}`

**Returns:**
- Difficulty 1: `{label: 'Easy', color: 'text-green-500'}`
- Difficulty 2: `{label: 'Medium', color: 'text-yellow-500'}`
- Difficulty 3: `{label: 'Hard', color: 'text-red-500'}`
- Other: `{label: 'Unknown', color: 'text-gray-500'}`

## Game Progression

### Difficulty Levels
- **Easy (1)**: 3-4 card stories
- **Medium (2)**: 5 card stories
- **Hard (3)**: Defined but no stories in current database

### Themes
- Life cycles (chicken, frog, butterfly)
- Growth (plant)
- Daily routines (morning)
- Cooking (pizza)
- Building (house)
- Weather (rainbow)
- Transformation (caterpillar)

### Hint System
- Hints identify the next incorrect or empty slot
- Hint describes which card belongs there
- Hints are tracked per game (`hintsUsed`)

## Technical Notes

### Dependencies
- `../types/tracking` for Point type

### Test Coverage
- 65 tests covering:
  - Story database structure (8 stories)
  - Difficulty filtering
  - Random story selection
  - Game state initialization
  - Sequence validation
  - Card placement and movement
  - Hint system
  - Edge cases and integration scenarios

### Implementation Details
- Pure functional design with immutable updates
- All card positions are sequential from 0
- Cards use emoji for visual representation
- Narration field supports TTS (UI layer)
- Drag state tracks position and source

### Known Issues
- `getRandomStory(3)` returns undefined (no difficulty 3 stories)
- Should add fallback to any story when filter returns empty
