# Spell Painter - Game Specification

## Overview
**Game ID**: `spell-painter`
**Educational Focus**: Letter recognition, spelling, fine motor skills
**Target Age**: 4-7 years
**Code Location**: `src/frontend/src/games/spellPainterLogic.ts`

## Game Description
Children paint letters by touching/moving over them to spell words. Each letter must be painted in order to complete the word.

## Educational Goals
1. Recognize uppercase letters
2. Learn common words (CVC words, then 4-letter words)
3. Practice letter sequence (spelling)
4. Develop fine motor control through painting motion

## Game Logic

### Interfaces

```typescript
interface SpellPainterLevel {
  id: number;
  word: string;
  difficulty: number;
}

interface LetterPosition {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  painted: boolean;
}
```

### Level Configuration

| Level | Word | Difficulty | Letters |
|-------|------|------------|---------|
| 1 | CAT | 1 | 3 |
| 2 | DOG | 1 | 3 |
| 3 | SUN | 1 | 3 |
| 4 | BAT | 2 | 3 |
| 5 | HAT | 2 | 3 |
| 6 | PIG | 2 | 3 |
| 7 | CUP | 2 | 3 |
| 8 | BUS | 3 | 4 |
| 9 | FROG | 3 | 4 |
| 10 | STAR | 3 | 4 |

### Word Progression
- **Difficulty 1**: CVC (consonant-vowel-consonant) 3-letter words
- **Difficulty 2**: Additional 3-letter words
- **Difficulty 3**: 4-letter words

### Core Functions

#### `generateLetterTargets(word: string, canvasWidth: number, canvasHeight: number): LetterPosition[]`
Creates letter positions for the given word.

**Layout**:
- Letters arranged horizontally
- Letter width = canvasWidth / word.length
- Letter height = letter width (square letters)
- Start Y = (canvasHeight - letterHeight) / 2 (vertically centered)
- X position = i × letterWidth + (letterWidth × 0.1) (10% margin)
- Width/Height = letterWidth × 0.8 (80% of slot, creating 10% margin on each side)

**Initial State**: All letters start with `painted: false`.

#### `checkLetterPainted(letter: LetterPosition, handX: number, handY: number, threshold: number = 0.1): boolean`
Checks if hand position is within the letter's paint area.

**Algorithm**:
1. Calculate letter center: (x + width/2, y + height/2)
2. Calculate relative distance from center
3. Normalize by letter dimensions
4. Return true if both relative distances < threshold

**Formula**:
```typescript
letterCenterX = letter.x + letter.width / 2
letterCenterY = letter.y + letter.height / 2
relX = |handX - letterCenterX| / letter.width
relY = |handY - letterCenterY| / letter.height
return relX < threshold && relY < threshold
```

Default threshold = 0.1 (10% of letter size).

#### `isLevelComplete(letters: LetterPosition[]): boolean`
Checks if all letters are painted.

**Returns**: `letters.every(l => l.painted)`

Returns true for empty array (trivially complete).

#### `calculateScore(letters: LetterPosition[], timeMs: number): number`
Calculates final score.

**Formula**: `(paintedCount × 100) + max(0, floor((60000 - timeMs) / 1000) × 5)`

**Components**:
- Base score: 100 points per painted letter
- Time bonus: 5 points per second remaining (max 60 seconds)

**Examples**:
| Painted | Time (ms) | Time Bonus | Score |
|---------|-----------|------------|-------|
| 3 | 0s | 300 | 600 |
| 3 | 30s | 150 | 450 |
| 3 | 60s | 0 | 300 |
| 4 | 20s | 200 | 600 |

## Game Progression

### Difficulty Scaling
- **Levels 1-3**: Simple CVC words (3 letters)
- **Levels 4-7**: More complex 3-letter words
- **Levels 8-10**: 4-letter words

### Word Selection
All words are age-appropriate and commonly taught to early readers:
- CVC pattern for decoding practice
- High-frequency words
- Progressive letter count

### Scoring Progression
- 3-letter words max: 600 points (all letters + instant)
- 4-letter words max: 700 points (all letters + instant)

## Technical Notes

### Coordinate System
- Letter positions use canvas coordinates (pixels)
- Canvas size passed to generateLetterTargets
- Calculations work with any aspect ratio

### Letter Dimensions
- Letters are always square (width = height)
- 10% margin on all sides
- Letters fill canvas width evenly

### Painting Detection
Uses relative distance from letter center, normalized by letter size.
This allows consistent behavior across different canvas sizes.

Default threshold of 0.1 means the hand must be within 10% of the letter's center.

### Edge Cases
- Zero canvas width/height: Creates zero-size letters (doesn't crash)
- Negative time: Treats as >60s (no bonus)
- Empty word: Creates empty array
- Single letter: Works correctly

### Design Decisions
- Centered letters for visual balance
- Square letters for consistent hit areas
- Relative threshold for responsive behavior
- Time bonus capped at 60 seconds
- Painted flag separate from position (state tracking)

## Visual Design Considerations

### Letter Display
- Large, clear uppercase letters
- Centered in their allocated space
- Visually distinct when painted vs unpainted

### Painting Feedback
- Visual change when letter is painted (color fill, highlight)
- Sound effect on paint completion
- Progress indicator (3/4 letters painted)

### Word Completion
- Celebration when all letters painted
- Word displayed clearly
- Transition to next level or completion screen

### Hand Tracking
- Visual indicator of hand position
- Trail or cursor showing paint path
- Highlight letter when in painting range
