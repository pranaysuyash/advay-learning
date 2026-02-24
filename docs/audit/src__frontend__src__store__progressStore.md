# Audit: progressStore.ts

**Target**: `src/frontend/src/store/progressStore.ts`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 4, Changeability 3, Learning 2 = **16/25**

---

## Why This File?

This is the **progress store** for letter learning mastery - tracks letter attempts, batch unlocking, badges. Core to alphabet game progression.

---

## Scoring Rationale

| Criterion     | Score | Justification                                     |
| ------------- | ----- | ------------------------------------------------- |
| Impact        | 4     | Learning progress = core value proposition        |
| Risk          | 3     | Progress loss = bad UX but recoverable            |
| Complexity    | 4     | Batch logic, mastery thresholds, language support |
| Changeability | 3     | Core feature                                      |
| Learning      | 2     | Standard patterns                                 |

---

## Finding: PROG-01 — Magic Numbers Not Exported (P2)

**Evidence** (lines 39-41): BATCH_SIZE=5, MASTERY_THRESHOLD=70, UNLOCK_THRESHOLD=3 defined but only exported at bottom.

**Root Cause**: Inconsistent export location.

**Fix Idea**: Move exports up or consolidate constants.

---

## Finding: PROG-02 — markLetterAttempt is Complex (P2)

**Evidence** (lines 48-110): 60+ line function handles both new and existing.

**Root Cause**: Complex business logic.

**Fix Idea**: Split into markNewAttempt and updateExisting.

---

## Finding: PROG-03 — Helper Outside Store (P2)

**Evidence** (lines 182-202): getAvailableLetterIndices is standalone function.

**Root Cause**: Could be method on store.

**Fix Idea**: Add as store method.

---

## Finding: PROG-04 — No Validation on markLetterAttempt (P2)

**Evidence**: No validation that letter/language exists.

**Root Cause**: Could track invalid data.

**Fix Idea**: Add input validation.

---

## Finding: PROG-05 — get() Called in All Getters (P2)

**Evidence** (lines 112-150): Every getter calls get().

**Root Cause**: Expensive.

**Fix Idea**: Use selector where possible.

---

## Prioritized Backlog

| ID      | Category     | Severity | Effort | Fix                     |
| ------- | ------------ | -------- | ------ | ----------------------- |
| PROG-01 | DX           | P2       | 0.5h   | Consolidate constants   |
| PROG-02 | Complexity   | P2       | 2h     | Split markLetterAttempt |
| PROG-03 | Architecture | P2       | 0.5h   | Add as store method     |
| PROG-04 | Correctness  | P2       | 1h     | Add validation          |
| PROG-05 | Performance  | P2       | 1h     | Use selectors           |

---

## Related Artifacts

- `src/frontend/src/pages/alphabet-game/AlphabetGame.tsx`
- `src/frontend/src/store/index.ts`
