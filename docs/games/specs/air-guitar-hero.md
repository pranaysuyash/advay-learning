# Air Guitar Hero - Comprehensive Game Specification

**Game ID:** `air-guitar-hero`  
**World:** Word Workshop  
**Type:** Musical / Rhythm / Creative  
**Code:** `src/frontend/src/pages/AirGuitarHero.tsx` (705 lines)  
**Logic:** `src/frontend/src/games/airGuitarHeroLogic.ts` (84 lines)  
**Registry:** `src/frontend/src/data/gameRegistries/wordWorkshop.ts`  

---

## 1. Concept Summary

| Aspect | Description |
|--------|-------------|
| **One-line concept** | Strum virtual guitar strings using hand tracking to play note sequences |
| **Genre** | Musical / Motion-Controlled / Sequential Pattern Game |
| **Target audience** | Ages 3-8, music-curious children |
| **Core player fantasy** | "I'm a rockstar shredding on guitar!" - air guitar performance fantasy |
| **Primary skills tested** | Gross motor coordination, rhythm awareness, pattern following, timing |
| **Session length** | 1-3 minutes per level (8-16 notes) |
| **CV requirement** | Hand tracking for strumming gesture detection |

---

## 2. Repo Status

### Implementation Status: ⚠️ PARTIAL - SIGNIFICANT DRIFT FROM TITLE

**What Works Now:**
- ✅ Hand tracking integration (`useGameHandTracking`)
- ✅ Strum detection via downward Y-velocity gesture
- ✅ Sequential note presentation (one note at a time)
- ✅ 3 difficulty levels with scaling note counts
- ✅ Streak tracking and milestone celebrations
- ✅ Score calculation with difficulty multipliers
- ✅ Guitar neck visual with 6 strings (E-A-D-G-B-e)
- ✅ Color-coded notes per string
- ✅ Click/tap fallback for strumming
- ✅ Asset preloading system
- ✅ GameShell integration with wellness timer

**What Is Missing (Critical for "Guitar Hero" Promise):**
- ❌ **NO note highway** - Notes don't scroll/fall toward a target
- ❌ **NO rhythm timing** - No beat-matching or tempo synchronization
- ❌ **NO actual songs** - Just random note sequences, no melodies
- ❌ **NO background music** - Silent gameplay except for UI sounds
- ❌ **NO fret position detection** - Only strumming, no finger positioning
- ❌ **NO audio feedback per note** - Note names spoken via TTS, not actual guitar sounds
- ❌ **NO miss detection** - Cannot miss notes, only proceed at own pace
- ❌ **NO fail state** - No consequence for slow/inaccurate play

**Evidence:**
- Main component: `src/frontend/src/pages/AirGuitarHero.tsx` (lines 1-705)
- Logic module: `src/frontend/src/games/airGuitarHeroLogic.ts` (lines 1-84)
- Game uses `generateNoteSequence()` which creates random notes, not songs
- Strum detection: Lines 166-209 in AirGuitarHero.tsx (Y-velocity threshold)
- Current note display: Shows single note at a time, not a scrolling highway

**Confidence Level:** High - Code is clear, but drift from "Guitar Hero" title is significant

---

## 3. Current Implementation

### Flow

```
Loading Screen → Menu (Level Select) → Playing → Complete
```

1. **Loading:** Asset preloader for Kenney assets (hearts, stars)
2. **Menu:** Level selector (1-3), instructions, scoring explanation
3. **Playing:** 
   - Single note displayed prominently
   - Player strums via hand gesture or button click
   - Note advances on successful strum
   - Streak counter increments
4. **Complete:** Score display, streak celebration, replay/exit options

### Controls

| Input | Action | Implementation |
|-------|--------|----------------|
| **Hand tracking** | Strum guitar | Downward hand motion in strum zone (Y > 0.7, deltaY > 0.15) |
| **Click/Tap** | Strum guitar | On-screen "STRUM!" button |
| **Button** | Level select | Level 1/2/3 toggle buttons |
| **Button** | Start/Finish | Standard game flow buttons |

### Mechanics

**Strum Detection:**
```typescript
// From AirGuitarHero.tsx lines 54-56
const STRUM_THRESHOLD = 0.15;     // Minimum Y movement for strum
const STRUM_COOLDOWN_MS = 400;    // Cooldown between strums
const STRUM_ZONE_Y = 0.7;         // Y position where strumming happens
```

