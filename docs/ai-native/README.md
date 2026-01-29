# AI-Native Learning Platform Documentation

**Version:** 1.0.0
**Last Updated:** 2026-01-29

---

## Overview

This directory contains all documentation for the AI-native features of the Advay Vision Learning app. The vision is to transform Pip from a static mascot into a true AI companion that can converse, generate stories, and personalize learning for each child.

---

## Document Index

### Core Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture for AI services | Developers |
| [FEATURE_SPECS.md](./FEATURE_SPECS.md) | Detailed feature specifications | Developers, PMs |
| [SAFETY_GUIDELINES.md](./SAFETY_GUIDELINES.md) | Safety and privacy requirements | All |
| [ROADMAP.md](./ROADMAP.md) | Implementation timeline | All |

### Prompts (in `/prompts/ai-native/`)

| Prompt | Purpose | When to Use |
|--------|---------|-------------|
| [ai-feature-check-v1.0.md](../../prompts/ai-native/ai-feature-check-v1.0.md) | Health check AI features | After deployment, debugging |
| [ai-feature-build-v1.0.md](../../prompts/ai-native/ai-feature-build-v1.0.md) | Guide new feature implementation | Building new AI features |
| [ai-feature-verify-v1.0.md](../../prompts/ai-native/ai-feature-verify-v1.0.md) | Comprehensive verification | Before PR merge |
| [ai-feature-explore-v1.0.md](../../prompts/ai-native/ai-feature-explore-v1.0.md) | Research possibilities | Planning, brainstorming |
| [ai-feature-research-v1.0.md](../../prompts/ai-native/ai-feature-research-v1.0.md) | Deep-dive research | Evaluating providers/tech |
| [ai-feature-update-v1.0.md](../../prompts/ai-native/ai-feature-update-v1.0.md) | Safely update features | Provider changes, bug fixes |

---

## Quick Reference

### AI Service Stack

```
┌─────────────────────────────────────────┐
│           LOCAL (Preferred)             │
├─────────────────────────────────────────┤
│ LLM:    Ollama (Llama 3.2)             │
│ TTS:    Web Speech API / Piper         │
│ STT:    Web Speech API                 │
│ Vision: MediaPipe / TensorFlow.js      │
└─────────────────────────────────────────┘
                    │
                    ▼ Fallback
┌─────────────────────────────────────────┐
│           CLOUD (With Consent)          │
├─────────────────────────────────────────┤
│ LLM:    Claude API                      │
│ TTS:    ElevenLabs (premium)           │
│ STT:    Whisper API                    │
│ Vision: Claude Vision                   │
└─────────────────────────────────────────┘
```

### Implementation Phases

| Phase | Weeks | Features |
|-------|-------|----------|
| 1 | 1-2 | Pip Voice, Letter Sounds, Quick Responses |
| 2 | 3-4 | Voice Input, Pip Conversations |
| 3 | 5-8 | Stories, Activities, Adaptive Learning |
| 4 | 9-12 | Show & Tell, AR Overlays |

### Privacy Non-Negotiables

- Camera frames: **NEVER STORED**
- Audio recordings: **NEVER STORED**
- Conversations: **NEVER STORED** (summaries only)
- Child PII: **LOCAL ONLY**

---

## Getting Started

### For Developers

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
2. Review [SAFETY_GUIDELINES.md](./SAFETY_GUIDELINES.md) before implementing
3. Use [ai-feature-build-v1.0.md](../../prompts/ai-native/ai-feature-build-v1.0.md) as implementation guide
4. Verify with [ai-feature-verify-v1.0.md](../../prompts/ai-native/ai-feature-verify-v1.0.md) before PR

### For Product Managers

1. Review [FEATURE_SPECS.md](./FEATURE_SPECS.md) for feature details
2. Check [ROADMAP.md](./ROADMAP.md) for timeline
3. Use [ai-feature-explore-v1.0.md](../../prompts/ai-native/ai-feature-explore-v1.0.md) for ideation

### For Everyone

1. **Safety is non-negotiable** - Read [SAFETY_GUIDELINES.md](./SAFETY_GUIDELINES.md)
2. **Privacy is paramount** - No storing sensitive data, ever
3. **Child-first design** - Every decision prioritizes child wellbeing

---

## Key Decisions

### Why Local-First?

1. **Latency**: Children need instant feedback
2. **Privacy**: No data leaves the device
3. **Cost**: No per-request charges
4. **Offline**: Works without internet

### Why Ollama for LLM?

1. Runs locally on modest hardware
2. Llama 3.2 3B is fast and capable
3. No API costs
4. Full privacy

### Why Web Speech API?

1. Built into all modern browsers
2. Zero setup required
3. Good enough quality for MVP
4. Can upgrade to Piper/ElevenLabs later

---

## Related Documentation

- [Vision Document](../VISION_AI_NATIVE_LEARNING.md) - Big picture vision
- [UX Vision](../UX_VISION_CLAUDE.md) - Child experience design
- [UX Synthesis](../UX_VISION_SYNTHESIS.md) - Consolidated UX recommendations
- [Game Mechanics](../GAME_MECHANICS.md) - Gameplay design
- [Learning Plan](../LEARNING_PLAN.md) - Educational framework

---

## Contributing

When adding AI features:

1. **Document first** - Update FEATURE_SPECS.md before coding
2. **Safety review** - Ensure SAFETY_GUIDELINES.md compliance
3. **Use prompts** - Follow the workflow prompts
4. **Test thoroughly** - Use verification checklist
5. **Update roadmap** - Keep ROADMAP.md current
