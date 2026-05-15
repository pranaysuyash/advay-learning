# Virtual Archery - Comprehensive Game Specification

**Game ID:** `virtual-archery`  
**World:** Lab of Wonders  
**Category:** Physics / Motor Skills  
**Audit Date:** March 20, 2026  
**Spec Version:** 1.0

---

## 1. Concept Summary

**One-line concept:** Players draw a virtual bow and shoot arrows at moving targets, accounting for gravity and wind, to score points in a timed session.

**Genre/Subgenre:** Physics-based Target Shooting / Arcade

**Target Audience:** Children ages 7-12

**Core Player Fantasy:** "I'm an archer mastering the wind and trajectory to hit challenging targets"

**Primary Skills Tested:**
- Spatial reasoning (trajectory prediction)
- Physics intuition (gravity, wind effects)
- Fine motor control (aiming, power control)
- Timing (moving targets)

**Session Length:** 60 seconds per round

---

## 2. Repo Status

**Implementation Status:** ✅ **Implemented**

**What Works Now:**
- Physics-based arrow flight (gravity, wind)
- Draw-and-release bow mechanic
- Moving targets (horizontal and vertical)
- Wind indicator with random variation
- Collision detection
- Score tracking
- Two target types (bullseye, balloon)
- Hand tracking + mouse fallback

**Evidence:**
- Logic: `src/frontend/src/games/virtualArcheryLogic.ts` (lines 1-230)
- Component: `src/frontend/src/pages/VirtualArchery.tsx` (lines 1-503)

**Confidence Level:** HIGH

---

## 3. Current Implementation

### Core Gameplay Loop
1. **Aim:** Position cursor to aim
2. **Draw:** Hold and drag to draw bow (power based on distance)
3. **Aim Adjust:** Move while drawing to adjust angle
4. **Release:** Let go to shoot arrow
5. **Watch:** Arrow flies with gravity and wind
6. **Hit/Miss:** Collision detection with targets
7. **Score:** Points awarded based on target value
8. **Repeat:** Continue until time expires

### Physics System
```
Gravity: 800-1200 pixels/s² (varies by file - needs consolidation)
Max Power: 1500-1800 pixels/s
Wind: -300 to +300 (random variation over time)
Arrow rotation: Follows velocity vector
```

### Target Types
| Type | Movement | Points | Behavior |
|------|----------|--------|----------|
| Bullseye | Horizontal bounce | 10-30 | Moves side to side |
| Balloon | Floats upward | 10-30 | Rises until off-screen |

### Controls
- **Hand tracking:** Pinch and drag to draw, release to shoot
- **Mouse:** Click-drag-release
- No keyboard controls

---

## 4. Intended Design

**Evidence from Name/Code:**
- "Virtual Archery" implies physics-based aiming
- Gravity/wind variables suggest simulation intent
- Moving targets add challenge and replayability

**Intended Experience:**
- Teach trajectory prediction
- Demonstrate wind effects on projectiles
- Build patience and precision
- Provide satisfying physics feedback

---

## 5. Drift Analysis

| Aspect | Intended | Current | Assessment |
|--------|----------|---------|------------|
| Physics | Realistic gravity/wind | Implemented | ✅ Aligned |
| Controls | Draw-and-release | Implemented | ✅ Aligned |
| Targets | Moving targets | Implemented | ✅ Aligned |
| Difficulty | Progressive | Static (random) | Minor gap |

**Drift Status:** MINIMAL

The implementation is faithful to the concept. The only gap is lack of progressive difficulty (targets get harder over time).

---

## 6. Recommended Canonical Version

**Current implementation IS the canonical version.**

**Minor Enhancements:**
1. Progressive difficulty (targets move faster, get smaller)
2. Multiple arrow types (explosive, guided)
3. Power-up system (time freeze, wind calm)

---

## 7. Visual Identity

- **Theme:** Archery range
- **Background:** Sky/field gradient
- **Bow:** Simple line drawing at bottom center
- **Arrow:** Line with arrowhead, rotates with trajectory
- **Targets:** Bullseye (red/white) or balloon (green)

---

## 8. Screen Map

### Gameplay
- Canvas with physics simulation
- Wind indicator (top)
- Score and timer (HUD)
- Cursor/bow at bottom

### Results
- Final score
- Accuracy percentage
- High score comparison

---

## 9. Controls

| Action | Hand | Mouse |
|--------|------|-------|
| Aim | Move hand | Move cursor |
| Draw | Pinch + drag | Click + drag down |
| Shoot | Release pinch | Release mouse |

