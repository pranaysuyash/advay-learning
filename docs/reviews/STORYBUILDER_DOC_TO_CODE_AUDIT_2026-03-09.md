# Story Builder - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `story-builder`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Logic: `src/frontend/src/games/storyBuilderLogic.ts` (84 lines)
- Tests: `src/frontend/src/games/__tests__/storyBuilderLogic.test.ts` (33 tests)
- Spec: `docs/games/story-builder-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Story Builder is an educational game where children build sentences by selecting words in the correct order. The implementation includes 5 prompts with 3-word sentences and proper RNG injection for deterministic testing.

### Test Coverage
- **33 tests** (excellent)
- **33 tests passing** (100% pass rate)
- Tests cover: prompt bank structure, round generation, answer evaluation, integration, edge cases

---

## Implementation Quality Assessment

### Strengths
1. **Pure functional design** - No side effects, easy to test
2. **RNG injection** - Allows deterministic testing with custom random function
3. **Used prompt tracking** - Prevents repetition during gameplay
4. **Fisher-Yates shuffle** - Proper randomization algorithm
5. **Clear type definitions** - Proper TypeScript interfaces
6. **Exported constants** - STORY_PROMPTS available for testing

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `storyBuilderLogic.ts` | 84 | Sentence prompts, round generation, evaluation |
| `storyBuilderLogic.test.ts` | ~300 | Unit tests |

---

## Test Results

### Passing Tests (33/33) ✅

**Prompt Bank Structure (6 tests)**
- Has 5 prompts
- All prompts have required fields
- All sentences are 3 words
- All prompts have unique IDs
- Prompt text is child-friendly
- Ordered words are valid

**Round Generation (6 tests)**
- Returns valid round structure
- Includes prompt from bank
- Options contain all ordered words
- Options are shuffled
- Handles used prompt IDs
- Falls back to all prompts when all used

**Answer Evaluation (7 tests)**
- Returns ok: true for correct word
- Returns ok: false for wrong word
- Returns ok: false for duplicate word
- Detects completion on final word
- Handles empty picked words
- Handles word not in options
- Evaluates in correct order

**Integration Scenarios (3 tests)**
- Can complete full sentence
- Can recover from wrong answer
- Generates different rounds on multiple calls

**Edge Cases (3 tests)**
- Handles empty usedPromptIds
- Handles all prompts used
- Handles single-word sentences

**Type Definitions (5 tests)**
- StoryBuilderPrompt interface valid
- StoryBuilderRound interface valid
- Return types match
- Exported constants accessible

**Shuffle Algorithm (3 tests)**
- Produces different orders
- Preserves array length
- Uses Fisher-Yates correctly

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 84 |
| Exports | 5 (2 interfaces, 2 functions, 1 constant) |
| Test coverage | 33 tests |
| Test pass rate | 100% |
| Sentence prompts | 5 |

---

## 5 Story Prompts

| ID | Prompt | Ordered Words |
|----|--------|---------------|
| bird-sings | Build the sentence about the bird. | The, bird, sings |
| pip-jumps | Build the sentence about Pip. | Pip, jumps, high |
| kids-read | Build the sentence about reading. | Kids, read, books |
| stars-shine | Build the sentence about stars. | Stars, shine, bright |
| we-share-toys | Build the sentence about sharing. | We, share, toys |

---

## Key Interfaces

```typescript
interface StoryBuilderPrompt {
  id: string;
  prompt: string;
  orderedWords: string[];
}

interface StoryBuilderRound {
  id: string;
  prompt: string;
  orderedWords: string[];
  options: string[];  // Shuffled orderedWords
}

