# 🚀 LAUNCH SPRINT SPECIFICATION
## Advay Vision Learning - 4-Day Launch Readiness

**Sprint Start**: March 8, 2026  
**Sprint End**: March 12, 2026  
**Duration**: 4 Days (96 hours)  
**Target**: Production Launch Ready  

---

## 📋 EXECUTIVE SUMMARY

This spec breaks down launch readiness into 4 parallel tracks executable by multiple agents simultaneously. The key insight: **GameShell already provides subscription gating, error handling, and wellness timers**. The work is primarily **wrapping existing game components with GameShell** and **adding saveProgress calls**.

### The 3 Critical Fixes (Must Complete):
1. **Subscription Gating**: Wrap all games with GameShell (provides subscription check)
2. **Progress Tracking**: Add saveProgress calls to all games
3. **Test Stability**: Fix timeout issues

### The 2 Important Fixes:
4. **Security**: Fix npm vulnerabilities
5. **Accessibility**: Add reduced-motion support

---

## 🎯 SUCCESS CRITERIA

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Subscription Gating | 100% | 3% | ❌ |
| Progress Tracking | 100% | 5% | ❌ |
| Error Handling | 100% | 8% | ❌ |
| Test Stability | 100% | 0% | ❌ |
| Security (npm) | 0 vulnerabilities | 4 HIGH | ❌ |
| Accessibility (reduce-motion) | 100% | 13% | ❌ |

---

## 📦 TRACK STRUCTURE

```
TRACK A: Subscription & Progress (HIGHEST PRIORITY)
├── Task A1: GameShell Wrap - Batch 1 (15 games)
├── Task A2: GameShell Wrap - Batch 2 (15 games)  
├── Task A3: GameShell Wrap - Batch 3 (15 games)
├── Task A4: Verify subscription gating works end-to-end
└── Task A5: Verify progress saves to database

TRACK B: Test Stability
├── Task B1: Diagnose frontend test timeout
├── Task B2: Implement test fixes
├── Task B3: Run full test suite (verify < 60s)
└── Task B4: CI pipeline validation

TRACK C: Security & Dependencies  
├── Task C1: Fix npm audit vulnerabilities
├── Task C2: Run pip-audit on backend
├── Task C3: Verify CORS config in production
└── Task D4: Security scan of staged files

TRACK D: Accessibility & UX Polish
├── Task D1: Add reduce-motion to remaining games
├── Task D2: Verify wellness timers in all games
└── Task D3: Console.log cleanup (22 games)
```

---

## 🏃 TRACK A: Subscription & Progress Integration

### Why This Is The Priority

**GameShell already provides**:
- ✅ Subscription access control via `useGameSubscription(gameId)`
- ✅ Error boundary via `GameErrorBoundary`
- ✅ Wellness timer via `WellnessTimer`
- ✅ Reduced motion support via `useReducedMotion()`

**What's missing**: Games aren't wrapped with GameShell.

### The Pattern (Copy This)

```tsx
// OLD PATTERN (broken - no subscription, no progress)
export const SomeGame = () => {
  return <GameContent />;
};

// NEW PATTERN (correct)
import { GameShell } from '../components/GameShell';
import { useGameProgress } from '../hooks/useGameProgress';

export const SomeGame = () => {
  const { saveProgress } = useGameProgress('some-game-id');
  
  const handleGameComplete = async (score: number, completed: boolean) => {
    await saveProgress({ score, completed, level: currentLevel });
  };
  
  return (
    <GameShell gameId="some-game-id" gameName="Some Game">
      <GameContent onComplete={handleGameComplete} />
    </GameShell>
  );
};
```

### Game Assignment Batches

#### BATCH 1 (15 games) - Agent A1
**Files**: `src/frontend/src/pages/`

