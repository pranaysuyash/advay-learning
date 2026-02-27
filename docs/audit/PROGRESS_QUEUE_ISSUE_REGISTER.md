# Progress Queue Issue Register

**Ticket**: TCK-20260227-007  
**Ticket Stamp**: STAMP-20260227T051642Z-codex-lovy  
**Source Audit**: `docs/performance/multi-viewpoint-analysis-progressStore-2026-02-23.md`  
**Date**: 2026-02-27  
**Status**: IN PROGRESS

---

## Issue Register (Consolidated & Deduplicated)

### ISSUE-001: No Duplicate ID Prevention
| Field | Value |
|-------|-------|
| **Title** | Add ID uniqueness invariant to prevent duplicate progress items |
| **Category** | Correctness / Bug |
| **Source Mentions** | **Explicit**: "Duplicate ID Detection Missing" - Viewpoint 3, Lines 439-482; **Implicit**: Current `enqueue()` pushes without checking uniqueness (`src/frontend/src/services/progressQueue.ts:29`) |
| **Current Behavior** | Same idempotency_key can be enqueued multiple times, creating duplicate entries |
| **Root Cause** | No Set-based tracking or uniqueness check before push |
| **Impact** | Data corruption, incorrect progress calculations, sync conflicts |
| **Evidence** | `items.push({ ...item, status: 'pending' })` - no prior existence check |

### ISSUE-002: No Input Validation
| Field | Value |
|-------|-------|
| **Title** | Add schema validation for ProgressItem fields |
| **Category** | Security / Correctness |
| **Source Mentions** | **Explicit**: "No Input Validation" - Viewpoint 5, Lines 735-773; **Implicit**: `enqueue(item: ProgressItem)` accepts any object shape |
| **Current Behavior** | Malformed items can be stored, causing runtime errors on retrieval |
| **Root Cause** | No Zod or manual validation; TypeScript types only enforced at compile time |
| **Impact** | Store corruption, crashes in downstream code, potential injection |
| **Evidence** | No validation in `enqueue()` function before `save()` |

### ISSUE-003: No Retry Logic for Failed Sync
| Field | Value |
|-------|-------|
| **Title** | Implement exponential backoff retry for failed sync operations |
| **Category** | Reliability |
| **Source Mentions** | **Explicit**: "No Retry with Exponential Backoff" - Viewpoint 6, Lines 872-940; **Implicit**: `markSynced` only updates status once |
| **Current Behavior** | Failed syncs stay in 'error' state permanently; no automatic retry |
| **Root Cause** | No retry counter, no backoff strategy, no failure recovery |
| **Impact** | Lost progress on transient failures (network blips), poor offline experience |
| **Evidence** | `markSynced` sets status once; no retry mechanism visible |

### ISSUE-004: O(n) Lookups Cause Performance Degradation
| Field | Value |
|-------|-------|
| **Title** | Add Map-based indexing for O(1) progress item lookups |
| **Category** | Performance |
| **Source Mentions** | **Explicit**: "O(n²) Array Operations" - Viewpoint 4, Lines 550-634; **Implicit**: `getPending()` filters entire array |
| **Current Behavior** | Linear scan for every lookup; queue processing is O(n²) |
| **Root Cause** | Arrays without indexes; no normalization |
| **Impact** | UI slowdown with 100+ items; battery drain on mobile |
| **Evidence** | `load().filter(...)` in `getPending()` - scans all items |

### ISSUE-005: No Dead Letter Queue
| Field | Value |
|-------|-------|
| **Title** | Add dead letter queue for permanently failed items |
| **Category** | Reliability / UX |
| **Source Mentions** | **Explicit**: "No Dead Letter Queue" - Viewpoint 6, Lines 942-1022; **Implicit**: Failed items accumulate or are lost |
| **Current Behavior** | Max-retry items stay in queue or are silently dropped |
| **Root Cause** | No final destination for unrecoverable failures |
| **Impact** | Silent data loss; no visibility for debugging; user confusion |
| **Evidence** | No dead letter mechanism in current implementation |

### ISSUE-006: No Offline Status Visibility
| Field | Value |
|-------|-------|
| **Title** | Add sync status indicator for offline/online state |
| **Category** | UX / Product |
| **Source Mentions** | **Explicit**: "No Offline Detection/Indication" - Viewpoint 8, Lines 1412-1476; **Implicit**: No navigator.onLine checks |
| **Current Behavior** | User has no visibility into sync state |
| **Root Cause** | No sync status modeling in state |
| **Impact** | User anxiety about progress loss; support requests |
| **Evidence** | No sync-related UI components found |

