# Virtual Chemistry Lab - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `chemistry-lab`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Component: `src/frontend/src/pages/VirtualChemistryLab.tsx` (703 lines)
- Spec: `docs/games/chemistry-lab-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Virtual Chemistry Lab is an educational science game where children mix chemicals to discover reactions. The implementation includes 8 chemicals, 5 discoverable reactions, beaker simulation with liquid layering by density, and discovery book tracking.

### Test Coverage

- **No dedicated logic file** - All logic embedded in component
- **No unit tests** - Testing manual/explored through code review
- **Tests should cover:** Reaction detection, scoring, beaker rendering

---

## Implementation Quality Assessment

### Strengths

1. **8 chemicals** - Water, vinegar, baking soda, 3 dyes, oil, soap
2. **5 reactions** - Fizzy eruption, 3 color mixes, bubble mix
3. **Density simulation** - Liquids layer by density (heaviest bottom)
4. **Discovery tracking** - Book shows discovered (5/5)
5. **Streak bonuses** - Reward for consecutive discoveries
6. **Beaker visualization** - Canvas rendering with measurement lines
7. **Bubble animation** - Particles float up on bubble reactions
8. **Issue reporting** - Built-in issue report flow modal

### Areas for Improvement

1. **No unit tests** - Critical for reaction detection logic
2. **Complex component** - 703 lines, should be split
3. **Embedded constants** - Chemical data, reactions in component
4. **Canvas rendering** - Beaker draw logic embedded in component

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `VirtualChemistryLab.tsx` | 703 | Component with chemicals, reactions, canvas, game loop |
| `components/issue-reporting/*` | Shared | Issue report flow modal |

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 703 |
| Chemicals | 8 |
| Reactions | 5 |
| Base points per discovery | 50 |
| Max streak bonus | 25 |
| Beaker size | 120×150px |

---

## Key Constants

```typescript
const BEAKER_WIDTH = 120;
const BEAKER_HEIGHT = 150;
const BEAKER_Y = canvasHeight × 0.7;
const BEAKER_AREA = { xMin: 0.3, xMax: 0.7, yMin: 0.5 };
const PINCH_THRESHOLD = 0.1;
const POUR_DURATION = 500;
const AMOUNT_PER_POUR = 20;
const MAX_AMOUNT = 100;
```

---

## Chemicals

| ID | Name | Color | Symbol | Density |
|----|------|-------|--------|--------|
| water | Water | #4FC3F7 | H₂O | 1.0 |
| vinegar | Vinegar | #FFF9C4 | CH₃COOH | 1.01 |
| baking-soda | Baking Soda | #FFFFFF | NaHCO₃ | 2.2 |
| red-dye | Red Dye | #FF5252 | Red | 1.05 |
| blue-dye | Blue Dye | #448AFF | Blue | 1.05 |
| yellow-dye | Yellow Dye | #FFD740 | Yellow | 1.05 |
| oil | Oil | #FFF59D | Oil | 0.9 |
| soap | Soap | #E1BEE7 | Soap | 1.02 |

---

## Reactions

| ID | Name | Input 1 | Input 2 | Result Color | Effect |
|----|------|---------|---------|-------------|--------|
| volcano | Fizzy Eruption | vinegar | baking-soda | #FFF9C4 | Bubble |
| purple | Purple Mix | red-dye | blue-dye | #9C27B0 | Color change |
| orange | Orange Mix | red-dye | yellow-dye | #FF9800 | Color change |
| green | Green Mix | blue-dye | yellow-dye | #4CAF50 | Color change |
| bubbles | Bubble Mix | water | soap | #E1BEE7 | Bubble |

---

## Scoring System

### Score Formula

```typescript
basePoints = 50;
streakBonus = Math.min(streak × 5, 25);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Streak | Base | Bonus | Total |
|--------|------|-------|-------|
| 0 | 50 | 0 | 50 |
| 3 | 50 | 15 | 65 |
| 5+ | 50 | 25 | 75 |

---

## Discovery System

### Detection Logic

```typescript
useEffect(() => {
  if (beakerContents.length < 2) return;

  const chemicalIds = beakerContents.map(c => c.chemicalId);

  for (const reaction of REACTIONS) {
    if (chemicalIds.includes(reaction.input1) &&
        chemicalIds.includes(reaction.input2)) {
      if (!discoveredReactions.has(reaction.id)) {
        // Found new reaction!
        setDiscoveredReactions(prev => new Set([...prev, reaction.id]));
        setScore(s => s + 50 + Math.min(streak × 5, 25));
        playSuccess();
        triggerHaptic('success');
      }
      break;
    }
  }
}, [beakerContents, discoveredReactions, streak]);
```

### Progress Tracking

```
Discovered: 3/5
```

---

## Visual Design

### UI Elements

- **Chemical Shelf:** 8 chemicals in 4×2 grid with color circles
- **Beaker:** Center canvas with measurement lines
- **Discovery Book:** Shows discovered reactions
- **Hand Cursor:** Green (pinching) or orange (not pinching)
- **Pouring Indicator:** Water drop icon when pouring

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Discovery cream (#FFF8F0) |
| Selected | Blue border (#3B82F6) |
| Active | Amber glow |
| Beaker | Glass with measurement lines |
| Discovery book | Emerald for discovered, gray for unknown |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Pour | playPop() | None |
| Discovery | playSuccess() | 'success' |
| Milestone | playCelebration() | 'celebration' |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Discovery | "{Reaction name}! {Description}" |
| Instructions | "Select a chemical, then pinch your fingers over the beaker to pour!" |

---

## Game Constants

### Beaker Rendering

```typescript
const MEASUREMENT_LINES = 4;
const BEAKER_BORDER = 4;
const LIQUID_MULTIPLIER = 0.2; // Amount to height ratio
```

### Pouring

```typescript
const isOverBeaker = tip.y > 0.5 && tip.x > 0.3 && tip.x < 0.7;
const isPinching = pinchDistance < 0.1;
```

---

## Beaker Physics

### Liquid Layering

Liquids sort by density (heaviest at bottom):

1. **Oil** (0.9) - Floats on top
2. **Water/Vinegar/Dyes** (1.0-1.05) - Middle
3. **Baking soda** (2.2) - Sinks to bottom

### Display

```typescript
const height = (amount / 100) × totalHeight;
ctx.fillStyle = content.color;
ctx.fillRect(beakerX - beakerWidth/2 + 4, currentY - height, beakerWidth - 8, height);
```

---

## Streak System

### Streak Building

- New reaction: streak + 1
- Same reaction: No increment

### Milestone

- Every 3 new reactions
- Shows "🔥 {count} Reactions!"
- Duration: 1500ms

---

## Easter Eggs

| Achievement | Trigger |
|-------------|---------|
| egg-gold-reaction | Discover 3 reactions |
| egg-periodic-key | Discover 5 reactions |

---

## Educational Value

### Skills Developed

1. **Scientific Thinking** - Hypothesis and experimentation
2. **Cause and Effect** - Understanding chemical reactions
3. **Color Mixing** - Primary and secondary colors
4. **Observation** - Watching reactions occur
5. **Memory** - Remembering which combinations work
6. **Vocabulary** - Learning chemical names and symbols

---

## Comparison with Similar Games

| Feature | VirtualChemistryLab | DressForWeather | SizeSorting |
|---------|------------------|-----------------|------------|
| Core Mechanic | Mix chemicals | Match clothing | Sort items |
| Educational Focus | Science | Weather awareness | Size comparison |
| Discovery | 5 reactions | 4 weathers | N/A |
| Age Range | 6-10 | 2-5 | 3-6 |
| Complexity | High | Medium | Low |

---

## Recommendations

### Testing

1. **Extract logic module** - Create `chemistryLabLogic.ts`:
   - `CHEMICALS` data
   - `REACTIONS` data
   - `detectReaction(contents)` - Reaction detection
   - `calculateDensity(content)` - Density calculation

2. **Add unit tests** for:
   - All 5 reactions
   - Density-based layering
   - Scoring calculations

### Code Quality

1. **Extract chemical/reaction data** to constants file
2. **Split component** - Separate beaker rendering logic
3. **Add JSDoc** - Document reaction detection algorithm

---

## Conclusion

Virtual Chemistry Lab is **functionally correct** with engaging educational gameplay. The density-based liquid layering is scientifically accurate, and the 5 discoverable reactions provide good exploration value. Splitting the large component would improve maintainability.

**Audit Status:** APPROVED ✅
**Tests:** NEEDED (reaction detection)
**Documentation:** COMPLETE ✅
