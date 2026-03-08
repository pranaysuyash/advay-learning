# Body Parts Game Specification

**Game ID:** `body-parts`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-6 years
**CV Requirements:** Hand tracking (pose) - optional

---

## Overview

Body Parts is an educational game where children learn to identify and name different body parts. The game displays a target body part name, and the child must select the correct emoji from a grid of options.

### Tagline
"Point to the body part! 🧘👆"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Target** - A body part name is displayed
2. **Select Part** - Child taps the matching emoji from the grid
3. **Get Feedback** - Immediate visual and audio feedback
4. **Next Round** - Game advances to next body part (5 rounds total)

### Controls

| Action | Input |
|--------|-------|
| Select answer | Tap/click emoji button |
| Change level | Click level button (1, 2, 3) |
| Play Again | Click "Play Again" button |
| Finish | Click "Finish" button |

---

## Body Parts

### 10 Body Parts

| Name | Emoji | Description |
|------|-------|-------------|
| Head | 🗣️ | Top of the body |
| Eyes | 👀 | See with them |
| Nose | 👃 | Smell with it |
| Mouth | 👄 | Eat and talk with it |
| Ears | 👂 | Hear with them |
| Hands | 👐 | Hold things with them |
| Fingers | 🫵 | Point and grab |
| Feet | 🦶 | Walk on them |
| Arms | 💪 | Wave and hug |
| Legs | 🦵 | Run and jump |

### Data Structure

```typescript
interface BodyPart {
  name: string;  // Body part name (e.g., "Head")
  emoji: string; // Emoji representation
}
```

---

## Difficulty Levels

### Three Levels

| Level | Parts | Description |
|-------|-------|-------------|
| 1 | 4 | Easy - common parts |
| 2 | 6 | Medium - more parts |
| 3 | 8 | Hard - all parts shown |

### Level Configuration

```typescript
const LEVELS: LevelConfig[] = [
  { level: 1, partCount: 4 },
  { level: 2, partCount: 6 },
  { level: 3, partCount: 8 },
];
```

---

## Scoring System

### Score Calculation

```typescript
basePoints = 15;  // per correct answer
streakBonus = Math.min(streak × 3, 15); // +3 per streak, max +15
levelMultiplier = DIFFICULTY_MULTIPLIERS[level]; // 1×, 1.5×, or 2×

finalScore = (basePoints + streakBonus) × levelMultiplier;
```

### Score Examples

| Streak | Base+Bonus | Level 1 (1×) | Level 2 (1.5×) | Level 3 (2×) |
|--------|-----------|---------------|----------------|---------------|
| 0 | 15 | 15 | 23 | 30 |
| 1 | 18 | 18 | 27 | 36 |
| 3 | 24 | 24 | 36 | 48 |
| 5 | 30 | 30 | 45 | 60 (max) |

### Max Score

- Level 1: 5 rounds × 30 = 150
- Level 2: 5 rounds × 45 = 225
- Level 3: 5 rounds × 60 = 300

---

## Round Generation

### Algorithm

```typescript
function getPartsForLevel(level: number): BodyPart[] {
  const config = getLevelConfig(level);

  // Shuffle all body parts
  const shuffled = shuffle(BODY_PARTS);

  // Return requested number of parts
  return shuffled.slice(0, config.partCount);
}
```

### Key Features

- **Random selection:** Parts are randomly shuffled each game
- **Level-appropriate count:** Returns 4, 6, or 8 parts based on level
- **Target selection:** Random target chosen from displayed parts

---

## Visual Design

### Layout

- **Level Selector:** 3 buttons - current level highlighted rose color
- **Streak HUD:** 5 hearts showing streak progress (2 points per heart)
- **Target Display:** Large text of body part name (5xl, rose color)
- **Options Grid:** 2×2 or 2×4 grid of emoji buttons (6xl)
- **Stats Display:** Correct count, Round (X/5), Best Streak

### Styling

| Element | Style |
|---------|-------|
| Primary Color | #F43F5E (rose/rose-500) |
| Background | White |
| Border | Rose-200 |
| Feedback correct | Green-100/emerald |
| Feedback wrong | Rose-100 |
| Button | White with shadow, hover to rose-50 |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Correct answer | playSuccess() | 'success' |
| Wrong answer | playError() | 'error' |
| Game complete | None | 'celebration' |
| Streak milestone | None | 'celebration' |

---

## Feedback System

### Messages

| Situation | Message |
|-----------|---------|
| Correct | "Correct! That's the {part.name}!" |
| Wrong | "Oops! That's the {part.name}." |

### Examples

- Correct: "Correct! That's the Head!"
- Wrong: "Oops! That's the Eyes."

---

## Game Session

### Game Flow

1. **Start Screen:** Shows game info and scoring
2. **Playing:** 5 rounds of body part identification
3. **Complete:** Shows results with score and streak badge

### Session Stats

- **Correct:** Number of correct answers
- **Round:** Current round (1-5)
- **Score:** Accumulated score
- **Best Streak:** Maximum streak achieved

---

## Progress Tracking

### useGameSessionProgress Integration

```typescript
useGameSessionProgress({
  gameName: 'Body Parts',
  score,
  level: currentLevel,
  isPlaying: gameState === 'playing',
  metaData: { correct, round },
});
```

### useGameDrops Integration

```typescript
const { onGameComplete } = useGameDrops('body-parts');

// On game completion
await onGameComplete(finalScore);
```

---

## Game Constants

```typescript
const roundsPerGame = 5;
const basePoints = 15;
const streakMultiplier = 3;
const maxStreakBonus = 15;
const difficultyMultipliers = { 1: 1, 2: 1.5, 3: 2 };
const roundDelayMs = 2000;
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `BodyParts.tsx` | 344 | Main component |
| `bodyPartsLogic.ts` | 63 | Game logic and data |
| `bodyPartsLogic.test.ts` | 130 | Unit tests |

### Architecture

- **Component** (`BodyParts.tsx`): UI, game flow, state management
- **Logic** (`bodyPartsLogic.ts`): Pure functions for level config and part selection
- **Tests** (`bodyPartsLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Body Awareness**
   - Identifying body parts
   - Learning body part names
   - Understanding body geography

2. **Visual Recognition**
   - Matching emojis to names
   - Visual discrimination
   - Symbol understanding

3. **Vocabulary**
   - Body part terminology
   - Word association
   - Language development

4. **Memory**
   - Recall body part names
   - Associative learning
   - Pattern recognition

---

## Comparison with Similar Games

| Feature | BodyParts | ShadowMatch | YogaAnimals |
|---------|-----------|-------------|-------------|
| CV Required | Hand (pose) - optional | Hand (pose) | Pose (full body) |
| Core Mechanic | Identify body part | Match shadow to object | Mimic pose |
| Educational Focus | Body part names | Object recognition | Body awareness |
| Age Range | 3-6 | 3-6 | 4-10 |
| Levels | 3 | 1 | 1 |
| Rounds | 5 | Varies | 10 poses |
| Score | Base + streak × level | Time bonus | Completion |
| Vibe | Chill | Chill | Chill |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
