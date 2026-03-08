# Beginning Sounds Game Specification

**Game ID:** `beginning-sounds`
**World:** Learning
**Vibe:** Chill
**Age Range:** 4-7 years
**CV Requirements:** None (with voice fallback support)

---

## Overview

Beginning Sounds is an educational phonics game where children identify the beginning sound of a word. The game displays a word with an emoji and audio, and the child selects the matching beginning letter from multiple choices.

### Tagline
"What sound does this word start with? 🔊📝"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Word** - A word is displayed with an emoji illustration
2. **Hear Word** - TTS speaks the word aloud
3. **Select Letter** - Child taps the beginning sound letter
4. **Get Feedback** - Immediate visual and audio feedback
5. **Next Round** - Advance to next word (6-10 rounds depending on level)

### Controls

| Action | Input |
|--------|-------|
| Select answer | Tap/click letter button |
| Hear word | Click "🔊 Hear Word" button |
| Change level | Click level button (1, 2, 3) |
| Restart | Click "Play Again" button |
| Finish | Click "Finish" button |

### Voice Fallback

When enabled via `controls.voiceFallbackV1` feature flag:
- Dwelling on a letter option for 80ms triggers selection
- Visual cursor shows hand tracking position
- Tap still works as fallback

---

## Difficulty Levels

### Three Levels

| Level | Rounds | Options | Time per Round | Pass Threshold | Description |
|-------|--------|---------|----------------|----------------|-------------|
| 1 | 6 | 3 | 20s | 4 correct | Easy - Common words, clear sounds |
| 2 | 8 | 4 | 15s | 6 correct | Medium - More complex or similar sounds |
| 3 | 10 | 4 | 12s | 8 correct | Hard - Blends and tricky sounds |

### Level Progression

```typescript
const LEVELS: LevelConfig[] = [
  { level: 1, roundCount: 6, timePerRound: 20, optionCount: 3, passThreshold: 4 },
  { level: 2, roundCount: 8, timePerRound: 15, optionCount: 4, passThreshold: 6 },
  { level: 3, roundCount: 10, timePerRound: 12, optionCount: 4, passThreshold: 8 },
];
```

---

## Word Bank

### Word Structure

```typescript
interface WordItem {
  word: string;        // Display word (e.g., "Apple")
  emoji: string;       // Emoji illustration (e.g., "🍎")
  firstSound: string;  // Phonetic sound (e.g., "ah")
  firstLetter: string; // Uppercase letter (e.g., "A")
  difficulty: 1 | 2 | 3; // Difficulty level
}
```

### Level 1 Words (Easy)

| Word | Emoji | Sound | Letter |
|------|-------|-------|--------|
| Apple | 🍎 | ah | A |
| Ball | 🏐 | buh | B |
| Cat | 🐱 | kuh | C |
| Dog | 🐕 | duh | D |
| Elephant | 🐘 | eh | E |
| Fish | 🐟 | fuh | F |
| Goat | 🐐 | guh | G |
| Hat | 🎩 | huh | H |
| Ice cream | 🍦 | ih | I |
| Jam | 🫙 | juh | J |
| Kite | 🪁 | kuh | K |
| Lion | 🦁 | luh | L |
| Moon | 🌙 | muh | M |
| Nest | 🪺 | nuh | N |
| Octopus | 🐙 | oh | O |
| Pig | 🐷 | puh | P |
| Rain | 🌧️ | ruh | R |
| Sun | ☀️ | suh | S |
| Tree | 🌳 | tuh | T |
| Umbrella | ☂️ | uh | U |

### Level 2 Words (Medium)

