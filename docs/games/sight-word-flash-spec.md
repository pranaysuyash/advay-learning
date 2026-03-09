# Sight Word Flash - Game Specification

## Overview
**Game ID**: `sight-word-flash`
**Educational Focus**: Literacy, sight word recognition, reading readiness
**Target Age**: 5-7 years
**Code Location**: `src/frontend/src/games/sightWordFlashLogic.ts`

## Game Description
Children are shown common sight words and must recognize/read them quickly. Sight words are high-frequency words that often don't follow standard phonics rules, making them important for early reading success.

## Educational Goals
1. Recognize common sight words instantly
2. Build reading fluency
3. Learn words that don't follow phonics rules
4. Develop visual word memory

## Game Logic

### Interfaces

```typescript
interface SightWord {
  word: string;
  difficulty: number;  // 1, 2, or 3
}

interface LevelConfig {
  level: number;
  wordCount: number;
}
```

### Sight Word Database

**Total**: 50+ words

#### Difficulty 1 Words (18 words)
Common kindergarten sight words:
- Pronouns: I, you, he, she, we, me
- Prepositions: to, at, by
- Conjunctions: and
- Verbs: is, go, be
- Other: it, a, the, no, so, or

#### Difficulty 2 Words (20+ words)
First grade sight words:
- Pronouns: her, him, his
- Verbs: was, were, had, saw, make, like, have, has, said
- Conjunctions: but, if, or
- Prepositions: out, how
- Other: or

#### Difficulty 3 Words (15+ words)
Second grade level:
- Question words: what, when, who, which, where
- Auxiliaries: does, doing, would, could, should
- Other: their, there, come, some

### Level Configuration

| Level | Word Count |
|-------|------------|
| 1 | 5 words |
| 2 | 8 words |
| 3 | 10 words |

### Core Functions

#### `getLevelConfig(level)`
Gets configuration for a level.

**Parameters:**
- `level: number` - Level number (1-3)

**Returns:** `LevelConfig`

**Fallback:** Returns level 1 config for invalid levels.

#### `getWordsForLevel(level)`
Generates a random set of words appropriate for the level.

**Parameters:**
- `level: number` - Level number

**Returns:** `SightWord[]`

**Behavior:**
1. Gets level config
2. Filters words by difficulty (≤ level)
3. Shuffles filtered words randomly
4. Returns first `wordCount` words

## Game Progression

### Difficulty Scaling
- **Level 1**: 5 easiest words (difficulty 1 only)
- **Level 2**: 8 words (difficulty 1-2)
- **Level 3**: 10 words (difficulty 1-3)

### Word Categories Covered
1. **Pronouns**: I, you, he, she, we, me, her, him, his, their
2. **Verbs**: is, go, be, was, were, had, saw, make, like, have, has, said, does, doing
3. **Prepositions/Conjunctions**: to, at, by, and, but, if, or, out
4. **Question words**: what, when, who, which, where, how
5. **Auxiliary verbs**: would, could, should
6. **Other**: it, a, the, no, so, there, come, some

## Technical Notes

### Test Coverage
- 40 tests covering:
  - Word bank structure (50+ words)
  - Difficulty distribution (1, 2, 3)
  - Level configuration
  - Word filtering by level
  - Content verification (pronouns, verbs, etc.)
  - Edge cases

### Implementation Details
- All lowercase except "I"
- Shuffling uses simple `sort(() => Math.random() - 0.5)`
- Difficulty acts as max filter (level 2 includes level 1 words)
- No scoring in logic layer (UI responsibility)

### Design Decisions
- Progressive word count builds stamina
- Includes Dolch and Fry sight words
- High-frequency words prioritized
- Difficulty 1 has most common words

## Educational Notes

### What Are Sight Words?
Sight words are words that should be recognized instantly without sounding out. Many don't follow standard phonics patterns:
- "the" - silent 'e'
- "said" - 'ai' says /eh/ not /ay/
- "was" - 'a' says /uh/ not /ah/

### Why These Words?
The 50+ words included represent some of the most common words in early reading materials. Mastering these helps children:
1. Read more fluently
2. Focus comprehension on decoding
3. Build confidence with common text
