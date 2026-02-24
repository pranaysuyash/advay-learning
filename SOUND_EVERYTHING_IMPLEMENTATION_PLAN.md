# Sound Everything — Implementation Plan & Audit Checklist

**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001  
**Status**: READY FOR IMPLEMENTATION  

---

## Quick Reference: Which Sound for Which Interaction

| Interaction Type | Sound | When to Play | Latency Requirement |
|------------------|-------|--------------|---------------------|
| Button click | `click` | On click handler | <50ms |
| Success/correct | `success` | Immediate after correct answer | <100ms |
| Wrong/error | `error` | Immediate after wrong answer | <100ms |
| Modal open | `pop` | On modal mount/render | <50ms |
| Modal close | `pop` | On modal unmount/close | <50ms |
| Navigation | `flip` | On route change | <100ms |
| Hover/approach | `hover` | On element hover or proximity | <100ms |
| Collection/pickup | `pop` or `munch` | On item collected | <100ms |
| Achievement/win | `celebration` or `fanfare` | On level/game completion | <100ms |
| Loading start | `loading` or none | On fetch start | N/A |
| Form submit success | `success` | On successful submission | <100ms |
| Form submit error | `error` | On validation error | <100ms |
| Scroll/pan | *(none)* | Disabled (too noisy) | N/A |

---

## Phase 1: Core UI Audio Implementation (Days 1-3)

### Audit Checklist: Button Components

**File**: `src/frontend/src/components/ui/Button.tsx`

- [ ] Component reviewed
- [ ] Identify all onClick handlers
- [ ] Import useAudio hook
- [ ] Add playClick on every user-initiated click
- [ ] Test: Button makes click sound when pressed
- [ ] Test: Sound respects soundEnabled setting
- [ ] No TypeScript errors

**Pattern**:
```typescript
import { useAudio } from '@/utils/hooks/useAudio';

export function Button({ onClick, ...props }) {
  const { playClick } = useAudio();
  
  const handleClick = () => {
    playClick();
    onClick?.();
  };
  
  return <button onClick={handleClick} {...props} />;
}
```

### Audit Checklist: Card Component

**File**: `src/frontend/src/components/ui/Card.tsx`

- [ ] Component reviewed
- [ ] Identify interactive variants (if any)
- [ ] Add appropriate sounds on interaction
- [ ] Examples: click to expand, hover effects
- [ ] No TypeScript errors

### Audit Checklist: Modal Components

**Files**: 
- `src/frontend/src/components/dashboard/AddChildModal.tsx`
- `src/frontend/src/components/dashboard/EditProfileModal.tsx`
- *(find others)*

Per modal:
- [ ] Component reviewed
- [ ] Identify open trigger
- [ ] Add `playPop` on mount/open
- [ ] Identify close trigger
- [ ] Add `playPop` on unmount/close
- [ ] Test: Modal open/close sounds present
- [ ] No TypeScript errors

**Pattern**:
```typescript
import { useAudio } from '@/utils/hooks/useAudio';

export function MyModal({ isOpen, onClose }) {
  const { playPop } = useAudio();
  
  useEffect(() => {
    if (isOpen) playPop();
  }, [isOpen, playPop]);
  
  return isOpen ? <dialog>{/* content */}</dialog> : null;
}
```

### Audit Checklist: Form Components

**Files**: 
- `src/frontend/src/pages/Login.tsx`
- `src/frontend/src/pages/Register.tsx`
- `src/frontend/src/pages/Settings.tsx`
- *(find others)*

Per form:
- [ ] Component reviewed
- [ ] Identify form submit handler
- [ ] Add `playSuccess` on successful submission
- [ ] Add `playError` on validation/API errors
- [ ] Test: Success/error sounds on form interaction
- [ ] No TypeScript errors

