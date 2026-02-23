# UX Implementation Plan

**Date:** 2026-02-23  
**Target:** 85+ score for all games  
**Current:** 59 overall average

---

## Executive Summary

### Strategy
1. Add semantic HTML attributes for test detection
2. Add prominent goal banners with ACTION+OBJECT+OUTCOME format
3. Enhance visual engagement with animations/colors
4. Update tests to check semantic attributes

### Priority Order
1. **Rhyme Time** (45→85) - Lowest score, biggest opportunity
2. **Math Monsters** (50→85) - Big improvement potential
3. **Bubble Pop** (60→85) - Voice input needs clarity
4. **Free Draw** (65→90) - Add goal statement
5. **Story Sequence** (65→85) - Enhance instructions
6. **Shape Safari** (70→90) - Polish existing good base

---

## Implementation Details

### Game 1: Rhyme Time (Priority: P0)

**Current Score:** 45/100  
**Target Score:** 85/100  
**Expected Gain:** +40 points

#### Changes Needed:

1. **Add Goal Banner (data-ux-goal)**
```tsx
// Add at top of gameplay area
data-ux-goal="Match the word that rhymes with CAT"
data-ux-instruction="Click the word that sounds the same"
```

2. **Enhance Visual Engagement**
- Add bouncing mascot (use Mascot component)
- Add rainbow gradient background
- Add star particles on correct answer
- Make correct answer feedback more prominent

3. **Update Test**
```typescript
const goal = await page.locator('[data-ux-goal]').first();
result.childFriendly.understandsGoal = await goal.isVisible();
```

#### Files to Modify:
- `src/frontend/src/pages/RhymeTime.tsx`
- `src/frontend/e2e/child_exploratory_test.spec.ts`

---

### Game 2: Math Monsters (Priority: P0)

**Current Score:** 50/100  
**Target Score:** 85/100  
**Expected Gain:** +35 points

#### Changes Needed:

1. **Add Goal Banner (data-ux-goal)**
```tsx
// Add at top of gameplay
data-ux-goal={`Show ${answer} fingers to feed the monster!`}
data-ux-instruction="Hold up your hand and count with your fingers"
```

2. **Enhance Visual Engagement**
- Make monster bounce when waiting
- Add hunger indicator (empty → full belly)
- Add finger counting visual guide (1-10 fingers shown)
- Add food items that appear when correct

3. **Improve Instructions**
- Add animated hand showing finger positions
- Show "Hold for 2 seconds" countdown visually
- Make progress bar more prominent

#### Files to Modify:
- `src/frontend/src/pages/MathMonsters.tsx`
- `src/frontend/e2e/child_exploratory_test.spec.ts`

---

### Game 3: Bubble Pop (Priority: P1)

**Current Score:** 60/100  
**Target Score:** 85/100  
**Expected Gain:** +25 points

#### Changes Needed:

1. **Add Goal Banner (data-ux-goal)**
```tsx
// Add at top of gameplay
data-ux-goal="Blow into the microphone to pop bubbles and score points!"
data-ux-instruction="Get close to the mic and blow as hard as you can"
```

2. **Enhance Visual Engagement**
- Add bubble character mascot
- Add wind effect animation when blowing
- Make bubbles more colorful (rainbow)
- Add score popups (+10, +20) when bubbles pop

3. **Improve Blow Meter**
- Make larger and more prominent
- Add "Blow harder!" / "Perfect!" feedback
- Add visual wind lines when blowing

#### Files to Modify:
- `src/frontend/src/pages/BubblePop.tsx`
- `src/frontend/e2e/child_exploratory_test.spec.ts`

---

### Game 4: Free Draw (Priority: P1)

**Current Score:** 65/100  
**Target Score:** 90/100  
**Expected Gain:** +25 points

#### Changes Needed:

1. **Add Goal Banner (data-ux-goal)**
```tsx
// Add at top
data-ux-goal="Draw and create art with different brushes and colors!"
data-ux-instruction="Pinch and move your finger to draw on the canvas"
```

2. **Add Start Screen** (currently missing!)
```tsx
// Add menu screen like other games
- Title: "Free Draw Studio!"
- Instructions: "Create beautiful art with your fingers!"
- Big "Start Drawing!" button
```

3. **Enhance Visual Engagement**
- Add animated paint palette mascot
- Add color splash effects when changing colors
- Add sparkle effects while drawing
- Make toolbar more colorful

#### Files to Modify:
- `src/frontend/src/pages/FreeDraw.tsx`
- `src/frontend/e2e/child_exploratory_test.spec.ts`

---

