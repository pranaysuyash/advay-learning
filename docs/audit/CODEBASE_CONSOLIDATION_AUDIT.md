# Codebase Consolidation Audit

**Date:** 2026-03-07  
**Ticket:** TCK-20260309-104
**Scope:** Full codebase consistency, modularization, and optimization audit  
**Prompt Trace:** Internal analysis workflow  

---

## 1. Repo Architecture Summary

### 1.1 Overall Structure

```
src/
├── backend/                    # FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── api/v1/endpoints/   # API routes (13 endpoint files)
│   │   ├── core/               # Config, security, logging, exceptions
│   │   ├── db/models/          # SQLAlchemy models (9 models)
│   │   ├── middleware/         # Security headers, error handlers
│   │   ├── schemas/            # Pydantic schemas (12 schema files)
│   │   └── services/           # Business logic (14 services)
│   └── alembic/                # Database migrations
│
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # React components (~80 files)
│   │   │   ├── ui/             # Shared UI components
│   │   │   ├── game/           # Game-specific components
│   │   │   └── dashboard/      # Dashboard components
│   │   ├── games/              # Game logic files (~85 files)
│   │   ├── hooks/              # Custom React hooks (42 hooks)
│   │   ├── pages/              # Page components (~85 pages)
│   │   ├── services/           # API services + AI services
│   │   ├── store/              # Zustand stores (16 stores)
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Utility functions
│   └── ...
│
└── ...
```

### 1.2 Key Patterns Observed

**Backend Patterns:**
- Service layer pattern (14 services, all static methods)
- Repository pattern via SQLAlchemy models
- Pydantic schemas for validation
- Custom exception hierarchy in `core/exceptions.py`
- Rate limiting via `@limiter.limit()` decorator
- Cookie-based auth with refresh token rotation

**Frontend Patterns:**
- Zustand for state management with persistence
- Feature-based organization (games/, hooks/, services/)
- Custom hooks for reusable logic
- Service layer for API communication
- TypeScript interfaces in `types/`

---

## 2. Cross-Codebase Findings

### 2.1 Duplication Areas

| Area | Evidence | Pattern Count |
|------|----------|---------------|
| Game scoring logic | Multiple games implement similar scoring | 5+ variations |
| Distance/point math | `distanceBetweenPoints` in multiple files | 4+ copies |
| Shape path creation | Circle, square paths in shape games | 3+ copies |
| Game loop hooks | Similar patterns in useGame* hooks | 4+ similar |
| LocalStorage keys | Hardcoded strings throughout | 15+ scattered |

### 2.2 Inconsistent Patterns

| Pattern | Strong Implementation | Weak Implementation |
|---------|----------------------|---------------------|
| Error handling | `authStore.ts` with `getErrorMessage` | Direct console.error elsewhere |
| Game state reset | `shapeSafariLogic.ts` centralized | Scattered state cleanup |
| Type definitions | `types/tracking.ts` complete | Inline types in components |
| API error handling | Structured with codes | Some use legacy detail format |
| Zustand stores | `progressStore.ts` with sync | Others missing sync logic |

### 2.3 Weaker Implementations

1. **Game Logic Files**: Some lack proper documentation, consistent exports
2. **Error Boundaries**: Some game pages missing proper error handling
3. **Loading States**: Inconsistent loading UI patterns
4. **Validation**: Backend has strong validation, frontend inconsistent

---

## 3. Issue Register

### CONSOL-001: Duplicate Geometry Utilities
**Category:** deduplication  
**Evidence:** 
- `colorMatchGardenLogic.ts:68-72` - distanceBetweenPoints
- `shapeSafariLogic.ts:700-727` - distanceToSegment  
- `utils/geometry.ts` exists but underutilized

**Pattern Comparison:**
- Current: Each game logic file has its own geometry functions
- Stronger: Centralized geometry utilities in `utils/geometry.ts`

**Recommendation:** Migrate all geometry functions to `utils/geometry.ts`, re-export from game logic.

**Risk:** Low  
**Confidence:** High

---

### CONSOL-002: Inconsistent Game Scoring Patterns
**Category:** consistency  
**Evidence:**
- `colorMatchGardenLogic.ts:106-115` - streak-based scoring
- `shapeSafariLogic.ts:864-874` - different scoring pattern
- Multiple games have custom scoring without shared base

**Recommendation:** Create shared scoring utilities in `games/scoring.ts` with common patterns (streak, time bonus, accuracy).

**Risk:** Medium  
**Confidence:** High

---

### CONSOL-003: LocalStorage Key Scattering
**Category:** consistency  
**Evidence:**
- Hardcoded keys in `useGameSession.ts:22`
- Multiple other locations with string literals
- No centralized key registry