| # | Game File | gameId | Current Status | Action Required |
|---|-----------|--------|----------------|------------------|
| 1 | LetterHunt.tsx | letter-hunt | ❌ No GameShell | Wrap + saveProgress |
| 2 | NumberTapTrail.tsx | number-tap-trail | ❌ No GameShell | Wrap + saveProgress |
| 3 | WordBuilder.tsx | word-builder | ❌ No GameShell | Wrap + saveProgress |
| 4 | StoryBuilder.tsx | story-builder | ❌ No GameShell | Wrap + saveProgress |
| 5 | PhonicsSounds.tsx | phonics-sounds | ❌ No GameShell | Wrap + saveProgress |
| 6 | PhonicsTracing.tsx | phonics-tracing | ❌ No GameShell | Wrap + saveProgress |
| 7 | BeginningSounds.tsx | beginning-sounds | ❌ No GameShell | Wrap + saveProgress |
| 8 | EndingSounds.tsx | ending-sounds | ❌ No GameShell | Wrap + saveProgress |
| 9 | LetterSoundMatch.tsx | letter-sound-match | ❌ No GameShell | Wrap + saveProgress |
| 10 | OddOneOut.tsx | odd-one-out | ⚠️ Partial | Verify + add saveProgress |
| 11 | SameAndDifferent.tsx | same-and-different | ❌ No GameShell | Wrap + saveProgress |
| 12 | ShadowMatch.tsx | shadow-match | ❌ No GameShell | Wrap + saveProgress |
| 13 | ShadowPuppetTheater.tsx | shadow-puppet-theater | ❌ No GameShell | Wrap + saveProgress |
| 14 | VirtualBubbles.tsx | virtual-bubbles | ❌ No GameShell | Wrap + saveProgress |
| 15 | KaleidoscopeHands.tsx | kaleidoscope-hands | ❌ No GameShell | Wrap + saveProgress |

#### BATCH 2 (15 games) - Agent A2
**Files**: `src/frontend/src/pages/`

| # | Game File | gameId | Current Status | Action Required |
|---|-----------|--------|----------------|------------------|
| 1 | AirGuitarHero.tsx | air-guitar-hero | ❌ No GameShell | Wrap + saveProgress |
| 2 | FruitNinjaAir.tsx | fruit-ninja-air | ❌ No GameShell | Wrap + saveProgress |
| 3 | CountingObjects.tsx | counting-objects | ❌ No GameShell | Wrap + saveProgress |
| 4 | MoreOrLess.tsx | more-or-less | ❌ No GameShell | Wrap + saveProgress |
| 5 | NumberSequence.tsx | number-sequence | ❌ No GameShell | Wrap + saveProgress |
| 6 | BlendBuilder.tsx | blend-builder | ❌ No GameShell | Wrap + saveProgress |
| 7 | SyllableClap.tsx | syllable-clap | ❌ No GameShell | Wrap + saveProgress |
| 8 | SightWordFlash.tsx | sight-word-flash | ❌ No GameShell | Wrap + saveProgress |
| 9 | MazeRunner.tsx | maze-runner | ❌ No GameShell | Wrap + saveProgress |
| 10 | PathFollowing.tsx | path-following | ❌ No GameShell | Wrap + saveProgress |
| 11 | RhythmTap.tsx | rhythm-tap | ❌ No GameShell | Wrap + saveProgress |
| 12 | AnimalSounds.tsx | animal-sounds | ❌ No GameShell | Wrap + saveProgress |
| 13 | BodyParts.tsx | body-parts | ❌ No GameShell | Wrap + saveProgress |
| 14 | VoiceStories.tsx | voice-stories | ❌ No GameShell | Wrap + saveProgress |
| 15 | ReadingAlong.tsx | reading-along | ❌ No GameShell | Wrap + saveProgress |

#### BATCH 3 (15 games) - Agent A3
**Files**: `src/frontend/src/pages/`

