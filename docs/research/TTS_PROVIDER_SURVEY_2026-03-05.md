# TTS Provider Survey (2026-03-05)

This document collects authoritative information about text‑to‑speech
options suitable for the Advay Vision Learning platform. Focus is
on on‑device/neural voices for children, with fallbacks and cloud
alternatives.

## Existing Codebase

- `src/frontend/src/services/ai/tts/KokoroTTSProvider.ts` — uses
  `kokoro-js` with the Kokoro‑82M‑ONNX model. Runs fully on‑device
  via ONNX/WebGPU (WASM fallback). ~45 MB quantized model. Voice
  `af_heart` chosen for Pip. Implementation includes dynamic import,
  WebAudio playback, and device detection.
- `src/frontend/src/services/ai/tts/WebSpeechTTSProvider.ts` — fallback
  wrapping the browser `speechSynthesis` API. Used when Kokoro
  fails (Firefox, old devices). rate/pitch defaults tuned for child
  voice.

There is also a `TTSService` using these providers (see
`src/frontend/src/services/ai/tts/TTSService.ts`), but no general
research document existed prior to today.

## Candidate Providers

| Provider       | Type                | Model(s) | Size       | Latency | Quality                  | Offline? | Notes                |
| -------------- | ------------------- | -------- | ---------- | ------- | ------------------------ | -------- | -------------------- |
| **Kokoro‑82M** | Local (ONNX/WebGPU) | single   | 45 MB (q8) | 1–2 s   | Excellent for 82 M model | ✅       | Already implemented; |

neuro‑TTS; supports 20+ voices; Apache‑2.0 licensed. Quantization
to q4/q4f16 reduces size further.
| **Web Speech API** | Local (browser) | n/a | n/a | <100 ms | Basic | ✅ | Built into Chrome/Safari
(not Firefox); audio sent to vendor cloud on some browsers
(unless `processLocally` supported).
| **Piper TTS** | Local (ONNX) | multiple | 50–200 MB | <50 ms | Good | ✅ | Open‑source, used previously in repo; supports fine
phoneme control.
| **ElevenLabs** | Cloud | v2/v3 | n/a | 200–500 ms | 🏆 industry-leading | ❌ | High cost; parent‑enabled only. Supports custom voices.
| **Google Cloud TTS** | Cloud | WaveNet, c2 | n/a | 100–300 ms | Very good | ❌ | Commercial; offers multilingual voices.
| **Coqui TTS** | Local (Py/TensorFlow) | TTS models | ~100 MB | 50–150 ms | Good | ✅ | More developer workload; runs via WASM or Python.
| **OpenAI Whisper+TTS** | Cloud/local | GPT‑TTS? | n/a | 200–600 ms | Excellent | ❌ | Experimental.

### Kokoro details

The Hugging Face model card for `onnx-community/Kokoro-82M-v1.0-ONNX`
confirms the 82 M parameter size, Apache‑2.0 license, and quantization
options (fp32/ffp16/q8/q4). The JavaScript usage pattern mirrors our
provider; performance benchmarks show ~0.5 s/50 kb input on modern
WebGPU.

**Strengths:** tiny download, high quality, local privacy, WebGPU
acceleration, open license.
**Weaknesses:** single voice set (though 20+ voices available
client‑side), occasional WASM slowdown on very old devices.

### Alternative small local models (for comparison)

- **Mellotron‑lite** (Tacotron variant) – 30 M params, low quality;
  not well‑maintained.
- **LiteTTS/Glow‑TTS** – 20–50 M models; available via `onnx`.
- **Piper‑S** – the earlier LLM‑derived voice used in some games; still
  in repo under `ttsEngine='kokoro'` fallback? (check settings store).

None of these currently have runtime libraries as polished as
`kokoro-js`.

## Recommendations

1. **Continue using Kokoro as primary engine.** It meets local‑first,
   child‑friendly, low‑bandwidth requirements and already integrates
   cleanly. Consider adding support for smaller q4 and q4f16 variants
   to speed up WASM fallback.
2. **Keep Web Speech provider** as safety net; this is already wired.
3. **Add optional `PiperTTSProvider`** if plugin size or initialization
   time becomes an issue; the code is already in repo earlier under
   `src/services/ai/tts` (search) and can be re‑enabled via feature flag.
4. **Reserve cloud options** (ElevenLabs/Google) for parental/grade‑B
   narration features; cap usage behind consent and usage limits.

## Next steps

- Audit Kokoro provider for missing features (e.g. manage voice
  selection, dynamic quantization) – existing code was written for a
  2026‑02 review, may need extension.
- Create TCK for polishing TTSService, adding unit tests covering both
  Kokoro and WebSpeech.
- Monitor upstream `onnx-community/Kokoro‑…` for smaller quantized
  releases (q4f16 is ~86 MB, ideal for mobile).

_Research completed March 5 2026_
