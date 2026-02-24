# Audit: settingsStore.ts

**Target**: `src/frontend/src/store/settingsStore.ts`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 5, Risk 4, Complexity 2, Changeability 2, Learning 2 = **15/25**

---

## Why This File?

This is the **global settings store** using Zustand. Persists user preferences (language, sound, TTS engine, etc.) across sessions.

---

## Scoring Rationale

| Criterion     | Score | Justification                      |
| ------------- | ----- | ---------------------------------- |
| Impact        | 5     | All features depend on settings    |
| Risk          | 4     | Breaking changes affect entire app |
| Complexity    | 2     | Simple Zustand store               |
| Changeability | 2     | Stable API                         |
| Learning      | 2     | Standard Zustand patterns          |

---

## Finding: SS-01 — Duplicate Interface Definition (P1)

**Evidence** (lines 17-30 and 32-42): `SettingsState` interface defined twice.

**Root Cause**: Copy-paste error.

**Fix Idea**: Merge into single interface definition.

---

## Finding: SS-02 — Settings Type Not Exported (P2)

**Evidence**: `Settings` interface (line 3) not exported but used externally.

**Root Cause**: Missing export.

**Fix Idea**: Add `export` to Settings interface.

---

## Finding: SS-03 — Magic String for Storage Key (P2)

**Evidence** (line 72): `'advay-settings'` hardcoded.

**Root Cause**: Could be centralized in config.

**Fix Idea**: Move to constants file.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                       |
| ----- | ----------- | -------- | ------ | ------------------------- |
| SS-01 | Correctness | P1       | 0.5h   | Merge duplicate interface |
| SS-02 | DX          | P2       | 0.5h   | Export Settings interface |
| SS-03 | DX          | P3       | 0.5h   | Centralize storage key    |

---

## Related Artifacts

- `src/frontend/src/hooks/useTTS.ts` (uses settings store)
- `src/frontend/src/hooks/useGameHandTracking.ts` (uses settings store)
