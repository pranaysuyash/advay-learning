# Architecture Document Review: AI-Native ARCHITECTURE.md

**Reviewed on:** 2026-03-05
**Reviewer:** Doc-to-Code Audit Agent

## 1. Doc Summary

- **Purpose:** Defines technical architecture for transforming the Advay Vision Learning app into an AI-native learning platform with Pip as an interactive companion.
- **Audience:** Engineers, designers, and product stakeholders planning or building AI features.
- **Scope:** High-level system layers, component specifications, provider options, interface definitions, data flows, implementation phases, configuration, budgets, error handling, security, monitoring, and related docs.
- **Status:** Draft (v1.0.0 dated 2026‑01‑29, “Awaiting Review”). Likely not yet implemented in code.
- **Call to action:** Use as blueprint during architecture discussions; validate components during implementation phases; update once code catches up.

## 2. Explicit Claims & Requirements

- High-level layers and sub-components listed with detailed responsibilities.
- Design principles table.
- Component specs (LLM, TTS, STT, Vision) with provider tables, recommended strategies, interface definitions, prompt templates, etc.
- Data-flow examples for typical interactions.
- Implementation phase timeline (4 phases, weekly priorities).
- Environment variables, feature flags, performance budgets, error handling, security, monitoring metrics, logging examples.
- Changelog and related document references.

## 3. Implicit Assumptions & Inferred Intent

- Document is a roadmap; many components do not yet exist in code.
- Interfaces are meant for TypeScript frontend services; backend proxy for API keys assumed.
- Redis/LocalStorage caching assumed but infrastructure unclear.
- Feature flags will gate staged rollout.

## 4. Questions the Doc Asks

- Which providers to choose? (answered in tables)
- How to enforce privacy/safety? (partial, see linked docs)
- Exact shapes of context objects? (provided by interfaces)
- Missing: testing approach, existing mocks/stubs, detailed implementation mapping.

## 5. Tasks Mentioned

### Open

- Integrate Web Speech API (TTS & STT)
- Setup Ollama LLM and provider abstraction
- Build context manager
- Add UI indicators, content filtering, caching
- Add TensorFlow.js object detection, privacy toggles

### Completed

- None; planning-phase entries only.

## 6. Confusions & Contradictions

- Doc draft state but lacks owner/next steps.
- Some tables duplicate entries (Ollama models).
- Interface definitions assume TS-only; backend uses Python.
- Feature flag constant not implemented.
- Cache mention ambiguous (Redis vs LocalStorage).
- Phase schedule is outdated (document dated Jan 2026).

## 7. Validation Against Code

- **Verified:** MediaPipe hand tracking implemented; TTSService exists with multi-tier strategy.
- **Mismatches:**
  - `LLMService`, `STTService` interfaces not implemented in code.
  - No `AI_FEATURES` constant.
  - Env vars in backend limited to GEMINI/OPENAI, not matching doc list.
  - Data-flow scenarios are conceptual; no code references.
- **Missing tests:** LLM/STT providers, feature flags, caching.

## 8. Findings Backlog

| ID    | Title                               | Type            | Impact | Confidence | Proposed Resolution/AC                                                                                                                                               |
| ----- | ----------------------------------- | --------------- | ------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-001 | Architecture doc out-of-sync        | Docs gap        | Medium | High       | Update doc or code; include actual file paths/implementations.                                                                                                       |
| F-002 | LLMService not implemented          | Missing feature | High   | High       | Research completed (see docs/research/LLM_PROVIDER_SURVEY_2026-03-05.md); implement service with provider abstraction based on WebLLM/Transformers.js/Ollama/HF API. |
| F-003 | STTService not implemented          | Missing feature | High   | High       | Implement STT analogously to TTS.                                                                                                                                    |
| F-004 | Feature flags missing               | Tech debt       | Low    | High       | Add config object and integrate.                                                                                                                                     |
| F-005 | Env var mismatch                    | Tech debt       | Medium | High       | Sync backend config with doc.                                                                                                                                        |
| F-006 | Data-flow examples unmapped         | Docs gap        | Low    | Medium     | Add cross-references or remove.                                                                                                                                      |
| F-007 | Phase schedule outdated             | Docs gap        | Low    | High       | Update or annotate as legacy.                                                                                                                                        |
| F-008 | Cache strategy unclear              | Research needed | Medium | Medium     | Decide Redis vs local; update doc.                                                                                                                                   |
| F-009 | Safety/privacy layers unimplemented | Tech debt/Risk  | High   | Medium     | Audit and implement content filters.                                                                                                                                 |

## 9. Recommendations for Next Step Discussion

1. Align architecture doc to current implementation state.
2. Scaffold core AI services with interface & tests.
3. Build feature-flag infrastructure and adopt early.
4. Update backend configuration for AI env variables.
5. Clarify caching approach.
6. Review and merge MediaPipe documentation with architecture.
7. Schedule cross-team review to finalize providers & timeline.

---

✨ _Report ready. Say “PROCEED” to start addressing specific finding(s)._
