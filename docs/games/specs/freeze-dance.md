# Freeze Dance

**Game ID:** freeze-dance  
**World:** Body Zone  
**Manifest:** `src/frontend/src/data/gameRegistries/bodyZone.ts`  
**Code:** `src/frontend/src/pages/FreezeDance.tsx`  

---

## 1. Concept Summary

- **One-line concept:** Classic party game where players dance when music plays and freeze completely still when it stops
- **Genre:** Physical / Pose-based / Musical / Party Game
- **Target audience:** Ages 3-8, perfect for active play and energy release
- **Core player fantasy:** "I can control my body like a statue!" - mastering the art of stillness through play
- **Primary skill tested:** Body awareness, self-control, impulse inhibition, gross motor coordination
- **Session length:** 3-8 minutes per game (infinite rounds until player stops)
- **Platform context:** First hybrid CV game combining pose + hand tracking in Body Zone

---

## 2. Repo Status

- **Implementation status:** ✅ Production Ready
- **What works now:**
  - Pose-based movement detection using MediaPipe PoseLandmarker
  - Real-time skeleton visualization with color-coded state (green=dancing, red=frozen)
  - Stability score calculation during freeze phases
  - Two game modes: Classic (pose only) and Combo (pose + finger challenges)
  - Voice instructions and TTS feedback
  - Streak tracking with milestone celebrations
  - Hand tracking integration for finger counting challenges
  - Haptic feedback integration
  - Game completion/save progress
- **What is partial/missing:**
  - No actual music playback (visual-only music indicators)
  - No multiplayer/competitive mode
  - Limited song variety (phases are randomized but not song-based)
- **Evidence:**
  - Main file: `src/frontend/src/pages/FreezeDance.tsx` (916 lines)
  - Uses: `useGameHandTracking` hook (for finger challenge)
  - Uses: MediaPipe `PoseLandmarker` directly (for body tracking)
- **Confidence level:** High - Feature-complete core game with innovative hybrid CV mode

---

## 3. Current Implementation

### Flow
1. **Pre-game menu:** Mode selection (Classic vs Combo), instructions
2. **Gameplay loop:**
   - **DANCE phase** (10-13s): Large "DANCE!" indicator, music icon, player can move freely
   - **FREEZE phase** (3.5s): "FREEZE!" indicator, snowflake icon, must hold completely still
   - **FINGER CHALLENGE** (6s, Combo mode only): After successful freeze, show specific finger count
3. **Scoring:** Based on stability score (0-100%) during freeze
4. **Feedback:** Voice prompts, celebration overlays, streak tracking

### Movement Detection
```typescript
// Key body landmarks tracked (12 points)
const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
// Shoulders(2), Elbows(2), Wrists(2), Hips(2), Knees(2), Ankles(2)

// Movement calculation
const dx = landmarks[i].x - lastPoseRef.current[i].x;
const dy = landmarks[i].y - lastPoseRef.current[i].y;
totalMovement += Math.sqrt(dx * dx + dy * dy);
stabilityScore = Math.max(0, 100 - totalMovement * 500);
```

### Hybrid CV Mode (Combo)
- After successful freeze (>60% stability), triggers finger challenge
- Player must hold up specific number of fingers (0-5)
- Hand tracking takes over from pose tracking during this phase
- Visual hand overlay appears during finger challenge

### Scoring
- **Stability >80%:** Perfect freeze, celebration, streak increment
- **Stability 50-80%:** Good freeze, points awarded, streak continues
- **Stability <50%:** Poor freeze, minimal points, streak broken
- **Finger challenge success:** Bonus points, special celebration message

---

## 4. Intended Design

Based on manifest and code evidence:

- **Educational goal:** Body awareness, impulse control, listening skills
- **Pedagogical approach:** Learning through active play and self-regulation
- **Core loop:** Dance freely → Listen for cue → Control body → Reward for success
- **Accessibility:** Visual indicators (no audio dependency), slower phases for younger children
- **Progression:** Infinite rounds with increasing difficulty via combo mode unlocks