**Note Progression:**
- Random sequence of notes from 9-note pool
- Each strum advances to next note
- No timing requirement - self-paced

**Scoring:**
- Base: 10 points per note
- Streak bonus: +2 per consecutive note (max 20)
- Difficulty multiplier: Easy 1×, Medium 1.5×, Hard 2×
- Max per note: 60 points (hard, 10+ streak)

### Visuals/UI

- **Guitar neck:** Dark fretboard with 6 colored strings
- **Note display:** Large colored card showing current note name
- **String highlighting:** Current string highlighted on fretboard
- **Strum zone:** Yellow highlight area at bottom of fretboard
- **Progress dots:** Grid showing completed/current/pending notes
- **Streak HUD:** Heart icons filling every 2 notes

### Gaps/Issues

1. **Name mismatch:** "Guitar Hero" implies rhythm game, but this is sequential pattern matching
2. **No musical feedback:** TTS speaks note names, no actual guitar audio
3. **No challenge:** No fail state, no time pressure, no accuracy requirement
4. **Repetitive:** Random notes don't form memorable songs or melodies
5. **Limited gesture:** Only strumming, no fret hand simulation

---

## 4. Intended Design

### Based on Title Analysis

The name "Air Guitar Hero" strongly implies:
1. **Guitar Hero-style gameplay:** Note highway, falling notes, timing-based hits
2. **Air guitar simulation:** Full-body guitar pose recognition
3. **Musical performance:** Playing along with actual songs

### Current Educational Goals (Observed)

- **Motor coordination:** Arm/wrist movement for strumming
- **Pattern following:** Sequential note completion
- **Musical awareness:** Note names and string positions
- **Streak building:** Encourages continued engagement

### Pedagogical Approach

- **Learn-by-doing:** Physical movement creates memorable association
- **Visual reinforcement:** Colors link notes to strings
- **Positive reinforcement:** Streak system rewards persistence
- **Self-paced:** No pressure, allows exploration

### Core Loop (Current)

1. See target note (with color/string)
2. Perform strum gesture
3. Receive immediate visual/audio feedback
4. Advance to next note
5. Build streak for bonus points
6. Complete sequence, see final score

---

## 5. Drift Analysis

### Where Implementation Matches Intent

✅ **Hand tracking for strumming** - Core CV mechanic works well  
✅ **Guitar visual theming** - Fretboard, strings, note colors present  
✅ **Note naming** - E-A-D-G-B-e standard guitar tuning  
✅ **Score/streak system** - Rewards consistent performance  
✅ **Rockstar fantasy** - "Rockstar!" completion message, guitar emoji  

### Where Implementation Exceeds Intent

🌟 **Accessibility:** Click fallback for non-CV play  
🌟 **Asset preloading:** Smooth loading experience  
🌟 **Streak milestones:** Visual celebration every 10 notes  

### Where Implementation Falls Short (Critical)

