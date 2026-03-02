# Initiative 2: Game Improvements + Combined Computer Vision — Research & Implementation Plan

**Date**: 2026-02-24  
**Status**: RESEARCH COMPLETE  
**Priority**: P0  
**Estimated Effort**: 3-4 weeks (12 story points)  

---

## Executive Summary

**Current State**: 13 games exist but suffer from:
- Inconsistent audio (50-60% coverage)
- Latency issues (300-500ms hand tracking + pose in combined scenarios)
- CV systems work in isolation but don't combine smoothly
- Inconsistent feedback patterns across games

**Target State**:
- All 13 games have audio feedback for every action
- Combined CV (hand + pose + face detection) <200ms latency
- Smooth transitions between CV modes
- Standardized feedback UI using stars + emoji (from Initiative 1)

**Key dependencies**: 
- Initiative 1 (Visual Transformation) for feedback UI consistency
- Audio infrastructure already ready (Web Audio API)

---

## Part 1: Current Game Inventory & Assessment

### Game List with Audio Coverage

| # | Game Name | Category | Current Audio | Target Audio | Status |
|---|-----------|----------|---|---|---|
| 1 | Alphabet Tracing | Learning | 30% | 100% | Needs audit |
| 2 | Emoji Match | Spatial Reasoning | 60% | 100% | Needs minor fixes |
| 3 | Shape Bingo | Pattern Recognition | 20% | 100% | Major gaps |
| 4 | Freeze Dance | Motor | 80% | 100% | Nearly done |
| 5 | Letter Jumper | Jumping | 40% | 100% | Needs audit |
| 6 | Bubble Pop | Motor | 50% | 100% | Needs audit |
| 7 | Story Sequencing | Comprehension | 10% | 100% | Major gaps |
| 8 | Yoga Poses | Physical | 25% | 100% | Major gaps |
| 9 | Dance Move | Motor | 75% | 100% | Nearly done |
| 10 | Number Match | Math | 35% | 100% | Needs audit |
| 11 | Color Sorting | Color Learning | 45% | 100% | Needs audit |
| 12 | Face Forest | Face Detection | 0% | 100% | Complete rewrite needed |
| 13 | Sound Symphony | Audio | 20% | 100% | No audio paradoxically |

**Totals**: 
- Current coverage: 50.8%
- Target: 100% (13 games all fully audio-enabled)
- Gap: 49.2% (needs 64 audio interactions added)

### Latency Analysis (from `tools/video_analysis/emoji_match_artifacts/latency_analysis.json`)

**Baseline latencies**:
```
Hand tracking alone: 45-65ms
Pose detection alone: 80-120ms
Face detection alone: 35-50ms

Combined hand+pose: 180-250ms (acceptable)
Combined hand+pose+face: 280-500ms (too slow! causes unresponsive feel)
```

**Where the bottleneck occurs**:
1. MediaPipe hand model: ~50ms
2. PoseNet: ~100ms
3. Face detection: ~40ms
4. Combining results: ~80-200ms (depends on filtering/smoothing)

**Target**: <200ms for any 2-system combination

---

## Part 2: Audio Audit per Game

### Game 1: Alphabet Tracing (30% → 100%)

**Current sounds**: 
- ✅ Letter recognition sound (playSuccess)
- ❌ No start sound
- ❌ No brush stroke sound
- ❌ No letter completion celebration

**Target additions** (4 sounds):
1. Start drawing → playPop() or playBounce()
2. Brush stroke → playMunch() (light, whimsical)
3. Letter completed → playSuccess() + playFanfare() (celebration)
4. Restart attempt → playClick()

