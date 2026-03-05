# Research Topics & Opportunities — Consolidated Index

**Date:** 2026-03-05  
**Status:** Living Document  
**Purpose:** Single consolidated view of all research areas for Advay Vision Learning — what's been done, what's open, and what's worth exploring next.

---

## How To Read This Document

- **✅ DONE** = Research exists with actionable findings
- **🟡 PARTIAL** = Some work done, significant gaps remain
- **🔴 NOT STARTED** = Identified as needed but no research conducted
- **🆕 NEW** = Newly identified opportunity not in original roadmap

Each topic includes: current status, key questions, why it matters, and suggested research approach.

---

## Part 1: Formal Research Roadmap Status (RESEARCH-001 through RESEARCH-016)

### ✅ Completed Research

| ID | Topic | Document | Key Outcome |
|----|-------|----------|-------------|
| RESEARCH-001 | Technical Implementation Patterns | `research/RESEARCH-001-TECHNICAL-PATTERNS.md` | MediaPipe perf specs, camera error handling, bundle size strategies |
| RESEARCH-002 | Monetization & Business Model | `research/RESEARCH-002-MONETIZATION.md` | Freemium model validated; Indian market pricing benchmarks |
| RESEARCH-011 | Deployment & Distribution | `research/RESEARCH-011-DEPLOYMENT-DISTRIBUTION.md` | Web-first decision; PWA progressive enhancement |
| RESEARCH-012 | Safety & Content Moderation | `research/RESEARCH-012-SAFETY-MODERATION.md` | Camera safety guardrails, screen time prevention |
| RESEARCH-013 | Marketing & Growth | `research/RESEARCH-013-MARKETING-GROWTH.md` | Channel strategy for Indian market |
| RESEARCH-014 | Gamification & Motivation | `COMPREHENSIVE_UX_GAMIFICATION_RESEARCH.md` | Ethical reward systems for kids; anti-addiction patterns |
| RESEARCH-016 | AR Capabilities | `research/RESEARCH-016-AR-CAPABILITIES.md` | WebAR feasible; dual camera architecture validated |

### Additional Completed Research (not in formal roadmap)

| Topic | Document | Key Outcome |
|-------|----------|-------------|
| State of the Art AI EdTech | `research/STATE_OF_THE_ART_AI_EDTECH.md` | TUI validation, DDA as core IP, affective computing opportunity |
| CV/ML Educational Features | `COMPREHENSIVE_CV_EDUCATIONAL_RESEARCH.md` | 180+ camera-native game ideas cataloged |
| Web Audio API for Games | `research/WEB_AUDIO_API_RESEARCH.md` | Spatial audio patterns, procedural SFX |
| Hand UI Interaction | `research/HAND_UI_RESEARCH_CONSOLIDATED_2026-02-28.md` | Cursor-as-hand architecture, hover/click patterns |
| MediaPipe + React Architecture | `research/MEDIAPIPE_REACT_UI_INTERACTION_ARCHITECTURE_2026-02-28.md` | Event bridge pattern for MP → React |
| WebGL/WASM Graphics | `research/webgl-wasm-graphics-research-2026.md` | PixiJS recommended for game rendering |
| CSS/SVG Sprite Systems | `research/CSS_SVG_SPRITE_RESEARCH.md` | Character animation without heavy assets |
| Anime.js | `research/animejs-research-report.md` | Lightweight animation library evaluation |
| Pricing (deep dive) | `research/PRICING_AND_GLOBAL_SCALE.md` + `GAME_PACK_PRICING_RECOMMENDATION_2026-02-26.md` | ₹99–₹299/mo tiers; game pack model |
| Unified Analytics SDK | `analytics/UNIFIED_SDK.md` | Game-agnostic analytics architecture designed & partially implemented |
| Kids Open Datasets & CC0 Assets | `research/KIDS_OPEN_DATASETS_APIS_AND_CC0_ASSETS_CATALOG_2026-03-03.md` | Comprehensive CC0 asset sources cataloged |
| Competitor Analysis | `FEATURE_RESEARCH_INITIATIVE_2026-02-24.md` | Khan Academy Kids, ABCmouse, Osmo, Duolingo ABC compared |

