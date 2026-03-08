# Rhyme Time Game Specification

**Game ID:** `rhyme-time`
**World:** Learning
**Vibe:** Chill
**Age Range:** 4-6 years
**CV Requirements:** None

---

## Overview

Rhyme Time is a phonological awareness game where children match rhyming words. Research shows rhyme awareness is the #1 predictor of early reading success. Players see a target word and must select the word that rhymes from multiple options.

### Tagline
"Find the words that rhyme! Time to shine! 🎵"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Target** - Target word displayed with emoji (e.g., "cat")
2. **Hear Word** - Optional TTS pronunciation of target word
3. **Select Rhyme** - Choose the rhyming word from options
4. **Get Feedback** - Instant feedback on correctness
5. **Continue** - 10 rounds per session

### Controls

| Action | Input |
|--------|-------|
| Select answer | Click/tap option button |
| Hear word | Click word/speaker button |
| Start game | Click "Start Rhyming" button |
| Next round | Automatic after feedback |

---

## Difficulty Levels

### 3 Levels

| Level | Options | Visual | Similar | Families | Description |
|-------|---------|--------|---------|----------|-------------|
| Easy | 3 | No | No | 3 | Simple rhymes only |
| Medium | 3 | Yes | No | 6 | More families |
| Hard | 4 | Yes | Yes | 10 | Full challenge |

### Difficulty Features

- **Visual distractors**: Use emoji-based confusion
- **Similar families**: Include same-family distractors (e.g., "bat" when target is "cat")

---

## Scoring System

### Score Formula

```typescript
basePoints = 10;
streakBonus = Math.min(streak × 2, 20);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Streak | Bonus | Total |
|--------|-------|-------|
| 0 | 0 | 10 |
| 1 | 2 | 12 |
| 2 | 4 | 14 |
| 3 | 6 | 16 |
| 5 | 10 | 20 |
| 10+ | 20 | 30 |

### Max per Round

30 points (10 base + 20 bonus)

### Penalties

- Wrong answer: Streak resets to 0

---

## Rhyme Families

### 10 Families (47+ words)

| Family | Example Sentence | Words |
|--------|-----------------|-------|
| -at | The cat sat on the mat. | cat, bat, hat, mat, rat, sat |
| -an | The man with the can ran to the van. | can, fan, man, pan, van, ran |
| -ig | The big pig wore a wig. | big, dig, fig, pig, wig |
| -op | The cop saw the mop drop. | cop, hop, mop, pop, top |
| -ug | Give the bug a hug in the rug. | bug, hug, jug, mug, rug |
| -et | The pet wet the net. | bet, get, jet, net, pet, wet |
| -en | The hen sat in the pen. | den, hen, men, pen, ten |
| -it | Please sit on the lit bit. | bit, hit, kit, lit, sit |
| -og | The dog sat on the log. | bog, dog, fog, hog, log |
| -un | The sun is fun for everyone. | bun, fun, run, sun |

---

## Round Generation

### Algorithm

```typescript
// 1. Pick available rhyme family (avoid last 3 used)
available = config.families.filter(!usedFamilies.has);
targetFamily = random(available);

// 2. Pick target word from family
targetWord = random(targetFamily.words);

// 3. Add correct answer
options = [{ word: targetWord, isCorrect: true }];

// 4. Add same-family distractor (hard mode only)
if (hard && otherFamilyWords.length > 0) {
  options.push({ word: random(otherFamilyWords), isCorrect: false });
}

// 5. Add other-family distractors
while (options.length < optionCount) {
  otherFamily = random(otherFamilies);
  options.push({ word: random(otherFamily.words), isCorrect: false });
}

// 6. Shuffle options
shuffle(options);
```

### Family Tracking

- Keeps track of last 3 families used
- Prevents immediate repetition
- Cycles back when all families exhausted

---

## Visual Design

### UI Elements

- **Target Display**: Large word + emoji at top
- **Options Grid**: 3-4 buttons with word + emoji
- **Progress Indicator**: "Round X / 10"
- **Streak Indicator**: Fire emoji 🔥 with count
- **Feedback Bar**: Shows result message
- **Difficulty Display**: Colored label (Easy=green, Medium=yellow, Hard=red)

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Learning cream |
| Target | Large text with emoji |
| Correct hit | Green glow |
| Wrong hit | Red glow |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select answer | playClick() | None |
| Correct | playSuccess() | 'success' |
| Wrong | playError() | 'error' |
| Complete | playCelebration() | 'celebration' |
| Speak word | TTS speakWord() | None |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Rounds per session | 10 | Total rounds in game |
| Base points | 10 | Points per correct answer |
| Streak bonus per | 2 | Points added per streak level |
| Max streak bonus | 20 | Cap on streak bonus |
| Family history | 3 | Families to avoid repeating |

---

## Data Structures

### Rhyme Word

```typescript
interface RhymeWord {
  word: string;       // 'cat', 'bat', etc.
  emoji: string;      // 🐱, 🦇, etc.
  audio?: string;     // Optional TTS path
}
```

### Rhyme Family

```typescript
interface RhymeFamily {
  family: string;           // '-at', '-an', etc.
  words: RhymeWord[];       // 4-6 words per family
  exampleSentence: string;  // Example with all words
}
```

### Rhyme Round

```typescript
interface RhymeRound {
  targetWord: RhymeWord;    // Word to find rhyme for
  targetFamily: string;     // Family name
  options: RhymeOption[];   // 3-4 options
  correctAnswer: string;    // Target word string
}
```

### Game State

```typescript
interface GameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  startTime: number;
  completed: boolean;
  usedFamilies: Set<string>;
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `RhymeTime.tsx` | ~ | Main component with game loop |
| `rhymeTimeLogic.ts` | 370 | Game logic and utilities |
| `rhymeTimeLogic.test.ts` | 273 | Unit tests (27 tests) |

### Architecture

- **Component** (`RhymeTime.tsx`): UI, state, game loop, events
- **Logic** (`rhymeTimeLogic.ts`): Pure functions for rounds, validation, scoring
- **Tests** (`rhymeTimeLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Phonological Awareness**
   - Rhyme recognition
   - Sound patterns
   - Word endings

2. **Reading Readiness**
   - #1 predictor of reading success
   - Pre-phonics skill
   - Auditory discrimination

3. **Vocabulary**
   - Common CVC words
   - Word families
   - Context understanding

4. **Listening Skills**
   - TTS pronunciation
   - Sound similarity
   - Auditory attention

5. **Pattern Recognition**
   - Word endings
   - Sound patterns
   - Language rules

---

## Research Basis

**Key Finding**: Rhyme awareness at age 4 is the strongest predictor of reading success at age 6 (National Reading Panel, 2000).

- Rhyme awareness > letter knowledge for early reading
- CVC words (consonant-vowel-consonant) are easiest for beginners
- Phonological awareness training improves reading outcomes

---

## Comparison with Similar Games

| Feature | RhymeTime | WordBuilder | ColorMixing |
|---------|-----------|-------------|-------------|
| Domain | Phonological | Spelling | Science |
| Age Range | 4-6 | 5-8 | 4-8 |
| Rounds | 10 | 8 | 8 |
| Vibe | Chill | Chill | Chill |
| Research-backed | Yes | Yes | No |

---

## Easter Eggs

| Achievement | Condition | Egg |
|-------------|-----------|-----|
| Rhyme Master | Complete with 90%+ accuracy | egg-rhyme-master |
| Perfect Rhyme | Complete with 100% accuracy | egg-perfect-rhyme |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
