# Audit: HandTrackingStatus.tsx

**Target**: `src/frontend/src/components/game/HandTrackingStatus.tsx`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 2, Changeability 3, Learning 2 = **14/25**

---

## Why This File?

This is the **hand tracking status indicator** component. Shows friendly prompts when hand is not detected, with mascot animation and voice prompts.

---

## Scoring Rationale

| Criterion     | Score | Justification                                            |
| ------------- | ----- | -------------------------------------------------------- |
| Impact        | 4     | All games use for hand tracking UX                       |
| Risk          | 3     | Display component, failures are visible but non-critical |
| Complexity    | 2     | Simple conditional rendering + animations                |
| Changeability | 3     | Changes affect game UX feel                              |
| Learning      | 2     | Standard React patterns                                  |

---

## Finding: HT-01 — Hardcoded 8s Cooldown (P2)

**Evidence** (line 42): `const SPEAK_COOLDOWN_MS = 8000;`

**Root Cause**: Magic number not configurable.

**Fix Idea**: Add as prop with default.

---

## Finding: HT-02 — Inline CSS + Tailwind Mix (P2)

**Evidence** (lines 86-94, 109-128): Mix of Tailwind classes and inline styles.

**Root Cause**: Inconsistent styling approach.

**Fix Idea**: Pick one approach (prefer Tailwind).

---

## Finding: HT-03 — useTTS Hook vs ttsService Direct (P2)

**Evidence** (line 44): Uses `useTTS` hook, but VoiceInstructions uses `ttsService` directly.

**Root Cause**: Inconsistent TTS usage.

**Fix Idea**: Standardize on one approach.

---

## Finding: HT-04 — Missing Error Handling for TTS (P3)

**Evidence**: No try-catch around speak() call.

**Root Cause**: TTS errors silently fail.

**Fix Idea**: Add error boundary.

---

## Prioritized Backlog

| ID    | Category        | Severity | Effort | Fix                        |
| ----- | --------------- | -------- | ------ | -------------------------- |
| HT-01 | DX              | P2       | 0.5h   | Make cooldown configurable |
| HT-02 | DX              | P2       | 1h     | Standardize CSS approach   |
| HT-03 | Maintainability | P2       | 1h     | Unify TTS usage            |
| HT-04 | Reliability     | P3       | 0.5h   | Add TTS error handling     |

---

## Related Artifacts

- `src/frontend/src/components/game/VoiceInstructions.tsx`
- `src/frontend/src/hooks/useTTS.ts`
