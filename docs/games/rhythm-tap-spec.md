# Rhythm Tap - Game Specification

## Overview
**Game ID**: `rhythm-tap`
**Educational Focus**: Rhythm, pattern memory, timing, coordination
**Target Age**: 4-7 years
**Code Location**: `src/frontend/src/games/rhythmTapLogic.ts`

## Game Description
Children watch a rhythm pattern being played, then repeat it by tapping in time. This builds auditory memory, rhythm understanding, and hand-eye coordination.

## Educational Goals
1. Develop sense of rhythm and timing
2. Practice pattern memory
3. Improve hand-eye coordination
4. Build musical awareness

## Game Logic

### Interfaces

```typescript
interface RhythmPattern {
  notes: number[];  // Array of 0 (rest) and 1 (tap)
  bpm: number;      // Tempo for playback
}

interface LevelConfig {
  level: number;
  patternLength: number;
  bpm: number;
}
```

### Level Configuration

| Level | Pattern Length | BPM |
|-------|---------------|-----|
| 1 | 3 notes | 120 |
| 2 | 4 notes | 140 |
| 3 | 5 notes | 160 |

### Core Functions

#### `getLevelConfig(level)`
Gets configuration for a level.

**Parameters:**
- `level: number` - Level number (1-3)

**Returns:** `LevelConfig`

**Fallback:** Returns level 1 config for invalid levels.

#### `createPattern(level)`
Generates a new rhythm pattern for a level.

**Parameters:**
- `level: number` - Level number

**Returns:** `RhythmPattern`

**Behavior:**
1. Gets level config
2. Generates array of 0s and 1s of specified length
3. Each note has 50% chance of being 0 or 1
4. Returns pattern with level's BPM

#### `checkPattern(userInput, correctPattern)`
Validates if user's pattern matches the correct pattern.

**Parameters:**
- `userInput: number[]` - User's taps
- `correctPattern: number[]` - Target pattern

**Returns:** `boolean`

**Validation Rules:**
- Arrays must be same length
- All values must match exactly
- Order matters

## Game Progression

### Difficulty Scaling
- **Pattern Length**: Increases from 3 to 5 notes
- **Tempo**: Increases from 120 to 160 BPM
- **Combined Difficulty**: Both length and speed increase

### Progression Math
| Level | Length × BPM | Relative Difficulty |
|-------|--------------|---------------------|
| 1 | 360 | Baseline |
| 2 | 560 | +56% harder |
| 3 | 800 | +122% harder |

### Pattern Generation
- Each note is independently random
- 50% chance of tap (1) or rest (0)
- Patterns can be all rests or all taps (rare but possible)
- No guaranteed minimum taps per pattern

## Technical Notes

### Test Coverage
- 36 tests covering:
  - Level configuration
  - Pattern generation
  - Pattern validation
  - Edge cases (empty, single note, long patterns)
  - Integration scenarios
  - Progression design

### Implementation Details
- Pure functional design
- Simple random generation (0 or 1)
- No audio in logic layer (UI responsibility)
- BPM provided for audio playback timing

### Helper Functions

#### `generatePattern(length)`
Internal function for pattern generation.

**Parameters:**
- `length: number` - Number of notes

**Returns:** `number[]`

**Algorithm:**
```typescript
Array.from({ length }, () => Math.random() > 0.5 ? 1 : 0)
```

### Design Decisions
- Binary pattern representation (0 or 1)
- BPM increases with difficulty (faster tempo)
- Pattern length increases (more to remember)
- No scoring in logic layer (UI responsibility)

## Audio Considerations

UI Layer Should Handle:
1. Play pattern at specified BPM
2. Visual feedback during playback
3. Metronome or count-in before pattern starts
4. Distinct sounds for tap vs rest
5. Success/failure audio feedback

### Timing Calculations
- BPM = beats per minute
- Beat duration = 60000 / BPM ms
- At 120 BPM: 500ms per beat
- At 140 BPM: ~429ms per beat
- At 160 BPM: 375ms per beat
