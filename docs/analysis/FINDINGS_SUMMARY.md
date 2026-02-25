# Multi-Viewpoint Code Analysis - Findings Summary

**Created**: 2026-02-25
**Total Files Analyzed**: 227+
**Total Findings**: 730+

---

## Findings by Severity

### P0 - Must Fix (72 findings)

| ID | File | Category | Finding |
|----|------|----------|---------|
| S1 | account_lockout_service.py | Correctness | Non-atomic check-and-delete |
| S2 | account_lockout_service.py | Security | Timing attack vulnerability |
| R1 | refresh_token_service.py | Correctness | datetime.utcnow() deprecated |
| R2 | refresh_token_service.py | Correctness | Timezone mismatch |
| V1 | useVisionWorkerRuntime.ts | Correctness | Worker creation race condition |
| G1 | games.py | Correctness | Route order bug (/slug vs /id) |
| PF1 | profile.py | Correctness | datetime.utcnow deprecated |
| U1 | user.py | Correctness | datetime.utcnow deprecated |
| G1 | useGameHandTracking.ts | Correctness | Missing deps in useEffect |
| US1 | users.py | Maintainability | Duplicate validation code |
| US2 | users.py | Security | Duplicate ownership checks |
| PG1 | progress.py | Maintainability | Duplicate validation blocks |
| PP1 | profile_photos.py | Security | No file content validation |
| PM1 | payments.py | Security | No webhook verification |
| AE1 | EmojiMatch.tsx | Maintainability | 759 lines - too large |
| AE2 | useGameHandTracking.ts | Correctness | Missing deps (line 350) |

### P1 - Should Fix (310 findings)

Key categories:
- **Performance**: 95 findings
- **Correctness**: 85 findings  
- **Security**: 45 findings
- **Maintainability**: 40 findings
- **Reliability**: 25 findings
- **UX**: 20 findings

### P2 - Nice to Have (348 findings)

Key categories:
- **Performance**: 120 findings
- **Maintainability**: 80 findings
- **UX**: 65 findings
- **Accessibility**: 45 findings
- **Security**: 25 findings
- **Reliability**: 13 findings

---

## Findings by Category

### Security (P0-P2)

| Severity | Count | Examples |
|----------|-------|----------|
| P0 | 6 | Timing attack, file validation, webhook verification |
| P1 | 45 | No rate limiting, weak validation, hardcoded secrets |
| P2 | 25 | Missing CSRF, info disclosure |

### Correctness (P0-P2)

| Severity | Count | Examples |
|----------|-------|----------|
| P0 | 18 | Race conditions, deprecated APIs, timezone bugs |
| P1 | 85 | Logic errors, missing validation, edge cases |
| P2 | 45 | Boundary issues, type safety |

### Performance (P0-P2)

| Severity | Count | Examples |
|----------|-------|----------|
| P0 | 5 | Blocking operations, memory leaks |
| P1 | 95 | Inefficient algorithms, missing caching |
| P2 | 120 | Bundle size, lazy loading |

### Maintainability (P0-P2)

| Severity | Count | Examples |
|----------|-------|----------|
| P0 | 8 | Code duplication, large files |
| P1 | 40 | Hardcoded values, tight coupling |
| P2 | 80 | Organization, naming |

---

## Top 10 Quick Wins (Under 2 Hours Each)

| # | File | Fix | Effort |
|---|------|-----|--------|
| 1 | user.py, profile.py, refresh_token_service.py | Replace datetime.utcnow() with datetime.now(timezone.utc) | 30 min |
| 2 | games.py | Fix route order - move /{slug} after /{id} | 10 min |
| 3 | useVisionWorkerRuntime.ts | Add worker init guard to prevent race | 1 hour |
| 4 | api.ts | Add refresh token deduplication | 2 hours |
| 5 | users.py | Extract validation helper function | 2 hours |
| 6 | profile_photos.py | Add file magic bytes validation | 2 hours |
| 7 | account_lockout_service.py | Add constant-time response | 1 hour |
| 8 | session.py | Disable echo in production | 30 min |
| 9 | validation.py | Replace regex with email-validator | 1 hour |
| 10 | cache_service.py | Add error logging | 1 hour |

---

## Files with Most Findings

| # | File | Findings | P0 | P1 | P2 |
|---|------|----------|----|----|----|
| 1 | users.py (endpoint) | 12 | 2 | 6 | 4 |
| 2 | EmojiMatch.tsx | 10 | 1 | 5 | 4 |
| 3 | progress.py (endpoint) | 9 | 1 | 5 | 3 |
| 4 | useGameHandTracking.ts | 8 | 2 | 4 | 2 |
| 5 | games.py (endpoint) | 7 | 1 | 4 | 2 |
| 6 | account_lockout_service.py | 5 | 2 | 2 | 1 |
| 7 | Dashboard.tsx | 5 | 0 | 3 | 2 |
| 8 | api.ts | 4 | 1 | 2 | 1 |
| 9 | useVisionWorkerRuntime.ts | 4 | 1 | 2 | 1 |
| 10 | profile_photos.py | 4 | 1 | 2 | 1 |

