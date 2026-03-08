# Deep Dive: Critical Issues, Stubs, and Research Areas

**Date:** 2026-03-07  
**Purpose:** Comprehensive analysis of logical issues, stub implementations, TODOs, and future research areas that could impact production users  
**Scope:** Frontend, Backend, Infrastructure, Research Gaps  

---

## Executive Summary

| Category | Count | Priority |
|----------|-------|----------|
| Stub Implementations | 5 | P1 |
| Known Logical Issues | 3 | P1-P2 |
| TODO/FIXME Items | 12 | P1-P3 |
| Open Research Areas | 8 | P0-P2 |
| Future Game Ideas | 80+ | Backlog |

---

## Part 1: Stub Implementations (Need Real Logic)

### 🔴 CRITICAL: AI Generator Stubs

**Files:**
- `src/frontend/src/services/ai/generators/StoryGenerator.ts` (lines 100-104)
- `src/frontend/src/services/ai/generators/ActivityGenerator.ts` (lines 70-73)

**Current State:**
```typescript
export class StubStoryGenerator implements StoryGenerator {
  generate(params: StoryParams): Promise<StoryResult> {
    return { text: `STUB: story for '${params.prompt}'` };
  }
}
```

**Impact:** 
- Voice Stories game shows placeholder text instead of generated stories
- Activity recommendations return "STUB: activity for 'topic'"
- Users see raw stub messages in UI

**Resolution Path:**
1. Integrate with LLMService for real generation
2. Add caching for generated content
3. Implement fallback to pre-written story library

**Feature Flags:**
- `enableStoryGenerator` - currently off
- `enableActivityGenerator` - currently off

---

### 🟡 PLACEHOLDER: Language Flag Icons

**File:** `src/frontend/src/data/languages.ts` (lines 42-51)

**Issue:** All non-English languages use Indian flag as placeholder:
```typescript
zh: '/assets/icons/ui/flag-in.svg', // Placeholder (not Indian language)
es: '/assets/icons/ui/flag-in.svg', // Placeholder
ar: '/assets/icons/ui/flag-in.svg', // Placeholder
// ... 7 more languages
```

**Impact:** Cultural inaccuracy - showing Indian flag for Chinese, Spanish, Arabic

**Fix:** Add proper country flags or language-neutral icons

---

### 🟡 STUB: Game Registry Service

**File:** `src/frontend/src/services/gameRegistry.ts` (lines 1-2)
```typescript
// Temporary stub to satisfy TypeScript references in the project.
// A real game registry is maintained elsewhere; this placeholder exists
```

**Impact:** Minimal - real registry exists elsewhere, but could confuse new developers

**Fix:** Consolidate or remove stub file

---

### 🟡 STUB: ONNX Vision Provider

**File:** `src/frontend/src/services/ai/vision/VisionService.ts` (line 173)
```typescript
console.warn('[VisionService] ONNX provider not yet implemented');
```

**Impact:** Cannot use ONNX runtime as vision backend (MediaPipe only)

---

## Part 2: Known Logical Issues

### 🔴 HIGH: TTS Queue Management Browser Bug

**File:** `src/frontend/src/services/ai/tts/TTSService.ts` (line 304)
```typescript
// Browser bug fix: cancel() occasionally fails to clear the queue if speech is paused
```

**Issue:** Speech synthesis queue may not clear properly when paused
**Impact:** TTS messages may queue up and play unexpectedly
**Status:** Workaround implemented but root cause not fixed

---

### 🟡 MEDIUM: Finger Number Show Stability (FIXED but pattern exists)

**File:** `docs/fixes/finger-number-success-detection-fix.md`

**Original Issue:** Stability detection too strict, resetting timer on minor hand movements
**Fix Applied:** Added 1-second tolerance before reset
**Pattern Risk:** Similar strict detection may exist in other gesture games

**Games to Audit:**
- [ ] Mudra Master (if implemented)
- [ ] Sign Language Basics (if implemented)
- [ ] Any gesture-hold games

---

### 🟡 MEDIUM: Analytics Event Cap

**File:** `src/frontend/src/analytics/store.ts`

**Issue:** `MAX_EVENTS_PER_SESSION = 100` - events silently dropped after cap
**Impact:** Long play sessions may lose analytics data
**Recommendation:** Implement event sampling or batch flush before cap

---

### 🟡 MEDIUM: Coordinate Transform Edge Cases