| # | Game File | gameId | Current Status | Action Required |
|---|-----------|--------|----------------|------------------|
| 1 | MathSmash.tsx | math-smash | ❌ No GameShell | Wrap + saveProgress |
| 2 | ColorSortGame.tsx | color-sort | ❌ No GameShell | Wrap + saveProgress |
| 3 | LetterCatcher.tsx | letter-catcher | ❌ No GameShell | Wrap + saveProgress |
| 4 | NumberBubblePop.tsx | number-bubble-pop | ❌ No GameShell | Wrap + saveProgress |
| 5 | PopTheNumber.tsx | pop-the-number | ❌ No GameShell | Wrap + saveProgress |
| 6 | RainbowBridge.tsx | rainbow-bridge | ❌ No GameShell | Wrap + saveProgress |
| 7 | BeatBounce.tsx | beat-bounce | ❌ No GameShell | Wrap + saveProgress |
| 8 | BubbleCount.tsx | bubble-count | ❌ No GameShell | Wrap + saveProgress |
| 9 | FeedTheMonster.tsx | feed-the-monster | ❌ No GameShell | Wrap + saveProgress |
| 10 | ShapeStacker.tsx | shape-stacker | ❌ No GameShell | Wrap + saveProgress |
| 11 | SizeSorting.tsx | size-sorting | ❌ No GameShell | Wrap + saveProgress |
| 12 | DigitalJenga.tsx | digital-jenga | ❌ No GameShell | Wrap + saveProgress |
| 13 | WeatherMatch.tsx | weather-match | ❌ No GameShell | Wrap + saveProgress |
| 14 | FractionPizza.tsx | fraction-pizza | ❌ No GameShell | Wrap + saveProgress |
| 15 | TimeTell.tsx | time-tell | ❌ No GameShell | Wrap + saveProgress |

### Reference Implementation (How It Should Look)

**File**: `src/frontend/src/pages/EmojiMatch.tsx` (lines 964-971)
```tsx
<GameShell
  gameId="emoji-match"
  gameName="Emoji Match"
  showWellnessTimer={true}
  enableErrorBoundary={true}
>
  <EmojiMatchContent />
</GameShell>
```

**File**: `src/frontend/src/pages/NumberTracing.tsx` (lines 323-332)
```tsx
const { saveProgress } = useGameProgress('number-tracing');

const handleComplete = async (score: number, completed: boolean) => {
  await saveProgress({
    score,
    completed,
    level: currentLevel,
    metadata: { hintsUsed }
  });
};
```

### Task A4: Verify Subscription Gating

**Steps**:
1. Start backend: `cd src/backend && python -m uvicorn app.main:app --reload --port 8001`
2. Start frontend: `cd src/frontend && npm run dev`
3. Login as test user (no subscription)
4. Navigate to each wrapped game
5. Verify "Premium Game" locked screen appears
6. Document evidence with screenshots

**Expected Result**: All 45 games show locked screen for non-subscribed users

### Task A5: Verify Progress Tracking

**Steps**:
1. With test user, play each wrapped game
2. Complete a session (score > 0, completed = true)
3. Check database: `SELECT * FROM progress WHERE game_id = 'xyz';`
4. Verify record exists with correct score

**Expected Result**: Progress records appear in database for all wrapped games

---

## 🧪 TRACK B: Test Stability

### Current Problem

Both frontend and backend tests timeout after 120 seconds. This breaks CI/CD.

### Task B1: Diagnose Frontend Test Timeout

**Execute**:
```bash
cd src/frontend
# Run tests with verbose timing
npm test -- --reporter=verbose 2>&1 | head -100
```

**Check for**:
- Tests that hang indefinitely
- Tests waiting for network/DB
- Tests with infinite loops
- Mock setup issues

**Likely Causes** (from codebase analysis):
1. TTS/Kokoro worker initialization in tests
2. MediaPipe loading in tests
3. API calls not mocked

**Solution Path**:
- Mock `useTTS` in test setup
- Mock MediaPipe imports
- Add test timeouts

### Task B2: Implement Test Fixes