---

## Part 2: Open Research (Not Started / Gaps)

### 🔴 R-003: Curriculum Alignment & Learning Outcomes
**Priority:** P1 — HIGH  
**Why it matters:** Without mapping games to recognized learning frameworks, we can't tell parents *what* their child is actually learning. Schools won't adopt. "Fun app" vs. "learning platform" credibility gap.

**Key questions:**
1. How do our 18+ games map to NCERT/CBSE learning outcomes for ages 3–8?
2. What measurable learning outcomes can we define per game?
3. What's the optimal session length by age (backed by child development data)?
4. How do we assess learning for pre-literate children (no quizzes)?
5. What certifications or endorsements matter to Indian parents?

**Research approach:**
- Pull NCERT Early Childhood Care and Education (ECCE) framework
- Map each existing game → specific developmental milestones (motor, cognitive, language, social-emotional)
- Survey 5-10 competitor apps for how they communicate "learning value" to parents
- Interview 2-3 early childhood educators if possible

**Deliverables:** Curriculum alignment matrix, assessment methodology, session length recommendations

---

### 🔴 R-004: Accessibility for Kids with Disabilities
**Priority:** P1 — HIGH  
**Why it matters:** Our North Star vision explicitly promises "Universal Accessibility Built-In" including OT modules and ASD mode. Zero research exists to back implementation.

**Key questions:**
1. What WCAG guidelines apply specifically to camera-based kids' apps?
2. How do we accommodate motor impairments when the primary input is hand gestures?
3. Alternative input modes: eye tracking, switch access, voice commands — what's feasible in-browser?
4. How do we make camera-based games work for wheelchair users (limited range of motion)?
5. What does "Low-Stimulation / ASD Mode" actually mean in UX terms? (colors, sounds, pacing, transitions)
6. What are legal accessibility requirements for educational apps in India?

**Research approach:**
- Review WCAG 2.1 AA interpreted for children's software
- Study Osmo's and Khan Academy Kids' accessibility features
- Research WebGazer.js or MediaPipe face mesh for eye-tracking input
- Consult occupational therapy literature on gesture range-of-motion

**Deliverables:** Accessibility requirements doc, alternative input modes spec, ASD mode design guidelines

---

### 🔴 R-005: Sound Design & Music Production Pipeline
**Priority:** P2 — MEDIUM  
**Why it matters:** Every game needs SFX and background music. We have Kokoro TTS for voice, but no strategy for the ~500+ sound effects, ambient loops, and musical elements needed across 20+ games.

**Key questions:**
1. What's the complete audio asset inventory across all current and planned games?
2. AI-generated music (Suno, Udio, MusicGen) — quality/licensing for kids' apps?
3. Royalty-free music libraries with Indian instrument options?
4. Procedural audio via Web Audio API — can we generate SFX dynamically instead of shipping 500 files?
5. What audio formats and compression settings minimize bundle size?
6. How do we handle multi-language audio for game instructions?

**Research approach:**
- Audit all current games for sound usage (what exists, what's placeholder, what's missing)
- Test AI music generators for child-appropriate output quality
- Evaluate Freesound.org, Pixabay Audio, and Kenney audio packs
- Build a proof-of-concept procedural SFX generator using Web Audio API

**Deliverables:** Audio asset inventory, production pipeline recommendation, budget estimate

---

### 🔴 R-006: Privacy Guardrails & COPPA/DPDPA Compliance
**Priority:** P0 — CRITICAL (blocks public launch)  
**Why it matters:** Camera-based app targeting kids 2–8. This is the highest regulatory risk area. India's Digital Personal Data Protection Act (DPDPA) 2023 has specific provisions for children's data. COPPA applies if any US users.

**Key questions:**
1. What does DPDPA 2023 require for apps processing children's data in India?
2. What "verifiable parental consent" mechanism is legally sufficient?
3. Camera frames are processed locally and never stored — is this sufficient, or do we need explicit consent for *processing*?
4. What privacy disclosures must appear in-app (not just privacy policy)?
5. What data do we currently collect, and what should we explicitly *not* collect?
6. Do we need a Data Protection Officer (DPO)?
7. Google Play "Designed for Families" program requirements if we wrap as TWA?

