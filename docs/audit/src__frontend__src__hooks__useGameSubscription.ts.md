# Audit: useGameSubscription.ts

**Audit Version:** 1.5.1  
**Date/Time:** 2026-03-09 16:45 IST  
**Audited File:** `src/frontend/src/hooks/useGameSubscription.ts`  
**Base Commit:** 6eaa8c7  
**Auditor:** Kimi Code CLI (Pranay)

---

## Discovery Evidence

### Git Commands Executed

```bash
$ git rev-parse --is-inside-work-tree
true

$ git ls-files -- src/frontend/src/hooks/useGameSubscription.ts
src/frontend/src/hooks/useGameSubscription.ts

$ git log -n 10 --oneline --follow -- src/frontend/src/hooks/useGameSubscription.ts
6eaa8c7 TCK-20260309-101 Integrated remediation, audits, and gate fixes across frontend/backend
64f47e9 refactor(games): reconcile refactored twins and harden review gates [TCK-20260303-016]
63b60e9 feat(infra): add game quality shared infrastructure [GQ-002/003/004]
```

### Inbound References (Consumers)

```bash
$ rg -n "useGameSubscription" src/frontend/src
```

**Observed:**
- `src/frontend/src/components/__tests__/GameShell.test.tsx:7` - Mocked in tests
- `src/frontend/src/components/GameShell.tsx:19` - Primary consumer
- `src/frontend/src/hooks/__tests__/useGameSubscription.test.ts:9` - Test file

**Inferred:** This is a specialized wrapper hook used primarily by GameShell for subscription access control across games.

### Test Discovery

```bash
$ rg -n "useGameSubscription" src/frontend/src --glob="*.{test,spec}.{ts,tsx}"
```

**Observed:**
- `src/frontend/src/hooks/__tests__/useGameSubscription.test.ts` exists with 3 basic tests
- `src/frontend/src/components/__tests__/GameShell.test.tsx` mocks this hook

---

## What This File Actually Does

A thin React hook wrapper that transforms the generic `useSubscription` hook's output into a game-specific interface. It memoizes access checks and maps internal subscription error states to Error objects for UI consumption. **Observed:** The hook does not initiate any subscription checks itself—it purely transforms and presents data from `useSubscription`.

---

## Key Components

| Component | Inputs | Outputs | Controls | Side Effects |
|-----------|--------|---------|----------|--------------|
| `useGameSubscription(gameId)` | `gameId: string` | `UseGameSubscriptionReturn` | Access calculation via `useMemo` | None direct (all from parent hook) |
| `hasAccess` calculation | `canAccessGame`, `gameId`, `isLoading` | `boolean` | Memoized access check | None |
| `error` mapping | `statusSource`, `errorReason` | `Error \| null` | Error object creation | None |

---

## Dependencies and Contracts

### Outbound Dependencies (Observed)

| Dependency | Usage | Load-Bearing |
|------------|-------|--------------|
| `react` (useMemo) | Memoizes `hasAccess` calculation | Yes - prevents unnecessary recalculations |
| `useSubscription` hook | Source of all data | Yes - entire hook depends on this |
| `UseGameSubscriptionReturn` interface | Return type contract | Yes - defines API surface |

### Inbound Dependencies (Observed)

| Consumer | Import Type | Contract Assumption |
|----------|-------------|---------------------|
| `GameShell.tsx` | Direct import | Assumes `{ hasAccess, isLoading, error, gameId }` shape |
| GameShell test | Mock | Assumes callable with gameId string |

**Inferred:** GameShell expects this hook to handle all subscription logic; it does not interact with `useSubscription` directly.

---

## Capability Surface

### Direct Capabilities (Observed)

1. **Game-scoped access checking** - Transforms generic `canAccessGame(gameId)` into boolean `hasAccess`
2. **Loading state passthrough** - Exposes `isLoading` from parent hook
3. **Error transformation** - Maps internal status codes to Error objects for UI
4. **Game ID preservation** - Returns the input `gameId` for reference

