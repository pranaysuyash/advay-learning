# Game Quality Remediation Plan

**Date**: 2026-03-02  
**Source**: GAME_QUALITY_AUDIT_REPORT.md  
**Scope**: 39 games with quality issues  
**Ticket**: TCK-20260302-005

---

## Executive Summary

**Current State**: 33.3/100 health score across 39 games  
**Target State**: 80+/100 health score  
**Critical Issues**: 5 systemic issues affecting 90%+ of games

---

## Issue Register

| ID | Issue | Games Affected | Severity | Effort | Priority |
|----|-------|----------------|----------|--------|----------|
| **GQ-001** | PhysicsDemo incomplete | 1 | Critical | M | **P0** |
| **GQ-002** | Missing subscription checks | 38 (97%) | Critical | M | **P0** |
| **GQ-003** | Missing progress tracking | 37 (95%) | Critical | M | **P0** |
| **GQ-004** | Missing error handling | 36 (92%) | High | S | **P1** |
| **GQ-005** | Missing reduce motion | 34 (87%) | High | S | **P1** |
| **GQ-006** | Console.log statements | 14 (56%) | Medium | XS | **P1** |
| **GQ-007** | Missing wellness features | 34 (87%) | Medium | M | **P2** |
| **GQ-008** | Missing TTS instructions | 25 (64%) | Low | S | **P2** |

---

## PR Plan

### PR-1: PhysicsDemo Decision (GQ-001)
**Goal**: Decide and execute on PhysicsDemo

**Options**:
1. **Remove**: Delete PhysicsDemo.tsx and route
2. **Fix**: Implement all missing features (estimated 2-3 days)

**Decision needed**: Product owner approval

---

### PR-2: Shared Infrastructure (GQ-002, GQ-003)
**Goal**: Create shared hooks for subscription and progress

**Files to Create**:
- `src/frontend/src/hooks/useGameSubscription.ts`
- `src/frontend/src/hooks/useGameProgress.ts`
- `src/frontend/src/components/GameContainer.tsx` (wrapper)

**Pattern**:
```typescript
// useGameSubscription.ts
export function useGameSubscription(gameId: string) {
  const { canAccessGame } = useSubscription();
  const hasAccess = canAccessGame(gameId);
  return { hasAccess, AccessDenied: <AccessDenied game={gameId} /> };
}

// useGameProgress.ts
export function useGameProgress(gameId: string) {
  const { currentProfile } = useProgressStore();
  
  const saveProgress = useCallback(async (score: number, completed: boolean) => {
    if (!currentProfile) return;
    await progressQueue.add({
      profileId: currentProfile.id,
      gameId,
      score,
      completed,
      timestamp: Date.now(),
    });
  }, [currentProfile, gameId]);
  
  return { saveProgress };
}
```

---

### PR-3: High-Priority Game Fixes (GQ-002, GQ-003, GQ-004, GQ-005)
**Goal**: Fix 9 high-risk games

**Games**:
1. NumberTracing.tsx
2. ColorByNumber.tsx
3. OddOneOut.tsx
4. ShadowPuppetTheater.tsx
5. KaleidoscopeHands.tsx
6. DiscoveryLab.tsx
7. PhonicsTracing.tsx
8. BeginningSounds.tsx
9. BubblePop.tsx

**Changes per game**:
- Add subscription check
- Add progress tracking
- Wrap in error boundary
- Add reduce motion support

---

### PR-4: Quick Wins (GQ-006)
**Goal**: Remove console.log statements from 14 games

**Games**:
- YogaAnimals.tsx (2)
- PlatformerRunner.tsx (2)
- VirtualBubbles.tsx (1)
- PhonicsSounds.tsx (1)
- WordBuilder.tsx (1)
- ColorMatchGarden.tsx (1)
- ConnectTheDots.tsx (4)
- MirrorDraw.tsx (1)
- BubblePopSymphony.tsx (1)
- FreezeDance.tsx (2)
- SteadyHandLab.tsx (1)
- AirCanvas.tsx (1)
- DressForWeather.tsx (1)
- AlphabetGame.tsx (1)

---

### PR-5: Remaining Games Batch Fix (GQ-002, GQ-003)
**Goal**: Apply shared hooks to remaining 25 games

**Approach**:
1. Update GameContainer wrapper
2. Batch update 5 games per day
3. Test each batch

---

## Implementation Order

| Order | PR | Issue | Impact | Effort |
|-------|-----|-------|--------|--------|
| 1 | PR-2 | Shared infrastructure | All games | 1 day |
| 2 | PR-4 | Console.log cleanup | 14 games | 0.5 day |
| 3 | PR-3 | High-priority games | 9 games | 3 days |
| 4 | PR-1 | PhysicsDemo decision | 1 game | 0.5 day |
| 5 | PR-5 | Remaining games | 25 games | 5 days |

**Total Estimated Time**: ~10 days

---

## Success Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Health Score | 33.3/100 | 80+/100 | Automated audit |
| Subscription Checks | 3% | 100% | Code grep |
| Progress Tracking | 5% | 100% | Code grep |
| Error Handling | 8% | 100% | Code grep |
| Reduce Motion | 13% | 100% | Code grep |
| Console.log | 56% | 0% | Code grep |

---

## Reference: AlphabetGame.tsx Pattern

Use as model for fixes:

```typescript
// Key features present:
✅ useSubscription check
✅ progressQueue integration
✅ Error boundary
✅ useReducedMotion
✅ WellnessTimer
✅ Error handling try/catch
✅ No console.log
✅ TTS support
✅ Game drops
```

---

## Rollback Plan

- All changes are additive (new hooks/wrappers)
- Feature flags can disable new checks if needed
- Gradual rollout per-game
