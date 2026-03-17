# System Architecture

**Last Updated:** March 18, 2026  
**Scope:** Complete technical architecture for Learning for Kids platform

---

## Overview

Learning for Kids is a **React-based web application** with **computer vision** capabilities running entirely in the browser. The system uses **MediaPipe** for hand/face/pose tracking and provides an educational gaming experience through natural gestures.

### Design Principles

1. **Browser-First:** No backend required for core gameplay
2. **Privacy-First:** All CV processing happens locally
3. **Performance:** <150ms latency for interactions
4. **Accessibility:** Touch/mouse fallbacks for all CV interactions
5. **Extensibility:** Easy to add new games

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│   │   Game Pages    │  │  UI Components  │  │ CV Visualizers  │          │
│   │   (~140 games)  │  │  (Buttons, etc) │  │ (Cursor, etc)   │          │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               BUSINESS LOGIC LAYER                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│   │  Game Logic     │  │  State Stores   │  │  CV Processing  │          │
│   │  (Hooks)        │  │  (Zustand)     │  │  (Hooks)        │          │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              INFRASTRUCTURE LAYER                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│   │  MediaPipe      │  │  Utilities     │  │  Services      │          │
│   │  (CV Models)    │  │  (Helpers)     │  │  (API/Storage) │          │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
learning_for_kids/
├── src/
│   ├── frontend/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/       # React components
│   │   │   │   ├── game/         # Game-specific components
│   │   │   │   │   ├── KenneyHandCursor.tsx
│   │   │   │   │   ├── GlobalCVCursor.tsx      # Quick fix for CV buttons
│   │   │   │   │   ├── GameCanvas.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── ui/           # UI components
│   │   │   │   │   ├── VisionButton.tsx      # CV-controllable button
│   │   │   │   │   ├── KenneyButton.tsx
│   │   │   │   │   └── ...
│   │   │   │   └── shared/       # Shared components
│   │   │   ├── context/          # React contexts
│   │   │   │   ├── SpatialInputContext.tsx  # Global cursor state
│   │   │   │   └── ...
│   │   │   ├── hooks/            # Custom hooks
│   │   │   │   ├── useGameHandTracking.ts   # Main hand tracking hook
│   │   │   │   ├── useHandTracking.ts
│   │   │   │   ├── useSpatialInput.ts       # Access cursor state
│   │   │   │   └── ...
│   │   │   ├── pages/            # Game pages (~140 games)
│   │   │   │   ├── AnimalSounds.tsx         # ✓ Has VisionButton
│   │   │   │   ├── AirGuitarHero.tsx        # ❌ Regular buttons
│   │   │   │   ├── FruitNinjaAir.tsx        # ❌ Regular buttons
│   │   │   │   └── ... (~140 more)
│   │   │   ├── utils/            # Utilities
│   │   │   │   ├── coordinateTransform.ts   # Landmark → Screen
│   │   │   │   ├── pinchDetection.ts
│   │   │   │   └── ...
│   │   │   ├── styles/           # CSS styles
│   │   │   │   ├── cv-cursor.css          # CV cursor styles
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── ...
│   └── backend/                  # Node.js backend (if any)
├── docs/                       # Documentation
│   ├── README.md                 # Master index
│   ├── PROJECT_OVERVIEW.md
│   ├── ARCHITECTURE.md           # This file
│   ├── BUTTON_CV_AUDIT_AND_MIGRATION_PLAN.md
│   ├── GLOBAL_CV_CURSOR_QUICK_FIX.md
│   ├── VISION_STACK_ARCHITECTURE_2026-03-18.md
│   └── ...
└── ...
```

---

## Key Components

### 1. Hand Tracking System

**Primary Hook:** `useGameHandTracking`

```typescript
const {
  isReady,           // MediaPipe loaded?
  startTracking,     // Start camera + tracking
  stopTracking,      // Stop tracking
  cursor,            // { position, isActive, isPinching }
} = useGameHandTracking({
  gameName: 'MyGame',
  targetFps: 30,
});
```

**Architecture:**
```
Webcam
  ↓
MediaPipe HandLandmarker (WASM/WebGL)
  ↓
Landmark Results (21 points, normalized 0-1)
  ↓
useGameHandTracking Hook
  ↓
  ├─── Extract index finger tip (landmark 8)
  ├─── Apply smoothing (One-Euro filter)
  ├─── Detect pinch (thumb + index distance)
  └─── Convert to screen coordinates
  ↓
SpatialInputContext (Global state)
  ↓
Components subscribe to cursor position
```

---

### 2. Button Control System

**The Problem:**
- Regular `<button>` elements don't respond to hand tracking
- 140+ games use regular buttons
- Kids can't navigate with hands

**Solution 1: Quick Fix (GlobalCVCursor)**
```
GlobalCVCursor component
  ↓
Renders hand cursor
  ↓
Uses document.elementFromPoint() to find element under cursor
  ↓
Checks if element is clickable (button, link, cursor:pointer)
  ↓
On pinch: simulates click event
  ↓
Element receives click ← Works with ALL existing buttons!
```

**Solution 2: Proper Solution (VisionButton)**
```tsx
// Replaces <button> with CV-aware button
<VisionButton
  onClick={handleClick}
  color="green"
  size="large"
  hitboxMultiplier={2.0}  // Larger hit area
>
  Click Me
</VisionButton>
```

**Architecture:**
```
VisionButton
  ↓
Subscribes to SpatialInputContext
  ↓
