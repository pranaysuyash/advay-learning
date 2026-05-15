# Advay Vision Learning — Comprehensive Exploration Map

> Generated: 2026-05-01 | Status symbols: ✅ Done/Verified | 🟡 In Progress | ❌ Not Started | 🔜 Planned/Queued | 🔵 Idea/Frontier

---

## 0. Project Identity

| Field | Value |
|---|---|
| **Name** | Advay Vision Learning (learning_for_kids) |
| **Tagline** | Active Discovery Vision AI for Youth |
| **Target Age** | 2–8 years |
| **Core Prop** | Camera-first, hands-free learning — kids interact via hand/face/pose/voice, not keyboard/mouse |
| **License** | Private — built for Advay and young learners |
| **Repo** | `learning_for_kids` (workspace project root) |

---

## 1. Market & Competitive Landscape

### 1.1 Market Sizing & Positioning

| Area | Status | Notes |
|---|---|---|
| EdTech kids market (2–8) sizing | 🟡 | Competitors identified informally but no formal TAM doc |
| Unique value prop articulation | ✅ | "Vision-first" — hands-free interaction for pre-keyboard age is the differentiator |
| Parent pain-point validation | ❌ | No documented parent interviews or surveys |
| Age-band segmentation strategy | 🟡 | `ageRange` field exists in registry but not used for adaptive content |
| Geographic / language market fit | 🟡 | English, Hindi, Kannada supported; no market-specific launch plan |
| Pricing model research | 🟡 | Subscription tiers exist (DodoPayments); no competitive pricing analysis doc |
| COPPA / regulatory landscape | ✅ | COPPA-compliant design documented in AGENTS.md + security docs |

### 1.2 Competitive Analysis

| Competitor Category | Status | Key Gap |
|---|---|---|
| Khan Academy Kids | ❌ | No formal comparison — KA is 2D tap-based, no CV |
| ABCmouse / Age of Learning | ❌ | No formal comparison — subscription-heavy, no vision |
| PBS Kids Games | ❌ | No formal comparison — web-only, no CV |
| Duolingo ABC | ❌ | No formal comparison — literacy-only, no CV |
| Osmo (Tangible Play) | 🟡 | Nearest analog — CV + physical objects; indirect awareness via codebase comments |
| Endless Alphabet | ❌ | Popular word-learning app, no comparison |
| YouTube Kids | ❌ | Passive consumption vs. active learning — no comparison |
| Kahoot! Kids | ❌ | Quiz-based, different model — no comparison |

### 1.3 Go-to-Market

| Area | Status | Notes |
|---|---|---|
| Launch strategy (beta / soft launch) | ❌ | No launch plan doc |
| App store presence (iOS/Android) | ❌ | Web-only currently; no mobile app strategy doc |
| Parent acquisition channels | ❌ | Not documented |
| Teacher / school partnerships | ❌ | Not explored |
| Content marketing / social strategy | ❌ | Not explored |
| Referral / viral mechanics | 🟡 | Social activities + collectibles exist in code; no marketing plan |

---

## 2. Product & Features

### 2.1 Core Feature Coverage

| Feature | Status | Notes |
|---|---|---|
| Hand tracking (primary CV) | ✅ | 120 games use `useGameHandTracking` |
| Pose tracking | 🟡 | 10 games — growing but limited |
| Face tracking | 🟡 | 2 games — minimal coverage |
| Voice input | 🟡 | Voice hooks exist (`useVoiceRecognition`, `useVoicePrompt`); `voice` in CV modes for some games |
| Camera gating | ✅ | `CameraSafeRoute` wraps 138 game routes |
| Onboarding flow | ✅ | `OnboardingFlow.tsx` component exists |
| Parent dashboard | 🟡 | Dashboard route exists; depth unknown |
| Progress tracking | ✅ | Backend `progress_service.py` + frontend `progressStore.ts` + `useGameProgress` hook |
| Achievement system | ✅ | Backend `achievement_service.py` + `achievement` models |
| Subscription / payments | 🟡 | DodoPayments integration + Stripe-like subscription endpoints |
| Data export | ✅ | `data_export_service.py` endpoint |
| Consent management | ✅ | `consent.py` endpoint + model |
| Issue reporting | ✅ | `issue_reports.py` endpoint + `IssueReportFlowModal.tsx` |
| Time limiting | ✅ | `TimeLimitGate.tsx` component |
| Offline support | ❌ | No service worker or offline manifest detected |

