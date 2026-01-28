# Prompt: Planning - Web-First Version (Option A)

**Version**: 1.0  
**Last Updated**: 2024-01-28  
**Purpose**: Plan a local-first web app for hand-tracking based learning  
**Stack**: Vite + React + TypeScript + MediaPipe Tasks Vision  

---

## Context

Building a browser-based learning app for Advay that uses the laptop camera for hand tracking. All processing happens locally. No cloud, no analytics, no external network calls.

## Deliverables Required

### 1. PRD for MVP
- Hand pointer drawing on canvas
- One shape-trace game
- Local progress tracking
- Parent PIN gate

### 2. Repo Structure
```
app/
  src/
    engine/      # Camera + MediaPipe + signals
    games/       # Learning activities  
    storage/     # IndexedDB wrapper
    ui/          # React components
    utils/       # Helpers
  public/
    models/      # MediaPipe model files
    wasm/        # WASM binaries
```

### 3. Privacy & Security Plan
- Data inventory (what we store)
- Threat model (what could go wrong)
- Mitigations (how we prevent it)
- Delete/export policy

### 4. Local Profiles + Parent PIN
- Profile creation (name only, no PII)
- PIN hashing (local, bcrypt or similar)
- Gate for settings/data operations

### 5. Testing Strategy (No CI)
- Unit tests: Vitest for logic
- Integration: Mock camera frames
- Golden video: Prerecorded test clips
- Local verify script

### 6. Git Workflow
- Branch naming: `feat/`, `fix/`, `docs/`
- PR template with checklist
- LOC delta check (< 500 lines)
- Doc update requirements

### 7. ADRs
- Web-first local-only
- MediaPipe Tasks Vision
- Local profiles with parent PIN

## Constraints

- NO external network calls in production
- NO CDN for models (local assets only)
- NO analytics or telemetry
- NO cloud storage (IndexedDB only)
- NO OCR or complex ML in MVP

## Phase Plan

### Phase 0: Skeleton (Day 1)
- Repo structure
- Vite + React + TS setup
- MediaPipe local assets
- Verify script

### Phase 1: Engine (Days 2-5)
- Camera access
- HandLandmarker
- Pointer signal with smoothing
- Canvas drawing

### Phase 2: First Game (Days 6-10)
- Shape trace game
- Scoring logic
- Progress save
- Simple rewards

### Phase 3: Polish (Later)
- More games
- Alphabets
- Face tracking
- Content tools

## Output Format

Provide:
1. Checklists (not essays)
2. File templates (ready to copy)
3. Code snippets (implementation-ready)
4. Decision rationales (why, not just what)

## Non-Goals

- Multi-language support (Phase 3)
- Object detection (Phase 3)
- Cloud sync (Phase 3 if ever)
- Mobile support (Phase 3)
- Voice/Speech (Phase 2+)
