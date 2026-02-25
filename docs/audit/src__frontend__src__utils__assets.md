# Audit: assets.ts

**Target**: `src/frontend/src/utils/assets.ts`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 2, Complexity 2, Changeability 2, Learning 2 = **12/25**

---

## Why This File?

This is the **asset library** providing pre-configured game assets (clothing, weather backgrounds, bubbles, sounds). Uses inline SVG/data URIs to avoid external dependencies.

---

## Scoring Rationale

| Criterion     | Score | Justification              |
| ------------- | ----- | -------------------------- |
| Impact        | 4     | All games use these assets |
| Risk          | 2     | Static data, low risk      |
| Complexity    | 2     | Simple asset definitions   |
| Changeability | 2     | Easy to add new assets     |
| Learning      | 2     | Standard asset patterns    |

---

## Finding: ASSET-01 — Duplicate Asset Keys (P2)

**Evidence** (lines 80-82): `windy` uses same URL as `sunny`.

**Root Cause**: Copy-paste error.

**Fix Idea**: Add proper windy background URL.

---

## Finding: ASSET-02 — Empty/Mock Sound Assets (P2)

**Evidence** (lines 170-195): All SOUND_ASSETS have same dummy base64 data.

**Root Cause**: Placeholder sounds.

**Fix Idea**: Replace with actual sound data or remove.

---

## Finding: ASSET-03 — Missing Error Handling in playSound (P2)

**Evidence** (lines 276-281): playSound catches errors but doesn't notify user.

**Root Cause**: Silent failure.

**Fix Idea**: Consider returning boolean success.

---

## Finding: ASSET-04 — Global Singleton Pattern (P2)

**Evidence** (line 317): `export const assetLoader = new AssetLoader()`

**Root Cause**: Global state, harder to test.

**Fix Idea**: Consider dependency injection.

---

## Prioritized Backlog

| ID       | Category    | Severity | Effort | Fix                      |
| -------- | ----------- | -------- | ------ | ------------------------ |
| ASSET-01 | Correctness | P2       | 0.5h   | Fix windy background URL |
| ASSET-02 | DX          | P2       | 2h     | Add real sound data      |
| ASSET-03 | DX          | P3       | 0.5h   | Add return value         |
| ASSET-04 | Testability | P2       | 1h     | Consider DI for loader   |

---

## Related Artifacts

- `src/frontend/src/pages/DressForWeather.tsx`
- `src/frontend/src/pages/BubblePopSymphony.tsx`
