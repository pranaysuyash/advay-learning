# Local & Transformer-Based TTS Strategy

**Date:** 2026-02-21
**Status:** IMPLEMENTED (2026-03-06)

> **Implementation Note:** Kokoro-82M is now the primary TTS engine. The three-tier strategy is:
> 1. Pre-generated audio (optional, files not generated)
> 2. Kokoro-82M (local, primary)  
> 3. Web Speech API (fallback)
>
> See: `src/frontend/src/services/ai/tts/`

## Objective
Explore integrating more natural, high-fidelity Text-to-Speech (TTS) models into the application, moving beyond the standard Web Speech API. The goal is to evaluate local small models running in-browser via WebAssembly/WebGPU, or utilizing Hugging Face PRO inference endpoints as a hybrid fallback.

## 1. Zero-Cost, In-Browser Local TTS (kokoro-js)

> **IMPLEMENTED** ✅

Running TTS locally within the user's browser guarantees offline capability, zero server latency, and complete privacy for child users.

### Implemented Model:
*   **Kokoro-82M (ONNX):** ✅ IMPLEMENTED via `kokoro-js`
    *   Located: `src/frontend/src/services/ai/tts/KokoroTTSEngine.ts`
    *   Runs in Web Worker: `src/frontend/src/services/ai/tts/tts.worker.ts`
    *   Uses WebGPU/WebAssembly for acceleration

### Implementation (Completed):
1.  ✅ `kokoro-js` package installed
2.  ✅ Web Worker handles model loading/inference
3.  ✅ Cached in browser after first download (~100MB)
4.  ✅ Output piped to Web Audio API

## 2. Cloud Fallback: Hugging Face Inference Endpoints

> **NOT IMPLEMENTED** - Not needed, local Kokoro provides sufficient quality

~~Since the user has PRO access until March 1st, we can spin up dedicated Inference Endpoints for ultra-fast, high-fidelity voice generation.~~

~~### Strategy:~~
*   ~~**XTTS-v2 (Coqui):** Spin up an XTTS-v2 endpoint capable of instant voice cloning and emotional prosody. We can supply a 3-second reference audio clip to create a custom "Pip" voice.~~
*   ~~**Parler-TTS:** Another excellent transformer-based model on HF that allows prompting for emotion (e.g., "A happy, enthusiastic cartoon character says...").~~
*   ~~**Implementation:** Call the HF Inference API from the backend or edge function, stream the audio back, and cache generated phrases (e.g., "Great job!", "Try again!") to minimize API calls and latency.~~

## 3. Recommended Hybrid Approach

> **PARTIALLY IMPLEMENTED**

1.  ~~**Static/Common Phrases:**~~ Pre-generated audio files not generated (optional - fallback to Kokoro works)
2.  ✅ **Dynamic Phrases:** Kokoro-82M handles dynamic text in-browser
3.  ✅ **Implementation:** `useTTS.ts` hook with auto-fallback chain