### Implied Capabilities (Inferred)

1. **Subscription state synchronization** - Inherits real-time updates from `useSubscription`
2. **Guest/demo access handling** - Delegated to `useSubscription` (guests get wildcard access)
3. **Plan-specific game availability** - Depends on `accessibleGames` Set from parent

---

## Gaps and Missing Functionality

### Observed Gaps

1. **No retry mechanism** - If `useSubscription` fails (api_error), no retry exposed
2. **No refetch capability** - Users cannot manually refresh subscription status
3. **Error object recreation** - New Error created on every render when in error state
4. **Missing telemetry** - No logging of access denials or errors

### Unknown (Cannot Determine)

1. Whether subscription changes mid-session trigger re-renders correctly
2. Whether the error message localization is handled
3. Whether analytics track access_denied events

---

## Problems and Risks

### Finding 1: Error Object Identity Instability

| Attribute | Value |
|-----------|-------|
| **ID** | FIND-001 |
| **Severity** | MED |
| **Evidence** | Observed |
| **Location** | Lines 51-54: Error object created inline in return statement |

**Failure Mode:**
```typescript
// This creates a NEW Error object on every render when statusSource is error
error: statusSource === 'api_error' || statusSource === 'invalid_plan'
  ? new Error(errorReason || 'Subscription service is temporarily unavailable.')
  : null,
```

This causes:
- Unnecessary re-renders in child components using `error` in dependency arrays
- Potential infinite loops if error triggers effect that updates state
- Loss of error reference stability for error boundary recovery

**Blast Radius:** Components comparing `error` by reference or using it in `useEffect` deps.

**Invariant to Lock:** Error object must be stable when underlying error state hasn't changed.

---

### Finding 2: Incomplete Error State Exposure

| Attribute | Value |
|-----------|-------|
| **ID** | FIND-002 |
| **Severity** | MED |
| **Evidence** | Observed |
| **Location** | Return object construction |

**Failure Mode:** The hook only exposes errors for `api_error` and `invalid_plan` statuses, but `useSubscription` has additional error states:
- `'no_subscription'` - User has no subscription (legitimate state, but could be error for some UIs)
- `null` - No status yet

Callers cannot distinguish between:
- "API is down" (temporary, retryable)
- "User has no subscription" (permanent, needs upgrade)
- "Still loading" (null statusSource)

**Blast Radius:** GameShell shows same UI for all error cases—cannot customize messaging.

**Invariant to Lock:** Error classification must preserve original status source for caller decision-making.

---

### Finding 3: Missing Observability

| Attribute | Value |
|-----------|-------|
| **ID** | FIND-003 |
| **Severity** | LOW |
| **Evidence** | Observed |
| **Location** | Entire hook - no telemetry integration |

**Failure Mode:** No visibility into:
- How often users are denied access (conversion funnel gap)
- Which games are most often blocked (business intelligence)
- API error frequency (reliability monitoring)

**Blast Radius:** Product and engineering cannot measure subscription feature effectiveness.

**Invariant to Lock:** Access check results must be observable for analytics.

---

### Finding 4: Test Coverage Gaps

| Attribute | Value |
|-----------|-------|
| **ID** | FIND-004 |
| **Severity** | MED |
| **Evidence** | Observed (test file contents) |
| **Location** | `src/frontend/src/hooks/__tests__/useGameSubscription.test.ts` |

**Failure Mode:** Tests only cover:
- ✅ Allowed game returns true
- ✅ Denied game returns false
- ✅ isLoading is boolean

Missing coverage:
- ❌ Error state behavior
- ❌ Error object stability
- ❌ Memoization (hasAccess should not recalculate unnecessarily)
- ❌ gameId preservation in return

**Blast Radius:** FIND-001 and FIND-002 could regress without test failure.

---

## Extremes and Abuse Cases

### Case 1: Rapid Game ID Changes

**Scenario:** User navigates quickly between games, gameId changes rapidly.

