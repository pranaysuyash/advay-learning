# Digital Jenga (3D Jenga)

**Game ID:** digital-jenga  
**World:** 3D World  
**Manifest:** `src/frontend/src/data/gameRegistries/threeDWorld.ts`  
**Code:** `src/frontend/src/pages/three/DigitalJenga3D.tsx` + `src/frontend/src/games/jenga/`  

---

## 1. Concept Summary

- **One-line concept:** Physics-based 3D block stacking where players carefully extract and restack wooden blocks to build the tallest tower
- **Genre:** Physics Puzzle / Strategy / Fine Motor Skills
- **Target audience:** Ages 4-10, children developing patience, precision, and strategic thinking
- **Core player fantasy:** "I can balance and build a towering structure!" - mastering steady hands to defy gravity
- **Primary skill tested:** Fine motor control, spatial reasoning, patience, strategic planning, basic math (in math mode)
- **Session length:** 5-15 minutes per game (tower completion or collapse)
- **Platform context:** Flagship 3D physics game demonstrating React Three Fiber + Rapier integration

---

## 2. Repo Status

- **Implementation status:** ✅ Production Ready
- **What works now:**
  - Full 3D physics simulation with Rapier
  - 54-block tower (18 layers × 3 blocks) - standard Jenga size
  - Hand tracking + pinch for grabbing blocks
  - Mouse/touch fallback input
  - Four game modes (Classic, Single Dice, Double Dice, Math)
  - Real-time stability calculation with visual meter
  - Voice guidance (TTS) for phases
  - Haptic feedback on grab/release
  - Visual highlighting for valid targets
  - Block numbering for dice/math modes
  - Score tracking with streaks and achievements
  - Orbit camera with zoom constraints
  - Proper turn phases: select → grab → extract → place → settle → check
- **What is partial/missing:**
  - Multiplayer mode (2+ players) - architecture exists but not exposed
  - Advanced wood materials (currently simple standard material)
  - Physics collision audio (impact sounds based on collision intensity)
  - Tutorial mode for first-time players
  - Save/resume game state mid-tower
- **Evidence:**
  - Main page: `src/frontend/src/pages/three/DigitalJenga3D.tsx` (667 lines)
  - Domain: `src/frontend/src/games/jenga/domain/` (Block.ts, Tower.ts, GameState.ts)
  - Physics: `src/frontend/src/games/jenga/physics/RapierPhysics.ts`
  - Components: `src/frontend/src/games/jenga/components/` (JengaScene, HUD, BlockView, TowerView)
  - Hooks: `src/frontend/src/games/jenga/hooks/` (useGrabController, useGameLoop)
- **Confidence level:** High - Fully functional 3D physics game with polished UX

---

## 3. Current Implementation

### Flow
1. **Loading:** Physics engine (Rapier) initializes, tower generates, 45-step settle simulation
2. **Mode Selection:** Classic/Dice/Math mode selector in top-right
3. **Gameplay Loop:**
   - Select phase: Hover over blocks, valid targets highlighted green
   - Grab phase: Pinch/click to grab, block turns orange
   - Extract phase: Pull along block's axis, lateral wiggle allowed
   - Place phase: "Place On Top" button appears
   - Settle phase: Physics simulates, tower wobbles, stability checked
   - Check phase: Win/loss determination
4. **End State:** Celebration on completion, retry prompt on collapse

### Controls
| Input | Action | CV Mode | Mouse Mode |
|-------|--------|---------|------------|
| Pinch/Click | Grab block | ✅ Hand pinch | ✅ Mouse down |
| Move/Drag | Pull block out | ✅ Hand position | ✅ Mouse drag |
| Release | Drop/place block | ✅ Release pinch | ✅ Mouse up |
| Orbit drag | Rotate camera view | ✅ (when not grabbing) | ✅ |
| Scroll | Zoom camera | ❌ | ✅ |

