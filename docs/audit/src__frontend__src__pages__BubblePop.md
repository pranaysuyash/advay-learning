# Audit: BubblePop.tsx

**Target**: `src/frontend/src/pages/BubblePop.tsx`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 3, Changeability 3, Learning 2 = **15/25**

---

## Why This File?

This is the **Bubble Pop game page** - a unique game that uses microphone/blow input instead of hand tracking. It's the first game with voice/blow input.

---

## Scoring Rationale

| Criterion     | Score | Justification                               |
| ------------- | ----- | ------------------------------------------- |
| Impact        | 4     | Unique game with microphone input           |
| Risk          | 3     | New input modality, different failure modes |
| Complexity    | 3     | Game logic + audio + microphone handling    |
| Changeability | 3     | Game-specific code                          |
| Learning      | 2     | Unique pattern (blow detection)             |

---

## Finding: BP-01 — gameStateRef Used But Not Synced Properly (P1)

**Evidence** (lines 33-37): useEffect syncs gameStateRef but updates happen in setState callback.

**Root Cause**: Potential stale closure issues.

**Fix Idea**: Use functional updates consistently or simplify ref usage.

---

## Finding: BP-02 — Missing Cleanup for Animation Frame (P2)

**Evidence** (lines 86-95): cleanup in useEffect but may miss edge cases.

**Root Cause**: Potential memory leak on rapid unmount.

**Fix Idea**: Ensure cancelAnimationFrame called in all paths.

---

## Finding: BP-03 — Hardcoded Magic Numbers (P2)

**Evidence** (lines 53, 61, 66): `0.25`, `100`, `200`, `0.5`, `0.2` scattered.

**Root Cause**: No constants file for game tuning.

**Fix Idea**: Extract to constants at top of file.

---

## Finding: BP-04 — className vs className (P2)

**Evidence** (line 116): `class="absolute"` should be `className`.

**Root Cause**: JSX syntax error - will cause runtime issue.

**Fix Note**: Critical bug to fix.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                                |
| ----- | ----------- | -------- | ------ | ---------------------------------- |
| BP-01 | Correctness | P1       | 1h     | Fix gameStateRef sync issues       |
| BP-02 | Reliability | P2       | 0.5h   | Ensure RAF cleanup in all paths    |
| BP-03 | DX          | P2       | 0.5h   | Extract magic numbers to constants |
| BP-04 | Correctness | P0       | 0.5h   | Fix className typo                 |

---

## Related Artifacts

- `src/frontend/src/hooks/useMicrophoneInput.ts`
- `src/frontend/src/games/bubblePopLogic.ts`