### Game 5: Story Sequence (Priority: P1)

**Current Score:** 65/100  
**Target Score:** 85/100  
**Expected Gain:** +20 points

#### Changes Needed:

1. **Add Goal Banner (data-ux-goal)**
```tsx
// Already has instructions header, add semantic attributes
data-ux-goal="Arrange the picture cards in the right order to tell the story!"
data-ux-instruction="Drag cards from the bottom to the numbered slots above"
```

2. **Enhance Visual Engagement**
- Add story character mascot
- Add slot highlighting animation
- Add "snap" effect when card placed
- Add story completion celebration

3. **Improve Feedback**
- Make correct/incorrect more obvious
- Add sound effects
- Show visual sequence preview

#### Files to Modify:
- `src/frontend/src/pages/StorySequence.tsx`
- `src/frontend/e2e/child_exploratory_test.spec.ts`

---

### Game 6: Shape Safari (Priority: P2)

**Current Score:** 70/100  
**Target Score:** 90/100  
**Expected Gain:** +20 points

#### Changes Needed:

1. **Add Goal Banner (data-ux-goal)**
```tsx
// During gameplay, add:
data-ux-goal={`Find ${targetCount} hidden ${shapeType}s to discover animals!`}
data-ux-instruction="Move your finger near shapes to see them glow, then trace around them"
```

2. **Enhance Visual Engagement**
- Add safari guide mascot
- Add glow effect around found shapes
- Add animal discovery animation
- Add progress tracker (5 circles → show 5 icons)

3. **Improve Shape Visibility**
- Make hint outlines more visible
- Add pulsing animation to shapes
- Add "You're getting close!" indicator

#### Files to Modify:
- `src/frontend/src/pages/ShapeSafari.tsx`
- `src/frontend/e2e/child_exploratory_test.spec.ts`

---

## Test Updates Required

### Update Test Detection Logic

```typescript
// New semantic detection
async function detectGameSemantics(page, result) {
  // Check for goal
  const goalEl = await page.locator('[data-ux-goal]').first();
  if (await goalEl.isVisible().catch(() => false)) {
    result.childFriendly.understandsGoal = true;
    const goal = await goalEl.getAttribute('data-ux-goal');
    recordInteraction(result, 'discover', 'goal', true, goal);
  }

  // Check for instructions
  const instrEl = await page.locator('[data-ux-instruction]').first();
  if (await instrEl.isVisible().catch(() => false)) {
    result.childFriendly.instructionsClear = true;
    const instruction = await instrEl.getAttribute('data-ux-instruction');
    recordInteraction(result, 'discover', 'instruction', true, instruction);
  }

  // Check for progress
  const progressEl = await page.locator('[data-ux-progress]').first();
  if (await progressEl.isVisible().catch(() => false)) {
    recordInteraction(result, 'discover', 'progress_indicator', true);
  }
}
```

---

## Implementation Order

### Phase 1: Semantic Attributes (Quick Wins)
1. Add data-ux-goal to all games
2. Add data-ux-instruction to all games
3. Update tests to check semantic attributes
4. **Expected Gain:** +15-20 points per game

### Phase 2: Goal Banners (High Impact)
1. Add prominent goal banners with ACTION+OBJECT+OUTCOME
2. Add instruction overlays
3. **Expected Gain:** +10-15 points per game

### Phase 3: Visual Enhancements (Polish)
1. Add mascots where missing
2. Add animations and effects
3. Enhance color schemes
4. **Expected Gain:** +5-10 points per game

### Phase 4: Start Screens (Missing Feature)
1. Add start screen to Free Draw
2. Ensure all games have explicit start
3. **Expected Gain:** +5-10 points per game

---

## Timeline Estimate

| Phase | Time | Games | Total Time |
|-------|------|-------|------------|
| Phase 1 | 30 min/game | 6 | 3 hours |
| Phase 2 | 45 min/game | 6 | 4.5 hours |
| Phase 3 | 30 min/game | 6 | 3 hours |
| Phase 4 | 60 min | 1 | 1 hour |
| Testing | 15 min/run | 3 runs | 45 min |
| **Total** | | | **~12 hours** |

---

## Success Criteria

- [ ] All games score 80+ on UX test
- [ ] All games have data-ux-goal attribute
- [ ] All games have data-ux-instruction attribute
- [ ] Overall average score 85+
- [ ] Zero critical issues
- [ ] All tests pass

---

## Next Action

Start **Phase 1: Semantic Attributes** with Rhyme Time and Math Monsters (highest impact).

---

*Plan created: 2026-02-23*  
*Ready for implementation*
