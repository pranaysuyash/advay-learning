# Math Monsters Game Specification

**Game ID:** `math-monsters`
**World:** Learning
**Vibe:** Chill
**Age Range:** 5-8 years
**CV Requirements:** Yes (Finger Counting)

---

## Overview

Math Monsters is an educational math game where children feed hungry monsters by showing the correct number of fingers. The game combines number recognition with addition and subtraction operations in an engaging monster-themed setting.

### Tagline
"Show fingers to solve math and feed the monsters\! 🦖"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Problem** - Math problem displayed (e.g., "3 + 2 = ?")
2. **Think Answer** - Calculate the result mentally
3. **Show Fingers** - Hold up the correct number of fingers
4. **Hold to Submit** - Keep hand steady for 1.5 seconds
5. **Feed Monster** - Monster eats if correct, gets sad if wrong
6. **Continue** - Progress through 7 levels

### Controls

| Action | Input |
|--------|-------|
| Show answer | Hold up fingers (hand tracking counts them) |
| Submit | Hold fingers steady for 1.5 seconds |
| Start game | Click "Start Feeding\!" button |

---

## Difficulty Levels

### 7 Levels

| Level | Operation | Max Number | Problems to Advance | Monsters |
|-------|-----------|------------|---------------------|----------|
| 1 | Recognition | 5 | 5 | Munchy |
| 2 | Recognition | 10 | 5 | Munchy, Nibbles |
| 3 | Addition | 5 | 5 | Munchy |
| 4 | Addition | 10 | 5 | Munchy, Crunchy |
| 5 | Subtraction | 5 | 5 | Crunchy |
| 6 | Subtraction | 10 | 5 | Crunchy, Snoozy |
| 7 | Mixed | 10 | 10 | All monsters |

---

## Scoring System

### Score Formula

```typescript
basePoints = 10;
streakBonus = Math.min(streak × 2, 20);
totalPoints = basePoints + streakBonus;
```

### Max per Round

30 points (10 base + 20 bonus)

### Star Thresholds

- 1 star: 150+ points
- 2 stars: 300+ points
- 3 stars: 500+ points

---

## Monster Characters

### 5 Monsters

| Name | Emoji | Color | Personality |
|------|-------|-------|-------------|
| Munchy | 🦖 | #4CAF50 | Hungry |
| Crunchy | 🐊 | #8BC34A | Grumpy |
| Nibbles | 🐰 | #FF9800 | Playful |
| Snoozy | 🐻 | #795548 | Sleepy |
| Zippy | 🦊 | #FF5722 | Excited |

---

## Educational Value

### Skills Developed

1. **Number Recognition** - Identifying numbers 0-10
2. **Arithmetic Operations** - Addition and subtraction concepts
3. **Finger Counting** - Embodied cognition
4. **Math Fact Fluency** - Quick recall of basic facts
5. **Problem Solving** - Step-by-step thinking

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
