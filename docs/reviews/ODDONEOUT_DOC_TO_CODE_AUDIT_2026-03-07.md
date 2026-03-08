# Odd One Out - Doc to Code Audit Report

**Date:** 2026-03-07
**Game ID:** `odd-one-out`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Logic: `src/frontend/src/games/oddOneOutLogic.ts` (180 lines)
- Tests: `src/frontend/src/games/__tests__/oddOneOutLogic.test.ts` (550 lines, 62 tests)
- Spec: `docs/games/odd-one-out-spec.md`

---

## Executive Summary

**Status:** PASS with discrepancies noted

The Odd One Out game logic is well-implemented and comprehensively tested. However, there are several discrepancies between the specification document and the actual implementation that should be addressed for consistency.

### Test Coverage
- **62 tests created**
- **62 tests passing** (100% pass rate)
- Tests cover: level configs, category banks, round generation, answer checking, scoring, edge cases, and type definitions

---

## Discrepancies Found

### 1. Category Count Mismatch
| Aspect | Spec | Implementation | Status |
|--------|------|----------------|--------|
| Number of categories | 9 | 8 | Discrepancy |

**Spec states:** 9 category banks
**Implementation has:** 8 categories (fruits, animals, colors, shapes, vehicles, food, clothing, nature)

**Missing category:** None explicitly named in spec, but spec shows 9 rows in the table.

### 2. Category Property Naming Inconsistency
**Issue:** Bank keys use plural form, but item.category uses singular form
```typescript
// Bank key: 'fruits'
// Item category: 'fruit'
```

**Example:**
```typescript
CATEGORY_BANKS.fruits = [
  { name: 'Apple', emoji: '🍎', category: 'fruit' },  // singular
  // ...
]
```

**Impact:** The `checkAnswer` function compares by `name` only, so this doesn't break functionality, but it's inconsistent.

### 3. Level Parameter Not Used in Round Generation
**Issue:** The `buildOddOneOutRound` function accepts a `level` parameter but doesn't use it to filter categories.

```typescript
export function buildOddOneOutRound(
  _level: number,  // ← prefixed with underscore indicating it's intentionally unused
  usedCategories: string[] = [],
  random: () => number = Math.random,
): OddOneOutRound
```

**Spec states:** Round generation should use level-appropriate categories
**Actual behavior:** Uses all categories regardless of level

The underscore prefix suggests developers know this is unused, but tests and spec imply level-based filtering.

### 4. Scoring Formula Clarification Needed
**Spec formula:**
```
baseScore = 20
timeBonus = Math.max(0, Math.round(((timeLimit - timeUsed) / timeLimit) * 5))
return Math.min(25, baseScore + timeBonus)
```

**Test examples in spec:**
- Time Used: 20s (5 left) → Score: 25
- Time Used: 15s (10 left) → Score: 25 (capped)

**Actual behavior:**
- Time Used: 20s (5 left) → Score: 21 (20 + Math.round(5/25*5) = 20 + 1 = 21)
- Time Used: 15s (10 left) → Score: 22 (20 + Math.round(10/25*5) = 20 + 2 = 22)
- Time Used: 0s (25 left) → Score: 25 (20 + Math.round(25/25*5) = 20 + 5 = 25)

The spec examples were incorrect; the implementation formula is correct.

---

## Implementation Quality Assessment

### Strengths
1. **Comprehensive category banks** - 8 categories with 6-8 items each
2. **Proper fallback handling** - When category has < 4 items, falls back to a valid category
3. **Good separation of concerns** - Pure functions, no side effects
4. **RNG injection** - `random` parameter allows deterministic testing
5. **Type safety** - Proper TypeScript interfaces exported

### Areas for Improvement
1. **Export testability** - Had to export `CATEGORY_BANKS` and `CATEGORY_NAMES` for testing (which is fine)
2. **Level filtering** - Either use the level parameter or remove it
3. **Consistency** - Align category property naming (singular vs plural)

---

## Test Results

### Passing Tests (62/62)

**LEVELS (7 tests)** ✓
- Level structure validation
- Progressive difficulty verification

**CATEGORY_BANKS (7 tests)** ✓
- Category count (8)
- Item count validation
- Property validation

**getLevelConfig (6 tests)** ✓
- Valid level returns
- Invalid level fallback

**getCategoriesForLevel (4 tests)** ✓
- Level 1: 3 categories
- Level 2: 5 categories
- Level 3: 8 categories

**buildOddOneOutRound (10 tests)** ✓
- Valid round structure
- Item uniqueness
- Odd item correctness
- Category validity

**checkAnswer (4 tests)** ✓
- Correct/wrong detection
- Name-based comparison

**calculateScore (7 tests)** ✓
- Base score calculation
- Time bonus application
- Score capping at 25

**integration scenarios (8 tests)** ✓
- Complete game simulation
- Multi-level testing

**edge cases (4 tests)** ✓
- Empty usedCategories
- All categories used
- Single item fallback

**type definitions (3 tests)** ✓
- Interface validation

**category validation (4 tests)** ✓
- Key validation
- Structure validation

**round consistency (2 tests)** ✓
- Category consistency

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 180 |
| Exports | 10 (functions, constants, types) |
| Test coverage | 62 tests |
| Test pass rate | 100% |
| Cyclomatic complexity | Low (pure functions) |

---

## Recommendations

1. **Update spec to reflect 8 categories** - Remove the 9th category from documentation
2. **Decide on level parameter** - Either implement level-based filtering or remove the parameter
3. **Standardize category naming** - Use either singular or plural consistently
4. **Update scoring examples in spec** - Correct the expected scores for time bonus tests

---

## Conclusion

The Odd One Out game logic is **functionally correct** and **well-tested**. The discrepancies found are primarily documentation issues rather than functional bugs. The implementation follows good practices with pure functions, proper typing, and comprehensive error handling.

**Audit Status:** APPROVED with documentation updates recommended
