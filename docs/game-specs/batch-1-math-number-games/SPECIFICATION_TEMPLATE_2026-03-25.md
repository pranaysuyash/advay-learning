# Game Specification Template - Batch 1 (Math & Number Games)

**Usage**: Copy this template for each new game spec, fill in section details based on code review, and save as `SPEC_<game_id>_2026-03-25.md`

---

## Quick Start Checklist

Before creating a spec:
1. ✅ Review the game's main page file (e.g., `/src/frontend/src/pages/<GameName>.tsx`)
2. ✅ Review any associated logic files (e.g., `/src/frontend/src/games/<gameName>Logic.ts`)
3. ✅ Check the game registry entry for metadata (CV mode, drops, etc.)
4. ✅ Note unique mechanics compared to other games in this batch

---

## Template Structure

### Section 1: Game Metadata (Fill from Registry)
```text
**Ticket**: SPEC-20260325-MATH-XXX  
**Date**: 2026-03-25  
**Status**: DRAFT  
**Owner**: AI Agent (Batch Processing)

---

## Executive Summary

[1-2 paragraph overview of game mechanics and educational purpose]

### Game Metadata
| Field | Value | Source |
|-------|-------|--------|
| **Game ID** | `[id from registry]` | gameRegistry.ts |
| **World** | `[worldId from registry]` | gameRegistry.ts |
| **Vibe** | `[vibe from registry]` | gameRegistry.ts |
| **Age Range** | `[ageRange from registry]` | gameRegistry.ts |
| **CV Mode** | `[cv array from registry]` | gameRegistry.ts |
| **Difficulty** | [Describe progression] | Code review |

---

## Section 1: Game Mechanics & Core Loop

### Primary Interaction Method
- **Hand Tracking**: [Describe how finger is used]
- **Selection**: [How child selects answers/interacts]
- **Feedback**: [Visual/audio feedback mechanisms]

### Game Flow
```
[Diagram of game flow: START → Tutorial → Gameplay → Completion]
```

### Core Loop (Per Round)
1. **[Step 1 description]**
2. **[Step 2 description]**
3. **[Step 3 description]**
...

---

## Section 2: CV Integration Analysis

### Current Implementation
```typescript
// Paste relevant hand tracking code snippet here
const {
  isLoading,
  isReady,
  startTracking,
  webcamRef,
} = useGameHandTracking({...});
```

### CV Mode Classification: **[POINTER_PRIMARY / HYBRID / FALLBACK]** ✅/⚠️
- [ ] Hand tracking primary interaction method
- [ ] Cursor follows finger tip position
- [ ] No fallback required for core gameplay
- [ ] Camera preview visible and functional

### CV Integration Quality Assessment
| Criterion | Status | Notes |
|-----------|--------|-------|
| Primary CV mode | ✅/⚠️ Implemented | [Details] |
| Cursor visibility | ✅/⚠️ Working | [Details] |
| Fallback support | ✅/⚠️ Partial | [Details] |
| Camera gating | ✅/⚠️ Present | [Details] |
| Performance | ✅/⚠️ Good | [FPS target, optimization notes] |

**Recommendation**: [CV integration is complete/optimal/partially implemented/needing work]

---

## Section 3: Game Logic Architecture

### Level System
```typescript
// Paste level config structure from logic file
export const LEVELS: LevelConfig[] = [...];
```

### Scoring Formula
```typescript
// Paste scoring function if exists
function calculateScore(...): number {
  ...
}
```

**Example calculations**:
- [Show example score at level 1]
- [Show example score at max level]

---

## Section 4: UI/UX Components

### Primary Components
| Component | Purpose | Props |
|-----------|---------|-------|
| `[Component 1]` | [Description] | [Props list] |
| `[Component 2]` | [Description] | [Props list] |

### Visual Design System
```typescript
const COLORS = {
  primary: '[hex code]',
  secondary: '[hex code]',
  success: '[hex code]',
  error: '[hex code]',
};
```

---

## Section 5: Audio Design

### Sound Effects Table
| Trigger | Sound | Purpose |
|---------|-------|---------|
| `[Event]` | `[function call]` | [Description] |

### Implementation Pattern
```typescript
const { playClick, playSuccess, playError } = useAudio();
// Usage in game loop:
if (isCorrect) {
  playSuccess();
} else {
  playError();
}
```

---

## Section 6: Haptic Feedback

### Haptic Patterns
| Event | Pattern | Timing |
|-------|---------|--------|
| `[Event]` | `triggerHaptic('[type]')` | [When triggered] |

---

## Section 7: Progress Tracking & Analytics

### Session Progress Hook
```typescript
useGameSessionProgress({
  gameName: '[Game Name]',
  score,
  level: currentLevel,
  isPlaying: gameState === 'playing',
});
```

### Tracked Metrics
| Metric | Type | Purpose |
|--------|------|---------|
| `[metric]` | [type] | [Description] |

---

## Section 8: Asset Management

### Critical Assets Preloaded
```typescript
const CRITICAL_ASSETS = [...]; // If exists, otherwise note "No assets required"
```

### Loading Strategy
- **Critical**: [What loads immediately]
- **Dynamic**: [What loads on-demand]
- **Fallback**: [Graceful degradation behavior]

---

## Section 9: Difficulty Progression

### Level Design Matrix
| Level | [Parameter 1] | [Parameter 2] | Complexity | Time Challenge |
|-------|---------------|---------------|------------|----------------|
| 1 | [value] | [value] | Easy | [description] |
| ... | ... | ... | ... | ... |

---

## Section 10: Error Handling & Edge Cases

### Camera/Tracking Failures
```typescript
// Fallback handling code
const handleNoVideoFrame = useCallback(() => {
  setCursor(null);
}, []);
```

### Edge Cases
| Scenario | Handling | Notes |
|----------|----------|-------|
| [Scenario] | [Handling] | [Description] |

---

## Section 11: Accessibility Considerations

### Current Features
- ✅/⚠️ **Visual feedback**: [Details]
- ✅/⚠️ **Audio cues**: [Details]
- ⚠️ **Color blindness support**: [Status]

### Recommended Improvements
1. [Recommendation 1]
2. [Recommendation 2]

---

## Section 12: Performance Benchmarks

| Metric | Target | Current Status | Notes |
|--------|--------|----------------|-------|
| Hand tracking FPS | [target] | ✅/⚠️ [status] | [details] |
| Asset load time | [target] | ✅/⚠️ [status] | [details] |

---

## Section 13: Testing Requirements

### Unit Tests Needed
```typescript
// Example test structure for this game's unique logic
describe('[unique function]', () => {
  it('should [behavior]');
});
```

---

## Section 14: Cross-Game Consistency Audit

### Alignment with Platform Standards
| Standard | Status | Notes |
|----------|--------|-------|
| CV primary mode | ✅/⚠️ Compliant | [details] |
| GameShell wrapper | ✅/⚠️ Present | [details] |
| AssetPreloader pattern | ✅/⚠️ Used or N/A | [details] |

### Differences from Other Games
- **Unique**: [What makes this game special]
- **Standard**: [Follows platform conventions]

---

## Section 15: Known Issues & Tech Debt

### Current Limitations
1. [Limitation 1]
2. [Limitation 2]

### Technical Debt Items
- [ ] [Item to address]
- [ ] [Item to address]

---

## Section 16: Future Enhancements

### Phase 2 Features (Post-Launch)
- [Feature idea 1]
- [Feature idea 2]

### Phase 3 Features (Long-term)
- [Long-term vision item 1]
- [Long-term vision item 2]

---

## Section 17: Compliance & Safety

### COPPA/Privacy
- ✅ No personal data collected
- ✅ Camera access requires parent permission
- ✅ Analytics only track gameplay metrics

### Age Appropriateness
- **Content**: [Description of visual/content themes]
- **Difficulty**: [Progression appropriateness for target age]

---

## Section 18: Implementation Checklist

### Completed ✅
- [x] Hand tracking integration via `useGameHandTracking` hook
- [x] Cursor rendering with `GameCursor` component
- [x] Score calculation system
- [x] Audio feedback system
- [x] Haptic feedback for correct/wrong answers
- [x] Progress tracking via `useGameSessionProgress`

### Pending 🔧
- [ ] [Pending item 1]
- [ ] [Pending item 2]

---

## Section 19: Deployment Readiness

### Pre-Launch Checklist
- [x] Code review completed
- [x] Unit tests written and passing
- [x] CV integration validated on target devices
- [ ] Performance benchmarking on low-end devices
- [ ] Accessibility audit for color blindness support

---

## Section 20: Maintenance & Support

### Owner Responsibilities
- Monitor analytics for drop-off points
- Update content seasonally if applicable
- Respond to parent feedback about difficulty/engagement

---

## Section 21: Stakeholder Communication

### Updates Required For
- **Product Team**: [Specific questions or decisions needed]
- **Design Team**: [UI improvements or mockups needed]
- **Engineering**: [Performance testing or optimizations needed]

### Key Questions to Resolve
1. [Question 1]
2. [Question 2]

---

## Section 22: Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk] | Low/Med/High | Low/Med/High | [Mitigation strategy] |

---

## Section 23: Sign-off & Approval

### Required Approvals
| Role | Status | Notes |
|------|--------|-------|
| Product Owner | ⏳ Pending | [Specific review needed] |
| Lead Engineer | ✅/⏳ Approved | [Validation status] |
| UX Designer | ⏳ Pending | [Design feedback needed] |

### Next Steps
1. [Action item 1]
2. [Action item 2]

---

**Document Status**: DRAFT - Pending stakeholder review  
**Last Updated**: 2026-03-25  
**Next Review Date**: TBD (after product team input)
```

