# Initiative 5: P0 New Games — Research & Implementation Plan

**Date**: 2026-02-24  
**Status**: RESEARCH COMPLETE  
**Priority**: P1  
**Estimated Effort**: 2-3 weeks (10 story points)  

---

## Executive Summary

**Current State**: 13 games exist. They're solid but need broader skill coverage.

**Target State**: Add 4 new P0 games that:
1. Fill critical skill gaps (phonics, fine motor, spatial reasoning)
2. Use existing infrastructure (audio, CV, Pip/Lumi)
3. Drive engagement through new mechanics
4. Follow "1 game per week" pace (fast iteration)

**New Games**:
1. **Phonics Sounds** — Letter-to-sound association (audio-visual)
2. **Mirror Draw** — Hand-tracking fine motor control (drawing, hand-eye coordination)
3. **Shape Safari** — Pose-based navigation (gross motor, spatial awareness)
4. **Platform Runner** — Hand-tracking side-scroller (gross motor, action-reaction)

**Key dependencies**: 
- Initiative 1 (Visual Transformation) for visual consistency
- Initiative 2 (Audio) for sound effects
- Initiative 2 (CV) for hand/pose tracking latency

---

## Part 1: Game Design Overview

### Game 1: Phonics Sounds

**Category**: Phonics / Language  
**Age Target**: 4-7 years  
**Concept**: Hear sound, tap matching letter and hear it pronounced

**Gameplay Loop** (30-45 seconds per round):
1. **Pip says**: "Find the /b/ sound!"
2. **Audio plays**: Phoneme "/b/" (1-2 seconds)
3. **Display**: 4 letter tiles (A, B, C, D)
4. **Child**: Taps /b/ tile (hand tracking)
5. **Feedback**: 
   - Correct: Star + celebration sound + Pip dances
   - Wrong: Gentle tap-sound + Pip says "Try again!"
6. **Audio**: If correct, plays /b/ -> "ba" -> "bat" word examples
7. **Next**: New phoneme (10 rounds = 1 game)

**Success criteria**:
- Child learns 5 phoneme-to-letter mappings per session
- Can identify /p/, /b/, /m/, /s/, /t/ etc.

**Unique mechanic**: 
- Audio-first (sound comes before visual)
- Word progression (/b/ → "bi" → "big" → "book")

**Technical requirements**:
- Text-to-speech (Kokoro TTS) for phoneme pronunciation
- Audio feedback (useAudio hook)
- Hand tracking for tap detection
- 4 letter tiles (responsive layout)

**Implementation complexity**: LOW-MEDIUM (3-4 days)

---

### Game 2: Mirror Draw

**Category**: Fine Motor / Hand-Eye Coordination  
**Age Target**: 5-8 years  
**Concept**: Follow a hand-traced path on screen with your real hand

**Gameplay Loop** (60-90 seconds per round):
1. **Setup**: Camera shows child's hand real-time
2. **Pip says**: "Copy the shape I'm drawing!"
3. **Line draws on screen**: Wavy line, circle, or star shape (5 seconds)
4. **Child**: Traces the same shape with their hand, camera tracks position
5. **Feedback**:
   - On-path: Green trail appears (satisfying + audio pop)
   - Off-path: Yellow warning trail (softer audio)
   - Completion: Stars awarded based on accuracy
6. **Celebration**: Pip dances, Lumi appears for perfect (95%+)
7. **Progression**: 5 shapes = 1 round, increase difficulty (complexity, speed)

**Success criteria**:
- Child improves hand control and coordination
- Can trace increasingly complex shapes

**Unique mechanic**:
- Real-time hand position as "pen"
- Visual feedback (trail color) before audio
- Compare child's trace vs. target

**Technical requirements**:
- Hand tracking (MediaPipe hands, <50ms latency)
- Canvas drawing (p5.js or custom)
- Gesture comparison algorithm
- Audio feedback (pop on correct, error on incorrect)

**Implementation complexity**: MEDIUM-HIGH (5-6 days)