⚠️ **HIGH DRIFT:** No note highway/scrolling gameplay (80% of "Guitar Hero" expectation)  
⚠️ **HIGH DRIFT:** No rhythm/timing mechanics (just sequential advancement)  
⚠️ **MEDIUM DRIFT:** No actual guitar audio (TTS speaks note names)  
⚠️ **MEDIUM DRIFT:** No songs/melodies (random note sequences)  
⚠️ **MEDIUM DRIFT:** No fail/miss state (can't lose, only stop)  
⚠️ **LOW DRIFT:** No fret hand simulation (could be added as enhancement)  

### Drift Summary

| Expected (Guitar Hero) | Actual Implementation | Severity |
|------------------------|----------------------|----------|
| Falling notes on highway | Single static note display | HIGH |
| Beat-matched timing | Self-paced, no timing | HIGH |
| Background music tracks | Silence | MEDIUM |
| Hit/miss judgment | Automatic on strum | MEDIUM |
| Song progression | Random note sequence | MEDIUM |
| Two-handed play (fret + strum) | Strum only | LOW |

### Overall Assessment

**Alignment: 40%** - The strumming mechanic and guitar visuals are present, but the core "rhythm game" identity implied by "Guitar Hero" is absent. Current implementation is closer to "Guitar Flashcards" than "Guitar Hero."

---

## 6. Recommended Canonical Version

### Two-Path Decision

Given the significant drift, there are two viable canonical versions:

#### Option A: Rhythm Game Overhaul (True "Guitar Hero")
Transform into actual rhythm game with:
- Scrolling note highway
- Background music with beat-matched notes
- Timing-based scoring (Perfect/Good/Miss)
- Song library with melodies
- Fail state for too many misses

#### Option B: Embrace Current Design ("Guitar Learner")
Lean into sequential learning model:
- Keep self-paced progression
- Add proper guitar audio samples
- Create simple songs (Twinkle Twinkle, etc.)
- Add fret hand position learning
- Rename to avoid Guitar Hero comparison

### Recommendation: HYBRID APPROACH

**Keep:**
- Current strum detection (works well)
- Guitar neck visualization
- Note color coding
- Streak/scoring system
- CV + click dual input

**Enhance:**
1. **Add scrolling note highway** (like Music Conductor)
2. **Add background tempo** with visual beat indicator
3. **Add actual guitar samples** (Web Audio API)
4. **Create simple songs** (nursery rhymes, scales)
5. **Add timing window** (generous for kids: ±200ms)
6. **Keep self-paced mode** as "Practice" alternate mode

**Remove:**
- Random note sequences (replace with intentional patterns)
- TTS note names (replace with actual guitar sounds)

---

## 7. Visual Identity

| Element | Current | Ideal |
|---------|---------|-------|
| **Overall look** | Colorful, cartoon, game-like | Rock concert + cartoon hybrid |
| **Camera view** | Hidden webcam (tracking only) | Camera thumbnail overlay |
| **Art style** | Kenney platformer assets | Custom guitar/rock themed |
| **Mood** | Cheerful, encouraging | Energetic, rockstar-exciting |
| **Primary colors** | Purple (E), Pink (A), Blue (D), Green (G), Yellow (B), Red (e) | Same (keep string colors) |
| **Background** | Mushroom fantasy | Stage with crowd/speakers |
| **UI style** | Rounded cards, soft shadows | Edgier, stage-lighting effects |

### Visual Hierarchy

1. **Current note** - Largest element, center screen
2. **Guitar neck** - Prominent, bottom third
3. **Score/Streak** - Top corners
4. **Progress** - Bottom, note dots
5. **Strum button** - Large, actionable

---

## 8. Screen Map

| Screen | Purpose | Key Elements |
|--------|---------|--------------|
| **Loading** | Asset preload | Spinner, rock-themed tip |
| **Menu** | Level select, instructions | Guitar visual, level buttons, how-to-play |
| **Gameplay** | Core strumming experience | Note display, fretboard, strum zone, HUD |
| **Pause** | Break/exit | Resume, restart, quit options |
| **Streak Milestone** | Celebration overlay | Animated banner, fire effects |
| **Complete** | Session summary | Score, max streak, stars, replay/finish |

### Screen Flow

```
┌─────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐
│ Loading │───▶│   Menu  │───▶│ Gameplay │───▶│ Complete │
└─────────┘    └─────────┘    └────┬─────┘    └──────────┘
                                   │
                              ┌────┴────┐
                              │  Pause  │
                              └─────────┘
```

---

## 9. Controls

### Hand Tracking (Primary)

| Gesture | Action | Detection |
|---------|--------|-----------|
| **Strum down** | Play current note | Y velocity > 0.15 in strum zone |
| **Hand position** | Visual cursor | Index finger tip tracking |
| **Strum zone entry** | Visual feedback | Hand enters lower 30% of screen |

### Click/Touch (Fallback)

| Element | Action |
|---------|--------|
| **STRUM! button** | Play current note |
| **Level buttons** | Select difficulty |
| **Start button** | Begin game |
| **Finish button** | Exit to games menu |

### Strum Detection Technical Details

```typescript
// Current implementation
const STRUM_THRESHOLD = 0.15;      // Normalized Y delta
const STRUM_COOLDOWN_MS = 400;     // Anti-spam
const STRUM_ZONE_Y = 0.7;          // Bottom 30% of screen

// Detection logic
if (deltaY > STRUM_THRESHOLD &&    // Moving down fast enough
    inStrumZone &&                  // In strum area
    cooldownExpired) {              // Not in cooldown
  triggerStrum();
}
```

---

## 10. Core Mechanics

### Strum Detection System

**Input Processing:**
1. Track index finger Y position each frame
2. Calculate deltaY (movement since last frame)
3. Check if in strum zone (Y > 0.7)
4. Apply velocity threshold
5. Enforce cooldown timer
6. Trigger note advance

**Velocity Smoothing:**
- Uses smoothing parameters from `useGameHandTracking`
- `minCutoff: 1.0, beta: 0.3` for stable tracking

### Note Progression

**Current: Sequential Advancement**
```typescript
// No timing required
const performStrum = () => {
  playPop();                    // UI feedback sound
  incrementStreak();
  addScore();
  advanceToNextNote();          // Always succeeds
};
```

**Target: Rhythm-Based (Future)**
```typescript
// Timing window evaluation
const performStrum = () => {
  const timing = evaluateTiming();  // Perfect/Good/Miss
  if (timing !== 'miss') {
    playNoteSound();
    incrementStreak();
    addScore(timingMultiplier);
  } else {
    breakStreak();
  }
};
```

### Scoring Formula

```typescript
function calculateScore(streak: number, difficulty: Difficulty): number {
  const baseScore = 10;
  const streakBonus = Math.min(streak * 2, 20);
  const multiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty];
  return Math.floor((baseScore + streakBonus) * multiplier);
}

// Examples:
// Easy, streak 0:   (10 + 0)  × 1   = 10 points
// Easy, streak 5:   (10 + 10) × 1   = 20 points
// Hard, streak 10+: (10 + 20) × 2   = 60 points
```

---

## 11. Rules

### Game Rules (Current)

1. **Start:** Select level (1-3), click Start Rockin'
2. **Play:** Strum to advance through note sequence
3. **Allowed:** Self-paced progression, unlimited time per note
4. **Scoring:** Points per note with streak bonus
5. **No fail state:** Cannot lose, only complete
6. **Complete:** All notes played triggers completion screen

### Level Configuration

| Level | Notes | Time Limit | Difficulty | Multiplier |
|-------|-------|------------|------------|------------|
| 1 | 8 | 30s | Easy | 1× |
| 2 | 12 | 25s | Medium | 1.5× |
| 3 | 16 | 20s | Hard | 2× |

*Note: Time limits exist in config but are not enforced in gameplay*

### Note Pool

Standard guitar tuning (E-A-D-G-B-e):

| Note | String | Fret | Color |
|------|--------|------|-------|
| E2 | 6 (low) | 0 | Yellow bg, amber border |
| A2 | 5 | 0 | Pink bg, pink border |
| D3 | 4 | 0 | Purple bg, violet border |
| G3 | 3 | 0 | Green bg, green border |
| B3 | 2 | 0 | Blue bg, blue border |
| e4 | 1 (high) | 0 | Red bg, red border |
| F3 | 6 | 1 | Yellow bg, amber border |
| C3 | 5 | 1 | Pink bg, pink border |
| G3 | 3 | 1 | Green bg, green border |

---

## 12. HUD / Gameplay UI

### Top Bar (GameContainer)

| Element | Display | Source |
|---------|---------|--------|
| Title | "Air Guitar Hero" | Static |
| Score | Current points | `score` state |
| Level | Current level (1-3) | `currentLevel` state |
| Home button | Exit to games | Navigation |

### Playing Screen HUD

| Element | Position | Purpose |
|---------|----------|---------|
| **Streak display** | Top center | Heart icons filling, streak number |
| **Hand tracking status** | Top center | Detection indicator, strum zone hint |
| **Current note card** | Center | Large note name with color coding |
| **Milestone overlay** | Center | Appears on streak milestones |
| **Score popup** | Center | +X points animation on each strum |
| **Guitar neck** | Lower center | Fretboard with highlighted string |
| **Strum zone indicator** | Bottom of neck | Yellow glow when hand in zone |
| **Strum button** | Bottom center | Large fallback button |
| **Progress dots** | Bottom | Grid of completed/current/pending notes |
| **Stats panel** | Bottom | Played count, score, best streak |

### Complete Screen

| Element | Display |
|---------|---------|
| Title | "Rockstar!" |
| Guitar/star icons | Decorative |
| Performance message | "You shredded X notes!" |
| Streak badge | Shows if maxStreak >= 5 |
| Score panel | Total score |
| Max streak panel | Best streak achieved |
| Play Again button | Restart game |
| Finish button | Exit to games menu |

---

## 13. Feedback and Feel

### Strum Feedback

| Type | Trigger | Effect |
|------|---------|--------|
| **Visual** | Strum detected | Strum button press animation (scale 0.95) |
| **Audio** | Strum detected | `playPop()` - UI pop sound |
| **Haptic** | Strum detected | `triggerHaptic('success')` |
| **Score** | Strum detected | +X points popup animation |
| **Note advance** | Strum success | Current note highlight moves to next |

### Streak Milestones

| Milestone | Trigger | Effect |
|-----------|---------|--------|
| Every 10 streak | streak % 10 === 0 | Full-screen animated banner "🔥 {streak} Streak! 🔥" |
| Visual | Milestone active | Orange gradient banner with bounce animation |
| Duration | 700ms | Auto-dismiss with fade |

### String Visual Feedback

- **Current string:** Thicker line (h-1.5 vs h-0.5), full opacity
- **Other strings:** Thin line, 40% opacity
- **Color coding:** Each string has unique color maintained consistently

### Strum Zone Feedback

- **Inactive:** Transparent zone at bottom of fretboard
- **Active (hand present):** Yellow overlay (bg-yellow-500/20)
- **Text hint:** "🤘 STRUM NOW! 🤘" appears when hand detected in zone

### Audio Feedback

| Event | Sound | Source |
|-------|-------|--------|
| Click UI | `playClick()` | Standard UI click |
| Strum | `playPop()` | Pop sound effect |
| Complete | `playCelebration()` | Victory sound |
| Note name | TTS speech | `speechSynthesis.speak()` - note name spoken |

---

## 14. Points / Rewards / Progression

### Points System

**Base Scoring:**
- 10 points per note (base)
- +2 points per streak level (max +20)
- × difficulty multiplier

**Max Points Per Level:**
| Level | Notes | Max Streak | Max Score |
|-------|-------|------------|-----------|
| 1 (Easy) | 8 | 8 | 240 points |
| 2 (Medium) | 12 | 12 | 540 points |
| 3 (Hard) | 16 | 16 | 960 points |

### Streak System

- Increments on each successful strum
- Resets only on manual game restart
- No penalty for slow strumming (no timeout)
- Milestone celebration every 10 streaks

### Visual Rewards

| Achievement | Reward |
|-------------|--------|
| Streak 5+ | Star badge on complete screen |
| Streak 10+ | Milestone banner |
| Complete level | "Rockstar!" title, celebration |

### Drops (from Registry)

```typescript
drops: [
  { itemId: 'music-note', chance: 0.2 },
  { itemId: 'star-gold', chance: 0.15 },
]
```

---

## 15. End States

### Song Complete (Normal End)

**Trigger:** All notes in sequence played

**Flow:**
1. Final strum triggers completion
2. `playCelebration()` audio
3. `triggerHaptic('celebration')` haptic
4. Game state changes to 'complete'
5. Complete screen rendered with:
   - "Rockstar!" title
   - Notes played count
   - Total score
   - Max streak
   - Streak badge (if >= 5)
   - Play Again / Finish buttons

### Manual Exit

**Trigger:** Player clicks "Finish" button

**Flow:**
1. `playClick()` audio
2. `completeGame()` saves session
3. Navigate to `/games` menu

### No Fail State

**Current:** Game has no failure condition
- No timer enforcement
- No miss detection
- No maximum attempts
- Player can take unlimited time per note

**Recommendation for Rhythm Overhaul:**
- Add miss threshold (e.g., 5 misses = fail)
- Add health bar instead of instant fail
- Allow continuing with reduced score

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Sequential Strumming)
- Self-paced note progression
- No timing requirements
- Focus on motor coordination
- Good for: Youngest players (ages 3-4), introduction to guitar