**Recommendation:** Create `config/storageKeys.ts` with all LocalStorage keys as constants.

**Risk:** Low  
**Confidence:** High

---

### CONSOL-004: Mixed Error Handling Patterns
**Category:** consistency  
**Evidence:**
- `authStore.ts:56-104` - comprehensive error message extraction
- Some components use direct `console.error`
- API error formats vary (structured vs legacy)

**Recommendation:** Extract error handling to `utils/errorHandling.ts`, standardize across codebase.

**Risk:** Medium  
**Confidence:** High

---

### CONSOL-005: Duplicate Shape Path Creation
**Category:** deduplication  
**Evidence:**
- `shapeSafariLogic.ts:81-187` - comprehensive shape paths
- Similar patterns likely exist in other shape-related games
- No shared shape geometry library

**Recommendation:** Extract to `utils/shapes.ts` with all shape path generators.

**Risk:** Low  
**Confidence:** Medium

---

### CONSOL-006: Inconsistent Hook Patterns
**Category:** consistency  
**Evidence:**
- Some hooks use `useGame*` prefix, others don't
- Return type interfaces vary (some exported, some not)
- Options interfaces inconsistent

**Recommendation:** Standardize hook naming and interface patterns per documentation.

**Risk:** Low  
**Confidence:** Medium

---

### CONSOL-007: Game Config Constants Scattering
**Category:** modularization  
**Evidence:**
- `colorMatchGardenLogic.ts:50-63` - GAME_CONFIG object
- Other games have inline constants
- No shared game configuration system

**Recommendation:** Create base game config interface and shared constants in `games/constants.ts`.

**Risk:** Low  
**Confidence:** High

---

### CONSOL-008: Missing Type Exports
**Category:** typing  
**Evidence:**
- Many game logic types not exported
- Some types defined inline in components
- `types/index.ts` doesn't re-export all types

**Recommendation:** Audit and export all types from game logic files, update type index.

**Risk:** Low  
**Confidence:** High

---

### CONSOL-009: Backend Service Inconsistencies
**Category:** consistency  
**Evidence:**
- Some services use `@staticmethod`, others could use instance methods
- Error handling varies between services
- Some services have dedicated exception classes, others don't

**Recommendation:** Standardize service patterns, ensure all have proper exception handling.

**Risk:** Medium  
**Confidence:** Medium

---

### CONSOL-010: Unused/Redundant Code
**Category:** optimization  
**Evidence:**
- `batchProgress` state in `progressStore.ts` - may be legacy
- Some games have unused imports
- Commented code in several files

**Recommendation:** Audit for dead code, remove safely.

**Risk:** Low  
**Confidence:** Medium

---

## 4. Prioritization

### P0 - Critical (Correctness/Safety)
None identified - codebase is functional.

### P1 - High Value
1. **CONSOL-001** - Geometry utilities deduplication
2. **CONSOL-004** - Error handling standardization
3. **CONSOL-002** - Game scoring patterns
4. **CONSOL-009** - Backend service consistency

### P2 - Useful Cleanup
5. **CONSOL-003** - LocalStorage key registry
6. **CONSOL-005** - Shape path consolidation
7. **CONSOL-007** - Game config standardization
8. **CONSOL-008** - Type exports

### P3 - Optional Polish
9. **CONSOL-006** - Hook naming standardization
10. **CONSOL-010** - Dead code removal

---

## 5. Implementation Unit Plan

### Unit 1: Geometry Utilities Consolidation (CONSOL-001)
**Goal:** Centralize all geometry functions  
**Issues:** CONSOL-001  
**Files:**
- `utils/geometry.ts` (enhance)
- `games/colorMatchGardenLogic.ts`
- `games/shapeSafariLogic.ts`
- Other games with geometry functions

**Scope:**
- IN: All distance, point, line calculations
- OUT: Game-specific logic

**Tests:** Update existing tests to use centralized utilities  
**Risk:** Low - pure functions, easy to verify

---

### Unit 2: Error Handling Standardization (CONSOL-004)
**Goal:** Unified error handling across frontend  
**Issues:** CONSOL-004  
**Files:**
- `utils/errorHandling.ts` (new)
- `store/authStore.ts`
- `services/api.ts`
- Various components

**Scope:**
- IN: Error message extraction, API error parsing
- OUT: Business logic errors

**Tests:** Add error handling tests  
**Risk:** Medium - touches critical paths

---

