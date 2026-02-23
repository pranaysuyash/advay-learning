# Research: Future Games & Device Requirements

**Date**: 2026-02-23  
**Context**: Looking at broader vision beyond current 27 games

---

## Vision Overview

The project aims to build **15-20 high-quality educational games** over 24 weeks using hand tracking technology:

### Current State (27 games implemented)

- Alphabet Tracing, Finger Number Show, Connect the Dots, Letter Hunt
- Freeze Dance, Yoga Animals, Simon Says, Emoji Match
- Bubble Pop, Shape Pop, Word Builder, Color Match Garden
- Mirror Draw, Music Pinch Beat, Number Tap Trail, Shape Sequence
- And more...

### Future Roadmap (Planned Games)

| Phase   | Games                                                                   | Timeline    |
| ------- | ----------------------------------------------------------------------- | ----------- |
| Phase 1 | Bubble Pop Symphony, Dress for Weather, Color Splash Garden             | Weeks 1-6   |
| Phase 2 | Diwali Diya Lighter, Shadow Puppets, Balloon Pop Fitness, Light Painter | Weeks 7-14  |
| Phase 3 | Underwater Adventure, Space Explorer, Sign Language Basics              | Weeks 15-24 |

---

## Device Requirements Analysis

### Current Games Technology Stack

All 27 current games use:

- Webcam input (MediaPipe)
- Real-time processing (60fps target)
- Browser APIs (getUserMedia, canvas)

### Future Games New Tech Requirements

| Planned Game         | New Tech Requirements                    |
| -------------------- | ---------------------------------------- |
| Diwali Diya Lighter  | Flame animations, Hindi voice-over       |
| Shadow Puppets       | Real-time silhouette rendering           |
| Balloon Pop Fitness  | Full body pose tracking (MediaPipe Pose) |
| Underwater Adventure | Parallax scrolling, collision detection  |
| Space Explorer       | Physics simulation, starfield rendering  |
| Sign Language Basics | Complex hand shape recognition           |

---

## Extended Device Test Matrix

| Device Type     | OS       | Browser | Hand Tracking      | Pose Tracking      | Expected Result    |
| --------------- | -------- | ------- | ------------------ | ------------------ | ------------------ |
| Desktop Mac     | macOS    | Chrome  | ✅                 | ✅                 | ✅ Full support    |
| Desktop Mac     | macOS    | Safari  | ⚠️ Partial         | ⚠️ Partial         | ⚠️ Partial         |
| Desktop Windows | Windows  | Chrome  | ✅                 | ✅                 | ✅ Full support    |
| Desktop Windows | Windows  | Edge    | ✅                 | ✅                 | ✅ Full support    |
| iPad Pro        | iPadOS   | Safari  | ⚠️ Performance TBD | ❌                 | ⚠️ Limited         |
| iPhone 14+      | iOS      | Safari  | ⚠️ Performance TBD | ❌                 | ⚠️ Limited         |
| Android Tablet  | Android  | Chrome  | ✅                 | ⚠️ Performance TBD | ✅ Full support    |
| Chromebook      | ChromeOS | Chrome  | ⚠️ Performance TBD | ❌                 | ⚠️ Performance TBD |

---

## Risk Assessment

### High Risk Items

| Risk                    | Impact | Mitigation                                  |
| ----------------------- | ------ | ------------------------------------------- |
| iOS Safari performance  | HIGH   | Progressive enhancement, fallback modes     |
| Low-end device support  | MEDIUM | Minimum requirements doc                    |
| Camera permission UX    | HIGH   | Clear instructions                          |
| Pose tracking on mobile | HIGH   | May require desktop-only for Phase 2+ games |

---

## Research Priorities

### Immediate (Before Launch)

1. **Device Compatibility** - Test current hand tracking on all target devices
2. **Browser Support** - Chrome vs Safari vs Edge differences

### Phase 2 Readiness (Weeks 7-14)

3. **Pose Tracking Performance** - Validate MediaPipe Pose works on target devices
4. **Shadow Puppets Feasibility** - Test silhouette rendering

### Phase 3 Readiness (Weeks 15-24)

5. **Physics Engine Performance** - Test Matter.js on mobile
6. **Complex Hand Shape Recognition** - Validate sign language accuracy

---

_Documented: 2026-02-23_