### Game Phases Detail
| Phase | Duration | Action Required | Visual Cue |
|-------|----------|-----------------|------------|
| Dancing | 10-13s | Move freely, have fun | Blue "DANCE!" + Music icon |
| Freezing | 3.5s | Hold completely still | Red "FREEZE!" + Snowflake icon |
| Finger Challenge | 6s | Show target fingers | Purple "SHOW N!" + Hand icon |

---

## 5. Drift Analysis

### Where Implementation Matches Intent
✅ Pose-based movement detection works accurately  
✅ Classic freeze dance gameplay preserved  
✅ Visual feedback is clear and child-friendly  
✅ Two game modes provide appropriate difficulty scaling  
✅ Streak system adds motivation without punishment  
✅ Voice instructions support pre-readers  

### Where Implementation Exceeds Intent
🌟 **Innovative hybrid CV:** Only game combining pose + hand tracking  
🌟 **Finger challenge adds layer:** Unique twist on classic game  
🌟 **Stability score visualization:** Real-time feedback bar during freeze  
🌟 **Skeleton overlay:** Educational body awareness visualization  

### Where Implementation Falls Short
⚠️ No actual music/soundtrack (visual music indicators only)  
⚠️ No multiplayer support (classic game is inherently social)  
⚠️ Limited pose variety encouragement (just "freeze", not specific poses)  
⚠️ No elimination mechanic (all players "win" each round)  

### Comparison to Musical Statues (Similar Game)
| Feature | Freeze Dance | Musical Statues |
|---------|--------------|-----------------|
| CV Mode | Pose + Hand (hybrid) | Hand only |
| Movement Detection | 12 body landmarks | Cursor-based |
| Visual Feedback | Skeleton overlay | Canvas backgrounds |
| Game Duration | Infinite rounds | Fixed rounds (4+level) |
| Finger Challenge | Yes (Combo mode) | No |
| Elimination | No | No |

### Overall Assessment
**Alignment: 90%** - Strong implementation with innovative hybrid CV features. Main gap is lack of actual music.

---

## 6. Recommended Canonical Version

The current implementation IS the canonical version with minor enhancements:

### Keep (Current Strengths)
- Hybrid pose + hand tracking (unique to this game)
- Real-time skeleton visualization
- Stability score feedback
- Two game modes (Classic/Combo)
- Voice instruction system
- Streak tracking with celebrations

### Enhance
1. **Music integration:** Add actual songs with on/off control
2. **Pose variety:** Encourage specific freeze poses (star, tree, etc.)
3. **Multiplayer mode:** Support 2+ players with elimination
4. **Song selection:** Multiple tracks with different tempos
5. **Freeze countdown:** Visual countdown during freeze phase

### Remove
- Nothing significant

---

## 7. Visual Identity

