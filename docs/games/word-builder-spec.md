# Word Builder Game Specification

**Game ID:** `word-builder`
**World:** Learning
**Vibe:** Chill
**Age Range:** 5-8 years
**CV Requirements:** Yes (Hand Tracking)

---

## Overview

Word Builder is a spelling and phonics game where children build words by selecting letters in the correct order. Players see a word represented visually or by sound, then find and tap letters to spell it correctly.

### Tagline
"Spell the word! Build it letter by letter! 🔤"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Target** - Word shown with picture/prompt
2. **Find Letters** - Scan letter cloud for correct letters
3. **Tap in Order** - Select letters in correct spelling order
4. **Get Feedback** - Visual feedback for each letter
5. **Complete Word** - Celebration when word is complete
6. **Continue** - Continue until session ends

### Controls

| Action | Input |
|--------|-------|
| Move cursor | Hand tracking - index finger |
| Select letter | Pinch gesture |
| Skip word | Skip button |
| Start game | Pinch "Start" button |
| Pause | Pause button or hand loss |

---

## Difficulty Levels

### Two Modes

#### Explore Mode

| Level | Word Length | Description |
|-------|-------------|-------------|
| 1 | 3 letters | Simple CVC words |
| 2 | 3-4 letters | Common words |
| 3 | 3-5 letters | Including blends |

#### Phonics Mode (Curriculum-Based)

| Stage | Pattern | Examples | Description |
|-------|---------|----------|-------------|
| cvc_a | CVC with A | CAT, HAT, MAP | Middle letter A |
| cvc_e | CVC with E | BED, HEN, PEN | Middle letter E |
| cvc_all | All CVC | DOG, BIG, SUN | Any vowel |
| blends | CCVC/CVCC | STOP, FROG | Consonant blends |
| digraphs | SH, CH, TH | SHIP, CHICK | Digraph patterns |
| long_vowels | Vowel teams | BOAT, SEED | Long vowel sounds |
| sight_words_3 | 3-letter sight | THE, AND, YOU | Common words |
| advanced | Mixed | Various | Complex patterns |

---

## Scoring System

### Score Formula

```typescript
basePoints = 10;
streakBonus = Math.min(streak × 2, 15);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Streak | Bonus | Total |
|--------|-------|-------|
| 0 | 0 | 10 |
| 1 | 2 | 12 |
| 2 | 4 | 14 |
| 3 | 6 | 16 |
| 5+ | 15 | 25 |

### Max per Word

25 points (10 base + 15 bonus)

### Penalties

- Wrong letter: Visual feedback only (no penalty)
- Skip word: Streak resets

---

## Word Bank

### Word Selection

- **Total Words**: ~1200 tagged words
- **Format**: JSON import from wordbank
- **Metadata**: Difficulty, pronunciation, meaning
- **Blocked**: SEX, KILL, DEAD, HATE, GUN

### Tagging System

Words are tagged by:
- Length: `len:3`, `len:4`, etc.
- Vowel: `vowel:A`, `vowel:E`, etc.
- Pattern: `pattern:cvc`, `pattern:ccvc`, etc.
- CVC vowel: `cvc:A` for "CAT"
- Digraph: `pattern:digraph_sh`, etc.
- Sight: `is_sight:true` for common words

### LRU Cache

- 500 entry limit
- Automatic eviction when full
- Tag computation caching

---

## Round Generation

### Explore Mode

```typescript
// Filter by difficulty level
candidates = wordBank.filter(w =>
  w.difficulty <= level && !usedWords.has(w.word)
);

// Random selection
selected = random(candidates);

// Create letter targets
targets = createLetterTargets(selected.word, distractorCount);
```

### Phonics Mode

```typescript
// Find matching stage
stage = curriculum.stages.find(s => s.id === stageId);

// Match by criteria
candidates = wordBank.filter(w =>
  matchesCriteria(w, stage.criteria) && !usedWords.has(w.word)
);

// Fallback chain: stage → cvc_all → any 3-letter → null
if (candidates.empty) {
  candidates = filterByCriteria({ length: [3] });
}
```

### Letter Target Creation

```typescript
targets = [];

// Add correct letters (with orderIndex)
for (i = 0; i < word.length; i++) {
  targets.push({
    id: i,
    letter: word[i],
    position: { x, y },
    isCorrect: true,
    orderIndex: i,
  });
}

