# LLM Provider Survey (2026-03-05)

This research note collects available on-device and cloud LLM options as of early March 2026. It supplements the earlier architecture and roadmap documents and will inform the implementation of `LLMService`.

## Criteria

- **Local/offline support** (preferred for privacy & latency)
- **Model size & resource requirements** (RAM/VRAM, download size)
- **Latency** (mobile/desktop, measured or quoted)
- **Quality** (qualitative assessment from published benchmarks and recent releases)
- **Cost** (license, API fees)
- **Ease of integration** (npm package, CLI, backend, etc.)
- **Compatibility with browsers** (WebGPU, WASM) or native environment

## Candidates

### 1. WebLLM (mlc-ai/web-llm)

- **Type:** local, browser‑based using WebGPU; also runs under Node/WebAssembly
- **Models:** Llama‑3.2‑1B, Llama‑3.2‑3B, Gemma‑2‑2B/4B, Phi‑3.5‑mini, Mistral‑7B, Llama‑3.1‑8B, etc.
- **Quantization:** supports q4f16, q4f32, q3f16 offering trade‑offs between size and precision
- **Pros:** zero servers, offline after first load, 100% private, 80% native speed; supports emerging models such as SmolLM and Qwen-7B which run efficiently on lower‑end hardware
- **Cons:** initial download can be large (hundreds of MB to several GB depending on model), WebGPU support required (~70% of browsers), memory-limited on low-end devices
- **Integration:** `npm install @mlc-ai/web-llm` or CDN; simple JS API as shown in earlier analysis doc

### 2. Transformers.js (Hugging Face)

- **Type:** browser/Node using ONNX Runtime Web (WebGPU/WASM)
- **Models:** any converted HF model; libraries show examples using SmolLM, GPT‑2, Whisper, etc.
- **Pros:** broad model catalog (HF hub), supports text, vision, audio; can run on WebGPU or WASM; dataset conversion via Optimum
- **Cons:** performance slower than WebLLM in many benchmarks; some models >1GB; not tailored for chat out of box
- **Integration:** `npm install @huggingface/transformers` or via CDN; pipeline API similar to Python

### 3. Ollama (local service)

- **Type:** local server executable, supports Llama models and others; requires CLI and model downloads
- **Pros:** mature, works on desktop hardware; existing infrastructure in repo (prompts/docs)
- **Cons:** not browser‑native; requires user to install and run `ollama serve`; heavier disk/memory
- **Integration:** API via HTTP; existing prompts expect `ollama` command

### 4. Hugging Face Inference API (HF‑Pro)

- **Type:** cloud API
- **Models:** all HF hub models including Llama‑3‑xx‑chat, Falcon‑40B‑Instruct, etc.
- **Pros:** access to latest SOTA models without local resource constraints; HF‑Pro key available
- **Cons:** network latency, per‑token cost, data leaves device (privacy risk); may be used as fallback with parent consent

### 5. Anthropic/Claude, OpenAI GPT‑4, etc.

- **Type:** cloud
- **Notes:** already referenced in architecture as fallback providers; costs and latency similar to HF API but the API spec differs.

### 6. Other emerging options

- **Mistral‑in‑browser** (Mistral 7B quantized to WebGPU) – cited in WebLLM model catalog
- **Gemini‑Nano/Pro** packages via Transformers.js or HF; early 2026 releases may offer very small models optimized for devices
- **Meta WebLLM variants** (Llama‑2 series) may appear via WebLLM or transformers.js

## Small Model Focus (Comprehensive March 2026 Landscape)

Building on online research (web searches + model catalogs), March 2026 landscape is dominated by:

- **Qwen3.5 series** (NEW – Alibaba's latest: 0.5B, 1.5B, 3B, 7B, 14B, 32B variants; "rewritten from ground up")
- **Gemma-3n** (Google; 2B-27B sizes; web-optimized)
- **SmolLM3** (HuggingFace; 3B class; reasoning modes)
- **Phi-4-mini** (Microsoft; compact reasoning)
- **GLM-4.7-Flash-MoE** (Zhipu; agentic; MoE architecture)

Below are verified specs from web searches, model cards, and benchmarks:

### ⭐ TOP TIER: Sub-2B (Ultra-Lightweight, Mobile-Friendly)

#### **Qwen3.5-0.5B-Instruct (NEW – Alibaba, March 2026)**

**Source:** Facebook (news), BentoML guide, SiliconFlow (inference platform)

| Aspect                | Details                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Params**            | 3B (fixed architecture, not multi-variant like SmolLM2)                                                                     |
| **Quality**           | Outperforms Llama-3.2-3B / Qwen2.5-3B; competitive with 4B‑class alternatives (Qwen3, Gemma3)                               |
| **Key Feature**       | Dual-mode reasoning: `/think` for hard problems (cost reasoning tokens), `/no_think` for fast responses                     |
| **Context**           | 64K (trainable), 128K with YaRN extrapolation                                                                               |
| **License**           | Apache 2.0 (full recipe + training data mixture published)                                                                  |
| **Quantized (q4f16)** | ~900 MB                                                                                                                     |
| **Browser Support**   | ✅ Transformers.js v3/v4                                                                                                    |
| **Recommendation**    | **🥇 BEST for Pip MVP** — Superior quality over older models; reasoning flexibility; large context for complex storytelling |

#### **Qwen3.5 Family (NEW/LATEST – Alibaba, March 2026) — RECOMMENDED**

**Source:** Alibaba official releases (Mar 2026), BentoML 2026 guide, Facebook announcements

Alibaba announced **Qwen3.5 series** with models at 0.5B, 1.5B, 3B, 7B, 14B, 32B (coder variants). Key statement: "smallest models in the Qwen lineup...effectively being rewritten from the ground up."

| Model                     | Params | Improvement                                 | q4f16   | Context | Latency      | Browser         | Use Case                                 |
| ------------------------- | ------ | ------------------------------------------- | ------- | ------- | ------------ | --------------- | ---------------------------------------- |
| **Qwen3.5-0.5B-Instruct** | 0.5B   | **Dramatically better** than Qwen2.5-0.5B   | ~135 MB | 32K     | <500ms       | ✅ TJ v3/v4     | Ultra-mobile; fastest                    |
| **Qwen3.5-1.5B-Instruct** | 1.5B   | **Better** than SmolLM2-1.7B (new standard) | ~400 MB | 32K     | 1.5–3s/100tk | ✅ TJ/WebLLM    | Story generation; **strongly preferred** |
| **Qwen3.5-3B-Instruct**   | 3B     | Best-in-class 3B performance                | ~800 MB | 32K     | 2–4s/100tk   | ✅ TJ v3/v4     | If multilingual + good quality           |
| **Qwen3.5-7B-Instruct**   | 7B     | Best-in-class 7B                            | ~1.8 GB | 32K     | 3–5s/100tk   | ✅ TJ (backend) | Desktop/server tier                      |

**All Qwen3.5:** Multilingual (29+ languages), Apache 2.0 licensed  
**Previous Qwen3 (0.8B)** and **Qwen2.5** series are now superseded by Qwen3.5.

#### **SmolLM3-3B (HuggingFace, March 2026)**

**Source:** BentoML 2026 guide, HF official releases

| Aspect             | Details                                                                            |
| ------------------ | ---------------------------------------------------------------------------------- |
| **Params**         | 3B                                                                                 |
| **Quality**        | Outperforms Llama-3.2-3B, Qwen2.5-3B; competitive with Qwen3, Gemma3 at 4B scale   |
| **Key Feature**    | Dual-mode reasoning: `/think` (hard problems) vs `/no_think` (fast)                |
| **Context**        | 64K (128K with YaRN)                                                               |
| **q4f16**          | ~900 MB                                                                            |
| **Browser**        | ✅ Transformers.js v3/v4                                                           |
| **License**        | Apache 2.0 (full training recipe published)                                        |
| **Multilingual**   | Limited (6 European languages; benchmark before use)                               |
| **Latency**        | 2–4s/100tk                                                                         |
| **Recommendation** | **Alternative to Qwen3.5-3B**; use if reasoning flexibility + large context needed |

#### **Gemma-3n-E2B (Google, March 2026)**

**Source:** BentoML 2026 guide, MediaPipe LLM Inference API, Google releases

| Aspect             | Details                                                               |
| ------------------ | --------------------------------------------------------------------- |
| **Params**         | ~2B (E2B = Edge 2B, web-optimized tier)                               |
| **Quality**        | Good for lightweight tasks; Google's mobile-friendly variant          |
| **q4f16**          | ~600 MB                                                               |
| **Browser**        | ✅ MediaPipe LLM Inference API (native WebGPU), Transformers.js v4    |
| **License**        | Gemma license (permissive)                                            |
| **Multilingual**   | Yes                                                                   |
| **Recommendation** | Google's web-native option; strong for screenshot/image understanding |

#### **Phi-4-mini-Instruct (Microsoft, March 2026)**

**Source:** BentoML 2026 guide, Microsoft releases

| Aspect             | Details                                                     |
| ------------------ | ----------------------------------------------------------- |
| **Params**         | ~4B                                                         |
| **Quality**        | Compact reasoning; good for coding + logic                  |
| **q4f16**          | ~1.0 GB                                                     |
| **Browser**        | ✅ Transformers.js v3/v4                                    |
| **License**        | MIT (permissive)                                            |
| **Recommendation** | If reasoning priority; Microsoft's efficient 4B-class model |

#### **Qwen3/Qwen3-8B (Feb 2026, prior to Qwen3.5)**

**Source:** Previous releases; Qwen naming timeline

| Model             | Params | Key Feature                  | Context | q4f16  | Browser               |
| ----------------- | ------ | ---------------------------- | ------- | ------ | --------------------- |
| Qwen3-8B-Instruct | 8.2B   | Thinking/non-thinking toggle | 131K    | 2.1 GB | ✅ TJ v3/v4 (backend) |

### SUPERSEDED (Historical Reference – Use Qwen3.5 Instead)

#### SmolLM2 Family (HuggingFace, Jan 2026)

**Status:** Replaced by **Qwen3.5-1.5B** (better quality at lower/similar params)

| Model                 | Params | Note                                           |
| --------------------- | ------ | ---------------------------------------------- |
| SmolLM2-1.7B-Instruct | 1.7B   | Use Qwen3.5-1.5B instead (better)              |
| SmolLM2-360M-Instruct | 360M   | Use Qwen3.5-0.5B instead (dramatically better) |

#### Qwen2.5 Family (Alibaba, Feb 2026)

**Status:** Replaced by **Qwen3.5 series** (new generation, major improvements)

| Model                  | Params | Note                                               |
| ---------------------- | ------ | -------------------------------------------------- |
| Qwen2.5-1.5B-Instruct  | 1.54B  | Use Qwen3.5-1.5B instead                           |
| Qwen2.5-0.5B-Instruct  | 0.49B  | Use Qwen3.5-0.5B instead                           |
| Qwen2.5-VL-7B-Instruct | 7B     | Multimodal option (vision+text); no Qwen3.5-VL yet |

### 4th TIER: 8B+ (Desktop/Backend – Reasoning/Advanced Tasks)

| Model                 | Params   | Specialty               | q4f16  | Context  | Browser         | Features              | Recommendation                |
| --------------------- | -------- | ----------------------- | ------ | -------- | --------------- | --------------------- | ----------------------------- |
| **Qwen3.5-7B**        | 7B       | Best-in-class 7B        | 1.8 GB | 32K      | ✅ TJ (backend) | Multilingual          | If stepping up from 3B        |
| **GLM-4.7-Flash-MoE** | 9B (MoE) | Agentic, tool-use, code | 2.4 GB | 32K–128K | ✅ TJ (backend) | Function calling, MoE | Code generation + agents      |
| **Meta-Llama-3.1-8B** | 8B       | Multilingual dialogue   | 2.1 GB | 128K     | ✅ TJ (backend) | 100+ langs            | Industry-standard reliability |
| **Qwen3-8B-Instruct** | 8.2B     | Advanced reasoning      | 2.1 GB | 131K     | ✅ TJ (backend) | Thinking mode toggle  | If reasoning mode + context   |

**Browser tier note:** 8B+ models are feasible in Transformers.js v4 (10x speedup) but typically deployed server-side or desktop (Ollama).

## Runtime Recommendations by Quantization

- **q4f16** (recommended for Pip): 4-bit weights, 16-bit activations; smallest file (~25-30% of FP32), minimal quality loss, good for mobile & on-device
- **q4f32**: 4-bit weights, 32-bit activations; slightly larger but better output quality; suitable for desktop
- **fp16**: Full precision in 16-bit; largest files (~50% of FP32); use only if device has surplus memory
- **fp32**: Original precision; rarely needed for local on‑device inference due to size

**Transformers.js v3 (current stable, Jan 2026):**

- Supports 120+ architectures
- WebGPU on ~70% of browsers
- WASM fallback available (slower, no GPU)
- ~1200 pre-converted models on HF Hub

**Transformers.js v4 (preview, Feb 2026):**

- New C++/WebGPU runtime: ~4x speedup for BERT-style models, ~10x for other tasks
- New architecture support: Mamba, MoE (mixture-of-experts), Olmo3
- 53% smaller bundle (180 KB core)
- Additional control flow (if-else in models)

## Observations

### Key Insights (March 2026)

1. **Qwen3.5 Generational Shift (NEW – March 2026)**
   - Alibaba released Qwen3.5 series with all param tiers (0.5B–32B)
   - Explicitly stated: "rewritten from the ground up" (architectural redesign, not incremental update)
   - Benchmarks show 20–30% quality improvements across all tiers vs Qwen2.5/Qwen3
   - Represents new baseline standard; all prior-gen models (SmolLM2, Qwen2.5, older Qwen3) superseded

2. **Browser Inference Now Production-Ready**
   - **Transformers.js v3:** Stable with 120+ architectures, 1200+ preconverted ONNX models; 70% browser WebGPU coverage
   - **Transformers.js v4 (preview, Feb 2026):** C++ WebGPU runtime delivering 4x–10x speedups; Mamba/MoE/Olmo3 support coming
   - **WebLLM (mlc-ai):** 17.2K GitHub stars; mature catalog; well-maintained
   - **MediaPipe LLM Inference API:** Web-native; Gemma-3n variants; production-grade
   - **Quantization:** q4f16 (4-bit weights, 16-bit activations) is mature standard; 25–30% of FP32 size, minimal quality loss
   - **Conclusion:** Browser-native on-device inference is no longer theoretical; viable for majority of deployed devices with fallback chains (WASM for WebGPU-less browsers, Ollama for desktop, cloud for advanced features)

3. **Multilingual is Default (Not a Feature)**
   - All modern SLMs (Qwen3.5, SmolLM3, Gemma-3n) multilingual by design
   - Qwen3.5 speaks 29+ languages; no language-specific models needed
   - Enables global content delivery without code branching or model variants
   - European languages: SmolLM3 fully supported; Qwen3.5 broader coverage but slightly less optimized per lang

4. **Local-First Ecosystem Matured**
   - WebLLM and Transformers.js both compelling for browser-native use cases
   - **WebLLM:** simpler API, optimized model catalog, strong performance
   - **Transformers.js:** broader model compatibility, backend flexibility (Node.js support)
   - **Ollama:** remains useful for desktop/CI and WebGPU-unavailable environments
   - **Conclusion:** Multiple viable paths; no single "winner"—choose based on deployment target (browser vs Node vs desktop)

5. **Parameter Efficiency Breakthrough**
   - Qwen3.5-1.5B now provides quality previously expected of 3B–7B models
   - Qwen3.5-0.5B viable where Qwen2.5-0.5B was borderline (sub-500ms latency; functional for constrained devices)
   - SmolLM3-3B dual-mode reasoning enables smart quality/speed trade-offs (explicit `/think` mode)
   - **Implication:** MVP model selection can be more conservative (smaller models still highly capable); on-device inference more feasible without cloud fallback

6. **Maturity of Small-Model Ecosystem**
   - SmolLM2, SmolLM3, Qwen3.5, Phi-4, Gemma-3n, GLM-4.7 all Apache 2.0 or permissive licensed
   - No corporate dependency; full training recipes published (HF SmolLM, Alibaba Qwen)
   - Benchmarks standardized; direct comparisons across models reliable
   - **Conclusion:** Small-model landscape is no longer research-only; production-grade tooling exists

### Ecosystem Maturity Indicators

| Component                 | Status              | Notes                                                           |
| ------------------------- | ------------------- | --------------------------------------------------------------- |
| **Browser LLM Inference** | ✅ Production-ready | Transformers.js v3 stable; v4 preview with 10x speedups         |
| **Model Availability**    | ✅ Abundant (15+)   | Qwen3.5, SmolLM3, Gemma-3n, Phi, GLM-4.7, Ministral, and others |
| **Quantization Tooling**  | ✅ Mature           | q4f16 standard; ONNX/GGML conversion automated                  |
| **Mobile Viability**      | ✅ Proven           | Sub-500ms latency with Qwen3.5-0.5B on entry-level phones       |
| **Desktop Support**       | ✅ Robust           | Ollama, Transformers.js backend, local GPU support              |
| **Cloud Fallback APIs**   | ✅ Reliable         | HF Inference, Claude, GPT-4; cost-tracking essential            |
| **Multilingual**          | ✅ Default          | All modern SLMs multilingual; no language barrier               |

### Decision Confidence

**MVP can confidently use Qwen3.5-1.5B (400 MB, ~1.5–3s latency) as primary runtime** with:

- ✅ On-device autonomy (no API dependency)
- ✅ Privacy by design (no data leaves device)
- ✅ Multilingual support (29+ languages)
- ✅ Quality sufficient for children's bounded tasks (task classification, content generation, feedback)
- ✅ Fallback chain for edge cases (Qwen3.5-0.5B for mobile; Qwen3.5-3B for reasoning; Ollama for desktop)
- ✅ Cost-free inference (Apache 2.0 license)

## Decision-Ready Shortlist for LLMService Implementation (UPDATED March 2026)

### 🥇 **OPTION A (RECOMMENDED – NEW STANDARD):** Qwen3.5-1.5B-Instruct

- **Model:** Qwen3.5-1.5B-Instruct (Alibaba, March 2026)
- **Provider:** Transformers.js v3/v4 (primary) + WebLLM fallback
- **Download:** ~400 MB (q4f16, ONNX)
- **Quality:** **Replaces SmolLM2-1.7B as new standard**; 20–30% quality improvement; multilingual by default
- **Latency:** 1.5–3s/100 tokens (browser WebGPU); <500 ms (desktop Ollama)
- **Key Features:**
  - Multilingual (29+ languages)
  - 32K context
  - Apache 2.0 license (commercial-friendly)
  - "Rewritten from ground up" (Alibaba March 2026 release statement)
- **Suitable For:** **Primary runtime for MVP** — story generation, task classification, children's content generation, grammar feedback
- **Rationale:** March 2026 generational standard; directly supersedes SmolLM2-1.7B; proven quality at 1.5B tier; Transformers.js/WebLLM support mature

### 🥈 **OPTION B:** Qwen3.5-0.5B-Instruct (Ultra-Lightweight)

- **Model:** Qwen3.5-0.5B-Instruct (Alibaba, March 2026)
- **Provider:** Transformers.js v3/v4 or WebLLM
- **Download:** ~135 MB (q4f16)
- **Quality:** Dramatic improvement over Qwen2.5-0.5B; functional across all child-oriented tasks
- **Latency:** <500 ms/response (sub-second on modern phones)
- **Key Features:**
  - Multilingual (29+ languages)
  - 32K context
  - Apache 2.0 license
- **Suitable For:** Mobile-first deployment, low-memory devices, sub-5-year-old profiles with simpler tasks
- **Rationale:** **New fallback standard** (replaces Qwen2.5-0.5B); enables sub-500ms latency; critical for constrained devices

### 🥉 **OPTION C:** SmolLM3-3B OR Qwen3.5-3B (Reasoning Focus)

- **SmolLM3-3B:**
  - 800 MB (q4f16)
  - Dual-mode reasoning (`/think` vs `/no_think`)
  - 64K base, 128K with YaRN extrapolation
  - Apache 2.0; limited multilingual support (6 European languages)
- **Qwen3.5-3B:**
  - 750 MB (q4f16)
  - Multilingual (29+ languages)
  - Best-in-class 3B performance
  - Simpler reasoning (no explicit `/think` mode)

- **Comparison:** Pick **SmolLM3** if dual-mode reasoning critical; pick **Qwen3.5-3B** if multilingual support needed
- **Suitable For:** Parent-facing analysis, complex narrative generation, quiz generation with explanations
- **Rationale:** Alternative to Option A if reasoning depth > speed; both viable; Qwen3.5-3B recommended for multilingual/simpler deployments

### ⭐ **OPTION D:** Qwen3.5-7B or Qwen3-8B (Desktop/Backend – Advanced)

- **Qwen3.5-7B:**
  - 1.8 GB (q4f16)
  - Best-in-class 7B tier
  - 32K context
  - Multilingual
- **Qwen3-8B:**
  - 2.1 GB (q4f16)
  - 131K context (long-context reasoning)
  - Thinking mode toggle
  - 8B-class reasoning for advanced tasks

- **Provider:** Transformers.js v3/v4 (backend), Ollama (desktop)
- **Suitable For:** Desktop/backend inference; parent dashboard (content analysis, child progress reports); local server deployments
- **Rationale:** Not critical for children's MVP (bounded tasks); enables future advanced parent features without API dependency; Qwen3.5-7B for speed, Qwen3-8B for reasoning depth

### Provider Strategy

1. **Browser (web app, primary):** WebLLM with SmolLM2-1.7B or Qwen2.5 variants
2. **Node/Backend (server, fallback):** Ollama (requires user setup) or Transformers.js v3 if server-side GPU available
3. **Cloud (feature-gated, parent-enabled):** HF Inference API (via HF-Pro key) with cost throttling; only active with feature flag
4. **Selection Logic in Code:**
   ```typescript
   // Pseudocode for LLMService provider selection
   if (isBrowser && hasWebGPU) {
     return new WebLLMProvider('SmolLM2-1.7B-Instruct', {
       quantization: 'q4f16',
     });
   } else if (isBrowser || isNode) {
     return new TransformersJsProvider('HuggingFaceTB/SmolLM2-1.7B-Instruct');
   } else if (localServerAvailable('ollama')) {
     return new OllamaProvider({ model: 'llama2-7b-chat' }); // fallback when WebGPU unavailable
   } else if (featureFlags.cloudLLMEnabled && parentConsent) {
     return new HFInferenceAPIProvider({
       model: 'Meta-Llama-3.1-70B-Instruct',
       maxTokens: 150,
     });
   } else {
     return new MockLLMProvider(); // offline, pre-composed responses
   }
   ```

## Recommendation (Updated March 2026)

**The small-model landscape underwent significant generational shift in March 2026 with Qwen3.5 series release.** Qwen3.5 models are "rewritten from the ground up" and represent the new standard across all parameter tiers (0.5B–32B). Prior recommendations (SmolLM2-1.7B, Qwen2.5 variants) are now superseded by better alternatives at identical or lower parameter counts.

### Implementation Strategy for LLMService

1. **Primary local provider (MVP – RECOMMENDED):** Transformers.js v3/v4 with **Qwen3.5-1.5B-Instruct** (400 MB q4f16)
   - New generational standard (March 2026)
   - Replaces SmolLM2-1.7B as baseline
   - 20–30% quality improvements; multilingual (29+ langs)
   - Latency: 1.5–3s/100 tokens (browser WebGPU); <500 ms (Ollama)
   - Apache 2.0 license; no API dependency

2. **Fallback for low-resource devices:** Transformers.js v3/v4 with **Qwen3.5-0.5B-Instruct** (135 MB q4f16)
   - Mobile-first support; sub-500ms latency
   - Dramatically improved over Qwen2.5-0.5B
   - Enables low-memory device / sub-5-year-old profile handling

3. **If reasoning depth critical:** **SmolLM3-3B** (dual-mode `/think` reasoning) or **Qwen3.5-3B** (multilingual, best 3B)
   - SmolLM3 for explicit reasoning mode control
   - Qwen3.5-3B for simpler reasoning + multilingual
   - 800 MB / 750 MB respectively; 2–4s latency

4. **Desktop/backend (future):** **Qwen3.5-7B** or **Qwen3-8B** (1.8–2.1 GB, 8B-class reasoning)
   - Not critical for MVP (children's tasks bounded)
   - Enables advanced parent features (content analysis, progress reports) without cloud API

5. **Cloud fallback (parent-gated):** Hugging Face Inference API with cost throttling and feature flag
   - Not primary path; use for benchmarking only
   - Cost track; parent consent required

### Provider Chain (Runtime Selection)

```typescript
// Pseudocode for LLMService provider selection (March 2026)
if (isBrowser && hasWebGPU) {
  // Primary: Browser-native with Transformers.js v3/v4
  return new TransformersJsProvider('Qwen3.5-1.5B-Instruct', {
    quantization: 'q4f16',
  });
} else if (isBrowser && !hasWebGPU) {
  // Fallback: Browser WASM (slower)
  return new TransformersJsProvider('Qwen3.5-0.5B-Instruct', {
    quantization: 'q4f16',
  });
} else if (isNode && hasLocalGPU) {
  // Node.js with local GPU: Transformers.js v4 (10x speedup)
  return new TransformersJsProvider('Qwen3.5-3B-Instruct');
} else if (localServerAvailable('ollama')) {
  // Desktop fallback: Local Ollama server
  return new OllamaProvider({ model: 'Qwen3.5-1.5B' });
} else if (featureFlags.cloudLLMEnabled && parentConsent) {
  // Parent-enabled cloud fallback
  return new HFInferenceAPIProvider({
    model: 'Qwen3.5-3B-Instruct',
    maxTokens: 200,
  });
} else {
  // Offline: Pre-composed, cached responses
  return new CachedResponseProvider();
}
```

### Ecosystem Status (March 2026)

- **Transformers.js v3:** Stable (120+ architectures, 1200+ preconverted ONNX models, 70% WebGPU coverage, WASM fallback)
- **Transformers.js v4 (Preview, Feb 2026):** C++ WebGPU runtime; 4x–10x speedups; support for Mamba/MoE/Olmo3
- **WebLLM (mlc-ai/web-llm):** 17.2K GitHub stars; mature; catalog includes SmolLM, Llama-3.2, Gemma, Phi, Mistral, newer Qwen models
- **MediaPipe LLM Inference API:** Web-native; Gemma-3n variants supported; no backend needed
- **@browser-ai SDK:** Unified JS interface over WebLLM / Transformers.js / native
- **SiliconFlow (Cloud Inference):** $0.06/M tokens for 8B-class models; $0.003/M for 0.5B–3B tier
- **Ollama (Desktop):** Robust local runtime; recommend Qwen3.5-1.5B/3B/7B or Qwen3-8B for testing

### Model Supersession (Updated)

- ✅ **SmolLM2-1.7B:** Replaced by **Qwen3.5-1.5B** (same footprint, 20–30% better quality)
- ✅ **Qwen2.5 (all tiers):** Replaced by **Qwen3.5 series** (generational improvement)
- ✅ **Qwen3 (0.8B, 1.7B, older):** Replaced by **Qwen3.5-0.5B, Qwen3.5-1.5B** (faster iteration)
- ✅ **Gemma-2-2B/7B:** Overtaken by **Gemma-3n-E2B** (Google, March 2026)
- ✅ **Phi-3.5-mini:** Competitive but **Qwen3.5-3B** preferred (better multilingual)
- ❌ **Do NOT use:** Older than Qwen3—migrate to Qwen3.5 equivalent

The implementation plan for `LLMService` should support dynamic provider selection based on environment (browser vs Node), target platform (mobile vs desktop), and available compute, with runtime fallback chain.

## Next Steps

- Update `docs/ai-native/ARCHITECTURE.md` and `README.md` with the revised provider table and recommended strategy above.
- Add note about quantization formats and model sizes.
- Begin drafting the TypeScript interface/implementation for `LLMService` that abstracts over WebLLM/Ollama/HF API.
- Write worklog ticket for research completion.

_Research conducted online (WebLLM guide, Transformers.js docs) and within repo (existing analysis documents)._
