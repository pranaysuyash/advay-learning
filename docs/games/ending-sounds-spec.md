# Ending Sounds Game Specification

**Game ID:** `ending-sounds`
**World:** Learning
**Vibe:** Chill
**Age Range:** 4-7 years
**CV Requirements:** None

---

## Overview

Ending Sounds is an educational phonics game where children identify the ending sound (last letter) of a word. The game displays a word with an emoji, and the child selects the matching ending letter from four choices.

### Tagline
"Listen to the word and pick its ending sound! 🔤🔊"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Word** - A word is displayed with an emoji illustration
2. **Read Word** - Child reads the word aloud
3. **Select Letter** - Child taps the ending sound letter
4. **Get Feedback** - Immediate visual and audio feedback
5. **Next Round** - Advance to next word (8 rounds total)

### Controls

| Action | Input |
|--------|-------|
| Select answer | Tap/click letter button |
| Finish game | Click "Finish" button |

---

## Word Bank

### Word Structure

```typescript
interface EndingWord {
  word: string;         // Display word (e.g., "Cat")
  emoji: string;        // Emoji illustration (e.g., "🐱")
  endingLetter: string; // Uppercase ending letter (e.g., "T")
}
```

### 10 Words

| Word | Emoji | Ending Letter |
|------|-------|---------------|
| Cat | 🐱 | T |
| Dog | 🐶 | G |
| Sun | ☀️ | N |
| Bus | 🚌 | S |
| Fish | 🐟 | SH |
| Book | 📘 | K |
| Bell | 🔔 | L |
| Cake | 🍰 | E |
| Moon | 🌙 | N |
| Lamp | 💡 | P |

**Note:** Some words like "Fish" end with "sh" sound but the letter is "H" in this simplified version.

---

## Scoring System

### Score Calculation

```typescript
pointsPerCorrect = 20;
finalScore = correctAnswers × 20;
// Max score: 8 rounds × 20 = 160 points
```

### Score Examples

| Correct | Rounds | Score |
|---------|--------|-------|
| 0 | 8 | 0 |
| 4 | 8 | 80 |
| 6 | 8 | 120 |
| 8 | 8 | 160 (max) |

---

## Round Generation

### Algorithm

```typescript
function createEndingSoundsRound(
  usedWords: string[],
  rng: () => number = Math.random
): EndingSoundsRound {
  // 1. Filter out already-used words
  const unusedWords = WORD_BANK.filter(
    (entry) => !usedWords.includes(entry.word)
  );

  // 2. Fall back to all words if exhausted
  const source = unusedWords.length > 0 ? unusedWords : WORD_BANK;

  // 3. Pick random target word
  const target = source[Math.floor(rng() * source.length)];

  // 4. Get unique ending letters (excluding target)
  const allEndingLetters = new Set(
    WORD_BANK.map((entry) => entry.endingLetter)
  );
  allEndingLetters.delete(target.endingLetter);

  // 5. Pick 3 distractor letters
  const distractors = shuffle(
    Array.from(allEndingLetters),
    rng
  ).slice(0, 3);

  // 6. Shuffle options so correct answer isn't always first
  const options = shuffle([target.endingLetter, ...distractors], rng);

  return { target, options };
}
```

### Key Features

- **Unused word preference:** Tries to show new words first
- **Shuffled options:** Correct answer position varies
- **Fallback:** Reuses words when all 10 have been shown
- **Unique distractors:** Uses Set to ensure variety

---

## Visual Design

### Layout

- **Title Bar:** "Ending Sounds" with score
- **Round Indicator:** "Round X / 8"
- **Word Display:** Large emoji (6xl) + word text (4xl)
- **Options Grid:** 2×2 or 4×1 grid of letter buttons
- **Feedback Area:** Shows result message
- **Finish Button:** Always available

### Styling

