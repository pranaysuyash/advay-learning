# Finger Number Show Game Specification

**Game ID:** `finger-number-show`
**Age Range:** 3-7
**CV Required:** Hand (full hand detection)
**Vibe:** Chill

---

## Overview

Finger Number Show is an educational counting game where children hold up their hand to the camera and the system counts how many fingers they're holding up (0-5). This helps children learn number recognition and practice counting while developing gross motor skills.

---

## Core Mechanics

### Input Method

| Method | Description |
|--------|-------------|
| Primary | MediaPipe hand landmarks (21 points) |
| Detection | Extended finger counting algorithm |
| Output | Number 0-5 |

### Game Loop

1. **Hand Detection:** Camera detects hand via MediaPipe
2. **Landmark Processing:** 21 hand landmarks analyzed
3. **Finger Counting:** Algorithm counts extended fingers
4. **Display:** Show number to child
5. **Feedback:** Visual celebration on holding up numbers

---

## Finger Counting Algorithm

### Extended Finger Detection

For each finger (index, middle, ring, pinky):

```typescript
// Primary heuristic: tip is "up" relative to PIP
up = tip.y < pip.y

// Fallback heuristic: tip is further from wrist than PIP
further = distance(tip, wrist) > distance(pip, wrist) + 0.07

// Finger is extended if either condition is true
isExtended = up || further
```

### Thumb Detection (Special Case)

The thumb uses multiple heuristics for reliability with kids' hands:

| Condition | Test | Description |
|-----------|------|-------------|
| Folded check | distance(tip, IP) < 0.03 | If folded, skip extended detection |
| Distance from palm | distance(tip, palmCenter) > distance(MCP, palmCenter) × 0.8 | Tip should be extended from palm |
| Spread from index | distance(tip, indexMCP) > 0.15 | Thumb should be spread away |
| Not tucked | distance(tip, indexTip) > 0.08 | Not hidden against other fingers |

**Thumb is counted if 2+ conditions pass**

---

## Landmark Points

MediaPipe provides 21 hand landmarks:

```
0: Wrist
1-4: Thumb (CMC, MCP, IP, TIP)
5-8: Index (MCP, PIP, DIP, TIP)
9-12: Middle (MCP, PIP, DIP, TIP)
13-16: Ring (MCP, PIP, DIP, TIP)
17-20: Pinky (MCP, PIP, DIP, TIP)
```

### Finger Pairs for Counting

| Finger | Tip | PIP |
|--------|-----|-----|
| Index | 8 | 6 |
| Middle | 12 | 10 |
| Ring | 16 | 14 |
| Pinky | 20 | 18 |

---

## Palm Center Calculation

The palm center is calculated as the average of 5 points for stability:

```typescript
palmPoints = [wrist, indexMCP, middleMCP, ringMCP, pinkyMCP]
palmCenter = average(palmPoints)
```

This provides a stable reference even when the hand rotates.

---

## Distance Thresholds

| Threshold | Value | Purpose |
|-----------|-------|---------|
| PIP distance bonus | 0.07 | Added to wrist-PIP distance for "further" check |
| Thumb fold | 0.03 | Max tip-IP distance for folded thumb |
| Thumb spread | 0.15 | Min distance from index MCP for spread |
| Thumb tuck | 0.08 | Min distance from index tip for not tucked |
| Palm multiplier | 0.8 | For thumb distance-from-palm check |

---

## Visual Design

### UI Elements

- **Camera Feed:** Full-screen or large video area
- **Number Display:** Large, prominent number showing count
- **Hand Overlay:** Skeleton showing detected landmarks
- **Feedback:** Celebration when holding specific numbers

### Color Scheme