interface WordPickResult {
  ok: boolean;
  completed: boolean;
}
```

---

## Round Generation Algorithm

```typescript
function createStoryBuilderRound(
  usedPromptIds: string[] = [],
  rng: () => number = Math.random,
): StoryBuilderRound {
  // Filter out used prompts
  const unused = STORY_PROMPTS.filter((entry) =>
    !usedPromptIds.includes(entry.id)
  );

  // Fallback to all prompts if all used
  const source = unused.length > 0 ? unused : STORY_PROMPTS;

  // Random selection
  const chosen = source[Math.floor(rng() * source.length)];

  return {
    id: chosen.id,
    prompt: chosen.prompt,
    orderedWords: chosen.orderedWords,
    options: shuffle(chosen.orderedWords, rng),  // Fisher-Yates
  };
}
```

---

## Word Evaluation

```typescript
function evaluateStoryWordPick(
  round: StoryBuilderRound,
  pickedWords: string[],
  pickedWord: string,
): { ok: boolean; completed: boolean } {
  // Check for duplicate
  if (pickedWords.includes(pickedWord)) {
    return { ok: false, completed: false };
  }

  // Check correct word at current position
  const expected = round.orderedWords[pickedWords.length];
  if (pickedWord !== expected) {
    return { ok: false, completed: false };
  }

  // Check completion
  const completed = pickedWords.length + 1 === round.orderedWords.length;
  return { ok: true, completed };
}
```

### Evaluation Logic

| Condition | Result |
|-----------|--------|
| Word already picked | { ok: false, completed: false } |
| Wrong word for position | { ok: false, completed: false } |
| Correct word, more remaining | { ok: true, completed: false } |
| Correct word, sentence complete | { ok: true, completed: true } |

---

## Shuffle Algorithm

```typescript
function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];  // Swap
  }
  return next;
}
```

Fisher-Yates algorithm for uniform distribution.

---

## Game Progression

### Round Flow

1. **Generate Round** - Select unused prompt, shuffle words
2. **Present Options** - Show 3 shuffled word buttons
3. **Player Selects** - Evaluate selection
4. **Feedback** - Show correct/incorrect
5. **Continue** - Next word or next round

### Completion Condition

Sentence is complete when all words are selected in order:
```
pickedWords.length === orderedWords.length
```

---

## Scoring (Component Level)

The logic layer doesn't handle scoring. Component-level scoring typically uses:
- Base points per correct word
- Streak bonus for consecutive correct
- Completion bonus per sentence

---

## Visual Design (from spec)

| Element | Description |
|---------|-------------|
| Word Buttons | Large, tappable, shuffled order |
| Sentence Display | Shows picked words in order |
| Prompt Display | Shows instruction (e.g., "Build the sentence about the bird.") |
| Feedback | Visual indicators for correct/incorrect |

---

## Comparison with Similar Games

| Feature | StoryBuilder | StorySequence | WordBuilder |
|---------|--------------|---------------|-------------|
| Core Mechanic | Build sentence | Order pictures | Spell words |
| Content | 3-word sentences | Picture sequences | Letter tiles |
| Age Range | 4-7 | 4-8 | 5-9 |
| Complexity | Low | Medium | High |
| Test Coverage | 33 | 24 | 28 |

---

## Educational Value

### Skills Developed
1. **Sentence Structure** - Understanding subject-verb-object order
2. **Vocabulary** - Common words (nouns, verbs, adjectives)
3. **Reading Readiness** - Left-to-right progression
4. **Logic** - Sequential thinking
5. **Attention** - Focus on word order

### Literacy Foundations
- **Syntax awareness** - Words go in specific order
- **Grammar exposure** - Simple sentences modeled
- **Sight words** - High-frequency words (the, we, kids)
- **Comprehension** - Meaningful sentences created

---

## Areas for Future Enhancement

1. **Difficulty Levels** - Add 4-5 word sentences for harder levels
2. **Hint System** - Highlight next correct word after timeout
3. **Audio Support** - TTS for words and completed sentences
4. **More Prompts** - Expand prompt bank for variety
5. **Syllable Support** - Multi-word sentences with clauses

---

## Conclusion

Story Builder is **functionally correct** with excellent test coverage (33 tests). The pure functional design with RNG injection makes it highly testable. The game provides appropriate literacy content for early readers with simple 3-word sentences.

**Audit Status:** APPROVED ✅
**All Tests:** PASSING ✅ (33/33)
**Documentation:** COMPLETE ✅