### 2.2 World / Category Map (17 Worlds)

| World | ID | Status | Game Count (approx) |
|---|---|---|---|
| Letter Land | `letter-land` | ✅ | ~10+ |
| Number Jungle | `number-jungle` | ✅ | ~10+ |
| Word Workshop | `word-workshop` | ✅ | ~15+ |
| Shape Garden | `shape-garden` | ✅ | ~8+ |
| Color Splash | `color-splash` | ✅ | ~6+ |
| Doodle Dock | `doodle-dock` | ✅ | ~5+ |
| Steady Labs | `steady-labs` | ✅ | ~5+ |
| Sound Studio | `sound-studio` | ✅ | ~5+ |
| Mind Maze | `mind-maze` | ✅ | (part of wellness?) |
| Body Zone | `body-zone` | ✅ | ~8+ |
| Lab of Wonders | `lab-of-wonders` | ✅ | ~8+ |
| Feeling Forest | `feeling-forest` | ✅ | ~4+ |
| Art Atelier | `art-atelier` | ✅ | ~4+ |
| Real World | `real-world` | ✅ | ~4+ |
| Story Corner | `story-corner` | ✅ | ~4+ |
| Platform World | `platform-world` | ✅ | ~4+ |
| 3D World | `3d-world` | ✅ | ~8+ |

### 2.3 Game Portfolio (138+ routes, 110+ registered games)

| Category | Examples | Status |
|---|---|---|
| Literacy / Phonics | AlphabetTracing, LetterMatch, PhonicsFun, MagicE, ConsonantQuest, WordBuilder, SpellingBee | ✅ |
| Word / Vocabulary | SynonymMatch, AntonymHunt, WordScramble, WordFamilies, WordLadder, CompoundWords, SentenceBuilder, OppositesAttract | ✅ |
| Numbers / Math | NumberNinja, NumberTracing, NumberBubblePop, PopTheNumber, CountingObjects, MathSmash, ColorByNumber | ✅ |
| Shapes / Patterns | ConnectTheDots, ShapePop, SizeSorting, OddOneOut, PatternPop3D | ✅ |
| Colors / Art | ColorMatchGarden, ColorPotions, ColorSort, AirCanvas, MirrorDraw, KaleidoscopeHands | ✅ |
| 3D Games | BubblePop3D, FeedTheMonster3D, ShapeSafari3D, ObstacleCourse3D, CountingCollectathon3D, ColorMatchGarden3D, VirtualBubbles3D | ✅ |
| Motor / Steady | SteadyHandLab, PathFollowing, CuttingPractice3D | ✅ |
| Music / Sound | MusicPinchBeat, AirGuitarHero, RhythmTap, AnimalSounds | ✅ |
| Body / Movement | YogaAnimals, BalloonPopFitness, FreezeDance, SimonSays, MusicalStatues, FollowTheLeader, BalanceBeam, ObstacleCourse | ✅ |
| Science | ChemistryLab, WeatherLab, PlanetSandbox, NasaSkyHunt, EarthTimeMachine | ✅ |
| Emotions / Social | EmojiMatch, BodyParts, VoiceStories | ✅ |
| Stories / Reading | ReadingAlong, LanguagePuppet | ✅ |
| Platformers | MirrorDuel | ✅ |
| Voice-controlled | VoiceStories, LanguagePuppet | 🟡 |

### 2.4 Gamification & Engagement