| Element | Color |
|---------|-------|
| Background | Neutral/transparent |
| Number display | Bright, kid-friendly |
| Landmarks | Colored by finger |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Hand detected | Welcome sound | None |
| Number shown | Speak the number | None |
| Count change | Pop/click sound | None |
| Milestone (5, 10, etc.) | Celebration | 'celebration' |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Game start | "Show me your fingers! Hold up your hand!" |
| Count detected | "That's {number} fingers!" |
| No hand | "I can't see your hand. Try moving closer!" |
| Perfect count | "Great job! You showed {number} fingers!" |

---

## Game Constants

```typescript
const PIP_DISTANCE_THRESHOLD = 0.07;       // For "further" check
const THUMB_FOLD_THRESHOLD = 0.03;         // Max tip-IP distance for folded
const THUMB_SPREAD_THRESHOLD = 0.15;       // Min distance from index MCP
const THUMB_TUCK_THRESHOLD = 0.08;         // Min distance from index tip
const PALM_CENTER_MULTIPLIER = 0.8;        // For thumb distance check
const THUMB_MIN_CONDITIONS = 2;            // Conditions needed to count thumb
```

---

## Number Recognition Scenarios

| Number | Extended Fingers |
|--------|------------------|
| 0 | Fist (no extended fingers) |
| 1 | Thumb only |
| 1 | Index only |
| 2 | Index + Middle |
| 2 | Thumb + Index |
| 3 | Index + Middle + Ring |
| 4 | All except thumb |
| 5 | All fingers (open hand) |

---

## Edge Cases Handled

| Case | Handling |
|------|----------|
| Rotated hand | Uses palm center + distance fallback |
| Sideways hand | "Further" heuristic works when "up" fails |
| Kids' small hands | Multiple thumb heuristics for reliability |
| Folded thumb | Quick fold check before extended detection |
| Tucked thumb | Distance-from-index-tip check |
| Partial occlusion | Requires visible landmarks (graceful degradation) |

---

## Technical Details

### Input

```typescript
interface Point {
  x: number;  // Normalized 0-1
  y: number;  // Normalized 0-1
}

interface Landmarks {
  [key: number]: Point;  // 21 landmarks
}
```

### Output

```typescript
function countExtendedFingersFromLandmarks(landmarks: Point[]): number {
  // Returns 0-5
}
```

---

## Comparison with Similar Games

| Feature | FingerNumberShow | YogaAnimals | MirrorDraw |
|---------|------------------|-------------|------------|
| CV Required | Hand (landmarks) | Pose (full body) | Hand (draw) |
| Core Mechanic | Count fingers | Match poses | Mirror symmetry |
| Educational Focus | Counting, numbers | Body awareness | Symmetry |
| Output | Number (0-5) | Match score | Mirrored drawing |
| Age Range | 3-7 | 4-10 | 4-10 |
| Complexity | Low | Medium | Medium |

---

## Educational Value

### Skills Developed

1. **Number Recognition** - Connecting physical count to numeral
2. **One-to-One Correspondence** - Each finger equals one count
3. **Gross Motor Skills** - Hand extension, finger isolation
4. **Spatial Awareness** - Understanding hand position in space
5. **Proprioception** - Sensing finger position without looking
6. **Counting Practice** - Verbal counting along with visual

---

## Extensions & Variations

### Number Challenges

- **Show me 3:** Child must hold up exactly 3 fingers
- **Show me more than 2:** Child must hold up 3-5 fingers
- **Show me less than 4:** Child must hold up 0-3 fingers

### Two-Hand Mode

- **Count both hands:** Sum of fingers from both hands (0-10)
- **Different numbers:** Left hand shows one number, right shows another

### Math Operations

- **Addition:** "Show me 2 + 3" (hold up 2 on one hand, 3 on other)
- **Subtraction:** "Show me 5 - 2" (start with 5, put down 2)

---

## Accessibility

- **No fine motor required:** Whole hand movement is sufficient
- **Minimal instruction:** "Hold up your hand" is intuitive
- **Visual + audio:** Number spoken aloud as well as displayed
- **Forgiving detection:** Multiple heuristics handle various hand poses
- **No time pressure:** Child can take time to form numbers