**File to create/modify**: `src/frontend/src/test/setup.ts`

Add mocks:
```typescript
// Mock TTS to prevent worker initialization
vi.mock('../hooks/useTTS', () => ({
  useTTS: () => ({
    speak: vi.fn(),
    isSpeaking: false,
    stop: vi.fn(),
  }),
}));

// Mock MediaPipe
vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: {
    forVisionTasks: vi.fn().mockResolvedValue({
      createTaskFromModel: vi.fn(),
    }),
  },
}));
```

**Existing smoke tests** to reference:
- `src/frontend/src/pages/__tests__/CameraRoutes.smoke.test.tsx` (already has TTS mock)

### Task B3: Run Full Test Suite

**Target**: < 60 seconds for full suite

**Commands**:
```bash
cd src/frontend
npm test -- --run  # Single run, no watch

# Should complete in < 60s
# Target: 200+ tests passing
```

### Task B4: CI Pipeline Validation

**Commands**:
```bash
# Simulate CI environment
cd src/frontend
CI=true npm test -- --run

# Should pass without timeout
```

---

## 🔒 TRACK C: Security & Dependencies

### Task C1: Fix npm Audit Vulnerabilities

**Current Issues** (4 HIGH):
```
serialize-javascript <=7.0.2 (RCE vulnerability)
vite-plugin-pwa (transitive dependency)
```

**Fix**:
```bash
cd src/frontend

# Option 1: Non-breaking (recommended)
npm install vite-plugin-pwa@0.19.8 --save-dev

# Option 2: Breaking (if needed)
npm audit fix --force
```

**Verify**:
```bash
npm audit
# Should show 0 vulnerabilities
```

### Task C2: Backend Dependency Audit

**Execute**:
```bash
cd src/backend
source .venv/bin/activate
pip-audit || pip freeze | grep -v "^-e" | sort
```

**If pip-audit not available**:
```bash
pip install pip-audit
pip-audit
```

**Fix any HIGH/CRITICAL vulnerabilities**

### Task C3: CORS Production Check

**File**: `src/backend/app/main.py`

**Verify**:
```python
# Should NOT be:
allow_origins=["*"]  # DANGEROUS

# Should BE:
allow_origins=["https://yourdomain.com"]  # Production domain
```

**Also verify**:
```python
# These should be restricted, not "*"
allow_methods=["GET", "POST", "PUT", "DELETE"]  # Not ["*"]
allow_headers=["Authorization", "Content-Type"]  # Not ["*"]
```

### Task C4: Secret Scan

**Execute**:
```bash
# Pre-commit hook should catch this, but verify
./scripts/secret_scan.sh
```

**Check for**:
- Hardcoded API keys
- Passwords in code
- JWT secrets in git history

---

## ♿ TRACK D: Accessibility & UX Polish

### Task D1: Add Reduce-Motion Support

**GameShell already provides this**:
```tsx
const reducedMotion = useReducedMotion();
// Apply class: reducedMotion ? 'reduce-motion' : ''
```

**Action**: Verify all wrapped games apply this class

**Check**: Look for `.reduce-motion` CSS class usage

**If missing**, add to game container:
```tsx
<div className={reducedMotion ? 'reduce-motion' : ''}>
  {/* game content */}
</div>
```

### Task D2: Verify Wellness Timers

**GameShell provides**: `<WellnessTimer />` when `showWellnessTimer={true}`

**Verify each game has**: `showWellnessTimer={true}` in GameShell props

### Task D3: Console.log Cleanup

**Find all console.log statements**:
```bash
cd src/frontend
rg "console\.log" src/pages/ --type=tsx -l
```

**Expected**: 22+ files have console.log

**Fix**: Replace with proper logging or remove

---

## 📊 PARALLEL EXECUTION MATRIX