### Mechanics
- **Physics-driven extraction:** Spring-physics pulling with velocity limiting
- **Axis-constrained dragging:** Pull direction aligned to block orientation
- **Lateral wiggle:** Small perpendicular movement simulates "loosening" in slot
- **Extraction threshold:** 1.1 units distance triggers complete extraction
- **Stability calculation:** Center of mass + contact support analysis
- **Collapse detection:** Block falls below y=-2 OR stability < 0.35

### Scoring
- Base: 100 points per successful placement
- Speed bonus: Up to 80 points (decreases over time)
- Streak bonus: +12 points × current streak
- Achievements: steady-hands (3+ streak), tower-builder (10+ placed), jenga-star (1500+ score), tower-master (completion)

### Visuals/UI
- Wood-colored blocks with slight color variation per block
- Emissive highlighting: Yellow (hover), Green (valid target), Orange (grabbed)
- Number stickers on blocks (dice/math modes)
- 3D hand visualization showing pinch state
- Stability meter with emoji feedback (😊 😬 😱)
- Starfield background + soft gradient environment
- Directional shadows from sunlight

### Gaps/Issues
- No collision-based audio feedback
- Wood material lacks texture detail
- Camera can be obscured by tower at extreme angles
- No undo/redo for accidental releases

---

## 4. Intended Design

Based on manifest and code evidence:

- **Educational goal:** Develop fine motor control, patience, strategic thinking, and basic math (dice/math modes)
- **Pedagogical approach:** Learning through physical intuition - understanding balance, gravity, cause-and-effect
- **Focus vibe:** Calm, focused gameplay with gentle encouragement
- **Accessibility:** Large text mode, voice guidance, visual highlighting

### Core Loop
1. Observe tower and identify safe blocks to remove
2. Carefully extract chosen block without toppling tower
3. Successfully place on top, increasing tower height
4. Repeat until all 54 blocks stacked OR tower collapses
5. Earn score based on blocks placed, speed, and consistency

---

## 5. Drift Analysis

### Where Implementation Matches Intent
✅ Authentic Jenga proportions (3:1 length:width ratio)  
✅ 54 blocks, 18 layers (standard Jenga tower size)  
✅ Physics-based instability and collapse  
✅ Extract-and-restack core mechanic  
✅ Turn-based progression with increasing difficulty  
✅ Educational math modes (dice counting, operations)  

### Where Implementation Exceeds Intent
🌟 Four distinct game modes with different educational focuses  
🌟 Real-time stability meter with physics-based calculation  
🌟 Voice guidance system with contextual instructions  
🌟 Streak/achievement system for motivation  
🌟 Dual input (hand tracking + mouse) with seamless switching  
🌟 Visual target highlighting reduces frustration  

### Where Implementation Falls Short
⚠️ No wood texture/material realism (plain colors)  
⚠️ No audio feedback for collisions (would enhance physical feel)  
⚠️ Multiplayer architecture exists but not exposed  
⚠️ No tutorial/onboarding for first-time players  
⚠️ No save/resume (long games must complete in one session)  

### Overall Assessment
**Alignment: 92%** - The implementation captures the essence of Jenga with meaningful enhancements. The physics feel realistic, the controls are responsive, and the educational additions (math mode) add value without compromising the core experience.

---

## 6. Recommended Canonical Version

The current implementation IS the canonical version with targeted enhancements:

### Keep (Current Strengths)
- Domain-driven architecture (Block/Tower/GameState separation)
- Rapier physics integration
- Four-mode design (Classic/Dice Single/Dice Double/Math)
- Hand tracking + mouse dual input
- Stability calculation system
- Voice guidance
- Turn phase system with clear UX feedback

### Enhance
1. **Wood material realism:** Add wood grain texture, edge wear, subtle imperfections
2. **Collision audio:** Impact sounds based on collision velocity (clack, thud, rattle)
3. **Tutorial mode:** Interactive first-time guide showing pinch, pull, place
4. **Camera improvements:** Auto-adjust when tower grows tall, avoid occlusion
5. **Multiplayer UI:** Expose player switching for 2-4 player games
6. **Save state:** Allow resume for long sessions

