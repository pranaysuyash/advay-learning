# Audit: Icon.tsx

**Target**: `src/frontend/src/components/ui/Icon.tsx`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 3, Risk 2, Complexity 1, Changeability 3, Learning 1 = **10/25**

---

## Why This File?

This is the **UI Icon component** - wraps Lucide icons and asset icons. Used throughout the app.

---

## Scoring Rationale

| Criterion     | Score | Justification               |
| ------------- | ----- | --------------------------- |
| Impact        | 3     | Used app-wide for all icons |
| Risk          | 2     | Simple component, low risk  |
| Complexity    | 1     | Simple wrapper              |
| Changeability | 3     | Easy to add new icons       |
| Learning      | 1     | Standard patterns           |

---

## Finding: ICON-01 — Circular Import (P0)

**Evidence** (line 1): `import { Icon as AssetIcon } from '../Icon';` - imports from parent folder.

**Root Cause**: File is `ui/Icon.tsx` importing from `../Icon` which resolves to itself or parent.

**Fix Idea**: Fix import path to correct component.

---

## Finding: ICON-02 — Type Safety Loose (P2)

**Evidence** (line 53): `name: IconName | string;` - loosened to string.

**Root Cause**: Workaround for 'as any' coercions.

**Fix Idea**: Tighten type safety.

---

## Finding: ICON-03 — Hardcoded Fallback (P2)

**Evidence** (line 108): Falls back to HelpCircle for unknown icons.

**Root Cause**: Silent failure could hide issues.

**Fix Idea**: Add warning or return null.

---

## Prioritized Backlog

| ID      | Category    | Severity | Effort | Fix                      |
| ------- | ----------- | -------- | ------ | ------------------------ |
| ICON-01 | Correctness | P0       | 0.5h   | Fix circular import      |
| ICON-02 | Type Safety | P2       | 1h     | Tighten type definitions |
| ICON-03 | DX          | P3       | 0.5h   | Add warning for unknown  |

---

## Related Artifacts

- `src/frontend/src/components/Icon.tsx`
- `src/frontend/src/data/gameRegistry.ts`
