# Blend Builder Game Specification

**Game ID:** `blend-builder`
**World:** Learning
**Vibe:** Chill
**Age Range:** 5-8 years
**CV Requirements:** None

---

## Overview

Blend Builder is an educational phonics game where children build words by blending onset (beginning sound) and rime (ending sound). The game displays the two parts and the child must type the complete word.

### Tagline
"Blend the sounds together to make a real word! 🔤✨"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Blend Parts** - Onset (first letter) and rime (last two letters) are displayed
2. **Read Hint** - A clue describes the word
3. **Type Word** - Child types the complete word
4. **Check Answer** - Submit to verify correctness
5. **Get Feedback** - See result with points
6. **Next Word** - Advance to next word (4-8 words depending on level)

### Controls

| Action | Input |
|--------|-------|
| Type answer | Keyboard input |
| Submit | Enter key or "Check" button |
| Next word | Auto-advance after 2 seconds |

---

## Word Bank

### Word Structure

```typescript
interface BlendWord {
  word: string;  // Complete word (e.g., "cat")
  onset: string; // First letter (e.g., "c")
  rime: string;  // Last two letters (e.g., "at")
  hint: string;  // Description clue (e.g., "A furry pet that says meow")
}
```

### 20 Blend Words

| Word | Onset | Rime | Hint |
|------|-------|------|------|
| cat | c | at | A furry pet that says meow |
| dog | d | og | A furry pet that barks |
| sun | s | un | It shines in the sky |
| hat | h | at | You wear it on your head |
| bat | b | at | It flies at night |
| map | m | ap | It shows you where to go |
| cup | c | up | You drink from it |
| bus | b | us | It takes kids to school |
| pig | p | ig | It says oink |
| big | b | ig | The opposite of small |
| red | r | ed | A color like apples |
| bed | b | ed | You sleep in it |
| hop | h | op | Like a rabbit! |
| top | t | op | Spins on your finger |
| hot | h | ot | The opposite of cold |
| pop | p | op | A sound bubbles make |
| run | r | un | Faster than walking |
| fun | f | un | What you have playing! |
| win | w | in | The opposite of lose |
| sit | s | it | The opposite of stand |

---

## Difficulty Levels

### Three Levels

| Level | Words | Description |
|-------|-------|-------------|
| 1 | 4 | Easy introduction |
| 2 | 6 | Moderate practice |
| 3 | 8 | Full challenge |

### Level Configuration

```typescript
const LEVELS: LevelConfig[] = [
  { level: 1, wordCount: 4 },
  { level: 2, wordCount: 6 },
  { level: 3, wordCount: 8 },
];
```

---

## Scoring System

### Score Calculation

```typescript
basePoints = 10;  // per correct answer
streakBonus = Math.min(streak × 2, 15); // +2 per streak, max +15
totalPoints = basePoints + streakBonus;
finalScore = sum(totalPoints for all correct answers);
```

### Score Examples

| Streak | Base | Bonus | Total |
|--------|------|-------|-------|
| 0 | 10 | 0 | 10 |
| 1 | 10 | 2 | 12 |
| 3 | 10 | 6 | 16 |
| 5 | 10 | 10 | 20 |
| 8+ | 10 | 15 | 25 (capped) |

### Max Score

- Level 1: 4 words × 25 max = 100
- Level 2: 6 words × 25 max = 150
- Level 3: 8 words × 25 max = 200

---

## Round Generation

### Algorithm

```typescript
function getWordsForLevel(level: number): BlendWord[] {
  const config = getLevelConfig(level);

  // Shuffle all words randomly
  const shuffled = [...BLEND_WORDS].sort(() => Math.random() - 0.5);

  // Return requested number of words
  return shuffled.slice(0, config.wordCount);
}
```

### Key Features

- **Random selection:** Words are randomly shuffled each game
- **Level-appropriate count:** Returns 4, 6, or 8 words based on level
- **No repeats within session:** Due to shuffle and slice

---

## Visual Design

### Layout

