# Audit: EmojiMatch.tsx

**Target**: `src/frontend/src/pages/EmojiMatch.tsx`  
**Date**: 2026-02-25  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 3, Complexity 4, Changeability 2, Learning 1 = **15/25**

---

## Why This File?

This is the **Emoji Match game** - core emotion matching game with hand tracking, Kalman filtering, adaptive difficulty, and comprehensive game loop.

---

## Scoring Rationale

| Criterion     | Score | Justification                   |
| ------------- | ----- | ------------------------------- |
| Impact        | 5     | Core game - emotion learning    |
| Risk          | 3     | Medium - complex game logic     |
| Complexity    | 4     | Very complex - multiple systems |
| Changeability | 2     | Limited - mature game           |
| Learning      | 1     | Standard React patterns         |

---

## Finding: EMG-01 — Duplicate setTimeout Auto-Dismiss (P2)

**Evidence** (lines 305-307): Both SuccessAnimation's onComplete AND setTimeout for showSuccess.

**Root Cause**: Potential race condition.

**Fix Idea**: Remove duplicate timeout.

---

## Finding: EMG-02 — Multiple Ref Sync useEffects (P2)

**Evidence** (lines 111-120): Five separate useEffects for syncing refs.

**Root Cause**: Code duplication.

**Fix Idea**: Combine into single useEffect.

---

## Finding: EMG-03 — Debug Import Using any (P2)

**Evidence** (line 98): `showDebug = Boolean((import.meta as any)?.env?.DEV)`.

**Root Cause**: Type safety issue.

**Fix Idea**: Use proper import.meta.env typing.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                      |
| ------ | ----------- | -------- | ------ | ------------------------ |
| EMG-01 | Reliability | P2       | 0.5h   | Remove duplicate timeout |
| EMG-02 | Performance | P2       | 1h     | Combine useEffects       |
| EMG-03 | DX          | P2       | 0.5h   | Fix import.meta type     |

---

## Related Artifacts

- `src/frontend/src/games/emojiMatchLogic.ts`
- `src/frontend/src/utils/coordinateTransform.ts`
