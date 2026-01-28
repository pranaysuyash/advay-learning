# Questions & Clarifications

**Active Questions**: 0  
**Resolved Questions**: 1  
**Last Updated**: 2026-01-28

---

## Active Questions

*None currently*

---

## Resolved Questions

### Q-001: Difficulty Progression System for Kids
**Status**: RESOLVED ✅  
**Created**: 2026-01-28  
**Resolved**: 2026-01-28  
**Tags**: #game-design #difficulty #progression #ux

**Question**:
How should the difficulty progression work for kids learning letters?

Current behavior:
- Easy: 5 letters (A-E)
- Medium: 10 letters (A-J)  
- Hard: All letters (A-Z)

User feedback indicates kids should:
1. Start with Easy (5 letters)
2. Automatically advance to Medium after mastering Easy
3. Eventually unlock Hard with all letters

**Context**:
The game currently requires manual difficulty selection in Settings. Kids (or parents) must manually change from Easy → Medium → Hard. There's no automatic progression based on performance.

**Key Considerations**:
- What defines "mastering" a difficulty level?
  - Accuracy threshold (e.g., 80%+ on all letters)?
  - Number of successful tracings?
  - Streak count?
  - Time spent?

- Should progression be:
  - Automatic (unlock next level when criteria met)?
  - Parent-approved (notification to parent, they approve)?
  - Kid-initiated (button "I'm ready for more letters!")?

- What happens when difficulty increases?
  - More letters unlocked
  - Higher accuracy requirements
  - New game modes/features?

**Research Findings**:
See full research: `docs/clarity/research/2026-01-28-difficulty-progression.md`

**Summary of Research**:

| App | Approach | Parent Control |
|-----|----------|----------------|
| Khan Academy Kids | Adaptive, fluid progression | Can override |
| ABCmouse | Grade-based levels | Must manually change |
| Duolingo | Sequential unlock | Minimal |
| Endless Alphabet | Open exploration | None |

**Key Insights**:
1. **Adaptive progression** (Khan Academy style) is most common for young kids
2. **Parent override** is important - parents want control
3. **Visual progress indicators** (checkmarks, paths) help kids understand
4. **Gamification** (badges, rewards) increases engagement
5. **No single "right" way** - depends on target age and learning goals

**Recommendation** (Based on Research):

**Hybrid: Adaptive Batch Unlock with Parent Override**

1. Start with 5 letters (A-E) - "Batch 1"
2. After mastering 3 of 5 letters (70%+ accuracy), unlock next 5 (F-J) - "Batch 2"
3. Continue unlocking in batches of 5 until all 26 letters available
4. Visual "Letter Journey" map showing progress
5. Parent can manually unlock all letters in Settings (override)
6. Badges for completing each batch

**Why this approach**:
- Kid-friendly: Automatic, sense of achievement
- Parent-friendly: Control when needed
- Flexible: Adapts to child's pace
- Gamified: Clear progress, rewards
- Proven: Similar to Khan Academy Kids (highly rated)

**Implementation Complexity**: Medium
- Need to track per-letter mastery
- Need unlock state persistence
- Need visual "journey" UI

**Resolution**:
- **Status**: RESOLVED ✅
- **Decision**: Implement "Adaptive Batch Unlock with Parent Override"
- **Implementation**: TCK-20260128-021 (COMPLETE)
- **Rationale**: Kid-friendly automatic progression with parent control

**Implementation Details**:
- Letters unlock in batches of 5
- Unlock when 3/5 letters mastered at 70%+
- Visual Letter Journey shows progress
- Parent can override in Settings
- Gamification with badges and celebrations

**Related**:
- WORKLOG_TICKETS.md - TCK-20260128-021
- UX_IMPROVEMENTS.md - Gamification ideas
- docs/clarity/research/2026-01-28-difficulty-progression.md - Full research
- docs/plans/TCK-20260128-021-implementation-plan.md - Implementation plan



---

## How to Add a New Question

1. Copy the template from README.md
2. Assign next Q-number
3. Fill in details
4. Tag relevant areas
5. Mark status as OPEN

---

