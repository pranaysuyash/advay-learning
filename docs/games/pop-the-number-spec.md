# Pop The Number - Game Specification

## Overview
**Game ID**: `pop-the-number`
**Educational Focus**: Number recognition, sequential counting, working memory
**Target Age**: 4-7 years
**Code Location**: `src/frontend/src/games/popTheNumberLogic.ts`

## Game Description
Children pop numbered bubbles in sequential order (1, 2, 3...). Bubbles float around the screen and children must tap them in the correct numerical sequence. This reinforces number recognition and sequential counting skills.

## Educational Goals
1. Recognize numbers quickly
2. Understand sequential order
3. Develop working memory (remembering which number comes next)
4. Practice hand-eye coordination with tapping

## Game Logic

### Interfaces

```typescript
interface NumberBubble {
  id: number;           // Unique bubble identifier (sequential)
  value: number;        // The number displayed on the bubble
  x: number;            // X position (percentage, 0-100)
  y: number;            // Y position (percentage, 0-100)
  size: number;         // Bubble size in pixels (always 70)
  popped: boolean;      // Whether bubble has been popped
}

interface Level {
  id: number;           // Level number (1-4)
  numberRange: number;  // Maximum number (bubbles are 1 to numberRange)
  timeLimit: number;    // Time limit in seconds
  rounds: number;       // Number of rounds in the level
}
```

### Level Configuration

| Level | ID | Number Range | Time Limit | Rounds |
|-------|----|--------------|------------|--------|
| 1 | 1 | 1-3 | 30s | 3 |
| 2 | 2 | 1-5 | 45s | 5 |
| 3 | 3 | 1-7 | 60s | 7 |
| 4 | 4 | 1-10 | 90s | 10 |

### Difficulty Multipliers

| Level | Multiplier | Rationale |
|-------|------------|-----------|
| 1 | 1× | Base difficulty |
| 2 | 1.5× | Medium range |
| 3 | 2× | Higher range |
| 4 | 2.5× | Maximum range |

### Core Functions

#### `generateBubbles(level)`
Creates a set of numbered bubbles with random positions.

**Parameters:**
- `level: Level` - Level configuration

**Returns:** `NumberBubble[]`

**Behavior:**
1. Creates array of numbers from 1 to `numberRange`
2. Shuffles numbers using `shuffle()` utility
3. Generates non-overlapping positions:
   - 12% margin from edges
   - Minimum 18% distance between bubbles
   - Maximum 100 attempts per bubble
4. Creates bubbles with sequential IDs, shuffled values, and positions
5. All bubbles start with `popped: false`
6. All bubbles have `size: 70`

#### `checkPop(bubbles, bubbleId, nextExpected)`
Validates if the tapped bubble is the correct next number.

**Parameters:**
- `bubbles: NumberBubble[]` - All bubbles in the round
- `bubbleId: number` - ID of tapped bubble
- `nextExpected: number` - The next number in sequence

**Returns:** `{ correct: boolean; nextExpected: number; allPopped: boolean }`

**Behavior:**

**Incorrect Conditions:**
- Bubble not found: `{correct: false, nextExpected: unchanged, allPopped: all popped}`
- Bubble already popped: `{correct: false, nextExpected: unchanged, allPopped: all popped}`
- Wrong number: `{correct: false, nextExpected: unchanged, allPopped: all popped}`

**Correct:**
- Right number: `{correct: true, nextExpected: nextExpected + 1, allPopped: check remaining}`

**Note:** The function doesn't modify the bubbles array directly. The UI layer is expected to update the `popped` state.

#### `calculateScore(consecutivePops, level)`
Calculates points for a correct pop.

**Parameters:**
- `consecutivePops: number` - Number of consecutive correct pops
- `level: number` - Current level (1-4)

**Returns:** `number` - Points earned

**Formula:**
```
baseScore = 10
consecutiveBonus = min(consecutivePops × 2, 20)  // Max 20
multiplier = DIFFICULTY_MULTIPLIERS[level] ?? 1
score = floor((baseScore + consecutiveBonus) × multiplier)
```

**Examples:**
- Level 1, no streak: (10 + 0) × 1 = 10
- Level 1, 5 streak: (10 + 10) × 1 = 20
- Level 4, 5 streak: (10 + 10) × 2.5 = 50
- Level 4, 10+ streak: (10 + 20) × 2.5 = 75 (max per pop)

### Helper Functions

#### `generatePositions(count, margin, minDistance)`
Generates non-overlapping positions for bubbles.

**Parameters:**
- `count: number` - Number of positions needed
- `margin: number` - Margin from edges (percentage)
- `minDistance: number` - Minimum distance between positions

**Returns:** `{x: number, y: number}[]`

**Algorithm:**
1. Clamp margin and minDistance to safe values
2. For each position:
   - Attempt up to 100 times to find valid position
   - Random X, Y within margin bounds
   - Check distance against all existing positions
   - Add to list if valid

## Game Progression

### Round Structure
1. Bubbles appear with random positions
2. Player must tap 1, then 2, then 3, etc.
3. Correct taps update "next expected" number
4. Incorrect taps give feedback but don't reset progress
5. Round completes when all bubbles are popped

### Streak System
- Consecutive correct taps build streak
- Incorrect tap resets streak to 0
- Higher streak = more points per tap
- Maximum bonus capped at 20 points

### Level Completion
- Complete specified number of rounds
- Each round uses fresh bubble positions
- Time limit applies per level (not per round)

## Technical Notes

### Dependencies
- `shuffle()` utility from `src/utils/random`

### Test Coverage
- 45 tests covering:
  - Level configuration (4 levels, increasing range/time/rounds)
  - Difficulty multipliers (1× to 2.5×)
  - Bubble generation (correct count, positions, values)
  - Pop validation (correct, incorrect, edge cases)
  - Score calculation (base, streak, multipliers, caps)
  - Integration scenarios
  - Edge cases (empty arrays, invalid levels)

### Implementation Details
- Bubbles use percentage-based positioning (responsive)
- Position generation prevents overlaps
- Size is fixed at 70px
- IDs are sequential (0, 1, 2...)
- Values are shuffled (1 to numberRange in random order)
- `popped` state is managed externally (UI layer)

### Design Decisions
- Increasing number range builds numeracy skills
- Time limits create gentle pressure
- Streak bonuses reward accuracy
- Difficulty multipliers reward completing harder levels
- Non-overlapping positions prevent accidental mis-taps
