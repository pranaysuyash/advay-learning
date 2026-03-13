# Comprehensive Reusable Extraction Audit

**Ticket**: TCK-20260312-005  
**Date**: 2026-03-12  
**Type**: Reusable Extraction Audit  
**Scope**: Full codebase (frontend + backend)  
**Approach**: Cross-module analysis, pattern detection, reuse identification

---

## 1. Repo Map

### Key Folders
| Path | Purpose |
|------|---------|
| `src/frontend/src/` | React SPA (Vite, TypeScript, Tailwind) |
| `src/backend/app/` | Python FastAPI backend |
| `src/frontend/src/pages/` | ~80+ game page components |
| `src/frontend/src/components/` | Shared and feature-specific UI components |
| `src/frontend/src/hooks/` | Custom React hooks (~40+) |
| `src/frontend/src/store/` | Zustand state stores |
| `src/frontend/src/services/` | API clients, utilities |
| `src/frontend/src/games/` | Dedicated game modules (finger-number-show, prototypes) |
| `src/frontend/src/components/ui/` | Core UI primitive library |
| `src/backend/app/api/` | REST API endpoints |
| `src/backend/app/services/` | Business logic services |

### Where Shared Code Lives
- **Frontend UI primitives**: `src/frontend/src/components/ui/` (Button, Card, Icon, Toast, Skeleton, etc.)
- **Frontend hooks**: `src/frontend/src/hooks/` (hand tracking, game session, audio, etc.)
- **Frontend stores**: `src/frontend/src/store/` (auth, profile, settings, game, progress)
- **Frontend services**: `src/frontend/src/services/` (API client, progress queue)
- **Backend services**: `src/backend/app/services/`

### Where Domain-Specific Code Lives
- **Game pages**: `src/frontend/src/pages/` (one file per game, ~80+)
- **Game-specific components**: `src/frontend/src/components/games/yogaAnimals/`
- **Character assets**: `src/frontend/src/components/characters/`
- **Feature dashboards**: `src/frontend/src/components/dashboard/`, `src/frontend/src/components/progress/`

### Architectural Boundaries
- Frontend ↔ Backend via REST API (`src/frontend/src/services/api.ts`)
- Hand tracking pipeline: `src/frontend/src/hooks/useHandTracking.ts` → `useGameHandTracking.ts`
- State management: Zustand stores (`src/frontend/src/store/`)
- Routing: React Router (`src/frontend/src/routes/`)

### Frameworks/Runtime
- **Frontend**: React 18+, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand
- **Backend**: Python 3.13+, FastAPI, SQLAlchemy, Alembic
- **Testing**: Vitest (frontend), pytest (backend), Playwright (e2e)

---

## 2. Module Inventory

### Frontend Modules

| Module | Path | Status | Key Systems |
|--------|------|--------|-------------|
| UI Primitives | `components/ui/` | Implemented | Button, Card, Icon, Toast, Skeleton, Tooltip, ConfirmDialog |
| Game Pages | `pages/` | Implemented (~80+) | Each game as standalone page component |
| Games (dedicated) | `games/` | Partial | FingerNumberShow only; prototypes exist |
| Hooks | `hooks/` | Implemented (~40+) | Hand tracking, audio, session, progress |
| Stores | `store/` | Implemented | Auth, profile, settings, game, progress |
| Services | `services/` | Implemented | API client, progress queue |
| Components | `components/` | Implemented | Game-specific, layout, errors, progress |
| Routing | `routes/` | Implemented | Protected routes, camera-safe routes |
| i18n | `i18n/` | Implemented | Multi-language support |
| Analytics | `analytics/` | Implemented | Launch event tracking |
| Workers | `workers/` | Implemented | Vision worker for hand tracking |

### Backend Modules

| Module | Path | Status | Key Systems |
|--------|------|--------|-------------|
| API Endpoints | `app/api/` | Implemented | REST endpoints for auth, profiles, progress |
| Services | `app/services/` | Implemented | Business logic (user, profile, progress) |
| Schemas | `app/schemas/` | Implemented | Pydantic models |
| Database | `app/db/` | Implemented | SQLAlchemy models, migrations |
| Core | `app/core/` | Implemented | Config, security, health checks |
| Middleware | `app/middleware/` | Implemented | Auth, CORS, rate limiting |