**Pattern**:
```typescript
import { useAudio } from '@/utils/hooks/useAudio';

export function MyForm() {
  const { playSuccess, playError } = useAudio();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ... submit logic
      playSuccess();
    } catch (err) {
      playError();
    }
  };
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### Audit Checklist: Navigation

**File**: `src/frontend/src/App.tsx` or routing

- [ ] Identify route change handler
- [ ] Add `playFlip` on navigation
- [ ] Test: Navigation transitions have sound
- [ ] No TypeScript errors

---

## Phase 2: Games Audio Cleanup (Days 4-6)

### Game Inventory & Sound Status

| # | Game | Audio Already? | Missing Sounds | Priority |
|----|------|---|---|---|
| 1 | Finger Number Show | ✅ Partial | Approach, navigation | P1 |
| 2 | Alphabet Game | ✅ Partial | UI feedback sounds | P1 |
| 3 | Music Pinch Beat | ✅ Partial | Timing sounds | P1 |
| 4 | Shape Pop | ✅ Partial | Pop timing | P1 |
| 5 | Connect the Dots | ✅ Partial | Line draw sound | P1 |
| 6 | Letter Hunt | ✅ Partial | Approach/proximity | P2 |
| 7 | Steady Hand Lab | ⚠️ Minimal | Most interactions | P2 |
| 8 | Color Match Garden | ✅ Partial | Flower/match sounds | P3 |
| 9 | Number Tap Trail | ✅ Partial | Sequence feedback | P3 |
| 10 | Shape Sequence | ✅ Partial | Sequence sounds | P2 |
| 11 | Yoga Animals | ✅ Partial | Success/celebration | P2 |
| 12 | Freeze Dance | ✅ Partial | Timer, music sync | P2 |
| 13 | Simon Says | ✅ Partial | Move feedback | P3 |

### Per-Game Audit Template

**Game**: [Name]  
**File**: `src/frontend/src/pages/[GameName].tsx`

Interactions to audit:
- [ ] Game start → sound played?
- [ ] Correct answer → `success` played with <100ms latency?
- [ ] Wrong answer → `error` played with <100ms latency?
- [ ] Close/exit → `pop` sound played?
- [ ] Navigation within game → `flip` or similar?
- [ ] Hover/approach → `hover` sound?
- [ ] Game end/win → `celebration` or `fanfare` played?
- [ ] Any timing elements → timer sound needed?

**Actions**:
- [ ] Code reviewed
- [ ] Missing sounds identified
- [ ] Sounds added with proper hooks
- [ ] Timing verified (<100ms)
- [ ] Type-check passes
- [ ] Tested in browser

---

## Phase 3: Optional New Sounds (Days 7-8)

*Only if needed based on Phase 1/2 findings*

### Sound Types to Consider Adding

#### Timer Tick Sound
**Use case**: Countdown timers, timed games, duration feedback

**Pattern**:
```typescript
// In audioManager.ts
playTimerTick(): void {
  // Sharp, musical click 600-800 Hz, 50ms
}

