# Audit: VoiceButton.tsx

**Target**: `src/frontend/src/components/ui/VoiceButton.tsx`  
**Date**: 2026-02-25  
**Type**: Multi-Viewpoint Analysis  
**Scoring**: Impact 3, Risk 1, Complexity 2, Changeability 3, Learning 1 = **10/25**

---

## Why This File?

This is the **Voice Button component** - text-to-speech button for pre-readers with auto-play support.

---

## Scoring Rationale

| Criterion     | Score | Justification            |
| ------------- | ----- | ------------------------ |
| Impact        | 3     | TTS for pre-readers      |
| Risk          | 1     | Low risk - isolated      |
| Complexity    | 2     | Medium - TTS integration |
| Changeability | 3     | Easy to extend           |
| Learning      | 1     | Standard React patterns  |

---

## Finding: VOICE-01 — sizeClasses/variantClasses Inside Component (P2)

**Evidence** (lines 47-58): Objects defined inside component, recreated each render.

**Root Cause**: Minor performance issue.

**Fix Idea**: Move outside component.

---

## Finding: VOICE-02 — Auto-play Hardcoded Delay (P2)

**Evidence** (line 36): 500ms delay hardcoded in useEffect.

**Root Cause**: Not configurable.

**Fix Idea**: Add delay prop.

---

## Finding: VOICE-03 — Missing stop on Unmount (P2)

**Evidence** (lines 32-38): useEffect doesn't call stop() on cleanup.

**Root Cause**: TTS could continue playing after unmount.

**Fix Idea**: Call stop() in cleanup.

---

## Prioritized Backlog

| ID       | Category    | Severity | Effort | Fix                  |
| -------- | ----------- | -------- | ------ | -------------------- |
| VOICE-03 | Reliability | P2       | 0.5h   | Add stop on cleanup  |
| VOICE-01 | Performance | P2       | 0.5h   | Move objects outside |
| VOICE-02 | Flexibility | P2       | 0.5h   | Add delay prop       |

---

## Related Artifacts

- `src/frontend/src/hooks/useVoicePrompt.ts`
