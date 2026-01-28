# ADR 0001: Web-First Local-Only Runtime

## Status
**ACCEPTED** - Locked Decision

## Context
Building a production-quality learning app for Advay that will also serve as a portfolio piece. Need to optimize for:
- Production launch readiness
- Portfolio demonstration
- Long-term maintainability
- Rapid iteration on UX

## Decision

**Web-first local-only architecture.**

### Runtime
- **Engine**: TypeScript in browser
- **Vision**: MediaPipe Tasks Vision (@mediapipe/tasks-vision)
- **UI**: React + Vite
- **Storage**: IndexedDB

### Python Role
- **ONLY in `tools/`** for offline content generation
- **NEVER in live app path**
- Content generation, evaluation, dataset preparation

## Why Not Python Desktop

| Factor | Python | Web |
|--------|--------|-----|
| Distribution | Packaging hell (PyInstaller, signing) | Instant (URL or file) |
| Latency | OpenCV UI loop, threading complexity | MediaPipe optimized for web |
| Privacy | More moving parts, accidental upload risk | Single sandboxed runtime |
| Iteration | Slower UI dev | Rapid UX tuning |
| Portfolio | Harder to demo | Live URL, impressive |

## Enforcing Quality

Two hard rules from day one:

### 1. No External CDNs
```
app/public/
  models/
    hand_landmarker.task      # Pinned version
  wasm/
    mediapipe_wasm/           # Local WASM binaries
```

### 2. Local Verify Gate
```bash
# scripts/verify.sh
npm run lint
npm run test
npm run typecheck
bash scripts/check_no_external_network.sh  # Blocks http(s) in src/
python3 scripts/check_loc_delta.py          # PR size guard
```

## Consequences

### Positive
- ✅ Instant distribution (no install)
- ✅ Optimized real-time pipeline
- ✅ Simpler privacy model
- ✅ Faster iteration on kid UX
- ✅ Better portfolio presentation

### Negative
- ❌ Browser camera permission UX
- ❌ Limited to MediaPipe's web capabilities
- ❌ No custom heavy ML models (not MVP-critical)

## Implementation

```
app/
  src/
    engine/        # Camera + MediaPipe + signals
    games/         # Learning modules
    storage/       # IndexedDB
    ui/            # React components
  public/
    models/        # Local model files
    wasm/          # WASM binaries

tools/             # Python offline tooling
  src/
    content/       # Generate alphabet paths
    evaluation/    # Test datasets
```

## Related
- ADR 0002: MediaPipe Tasks Vision
- ADR 0003: Local Profiles + Parent PIN

## Locked
This decision is locked. Do not revisit without strong evidence.
