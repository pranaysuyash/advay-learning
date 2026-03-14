# Embedding Models SOTA Research (2026-03-13)

Date: 2026-03-13  
Owner: Codex (GPT-5)  
Scope: Compare current/projected embedding choices for `learning_for_kids`, `EchoPanel`, `photo-search`, and `speech_experiments/model-lab`.

## Why this doc

We needed a current, source-backed view of:
- Gemini Embedding 2 status/pricing.
- Mixedbread `mxbai-wholembed-v3` launch status.
- What should be default now vs what should remain a pluggable next option.

## Source-backed findings

### 1) Gemini Embedding 2 is real, preview, and multimodal

- **Observed**: Google Gemini docs state the latest model is `gemini-embedding-2-preview`, described as the first multimodal embedding model in Gemini API (text/image/video/audio/documents).
- **Observed**: `gemini-embedding-001` remains available for text-only use cases.
- **Observed**: Gemini pricing page lists `gemini-embedding-2-preview` with free-tier prices as "Free of charge" and paid-tier pricing.

Operational implication:
- This is a valid hosted SOTA path for multimodal retrieval and future cross-modal search.

### 2) Mixedbread `mxbai-wholembed-v3` is announced but not generally available yet

- **Observed**: Mixedbread engineering blog reports benchmark numbers for `mxbai-wholembed-v3`.
- **Observed**: Same source explicitly says it is "currently in internal evaluation and will be available soon."
- **Inferred**: It is not yet a stable default target for production indexing in our current memsearch flow.

Operational implication:
- Track it aggressively, but do not set it as current default until public model/API availability and reproducible eval are confirmed.

### 3) Open-source strong baselines remain viable now

- **Observed**: `BAAI/bge-m3` remains broadly used and multilingual.
- **Observed**: `Qwen/Qwen3-Embedding-8B` is available as open weights on Hugging Face with TEI deployment examples (GPU and CPU).
- **Observed**: `mixedbread-ai/mxbai-embed-large-v1` remains open (Apache-2.0), with Matryoshka + quantization guidance and strong published MTEB-era results.

Operational implication:
- For local/self-hosted defaults today, `bge-m3` remains a pragmatic balance of quality + compatibility in current infra.

## Recommendation by project

### Shared workspace memory (all-project indexing)

- **Now default**: `BAAI/bge-m3` (already integrated).
- **Keep enabled**: provider/model candidate fallback chain.
- **Next hosted option**: add a Gemini provider path for `gemini-embedding-2-preview` behind env toggle (do not force default yet).

### EchoPanel / photo-search (multimodal-heavy)

- Prioritize hosted multimodal embeddings path first (`gemini-embedding-2-preview`) for image/text cross-modal retrieval.
- Keep open-source local fallback for offline/dev workflows.

### speech_experiments/model-lab

- Run controlled A/B with:
  - `BAAI/bge-m3`
  - `Qwen/Qwen3-Embedding-8B`
  - hosted `gemini-embedding-2-preview` (if cost/latency acceptable)
- Evaluate on project-specific query sets, not generic leaderboard-only metrics.

## Decision snapshot (as of 2026-03-13)

- `gemini-embedding-2-preview`: **Adopt as hosted optional path now**.
- `mxbai-wholembed-v3`: **Watchlist (not default yet)**.
- `BAAI/bge-m3`: **Current default for local indexing**.

## Existing research coverage check

- Current embedding model changes/history are documented in:
  - `docs/WORKLOG_ADDENDUM_v2.md` (tickets `TCK-20260313-004/005/006`)
  - `/Users/pranay/Projects/workspace_memory/docs/WORKSPACE_MEMORY_RUNBOOK.md`
  - `/Users/pranay/Projects/PROJECTS_AGENT_MEMORY_COMMANDS.md`
- This file adds the missing explicit "SOTA + launch watch" comparison layer and cross-project decision framing.

## References

1. Gemini Embeddings docs: https://ai.google.dev/gemini-api/docs/embeddings  
2. Gemini API pricing (includes `gemini-embedding-2-preview`): https://ai.google.dev/gemini-api/docs/pricing  
3. Mixedbread engineering post (`mxbai-wholembed-v3` internal eval status): https://www.mixedbread.com/blog/multimodal-late-interaction-billion-scale  
4. BGE-M3 model card: https://huggingface.co/BAAI/bge-m3  
5. Qwen3 Embedding 8B model card: https://huggingface.co/Qwen/Qwen3-Embedding-8B  
6. Mixedbread open embedding model card: https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1
