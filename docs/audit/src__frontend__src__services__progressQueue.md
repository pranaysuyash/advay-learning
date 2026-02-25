# Audit: progressQueue.ts

**Target**: `src/frontend/src/services/progressQueue.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Ticket**: `TCK-20260224-032`  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 2, Changeability 3, Learning 2 = **14/25**

---

## Why This File?

This is the **offline progress queue** - IndexedDB fallback to localStorage for offline progress syncing. Critical for offline-first experience.

---

## Scoring Rationale

| Criterion     | Score | Justification                      |
| ------------- | ----- | ---------------------------------- |
| Impact        | 4     | Offline support for progress sync  |
| Risk          | 3     | Data loss potential if queue fails |
| Complexity    | 2     | Simple localStorage-based queue    |
| Changeability | 3     | Easy to extend                     |
| Learning      | 2     | Interesting offline pattern        |

---

## Finding: PQ-01 — No Storage Limit (P2)

**Evidence** (line 29): localStorage.setItem without checking quota.

**Root Cause**: Could exceed 5MB limit.

**Fix Idea**: Add size check before enqueue.

---

## Finding: PQ-02 — No Error Status Handling (P2)

**Evidence** (line 64): Failed items not marked as error.

**Root Cause**: Silent failure.

**Fix Idea**: Mark failed items as 'error'.

---

## Finding: PQ-03 — Race Condition in load/save (P2)

**Evidence** (lines 18-28): Multiple concurrent operations could corrupt data.

**Root Cause**: No locking mechanism.

**Fix Idea**: Add simple mutex or queue operations.

---

## Finding: PQ-04 — Missing clearSyncedItems (P3)

**Evidence**: No way to purge synced items.

**Root Cause**: Queue grows indefinitely.

**Fix Idea**: Add cleanup method.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                        |
| ----- | ----------- | -------- | ------ | -------------------------- |
| PQ-01 | Reliability | P2       | 1h     | Add storage quota check    |
| PQ-02 | Correctness | P2       | 0.5h   | Mark failed items as error |
| PQ-03 | Reliability | P2       | 1h     | Add locking mechanism      |
| PQ-04 | Performance | P3       | 0.5h   | Add cleanup method         |

---

## Related Artifacts

- `src/frontend/src/services/api.ts`
- `src/frontend/src/store/progressStore.ts`
