# Performance Optimization Task List

**Date**: 2026-02-23
**Based on**: Full codebase analysis
**Priority Order**: Critical → High → Medium → Low

---

## CRITICAL (Do This Week)

### C-1: Add React.memo to All Game Pages ⏱️ 2-3 hours

**Status**: 🔴 Not Started

**Files** (20+ files):
```
src/pages/BubblePop.tsx
src/pages/ConnectTheDots.tsx
src/pages/Dashboard.tsx
src/pages/EmojiMatch.tsx
src/pages/FreeDraw.tsx
src/pages/Games.tsx
src/pages/Home.tsx
src/pages/Inventory.tsx
src/pages/LetterHunt.tsx
src/pages/MediaPipeTest.tsx
src/pages/PhonicsSounds.tsx
src/pages/Progress.tsx
src/pages/ShapePop.tsx
src/pages/SimonSays.tsx
src/pages/ShapeSafari.tsx
src/pages/SteadyHandLab.tsx
src/pages/StorySequence.tsx
src/pages/VirtualChemistryLab.tsx
src/pages/WordBuilder.tsx
src/pages/YogaAnimals.tsx
```

**Pattern**:
```typescript
// BEFORE:
export function GamePage({ }: Props) { ... }

// AFTER:
export const GamePage = React.memo(function GamePage({ }: Props) { ... });
```

**Impact**: Prevents cascading re-renders

**Estimated Impact**: 60-80% fewer re-renders per page

---

### C-2: Split ConnectTheDots (860 lines) ⏱️ 3-4 hours

**Status**: 🔴 Not Started

**Extract into**:
```
1. DotGrid (~400 lines)
   - Canvas rendering
   - Dot state management
   - Drawing logic
   - Connection checking

2. GameOverlay (~150 lines)
   - Wellness reminders
   - Celebrations
   - Modals

3. ControlPanel (~100 lines)
   - Start/exit buttons
   - Menu controls
   - Settings

4. LevelDisplay (~50 lines)
   - Current level
   - Progress bar
   - Score display
```

**Remaining**: ~160 lines (manageable)

**Impact**: Only re-render changed sub-components

**Estimated Impact**: 50-60% faster re-renders

---

### C-3: Split MediaPipeTest (780 lines) ⏱️ 3-4 hours

**Status**: 🔴 Not Started

**Extract into**:
```
1. HandTrackingCanvas (~350 lines)
   - Canvas setup
   - MediaPipe integration
   - Hand visualization
   - Gesture detection

2. DebugControls (~150 lines)
   - Test controls
   - Mode selectors
   - Parameter adjustments

3. StatsDisplay (~100 lines)
   - FPS counter
   - Hand detection status
   - Gesture info
   - Debug logs

4. TestPatternSelector (~100 lines)
   - Test pattern buttons
   - Test type selector
   - Test controls
```

**Remaining**: ~80 lines (manageable)

**Impact**: Only re-render changed sub-components

**Estimated Impact**: 50-60% faster re-renders

---

### C-4: Split EmojiMatch (755 lines) ⏱️ 3-4 hours

**Status**: 🔴 Not Started

**Extract into**:
```
1. GameBoard (~300 lines)
   - Card grid
   - Matching logic
   - Animation controller
   - Score calculation

2. TimerDisplay (~100 lines)
   - Countdown timer
   - Time remaining
   - Time warnings

3. ScorePanel (~80 lines)
   - Current score
   - High score
   - Match statistics

4. Card (~75 lines)
   - Individual card
   - Card animations
   - Card selection
```

**Remaining**: ~75 lines (manageable)

**Impact**: Only re-render changed cards

**Estimated Impact**: 50-60% faster re-renders

---

## HIGH (Do Next Week)

### H-1: Split FreeDraw (644 lines) ⏱️ 2-3 hours

**Status**: 🔴 Not Started

**Extract into**:
```
1. DrawingCanvas (~300 lines)
2. ToolPalette (~150 lines)
3. ColorPicker (~100 lines)
4. SaveControls (~50 lines)
```

**Impact**: Only re-render changed sections

---

### H-2: Split LetterHunt (697 lines) ⏱️ 2-3 hours

**Status**: 🔴 Not Started

