# Word Search - Game Specification

## Overview
**Game ID**: `word-search`
**Educational Focus**: Word recognition, spelling, visual scanning, pattern recognition
**Target Age**: 5-8 years
**Code Location**: `src/frontend/src/games/wordSearchLogic.ts`

## Game Description
Children find hidden words in a grid of letters. Words are placed horizontally, vertically, and diagonally. This builds visual scanning skills and reinforces spelling.

## Educational Goals
1. Visual scanning and pattern recognition
2. Spelling reinforcement
3. Word recognition
4. Attention and focus
5. Letter sequencing

## Game Logic

### Interfaces

```typescript
interface WordSearchConfig {
  gridSize: number;    // Size of grid (e.g., 8 for 8x8)
  words: string[];     // Array of words to find
}

interface LevelConfig {
  level: number;       // Level number (1-3)
  gridSize: number;    // Grid dimension (8, 10, or 12)
  wordCount: number;   // Number of words to place
}
```

### Word Lists (3 levels)

| Level | Words | Notes |
|-------|-------|-------|
| 1 | CAT, DOG, SUN, HAT, BAT, PIG, CUP, BUS | 3-letter words, common |
| 2 | FROG, FISH, BEAR, DUCK, LION, MOON, STAR, TREE | 4-letter words, animals/nature |
| 3 | APPLE, HOUSE, MOUSE, WATER, BREAD, GRAPE, TIGER, ZEBRA | 5-letter words, vocabulary |

### Level Configuration

| Level | Grid Size | Word Count | Total Cells | Words/Cells Ratio |
|-------|-----------|------------|-------------|-------------------|
| 1 | 8×8 | 3 words | 64 | ~4.7% |
| 2 | 10×10 | 4 words | 100 | ~4% |
| 3 | 12×12 | 5 words | 144 | ~3.5% |

### Word Placement Directions
Four directions used:
1. **Horizontal** → [0, 1] (left to right)
2. **Vertical** → [1, 0] (top to bottom)
3. **Diagonal down-right** → [1, 1]
4. **Diagonal up-right** → [-1, 1]

### Core Functions

#### `getLevelConfig(level: number): LevelConfig`
Gets configuration for a level.

**Fallback**: Returns level 1 config for invalid levels.

#### `generateWordSearch(level: number): {grid: string[][], words: string[]}`
Generates a word search puzzle.

**Behavior**:
1. Gets level config (gridSize, wordCount)
2. Creates empty N×N grid filled with empty strings
3. Selects `wordCount` words from WORD_LISTS[level]
4. Attempts to place each word using `placeWord()`
5. Fills remaining empty cells with random letters
6. Returns {grid, words}

**Note**: Word placement may fail silently. The algorithm attempts 100 times per word but doesn't report failures.

### Placement Algorithm (`placeWord` internal function)

```typescript
function placeWord(grid: string[][], word: string): boolean
```

**Process**:
1. Randomly select one of 4 directions
2. Calculate valid position range for that direction
3. Pick random starting position within valid range
4. Check if word fits (no conflicts)
5. If fits, place letters; if not, retry up to 100 times
6. Returns `true` if placed, `false` if failed

**Boundary Checking**:
- Accounts for word length in each direction
- Prevents out-of-bounds access
- Validates cell exists before checking/placing

**Placement Rules**:
- Empty cell ('') → Can place
- Matching letter → Can place (words can overlap)
- Different letter → Cannot place

## Game Progression

### Difficulty Progression

| Dimension | Level 1 | Level 2 | Level 3 |
|-----------|---------|---------|---------|
| Grid Size | 8×8 (64 cells) | 10×10 (100 cells) | 12×12 (144 cells) |
| Word Count | 3 words | 4 words | 5 words |
| Word Length | 3 letters | 4 letters | 5 letters |
| Visual Search Area | Small | Medium | Large |

### Visual Search Challenge
- **Level 1**: 64 cells, 3 words - Easier to scan
- **Level 2**: 100 cells, 4 words - Moderate challenge
- **Level 3**: 144 cells, 5 words - Most challenging

### Word Difficulty
- **Level 1**: 3-letter words (CAT, DOG, SUN)
- **Level 2**: 4-letter words (FROG, FISH, BEAR)
- **Level 3**: 5-letter words (APPLE, HOUSE, MOUSE)

## Technical Notes

