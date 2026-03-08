# Animal Sounds Game Specification

**Game ID:** `animal-sounds`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-6 years
**CV Requirements:** None

---

## Overview

Animal Sounds is an educational game where children learn to identify animals by their sounds. The game plays an animal sound, and the child must select the correct animal from a grid of options.

### Tagline
"Which animal makes this sound? 🐾🔊"

---

## Game Mechanics

### Core Gameplay Loop

1. **Hear Sound** - Click the speaker button to play the animal sound
2. **Select Animal** - Child taps the matching animal emoji
3. **Get Feedback** - Immediate visual and audio feedback
4. **Next Round** - Game advances to next animal (5 rounds total)

### Controls

| Action | Input |
|--------|-------|
| Play sound | Tap/click speaker button (🔊) |
| Select answer | Tap/click animal button |
| Change level | Click level button (1, 2, 3) |
| Play Again | Click "Play Again" button |
| Finish | Click "Finish" button |

---

## Animals

### 12 Animals

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

### Data Structure

```typescript
interface Animal {
  name: string;  // Animal name (e.g., "Dog")
  emoji: string; // Emoji representation
  sound: string; // Sound description (e.g., "Woof woof!")
}
```

---

## Difficulty Levels

### Three Levels

| Level | Animals | Description |
|-------|---------|-------------|
| 1 | 3 | Easy - fewer choices |
| 2 | 4 | Medium - more choices |
| 3 | 6 | Hard - most choices |

### Level Configuration

```typescript
const LEVELS: LevelConfig[] = [
  { level: 1, animalCount: 3 },
  { level: 2, animalCount: 4 },
  { level: 3, animalCount: 6 },
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
function getAnimalsForLevel(level: number): Animal[] {
  const config = getLevelConfig(level);

  // Shuffle all animals
  const shuffled = shuffle(ANIMALS);

  // Return requested number of animals
  return shuffled.slice(0, config.animalCount);
}
```

### Key Features

- **Random selection:** Animals are randomly shuffled each game
- **Level-appropriate count:** Returns 3, 4, or 6 animals based on level
- **Target selection:** Random target chosen from displayed animals each round

---

## Visual Design

### Layout

- **Level Selector:** 3 buttons - current level highlighted amber color
- **Streak HUD:** 5 hearts showing streak progress (2 points per heart)
- **Sound Player:** Large speaker button (🔊) to play the animal sound
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
| Play animal sound | Animal audio file / TTS | None |
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

## Progress Tracking

### useGameSessionProgress Integration

```typescript
useGameSessionProgress({
  gameName: 'Animal Sounds',
  score,
  level: currentLevel,
  isPlaying: true,
  metaData: { correct, round },
});
```

---

## Game Constants

```typescript
const roundsPerGame = 5;
const basePoints = 15;
const streakMultiplier = 3;
const maxStreakBonus = 15;
const difficultyMultipliers = { 1: 1, 2: 1.5, 3: 2 };
const roundDelayMs = 2800;
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `AnimalSounds.tsx` | 449 | Main component |
| `animalSoundsLogic.ts` | 67 | Game logic and data |
| `animalSoundsLogic.test.ts` | 267 | Unit tests (39 tests) |

### Architecture

- **Component** (`AnimalSounds.tsx`): UI, game flow, state management
- **Logic** (`animalSoundsLogic.ts`): Pure functions for level config and animal selection
- **Tests** (`animalSoundsLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Animal Recognition**
   - Learning animal names
   - Associating sounds with animals
   - Visual discrimination (emojis)

2. **Auditory Skills**
   - Sound identification
   - Listening comprehension
   - Memory association

3. **Vocabulary**
   - Animal names
   - Sound words (onomatopoeia)
   - Language development

4. **Cognitive Skills**
   - Matching (sound to animal)
   - Pattern recognition
   - Decision making

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

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
