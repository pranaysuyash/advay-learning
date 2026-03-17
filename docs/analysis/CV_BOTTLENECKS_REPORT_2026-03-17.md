# Analysis: MediaPipe/CV Integration Bottlenecks

**Date**: 2026-03-17  
**Author**: Antigravity  
**Goal**: Identify all bottlenecks for migrating all games to CV-primary interaction.

---

## 1. Executive Summary

While the platform has a robust foundation for hand tracking (`useGameHandTracking`), a significant portion of the game catalog (~43%) remains `POINTER_PRIMARY`. The primary bottlenecks are not just technical performance, but **architectural coupling** between game logic and standard DOM event handlers (`onClick`, `onPointerDown`), and a lack of **Unified Spatial Interaction Components**.

---

## 2. Quantitative Status

Based on `CONTROL_MODE_AUDIT_2026-03-12.md` and registry scans:

| Mode | Count | Status |
|------|-------|--------|
| **CV_PRIMARY** | ~45 | High quality, uses `useGameHandTracking` |
| **HYBRID** | ~19 | CV cursor + pointer fallback |
| **POINTER_PRIMARY** | ~49 | **Bottleneck Zone**: Requires full interaction refactor |

---

## 3. High-Level Bottlenecks

### A. Architectural: DOM-Centric Logic
Most `POINTER_PRIMARY` games (e.g., `AnimalSounds`, `BodyParts`) use standard HTML elements like `<button>` or custom `div`s with `onClick` handlers.
- **Problem**: MediaPipe hand/pose signals do not trigger DOM `click` events.
- **Impact**: Migrating a game requires stripping `onClick` and implementing a spatial collision system (like `TargetSystem`), which is a 50-80% rewrite of the interaction layer.

### B. Component: Lack of "Vision-Ready" UI
The standard design system components (`KenneyButton`, `GameStartButton`) are pointers-only.
- **Problem**: There is no `VisionButton` component that automatically creates a spatial hitbox and listens for "pinch-to-click" or "hover-to-select".
- **Impact**: Every game developer re-invents spatial hitboxes, leading to inconsistent interaction "feel".

### C. Technical: Asymmetric Trackers
- **Hand Tracking**: Sophisticated, runs in a web worker, smoothed with One-Euro filters.
- **Pose/Face Tracking**: Simple, runs on the main thread, lacks smoothing and advanced "Runtime" lifecycle management.
- **Impact**: Face/Pose-driven games (like `Namaste Detective` or `Head Wobble`) will feel "jittery" compared to hand-driven games.

### D. Performance: CDN Dependency
All models are loaded from `https://storage.googleapis.com/...` via `visionService`.
- **Problem**: High latency in initial load; session fails if CDN is unreachable.
- **Solution**: Needs "Local Model Hosting" to ensure 100% availability.

### E. Environment: Detection Loss
Toddler environments (low light, sibling interference, messy backgrounds) cause "Detection Jitter".
- **Problem**: Most games lack a standardized "Detection Lost" UI/UX pattern (e.g., "Wait, where did your hand go?" popups).
- **Impact**: Games crash or freeze when tracking is lost, frustrating young users.

---

## 4. Specific Interaction Bottlenecks

### The "Drag-and-Drop" Wall
Games like `WordBuilder` involve complex drag-and-drop. While `DragDropSystem.tsx` exists, its audit revealed:
- Duplicate hit detection logic.
- Stale closures in event handlers.
- Lack of return-to-home animations.
- No unified "Hand Grab" visual state.

### The "Small Target" Problem
Children have higher hand tremor. Many games use small buttons.
- **Constraint**: `CV_PRIMARY` requires targets to be 15-20% of screen width.
- **Conflict**: Complex games (e.g., 20+ alphabet tiles) cannot fit 20% size targets on mobile screens.

---

## 5. Recommendation Roadmap

1.  **Create `SpatialInputProvider`**: A top-level context that maps CV signals to virtual "Clicks" and "Drags" across the DOM.
2.  **Standardize `VisionButton`**: Wrap current pointer buttons in a spatial hitbox layer.
3.  **Upgrade Pose/Face Hooks**: Move them to Web Workers to match the Hand Tracking performance.
4.  **Local Model Caching**: Bundle MediaPipe models in the production build.
5.  **Standardize "Detection UI"**: Create a reusable `CameraOverlay` component for all games to handle "No Hand Detected" states.

---

*Verified against `gameRegistry.ts`, `useGameHandTracking.ts`, and `TargetSystem.tsx`.*
