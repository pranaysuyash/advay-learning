# Refactoring Opportunities Report

**Date**: 2026-02-22  
**Scope**: Full codebase analysis (Frontend + Backend)  
**Analysis Type**: Static code review + pattern detection

---

## Executive Summary

This document identifies refactoring opportunities across the codebase. The analysis reveals several categories of improvements:

1. **Duplicate Code** - Functions repeated across multiple game files
2. **Stale Files** - Backup files that should be cleaned up
3. **Inconsistent Hook Usage** - Mixed patterns for hand tracking
4. **Type Organization** - Scattered type definitions
5. **Store Duplication** - Multiple state management approaches

---

## 1. Duplicate Code (High Priority)

### 1.1 `triggerHaptic` Function

**Location**: Multiple game pages  
**Duplicates Found**: 4 files

| File                           | Line Count | Status |
| ------------------------------ | ---------- | ------ |
| `pages/ShapePop.tsx`           | ~20 lines  | Active |
| `pages/ShapePopRefactored.tsx` | ~20 lines  | Active |
| `pages/SteadyHandLab.tsx`      | ~20 lines  | Active |
| `pages/WordBuilder.tsx`        | ~20 lines  | Active |

**Current Implementation**:

```typescript
function triggerHaptic(type: 'success' | 'error' | 'celebration'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  const patterns = {
    success: [50, 30, 50],
    error: [100, 50, 100],
    celebration: [100, 50, 100, 50, 200],
  };

  navigator.vibrate(patterns[type]);
}
```

**Refactoring Recommendation**: Extract to `src/utils/haptics.ts`

- Create a centralized haptics utility
- Add support for custom patterns
- Include device capability detection

---

### 1.2 `random01` Function

**Location**: Multiple game pages  
**Duplicates Found**: 8 files

| File                           | Usage Context             |
| ------------------------------ | ------------------------- |
| `pages/ShapePop.tsx`           | Target spawning           |
| `pages/ShapePopRefactored.tsx` | Target spawning           |
| `pages/SteadyHandLab.tsx`      | Target positioning        |
| `pages/WordBuilder.tsx`        | Word/target randomization |
| `pages/EmojiMatch.tsx`         | Round building            |
| `pages/NumberTapTrail.tsx`     | Point generation          |
| `pages/ShapeSequence.tsx`      | Target/shape ordering     |
| `pages/ColorMatchGarden.tsx`   | Flower selection          |

**Current Implementation**:

```typescript
function random01(): number {
  try {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967295;
  } catch {
    return Math.random();
  }
}
```

**Refactoring Recommendation**:

- Move to `src/utils/math.ts` as `randomFloat01()`
- Consider creating a seeded random generator for reproducible gameplay
- Export from `src/utils/index.ts` for easy imports

---

### 1.3 Game State Patterns

**Observed Pattern**: Each game page has nearly identical boilerplate:

```typescript
// Repeated in 15+ game files
const [isPlaying, setIsPlaying] = useState(false);
const [score, setScore] = useState(0);
const [feedback, setFeedback] = useState('...');
const scoreRef = useRef(score);

// Game timer logic (repeated)
useEffect(() => {
  if (!isPlaying) return;
  const timer = setInterval(...);
  return () => clearInterval(timer);
}, [isPlaying]);

// Navigation patterns
const navigate = useNavigate();
const goHome = () => { resetGame(); navigate('/dashboard'); };
```

**Refactoring Recommendation**: Create a `useGameState` hook

```typescript
// Proposed: src/hooks/useGameState.ts
export function useGameState(options: {
  initialScore?: number;
  timeLimit?: number;
  onGameEnd?: (score: number) => void;
}) {
  // Returns: isPlaying, score, timeLeft, feedback, startGame, resetGame
}
```

---

## 2. Stale Files (Cleanup)

### 2.1 Backup Files in Pages Directory

**Evidence**: Multiple backup files found in `src/frontend/src/pages/`

| File                   | Recommended Action |
| ---------------------- | ------------------ |
| `Dashboard.tsx.bak`    | Delete or archive  |
| `Dashboard.tsx.bak2`   | Delete or archive  |
| `Dashboard.tsx.bak3`   | Delete or archive  |
| `Dashboard.tsx.backup` | Delete or archive  |
| `Games.tsx.bak3`       | Delete or archive  |
| `Games.tsx.bak4`       | Delete or archive  |
| `Games.tsx.bak5`       | Delete or archive  |
| `AlphabetGame.tsx.bak` | Delete or archive  |

**Refactoring Recommendation**:

- Create `archive/` directory for backups
- Or simply delete if no longer needed
- Add `.bak` and `.backup` to `.gitignore`

---

### 2.2 Stale Hooks

**Evidence**: Found in `src/frontend/src/hooks/`

| File                           | Recommended Action |
| ------------------------------ | ------------------ |
| `useAttentionDetection.ts.bak` | Delete or archive  |
| `usePostureDetection.ts.bak`   | Delete or archive  |

---

### 2.3 Duplicate Game Implementations