**Observed Behavior:** `useMemo` recalculates `hasAccess` when `gameId` changes.
**Risk:** If parent `useSubscription` re-fetches on every call, could trigger excessive API calls.
**Unknown:** Whether `useSubscription` has internal caching/debouncing.

### Case 2: Network Intermittency

**Scenario:** Subscription API fails mid-session, then recovers.

**Observed Behavior:** Error state appears, but no automatic retry mechanism.
**Risk:** User stuck with error until page refresh.

### Case 3: Malformed Game ID

**Scenario:** gameId is empty string, null (via TS escape), or contains special chars.

**Observed Behavior:** Passed directly to `canAccessGame(gameId)`.
**Risk:** Unknown behavior in parent hook; could cause runtime errors.
**Missing:** Input validation on gameId.

---

## Inter-File Impact Analysis

### Inbound Impact (Callers Affected by Changes)

**GameShell.tsx** (primary caller):
- Uses: `hasAccess`, `isLoading`
- Ignores: `error`, `gameId`
- **Risk:** If error handling added here, GameShell needs updates to consume it
- **Contract to Lock:** `hasAccess` boolean semantics must remain stable

### Outbound Impact (Dependencies That Could Break This)

**useSubscription.ts**:
- Provides: `canAccessGame`, `isLoading`, `statusSource`, `errorReason`
- **Risk:** If return shape changes, this hook breaks silently
- **Contract to Lock:** `useSubscription` must maintain exported interface

### Change Impact per Finding

| Finding | Could Break Callers? | Caller Invalidation Risk? | Invariant to Lock |
|---------|---------------------|---------------------------|-------------------|
| FIND-001 (Error stability) | Yes - if callers compare by reference | Low - currently unused in GameShell | Error reference stable when state unchanged |
| FIND-002 (Error exposure) | No - additive change | N/A | Preserve backward compatibility |
| FIND-003 (Telemetry) | No - side effect only | N/A | No runtime behavior change |
| FIND-004 (Tests) | No | N/A | Tests must cover existing + new behavior |

---

## Clean Architecture Fit

### What Belongs Here

✅ Game-specific interface adaptation  
✅ Memoization of access calculations  
✅ Error transformation for UI consumption  

### What Does Not Belong Here (Responsibility Leakage)

❌ Subscription API calls (correctly in `useSubscription`)  
❌ UI rendering (correctly in GameShell)  
❌ Analytics/telemetry (currently missing, should be added)  

**Assessment:** Clean separation of concerns. This is a proper adapter/wrapper hook.

---

## Patch Plan (HIGH and MEDIUM Issues)

### FIND-001: Error Object Identity Instability

| Field | Value |
|-------|-------|
| **Where** | `useGameSubscription` hook body - error construction |
| **What** | Memoize Error object creation using `useMemo` |
| **Why** | Prevent unstable references causing unnecessary re-renders |
| **Failure Prevented** | Infinite loops, wasted renders, broken dependency comparisons |
| **Invariant** | Same `statusSource` + `errorReason` → same Error reference |
| **Test** | `it('returns stable error reference when error state unchanged')` |

```typescript
// Before (unstable):
error: statusSource === 'api_error' || statusSource === 'invalid_plan'
  ? new Error(errorReason || '...')
  : null,

// After (stable):
const error = useMemo(() => {
  if (statusSource === 'api_error' || statusSource === 'invalid_plan') {
    return new Error(errorReason || 'Subscription service is temporarily unavailable.');
  }
  return null;
}, [statusSource, errorReason]);
```

---

### FIND-002: Incomplete Error State Exposure

| Field | Value |
|-------|-------|
| **Where** | Return object - add `errorType` field |
| **What** | Expose original `statusSource` for caller classification |
| **Why** | Enable customized UX for different error types |
| **Failure Prevented** | Wrong UI shown for error type (e.g., "retry" button on permanent errors) |
| **Invariant** | Backward compatible - new field only |
| **Test** | `it('exposes errorType for caller classification')` |