| Word | Emoji | Sound | Letter |
|------|-------|-------|--------|
| Van | 🚐 | vuh | V |
| Water | 💧 | wuh | W |
| Box | 📦 | ks | X |
| Zoo | 🦓 | zuh | Z |
| Queen | 👑 | kwuh | Q |
| Yellow | 🟡 | yuh | Y |
| Bus | 🚌 | buh | B |
| Bed | 🛏️ | buh | B |
| Cup | 🥤 | kuh | C |
| Duck | 🦆 | duh | D |
| Flag | 🏴 | fluh | F |
| Grapes | 🍇 | gruh | G |

### Level 3 Words (Hard - Blends)

| Word | Emoji | Sound | Letter |
|------|-------|-------|--------|
| Spider | 🕷️ | suh | S |
| Star | ⭐ | stuh | S |
| Clock | 🕐 | kluh | C |
| Snow | ❄️ | snuh | S |
| Plant | 🌱 | pluh | P |
| Truck | 🚚 | truh | T |
| Flower | 🌸 | fluh | F |
| Glass | 🥃 | gluh | G |

---

## Sound Map

### Letter to Sound Mapping

```typescript
const SOUND_MAP: Record<string, string> = {
  A: 'ah', B: 'buh', C: 'kuh', D: 'duh', E: 'eh', F: 'fuh', G: 'guh', H: 'huh',
  I: 'ih', J: 'juh', K: 'kuh', L: 'luh', M: 'muh', N: 'nuh', O: 'oh', P: 'puh',
  Q: 'kwuh', R: 'ruh', S: 'suh', T: 'tuh', U: 'uh', V: 'vuh', W: 'wuh', X: 'ks',
  Y: 'yuh', Z: 'zuh',
};
```

---

## Scoring System

### Score Calculation

```typescript
baseScore = 20;  // per correct answer
timeBonus = Math.max(0, Math.round(((timeLimit - timeUsed) / timeLimit) * 5));
streakBonus = Math.min((streak + 1) * 3, 15);
roundScore = Math.min(25, baseScore + timeBonus) + streakBonus;
```

### Score Examples

| Time Used | Base | Time Bonus | Max Total | With Streak (5) |
|-----------|-------|------------|-----------|-----------------|
| 0s (instant) | 20 | 5 | 25 | 40 (25 + 15) |
| 10s (half) | 20 | 2-3 | 22-23 | 37-38 |
| 20s (limit) | 20 | 0 | 20 | 35 (20 + 15) |
| Wrong | 0 | 0 | 0 | 0 |

### Streak System

| Streak | Bonus |
|--------|-------|
| 0 | 0 |
| 1 | 3 |
| 2 | 6 |
| 3 | 9 |
| 4 | 12 |
| 5+ | 15 (capped) |

---

## Round Generation

### Algorithm

```typescript
function buildBeginningSoundsRound(
  level: number,
  usedWords: string[]
): BeginningSoundsRound {
  // 1. Get level-appropriate words
  const levelWords = WORD_BANK.filter(w => w.difficulty <= level);

  // 2. Filter out already-used words
  const available = levelWords.filter(w => !usedWords.includes(w.word));

  // 3. Fall back to all words if exhausted
  const candidates = available.length > 0 ? available : levelWords;

  // 4. Pick random target word
  const targetWord = randomPick(candidates);

  // 5. Get incorrect options (different first letters)
  const incorrectLetters = ALL_SOUNDS
    .filter(l => l !== targetWord.firstLetter)
    .randomSlice(optionCount - 1);

  // 6. Build and shuffle options
  const options = shuffle([
    { letter: targetWord.firstLetter, sound: SOUND_MAP[...], isCorrect: true },
    ...incorrectLetters.map(l => ({ letter: l, sound: SOUND_MAP[l], isCorrect: false }))
  ]);

  return { targetWord, options };
}
```

---

## Visual Design

### Layout

- **Level Selector:** 3 buttons (Level 1, Level 2, Level 3)
- **Word Display:** Large emoji (6xl) + word text
- **Hear Word Button:** "🔊 Hear Word" for TTS replay
- **Options Grid:** 2×2 or 2×3 grid of letter buttons
- **Streak Display:** 5 heart icons showing streak progress
- **Score Display:** Correct count, Score, Round indicator

