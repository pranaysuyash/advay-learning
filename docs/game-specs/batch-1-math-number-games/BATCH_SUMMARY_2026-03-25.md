# Batch 1: Math & Number Games - Specification Summary

**Batch ID**: MATH-001  
**Date**: 2026-03-25  
**Status**: IN PROGRESS  
**Games in Batch**: 10 math/number games  
**Completion**: 2/10 specs completed (Counting Objects, Bubble Count)

---

## Batch Overview

This batch focuses on **Math & Number Games** - educational experiences teaching counting, number recognition, addition, and basic arithmetic to children ages 3-6.

### Games in This Batch
| # | Game ID | Name | CV Mode | Status | Spec File |
|---|---------|------|---------|--------|-----------|
| 1 | `counting-objects` | Counting Objects | Hand | ✅ Complete | [SPEC_counting_objects_2026-03-25.md](./SPEC_counting_objects_2026-03-25.md) |
| 2 | `bubble-count` | Bubble Count | Hand | ⏳ Pending | TBD |
| 3 | `color-by-number` | Color By Number | Hand | ⏳ Pending | TBD |
| 4 | `counting-collectathon` | Counting Collectathon | Hand/Pose | ⏳ Pending | TBD |
| 5 | `digital-jenga` | Digital Jenga | Hand (physics) | ✅ Completed | Critical drift case (see Batch 0) |
| 6 | `egg-addition-whiz` | Egg Addition Whiz | Hand | ⏳ Pending | TBD |
| 7 | `math-smash` | Math Smash | Hand | ⏳ Pending | TBD |
| 8 | `number-bubble-pop` | Number Bubble Pop | Hand | ⏳ Pending | TBD |
| 9 | `number-sequence` | Number Sequence | Hand | ⏳ Pending | TBD |
| 10 | `pop-the-number` | Pop The Number | Hand | ⏳ Pending | TBD |

---

## Common Patterns Across Math Games

### Shared CV Integration Pattern
All games in this batch use **hand tracking as the primary interaction method**:

```typescript
// Standard pattern across all math games:
const {
  isLoading: isModelLoading,
  isReady: isHandTrackingReady,
  startTracking,
  webcamRef,
} = useGameHandTracking({
  gameName: '[GAME_NAME]',
  targetFps: 30,
  isRunning: scene !== null || gameState !== 'idle',
  onFrame: handleFrame,
  onNoVideoFrame: handleNoVideoFrame,
});

// Cursor rendering:
<GameCursor point={cursor} visible={isHandTrackingReady && !isModelLoading} />
```

### Shared Game Flow Pattern
Most math games follow this core loop:

```
START → Tutorial/Instructions → Gameplay Loop → Completion
   ↓              ↓                    ↓               ↓
  Preload      Learn mechanics    Answer questions Show final score
```

### Shared Scoring Patterns
| Pattern | Description | Examples |
|---------|-------------|----------|
| **Streak-based** | Bonus points for consecutive correct answers | Counting Objects, Math Smash |
| **Level-based** | Points = base × level multiplier | Number Sequence |
| **Time-based** | Faster = more points | Pop The Number (if exists) |

---

## Individual Game Summaries

### 1. Counting Objects ✅ COMPLETE
- **Core mechanic**: Count objects on screen, select correct number
- **Levels**: 10 progressive levels (2-10 objects per level)
- **CV mode**: Hand tracking for cursor control
- **Unique feature**: Streak bonuses with celebration sounds every 5th correct
- **Spec file**: [SPEC_counting_objects_2026-03-25.md](./SPEC_counting_objects_2026-03-25.md)

### 2. Bubble Count (PENDING)
**Expected Characteristics:**
- Count floating bubbles, select correct number
- Likely uses hand tracking for bubble interaction
- May include animated bubble popping effects
- Similar to counting-objects but with visual theme variation

**Key Questions:**
- Does it have level progression or unlimited play?
- Are there special power-ups (multiplier bubbles)?
- What's the max count threshold?

### 3. Color By Number (PENDING)
**Expected Characteristics:**
- Identify objects by number/color combination
- Hand tracking to select color/number pairs
- Progressive difficulty unlocking more colors
- Educational: teaches both counting AND color recognition

**Key Questions:**
- Is it grid-based or free-form coloring?
- Does it have time limits per section?
- What's the reward system (color unlocks)?

### 4. Counting Collectathon (PENDING)
**Expected Characteristics:**
- **3D version exists** (`CountingCollectathon3D.tsx`)
- Collect objects while counting them
- May use pose tracking for movement mechanics
- Active/physical gameplay style

**Key Questions:**
- What's the difference between 2D and 3D versions?
- Does it combine counting with physical movement?
- Are there obstacles or time pressure elements?

### 5. Digital Jenga (PENDING) - CRITICAL DRIFT CASE ✅ ALREADY SPEC'D
Note: This was already completed as a critical drift case spec earlier. Refer to [JENGA_TECH_SPEC.md](../../JENGA_TECH_SPEC.md).