---

## 3. Existing Shared Layer Audit

### Strong Extractions (Already Reusable)

| Name | Path | Type | Consumers | Quality | Notes |
|------|------|------|-----------|---------|-------|
| Button | `components/ui/Button.tsx` | Component | All pages, GameCard, modals | **Strong** | Variants, sizes, icons, loading, ButtonLink |
| Card | `components/ui/Card.tsx` | Component | Dashboards, modals, game UIs | **Strong** | CardHeader, CardFooter, StatCard, FeatureCard |
| Icon | `components/ui/Icon.tsx` | Component | Button, Card, Toast, everywhere | **Strong** | IconName enum, size prop |
| Toast | `components/ui/Toast.tsx` | Component + Context | App-wide notifications | **Strong** | ToastProvider, auto-dismiss, type-based styling |
| Skeleton | `components/ui/Skeleton.tsx` | Component | Loading states | **Strong** | SkeletonCard, SkeletonStat, SkeletonAvatar, etc. |
| useAudio | `utils/hooks/useAudio.ts` | Hook | Button, Card, Toast, games | **Strong** | Centralized sound effects |
| useSettingsStore | `store/settingsStore.ts` | Store | Layout, games, pages | **Strong** | Demo mode, calm mode, settings |
| useHandTracking | `hooks/useHandTracking.ts` | Hook | Camera-based games | **Strong** | Core hand tracking pipeline |
| API Client | `services/api.ts` | Service | All data-fetching components | **Strong** | Axios-based, interceptors |

### Acceptable Extractions

| Name | Path | Type | Consumers | Quality | Notes |
|------|------|------|-----------|---------|-------|
| Layout | `components/ui/Layout.tsx` | Component | All routes | **Acceptable** | Could be split into Header, Footer primitives |
| Tooltip | `components/ui/Tooltip.tsx` | Component | Various UIs | **Acceptable** | Basic tooltip, could be more flexible |
| ConfirmDialog | `components/ui/ConfirmDialog.tsx` | Component | Confirmation flows | **Acceptable** | Provider pattern, but limited customization |
| ProtectedRoute | `components/ui/ProtectedRoute.tsx` | Component | Auth-protected pages | **Acceptable** | Works but could be more composable |
| useCalmMode | `hooks/useCalmMode.ts` | Hook | Layout, game components | **Acceptable** | Theme toggle, but tightly coupled |

### Weak Extractions

| Name | Path | Type | Consumers | Quality | Notes |
|------|------|------|-----------|---------|-------|
| KenneyButton | `components/ui/KenneyButton.tsx` | Component | Kenney-styled games | **Weak** | Sprite-based, not easily customizable |
| KenneyProgressBar | `components/ui/KenneyButton.tsx` | Component | Kenney games | **Weak** | 9-slice, tightly coupled to Kenney assets |
| LoadingState | `components/LoadingState.tsx` | Component | Various pages | **Weak** | Minimal customization options |

---

## 4. Unextracted Reuse Candidates

### HIGH Priority

#### 1. Game Page Template/Pattern
- **Type**: Pattern/Template
- **Areas**: All ~80+ game pages in `src/frontend/src/pages/`
- **What is similar**: Nearly every game page follows the same pattern:
  - Import common hooks (useGameSession, useHandTracking, useAudio, useSoundEffects)
  - Set up game state (useState for score, level, progress)
  - Render game container with hand tracking integration
  - Handle game completion and progress reporting
  - Show loading/error states
- **What differs**: Game-specific logic, UI rendering, scoring mechanics
- **Why extraction candidate**: ~80 pages with duplicated boilerplate
- **Reusability**: HIGH
- **Risk of premature abstraction**: MEDIUM (games have unique mechanics)