**File:** `src/frontend/src/utils/coordinateTransform.ts` (line 53)
```typescript
// Clamp normalized coordinates to valid range [0, 1] - prevents off-screen rendering bugs
```

**Issue:** Clamping may hide underlying tracking issues
**Recommendation:** Log when clamping occurs to detect tracking drift

---

## Part 3: TODO/FIXME Items from Code

### Frontend TODOs

| Location | Issue | Priority |
|----------|-------|----------|
| `GameCanvas.tsx:463` | Memory leaks check (long-running games) | P2 |
| `VoiceInstructions.tsx` | Cleanup on unmount verified | ✅ Done |
| `DragDropSystem.tsx:77,289,361` | Debug visualization code in production | P3 |
| `useHandTracking.ts` | Component unmount handling during init | P2 |

### Backend TODOs

| Location | Issue | Priority |
|----------|-------|----------|
| `subscriptions.py:345` | Missing product_id in webhook payload handling | P2 |
| `error_handler.py:88` | DEBUG mode exposes full traceback | P1 (security) |

### E2E Test TODOs

| Location | Issue | Priority |
|----------|-------|----------|
| `home-landing.spec.ts:4` | Mobile layout mascot overlap test marked `.fixme()` | P2 |

---

## Part 4: Open Research Areas (P0-P2)

### 🔴 P0: Privacy & Compliance (BLOCKS LAUNCH)

**Document:** `docs/research/RESEARCH_TOPICS_CONSOLIDATED_2026-03-05.md` (R-006)

**Critical Gaps:**
1. **DPDPA 2023 Compliance** - No research on India's Digital Personal Data Protection Act
2. **COPPA Compliance** - No verifiable parental consent mechanism
3. **Camera Consent Flow** - Need explicit consent for camera processing
4. **Data Flow Audit** - What's sent to server vs. stays on device

**Questions to Answer:**
- What "verifiable parental consent" mechanism is legally sufficient?
- Do we need a Data Protection Officer (DPO)?
- What in-app privacy disclosures are required?
- Google Play "Designed for Families" requirements?

**Deliverables Needed:**
- [ ] Compliance checklist
- [ ] In-app consent flow design
- [ ] Data flow architecture diagram
- [ ] Privacy policy (child-specific)

---

### 🔴 P0: Curriculum Alignment (BLOCKS B2B SALES)

**Document:** `docs/research/RESEARCH_TOPICS_CONSOLIDATED_2026-03-05.md` (R-003)

**Issue:** No mapping of games to recognized learning frameworks
**Impact:** 
- Schools won't adopt without curriculum alignment
- Parents can't see educational value
- "Fun app" vs. "learning platform" credibility gap

**Research Needed:**
1. NCERT Early Childhood Care and Education (ECCE) framework mapping
2. CBSE learning outcomes for ages 3-8
3. Measurable learning outcomes per game
4. Pre-literate assessment methodology (no quizzes)

**Deliverables:**
- [ ] Curriculum alignment matrix
- [ ] Per-game learning outcomes
- [ ] Session length recommendations by age
- [ ] Educator endorsement strategy

---

### 🟡 P1: Accessibility for Kids with Disabilities

**Document:** `docs/research/RESEARCH_TOPICS_CONSOLIDATED_2026-03-05.md` (R-004)

**Gaps:**
- No WCAG guidelines interpretation for camera-based kids' apps
- No alternative input modes (eye tracking, switch access)
- No "Low-Stimulation / ASD Mode" design guidelines
- No accommodation for motor impairments

**Research Questions:**
1. How to accommodate motor impairments with hand-gesture input?
2. What's feasible for eye-tracking in-browser (WebGazer.js)?
3. What does ASD mode mean in UX terms (colors, sounds, pacing)?

---

### 🟡 P1: Sound Design Pipeline

**Document:** `docs/research/RESEARCH_TOPICS_CONSOLIDATED_2026-03-05.md` (R-005)

**Gap:** ~500+ sound effects needed across 20+ games, no production pipeline

**Open Questions:**
1. AI-generated music (Suno, Udio) licensing for kids' apps?
2. Procedural audio via Web Audio API feasibility?
3. Audio compression settings for bundle size?
4. Multi-language audio strategy?

---

### 🟡 P1: Parent Dashboard & Progress Reporting

**Document:** `docs/research/RESEARCH_TOPICS_CONSOLIDATED_2026-03-05.md` (R-007)

**Gap:** No parent-facing progress visualization beyond raw session counts