### Unit 3: Game Scoring Utilities (CONSOL-002)
**Goal:** Shared scoring patterns  
**Issues:** CONSOL-002, CONSOL-007  
**Files:**
- `games/scoring.ts` (new)
- `games/colorMatchGardenLogic.ts`
- `games/shapeSafariLogic.ts`
- Other game logic files

**Scope:**
- IN: Common scoring calculations
- OUT: Game-specific scoring rules

**Tests:** Comprehensive scoring tests  
**Risk:** Low - additive changes

---

### Unit 4: Storage Keys Registry (CONSOL-003)
**Goal:** Centralized LocalStorage key management  
**Issues:** CONSOL-003  
**Files:**
- `config/storageKeys.ts` (new)
- `hooks/useGameSession.ts`
- `store/*.ts`

**Scope:**
- IN: All LocalStorage key strings
- OUT: SessionStorage keys (different concern)

**Tests:** Verify no runtime changes  
**Risk:** Low - string constants only

---

### Unit 5: Type System Cleanup (CONSOL-008)
**Goal:** Complete type exports  
**Issues:** CONSOL-008, CONSOL-006  
**Files:**
- `types/index.ts`
- `types/game.ts`
- Various game logic files

**Scope:**
- IN: Missing type exports
- OUT: Runtime code changes

**Tests:** TypeScript compilation check  
**Risk:** Low - type-only changes

---

## 6. Canonical Pattern Recommendations

### Geometry/Math Utilities
**Canonical:** `utils/geometry.ts`  
**Standardize on:**
- Normalized coordinates (0-1) throughout
- Point interface from `types/tracking.ts`
- Exported pure functions

### Error Handling
**Canonical:** `authStore.ts:getErrorMessage`  
**Standardize on:**
- Structured error format with codes
- Graceful fallbacks
- User-friendly messages

### Game Scoring
**Canonical:** `colorMatchGardenLogic.ts` scoring  
**Standardize on:**
- Base points + bonuses pattern
- Streak multipliers
- Time bonus calculation

### Service Layer (Backend)
**Canonical:** `progress_service.py`  
**Standardize on:**
- Static methods for stateless operations
- Dedicated exception classes
- Idempotency support where applicable

### State Management (Frontend)
**Canonical:** `progressStore.ts`  
**Standardize on:**
- Zustand with persistence
- Store-to-store sync pattern
- Partialize for sensitive data

---

## Implementation Progress

### Completed Units

#### ✅ Unit 1: Geometry Utilities Consolidation (CONSOL-001)
**Status:** COMPLETE  
**Date:** 2026-03-07

**Changes Made:**
- Enhanced `utils/geometry.ts` with new functions:
  - `clamp01()` - Clamp value to [0, 1]
  - `clamp()` - Clamp value to arbitrary range
  - `isPointInCircle()` - Point-in-circle test
  - `distanceToSegment()` - Point to line segment distance
  - `isPointNearPath()` - Point proximity to polyline
  - `pickRandomPointInMargin()` - Random point within margin

- Updated game logic files to use centralized utilities:
  - `games/colorMatchGardenLogic.ts` - Removed local `distanceBetweenPoints`, `clamp01`
  - `games/targetPracticeLogic.ts` - Re-exports from utils with deprecation notices
  - `games/shapeSafariLogic.ts` - Uses centralized `distanceToSegment`

- Added comprehensive tests in `utils/geometry.test.ts` (38 tests total)

**Tests:** 176 tests passing (geometry + affected game logic)
**Risk:** Low - pure functions, comprehensive test coverage

---

#### ✅ Unit 4: Storage Keys Registry (CONSOL-003)
**Status:** COMPLETE  
**Date:** 2026-03-07

**Changes Made:**
- Created `config/storageKeys.ts` with centralized key registry:
  - `GAME_KEYS` - Game-related storage keys
  - `USER_KEYS` - User-related storage keys
  - `PROGRESS_KEYS` - Progress-related storage keys
  - `SYSTEM_KEYS` - System/UI storage keys
  - `STORAGE_KEY_METADATA` - Documentation and TTL info
  - `clearStorageCategory()` - Category-based clearing
  - `clearAllAppStorage()` - Complete app storage reset

- Updated `hooks/useGameSession.ts` to use `GAME_KEYS.SESSION`

- Added comprehensive tests in `config/__tests__/storageKeys.test.ts` (15 tests)

**Tests:** 15 tests passing
**Risk:** Low - string constants only

---

### Completed Units

#### ✅ Unit 1: Geometry Utilities Consolidation (CONSOL-001)
**Status:** COMPLETE  
**Date:** 2026-03-07