#### 2. Progress Visualization Primitives
- **Type**: Component
- **Areas**: 
  - `components/games/yogaAnimals/YogaProgressBars.tsx`
  - `components/progress/DailyTimeChart.tsx`
  - `components/progress/HistoricalProgressChart.tsx`
  - `components/progress/PlantVisualization.tsx`
  - `components/GameCard.tsx` (inline progress bar)
- **What is similar**: Animated progress bars with color coding, percentage display
- **What differs**: Visual style, data source, animation type
- **Why extraction candidate**: Same visualization concept, different implementations
- **Reusability**: HIGH
- **Risk of premature abstraction**: LOW

#### 3. Modal/Dialog Framework
- **Type**: Component
- **Areas**:
  - `components/ui/ConfirmDialog.tsx`
  - `components/CameraRecoveryModal.tsx`
  - `components/ExitConfirmationModal.tsx`
  - `components/StoryModal.tsx`
  - `components/dashboard/AddChildModal.tsx`
  - `components/dashboard/EditProfileModal.tsx`
  - `components/issue-reporting/IssueReportFlowModal.tsx`
  - `components/game/GamePauseModal.tsx`
  - `components/avatar/AvatarPickerModal.tsx`
- **What is similar**: Backdrop, close button, animation, focus trap
- **What differs**: Content, size, behavior (close on backdrop, etc.)
- **Why extraction candidate**: 9+ modal implementations with shared infrastructure
- **Reusability**: HIGH
- **Risk of premature abstraction**: LOW

#### 4. Game Card Component (Already Exists but Could Be More Flexible)
- **Type**: Component
- **Areas**: `components/GameCard.tsx`
- **Current state**: Feature-rich but monolithic
- **What could be extracted**: 
  - Badge system (NEW, COMING SOON, category badges)
  - Color mapping logic (CATEGORY_COLORS, DIFFICULTY_COLORS)
  - Preview image/icon display
  - Progress bar integration
- **Reusability**: HIGH
- **Risk of premature abstraction**: LOW

#### 5. Camera Permission Flow
- **Type**: Component + Hook
- **Areas**:
  - `components/CameraPermissionPrompt.tsx`
  - `components/CameraPermissionScreen.tsx`
  - `components/CameraPermissionTutorial.tsx`
  - `hooks/useCameraPermission.ts`
  - `hooks/useInitialCameraPermission.ts`
  - `components/routing/CameraSafeRoute.tsx`
- **What is similar**: Request camera permission, show fallback, handle errors
- **What differs**: UI presentation, retry logic
- **Why extraction candidate**: Multiple components handling same permission flow
- **Reusability**: HIGH
- **Risk of premature abstraction**: LOW

### MEDIUM Priority

#### 6. Game Session Management
- **Type**: Hook pattern
- **Areas**:
  - `hooks/useGameSession.ts`
  - `hooks/useGameSessionProgress.ts`
  - `hooks/useSessionProgressReporter.ts`
  - `hooks/useSessionTimer.ts`
  - `hooks/useGameCompletion.ts`
  - `hooks/useAutoGameCompletion.ts`
  - `hooks/useGameProgress.ts`
- **What is similar**: Track session start/end, report progress, handle completion
- **What differs**: Completion criteria, progress metrics
- **Why extraction candidate**: 7 hooks managing overlapping session concerns
- **Reusability**: MEDIUM
- **Risk of premature abstraction**: MEDIUM

#### 7. Error Boundary Pattern
- **Type**: Component
- **Areas**:
  - `components/errors/GameErrorBoundary.tsx`
  - `components/errors/GlobalErrorBoundary.tsx`
  - `components/errors/CameraErrorBoundary.tsx`
  - `components/errors/CameraCrashFallback.tsx`
- **What is similar**: Catch errors, show fallback UI, retry mechanism
- **What differs**: Error types, fallback UI, recovery strategies
- **Why extraction candidate**: Multiple error boundaries with shared patterns
- **Reusability**: MEDIUM
- **Risk of premature abstraction**: LOW

