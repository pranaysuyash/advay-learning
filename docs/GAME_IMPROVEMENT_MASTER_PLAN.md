# Game Improvement Master Plan

## Advay Vision Learning - Games, Lessons & Experiences

**Date:** 2026-02-17  
**Status:** Active Implementation  
**Priority:** P0 - Critical Fun Factor Improvements  

---

## Executive Summary

This document consolidates findings from critical assessments, audits, and research to create a unified improvement plan for all learning games, lessons, and experiments in the Advay Vision Learning platform.

**Current State:**

- 13 games implemented (10 hand-based, 3 pose-based)
- 67+ game ideas catalogued
- 3 CV systems working in isolation (hand, face, pose)
- Wellness monitoring invisible to users
- High latency (300-500ms) affecting magic feel

**Target State:**

- Combined CV experiences (hand + pose + face together)
- Visible wellness/attention tracking
- <200ms latency
- Satisfying audio-visual feedback
- "One button to play" UX

---

## Section 1: Current Game Inventory

### 1.1 Live Games (Implemented)

| # | Game | CV Type | Fun Score | Status | Priority Fix |
|---|------|---------|-----------|--------|--------------|
| 1 | **Finger Number Show** | Hand | 4/5 | ✅ Live | Polish |
| 2 | **Alphabet Tracing** | Hand+Face | 3/5 | ✅ Live | Simplify |
| 3 | **Music Pinch Beat** | Hand | 4/5 | ✅ Live | Add content |
| 4 | **Shape Pop** | Hand | 3/5 | ✅ Live | Add variety |
| 5 | **Connect the Dots** | Hand | 2/5 | ✅ Live | Forgiving detection |
| 6 | **Letter Hunt** | Hand | 3/5 | ✅ Live | Better feedback |
| 7 | **Steady Hand Lab** | Hand | 2/5 | ⚠️ Consider cut | Reimagine |
| 8 | **Color Match Garden** | Hand | 3/5 | ✅ Live | Accessibility |
| 9 | **Number Tap Trail** | Hand | 3/5 | ✅ Live | Reskin |
| 10 | **Shape Sequence** | Hand | 2/5 | ⚠️ Too hard | Audio cues |
| 11 | **Yoga Animals** | Pose | 4/5 | ✅ Live | Add demos |
| 12 | **Freeze Dance** | Pose | 4/5 | ✅ Live | Add hand challenges |
| 13 | **Simon Says** | Pose | 3/5 | ✅ Live | Better detection |

### 1.2 Planned Games (From Catalog)

**P0 (Next 2-4 weeks):**

| # | Game | Type | Effort |
|---|------|------|--------|
| 14 | **Phonics Sounds** | Hand+Audio | 1.5 weeks |
| 15 | **Mirror Draw** | Hand | 1 week |
| 16 | **Shape Safari** | Hand | 1 week |

**P1 (1-2 months):**

| # | Game | Type | Effort |
|---|------|------|--------|
| 17 | **Rhyme Time** | Audio+Touch | 1 week |
| 18 | **Story Sequence** | Touch | 1 week |
| 19 | **Free Draw** | Hand | 1 week |
| 20 | **Number Tracing** | Hand | 1.5 weeks |

---

## Section 2: Critical Improvements (P0)

### 2.1 Combined CV Experiences ⭐ HIGHEST IMPACT

**Problem:** CV systems work in isolation. Kids never experience the full "computer sees my whole body" magic.

**Solution:** Create games that combine hand + pose + face tracking.

#### Implementation: Freeze Dance + Fingers (Week 1)

```
Game Flow:
1. Music plays → Dance with whole body (pose tracking)
2. Music stops → FREEZE + "Show 3 fingers!" (hand tracking)
3. Success check → Pose frozen AND fingers correct
4. Progression → Add face challenges: "Look up!"
```

**Files to modify:**

- `src/frontend/src/pages/FreezeDance.tsx` - Add hand tracking
- `src/frontend/src/hooks/useCombinedTracking.ts` - NEW hook

#### Implementation: Yoga Letter Tracer (Week 2)

```
Game Flow:
1. Show animal pose (tree pose for giraffe)
2. Hold pose (pose tracking)
3. "Trace the letter G in the air!" (hand tracking)
4. Success = pose held + letter traced
```

### 2.2 Visible Wellness/Attention Meter

**Problem:** Eye tracking runs but kids never see it.

**Solution:** Make attention a visible game mechanic.

```
UI Element: "Focus Power" meter
- Decreases when looking away
- Increases when focused
- High focus = bonus points/special effects
- Low focus = gentle reminder animation
```

**Files to modify:**

- `src/frontend/src/components/AttentionMeter.tsx` - NEW component
- `src/frontend/src/hooks/useAttentionDetection.ts` - Expose score
- `src/frontend/src/pages/alphabet-game/AlphabetGamePage.tsx` - Integrate

### 2.3 Audio Improvements

**Problem:** TTS too slow, sound effects generic, no music.

**Fixes:**

| Issue | Fix | Effort |
|-------|-----|--------|
| TTS prompts wordy | Cut to 2-3 words max | 1 day |
| No success sounds | Add satisfying "ding!" + cheer | 2 days |
| No background music | Add calm, loopable tracks | 3 days |
| Letter mode silent | Speak letter names | 1 day |

**Finger Number Show Prompt Changes:**

```
Before: "Can you please show me three fingers?"
After:  "Show 3!"

Before: "That's correct! You showed me three fingers!"
After:  "3! Great!"
```

### 2.4 Reduced Hold Time

**Problem:** 450ms hold time too long for kids.

**Fix:** Reduce to 200ms with stability check.

