# AI-Native Roadmap

**Version:** 1.0.0  
**Last Updated:** 2026-01-29  
**Status:** DRAFT

This roadmap describes a local-first, safety-first rollout of AI-native features for Pip.

## Principles

- Local-first by default (privacy + latency).
- No storage of camera frames, raw audio, or full conversations.
- Parent consent gates required for any cloud fallback.

## Phases

### Phase 1 (Weeks 1–2): “Pip Feels Alive”

- AI-001: Pip Voice (TTS)
- AI-002: Letter Pronunciation
- AI-003: Pip Quick Responses (template-based; no LLM required)

Acceptance signals:

- Child can complete a session without reading text prompts.
- Audio interactions feel immediate (<200ms perceived latency for most actions).

### Phase 2 (Weeks 3–4): “Talk With Pip”

- AI-004: Voice Input (STT) with push-to-talk
- AI-005: Simple conversations (strictly bounded, kid-safe responses)

Acceptance signals:

- No unsafe content observed in internal testing under adversarial prompts.
- Clear “listening” indicator and easy stop control.

### Phase 3 (Weeks 5–8): “Personalized Learning”

- AI-006: Story Generator (safe, structured)
- AI-007: Activity Generator (letter-aligned mini-games)
- AI-010: Adaptive Learning Path (local progress signals only)

Acceptance signals:

- Personalization improves engagement without collecting sensitive data.

### Phase 4 (Weeks 9–12): “Show & Tell”

- AI-008: Show and Tell (Vision) (local-only)
- AI-009: AR Face Overlays

Acceptance signals:

- Clear camera-on indicator and explicit permission UX.
- No media storage; processing is ephemeral.