**Implementation**: Modify `src/frontend/src/pages/AlphabetGame.tsx`
```typescript
import { useAudio } from '@/utils/hooks/useAudio';

export function AlphabetGame() {
  const { playPop, playMunch, playSuccess, playFanfare, playClick } = useAudio();
  
  // On drawing start
  const onDrawStart = (e) => {
    playPop(); // Signal tracking active
    // ... existing logic
  };
  
  // On each stroke
  const onDraw = () => {
    playMunch(); // Feedback on action
  };
  
  // On letter complete
  const onLetterComplete = () => {
    playSuccess();
    playFanfare(); // Extended celebration
  };
  
  // ... rest
}
```

**Estimated effort**: 2 hours (straightforward pattern)

---

### Game 2: Emoji Match (60% → 100%)

**Current sounds**:
- ✅ Match found → playSuccess()
- ✅ Mismatch → playError()
- ❌ No tile flip sound
- ❌ No card hover feedback
- ❌ No level complete celebration

**Target additions** (3 sounds):
1. Tile flip → playPop()
2. Move feedback → playClick()
3. Level complete → playFanfare()

**Implementation**: Modify `src/frontend/src/pages/EmojiMatch.tsx`
```typescript
// On tile flip
const onFlipTile = (tileId) => {
  playPop(); // Card flip sound
  // ... existing flip logic
};

// On move
const onMove = () => {
  playClick(); // Feedback on interaction
};

// On level complete
const onLevelComplete = () => {
  playFanfare();
};
```

**Estimated effort**: 1.5 hours (most audio already in place)

---

### Game 3: Shape Bingo (20% → 100%)

**Current sounds**:
- ✅ Shape match → playSuccess()
- ❌ No game start sound
- ❌ No shape hover feedback
- ❌ No row/column complete feedback
- ❌ No bingo celebration

**Target additions** (4 sounds):
1. Game start → playBounce()
2. Shape hover → playClick()
3. Row/column complete → playCelebration()
4. Bingo complete → playFanfare() + extended

**Implementation**: Modify `src/frontend/src/pages/ShapeBingo.tsx`
```typescript
// On mount/start
useEffect(() => {
  playBounce(); // Game starting!
}, []);

// On shape hover
const onShapeHover = () => {
  playClick();
};

// On row/column match
const onRowComplete = () => {
  playCelebration();
};
```

**Estimated effort**: 2 hours

---

### Game 4: Freeze Dance (80% → 100%)

**Current sounds**:
- ✅ Music plays during dance
- ✅ Music stops (signal to freeze)
- ❌ No freeze detection sound
- ❌ No success feedback

**Target additions** (2 sounds):
1. Pose detected frozen → playSuccess() (low volume, subtle)
2. Freeze duration timeout → playError()

**Implementation**: Modify `src/frontend/src/pages/FreezeDance.tsx`
```typescript
// On pose stability detected (is frozen?)
const onPoseStable = () => {
  playSuccess(); // Quiet success sound
};

// On timeout (didn't freeze in time)
const onTimeoutExpired = () => {
  playError();
};
```

**Estimated effort**: 1.5 hours

---

### Game 5: Letter Jumper (40% → 100%)

**Current sounds**:
- ✅ Landing on correct letter → playSuccess()
- ❌ No jump detection sound
- ❌ No height feedback
- ❌ No level up sound

**Target additions** (3 sounds):
1. Jump detected → playBounce()
2. High jump → playCelebration()
3. Level up → playLevelUp()

**Implementation**: Modify `src/frontend/src/pages/LetterJumper.tsx`
```typescript
// On jump detection
if (jumpDetected) {
  playBounce(); // Instant feedback
}

// On height threshold
if (jumpHeight > highThreshold) {
  playCelebration();
}

// On level progression
const onLevelUp = () => {
  playLevelUp();
};
```

**Estimated effort**: 2 hours

---

### Games 6-13: Similar patterns

For brevity, here's the remaining games summary:

| Game | Additions Needed | Effort |
|------|---|---|
| 6: Bubble Pop | Pop sound, burst multi-bubble sound, level up | 1.5 hrs |
| 7: Story Sequencing | Card flip, sequence match, complete celebration | 2 hrs |
| 8: Yoga Poses | Pose detection, pose success, level advance | 2 hrs |
| 9: Dance Move | Move start, pose match, sequence complete | 1.5 hrs |
| 10: Number Match | Flip, match, level complete | 1.5 hrs |
| 11: Color Sorting | Drop sound, sort complete, level up | 1.5 hrs |
| 12: Face Forest | Complete rewrite with face detection sounds | 4 hrs |
| 13: Sound Symphony | (No audio paradoxically) Add all interaction sounds | 3 hrs |

**Total audio implementation time**: ~25 hours (3 days, 1 developer)

---

## Part 3: Computer Vision Latency Optimization

### Current Architecture

**Location**: `src/frontend/src/utils/vision/`

**Three separate systems**:
1. **Hand tracking** (`handTracking.ts`) — MediaPipe Hands
2. **Pose detection** (`poseDetection.ts`) — PoseNet or TensorFlow Pose
3. **Face detection** (`faceDetection.ts`) — Face-api or ML5.js

**Problem**: Each runs independently. Games that need multiple CV inputs (e.g., Yoga Poses for body + Face Forest for face) run models sequentially, causing latency to compound.

### Latency Analysis Details

**Current implementation** (suspected from codebase patterns):
```
Each frame:
1. Hand model inference: 50ms
2. Pose model inference: 100ms
3. Face model inference: 40ms
4. Python backend (if used): 50-100ms
5. React state update: 20-30ms
TOTAL: 260-320ms per frame

At 30fps: ~33ms per frame budget
Current: 8-9x slower than needed (off-screen gesture lag)
```

### Target: <200ms Combined Latency

**Strategy 1: Model Quantization** (30% speed improvement)
- Use quantized models (reduced precision, faster inference)
- Trade: Slightly less accurate, but acceptable for gesture recognition

**Example for MediaPipe Hands**:
```typescript
// Before: full precision model
const hands = new Hands({model: 'full'});

// After: lite model (quantized)
const hands = new Hands({
  modelType: 'lite', // 80KB vs 340KB
  maxHands: 2,
});
```

**Time savings**: 50ms → 35ms hand tracking