### Grid Creation
```typescript
const grid: string[][] = [];
for (let i = 0; i < config.gridSize; i++) {
  grid.push(Array(config.gridSize).fill(''));
}
```
Explicit loop avoids TypeScript type inference issues with `Array.fill(null).map()`.

### Boundary Calculation
For each direction [dx, dy]:
```typescript
const minX = dx === -1 ? word.length - 1 : 0;
const maxX = dx === 1 ? size - word.length : size - 1;
const minY = dy === -1 ? word.length - 1 : 0;
const maxY = dy === 1 ? size - word.length : size - 1;
```

This ensures words stay within grid bounds for all four directions.

### Filler Letters
```typescript
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
for (let i = 0; i < config.gridSize; i++) {
  for (let j = 0; j < config.gridSize; j++) {
    if (grid[i][j] === '') {
      grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
    }
  }
}
```
All empty cells filled with random uppercase letters.

### Placement Retry Logic
```typescript
for (let attempts = 0; attempts < 100; attempts++) {
  // Try to place word
}
```
If placement fails after 100 attempts, word is not placed but function continues silently.

### Word List Fallback
```typescript
const words = WORD_LISTS[level]?.slice(0, config.wordCount)
  || WORD_LISTS[1].slice(0, 3);
```
Invalid level falls back to level 1 word list.

## Design Decisions

### Four Directions
Not all 8 directions used:
- No reverse (right-to-left, bottom-to-top)
- Simplifies for children
- Reduces confusion
- Still provides scanning challenge

### Progressive Grid Sizes
- 8×8 → 10×10 → 12×12
- +56% cells from L1 to L2
- +44% cells from L2 to L3
- Gradual difficulty increase

### Increasing Word Length
- 3 letters → 4 letters → 5 letters
- Age-appropriate spelling
- Vocabulary building
- Matches grid complexity

### Silent Placement Failure
- Words may not be placed if grid too crowded
- No error reporting
- Trade-off: simplicity vs. correctness
- Acceptable for educational game

## Educational Design

### Visual Scanning Skills
- **Horizontal scanning**: Left to right reading
- **Vertical scanning**: Top to bottom pattern
- **Diagonal scanning**: Advanced pattern recognition
- **Peripheral awareness**: Seeing beyond focus point

### Spelling Reinforcement
- Finding word in grid reinforces spelling
- Letter sequence recognition
- Pattern matching
- Word shape recognition

### Cognitive Skills
- **Sustained attention**: Scanning entire grid
- **Working memory**: Remembering target words
- **Visual discrimination**: Distinguishing letters
- **Pattern recognition**: Word hiding among letters

### Age Appropriateness
| Age | Recommended Level |
|-----|-------------------|
| 5-6 | Level 1 (8×8, 3-letter words) |
| 6-7 | Level 2 (10×10, 4-letter words) |
| 7-8 | Level 3 (12×12, 5-letter words) |

## Extension Possibilities

### Additional Features
- **Word highlighting**: Show first letter as hint
- **Timer**: Add time pressure for challenge
- **Word list display**: Show words to find (vs. from memory)
- **Reverse words**: Add backward directions for harder levels

### Custom Word Lists
- Themed lists (animals, colors, food)
- Custom words for specific lessons
- Sight words practice
- Spelling word lists

### Difficulty Options
- Word rotation (all 8 directions)
- Overlapping words allowed/disallowed
- Grid density (more/fewer filler letters)

## Known Limitations

### Silent Placement Failures
Words may not be placed if:
- Grid is too crowded
- Random placement never finds valid spot
- All 100 attempts fail

This is documented behavior, not a bug. The game still functions as the grid is always filled with letters.

### No Reverse Directions
Words only placed in these directions:
- Left → Right
- Top → Bottom
- Diagonal down-right
- Diagonal up-right

Words never placed backward, simplifying for young children.

## Testing Notes

### Deterministic Testing
Challenging due to:
- Multiple random sources (direction, position, filler letters)
- Placement algorithm has retry logic
- No RNG injection capability

### Test Strategy
- Test level config retrieval
- Test grid dimensions
- Test word count
- Test cell contents (letters only)
- Test grid is fully filled
- Test variety across multiple runs

### Edge Cases
- Invalid level → Falls back to level 1
- Negative level → Falls back to level 1
- Zero level → Falls back to level 1
- Empty word list → Falls back to level 1
