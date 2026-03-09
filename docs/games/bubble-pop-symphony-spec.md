# Bubble Pop Symphony Game Specification

**Game ID:** `bubble-pop-symphony`
**Age Range:** 3-7
**CV Required:** Hand (pinch)
**Vibe:** Chill

---

## Overview

Bubble Pop Symphony is a musical bubble-popping game where children pop bubbles to hear musical notes. Each bubble color corresponds to a different musical note, and popping them creates a symphony of sound. Toddler-friendly with no timer pressure.

---

## Core Mechanics

### Input Method

| Method | Description |
|--------|-------------|
| Primary | Hand tracking with pinch |
| Hit detection | Magnetic snap (100px threshold) |
| Hitbox multiplier | 2.0x for easy targeting |

### Game Loop

1. **Spawn:** 6 bubbles appear with random positions
2. **Float:** Bubbles float slowly around screen
3. **Pop:** Pinch on bubble → pop sound + musical note
4. **Respawn:** All popped → new bubbles appear
5. **Repeat:** Continuous play

---

## Musical Notes

| Note | Pitch | Color | Icon |
|------|-------|-------|------|
| C4 | 261.63 Hz | #FF6B6B (red) | Circle |
| D4 | 293.66 Hz | #4ECDC4 (teal) | Circle |
| E4 | 329.63 Hz | #45B7D1 (blue) | Circle |
| F4 | 349.23 Hz | #FFA500 (orange) | Circle |
| G4 | 392.0 Hz | #FFD700 (gold) | Circle |
| A4 | 440.0 Hz | #95E1D3 (mint) | Circle |

### Sound Generation

Uses Web Audio API oscillator:

```typescript
oscillator.type = 'sine';
oscillator.frequency.value = notePitch;
gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
```

---

## Visual Design

### UI Elements

- **Score Display:** Top center with music icon 🎵
- **Bubbles:** Colorful circular bubbles with inner colored circle
- **Cursor:** Blue cursor with pointer icon
- **Success Animation:** Confetti "Pop!" message

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Discovery cream (#FFF8F0) |
| Bubbles | 6 musical colors |
| Score panel | White with gold border |
| Mascot | Friendly feedback character |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Pop bubble | Musical note + pop sound | 'success' |
| Milestone (5,10,15,20) | TTS announcement | 'celebration' |
| All popped | Success sound | None |
| New round | Success sound | None |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Start | "Pop the bubbles by pinching them! Each one makes a musical note!" |
| First pop | "Great job! You popped a bubble!" |
| Milestone 5 | "Amazing! 5 bubbles popped!" |
| Milestone 10+ | "Amazing! {N} bubbles popped!" |
| Round complete | "Amazing! New bubbles are ready!" |

---

## Game Constants

```typescript
const BUBBLE_COUNT = 6;
const VELOCITY_RANGE = 0.35; // Slow floating
const MARGIN = 100; // Keep bubbles away from edges
const HITBOX_MULTIPLIER = 2.0;
const MAGNETIC_THRESHOLD = 100;
const MIN_SPACING = 40;
```

---

## Bubble Physics

### Movement

```typescript
velocity: {
  x: (random - 0.5) × 0.35,
  y: (random - 0.5) × 0.35
}
```

Bounces off walls at margin (100px from edges).

### Size

```typescript
targetSize = getRecommendedTargetSize(screenWidth);
bubbleSize = max(56, targetSize × 0.9);
```

---

## Scoring

| Event | Points |
|-------|--------|
| Pop bubble | +1 |
| Round complete | Continue playing |

### Milestones

- 5 bubbles → Voice feedback + haptic
- 10 bubbles → Celebration
- 15 bubbles → Celebration
- 20 bubbles → Celebration

---

## Educational Value

### Skills Developed

1. **Musical Awareness** - Different notes for different colors
2. **Hand-Eye Coordination** - Pinching accuracy
3. **Cause and Effect** - Pop → sound
4. **Visual Tracking** - Following moving targets
5. **Fine Motor Skills** - Pinch gesture practice
6. **Auditory Learning** - Associating colors with sounds

---

## Accessibility

- **No timer pressure:** "Take your time! Pop the bubbles!"
- **Large hitboxes:** 2.0x multiplier for easy targeting
- **Magnetic snap:** 100px threshold helps with accuracy
- **Visual + audio:** Multi-sensory feedback
- **Slow movement:** Bubbles float gently for easy tracking
- **Generous spacing:** 40px minimum between bubbles
