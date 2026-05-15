# Shape Pop

**Game ID:** shape-pop  
**World:** Shape Garden  
**Manifest:** `src/frontend/src/data/gameRegistries/shapeGarden.ts`  
**Code:** `src/frontend/src/pages/ShapePop.tsx`  

---

## 1. Concept Summary

- **One-line concept:** Pop collectible gems, coins, and stars by pinching when your finger is inside the target ring
- **Genre:** Action / Target Practice / Collection
- **Target audience:** Ages 3-7, early learners developing hand-eye coordination
- **Core player fantasy:** "I'm a treasure hunter collecting magical items!" - satisfying collection with visual and audio rewards
- **Primary skill tested:** Hand-eye coordination, fine motor control (pinch precision), visual tracking
- **Session length:** 2-5 minutes (infinite play with score milestones)
- **Platform context:** Hand-tracking CV game, "active" vibe classification

---

## 2. Repo Status

- **Implementation status:** ✅ Production Ready
- **What works now:**
  - Hand tracking-based cursor control
  - Pinch-to-pop mechanics
  - Streak/combo scoring system
  - Particle effects and visual feedback
  - Tutorial system with 4 steps
  - Three difficulty levels (easy/medium/hard)
  - TTS voice instructions
  - Easter egg (speed challenge)
  - Progress saving via `useGameCompletion`
- **What is partial/missing:**
  - No actual "shape" learning component (despite game name)
  - No target identification challenge (pop any target vs specific shapes)
  - No time limit or lives system (infinite play)
  - Limited educational content
- **Evidence:**
  - Main file: `src/frontend/src/pages/ShapePop.tsx` (694 lines)
  - Registry: `src/frontend/src/data/gameRegistries/shapeGarden.ts`
  - Similar games: `src/frontend/src/pages/BubblePop.tsx` (voice-based popping)
- **Confidence level:** High - Well-structured implementation, follows platform patterns

---

## 3. Current Implementation

### Flow
1. **Asset Preloader:** Kenney platformer assets (gems, coins, stars, hearts) load first
2. **Auto-start:** Game automatically starts at medium difficulty (no pre-play menu barrier)
3. **Tutorial (first-time):** 4-step overlay teaches cursor movement, aiming, pinching, and streak building
4. **Gameplay Loop:**
   - Single collectible target appears at random position
   - Player moves finger cursor inside purple ring around target
   - Pinch to "pop" the collectible
   - Score updates with combo bonuses
   - New target spawns immediately
5. **Score Milestones:** Celebration overlay every 120 points
6. **Menu Access:** In-game controls allow restart or home navigation

### Controls
- **Hand tracking:** Index finger controls cursor position
- **Pinch gesture:** Thumb + index finger pinch triggers "pop" action
- **CV only:** No mouse/keyboard fallback implemented
- **Auto-detection:** Hand tracking starts automatically when game begins

### Mechanics
- Single target spawns at random screen position
- Target has a purple ring hit zone (size varies by difficulty)
- Pinch inside ring = successful pop (points + streak)
- Pinch outside ring = miss (streak reset, visual feedback)
- Three collectible types with different point values:
  - Coin: 10 points (most common)
  - Gem: 15 points (rare)
  - Star: 20 points (rarest)

### Scoring
- **Base points:** 10-20 depending on collectible type
- **Combo bonus:** +2 per streak level (max +10)
- **Streak milestone:** +25 bonus at 5x streak
- **Score milestones:** Celebration every 120 points
- **Easter egg:** "Diamond in the Rough" - pop 20 shapes in under 30 seconds

### Visuals/UI
- Hills background with gradient overlay
- Bouncing collectible inside purple ring
- Blue finger cursor with pinch detection
- Particle explosion on successful pop (color-coded by collectible)
- Floating text showing points earned
- Screen shake on miss
- Streak counter with visual feedback

### Gaps/Issues
- Game name "Shape Pop" is misleading - no actual shapes taught
- Collectibles are gems/coins/stars, not geometric shapes
- No pedagogical shape recognition component
- Infinite play with no clear end condition
- Difficulty only affects target size, not complexity

---

## 4. Intended Design

Based on manifest tagline and world context:

- **Educational goal:** Hand-eye coordination, reaction time, fine motor control (NOT shape recognition as name implies)
- **Pedagogical approach:** Kinesthetic learning through physical movement
- **World alignment:** Shape Garden world - should teach shapes (drift from original intent)
- **Accessibility:** Three difficulty levels accommodate different skill levels
- **Progression:** Score-based with streak motivation

### Core Loop
1. See target appear
2. Move hand to position cursor
3. Pinch at right moment
4. Get immediate visual/audio reward
5. Build streak for higher scores
6. Continue indefinitely

---

## 5. Drift Analysis

### Where Implementation Matches Intent
✅ Hand tracking pop mechanics work smoothly  
✅ Visual feedback is engaging and immediate  
✅ Streak system encourages sustained play  
✅ Tutorial onboarding is clear  
✅ Three difficulty levels provide accessibility  
✅ "Active" vibe classification is accurate  

### Where Implementation Exceeds Intent
🌟 Particle effects and floating text add polish  
🌟 Easter egg provides replay incentive  
🌟 Screen shake on miss adds tactile feel  
🌟 TTS integration aids accessibility  
🌟 Auto-start removes friction  

### Where Implementation Falls Short
⚠️ **CRITICAL:** Game named "Shape Pop" but teaches NO shapes  
⚠️ Collectibles are gems/coins/stars, not geometric shapes  
⚠️ No "find the circle" or "pop only squares" challenge  
⚠️ Manifest tagline mentions "Pip's request" but no character/guide appears  
⚠️ No educational content despite Shape Garden world placement  
⚠️ Infinite play with no learning progression  

### Comparison: Shape Pop vs Bubble Pop

| Feature | Shape Pop | Bubble Pop |
|---------|-----------|------------|
| Control | Hand pinch | Voice blow |
| Targets | Single collectible | Multiple bubbles |
| Gameplay | Precise targeting | Enthusiastic blowing |
| Scoring | Combo streaks | Volume-based multi-pop |
| Vibe | Active precision | Active chaos |
| CV Mode | Hand tracking | Voice input |
| Educational | None (despite name) | None (appropriately) |

### Overall Assessment
**Alignment: 60%** - The game works well mechanically but completely misses the "Shape" educational component implied by its name and world placement.

---

## 6. Recommended Canonical Version

### Current State (Mixed)
The game is mechanically sound but pedagogically hollow for its name and placement.

### Recommended Path: Two Versions

#### Version A: Keep as "Treasure Pop" (Rename)
**If shape teaching is not the goal:**
- Rename to "Treasure Pop" or "Gem Rush"
- Move to Adventure world instead of Shape Garden
- Keep current mechanics (they work well)
- Add more collectible types and rarities

#### Version B: True "Shape Pop" (Educational Redesign)
**If shape teaching IS the goal:**
- Replace gems/coins/stars with geometric shapes (circle, square, triangle, star, heart)
- Add voice instruction: "Pop the circle!" / "Find the square!"
- Show 2-3 shapes simultaneously
- Player must identify and pop the CORRECT shape
- Teach shape names through TTS feedback
- Progressive difficulty: more shapes, similar shapes, faster timing

### Keep (Current Strengths)
- Pinch detection and hand tracking
- Streak/combo system
- Particle effects and visual feedback
- Tutorial flow
- Difficulty scaling
- TTS integration

### Enhance (For Educational Version)
1. **Shape assets:** Replace collectibles with 2D geometric shapes
2. **Target identification:** Voice prompts asking for specific shapes
3. **Multiple targets:** 2-4 shapes on screen simultaneously
4. **Shape name teaching:** TTS announces shape names on pop
5. **Progressive difficulty:**
   - Easy: 2 shapes, clear differences (circle vs square)
   - Medium: 3 shapes, similar sizes
   - Hard: 4 shapes, rotation, size variations
6. **Learning validation:** Track which shapes child recognizes

### Remove
- Gem/coin/star collectibles (if going educational route)
- Infinite play without learning objectives

---

## 7. Visual Identity