### Mode B: Rhythm Highway (Proposed)
- Notes scroll down guitar neck
- Timing-based scoring (Perfect/Good/Miss)
- Background music with beat synchronization
- Fail state for too many misses
- Good for: Ages 5-8, rhythm skill building

### Mode C: Freestyle Jam (Proposed)
- No set sequence
- Player freely strums any string
- Plays corresponding guitar note
- Creative expression mode
- Good for: Free play, musical exploration

### Mode D: Song Mode (Proposed)
- Predefined melodies (Twinkle Twinkle, etc.)
- Note highway shows song progression
- Completion unlocks new songs
- Good for: Learning real songs, progression satisfaction

### Mode E: Two-Handed (Proposed - Ambitious)
- Left hand: Fret position detection (X-axis zones)
- Right hand: Strumming (Y-axis velocity)
- Chord formation learning
- Good for: Advanced motor skills, actual guitar preparation

---

## 17. Improvement Opportunities

### Low Cost / Quick Wins

1. **Add actual guitar sounds:** Replace TTS with Web Audio API guitar samples
2. **Add background beat:** Simple drum loop to encourage rhythm
3. **Add timing indicator:** Visual pulse to suggest strumming tempo
4. **Fix time limit:** Actually enforce the time limits in config
5. **Add miss detection:** Reduce score/streak on accidental double-strums

