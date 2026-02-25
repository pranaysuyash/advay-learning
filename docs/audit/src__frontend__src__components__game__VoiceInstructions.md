# Audit: VoiceInstructions.tsx

**Target**: `src/frontend/src/components/game/VoiceInstructions.tsx`  
**Date**: 2026-02-24  
**Ticket**: TCK-20260224-001
**Ticket**: TCK-20260224-001
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 4, Risk 3, Complexity 2, Changeability 3, Learning 2 = **14/25**

---

## Why This File?

This is the **TTS voice instruction system** for all games. Provides text-to-speech for pre-literate children (ages 2-4).

---

## Scoring Rationale

| Criterion     | Score | Justification                             |
| ------------- | ----- | ----------------------------------------- |
| Impact        | 4     | All games use voice for instructions      |
| Risk          | 3     | TTS failures are visible but non-critical |
| Complexity    | 2     | Simple React wrapper around ttsService    |
| Changeability | 3     | Changes affect game UX feel               |
| Learning      | 2     | Standard TTS patterns                     |

---

## Finding: VI-01 — Inline CSS in Component (P2)

**Evidence** (lines 111-145, 165-190): Large inline style objects.

**Root Cause**: CSS-in-JS via inline styles instead of CSS modules or styled-components.

**Fix Idea**: Extract to CSS modules or Tailwind classes.

---

## Finding: VI-02 — useVoiceInstructions Has Race Condition (P2)

**Evidence** (lines 203-217): setTimeout in speak() could fire after unmount.

**Root Cause**: No cleanup for async timeout.

**Fix Idea**: Use AbortController or track mounted state.

---

## Finding: VI-03 — speakSequence Not Cancelable (P3)

**Evidence** (lines 212-220): Loop with await cannot be interrupted.

**Root Cause**: No cancellation token.

**Fix Idea**: Add cancellation support via ref.

---

## Finding: VI-04 — Missing Error Boundary (P2)

**Evidence**: No try-catch around ttsService.speak().

**Root Cause**: Errors silently caught in .catch().

**Fix Idea**: Add user-facing error state.

---

## Prioritized Backlog

| ID    | Category    | Severity | Effort | Fix                           |
| ----- | ----------- | -------- | ------ | ----------------------------- |
| VI-01 | DX          | P2       | 1h     | Extract inline CSS to classes |
| VI-02 | Reliability | P2       | 1h     | Add cleanup for setTimeout    |
| VI-03 | DX          | P3       | 1h     | Add cancel support            |
| VI-04 | Reliability | P2       | 0.5h   | Add error state               |

---

## Related Artifacts

- `src/frontend/src/services/ai/tts/TTSService.ts`
- `EMOJI_MATCH_COMPREHENSIVE_VIDEO_AUDIT_COLLATION_2026-02-20.md`