**Extract into**:
```
1. LetterGrid (~300 lines)
2. GameControls (~150 lines)
3. Timer (~100 lines)
4. Score (~50 lines)
```

**Impact**: Only re-render changed sections

---

### H-3: Add React.memo to All Components ⏱️ 2-3 hours

**Status**: 🔴 Not Started

**Files** (30+ files):
```
src/components/ErrorDisplay.tsx
src/components/Layout.tsx
src/components/Mascot.tsx
src/components/OnboardingFlow.tsx
src/components/CameraPermissionPrompt.tsx
src/components/WellnessDashboard.tsx
src/components/GameLayout.tsx
src/components/GameContainer.tsx
src/components/GameControls.tsx
src/components/game/*.tsx (all sub-components)
```

**Pattern**: Same as C-1

---

### H-4: Add useMemo to All Filtering Operations ⏱️ 4-6 hours

**Status**: 🔴 Not Started

**Find patterns**:
```bash
# Search and replace:
.filter( -> .filter( // Then wrap
.map( -> .map( // Then wrap
.sort( -> .sort( // Then wrap
```

**Estimated files**: 50+

**Impact**: Expensive computations only when data changes

---

### H-5: Add useCallback to All Event Handlers ⏱️ 4-6 hours

**Status**: 🔴 Not Started

**Find patterns**:
```bash
# Search:
onClick={() => }
onChange={() => }
onSubmit={() => }

# Extract to:
const handleClick = useCallback(() => { }, []);
```

**Estimated files**: 30+

**Impact**: Functions don't cause child re-renders

---

## MEDIUM (Do This Month)

### M-1: Add React.memo to Layout Components ⏱️ 1-2 hours

**Files**:
```
src/components/ui/Layout.tsx
src/components/layout/*.tsx (all)
```

---

### M-2: Optimize Store Subscriptions ⏱️ 2-3 hours

**Approach**: Use selector pattern

```typescript
// Current:
const { profiles, currentProfile, isLoading, fetchProfiles } = useProfileStore();

// Better:
const profiles = useProfileStore(state => state.profiles);
const currentProfile = useProfileStore(state => state.currentProfile);
```

**Files**: 8 store files

---

### M-3: Remove Unused Variables ⏱️ 1 hour

**Found in**:
```
src/pages/AlphabetGame.tsx (letterColorClass)
src/pages/ShapePop.tsx (timeLeft)
src/pages/WordBuilder.tsx (VoiceInstructions)
```

---

### M-4: Add React.memo to All Game Sub-Components ⏱️ 2-3 hours

**After splitting large files, memoize sub-components**

---

## LOW (Optional - Do As Needed)

### L-1: Evaluate Million.js ⏱️ 4-6 hours

**Steps**:
1. Install: `npm install million`
2. Integrate in vite.config.ts
3. Test on critical paths
4. Measure impact
5. Decide on adoption

---

### L-2: Optimize Bundle Size ⏱️ 4-6 hours

**Approach**:
1. Code splitting with React.lazy
2. Dynamic imports for heavy libraries
3. Tree shaking improvements
4. Remove unused dependencies

---

### L-3: Add Performance Regression Tests ⏱️ 6-8 hours

**Approach**:
1. Set up Playwright for performance testing
2. Create baseline benchmarks
3. Add to CI/CD
4. Alert on regression

---

## TASK EXECUTION TRACKER

### Week 1: Foundation

| Day | Tasks | Status | Hours |
|-----|-------|--------|-------|
| Mon | C-1: React.memo to game pages | 🔴 Not Started | 3 |
| Mon | M-3: Remove unused variables | 🔴 Not Started | 1 |
| Tue | C-2: Split ConnectTheDots | 🔴 Not Started | 4 |
| Wed | C-3: Split MediaPipeTest | 🔴 Not Started | 4 |
| Thu | C-4: Split EmojiMatch | 🔴 Not Started | 4 |
| Fri | Verification & Testing | 🔴 Not Started | 3 |

**Week 1 Total**: 19 hours

---

### Week 2: Deep Optimization

