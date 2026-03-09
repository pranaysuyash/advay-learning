# Syllable Clap - Game Specification

## Overview
**Game ID**: `syllable-clap`
**Educational Focus**: Phonological awareness, syllables, listening skills
**Target Age**: 4-7 years
**Code Location**: `src/frontend/src/games/syllableClapLogic.ts`

## Game Description
Children hear a word and clap or tap to count the number of syllables. This foundational phonological awareness skill is critical for reading readiness and spelling development.

## Educational Goals
1. Develop phonological awareness
2. Understand that words are made of syllables
3. Practice listening skills and rhythm
4. Build vocabulary through word exposure

## Game Logic

### Interfaces

```typescript
interface SyllableWord {
  word: string;           // The word to clap
  syllableCount: number;  // Number of syllables (1-4)
  hint: string;           // Context clue for the word
  emoji: string;          // Emoji representation
}

interface LevelConfig {
  level: number;          // Level number (1-4)
  wordCount: number;      // Number of words in level
  maxSyllables: number;   // Maximum syllables per word
}
```

### Content - SYLLABLE_WORDS (25 words)

#### 1 Syllable (6 words)
| Word | Count | Hint | Emoji |
|------|-------|------|-------|
| cat | 1 | A furry pet | 🐱 |
| dog | 1 | A barking pet | 🐕 |
| sun | 1 | It shines in the sky | ☀️ |
| ball | 1 | You throw and catch it | ⚽ |
| fish | 1 | It swims in water | 🐟 |
| bird | 1 | It flies in the sky | 🐦 |

#### 2 Syllables (9 words)
| Word | Count | Hint | Emoji |
|------|-------|------|-------|
| apple | 2 | A red or green fruit | 🍎 |
| flower | 2 | It smells nice | 🌸 |
| rainbow | 2 | It appears after rain | 🌈 |
| sunshine | 2 | It comes from the sun | ☀️ |
| water | 2 | We drink it every day | 💧 |
| happy | 2 | The opposite of sad | 😊 |
| baby | 2 | A very young child | 👶 |
| purple | 2 | A color like grapes | 🟣 |
| orange | 2 | A fruit and a color | 🍊 |

#### 3 Syllables (8 words)
| Word | Count | Hint | Emoji |
|------|-------|------|-------|
| banana | 3 | A long yellow fruit | 🍌 |
| elephant | 3 | A huge gray animal | 🐘 |
| butterfly | 3 | It has beautiful wings | 🦋 |
| computer | 3 | We use it to work and play | 💻 |
| dinosaur | 3 | An ancient reptile | 🦖 |
| chocolate | 3 | A sweet brown treat | 🍫 |
| strawberry | 3 | A red fruit with seeds | 🍓 |
| cucumber | 3 | A green vegetable | 🥒 |

#### 4 Syllables (2 words)
| Word | Count | Hint | Emoji |
|------|-------|------|-------|
| television | 4 | We watch shows on it | 📺 |
| helicopter | 4 | It flies with spinning blades | 🚁 |

### Level Progression

| Level | Word Count | Max Syllables |
|-------|------------|---------------|
| 1 | 4 | 1 |
| 2 | 6 | 2 |
| 3 | 8 | 3 |
| 4 | 10 | 4 |

### Core Functions

#### `getLevelConfig(level)`
Retrieves the configuration for a given level.

**Parameters:**
- `level: number` - Level number (1-4)

**Returns:** `LevelConfig`

**Behavior:**
- Returns matching level config if found
- Falls back to Level 1 for invalid level numbers

#### `getWordsForLevel(level)`
Generates a shuffled list of words appropriate for the level.

**Parameters:**
- `level: number` - Level number (1-4)

**Returns:** `SyllableWord[]` - Shuffled words matching level constraints

**Behavior:**
1. Gets level config
2. Filters words by syllable count (≤ maxSyllables)
3. Shuffles filtered words randomly
4. Returns first `wordCount` words

#### `checkAnswer(correct, answer)`
Validates if the user's answer matches the correct syllable count.

**Parameters:**
- `correct: number` - Actual syllable count
- `answer: number` - User's answer

**Returns:** `boolean` - true if correct

## Game Flow

### Per-Level Structure
1. Level starts with specified number of words
2. Each word is presented one at a time
3. Child hears word (audio) and sees hint + emoji
4. Child claps/taps the number of syllables
5. Immediate feedback on correctness
6. Level completes after all words are presented

### Progression
- Level 1: Only 1-syllable words (easiest)
- Level 2: Adds 2-syllable words
- Level 3: Adds 3-syllable words
- Level 4: Includes 4-syllable words (hardest)

## Technical Notes

### Dependencies
- Pure functional design (no external dependencies)

### Test Coverage
- 45 tests covering:
  - Word bank structure (25 words, 1-4 syllables)
  - Level configuration (4 levels, increasing difficulty)
  - Word filtering and shuffling per level
  - Answer validation
  - Edge cases (invalid levels, zero answers)
  - Integration scenarios

### Implementation Details
- Shuffling uses simple `sort(() => Math.random() - 0.5)`
- Invalid level inputs fall back to Level 1
- All words include hints and emojis for accessibility
- Syllable counts are predetermined (not algorithmically generated)

### Design Decisions
- Progressive difficulty by syllable count
- Increasing word count per level builds stamina
- 25 total words provide variety without overwhelming
- Emoji + hint provide multimodal support
