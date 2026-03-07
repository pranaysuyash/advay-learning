# Architecture Document Review: AI-Native ARCHITECTURE.md

**Reviewed on:** 2026-03-05
**Updated:** 2026-03-06
**Reviewer:** Doc-to-Code Audit Agent

## Status: ALL FINDINGS RESOLVED ✅

All findings from the original audit have been addressed. The architecture is now aligned with implementation.

## Implementation Status (2026-03-06)

| Component | Location | Status |
|-----------|----------|--------|
| **TTS** | `src/frontend/src/services/ai/tts/` | ✅ Implemented (Kokoro + Web Speech) |
| **STT** | `src/frontend/src/services/ai/stt/` | ✅ Implemented (Whisper + Web Speech) |
| **LLM** | `src/frontend/src/services/ai/llm/` | ✅ Implemented (Transformers.js, WebLLM, Ollama, HF) |
| **Vision** | `src/frontend/src/services/ai/vision/` | ✅ Implemented (MediaPipe abstraction) |
| **Feature Flags** | `src/frontend/src/config/features.ts` | ✅ Implemented with AI flags |
| **Safety** | `docs/ai-native/SAFETY_GUIDELINES.md` | ✅ Exists |
| **Backend Config** | `src/backend/app/core/config.py` | ✅ AI env vars present |

## Findings Resolution

| ID | Finding | Status | Resolution |
| -- | -- | -- | -- |
| F-001 | Architecture doc out-of-sync | ✅ DONE | Updated doc with implementation paths |
| F-002 | LLMService implementation | ✅ DONE | Already existed with Transformers.js, WebLLM, Ollama, HF providers |
| F-003 | STTService not implemented | ✅ DONE | Implemented Whisper (primary) + Web Speech (fallback) |
| F-004 | Feature flags missing | ✅ DONE | Added `ai.sttV1`, `ai.ttsV1` flags |
| F-005 | Env var mismatch | ✅ DONE | Backend already has AI env vars aligned |
| F-006 | Data-flow examples unmapped | ✅ DONE | Data flows map to service implementations |
| F-007 | Phase schedule outdated | ✅ DONE | Marked as reference only |
| F-008 | Cache strategy unclear | ✅ DONE | LocalStorage caching used in services |
| F-009 | Safety/privacy layers | ✅ DONE | Safety guidelines doc exists, blocked-words.json in use |
| F-010 | VisionService abstraction | ✅ DONE | MediaPipeVisionProvider implemented |

## Provider Summary

### STT (Speech-to-Text)
- **Primary**: Whisper via Transformers.js (`distil-whisper-tiny.en`)
- **Fallback**: Web Speech API
- Research: `speech_experiments/model-lab/ASR_MODEL_RESEARCH_2026-02.md`

### TTS (Text-to-Speech)
- **Primary**: Kokoro-82M via kokoro-js
- **Fallback**: Web Speech API

### LLM (Text Generation)
- **Local**: Transformers.js (Qwen3.5 models), WebLLM, Ollama
- **Cloud**: HuggingFace Inference API

### Vision
- **Primary**: MediaPipe (hand, pose, face)

---

## Integration Notes

**VisionService vs useHandTracking:**

- `useHandTracking` - Optimized hook for 25+ existing games
- `VisionService` - Service abstraction for new features, testing

This follows the architectural pattern: hooks for performance-critical game code, services for application-level features.

**Feature Flags:**
- `ai.sttV1` appears in Settings UI (editable)
- `ai.ttsV1` hidden (not editable, always on)

**WhisperSTTProvider:**
- Requires manual browser test with WebGPU
- Model: `Xenova/distil-whisper-tiny.en` (~75MB)

---

✅ Audit complete - architecture doc aligned with implementation.
