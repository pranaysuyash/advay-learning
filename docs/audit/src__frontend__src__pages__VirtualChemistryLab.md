# Audit: VirtualChemistryLab.tsx

**Target**: `src/frontend/src/pages/VirtualChemistryLab.tsx`  
**Date**: 2026-02-26  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 2, Complexity 4, Changeability 2, Learning 2 = **15/25**
**Source Ticket**: TCK-20260225-004

---

## Why This File?

This is **Virtual Chemistry Lab** - AR chemistry simulation with hand tracking, chemical reactions, and issue reporting integration.

---

## Scoring Rationale

| Criterion     | Score | Justification             |
| ------------- | ----- | ------------------------- |
| Impact        | 5     | Full AR chemistry game    |
| Risk          | 2     | Well-structured           |
| Complexity    | 4     | Hand + reactions + canvas |
| Changeability | 2     | Reaction-based system     |
| Learning      | 2     | Chemistry patterns        |

---

## Finding: VCL-01 — useCallback Missing Dependencies (P2)

**Evidence** (line 175): `detectHand` callback missing deps like `selectedChemical`, `isPouring`.

**Root Cause**: Incomplete dependency array.

**Fix Idea**: Add all deps or use refs.

---

## Finding: VCL-02 — onGameComplete Called in Button Handler (P2)

**Evidence** (line 447): `onGameComplete()` called in button onClick.

**Root Cause**: May fire multiple times.

**Fix Idea**: Use useEffect to track game end.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                    |
| ------ | ----------- | -------- | ------ | ---------------------- |
| VCL-01 | DX          | P2       | 0.5h   | Fix useCallback deps   |
| VCL-02 | Reliability | P2       | 0.5h   | Refactor game complete |

---

## Related Artifacts

- `src/frontend/src/components/issue-reporting/IssueReportFlowModal.tsx`