---

## Batch 1 Games to Process

### Completed ✅
1. [x] **Counting Objects** - Full spec documented (`SPEC_counting_objects_2026-03-25.md`)
2. [x] **Bubble Count** - Full spec documented (`SPEC_bubble_count_2026-03-25.md`)

### In Progress 🔧
3. [ ] Color By Number
4. [ ] Counting Collectathon (2D & 3D versions)
5. [ ] Digital Jenga (already done as critical drift case)
6. [ ] Egg Addition Whiz
7. [ ] Math Smash
8. [ ] Number Bubble Pop

### Pending ⏳
9. [ ] Number Sequence
10. [ ] Pop The Number
11. [ ] More or Less (if in batch)
12. [ ] Other math games identified

---

## Efficiency Tips for Batch Processing

### Reuse Patterns Across Games
1. **CV Integration**: Most games use identical `useGameHandTracking` hook pattern - copy-paste and customize FPS/targets
2. **Streak System**: Platform-wide streak tracking (`useStreakTracking`) used consistently across all math games
3. **Scoring Formula**: Standardize on `(level × 10) + (streak × 5)` or document deviations clearly

### Common Variations to Note
| Variation Type | Examples | How to Document |
|----------------|----------|-----------------|
| Time pressure | Bubble Count (30s timer), Pop The Number | Note in Section 9 (Difficulty Progression) |
| Scoring formula | Counting Objects (streak-based), Bubble Count (time-based) | Document deviation in Section 3 |
| Level cap | Bubble Count (3 levels), others (10+ levels) | List exact level configs in Section 3 |