### Medium Effort

1. **Implement note highway:** Scrolling notes like Music Conductor
2. **Create song patterns:** Replace random notes with intentional melodies
3. **Add difficulty-appropriate timing:** Easy = ±300ms, Hard = ±100ms
4. **Add fret hand visualization:** Show which "fret" to hold
5. **Add song library:** 3-5 simple songs (nursery rhymes)

### Ambitious

1. **Full rhythm game overhaul:** True Guitar Hero-style gameplay
2. **Custom song creator:** Let players compose note sequences
3. **Real audio analysis:** Sync with uploaded MP3s (Web Audio API)
4. **Multiplayer jam session:** Two players, complementary note patterns
5. **Progressive guitar curriculum:** Teach actual guitar skills progressively

### Technical Debt

1. **Split component:** AirGuitarHero.tsx is 705 lines - extract sub-components
2. **Improve audio:** Replace `speechSynthesis` with proper audio assets
3. **Add tests:** No test file exists for airGuitarHeroLogic.ts
4. **Standardize hooks:** Use consistent pattern with other CV games

---

## 18. Content Model

### Notes (Current)

9 notes across 6 strings, 2 frets:

```typescript
const NOTES: GuitarNote[] = [
  { id: 'e2', name: 'E2', fret: 0, string: 6, color: '#FF6B6B' },
  { id: 'a2', name: 'A2', fret: 0, string: 5, color: '#4ECDC4' },
  { id: 'd3', name: 'D3', fret: 0, string: 4, color: '#45B7D1' },
  { id: 'g3', name: 'G3', fret: 0, string: 3, color: '#96CEB4' },
  { id: 'b3', name: 'B3', fret: 0, string: 2, color: '#FFEAA7' },
  { id: 'e4', name: 'E4', fret: 0, string: 1, color: '#DDA0DD' },
  { id: 'f3', name: 'F3', fret: 1, string: 6, color: '#FF6B6B' },
  { id: 'c3', name: 'C3', fret: 1, string: 5, color: '#4ECDC4' },
  { id: 'g3f1', name: 'G3', fret: 1, string: 3, color: '#96CEB4' },
];
```

