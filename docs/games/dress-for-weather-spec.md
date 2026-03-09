# Dress For Weather Game Specification

**Game ID:** `dress-for-weather`
**Age Range:** 2-5
**CV Required:** Hand (drag & drop)
**Vibe:** Chill

---

## Overview

Dress for Weather is a toddler-friendly drag-and-drop game where children dress a character for different weather conditions. Players select appropriate clothing items and drag them to the character. Self-paced with no timer pressure.

---

## Core Mechanics

### Input Method

| Method | Description |
|--------|-------------|
| Primary | Hand tracking with pinch-to-drag |
| Hitbox | 2.0x multiplier for easy grabbing |
| Magnetic snap | 120px threshold |

### Game Loop

1. **Weather Display:** Shows weather type (sunny, rainy, snowy, windy)
2. **Clothing Options:** 6 items shown at bottom
3. **Drag:** Pinch and drag item to character
4. **Validate:** Correct item → accepted, Wrong item → rejected
5. **Complete:** 3 correct items → next level

---

## Weather Types

| Weather | Icon | Background | Correct Items |
|---------|------|------------|---------------|
| Sunny | ☀️ Sun | Yellow gradient | Sunglasses, T-shirt, Shorts, Hat, Sandals |
| Rainy | 🌧️ Rain | Blue gradient | Raincoat, Umbrella, Boots |
| Snowy | ❄️ Snow | Light blue gradient | Coat, Scarf, Mittens, Winter hat, Boots |
| Windy | 💨 Wind | Purple gradient | Coat, T-shirt, Scarf, Winter hat, Hat |

---

## Clothing Items

| ID | Name | Weathers | Color | Emoji |
|----|------|----------|-------|-------|
| sunglasses | Sunglasses | Sunny | #FFE082 | 🕶️ |
| t-shirt | T-Shirt | Sunny, Windy | #81D4FA | 👕 |
| shorts | Shorts | Sunny | #FFB74D | 🩳 |
| raincoat | Raincoat | Rainy | #FFF59D | 🧥 |
| umbrella | Umbrella | Rainy | #FF6B6B | ☔ |
| boots | Rain Boots | Rainy, Snowy | #A1887F | 👢 |
| coat | Winter Coat | Snowy, Windy | #E3F2FD | 🧥 |
| scarf | Scarf | Snowy, Windy | #FFCCBC | 🧣 |
| mittens | Mittens | Snowy | #F8BBD0 | 🧤 |
| hat | Cap | Sunny, Windy | #C5E1A5 | 🧢 |
| winter-hat | Winter Hat | Snowy, Windy | #B39DDB | ❄️👒 |
| sandals | Sandals | Sunny | #FFAB91 | 🩴 |

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
| 5+ | 10 | 10 | 20 |

### Level Completion

Need 3 correct items to complete level

---

## Visual Design

### UI Elements

- **Weather Indicator:** Top center with icon + name + score
- **Drop Zone:** Character silhouette in center
- **Clothing Items:** 6 items at bottom with emojis
- **Cursor:** 84px yellow cursor

### Color Scheme

| Weather | Background Gradient |
|---------|---------------------|
| Sunny | #FFF9C4 → #FFE082 |
| Rainy | #B3E5FC → #81D4FA |
| Snowy | #E1F5FE → #B3E5FC |
| Windy | #E8EAF6 → #C5CAE9 |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Correct item | TTS + playClick() | 'success' |
| Wrong item | TTS feedback | None |
| Level complete | TTS announcement | None |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Start | "Dress the character for different weather! Drag the right clothes!" |
| Correct | "Perfect! {Item} is great for {Weather}!" |
| Wrong | "Hmm, {Item} isn't quite right for {Weather}. Try another!" |
| Level complete | "Amazing! Let's try the next weather!" |
| All complete | "You finished all the weather! You're a weather expert!" |

---

## Game Constants

```typescript
const ITEM_SIZE = screenDims.width × 0.12; // 12% of screen width
const DROP_ZONE_SIZE = Math.min(screenDims.width × 0.35, 350);
const MAGNETIC_THRESHOLD = 120;
const HITBOX_MULTIPLIER = 2.0;
const REQUIRED_CORRECT = 3;
const TOTAL_LEVELS = 4;
```

---

## Item Generation

Per level, 6 items are selected:
- Correct items for that weather
- Wrong items (not suitable for that weather)

```typescript
levelItems = CLOTHING_ITEMS.filter(item => {
  const isCorrect = level.correctItems.includes(item.id);
  const isWrong = !item.weathers.includes(level.weather);
  return isCorrect || isWrong;
}).slice(0, 6);
```

---

## Drag & Drop System

### Magnetic Snap

When dragging within 120px of drop zone:
- Auto-snap to center
- Visual feedback shows snap

### Hitbox Multiplier

2.0x hitbox means:
- 100px item has 200px effective hitbox
- Makes grabbing easier for toddlers

---

## Progress Tracking

### Session Persistence

```typescript
interface DressForWeatherSession {
  currentLevel: number;
  score: number;
  correctlyPlaced: Set<string>;
}
```

---

## Educational Value

### Skills Developed

1. **Weather Awareness** - Understanding weather conditions
2. **Appropriate Clothing** - Learning what to wear when
3. **Fine Motor Skills** - Drag and drop practice
4. **Decision Making** - Choosing correct items
5. **Cause and Effect** - Weather determines clothing
6. **Vocabulary** - Weather and clothing words

---

## Accessibility

- **Large targets:** 12% of screen width (max 120px)
- **No timer:** "Take your time!"
- **Forgiving:** Wrong items rejected gently
- **Voice feedback:** TTS for all events
- **Visual + audio:** Multi-sensory learning
- **Simple controls:** Just drag and drop
- **High contrast:** 7:1 contrast ratio
