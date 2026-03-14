# Embedding Provider Research Matrix (2026-03-14)

Date: 2026-03-14  
Owner: Codex (GPT-5)

## Scope

Answer whether OpenAI embeddings and HF Pro should be part of the standard stack, alongside Gemini Embedding 2 and new Mixedbread announcements.

## Findings

### OpenAI embeddings

- **Observed**: OpenAI docs list `text-embedding-3-small` as the affordable default embedding model and `text-embedding-3-large` as higher-quality option.
- **Observed**: These are production-available and stable API paths.
- **Decision**: Keep OpenAI in first-class hosted provider set (env-switchable, fallback-capable).

### Gemini embeddings

- **Observed**: Gemini docs list `gemini-embedding-2-preview` as latest embedding model family entry and `gemini-embedding-001` as established option.
- **Observed**: Gemini pricing page lists free-tier availability for embedding model usage.
- **Decision**: Add Google provider as first-class option in Projects memory flow now.

### Mixedbread wholembed v3

- **Observed**: Mixedbread post announces `mxbai-wholembed-v3` benchmarks but states it is in internal evaluation and available soon.
- **Decision**: Keep on watchlist; do not set as default until public production access is available.

### Hugging Face Pro

- **Observed**: HF model ecosystem includes strong embedding options (for example BGE, Qwen embedding family, Mixedbread open models).
- **Observed**: HF Pro improves hosted access/throughput and private/gated model workflows.
- **Decision**: Continue using HF-backed open models for local provider defaults; hosted HF route remains a planned adapter path where needed per project.

## Project fit recommendations

- `learning_for_kids` shared memory: keep `BAAI/bge-m3` default local, with hosted fallback providers (`google`, `openai`, `voyage`) available by env.
- `EchoPanel` / `photo-search`: prioritize hosted multimodal path (`gemini-embedding-2-preview`) for image+text retrieval needs.
- `speech_experiments/model-lab`: run eval sets across `bge-m3`, OpenAI small/large, Gemini embedding preview before changing defaults.

## References

1. OpenAI embeddings model docs: https://platform.openai.com/docs/models#embeddings  
2. OpenAI model page (`text-embedding-3-small`): https://developers.openai.com/api/docs/models/text-embedding-3-small  
3. Gemini embeddings docs: https://ai.google.dev/gemini-api/docs/embeddings  
4. Gemini pricing: https://ai.google.dev/gemini-api/docs/pricing  
5. Mixedbread wholembed-v3 announcement: https://www.mixedbread.com/blog/multimodal-late-interaction-billion-scale  
6. BGE-M3 model card: https://huggingface.co/BAAI/bge-m3  
7. Qwen3 Embedding 8B model card: https://huggingface.co/Qwen/Qwen3-Embedding-8B  
8. Mixedbread open embedding model card: https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1