**Power mechanic:** Pull distance = shot power (0-100%)

---

## 10. Core Mechanics

### Bow Drawing
- Drag distance calculates power (0-1)
- Drag angle determines shot angle
- Visual bowstring feedback

### Arrow Flight
- Initial velocity based on power
- Gravity constant downward acceleration
- Wind horizontal acceleration
- Rotation follows velocity vector

### Target Spawning
- Minimum 3 active targets
- Random position, size, type, movement
- Despawn when hit or off-screen

---

## 11. Rules

### Valid Shots
- Bow must be drawn (power > 0.1)
- One arrow at a time
- Arrow resets after hit or off-screen

### Scoring
- 10 points (large targets)
- 30 points (small targets)
- No penalty for misses

### Time
- 60-second rounds
- No pause functionality

---

## 12. HUD / Gameplay UI

### Score (Top-left)
- Current points
- Updates on hit

### Timer (Top-right)
- Countdown from 60
- Warning color under 10 seconds

### Wind Indicator (Top-center)
- Horizontal bar
- Arrow shows direction and strength
- Updates randomly during play

---

## 13. Feedback and Feel

### Drawing
- Bowstring pulls back visually
- Power indicator grows

### Release
- "Twang" sound effect
- Arrow launches

### Hit
- Target disappears
- Score popup
- Satisfying hit sound

### Miss
- Arrow continues off-screen
- No negative feedback

---

## 14. Points / Rewards

### Scoring
| Target Size | Points |
|-------------|--------|
| Large (radius 40) | 10 |
| Small (radius 25) | 30 |

### No Other Rewards
- Simple score-based system
- No achievements or unlocks

---

## 15. End States

### Time Expired
- Final score displayed
- Option to play again

### No Lives System
- Just time limit

---

## 16. Parallel Modes

### Static Target Mode
- Targets don't move
- Focus on trajectory learning
- Beginner-friendly

### Wind Challenge Mode
- Extreme wind variation
- Expert difficulty

### Multi-Arrow Mode
- Can shoot multiple arrows
- Faster pace

---

## 17. Improvement Opportunities

### Low-Cost
1. Progressive difficulty (faster targets over time)
2. High score persistence
3. Accuracy tracking

### Medium-Effort
1. Multiple levels/environments
2. Special targets (explosive, moving fast)
3. Upgrade system (better bow, guided arrows)

### Ambitious
1. 3D perspective mode
2. Multiplayer competitive
3. Real-world physics lessons

---

## 18. Content Model

### Targets
- Bullseye: Traditional target
- Balloon: Rising, smaller

### No Unlockables
- All content available immediately

---

## 19. Technical Structure

- `virtualArcheryLogic.ts` - Physics, game state
- `VirtualArchery.tsx` - Rendering, input handling

### Key Physics Constants
```typescript
GRAVITY = 800-1200  // Needs consolidation
MAX_POWER = 1500-1800
WIND_RANGE = ±300
```

---

## 20. Gaps and Unknowns

### Inconsistent Constants
- Gravity differs between logic (800) and component (1200)
- Max power differs (1500 vs 1800)
- **Recommendation:** Consolidate to single source of truth

### Missing Features
- Progressive difficulty
- High score save
- Tutorial

---

## 21. Implementation Notes

### Priority Fixes
1. Consolidate physics constants
2. Add progressive difficulty
3. Persist high scores

### Code Consolidation Needed
```typescript
// Move to shared constants file
export const PHYSICS = {
  gravity: 1000,
  maxPower: 1600,
  windRange: 300,
};
```

---

## 22. Acceptance Criteria

- [ ] Arrow physics feel natural
- [ ] Wind affects trajectory noticeably
- [ ] Both target types work
- [ ] Score tracks correctly
- [ ] 60-second timer works
- [ ] Hand tracking functional

---

## 23. Test Plan

### Manual Tests
| Test | Steps | Expected |
|------|-------|----------|
| Shoot arrow | Draw and release | Arrow flies with gravity |
| Hit target | Aim at target | Score increases |
| Wind effect | Shoot with strong wind | Arrow curves |
| Power variation | Weak vs strong draw | Different distances |

### Edge Cases
- Very weak shots (drop immediately)
- Off-screen shots (reset)
- Rapid shooting (one arrow limit)

---

*Spec created: March 20, 2026*  
**Drift Assessment: MINIMAL - Implementation is faithful to intent, minor constant consolidation needed**
