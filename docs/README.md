# Learning for Kids (Advay) - Complete Documentation Index

**Last Updated:** March 18, 2026  
**Project:** Learning for Kids - AI-powered educational games  
**Status:** Active Development

---

## Quick Navigation

### For New Team Members
1. Start here: [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) *(create this)*
2. Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md) *(create this)*
3. Setup: [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) *(create this)*

### For Developers
- [API Documentation](./api/) - Backend API endpoints
- [Frontend Guide](./frontend/) - React components and hooks
- [Game Development](./games/) - How to build new games
- [CV/Hand Tracking](./vision/) - Computer vision integration

### For Product Managers
- [Game Catalog](./GAME_IDEAS_CATALOG.md) - All games and features
- [Research Documents](./research/) - User research and findings
- [Vision & Strategy](./VISION_*.md) - Product direction

### Current Priorities (March 2026)
1. **[CRITICAL]** [Button CV Control](./BUTTON_CV_AUDIT_AND_MIGRATION_PLAN.md) - Most games lack CV button support
2. **[HIGH]** [Vision Stack Architecture](./VISION_STACK_ARCHITECTURE_2026-03-18.md) - Model selection and deployment
3. **[MEDIUM]** [Performance Optimization](./performance/) - Latency and FPS improvements

---

## Documentation Structure

```
docs/
├── README.md                          # This file - master index
├── PROJECT_OVERVIEW.md                # Project summary, goals, team
├── ARCHITECTURE.md                    # System architecture, tech stack
├── DEVELOPMENT_SETUP.md               # How to set up dev environment
├── DEPLOYMENT.md                      # How to deploy to production
├── API_GUIDE.md                       # API documentation
├── TESTING_GUIDE.md                   # How to test, QA processes
├── CONTRIBUTING.md                    # How to contribute code
├── SECURITY.md                        # Security practices
├── TROUBLESHOOTING.md                 # Common issues and fixes
├──
├── # === CRITICAL ISSUES ===
├── BUTTON_CV_AUDIT_AND_MIGRATION_PLAN.md    # CV button control audit
├── GLOBAL_CV_CURSOR_QUICK_FIX.md          # Quick fix for buttons
├── CURRENT_VISION_STACK_AND_BUTTON_CONTROL.md  # Current CV implementation
├──
├── # === VISION & STRATEGY ===
├── VISION_STACK_ARCHITECTURE_2026-03-18.md      # CV model architecture
├── VISION_COMPLETE_LIFE_LEARNING_MAP.md         # Learning journey map
├── VISION_AI_NATIVE_LEARNING.md                 # AI learning approach
├── VISION_ALIGNED_OPPORTUNITIES.md              # Market opportunities
├── VISION_ALIGNMENT_AUDIT_COMPLETE.md           # Audit summary
├── VISION_SERVICE_REPURPOSING.md                # Service architecture
├──
├── # === GAME DOCUMENTATION ===
├── GAME_IDEAS_CATALOG.md                # All games list
├── GAME_LOGICAL_FINDINGS_AND_RESEARCH_2026-02-23.md  # Research findings
├── GAME_IMPROVEMENT_MEMORY_MATCH_ANALYSIS.md
├── GAME_IMPROVEMENT_AIR_GUITAR_HERO_ANALYSIS.md
├── ALL_GAMES_ASSET_IMPLEMENTATION_PLAN.md
├──
├── # === RESEARCH ===
├── research/
├──   ├── RESEARCH_COMPLETION_SUMMARY_2026-03-05.md
├──   ├── GAME_RESEARCH_MASTER_DOCUMENT.md
├──   ├── PHASE3_SERVICE_DESIGN_2026-03-05.md
├──   ├── HAND_UI_PHASE1_IMPLEMENTATION_SPEC_2026-02-28.md
├──   ├── AUDIO_ENGINE_COMPARISON_2026-03-07.md
├──   ├── VISION_PROVIDER_SURVEY_2026-03-05.md
├──   ├── EMBEDDING_AB_RESULTS_2026-03-14.md
├──   ├── INITIATIVE_01_VISUAL_TRANSFORMATION_2026-02-24.md
├──   └── [30+ more research documents]
├──
├── # === IMPLEMENTATION ===
├── IMPLEMENTATION_CHECKLIST_VISION_STACK.md    # CV implementation checklist
├── IMPLEMENTATION_PLAYBOOK.md                   # How we build features
├── IMPLEMENTATION_SUMMARY.md                    # Project status
├── IMPLEMENTATION_GAME_LESSON_PLAN.md
├── IMPLEMENTATION_GAMES_MANAGEMENT_API.md
├── IMPLEMENTATION_PLAN_TOP10_TICKETS.md
├── IMPLEMENTATION_LANDING_PAGE.md
├── [15+ more implementation docs]
├──
├── # === WORKLOGS ===
├── WORKLOG_ADDENDUM_BATCH6_GAMES.md
├── WORKLOG_ADDENDUM_GAME_UPGRADES_2026-03-11.md
├── [Other worklog files]
├──
├── # === FIXES ===
├── fixes/
├──   └── finger-number-success-detection-fix.md
├──
└── # === EVALUATIONS ===
└── evaluations/
    ├── EMOJI_MATCH_ANALYSIS_README.md
    ├── angel-investor-evaluation.js
    └── [Other evaluation files]
```

