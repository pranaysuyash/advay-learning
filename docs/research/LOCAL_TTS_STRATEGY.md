# Local & Transformer-Based TTS Strategy

**Date:** 2026-02-21

## Objective
Explore integrating more natural, high-fidelity Text-to-Speech (TTS) models into the application, moving beyond the standard Web Speech API. The goal is to evaluate local small models running in-browser via WebAssembly/WebGPU, or utilizing Hugging Face PRO inference endpoints as a hybrid fallback.

## 1. Zero-Cost, In-Browser Local TTS (transformers.js)
Running TTS locally within the user's browser guarantees offline capability, zero server latency, and complete privacy for child users.

### Recommended Models:
*   **Xenova/speecht5_tts:** A robust, lightweight model ported to ONNX for `transformers.js`. It supports multiple speaker embeddings, allowing Pip (the mascot) to have a distinct, recurring voice.
*   **Kokoro-82M (ONNX):** Based on recent project integrations (e.g., the "Hybrid Intelligence Bridge"), Kokoro is an extremely capable 82M parameter model. If quantized to INT8 and run via ONNX Runtime Web using WebGPU, it can run efficiently on most modern devices (iPads, Macs).

### Implementation Path:
1.  Install `@xenova/transformers`.
2.  Create a Web Worker to handle model loading and inference off the main thread to prevent UI freezing.
3.  Cache the downloaded model weights in the browser's Cache API or IndexedDB so players only download the ~100MB-200MB model payload once.
4.  Pipe the output `Float32Array` audio buffer to the Web Audio API for playback.

## 2. Cloud Fallback: Hugging Face Inference Endpoints
Since the user has PRO access until March 1st, we can spin up dedicated Inference Endpoints for ultra-fast, high-fidelity voice generation. 

### Strategy:
*   **XTTS-v2 (Coqui):** Spin up an XTTS-v2 endpoint capable of instant voice cloning and emotional prosody. We can supply a 3-second reference audio clip to create a custom "Pip" voice.
*   **Parler-TTS:** Another excellent transformer-based model on HF that allows prompting for emotion (e.g., "A happy, enthusiastic cartoon character says...").
*   **Implementation:** Call the HF Inference API from the backend or edge function, stream the audio back, and cache generated phrases (e.g., "Great job!", "Try again!") to minimize API calls and latency.

## 3. Recommended Hybrid Approach
1.  **Static/Common Phrases:** Pre-generate common UI phrases ("Menu", "Start", "Great job!") using a high-quality HF model (like XTTS-v2) and bundle them as static `.ogg` assets for zero latency.
2.  **Dynamic Phrases:** For dynamic elements (e.g., reading a child's name, dynamic praise), use an in-browser `transformers.js` model (SpeechT5) running locally via WebGPU. 
3.  **Prototyping Next Step:** Create a `useLocalTTS.ts` hook that instantiates `transformers.js` in a worker thread and exposes a `speak(text)` function, replacing the current `window.speechSynthesis` calls.