**Algorithm sketch**:
```
1. Record target shape as array of [x, y] points
2. Child's hand position recorded as array during trace
3. Calculate distance between corresponding points
4. Distance < threshold → on-path
5. Accuracy = (on-path-points / total-points) * 100
```

---

### Game 3: Shape Safari

**Category**: Gross Motor / Spatial Awareness / Navigation  
**Age Target**: 6-9 years  
**Concept**: Navigate through a jungle by striking poses; collect shapes

**Gameplay Loop** (90-120 seconds per round):
1. **Setup**: Shows jungle scene with 5 locations (trees, rocks, rivers)
2. **Pip says**: "We need to collect all the CIRCLES! Can you reach them?"
3. **Navigation**: Child sees avatar (or hand) on jungle map
4. **To move**: Strike a pose (Yoga-like)
   - Wave hand high → move forward
   - Squat → get smaller, fit under low branches
   - Stand on one leg → balance across river
5. **Collect shapes**: Reach a location → shape appears → tap it
6. **Obstacles**: 
   - Too slow → lose 10 seconds
   - Wrong pose → backtrack
7. **Feedback**: Audio cues (success chime when collected), Pip narrates ("Great balance!")
8. **End**: Collected all 5 shapes = complete level

**Success criteria**:
- Child moves body, exercises, gets active
- Learns spatial navigation concepts

**Unique mechanic**:
- Pose-based movement (not hand-only)
- Explorable environment (not linear)
- Multi-step puzzle (find all shapes)

**Technical requirements**:
- Pose detection (PoseNet, <100ms latency)
- Canvas/game engine (Phaser.js or custom)
- Pose-to-action mapping (wave = forward, squat = down)
- Grid-based movement (discrete, not continuous)
- Collision detection

**Implementation complexity**: MEDIUM-HIGH (5-6 days)

**Level progression**:
- Level 1: 3 shapes, open field (easy navigation)
- Level 2: 5 shapes, 2 obstacles (balance, squat)
- Level 3: 7 shapes, 3 obstacles + timed (challenge)

---

### Game 4: Platform Runner

**Category**: Gross Motor / Hand-Eye Coordination
**Age Target**: 3-8 years  
**Concept**: Side-scrolling endless runner controlled by hand height

**Gameplay Loop** (60-120 seconds per round):
1. **Setup**: Camera tracks child's hand (Y-axis)
2. **Action**: Character auto-runs right. Child raises/lowers hand to move character up/down.
3. **Obstacles**: Dodge slimes and bees spawning from the right.
4. **Collectibles**: Grab coins, stars, and gems for points.
5. **Feedback**: Audio cues for jumps, collecting items, taking damage.
6. **End**: Game over when 3 hearts are lost.

**Success criteria**:
- Child learns spatial awareness and practices gross motor control
- Engagement through fast-paced action/reaction loop

**Unique mechanic**:
- Direct Y-axis hand mapping to character position
- Side-scrolling infinite runner

**Technical requirements**:
- Hand tracking (MediaPipe hands)
- HTML5 Canvas for rendering sprites
- Collision detection (AABB)

**Implementation complexity**: MEDIUM (3-4 days)

---

## Part 2: Game Template & Reusable Infrastructure

### Game Component Template

**File**: `src/frontend/src/pages/[GameName]Game.tsx` (template)

