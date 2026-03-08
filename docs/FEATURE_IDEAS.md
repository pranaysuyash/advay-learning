# Feature Ideas & Service Enhancements

This file collects a running list of potential improvements, particularly
around the AI service stack. Items can be converted into tickets or sprint
backlog entries as needed.

1. **LLM integration tests** – write end‑to‑end tests that exercise the real
   Transformers.js/WebLLM/Ollama providers (currently all mocks).
2. **Model caching & swap UI** – show download progress, allow “clear model
   cache”, and let parents choose a lighter weight on mobile.
3. **Cloud‑fallback UI flow** – expose in‑game parent consent prompt and usage
   tracking for the HF‑Inference tier.
4. **Safety service expansion** – wire `safetyService` into LLMService/STTService
   pipelines and add a lightweight Detoxify classifier.
5. **Voice customisation** – add a UI for selecting Kokoro presets, with
   previews and per‑language support.
6. **Hand‑tracking enhancements** – improve `useGameHandTracking` accuracy,
   add two‑finger zoom or rotate gestures.
7. **Offline game store** – cache games (LLM prompts, visual assets) so users
   can play entire titles without connectivity.
8. **Analytics‑rich AI telemetry** – automatically log which
   provider/plan was used per LLM call, plus latency and cache hits.
9. **Multi‑language LLM prompts** – build helper for translating prompts/messages
   on the fly, tied to `childAge` & `languageCode`.
10. **Performance profiling** – add a debug page that visualises WebGPU usage,
    model memory footprint, and frame rates.
11. **Accessibility enhancements** – ensure TTS voices and safety messages meet
    WCAG guidelines; add `aria-live` for dynamic AI outputs.
12. **Backend AI endpoints** – implement a server‑side LLM proxy for admin
    tools or parent reports using the same runtime rule set.
13. **Feature flags dashboard** – runtime UI to flip `ai.sttV1`,
    `ai.llmModel`, `ai.cloudFallback` etc. for QA.
14. **Test harness for Vision providers** – simulate MediaPipe data and verify
    gesture/pose recognition across games.
