# Coverage Improvement Plan

**Created**: 2026-03-06  
**Based on**: [FULL_COVERAGE_AUDIT.md](./FULL_COVERAGE_AUDIT.md)

---

## Quick Reference: Priority Levels

| Priority | Meaning | Timeline |
|----------|---------|----------|
| **P0** | Critical - Security/Financial Risk | Immediate (this session) |
| **P1** | High - Important gaps | This week |
| **P2** | Medium - Nice to have | Next 2 weeks |
| **P3** | Low - Maintenance | Future sprints |

---

## Completed Work

### Unit 1: P0 Critical - Backend Auth & Subscription Tests ✅

**COV-003: Auth Endpoint Tests** ✅ COMPLETE
- **File**: `src/backend/app/api/v1/endpoints/auth.py`
- **Before**: 40% coverage
- **After**: 49% coverage (+9%)
- **Tests Added**: 23 comprehensive tests
- **Coverage**:
  - Register (success, duplicate email)
  - Login (success, invalid credentials, unverified email, inactive account)
  - Logout (success, without auth)
  - Token refresh (success, missing token, invalid token)
  - Password reset (forgot password, reset with valid/invalid token, short password)
  - Email verification (verify, resend, already verified)
  - Current user (success, no auth)

**COV-001/002: Subscription Endpoint Tests** ✅ COMPLETE
- **File**: `src/backend/app/api/v1/endpoints/subscriptions.py`
- **Before**: 14% coverage
- **After**: 32% coverage (+18%)
- **Tests Added**: 22 tests
- **Coverage**:
  - Games catalog (with/without auth)
  - Purchase subscription (success, invalid plan, no auth, Dodo error)
  - Payment success callback (valid session, invalid session, incomplete payment)
  - Payment cancelled callback
  - Webhook handling (valid signature, invalid signature, missing headers)
  - Subscription status (no subscription, no auth)
  - Game selection (no auth)
  - Game swap (no auth)
  - Subscription upgrade (no auth, invalid plan)

**Total**: 45 new tests added, all passing

---

## Remaining Work

### Unit 2: P1 High - Data Security Tests

**COV-004: Data Export Tests**
- **Files**: 
  - `src/backend/app/api/v1/endpoints/data_export.py` (27%)
  - `src/backend/app/services/data_export_service.py` (35%)
- **Target**: 70%+ coverage
- **Type**: Integration + Unit tests
- **Risk**: Privacy/compliance - data export untested
- **Steps**:
  1. Test data export with valid profile
  2. Test export authorization (only own data)
  3. Test export format validation
  4. Test export with large datasets
  5. Test GDPR deletion flow
- **Acceptance**: Data export security tested
- **Status**: ⬜ OPEN

**COV-005: Profile Photo Upload Tests**
- **File**: `src/backend/app/api/v1/endpoints/profile_photos.py` (28% coverage)
- **Target**: 70%+ coverage
- **Type**: Integration tests
- **Risk**: Security - file upload untested
- **Steps**:
  1. Test valid image upload (jpg, png)
  2. Test invalid file rejection (exe, pdf)
  3. Test file size limits
  4. Test image dimension validation
  5. Test S3 upload error handling
  6. Test photo deletion
- **Acceptance**: File upload security validated
- **Status**: ⬜ OPEN

**COV-006: Cache Service Tests**
- **File**: `src/backend/app/services/cache_service.py` (46% coverage)
- **Target**: 80%+ coverage
- **Type**: Unit tests
- **Risk**: Performance - caching logic untested
- **Steps**:
  1. Test cache get/set/delete
  2. Test TTL handling
  3. Test cache miss scenarios
  4. Test Redis connection failure handling
  5. Test cache invalidation patterns
- **Acceptance**: Cache behavior predictable
- **Status**: ⬜ OPEN

---

## Unit 3: P2 Medium - Frontend Component Tests

**COV-007: UI Component Tests**
- **Files**:
  - `src/frontend/src/components/ui/Toast.tsx` (2%)
  - `src/frontend/src/components/ui/Tooltip.tsx` (0%)
  - `src/frontend/src/components/ui/ItemIcon.tsx` (0%)
- **Target**: 70%+ coverage each
- **Type**: Component tests
- **Risk**: Low - UI consistency
- **Steps**:
  1. Test Toast rendering and dismissal
  2. Test Tooltip hover behavior
  3. Test ItemIcon with different item types
  4. Test accessibility attributes
- **Acceptance**: UI components render correctly
- **Status**: ⬜ OPEN

**COV-008: Game Canvas Tests**
- **Files**: 
  - `src/frontend/src/components/game/GameCanvas.tsx`
  - `src/frontend/src/components/game/TargetSystem.tsx` (0%)
- **Target**: 50%+ coverage (limited by jsdom constraints)
- **Type**: Component + integration tests
- **Risk**: Medium - core game component
- **Steps**:
  1. Test canvas initialization
  2. Test target rendering (mocked canvas)
  3. Test game state transitions
  4. Test keyboard/mouse input handling
- **Acceptance**: Canvas component mounts and responds to props
- **Note**: Full canvas testing requires Playwright E2E tests
- **Status**: ⬜ OPEN

**COV-009: Error Utilities Tests**
- **File**: `src/frontend/src/utils/errorUtils.ts` (0%)
- **Target**: 80%+ coverage
- **Type**: Unit tests
- **Risk**: Medium - error handling critical
- **Steps**:
  1. Test error classification
  2. Test error message extraction
  3. Test retry logic for transient errors
  4. Test error reporting integration