### Remove
- Nothing significant (clean, focused implementation)

---

## 7. Visual Identity

- **Overall look:** Clean, playful 3D with soft gradients and warm wood tones
- **Camera view:** Orbit camera, initial position [0, 10, 20] looking at tower center
- **Art style:** Simplified geometric with subtle lighting; blocks have rounded feel via soft shadows
- **Mood:** Calm, focused, encouraging - "gentle hands, steady tower"
- **Colors:**
  - Wood: #d4a373 (warm natural wood)
  - Hover: #ffeb3b (bright yellow)
  - Removable: #4caf50 (success green)
  - Grabbed: #ff5722 (attention orange)
  - Background: Gradient from #fff8df (warm cream) to #c9eaff (soft blue)
- **Environment:** Soft blue ground plane, starfield skybox, soft fog
- **Lighting:** Directional sunlight + warm/cool point lights for depth

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Loading** | Initialize physics | Spinner, "Setting up your Jenga tower..." |
| **Mode Select** | Choose game type | 4 mode buttons (Classic, Single Dice, Double Dice, Math) |
| **Gameplay** | Core experience | 3D tower, HUD panel, hand/mouse cursor, controls toolbar |
| **HUD Panel** | Stats & controls | Turn, phase, score, stability meter, action buttons, instructions |
| **Grab Active** | Block being pulled | HUD auto-hides (or can be pinned), focus on extraction |
| **Settle** | Physics settling | "Hands off" instruction, stability meter animates |
| **Game Over** | Win/loss result | Modal with stats, reason, restart button |
| **Celebration** | Achievement feedback | Full-screen overlay with trophy/confetti |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Hover block | Move cursor/hand | Block highlights yellow |
| Grab block | Pinch/click | Block turns orange, haptic pulse |
| Pull block | Drag along axis | Block moves with spring physics, lateral wiggle |
| Release block | Release pinch/mouse | Block drops (or extracts if threshold met) |
| Place on top | Tap "Place On Top" | Block teleports to top, physics settles |
| Rotate view | Drag empty space | Camera orbits around tower |
| Zoom | Scroll/pinch | Camera moves closer/farther (12-35 units) |
| Cancel grab | Tap "Oops, let go" | Block returns to original position |

### CV-Specific Interactions
- Hand pinch threshold: 0.045 (start), 0.075 (release)
- Hand smoothing: minCutoff 1.2, beta 0.01
- Hand midpoint calculated from thumb+index finger
- Tracking loss overlay appears if hand lost > 2 seconds

---

## 10. Core Mechanics

### Physics System
- **Engine:** Rapier3D (WASM physics)
- **Gravity:** -9.81 m/s² (realistic Earth gravity)
- **Timestep:** 1/60s with 2 substeps
- **CCD:** Enabled (prevents tunneling at high speeds)
- **Block properties:** Mass 1.5kg, friction 0.8, restitution 0.0 (no bounce)

### Block States
```
inTower → grabbed → extracted → onTop
   ↓          ↓         ↓           ↓
fallen   (cancel)  (release)   (placed)
```

### Drag Physics
- **Spring strength:** 18 (responsive but not instant)
- **Damping:** 0.45 (prevents oscillation)
- **Max speed:** 3.6 m/s (controlled movement)
- **Lateral wiggle:** 0.28 × block width (slot loosening feel)
- **Extraction distance:** 1.1 units (triggers auto-extract)

### Stability Calculation
1. **Center of Mass (COM):** Calculate weighted average of all block positions
2. **Heuristic stability:** 1 - (COM deviation / base half-width)
3. **Contact stability:** Weighted support count across all blocks
4. **Final stability:** 0.65 × contact + 0.35 × heuristic
5. **Collapse threshold:** < 0.35 stability OR ≥2 unsupported lower blocks