// In game component
useEffect(() => {
  if (secondsRemaining <= 5 && secondsRemaining > 0) {
    playTimerTick(); // Play every second when low
  }
}, [secondsRemaining]);
```

#### Warning Buzz Sound
**Use case**: Time almost up, error condition, alarm

**Pattern**:
```typescript
// In audioManager.ts
playWarning(): void {
  // Buzzing sound, 200 Hz, 200ms, 3 pulses
}
```

#### Loading Shimmer Sound
**Use case**: Long-running operations, file loads, model initialization

**Pattern**:
```typescript
// In audioManager.ts
playLoading(): void {
  // Rising pitch sweep, 200-800 Hz, 300ms
}
```

---

## Implementation Workflow: Phase 1 Step-by-Step

### Step 1: Find All Button References
```bash
cd src/frontend && grep -r "handleClick\|onClick=" src/components/ui/Button.tsx | head -20
```

### Step 2: Add useAudio Hook
```typescript
import { useAudio } from '@/utils/hooks/useAudio';
const { playClick } = useAudio();
```

### Step 3: Wrap Click Handler
```typescript
const handleClick = (e) => {
  playClick();
  props.onClick?.(e);
};
```

### Step 4: Test
```bash
cd src/frontend && npm run test -- src/components/ui/Button.tsx
cd src/frontend && npm run type-check
```

### Step 5: Verify in Browser
- Go to component that uses Button
- Click button
- Confirm "click" sound plays
- Disable sound in Settings
- Click button again
- Confirm no sound plays

### Step 6: Repeat for All Components
Same process for Card, Modal, Form, etc.

---

## Files Modified Tracking

**Phase 1 Components**:
- [ ] `src/frontend/src/components/ui/Button.tsx` — ← Start here
- [ ] `src/frontend/src/components/ui/Card.tsx`
- [ ] `src/frontend/src/components/dashboard/AddChildModal.tsx`
- [ ] `src/frontend/src/components/dashboard/EditProfileModal.tsx`
- [ ] `src/frontend/src/pages/Login.tsx`
- [ ] `src/frontend/src/pages/Register.tsx`
- [ ] `src/frontend/src/pages/Settings.tsx`
- [ ] `src/frontend/src/App.tsx` (navigation)

**Phase 2 Games** (13 total):
- [ ] `src/frontend/src/pages/AlphabetGame.tsx`
- [ ] `src/frontend/src/pages/EmojiMatch.tsx`
- [ ] `src/frontend/src/pages/FreezeDance.tsx`
- [ ] *(11 more games)*

**Phase 3** (if needed):
- [ ] `src/frontend/src/utils/audioManager.ts` — Add new sounds

---

## Success Verification Checklist

**After Phase 1 Complete**:
- [ ] All core UI buttons make click sound
- [ ] All modals open/close with pop sound
- [ ] All forms show success/error sounds
- [ ] Navigation transitions have flip sound
- [ ] type-check passes: `npm run type-check`
- [ ] lint passes: `npm run lint`
- [ ] tests pass: `npm run test`

**After Phase 2 Complete**:
- [ ] All 13 games have sound on success/error
- [ ] All game interactions have sound (<100ms latency)
- [ ] No regressions in game functionality
- [ ] Sound toggle still works

**After Phase 3** (if done):
- [ ] New sounds (timer, warning, loading) integrated
- [ ] Used in appropriate components

---

## Common Issues & Solutions

### Issue: "Cannot find module useAudio"
**Solution**: Import from correct path: `@/utils/hooks/useAudio` (check tsconfig.json for `@` alias)

### Issue: "playClick is not defined"
**Solution**: Ensure destructuring: `const { playClick } = useAudio();`

### Issue: "Sound plays too late (>100ms latency)"
**Solution**: Move sound call before any async operations. Call synchronously in handler.

### Issue: "Sound plays even when soundEnabled is false"
**Solution**: useAudio hook checks this internally. Verify settings are persisting.

### Issue: "Sound plays multiple times"
**Solution**: Check for multiple event listeners or effect runs. Use cleanup: `useEffect(() => { /* code */ }, [dependency])`

---

## Documentation Updates Needed

After implementation:
- [ ] Update Settings UI to show sound controls
- [ ] Add comment to Button.tsx: "// Plays click sound on interaction"
- [ ] Update FEATURE.md with sound coverage stats
- [ ] Add to KNOWN_ISSUES.md if any deferred

---

## Next Steps After Implementation

1. Collect user feedback: Do kids engage more with sound?
2. Monitor performance: Any audio context issues?
3. Adjust volume if complaints
4. Phase 3 sounds (timer, warning) if research shows they help
5. Consider multi-language sound naming for global deployment

---

## References

**Code**:
- `src/frontend/src/utils/audioManager.ts` — Sound synthesis engine
- `src/frontend/src/utils/hooks/useAudio.ts` — React hook wrapper

**Documentation**:
- `docs/research/SOUND_EVERYTHING_RESEARCH_2026-02-24.md` — Research/architecture
- `docs/UI_UX_IMPROVEMENT_PLAN.md` — Design vision

**Related Tickets**:
- TCK-20260224-001 — This ticket
- TCK-20260223-004 — EmojiMatch audio work (predecessor)