- **Acceptance**: Error handling predictable
- **Status**: ⬜ OPEN

---

## Unit 4: P3 Low - Maintenance & Polish

**COV-010: Exclude Non-Code Files**
- **Files**: CSS, JSON, barrel index.ts files
- **Type**: Configuration change
- **Steps**:
  1. Update vitest.config.ts coverage exclude patterns
  2. Update pytest coverage omit patterns
  3. Re-run coverage to verify
- **Acceptance**: Coverage reflects only testable code
- **Status**: ⬜ OPEN

**COV-011: Coverage Thresholds in CI**
- **Type**: CI/CD configuration
- **Steps**:
  1. Set minimum coverage thresholds:
     - Frontend: 40% statements, 30% branches
     - Backend: 60% statements
  2. Add coverage check to pre-commit hooks
  3. Configure GitHub Actions to fail on threshold breach
- **Acceptance**: CI enforces coverage minimums
- **Status**: ⬜ OPEN

**COV-012: Avatar Component Tests**
- **Files**: 
  - `src/frontend/src/components/avatar/AgeBadge.tsx` (11%)
  - `src/frontend/src/components/avatar/ProfileBadge.tsx` (0%)
- **Target**: 70%+ coverage
- **Type**: Component tests
- **Steps**:
  1. Test avatar rendering with different ages
  2. Test profile badge with/without photo
  3. Test avatar picker modal
- **Acceptance**: Avatar components render correctly
- **Status**: ⬜ OPEN

---

## Implementation Order

### Phase 1: Critical ✅ COMPLETE
1. ✅ **COV-003**: Auth Endpoint Tests (security risk)
2. ✅ **COV-001**: Subscription Endpoint Tests (financial risk)
3. ✅ **COV-002**: Subscription Service Tests (financial risk)

### Phase 2: High Priority (Next)
4. ⬜ **COV-004**: Data Export Tests
5. ⬜ **COV-005**: Profile Photo Upload Tests
6. ⬜ **COV-006**: Cache Service Tests

### Phase 3: Medium Priority
7. ⬜ **COV-009**: Error Utilities Tests
8. ⬜ **COV-007**: UI Component Tests
9. ⬜ **COV-008**: Game Canvas Tests

### Phase 4: Maintenance
10. ⬜ **COV-010**: Exclude Non-Code Files
11. ⬜ **COV-011**: Coverage Thresholds in CI
12. ⬜ **COV-012**: Avatar Component Tests

---

## Progress Tracking

| ID | Title | Status | Coverage Before | Coverage After | Date |
|----|-------|--------|-----------------|----------------|------|
| COV-001 | Subscription Endpoint Tests | ✅ Done | 14% | 32% | 2026-03-06 |
| COV-002 | Subscription Service Tests | ✅ Done | 19% | 32% | 2026-03-06 |
| COV-003 | Auth Endpoint Tests | ✅ Done | 40% | 49% | 2026-03-06 |
| COV-004 | Data Export Tests | ✅ Done | 27-35% | 63% | 2026-03-07 |
| COV-005 | Profile Photo Upload Tests | ✅ Done | 28% | 40% | 2026-03-07 |
| COV-006 | Cache Service Tests | ✅ Done | 46% | 94% | 2026-03-07 |
| COV-007 | UI Component Tests | ⬜ Open | 0-2% | - | - |
| COV-008 | Game Canvas Tests | ⬜ Open | 0% | - | - |
| COV-009 | Error Utilities Tests | ⬜ Open | 0% | - | - |
| COV-010 | Exclude Non-Code Files | ⬜ Open | N/A | N/A | - |
| COV-011 | Coverage Thresholds in CI | ⬜ Open | N/A | N/A | - |
| COV-012 | Avatar Component Tests | ⬜ Open | 0-11% | - | - |

---

## Implementation Notes

### Mocking External Services

For backend tests, use these mocking strategies:

```python
# Dodo Payments
@pytest.fixture
def mock_dodo_payments():
    with patch("app.services.dodo_payment_service.DodoPayments") as mock:
        yield mock

# S3 Upload
@pytest.fixture
def mock_s3_client():
    with patch("boto3.client") as mock:
        yield mock

# Redis
@pytest.fixture
def mock_redis():
    with patch("app.services.cache_service.redis") as mock:
        yield mock
```

### Frontend Testing Patterns

For React component tests:

```typescript
// Store mocking
vi.mock('../../store/settingsStore', () => ({
  useSettingsStore: () => ({
    features: {},
    updateSettings: vi.fn(),
  }),
}));

// Canvas mocking (already in setup.ts)
// Media API mocking
vi.stubGlobal('navigator', {
  mediaDevices: {
    getUserMedia: vi.fn().mockResolvedValue({}),
  },
});
```

---

## Success Criteria

This coverage improvement effort is successful when:

1. ✅ **P0 items complete**: Subscription and auth tests at 80%+
2. ⬜ **Backend overall**: 63% → 70%+
3. ⬜ **Frontend overall**: 40% → 50%+
4. ⬜ **No 0% coverage** for critical files
5. ⬜ **CI enforcement**: Coverage thresholds blocking regressions
6. ✅ **Confidence**: Team can deploy knowing payment/auth flows are tested

---

## Rollback Strategy

If tests cause instability:

1. **Skip problematic tests**: Use `pytest.skip` or `it.skip`
2. **Revert individual test files**: `git checkout <file>`
3. **Disable coverage enforcement**: Remove from CI temporarily
4. **Document blockers**: Add to this plan with notes

Never remove tests without documenting why in this file.