| Feature | Status | Notes |
|---|---|---|
| Collectibles / drops system | ✅ | `collectibles.ts` + `useGameDrops` hook + `inventoryStore.ts` |
| Easter eggs | ✅ | `easterEggs.ts` + per-game easter egg manifests |
| Cross-game item effects | 🟡 | `usesItems` in GameManifest; limited implementation |
| Streak tracking | ✅ | `useStreakTracking.ts` |
| Session timer | ✅ | `useSessionTimer.ts` |
| Time-on-task metrics | ✅ | `useTimeOnTask.ts` |
| Real-time engagement | 🟡 | `useRealTimeEngagement.ts` — exists but depth unclear |
| Quests system | 🟡 | `quests.ts` data file exists |
| Recipes system | 🟡 | `recipes.ts` data file exists |
| Social activities | 🟡 | `socialActivities.ts` data file exists |
| Mascot / companion | ✅ | `Mascot.tsx` + `lumiResponses.ts` + `pipResponses.ts` + `characterStore.ts` |

### 2.5 AI Integration

| AI Service | Status | Implementation |
|---|---|---|
| Text-to-Speech (TTS) | ✅ | Kokoro TTS + pregen audio cache (`TTSService.ts`, `KokoroTTSProvider.ts`, `PregenAudioCache.ts`) |
| Speech-to-Text (STT) | ✅ | Whisper + WebSpeech (`STTService.ts`, `WhisperSTTProvider.ts`, `WebSpeechSTTProvider.ts`) |
| LLM | 🟡 | LMStudio provider (`LLMService.ts`, `LMStudioProvider.ts`) — story generation |
| Vision (CV) | ✅ | MediaPipe (`MediaPipeVisionProvider.ts`, `VisionService.ts`) |
| Story generation | ✅ | `StoryGenerator.ts`, `LLMStoryGenerator.ts`, `FallbackStoryLibrary.ts`, `StoryCache.ts` |
| AI safety | ✅ | `SafetyService.ts`, `SafeResponses.ts` |
| AI telemetry | ✅ | `aiTelemetryStore.ts` (Zustand) |
| On-device AI (HuggingFace) | 🟡 | `@huggingface/transformers` in deps — beta-stubs suggest partial |

### 2.6 Internationalization

| Area | Status | Notes |
|---|---|---|
| i18n framework | ✅ | i18next + react-i18next + browser detector + http backend |
| Languages supported | 🟡 | English, Hindi, Kannada — expandable |
| Language data | ✅ | `languages.ts` + `alphabets.ts` + tests |
| Voice/language in games | ❌ | No locale-aware voice synthesis verified |
| RTL support | ❌ | Not explored |
| Localized game content | ❌ | Game logic appears English-centric |

---

## 3. Tech & Architecture

### 3.1 Frontend Architecture

| Layer | Status | Details |
|---|---|---|
| Framework | ✅ | React 19 + TypeScript 5.3 |
| Build tool | ✅ | Vite 7.3 |
| Styling | ✅ | Tailwind CSS 3.4 |
| State management | ✅ | Zustand 4.4 (8+ stores: auth, settings, profile, progress, inventory, social, character, story, game, aiTelemetry) |
| Routing | ✅ | React Router DOM 6.28 |
| Data fetching | ✅ | TanStack React Query 5.17 + Axios |
| 3D rendering | ✅ | Three.js + React Three Fiber 9.5 + @react-three/drei + @react-three/rapier |
| 2D physics | 🟡 | Matter.js 0.20 — present but limited |
| Animation | ✅ | Framer Motion 12 + @react-spring/three |
| Charts | ✅ | Chart.js + react-chartjs-2 |
| Camera | ✅ | react-webcam 7.1 |
| Confetti | ✅ | canvas-confetti |
| Icon system | ✅ | Lucide React + custom `Icon.tsx` component |
| Code splitting | ✅ | Lazy-loaded routes (`lazyPages.tsx`) |
| Package manager | ✅ | pnpm 10.30 |

### 3.2 Computer Vision Architecture

