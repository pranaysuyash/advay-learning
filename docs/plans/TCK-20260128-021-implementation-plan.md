# IMPLEMENTATION PLAN: TCK-20260128-021

## Adaptive Batch Unlock Difficulty System

**Ticket**: TCK-20260128-021  
**Status**: Planning Complete  
**Planned Date**: 2026-01-28  
**Based on**: Q-001 Research Findings

---

## Overview

Implement adaptive difficulty progression where kids unlock letters in batches of 5 based on mastery, with parent override capability.

**Batch Structure**:

- Batch 1: Letters 1-5 (A-E for English)
- Batch 2: Letters 6-10 (F-J for English)
- Batch 3: Letters 11-15 (K-O for English)
- Batch 4: Letters 16-20 (P-T for English)
- Batch 5: Letters 21-26 (U-Z for English)

**Unlock Criteria**: Master 3 of 5 letters in current batch (70%+ accuracy)

---

## Implementation Plan

### Phase 1: Progress Store

1. **Create `progressStore.ts`**
   - Track per-letter mastery status
   - Store accuracy history per letter
   - Track unlocked batches
   - Methods: `markLetterMastered()`, `isBatchUnlocked()`, `getUnlockedLetters()`

2. **Letter Mastery Schema**:

   ```typescript
   interface LetterProgress {
     letter: string;
     attempts: number;
     bestAccuracy: number;
     mastered: boolean;
     lastAttemptDate: string;
   }
   ```

3. **Batch Tracking**:

   ```typescript
   interface BatchProgress {
     batchIndex: number;
     unlocked: boolean;
     lettersMastered: number;
     totalLetters: number;
   }
   ```

### Phase 2: Unlock Logic

1. **Check Mastery After Each Trace** (Game.tsx)
   - After `checkProgress()`, update letter progress
   - If accuracy >= 70%, mark as mastered
   - Check if batch unlock criteria met
   - If criteria met, unlock next batch
   - Show unlock celebration

2. **Get Available Letters** (alphabets.ts)
   - Modify `getLettersForGame()` to respect unlocked batches
   - Return only letters from unlocked batches

### Phase 3: Letter Journey UI

1. **Create `LetterJourney.tsx` Component**
   - Visual path/map showing all letters
   - Locked batches: Grayed out with lock icon
   - Current batch: Highlighted, in progress
   - Completed batches: Green checkmark
   - Clickable letters for practice

2. **Integration**
   - Add to Dashboard
   - Add "View Journey" button in Game completion screen

### Phase 4: Parent Override

1. **Settings Update**
   - Add "Unlock All Letters" button (with confirmation)
   - Show current progress: "Batch 2 of 5 unlocked"
   - Option to reset progress (start over)

2. **Confirmation Modal**
   - Warn that unlocking skips learning progression
   - Require explicit confirmation

### Phase 5: Gamification

1. **Batch Completion Badges**
   - Show badge when batch completed
   - Store earned badges

2. **Progress Celebration**
   - Confetti animation when unlocking new batch
   - "New Letters Unlocked!" message

---

## Files to Modify/Create

### New Files

1. `src/frontend/src/store/progressStore.ts` - Progress tracking
2. `src/frontend/src/components/LetterJourney.tsx` - Visual journey map
3. `src/frontend/src/components/BatchUnlockModal.tsx` - Unlock celebration

### Modified Files

1. `src/frontend/src/pages/Game.tsx` - Mastery tracking, unlock checks
2. `src/frontend/src/pages/Dashboard.tsx` - Add Journey button
3. `src/frontend/src/pages/Settings.tsx` - Parent override controls
4. `src/frontend/src/data/alphabets.ts` - Respect unlocked batches

---

## Data Flow

```
1. Kid traces letter in Game
   ↓
2. checkProgress() calculates accuracy
   ↓
3. If >= 70%, progressStore.markLetterMastered()
   ↓
4. Check if batch criteria met (3/5 mastered)
   ↓
5. If met, unlock next batch
   ↓
6. Show BatchUnlockModal celebration
   ↓
7. Dashboard shows updated Journey
```

---

## Acceptance Criteria

- [ ] Letters unlock in batches of 5
- [ ] Batch unlocks when 3/5 letters mastered at 70%+
- [ ] Visual Letter Journey shows progress
- [ ] Parent can unlock all letters in Settings
- [ ] Celebrations on batch unlock
- [ ] Progress persists across sessions
- [ ] All existing functionality preserved

---

## Testing Checklist

1. Start fresh - only Batch 1 available
2. Master 3 letters - Batch 2 unlocks
3. Master 3 more - Batch 3 unlocks
4. Continue until all unlocked
5. Test parent override in Settings
6. Test reset progress
7. Verify persistence after refresh

---

## Risks

| Risk | Mitigation |
|------|------------|
| Complex state management | Well-structured store with clear methods |
| UI clutter | Clean, simple Journey visualization |
| Kids frustrated by locked letters | Clear progress indication, celebrations |

---

## Next Steps

1. Create progressStore.ts
2. Update Game.tsx with mastery tracking
3. Create LetterJourney component
4. Update Settings with parent override
5. Test and verify