---

## Current Status

### 🚨 CRITICAL Issues

1. **Button CV Control Gap**
   - **Status:** ⚠️ 99% of games affected
   - **Impact:** Kids can't use hand tracking for buttons
   - **Solution:** [GlobalCVCursor quick fix](./GLOBAL_CV_CURSOR_QUICK_FIX.md)
   - **Long-term:** [Migration plan](./BUTTON_CV_AUDIT_AND_MIGRATION_PLAN.md)

2. **Vision Model Selection**
   - **Status:** ✓ Defined
   - **Current:** MediaPipe Hands/Face/Pose
   - **Future:** RF-DETR, MobileSAM, Moondream 2
   - **Details:** [Vision Stack Architecture](./VISION_STACK_ARCHITECTURE_2026-03-18.md)

### ✅ What's Working

| Feature | Status | Documentation |
|---------|--------|---------------|
| Hand tracking in games | ✓ Working | [Use useGameHandTracking](../src/hooks/useGameHandTracking.ts) |
| CV cursor component | ✓ Working | [KenneyHandCursor](../src/components/game/KenneyHandCursor.tsx) |
| Spatial input system | ✓ Working | [SpatialInputContext](../src/context/SpatialInputContext.tsx) |
| VisionButton (1 game) | ✓ Working | [VisionButton](../src/components/ui/VisionButton.tsx) |
| Coordinate transforms | ✓ Working | [coordinateTransform](../src/utils/coordinateTransform.ts) |

### ⚠️ What Needs Work

| Feature | Status | Action |
|---------|--------|--------|
| Button CV control (140 games) | ❌ Missing | [Migrate to VisionButton](./BUTTON_CV_AUDIT_AND_MIGRATION_PLAN.md) |
| Object detection | ⏳ Planned | Add RF-DETR (Phase 2) |
| Segmentation | ⏳ Planned | Add MobileSAM (Phase 3) |
| Performance optimization | ⏳ Ongoing | Target <150ms latency |

---

## Quick Reference

### Models in Use

