# Input Methods Specification

**Version**: 1.0  
**Last Updated**: 2026-02-01  
**Status**: ACTIVE SPECIFICATION

---

## Overview

Advay Vision Learning is a **gesture-based learning app** using MediaPipe and computer vision. All games MUST support camera-based hand tracking as the primary input method, with fallback support for accessibility.

**Core Principle**: Every game uses the camera. No game should be mouse/touch-only.

---

## The 6 Input Methods

### Camera-Based Modes (Primary - 4 Methods)

#### Mode A: Button Toggle

**Status**: ✅ IMPLEMENTED (TCK-20260128-009, TCK-20260201-012)

**Description**: User clicks a UI button to start/stop drawing/interaction.

**Implementation**:

- Large "Start Drawing" / "Stop Drawing" button
- Toggle state controls `isDrawing` boolean
- Works with hand cursor or mouse

**Games**:

- AlphabetGame: ✅ Implemented
- FingerNumberShow: ✅ Start/Stop buttons toggle camera-based interaction
- LetterHunt: ⚠️ Mouse fallback toggle (no dedicated draw toggle)
- ConnectTheDots: ✅ Implemented (as hand tracking toggle)

**Pros**: Simple mentally; works without gesture recognition
**Cons**: Requires clicking without breaking flow

---

#### Mode B: Pinch to Draw

**Status**: ✅ IMPLEMENTED (TCK-20260128-010, TCK-20260201-012)

**Description**: User pinches thumb tip + index finger tip together to activate drawing/interaction.

**Implementation**:

- Detect landmarks 4 (thumb tip) and 8 (index finger tip)
- Calculate Euclidean distance
- Start threshold: 0.05 (5% of frame)
- Release threshold: 0.07 (hysteresis prevents flickering)
- Visual feedback: cursor changes color/size when pinching

**Games**:

- AlphabetGame: ✅ Implemented
- FingerNumberShow: ❌ Not applicable (finger count recognition, no pinch interaction)
- LetterHunt: ✅ Implemented (pinch to select)
- ConnectTheDots: ✅ Implemented

**Pros**: Natural gesture; no UI needed
**Cons**: Requires good detection; threshold tuning for kids

**Reference**: `src/frontend/src/utils/pinchDetection.ts`

---

#### Mode C: Dwell to Toggle

**Status**: ❌ NOT IMPLEMENTED (Planned)

**Description**: User hovers hand cursor over a control area for 0.5-1.0 seconds to toggle drawing mode.

**Specification** (from GAME_MECHANICS.md):

- Dwell time: 0.5-1.0 seconds
- Visual countdown indicator (circular progress)
- No click required
- Requires stable cursor position

**Games**:

- AlphabetGame: ❌ Not implemented
- FingerNumberShow: ❌ Not implemented
- LetterHunt: ❌ Not implemented
- ConnectTheDots: ❌ Not implemented

**Pros**: Touchless; good for accessibility
**Cons**: Needs stable hand; may trigger accidentally

**Next Ticket**: Create implementation plan for Mode C

---

#### Mode D: Two-Handed Control

**Status**: ❌ NOT IMPLEMENTED (Planned)

**Description**: One hand controls the cursor, the other hand's pose (open/closed fist) starts/stops drawing.

**Specification** (from GAME_MECHANICS.md):

- Primary hand: cursor control (index finger tip)
- Secondary hand: open palm = draw, closed fist = stop
- Separates "control" from "drawing" action
- Requires 2 hands in frame

**Games**:

- AlphabetGame: ❌ Not implemented
- FingerNumberShow: ❌ Not implemented
- LetterHunt: ❌ Not implemented
- ConnectTheDots: ❌ Not implemented

**Pros**: Separates concerns; intuitive for some kids
**Cons**: Requires both hands visible; more complex

**Next Ticket**: Create implementation plan for Mode D

---

### Touch/Mouse Fallback Modes (Accessibility - 2 Methods)

#### Method E: Mouse Click

**Status**: ✅ IMPLEMENTED (All games)

**Description**: Traditional mouse/trackpad clicking when camera unavailable or denied.

**Implementation**:

- onClick handlers on interactive elements
- Canvas coordinate mapping (CSS pixels → canvas pixels)
- Always available as fallback

**Games**:

- AlphabetGame: ✅ Available
- FingerNumberShow: ✅ Available
- LetterHunt: ✅ Available
- ConnectTheDots: ✅ Available

**Use Case**: Camera permission denied, hardware issues, accessibility needs

---

#### Method F: Touch Gestures

**Status**: ⚠️ PARTIALLY IMPLEMENTED

**Description**: Touch screen tap, drag, and hold gestures on mobile/tablet devices.

**Implementation**:

- onTouchStart, onTouchMove, onTouchEnd handlers
- Multi-touch support for advanced interactions
- Gesture recognition (tap, drag, pinch-to-zoom)

**Games**:

- AlphabetGame: ⚠️ Basic touch support (needs verification)
- FingerNumberShow: ⚠️ Basic touch support (needs verification)
- LetterHunt: ⚠️ Basic touch support (needs verification)
- ConnectTheDots: ⚠️ Basic touch support (needs verification)

**Use Case**: Mobile/tablet devices, camera not practical on device

**Next Ticket**: Audit and enhance touch gesture support across all games

---

## Implementation Status Matrix

