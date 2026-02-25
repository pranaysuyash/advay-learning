# Audit: useSoundEffects.ts

**Target**: `src/frontend/src/hooks/useSoundEffects.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 2, Changeability 2, Learning 2 = **13/25**

---

## Why This File?

This is the **sound effects hook** using Web Audio API to generate programmatic sounds. Used by all game pages for audio feedback.

---

## Scoring Rationale

| Criterion     | Score | Justification                             |
| ------------- | ----- | ----------------------------------------- |
| Impact        | 4     | All games use for audio feedback          |
| Risk          | 3     | Audio issues are visible but non-critical |
| Complexity    | 2     | Web Audio API patterns                    |
| Changeability | 2     | Stable API                                |
| Learning      | 2     | Standard Web Audio patterns               |

---

## Finding: SE-01 — AudioContext May Be Null (P2)

**Evidence** (line 19): `return null as unknown as AudioContext` - confusing type cast.

**Root Cause**: Handling JSDOM in tests.

**Fix Idea**: Use proper nullable type instead of casting.

---

## Finding: SE-02 — No Cleanup on Component Remount (P2)

**Evidence** (lines 183-189): Cleanup only closes AudioContext, doesn't reset ref.

**Root Cause**: If hook remounts, old context may linger.

**Fix Idea**: Reset audioContextRef to null on cleanup.

---

## Finding: SE-03 — Missing Error Return (P2)

**Evidence** (lines 56-83, 86-112): playTone and playSuccess catch errors but return nothing.

**Root Cause**: Silent failure.

**Fix Idea**: Return boolean success indicator.

---

## Finding: SE-04 — Sound Functions Not Cancellable (P2)

**Evidence**: Once sound starts, cannot be stopped mid-play.

**Root Cause**: No cancellation token.

**Fix Idea**: Return cleanup function.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                        |
| ----- | ----------- | -------- | ------ | -------------------------- |
| SE-01 | Correctness | P2       | 0.5h   | Fix nullable type handling |
| SE-02 | Reliability | P2       | 0.5h   | Reset ref on cleanup       |
| SE-03 | DX          | P2       | 1h     | Add success return value   |
| SE-04 | DX          | P2       | 1h     | Add cancellation support   |

---

## Related Artifacts

- `src/frontend/src/pages/ShapePop.tsx`
- `src/frontend/src/pages/SteadyHandLab.tsx`
- `src/frontend/src/pages/WordBuilder.tsx`
