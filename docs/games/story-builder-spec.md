# Story Builder - Game Specification

## Overview
**Game ID**: `story-builder`
**Educational Focus**: Literacy, sentence structure, word order
**Target Age**: 3-6 years
**Code Location**: `src/frontend/src/games/storyBuilderLogic.ts`

## Game Description
Children build simple 3-word sentences by selecting words in the correct order. Each round presents a scrambled sentence where children must tap words in sequence to reconstruct the original sentence. This teaches basic sentence structure and word order concepts.

## Educational Goals
1. Understand that sentences have a specific word order
2. Recognize simple subjects, verbs, and objects
3. Build confidence with early literacy skills
4. Learn common sight words in context

## Game Logic

### Interfaces

```typescript
interface StoryBuilderPrompt {
  id: string;           // Unique prompt identifier
  prompt: string;       // Instructions for the child
  orderedWords: string[]; // The correct sentence in order
}

interface StoryBuilderRound {
  id: string;           // Prompt ID used for this round
  prompt: string;       // Instructions displayed to child
  orderedWords: string[]; // The correct word order
  options: string[];    // Scrambled words for display/tapping
}
```

### Content - STORY_PROMPTS (5 prompts)

| ID | Prompt | Sentence |
|----|--------|---------|
| `bird-sings` | Build the sentence about the bird. | The bird sings |
| `pip-jumps` | Build the sentence about Pip. | Pip jumps high |
| `kids-read` | Build the sentence about reading. | Kids read books |
| `stars-shine` | Build the sentence about stars. | Stars shine bright |
| `we-share-toys` | Build the sentence about sharing. | We share toys |

### Core Functions

#### `createStoryBuilderRound(usedPromptIds, rng)`
Creates a new round with scrambled words.

**Parameters:**
- `usedPromptIds: string[]` - Prompts already used (to avoid repetition)
- `rng: () => number` - Random number generator (default: Math.random)

**Returns:** `StoryBuilderRound`

**Behavior:**
1. Filters out used prompt IDs
2. Randomly selects from remaining prompts
3. Falls back to all prompts if all have been used
4. Shuffles the sentence words to create options
5. Returns round with both correct order and scrambled options

#### `evaluateStoryWordPick(round, pickedWords, pickedWord)`
Evaluates whether the selected word is correct for the current position.

**Parameters:**
- `round: StoryBuilderRound` - Current round data
- `pickedWords: string[]` - Words already correctly picked
- `pickedWord: string` - Word the child just selected

**Returns:** `{ ok: boolean; completed: boolean }`

**Rules:**
1. Returns `{ok: false, completed: false}` if word already picked
2. Returns `{ok: false, completed: false}` if wrong word for position
3. Returns `{ok: true, completed: false}` if correct but not last word
4. Returns `{ok: true, completed: true}` if correct and final word

### Helper Functions

#### `shuffle(items, rng)`
Fisher-Yates shuffle for scrambling word options.

**Parameters:**
- `items: T[]` - Array to shuffle
- `rng: () => number` - Random number generator

**Returns:** Shuffled array

## Game Progression

### Round Structure
- Each round uses one of 5 predefined prompts
- Words are scrambled for the child to reorder
- Correct picks are visually indicated
- Incorrect selections are rejected with gentle feedback

### Completion
- A round is complete when all words are picked in correct order
- Celebration triggers on completion
- Next round uses a different prompt (when possible)

## Scoring
Currently not implemented in the logic layer. UI layer likely handles:
- Points per correct word
- Streak bonuses for consecutive correct answers
- Round completion bonuses

## Technical Notes

### Dependencies
- Pure functional design (no external dependencies)
- RNG injection for deterministic testing

### Test Coverage
- 33 tests covering:
  - Prompt bank structure (5 prompts, 3 words each)
  - Round generation with scrambling
  - Answer evaluation for all positions
  - Edge cases (empty picks, duplicates, invalid words)
  - Integration scenarios

### Implementation Details
- All sentences are exactly 3 words for simplicity
- Words can include proper nouns (Pip, We, etc.)
- Emoji/icons not used in logic layer (UI responsibility)
- No audio in logic layer (UI responsibility)