| Component | Status | Details |
|---|---|---|
| Hand tracking | ✅ | `useHandTracking.ts` + `useGameHandTracking.ts` + `useHandInteraction.ts` + `useHandClick.ts` |
| Pose tracking | ✅ | `useGamePoseTracking.ts` |
| Face tracking | ✅ | `useGameFaceTracking.ts` |
| Eye tracking | 🟡 | `useEyeTracking.ts` — exists but usage limited |
| Fallback controls | ✅ | `useFallbackControls.ts` |
| Vision worker runtime | ✅ | `useVisionWorkerRuntime.ts` — Web Worker offloading |
| CV cursor | ✅ | `GlobalCVCursor.tsx` + `cv-cursor.css` |
| Tracking loss recovery | ✅ | `TrackingLossOverlay.tsx` + `CameraRecoveryModal.tsx` + `useInitialCameraPermission.ts` |
| Attention detection | 🟡 | `useAttentionDetection.ts` — exists |
| Gesture detection | ✅ | `gestureDetection.ts` utility |
| Performance monitor | ✅ | `usePerformanceMonitor.ts` |
| CV Provider | ✅ | `CVProvider.tsx` + `commonCvController.tsx` |

### 3.3 Backend Architecture

| Layer | Status | Details |
|---|---|---|
| Framework | ✅ | FastAPI (latest) |
| ORM | ✅ | SQLAlchemy 2.0 |
| Migrations | ✅ | Alembic |
| Database | ✅ | PostgreSQL 17 |
| Cache | ✅ | Redis 7 |
| Auth | ✅ | JWT (python-jose) + bcrypt + passlib |
| Rate limiting | ✅ | SlowAPI |
| Security headers | ✅ | Custom middleware |
| Error handling | ✅ | Custom middleware |
| Email | ✅ | Resend SDK |
| Payments | ✅ | DodoPayments SDK |
| Storage | ✅ | AWS S3 (boto3) |
| Structured logging | ✅ | structlog |
| Python version | ✅ | 3.13+ |

### 3.4 Backend API Endpoints

| Endpoint | Status | Purpose |
|---|---|---|
| `/auth` | ✅ | Authentication (login, register, forgot/reset password) |
| `/users` | ✅ | User management |
| `/progress` | ✅ | Game progress tracking |
| `/games` | ✅ | Game metadata |
| `/subscriptions` | ✅ | Subscription management |
| `/consent` | ✅ | Parental consent |
| `/achievements` | ✅ | Achievement tracking |
| `/issue-reports` | ✅ | Bug/issue reporting |
| `/profile-photos` | ✅ | Avatar/profile photo upload |
| `/data-export` | ✅ | GDPR-style data export |

### 3.5 Data Models (Backend)

| Model | Status | Purpose |
|---|---|---|
| User | ✅ | Auth + profile |
| Progress | ✅ | Per-game progress |
| Profile | ✅ | Learner profile |
| Achievement | ✅ | Achievement records |
| Consent | ✅ | Parental consent records |
| Subscription | ✅ | Payment/plan records |
| Game | ✅ | Game metadata |
| RevokedToken | ✅ | Token revocation list |
| Audit | ✅ | Audit trail |

### 3.6 Infrastructure & DevOps

| Area | Status | Notes |
|---|---|---|
| Docker Compose | 🟡 | Mentioned in README but no docker-compose.yml found in scan |
| CI/CD | ✅ | GitHub Actions workflows (pr-link-gate, pr-failure-narrative-gate, pr-path-labeler, project-and-issue-automation, merge-readiness-gate) |
| Pre-commit hooks | ✅ | Configured via scripts |
| Branch strategy | ✅ | Main-only work + WIP branches for PRs |
| Monitoring runbook | ✅ | `docs/runbooks/MONITORING.md` |
| Backup runbook | ✅ | `docs/runbooks/BACKUP_PROCEDURE.md` |
| Rollback runbook | ✅ | `docs/runbooks/ROLLBACK_PROCEDURE.md` |
| E2E testing | ✅ | Playwright (chromium-fake-camera profile + manual camera check) |
| Unit testing | ✅ | Vitest |
| Type checking | ✅ | TypeScript strict + `tsc --noEmit` |
| Linting | ✅ | ESLint (frontend) + Ruff + Black + Mypy (backend) |
| Coverage | ✅ | Vitest coverage-v8 |
| Performance testing | 🟡 | `test:perf` script exists |

