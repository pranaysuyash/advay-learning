# System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Browser                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   React UI   │  │  TF.js/MP    │  │  Camera Access  │  │
│  │              │  │  (CV Client) │  │                 │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│         │                  │                    │           │
│         └──────────────────┴────────────────────┘           │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTPS/WSS
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                    FastAPI Backend                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  REST API   │  │  WebSocket   │  │  CV Processing   │  │
│  │  Endpoints  │  │  (Real-time) │  │  (Optional)      │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         └─────────────────┴────────────────────┘            │
│                           │                                 │
│         ┌─────────────────┴─────────────────┐              │
│         │                                   │              │
│  ┌──────▼────────┐  ┌──────────────┐  ┌───▼──────────┐   │
│  │  PostgreSQL   │  │  Redis Cache │  │  File Storage│   │
│  │  (User/Prog)  │  │  (Sessions)  │  │  (S3/Local)  │   │
│  └───────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Frontend (`src/frontend/`)

**Technology**: React 18 + TypeScript + Vite

**Key Libraries**:

- `@mediapipe/tasks-vision` - Hand/face tracking
- `@tensorflow/tfjs` - ML models
- `react-webcam` - Camera access
- `zustand` - State management
- `react-query` - Server state
- `tailwindcss` - Styling
- `framer-motion` - Animations

### Backend (`src/backend/`)

**Technology**: Python 3.13+ + FastAPI

**Key Components**:

- FastAPI for REST API
- SQLAlchemy 2.0 for ORM
- Alembic for migrations
- JWT for authentication
- OpenCV for CV processing

## Data Flow

### 1. Real-time Hand Tracking (Client-side)

```
Camera → MediaPipe → Hand Landmarks → Drawing Canvas
                                    → Gesture Recognition
                                    → API (save progress)
```

**Input Methods**: The app supports 6 input methods (4 camera-based, 2 fallback):

- Mode A: Button Toggle
- Mode B: Pinch Gesture
- Mode C: Dwell to Toggle (planned)
- Mode D: Two-Handed Control (planned)
- Method E: Mouse Click (fallback)
- Method F: Touch Gestures (fallback)

See [INPUT_METHODS_SPECIFICATION.md](INPUT_METHODS_SPECIFICATION.md) for complete details.

**Camera Integration**: All games use MediaPipe hand tracking as primary input.  
See [architecture/CAMERA_INTEGRATION_GUIDE.md](architecture/CAMERA_INTEGRATION_GUIDE.md) for implementation guide.

### 2. Progress Tracking

```
User Action → Frontend Event → API Request → Database → Parent Dashboard
```

## Security Architecture

### Authentication Flow

1. Parent registers → Email verification
2. Parent creates child profile(s)
3. Child accesses via PIN/simple auth
4. JWT tokens for API access
5. Refresh token rotation

### Data Protection

- Passwords: bcrypt hashing
- Tokens: JWT with HS256
- API: Rate limiting
- Camera: Explicit permission
- Storage: Encrypted at rest

## Related Architecture Documents

### Core Architecture

- [Game Architecture Principles](architecture/GAME_ARCHITECTURE_PRINCIPLES.md) - **KEY READ**
  - No "main game" philosophy (all games are equal peers)
  - Shared infrastructure principles
  - Centralized services architecture
  
- [Hand Tracking Architecture](architecture/HAND_TRACKING_ARCHITECTURE.md) - **KEY READ**
  - Centralized hand tracking service
  - Migration from decentralized implementations
  - Hand data standard and coordinate system
  - Gesture detection (future)
  - Fallback strategies

- [Camera Integration Guide](architecture/CAMERA_INTEGRATION_GUIDE.md)
  - MediaPipe integration details
  - Camera permission handling
  - Video processing pipeline

- [Input Methods Specification](INPUT_METHODS_SPECIFICATION.md)
  - 6 input methods (4 camera-based, 2 fallback)
  - Mode selection and switching
  - Accessibility considerations

### Vision & Strategy

- [Complete Body Interaction Vision](../COMPLETE_BODY_INTERACTION_VISION.md) - Future vision
- [UI/UX Reality Check](../UI_UX_REALITY_CHECK.md) - Current gaps assessment
- [Spatial Gesture UI Concept](../ui/CONCEPT_spatial_gesture_ui.md) - Future UI concept

---

**Document Version:** 1.1  
**Last Updated:** 2026-02-05