**Evidence**: `ShapePop.tsx` and `ShapePopRefactored.tsx`

| File                     | Hand Tracking Approach                              | Status |
| ------------------------ | --------------------------------------------------- | ------ |
| `ShapePop.tsx`           | Direct `useHandTracking` + `useHandTrackingRuntime` | Legacy |
| `ShapePopRefactored.tsx` | Abstracted `useGameHandTracking`                    | New    |

**Refactoring Recommendation**:

- Choose one as canonical
- Delete the other
- Update routing to use single version

---

## 3. Inconsistent Hook Usage (Medium Priority)

### 3.1 Hand Tracking Patterns

**Issue**: Mixed approaches across games

| Pattern                                             | Files Using                          | Description           |
| --------------------------------------------------- | ------------------------------------ | --------------------- |
| Direct `useHandTracking` + `useHandTrackingRuntime` | ShapePop, SteadyHandLab, WordBuilder | Low-level, verbose    |
| Abstracted `useGameHandTracking`                    | ShapePopRefactored                   | High-level, cleaner   |
| Custom runtime                                      | BubblePopSymphony                    | Custom implementation |

**Refactoring Recommendation**:

- Standardize on `useGameHandTracking` for all games
- Deprecate direct `useHandTracking` usage in game pages
- Keep `useHandTracking` as internal implementation detail

---

### 3.2 Sound Effects Hook

**Issue**: Inconsistent import patterns

```typescript
// Pattern 1: Destructured
const { playPop, playError, playCelebration, playStart } = useSoundEffects();

// Pattern 2: Single function
const { play } = useSoundEffects();
play('pop');
```

**Refactoring Recommendation**:

- Standardize sound effect naming
- Document common sound names
- Add TypeScript enum for sound types

---

## 4. TypeScript Type Organization

### 4.1 Scattered Type Definitions

**Current State**:

- `src/frontend/src/types/tracking.ts` - Hand tracking types
- `src/frontend/src/types/progress.ts` - Progress types
- Inline types in various components

**Issues Identified**:

1. `Point` interface defined in `tracking.ts` but used broadly
2. Game-specific types scattered in pages
3. No centralized type exports

**Refactoring Recommendation**:

```
src/frontend/src/types/
├── index.ts          # Barrel exports
├── tracking.ts       # Hand tracking types (existing)
├── progress.ts       # Progress types (existing)
├── game.ts          # NEW: Common game types
│   - GameState
│   - Score
│   - Level
│   - Target
│   - Cursor
└── ui.ts            # NEW: UI component types
```

---

### 4.2 Missing Type Exports

**Evidence**: Some types are used but not exported from index files

**Recommendation**: Create `src/frontend/src/types/index.ts`:

```typescript
export * from './tracking';
export * from './progress';
export * from './game'; // NEW
export * from './ui'; // NEW
```

---

## 5. State Management (Medium Priority)

### 5.1 Store Duplication

**Evidence**: Two store directories with overlapping concerns

| Directory                  | Files                                                                                                        | Purpose             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------- |
| `src/frontend/src/store/`  | authStore, gameStore, profileStore, progressStore, settingsStore, storyStore, characterStore, inventoryStore | Zustand stores      |
| `src/frontend/src/stores/` | socialStore.ts                                                                                               | Single social store |

**Issues**:

1. Inconsistent directory naming (`store` vs `stores`)
2. Unclear why `socialStore` is separate
3. No clear separation between global and local state

**Refactoring Recommendation**:

- Consolidate to single `stores/` directory
- Create subdirectories: `stores/auth/`, `stores/game/`, etc.
- Document state ownership

---

### 5.2 Component-Level State vs Store

**Observed Pattern**: Some games use both:

```typescript
// Local state
const [score, setScore] = useState(0);
// Store state
const { addScore } = useGameStore();
```

**Refactoring Recommendation**:

- Define clear rules: ephemeral UI state → local useState, persistent data → store
- Consider extracting game session to store for pause/resume functionality

---

## 6. Component Architecture

### 6.1 Icon Component Duplication

**Evidence**: Two Icon components

| Location                 | Export Name | Status  |
| ------------------------ | ----------- | ------- |
| `components/Icon.tsx`    | `Icon`      | Legacy? |
| `components/ui/Icon.tsx` | `UIIcon`    | Active  |

**Refactoring Recommendation**:

- Consolidate to single Icon component
- Keep in `components/ui/`
- Remove duplicate

---

### 6.2 Game Container Usage

**Evidence**: 18+ games using `GameContainer` component

| Aspect       | Observation                          |
| ------------ | ------------------------------------ |
| Consistent   | Title, score, level, onHome props    |
| Inconsistent | Background styling, overlay patterns |

**Refactoring Recommendation**:

- Extend `GameContainer` to accept `background` prop
- Standardize overlay patterns (celebration, success)
- Add `GameOverlay` component for common patterns

---

## 7. Utility Functions

### 7.1 Asset Loading

**Evidence**: `src/utils/assets.ts` contains:

- `assetLoader` - Central asset management
- `BUBBLE_ASSETS`, `SOUND_ASSETS`, `WEATHER_BACKGROUNDS` - Asset constants
- Used inconsistently across games

**Refactoring Recommendation**:

- Create game-specific asset modules
- Add lazy loading for unused assets
- Document asset pipeline

---

### 7.2 Missing Utilities

**Suggested Additions**:

| Utility        | Location | Purpose                                         |
| -------------- | -------- | ----------------------------------------------- |
| `haptics.ts`   | utils/   | Centralize triggerHaptic                        |
| `random.ts`    | utils/   | Centralize random01                             |
| `gameState.ts` | hooks/   | useGameState hook                               |
| `constants.ts` | config/  | Game constants (TARGET_SIZE, CURSOR_SIZE, etc.) |

---

## 8. Backend Opportunities

### 8.1 Service Layer Consistency

**Evidence**: Services in `src/backend/app/services/`

| Service             | Purpose            |
| ------------------- | ------------------ |
| game_service.py     | Game logic         |
| progress_service.py | Progress tracking  |
| user_service.py     | User management    |
| profile_service.py  | Profile management |
| cache_service.py    | Caching            |

**Observation**: Services appear well-organized but worth auditing for:

- DRY violations
- Error handling consistency
- Type annotation coverage

---

### 8.2 API Structure

**Evidence**: `src/backend/app/api/` contains route definitions

**Recommendation**: Ensure frontend API clients mirror backend structure

---

## 9. Priority Matrix

| Priority | Category                           | Effort | Impact               |
| -------- | ---------------------------------- | ------ | -------------------- |
| P0       | Delete stale backup files          | Low    | Cleanup              |
| P0       | Consolidate ShapePop versions      | Low    | Cleanup              |
| P1       | Extract `triggerHaptic` to utility | Medium | DRY                  |
| P1       | Extract `random01` to utility      | Medium | DRY                  |
| P1       | Standardize hand tracking hook     | High   | Consistency          |
| P2       | Create `useGameState` hook         | Medium | Developer Experience |
| P2       | TypeScript type reorganization     | Medium | Maintainability      |
| P2       | Consolidate Icon components        | Low    | Cleanup              |
| P3       | Store directory consolidation      | Medium | Architecture         |
| P3       | Extend GameContainer               | Medium | Consistency          |

---

## 10. Implementation Roadmap

### Phase 1: Cleanup (1-2 days)

- [ ] Delete all `.bak`, `.backup` files OR move to `archive/`
- [ ] Choose canonical ShapePop and delete duplicate
- [ ] Consolidate Icon components

### Phase 2: Utilities (2-3 days)

- [ ] Create `src/utils/haptics.ts`
- [ ] Create `src/utils/random.ts`
- [ ] Update imports across all game files

### Phase 3: Hooks (3-5 days)

- [ ] Create `useGameState` hook
- [ ] Migrate all games to use `useGameHandTracking`
- [ ] Standardize sound effect usage

### Phase 4: Types (2 days)

- [ ] Create `src/types/index.ts`
- [ ] Add game types to `src/types/game.ts`
- [ ] Export from barrel file

### Phase 5: Architecture (5-7 days)

- [ ] Consolidate store directories
- [ ] Extend GameContainer
- [ ] Create GameOverlay component

---

## Appendix: File Inventory

### Active Game Pages (18)

```
pages/AlphabetGame.tsx
pages/BubblePopSymphony.tsx
pages/ColorMatchGarden.tsx
pages/ConnectTheDots.tsx
pages/DressForWeather.tsx
pages/EmojiMatch.tsx
pages/FreezeDance.tsx
pages/LetterHunt.tsx
pages/MirrorDraw.tsx
pages/MusicPinchBeat.tsx
pages/NumberTapTrail.tsx
pages/PhonicsSounds.tsx
pages/ShapePop.tsx
pages/ShapePopRefactored.tsx
pages/ShapeSafari.tsx
pages/ShapeSequence.tsx
pages/SimonSays.tsx
pages/SteadyHandLab.tsx
pages/StorySequence.tsx
pages/WordBuilder.tsx
pages/YogaAnimals.tsx
```

### Game Components (9)

```
components/game/AnimatedHand.tsx
components/game/DragDropSystem.tsx
components/game/GameCanvas.tsx
components/game/GameCursor.tsx
components/game/HandTrackingStatus.tsx
components/game/OptionChips.tsx
components/game/SuccessAnimation.tsx
components/game/TargetSystem.tsx
components/game/VoiceInstructions.tsx
```

### Hooks Related to Games (12)

```
hooks/useGameHandTracking.ts
hooks/useGameLoop.ts
hooks/useGameSession.ts
hooks/useHandTracking.ts
hooks/useHandTrackingRuntime.ts
hooks/useSoundEffects.ts
hooks/useTTS.ts
hooks/useVoicePrompt.ts
hooks/useProgressMetrics.ts
hooks/useAttentionDetection.ts
hooks/usePostureDetection.ts
hooks/useEyeTracking.ts
```

---

_Generated by codebase analysis - 2026-02-22_
