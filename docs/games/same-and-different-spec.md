# Same and Different - Game Specification

## Overview
**Game ID**: `same-different`
**Educational Focus**: Visual discrimination, comparison skills, categorization
**Target Age**: 2-5 years
**Code Location**: `src/frontend/src/games/sameAndDifferentLogic.ts`

## Game Description
Children compare two items side by side and identify whether they are the same or different. This builds visual discrimination skills and categorization abilities essential for early learning.

## Educational Goals
1. Visual discrimination skills
2. Comparison and matching
3. Vocabulary development
4. Categorical thinking
5. Decision making

## Game Logic

### Interfaces

```typescript
interface SameDifferentItem {
  id: string;      // Unique identifier (cat, dog, ball, etc.)
  label: string;   // Display label (Cat, Dog, Ball)
  emoji: string;   // Emoji identifier for visual display
}

interface SameAndDifferentRound {
  left: SameDifferentItem;   // Left side item
  right: SameDifferentItem;  // Right side item
  answer: 'same' | 'different';  // Correct answer
}
```

### Item Bank (6 items)

| ID | Label | Emoji Type |
|----|-------|------------|
| cat | Cat | cat |
| dog | Dog | dog |
| ball | Ball | ball |
| car | Car | car |
| tree | Tree | tree |
| fish | Fish | fish |

### Core Functions

#### `createSameAndDifferentRound(rng?: () => number): SameAndDifferentRound`
Creates a new comparison round.

**Behavior**:
1. RNG determines if round is "same" or "different" (50% each)
2. Randomly selects left item from ITEM_BANK
3. For "same" rounds: returns same item on both sides
4. For "different" rounds: selects different item from alternatives

**RNG Injection**:
- Default: `Math.random`
- Allows deterministic testing by providing custom RNG function

#### `isSameAndDifferentCorrect(round: SameAndDifferentRound, selectedAnswer: 'same' | 'different'): boolean`
Validates the player's answer.

**Parameters**:
- `round`: The current round data
- `selectedAnswer`: Player's choice ('same' or 'different')

**Returns**: `true` if answer matches round.answer

## Game Progression

### Round Structure
Each round presents:
- **Left item**: Always displayed
- **Right item**: Same or different from left
- **Decision**: Child taps "Same" or "Different"

### Difficulty Scaling
The game maintains consistent difficulty:
- 50% probability of "same" rounds
- 50% probability of "different" rounds
- 6 item bank provides variety
- No levels - all items accessible

### Anti-Pattern Prevention
- Same rounds show identical items (both sides same)
- Different rounds guarantee different items
- Random selection prevents predictable sequences

## Technical Notes

### RNG Dependency
All randomness flows through injected RNG:
```typescript
const sameRound = rng() > 0.5;
const left = ITEM_BANK[Math.floor(rng() * ITEM_BANK.length)];
const right = alternatives[Math.floor(rng() * alternatives.length)];
```

### Same Round Logic
```typescript
if (sameRound) {
  return { left, right: left, answer: 'same' };
}
```
Both sides reference the same item object.

### Different Round Logic
```typescript
const alternatives = ITEM_BANK.filter((entry) => entry.id \!== left.id);
const right = alternatives[Math.floor(rng() * alternatives.length)];
return { left, right, answer: 'different' };
```
Filters out the left item to ensure difference.

### Edge Cases
- Empty ITEM_BANK → Would cause errors (not handled, assume non-empty)
- RNG outside [0,1] → Clamped by Math.min/max in usage

## Design Decisions

### Six Item Bank
- Small number allows mastery
- Familiar objects to toddlers
- Clear visual distinctions
- Reduces cognitive load

### 50/50 Distribution
- Prevents answer bias
- Fair coin flip logic
- Keeps game unpredictable

### Same Object Reference
- For "same" rounds, both sides point to same object
- More efficient than duplication
- Ensures exact equality

### Emoji Type System
- `emoji` property stores identifier string
- UI layer maps to actual emoji characters
- Allows icon flexibility (Lucide vs emoji)

## Educational Design

### Visual Discrimination
- **Feature detection**: Noticing details (ears, wheels, leaves)
- **Pattern matching**: Recognizing identical items
- **Difference detection**: Spotting variations

### Cognitive Skills
- **Comparison**: Evaluating two items simultaneously
- **Decision making**: Binary choice (same/different)
- **Focus**: Attending to visual features

### Vocabulary Building
- Item labels teach common nouns
- Audio reinforcement can be added
- Bilingual support possible

### Age Appropriateness
- Simple binary choice
- No reading required (visual)
- Immediate feedback possible
- Short rounds (attention span)

## Extension Possibilities

### Future Enhancements
- **Level system**: Add more items over time
- **Categories**: Group by type (animals, objects)
- **Audio**: Speak item names
- **Streak tracking**: Count consecutive correct

### Item Expansion
Additional items could include:
- More animals (bird, rabbit)
- Food items (apple, banana)
- Household objects (cup, book)
- Nature items (flower, rock)

## Testing Notes

### Deterministic Testing
RNG injection enables predictable tests:
```typescript
const mockRng = () => 0.3; // Always returns 0.3
const round = createSameAndDifferentRound(mockRng);
// Always produces same result
```

### Test Coverage
- Same round generation
- Different round generation
- Answer validation
- RNG injection
- Edge cases
