# Doc Review: LOCAL_TTS_STRATEGY.md

**Reviewed:** 2026-03-06

## Status: RESOLVED ✅

The document describes a strategy that has been implemented with graceful fallbacks.

## Implementation Status

| Claim | Status | Evidence |
|-------|--------|----------|
| Kokoro-82M | ✅ IMPLEMENTED | `services/ai/tts/KokoroTTSEngine.ts` |
| Web Worker | ✅ IMPLEMENTED | `services/ai/tts/tts.worker.ts` |
| Pre-generated cache | ✅ IMPLEMENTED | `services/ai/tts/PregenAudioCache.ts` |
| Pre-generated audio files | ⚠️ MISSING | Files don't exist but fallback to Kokoro works |
| SpeechT5 | ❌ NOT NEEDED | Kokoro covers use case |
| HF Inference cloud | ❌ NOT NEEDED | Local-first works |

## Resolution

**F-001 (Pre-generated audio files):** 
- Audio files not generated (requires HF_TOKEN)
- **Not blocking:** TTSService falls back to Kokoro → Web Speech
- System works without these files

**F-002/F-003 (SpeechT5, HF Cloud):**
- Low priority - Kokoro provides high-quality local TTS
- No need to implement alternatives

## Updated Doc Note

The document should be updated to reflect:
1. Kokoro is the primary implementation
2. Pre-generated audio is optional enhancement
3. Fallback chain: pregen → Kokoro → Web Speech

---