```typescript
import { useAudio } from '@/utils/hooks/useAudio';
import { useGameState } from '@/hooks/useGameState';
import { useState, useEffect } from 'react';

export function PhonicsGame() {
  const { playSuccess, playError, playClick } = useAudio();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentPhoneme, setCurrentPhoneme] = useState('b');
  const [gameState, setGameState] = useState<'playing' | 'success' | 'error'>('playing');
  
  useEffect(() => {
    // Initialize game
    setupNewRound();
  }, []);
  
  const setupNewRound = () => {
    const phoneme = PHONEMES[Math.floor(Math.random() * PHONEMES.length)];
    setCurrentPhoneme(phoneme);
    announcePhoneme(phoneme); // TTS
  };
  
  const onTileSelected = (selectedPhoneme: string) => {
    playClick();
    
    if (selectedPhoneme === currentPhoneme) {
      playSuccess();
      announceWords(currentPhoneme); // Word progression
      setScore(score + 1);
      setGameState('success');
      
      if (score + 1 >= 10) {
        // Game complete
        showCompletionScene();
      } else {
        setTimeout(() => setupNewRound(), 2000);
      }
    } else {
      playError();
      setGameState('error');
      setTimeout(() => setGameState('playing'), 1000);
    }
  };
  
  return (
    <GameLayout>
      <Pip state={gameState === 'success' ? 'celebrating' : 'encouraging'} />
      <PhonemeIndicator phoneme={currentPhoneme} />
      <LetterTiles onSelect={onTileSelected} />
      <ScoreDisplay score={score} total={10} />
    </GameLayout>
  );
}
```

### Shared Hooks

**File**: `src/frontend/src/hooks/useGameState.ts` (new)

```typescript
export const useGameState = (initialRounds: number = 10) => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const recordRound = (result: 'success' | 'error') => {
    const newRound = round + 1;
    const newScore = result === 'success' ? score + 1 : score;
    
    setRound(newRound);
    setScore(newScore);
    
    if (newRound >= initialRounds) {
      setIsComplete(true);
      // Save to API
      saveGameResult({
        gameId: currentGame,
        score: newScore,
        totalRounds: initialRounds,
        duration: Date.now() - startTime,
      });
    }
  };
  
  return { round, score, isComplete, recordRound };
};
```

### Backend Endpoints

**Pattern**: All games POST to `/api/games/{gameId}/score`

```
POST /api/games/phonics_sounds/score
{
  "childId": "child_123",
  "score": 8,
  "totalRounds": 10,
  "accuracy": 0.8,
  "duration": 45000,
  "timestamp": "2026-02-24T14:00:00Z"
}

Response:
{
  "success": true,
  "scoreId": "score_456",
  "isNewHighScore": true,
  "nextUnlock": "mirror_draw_game"
}
```

---

## Part 3: Implementation Phases

### Phase 1: Design Finalization (Days 1-2)

**Goal**: Design specs + wireframes approved

**Tasks**:
1. Finalize phoneme list for Phonics (20-30 phonemes)
2. Design shape progression for Mirror Draw (5 shapes, 3 difficulty levels)
3. Design jungle map for Shape Safari (locations, obstacles)
4. Wireframes for all 3 games
5. Design review + approval

**Deliverables**:
- `docs/GAME_PHONICS_DESIGN_SPEC.md`
- `docs/GAME_MIRROR_DRAW_DESIGN_SPEC.md`
- `docs/GAME_SHAPE_SAFARI_DESIGN_SPEC.md`

**Acceptance**:
- [ ] All 3 games designed
- [ ] Visual style matches Initiative 1
- [ ] Mechanics clear and testable
- [ ] Audio/CV requirements documented

### Phase 2: Phonics Sounds Implementation (Days 3-5)

**Goal**: Complete, tested Phonics game

**Tasks**:
1. Create PhonicsGame.tsx component
2. Setup Kokoro TTS for phoneme pronunciation
3. Create letter tile components
4. Implement correct/incorrect logic
5. Add audio feedback (success, error)
6. Test with 5-7 year olds

**Deliverables**:
- Playable game at `/games/phonics`
- API integration working
- Audio files recorded

**Acceptance**:
- [ ] Game renders without errors
- [ ] Audio plays correctly
- [ ] Hand tracking works (tap detection)
- [ ] Score saved to backend
- [ ] Children understand mechanics

### Phase 3: Mirror Draw Implementation (Days 6-9)

**Goal**: Complete, tested Mirror Draw game