| Element | Style |
|---------|-------|
| Border | #F2CC8F (gold/yellow) |
| Background | White |
| Primary Color | #7C3AED (purple) |
| Shadow | 3D effect with dark borders |
| Font | Black/bold for readability |

### Button States

| State | Background | Border | Opacity |
|-------|------------|--------|---------|
| Normal | #F5F3FF | #F2CC8F | 100% |
| Hover | #F5F3FF | #7C3AED | 100% |
| Disabled | #F5F3FF | #F2CC8F | 70% |

---

## Audio & Haptics

| Event | Audio |
|-------|-------|
| Start game | playClick() |
| Correct answer | playSuccess() |
| Wrong answer | playError() |
| Game complete | playCelebration() |

---

## Feedback System

### Messages

| Situation | Message |
|-----------|---------|
| Initial | "Find the ending sound." |
| Correct | "Great! {word} ends with {letter}." |
| Wrong | "Nice try! {word} ends with {letter}." |

### Examples

- Correct: "Great! Cat ends with T."
- Wrong: "Nice try! Cat ends with T."

---

## Game Session

### Session Progress

```typescript
interface EndingSoundsSession {
  round: number;           // Current round (1-8)
  score: number;           // Accumulated score
  correct: number;         // Correct answers count
  usedWords: string[];     // Words already shown
  activeRound: EndingSoundsRound | null;
  showResult: boolean;     // Whether answer was revealed
  feedback: string;        // Current feedback message
}
```

### Timing

| Event | Duration |
|-------|----------|
| Delay before next round | 900ms |
| Delay before clearing result (final) | 1200ms |

---

## Progress Tracking

### Integration with useGameSessionProgress

```typescript
useGameSessionProgress({
  gameName: 'Ending Sounds',
  score,
  level: 1,
  isPlaying: Boolean(activeRound),
  metaData: { round, correct, roundsPerSession },
});
```

### Integration with useGameDrops

```typescript
const { onGameComplete } = useGameDrops('ending-sounds');

// On game completion
await onGameComplete(finalScore);
```

---

## Game Constants

```typescript
const roundsPerSession = 8;
const pointsPerCorrect = 20;
const optionsPerRound = 4;
const wordBankCount = 10;
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `EndingSounds.tsx` | 174 | Main component |
| `endingSoundsLogic.ts` | 63 | Game logic and data |
| `endingSoundsLogic.test.ts` | 188 | Unit tests |

### Architecture

- **Component** (`EndingSounds.tsx`): UI, game flow, state management
- **Logic** (`endingSoundsLogic.ts`): Pure functions for round generation and validation
- **Tests** (`endingSoundsLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Phonemic Awareness**
   - Identifying ending sounds
   - Letter-sound correspondence
   - Sound discrimination

2. **Reading Readiness**
   - Word recognition
   - Letter patterns
   - Spelling awareness

3. **Visual Processing**
   - Reading words
   - Letter identification
   - Word-picture association

4. **Decision Making**
   - Multiple choice selection
   - Answer confidence
   - Progress tracking

---

## Comparison with Similar Games

| Feature | EndingSounds | BeginningSounds | LetterSoundMatch |
|---------|--------------|-----------------|------------------|
| CV Required | None | None (voice fallback) | None |
| Core Mechanic | Identify ending sound | Identify beginning sound | Match letter to sound |
| Educational Focus | Ending sounds | Beginning sounds | Letter-sound |
| Word Bank | 10 words | 33 words | 8 pairs |
| Options per Round | 4 | 3-4 | 3 |
| Rounds | 8 | 6-10 | 8 |
| Score | 20 per correct | 20 + time + streak | 20 per correct |
| Age Range | 4-7 | 4-7 | 3-6 |
| Vibe | Chill | Chill | Chill |

---

## UX Notes

### Data Attributes

- `data-ux-goal`: "Identify the final sound in simple words."
- `data-ux-instruction`: "Read the word and tap the correct ending letter."

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
