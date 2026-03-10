# Dress For Weather - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `dress-for-weather`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Component: `src/frontend/src/pages/DressForWeather.tsx` (649 lines)
- Spec: `docs/games/dress-for-weather-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Dress For Weather is a weather awareness and clothing matching game where children drag appropriate clothing items to a character based on weather conditions. The implementation features 4 weather types (sunny, rainy, snowy, windy), 12 clothing items, drag & drop with 2.0x hitbox, and magnetic snapping at 120px threshold.

### Test Coverage

- **No dedicated logic file** - All logic embedded in component
- **No unit tests** - Testing manual/explored through code review
- **Tests should cover:** Clothing item validation, drop zone logic, scoring, weather matching

---

## Implementation Quality Assessment

### Strengths

1. **4 weather types** - Sunny, rainy, snowy, windy with gradient backgrounds
2. **12 clothing items** - Sunglasses, t-shirt, shorts, raincoat, umbrella, boots, coat, scarf, mittens, hat, winter hat, sandals
3. **DragDropSystem component** - Reusable drag & drop with magnetic snap
4. **Toddler-friendly** - 2.0x hitbox, 120px magnetic threshold, no timer
5. **Voice instructions** - TTS feedback for correct/incorrect items
6. **Streak system** - Every 5 correct answers triggers milestone
7. **GameCursor component** - 84px with trail and pulse animation
8. **Level progression** - 4 levels, need 3 correct items per level

### Areas for Improvement

1. **No unit tests** - Critical for drag & drop validation
2. **Embedded constants** - CLOTHING_ITEMS, LEVELS in component
3. **649 lines** - Large component, should extract data/constants
4. **No pose detection** - Could verify if child "puts on" clothing

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `DressForWeather.tsx` | 649 | Component with UI, game flow, drag & drop |
| `components/game/DragDropSystem` | Shared | Drag & drop with magnetic snap |
| `components/game/GameCursor` | Shared | 84px cursor with trail |
| `components/ClothingSVGs` | Shared | Weather icons (Sun, Rain, Snow, Wind) |

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 649 |
| Weather types | 4 |
| Clothing items | 12 |
| Items per level | 6 (mix of correct/wrong) |
| Base points per correct | 10 |
| Max streak bonus | 15 |
| Hitbox multiplier | 2.0 |
| Magnetic threshold | 120px |

---

## Key Constants

```typescript
const ITEM_SIZE = Math.min(screenDims.width * 0.12, 120); // 12% of screen width
const DROP_ZONE_SIZE = Math.min(screenDims.width * 0.35, 350); // 35% of screen width
const HITBOX_MULTIPLIER = 2.0;
const MAGNETIC_THRESHOLD = 120;
const BASE_POINTS = 10;
const STREAK_BONUS_PER = 2;
const MAX_STREAK_BONUS = 15;
const REQUIRED_ITEMS_PER_LEVEL = 3;
```

---

## Clothing Items

| ID | Name | Colors | Appropriate Weather |
|----|------|--------|---------------------|
| sunglasses | Sunglasses | #FFE082 | Sunny |
| t-shirt | T-Shirt | #81D4FA | Sunny, Windy |
| shorts | Shorts | #FFB74D | Sunny |
| raincoat | Raincoat | #FFF59D | Rainy |
| umbrella | Umbrella | #FF6B6B | Rainy |
| boots | Rain Boots | #A1887F | Rainy, Snowy |
| coat | Winter Coat | #E3F2FD | Snowy, Windy |
| scarf | Scarf | #FFCCBC | Snowy, Windy |
| mittens | Mittens | #F8BBD0 | Snowy |
| hat | Cap | #C5E1A5 | Sunny, Windy |
| winter-hat | Winter Hat | #B39DDB | Snowy, Windy |
| sandals | Sandals | #FFAB91 | Sunny |

---

## Weather Levels

| Level | Weather | Background | Correct Items |
|-------|---------|------------|---------------|
| 1 | Sunny | Yellow gradient (#FFF9C4 → #FFE082) | 5 items |
| 2 | Rainy | Blue gradient (#B3E5FC → #81D4FA) | 3 items |
| 3 | Snowy | Light blue gradient (#E1F5FE → #B3E5FC) | 5 items |
| 4 | Windy | Purple gradient (#E8EAF6 → #C5CAE9) | 5 items |

---

## Scoring System

### Score Formula

```typescript
basePoints = 10;
streakBonus = Math.min(streak × 2, 15);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Streak | Base | Bonus | Total |
|--------|------|-------|-------|
| 0 | 10 | 0 | 10 |
| 3 | 10 | 6 | 16 |
| 5 | 10 | 10 | 20 |
| 8+ | 10 | 15 | 25 |

### Level Completion

Need 3 correct items to complete each level.

---

## Drag & Drop System

### Magnetic Snap

```typescript
enableMagneticSnap = true;
magneticThreshold = 120; // pixels
```

When item is within 120px of drop zone, it snaps to center.

### Hitbox Multiplier

```typescript
hitboxMultiplier = 2.0;
```

Hitbox is 2x the visual size for easier grabbing.

### Validation Logic