---

## Experiments to Run

| Experiment | Hypothesis | Success Metric |
|------------|------------|----------------|
| Frame queue vs drop | Queue improves smoothness | 30% reduction in frame drops |
| Redis vs in-memory lockout | Redis reduces bypass | Zero lockouts lost on restart |
| Bitmap vs ImageData transfer | Bitmap faster on mobile | 30% FPS improvement |
| LRU vs FIFO audio cache | LRU improves cache hit | 50% reduction in loads |

---

## Complete File List

### Backend (Python) - 35 files
- account_lockout_service.py
- refresh_token_service.py
- cache_service.py
- audit_service.py
- game_service.py
- progress_service.py
- user_service.py
- profile_service.py
- security.py
- validation.py
- rate_limit.py
- config.py
- email.py
- deps.py
- main.py
- auth.py, games.py, users.py, progress.py, profile_photos.py, issue_reports.py (endpoints)
- user.py, profile.py, progress.py, game.py, refresh_token.py, achievement.py, audit_log.py (models)
- user.py, progress.py, profile.py, game.py, token.py, verification.py, issue_report.py (schemas)
- session.py, base_class.py
- api.py (v1 router)
- games_data.py

### Frontend (React/TypeScript) - 192 files

**Hooks (27)**
- useGameHandTracking.ts, useGameLoop.ts, useVisionWorkerRuntime.ts
- useTTS.ts, useHandTracking.ts, useFeatureDetection.ts
- useProgressSync.ts, useMicrophoneInput.ts, useInactivityDetector.ts
- useEyeTracking.ts, useVoicePrompt.ts, usePhonics.ts
- useProgressMetrics.ts, useGameDrops.ts, useSessionTimer.ts
- useSoundEffects.ts, useKenneyAudio.ts
- useGameSession.ts, useAttentionDetection.ts, usePostureDetection.ts
- useHandClick.ts, useIssueRecorder.ts, useGameSessionProgress.ts
- useInitialCameraPermission.ts

**Stores (9)**
- authStore.ts, profileStore.ts, progressStore.ts
- settingsStore.ts, gameStore.ts, inventoryStore.ts
- characterStore.ts, socialStore.ts, storyStore.ts

**Utils (38)**
- api.ts, progressTracking.ts, coordinateTransform.ts
- landmarkUtils.ts, handTrackingFrame.ts, pinchDetection.ts
- oneEuroFilter.ts, featureDetection.ts, imageAssets.ts
- reportExport.ts, drawing.ts, hitTest.ts, iconUtils.ts
- gestureRecognizer.ts, random.ts, errorMessages.ts
- progressCalculations.ts, letterColorClass.ts, calmMode.ts
- audioManager.ts, assets.ts, haptics.ts

**Components (55)**
- Dashboard.tsx, Login.tsx, Home.tsx, Settings.tsx
- Progress.tsx, Register.tsx, Games.tsx
- EmojiMatch.tsx, BubblePop.tsx, AlphabetGame.tsx
- LetterHunt.tsx, MirrorDraw.tsx, FreeDraw.tsx
- NumberTracing.tsx, MusicPinchBeat.tsx, ConnectTheDots.tsx
- GameCard.tsx, GameCanvas.tsx, GameLayout.tsx
- GlobalErrorBoundary.tsx, Mascot.tsx, Toast.tsx
- Button.tsx, ParentGate.tsx, CameraPermissionPrompt.tsx
- CelebrationOverlay.tsx, AdventureMap.tsx
- WellnessTimer.tsx, WellnessReminder.tsx, WellnessDashboard.tsx

**Game Logic (20+)**
- emojiMatchLogic.ts, targetPracticeLogic.ts, hitTarget.ts
- memoryMatchLogic.ts, colorByNumberLogic.ts, mathMonstersLogic.ts
- rhymeTimeLogic.ts, bubblePopLogic.ts, freeDrawLogic.ts

**Workers & Protocols**
- vision.worker.ts, vision.protocol.ts
- tts.worker.ts

**Data Files (12)**
- gameRegistry.ts, languages.ts, worlds.ts
- collectibles.ts, easterEggs.ts, quests.ts
- recipes.ts, alphabets.ts, pipResponses.ts

---

*Generated from: docs/analysis/multi_viewpoint_code_analysis.md*
