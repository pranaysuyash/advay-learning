# Audit: KenneyButton.tsx

**Target**: `src/frontend/src/components/ui/KenneyButton.tsx`  
**Date**: 2026-02-25  
**Source Ticket**: `TCK-20260225-004`  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 2, Risk 2, Complexity 2, Changeability 3, Learning 1 = **10/25**

---

## Why This File?

This is the **Kenney Button component** - game-style UI using Kenney UI Pack sprites. Includes Button, Panel, ProgressBar, Slider.

---

## Scoring Rationale

| Criterion     | Score | Justification           |
| ------------- | ----- | ----------------------- |
| Impact        | 2     | Low - game-specific UI  |
| Risk          | 2     | Low risk - isolated     |
| Complexity    | 2     | Medium - sprite paths   |
| Changeability | 3     | Easy to extend          |
| Learning      | 1     | Standard React patterns |

---

## Finding: KENN-01 — getSpritePath Called Every Render (P2)

**Evidence** (lines 56-61): getSpritePath() function recreated each render.

**Root Cause**: Could be memoized.

**Fix Idea**: Use useMemo.

---

## Finding: KENN-02 — sizeClasses Inside Component (P2)

**Evidence** (lines 63-67): sizeClasses object defined inside component.

**Root Cause**: Recreated each render.

**Fix Idea**: Move outside component.

---

## Finding: KENN-03 — Empty onClick Handler (P3)

**Evidence** (line 228): onClick={() => {}} - empty handler in Slider.

**Root Cause**: Could be removed.

**Fix Idea**: Remove empty handler.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix                  |
| ------- | ----------- | -------- | ------ | -------------------- |
| KENN-01 | Performance | P2       | 0.5h   | Use useMemo          |
| KENN-02 | Performance | P2       | 0.5h   | Move outside         |
| KENN-03 | DX          | P3       | 0.5h   | Remove empty handler |

---

## Related Artifacts

- `src/frontend/src/components/ui/index.ts`