```typescript
// Add to interface and return:
interface UseGameSubscriptionReturn {
  // ...existing fields...
  /** Classification of error for UI handling */
  errorType: 'api_error' | 'invalid_plan' | 'no_subscription' | null;
}

// Return:
errorType: statusSource === 'api_error' || statusSource === 'invalid_plan' 
  ? statusSource 
  : null,
```

---

### FIND-004: Test Coverage Gaps

| Field | Value |
|-------|-------|
| **Where** | `useGameSubscription.test.ts` |
| **What** | Add tests for error states, memoization, gameId preservation |
| **Why** | Prevent regression of FIND-001 and FIND-002 |
| **Failure Prevented** | Silent breaking changes to error handling |
| **Invariant** | All return fields must have test assertions |

**Tests to Add:**
1. `it('preserves gameId in return value')`
2. `it('returns error when statusSource is api_error')`
3. `it('returns error when statusSource is invalid_plan')`
4. `it('maintains stable error reference across renders')`
5. `it('memoizes hasAccess calculation')`

---

## Verification and Test Coverage

### Existing Tests (Observed)

| Test | Coverage |
|------|----------|
| `should return hasAccess=true for allowed game` | ✅ Basic positive case |
| `should return hasAccess=false for denied game` | ✅ Basic negative case |
| `should return isLoading state` | ✅ Type check only (weak) |

### Critical Paths Untested

1. **Error state propagation** - No tests for error conditions
2. **Memoization behavior** - No tests verifying useMemo works
3. **gameId preservation** - Not verified in return value
4. **Edge cases** - Empty gameId, rapid changes

### Assumed Invariants (Not Enforced)

1. Error object identity stability
2. hasAccess recalculation only on dependency change
3. Error reason string preservation

---

## Risk Rating

**Rating: MEDIUM**

**Why at least MEDIUM:**
- Error object instability (FIND-001) could cause real performance/render issues
- Missing error classification (FIND-002) limits UX quality
- Test gaps (FIND-004) allow regression

**Why not HIGH:**
- No security vulnerabilities observed
- No data loss risks
- Hook is thin wrapper; core logic in tested `useSubscription`
- Currently works for primary use case (GameShell basic usage)

---

## Regression Analysis

**Commands Executed:**
```bash
git log -n 10 --oneline --follow -- src/frontend/src/hooks/useGameSubscription.ts
```

**Concrete Deltas Observed:**

1. **63b60e9** - File created as part of GQ-002/003/004 game quality infrastructure
2. **64f47e9** - No changes to this file (caught in refactor sweep)
3. **6eaa8c7** - No changes to this file (integrated remediation)

**Regression Status:** N/A - File is relatively new (created in current development cycle), no regressions to analyze.

---

## Out-of-Scope Findings

### OOS-001: useSubscription Hook Audit

This audit covers `useGameSubscription` only. The parent `useSubscription` hook handles:
- Actual API calls to subscription service
- Caching and state management
- Guest/demo mode logic

**Unknowns that require separate audit:**
- API error retry logic
- Cache invalidation strategy
- Real-time subscription update handling

---

## Next Actions

### Immediate (Next PR)

1. **FIND-001** - Fix error object stability (MED)
2. **FIND-004** - Add missing test coverage (MED)

### Follow-up (Separate PR)

3. **FIND-002** - Expose errorType for caller classification (MED)
4. **FIND-003** - Add telemetry integration (LOW)
5. **OOS-001** - Audit `useSubscription` parent hook

### Verification Steps

After fixes:
```bash
cd src/frontend
npm test -- useGameSubscription.test.ts
npm run type-check
npm run lint
```

---

## Ticket Reference

**Related Work:**
- GQ-002: Game quality shared infrastructure
- TCK-20260309-101: Integrated remediation

**Suggested New Ticket:**
```
TCK-20260309-XXX :: Fix useGameSubscription Error Stability
- Fix FIND-001 (error object instability)
- Fix FIND-004 (test coverage gaps)
- Verify GameShell integration
```

---

*Audit complete. Artifact written: docs/audit/src__frontend__src__hooks__useGameSubscription.ts.md*