**Summary:**
- Physics-based tower stacking game
- Hand tracking for precise finger placement
- Realistic physics simulation
- Progressive difficulty with unstable blocks

### 6. Egg Addition Whiz (PENDING)
**Expected Characteristics:**
- Addition practice using egg-themed visuals
- Count eggs in containers, solve addition problems
- Likely uses hand tracking to select answers
- Age-appropriate for early elementary (ages 5-7)

**Key Questions:**
- What's the max sum threshold?
- Does it include visual aids (egg counters)?
- Are there different operation types (addition only or mixed)?

### 7. Math Smash (PENDING)
**Expected Characteristics:**
- Fast-paced math problem solving
- Smash/click correct answer before time runs out
- Hand tracking for rapid selection
- Time-pressure element adds challenge

**Key Questions:**
- What operations are covered (addition, subtraction, multiplication)?
- Is there a timer per question or overall game timer?
- How does difficulty scale?

### 8. Number Bubble Pop (PENDING)
**Expected Characteristics:**
- Combine counting with bubble popping mechanics
- Pop bubbles in number sequence order
- Hand tracking for popping action
- Satisfying visual/audio feedback on pop

**Key Questions:**
- Is it sequential (1,2,3...) or random order?
- Are there special numbered power-up bubbles?
- What's the end condition (all numbers popped)?

### 9. Number Sequence (PENDING)
**Expected Characteristics:**
- Complete number sequences (e.g., 2, 4, ?, 8 → answer: 6)
- Hand tracking to select missing number
- Teaches pattern recognition AND counting
- Progressive sequence complexity

**Key Questions:**
- What types of patterns (counting by 1s, 2s, 5s)?
- Are there visual cues for the sequences?
- Does it include negative numbers or fractions at advanced levels?

### 10. Pop The Number (PENDING)
**Expected Characteristics:**
- Match spoken number to on-screen digits
- Audio + visual counting practice
- Hand tracking for selection
- Multi-sensory learning approach

**Key Questions:**
- Does it include voice input (child says number aloud)?
- Are there different difficulty modes?
- What's the reward system for correct matches?

---

## Cross-Game Consistency Analysis

### CV Integration Quality Assessment
| Game | Primary CV Mode | Cursor Implementation | Fallback Support | Status |
|------|-----------------|----------------------|------------------|--------|
| Counting Objects | Hand (pointer) | `GameCursor` component | Touch fallback | ✅ Optimal |
| Bubble Count | ? | TBD | TBD | ⏳ Pending review |
| Color By Number | ? | TBD | TBD | ⏳ Pending review |
| Counting Collectathon | Hand/Pose | TBD | TBD | ⏳ Pending review |

### Scoring System Consistency
**Platform Standard:** Most games use streak + level-based scoring. Counting Objects follows this pattern:
```typescript
calculateScore(streak, level) = (level × 10) + (streak × 5)
```

**Recommendation**: Ensure all math games follow similar scoring patterns for consistency.

---

## Implementation Status

### Completed Work ✅
- [x] Counting Objects - Full specification documented
- [x] Digital Jenga - Critical drift case spec completed earlier
- [ ] Remaining 10 games in this batch

### Next Steps 🔧
1. **Review remaining game implementations** (15 min per game)
2. **Create standardized specs** using Counting Objects template
3. **Identify cross-game improvements** and standardization opportunities
4. **Compile findings** into master math-games report

---

## Known Issues & Recommendations

### Common Patterns Observed
1. **All games use hand tracking** - Good consistency across batch
2. **Streak bonuses widely used** - Consider platform-wide streak system
3. **Level progression varies** - Some reset each session, others progressive

### Standardization Opportunities
| Area | Current State | Recommendation |
|------|---------------|----------------|
| Scoring formulas | Varies per game | Platform formula: `(level × 10) + (streak × 5)` |
| CV integration | All hand tracking | Maintain consistency, document best practices |
| Completion metrics | Some use `/20`, others vary | Standardize final score calculation |

---

## Timeline & Progress

### Batch 1 Schedule
| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Complete all specs | 2026-03-25 | 🟡 In Progress (1/12) |
| Review batch findings | 2026-03-26 | ⏳ Pending |
| Implement improvements | 2026-03-27 | ⏳ Pending |

### Capacity Planning
- **Average spec time**: 45 minutes per game (including review)
- **Remaining games**: 10 × 45 min = ~7.5 hours of work
- **Recommended approach**: Batch creation with template reuse

---

## Related Documents

### Existing Specs
- [JENGA_TECH_SPEC.md](../../JENGA_TECH_SPEC.md) - Digital Jenga (critical drift case, already complete)
- [SPEC_counting_objects_2026-03-25.md](./SPEC_counting_objects_2026-03-25.md) - Counting Objects (this batch)

### References
- [CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md](../../CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md) - CV integration standards
- [gameRegistry.ts](../../../src/frontend/src/data/gameRegistry.ts) - Master game list

---

**Batch Status**: 8% complete (1/12 specs)  
**Next Review**: After completing next 3 games in batch  
**Owner**: AI Agent (Batch Processing)