| Game             | Mode A (Button) | Mode B (Pinch) | Mode C (Dwell) | Mode D (Two-hand) | Method E (Mouse) | Method F (Touch) |
| ---------------- | --------------- | -------------- | -------------- | ----------------- | ---------------- | ---------------- |
| AlphabetGame     | ✅              | ✅             | ❌             | ❌                | ✅               | ⚠️               |
| FingerNumberShow | ✅              | ❌             | ❌             | ❌                | ✅               | ⚠️               |
| LetterHunt       | ⚠️              | ✅             | ❌             | ❌                | ✅               | ⚠️               |
| ConnectTheDots   | ✅              | ✅             | ❌             | ❌                | ✅               | ⚠️               |

**Legend**:

- ✅ Implemented and verified
- ⚠️ Partially implemented / needs verification
- ❓ Implementation status unknown
- ❌ Not implemented

---

## Architecture Requirements

### Camera Integration Checklist

Every game MUST have:

1. **useHandTracking hook integration**
   - Import from `src/frontend/src/hooks/useHandTracking.ts`
   - Initialize with appropriate config (numHands, confidence thresholds)
   - Enable GPU with CPU fallback

2. **Camera permission handling**
   - Check permission state on mount
   - Show warning when denied
   - Provide clear messaging about fallback modes

3. **Webcam component**
   - Import from `react-webcam`
   - Mirrored display for natural hand-eye coordination
   - Hidden (opacity-0) but accessible for detection

4. **Hand tracking loop**
   - requestAnimationFrame for real-time updates
   - Landmark detection (21 points per hand)
   - Coordinate mapping (video → canvas/screen)

5. **Visual feedback**
   - Hand cursor showing current position
   - Visual indicators for gestures (pinch, dwell countdown)
   - Mode indicators (which input method active)

6. **Fallback support**
   - Mouse/click always functional
   - Touch gestures on mobile
   - Clear indication of active mode

---

## Implementation Priority

### Phase 1 (COMPLETE - Feb 2026)

- ✅ Mode A (Button Toggle) - TCK-20260128-009
- ✅ Mode B (Pinch Gesture) - TCK-20260128-010
- ✅ ConnectTheDots camera integration - TCK-20260201-012

### Phase 2 (NEXT - High Priority)

- ❌ Audit FingerNumberShow and LetterHunt for Modes A & B
- ❌ Implement Mode C (Dwell) across all 4 games
- ❌ Implement Mode D (Two-handed) across all 4 games

### Phase 3 (Medium Priority)

- ⚠️ Enhance touch gesture support (Method F)
- ⚠️ Add mode selector UI (let users choose preferred mode)
- ⚠️ User preference persistence (LocalStorage/backend)

### Phase 4 (Low Priority - Polish)

- Custom threshold tuning per age group
- Gesture training tutorial
- Analytics on mode usage patterns

---

## Technical Details

### Hand Landmarks Reference

MediaPipe provides 21 landmarks per hand (0-20):

**Key landmarks for gestures**:

- **4**: Thumb tip
- **8**: Index finger tip
- **12**: Middle finger tip
- **16**: Ring finger tip
- **20**: Pinky tip
- **0**: Wrist

**Reference**: [MediaPipe Hand Landmark Model](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)

### Coordinate Mapping

Camera → Canvas transformation:

```typescript
// Mirror X coordinate (webcam is mirrored)
const mirroredX = 1 - landmark.x;

// Map to canvas internal coordinates
const canvasX = mirroredX * canvas.width;
const canvasY = landmark.y * canvas.height;
```

### Pinch Detection Algorithm

```typescript
// Calculate distance between thumb tip (4) and index tip (8)
const distance = Math.sqrt(
  Math.pow(landmarks[4].x - landmarks[8].x, 2) +
    Math.pow(landmarks[4].y - landmarks[8].y, 2),
);

// Hysteresis prevents flickering
if (!isPinching && distance < START_THRESHOLD) {
  setIsPinching(true);
} else if (isPinching && distance > RELEASE_THRESHOLD) {
  setIsPinching(false);
}
```

**Thresholds**:

- Start: 0.05 (tighter - harder to start)
- Release: 0.07 (looser - easier to stop)
- This makes stopping more forgiving than starting

---

## Related Documentation

- [GAME_MECHANICS.md](GAME_MECHANICS.md) - Original interaction modes specification
- [ARCHITECTURE.md](ARCHITECTURE.md) - Overall system architecture
- [docs/plans/TCK-20260128-009-implementation-plan.md](plans/TCK-20260128-009-implementation-plan.md) - Mode A implementation
- [docs/plans/TCK-20260128-010-implementation-plan.md](plans/TCK-20260128-010-implementation-plan.md) - Mode B implementation
- [src/frontend/src/hooks/useHandTracking.ts](../src/frontend/src/hooks/useHandTracking.ts) - Hand tracking hook
- [src/frontend/src/utils/pinchDetection.ts](../src/frontend/src/utils/pinchDetection.ts) - Pinch detection utility

---

## Version History

| Version | Date       | Changes                                                                     |
| ------- | ---------- | --------------------------------------------------------------------------- |
| 1.0     | 2026-02-01 | Initial specification documenting 6 input methods and implementation status |

---

**Next Actions**:

1. Audit FingerNumberShow and LetterHunt for Mode A/B implementation status
2. Create tickets for Mode C (Dwell) and Mode D (Two-handed) implementation
3. Enhance touch gesture support across all games
4. Add mode selector UI to game settings
