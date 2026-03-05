# STT Provider Survey (2026-03-05)

Speech-to-text options for the platform, with an emphasis on child voice
recognition and local/offline capability. No STT service exists yet in
code, see Finding F-003 in `docs/reviews/AI_NATIVE_ARCHITECTURE.review.md`.

## Candidate Technologies

| Provider                        | Type              | Latency                       | Accuracy              | Child‑voice              | Offline | Notes                                                                |
| ------------------------------- | ----------------- | ----------------------------- | --------------------- | ------------------------ | ------- | -------------------------------------------------------------------- |
| **Web Speech API**              | Browser built-in  | ~500 ms                       | Moderate (adult bias) | Fair                     | Partial | Requires cloud server on Chrome; Firefox unsupported.                |
| **Whisper.cpp / ggml**          | Local native/WASM | 200–1500 ms (model dependent) | Very good             | Good (with small models) | ✅      | Open-source, MIT; models 75 MB–3 GB; runs on CPU, WebGPU, WASM.      |
| **Vosk**                        | Local native      | real-time                     | Good                  | Fair                     | ✅      | 20+ languages; 50 MB per language; streaming API; JS bindings exist. |
| **Whisper API (OpenAI)**        | Cloud             | 500–1200 ms                   | Excellent             | Good                     | ❌      | Pay‑per‑token; suitable for fallback only.                           |
| **Google Speech-to-Text**       | Cloud             | 300–800 ms                    | Excellent             | Good                     | ❌      | Offers child‑voice models.                                           |
| **AssemblyAI / Deepgram / etc** | Cloud             | 300–800 ms                    | Excellent             | Good                     | ❌      | Commercial, use per‑minute licenses.                                 |

### Web Speech Details

MDN documentation confirms the API has good cross‑browser support in
Chrome/Safari but not Firefox (prefix required). The `processLocally` flag
is experimental and would allow offline recognition when supported
(Chrome 140+). The API supports interim results, grammar biasing, and
multiple languages; however, quality is inconsistent with child voices
and can silently send audio to vendor servers.

### Whisper.cpp

The GitHub repo for `ggml-org/whisper.cpp` documents a lightweight C++
implementation of OpenAI Whisper suitable for on-device use. Models
range from tiny (75 MB, ~40% accuracy on MBEval) to large (2.9 GB, >90%).
WebAssembly builds exist (e.g. `whisper.wasm`). Key observations:

- Easily quantized to q5/q4, trading quality for size. Tiny models run in
  <200 ms on modern mobiles using WASM SIMD.
- JavaScript bindings are available via `bindings/javascript`.
- Real-time streaming CLI exists; the library already runs in browser and
  Node environments. Some developers have built React/React Native
  wrappers.
- VAD models (Silero‑VAD) can be used to reduce processing cost.

**Suitability**: strong candidate for local STT; child‑voice dataset may
need fine‑tuning but Whisper performs reasonably well on noisy, high‑pitched
audio.

### Vosk

Vosk is a lightweight offline recognition toolkit with models as small as
50 MB per language; supports streaming and partial results. JS, Python,
Java, C# bindings are provided. Accuracy is good at adult voices; child
models available via adaptation or custom training. Low CPU footprint makes
it appealing for tablets/Raspberry Pi.

### Commercial APIs

Cloud services (Google, OpenAI, AssemblyAI, Deepgram, etc) offer high
accuracy including child‑voice models, but incur per‑minute costs and
require audio upload (privacy concerns). We will treat them as last‑resort
fallbacks behind parent consent.

## Recommendations

1. **Implement a `STTService`** analogous to `TTSService`/`LLMService`, with
   providers plugin architecture.
2. **Primary provider**: Web Speech API for browsers, augmented with
   Whisper.cpp (WASM) for environments where the API is unavailable or
   offline is required. Whisper can run in a WebWorker to avoid blocking
   UI. Use smaller quantized models (tiny/base) for phones.
3. **Secondary local provider**: Vosk, especially for multi‑language or
   server‑localized deployments; JS bindings can be wrapped similarly.
4. **Cloud fallback**: OpenAI Whisper API or Google STT gated by feature
   flag & consent; ensure transcripts are treated as PII and not logged.
5. **Child‑voice tuning**: investigate fine‑tuning Whisper/Vosk with our
   own recordings (could be future research).

## Next steps

- Audit the codebase for any existing STT experiments (none found).
- Create ticket TCK‑20260305‑012 :: Implement STTService + providers.
- Evaluate whisper.js performance on sample child voice recordings.
- Add STT research summary to architecture doc and TTS/STT research map.

_Research completed March 5 2026_