### Styling

| Element | Style |
|---------|-------|
| Level active | bg-blue-500 text-white shadow-lg |
| Level inactive | bg-slate-50 border-slate-200 |
| Option normal | bg-white border-gray-200 |
| Option correct | bg-green-100 border-green-400 |
| Option wrong | bg-red-100 border-red-400 |
| Feedback text | text-purple-600 font-medium |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Correct answer | playSuccess() | 'success' |
| Wrong answer | playError() | 'error' |
| Game complete | playCelebration() | 'celebration' |
| Streak milestone | None | 'celebration' |

### TTS Settings

| Parameter | Value |
|-----------|-------|
| Word speech rate | 0.7 |
| Word pitch | 1.1 |
| Sound speech rate | 0.8 |
| Sound pitch | 1.2 |

---

## Feedback System

### Messages

| Situation | Message |
|-----------|---------|
| Initial | "Tap the sound you hear at the start!" |
| Correct | "Yes! {sound} is for {word}! {emoji}" |
| Wrong | "Oops! The answer is {letter} for {word} {emoji}" |

### Examples

- Correct: "Yes! ah is for Apple! 🍎"
- Wrong: "Oops! The answer is A for Apple 🍎"

---

## Progress Tracking

### Session Persistence

```typescript
await progressQueue.add({
  profileId: currentProfile.id,
  gameId: 'beginning-sounds',
  score: finalScore,
  completed: true,
  metadata: {
    level: currentLevel,
    correct: correctCount,
    rounds: levelConfig.roundCount,
  },
});
```

### Integration with useGameDrops

```typescript
const { onGameComplete } = useGameDrops('beginning-sounds');
await onGameComplete(finalScore);
```

---

## Game Constants

```typescript
const BASE_SCORE = 20;           // per correct answer
const MAX_TIME_BONUS = 5;        // maximum time bonus
const MAX_STREAK_BONUS = 15;     // maximum streak bonus
const STREAK_MULTIPLIER = 3;     // points per streak level
const STREAK_HEART_INTERVAL = 2;  // hearts fill every 2 streak
const ROUND_DELAY_MS = 2000;      // delay before next round
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `BeginningSounds.tsx` | 548 | Main component |
| `beginningSoundsLogic.ts` | 158 | Game logic and data |
| `beginningSoundsLogic.test.ts` | 268 | Unit tests |

### Architecture

- **Component** (`BeginningSounds.tsx`): UI, game flow, state management, TTS
- **Logic** (`beginningSoundsLogic.ts`): Pure functions for round generation and scoring
- **Tests** (`beginningSoundsLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Phonemic Awareness**
   - Identifying beginning sounds
   - Letter-sound correspondence
   - Sound discrimination

2. **Auditory Processing**
   - Listening to words
   - Matching sounds to letters
   - Distinguishing similar sounds

3. **Vocabulary**
   - Common words (animals, objects, food)
   - Word recognition
   - Picture-word association

4. **Decision Making**
   - Multiple choice selection
   - Timing and accuracy
   - Progress tracking

---

## Comparison with Similar Games

| Feature | BeginningSounds | LetterSoundMatch | PhonicsSounds |
|---------|----------------|------------------|---------------|
| CV Required | None (voice fallback) | None | None |
| Core Mechanic | Identify beginning sound | Match letter to sound | Match sound to picture |
| Educational Focus | Beginning sounds | Letter-sound | Phonics |
| Difficulty Levels | 3 | 1 | 3 |
| Options per Round | 3-4 | 3 | 3-8 |
| Rounds | 6-10 | 8 | 15 |
| Score | 20 + time + streak | 20 per correct | 10 + streak |
| Age Range | 4-7 | 3-6 | 4-8 |
| Vibe | Chill | Chill | Chill |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
