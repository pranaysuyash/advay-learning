# Feed The Monster - Game Specification

## Overview
**Game ID**: `feed-the-monster`
**Educational Focus**: Emotions, empathy, categorization
**Target Age**: 3-6 years
**Code Location**: `src/frontend/src/games/feedTheMonsterLogic.ts`

## Game Description
A monster shows an emotion and the child must feed it the appropriate food. This teaches children to recognize emotions and associate foods/comfort items with different feelings.

## Educational Goals
1. Recognize and name emotions
2. Develop empathy skills
3. Practice categorization
4. Learn emotion-food associations

## Game Logic

### Interfaces

```typescript
interface FoodItem {
  id: number;
  emoji: string;
  name: string;
  category: 'happy' | 'sad' | 'angry' | 'excited' | 'calm';
}

interface MonsterEmotion {
  id: number;
  emotion: FoodItem['category'];
  emoji: string;
  prompt: string;
}

interface LevelConfig {
  level: number;
  optionsCount: number;
}
```

### Food Items (11 items)

| ID | Emoji | Name | Category |
|----|-------|------|----------|
| 1 | 🍕 | Pizza | happy |
| 2 | 🥕 | Carrot | happy |
| 3 | 🍦 | Ice Cream | happy |
| 4 | 😢 | Tissues | sad |
| 5 | 🧸 | Teddy Bear | sad |
| 6 | ☕ | Hot Cocoa | calm |
| 7 | 🍵 | Tea | calm |
| 8 | ⚡ | Energy Drink | excited |
| 9 | 🍬 | Candy | excited |
| 10 | 🌶️ | Hot Pepper | angry |
| 11 | 🍋 | Lemon | angry |

### Monster Emotions (5 emotions)

| ID | Emotion | Emoji | Prompt |
|----|---------|-------|--------|
| 1 | happy | 😄 | "Yummy!" |
| 2 | sad | 😢 | "I need comfort food..." |
| 3 | calm | 😌 | "So peaceful..." |
| 4 | excited | 🤩 | "Wow! So exciting!" |
| 5 | angry | 😠 | "Too spicy!" |

### Level Configuration

| Level | Options Count |
|-------|---------------|
| 1 | 3 |
| 2 | 4 |
| 3 | 5 |

### Core Functions

#### `getLevelConfig(level)`
Gets configuration for a level.

**Parameters:**
- `level: number`

**Returns:** `LevelConfig`

**Fallback:** Returns level 1 for invalid levels.

#### `getEmotionForLevel(level)`
Gets a random emotion appropriate for the level.

**Parameters:**
- `level: number`

**Returns:** `MonsterEmotion`

**Behavior:**
- Level 1: Uses first 3 emotions
- Level 2: Uses first 4 emotions
- Level 3: Uses all 5 emotions

#### `generateOptions(emotion, level)`
Generates food options including correct emotion foods.

**Parameters:**
- `emotion: FoodItem['category']` - Target emotion
- `level: number` - Level for option count

**Returns:** `FoodItem[]`

**Behavior:**
1. Selects one random matching food
2. Fills remaining slots with non-matching foods
3. Shuffles all options
4. Returns exactly `optionsCount` items

#### `checkAnswer(selectedFood, correctEmotion)`
Validates if food matches the required emotion.

**Parameters:**
- `selectedFood: FoodItem`
- `correctEmotion: FoodItem['category']`

**Returns:** `boolean`

#### `calculateScore(isCorrect, timeLeft, combo)`
Calculates score for a round.

**Parameters:**
- `isCorrect: boolean`
- `timeLeft: number` - Remaining time in seconds
- `combo: number` - Current streak

**Returns:** `number`

**Formula**: `isCorrect ? 100 + (timeLeft × 5) + (combo × 10) : 0`

## Game Progression

### Difficulty Scaling
- **Level 1**: 3 options (easiest - 33% chance)
- **Level 2**: 4 options (medium - 25% chance)
- **Level 3**: 5 options (hardest - 20% chance)

### Emotion Progression
- **Level 1**: Happy, Sad, Calm
- **Level 2**: + Excited
- **Level 3**: + Angry

### Scoring System
- Base: 100 points for correct answer
- Time bonus: +5 points per second remaining
- Combo bonus: +10 points per consecutive correct answer
- Wrong answer: 0 points (resets combo)

## Educational Notes

### Emotion-Food Associations
- **Happy**: Treats, healthy foods (pizza, carrots, ice cream)
- **Sad**: Comfort items (tissues, teddy bear)
- **Calm**: Warm drinks (hot cocoa, tea)
- **Excited**: Energy foods (energy drink, candy)
- **Angry**: Spicy/sour things (hot pepper, lemon)

### Learning Objectives
1. **Emotion recognition**: Identify monster's feeling
2. **Categorization**: Match items to emotions
3. **Empathy**: Understand what helps different emotions
4. **Vocabulary**: Learn emotion names and food names

## Technical Notes

### Test Coverage
- 61 tests covering:
  - Food items database
  - Monster emotions
  - Level configuration
  - Option generation
  - Answer validation
  - Score calculation
  - Integration scenarios
  - Educational content verification

### Implementation Details
- Pure functional design
- Shuffling uses simple `sort(() => Math.random() - 0.5)`
- Ensures at least one correct option per round
- Combo system rewards consecutive correct answers

### Design Decisions
- Emoji-based for visual appeal
- Child-friendly prompts for each emotion
- Progressive difficulty (more options)
- Time and combo bonuses encourage speed and accuracy