// Add distractors (from alphabet, excluding word letters)
distractors = alphabet.filter(l => !word.includes(l));
shuffled = shuffle(distractors);
for (d of shuffled.slice(0, count)) {
  targets.push({
    id: nextId++,
    letter: d,
    position: { x, y },
    isCorrect: false,
    orderIndex: -1,
  });
}
```

---

## Visual Design

### UI Elements

- **Target Display**: Word hint/picture at top
- **Letter Cloud**: Scattered letter targets
- **Cursor**: Yellow finger cursor with pinch indicator
- **Progress**: Dots showing word progress
- **Feedback**: Visual flash for correct/incorrect

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Learning cream |
| Correct letters | Green glow |
| Wrong letters | Red glow |
| Letter targets | Circular buttons |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Correct letter | playPop() | 'success' |
| Wrong letter | playError() | 'error' |
| Complete word | playCelebration() | 'celebration' |
| Streak milestone | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Words per session | ∞ | Continuous play |
| Base points | 10 | Points per correct letter |
| Streak bonus per | 2 | Points per streak |
| Max streak bonus | 15 | Cap on bonus |
| Difficulty levels | 4 | Easy/Medium/Hard/Expert |

---

## Data Structures

### Word Entry

```typescript
interface WordEntry {
  word: string;           // Uppercase word
  pronunciation?: string; // IPA optional
  meaning?: string;       // Definition optional
  difficulty?: number;    // 1-4 scale
}
```

### Stage Criteria

```typescript
interface StageCriteria {
  length?: number[];      // [3], [3,4], etc.
  vowel?: string[];       // ['A'], ['E'], etc.
  pattern?: string[];     // ['cvc'], ['ccvc'], etc.
  is_sight?: boolean;     // Sight word flag
}
```

### Letter Target

```typescript
interface LetterTarget {
  id: number;            // Unique identifier
  letter: string;        // 'A', 'B', etc.
  position: Point;       // Normalized {x, y}
  isCorrect: boolean;    // True for word letters
  orderIndex: number;    // Sequence position (-1 for distractors)
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `WordBuilder.tsx` | ~ | Main component with CV, game loop |
| `wordBuilderLogic.ts` | 538 | Word selection, targets, curriculum |
| `wordbank/wordbank.json` | ~1200 | Tagged word database |
| `wordbank/curriculum.json` | ~ | Stage definitions |
| `analyticsStore.ts` | ~ | Session analytics |
| `wordBuilderLogic.test.ts` | 304 | Unit tests (30 tests) |

### Architecture

- **Component** (`WordBuilder.tsx`): CV tracking, UI, state, events
- **Logic** (`wordBuilderLogic.ts`): Word selection, target generation, curriculum
- **Analytics** (`analyticsStore.ts`): Session tracking, statistics
- **Tests** (`wordBuilderLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Spelling**
   - Letter sequencing
   - Word construction
   - Spelling patterns

2. **Phonics**
   - CVC patterns
   - Blends and digraphs
   - Vowel teams

3. **Letter Recognition**
   - Upper case identification
   - Letter discrimination
   - Alphabet knowledge

4. **Fine Motor Skills**
   - Hand-eye coordination
   - Pinching precision
   - Target selection

5. **Reading Readiness**
   - Sight words
   - Word families
   - Decoding skills

---

## Analytics Features

### Session Tracking

- Start/end timestamps
- Words completed per stage
- Touch tracking for letter selection
- Accuracy metrics

### Analytics Summary

- Total sessions
- Words completed
- Stage progress
- Accuracy by stage

### Data Export

- JSON export of all sessions
- Privacy-respecting storage
- Clear capability

---

## Comparison with Similar Games

| Feature | WordBuilder | RhymeTime | LetterCatcher |
|---------|-------------|-----------|---------------|
| Domain | Spelling | Phonological | Letters |
| Age Range | 5-8 | 4-6 | 3-6 |
| CV Required | Yes | No | Yes |
| Curriculum | Yes (stages) | No | No |
| Analytics | Yes | No | No |

---

## Easter Eggs

| Achievement | Condition | Egg |
|-------------|-----------|-----|
| Word Wizard | Complete 10 words without errors | egg-word-wizard |
| Stage Master | Complete all stages | egg-stage-master |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