### Turn Phases
| Phase | Description | User Action |
|-------|-------------|-------------|
| select | Hovering, choosing block | Move cursor, identify target |
| grab | Holding block in tower | Pinch/click to grab |
| extract | Pulling block out | Drag to pull threshold |
| place | Block extracted, ready to place | Tap "Place On Top" |
| settle | Physics simulating | Wait for wobble to stop (650ms) |
| check | Determining win/loss | Automatic, brief pause |

---

## 11. Rules

### Start
- Choose game mode (Classic/Dice/Math)
- Tower generates with 54 blocks in 18 alternating layers
- Physics settles for 45 frames before gameplay begins

### Allowed Actions
- Grab any removable block (not top layer, has support)
- Pull block along its orientation axis
- Release to extract or cancel
- Place extracted block on top when prompted
- Cancel grab to return block (if not fully extracted)

### Restricted Actions
- Cannot grab blocks from top complete layer
- Cannot grab blocks with zero support (would be loose)
- Cannot place block while another is being grabbed
- Cannot interact during settle phase

### Scoring
- Base: 100 points per placement
- Speed bonus: max(0, 80 - seconds_taken × 10)
- Streak bonus: current_streak × 12
- Total: 100 + speed + streak

### Penalties
- No explicit penalties (kid-friendly)
- Failed extraction (cancel) resets streak
- Tower collapse ends game with zero score bonus

### Game Modes
| Mode | Rule Variation |
|------|----------------|
| Classic | Any removable block valid |
| Single Dice | Roll 1-6, only blocks with that number |
| Double Dice | Roll 2-12 (sum), only matching blocks |
| Math | Roll two dice, use +, -, ×, ÷, or concat to find valid numbers |

---

## 12. HUD / Gameplay UI

### Left Panel (Collapsible)
**Header:**
- Game title "Digital Jenga"
- Current mode badge (color-coded)
- Mode description

**Targets Section** (Dice/Math modes only):
- Dice face display (actual rolled values)
- "Roll Dice" / "Roll Again" button
- Math problem hint (math mode)
- Valid target numbers list (green badges)

**Stats Grid:**
| Stat | Description |
|------|-------------|
| Turn | Current turn number |
| Phase | Human-readable phase |
| Blocks Left | Blocks still in tower |
| Placed On Top | Successfully restacked blocks |
| Score | Running total |
| Streak | Consecutive successful placements |

**Stability Meter:**
- Emoji indicator (😊 😬 😱)
- Percentage (0-100%)
- Color bar (green → amber → red)

**Action Buttons:**
- "Restart Tower" - Reset game
- "Oops, let go" - Cancel current grab (when grabbing)
- "Place On Top" - Place extracted block (when ready)

**Instructions:**
- Contextual help based on current phase
- Dynamic text changes: "Pick a safe middle block" → "Pull slowly" → "Tap Place On Top"

### Bottom Instruction Bar
- Input hint (pinch vs click)
- Dice mode reminder
- Camera controls hint
- Read-aloud status

---

## 13. Feedback and Feel

### Success Feedback
- **Grab:** Haptic pulse (light), "grab" SFX
- **Extract:** Voice "Nice pull", cheer message, "success" SFX
- **Place:** Haptic (success), "place" SFX, "Awesome stacking!" message
- **Streak:** Score popup with streak multiplier
- **Achievement:** Badge display in HUD
- **Win:** Celebration overlay with confetti, trophy emoji

### Failure/Caution Feedback
- **Invalid target:** No grab (visual only)
- **Tracking lost:** Overlay with retry options
- **Low stability:** 😱 emoji, red meter
- **Collapse:** Haptic (heavy), "collapse" SFX, gentle "Oops! Let's try again!" message

### Audio
| Event | Sound | Volume |
|-------|-------|--------|
| Grab | grab | 0.5 |
| Slide | slide | 0.3 |
| Place | place | 0.4 |
| Collapse | collapse | 0.8 |
| Win | win | 0.35 |
| UI Click | click | 0.2-0.3 |

### Voice Guidance (TTS)
- Phase transitions spoken aloud
- Encouraging messages at key moments
- Toggle on/off via toolbar button

