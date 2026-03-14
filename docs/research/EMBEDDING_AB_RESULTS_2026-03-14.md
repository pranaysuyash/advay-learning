# Embedding A/B Results (2026-03-14)

Date: 2026-03-14  
Owner: Codex (GPT-5)

## What was run

### 1) Local model micro-benchmark

Command:

```bash
/Users/pranay/Projects/workspace_memory/.venv/bin/python \
  /Users/pranay/Projects/workspace_memory/scripts/eval_embedding_models.py \
  --models "BAAI/bge-m3,mixedbread-ai/mxbai-embed-large-v1,intfloat/multilingual-e5-base" \
  --rounds 1
```

Saved raw outputs:
- `docs/research/embedding_eval_2026-03-14.csv`
- `docs/research/embedding_eval_2026-03-14.stderr.log`

Observed CSV:

| Model | Dim | Load(s) | Throughput texts/s | Toy semantic acc | Toy margin mean |
|---|---:|---:|---:|---:|---:|
| `BAAI/bge-m3` | 1024 | 6.837 | 433.76 | 1.000 | 0.2818 |
| `mixedbread-ai/mxbai-embed-large-v1` | 1024 | 4.213 | 635.89 | 1.000 | 0.3783 |
| `intfloat/multilingual-e5-base` | 768 | 6.423 | 946.91 | 1.000 | 0.0911 |

### 2) Retrieval sanity check on project corpus

Two separate collections were built over:
- `/Users/pranay/Projects/workspace_memory/project_ws/projects_proj_learning_for_kids_src/sources`

Models tested:
- `BAAI/bge-m3` (`eval_lfk_bge_m3_20260314`)
- `mixedbread-ai/mxbai-embed-large-v1` (`eval_lfk_mxbai_large_v1_20260314`)

Query:
- `"Profile Photo Routes Not Registered"`

Observed:
- Both models returned the expected top hit from `API_AUDIT_REPORT.md` at rank 1.

## Decision snapshot

- Keep default local shared index model as `BAAI/bge-m3` (already wired).
- Keep `mixedbread-ai/mxbai-embed-large-v1` in the local candidate set for model-switch A/B and targeted project overrides.
- Hosted providers (Gemini/OpenAI/Voyage) are now wired in Projects memory tooling and can be activated by provider + API key env.
