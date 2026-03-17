# Project Overview - Learning for Kids (Advay)

**Project Name:** Learning for Kids / Advay  
**Type:** AI-powered educational gaming platform  
**Target Users:** Children ages 3-8  
**Primary Interaction:** Hand tracking / computer vision  
**Status:** Active development (March 2026)

---

## What is This Project?

Learning for Kids is an **AI-powered educational gaming platform** where children learn through **natural hand gestures and body movements** rather than traditional touch or keyboard controls.

### Core Value Proposition

**"Learn with your hands, not just your eyes"**

Instead of tapping on screens, kids:
- 👆 Point at answers with their finger
- 🤜 Trace letters in the air
- 💃 Dance to match poses
- ✌️ Count with their fingers
- 🤚 Grab and move objects virtually

### Why This Matters

Traditional educational apps:
- ❌ Passive consumption (watch and tap)
- ❌ Limited physical engagement
- ❌ Abstract interactions (button = action)

Our approach:
- ✅ Active physical participation
- ✅ Kinesthetic learning (learning by doing)
- ✅ Natural interactions (like real world)
- ✅ Multi-sensory engagement

---

## Key Features

### 1. Hand Tracking Games

| Game | Skill | Interaction |
|------|-------|-------------|
| **Air Tap** | Letters/Numbers | Point and tap in air |
| **Finger Count** | Math | Show fingers to count |
| **Pose Match** | Body awareness | Copy body poses |
| **Trace Letters** | Writing | Trace in air with finger |
| **Grab & Sort** | Categories | Virtual grab and move |

### 2. AI-Powered Adaptation

- Difficulty adjusts based on performance
- Content personalizes to child's level
- Real-time feedback and encouragement
- Progress tracking across all games

### 3. Multi-Modal Learning

- Visual (colors, shapes, animations)
- Auditory (instructions, sounds, music)
- Kinesthetic (body movement)
- Cognitive (problem solving)

---

## Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Animation:** Framer Motion

### Computer Vision
- **Hand Tracking:** MediaPipe Hands (21 landmarks)
- **Face Tracking:** MediaPipe Face (468 landmarks)
- **Pose Tracking:** MediaPipe Pose (33 landmarks)
- **Runtime:** TensorFlow.js + WebGL

### Backend
- **API:** Node.js + Express
- **Database:** PostgreSQL
- **Auth:** Custom JWT
- **Storage:** AWS S3

