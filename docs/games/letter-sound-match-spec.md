# Letter Sound Match Game Specification

**Game ID:** `letter-sound-match`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-6 years
**CV Requirements:** None

---

## Overview

Letter Sound Match is an educational phonics game where children match letters with their corresponding sounds. The game teaches letter-sound correspondence through multiple-choice questions.

### Tagline
"Match each letter with its sound! 📝🔊"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Letter** - A target letter is displayed
2. **Hear Options** - Three sound options are shown
3. **Select Sound** - Child taps the matching sound
4. **Get Feedback** - Immediate visual and audio feedback
5. **Next Round** - Advance to next letter (8 rounds total)

### Controls

| Action | Input |
|--------|-------|
| Select answer | Tap/click sound button |
| Finish game | Click "Finish" button |

---

## Letter Sound Data

### 8 Letter Sound Pairs

| Letter | Sound | Example Word |
|--------|-------|--------------|
| A | Ah | apple |
| B | Buh | ball |
| C | Kuh | cat |
| D | Duh | dog |
| M | Mmm | moon |
| S | Sss | sun |
| T | Tuh | tree |
| P | Puh | pig |

### Data Structure

```typescript
interface LetterSoundPair {
  letter: string;   // Uppercase letter (A, B, C...)
  sound: string;    // Phonetic sound (Ah, Buh, Kuh...)
  example: string;  // Example word (apple, ball, cat...)
}

interface LetterSoundMatchRound {
  target: LetterSoundPair;  // The letter to match
  options: string[];        // 3 sound options (1 correct, 2 distractors)
}
```

---

## Scoring System

### Points per Round

```typescript
correctAnswer = 20 points;
```

### Final Score

```typescript
finalScore = correctAnswers × 20;
// Max score: 8 rounds × 20 = 160 points
```

### Score Examples

| Correct | Rounds | Score |
|---------|--------|-------|
| 0 | 8 | 0 |
| 4 | 8 | 80 |
| 6 | 8 | 120 |
| 8 | 8 | 160 |

---

## Round Generation

### Algorithm

```typescript
function createLetterSoundMatchRound(usedLetters: string[]): LetterSoundMatchRound {
  // 1. Filter out already-used letters
  const unused = LETTER_SOUND_PAIRS.filter(
    (entry) => !usedLetters.includes(entry.letter)
  );

  // 2. Prefer unused letters, fall back to all if exhausted
  const source = unused.length > 0 ? unused : LETTER_SOUND_PAIRS;

  // 3. Pick random target letter
  const target = randomPick(source);

  // 4. Get 2 distractor sounds (exclude target sound)
  const distractors = shuffle(allSounds)
    .filter(sound => sound !== target.sound)
    .slice(0, 2);

  // 5. Shuffle options so correct answer isn't always first
  return {
    target,
    options: shuffle([target.sound, ...distractors])
  };
}
```

### Round Properties

| Property | Value |
|----------|-------|
| Total rounds | 8 |
| Options per round | 3 (1 correct, 2 distractors) |
| Unused letter preference | Yes |
| Random seed | Configurable (default: Math.random) |

---

## Visual Design

### Layout

- **Title Bar:** "Letter Sound Match" with score
- **Round Indicator:** "Round X / 8"
- **Letter Display:** Large purple letter (7xl)
- **Options Grid:** 3 buttons in 1×3 grid
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
| Normal | #F5F3FF (light purple) | #F2CC8F | 100% |
| Hover | #F5F3FF | #7C3AED | 100% |
| Disabled (after answer) | #F5F3FF | #F2CC8F | 70% |

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

### Correct Answer Feedback

```
"Yes. {letter} says {sound} like {example}."
Example: "Yes. A says Ah like apple."
```

### Wrong Answer Feedback

```
"Try again next round. Correct sound: {sound}."
Example: "Try again next round. Correct sound: Ah."
```

### Initial Prompt

```
"Pick the sound that matches the letter."
```

---

## Game Session

### Session Progress

```typescript
interface LetterSoundMatchSession {
  round: number;           // Current round (1-8)
  score: number;           // Accumulated score
  correct: number;         // Correct answers count
  usedLetters: string[];   // Letters already shown
  activeRound: LetterSoundMatchRound | null;
  showResult: boolean;     // Whether answer was revealed
  feedback: string;        // Current feedback message
}
```

### Timing

| Event | Duration |
|-------|----------|
| Delay before next round | 850ms |
| Delay before clearing result | 900ms (on final round) |

---

## Progress Tracking

### Integration with useGameSessionProgress

```typescript
useGameSessionProgress({
  gameName: 'Letter Sound Match',
  score,
  level: 1,
  isPlaying: Boolean(activeRound),
  metaData: { round, correct, roundsPerSession },
});
```

### Integration with useGameDrops

```typescript
const { onGameComplete } = useGameDrops('letter-sound-match');

// On game completion
await onGameComplete(finalScore);
```

---

## Game Constants

```typescript
const roundsPerSession = 8;
const pointsPerCorrect = 20;
const optionsPerRound = 3;
const letterSoundPairsCount = 8;
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `LetterSoundMatch.tsx` | 170 | Main component |
| `letterSoundMatchLogic.ts` | 60 | Game logic and data |
| `letterSoundMatchLogic.test.ts` | 32 | Unit tests |

### Architecture

- **Component** (`LetterSoundMatch.tsx`): UI, game flow, state management
- **Logic** (`letterSoundMatchLogic.ts`): Pure functions for round generation and validation
- **Tests** (`letterSoundMatchLogic.test.ts`): Round generation and validation tests

---

## Educational Value

### Skills Developed

1. **Letter-Sound Correspondence**
   - Understanding phonics
   - Letter recognition
   - Sound discrimination

2. **Auditory Processing**
   - Distinguishing similar sounds
   - Matching sounds to symbols

3. **Decision Making**
   - Multiple choice selection
   - Answer confidence

4. **Vocabulary**
   - Example words for each letter
   - Word associations

---

## Comparison with Similar Games

| Feature | LetterSoundMatch | PhonicsSounds | BeginningSounds |
|---------|-----------------|---------------|-----------------|
| CV Required | None | None | None |
| Core Mechanic | Match letter to sound | Match sound to picture | Identify beginning sounds |
| Educational Focus | Phonics | Phonics | Phonics |
| Options per Round | 3 | 3-8 | Varies |
| Rounds | 8 | 15 | Varies |
| Score | 20 per correct | 10 + streak | Points based |
| Age Range | 3-6 | 4-8 | 4-7 |
| Vibe | Chill | Chill | Chill |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
