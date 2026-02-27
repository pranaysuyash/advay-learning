# Game Upgrade Progress Tracker

**Started**: 2026-02-27  
**Goal**: Upgrade all 39 games to production-ready quality
**Ticket**: TCK-20260227-011

---

## Upgrade Checklist

Each game needs:
- [ ] Subscription check (`useSubscription` hook)
- [ ] Progress tracking (`progressQueue.add()`)
- [ ] Error handling (try/catch + error state)
- [ ] Reduce motion (`useReducedMotion`)
- [ ] Wellness timer (`<WellnessTimer />`)
- [ ] Error boundary (`<GlobalErrorBoundary>`)
- [ ] Access denied UI (`<AccessDenied>`)
- [ ] Memo wrapper (`memo()`)

---

## Progress

### ✅ COMPLETED (1/39)

1. **PhysicsDemo.tsx** - Fully upgraded
   - ✅ Subscription check
   - ✅ Progress tracking
   - ✅ Error handling
   - ✅ Reduce motion
   - ✅ Wellness timer
   - ✅ Error boundary
   - Score: 10/100 → **95/100** 🎉

---

### 🔄 IN PROGRESS (0/39)

---

### ⏳ PENDING (38/39)

#### P0 - Critical (Score < 30)
- [ ] NumberTracing.tsx (20/100)
- [ ] ColorByNumber.tsx (20/100)
- [ ] OddOneOut.tsx (20/100)
- [ ] ShadowPuppetTheater.tsx (20/100)
- [ ] KaleidoscopeHands.tsx (20/100)
- [ ] DiscoveryLab.tsx (20/100)
- [ ] PhonicsTracing.tsx (25/100)
- [ ] BeginningSounds.tsx (25/100)
- [ ] BubblePop.tsx (25/100)

#### P1 - High Priority (Score 28-35)
- [ ] YogaAnimals.tsx (28/100)
- [ ] PlatformerRunner.tsx (28/100)
- [ ] VirtualBubbles.tsx (28/100)
- [ ] FreeDraw.tsx (30/100)

#### P2 - Medium Priority (Score 35-43)
- [ ] LetterHunt.tsx (35/100)
- [ ] RhymeTime.tsx (35/100)
- [ ] FingerNumberShow.tsx (35/100)
- [ ] NumberTapTrail.tsx (35/100)
- [ ] MathMonsters.tsx (35/100)
- [ ] ShapePop.tsx (35/100)
- [ ] ShapeSequence.tsx (35/100)
- [ ] ShapeSafari.tsx (35/100)
- [ ] MemoryMatch.tsx (35/100)
- [ ] MusicPinchBeat.tsx (35/100)
- [ ] VirtualChemistryLab.tsx (35/100)
- [ ] EmojiMatch.tsx (35/100)
- [ ] StorySequence.tsx (35/100)
- [ ] SimonSays.tsx (38/100)
- [ ] PhonicsSounds.tsx (43/100)
- [ ] WordBuilder.tsx (43/100)
- [ ] ColorMatchGarden.tsx (43/100)
- [ ] ConnectTheDots.tsx (43/100)
- [ ] MirrorDraw.tsx (43/100)
- [ ] BubblePopSymphony.tsx (43/100)
- [ ] FreezeDance.tsx (43/100)
- [ ] SteadyHandLab.tsx (43/100)
- [ ] AirCanvas.tsx (43/100)
- [ ] DressForWeather.tsx (43/100)

#### P3 - Low Priority (Score > 50)
- [ ] AlphabetGame.tsx (58/100) - Already good, minor tweaks only

---

## Upgrade Pattern

```typescript
// 1. Add imports
import { memo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { AccessDenied } from '../components/ui/AccessDenied';
import { progressQueue } from '../services/progressQueue';
import { useProgressStore } from '../store';
import WellnessTimer from '../components/WellnessTimer';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';

// 2. Wrap in memo
export const MyGame = memo(function MyGameComponent() {
  // 3. Add hooks
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { canAccessGame, isLoading } = useSubscription();
  const hasAccess = canAccessGame('game-id');
  const { currentProfile } = useProgressStore();
  
  // 4. Check subscription
  if (isLoading) return <LoadingState />;
  if (!hasAccess) return <AccessDenied gameName="Game" gameId="game-id" />;
  
  // 5. Add progress save
  const handleComplete = async (score: number) => {
    try {
      await progressQueue.add({
        profileId: currentProfile.id,
        gameId: 'game-id',
        score,
        completed: true,
      });
    } catch (err) {
      setError(err as Error);
    }
  };
  
  // 6. Wrap in error boundary
  return (
    <GlobalErrorBoundary>
      {/* Game content */}
      <WellnessTimer />
    </GlobalErrorBoundary>
  );
});
```

---

## Batch Upgrade Strategy

### Batch 1: P0 Critical (9 games)
**Goal**: Fix business-critical issues  
**Timeline**: 2-3 days  
**Games**: Score < 30

### Batch 2: P1 High (4 games)
**Goal**: Fix accessibility & errors  
**Timeline**: 1 day  
**Games**: Score 28-35

### Batch 3: P2 Medium (24 games)
**Goal**: Standardize all games  
**Timeline**: 3-4 days  
**Games**: Score 35-43

### Batch 4: P3 Polish (1 game)
**Goal**: Minor improvements  
**Timeline**: 2 hours  
**Games**: Score > 50

---

## Notes

- **PhysicsDemo** upgraded first as proof of concept
- **NumberTracing** next (simplest of the low-scoring games)
- Use find/replace for consistency
- Test each game after upgrade
- Run audit script to verify improvements

---

**Last Updated**: 2026-02-27  
**Next**: NumberTracing.tsx