| Model | Package | Purpose | License |
|-------|---------|---------|---------|
| HandLandmarker | @mediapipe/tasks-vision v0.10.8 | 21-point hand tracking | Apache-2.0 ✓ |
| FaceLandmarker | @mediapipe/tasks-vision v0.10.8 | Face mesh + expressions | Apache-2.0 ✓ |
| PoseLandmarker | @mediapipe/tasks-vision v0.10.8 | Body pose tracking | Apache-2.0 ✓ |

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| VisionButton | `src/components/ui/VisionButton.tsx` | CV-controllable button |
| KenneyHandCursor | `src/components/game/KenneyHandCursor.tsx` | Visual hand cursor |
| GlobalCVCursor | `src/components/game/GlobalCVCursor.tsx` | Quick fix for all buttons |
| useGameHandTracking | `src/hooks/useGameHandTracking.ts` | Hand tracking hook |
| SpatialInputContext | `src/context/SpatialInputContext.tsx` | Global cursor state |

### Key Hooks

```tsx
// Hand tracking
const { isReady, startTracking, stopTracking } = useGameHandTracking({
  gameName: 'MyGame',
  targetFps: 30,
});

// Cursor position
const { cursor } = useSpatialInput();
// cursor.position: { x, y } - Screen coordinates
// cursor.isActive: boolean - Hand detected?
// cursor.isPinching: boolean - Pinch gesture?
```

---

## How to Build a New Game

### Step 1: Basic Setup
```tsx
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useSpatialInput } from '../context/SpatialInputContext';

function MyGame() {
  const { isReady, startTracking, stopTracking } = useGameHandTracking({
    gameName: 'MyGame',
  });
  
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);
  
  if (!isReady) return <div>Loading...</div>;
  
  return <GameContent />;
}
```

### Step 2: Show Hand Cursor
```tsx
import { KenneyHandCursor } from '../components/game/KenneyHandCursor';

<KenneyHandCursor
  position={cursor.position}
  state={cursor.isPinching ? 'pinch' : 'point'}
  isHandDetected={cursor.isActive}
  color="yellow"
  size={64}
/>
```

### Step 3: Use CV Buttons
```tsx
import { VisionButton } from '../components/ui/VisionButton';

<VisionButton 
  onClick={handleClick}
  color="green"
  size="large"
  hitboxMultiplier={2.0}
>
  Click Me
</VisionButton>
```

**Full guide:** [Game Development Guide](./games/GAME_DEVELOPMENT_GUIDE.md)

---

## Common Tasks

### Add CV Control to Existing Game
See: [GlobalCVCursor Quick Fix](./GLOBAL_CV_CURSOR_QUICK_FIX.md)

### Migrate Button to VisionButton
See: [Button Migration Plan](./BUTTON_CV_AUDIT_AND_MIGRATION_PLAN.md)

### Add Object Detection
See: [Vision Stack Architecture - Phase 2](./VISION_STACK_ARCHITECTURE_2026-03-18.md)

### Debug Hand Tracking
See: [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

## Team Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| Tech Lead | [Name] | Architecture, code review |
| CV/ML Lead | [Name] | Hand tracking, models |
| Product Manager | [Name] | Features, priorities |
| UX Designer | [Name] | Game design, interactions |

---

## External Resources

### Related Documentation
- [Edge Models Audit](../../adhoc_projects/research/edge-models-survey-202603/) - 80+ models comparison
- [MediaPipe Docs](https://developers.google.com/mediapipe) - Official documentation
- [React docs](https://react.dev) - Frontend framework

### Design Resources
- [Kenney Assets](https://kenney.nl/assets) - Game art style
- [Game UI Patterns](./design/UI_PATTERNS.md)

---

## Document Status Legend

| Symbol | Meaning |
|--------|---------|
| ✓ | Complete and up-to-date |
| ⚠️ | Partial, needs updates |
| ⏳ | In progress |
| ❌ | Outdated, needs rewrite |
| 🔧 | Technical reference |
| 📝 | Process/guide |

---

## Contributing to Documentation

1. Add new docs to appropriate folder
2. Update this README with link
3. Use clear, actionable language
4. Include code examples
5. Add troubleshooting section

---

**Need help?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) or ask in #dev-help channel.

**Last updated:** March 18, 2026 by Hermes Agent
