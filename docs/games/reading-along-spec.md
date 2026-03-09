# Reading Along - Game Specification

## Overview
**Game ID**: `reading-along`
**Educational Focus**: Reading comprehension, sight word recognition
**Target Age**: 4-7 years
**Code Location**: `src/frontend/src/games/readingAlongLogic.ts`

## Game Description
Children see a simple sentence and must identify a specific target word. The game builds sight word vocabulary and reading comprehension through multiple choice questions.

## Educational Goals
1. Sight word recognition
2. Reading comprehension
3. Vocabulary building
4. Attention to detail
5. Word discrimination

## Game Logic

### Interfaces

```typescript
interface ReadingAlongSentence {
  id: string;        // Unique sentence identifier
  text: string;      // The complete sentence
  targetWord: string;// The word to identify
}

interface ReadingAlongRound {
  sentence: ReadingAlongSentence;
  options: string[]; // 3 choices: 1 correct + 2 distractors
}
```

### Sentence Content

6 simple sentences with CVC and sight words:

| ID | Sentence | Target Word |
|----|----------|-------------|
| cat-mat | "The cat sits on the mat" | cat |
| sun-bright | "The sun is bright today" | sun |
| pip-runs | "Pip runs fast at school" | runs |
| bird-sings | "A bird sings every morning" | sings |
| kids-read | "Kids read books together" | read |
| stars-shine | "Stars shine in the sky" | shine |

### Core Functions

#### `createReadingAlongRound(usedIds?: string[], rng?: () => number): ReadingAlongRound`
Creates a new reading comprehension round.

**Parameters**:
- `usedIds`: Sentence IDs to avoid (prevents repetition)
- `rng`: Random number generator (default: `Math.random`)

**Behavior**:
1. Filters out sentences with used IDs
2. Randomly selects one sentence from remaining
3. Selects 2 random distractor words (different from target)
4. Shuffles the 3 options (target + 2 distractors)

**Returns**: Round with sentence and 3 shuffled options

#### `isReadingAlongAnswerCorrect(round: ReadingAlongRound, selectedWord: string): boolean`
Checks if the selected word matches the target.

**Comparison**: Exact match, case-sensitive

### RNG Injection Pattern
The shuffle function accepts an RNG function for deterministic testing:

```typescript
function shuffle<T>(items: T[], rng: () => number): T[] {
  // Fisher-Yates shuffle with injected RNG
}
```

## Game Progression

### Round Structure
1. Display sentence with target word embedded
2. Show 3 word options
3. Child selects the target word
4. Immediate feedback on correctness

### Anti-Repetition System
- Tracks used sentence IDs
- Filters out already-seen sentences
- Resets when all sentences have been used
- Ensures variety across multiple rounds

### Difficulty Scaling
| Aspect | Implementation |
|--------|----------------|
| Sentence Length | 5-8 simple words |
| Vocabulary | CVC words + common sight words |
| Options | Always 3 (1 correct + 2 wrong) |
| Distractors | From same word pool, different from target |

## Technical Notes

### Shuffle Algorithm
Uses Fisher-Yates shuffle with RNG injection:
```typescript
for (let i = next.length - 1; i > 0; i -= 1) {
  const j = Math.floor(rng() * (i + 1));
  [next[i], next[j]] = [next[j], next[i]];
}
```

### Distractor Selection
- All target words from all sentences
- Excludes the current sentence's target word
- Randomly selects 2 from remaining pool
- Ensures distractors are valid words from the curriculum

### Used ID Management
- Empty array = no filtering (use any sentence)
- All IDs used = reset to full pool
- Prevents immediate repetition of same sentence

### Edge Cases
- No unused sentences → Falls back to full sentence pool
- Empty usedIds → All sentences available
- Same RNG value → Deterministic results

## Design Decisions

### Three Options
- Fewer than adult multiple choice (typically 4)
- Appropriate for young children
- Reduces cognitive load
- Maintains challenge (33% guessing chance)

### Case Sensitivity
- Answers must match exactly
- Teaches attention to detail
- Prevents memorization without reading

### CVC + Sight Words
- CVC (consonant-vowel-consonant): cat, sun, runs
- Sight words: the, a, is, in
- Balanced phonics and whole-language approach

### Short Sentences
- 5-8 words maximum
- Simple subject-verb-object structure
- Age-appropriate vocabulary
- Builds confidence

## Educational Design

### Sight Word Integration
Sentences use common sight words (Dolch/Fry lists):
- **the** (most frequent English word)
- **a** (article)
- **is** (being verb)
- **in** (preposition)

### CVC Pattern
Target words follow CVC pattern for phonics:
- cat: c-a-t
- sun: s-u-n
- runs: r-u-n-s (slight variation with -s)

### Progressive Exposure
- First exposure: Read full sentence
- Second exposure: Identify specific word
- Reinforcement: Multiple sentences with similar patterns

### Vocabulary Categories
| Category | Words |
|----------|-------|
| Animals | cat, bird |
| Nature | sun, stars, shine |
| Actions | runs, sings, read |
| Objects | mat, books |

### Comprehension Focus
- Target word is always IN the sentence
- Child must read and locate the word
- Tests both decoding and comprehension
- Not just word-in-isolation recognition