#### 8. Loading/Empty/Error State Pattern
- **Type**: Component pattern
- **Areas**: Most pages implement their own loading/error states
- **What is similar**: Show spinner while loading, error message on failure, empty state
- **What differs**: Visual presentation, retry mechanisms
- **Why extraction candidate**: Repeated pattern across pages
- **Reusability**: MEDIUM
- **Risk of premature abstraction**: LOW

#### 9. Voice/TTS Integration
- **Type**: Hook + Component
- **Areas**:
  - `components/ui/VoiceButton.tsx`
  - `components/game/VoiceInstructions.tsx`
  - `hooks/useTTS.ts`
  - `hooks/useVoicePrompt.ts`
  - `hooks/useMicrophoneInput.ts`
- **What is similar**: Text-to-speech playback, voice prompts for pre-readers
- **What differs**: Trigger conditions, UI presentation
- **Why extraction candidate**: Multiple voice-related components with shared audio concerns
- **Reusability**: MEDIUM
- **Risk of premature abstraction**: LOW

#### 10. Kenney Asset Wrapper Layer
- **Type**: Component family
- **Areas**:
  - `components/ui/KenneyButton.tsx`
  - `components/ui/KenneyIcon.tsx`
  - `components/characters/KenneyCharacter.tsx`
  - `components/characters/KenneyCharacterAnimated.tsx`
  - `components/game/KenneyHandCursor.tsx`
  - `components/ui/ItemIcon.tsx`
- **What is similar**: Wrap Kenney sprite assets with React components
- **What differs**: Asset type, animation, interaction
- **Why extraction candidate**: Kenney assets used across multiple games
- **Reusability**: MEDIUM
- **Risk of premature abstraction**: MEDIUM (Kenney-specific)

### LOW Priority

#### 11. Badge/Tag System
- **Type**: Component pattern
- **Areas**: GameCard badges, category badges, difficulty badges, recommendation badges
- **What is similar**: Small colored pill with icon/label
- **What differs**: Color scheme, content, animation
- **Reusability**: LOW (already partially in GameCard)
- **Risk of premature abstraction**: LOW

#### 12. Character/Avatar System
- **Type**: Component family
- **Areas**:
  - `components/characters/KenneyCharacter.tsx`
  - `components/characters/CSSMonster.tsx`
  - `components/characters/SVGBird.tsx`
  - `components/avatar/AvatarPickerModal.tsx`
  - `components/Mascot.tsx`
  - `components/Pip.tsx`
  - `components/LumiCompanion.tsx`
- **What is similar**: Animated character display
- **What differs**: Art style, animation, interaction model
- **Reusability**: LOW (highly domain-specific)
- **Risk of premature abstraction**: HIGH

#### 13. Tracking/Camera Integration Patterns
- **Type**: Hook family
- **Areas**:
  - `hooks/useHandTracking.ts`
  - `hooks/useGameHandTracking.ts`
  - `hooks/useHandTrackingRuntime.ts`
  - `hooks/useHandClick.ts`
  - `hooks/useEyeTracking.ts`
  - `hooks/usePostureDetection.ts`
  - `hooks/useAttentionDetection.ts`
  - `hooks/useBlinkDetection.ts`
  - `hooks/useGamePoseTracking.ts`
  - `hooks/useGameFaceTracking.ts`
- **What is similar**: Camera input → detection → game interaction
- **What differs**: Detection type, game integration
- **Reusability**: MEDIUM (already partially extracted)
- **Risk of premature abstraction**: MEDIUM

---

## 5. Parallel Implementations Review

### Cluster 1: Progress Bar Implementations

| Implementation | Location | Strengths | Weaknesses |
|----------------|----------|-----------|------------|
| YogaProgressBars | `components/games/yogaAnimals/` | Dual progress, color-coded, Framer Motion | Game-specific, not reusable |
| GameCard progress | `components/GameCard.tsx` | Inline, animated | Embedded in large component |
| KenneyProgressBar | `components/ui/KenneyButton.tsx` | 9-slice sprite, visually rich | Kenney-only, sprite-dependent |
| HistoricalProgressChart | `components/progress/` | Chart-based, data-rich | Chart lib, not simple bar |
| DailyTimeChart | `components/progress/` | Time-series, animated | Chart-specific |