- **Overall look:** Bright, playful, garden-like
- **Camera view:** Side panel (standard for CV games)
- **Art style:** Kenney platformer assets, rounded friendly shapes
- **Mood:** Energetic, rewarding, fast-paced
- **Colors:** 
  - Purple ring highlight (#D946EF)
  - Blue cursor (#3B82F6)
  - Gold/green particle effects
  - Hills background (warm earth tones)
- **Environment:** Abstract garden setting
- **UI style:** Large friendly text, Kenney icons, bounce animations

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Asset Loading** | Preload | Kenney asset spinner |
| **Auto-Start** | Begin game | Brief transition |
| **Tutorial (first-time)** | Onboarding | 4-step overlay with highlights |
| **Gameplay** | Core experience | Target ring, cursor, feedback bar |
| **Score Milestone** | Celebration | Confetti overlay, praise message |
| **In-Game Menu** | Pause/controls | Restart, Home buttons |
| **Completion** | Session end | Final score, return to games |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position | Blue cursor follows finger |
| Position for pop | Move inside purple ring | Ring pulses subtly |
| Pop target | Pinch fingers | Particles explode, points float up |
| Miss | Pinch outside ring | Screen shake, red particles, streak reset |
| Restart | Menu button click | Game resets, score cleared |
| Go home | Home button click | Exit to games list |

---

## 10. Core Mechanics

### Target Spawning
```typescript
// Random position with margin from edges
setTargetCenter(pickRandomPoint(randomFloat01(), randomFloat01(), 0.18));
// Random collectible type
const randomIndex = Math.floor(randomFloat01() * KENNEY_TARGETS.length);
```

### Hit Detection
- Uses `isPointInCircle()` with difficulty-based radius
- Easy: 0.20 radius (large target area)
- Medium: 0.16 radius (standard)
- Hard: 0.12 radius (precision required)

### Scoring Calculation
```typescript
const comboBonus = Math.min(currentStreak * 2, 10); // +2 per streak
const streakBonus = currentStreak >= 5 ? 25 : 0;    // Milestone bonus
return basePoints + comboBonus + streakBonus;
```

### Particle System
- 12 particles on successful pop (color-coded: gem=blue, star=orange, coin=green)
- 6 particles on miss (red)
- Gravity and fade animation
- Floating text rises upward with scale animation

---

## 11. Rules

- **Start:** Auto-starts at medium difficulty after assets load
- **Allowed:** Pop targets by pinching inside the ring
- **Restricted:** Cannot pop without hand tracking active
- **Scoring:** Based on collectible type + streak bonus
- **Streak:** Consecutive successful pops increase multiplier
- **Miss penalty:** Streak resets to 0
- **Game end:** Player chooses to exit (no forced end condition)

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Score (top) | Track progress | Real-time on each pop |
| Level (top) | Show progression | Every 120 points |
| Feedback bar (top-center) | Instruction/encouragement | On hit/miss/milestone |
| Target ring | Show pop zone | Static per target |
| Collectible | Target to pop | Bouncing animation |
| Cursor | Hand position indicator | Follows index finger |
| Streak indicator | Combo visualization | Via feedback text |
| Particle effects | Reward feedback | Burst on pop |
| Floating text | Points earned | Rise and fade animation |

---

## 13. Feedback and Feel

### Success (Pop)
- Satisfying pop sound (`playPop()`)
- Color-coded particle burst (12 particles)
- Floating "+X points" text (green)
- Haptic feedback (success vibration)
- TTS praise ("Great hit!", streak announcements)
- New target spawns immediately

### Streak Milestone (5x+)
- Special "🔥 STREAK!" floating text (orange)
- Enhanced TTS ("5 in a row! Incredible!")
- Larger particle burst

### Miss
- Error sound (`playError()`)
- Red particle burst (6 particles)
- Screen shake effect
- "Miss!" or "💔 Streak Lost!" floating text
- Haptic error feedback
- Helpful instruction text

### Score Milestone (every 120 pts)
- Full-screen celebration overlay
- Fanfare sound
- TTS praise ("Amazing! You are doing great!")
- Confetti animation
- 3-second display before auto-dismiss

---

## 14. Points / Rewards / Progression

### Points System
| Action | Points |
|--------|--------|
| Pop Coin | 10 + combo + streak bonus |
| Pop Gem | 15 + combo + streak bonus |
| Pop Star | 20 + combo + streak bonus |
| 5x Streak | +25 milestone bonus |

### Combo Math
- Each consecutive hit: +2 points (max +10)
- Streak maintained as long as no misses

### Drops (from manifest)
- shape-circle: 50% chance
- shape-triangle: 50% chance
- shape-square: 50% chance
- shape-star: 15% chance
- shape-heart: 10% chance
- shape-diamond: 3% chance (min score 90)

### Easter Egg
- **"Diamond in the Rough"**: Pop 20 shapes in under 30 seconds
- Reward: shape-diamond drop
- Trigger tracked via `popWindowRef` timestamp array

---

## 15. End States

### Current Design: No Forced End
The game continues indefinitely until player chooses to exit.

### Score Milestone Celebration
- Triggered every 120 points
- Temporary overlay (3 seconds)
- Game continues automatically

### Player-Initiated End
- Click "Home" button → return to games list
- Click "Restart" → score reset, game continues

### Recommended Additions
- Time limit mode (60 seconds, max score)
- Life system (3 misses = game over)
- Target quota mode (pop 20 shapes to complete)

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Treasure Collection)
Single target, any collectible, infinite play

### Mode B: True Shape Pop (Educational)
- Multiple shapes appear
- Voice prompts: "Pop the circle!"
- Must identify correct shape
- Shape names taught via TTS
- Score based on speed + accuracy

### Mode C: Timed Challenge
- 60-second countdown
- Pop as many as possible
- High score tracking
- Perfect for competitive play

### Mode D: Precision Mode
- Smaller targets
- Shorter pinch window
- Higher points for center hits
- For older children (6-8)

### Mode E: Memory Shape Pop
- Flash a shape pattern
- Player must pop in order
- Combines with Shape Sequence game

---

## 17. Improvement Opportunities

### Low Cost
- Rename to "Treasure Pop" to match actual gameplay
- Add more collectible types (different rarities)
- Vary target spawn patterns (not fully random)
- Add simple sound effects for each collectible type

### Medium Effort
- Implement true shape-teaching mode (Option B above)
- Add character guide ("Pip" from manifest tagline)
- Time limit mode option
- Difficulty progression within session
- Shape-specific drops (pop circles → earn circle shapes)

### Ambitious
- Full educational redesign with shape curriculum
- Multiple simultaneous targets
- "Find all circles" batch challenges
- Integration with Shape Safari for world cohesion
- Parent dashboard showing shape recognition progress

---

## 18. Content Model

### Collectibles (Current)
```typescript
const KENNEY_TARGETS = [
  { id: 'gem', name: 'Gem', src: '/assets/kenney/platformer/collectibles/gem_blue.png', points: 15 },
  { id: 'coin', name: 'Coin', src: '/assets/kenney/platformer/collectibles/coin_gold.png', points: 10 },
  { id: 'star', name: 'Star', src: '/assets/kenney/platformer/collectibles/star.png', points: 20 },
];
```

### Shapes (Proposed for Educational Version)
- Circle (red)
- Square (blue)
- Triangle (yellow)
- Star (gold)
- Heart (pink)
- Diamond (purple)
- Rectangle (green)
- Oval (orange)

### Spawn Patterns
- Currently: Pure random with 18% margin
- Proposed: Grid-based, spiral, or wave patterns

### Difficulty Scaling
| Level | Target Size | Spawn Speed | Challenge |
|-------|-------------|-------------|-----------|
| Easy | 180px radius | Relaxed | Large hit zone |
| Medium | 144px radius | Normal | Standard |
| Hard | 120px radius | Quick | Precision required |

---

## 19. Technical Structure

### Main Files
- `src/frontend/src/pages/ShapePop.tsx` - Main component (694 lines)
- `src/frontend/src/data/gameRegistries/shapeGarden.ts` - Game manifest
- `src/frontend/src/games/targetPracticeLogic.ts` - Hit detection utilities

### Key Components Used
- `GameShell` - Error boundary and wellness wrapper
- `GameContainer` - Standard game layout
- `AssetPreloader` - Kenney asset loading
- `GameCursor` - Hand tracking cursor display
- `CelebrationOverlay` - Score milestone feedback
- `VoiceInstructions` - TTS instruction system

### Custom Hooks
- `useGameHandTracking` - Hand tracking with pinch detection
- `useGameCompletion` - Progress saving
- `useAudio` - Sound effects
- `useTTS` - Text-to-speech

### State Management
- React useState for game state
- useRef for mutable values (scoreRef, streakRef, particleIdRef)
- localStorage for tutorial completion flag

### CV Integration
- Hand tracking at 30 FPS
- Index finger tip for cursor position
- Pinch transition 'start' for pop trigger
- No-hand detection pauses cursor

### Visual Effects System
- Particle array with life/decay
- Floating text with rise animation
- Screen shake via transform offset
- CSS transitions for smooth feedback

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Shape teaching | Name implies shapes, but none taught | High |
| "Pip" character | Mentioned in manifest tagline, not in game | High |
| World alignment | Shape Garden world expects shape content | Medium |
| End condition | Infinite play may cause fatigue | Medium |
| Progress tracking | Score saved, but skill progression unclear | Medium |
| Drop connection | Shape drops don't match collectible types | High |

---

## 21. Implementation Notes

### Strengths to Preserve
- Clean component structure with GameShell wrapper
- Excellent visual feedback system (particles, floating text)
- Smooth hand tracking integration
- Tutorial flow with localStorage persistence
- Auto-start for reduced friction
- Comprehensive TTS integration

### Technical Debt
- Game name/content mismatch needs resolution
- `targetPracticeLogic.ts` import suggests generic reuse
- Some commented code from development (e.g., UX-001/UX-005)

### Performance Considerations
- Particle system filters dead particles every 16ms
- Hand tracking at 30 FPS (appropriate for target practice)
- Asset preloader ensures smooth start

### Accessibility
- TTS enabled by default
- Three difficulty levels
- Visual + haptic + audio feedback
- No text reading required

---

## 22. Acceptance Criteria

### Current Implementation
- [x] Hand tracking controls cursor smoothly
- [x] Pinch detection triggers pop reliably
- [x] Three collectible types with different points
- [x] Streak system calculates bonuses correctly
- [x] Particle effects render smoothly
- [x] Tutorial displays for first-time users
- [x] TTS provides voice instructions
- [x] Score milestones trigger celebrations
- [x] Easter egg triggers correctly (20 pops in 30s)
- [x] Progress saves via useGameCompletion

### Recommended for Educational Version
- [ ] Geometric shapes replace collectibles
- [ ] Voice prompts ask for specific shapes
- [ ] Multiple shapes appear simultaneously
- [ ] Shape names taught through TTS
- [ ] Progress tracking for shape recognition
- [ ] Difficulty progression within sessions

---

## 23. Test Plan

### Manual Checks
- [ ] Move hand, verify cursor follows finger
- [ ] Pinch inside ring, verify pop effect and sound
- [ ] Pinch outside ring, verify miss feedback and screen shake
- [ ] Pop 5 consecutive targets, verify streak bonus
- [ ] Pop 20 targets quickly, verify easter egg triggers
- [ ] Complete tutorial, verify localStorage flag set
- [ ] Verify TTS announcements for hits and misses

### State Transitions
- [ ] Loading → Auto-start → Gameplay
- [ ] Gameplay → Score Milestone → Gameplay
- [ ] Gameplay → Menu → Home/Restart

### Difficulty Levels
- [ ] Easy: Large target, easier to hit
- [ ] Medium: Standard target size
- [ ] Hard: Small target, precision required

### Edge Cases
- [ ] No hand detected (cursor disappears)
- [ ] Rapid pinching (debounce handling)
- [ ] Window resize (target position)
- [ ] Asset loading failure
- [ ] TTS disabled (visual-only feedback)

### Performance
- [ ] Particles clean up properly (no memory leak)
- [ ] Hand tracking stays at ~30 FPS
- [ ] No frame drops during particle bursts

---

**Last Updated:** 2026-04-01  
**Confidence:** High (mechanics), Medium (educational alignment)  
**Recommendation:** Either rename to match treasure gameplay OR redesign to teach shapes
