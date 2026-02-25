# Audit: AvatarCapture.tsx

**Target**: `src/frontend/src/components/ui/AvatarCapture.tsx`  
**Date**: 2026-02-25  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 3, Risk 3, Complexity 3, Changeability 2, Learning 1 = **12/25**

---

## Why This File?

This is the **Avatar Capture component** - camera-based profile picture capture with preview, retake, and upload functionality.

---

## Scoring Rationale

| Criterion     | Score | Justification                      |
| ------------- | ----- | ---------------------------------- |
| Impact        | 3     | Profile photo capture              |
| Risk          | 3     | Camera permissions, memory leaks   |
| Complexity    | 3     | MediaStream, canvas, blob handling |
| Changeability | 2     | Limited customization expected     |
| Learning      | 1     | Standard React patterns            |

---

## Finding: AVT-01 — void handleCapture Hack (P1)

**Evidence** (line 80): `void handleCapture;` - meaningless code to avoid unused warning.

**Root Cause**: Code smell.

**Fix Idea**: Remove or call properly.

---

## Finding: AVT-02 — setInterval Not Cleaned Up (P1)

**Evidence** (lines 48-57): setInterval created but never cleared.

**Root Cause**: Memory leak potential.

**Fix Idea**: Use useEffect cleanup.

---

## Finding: AVT-03 — Camera Stream Not Released (P0)

**Evidence** (lines 31-40): getUserMedia creates stream but no cleanup on unmount.

**Root Cause**: Camera stays on after modal closes.

**Fix Idea**: Use useEffect to release stream.

---

## Finding: AVT-04 — Silent Error Handling (P2)

**Evidence** (line 104): Error caught but only logged, closes modal anyway.

**Root Cause**: Poor UX on failure.

**Fix Idea**: Show error toast to user.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                   |
| ------ | ----------- | -------- | ------ | --------------------- |
| AVT-03 | Reliability | P0       | 1h     | Release camera stream |
| AVT-01 | DX          | P1       | 0.5h   | Remove void hack      |
| AVT-02 | Reliability | P1       | 1h     | Clear setInterval     |
| AVT-04 | UX          | P2       | 1h     | Show error feedback   |

---

## Related Artifacts

- `src/frontend/src/services/api.ts`