**Research approach:**
- Read DPDPA 2023 sections on children's data (Chapter III, Section 9)
- Review FTC COPPA safe harbor programs
- Analyze 3 camera-based kids' apps' privacy implementations
- Document our current data flows (what's sent to server vs. stays on device)

**Deliverables:** Compliance checklist, privacy implementation guide, in-app consent flow design, data flow audit

---

### 🔴 R-007: Parent Dashboard & Progress Reporting
**Priority:** P2 — MEDIUM  
**Why it matters:** Parents are the paying customers. Currently no way for them to see what their child is learning beyond raw session counts. This is the #1 feature that drives parent satisfaction and subscription retention.

**Key questions:**
1. What information do Indian parents actually want to see about their child's learning?
2. How do successful competitors visualize progress (screenshots/teardowns)?
3. How do we communicate *learning value* not just *time spent*?
4. What notification strategies respect parent attention (not spam)?
5. How detailed should per-game analytics be vs. high-level summaries?
6. Weekly email digest — what format drives engagement?

**Research approach:**
- Teardown parent dashboards in: Khan Academy Kids, ABCmouse, Homer, Kiddopia
- Map our Unified Analytics SDK events to parent-facing metrics
- Design 2-3 dashboard mockup concepts
- Survey Indian parents (informal: WhatsApp groups, parenting forums)

**Deliverables:** Parent dashboard requirements, progress report wireframes, notification strategy

---

### 🔴 R-009: Localization & Cultural Adaptation Pipeline
**Priority:** P2 — MEDIUM  
**Why it matters:** We support EN/HI/KN but have no scalable process for adding languages or ensuring cultural appropriateness across India's diverse regions.

**Key questions:**
1. What's the cost/effort to add a new language end-to-end? (UI strings, TTS voice, game content, cultural examples)
2. Which languages give the most user reach? (Hindi + English cover ~70%, then Tamil, Telugu, Bengali, Marathi)
3. How do we handle script differences? (Devanagari vs. Dravidian vs. Latin)
4. Festival/seasonal content — how do we avoid cultural insensitivity?
5. What translation management tools integrate with our React i18n setup?
6. Kokoro TTS — which Indian languages are supported with acceptable quality?

**Research approach:**
- Map language reach vs. implementation effort for top 10 Indian languages
- Evaluate Crowdin, Lokalise, or Phrase for translation management
- Audit Kokoro TTS voice quality per language
- Create cultural sensitivity guidelines (food, clothing, festival examples that are inclusive)

**Deliverables:** Language expansion roadmap, localization workflow doc, cultural guidelines

---

### 🔴 R-010: Analytics & Data Strategy (Privacy-First)
**Priority:** P2 — MEDIUM  
**Why it matters:** We built the Unified Analytics SDK (v2.0) but haven't defined *what metrics matter* or *how to analyze them* without collecting PII.

**Key questions:**
1. What are the 10 most important metrics for a kids' learning app? (engagement, retention, learning progression, session depth...)
2. How do we measure *learning outcomes* vs. *engagement* vs. *addiction*?
3. Privacy-first analytics tools: Plausible, Umami, PostHog (self-hosted) — which fits?
4. How do we A/B test features ethically with children?
5. What internal dashboards do we need for product decisions?
6. What data should we explicitly *never* collect? (face data, voice recordings, location...)

**Research approach:**
- Define metric taxonomy: engagement, learning, health (anti-addiction), business
- Evaluate self-hosted analytics (PostHog, Umami) for DPDPA compliance
- Design A/B testing framework that's ethical for kids
- Map Unified Analytics SDK events to business KPIs

**Deliverables:** Metrics definition doc, analytics tool recommendation, A/B testing guidelines

---

### 🔴 R-015: B2B School & NGO Channel
**Priority:** P3 — LOW (post-launch)  
**Why it matters:** B2B can be a massive revenue channel and social impact multiplier. Indian government's Digital India + NEP 2020 pushes tech in education.

**Key questions:**
1. What do Indian schools (CBSE, ICSE, state boards) need from educational apps?
2. How do schools procure software? (government tenders, school chains, individual schools)
3. What's the classroom deployment model? (shared tablets, computer lab, BYOD)
4. Teacher dashboard requirements vs. parent dashboard?
5. What pricing models work for schools in India? (per-student, per-school, district-level)
6. NGO partnerships (Pratham, Akshara Foundation) — what's the model?

**Research approach:**
- Interview 2-3 school administrators or EdTech school sales reps
- Study DIKSHA platform (govt EdTech) integration opportunities
- Analyze B2B pricing models of competitors (Byju's school, Extramarks)

**Deliverables:** School sales process analysis, classroom feature requirements, B2B pricing model

---

## Part 3: Newly Identified Research Opportunities (🆕)

### 🆕 R-017: On-Device AI / Local LLM for Pip Conversations
**Priority:** P1 — HIGH  
**Why it matters:** The North Star vision describes Pip as a "Conversational Tutor" using "safe, local LLMs." This is now technically feasible in-browser but unresearched.

**Key questions:**
1. What small LLMs can run in-browser? (WebLLM, ONNX Runtime Web, llama.cpp WASM)
2. What's the minimum device spec to run a 1-3B parameter model in-browser?
3. Can we fine-tune a small model on child-safe conversational data?
4. What's the latency for first-token in-browser vs. a cheap API call to a hosted model?
5. Hybrid approach: local for common phrases, API fallback for complex queries?
6. Content safety: how do we guarantee a local LLM never generates inappropriate content for a 4-year-old?

**Research approach:**
- Benchmark WebLLM (Phi-3-mini, TinyLlama) on target devices (M1 Mac, mid-range Android, Chromebook)
- Evaluate MLC-LLM WebGPU performance
- Design content safety guardrails (system prompt, output filtering, topic allowlisting)
- Prototype a simple "Ask Pip" chat with 3 constrained topics (animals, colors, letters)

**Deliverables:** LLM feasibility report, device compatibility matrix, safety architecture, prototype

---

### 🆕 R-018: Invisible Rubber Banding Engine (Dynamic Difficulty Adjustment)
**Priority:** P1 — HIGH  
**Why it matters:** Identified in North Star and State-of-the-Art research as "our core IP" and "unfair advantage." Uses camera data (hand velocity, tracing accuracy, shake detection) to silently adjust game difficulty. No implementation research exists.

**Key questions:**
1. What real-time signals can we extract from MediaPipe hand tracking? (velocity, acceleration, jitter, hover time, path deviation)
2. What's the DDA algorithm? (rule-based thresholds vs. simple ML model vs. PID controller)
3. What game parameters should be adjustable? (hitbox size, speed, gravity, timer, hint frequency)
4. How do we calibrate per-child baselines without explicit "assessment" sessions?
5. How fast must adjustments be to feel invisible? (within-attempt vs. between-attempts)
6. How do we prevent the system from being *too* easy (child never challenged)?

**Research approach:**
- Literature review: DDA in educational games (Lomas et al., Csikszentmihalyi flow theory)
- Log hand-tracking telemetry from current games to establish baseline distributions
- Design rule-based DDA v1 with 3-5 adjustable parameters
- A/B test with real kids: fixed difficulty vs. rubber-banded

**Deliverables:** DDA algorithm spec, signal extraction library, per-game parameter tuning guide

---

### 🆕 R-019: Affective Computing — Emotion Detection via Camera
**Priority:** P2 — MEDIUM  
**Why it matters:** North Star vision: "Pip detects frustration." State-of-the-Art research validates this as "the hottest frontier in ECE." MediaPipe Face Mesh already runs in our stack.

**Key questions:**
1. Can MediaPipe Face Mesh reliably detect basic emotions in children ages 3–8? (frustration, joy, boredom, confusion)
2. What facial action units (AUs) correlate with child frustration vs. adult frustration?
3. Privacy implications: processing face data locally is okay, but do we need consent?
4. What interventions should Pip trigger? (breathing exercise, easier level, encouragement, break suggestion)
5. How do we handle false positives? (child making silly faces ≠ distress)
6. Cultural variation in emotional expression across Indian regions?

**Research approach:**
- Test MediaPipe Face Mesh emotion approximation (brow furrow, mouth downturn, gaze aversion)
- Review FER (Facial Expression Recognition) datasets for children (AffectNet, RAF-DB)
- Design conservative intervention rules (only trigger on sustained signals, not momentary)
- Prototype emotion → Pip reaction pipeline

**Deliverables:** Emotion detection feasibility report, intervention design, privacy analysis

---

### 🆕 R-020: Offline-First Architecture for Indian Market
**Priority:** P1 — HIGH  
**Why it matters:** Target users in India frequently have intermittent connectivity. Games using MediaPipe run 100% client-side — but progress sync, auth, and content updates need connectivity.

**Key questions:**
1. What features work fully offline vs. need connectivity? (games: offline ✅, auth: needs connectivity, progress sync: needs connectivity)
2. Service Worker strategy: what to cache? (game assets, ML models, audio)
3. Total offline cache size and how it compares to Indian phone storage constraints?
4. Conflict resolution when offline progress syncs with server?
5. How do we handle subscription validation offline? (grace period? cached token?)
6. Can we pre-download game packs for use in areas with zero connectivity?

**Research approach:**
- Audit current app: what network requests are made during gameplay?
- Measure total asset size per game (JS, WASM models, images, audio)
- Design service worker caching strategy with Workbox
- Prototype offline game play → background sync

**Deliverables:** Offline feature matrix, service worker architecture, storage budget analysis, sync strategy

---

### 🆕 R-021: Low-End Android Device Performance
**Priority:** P1 — HIGH  
**Why it matters:** Indian market reality — 60%+ of target users are on ₹8K–₹15K Android phones (2-4GB RAM, Snapdragon 4-series / Helio G-series). Our current dev/test environment is MacBook Pro. Zero real-device testing.

**Key questions:**
1. What's MediaPipe hand tracking FPS on Snapdragon 480 / Helio G35?
2. How much RAM does our app consume during gameplay? (React + MediaPipe + WASM models)
3. What's the camera resolution sweet spot (lower = faster but less accurate)?
4. Battery drain rate during camera-active gameplay?
5. Chrome vs. Samsung Internet vs. Firefox on Android — which performs best?
6. Can we detect device capability and auto-scale? (resolution, frame rate, model complexity)

**Research approach:**
- Get 2-3 budget Android phones (Redmi Note, Realme C-series, Samsung Galaxy M)
- Run automated performance benchmarks (FPS, memory, battery)
- Create device capability detection module
- Design "lite mode" with reduced visual fidelity

**Deliverables:** Device compatibility matrix, performance benchmark report, lite mode spec

---

### 🆕 R-022: Speech-to-Text (STT) for Voice Input
**Priority:** P2 — MEDIUM  
**Why it matters:** Listed in TODO_NEXT.md as AI-004. Kids want to *talk* to Pip. "What does this letter say?" requires hearing the child speak. Web Speech API exists but quality varies wildly.

**Key questions:**
1. Web Speech API accuracy for children's voices (ages 3–8)? (known to be poor)
2. Whisper.cpp WASM — can it run in-browser with acceptable latency?
3. Indian-accented English recognition accuracy?
4. Hindi/Kannada STT options in-browser?
5. Privacy: is on-device STT viable, or must we send audio to a server?
6. How do we handle "gibberish" input from a 3-year-old gracefully?

**Research approach:**
- Benchmark Web Speech API with children's voice recordings
- Test Whisper.cpp WASM (tiny model) in Chrome
- Evaluate Deepgram, AssemblyAI for server-side Indian language STT
- Design graceful fallback UX when STT can't understand

**Deliverables:** STT feasibility report, accuracy benchmarks by age/language, privacy analysis

---

### 🆕 R-023: PWA Install & App Store Wrapper Strategy
**Priority:** P2 — MEDIUM  
**Why it matters:** RESEARCH-011 decided "web-first" but didn't resolve the last mile: how do parents *find and install* the app? Indian parents expect Play Store. TWA (Trusted Web Activity) or Capacitor wrapper needed.

**Key questions:**
1. TWA vs. Capacitor vs. React Native wrapper — which preserves camera perf?
2. Google Play "Designed for Families" requirements (teacher-approved badge, age rating)
3. Apple App Store — does WKWebView support MediaPipe with camera?
4. PWA install prompts — what's the conversion rate on mobile Chrome in India?
5. App store listing optimization for Indian parents searching in Hindi?
6. Huawei AppGallery (no Google Play) — significant user segment in India?

**Research approach:**
- Build minimal TWA wrapper and test camera + MediaPipe
- Apply for Google Play developer account; review Families Policy
- Test iOS WKWebView camera access limitations
- Research Indian app store search behavior

**Deliverables:** Wrapper technology decision, store submission checklist, listing optimization guide

---

### 🆕 R-024: Multiplayer & Sibling Co-Play
**Priority:** P3 — LOW  
**Why it matters:** North Star vision describes "Sibling Co-op (Hand Pong)" and "Remote WebRTC (Grandparent Storytime)." Multiple hands in frame is technically feasible with MediaPipe but unresearched.

**Key questions:**
1. Can MediaPipe track 4 hands (2 kids) simultaneously with acceptable FPS?
2. What co-op game mechanics work for mixed-age siblings (3yo + 6yo)?
3. Remote play via WebRTC — latency requirements for kids' games?
4. Turn-based vs. real-time: which is more appropriate for young children?
5. How do we handle "cheating" or "unfair" play between siblings?

**Research approach:**
- Test MediaPipe multi-hand (4-hand) tracking performance
- Design 2-3 co-op game concepts that work with asymmetric skill levels
- Prototype WebRTC video + game state sync

**Deliverables:** Multi-hand tracking performance report, co-op game design doc, WebRTC architecture

---

### 🆕 R-025: Haptic Feedback via Web APIs
**Priority:** P3 — LOW  
**Why it matters:** Existing `HAptics_WebHaptics_Analysis.md` exists but isn't connected to game design. Vibration feedback makes gesture games feel more responsive on mobile.

**Key questions:**
1. Vibration API browser support on target Android devices?
2. What haptic patterns feel rewarding vs. annoying for kids?
3. Can we use haptics as accessibility feedback (deaf/HoH users)?
4. Gamepad API haptics for families with controllers?

**Deliverables:** Haptic feedback design guide, per-game haptic pattern spec

---

## Part 4: Research Priority Matrix

### Tier 1 — Blocks Launch or Core IP
| ID | Topic | Effort | Urgency |
|----|-------|--------|---------|
| R-006 | COPPA/DPDPA Compliance | 2-3 days | 🔴 Blocks public launch |
| R-018 | DDA Rubber Banding Engine | 3-5 days | 🔴 Core differentiator |
| R-021 | Low-End Android Performance | 2-3 days | 🔴 60% of target market |
| R-020 | Offline-First Architecture | 2-3 days | 🔴 Indian connectivity reality |

### Tier 2 — High Product Value
| ID | Topic | Effort | Urgency |
|----|-------|--------|---------|
| R-003 | Curriculum Alignment | 2-3 days | 🟡 Parent trust & school adoption |
| R-004 | Accessibility | 2-3 days | 🟡 North Star promise |
| R-017 | On-Device LLM for Pip | 3-5 days | 🟡 Key vision feature |
| R-007 | Parent Dashboard | 2 days | 🟡 Subscription retention driver |

### Tier 3 — Important but Not Urgent
| ID | Topic | Effort | Urgency |
|----|-------|--------|---------|
| R-005 | Sound Design Pipeline | 1-2 days | 🟢 Content quality |
| R-009 | Localization Pipeline | 2 days | 🟢 Market expansion |
| R-010 | Analytics Strategy | 1-2 days | 🟢 Product decisions |
| R-019 | Emotion Detection | 2-3 days | 🟢 Differentiator but later |
| R-022 | STT Voice Input | 2-3 days | 🟢 Phase 2 feature |
| R-023 | App Store Strategy | 2 days | 🟢 Distribution |

### Tier 4 — Future / Post-Launch
| ID | Topic | Effort | Urgency |
|----|-------|--------|---------|
| R-015 | B2B School Channel | 2 days | ⚪ Post-launch |
| R-024 | Multiplayer / Co-Play | 3 days | ⚪ Post-launch |
| R-025 | Haptic Feedback | 1 day | ⚪ Polish |

---

## Part 5: Suggested Research Sprint Plan

### Sprint R1: Launch Blockers (1 week)
**Goal:** De-risk public launch

| Day | Research | Approach |
|-----|----------|----------|
| 1-2 | R-006: COPPA/DPDPA Compliance | Web research + data flow audit |
| 2-3 | R-021: Low-End Android Performance | Benchmarks on real devices |
| 3-4 | R-020: Offline-First Architecture | Service worker prototype |
| 5 | Synthesize findings → implementation tickets |

### Sprint R2: Core IP (1 week)
**Goal:** Build the "unfair advantage"

| Day | Research | Approach |
|-----|----------|----------|
| 1-3 | R-018: DDA Rubber Banding Engine | Algorithm design + signal extraction |
| 3-4 | R-017: On-Device LLM | WebLLM benchmarks + safety design |
| 5 | R-003: Curriculum Alignment (start) | NCERT mapping |

### Sprint R3: Product Depth (1 week)
**Goal:** Parent value + accessibility

| Day | Research | Approach |
|-----|----------|----------|
| 1-2 | R-003: Curriculum Alignment (finish) | Complete game → outcome matrix |
| 2-3 | R-004: Accessibility | WCAG review + alternative inputs |
| 4 | R-007: Parent Dashboard | Competitor teardowns + wireframes |
| 5 | R-010: Analytics Strategy | Metrics definition + tool selection |

---

## Part 6: Cross-Cutting Research Themes

These themes cut across multiple research areas and should be considered in all research:

### Theme A: "India-First" Constraints
- **Connectivity:** 4G patchy in Tier 2/3 cities, Wi-Fi unreliable in homes
- **Devices:** Budget Android phones (2-4GB RAM), shared family devices
- **Languages:** 22 scheduled languages, 100+ spoken languages
- **Payment:** UPI dominant, credit cards rare among target demographic
- **Culture:** Regional diversity in food, festivals, clothing, family structure

### Theme B: Child Safety & Privacy
- Every feature must pass: "Would I be comfortable with my 4-year-old using this unsupervised?"
- Camera data never leaves device (processing only)
- No social features between children (prevents grooming risk)
- Screen time guardrails are features, not afterthoughts

### Theme C: Solo Developer Constraints
- Research should produce *actionable implementation plans*, not academic papers
- Prefer browser-native solutions over external services
- Prefer one-time setup over ongoing operational burden
- Automate everything possible; manual processes don't scale at team-size-one

---

## Appendix: Document Cross-References

| Document | What It Contains | Relationship |
|----------|-----------------|--------------|
| `docs/RESEARCH_ROADMAP.md` | Original RESEARCH-001 through RESEARCH-016 definitions | Formal roadmap (this doc is the status overlay) |
| `docs/FEATURE_RESEARCH_INITIATIVE_2026-02-24.md` | Feature ROI analysis, competitor comparison, sprint plan | Product planning |
| `docs/PROJECT_EXPLORATION_BACKLOG.md` | Broad opportunity backlog across all categories | Discovery |
| `docs/AREAS_TO_EXPLORE.md` | 270+ game ideas organized by category | Game content |
| `docs/NORTH_STAR_VISION.md` | Product philosophy & long-term vision | Strategic north star |
| `docs/research/STATE_OF_THE_ART_AI_EDTECH.md` | Academic validation of vision (TUI, DDA, affective computing) | Academic grounding |
| `docs/TODO_NEXT.md` | Prioritized implementation backlog | Implementation queue |
| `docs/analytics/UNIFIED_SDK.md` | Analytics SDK architecture (v2.0) | Supports R-010 |

---

**Document Owner:** Pranay  
**Next Review:** After Sprint R1 completion  
**Living document — update as research progresses.**