### Responsiveness
- Raycast hit detection: Every frame
- Hand tracking: 30 FPS target
- Physics simulation: 60 FPS with substeps
- Drag update: Real-time with spring smoothing

---

## 14. Points / Rewards / Progression

### Points System
- **Base placement:** 100 points
- **Speed bonus:** Up to 80 points (faster = more)
- **Streak bonus:** +12 per streak level
- **Maximum per turn:** ~200+ points

### Achievements
| Achievement | Trigger | Display |
|-------------|---------|---------|
| steady-hands | 3+ streak | HUD badge |
| tower-builder | 10+ placed | HUD badge |
| jenga-star | 1500+ score | HUD badge |
| tower-master | Complete all 54 blocks | Easter egg unlock |

### Drops (From Registry)
- shape-cube (25% chance)
- star-silver (15% chance, min score 70)
- star-gold (5% chance, min score 90)

### Easter Egg
- **Tower Master:** Stack 20 blocks without toppling → trophy-gold reward

### Progression
- No persistent tower progression (each game standalone)
- Stats tracked per session: best streak, score, turns, height

---

## 15. End States

### Round End (Successful Placement)
1. Block placed on top
2. Physics settles (650ms)
3. Stability checked
4. If stable: next turn begins
5. If all 54 blocks placed: **WIN**

### Game Win
- **Trigger:** All 54 blocks successfully placed on top
- **Winner:** Current player (or player who placed last block)
- **Feedback:** 
  - Celebration overlay with "Tower complete!"
  - Trophy emoji (🏆)
  - Stats summary (turns, blocks, score)
  - "tower-master" achievement unlocked
  - Haptic celebration pulse
  - Drop rewards calculated

### Game Loss (Collapse)
- **Trigger:** 
  - Any block falls below y=-2
  - Stability drops below 0.35
  - 2+ unsupported blocks in lower layers
