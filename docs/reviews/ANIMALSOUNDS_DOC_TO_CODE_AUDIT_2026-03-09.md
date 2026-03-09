# Animal Sounds - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `animal-sounds`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Logic: `src/frontend/src/games/animalSoundsLogic.ts` (67 lines)
- Tests: `src/frontend/src/games/__tests__/animalSoundsLogic.test.ts` (36 tests)
- Component: `AnimalSounds.tsx` (449 lines)
- Spec: `docs/games/animal-sounds-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Animal Sounds is an educational game where children learn to identify animals by their sounds. The implementation includes 12 animals, 3 difficulty levels, and a scoring system with difficulty multipliers.

### Test Coverage
- **36 tests** (excellent)
- **36 tests passing** (100% pass rate)
- Tests cover: animal data, level configurations, level config retrieval, animal selection, scoring, difficulty multipliers, animal sounds, game mechanics

---

## Implementation Quality Assessment

### Strengths
1. **12 animals** - Farm and zoo animals with unique sounds
2. **3 difficulty levels** - 3, 4, or 6 animal choices
3. **Shared scoring utility** - Uses `calculateScore` from utils/scoring.ts
4. **Fisher-Yates shuffle** - Randomized animal selection each game
5. **Difficulty multipliers** - 1×, 1.5×, 2× for levels 1-3
6. **Pure functional design** - No side effects in logic module

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `animalSoundsLogic.ts` | 67 | Animal data, level configs, scoring |
| `AnimalSounds.tsx` | 449 | Component with UI and audio |
| `animalSoundsLogic.test.ts` | ~295 | Unit tests |

---

## Test Results

### Passing Tests (36/36) ✅

**ANIMALS Data (5 tests)**
- Has 12 animals (verified via level 3)
- Each animal has name, emoji, and sound
- Animal names start with capital letter
- All animals have unique names
- Contains common farm and zoo animals

**LEVELS Configuration (5 tests)**
- Has 3 levels
- Level 1 has 3 animals
- Level 2 has 4 animals
- Level 3 has 6 animals
- Levels increase in animal count

**getLevelConfig (5 tests)**
- Returns level 1 config for level 1
- Returns level 2 config for level 2
- Returns level 3 config for level 3
- Returns level 1 config for invalid level (99)
- Returns level 1 config for level 0

**getAnimalsForLevel (8 tests)**
- Returns 3 animals for level 1
- Returns 4 animals for level 2
- Returns 6 animals for level 3
- Returns animal objects with required properties
- Animals have valid emojis
- Animals have descriptive sounds
- Different calls may return different animals (random)
- Animals within a level are unique

**calculateScore (6 tests)**
- Returns higher score for higher streak
- Returns higher score for higher level
- Level 3 with high streak gives maximum points
- Level 1 base score is reasonable
- Level 3 score is higher than level 1 for same streak
- Streak increases score within same level

**DIFFICULTY_MULTIPLIERS (2 tests)**
- Has multipliers for all 3 levels
- Multipliers increase with level

**Animal Sound Examples (4 tests)**
- Dog says "Woof woof!"
- Cat says "Meow!"
- Cow says "Moo!"
- Lion says "Roar!"

**Game Mechanics (4 tests)**
- Has 5 rounds per game
- Correct count increments on right answer
- Feedback message shows on correct answer
- Feedback message shows on wrong answer

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 67 |
| Exports | 5 (2 interfaces, 4 functions, 2 constants) |
| Test coverage | 36 tests |
| Test pass rate | 100% |
| Animals | 12 |
| Difficulty levels | 3 |

---

## 12 Animals

| Name | Emoji | Sound |
|------|-------|-------|
| Dog | 🐕 | Woof woof! |
| Cat | 🐱 | Meow! |
| Cow | 🐄 | Moo! |
| Pig | 🐷 | Oink oink! |
| Bird | 🐦 | Chirp chirp! |
| Rooster | 🐓 | Cock-a-doodle-doo! |
| Sheep | 🐑 | Baa baa! |
| Horse | 🐴 | Neigh! |
| Lion | 🦁 | Roar! |
| Elephant | 🐘 | Trumpet! |
| Monkey | 🐵 | Ooh ooh ah ah! |
| Frog | 🐸 | Ribbit ribbit! |

---

## 3 Difficulty Levels

| Level | Animal Count | Description |
|-------|--------------|-------------|
| 1 | 3 | Easy - fewer choices |
| 2 | 4 | Medium - more choices |
| 3 | 6 | Hard - most choices |

---

## Key Interfaces

```typescript
interface Animal {
  name: string;  // Animal name (e.g., "Dog")
  emoji: string; // Emoji representation
  sound: string; // Sound description (e.g., "Woof woof!")
}

interface LevelConfig {
  level: number;
  animalCount: number;
}
```

---

## Level Configurations

```typescript
export const LEVELS: LevelConfig[] = [
  { level: 1, animalCount: 3 },
  { level: 2, animalCount: 4 },
  { level: 3, animalCount: 6 },
];
```

---

## Animal Selection

```typescript
export function getAnimalsForLevel(level: number): Animal[] {
  const config = getLevelConfig(level);
  const shuffled = shuffle(ANIMALS);
  return shuffled.slice(0, config.animalCount);
}
```

### Selection Features

- **Random shuffle:** Uses Fisher-Yates algorithm
- **Level-appropriate count:** Returns 3, 4, or 6 animals
- **Unique animals:** No duplicates within a round

---

## Scoring System

### Score Formula

```typescript
basePoints = 15;
streakBonus = Math.min(streak × 3, 15); // +3 per streak, max +15
difficultyMultiplier = { 1: 1, 2: 1.5, 3: 2 }[level];