```typescript
// In FingerNumberShow.tsx
const HOLD_TIME_MS = 200; // Was 450
const STABILITY_THRESHOLD = 0.95; // 95% confidence
```

### 2.5 Auto-Start Games

**Problem:** Too many menus before playing.

**Solution:** One-button start with smart defaults.

```
New Flow:
1. Click game → Immediate start with defaults
2. Settings icon in corner → Change difficulty/language
3. No pre-game menu for returning players
```

---

## Section 3: Medium Priority (P1)

### 3.1 New Game: Phonics Sounds

**Concept:** Pip makes letter sound, child traces letter.

```
UI:
┌─────────────────────────────┐
│  🔊 "Buh! Buh!" (Pip)      │
│                             │
│     [ Trace B ]            │
│     ┌─────────┐            │
│     │   👻B   │  ← ghost   │
│     └─────────┘            │
│                             │
│  🔊 Repeat    ❓ Hint      │
└─────────────────────────────┘
```

**Assets needed:**

- Phoneme recordings (26 sounds)
- Word example images
- Pip teaching animations

### 3.2 New Game: Mirror Draw

**Concept:** Complete symmetry drawing.

**Why P0:** Uses existing tracing infrastructure, teaches symmetry.

### 3.3 Alphabet Tracing Simplification

**Current:** 1653 lines, overwhelming

**Target:** 400 lines, focused

**Changes:**

1. Remove accuracy scoring → Binary "you did it!"
2. Make hint letter pulse/glow
3. Continuous sound while tracing
4. Extract to smaller components

### 3.4 Game Variations System

**Add modifiers to existing games:**

| Modifier | Effect |
|----------|--------|
| Timer Mode | Complete before timer |
| Zen Mode | No scoring, just practice |
| Challenge Mode | Harder variations |
| Story Mode | Connected by narrative |

---

## Section 4: Implementation Roadmap

### Week 1: Combined CV Foundation

- [ ] Create `useCombinedTracking` hook
- [ ] Modify FreezeDance to add hand challenges
- [ ] Add visible attention meter to AlphabetGame
- [ ] Reduce hold time to 200ms

### Week 2: Audio & UX Polish

- [ ] Shorten all TTS prompts
- [ ] Add satisfying success sounds
- [ ] Implement auto-start flow
- [ ] Add background music system

### Week 3: New Games

- [ ] Implement Phonics Sounds game
- [ ] Implement Mirror Draw game
- [ ] Create game variation system

### Week 4: Combined CV Advanced

- [ ] Yoga Letter Tracer game
- [ ] Full Body Simon Says
- [ ] Attention Arena (face + hand)

---

## Section 5: Technical Architecture

### 5.1 Combined Tracking Hook

```typescript
// useCombinedTracking.ts
interface CombinedTracking {
  hands: HandLandmarkerResult;
  pose: PoseLandmarkerResult;
  face: FaceLandmarkerResult;
  attention: AttentionScore;
  isReady: boolean;
}

export function useCombinedTracking(options: TrackingOptions): CombinedTracking;
```

### 5.2 Audio System

```typescript
// useGameAudio.ts
interface GameAudio {
  speakShort(phrase: string): void; // 2-3 words max
  playSuccess(): void;
  playBackgroundMusic(track: string): void;
  stopBackgroundMusic(): void;
}
```

### 5.3 Game State Machine

```typescript
// useGameState.ts
type GameState = 
  | 'menu'      // Optional
  | 'starting'  // Auto-start countdown
  | 'playing'   // Active gameplay
  | 'paused'    // Pause overlay
  | 'celebrating' // Success animation
  | 'completed'; // End screen
```

---

## Section 6: Success Metrics

### Stop Tracking

- ❌ Educational outcomes
- ❌ Time spent learning
- ❌ Accuracy scores

### Start Tracking

- ✅ Sessions per day
- ✅ "One more time" clicks
- ✅ Spontaneous joy (laughter detection)
- ✅ Parent reports ("they keep asking to play")
- ✅ CV modality engagement (hand vs pose vs combined)

---

## Section 7: Evidence Classification

**Observed:**

- 13 games exist (code reviewed)
- CV systems work in isolation (code verified)
- 450ms hold time (FingerNumberShow.tsx:449)
- 1653 lines in AlphabetGamePage.tsx

**Inferred:**

- Kids want combined experiences (competitive analysis)
- Shorter prompts = better engagement (pedagogical research)
- Visible feedback increases retention (UX studies)

**Unknown:**

- Actual retention metrics (needs analytics)
- Optimal hold time per age group (needs playtesting)
- Which combined CV games kids prefer (needs A/B testing)

---

## Appendix: Quick Reference

### File Locations

```
Games:           src/frontend/src/pages/*.tsx
Game logic:      src/frontend/src/games/*.ts
Hooks:           src/frontend/src/hooks/*.ts
Components:      src/frontend/src/components/*.tsx
Assets:          src/frontend/public/assets/
```

### Key Hooks

```
useHandTracking        - Hand landmark detection
usePoseTracking        - Body pose detection  
useFaceTracking        - Face/eye detection
useAttentionDetection  - Eye gaze tracking
useTTS                 - Text-to-speech
useSoundEffects        - Audio playback
```

### Related Documents

- `GAME_IDEAS_CATALOG.md` - 67 game concepts
- `GAMES-CRITICAL-ASSESSMENT-20260216.md` - Fun factor analysis
- `ACTIVITY_INVENTORY_GAMES_UX.md` - Current inventory
- `docs/WORKLOG_TICKETS.md` - Implementation tracking

---

*Last Updated: 2026-02-17*
*Next Review: Weekly during implementation*
