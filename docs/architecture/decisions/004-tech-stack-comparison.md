# ADR 004: Tech Stack Comparison - Web vs Desktop

## Status

Proposed - Pending Decision

## Context

We have two viable architectural approaches for Advay's learning app:

### Option A: Web-First (Browser-based)

**Stack**: Vite + React + TypeScript + MediaPipe (Web/WASM)

### Option C: Python Desktop

**Stack**: Python + PyQt6 + OpenCV + MediaPipe (Python)

## Comparison

| Criteria | Web (Option A) | Python Desktop (Option C) | Winner |
|----------|---------------|---------------------------|--------|
| **Development Speed** | Fast iteration, hot reload | Slower iteration, but familiar | A |
| **UI Polish** | Rich ecosystem, easy styling | More effort for polish | A |
| **CV Performance** | WASM MediaPipe, good but limited | Native MediaPipe, full control | C |
| **Distribution** | Just a URL, or Tauri later | PyInstaller, complex packaging | A |
| **Offline Capability** | Works offline (PWA) | Native offline | Tie |
| **Camera Access** | Browser permissions, varies | Direct access, more reliable | C |
| **Parent's Maintenance** | Easier (just browser) | Harder (Python env) | A |
| **Future Extensibility** | Easy web additions | Easy ML/AI additions | Depends |
| **Learning Curve** | TS/React if unfamiliar | Python is familiar | C |

## Decision Factors

### Why Web (Option A) Might Be Better

1. **Easier for non-technical parent** - No Python environment to maintain
2. **Faster UI development** - React ecosystem is rich
3. **Easier distribution** - Just open a browser
4. **Better long-term maintenance** - Web tech is universal

### Why Python Desktop (Option C) Might Be Better

1. **Better CV control** - Full OpenCV + MediaPipe Python API
2. **Familiar stack** - If team knows Python well
3. **No browser permission issues** - Direct camera access
4. **Better for complex ML** - Easy to add custom models later

## Recommendation

**Go with Option A (Web-First)** for these reasons:

1. **Maintenance burden**: You (the parent) won't need to manage Python environments
2. **Advay's experience**: Opens in browser, simple
3. **Future-proof**: Can package with Tauri later if needed
4. **MediaPipe Web is mature**: `@mediapipe/tasks-vision` is production-ready
5. **Easier to share**: Can potentially share with other kids easily

## Hybrid Approach

Keep Python for **offline tooling only**:

- Content generation (alphabet templates, datasets)
- Evaluation and testing
- Model training (if needed later)

## Implementation Path

### Phase 0: Foundation (Web)

```
app/
  src/
    engine/          # Camera + MediaPipe + signals
    games/           # Learning activities
    storage/         # IndexedDB
    ui/              # React components
```

### Phase 1: Engine (Web)

- Camera access via `getUserMedia`
- MediaPipe HandLandmarker
- Pointer signal with smoothing
- Canvas drawing

### Phase 2: Content (Web + Python Tools)

- Shape tracing game
- Python tools for generating content

## Open Questions

1. Do you have experience with React/TypeScript?
2. Is offline-only browser usage acceptable?
3. Any concerns about browser camera permissions?

## Decision

**Pending your input** - Both options are viable. Web is better for maintenance and distribution, Python is better for CV control and if you're more comfortable with it.

## Related Decisions

- ADR 001: Local-First Architecture (applies to both)
- ADR 002: Python Tech Stack (would be superseded if choosing Web)
