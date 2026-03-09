# Free TTS Alternatives Research

As we look for a free, high-quality, zero-blocker TTS generation method to replace the expired Gemini API key, we evaluated four main alternatives that do not require paid subscriptions or complex authentication.

## 1. `edge-tts` (Microsoft Edge Read Aloud API)
**Recommendation:** 🏆 Best Overall Choice

*   **How it works:** Hooks into the internal Microsoft Edge "Read Aloud" websocket API that powers the browser's reading feature.
*   **Quality:** Outstanding. Uses the exact same state-of-the-art neural engines as Azure Cognitive Services (`en-US-AriaNeural`, `en-US-GuyNeural`, `en-US-AnaNeural` for child-friendly voices).
*   **Cost/Limits:** 100% Free. No API key required. No enforced rate limits or quotas (within reasonable scraping limits).
*   **Integration:** Available via the `node-gtts` or `msedge-tts` npm packages, or Python CLI.
*   **Pros:** Zero setup, enterprise-grade quality, large variety of high-quality child-friendly voices, instant response.
*   **Cons:** Technically an unofficial use of an internal API, but widely used and stable for years.

## 2. Kokoro TTS (`kokoro-js`)
**Recommendation:** 🥈 Excellent Option (Especially for Consistency)

*   **How it works:** A lightweight, state-of-the-art TTS model (82M parameters) that runs entirely locally via ONNX Runtime.
*   **Quality:** Very high. Natural, emotive voices (`heart` is a great child voice). Can run offline.
*   **Cost/Limits:** 100% Free and open-source. Zero limits. Runs on our own hardware during build/generation.
*   **Integration:** We *already* use `kokoro-js` in the frontend (Tier 2). We can use the exact same npm package and voice in Node.js to pre-generate the static audio. Requires `wavefile` to encode the raw Float32Array output to `.wav`.
*   **Pros:** 
    *   **Perfect voice consistency**: The pre-generated audio (Tier 1) will sound *exactly* identical to the dynamic fallback audio (Tier 2) because it uses the exact same model.
    *   No APIs, no network requests, complete offline capability.
*   **Cons:** Generation takes CPU time locally. Requires downloading the ONNX models to the developer machine to run the script.

## 3. Hugging Face Inference API (`parler-tts`)
**Recommendation:** 🥉 Good Fallback (Already in Codebase)

*   **How it works:** Calls Hugging Face's free inference API for open-source TTS models like `parler-tts-mini-v1` or `suno/bark-small`.
*   **Quality:** Very good, modern neural quality. Can be emotive.
*   **Cost/Limits:** Free, but subject to HF's free-tier rate limits. Generating 280+ clips sequentially hits "Too Many Requests" (429) errors or causes the free tier model instance to spin down/up.
*   **Integration:** Already used in our legacy `generate_tts_assets.ts` script. Requires a free HF Access Token.
*   **Pros:** 100% open-source models, officially supported API, already partially implemented.
*   **Cons:** Strict rate limiting for 280+ files, generation speed is slower, requires managing an API token.

## 4. Cloud Provider Free Tiers (Google Cloud, AWS Polly, Azure)
**Recommendation:** ❌ Not Recommended for Open/Indie Development

*   **How it works:** Traditional cloud APIs.
*   **Quality:** Excellent (Azure Neural, GCP Wavenet/Journey).
*   **Cost/Limits:** Generous free tiers (e.g., 1M-5M characters/month free), but requires a credit card, billing setup, and managing service account keys.
*   **Cons:** Overkill for a simple build script. Adds significant friction for any new developer joining the project (they would need their own Google Cloud billing account just to run the audio generation script).

## 5. Piper TTS
**Recommendation:** ❌ Not Recommended (Too Much Friction)

*   **How it works:** A fast, local neural TTS engine optimized for Raspberry Pi and desktop.
*   **Quality:** Excellent. Very fast, natural-sounding models.
*   **Cost/Limits:** 100% Free. Runs entirely locally on your CPU. No rate limits.
*   **Integration:** Requires downloading the Piper binary executable for macOS/Linux/Windows and a `.onnx` voice model file (~15-30MB). We would invoke it via `child_process.exec`.
*   **Cons:** Requires manual system setup (downloading native binaries), which breaks the "npm run build" simple developer experience. `kokoro-js` solves this by running entirely via WebAssembly/Node natively.

## 6. `gTTS` (Google Translate TTS)
**Recommendation:** ❌ Not Recommended (Poor Quality)

*   **How it works:** Scrapes the audio endpoint used by Google Translate.
*   **Quality:** Robotic, outdated, non-emotive. Unsuitable for an engaging, modern kids' learning app.
*   **Cost/Limits:** Free, no API key.
*   **Cons:** Poor audio quality, unofficial, limited voice options.

---

## Conclusion

Both **`edge-tts`** and **`kokoro-js`** fit our needs perfectly, but for different reasons:

1.  **If we want ZERO setup overhead:** **`edge-tts`** is best. It requires no model downloads and uses Microsoft's enterprise-grade Azure neural voices for free.
2.  **If we want VOICE CONSISTENCY:** **`kokoro-js`** is best. Since we already use Kokoro in the browser for dynamic text, using it to pre-generate the static files ensures the app has one consistent voice identity across all interactions.

**Revised Recommendation:** Let's use **`kokoro-js`**. Voice consistency (Tier 1 Cache sounding identical to Tier 2 Dynamic) is a massive UX win for a kids' app. We just need to add the `wavefile` dependency to encode the output.
