# Research Priority: Device Compatibility Matrix

**Selected Research Area**: Device Compatibility Matrix  
**Date**: 2026-02-23  
**Rationale**: This document explains why Device Compatibility Matrix is the highest-priority research area.

---

## Why This Research Area?

### Critical Path Dependency

All other research and development depends on the app actually working:

```
Device Compatibility
        ↓
    [If fails here, nothing else matters]
        ↓
    User Acquisition → Learning Outcomes → Monetization
```

### Evidence from Game Analysis

During multi-perspective analysis of 27 games, **every game** uses:

- Webcam input (MediaPipe)
- Real-time processing (60fps target)
- Browser APIs (getUserMedia, canvas)

This creates a **hard dependency** on device/browser capability.

---

## Research Questions

### Primary Questions

| Question                                        | Why It Matters                     |
| ----------------------------------------------- | ---------------------------------- |
| Which browsers support MediaPipe hand tracking? | Chrome vs Safari differences       |
| What CPU/GPU is required for 60fps?             | Sets minimum hardware requirements |
| Does it work on iOS Safari?                     | Major platform for kids            |
| What resolution/camera quality needed?          | Affects tracking accuracy          |

### Secondary Questions

| Question                             | Why It Matters         |
| ------------------------------------ | ---------------------- |
| Does it work on low-end Chromebooks? | Common school devices  |
| What about tablets vs phones?        | Different form factors |
| VPN/corporate network impacts?       | Enterprise deployment  |

---

## Testing Methodology

### Test Matrix

| Device Type     | OS       | Browser | Camera   | Expected Result    |
| --------------- | -------- | ------- | -------- | ------------------ |
| Desktop Mac     | macOS    | Chrome  | Built-in | ✅ Full support    |
| Desktop Mac     | macOS    | Safari  | Built-in | ⚠️ Partial         |
| Desktop Windows | Windows  | Chrome  | USB      | ✅ Full support    |
| Desktop Windows | Windows  | Edge    | USB      | ✅ Full support    |
| iPad Pro        | iPadOS   | Safari  | Built-in | ⚠️ Performance TBD |
| iPhone 14+      | iOS      | Safari  | Built-in | ⚠️ Performance TBD |
| Android Tablet  | Android  | Chrome  | Built-in | ✅ Full support    |
| Chromebook      | ChromeOS | Chrome  | Built-in | ⚠️ Performance TBD |

### Metrics to Capture

| Metric              | Target | Why                   |
| ------------------- | ------ | --------------------- |
| Frame rate          | 60fps  | Smooth tracking       |
| Tracking latency    | <100ms | Responsive feel       |
| CPU usage           | <50%   | Doesn't drain battery |
| Memory              | <500MB | Doesn't crash         |
| Initialization time | <3s    | User patience         |

---

## Risk Assessment

### High Risk Items

| Risk                   | Impact | Mitigation                              |
| ---------------------- | ------ | --------------------------------------- |
| iOS Safari performance | HIGH   | Progressive enhancement, fallback modes |
| Low-end device support | MEDIUM | Minimum requirements doc                |
| Camera permission UX   | HIGH   | Clear instructions                      |

### Mitigation Strategy

1. **Tiered Experience**
   - Gold: Desktop Chrome - full features
   - Silver: Mobile Chrome, Edge - reduced effects
   - Bronze: Safari - basic functionality

2. **Device Detection**
   - Detect capability on load
   - Show appropriate experience
   - Don't crash on unsupported

---

## Deliverables

### Expected Outputs

1. **Device Matrix** - Full test results by device/browser
2. **Minimum Requirements** - Documented specs
3. **Feature Flags** - Code to enable/disable by capability
4. **Detection Library** - Helper to check support

---

## Priority Justification Summary

| Factor      | Score | Reasoning               |
| ----------- | ----- | ----------------------- |
| Urgency     | 10    | Must work before launch |
| Impact      | 10    | Affects all users       |
| Feasibility | 8     | Can test in 1 week      |
| Dependency  | 10    | Blocks all other work   |

**Selected because**: It's the foundation everything else builds upon. If hand tracking doesn't work, the entire value proposition fails.

---

_Documented: 2026-02-23_