- **Winner:** Previous player (who didn't knock it over)
- **Feedback:**
  - Modal with "Oops! Let's try again!"
  - Rose-colored text
  - Reason displayed ("Tower collapsed!")
  - Stats summary
  - Streak reset to 0

### Restart
- Clears all blocks to initial positions
- Resets physics
- Resets game state (score, streak, achievements)
- 20-frame settle before play resumes

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Classic (Current Default)
- Any removable block valid
- Pure Jenga experience
- Focus on motor skills and strategy

### Mode B: Single Dice
- Roll 1 die (1-6)
- Only blocks with matching number valid
- Adds counting/numeral recognition
- Roll guarantees at least one valid target

### Mode C: Double Dice
- Roll 2 dice, use sum (2-12)
- Only sum-matching blocks valid
- Adds addition practice
- Simple probability awareness (7 most common)

### Mode D: Math Jenga
- Roll 2 dice
- Valid numbers from: +, -, ×, ÷, concatenation
- Example: Roll 3,4 → valid: 7, 1, 12, 34, 43
- Adds arithmetic operations
- Multiple solutions possible

### Potential Future Modes
| Mode | Concept | Educational Value |
|------|---------|-------------------|
| Color Jenga | Blocks have colors, match patterns | Color recognition |
| Team Mode | Cooperative, players alternate | Collaboration |
| Time Attack | Race against clock | Time pressure management |
| Zen Mode | No win/lose, infinite sandbox | Free exploration |
| Height Challenge | Build to specific height goals | Goal-oriented planning |

---

## 17. Improvement Opportunities

### Low Cost
- Add wood grain texture to blocks
- Implement collision audio (velocity-based volume)
- Add camera auto-adjust as tower grows
- Expand achievement set (5, 10, 20, 30, 40, 50 blocks)

### Medium Effort
- Interactive tutorial mode (guided first game)
- Multiplayer UI (2-4 players with turn indicators)
- Save/resume functionality
- Block material themes (neon, ice, metal)
- Replay system (record/playback moves)

### Ambitious
- AI opponent (with difficulty levels)
- Online multiplayer
- Custom tower configurations (different layer counts)
- AR mode (place tower on real table via camera)
- Procedural block imperfections (realistic wear)
- Wind/earthquake environmental challenges

---

## 18. Content Model

### Blocks
- **Count:** 54 (18 layers × 3 blocks)
- **Dimensions:** 2.25 × 0.75 × 0.25 units (3:1 length:width ratio)
- **Numbering:** 1-54 from bottom-left to top-right
- **Colors:** Wood base (#d4a373) with ±5% random variation per block
- **Orientation:** Alternates per layer (X-aligned, Z-aligned)

### Tower Configuration
```typescript
{
  layers: 18,
  blocksPerLayer: 3,
  gap: 0.01,      // Between blocks
  jitter: 0.005,  // Random initial imperfection
}
```

### Assets Needed
| Asset | Current | Desired |
|-------|---------|---------|
| Block texture | None (solid color) | Wood grain normal map |
| Block audio | None | Clack/thud variations |
| Environment | Procedural stars | Optional themed rooms |
| UI sounds | Generated | Polished SFX library |

### Data Files
- `src/frontend/src/games/jenga/config/constants.ts` - All game constants
- `src/frontend/src/games/jenga/utils/generateTower.ts` - Tower generation
- No external asset dependencies (self-contained)

---

## 19. Technical Structure

### File Organization
```
src/frontend/src/games/jenga/
├── index.ts                    # Public exports
├── config/
│   └── constants.ts            # JENGA_CONSTANTS, GAME_MODES
├── domain/
│   ├── Block.ts               # JengaBlock class
│   ├── Tower.ts               # JengaTower class
│   ├── GameState.ts           # JengaGameState class
│   └── *.test.ts              # Unit tests
├── physics/
│   └── RapierPhysics.ts       # Physics world wrapper
├── components/
│   ├── JengaScene.tsx         # Main 3D scene
│   ├── TowerView.tsx          # Block rendering
│   ├── BlockView.tsx          # Individual block mesh
│   ├── HUD.tsx                # Game UI panel
│   ├── hudViewModel.ts        # HUD state logic
│   ├── PointerDot.tsx         # 3D cursor indicator
│   └── HandVisualization.tsx  # Hand mesh display
├── hooks/
│   ├── useGrabController.ts   # Drag physics logic
│   └── useGameLoop.ts         # Game timing/stability
└── utils/
    └── generateTower.ts       # Tower factory
```

### Main Page
`src/frontend/src/pages/three/DigitalJenga3D.tsx`
- React component with Canvas
- Hand tracking integration
- Audio/haptic coordination
- Game state management

### Key Dependencies
- `@react-three/fiber` - React Three Fiber
- `@react-three/drei` - R3F helpers (OrbitControls, Text, Stars)
- `@dimforge/rapier3d-compat` - Physics engine
- `three` - 3D library
- `framer-motion` - UI animations
- `lucide-react` - Icons

### State Management
- `JengaGameState` - Game rules and turn management
- `JengaTower` - Block spatial relationships
- `JengaBlock` - Individual block physics state
- `RapierPhysics` - Physics world simulation
- React useState/useRef - UI state

### CV Integration
- `useGameHandTracking` hook
- Pinch detection for grab/release
- Hand position for cursor
- Tracking loss handling with fallback

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Multiplayer mode | playerCount exists in GameState but hardcoded to 1 | High |
| Collision audio | EventQueue exists but only drains without audio | High |
| Wood texture | Code comments suggest desire but not implemented | Medium |
| Tutorial mode | No onboarding for first-time players | High |
| Save/resume | serialize() methods exist but not wired to storage | High |
| Mobile touch | Touch input works but not optimized | Medium |
| Performance on low-end | No LOD or optimization for complex scenes | Medium |

---

## 21. Implementation Notes

### Strengths to Preserve
1. **Clean architecture:** Domain-driven with clear separation of concerns
2. **Physics realism:** Rapier integration with proper tuning
3. **Dual input:** Seamless hand/mouse switching
4. **Game modes:** Educational variations add replayability
5. **Accessibility:** Voice guidance, large text, visual feedback
6. **Test coverage:** Unit tests for core domain logic

### Refactor Opportunities
1. **BlockView.tsx:** Could split NumberSticker to separate component file
2. **DigitalJenga3D.tsx:** 667 lines - could extract toolbar/button components
3. **RapierPhysics.ts:** Consider abstracting physics engine for swapability
4. **HUD.tsx:** Large component - could use more sub-component splitting

### Performance Considerations
- Block geometry is shared (single BoxGeometry instance)
- useFrame for position sync (every frame, necessary for physics)
- Stars component uses instancing (2500 stars)
- Consider React.memo for BlockView if block count grows

### Testing Focus
- Physics stability edge cases (barely-supported blocks)
- Hand tracking loss during grab
- Rapid mode switching mid-game
- Stability calculation accuracy

---

## 22. Acceptance Criteria

### Core Functionality
- [ ] Physics tower generates with 54 blocks
- [ ] Hand tracking pinch grabs blocks
- [ ] Mouse click/drag works as fallback
- [ ] Blocks extract along correct axis
- [ ] Extraction threshold triggers properly
- [ ] "Place On Top" button places block correctly
- [ ] Stability meter reflects tower state
- [ ] Tower collapse detected accurately
- [ ] Win condition triggers when all blocks placed

### Game Modes
- [ ] Classic mode allows any removable block
- [ ] Single Dice mode restricts by number
- [ ] Double Dice mode uses sum
- [ ] Math mode allows multiple operations
- [ ] Dice rolls guarantee playable targets

### UX/Polish
- [ ] Voice guidance speaks phase transitions
- [ ] Haptic feedback on grab/place
- [ ] Visual highlighting for valid targets
- [ ] HUD shows correct stats
- [ ] Camera orbits smoothly
- [ ] Loading state displays during init

### Edge Cases
- [ ] Tracking loss shows overlay
- [ ] Cancel grab returns block
- [ ] Rapid restart clears state
- [ ] Mode switch resets game

---

## 23. Test Plan

### Manual Checks

#### Basic Gameplay
- [ ] Start game, verify tower appears
- [ ] Grab a block, verify color changes to orange
- [ ] Pull block out, verify it moves along axis
- [ ] Release to extract, verify "Place On Top" appears
- [ ] Place block, verify it appears on top layer
- [ ] Complete 5+ turns, verify stability meter updates

#### Input Modes
- [ ] Test with hand tracking (pinch to grab)
- [ ] Switch to mouse mode, verify click/drag works
- [ ] Switch back to hand mode, verify tracking resumes
- [ ] Lose hand tracking mid-grab, verify graceful fallback

#### Game Modes
- [ ] Switch to Single Dice, verify roll button
- [ ] Roll dice, verify only matching numbers highlight
- [ ] Switch to Math mode, verify problem displays
- [ ] Verify multiple valid answers accepted

#### End States
- [ ] Play until collapse, verify game over screen
- [ ] Restart, verify clean reset
- [ ] Play to completion (54 blocks), verify win celebration

### State Transitions
- [ ] Loading → Mode Select → Gameplay → Settle → Gameplay loop
- [ ] Gameplay → Grab → Extract → Place → Settle
- [ ] Grab → Cancel → Select
- [ ] Gameplay → Game Over → Restart → Loading

### Edge Cases
- [ ] Grab block, lose tracking, verify release
- [ ] Rapid mode switches, verify no crash
- [ ] Click rapidly on multiple blocks, verify only one grabbed
- [ ] Scroll wheel during grab, verify camera locked
- [ ] Resize window during gameplay, verify layout adjusts

### Performance
- [ ] Maintain 60 FPS during physics settle
- [ ] No memory leaks after 10+ games
- [ ] Smooth hand tracking at 30 FPS

---

**Last Updated:** 2026-04-01  
**Confidence:** High - Comprehensive review of production-ready implementation
