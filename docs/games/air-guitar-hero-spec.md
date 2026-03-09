# Air Guitar Hero - Game Specification

## Overview
**Game ID**: `air-guitar-hero`
**Educational Focus**: Rhythm, timing, gross motor skills
**Target Age**: 5-10 years
**Code Location**: `src/frontend/src/games/airGuitarHeroLogic.ts`

## Game Description
Children make guitar gestures (strumming) to play rockstar melodies. The game uses pose detection to recognize when the child strums the correct guitar string.

## Educational Goals
1. Develop rhythm and timing skills
2. Practice gross motor coordination (arm movements)
3. Build musical awareness and appreciation
4. Enhance listening skills (matching note patterns)

## Game Logic

### Interfaces

```typescript
interface GuitarNote {
  id: string;
  name: string;         // Note name (e.g., "E2", "A2")
  fret: number;         // Fret position (0, 1, etc.)
  string: number;       // Guitar string (1-6, 1 is highest)
  color: string;        // Display color
}

interface LevelConfig {
  level: number;
  notesToPlay: number;  // Number of notes in sequence
  timeLimit: number;    // Seconds to complete
  difficulty: 'easy' | 'medium' | 'hard';
}
```

### Guitar Notes

| ID | Name | Fret | String | Color |
|----|------|------|--------|-------|
| e2 | E2 | 0 | 6 | #FF6B6B |
| a2 | A2 | 0 | 5 | #4ECDC4 |
| d3 | D3 | 0 | 4 | #45B7D1 |
| g3 | G3 | 0 | 3 | #96CEB4 |
| b3 | B3 | 0 | 2 | #FFEAA7 |
| e4 | E4 | 0 | 1 | #DDA0DD |
| f3 | F3 | 1 | 6 | #FF6B6B |
| c3 | C3 | 1 | 5 | #4ECDC4 |
| g3f1 | G3 | 1 | 3 | #96CEB4 |

### Level Configuration

| Level | Notes to Play | Time Limit | Difficulty |
|-------|---------------|------------|------------|
| 1 | 8 | 30s | Easy |
| 2 | 12 | 25s | Medium |
| 3 | 16 | 20s | Hard |

### Difficulty Multipliers

| Difficulty | Multiplier |
|------------|------------|
| Easy | 1x |
| Medium | 1.5x |
| Hard | 2x |

### Core Functions

#### `calculateScore(streak: number, difficulty: 'easy' | 'medium' | 'hard'): number`
Calculates score for hitting a note.

**Formula**: `floor((10 + min(streak × 2, 20)) × difficultyMultiplier)`

**Scoring Breakdown**:
- Base score: 10 points
- Streak bonus: 2 points per streak (max 20)
- Multiplier applies to total

**Examples**:
| Streak | Easy | Medium | Hard |
|--------|------|--------|------|
| 0 | 10 | 15 | 20 |
| 5 | 20 | 30 | 40 |
| 10+ | 30 | 45 | 60 |

#### `getLevelConfig(level: number): LevelConfig`
Gets configuration for a level.

**Fallback**: Returns level 1 config for invalid levels.

#### `generateNoteSequence(count: number): GuitarNote[]`
Generates a random sequence of guitar notes.

**Behavior**:
- Creates `count` notes
- Each note randomly selected from NOTES array
- Notes can repeat (not unique)

#### `playNoteSound(note: GuitarNote): void`
Speaks the note name using speech synthesis.

**Behavior**:
- Uses `speechSynthesis.speak()`
- Rate: 2 (fast)
- Pitch: 1 (normal)
- No effect if speech synthesis unavailable

## Game Progression

### Difficulty Scaling
- **Level 1 (Easy)**: 8 notes, 30 seconds, 1x multiplier
- **Level 2 (Medium)**: 12 notes, 25 seconds, 1.5x multiplier
- **Level 3 (Hard)**: 16 notes, 20 seconds, 2x multiplier

### Scoring System
The game rewards both accuracy and consistency:
- **Base points**: 10 per note
- **Streak bonus**: Up to 20 extra points for consecutive hits
- **Difficulty multiplier**: Multiplies total (1x, 1.5x, 2x)

**Maximum per note**: 60 points (hard difficulty with 10+ streak)

### Note Recognition
The game uses pose detection to recognize guitar gestures:
- Different fret/string combinations create different notes
- Color coding helps children identify which note to play
- Visual + audio feedback reinforces learning

## Technical Notes

### Speech Synthesis
- Uses Web Speech API for audio feedback
- Speaks note names when played
- Fast speech rate (2x) for quick gameplay

### Random Generation
- Note sequences are randomly generated
- Notes can repeat within a sequence
- Each playthrough is different

### Edge Cases
- Invalid level falls back to level 1
- Unknown difficulty defaults to easy multiplier (1x)
- Speech synthesis unavailability handled gracefully

## Design Decisions

### Guitar Note Layout
- Uses standard guitar tuning (E-A-D-G-B-E)
- 9 notes across 6 strings and 2 frets
- Color coding for visual clarity

### Difficulty Progression
- More notes require longer focus
- Less time requires faster response
- Multiplier rewards skilled players

### Streak System
- Encourages consistent performance
- Rewards build up over consecutive hits
- Reset on miss creates risk/reward