### Quick Review Checklist per Game
- [ ] Read main page file for CV integration pattern
- [ ] Check logic file for unique mechanics (scoring, levels)
- [ ] Verify game registry entry matches implementation
- [ ] Note any special features vs. standard templates
- [ ] Identify potential tech debt or improvements

---

## Template Usage Instructions

### How to Use This Template
1. **Copy entire template** to new file: `SPEC_<game_id>_2026-03-25.md`
2. **Fill metadata table** from game registry (Section header)
3. **Write Section 1** (Game Mechanics) based on gameplay flow observed in code
4. **Paste relevant code snippets** for CV integration (Section 2)
5. **Complete remaining sections** following the structure above
6. **Review and refine** before saving as final spec

### Time Estimates per Game
| Task | Estimated Time | Notes |
|------|----------------|-------|
| Initial code review | 10-15 min | Read page file + logic file |
| Writing Sections 1-3 | 15-20 min | Core mechanics, CV, scoring |
| Writing Sections 4-8 | 15-20 min | UI, audio, assets, progress |
| Writing Sections 9-15 | 15-20 min | Difficulty, testing, risks |
| Review and refine | 5-10 min | Check completeness, clarity |
| **Total per game** | **60-85 minutes** | Average ~70 minutes |

### Batch Processing Strategy
- **Batch creation**: Write all specs in one session for consistency
- **Template reuse**: Use same structure across all games
- **Pattern identification**: Note commonalities while writing (for summary doc)
- **Review cycle**: Complete all drafts first, then refine together

---

## Related Documents

### Reference Specs Already Created
- [SPEC_counting_objects_2026-03-25.md](./SPEC_counting_objects_2026-03-25.md) - Counting Objects (complete)
- [SPEC_bubble_count_2026-03-25.md](./SPEC_bubble_count_2026-03-25.md) - Bubble Count (complete)

### Cross-Game References
- [CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md](../../CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md) - CV integration standards
- [gameRegistry.ts](../../../src/frontend/src/data/gameRegistry.ts) - Master game list and metadata
- [BATCH_SUMMARY_2026-03-25.md](./BATCH_SUMMARY_2026-03-25.md) - Batch overview and progress tracking

---

**Template Version**: v1.0  
**Last Updated**: 2026-03-25  
**Author**: AI Agent (Batch Processing)