**Best combined extraction should preserve**: Generic bar with configurable colors, animation, labels; optional sprite override for Kenney; support for multiple bars (like YogaProgressBars).

### Cluster 2: Modal Implementations

| Implementation | Location | Strengths | Weaknesses |
|----------------|----------|-----------|------------|
| ConfirmDialog | `components/ui/` | Provider pattern, programmatic | Limited customization |
| CameraRecoveryModal | `components/` | Specific recovery UI | One-off, not reusable |
| ExitConfirmationModal | `components/` | Game exit flow | One-off |
| AddChildModal | `components/dashboard/` | Form integration | Dashboard-specific |
| IssueReportFlowModal | `components/issue-reporting/` | Multi-step flow | Feature-specific |
| GamePauseModal | `components/game/` | Game pause UI | Game-specific |
| AvatarPickerModal | `components/avatar/` | Avatar selection | Feature-specific |

**Best combined extraction should preserve**: Base modal with backdrop, animation, close behavior; composable content slots; size variants; programmatic and declarative APIs.

### Cluster 3: Game Page Patterns

| Pattern | Examples | Strengths | Weaknesses |
|---------|----------|-----------|------------|
| Hand-tracking game | YogaAnimals, EmojiMatch | Camera-based interaction | Boilerplate-heavy |
| Tap/click game | BubblePop, ShapePop | Simple interaction | Less boilerplate |
| Drag-drop game | ColorByNumber, ShapeSequence | Mouse/touch interaction | Different event handling |
| Voice game | PhonicsSounds, RhymeTime | Audio input/output | Voice-specific setup |

**Best combined extraction should preserve**: Common game lifecycle (init → play → complete → report); configurable input method; progress tracking; loading/error states.

### Cluster 4: Audio/Sound Patterns

| Implementation | Location | Purpose |
|----------------|----------|---------|
| useAudio | `utils/hooks/useAudio.ts` | UI sounds (click, hover, success, error) |
| useSoundEffects | `hooks/useSoundEffects.ts` | Game-specific sound effects |
| use3DGameAudio | `hooks/use3DGameAudio.ts` | 3D spatial audio |
| useTTS | `hooks/useTTS.ts` | Text-to-speech |
| useMicrophoneInput | `hooks/useMicrophoneInput.ts` | Microphone input |

**Status**: Already fairly well separated. useAudio is the core UI audio hook; others are domain-specific.

---

## 6. Extraction Readiness Matrix

| Item | Recommendation | Reasoning | Preconditions |
|------|----------------|-----------|---------------|
| Game Page Template | **Prepare later** | 80+ pages, but games vary significantly | Define common game lifecycle contract first |
| Progress Visualization | **Extract now** | Clear shared concept, low risk | Create ProgressBar.tsx with basic API |
| Modal Framework | **Extract now** | 9+ implementations, clear shared needs | Create Modal.tsx with composable API |
| Game Card Refactor | **Extract now** | Already extracted, needs decomposition | Extract color maps, badges to separate modules |
| Camera Permission Flow | **Extract now** | Multiple components, clear flow | Consolidate into CameraPermissionFlow component |
| Game Session Management | **Wait** | 7 hooks with overlapping concerns | Audit actual usage patterns first |
| Error Boundaries | **Prepare later** | Different error types need different handling | Define error taxonomy first |
| Loading/Empty/Error States | **Extract now** | Clear pattern, low risk | Create AsyncState component |
| Voice/TTS Integration | **Wait** | Already partially extracted | Monitor usage before further abstraction |
| Kenney Asset Layer | **Do not extract** | Highly domain-specific, asset-dependent | Keep as-is, document patterns |
| Badge System | **Extract now** | Simple, reusable | Create Badge component |
| Character System | **Do not extract** | Each character is unique | Keep domain-specific |
| Tracking Patterns | **Wait** | Already well-extracted in useHandTracking | Monitor before further abstraction |

---

## 7. Future Shared Abstraction Plan

