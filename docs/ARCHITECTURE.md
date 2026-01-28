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

**Technology**: Python 3.11+ + FastAPI

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