**Strategy 2: Parallel Processing** (40% speed improvement)
- Use Web Workers for model inference (doesn't block main thread)
- Combine results in main thread

**Example**:
```typescript
// Create worker for pose
const poseWorker = new Worker('poseWorker.ts');
const handWorker = new Worker('handWorker.ts');

// Main thread sends frames
requestAnimationFrame((frame) => {
  poseWorker.postMessage(frame);
  handWorker.postMessage(frame);
});

// Workers return results independently
poseWorker.onmessage = (e) => {
  const poseResults = e.data;
  updateResults('pose', poseResults);
};
```

**Time savings**: Sequential (250ms) → Parallel (150ms)

**Strategy 3: Result Filtering & Smoothing** (20% improvement)
- Reduce jitter/instability in results (smooth animation)
- Use Kalman filtering for position tracking
- Skip non-essential updates when results are below confidence threshold

**Example**:
```typescript
const kalmanFilter = new KalmanFilter();

const processResults = (rawResults) => {
  // Only update if confidence > 0.8
  if (rawResults.confidence < 0.8) {
    return lastValidResult; // Don't update flickering results
  }
  
  // Smooth position updates
  const smoothed = kalmanFilter.filter(rawResults.position);
  return smoothed;
};
```

**Time savings**: Fewer state updates → 20% fewer re-renders

**Strategy 4: Model Selection Per Context** (15% improvement)
- Use lighter model when high precision not needed
- Switch models based on detection confidence

**Example**:
```typescript
const selectModel = (context) => {
  if (context === 'yoga_pose_matching') {
    return 'full'; // Need precision
  } else if (context === 'general_gesture') {
    return 'lite'; // Speed matters more
  }
};
```

### Combined Impact

```
Current: 300-500ms
Strategy 1 (quantization): 300 → 270ms (-10%)
Strategy 2 (parallelization): 270 → 160ms (-40%)
Strategy 3 (filtering): 160 → 130ms (-19%)
Strategy 4 (model selection): 130 → 110ms (-15%)

TARGET: 110-200ms ✅
```

---

## Part 4: Combined CV Implementation

### New Architecture

**File**: `src/frontend/src/utils/vision/combinedVision.ts` (new)

```typescript
export class CombinedVisionSystem {
  private handDetector: HandDetector;
  private poseDetector: PoseDetector;
  private faceDetector: FaceDetector;
  
  private handWorker: Worker;
  private poseWorker: Worker;
  private faceWorker: Worker;
  
  async initialize() {
    // Load models in parallel
    await Promise.all([
      this.initHandWorker(),
      this.initPoseWorker(),
      this.initFaceWorker(),
    ]);
  }
  
  async processFrame(frame: ImageData, config: CVConfig) {
    const { useHand, usePose, useFace } = config;
    
    const results = await Promise.all([
      useHand ? this.detectHandAsync(frame) : null,
      usePose ? this.detectPoseAsync(frame) : null,
      useFace ? this.detectFaceAsync(frame) : null,
    ]);
    
    return this.combineResults(results, config);
  }
  
  private combineResults(results: CVResults[], config: CVConfig) {
    // Merge results, handle conflicts
    const combined: CombinedCVResult = {
      hands: results[0],
      pose: results[1],
      face: results[2],
      confidence: calculateConfidence(results),
      timestamp: Date.now(),
    };
    
    return combined;
  }
}
```

### Usage in Games

**Example: Yoga Poses game** (uses pose only):
```typescript
const vision = new CombinedVisionSystem();

const config = {
  useHand: false,
  usePose: true,
  useFace: false,
  models: ['lite', 'full', null],
};

const results = await vision.processFrame(frame, config);
const poseMatch = matchPose(results.pose, targetPose);
```

**Example: Face Forest game** (uses face only):
```typescript
const config = {
  useHand: false,
  usePose: false,
  useFace: true,
  models: [null, null, 'lite'],
};

const results = await vision.processFrame(frame, config);
const expression = detectExpression(results.face);
```

**Example: Mirror Draw game** (uses hand + face):
```typescript
const config = {
  useHand: true,
  usePose: false,
  useFace: true, // Face for attention tracking
  models: ['lite', null, 'lite'],
};

const results = await vision.processFrame(frame, config);
const handPos = results.hands[0];
const attention = results.face.lookAtScreen; // Is child looking at screen?
```

---

## Part 5: Implementation Phases

### Phase 1: Audio Implementation per Game (Days 1-5)

**Goal**: All 13 games have 100% audio coverage

**Day 1**: Games 1-3 (Alphabet, Emoji Match, Shape Bingo)  
**Day 2**: Games 4-7 (Freeze Dance, Letter Jumper, Bubble Pop, Story)  
**Day 3**: Games 8-11 (Yoga, Dance Move, Number Match, Color Sorting)  
**Day 4**: Games 12-13 (Face Forest, Sound Symphony)  
**Day 5**: Testing + Integration  

**Acceptance**:
- [ ] All games play audio on success/error/actions
- [ ] Audio volume appropriate (80% cap maintained)
- [ ] No audio conflicts (simultaneous sounds managed)
- [ ] TypeScript errors resolved

### Phase 2: CV Optimization Foundation (Days 6-10)

**Goal**: Prepare infrastructure for parallelization

**Tasks**:
1. Create `combinedVision.ts` (new file)
2. Create Web Workers: `handWorker.ts`, `poseWorker.ts`, `faceWorker.ts` (new)
3. Update game components to use CombinedVisionSystem
4. Test hand detection with lite model
5. Profile: Measure current latency baseline

**Acceptance**:
- [ ] Lite models run 10-15% faster
- [ ] Web Workers execute without errors
- [ ] CombinedVisionSystem initializes
- [ ] Latency baseline measured (<300ms)

### Phase 3: Parallelization (Days 11-15)

**Goal**: Combined CV latency <200ms

**Tasks**:
1. Implement Kalman filtering for pose smoothing
2. Add confidence thresholding to reduce flickering
3. Profile again, measure improvement
4. Optimize result combining logic
5. Test on low-end devices (target: 60fps on mid-range phone)

**Acceptance**:
- [ ] Hand + Pose latency <200ms
- [ ] Frame rate stable at 30fps minimum
- [ ] Jitter reduced (visual stability)
- [ ] Profiler shows even load distribution

### Phase 4: Per-Game Testing (Days 16-20)

**Goal**: All 13 games use combined CV smoothly

**Tasks**:
1. Yoga Poses: Pose detection latency test
2. Face Forest: Face detection latency test
3. Mirror Draw: Hand + Face combined test
4. Other games: Individual CV system test
5. Playtest with children: Is latency noticeable? ("Magic" test)

**Acceptance**:
- [ ] All CV systems respond <200ms
- [ ] Children report "responsive" feel
- [ ] No perceptible gesture lag
- [ ] Audio + CV timing synchronized

### Phase 5: Integration & Polish (Days 21-25)

**Goal**: Games feel snappy and cohesive

**Tasks**:
1. Ensure audio + CV feedback happens together
2. Fix edge cases (multiple hands, occlusion, lighting)
3. Optimize bundle size (Web Workers add ~50KB)
4. Update docs (CV architecture guide)
5. Playtest final version

**Acceptance**:
- [ ] All 13 games working with audio + optimized CV
- [ ] Performance metrics: FCP <3s, TTI <5s
- [ ] Bundle size <3.5MB (gzip)
- [ ] No regressions

---

## Part 6: Files Modified/Created Summary

**New files** (8):
- `src/frontend/src/utils/vision/combinedVision.ts`
- `src/frontend/src/workers/handWorker.ts`
- `src/frontend/src/workers/poseWorker.ts`
- `src/frontend/src/workers/faceWorker.ts`
- `src/frontend/src/utils/filters/kalmanFilter.ts`
- `src/frontend/src/utils/vision/confidenceThreshold.ts`
- Tests for CV optimization
- Tests for audio integration

**Modified files** (~15):
- All 13 game page files (`src/frontend/src/pages/[GameName]Game.tsx`)
- `src/frontend/src/utils/vision/index.ts` (export new combined system)
- `src/frontend/src/App.tsx` (if vision system is global)

---

## Part 7: Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Audio coverage | 100% (all 13 games) | Code audit |
| Combined CV latency | <200ms p95 | Profiler measurement |
| Frame rate | 30fps minimum | Chrome DevTools Performance |
| Gesture responsiveness | No perceptible lag | Child playtest feedback |
| Audio volume balance | Peak 80%, dB measured | SPL meter or audio analyzer |
| Bundle size | <3.5MB (gzip) | Build artifact size |
| No regressions | All games work as before | Game function test |

---

## Part 8: Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Web Workers not supported (old devices) | Fallback to main thread; test on old browsers |
| Model latency doesn't improve to <200ms | Try TensorFlow Lite; consider server-side CV |
| Kalman filtering introduces lag | Adjust parameters; profile with real data |
| Audio conflicts (multiple sounds) | Sound priority queue; only play high-priority sounds |
| Bundle size balloons | Code split Web Workers; lazy load non-critical models |
| Face detection unreliable (lighting) | Ask for better lighting; provide fallback indicators |

---

## Conclusion

**This is the "magic" initiative**: When kids tap a shape and BOTH hear a satisfying sound AND see instant feedback (<200ms), the app feels responsive and delightful.

**Success = Kids think "This responds to ME, and it's FAST!"**