```typescript
const isCorrect = level.correctItems.includes(item.id);

if (isCorrect) {
  // Remove item from play
  setItems(prev => prev.filter(i => i.id !== item.id));
  setCorrectlyPlaced(prev => new Set([...prev, item.id]));

  // Score and streak
  const newStreak = incrementStreak();
  setScore(prev => prev + 10 + Math.min(newStreak * 2, 15));

  // Check level complete
  if (correctlyPlaced.size >= REQUIRED_ITEMS_PER_LEVEL) {
    // Next level or game complete
  }
} else {
  // Wrong item - voice feedback
  speak(`Hmm, ${item.name} isn't quite right for ${level.weatherName}. Try another!`);
  resetStreak();
}
```

---

## Visual Design

### UI Elements

- **Weather Indicator:** Top center with weather icon, score, streak
- **Clothing Items:** Bottom area in 3×2 grid with emoji icons
- **Drop Zone:** Center "Dress Me!" character area (35% screen width)
- **Game Cursor:** 84px with trail and pulse animation
- **Success Animation:** Hearts with "Perfect!" message

### Color Scheme

| Element | Colors |
|---------|--------|
| Sunny background | Yellow gradient (#FFF9C4 → #FFE082) |
| Rainy background | Blue gradient (#B3E5FC → #81D4FA) |
| Snowy background | Light blue gradient (#E1F5FE → #B3E5FC) |
| Windy background | Purple gradient (#E8EAF6 → #C5CAE9) |
| Selected item | Blue border (#3B82F6) |
| Drop zone | Green (#E8F5E9) |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Correct drop | playClick() | 'success' |
| Wrong drop | playClick() | None |
| Level complete | playClick() | None |
| Game complete | playClick() | None |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Start | "Dress the character for different weather! Drag the right clothes!" |
| Hand detected | "Hand detected" |
| Hand lost | "Hand lost" |
| Correct item | "Perfect! {Item name} is great for {Weather}!" |
| Wrong item | "Hmm, {Item name} isn't quite right for {Weather}. Try another!" |
| Next level | "Amazing! Let's try the next weather!" |
| Game complete | "You finished all the weather! You're a weather expert!" |

---

## Hand Tracking Configuration

```typescript
useGameHandTracking({
  gameName: 'DressForWeather',
  isRunning: gameStarted,
  webcamRef,
  onFrame: handleHandFrame,
});
```

### Frame Processing

```typescript
const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
  const tip = frame.indexTip;

  if (tip) {
    // Convert normalized to screen coordinates
    const screenX = tip.x * screenDims.width;
    const screenY = tip.y * screenDims.height;

    setCursorPosition({ x: screenX, y: screenY });
    setIsPinching(frame.pinch.state.isPinching);
  }
}, [speak, screenDims]);
```

---

## Streak System

### Streak Building

- Correct item: streak + 1
- Wrong item: streak resets to 0

### Milestone

- Every 5 consecutive correct items
- Shows "🔥 {streak} Streak!" overlay
- Duration: 1500ms

---

## Game Flow

1. **Start Screen:** Instructions with start button
2. **Level 1:** Sunny day - drag sunglasses, t-shirt, shorts, hat, sandals
3. **Drop Validation:** Correct items stay, wrong items return
4. **Level Complete:** After 3 correct items, 2-second celebration
5. **Next Level:** Weather changes with new items
6. **Game Complete:** After 4 levels, show final score

---

## Educational Value

### Skills Developed

1. **Weather Awareness** - Understanding different weather conditions
2. **Cause and Effect** - Clothing choices for weather
3. **Decision Making** - Selecting appropriate items
4. **Fine Motor Skills** - Drag and drop gesture
5. **Vocabulary** - Learning clothing names
6. **Visual Association** - Matching items to weather icons

---

## Comparison with Similar Games

| Feature | DressForWeather | SizeSorting | EmojiMatch |
|---------|----------------|-------------|------------|
| Core Mechanic | Drag clothing to character | Sort items by size | Match emoji pairs |
| Educational Focus | Weather awareness | Size comparison | Memory/matching |
| Items | 12 clothing items | 3-6 per round | 6-8 pairs |
| Time Pressure | None | None | None |
| Age Range | 2-4 | 3-6 | 3-6 |
| Feedback | Voice for each item | Visual only | Visual only |

---

## Recommendations

### Testing

1. **Extract logic module** - Create `dressForWeatherLogic.ts`:
   - `CLOTHING_ITEMS` data
   - `LEVELS` data
   - `validateItem(itemId, weather)` - Validation function
   - `calculateScore(streak)` - Scoring function

2. **Add unit tests** for:
   - All 12 items × 4 weather combinations
   - Correct/incorrect validation
   - Scoring with various streaks
   - Level completion detection

### Code Quality

1. **Extract constants**:
   ```typescript
   export const DRESS_FOR_WEATHER_CONSTANTS = {
     BASE_POINTS: 10,
     STREAK_BONUS_PER: 2,
     MAX_STREAK_BONUS: 15,
     REQUIRED_ITEMS_PER_LEVEL: 3,
     HITBOX_MULTIPLIER: 2.0,
     MAGNETIC_THRESHOLD: 120,
   } as const;
   ```

2. **Component splitting** - Extract clothing data to constants file

3. **Accessibility** - Add keyboard controls as fallback

---

## Conclusion

Dress For Weather is **functionally correct** with excellent toddler-friendly design. The DragDropSystem with 2.0x hitbox and 120px magnetic snap makes it accessible for young children. The 4 weather levels provide good educational variety, and the voice feedback reinforces learning.

**Audit Status:** APPROVED ✅
**Tests:** NEEDED (drag & drop validation)
**Documentation:** COMPLETE ✅