### ISSUE-007: No Circuit Breaker for Rapid Operations
| Field | Value |
|-------|-------|
| **Title** | Add circuit breaker to prevent queue overflow from rapid game events |
| **Category** | Reliability |
| **Source Mentions** | **Explicit**: "No Circuit Breaker" - Viewpoint 6, Lines 1024-1081; **Implicit**: Games could enqueue rapidly |
| **Current Behavior** | No rate limiting; potential for memory bloat |
| **Root Cause** | No throttling or debouncing on enqueue |
| **Impact** | localStorage quota exceeded; UI freezing |
| **Evidence** | No rate limiting in `enqueue()` |

### ISSUE-008: Poor Testability - No DI
| Field | Value |
|-------|-------|
| **Title** | Extract repository interface for dependency injection |
| **Category** | Testing / Architecture |
| **Source Mentions** | **Explicit**: "No Testability Hooks" - Viewpoint 7, Lines 1089-1159 |
| **Current Behavior** | Direct localStorage coupling; hard to mock |
| **Root Cause** | No architectural seams; tight coupling |
| **Impact** | Flaky tests; low coverage; fear of refactoring |
| **Evidence** | `localStorage` directly accessed in module |

---

## Prioritization

### Rubric (1-5 scale)
- **Severity**: 5 = data loss/corruption, 4 = functionality broken, 3 = degraded experience, 2 = inconvenience, 1 = cosmetic
- **Frequency**: 5 = every user/session, 4 = common, 3 = occasional, 2 = rare, 1 = edge case
- **Blast Radius**: 5 = all users/all games, 4 = all users/some games, 3 = some users, 2 = specific scenarios, 1 = single user
- **Effort**: 1 = hours, 2 = half day, 3 = day, 4 = 2-3 days, 5 = week+
- **Confidence**: 5 = clear repro, 4 = strong evidence, 3 = likely, 2 = uncertain, 1 = unknown

| Issue | Severity | Frequency | Blast | Effort | Confidence | Score* | Priority |
|-------|----------|-----------|-------|--------|------------|--------|----------|
| ISSUE-001 | 5 | 4 | 5 | 1 | 5 | 100 | **P0** |
| ISSUE-002 | 4 | 4 | 5 | 1 | 5 | 80 | **P0** |
| ISSUE-003 | 5 | 3 | 5 | 3 | 4 | 60 | **P1** |
| ISSUE-005 | 4 | 3 | 4 | 3 | 4 | 48 | **P1** ✅ RESOLVED |
| ISSUE-007 | 3 | 3 | 4 | 1 | 4 | 48 | **P1** |
| ISSUE-004 | 3 | 2 | 3 | 3 | 5 | 24 | **P2** |
| ISSUE-006 | 2 | 4 | 5 | 3 | 4 | 32 | **P2** |
| ISSUE-008 | 2 | 3 | 3 | 4 | 5 | 18 | **P3** |

*Score = (Severity × Frequency × Blast × Confidence) / Effort

### Queues

**P0 - Critical (Do First)**:
- ISSUE-001: Duplicate prevention (data integrity)
- ISSUE-002: Input validation (security/correctness)

**P1 - High (Do Next)**:
- ISSUE-003: Retry logic (reliability) - IN PROGRESS
- ISSUE-005: Dead letter queue (visibility) - ✅ RESOLVED
- ISSUE-007: Circuit breaker (protection)

**P2 - Medium (Do Later)**:
- ISSUE-004: Performance indexing
- ISSUE-006: Offline UI

**P3 - Low (Backlog)**:
- ISSUE-008: Testability refactor

### Quick Wins (High Impact, Low Effort)
- ISSUE-001: Duplicate prevention (S effort, prevents data corruption)
- ISSUE-002: Validation (S effort, prevents crashes)
- ISSUE-007: Circuit breaker (S effort, prevents overflow)

### Risky Changes (Needs Safeguards)
- ISSUE-003: Retry logic (M effort, could cause retry storms if wrong)
- ISSUE-008: Repository refactor (M effort, touches many tests)

---

## Implementation Units

### Unit-1: Foundation (Validation & Uniqueness)
**Goal**: Prevent data corruption with validation and duplicate detection

**Issues**: ISSUE-001, ISSUE-002

