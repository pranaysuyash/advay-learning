# Fraction Pizza - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `fraction-pizza`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Logic: `src/frontend/src/games/fractionPizzaLogic.ts` (56 lines)
- Tests: `src/frontend/src/games/__tests__/fractionPizzaLogic.test.ts` (49 tests)
- Spec: `docs/games/fraction-pizza-spec.md` (299 lines)

---

## Executive Summary

**Status:** PASS ✅

The Fraction Pizza game logic is well-implemented for teaching fraction concepts to young children. The implementation uses proper fraction generation with numerator/denominator validation and realistic wrong answer generation.

### Test Coverage
- **49 tests created**
- **49 tests passing** (100% pass rate)
- Tests cover: fraction generation, option building, level progression, scoring, edge cases

---

## Implementation Quality Assessment

### Strengths
1. **Proper fractions** - Ensures numerator < denominator
2. **Realistic wrong answers** - Mathematically distinct from correct answer
3. **Level-appropriate difficulty** - Max denominator increases (2, 4, 8)
4. **Value similarity checking** - Prevents options too close to correct answer
5. **Duplicate detection** - Uses value comparison to catch equivalent fractions

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `fractionPizzaLogic.ts` | 56 | Fraction generation, options |
| `fractionPizzaLogic.test.ts` | ~300 | Unit tests |
| `FractionPizza.tsx` | ~ | Main component (from spec) |

---

## Test Results

### Passing Tests (49/49) ✅

**generateFraction (15 tests)**
- Level 1 generates denominator ≤ 2
- Level 2 generates denominator ≤ 4
- Level 3 generates denominator ≤ 8
- Numerator always < denominator (proper fractions)
- All values are positive integers
- Handles all levels correctly

**generateOptions (12 tests)**
- Returns exactly 4 options
- Correct answer always included
- All options are unique values
- Wrong answers are different from correct
- Options are mathematically distinct (realistic distractors)
- Handles edge cases

**calculateScore (10 tests)**
- Base score calculation: 10 points
- Streak bonus: min(streak × 2, 10)
- Level multiplier: 1×, 1.5×, 2×
- Proper rounding with Math.floor()
- Score capping at correct values

**Integration (6 tests)**
- Complete round simulation
- Multi-level compatibility
- End-to-end scenarios

**Edge Cases (4 tests)**
- Minimum values
- Maximum streaks
- Level boundaries
- Invalid inputs

**Type Definitions (2 tests)**
- Fraction interface validation
- LevelConfig interface validation

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 56 |
| Exports | 6 (2 interfaces, 4 functions) |
| Test coverage | 49 tests |
| Test pass rate | 100% |
| Difficulty levels | 3 |

---

## Difficulty Levels

| Level | Max Denominator | Sample Fractions |
|-------|----------------|------------------|
| 1 | 2 | 1/2 |
| 2 | 4 | 1/2, 1/3, 2/3, 3/4 |
| 3 | 8 | 1/2 to 7/8 |

---

## Fraction Structure

```typescript
interface Fraction {
  numerator: number;      // Top number (1 to denominator-1)
  denominator: number;   // Bottom number (2 to 8)
}

interface LevelConfig {
  level: number;
  maxDenominator: number;
}
```

---

## Scoring System

```typescript
baseScore = 10;
streakBonus = min(streak × 2, 10);
multiplier = {1: 1, 2: 1.5, 3: 2};
finalScore = floor((baseScore + streakBonus) × multiplier);
```

### Score Examples

| Streak | Level 1 | Level 2 | Level 3 |
|--------|--------|--------|--------|
| 0 | 10 | 15 | 20 |
| 1 | 12 | 18 | 24 |
| 3 | 16 | 24 | 32 |
| 5+ | 20 | 30 | 40 |

---

## Fraction Generation

```typescript
export function generateFraction(level: number): Fraction {
  const config = getLevelConfig(level);
  const denominator = Math.floor(Math.random() * (config.maxDenominator - 1)) + 2;
  const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
  return { numerator, denominator };
}
```

### Key Features
- **Proper fractions** - numerator < denominator always
- **Level-appropriate** - denominator respects level's maxDenominator
- **Non-zero numerator** - minimum 1

---

## Option Generation

```typescript
export function generateOptions(correct: Fraction): string[] {
  const options: Fraction[] = [correct];

  while (options.length < 4) {
    const denom = Math.floor(Math.random() * 7) + 2; // 2 to 8
    const num = Math.floor(Math.random() * denom) || 1; // 1 to denom

    // Convert to decimal for comparison
    const val1 = correct.numerator / correct.denominator;
    const val2 = num / denom;

    // Check for duplicate (within 0.01)
    const isDuplicate = options.some(
      opt => Math.abs((opt.numerator / opt.denominator) - val2) < 0.01
    );

    // Check for too similar to correct (within 0.05)
    if (!isDuplicate && Math.abs(val1 - val2) > 0.05) {
      options.push({ numerator: num, denominator: denom });
    }
  }

  return options
    .sort(() => Math.random() - 0.5)
    .map(f => `${f.numerator}/${f.denominator}`);
}
```

### Safeguards
- **Duplicate detection** - Checks if option value is within 0.01 of existing
- **Similarity threshold** - Ensures wrong answers differ by > 0.05 from correct
- **4 options total** - 1 correct + 3 distractors
- **Shuffled output** - Correct answer position varies

---

## Visual Design (from spec)

| Element | Style |
|---------|-------|
| Pizza Shape | Circle divided into slices |
| Numerator | Highlighted/filled |
| Denominator | Outlined/empty |
| Options Grid | 4 fraction buttons |

---

## Educational Value

### Skills Developed
1. **Fraction Understanding** - Numerator/denominator, part-whole
2. **Math Skills** - Number sense, division concepts
3. **Visual Learning** - Pizza slice visualization
4. **Number Recognition** - Fraction notation
5. **Critical Thinking** - Comparing options

### Fraction Concepts Taught
1. Denominator - Total number of parts
2. Numerator - Number of selected parts
3. Part-Whole relationship
4. Equivalent fractions
5. Fraction comparison

---

## Comparison with Similar Games

| Feature | FractionPizza | MathMonsters | MathSmash |
|---------|---------------|--------------|-----------|
| Domain | Fractions | Arithmetic | Operations |
| Age Range | 5-10 | 5-10 | 6-12 |
| Visual | Pizza slices | Monsters | Expression |
| Input | Select fraction | Type answer | Smash operator |
| Difficulty | 3 levels | 3 levels | 3 levels |
| Test Coverage | 49 tests | 52 tests | ~ tests |
| Vibe | Chill | Active | Active |

---

## Conclusion

The Fraction Pizza game logic is **functionally correct** and **well-tested**. The implementation properly handles fraction concepts appropriate for the target age group and provides good educational value through realistic wrong answers. The value comparison approach to detecting duplicates and similar options is robust for the educational context.

**Audit Status:** APPROVED ✅
**All Tests:** PASSING ✅ (49/49)
**Documentation:** COMPLETE ✅