| Day | Tasks | Status | Hours |
|-----|-------|--------|-------|
| Mon | H-1: Split FreeDraw | 🔴 Not Started | 3 |
| Mon | H-2: Split LetterHunt | 🔴 Not Started | 3 |
| Tue | H-3: React.memo to components | 🔴 Not Started | 3 |
| Wed | H-4: useMemo to filters | 🔴 Not Started | 6 |
| Thu | H-5: useCallback to handlers | 🔴 Not Started | 6 |
| Fri | Verification & Testing | 🔴 Not Started | 4 |

**Week 2 Total**: 25 hours

---

## VERIFICATION CHECKLIST

### Before Starting
- [ ] React Scan running in dev
- [ ] Baseline metrics recorded
- [ ] Current hotspots identified (🔴 components)

### After Each Task
- [ ] React Scan shows improvement
- [ ] No functionality broken
- [ ] TypeScript compiles
- [ ] Lint passes

### After Each Phase
- [ ] Performance measured (before vs after)
- [ ] Document results
- [ ] Team review completed

### Final Verification
- [ ] All pages tested
- [ ] Cross-browser tested
- [ ] Mobile tested
- [ ] Performance acceptable

---

## SUCCESS METRICS

### Before Optimization Baseline

Record these metrics in a dedicated document:

```
React Scan Red Components: ____
Average Render Time: ____
First Contentful Paint: ____
Time to Interactive: ____
Lighthouse Performance Score: ____
```

### After Optimization Goals

```
React Scan Red Components: <10
Average Render Time: -40% minimum
First Contentful Paint: <1.5s
Time to Interactive: <3s
Lighthouse Performance Score: >90
```

---

## NOTES

### Dependencies
- C-1 (React.memo) must be done before H-4
- C-2, C-3, C-4 (Splitting) creates new files to memoize
- H-4 (useMemo) depends on having stable sub-components

### Risks
- Splitting large files may introduce bugs
- React.memo may miss prop changes (use proper comparison)
- Over-optimization can make code harder to read

### Mitigations
- Test thoroughly after each change
- Use React Scan to verify improvements
- Keep PRs small and focused

---

## FILES TO TRACK

### Created This Analysis
- ✅ `docs/performance/full-codebase-analysis-2026-02-23.md`
- ✅ `docs/performance/optimization-task-list-2026-02-23.md` (this file)
- ✅ `docs/performance/react-scan-setup.md` (updated)
- ✅ `docs/performance/react-performance-universal-guide.md` (created)
- ✅ `docs/performance/optimization-summary-2026-02-23.md` (created)

### Files That Will Be Created During Work
- `src/components/dots/DotGrid.tsx` (new)
- `src/components/dots/GameOverlay.tsx` (new)
- `src/components/dots/ControlPanel.tsx` (new)
- `src/components/mediapipe/HandTrackingCanvas.tsx` (new)
- `src/components/emoji/GameBoard.tsx` (new)
- `src/components/freedraw/DrawingCanvas.tsx` (new)
- ... and many more

---

## ESTIMATED TIME TO COMPLETION

### Conservative (Foundation Only)
- Week 1: 19 hours
- Week 2: 0 hours (skip deep optimization)
- **Total: 19 hours** (2-3 days)

### Recommended (Foundation + Deep)
- Week 1: 19 hours
- Week 2: 25 hours
- **Total: 44 hours** (1 week)

### Complete (Foundation + Deep + Advanced)
- Week 1: 19 hours
- Week 2: 25 hours
- Week 3: 20 hours (Million.js, bundle, tests)
- **Total: 64 hours** (1.5-2 weeks)

---

## QUICK START (Pick ONE to begin)

### Option A: React.memo Blitz (Fastest Impact)
```bash
# 2-3 hours
# Add React.memo to all game pages
# Impact: Immediate 60-80% re-render reduction
```

### Option B: Split One Large Component (Highest Impact)
```bash
# 3-4 hours
# Split ConnectTheDots or MediaPipeTest
# Impact: 50-60% re-render reduction for that game
```

### Option C: useMemo Quick Wins (Medium Impact)
```bash
# 1-2 hours
# Find all .filter( and wrap with useMemo
# Impact: 20-30% fewer computations
```

---

**Last Updated**: 2026-02-23
**Next Review**: After completing Phase 1 tasks
