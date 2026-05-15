# ISS Docking - Comprehensive Game Specification

**Game ID:** `iss-docking`  
**World:** Lab of Wonders  
**Category:** Space / Physics / Precision  
**Audit Date:** March 20, 2026  
**Spec Version:** 1.0

---

## 1. Concept Summary

**One-line concept:** Players pilot a spacecraft to dock with the International Space Station, managing fuel and velocity in a simplified orbital mechanics simulation.

**Genre/Subgenre:** Space Simulation / Precision Control

**Target Audience:** Children ages 8-12

**Core Player Fantasy:** "I'm an astronaut carefully maneuvering to dock with the ISS"

**Primary Skills Tested:**
- Spatial reasoning (relative motion)
- Resource management (fuel)
- Patience and precision
- Velocity control

**Session Length:** 2-5 minutes per attempt

---

## 2. Repo Status

**Implementation Status:** ✅ **Implemented**

**What Works Now:**
- 2D space navigation
- Thrust and rotation controls
- ISS orbits in circle
- Fuel management system
- Docking detection (distance + speed)
- Success/failure states
- Score based on fuel remaining + time
- Hand tracking (raise hand to thrust, left/right to rotate)

**Evidence:**
- Logic: `src/frontend/src/games/issDockingLogic.ts` (lines 1-193)
- Component: `src/frontend/src/pages/ISSDocking.tsx` (exists)

**Confidence Level:** HIGH

---

## 3. Current Implementation

### Core Gameplay Loop
1. **Start:** Ship at left, ISS orbiting on right
2. **Rotate:** Turn ship toward target
3. **Thrust:** Apply thrust to move
4. **Adjust:** Counter-thrust to slow down
5. **Approach:** Get within docking distance
6. **Match Speed:** Slow to below max docking speed
7. **Dock:** Success if conditions met
8. **Score:** Based on fuel remaining and time

### Physics (Simplified)
```
Thrust Power: 0.3 per frame
Rotation Speed: 5 degrees per input
ISS Orbit: Circular, constant speed
No Gravity: Simplified for accessibility
Friction: None (space inertia)
```

### Docking Requirements
- Distance: < 30 pixels
- Speed: < 2 pixels/frame
- Fuel: > 0

### Controls
- **Hand tracking:** Raise hand to thrust, move left/right to rotate
- **Keyboard:** Arrow keys (rotate), Space (thrust)

---

## 4. Intended Design

**Evidence from Code/Name:**
- "ISS Docking" and comments mention "orbital mechanics"
- ISS orbits in circle (simplified orbit)
- Fuel management suggests resource planning
- Docking speed limit teaches careful approach

**Intended Experience:**
- Teach space navigation concepts
- Demonstrate inertia in zero-G
- Build understanding of relative motion
- Reward patience and planning

---

## 5. Drift Analysis

| Aspect | Intended | Current | Assessment |
|--------|----------|---------|------------|
| Orbital mechanics | Realistic | Simplified (circle) | Acceptable |
| Gravity | Present | Absent | Simplified |
| Inertia | Present | Present | ✅ Accurate |
| Fuel management | Present | Present | ✅ Accurate |
| Controls | Complex | Simplified | Appropriate |

**Drift Status:** LOW

The simplification is **appropriate for target age (8-12)**. Real orbital mechanics would be too complex. The core concepts (inertia, fuel management, careful approach) are preserved.

---

## 6. Recommended Canonical Version

**Current implementation IS appropriate for target age.**

**Optional Enhancements:**
1. **Realistic Mode** (for older kids): Add gravity well around Earth
2. **Multiple Orbits:** Different orbital heights/speeds
3. **Obstacles:** Space debris to avoid
4. **Tutorials:** Teach orbital mechanics concepts

---

## 7. Visual Identity

- **Theme:** Space with Earth, stars
- **Ship:** Simple rocket/triangle
- **ISS:** Space station sprite
- **Earth:** Circle with atmosphere glow
- **Background:** Stars, deep space gradient

---

## 8. Screen Map

### Game Screen
- Earth (center or left)
- ISS (orbiting)
- Player ship
- Fuel gauge
- Distance indicator
- Speed indicator

### Success Screen
- "Docked Successfully!"
- Score breakdown
- Fuel bonus
- Time bonus

### Failure Screen
- "Out of Fuel" or "Too Fast"
- Retry button

---

## 9. Controls

| Action | Hand | Keyboard |
|--------|------|----------|
| Thrust | Raise hand (y > 0.5) | Space |
| Rotate Left | Hand left | Left Arrow |
| Rotate Right | Hand right | Right Arrow |

**Note:** Hand position controls both rotation and thrust simultaneously.

---

## 10. Core Mechanics

### Movement
- Rotation changes facing direction
- Thrust adds velocity in facing direction
- Velocity persists (inertia)
- No friction (space physics)