**Scope**:
- Add Zod schema for ProgressItem validation
- Add Set-based duplicate detection in enqueue
- Add constants file for magic numbers
- Add comprehensive unit tests

**Files**:
1. `src/frontend/src/services/progressQueue.ts` - Add validation and uniqueness
2. `src/frontend/src/services/progressSchemas.ts` - New Zod schemas
3. `src/frontend/src/services/progressConstants.ts` - New constants
4. `src/frontend/src/services/__tests__/progressQueue.test.ts` - Update tests

**Tests**:
```bash
cd src/frontend
npm test src/services/__tests__/progressQueue.test.ts
npm run type-check
```

**Documentation Updates**:
- This file: Mark ISSUE-001, ISSUE-002 as "In Progress"
- `docs/performance/multi-viewpoint-analysis-progressStore-2026-02-23.md`: Add resolution notes

---

### Unit-2: Reliability (Retry & Dead Letter)
**Goal**: Make sync reliable with automatic recovery

**Issues**: ISSUE-003, ISSUE-005

**Scope**:
- Add retryCount and maxRetries to ProgressItem
- Implement exponential backoff with jitter
- Add deadLetters array and accessors
- Create DeadLetterDialog component

**Files**:
1. `src/frontend/src/services/progressQueue.ts` - Retry logic
2. `src/frontend/src/services/progressTracking.ts` - Integration
3. `src/frontend/src/components/DeadLetterDialog.tsx` - New component
4. `src/frontend/src/pages/Progress.tsx` - Add dialog

**Tests**:
```bash
npm test src/services/__tests__/progressQueue.test.ts
npm test src/services/__tests__/progressTracking.test.ts
```

**Documentation Updates**:
- This file: Mark ISSUE-003, ISSUE-005 as "In Progress"
- Add architecture note about retry strategy

---

### Unit-3: Protection (Circuit Breaker)
**Goal**: Prevent queue overflow from rapid operations

**Issue**: ISSUE-007

**Scope**:
- Add debounce/throttle to enqueue
- Add MAX_QUEUE_SIZE enforcement
- Add LRU eviction for oldest items

**Files**:
1. `src/frontend/src/services/progressQueue.ts` - Rate limiting
2. `src/frontend/src/services/progressTracking.ts` - Debounce integration

**Tests**:
```bash
npm test src/services/__tests__/progressQueue.test.ts -- --grep "rate"
```

---

### Unit-4: Performance (Indexing)
**Goal**: O(1) lookups for large queues

**Issue**: ISSUE-004

**Scope**:
- Add Map<id, ProgressItem> index
- Add Map<profile_id, ProgressItem[]> index
- Maintain index consistency on all mutations
- Add performance benchmarks

**Files**:
1. `src/frontend/src/services/progressQueue.ts` - Indexes

**Tests**:
```bash
npm test src/services/__tests__/progressQueue.test.ts -- --grep "performance"
```

---

### Unit-5: UX (Sync Status)
**Goal**: User visibility into sync state

**Issue**: ISSUE-006

**Scope**:
- Add syncStatus to queue
- Create SyncIndicator component
- Add toast notifications for failures

**Files**:
1. `src/frontend/src/services/progressQueue.ts` - Status tracking
2. `src/frontend/src/components/SyncIndicator.tsx` - New component
3. `src/frontend/src/components/ui/Layout.tsx` - Add indicator

**Tests**:
```bash
npm test src/components/SyncIndicator.test.tsx
```

---

### Unit-6: Architecture (Repository Pattern)
**Goal**: Clean architecture for testability

**Issue**: ISSUE-008

**Scope**:
- Extract ProgressRepository interface
- Implement LocalStorageProgressRepository
- Refactor queue to use DI
- Migrate tests to mocks

**Files**:
1. `src/frontend/src/repositories/ProgressRepository.ts` - New
2. `src/frontend/src/repositories/LocalStorageProgressRepository.ts` - New
3. `src/frontend/src/services/progressQueue.ts` - Refactored

**Tests**:
```bash
npm test src/repositories/__tests__/LocalStorageProgressRepository.test.ts
npm test src/services/__tests__/progressQueue.test.ts
```

---

## Mentions Update Plan