| Day | Track A (Subscription) | Track B (Tests) | Track C (Security) | Track D (Accessibility) |
|-----|----------------------|-----------------|-------------------|------------------------|
| **Day 1** | A1: Batch 1 (15 games) | B1: Diagnose timeout | C1: Fix npm audit | D1: Verify reduce-motion |
| **Day 2** | A2: Batch 2 (15 games) | B2: Implement fixes | C2: pip-audit | D2: Verify wellness timers |
| **Day 3** | A3: Batch 3 (15 games) | B3: Run test suite | C3: CORS check | D3: Console.log cleanup |
| **Day 4** | A4+A5: Verify E2E | B4: CI validation | C4: Secret scan | Final polish |

### Agent Assignment

| Agent | Primary Task | Backup Task |
|-------|-------------|-------------|
| Agent 1 | A1 + A4 (Batch 1 + Verify) | D1 |
| Agent 2 | A2 (Batch 2) | D2 |
| Agent 3 | A3 (Batch 3) | D3 |
| Agent 4 | B1 + B2 + B3 (Tests) | C1 |
| Agent 5 | C1 + C2 + C3 + C4 (Security) | B4 |

---

## ✅ VERIFICATION CHECKLIST

### End of Day 1
- [ ] 15 games wrapped with GameShell
- [ ] Test timeout cause identified
- [ ] npm audit fix applied

### End of Day 2
- [ ] 30 games wrapped with GameShell
- [ ] Test fixes implemented
- [ ] Backend dependencies audited

### End of Day 3
- [ ] 45 games wrapped with GameShell
- [ ] Tests pass in < 60s
- [ ] CORS configured for production
- [ ] Wellness timers verified

### End of Day 4
- [ ] Subscription gating works end-to-end
- [ ] Progress saves to database
- [ ] All tests pass (CI ready)
- [ ] 0 security vulnerabilities
- [ ] Console.log removed from games
- [ ] **READY FOR LAUNCH**

---

## 🚨 ESCALATION PROCEDURES

### If Track A (Subscription) Falls Behind
- Reduce game count: Focus on most-played 20 games first
- Defer: Less popular games can be wrapped post-launch

### If Track B (Tests) Falls Behind  
- Extend timeout in CI temporarily
- Mark as known issue, fix post-launch

### If Track C (Security) Falls Behind
- Block launch if HIGH vulnerabilities remain
- Defer: CORS hardening can be post-launch hotfix

### If Track D (Accessibility) Falls Behind
- Non-blocking for launch
- Add to Day 4 sprint if time permits

---

## 📝 QUICK REFERENCE

### GameShell Props
```tsx
<GameShell
  gameId="game-id"           // Required: unique ID from gameRegistry
  gameName="Game Name"       // Required: display name
  showWellnessTimer={true}   // Optional: default true
  enableErrorBoundary={true} // Optional: default true
>
  <GameContent />
</GameShell>
```

### useGameProgress Usage
```tsx
const { saveProgress, isLoading } = useGameProgress('game-id');

// Call on game complete
await saveProgress({
  score: 100,
  completed: true,
  level: 3,
  metadata: { hintsUsed: 2 }
});
```

### Test Mock Pattern
```typescript
vi.mock('../hooks/useTTS', () => ({
  useTTS: () => ({
    speak: vi.fn(),
    isSpeaking: false,
    stop: vi.fn(),
  }),
}));
```

---

## 🎯 LAUNCH DAY CHECKLIST

Before flipping the switch:

1. [ ] All 45 games use GameShell
2. [ ] Non-subscribed users see locked screen
3. [ ] Progress saves to database
4. [ ] Tests pass in < 60s
5. [ ] npm audit shows 0 vulnerabilities
6. [ ] CORS locked to production domain
7. [ ] Wellness timers visible in games
8. [ ] No console.log in production games
9. [ ] Backend tests pass
10. [ ] Frontend builds without errors

---

**Document Version**: 1.0  
**Created**: March 8, 2026  
**Author**: Launch Sprint Planning  
**Status**: READY FOR EXECUTION
