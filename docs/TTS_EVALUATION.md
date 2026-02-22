# Local TTS Model Evaluation for Web

## Objective
Evaluate local (in-browser) transformer-based Text-to-Speech (TTS) models to provide an ultra-fast, offline-capable, and private voice for Pip (the mascot) in the Advay Learning application.

## Candidates

### 1. Transformers.js with SpeechT5
- **Description**: Microsoft's SpeechT5 model ported to the browser via Xinova's Transformers.js.
- **Size**: ~140MB (quantized ONNX).
- **Pros**: 
  - Well-supported in the JS ecosystem.
  - Generates decent quality speech for an edge model.
  - Can run on CPU (WASM) or WebGPU.
- **Cons**: 
  - Voice quality is somewhat robotic compared to modern SOTA.
  - Requires a speaker embedding vector (x-vector) for voice conditioning.

### 2. Kokoro / Kokoro-ONNX (Web)
- **Description**: Kokoro is an extremely high-quality, lightweight TTS model (82M parameters).
- **Size**: ~100MB to 150MB depending on quantization.
- **Pros**:
  - Very near state-of-the-art TTS quality at a fraction of the parameter count of competitors (like XTTS).
  - WebGPU compatible via ONNX or standard Transformers.js integrations (recently added by Xenova or community).
  - Excellent prosody and child-friendly voice capabilities.
- **Cons**:
  - Requires phonemization preprocessing (e.g. espeak-ng) which can be tricky to compile to WebAssembly.
  - Bleeding edge; Web implementation might require custom ONNX bridging.

### 3. VITS (via Transformers.js or specialized web runtime)
- **Description**: VITS (Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech).
- **Size**: ~150MB - 300MB depending on the specific checkpoint.
- **Pros**:
  - Very fast inference.
  - Good quality, many existing checkpoints (LJS, VCTK).
- **Cons**:
  - Training custom voices is harder.
  - Slower than Kokoro on some edge devices.

## Requirements for Advay Learning
1. **Speed**: Must generate audio in < 500ms time-to-first-byte (TTFB).
2. **Offline**: Must run entirely in the browser (WASM/WebGPU).
3. **Quality**: Voice must be highly intelligible and engaging for a 3-8 year old child (Pip's voice).
4. **Bundle Size**: Initial model download must be acceptable (< 200MB, ideally cached in IndexedDB).

## Implementation Strategy
Based on current research, **Kokoro via Transformers.js (v3)** is the clear front-runner.

**Why Kokoro WebGPU?**
1. **Unmatched Quality-to-Size Ratio**: At 82M parameters, it rivals server-side API quality but can be cached locally.
2. **Transformers.js v3 Support**: With the native WebGPU support in Transformers.js v3, we can achieve real-time (or faster) generation natively in the browser without server roundtrips.
3. **Existing Tooling**: Libraries like `kokoro-js` are actively being developed for browser environments, handling the complex phonemization (eSpeak-ng compiled to WASM) and audio buffering out of the box.

**Recommended Immediate Next Step:**
Create a proof-of-concept (PoC) component inside the web app that imports `transformers.js` and attempts to load the ONNX quantized version of Kokoro. Test the time-to-first-byte (TTFB) on a standard laptop to ensure it hits the < 500ms requirement for interactive child education.
