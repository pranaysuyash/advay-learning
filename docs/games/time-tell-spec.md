# Time Tell - Game Specification

## Overview
**Game ID**: `time-tell`
**Educational Focus**: Telling time, clock reading, number recognition
**Target Age**: 5-8 years
**Code Location**: `src/frontend/src/games/timeTellLogic.ts`

## Game Description
Children learn to read clocks by identifying times displayed on analog or digital clocks. The game progresses from simple o'clock times to quarter hours.

## Educational Goals
1. Read analog clock faces
2. Read digital clock displays
3. Understand time vocabulary (o'clock, quarter past, half past, quarter to)
4. Recognize hours (1-12) and minutes

## Game Logic

### Interfaces

```typescript
interface TimeQuestion {
  hour: number;      // 1-12
  minute: number;    // 0, 15, 30, or 45
  isDigital: boolean; // Whether to display as digital
}

interface LevelConfig {
  level: number;
  includeHalf: boolean;  // Include quarter hours
}
```

### Level Configuration

| Level | includeHalf | Time Options |
|-------|-------------|--------------|
| 1 | false | O'clock only (minutes = 0) |
| 2 | true | O'clock, quarter past, half past, quarter to |
| 3 | true | O'clock, quarter past, half past, quarter to |

### Core Functions

#### `getLevelConfig(level: number): LevelConfig`
Gets configuration for a level.

**Fallback**: Returns level 1 config for invalid levels.

#### `generateTime(level: number): TimeQuestion`
Generates a random time question.

**Behavior**:
- Random hour: 1-12 (Math.floor(Math.random() * 12) + 1)
- Minutes: 0 for level 1
- Minutes: random from [0, 15, 30, 45] for levels 2-3
- isDigital: randomly assigned (50% chance)

#### `formatTime(hour: number, minute: number): string`
Formats time in natural language.

**Formats**:
| Minutes | Format |
|---------|--------|
| 0 | `{hour} o'clock` |
| 15 | `quarter past {hour}` |
| 30 | `half past {hour}` |
| 45 | `quarter to {(hour % 12) + 1}` |
| Other | `{hour}:{minute}` (padded) |

**Examples**:
- formatTime(3, 0) = "3 o'clock"
- formatTime(3, 15) = "quarter past 3"
- formatTime(3, 30) = "half past 3"
- formatTime(3, 45) = "quarter to 4"
- formatTime(3, 7) = "3:07"

## Game Progression

### Difficulty Progression
- **Level 1**: Only o'clock times (easiest)
- **Level 2**: Adds quarter hours (medium)
- **Level 3**: Quarter hours (harder due to variety)

### Time Vocabulary
The game teaches important time terms:
- **o'clock**: Exact hour (minutes = 0)
- **quarter past**: 15 minutes after the hour
- **half past**: 30 minutes after the hour
- **quarter to**: 15 minutes before the next hour

### Clock Reading Skills
**Hour Recognition**:
- Numbers 1-12 on clock face
- Short hand points to hour
- Long hand points to minutes

**Minute Recognition**:
- Level 1: Short hand points directly at number
- Level 2-3: Short hand between numbers
- Quarter positions (15, 30, 45 minutes)

## Technical Notes

### Hour Generation
- Random: `Math.floor(Math.random() * 12) + 1`
- Range: 1-12 inclusive
- All hours equally likely

### Minute Options
- Level 1: Always 0
- Level 2-3: One of [0, 15, 30, 45]

### Display Format
- isDigital randomly toggles between true/false
- Allows practicing both analog and digital reading
- 50/50 distribution over many questions

### Quarter To Handling
For 45 minutes, the "next hour" wraps:
- 11:45 → "quarter to 12"
- 12:45 → "quarter to 1"

Uses modulo arithmetic: `(hour % 12) + 1`

### Edge Cases
- Division by zero prevented (always 4+ quarter options)
- Invalid levels fall back to level 1
- Hour wrapping handled correctly (12 → 1)

### Time Formatting
- Single-digit minutes are zero-padded
- Uses "o'clock" spelling with apostrophe
- No leading zeros for hours

## Design Decisions

### Progressive Difficulty
- Level 1 builds confidence with o'clock only
- Levels 2-3 introduce quarter hours gradually
- No level has 5-minute increments (too advanced)

### 12-Hour Clock
- Uses 12-hour format (not 24-hour)
- Hours 1-12 (not 0-23)
- Teaches AM/PM concepts separately

### Digital/Analog Toggle
- Randomly mixes both formats
- Prevents bias toward one format
- Ensures well-rounded learning

### Natural Language
- Uses common time expressions
- "o'clock" is standard terminology
- "quarter past/to" teaches relative time

## Educational Design

### Learning Sequence
1. Learn o'clock (exact hours)
2. Learn half past (30 minutes)
3. Learn quarter past (15 minutes after)
4. Learn quarter to (15 minutes before)

### CVC Words Connection
Level 1 words mirror CVC pattern in reading:
- CAT (consonant-vowel-consonant)
- Time reading follows similar pattern

### Visual Aids
- Analog clock face with numbers 1-12
- Different hand lengths (hour vs minute)
- Color coding for learning support
