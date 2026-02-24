# Audit: useTTS.ts

**Target**: `src/frontend/src/hooks/useTTS.ts`  
**Date**: 2026-02-24  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 3, Changeability 2, Learning 2 = **14/25**

---

## Why This File?

This is the **TTS hook** for text-to-speech functionality. Provides React integration for the TTS service with state management.

---

## Scoring Rationale

| Criterion     | Score | Justification                                    |
| ------------- | ----- | ------------------------------------------------ |
| Impact        | 4     | Used by VoiceInstructions and HandTrackingStatus |
| Risk          | 3     | TTS failures are visible but non-critical        |
| Complexity    | 3     | Multiple useEffects + state management           |
| Changeability | 2     | Stable hook API                                  |
| Learning      | 2     | Standard React patterns                          |

---

## Finding: TTS-01 — Polling Interval Not Configurable (P2)

**Evidence** (lines 100-103): Fixed 100ms polling interval for isSpeaking check.

**Root Cause**: Hardcoded interval.

**Fix Idea**: Make interval configurable via options.

---

## Finding: TTS-02 — mountedRef Not Properly Synced (P2)

**Evidence** (line 83): `mountedRef.current = true` in cleanup return is backwards.

**Root Cause**: Should be set to false on unmount.

**Fix Idea**: Fix mount/unmount logic.

---

## Finding: TTS-03 — Multiple ttsEngine Effects (P2)

**Evidence** (lines 62-93): Engine preference effect has side effects and subscriptions.

**Root Cause**: Complex initialization logic.

**Fix Idea**: Simplify or separate concerns.

---

## Finding: TTS-04 — No Error Return (P2)

**Evidence** (lines 111-123): speak() swallows errors silently.

**Root Cause**: No error state exposed.

**Fix Idea**: Add error state to return type.

---

## Prioritized Backlog

| ID     | Category    | Severity | Effort | Fix                                |
| ------ | ----------- | -------- | ------ | ---------------------------------- |
| TTS-01 | DX          | P2       | 0.5h   | Make polling interval configurable |
| TTS-02 | Correctness | P1       | 0.5h   | Fix mountedRef logic               |
| TTS-03 | Complexity  | P2       | 1h     | Simplify initialization            |
| TTS-04 | DX          | P2       | 1h     | Add error state                    |

---

## Related Artifacts

- `src/frontend/src/services/ai/tts/TTSService.ts`
- `src/frontend/src/components/game/VoiceInstructions.tsx`