---

## 4. UX & Design

### 4.1 Design System

| Area | Status | Notes |
|---|---|---|
| World visual identity | ✅ | Each world has emoji, color, bgGradient |
| Game vibe system | ✅ | 9 vibes (chill, active, creative, brainy, educational, musical, puzzle, focus, relaxed) with emoji + color |
| Game card design | ✅ | `GameCard.tsx` with preview images support |
| UI component library | ✅ | Custom: Icon, Modal, ConfirmModal, KenneyButton, VoiceButton, VisionButton, SyncStatusIndicator, AvatarCapture, Layout |
| Celebration / feedback | ✅ | `CelebrationOverlay.tsx` + canvas-confetti + `GameFeedback.tsx` |
| Tutorial / onboarding | ✅ | `TutorialOverlay.tsx`, `GameTutorial.tsx`, `OnboardingFlow.tsx` |
| Mascot / companion | ✅ | `Mascot.tsx`, `KenneyCharacter.tsx`, Lumi + Pip responses |
| Pause / game controls | ✅ | `PauseMenu.tsx`, `GamePauseModal.tsx`, `PreGameMenu.tsx`, `GameActionDock.tsx` |
| Progress display | ✅ | `GameProgressBar.tsx`, `GameStatChip.tsx`, `GameTopBar.tsx` |

### 4.2 Accessibility & Inclusivity

| Area | Status | Notes |
|---|---|---|
| Child-friendly UI (large targets, minimal text) | 🟡 | Implied by age range but no formal accessibility audit |
| Screen reader / ARIA support | ❌ | No documented ARIA strategy |
| High contrast / color blind mode | ❌ | Not found |
| Keyboard navigation fallback | ❌ | CV-first design; mouse/touch fallback present |
| Low-vision support | ❌ | Not explored |
| Motor impairment adaptations | ❌ | Not explored |
| Calm mode | 🟡 | `useCalmMode.ts` hook exists — purpose/depth unclear |
| Audio descriptions | ❌ | Not implemented |

### 4.3 Camera / CV UX

| Area | Status | Notes |
|---|---|---|
| Camera permission UX | ✅ | `CameraPermissionPrompt.tsx` + `useInitialCameraPermission.ts` |
| Camera recovery | ✅ | `CameraRecoveryModal.tsx` |
| Tracking loss feedback | ✅ | `TrackingLossOverlay.tsx` + `AnimatedHand.tsx` |
| CV cursor visibility | ✅ | `GlobalCVCursor.tsx` + `cv-cursor.css` |
| Performance optimization | ✅ | `useVisionWorkerRuntime.ts` (Web Worker), `FPSDisplay.tsx` + `FPSCounter.tsx` |
| WebGPU support | 🟡 | `webgpu.ts` utility exists |

---

## 5. Code Quality & Technical Debt

### 5.1 Code Health

| Area | Status | Notes |
|---|---|---|
| Test coverage (frontend) | 🟡 | Vitest with coverage; actual % unknown |
| Test coverage (backend) | 🟡 | pytest-asyncio; actual % unknown |
| Game logic tests | ✅ | Multiple: wordFamilies, letterMatch, spellingBee, compoundWords, patternPop3D, bubblePop3D, etc. |
| Hook tests | ✅ | useHandTracking, useGameHandTracking, useGameSubscription, useFallbackControls, etc. |
| Component tests | ✅ | GameShell, GameContainer, OnboardingFlow, GamePage, CameraPermissionPrompt |
| Store tests | ✅ | storyStore, socialStore, gameStore, characterStore, aiTelemetryStore, etc. |
| Service tests | ✅ | progressQueue, gameRecommendations, api, VisionService, LLMService, STTService |
| E2E tests | ✅ | Playwright (all-games-load.e2e + other e2e) |
| Property-based tests | 🟡 | fast-check in devDeps — some tests use it |

