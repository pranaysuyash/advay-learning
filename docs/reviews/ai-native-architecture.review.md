# Doc Review Report: ai-native/ARCHITECTURE.md

**Review Date:** 2026-03-07
**Reviewer:** GitHub Copilot (Doc-to-Code Audit Agent)

## 1) Doc Summary

- **Purpose:** Define technical architecture for AI-native learning platform, guiding implementation of LLM, TTS, STT, Vision services and provider abstraction.
- **Audience:** Developers, architects, product managers.
- **Scope:** AI-centric layers and service/provider recommendations; does not cover general game logic or UI except where AI integrates.
- **Status:** ACTIVE, partially implemented; checklist at top indicates progress.
- **Call to Action:** Follow the architecture when building or extending AI features; use linked research docs and feature flags.

## 2) Explicit Claims and Requirements

- Implementation status checklist with directories.
- Layered system diagram and component definitions.
- LLM provider table with specific models, sizes, latencies, licenses.
- Recommended LLM/TTS/others strategy with download sizes and runtime.
- Runtime selection logic bullets.
- Design principles enumerated.

## 3) Implicit Assumptions and Inferred Intent

- Codebase should reflect described service directories.
- Provider abstraction and flag/config patterns exist accordingly.
- Cloud fallbacks require parental consent and feature flags.
- Local-first implies offline capabilities.

## 4) Questions the Doc Asks

- How to manage model downloads/caching?
- What exactly are the interfaces between companion layer and providers?
- How is parental consent enforced technically?
- How are safety filters implemented?

## 5) Tasks Mentioned

- ✅ Services implemented (TTS, STT, LLM, Vision).
- Flag and config updates.
- Future items: reasoning tier, desktop runtimes, cloud fallback gating.

## 6) Confusions or Contradictions

- Provider table previously referenced "Piper TTS" while code uses Kokoro.
- Some runtime logic overlaps across modules.

## 7) Validation Against Code

- Confirmed existence of service directories and feature flags.
- LLMService, STTService, VisionService code matches architecture layers.
- Cloud fallback flags present in settings and service code.
- Safety layer referenced but not linked; docs exist separately.
- Minimal tests exist but lack cloud/hardware fallback coverage.
- Mismatch: architecture doc versions referenced don't specify actual package versions.

## 8) Findings Backlog

- **F-001 Docs gap:** Piper→Kokoro rename (resolved in this phase).
- **F-002 Docs gap:** LLM versioning ambiguity.
- **F-003 Missing feature:** Safety guidelines not tied to code.
- **F-004 Tech debt:** Duplicate runtime-selection logic.
- **F-005 Test gap:** No tests for cloud fallback gating.
- **F-006 Tech debt:** Missing model download/cache implementation details.

## 9) Recommendations for Next Step Discussion

1. Update architecture and related docs to reflect Kokoro rename (done).
2. Add tests covering cloud fallback/feature flags across services.
3. Link safety guidelines docs to actual code modules or create a safety-service stub.
4. Consolidate runtime selection logic into shared utility.
5. Document cache/download mechanisms or implement them in services.
6. Audit `SAFETY_GUIDELINES.md` next.

**Report stored:** `docs/reviews/ai-native-architecture.review.md`

---

### Resolution Notes

- **F-001:** Piper renamed to Kokoro across architecture and README/feature spec docs.