### Proposed: `shared/ui/` - Enhanced UI Primitives

**What it would own**:
- Core components (Button, Card, Icon, Toast, Skeleton, Tooltip)
- New: Modal, ProgressBar, Badge, AsyncState, ConfirmDialog
- Theme-aware styling utilities

**What stays outside**:
- Kenney-specific skins (stay in `components/ui/` or `skins/kenney/`)
- Game-specific UI (stay in `components/games/`)

**Likely consumers**: All pages, all games

**Design constraints**: Must support calm mode, accessibility, reduced motion

### Proposed: `shared/game/` - Game Infrastructure

**What it would own**:
- GamePage wrapper component
- GameSession hook (unified session management)
- GameHUD component
- GameCanvas wrapper
- Score/Level/Progress display components

**What stays outside**:
- Game-specific logic (each game page)
- Game-specific assets
- Hand tracking integration (stays in hooks)

**Likely consumers**: All ~80 game pages

**Design constraints**: Must support multiple input methods (hand tracking, mouse, touch, voice)

### Proposed: `shared/modals/` - Modal System

**What it would own**:
- Base Modal component
- ConfirmModal, AlertModal
- ModalContext/provider for programmatic control
- Focus trap, backdrop, animation utilities

**What stays outside**:
- Feature-specific modal content (IssueReportFlow, AvatarPicker, etc.)

**Likely consumers**: All modal implementations

**Design constraints**: Must support different sizes, close behaviors, animations

### Proposed: `shared/progress/` - Progress Visualization

**What it would own**:
- ProgressBar (single bar)
- ProgressGroup (multiple bars)
- CircularProgress
- Chart wrappers (if needed)

**What stays outside**:
- Complex charts (keep using chart library directly)
- Kenney sprite progress bar (keep as skin)

**Likely consumers**: Progress pages, games, dashboards

**Design constraints**: Must animate smoothly, support reduced motion

---

## 8. Priority Summary

### Top Extraction Opportunities (Do Soon)

1. **Modal/Dialog Framework** - 9+ implementations, clear shared pattern, low risk
2. **ProgressBar Primitive** - 5+ implementations, clear shared concept, low risk
3. **Camera Permission Flow Consolidation** - 5+ components, clear flow, low risk
4. **Badge Component** - Simple extraction from GameCard, low risk
5. **AsyncState Component** - Loading/empty/error pattern, low risk

### Best Later Opportunities

6. **Game Page Template** - High value but needs careful design
7. **Game Session Unification** - 7 hooks need audit first
8. **Error Boundary Consolidation** - Define error taxonomy first
9. **Voice/TTS Integration** - Monitor usage patterns

### Do Not Abstract Yet

10. **Kenney Asset Layer** - Too domain-specific, asset-dependent
11. **Character System** - Each character is unique
12. **Tracking Patterns** - Already well-extracted

### Already Well Extracted

- Button, Card, Icon, Toast, Skeleton - Strong primitives
- useAudio - Centralized sound
- useHandTracking - Core hand tracking pipeline
- API Client - Clean REST client
- Zustand Stores - Good state management

---

## 9. Open Questions / Unknowns

1. **Game page boilerplate**: How much variation exists across the ~80 game pages? Need systematic comparison to determine if a template would work.

2. **Modal usage patterns**: Are all 9+ modal implementations actually different, or could some be unified? Need usage analysis.

3. **Progress bar requirements**: What are the exact requirements for a shared ProgressBar? Need to compare all implementations side-by-side.

4. **Camera permission flow**: Is the current complexity necessary, or could it be simplified? Need to audit the actual user flows.

5. **Game session hooks**: Why are there 7 hooks for session management? Is this intentional separation or accidental duplication? Need architecture review.

6. **Kenney skin strategy**: Should Kenney components be a skin layer on top of generic components, or remain separate? Design decision needed.

7. **Test coverage**: Which shared components have tests? Need to ensure extractions don't break existing tests.

8. **Calm mode impact**: How does calm mode affect each candidate extraction? Need to understand theming requirements.

---

*End of Audit*