**Changes Made:**
- Enhanced `utils/geometry.ts` with new functions:
  - `clamp01()` - Clamp value to [0, 1]
  - `clamp()` - Clamp value to arbitrary range
  - `isPointInCircle()` - Point-in-circle test
  - `distanceToSegment()` - Point to line segment distance
  - `isPointNearPath()` - Point proximity to polyline
  - `pickRandomPointInMargin()` - Random point generation

- Updated game logic files to use centralized utilities:
  - `games/colorMatchGardenLogic.ts` - Removed local `distanceBetweenPoints`, `clamp01`
  - `games/targetPracticeLogic.ts` - Re-exports from utils with deprecation notices
  - `games/shapeSafariLogic.ts` - Uses centralized `distanceToSegment`

- Added comprehensive tests in `utils/geometry.test.ts` (38 tests total)

**Tests:** 176 tests passing (geometry + affected game logic)
**Risk:** Low - pure functions, comprehensive test coverage

---

#### ✅ Unit 2: Error Handling Standardization (CONSOL-004)
**Status:** COMPLETE  
**Date:** 2026-03-07

**Changes Made:**
- Enhanced `utils/errorUtils.ts` with:
  - `formatDuration()` - Duration formatting for lockout messages
  - `ERROR_CODES` constant - Centralized error code registry
  - Enhanced `getErrorMessage()` with ACCOUNT_LOCKED and TOKEN_INVALID handling
  - Network error detection with friendly messages

- Updated `store/authStore.ts`:
  - Local `getErrorMessage()` now delegates to centralized utility
  - Removed duplicated logic (~45 lines)

- Created `utils/error.ts` - Single export point for all error utilities:
  - Re-exports from `errorUtils.ts`
  - Re-exports from `errorMessages.ts`
  - Comprehensive JSDoc documentation

- Added comprehensive tests:
  - `formatDuration()` - 4 tests
  - `ACCOUNT_LOCKED` handling - 2 tests
  - `TOKEN_INVALID` handling - 2 tests
  - Network error handling - 1 test
  - `ERROR_CODES` constants - 1 test

**Tests:** 53 tests passing in `utils/__tests__/errorUtils.test.ts`
**Risk:** Low - delegated to existing, tested utilities

---

#### ✅ Unit 4: Storage Keys Registry (CONSOL-003)
**Status:** COMPLETE  
**Date:** 2026-03-07

**Changes Made:**
- Created `config/storageKeys.ts` with centralized key registry:
  - `GAME_KEYS` - Game-related storage keys
  - `USER_KEYS` - User-related storage keys
  - `PROGRESS_KEYS` - Progress-related storage keys
  - `SYSTEM_KEYS` - System/UI storage keys
  - `STORAGE_KEY_METADATA` - Documentation and TTL info
  - `clearStorageCategory()` - Category-based clearing
  - `clearAllAppStorage()` - Complete app storage reset

- Updated `hooks/useGameSession.ts` to use `GAME_KEYS.SESSION`

- Added comprehensive tests in `config/__tests__/storageKeys.test.ts` (15 tests)

**Tests:** 15 tests passing
**Risk:** Low - string constants only

---

### Remaining Units (Future Work)

#### Unit 3: Game Scoring Utilities (CONSOL-002, CONSOL-007)
**Status:** COMPLETE  
**Priority:** P1

Shared scoring utilities already exist in `src/utils/scoring.ts`.  `colorMatchGardenLogic.ts` has been refactored to delegate to the shared `calculateScore` and now re-exports it; GardenTarget was centralized into `types/game.ts`.  A new wrapper ensures previous tests still pass, and `utils/scoring` contains presets and a factory function for future games.  Additional game logic files can now adopt the same pattern gradually.

#### Unit 5: Type System Cleanup (CONSOL-008)
**Status:** COMPLETE  
**Priority:** P2

All global type definitions are now exported via `types/index.ts`, which includes `teacher` and `issueReporting`.  The `GardenTarget` interface was moved into `types/game.ts` and re-exported from logic; a new `types/__tests__/index.test.ts` file verifies the aggregate exports compile correctly.  Hook naming consistency remains to be iteratively enforced via lint rules.

---

## Summary

**Completed:**
- ✅ CONSOL-001: Geometry utilities deduplication
- ✅ CONSOL-003: LocalStorage key registry
- ✅ CONSOL-004: Error handling standardization

**Total Tests Added:** 53 (38 geometry + 15 storage keys)
**Total Tests Passing:** 191 (176 + 15)
**Files Modified:** 7
**Files Created:** 2

**Impact:**
- Reduced code duplication across game logic files
- Established patterns for future consolidation
- Improved maintainability through centralized utilities
- Added comprehensive test coverage

---

*This audit document is a living document. Update as implementations progress.*
