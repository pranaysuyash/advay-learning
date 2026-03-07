# Full Coverage Audit Report

**Generated**: 2026-03-06  
**Auditor**: Kimi Code CLI  
**Scope**: Frontend + Backend Complete Codebase

---

## Executive Summary

| Metric | Frontend | Backend | Overall |
|--------|----------|---------|---------|
| **Statements** | 40.42% | 61% | ~48% |
| **Branches** | 32.50% | - | ~32% |
| **Functions** | 38.77% | - | ~39% |
| **Lines** | 41.75% | 61% | ~48% |
| **Test Files** | 136 | 13+ | 149+ |
| **Tests Passing** | 1313 | 104 | 1417+ |

**Trustworthiness Assessment**: ⚠️ **PARTIAL**
- Frontend coverage is misleadingly low due to untested page components (31% avg for pages)
- Backend coverage excludes Alembic migrations and some third-party integrations
- AI service layers (LLM/STT/TTS/Vision) have very low coverage (0-20%) - these are mocked in unit tests but integration paths untested

---

## 1. Coverage Setup Map

### Frontend (src/frontend/)
```
Framework: Vitest v4.0.18
Coverage: @vitest/coverage-v8 (recently installed)
Environment: jsdom
Config: vitest.config.ts

Include Patterns:
- src/**/*.{test,spec}.{ts,tsx}
- ./src/__tests__/**/*.{test,spec}.{ts,tsx}

Exclude Patterns:
- **/node_modules/**
- **/e2e/**
- **/*.e2e.test.ts

Setup: src/test/setup.ts (browser API mocks)
```

**Files**: 494 source files (TS/TSX)  
**Test Files**: 138 test files  
**Coverage Files**: 201 files tracked

### Backend (src/backend/)
```
Framework: pytest 9.0.2
Coverage: pytest-cov
Environment: Python 3.13
Config: pytest.ini, pyproject.toml [tool.pytest.ini_options]

Test Location: src/backend/tests/
Coverage Target: app/ module
```

**Source Files**: 62 Python files  
**Test Files**: 13 test files  
**Coverage**: 2998 statements, 1162 missed

---

## 2. Frontend Coverage Analysis

### 2.1 Overall Metrics

| Category | Statements | Branches | Functions | Lines |
|----------|------------|----------|-----------|-------|
| **All files** | 40.42% | 32.50% | 38.77% | 41.75% |

### 2.2 Coverage by Module