**Tasks**:
1. Create MirrorDraw.tsx component
2. Setup hand tracking (MediaPipe)
3. Create canvas drawing system
4. Implement shape comparison algorithm
5. Create shape progression (5 shapes × 3 difficulty)
6. Add audio + visual feedback
7. Test latency (<200ms)

**Deliverables**:
- Playable game at `/games/mirror_draw`
- Hand tracking responsive
- Shape accuracy measured

**Acceptance**:
- [ ] Hand tracking latency <200ms
- [ ] Shape comparison algorithm 90%+ accurate
- [ ] Visual feedback (trail color) immediate
- [ ] Performance maintained (30fps)
- [ ] Children can trace shapes

### Phase 4: Shape Safari Implementation (Days 10-13)

**Goal**: Complete, tested Shape Safari game

**Tasks**:
1. Create ShapeSafari.tsx component
2. Setup pose detection (PoseNet)
3. Create jungle map/canvas
4. Implement pose-to-movement mapping
5. Create obstacle detection
6. Implement shape collection mechanic
7. Add progression (3 levels)

**Deliverables**:
- Playable game at `/games/shape_safari`
- Pose recognition working
- 3 difficulty levels playable

**Acceptance**:
- [ ] Pose detection <100ms
- [ ] Movement responsive to poses
- [ ] Collision detection works
- [ ] Level progression clear
- [ ] Children engage with navigation

### Phase 5: Integration & Polish (Days 14-20)

**Goal**: All 3 games integrated, tested, shipped

**Tasks**:
1. Add all 3 games to game selection menu
2. Update LetterJourney to unlock new games
3. Integrate with achievement system (Lumi appearance)
4. Add audio effects (level complete, game unlock)
5. Playtest all 3 with target age groups
6. Bug fixes + performance optimization
7. Final QA pass

**Acceptance**:
- [ ] All 3 games accessible from dashboard
- [ ] Game unlock working (5 letters → first game)
- [ ] Score saving + retrieval working
- [ ] Performance metrics met (FCP <3s)
- [ ] No regressions in existing games
- [ ] Positive feedback from playtesters

---

## Part 4: Files Created

**New files** (12+):
- `src/frontend/src/pages/PhonicsGame.tsx`
- `src/frontend/src/pages/MirrorDrawGame.tsx`
- `src/frontend/src/pages/ShapeSafariGame.tsx`
- `src/frontend/src/components/games/PhonemeIndicator.tsx`
- `src/frontend/src/components/games/LetterTiles.tsx`
- `src/frontend/src/components/games/DrawingCanvas.tsx`
- `src/frontend/src/components/games/JungleMap.tsx`
- `src/frontend/src/utils/games/shapeComparison.ts`
- `src/frontend/src/utils/games/poseToMovement.ts`
- Tests for all 3 games
- Design specs for all 3 games

**Modified files** (~5):
- `src/frontend/src/pages/Home.tsx` (add 3 games to menu)
- `src/frontend/src/pages/LetterJourney.tsx` (unlock mechanics)
- `src/backend/src/routes/games.ts` (add endpoints for 3 games)

---

## Part 5: Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Phonetics accuracy | 80% first-attempt | User testing |
| Mirror Draw latency | <200ms hand response | Profiler |
| Shape Safari engagement | 5+ min avg play | Analytics |
| Audio quality | Clear, no distortion | Listening test |
| CV reliability | 95% pose detection accuracy | Test dataset |
| No regressions | All 13 existing games work | Game function test |

---

## Part 6: Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Hand tracking latency too slow | Profile early; use lite model if needed |
| Pose recognition unreliable | Test in variable lighting; add feedback if uncertain |
| Shape comparison too strict | Adjust tolerance; test with real children |
| Game too hard / too easy | Playtesting; difficulty slider if needed |
| Audio generation sounds robotic | Use Kokoro or upgrade to real VO later |
| Children lose interest | Gamification (achievements, unlocks) drives engagement |

---

## Conclusion

**This is the "breadth" initiative**: 3 new games expand skill coverage and keep engagement high.

**Success = Kids unlock all 3 new games and play daily to complete them.**