### Songs (Proposed)

```typescript
interface Song {
  id: string;
  name: string;
  difficulty: 1 | 2 | 3;
  bpm: number;
  notes: { noteId: string; beat: number }[];
}

const SONGS: Song[] = [
  {
    id: 'twinkle',
    name: 'Twinkle Twinkle Little Star',
    difficulty: 1,
    bpm: 80,
    notes: [
      { noteId: 'g3', beat: 0 },
      { noteId: 'g3', beat: 1 },
      { noteId: 'd3', beat: 2 },
      { noteId: 'd3', beat: 3 },
      { noteId: 'e4', beat: 4 },
      { noteId: 'e4', beat: 5 },
      { noteId: 'd3', beat: 6 },
      // ... etc
    ],
  },
];
```

### Difficulty Levels

| Level | Notes | Time | Multiplier | Note Speed (if scrolling) |
|-------|-------|------|------------|---------------------------|
| 1 (Easy) | 8 | 30s | 1× | Slow |
| 2 (Medium) | 12 | 25s | 1.5× | Medium |
| 3 (Hard) | 16 | 20s | 2× | Fast |

### Assets

**Current Kenney Assets:**
- `hud_heart.png` / `hud_heart_empty.png` - Streak display
- `star.png` - Streak badge decoration

**Proposed Additional Assets:**
- Guitar note sound samples (E2, A2, D3, G3, B3, e4)
- Background music loops (drum beats)
- Crowd cheer sound effects
- Guitar body graphic (behind fretboard)

---

## 19. Technical Structure

### Main Files

| File | Purpose | Lines |
|------|---------|-------|
| `AirGuitarHero.tsx` | Main game component | 705 |
| `airGuitarHeroLogic.ts` | Game logic, scoring, note generation | 84 |
| `wordWorkshop.ts` | Game registry entry | ~20 (of 898) |

