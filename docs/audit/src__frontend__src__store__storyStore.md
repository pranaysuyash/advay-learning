# Audit: storyStore.ts

**Target**: `src/frontend/src/store/storyStore.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 3, Risk 2, Complexity 3, Changeability 3, Learning 2 = **13/25**

---

## Why This File?

This is the **story/quest store** for world progression - handles island unlocking, quest completion, XP, badges.

---

## Scoring Rationale

| Criterion     | Score | Justification                                  |
| ------------- | ----- | ---------------------------------------------- |
| Impact        | 3     | World progression, but secondary to core games |
| Risk          | 2     | Progress loss minor impact                     |
| Complexity    | 3     | Simple quest logic                             |
| Changeability | 3     | Feature-specific                               |
| Learning      | 2     | Standard patterns                              |

---

## Finding: STORY-01 — Helper Methods Outside Store (P2)

**Evidence** (lines 60-82): getUnlockedIslands etc are methods but use get().

**Root Cause**: Could be selectors.

**Fix Idea**: Convert to selectors or store methods.

---

## Finding: STORY-02 — Hardcoded Island IDs (P2)

**Evidence** (line 71): `['alphabet-lighthouse', 'number-nook', ...]`

**Root Cause**: Should come from data module.

**Fix Idea**: Import from quests data.

---

## Finding: STORY-03 — XP Hardcoded (P2)

**Evidence** (line 40): `totalXp: state.totalXp + 10`

**Root Cause**: Not configurable.

**Fix Idea**: Make XP configurable.

---

## Finding: STORY-04 — No Duplicate Quest Check (P2)

**Evidence**: completeQuest adds to completedQuests without checking.

**Root Cause**: Could add duplicates.

**Fix Idea**: Check if already completed.

---

## Prioritized Backlog

| ID       | Category     | Severity | Effort | Fix                     |
| -------- | ------------ | -------- | ------ | ----------------------- |
| STORY-01 | Architecture | P2       | 1h     | Convert to selectors    |
| STORY-02 | DRY          | P2       | 0.5h   | Import from data module |
| STORY-03 | Flexibility  | P2       | 0.5h   | Make XP configurable    |
| STORY-04 | Correctness  | P2       | 0.5h   | Add duplicate check     |

---

## Related Artifacts

- `src/frontend/src/data/quests.ts`
- `src/frontend/src/store/progressStore.ts`