Hit-testing: Is cursor within button bounds?
  ↓
Yes → Add hover styling (scale, glow)
  ↓
Pinch detected? → Trigger onClick
```

---

### 3. State Management

**Zustand Stores:**

| Store | Purpose | Key Data |
|-------|---------|----------|
| `profileStore` | User profiles | Current child, settings |
| `progressStore` | Learning progress | Scores, achievements |
| `gameStore` | Game state | Current game, level |
| `spatialInput` | CV cursor | Position, pinch state |

**Context:**
- `SpatialInputContext` - Global cursor state (CV-specific)

---

## Data Flow

### Hand Tracking Flow

```
1. User moves hand
        ↓
2. Webcam captures frame
        ↓
3. MediaPipe processes frame
   - Detects 21 hand landmarks
   - Returns normalized coordinates (0-1)
        ↓
4. useGameHandTracking hook
   - Extracts index finger (landmark 8)
   - Applies smoothing filter
   - Converts to screen pixels
   - Detects pinch gesture
        ↓
5. Updates SpatialInputContext
        ↓
6. Components re-render
   - KenneyHandCursor moves
   - VisionButton checks hover
   - Game checks interactions
```

### Button Click Flow

```
1. User pinches fingers
        ↓
2. useGameHandTracking detects pinch
   - Thumb tip + index tip distance < threshold
        ↓
3. SpatialInputContext updates
   - isPinching = true
        ↓
4. VisionButton detects change
   - Was not pinching → Now pinching
   - Cursor is over button
        ↓
5. Triggers onClick handler
        ↓
6. Game logic executes
```

---

## Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI framework | 18.x |
| TypeScript | Type safety | 5.x |
| Vite | Build tool | 5.x |
| Tailwind CSS | Styling | 3.x |
| Framer Motion | Animations | 10.x |
| Zustand | State management | 4.x |

### Computer Vision
| Technology | Purpose | License |
|------------|---------|---------|
| MediaPipe Hands | Hand tracking | Apache-2.0 |
| MediaPipe Face | Face tracking | Apache-2.0 |
| MediaPipe Pose | Pose tracking | Apache-2.0 |
| TensorFlow.js | ML runtime | Apache-2.0 |

### Backend (Optional)
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | API framework |
| PostgreSQL | Database |

---

## Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Hand tracking FPS | >20 | ? | Need benchmark |
| Interaction latency | <150ms | ? | Need benchmark |
| Model load time | <3s | ~2s | ✓ Good |
| Initial bundle | <5MB | ? | Need audit |
| Memory usage | <200MB | ? | Need profiling |

---

## Security Considerations

### Privacy
- ✅ All CV processing happens locally in browser
- ✅ No video sent to servers
- ✅ No biometric data stored
- ✅ Camera access only during gameplay

### Data
- User progress stored in PostgreSQL
- PII minimized (only first name, age)
- GDPR-compliant data handling

---

## Scalability

### Current Scale
- ~140 games
- Single developer (primarily)
- Browser-only deployment

### Future Scale
- More games (200+)
- Mobile apps (React Native)
- Multiplayer features
- Cloud processing (optional)

---

## Deployment

### Current
- Static hosting (Vercel/Netlify)
- CDN for assets
- Optional backend for progress tracking

### Environments
- `localhost` - Development
- `staging` - Testing
- `production` - Live

---

## Documentation

Every component documented:
- JSDoc comments
- Usage examples
- Props interface
- Related files

Example:
```typescript
/**
 * VisionButton - A CV-ready button component
 * 
 * Wraps KenneyButton and adds spatial hit testing
 * for hand tracking interactions.
 * 
 * @example
 * <VisionButton 
 *   onClick={handleClick}
 *   color="green"
 *   hitboxMultiplier={2.0}
 * >
 *   Click Me
 * </VisionButton>
 * 
 * @see docs/GLOBAL_CV_CURSOR_QUICK_FIX.md
 */
```

---

## Architecture Decisions

### 1. Why MediaPipe?
- **Pros:** Browser-native, fast, accurate, free (Apache-2.0)
- **Cons:** Google's ecosystem, limited customization
- **Alternative:** Handtrack.js (slower), custom models (expensive)

### 2. Why React + TypeScript?
- **Pros:** Type safety, component reusability, large ecosystem
- **Cons:** Bundle size, learning curve
- **Alternative:** Vanilla JS (too complex for this scale)

### 3. Why Zustand over Redux?
- **Pros:** Simpler, less boilerplate, good TypeScript support
- **Cons:** Less ecosystem, smaller community
- **Alternative:** Redux (overkill), Context (performance issues)

### 4. Why Browser-First?
- **Pros:** No install, instant access, easy updates
- **Cons:** Performance limits, offline issues
- **Alternative:** Native apps (longer dev cycle)

---

## Future Architecture (Phase 2+)

### Object Detection (RF-DETR)
```
Webcam → RF-DETR model (local) → Object bounding boxes
Use case: "Find the red ball" games
```

### Segmentation (MobileSAM)
```
Webcam → MobileSAM model (local) → Pixel masks
Use case: Cutout stickers, background removal
```

### Semantic Understanding (Moondream 2)
```
Image → Moondream 2 API/local → Text description
Use case: "What are you holding?" questions
```

---

## Contact

- **Tech Lead:** [Name]
- **Architecture Questions:** #architecture channel
- **Documentation:** This folder (`/docs`)

---

**Last Updated:** March 18, 2026  
**Next Review:** April 2026