**Questions:**
1. What do Indian parents want to see about their child's learning?
2. How to communicate learning value vs. time spent?
3. Weekly email digest format?

---

### 🟡 P2: Localization Pipeline

**Document:** `docs/research/RESEARCH_TOPICS_CONSOLIDATED_2026-03-05.md` (R-009)

**Current State:** EN/HI/KN supported but no scalable process
**Gap:** Flag icons are placeholders, no translation management tool

---

### 🟡 P2: Analytics Strategy

**Document:** `docs/research/RESEARCH_TOPICS_CONSOLIDATED_2026-03-05.md` (R-010)

**Gap:** Unified Analytics SDK built but no defined *what to measure*

**Questions:**
1. What are the 10 most important metrics for kids' learning app?
2. How to measure learning vs. engagement vs. addiction?
3. How to A/B test ethically with children?

---

## Part 5: Future Game Ideas (Backlog)

### High-Priority Categories

From `docs/research/AREAS_TO_EXPLORE_BACKLOG_2026-03-03.md`:

#### 1. Exploration Sandboxes (Highest Leverage)
- Physics Playground
- Sink or Float
- States of Matter
- Simple Machines

#### 2. Life Skills (Parent-Valued)
- Brush Teeth with Pip
- Wash Hands Dance
- Shoelace Simulator
- Dress for Weather (already exists, could expand)

#### 3. Movement Games (High Replay)
- Obstacle Course
- Follow the Leader
- Musical Statues
- Balloon Pop Fitness (already exists)

#### 4. Creative Modes (Open-Ended)
- Sound Garden
- Light Painter
- Comic Book Creator
- Drawings Come Alive

### Full Backlog Count
| Category | Count |
|----------|-------|
| Physics/Sandbox | 8 |
| Physical Movement | 8 |
| Collaborative/Social | 9 |
| Seasonal/Thematic | 10 |
| Multisensory | 8 |
| Life Skills | 13 |
| Culture/Heritage | 10 |
| Mindfulness/Emotional | 8 |
| Voice/Audio | 4 |
| Math/Logic | 15 |
| Science/Nature | 11 |
| Creative Arts | 15 |
| Advanced/Platform | 14 |
| **TOTAL** | **~150** |

---

## Part 6: Infrastructure & Technical Debt

### Known Issues

| Issue | Location | Severity |
|-------|----------|----------|
| Physics playground failing tests | `tests/` | Pre-existing, not blocking |
| TypeScript errors in unrelated files | Various | Pre-existing, not blocking |
| Test files missing type definitions | `accessibilityVerifier.test.ts` | Non-critical |

### Monitoring Gaps

1. **No Error Monitoring** - Sentry/Rollbar not integrated
2. **No Performance Monitoring** - Web Vitals not tracked
3. **No Analytics Dashboard** - Data collected but not visualized
4. **No Uptime Monitoring** - No Pingdom/Statuspage

---

## Recommendations

### Immediate (This Week)

1. **Fix AI Generator Stubs** - Either integrate LLM or remove feature flags
2. **Start Privacy Compliance Research** - Blocks public launch
3. **Audit Similar Stability Issues** - Check gesture-hold games

### Short-Term (Next 2 Weeks)

1. **Curriculum Alignment Research** - Required for B2B sales
2. **TTS Queue Bug Root Cause** - Proper fix vs. workaround
3. **Language Flag Icons** - Quick cultural fix

### Medium-Term (Next Month)

1. **Accessibility Research** - Required for inclusive design claim
2. **Sound Design Pipeline** - Required for 500+ SFX
3. **Parent Dashboard Design** - Key for retention

### Long-Term (Next Quarter)

1. **Localization Pipeline** - Scale beyond 3 languages
2. **Analytics Strategy** - Define what to measure
3. **Next 3 Game Implementations** - From backlog categories

---

## Appendix: Evidence Sources

| Document | Purpose |
|----------|---------|
| `ERROR_HANDLING_REVIEW.md` | Error handling status |
| `GAME_LOGICAL_FINDINGS_AND_RESEARCH_2026-02-23.md` | Prior game analysis |
| `AREAS_TO_EXPLORE_BACKLOG_2026-03-03.md` | Future game ideas |
| `RESEARCH_TOPICS_CONSOLIDATED_2026-03-05.md` | Open research areas |
| `docs/audit/error_handling_recovery_audit.md` | Error handling audit |
| `docs/fixes/finger-number-success-detection-fix.md` | Prior bug fixes |