### Key Components

```typescript
// AirGuitarHero.tsx structure
AirGuitarHero (exported)          // GameShell wrapper
└── AirGuitarHeroGame             // GamePage wrapper
    └── AirGuitarHeroInner        // Main component logic
        ├── AssetPreloader        // Loading state
        ├── GameContainer         // Standard game wrapper
        ├── KenneyHandCursor      // Hand tracking cursor
        └── GameBackground        // Mushroom background
```

### State Management

```typescript
// Game state
const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
const [noteSequence, setNoteSequence] = useState<GuitarNote[]>([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [score, setScore] = useState(0);

// CV state
const [cursorPx, setCursorPx] = useState<Point | null>(null);
const [handDetected, setHandDetected] = useState(false);
const [strumZoneActive, setStrumZoneActive] = useState(false);

// Streak (via hook)
const { streak, maxStreak, showMilestone, scorePopup } = useStreakTracking();
```

### Hand Tracking Integration

```typescript
useGameHandTracking({
  gameName: 'Air Guitar Hero',
  webcamRef,
  isRunning: gameState === 'playing',
  onFrame: handleFrame,
  smoothing: { minCutoff: 1.0, beta: 0.3 },
});
```

### Strum Detection Logic

```typescript
const handleFrame = useCallback((frame: TrackedHandFrame) => {
  if (frame.indexTip) {
    const currentY = frame.indexTip.y;
    const inStrumZone = currentY > STRUM_ZONE_Y;
    
    if (lastYRef.current !== null) {
      const deltaY = currentY - lastYRef.current;
      if (deltaY > STRUM_THRESHOLD && 
          inStrumZone && 
          now - lastStrumTimeRef.current > STRUM_COOLDOWN_MS) {
        performStrum();
        lastStrumTimeRef.current = now;
      }
    }
    lastYRef.current = currentY;
  }
}, [performStrum]);
```

### Dependencies

- `react-webcam` - Camera access
- `useGameHandTracking` - CV hand tracking hook
- `useStreakTracking` - Streak milestone logic
- `useAudio` - Audio playback
- `useGameSessionProgress` - Session tracking
- Kenney platformer assets - UI graphics

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| **Audio samples** | Only TTS, no actual guitar sounds | High |
| **Rhythm mechanics** | No timing, beat, or tempo | High |
| **Note highway** | Single note display vs scrolling | High |
| **Fail state** | No consequence for mistakes | High |
| **Time limit enforcement** | Config exists but not enforced | Medium |
| **Fret hand simulation** | Only strumming tracked | High |
| **Song composition** | Random notes, no melodies | High |
| **Multiplayer** | No shared jam session | Medium |
| **Progress persistence** | Session saved, but no song unlocks | Medium |
| **Parental controls** | No difficulty override for parents | Low |

### Open Questions

1. **Should the game become a true rhythm game?** (Major design decision)
2. **Are there plans for actual guitar audio samples?**
3. **Should fret position detection be added?**
4. **Is the "Guitar Hero" name appropriate for current implementation?**
5. **What is the target skill ceiling?** (Casual vs. competitive play)

---

## 21. Implementation Notes

### Strengths to Preserve

1. **Strum detection accuracy** - Y-velocity method works reliably
2. **Visual polish** - Clean UI, good color coding, consistent styling
3. **Dual input** - CV + click accessibility
4. **Streak system** - Good engagement hook, milestone celebrations
5. **Component structure** - Clean separation with GameShell/GamePage
6. **Asset preloading** - Smooth loading experience
7. **Type safety** - Full TypeScript implementation

### Refactor Opportunities

1. **Extract sub-components:**
   ```
   components/
   ├── GuitarNeck.tsx
   ├── NoteDisplay.tsx
   ├── StrumButton.tsx
   └── ProgressDots.tsx
   ```

2. **Add audio system:**
   ```typescript
   // Replace TTS with samples
   const guitarSamples: Record<string, AudioBuffer> = {
     'E2': audioBufferE2,
     'A2': audioBufferA2,
     // ... etc
   };
   ```

3. **Standardize with Music Conductor:**
   - Borrow scrolling note system
   - Adapt lane-based input to string-based
   - Use similar timing window logic