- **Overall look:** Party atmosphere with clean, playful aesthetic
- **Camera view:** Full body camera view with skeleton overlay
- **Art style:** Simple icons, rounded shapes, friendly colors
- **Mood:** Energetic during dance, tense during freeze, celebratory on success
- **Colors:**
  - Dancing phase: Blue (#3B82F6) + Music icon
  - Freeze phase: Red (#EF4444) + Snowflake icon
  - Finger challenge: Purple (#A855F7) + Hand icon
  - Success: Green (#10B981)
  - Skeleton: Green (dancing) / Red (frozen)
- **Environment:** Clean background, focus on player and game indicators
- **UI style:** Large phase indicators, prominent score display, streak badges

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Pre-Game Menu** | Mode selection, instructions | Game mode buttons (Classic/Combo), how-to-play steps, start button |
| **Dance Phase** | Free movement | "DANCE!" header, music icon, round counter, skeleton overlay |
| **Freeze Phase** | Hold still | "FREEZE!" header, snowflake icon, stability bar, skeleton turns red |
| **Finger Challenge** | Show fingers | "SHOW N!" header, hand icon, finger count progress bar |
| **Celebration** | Reward success | Party popper animation, success message, score update |
| **Streak Milestone** | Highlight achievement | Animated streak badge with fire emoji |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Dance | Move body freely | Skeleton turns green, "DANCE!" displayed |
| Freeze | Hold completely still | Skeleton turns red, stability bar appears |
| Show fingers | Hold up target fingers | Progress bar fills, green when correct |
| Start game | Button press | Game begins with dance phase |
| End game | Button press | Final score saved, return to menu |

### CV Technical Details
- **Pose tracking:** MediaPipe PoseLandmarker, 33 landmarks, tracking 12 key body points
- **Hand tracking:** `useGameHandTracking` hook, active only during finger challenge
- **Frame rate:** ~20fps for pose (throttled), ~30fps for hand tracking
- **Movement threshold:** Stability = 100 - (totalMovement × 500)
- **Finger detection:** `countExtendedFingersFromLandmarks()` utility

---

## 10. Core Mechanics

### Phase System
```
DANCE (10-13s) → FREEZE (3.5s) → [Optional: FINGER CHALLENGE (6s)] → SCORE → REPEAT
```

### Movement Detection Algorithm
1. Capture pose landmarks every frame during freeze
2. Compare current frame to previous frame for 12 key points
3. Calculate Euclidean distance for each point
4. Sum distances → totalMovement
5. Convert to stability score: `max(0, 100 - totalMovement × 500)`

### Finger Challenge Logic
- Triggered when: `stabilityScore > 60 && round > 2 && gameMode === 'combo'`
- Target fingers: Random 0-5
- Detection: Uses hand landmarks to count extended fingers
- Success: `detectedFingers === targetFingers`

### Scoring Formula
- Base score: `stabilityScore` (0-100 points)
- Streak bonus: Every 5 rounds triggers milestone celebration
- Perfect freeze streak: Tracked via `perfectFreezeStreakRef` (Easter egg at 5)
- Finger challenge: Additional celebration (no extra score currently)

---

## 11. Rules

- **Start:** Choose Classic or Combo mode, press Start Dancing
- **Dancing:** Move freely when "DANCE!" shown
- **Freezing:** Must hold completely still when "FREEZE!" shown
- **Movement tolerance:** Any significant movement reduces stability score
- **Scoring:** Based on percentage of freeze time held still
- **Rounds:** Infinite until player chooses to end
- **Streak:** Consecutive good freezes (>50%) build streak
- **Combo mode:** After round 3, successful freezes trigger finger challenges

### What Counts as Moving
- Any movement of shoulders, elbows, wrists, hips, knees, or ankles
- Small involuntary movements are tolerated (threshold-based)
- Stability >60% required to trigger finger challenge
- Stability >80% considered "perfect freeze"

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Phase indicator | Show current phase | Changes per phase (DANCE/FREEZE/SHOW) |
| Phase icon | Visual phase cue | Music/Snowflake/Hand icon |
| Round counter | Track progress | Increments after each freeze |
| Score display | Total points | Increases based on stability |
| Stability bar | Freeze quality feedback | Real-time during freeze (0-100%) |
| Skeleton overlay | Body tracking visualization | Green (dance) / Red (freeze) |
| Finger progress | Finger challenge status | Fills toward target count |
| Streak badge | Motivation | Appears when streak >0 |
| Camera status | Tracking confirmation | "Camera Ready" indicator |

### Skeleton Visualization
- 12 key body points drawn as circles
- Connecting lines show body structure
- Color indicates state: Green=dancing, Red=frozen, Orange=caution

---

## 13. Feedback and Feel

### Success Feedback
- **Stability >80%:** Full celebration with party popper, positive voice feedback
- **Stability 50-80%:** "Good freeze!" message, moderate celebration
- **Finger challenge success:** "Perfect! Hold it!" + success sound
- **Streak milestone:** Animated fire badge overlay (🔥 N Streak! 🔥)
- **Perfect freeze streak:** Tracked internally for Easter egg

### Failure Feedback
- **Stability <50%:** Gentle "Good try!" message, streak reset
- **Moving during freeze:** Real-time stability bar decreases
- **No punishment:** Game continues, encouraging retry

### Audio/Haptic
- Voice prompts for each phase ("Dance dance dance!", "Freeze!", etc.)
- Success sound on finger challenge completion
- Celebration fanfare on good freeze
- Haptic feedback: success, celebration, error

### Rhythm/Timing
- Dance phase: Long (10-13s) for younger children
- Freeze phase: Moderate (3.5s) - achievable but challenging
- Finger challenge: Extended (6s) to allow adjustment
- Round transition: Immediate, maintains energy

---

## 14. Points / Rewards / Progression

### Points
- Base: Stability percentage (0-100 points per round)
- Streak bonus: Psychological (milestones at 5, 10, etc.)
- No penalty for poor freezes (encouragement-based)

### Rewards (Drops)
From game manifest:
- `material-ice` (15% chance) - Thematic ice material
- `emotion-happy` (20% chance) - Happy emotion reward
- `material-sunshine` (3% chance) - Rare sunshine material

### Easter Egg
- **"Ice Sculpture"**: Freeze perfectly still 5 times in a row
- Reward: 2x `material-ice`
- Hint: "Can you freeze like a statue?"

### Progression
- Infinite rounds - player decides when to stop
- Combo mode unlocks finger challenges after round 3
- Streak tracking across entire session
- No level system (unlike Musical Statues)

---

## 15. End States

### Round End
- Stability calculated
- Score added to total
- Streak updated
- Celebration (if >50% stability)
- Next round begins automatically

### Game End (Player-initiated)
- Final score displayed
- Progress saved via `completeGame()`
- Return to menu
- Session stats available in profile

### No Failure State
- Game continues indefinitely
- Poor freezes don't end game
- Streak resets but game continues
- Designed for continuous fun, not challenge/retry loop

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Classic (Current Default)
- Pose tracking only
- Dance → Freeze → Score
- Good for younger children (3-5)

### Mode B: Combo (Current Advanced)
- Pose + Hand tracking hybrid
- Dance → Freeze → Finger Challenge → Score
- For older children (5-8)
- Introduces additional cognitive challenge

### Mode C: Multiplayer (Proposed)
- Multiple players visible in frame
- Player elimination for moving during freeze
- Last player standing wins
- Social/classroom mode

### Mode D: Statue Challenge (Proposed)
- Must freeze in specific pose (star, tree, etc.)
- CV checks pose similarity, not just stillness
- Yoga/flexibility integration

### Mode E: Speed Freeze (Proposed)
- Shorter freeze phases (1-2s)
- Faster music tempo
- Quick reaction focus
- For older children seeking challenge

---

## 17. Improvement Opportunities

### Low Cost
- Add actual music playback with mute option
- Freeze countdown timer (3-2-1)
- More celebration variations
- Pose suggestions during dance phase

### Medium Effort
- Multiplayer support with player detection
- Specific pose challenges (star, tree, etc.)
- Song selection with different tempos
- Difficulty settings (freeze duration adjustment)

### Ambitious
- AI-generated freeze pose challenges
- Classroom mode with 20+ players
- Dance move suggestions/guidance
- Integration with music streaming services
- Tournament bracket mode

---

## 18. Content Model

### Phases (Not Songs)
Current implementation uses randomized phase timing, not songs:
- **Dance duration:** 10,000-13,000ms (random)
- **Freeze duration:** 3,500ms (fixed)
- **Finger challenge:** 6,000ms (fixed)

### Difficulty Scaling
| Mode | Freeze Duration | Finger Challenge | Notes |
|------|-----------------|------------------|-------|
| Classic | 3.5s | No | Easiest |
| Combo (early) | 3.5s | No | Rounds 1-2 |
| Combo (advanced) | 3.5s | Yes | Rounds 3+ |

### Proposed Content Expansion
- **Song library:** 5-10 tracks with varying tempos
- **Difficulty levels:** Easy (5s freeze), Medium (3.5s), Hard (2s)
- **Pose library:** 10+ freeze poses to match

---

## 19. Technical Structure

### Main Files
- `src/frontend/src/pages/FreezeDance.tsx` - Main component (916 lines)
- `src/frontend/src/hooks/useGamePoseTracking.ts` - Pose tracking hook (133 lines)
- `src/frontend/src/hooks/useGameHandTracking.ts` - Hand tracking hook (shared)
- `src/frontend/src/games/fingerCounting.ts` - Finger detection utility

### Key Components
```typescript
// State management
const [gamePhase, setGamePhase] = useState<'dancing' | 'freezing' | 'fingerChallenge'>('dancing');
const [stabilityScore, setStabilityScore] = useState(0);
const [gameMode, setGameMode] = useState<'classic' | 'combo'>('combo');

// Refs for tracking
const lastPoseRef = useRef<any>(null);
const stabilityRef = useRef(0);
const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
```

### CV Integration
1. **Pose Detection:** Direct MediaPipe PoseLandmarker usage
   - Model: `pose_landmarker_lite` (float16)
   - GPU delegate with CPU fallback
   - 12 key landmarks tracked for movement

2. **Hand Detection:** `useGameHandTracking` hook
   - Activated only during finger challenge
   - Single hand tracking
   - Finger counting via landmark analysis

### State Machine
```
MENU → [Start] → DANCING → [Timer] → FREEZING → [Timer] → [If combo + good freeze] → FINGER → [Timer] → SCORE → DANCING
                                      ↓
                                [If classic/bad freeze] → SCORE → DANCING
```

### Dependencies
- `@mediapipe/tasks-vision` - PoseLandmarker
- `framer-motion` - Animations
- `lucide-react` - Icons
- Custom hooks: `useGameHandTracking`, `useStreakTracking`, `useTTS`

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Music playback | Visual indicators only, no audio | High |
| Multiplayer | Single player only, though party game is social | High |
| Pose matching | Only checks stillness, not specific poses | High |
| Movement threshold tuning | Fixed multiplier (500), not configurable | Medium |
| Performance on low-end | Pose tracking every frame may be heavy | Medium |
| Accessibility | No audio-only mode for visually impaired | Low |

---

## 21. Implementation Notes

### Strengths to Preserve
- Hybrid CV approach (pose + hand) is innovative and engaging
- Real-time skeleton visualization is educational
- Two modes provide good difficulty progression
- Voice instructions support pre-readers
- No failure state maintains positive experience

### Refactor Opportunities
- Main file is 916 lines - could extract phase components
- PoseLandmarker initialization could use shared hook
- Finger challenge logic could be extracted to custom hook
- Duplicate celebration logic (separate overlays could be unified)

### Performance Considerations
- Pose detection runs every frame during gameplay
- Consider throttling to 15fps on low-end devices
- Hand tracking only active during finger challenge (efficient)
- GPU delegate with CPU fallback handles most devices

### Testing Focus
- Movement detection accuracy at different distances
- Stability score calculation edge cases
- Hand tracking fallback when hands not visible
- TTS voice instruction timing

---

## 22. Acceptance Criteria

- [ ] Pose tracking initializes successfully
- [ ] Skeleton overlay appears and tracks body
- [ ] Phase transitions work (Dance → Freeze → [Finger] → Score)
- [ ] Stability score calculates correctly during freeze
- [ ] Score updates based on stability percentage
- [ ] Classic mode has no finger challenges
- [ ] Combo mode triggers finger challenge after round 3
- [ ] Finger counting works (0-5 fingers)
- [ ] Voice instructions play at phase transitions
- [ ] Streak tracking increments on good freezes
- [ ] Milestone celebrations appear every 5 streak
- [ ] Game completion saves progress
- [ ] Haptic feedback triggers on events

---

## 23. Test Plan

### Manual Checks
- [ ] Start Classic mode, verify no finger challenges
- [ ] Start Combo mode, reach round 3, verify finger challenge appears
- [ ] Move during freeze, verify stability score drops
- [ ] Hold still during freeze, verify stability stays high
- [ ] Show correct fingers, verify success feedback
- [ ] Show wrong fingers, verify no success
- [ ] Build 5+ streak, verify milestone celebration
- [ ] End game, verify score saved

### State Transitions
- [ ] Menu → Gameplay (Dance) → Freeze → Score → Dance (loop)
- [ ] Menu → Gameplay → Dance → Freeze → Finger Challenge → Score
- [ ] Gameplay → End Game → Menu (with saved progress)

### Edge Cases
- [ ] Player moves out of camera view
- [ ] Only partial body visible (cropped)
- [ ] Multiple people in frame
- [ ] Very fast movements during freeze
- [ ] Hand not visible during finger challenge
- [ ] Rapid mode switching (Classic ↔ Combo)

### Performance Tests
- [ ] 5+ minute continuous play
- [ ] Low-end device pose tracking
- [ ] Camera permission denied handling
- [ ] GPU fallback to CPU

---

**Last Updated:** 2026-04-01  
**Confidence:** High - Production-ready with innovative hybrid CV implementation
