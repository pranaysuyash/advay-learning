# Audit: issueReportingUpload.ts

**Target**: `src/frontend/src/services/issueReportingUpload.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Ticket**: `TCK-20260224-031`  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 3, Risk 2, Complexity 1, Changeability 3, Learning 1 = **10/25**

---

## Why This File?

This is the **issue reporting upload utilities** - builds FormData for video clips and metadata for issue reports.

---

## Scoring Rationale

| Criterion     | Score | Justification                    |
| ------------- | ----- | -------------------------------- |
| Impact        | 3     | Supports issue reporting feature |
| Risk          | 2     | Simple utility, low risk         |
| Complexity    | 1     | Simple helper functions          |
| Changeability | 3     | Easy to extend                   |
| Learning      | 1     | Standard patterns                |

---

## Finding: IRU-01 — Duplicate Extension Logic (P3)

**Evidence** (line 14): Extension detection repeated in both conditions.

**Root Cause**: Redundant check.

**Fix Idea**: Simplify to single condition.

---

## Finding: IRU-02 — No File Size Limit (P2)

**Evidence**: No validation on clipBlob size.

**Root Cause**: Could upload huge files.

**Fix Idea**: Add size validation.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                      |
| ------ | ----------- | -------- | ------ | ------------------------ |
| IRU-01 | DRY         | P3       | 0.5h   | Simplify extension logic |
| IRU-02 | Reliability | P2       | 1h     | Add file size validation |

---

## Related Artifacts

- `src/frontend/src/components/issue-reporting/IssueReportFlowModal.tsx`