### AI/ML
- **Models:** MediaPipe Tasks Vision
- **Future:** RF-DETR (object detection), MobileSAM (segmentation)

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                           BROWSER (React App)                           │
├───────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐     │
│   │  Game Components   │  │  CV Components    │  │  UI Components    │     │
│   │  (Game logic)      │  │  (Hand tracking)  │  │  (Buttons, etc.)  │     │
│   └────────────────────┘  └────────────────────┘  └────────────────────┘     │
│            │                 │                 │                      │
│            └───────────────┼───────────────┘                      │
│                          │                                           │
│               ┌─────────────┴─────────────┐                               │
│               │   State Management (Zustand)   │                               │
│               ├──────────────────────────┤                               │
│               │   - SpatialInputContext        │                               │
│               │   - Game state                 │                               │
│               │   - Progress tracking          │                               │
│               └──────────────────────────┘                               │
│                                                                         │
└───────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────┐
│                          BACKEND (Node.js)                             │
├───────────────────────────────────────────────────────────────┤
│   REST API → PostgreSQL → Progress Tracking → User Profiles           │
└───────────────────────────────────────────────────────────────┘
```

---

## Game Catalog

### Current Games (~140 total)

**Category: Literacy**
- Letter Sound Match
- Alphabet Game
- Word Builder
- Letter Trace

**Category: Math**
- Finger Count
- Pattern Play
- Shape Safari
- Color Sort
- Counting Collectathon

**Category: Motor Skills**
- Air Guitar Hero
- Dance Freeze
- Balance Beam
- Bubble Pop Symphony

**Category: Science**
- Animal Sounds
- Color Mixing
- Circuit Builder
- Bubble Biology

**Category: Art & Creativity**
- Air Canvas
- Kaleidoscope Hands
- Color Potions
- Circle Drawing

**Full list:** [GAME_IDEAS_CATALOG.md](./GAME_IDEAS_CATALOG.md)

---

## Current Challenges

### 1. Button CV Control Gap (🚨 CRITICAL)

**Problem:** 99% of games use regular buttons that don't work with hand tracking

**Impact:**
- Kids must switch to touch/mouse for buttons
- Breaks "hands-only" experience
- UX inconsistency

**Solution:**
- Quick fix: [GlobalCVCursor](./GLOBAL_CV_CURSOR_QUICK_FIX.md)
- Long-term: [Migration to VisionButton](./BUTTON_CV_AUDIT_AND_MIGRATION_PLAN.md)

**Status:** Documented, ready to implement

### 2. Performance Optimization

**Target:** <150ms latency for hand tracking

**Current:** Working but needs monitoring

**Action:** FPS benchmarking on target devices

### 3. Model Expansion

**Phase 2:** Add object detection (RF-DETR) for "find object" games

**Phase 3:** Add segmentation (MobileSAM) for sticker/cutout features

---

## Development Workflow

### 1. Feature Development
```
Research → Design → Prototype → Test → Implement → Review → Deploy
```

### 2. Game Development
```
Game Idea → Research → Spec → Assets → Code → Test → Iterate
```

### 3. Documentation
- Every feature documented
- Every game has spec
- Every API endpoint documented
- Updates tracked in worklogs

---

## Key Metrics

### Technical
- **Target FPS:** >20 (hand tracking)
- **Target Latency:** <150ms (interaction)
- **Model Load Time:** <3 seconds
- **Bundle Size:** <5MB (initial load)

### Business
- **Games:** ~140 implemented
- **Target Age:** 3-8 years
- **Platforms:** iPad, Android tablets, Web
- **Business Model:** Subscription

---

## Team Structure

### Current Roles
- **Tech Lead:** Architecture, code review
- **CV/ML Engineer:** Hand tracking, models
- **Frontend Developers:** Game implementation
- **UX Designer:** Game design, interactions
- **Product Manager:** Priorities, roadmap

### Communication
- **Daily:** Standup (async)
- **Weekly:** Sprint planning
- **Docs:** Everything in `/docs`

---

## Roadmap

### Q1 2026 (Current)
- ✅ Core hand tracking infrastructure
- ✅ ~140 games implemented
- ⏳ Fix button CV control (CRITICAL)
- ⏳ Performance optimization

### Q2 2026
- Add object detection (RF-DETR)
- Improve gesture recognition
- Parent dashboard
- Multiplayer features

### Q3 2026
- Add segmentation (MobileSAM)
- Semantic visual Q&A (Moondream 2)
- AI tutor features
- Expanded content library

---

## Getting Started

### New Developer?
1. Read [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Study [Game Development Guide](./games/GAME_DEVELOPMENT_GUIDE.md)
4. Check out [AnimalSounds.tsx](../src/pages/AnimalSounds.tsx) - Best reference

### New Product Manager?
1. Read this file
2. Review [GAME_IDEAS_CATALOG.md](./GAME_IDEAS_CATALOG.md)
3. Study [Research Documents](./research/)
4. Check [Vision & Strategy](./VISION_*.md) docs

---

## Important Documents

### Must Read
1. [Button CV Audit](./BUTTON_CV_AUDIT_AND_MIGRATION_PLAN.md) - Critical issue
2. [Vision Stack Architecture](./VISION_STACK_ARCHITECTURE_2026-03-18.md) - Model strategy
3. [Project Overview](./PROJECT_OVERVIEW.md) - This file

### Reference
- [API Guide](./API_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

---

## Contact

- **Slack:** #learning-for-kids
- **Docs:** All in `/docs` folder
- **Repo:** `learning_for_kids`
- **Status Dashboard:** [Link]

---

**Last Updated:** March 18, 2026
