# Audit Playbook v1.0

**Author:** Pranay  
**Date:** 2026-03-09  
**Based on:** 5 audits (Counting Collectathon, Shape Safari, useVoicePrompt, useGameSubscription, voice selection rescue)

---

## What Worked (Keep Doing)

### 1. Grep-First Discovery
**Pattern:** Always start with `rg` to find consumers and candidate sites, then investigate intent/contract before deciding what to change.

**Evidence:**
- Found `lastCollectTime` unused → deleted safely
- Found `voiceName` option existed but unwired → implemented intent
- Found `availableVoices` stubbed → rescued feature

**Why it works:** Prevents "cleanup" that breaks hidden dependencies.

---

### 2. Intent-First Over Evidence-Only
**Pattern:** When you see `@deprecated` or "unused," ask "was this abandoned or unfinished?"

**Evidence:**
- Voice selection: `@deprecated` comment was rationalization, not truth
- Infrastructure existed (`getVoices()`, `voiceName` option) but unwired
- Decision: Implement, don't delete

**Sticky note:** Check for partial wiring before deleting.

---

### 3. Decision Comments at Point of Change
**Pattern:** Document WHY at the exact location, not just in commit messages.

**Evidence:**
```typescript
// DECISION-2026-03-09: Error object wrapped in useMemo
// RATIONALE: Prevents unnecessary re-renders
// FIXES: FIND-001
```

**Why it works:** Future code readers see intent without git archaeology.

---

### 4. Test Edge Cases That Reveal Bugs
**Pattern:** Test NaN, Infinity, empty arrays, not just happy path.

**Evidence:**
- `calculateFinalScore([NaN, Infinity])` → revealed NaN propagation bug
- `getShapesAt({x: NaN, y: NaN})` → revealed silent failures

**Why it works:** Edge cases expose assumptions that happy path hides.

---

### 5. Telemetry as Default (Not Optional)
**Pattern:** Add error telemetry as part of error handling, not later.

**Evidence:**
- Counting Collectathon: Added `recordGameError`
- Shape Safari: Added `recordShapeSafariError` 
- useGameSubscription: Added `recordSubscriptionError` to store (deferred wiring)

**Why it works:** Production debugging without telemetry is guesswork.

---

## What Slowed Me Down (Stop/Change)

### 1. Mock Hell in Tests
**Problem:** Vitest mocks for Zustand stores and complex hooks took 30+ min to get right.

**Example:** useGameSubscription telemetry tests failed because store mock didn't resolve correctly.

**Fix:** 
- For complex store mocks, test behavior not implementation
- Skip telemetry unit tests, verify with integration tests
- Use `vi.hoisted()` earlier, not after fighting imports

---

### 2. Perfect Test Coverage vs. Ship Velocity
**Problem:** Spent 20 min trying to test `useEffect` telemetry when 5 min would verify the store method exists.

**Fix:** 
- Distinguish "infrastructure ready" vs "fully wired"
- Test store methods separately from hook integration
- Defer integration tests to when they can run against real store

---

### 3. Over-Reliance on Grep for Dynamic Code
**Problem:** `rg "symbol"` misses barrel exports, dynamic imports, template strings.

**Fix:**
- Add `rg -F` for exact matches
- Check `index.ts` barrel files explicitly
- Run tests after changes to catch missed references

---

## Next Iteration (Do Differently)

### 1. Test Infrastructure Before First Fix
**Current:** Fix code → Add tests → Fight mocks  
**Next:** Verify test setup works → Fix code → Tests pass

**Action:** Create test file with one mock test FIRST to verify harness.

---

### 2. Standardize Decision Comment Template
**Current:** Free-form comments  
**Next:** Strict template

```typescript
// DECISION-YYYY-MM-DD: <short description>
// CONTEXT: <what was the situation>
// OPTIONS: <what alternatives were considered>
// RATIONALE: <why this choice>
// FIXES: <finding ID if applicable>
// REVISIT: <when to reconsider>
```

---

### 3. Separate "Fix" from "Enhance" PRs
**Current:** Mixed FIND-001 (fix) + FIND-003 (enhancement) in same PR  
**Next:** 
- PR 1: Stability fix + tests (must have)
- PR 2: Telemetry wiring (nice to have)

**Why:** Easier review, cleaner rollback, clearer commit history.

---

### 4. Create Shared Telemetry Utility
**Current:** `recordGameError`, `recordShapeSafariError`, `recordSubscriptionError` (per-feature)  
**Next:** Single `recordError({ source, type, context })` with standardized schema

**Action:** Refactor after 3+ telemetry implementations to see pattern.

---

## Message to Pre-Audit-#1 Self

> **"Trust the grep, but verify with tests. Document the WHY at the code, not just in commits. Edge cases reveal truth. Don't delete until you understand why it was written."**

---

## Sticky Notes for Next Audit

| Color | Note |
|-------|------|
| 🟨 Yellow | "Check if @deprecated means 'abandoned' or 'unfinished'" |
| 🟩 Green | "Test NaN, Infinity, empty before declaring done" |
| 🟥 Red | "Add decision comment before moving to next file" |
| 🟦 Blue | "Mock check first - don't fight it for 30 min" |

---

## Confidence Levels (Self-Assessment)

| Skill | Audit #1 | Audit #5 | Growth |
|-------|----------|----------|--------|
| Grep patterns | 6/10 | 8/10 | +2 |
| Intent detection | 4/10 | 8/10 | +4 |
| Decision comments | 5/10 | 8/10 | +3 |
| Test mocks | 3/10 | 6/10 | +3 |
| Telemetry pattern | 2/10 | 7/10 | +5 |

---

## When to Use This Playbook

**Use for:**
- Any file audit > 100 lines
- Code cleanup decisions (delete vs. fix)
- Refactoring legacy code
- Pre-PR self-review

**Don't use for:**
- One-line fixes
- Pure formatting changes
- New feature greenfield (different mindset)

---

**Version:** 1.0  
**Next Review:** After 3 more audits or one major refactor
