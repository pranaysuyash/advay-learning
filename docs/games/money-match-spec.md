# Money Match Game Specification

**Game ID:** `money-match`
**World:** Learning
**Vibe:** Chill
**Age Range:** 5-10 years
**CV Requirements:** None

---

## Overview

Money Match is an educational math game where children learn to count money and make change. Players see an amount of money and must identify the correct value.

### Tagline
"Count the coins! How much money? 💰"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Amount** - Display of coins
2. **Count Money** - Add up coin values
3. **Select Amount** - Choose correct total from options
4. **Get Feedback** - Instant feedback on correctness
5. **Continue** - Next round

### Controls

| Action | Input |
|--------|-------|
| Select amount | Click/tap amount button |
| Start game | Click "Start" button |
| Next round | Automatic after feedback |

---

## Difficulty Levels

### 3 Levels

| Level | Max Amount | Description |
|-------|------------|-------------|
| 1 | 10¢ | Small amounts (pennies, nickels) |
| 2 | 50¢ | Medium amounts (add dimes) |
| 3 | $1.00 | Larger amounts (add quarters) |

---

## Coins

### 4 Coin Types

| Coin | Value | Name | Emoji |
|------|-------|------|-------|
| Penny | 1¢ | Penny | 🪙 |
| Nickel | 5¢ | Nickel | 🪙 |
| Dime | 10¢ | Dime | 🪙 |
| Quarter | 25¢ | Quarter | 🪙 |

### Coin Properties

```typescript
interface Coin {
  value: number;   // 1, 5, 10, or 25
  name: string;    // "Penny", "Nickel", "Dime", "Quarter"
  emoji: string;   // 🪙
}
```

---

## Amount Generation

### Algorithm

```typescript
function generateAmount(level: number): number {
  config = getLevelConfig(level);
  return random(1, config.maxAmount);
}
```

### Amount Examples

| Level | Range | Examples |
|-------|-------|----------|
| 1 | 1-10¢ | 3¢, 7¢, 10¢ |
| 2 | 1-50¢ | 15¢, 32¢, 50¢ |
| 3 | 1-100¢ | 47¢, 85¢, 100¢ |

---

## Coin Calculation

### Algorithm

```typescript
function getCoinsForAmount(amount: number): Coin[] {
  coins = [];
  sorted = COINS.sort(descending by value);

  for (coin of sorted) {
    while (remaining >= coin.value) {
      coins.push(coin);
      remaining -= coin.value;
    }
  }

  return coins;
}
```

### Example Calculations

| Amount | Coins |
|--------|-------|
| 7¢ | 1 Nickel, 2 Pennies |
| 23¢ | 2 Dimes, 3 Pennies |
| 50¢ | 2 Quarters |
| 68¢ | 2 Quarters, 1 Dime, 1 Nickel, 3 Pennies |

---

## Scoring System

### Score Formula

```typescript
basePoints = 15;
streakBonus = Math.min(streak × 3, 15);
subTotal = basePoints + streakBonus;
multiplier = DIFFICULTY_MULTIPLIERS[level];
totalPoints = Math.floor(subTotal × multiplier);
```

### Score Examples

| Streak | Level 1 (1×) | Level 2 (1.5×) | Level 3 (2×) |
|--------|--------------|-----------------|---------------|
| 0 | 15 | 22 | 30 |
| 1 | 18 | 27 | 36 |
| 2 | 21 | 31 | 42 |
| 5+ | 30 | 45 | 60 |

### Max per Round

60 points (Level 3 with streak 5+)

---

## Visual Design

### UI Elements

- **Question:** "How much money?"
- **Coin Display:** Visual representation of coins
- **Options Grid:** 4 amount buttons
- **Feedback:** Correct/wrong indicators

### Coin Visual

| Element | Style |
|---------|-------|
| Shape | Circle |
| Color | Copper/Brown (penny), Silver (others) |
| Size | Varies by value |
| Labels | Value shown |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select amount | playClick() | None |
| Correct | playSuccess() | 'success' |
| Wrong | playError() | 'error' |
| Complete | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Levels | 3 | Progressive difficulty |
| Options per round | 4 | Multiple choice |
| Max amount (L1) | 10¢ | Simple counting |
| Max amount (L2) | 50¢ | Medium counting |
| Max amount (L3) | 100¢ | Complex counting |
| Coin types | 4 | Penny, Nickel, Dime, Quarter |
| Difficulty multipliers | 1×, 1.5×, 2× | By level |

---

## Data Structures

### Coin

```typescript
interface Coin {
  value: number;
  name: string;
  emoji: string;
}
```

### Level Config

```typescript
interface LevelConfig {
  level: number;
  maxAmount: number;
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `MoneyMatch.tsx` | ~ | Main component with game loop |
| `moneyMatchLogic.ts` | 70 | Amount generation, coin calculation |
| `moneyMatchLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`MoneyMatch.tsx`): UI, state, game loop, events
- **Logic** (`moneyMatchLogic.ts`): 70 lines - Amount generation, coin calculation, scoring
- **Tests** (`moneyMatchLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Money Skills**
   - Coin recognition
   - Value understanding
   - Coin counting

2. **Math Skills**
   - Addition
   - Number sense
   - Mental math

3. **Financial Literacy**
   - Currency concepts
   - Making change
   - Value comparison

4. **Visual Learning**
   - Seeing coin values
   - Grouping coins
   - Visual counting

5. **Decision Making**
   - Selecting correct amount
   - Estimating totals
   - Verification

---

## Money Concepts Taught

1. **Coin Values** - Penny = 1¢, Nickel = 5¢, etc.
2. **Counting** - Adding coin values
3. **Making Change** - Using larger coins first
4. **Equivalent Amounts** - Different coin combinations
5. **Decimal Notation** - $0.01, $0.05, etc.

---

## Comparison with Similar Games

| Feature | MoneyMatch | CountingObjects | NumberTapTrail |
|---------|-----------|-----------------|----------------|
| Domain | Money | Counting | Numbers |
| Age Range | 5-10 | 3-6 | 3-5 |
| Objects | Coins | Emojis | Tap targets |
| Skill | Money value | Count items | Number order |
| Difficulty | 3 levels | 3 levels | 1 level |
| Scoring | Streak + multiplier | Streak + multiplier | Accuracy |
| Test Coverage | ~ tests | 60 tests | - |
| Vibe | Chill | Chill | Active |

---

## Example Gameplay

### Level 1 Example

```
Question: "How much money?"

Coin Display:
🪙 🪙 🪙  🪙 🪙 🪙 🪙
(5¢) (5¢)   (1¢ each)

Options:
[7¢]  [10¢]  [12¢]  [15¢]

Answer: 12¢ (5 + 5 + 1 + 1)
```

### Level 3 Example

```
Question: "How much money?"

Coin Display: [Various coins totaling 73¢]

Options:
[65¢]  [70¢]  [73¢]  [80¢]

Answer: 73¢
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