4. **Add test coverage:**
   ```typescript
   // airGuitarHeroLogic.test.ts
   describe('calculateScore', () => { ... });
   describe('generateNoteSequence', () => { ... });
   describe('strumDetection', () => { ... });
   ```

### Code Quality Notes

- ✅ Good TypeScript coverage
- ✅ Consistent hook patterns
- ⚠️ Long component file (705 lines)
- ⚠️ No unit tests for logic
- ⚠️ Unused time limit configuration

---

## 22. Acceptance Criteria

### Current Implementation (MVP Complete)

- [x] Hand tracking detects strumming motion
- [x] Click/tap fallback works
- [x] Notes advance on strum
- [x] Score calculates correctly
- [x] Streak tracking works
- [x] Level selection functions
- [x] Completion screen displays
- [x] Session progress saves
- [x] Assets preload correctly

### For Rhythm Game Overhaul (Proposed)

- [ ] Scrolling note highway implemented
- [ ] Timing windows (Perfect/Good/Miss) added
- [ ] Background music with beat synchronization
- [ ] Actual guitar audio samples per note
- [ ] Fail state with health bar or miss limit
- [ ] 3+ predefined songs with melodies
- [ ] Song unlock progression
- [ ] Practice mode (current self-paced behavior)
- [ ] Performance mode (rhythm challenge)

### For Current Design (If Keeping)

- [ ] Add guitar audio samples (Web Audio API)
- [ ] Add simple background rhythm/beep
- [ ] Create intentional note patterns (not random)
- [ ] Fix time limit enforcement or remove
- [ ] Consider renaming to reduce "Guitar Hero" expectation mismatch

---

## 23. Test Plan

### Manual Checks

**Basic Functionality:**
- [ ] Hand tracking initializes and shows cursor
- [ ] Strum gesture triggers note advance
- [ ] Click on STRUM button works as fallback
- [ ] Level selection switches difficulty
- [ ] Score increases correctly per strum
- [ ] Streak increments on consecutive strums
- [ ] Streak milestone shows at 10, 20, etc.
- [ ] Completion screen appears after all notes
- [ ] Play Again restarts game
- [ ] Finish button exits to games menu

**CV Specific:**
- [ ] Hand detection indicator shows when hand visible
- [ ] Strum zone indicator activates when hand in lower screen
- [ ] Strum only triggers in strum zone
- [ ] Cooldown prevents accidental double-strums
- [ ] Cursor follows hand smoothly

**Visual:**
- [ ] Correct string highlights for each note
- [ ] Note colors match string colors
- [ ] Progress dots update correctly
- [ ] Score popup appears on each strum
- [ ] Streak hearts fill appropriately

### Edge Cases

- [ ] **No camera:** Graceful fallback to click-only
- [ ] **Hand lost mid-game:** Resume when hand returns
- [ ] **Rapid strumming:** Cooldown prevents spam
- [ ] **Slow strumming:** No timeout (self-paced)
- [ ] **Level 1 → 3 switch:** Difficulty changes immediately
- [ ] **Exit mid-game:** Session saved with current progress
- [ ] **Multiple strum attempts:** Only first advances note

### Comparison Test (vs. Music Conductor)

| Feature | Music Conductor | Air Guitar Hero (Current) | Expected |
|---------|----------------|--------------------------|----------|
| Note presentation | Falling/scrolling | Static single | Should match or improve |
| Timing mechanic | Yes (hit window) | No | Gap identified |
| Audio feedback | Yes (click sounds) | TTS only | Gap identified |
| Fail state | Combo break | None | Gap identified |
| Background | Yes (beat) | No | Gap identified |

---

## Summary

**Air Guitar Hero** is a functional CV game with solid strum detection and visual polish, but it diverges significantly from the "Guitar Hero" name expectation. The current implementation is a **sequential note-matching game** rather than a **rhythm game**.

**Key Decision Required:**
- **Path A:** Invest in rhythm game overhaul (scrolling notes, timing, songs)
- **Path B:** Embrace current design, add audio samples, consider rename

**Current State:** 40% aligned with "Guitar Hero" promise, 100% functional as sequential strumming game.

**Priority Improvements:**
1. Add actual guitar audio samples
2. Implement note highway (borrow from Music Conductor)
3. Add timing-based scoring
4. Create simple song patterns

---

**Last Updated:** 2026-04-01  
**Confidence:** High - Implementation is clear, drift analysis is evidence-based  
**Next Review:** After rhythm overhaul decision or rename