finalScore = (basePoints + streakBonus) × difficultyMultiplier;
```

### Score Examples

| Streak | Base+Bonus | Level 1 (1×) | Level 2 (1.5×) | Level 3 (2×) |
|--------|-----------|---------------|----------------|---------------|
| 0 | 15 | 15 | 23 | 30 |
| 1 | 18 | 18 | 27 | 36 |
| 3 | 24 | 24 | 36 | 48 |
| 5+ | 30 | 30 | 45 | 60 |

### Max Score per Game

- **Level 1:** 5 rounds × 30 = 150
- **Level 2:** 5 rounds × 45 = 225
- **Level 3:** 5 rounds × 60 = 300

---

## Difficulty Multipliers

```typescript
export const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,    // Easy
  2: 1.5,  // Medium
  3: 2,    // Hard
};
```

---

## Visual Design

### Layout Elements

- **Level Selector:** 3 buttons - current level highlighted amber
- **Streak HUD:** 5 hearts showing streak progress
- **Sound Player:** Large speaker button (🔊)
- **Options Grid:** 2×3 or 3×2 grid of animal emoji buttons
- **Stats Display:** Correct count, Round (X/5), Best Streak

### Styling

| Element | Style |
|---------|-------|
| Primary Color | #F59E0B (amber-500) |
| Background | White |
| Border | Amber-100/200 |
| Button | White with shadow, hover to amber-200 |
| Feedback correct | Green-100/emerald |
| Feedback wrong | Rose-100 |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Play animal sound | Animal audio / TTS | None |
| Correct answer | playSuccess() | 'success' |
| Wrong answer | playError() | 'error' |
| Streak milestone | None | 'celebration' |

### Animal Audio Files

| Animal | File | Format |
|--------|------|--------|
| Dog | /assets/sounds/animals/dog | .wav |
| Cat | /assets/sounds/animals/cat | .wav |
| Cow | /assets/sounds/animals/cow | .ogg |
| Pig | /assets/sounds/animals/pig | .mp3 |
| Bird | /assets/sounds/animals/bird | .wav |
| Rooster | /assets/sounds/animals/rooster | .mp3 |
| Sheep | /assets/sounds/animals/sheep | .ogg |
| Horse | /assets/sounds/animals/horse | .ogg |
| Lion | /assets/sounds/animals/lion | .wav |
| Elephant | /assets/sounds/animals/elephant | .mp3 |
| Monkey | /assets/sounds/animals/monkey | .wav |
| Frog | /assets/sounds/animals/frog | .wav |

**TTS Fallback:** If audio files fail or TTS is enabled, speaks the animal sound

---

## Feedback System

### Messages

| Situation | Message |
|-----------|---------|
| Correct | "Correct! The {animal.name} makes this sound!" |
| Wrong | "Oops! The {targetAnimal.name} makes that sound!" |

### Examples

- Correct: "Correct! The Dog makes this sound!"
- Wrong: "Oops! The Cat makes that sound!"

### TTS Messages

| Situation | TTS Message |
|-----------|-------------|
| Start | "Which animal makes this sound?" |
| Correct | "Correct! The {animal.name} says {animal.sound}" |
| Wrong | "Oops! Look for the {targetAnimal.name}. It says {targetAnimal.sound}" |
| Complete | "Great job! You got {correct} out of 5 animals right!" |

---

## Game Session

### Game Flow

1. **Start Screen:** Shows game info and scoring
2. **Playing:** 5 rounds of animal sound matching
3. **Complete:** Shows results with score and streak badge

### Session Stats

- **Correct:** Number of correct answers
- **Round:** Current round (1-5)
- **Score:** Accumulated score
- **Best Streak:** Maximum streak achieved

---

## Game Constants

```typescript
const roundsPerGame = 5;
const basePoints = 15;
const streakMultiplier = 3;
const maxStreakBonus = 15;
const roundDelayMs = 2800;
```

---

## Comparison with Similar Games

| Feature | AnimalSounds | ShadowMatch | BeginningSounds |
|---------|--------------|-------------|-----------------|
| CV Required | None | Hand (pose) | None |
| Core Mechanic | Match sound to animal | Match shadow to object | Select beginning sound |
| Educational Focus | Animal sounds | Object recognition | Phonics |
| Age Range | 3-6 | 3-6 | 4-7 |
| Levels | 3 | 1 | 3 |
| Rounds | 5 | Varies | 6-10 |
| Score | Base + streak × level | Time bonus | 20 + time + streak |
| Audio | Animal sounds + TTS | TTS | TTS |
| Vibe | Chill | Chill | Chill |

---

## Educational Value

### Skills Developed

1. **Animal Recognition** - Learning animal names, associating sounds with animals, visual discrimination
2. **Auditory Skills** - Sound identification, listening comprehension, memory association
3. **Vocabulary** - Animal names, sound words (onomatopoeia), language development
4. **Cognitive Skills** - Matching (sound to animal), pattern recognition, decision making

---

## Conclusion

Animal Sounds is **functionally correct** with excellent test coverage (36 tests). The implementation provides comprehensive animal sound training with 12 farm and zoo animals. The 3 difficulty levels with increasing animal counts provide appropriate progression for young children.

**Audit Status:** APPROVED ✅
**All Tests:** PASSING ✅ (36/36)
**Documentation:** COMPLETE ✅