- **Level Selector:** 3 buttons (Level 1, Level 2, Level 3) - current level highlighted
- **Progress Bar:** Shows "Word X of Y" with visual fill
- **Blend Card:** Large display of onset + rime with colors
- **Input Field:** Text input for typing the word
- **Check Button:** Submits the answer
- **Feedback Area:** Shows result message
- **Stats Display:** Streak, Correct count, Score

### Styling

| Element | Style |
|---------|-------|
| Border | #F2CC8F (gold) |
| Background | White |
| Primary Color | #22C55E (green) |
| Onset Box | Purple (#7C3AED) |
| Rime Box | Blue (#3B82F6) |
| Feedback correct | Emerald (#10B981) |
| Feedback wrong | Red (#EF4444) |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Correct answer | playSuccess() | 'success' |
| Wrong answer | playError() | 'error' |
| Streak milestone (5, 10...) | playCelebration() | 'celebration' |
| Game complete (80%+) | playCelebration() | None |

---

## Feedback System

### Messages

| Situation | Message |
|-----------|---------|
| Correct | "✅ \"{word}\" — well done!" |
| Wrong | "❌ The word is \"{word}\"!" |

### Examples

- Correct: "✅ \"cat\" — well done!"
- Wrong: "❌ The word is \"cat\"!"

---

## Progress Tracking

### useGameSessionProgress Integration

```typescript
useGameSessionProgress({
  gameName: 'Blend Builder',
  score,
  level: currentLevel,
  isPlaying: gameState === 'playing',
  metaData: { correct, round },
});
```

### useGameDrops Integration

```typescript
const { onGameComplete } = useGameDrops('blend-builder');

// On game completion
await onGameComplete(correct);
```

---

## Game Constants

```typescript
const basePoints = 10;
const streakMultiplier = 2;
const maxStreakBonus = 15;
const roundDelayMs = 2000;
const successThreshold = 0.8; // 80% correct triggers celebration
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `BlendBuilder.tsx` | 322 | Main component |
| `blendBuilderLogic.ts` | 61 | Game logic and data |
| `blendBuilderLogic.test.ts` | 188 | Unit tests |

### Architecture

- **Component** (`BlendBuilder.tsx`): UI, game flow, state management
- **Logic** (`blendBuilderLogic.ts`): Pure functions for level config and word selection
- **Tests** (`blendBuilderLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Phonemic Awareness**
   - Blending onset and rime
   - Understanding word structure
   - Sound manipulation

2. **Spelling**
   - Word construction
   - Letter patterns
   - CVC (consonant-vowel-consonant) patterns

3. **Reading Readiness**
   - Word recognition
   - Pattern recognition
   - Vocabulary building

4. **Typing Skills**
   - Keyboard familiarity
   - Fine motor skills
   - Input accuracy

---

## Comparison with Similar Games

| Feature | BlendBuilder | BeginningSounds | EndingSounds |
|---------|--------------|-----------------|---------------|
| CV Required | None | None (voice fallback) | None |
| Core Mechanic | Type word from blend | Select beginning sound | Select ending sound |
| Educational Focus | Blending + Spelling | Beginning sounds | Ending sounds |
| Input Method | Keyboard | Multiple choice | Multiple choice |
| Word Bank | 20 words | 33 words | 10 words |
| Levels | 3 (4, 6, 8 words) | 3 (6, 8, 10 rounds) | 1 (8 rounds) |
| Score | 10 + streak | 20 + time + streak | 20 per correct |
| Age Range | 5-8 | 4-7 | 4-7 |
| Vibe | Chill | Chill | Chill |

---

## Game State

### States

| State | Description |
|-------|-------------|
| start | Menu showing level selection |
| playing | Active word blending |
| complete | Results summary |

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| currentLevel | number | Current level (1-3) |
| words | BlendWord[] | Words for current session |
| currentIndex | number | Current word index |
| round | number | Round number |
| score | number | Accumulated score |
| correct | number | Correct answers count |
| userAnswer | string | Current input |
| showResult | boolean | Whether answer was revealed |
| feedback | string | Current feedback message |
| gameState | 'start' | 'playing' | 'complete' | Current state |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
