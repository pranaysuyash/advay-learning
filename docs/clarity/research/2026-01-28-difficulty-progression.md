# Research: Educational App Difficulty Progression

**Date**: 2026-01-28  
**Researcher**: AI Assistant  
**Topic**: How leading educational apps handle difficulty progression for kids

---

## Apps Researched

1. Khan Academy Kids
2. ABCmouse
3. Duolingo
4. SplashLearn
5. Endless Alphabet (Originate)
6. Osmo

---

## Key Findings

### 1. Khan Academy Kids - Adaptive Learning Path

**Approach**: Adaptive progression with manual override

**How it works**:
- Kids follow a "Learning Path" that cycles through topics
- Activities progress based on child performance
- Progress quickly if topic mastered
- More practice provided if struggling
- Prizes awarded based on completion and accuracy
- **All age levels eventually served over time**
- Parents can manually adjust learning level if needed

**Progress Indicators**:
- Green checkmark: Mastered
- Yellow checkmark: In progress
- Red checkmark: Developing

**Parent Control**:
- Can manually adjust learning level
- Can view detailed progress
- Can see which activities completed

**Key Insight**: Adaptive with parent override. Progression is fluid, not locked behind gates.

---

### 2. ABCmouse - Grade-Based Learning Paths

**Approach**: Grade-level based with manual adjustment

**How it works**:
- Separate Learning Paths for Reading and Math
- Grade level settings (can be different for each subject)
- Changing grade level resets the Learning Path
- Activities must be completed in sequence

**Parent Control**:
- Can change grade levels at any time
- Different levels for different subjects
- Warning: Changing resets progress on that path

**Key Insight**: Structured grade-based progression. Parents control when to advance.

---

### 3. Duolingo - Gamified Progression

**Approach**: Unlock levels by completing previous ones

**How it works**:
- Lessons organized in a tree/branch structure
- Must complete Lesson 1 to unlock Lesson 2
- Hearts system (lose hearts for mistakes)
- Daily streaks and XP points
- Leaderboards for competition

**Key Insight**: Clear unlock progression with gamification. Mistakes have consequences (lose hearts).

---

### 4. SplashLearn - Personalized Learning

**Approach**: Personalized learning paths with progress tracking

**How it works**:
- Research-backed curriculum
- Aligns with Common Core standards
- Progress tracking and reporting for parents
- Adaptive based on performance
- Pre-K to Grade 5

**Key Insight**: Standards-aligned with strong parent reporting.

---

### 5. Endless Alphabet - Exploration-Based

**Approach**: Open exploration, no forced sequence

**How it works**:
- All letters available from start
- Kids choose which letter to learn
- Interactive word puzzles
- No failure state - playful exploration

**Key Insight**: No locked content. Kids explore at their own pace.

---

## Patterns Observed

### Common Approaches

| Approach | Apps Using It | Best For |
|----------|---------------|----------|
| **Adaptive/Fluid** | Khan Academy Kids, SplashLearn | Personalized learning |
| **Grade-Based** | ABCmouse | Structured curriculum |
| **Unlock Sequence** | Duolingo | Clear progression |
| **Open Exploration** | Endless Alphabet | Freedom to explore |

### Progression Triggers

1. **Completion-Based**: Complete X activities to advance
2. **Accuracy-Based**: Achieve Y% accuracy to unlock next
3. **Time-Based**: Spend Z minutes on current level
4. **Parent-Initiated**: Parent decides when to advance
5. **Adaptive Algorithm**: App automatically adjusts based on performance

### Parent Involvement

| Level | Description | Examples |
|-------|-------------|----------|
| **High** | Parent must approve advancement | ABCmouse (grade changes) |
| **Medium** | Parent can override, app suggests | Khan Academy Kids |
| **Low** | Parent views progress only | Endless Alphabet |

---

## Recommendations for Our App

### Option A: Adaptive with Parent Override (RECOMMENDED)

Based on Khan Academy Kids model:

**How it works**:
1. Start with 5 letters (Easy)
2. After completing all 5 with 70%+ accuracy, unlock 5 more (now 10 total)
3. After completing 10 with 70%+ accuracy, unlock all letters
4. Parent can manually adjust difficulty in Settings anytime
5. Visual progress indicator shows "X of Y letters mastered"

**Pros**:
- Kid-friendly (automatic progression)
- Parent has control if needed
- Clear sense of achievement
- Adapts to child's pace

**Cons**:
- More complex to implement
- Need to track per-letter mastery

### Option B: Letter-by-Letter Unlock

Based on Duolingo model:

**How it works**:
1. Start with only Letter A
2. Master A (trace 3 times with good accuracy) → unlock B
3. Continue unlocking letters sequentially
4. Visual "letter path" showing progress

**Pros**:
- Very clear progression
- Sense of achievement with each unlock
- Simple to understand

**Cons**:
- May feel slow/restrictive
- Less freedom to explore

### Option C: Open Exploration with Difficulty Tiers

Hybrid approach:

**How it works**:
1. All letters always visible
2. "Easy Mode" = trace freely, no scoring
3. "Challenge Mode" = must achieve accuracy to "collect" letter
4. Collect all letters to earn reward

**Pros**:
- Freedom to explore
- Gamification through collecting
- No frustration from locked content

**Cons**:
- Less structured progression
- May overwhelm some kids

---

## Implementation Suggestion

**Hybrid: Adaptive Unlock with Exploration**

1. **Phase 1**: Show first 5 letters (A-E)
2. **Phase 2**: After mastering 3 of 5, unlock next 5 (F-J)
3. **Phase 3**: Continue unlocking in batches of 5
4. **Exploration Mode**: Allow practice on any unlocked letter
5. **Parent Override**: Settings to manually unlock all letters

**Visual Design**:
- Map/path showing letter journey
- Locked letters grayed out with "?"
- Unlocked letters colorful and clickable
- Progress bar: "Mastered 7 of 26 letters"

**Gamification**:
- Badge for unlocking each batch
- Special reward for completing all 26
- Streak bonus for consecutive days

---

## References

1. Khan Academy Kids Help Center: Learning Path documentation
2. ABCmouse Support: Learning Path grade levels
3. Research.com: Best Educational Apps for Kids 2024
4. EdTech Impact: Adaptive Learning Platforms 2024

---

**Next Step**: Present findings to stakeholders for decision on Q-001