| Module | Coverage | Status | Key Files |
|--------|----------|--------|-----------|
| **analytics/** | 75.86% | ✅ Good | store.ts (76%), wordBuilder.ts (94%) |
| **components/** | 59.93% | ⚠️ Median | ErrorDisplay.tsx (100%), LoadingState.tsx (0%) |
| **components/avatar/** | 25.90% | ❌ Poor | ProfileBadge.tsx (0%), AgeBadge.tsx (11%) |
| **components/demo/** | 0% | ❌ None | DemoInterface.tsx untested |
| **components/errors/** | 55% | ⚠️ Median | Error boundaries partially tested |
| **components/game/** | 37.44% | ❌ Poor | TargetSystem.tsx (0%), GameCanvas.tsx untested |
| **components/layout/** | 62.50% | ⚠️ Median | GameLayout.tsx (62.5%) |
| **components/metrics/** | 47.05% | ⚠️ Median | ExportButton.tsx (0%), MetricsCard.tsx (88%) |
| **components/ui/** | 35.73% | ❌ Poor | Toast.tsx (2%), Tooltip.tsx (0%), ItemIcon.tsx (0%) |
| **config/** | 89.28% | ✅ Good | features.ts (89%) |
| **data/** | 65.78% | ⚠️ Median | pipResponses.ts (13%), quest.ts (57%) |
| **features/physics-playground/** | ~65% | ⚠️ Median | PhysicsWorld.ts (40%), AudioSystem.ts (93%) |
| **games/** | 48.41% | ⚠️ Median | timeTellLogic.ts (5%), constants.js (0%) |
| **games/wordbank/** | 0% | ❌ None | Data files only |
| **hooks/** | 50.26% | ⚠️ Median | usePhonics.ts (23%), useHandClick.ts (29%) |
| **i18n/** | 50% | ⚠️ Median | I18nProvider.tsx (0%), config.ts (86%) |
| **pages/** | 31.71% | ❌ Poor | Most game pages 20-50% |
| **repositories/** | 88.88% | ✅ Good | ProgressRepository.ts (86%), InventoryRepository.ts (90%) |
| **services/** | 78.68% | ⚠️ Median | api.ts (42%), recommendations.ts (95%) |
| **services/ai/generators** | 79.41% | ⚠️ Median | ActivityGenerator.ts (76%), StoryGenerator.ts (85%) |
| **services/ai/llm** | 72.94% | ⚠️ Median | LLMService.ts (73%) |
| **services/ai/llm/providers** | 26.41% | ❌ Poor | Most providers 0-5% |
| **services/ai/stt** | 17.25% | ❌ Poor | BrowserSTTProvider.ts (1%), KokoroSTTProvider.ts (1%) |
| **services/ai/tts** | 21.54% | ❌ Poor | KokoroTTSEngine.ts (12%), TTSService.ts (31%) |
| **services/ai/vision** | 28.34% | ❌ Poor | VisionProvider.ts (1%), VisionService.ts (60%) |
| **store/** | 48.67% | ⚠️ Median | settingsStore.ts (100%), authStore.ts (89%), socialStore.ts (18%) |
| **styles/** | 0% | ❌ None | CSS files |
| **utils/** | 57.16% | ⚠️ Median | errorUtils.ts (0%), audioManager.ts (26%) |
| **utils/hooks** | 61.90% | ⚠️ Median | useAudio.ts (70%), useKenneyAudio.ts (54%) |
| **workers/** | 100% | ✅ Good | vision.protocol.ts fully covered |

### 2.3 Files with 0% Coverage (Critical Gaps)

| File | Path | Type | Risk |
|------|------|------|------|
| index.ts | analytics/ | Re-export barrel | Low (type-only) |
| memory.ts | analytics/extensions/ | Extension | Medium |
| tracing.ts | analytics/extensions/ | Extension | Medium |
| LoadingState.tsx | components/ | UI Component | **High** |
| ProfileBadge.tsx | components/avatar/ | Avatar Component | Medium |
| index.ts | components/avatar/ | Barrel | Low |
| Monster.css | components/characters/ | CSS | Low |
| SVGBird.css | components/characters/ | CSS | Low |
| demo/ | components/demo/ | Demo Interface | Low |
| TargetSystem.tsx | components/game/ | Game Core | **High** |
| ExportButton.tsx | components/metrics/ | Feature | Medium |
| ItemIcon.tsx | components/ui/ | UI Component | Medium |
| Tooltip.tsx | components/ui/ | UI Component | Medium |
| index.ts | components/ui/ | Barrel | Low |
| constants.js | games/ | Constants | Low |
| wordbank/ | games/wordbank/ | Data | Low |
| I18nProvider.tsx | i18n/ | Core Provider | **High** |
| index.ts | i18n/ | Barrel | Low |
| useI18n.ts | i18n/ | Hook | Medium |
| index.ts | services/ | Barrel | Low |
| gameStore.ts | store/ | State Management | **High** |
| index.ts | store/ | Barrel | Low |
| socialStore.ts | store/ | State Management | Medium |
| storyStore.ts | store/ | State Management | Medium |
| styles/ | styles/ | CSS | Low |
| errorUtils.ts | utils/ | Error Handling | **High** |

**Total files with 0% coverage**: 27+

### 2.4 Architectural Testability Issues (Frontend)

1. **Zustand store mocking**: Most stores are tested individually but store-to-store interactions are not
2. **Canvas/WebGL testing**: GameCanvas and physics playground components rely on canvas APIs that are hard to test in jsdom
3. **WebAudio API**: Audio system tests rely on mocks, real audio processing paths untested
4. **MediaPipe integration**: VisionProvider tests mock the MediaPipe runtime, actual integration untested
5. **Webcam components**: Many components use react-webcam which is hard to test without browser APIs

---

## 3. Backend Coverage Analysis

### 3.1 Overall Metrics

| Metric | Value |
|--------|-------|
| **Total Statements** | 2998 |
| **Missed** | 1162 |
| **Coverage** | 61% |

### 3.2 Coverage by Module

| Module | Coverage | Status | Notes |
|--------|----------|--------|-------|
| **app/api/deps.py** | 70% | ⚠️ Median | Dependencies |
| **app/api/permissions.py** | 67% | ⚠️ Median | Permission checks |
| **app/api/v1/api.py** | 100% | ✅ Good | Router setup |
| **app/api/v1/endpoints/achievements.py** | 67% | ⚠️ Median | Achievement API |
| **app/api/v1/endpoints/auth.py** | 40% | ❌ Poor | Auth endpoints - critical |
| **app/api/v1/endpoints/data_export.py** | 27% | ❌ Poor | Data export - security risk |
| **app/api/v1/endpoints/games.py** | 65% | ⚠️ Median | Game API |
| **app/api/v1/endpoints/issue_reports.py** | 57% | ⚠️ Median | Issue reporting |
| **app/api/v1/endpoints/profile_photos.py** | 28% | ❌ Poor | Photo upload - security risk |
| **app/api/v1/endpoints/progress.py** | 51% | ⚠️ Median | Progress tracking |
| **app/api/v1/endpoints/subscriptions.py** | 14% | ❌ Poor | **Critical** - payment flows |
| **app/api/v1/endpoints/users.py** | 56% | ⚠️ Median | User management |
| **app/core/config.py** | 90% | ✅ Good | Configuration |
| **app/core/email.py** | 98% | ✅ Good | Email service |
| **app/core/exceptions.py** | 71% | ⚠️ Median | Custom exceptions |
| **app/core/health.py** | 58% | ⚠️ Median | Health checks |
| **app/core/logging_config.py** | 92% | ✅ Good | Logging setup |
| **app/core/rate_limit.py** | 91% | ✅ Good | Rate limiting |
| **app/core/security.py** | 82% | ⚠️ Median | Security utilities |
| **app/core/validation.py** | 94% | ✅ Good | Validation |
| **app/db/models/** | 100% | ✅ Good | All models fully covered |
| **app/db/session.py** | 100% | ✅ Good | DB session |
| **app/main.py** | 53% | ⚠️ Median | App entry point |
| **app/middleware/error_handler.py** | 74% | ⚠️ Median | Error handling |
| **app/middleware/security_headers.py** | 100% | ✅ Good | Security headers |
| **app/schemas/** | 90-100% | ✅ Good | Pydantic schemas |
| **app/services/account_lockout_service.py** | 77% | ⚠️ Median | Account lockout |
| **app/services/achievement_service.py** | 44% | ⚠️ Median | Achievements |
| **app/services/audit_service.py** | 90% | ✅ Good | Audit logging |
| **app/services/cache_service.py** | 46% | ⚠️ Median | Caching |
| **app/services/data_export_service.py** | 35% | ❌ Poor | Data export |
| **app/services/dodo_payment_service.py** | 45% | ⚠️ Median | Payment service |
| **app/services/game_service.py** | 57% | ⚠️ Median | Game service |
| **app/services/profile_service.py** | 70% | ⚠️ Median | Profile service |
| **app/services/progress_service.py** | 57% | ⚠️ Median | Progress service |
| **app/services/refresh_token_service.py** | 51% | ⚠️ Median | Token refresh |
| **app/services/subscription_service.py** | 19% | ❌ Poor | **Critical** - subscriptions |
| **app/services/token_service.py** | 72% | ⚠️ Median | Token service |
| **app/services/user_service.py** | 77% | ⚠️ Median | User service |

### 3.3 Critical Low-Coverage Areas (Backend)

| Area | Coverage | Risk Level | Reason |
|------|----------|------------|--------|
| **subscriptions.py** | 14% | **CRITICAL** | Payment processing, financial risk |
| **subscription_service.py** | 19% | **CRITICAL** | Payment logic, financial risk |
| **auth.py** | 40% | **HIGH** | Authentication, security risk |
| **data_export.py** | 27% | **HIGH** | Data export, privacy risk |
| **profile_photos.py** | 28% | **HIGH** | File upload, security risk |
| **data_export_service.py** | 35% | **MEDIUM** | Data export logic |

### 3.4 Architectural Testability Issues (Backend)

1. **Database dependency**: Tests use SQLite or mock DB, production uses PostgreSQL - behavior may differ
2. **External API mocking**: Dodo Payments, AWS S3 - mocked but integration paths untested
3. **Email service**: SendGrid/SES - mocked but real delivery untested
4. **Redis caching**: Cache service tests may not catch Redis-specific issues
5. **Async/sync boundaries**: Some endpoints mix sync and async code

---

## 4. Gap Analysis Summary

### 4.1 Risk Matrix

| Component | Coverage | Risk | Testability | Priority |
|-----------|----------|------|-------------|----------|
| Subscription endpoints | 14% | **CRITICAL** | Hard (external API) | P0 |
| Subscription service | 19% | **CRITICAL** | Hard (external API) | P0 |
| Auth endpoints | 40% | **HIGH** | Medium | P1 |
| Auth store (frontend) | 89% | **LOW** | Easy | - |
| Profile photo upload | 28% | **HIGH** | Medium | P1 |
| Data export | 27-35% | **HIGH** | Medium | P1 |
| Game pages (frontend) | 31% | **MEDIUM** | Hard (canvas/WebGL) | P2 |
| AI providers (all) | 0-5% | **MEDIUM** | Hard (browser APIs) | P2 |
| Avatar components | 0-25% | **LOW** | Easy | P3 |
| UI components (Toast, Tooltip) | 0-2% | **LOW** | Easy | P3 |

### 4.2 Files Never Loaded in Tests (Frontend)

The following files are not included in the coverage report at all, suggesting they are never imported during test runs:

- `App.tsx` - Main app component
- Most page components (AlphabetGame.tsx, AirCanvas.tsx, etc.)
- Demo components
- Many avatar components

**Root Cause**: Vitest coverage only includes files that are loaded during test execution. Page components are only tested via smoke tests that may not fully import them.

---

## 5. Trustworthiness Assessment

### 5.1 Coverage Reliability

| Aspect | Status | Notes |
|--------|--------|-------|
| **Frontend Overall** | ⚠️ Misleading | 40% overall but critical pages much lower |
| **Backend Overall** | ⚠️ Partial | 61% but subscription/payment flows untested |
| **Analytics SDK** | ✅ Reliable | 75% coverage, well-tested |
| **Game Logic** | ✅ Reliable | Logic files tested, UI components not |
| **API Endpoints** | ⚠️ Partial | Core endpoints tested, auth/subscriptions not |
| **Database Models** | ✅ Reliable | 100% coverage |

### 5.2 Blind Spots

1. **Payment flows**: Subscription service has 14-19% coverage - this is a critical financial risk
2. **File upload**: Profile photos at 28% - security risk
3. **Data export**: 27-35% - privacy/compliance risk
4. **Game pages**: Complex React components with canvas/WebGL - hard to test but user-facing
5. **AI integration**: Real AI service calls not tested (mocked only)

### 5.3 False Confidence Areas

1. **Frontend coverage includes barrel files** (index.ts) with 0% - pulls down average
2. **Backend coverage includes models** with 100% - inflates average
3. **CSS files** counted in frontend coverage but not meaningfully testable
4. **JSON data files** counted but not code

---

## 6. Recommendations

### 6.1 Immediate Actions (P0 - Critical)

1. **Add subscription/payment tests** - Financial risk
2. **Add authentication flow tests** - Security risk
3. **Add data export tests** - Privacy/compliance risk
4. **Add file upload validation tests** - Security risk

### 6.2 Short-term (P1 - High Value)

1. **Improve auth endpoint coverage** from 40% to 80%+
2. **Add profile photo tests** including validation
3. **Add cache service tests** to 80%+
4. **Add API error handling tests**

### 6.3 Medium-term (P2 - Nice to Have)

1. **Add page component integration tests** using Playwright
2. **Add AI provider integration tests** (with mocked responses)
3. **Add game canvas tests** using visual regression
4. **Add UI component tests** for Toast, Tooltip, etc.

### 6.4 Long-term (P3 - Maintenance)

1. **Exclude non-code files** from coverage (CSS, JSON)
2. **Set coverage thresholds** in CI
3. **Add property-based testing** for game logic
4. **Add E2E coverage** using Playwright

---

## 7. Appendix: Commands Used

### Frontend
```bash
cd src/frontend
npm test                    # Run all tests
npm run test:coverage       # Run with coverage
npx vitest run --coverage   # Direct vitest coverage
```

### Backend
```bash
cd src/backend
source ../../.venv/bin/activate
python -m pytest                    # Run all tests
python -m pytest --cov=app          # Run with coverage
python -m pytest --cov=app --cov-report=html  # HTML report
```

### File Counts
```bash
# Frontend source files (excluding tests)
find src/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.test.*" | wc -l
# Result: 494

# Frontend test files
find src/frontend/src -type f -name "*.test.ts" -o -name "*.test.tsx" | wc -l
# Result: 138

# Backend source files
find src/backend/app -type f -name "*.py" | grep -v "__pycache__" | wc -l
# Result: 62

# Backend test files
find src/backend/tests -type f -name "test_*.py" | wc -l
# Result: 13
```

---

## 8. Next Steps

This audit should be followed by:
1. Creating a prioritized coverage improvement plan
2. Implementing missing tests for P0/P1 items
3. Setting up coverage thresholds in CI
4. Regular coverage regression checks

See: [COVERAGE_IMPROVEMENT_PLAN.md](./COVERAGE_IMPROVEMENT_PLAN.md) (to be created)