### 5.2 Technical Debt

| Area | Status | Notes |
|---|---|---|
| Game spec audit (drift) | 🟡 | 5/110 critical drift cases resolved; 105 remaining |
| Cannon.js → Rapier migration | 🟡 | Cannon legacy being phased out per README |
| Dead CV code | ✅ | "0 games with dead CV code" per AGENTS.md |
| Refactor sidecars | 🟡 | Policy defined in AGENTS.md §6.1; enforcement ongoing |
| Duplicate game IDs | ✅ | Dev-mode duplicate detection in gameRegistry.ts |
| Nested `.agent` metadata dirs | 🟡 | Documented oddity; cleanup planned but not urgent |
| `__pycache__` in repo | ❌ | Multiple .pyc files found in backend scan — should be gitignored |

### 5.3 Documentation

| Doc | Status | Location |
|---|---|---|
| README.md | ✅ | Root |
| AGENTS.md | ✅ | Root (1571 lines, 66KB — comprehensive) |
| Architecture doc | ✅ | `docs/ARCHITECTURE.md` |
| Setup guide | ✅ | `docs/SETUP.md` |
| Quick start | ✅ | `docs/QUICKSTART.md` |
| Security guidelines | ✅ | `docs/security/SECURITY.md` |
| Linting guidelines | ✅ | `docs/LINTING_GUIDELINES.md` |
| CV implementation guide | ✅ | `docs/CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md` |
| Game engines & physics | ✅ | `docs/architecture/GAME_ENGINES_AND_PHYSICS.md` |
| Game spec audit | 🟡 | `docs/games/README.md` + `docs/games/CRITICAL_DRIFT_CASES_COMPLETE_REPORT.md` |
| Backup procedure | ✅ | `docs/runbooks/BACKUP_PROCEDURE.md` |
| Monitoring runbook | ✅ | `docs/runbooks/MONITORING.md` |
| Rollback procedure | ✅ | `docs/runbooks/ROLLBACK_PROCEDURE.md` |
| Code preservation guidelines | ✅ | `docs/process/CODE_PRESERVATION_GUIDELINES.md` |
| Post-error resolution plan | ✅ | `docs/POST_ERROR_RESOLUTION_PLAN.md` |
| Control mode audit | ✅ | `docs/audit/CONTROL_MODE_AUDIT_2026-03-12.md` |
| Issue register | ✅ | `docs/audit/ISSUE_REGISTER.md` |
| Claims registry | ✅ | `docs/CLAIMS.md` |

---

## 6. Frontier Ideas & Growth Opportunities

### 6.1 Product Frontier

| Idea | Status | Notes |
|---|---|---|
| Adaptive difficulty (AI-driven) | 🔵 | `ageRange` exists but no runtime adaptation; huge opportunity for personalized learning |
| Speech-driven games | 🔵 | STT exists; could expand to full voice-controlled gameplay for all games |
| Real-time pronunciation coaching | 🔵 | WordBuilder needs phonics audio; STT+TTS pipeline could power pronunciation feedback |
| Parent insights / analytics dashboard | 🔵 | Progress data exists; could build rich analytics + recommendations |
| Multi-player / sibling mode | 🔵 | Social activities exist; real-time multiplayer would be differentiation |
| AR overlay mode | 🔵 | Camera + VisionService already present; AR objects in camera feed |
| Story-anchored curriculum | 🔵 | Story generation exists; could tie stories to learning objectives |
| Emotional state detection | 🔵 | Face tracking + attention detection; could adapt game mood to child state |
| Offline-first PWA | 🔵 | Critical for accessibility; no service worker yet |
| Mobile app (Capacitor / Expo) | 🔵 | Web-only currently; mobile native camera access would improve CV reliability |

