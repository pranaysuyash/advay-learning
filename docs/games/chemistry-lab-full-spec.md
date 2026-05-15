# Chemistry Lab - Comprehensive Game Specification

**Game ID:** `chemistry-lab`  
**World:** Lab of Wonders  
**Category:** Science / Discovery / Color Mixing  
**Audit Date:** March 20, 2026  
**Spec Version:** 1.0

---

## 1. Concept Summary

**One-line concept:** Children mix colored ingredients to discover recipes and create potions, learning color theory through experimentation.

**Genre/Subgenre:** Science Discovery / Color Mixing

**Target Audience:** Children ages 6-10

**Core Player Fantasy:** "I'm a mad scientist discovering secret potion recipes"

**Primary Skills Tested:**
- Color theory (primary/secondary mixing)
- Hypothesis formation
- Systematic experimentation
- Recipe memorization

**Session Length:** 5-15 minutes

---

## 2. Repo Status

**Implementation Status:** ✅ **Implemented**

**What Works Now:**
- 12 color ingredients
- 15 preset recipes
- 3 difficulty levels (progressive ingredient unlocking)
- Discovery tracking (recipe book)
- Hand tracking with pinch-to-mix
- Visual feedback for reactions

**Evidence:**
- Logic: `src/frontend/src/games/chemistryLabLogic.ts` (lines 1-360)
- Component: `src/frontend/src/pages/ChemistryLab.tsx`

**Confidence Level:** HIGH

---

## 3. Current Implementation

### Core Loop
1. Select ingredients from shelf
2. Pinch over beaker to add
3. Mix multiple ingredients
4. Discover recipe (if valid combination)
5. Record in discovery book
6. Continue experimenting

### Mechanics
- **Ingredients:** 12 colors (red, blue, green, yellow, purple, orange, white, black, pink, cyan, gold, silver)
- **Recipes:** 15 predefined combinations
- **Mixing:** Add up to 3 ingredients
- **Discovery:** Recipes revealed upon valid combination

### Controls
- Hand tracking: Pinch to pour
- Mouse: Click to select, click beaker to add

---

## 4. Intended Design

The game as implemented matches the intended design well. It's a **color discovery toy** that:
- Teaches color mixing through experimentation
- Rewards systematic exploration
- Builds hypothesis-testing skills

**No significant drift detected.** The preset recipe system is appropriate for the target age.

---

## 5. Drift Analysis

| Aspect | Intended | Current | Assessment |
|--------|----------|---------|------------|
| Discovery | Preset recipes | Preset recipes | ✅ Aligned |
| Mixing | Color theory | Color theory | ✅ Aligned |
| Progression | Unlock ingredients | Level-based unlock | ✅ Aligned |

**Drift Status:** NONE - Implementation matches intent

---

## 6. Recommended Canonical Version

**Current implementation IS the canonical version.** No major changes needed.

**Minor Enhancements:**
1. Add real chemical names (educational upgrade)
2. Add reaction animations (visual polish)
3. Add hint system for stuck players

---

## 7. Visual Identity

- **Theme:** Laboratory/beaker aesthetic
- **Colors:** Discovery cream background
- **Beaker:** Glass with measurement lines
- **UI:** Clean, scientific but friendly

---

## 8. Screen Map

### Main Lab
- Ingredient shelf (left)
- Beaker (center)
- Discovery book (right)

### Discovery Overlay
- Grid of discovered recipes
- Progress counter

---

## 9. Controls

| Action | Hand | Mouse |
|--------|------|-------|
| Select | Pinch ingredient | Click ingredient |
| Pour | Pinch over beaker | Click beaker |

---

## 10. Core Mechanics

- **Selection:** Choose up to 3 ingredients
- **Mixing:** Add to beaker
- **Reaction:** Check against recipe database
- **Discovery:** New recipe added to book

---

## 11. Rules

### Valid Mixes
- 2-3 ingredients required
- Must match predefined recipe
- Order doesn't matter

### Discovery
- First time = "New Discovery!"
- Subsequent times = "Already known"

---

## 12. HUD / Gameplay UI

- Ingredient shelf (12 items)
- Beaker with liquid visualization
- Discovery book button
- Current mix indicator

---

## 13. Feedback and Feel

- **Add ingredient:** Pop sound
- **Discovery:** Success sound + celebration
- **No reaction:** Neutral feedback

---

## 14. Points / Rewards

- Base: 50 points per discovery
- Streak: +5 per consecutive discovery (max 25)

---

## 15. End States

- **Completion:** All 15 recipes discovered
- **Session:** Player exits manually

---

## 16. Parallel Modes

### Free Play Mode
- All ingredients unlocked
- Experiment without progression

### Challenge Mode
- Discover specific recipes
- Timed challenges

---

## 17. Improvement Opportunities

### Low-Cost
- Add hint button ("Try mixing red and blue")
- Add reaction bubbles animation

### Medium-Effort
- Real chemical names (sodium bicarbonate, etc.)
- pH meter visualization
- Temperature effects

### Ambitious
- Realistic chemical simulation
- Equipment upgrades
- Lab customization

---

## 18. Content Model

### Ingredients
12 colors with emoji representations

### Recipes
15 combinations covering:
- Primary → Secondary (red + blue = purple)
- Tertiary colors
- Special recipes (gold, silver)

---

## 19. Technical Structure

- `chemistryLabLogic.ts` - Recipe matching, ingredients
- `ChemistryLab.tsx` - UI component

---

## 20. Gaps and Unknowns

No significant gaps. Game is feature-complete for intended scope.

---

## 21. Implementation Notes

### Current Architecture
```typescript
// Recipe matching is simple lookup
function mix(ingredients: Ingredient[]): MixResult {
  const recipe = RECIPES.find(r => 
    r.ingredientIds.sort().join() === ingredientIds.sort().join()
  );
  return { success: !!recipe, recipe };
}
```

---

## 22. Acceptance Criteria

- [ ] All 15 recipes discoverable
- [ ] Ingredient progression works
- [ ] Discovery book records finds
- [ ] Hand tracking functional

---

## 23. Test Plan

### Manual Tests
| Test | Steps | Expected |
|------|-------|----------|
| Discover recipe | Mix red + blue | Purple potion discovered |
| Invalid mix | Mix incompatible | No reaction |
| Progression | Complete level 1 | Level 2 unlocks |

---

*Spec created: March 20, 2026*  
**Drift Assessment: NONE - Implementation is faithful to intent**