### ISS Orbit
- Circular path around center point
- Constant angular velocity
- Predictable movement

### Docking
- Must be close (30px)
- Must be slow (< 2px/frame)
- Must have fuel

### Fuel
- 100 units max
- -1 per thrust
- Out of fuel = failure

---

## 11. Rules

### Movement
- Can rotate freely
- Thrust limited by fuel
- Velocity accumulates

### Docking
- Distance < 30px
- Speed < 2px/frame
- Both conditions required

### Failure Conditions
- Out of fuel
- Give up (retry)

---

## 12. HUD / Gameplay UI

### Fuel Gauge
- Bar or percentage
- Warning when low

### Distance to ISS
- Numeric display
- Color coded (green when close)

### Speed
- Current velocity magnitude
- Warning when too fast for docking

### Status Messages
- "Approaching"
- "Too Fast!"
- "Align with ISS"

---

## 13. Feedback and Feel

### Thrust
- Visual flame from ship
- Fuel gauge decreases
- "Thrust" sound

### Rotation
- Ship rotates smoothly
- Visual indicator of facing

### Near Dock
- Distance indicator turns green
- Speed warning if too fast

### Success
- "Docked!" message
- Success sound
- Score calculation animation

### Failure
- "Out of Fuel" or "Crashed"
- Failure sound
- Encouraging retry message

---

## 14. Points / Rewards

### Score Calculation
```
Base: 100 points
Fuel Bonus: Fuel remaining (0-100)
Time Bonus: max(0, 100 - timeElapsed)
Total: 100 + fuel + time
```

### No Other Rewards
- Simple scoring
- No unlocks or achievements

---

## 15. End States

### Success
- Docked within parameters
- Score displayed
- Option to play again

### Failure - Out of Fuel
- Fuel reached 0
- Retry option

### Failure - Abandoned
- Player clicked retry
- No penalty

---

## 16. Parallel Modes

### Realistic Physics Mode
- Add Earth gravity well
- Orbital mechanics (not just circular)
- For older/advanced players

### Time Trial Mode
- Race against clock
- Multiple docking points

### Fuel Challenge Mode
- Very limited fuel
- Expert difficulty

### Tutorial Mode
- Guided approach
- Teaches concepts

---

## 17. Improvement Opportunities

### Low-Cost
1. Add speed warning (visual/audio when approaching too fast)
2. Tutorial overlay for first play
3. Multiple attempts tracking

### Medium-Effort
1. Progressive levels (harder orbits, obstacles)
2. Different ship types (different handling)
3. Mission mode (multiple objectives)

### Ambitious
1. 3D version with full orbital mechanics
2. Real ISS trajectory data
3. Educational mode explaining orbital physics

---

## 18. Content Model

### Levels
- Single scenario currently
- Could add multiple orbital configurations

### Assets
- Ship sprite
- ISS sprite
- Earth sprite
- Starfield background

---

## 19. Technical Structure

- `issDockingLogic.ts` - Physics, game state, docking detection
- `ISSDocking.tsx` - Rendering, input handling

### Key Constants
```typescript
GAME_CONFIG = {
  maxFuel: 100,
  thrustPower: 0.3,
  rotationSpeed: 5,
  dockingDistance: 30,
  maxDockingSpeed: 2,
}
```

---

## 20. Gaps and Unknowns

### Simplifications
- No gravity (acceptable for age group)
- Circular orbit only
- No collision detection (can't crash into Earth)

### Missing Features
- Tutorial system
- Progressive difficulty
- Multiple missions

---

## 21. Implementation Notes

### Current Architecture
Simple state machine:
```
menu → playing → (success|failure)
```

### Potential Refactors
1. Add level system with different orbital parameters
2. Add tutorial state
3. Persist high scores

---

## 22. Acceptance Criteria

- [ ] Ship responds to rotation input
- [ ] Thrust adds velocity correctly
- [ ] Inertia preserved (no friction)
- [ ] ISS orbits in circle
- [ ] Docking works when close and slow
- [ ] Out of fuel triggers failure
- [ ] Score calculates correctly

---

## 23. Test Plan

### Manual Tests
| Test | Steps | Expected |
|------|-------|----------|
| Rotate ship | Use left/right | Ship rotates |
| Apply thrust | Use thrust button | Ship accelerates |
| Inertia | Stop thrusting | Ship continues moving |
| Dock | Approach slowly | Success when close and slow |
| Run out of fuel | Thrust repeatedly | Failure at 0 fuel |

### Edge Cases
- Very fast approach (should fail docking)
- Approaching from behind ISS
- Running out of fuel just before docking

---

*Spec created: March 20, 2026*  
**Drift Assessment: LOW - Simplified appropriately for target age, core concepts preserved**