| Issue | Location | Action |
|-------|----------|--------|
| ISSUE-001 | `docs/performance/multi-viewpoint-analysis-progressStore-2026-02-23.md` Lines 439-482 | Add resolution note: "RESOLVED 2026-02-27 - Added Set-based duplicate detection in Unit-1" |
| ISSUE-002 | `docs/performance/multi-viewpoint-analysis-progressStore-2026-02-23.md` Lines 735-773 | Add resolution note: "RESOLVED 2026-02-27 - Added Zod schema validation in Unit-1" |
| ISSUE-003 | `docs/performance/multi-viewpoint-analysis-progressStore-2026-02-23.md` Lines 872-940 | Add status: "IN PROGRESS 2026-02-27 - Implementing exponential backoff in Unit-2" |
| ISSUE-004 | `docs/performance/multi-viewpoint-analysis-progressStore-2026-02-23.md` Lines 550-634 | Add status: "PLANNED - Map indexing in Unit-4" |
| ISSUE-005 | `docs/performance/multi-viewpoint-analysis-progressStore-2026-02-23.md` Lines 942-1022 | Add status: "IN PROGRESS 2026-02-27 - Dead letter queue in Unit-2" |
| ISSUE-006 | `docs/performance/multi-viewpoint-analysis-progressStore-2026-02-23.md` Lines 1412-1476 | Add status: "PLANNED - Sync indicator in Unit-5" |
| ISSUE-007 | `docs/performance/multi-viewpoint-analysis-progressStore-2026-02-23.md` Lines 1024-1081 | Add status: "PLANNED - Circuit breaker in Unit-3" |
| ISSUE-008 | `docs/performance/multi-viewpoint-analysis-progressStore-2026-02-23.md` Lines 1089-1159 | Add status: "PLANNED - Repository pattern in Unit-6" |

---

## Execution Log

### 2026-02-27 11:20 IST - Unit-1 Started
- Created issue register
- Beginning implementation of validation and uniqueness

### 2026-02-27 11:25 IST - Analysis Complete
- **Current behavior**: enqueue() pushes without validation or duplicate check
- **Evidence**: `src/frontend/src/services/progressQueue.ts:29` - direct push
- **Edge cases identified**: rapid double-click, malformed items, quota exceeded
- **Approach**: Add validation + Set-based duplicate tracking
- **Risk mitigation**: Graceful degradation (log warning, don't throw for duplicates)

### 2026-02-27 10:55 IST - Unit-1 COMPLETE ✅
**Files Created/Modified**:
1. `src/frontend/src/services/progressConstants.ts` - 48 lines - Centralized constants
2. `src/frontend/src/services/progressValidation.ts` - 123 lines - Validation utilities
3. `src/frontend/src/services/progressQueue.ts` - Updated with validation + duplicates
4. `src/frontend/src/services/__tests__/progressQueue.test.ts` - 16 comprehensive tests

**Changes Made**:
- ✅ ISSUE-001: Set-based duplicate detection (O(1) lookup)
- ✅ ISSUE-002: Schema validation (UUID v4, score bounds, required fields)
- ✅ MAX_QUEUE_SIZE enforcement (drops oldest when full)
- ✅ `markError()` for retry logic foundation
- ✅ `getPendingCount()` for UI indicators
- ✅ Better JSDoc documentation

**Test Results**:
```
✓ src/services/__tests__/progressQueue.test.ts (16 tests) 16ms
```

**Issues Resolved**:
- ISSUE-001: DUPLICATE PREVENTION - ✅ RESOLVED
- ISSUE-002: INPUT VALIDATION - ✅ RESOLVED

### 2026-02-27 11:05 IST - Unit-2 STARTED
**Goal**: Implement exponential backoff retry and dead letter queue
**Issues**: ISSUE-003 (retry logic), ISSUE-005 (dead letter queue)
**Approach**: Add retryCount field, exponential delays, deadLetters array, UI dialog

### 2026-02-27 12:10 IST - ISSUE-005 COMPLETE ✅
**Files Created/Modified**:
1. `src/frontend/src/components/ui/DeadLetterDialog.tsx` - New component (148 lines)
2. `src/frontend/src/pages/Progress.tsx` - Added dead letter indicator and dialog integration

**Changes Made**:
- ✅ DeadLetterDialog component with retry/delete functionality
- ✅ Dead letter count indicator in Progress page header
- ✅ Dialog opens when user clicks "Failed" button
- ✅ Retry all button to retry all dead letter items
- ✅ Individual retry and delete buttons per item

**Test Results**:
- TypeScript type-check: ✅ PASS
- ESLint: ✅ PASS
- Progress queue tests: 31 passed

**Issues Resolved**:
- ISSUE-005: DEAD LETTER QUEUE - ✅ RESOLVED