### 6.2 Technical Frontier

| Idea | Status | Notes |
|---|---|---|
| WebGPU-accelerated CV inference | 🔵 | WebGPU utility exists; could replace WASM MediaPipe for perf |
| Federated learning for personalization | 🔵 | Privacy-preserving; aligns with COPPA/no-video-storage stance |
| On-device LLM (WebLLM) | 🔵 | @huggingface/transformers in deps; could run small models locally |
| WASM-based physics (Rapier already) | ✅ | Already using @dimforge/rapier3d-compat |
| Edge deployment (CF Workers / Deno Deploy) | 🔵 | Could reduce latency for CV pipeline |
| Gamified A/B testing framework | 🔵 | Could optimize game design decisions with data |
| Automated game generation | 🔵 | Game manifests + AI could generate new game variants |
| Cross-game progression graph | 🔵 | Quest system + inventory could form a skill tree / knowledge graph |

### 6.3 Business Frontier

| Idea | Status | Notes |
|---|---|---|
| Freemium model | 🔵 | Subscription exists; free tier + premium unlock strategy |
| B2B school licensing | 🔵 | Teacher dashboard; classroom management |
| Content marketplace | 🔵 | Community-created games / worlds |
| White-label platform | 🔵 | Vision-learning engine for other brands |
| Research partnerships | 🔵 | Child-computer interaction research data (privacy-preserving) |
| Certification / badge system | 🔵 | Achievement system could expand to recognized credentials |
| Therapeutic / special-needs use | 🔵 | Motor skills games + calm mode could serve occupational therapy |
| International expansion | 🔵 | i18n infrastructure ready; content needs localization |

---

## 7. Priority Exploration Targets (Recommended Next Steps)

| Priority | Target | Area | Rationale |
|---|---|---|---|
| P0 | Complete game spec audit (105 remaining) | Product | Drift causes broken gameplay & educational gaps |
| P0 | Offline / PWA support | Tech | Critical for real-world use with young kids |
| P1 | Mobile app packaging | Market | Camera access + performance better on native |
| P1 | Competitive analysis document | Market | Needed for positioning & funding conversations |
| P1 | Accessibility audit (ARIA, contrast, motor) | UX | Inclusive design + legal risk mitigation |
| P1 | Voice-controlled games expansion | Product | STT stack exists; voice is most accessible input for 2–4 yr olds |
| P2 | Adaptive difficulty engine | Product | Biggest educational impact lever |
| P2 | Parent analytics dashboard | Product | Retention driver + monetization justification |
| P2 | Remaining pose/face CV games | Tech | Only 10 pose + 2 face; body/movement games under-served |
| P2 | Full localization (Hindi, Kannada content) | Market | i18n infra ready; content is the gap |
| P3 | AR overlay mode | Frontier | Camera + CV already present; differentiation opportunity |
| P3 | On-device LLM for stories | Frontier | HuggingFace dep + privacy-first = good fit |
| P3 | Therapeutic / special-needs pathway | Business | Calm mode + motor skills = natural fit |

---

## 8. Summary Stats

| Metric | Value |
|---|---|
| Total game routes (cameraSafe) | 138 |
| Games with hand tracking | 120 |
| Games with pose tracking | 10 |
| Games with face tracking | 2 |
| Games with active CV gameplay | 122 |
| Pointer-only games | 0 |
| Worlds | 17 |
| Game registries (files) | 16 |
| Zustand stores | 10 |
| React hooks | 50+ |
| Backend endpoints | 10 |
| Backend models | 8+ |
| AI services (TTS, STT, LLM, Vision, Safety) | 5 |
| i18n languages | 3 |
| CI/CD workflows | 5+ |
| Documentation pages | 15+ |
| Game spec audit progress | 5/110 critical drift done; 105 remaining |

---

*This map is a living document. Update status markers as exploration progresses.*
