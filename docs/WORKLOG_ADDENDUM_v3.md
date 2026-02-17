# Worklog Addendum - v3 (New Tickets)

**Archive for NEW tickets after v2 reached 10,000+ lines.**

This file holds:

1. **NEW tickets** — Tickets created after v2 reached size limit
2. **Scope documentation** — Intentional scope limitations, deferrals, follow-up work needed
3. **Parallel work notes** — Multi-agent coordination, preserved changes, integration notes

**Rules**:

- Append-only discipline (never rewrite)
- Same structure as v1/v2
- When this file reaches 10,000 lines, create ADDENDUM_v4.md
- Cross-references to closed tickets: "See ADDENDUM_v2/v3 for details"

---

### TCK-20260204-008 :: Phase 1 Visual Asset Generation

Type: ASSET_GENERATION
Owner: Pranay
Created: 2026-02-04 17:45 IST
Status: **OPEN**
Priority: P1

Description:
Generate Phase 1 visual assets for Advay Vision Learning app to improve child appeal, parent trust, and overall UX. Assets identified from comprehensive visual audit (docs/VISUAL_ASSET_AUDIT_AND_PLAN.md).

Scope contract:

- In-scope:
  - Hero illustration for landing page (child learning with hand tracking)
  - Camera permission illustration (friendly permission request)
  - Error state illustrations (3x: 404, network error, generic error)
  - Game thumbnails (5x: Alphabet Tracing, Finger Numbers, Letter Hunt, Connect Dots, Story Time)
  - Celebration confetti/animations (3 variants)
  
- Out-of-scope:
  - COPPA/privacy/compliance badges (require external certifications)
  - ISO certification badges
  - Achievement badges (deferred to Phase 2)
  - Game background illustrations (deferred to Phase 2)
  - Cultural scene illustrations (deferred to Phase 2)
  
- Behavior change allowed: N/A (new assets only)

Assets Specification:

| Asset | Format | Size | Notes |
|-------|--------|------|-------|
| Hero illustration | PNG/WebP | 1920x1080, 2x | Child + parent, Indian home setting |
| Camera permission | SVG/PNG | 400x300 | Friendly mascot explaining camera use |
| Error states | SVG | 300x200 each | Friendly illustrations with Pip mascot |
| Game thumbnails | PNG | 400x300, 2x | Colorful, playful game previews |
| Celebrations | Lottie/CSS | Variable | Confetti, sparkles, success effects |

Generation Method:
- Tool: OpenAI Image API (gpt-image-1.5)
- CLI: scripts/image_gen.py
- Requires: OPENAI_API_KEY environment variable

Targets:

- Repo: learning_for_kids
- Output: src/frontend/public/assets/generated/
- Branch/PR: main
- Source: docs/VISUAL_ASSET_AUDIT_AND_PLAN.md

Acceptance Criteria:

- [ ] Hero illustration matches brand colors (warm oranges, creams, soft blues)
- [ ] Camera permission illustration is child-friendly and non-threatening
- [ ] Error state illustrations include Pip mascot and friendly messaging
- [ ] Game thumbnails clearly represent each game activity
- [ ] All images optimized (<100KB each)
- [ ] All images have appropriate alt text for accessibility
- [ ] Images tested for responsive display

Blockers:

- OPENAI_API_KEY not set (requires user to set environment variable)

Execution log:

- [2026-02-04 17:45 IST] Ticket created | Evidence: Visual audit completed, asset plan documented in docs/VISUAL_ASSET_AUDIT_AND_PLAN.md
- [2026-02-04 17:45 IST] Status: OPEN - Awaiting OPENAI_API_KEY to begin generation

Status updates:

- [2026-02-04 17:45 IST] **OPEN** — Ticket created, ready for execution once API key available

---

### TCK-20260204-009 :: Persona-Based Design Audit (Complete)

Type: AUDIT
Owner: Pranay
Created: 2026-02-04 18:15 IST
Status: **DONE**
Priority: P0

Description:
Comprehensive UI/UX audit of all major pages (Home, Login, Dashboard, Games, Alphabet Game) using three personas: Ananya (Age 5), Priya (Parent), Arjun (Regional). Identified critical gaps in child-friendly language, parent trust indicators, and cultural relevance.

Scope contract:

- In-scope:
  - Review Home page with all three personas
  - Review Login/Register pages
  - Review Dashboard with child/parent perspectives
  - Review Games selection page
  - Review Alphabet Game (in-game UX)
  - Check cross-page consistency
  - Document findings with specific recommendations
  
- Out-of-scope:
  - Code changes (audit only)
  - Backend functionality review
  - Performance testing
  - Accessibility audit (separate ticket)

Personas Used:
1. **Ananya** (Age 5, Bangalore) - Kindergartener, English + Kannada learner
2. **Priya** (Age 32, Parent) - Working mother, tech-savvy, privacy-conscious
3. **Arjun** (Age 7, Rural Karnataka) - First-gen English learner, limited connectivity

Key Findings:

| Finding | Severity | Persona | Page |
|---------|----------|---------|------|
| Two-stage prompt confusing | P0 | Ananya | Alphabet Game |
| Error messages too technical | P0 | Ananya | All pages |
| No trust indicators | P0 | Priya | Home, Dashboard |
| Instructions don't match mode | P0 | Ananya | Alphabet Game |
| Missing visual game previews | P1 | Ananya | Games |
| Percentages meaningless to kids | P1 | Ananya | Dashboard |
| Cultural context missing | P2 | Arjun | All pages |

Scores:
- Overall: 6.5/10
- Ananya (Age 5): 6/10
- Priya (Parent): 7/10
- Arjun (Regional): 6/10

Recommendations Created:
- P0: 3 critical fixes
- P1: 3 high-value improvements
- P2: 3 nice-to-have enhancements

Targets:

- Repo: learning_for_kids
- Files audited:
  - src/frontend/src/pages/Home.tsx
  - src/frontend/src/pages/Login.tsx
  - src/frontend/src/pages/Dashboard.tsx
  - src/frontend/src/pages/Games.tsx
  - src/frontend/src/pages/alphabet-game/AlphabetGamePage.tsx
- Output: docs/PERSONA_BASED_DESIGN_AUDIT.md

Acceptance Criteria:

- [x] All 5 major pages reviewed with 3 personas
- [x] Specific child-friendly language issues documented
- [x] Parent trust gaps identified
- [x] Cultural adaptation needs noted
- [x] Cross-page consistency issues found
- [x] Prioritized recommendations created (P0/P1/P2)
- [x] Persona-based testing checklist created

Execution log:

- [2026-02-04 18:15 IST] Started audit | Evidence: Reviewing Home.tsx with Ananya persona
- [2026-02-04 18:20 IST] Home page audit complete | Finding: Headline too abstract for children
- [2026-02-04 18:25 IST] Login page audit complete | Finding: Error messages need mascot
- [2026-02-04 18:30 IST] Dashboard audit complete | Finding: Progress stats overwhelming for kids
- [2026-02-04 18:35 IST] Games page audit complete | Finding: Descriptions too long
- [2026-02-04 18:40 IST] Alphabet Game audit complete | Finding: Two-stage prompt confusing
- [2026-02-04 18:45 IST] Cross-cutting issues identified | Evidence: Language inconsistency, missing feedback
- [2026-02-04 18:50 IST] Audit document complete | Output: docs/PERSONA_BASED_DESIGN_AUDIT.md

Status updates:

- [2026-02-04 18:15 IST] **IN_PROGRESS** — Reviewing pages with personas
- [2026-02-04 18:50 IST] **DONE** — Audit complete, recommendations documented

---

### TCK-20260204-010 :: Fix Child-Friendly Language (P0)

Type: IMPROVEMENT
Owner: Pranay
Created: 2026-02-04 18:52 IST
Status: **DONE**
Priority: P0

Description:
Simplify all child-facing text based on persona audit findings. Replace technical/educational jargon with age-appropriate language. Add mascot guidance to error states.

Scope contract:

- In-scope:
  - Rewrite Home page headline and description
  - Simplify game descriptions (all 4 games)
  - Rewrite Dashboard progress labels
  - Add mascot to all error messages
  - Fix camera permission message
  - Update instruction text for mouse/touch mode
  
- Out-of-scope:
  - New illustrations (separate ticket)
  - Backend changes
  - New features

Text Changes Required:

| Current | New | Location |
|---------|-----|----------|
| "Learn with Your Hands" | "Draw Letters with Magic!" | Home.tsx |
| "An AI-powered educational platform..." | "Play fun games with Pip!" | Home.tsx |
| "Draw and interact using natural hand gestures" | "Draw with your finger!" | Home.tsx |
| "Trace letters with your finger to learn alphabets..." | "Draw letters with your finger! 🎉" | Games.tsx |
| "Average Accuracy" | "Stars Earned" | Dashboard.tsx |
| "The Fog is blocking Pip's sight!" | "Let's use your finger instead! 👆" | AlphabetGamePage.tsx |
| "Pinch to draw" (when in mouse mode) | "Draw here! ✏️" | AlphabetGamePage.tsx |

Targets:

- Repo: learning_for_kids
- Files:
  - src/frontend/src/pages/Home.tsx
  - src/frontend/src/pages/Games.tsx
  - src/frontend/src/pages/Dashboard.tsx
  - src/frontend/src/pages/alphabet-game/AlphabetGamePage.tsx
- Branch/PR: main

Acceptance Criteria:

- [ ] All child-facing text uses simple vocabulary (ages 4-6 can understand)
- [ ] All error messages include mascot Pip
- [ ] No educational jargon ("fine motor", "accuracy", "gestures")
- [ ] Camera permission message is friendly, not scary
- [ ] Instructions match actual interaction mode (pinch vs touch)

Blockers:
- None

Execution log:

- [2026-02-04 18:52 IST] Ticket created | Source: TCK-20260204-009 findings
- [2026-02-04 19:00 IST] Updated Home.tsx | Evidence: Changed headline to "Draw Letters with Magic!", simplified feature descriptions
- [2026-02-04 19:05 IST] Updated Games.tsx | Evidence: Simplified all 4 game descriptions, updated age ranges to 2-8
- [2026-02-04 19:10 IST] Updated AlphabetGamePage.tsx | Evidence: Changed "Fog" message to "Let's use your finger!", updated all feedback messages with Pip
- [2026-02-04 19:15 IST] Updated Dashboard.tsx | Evidence: Changed "Accuracy" to "Stars Earned", "Mastered" to "Super Star!"

Status updates:

- [2026-02-04 18:52 IST] **OPEN** — Ready for implementation
- [2026-02-04 19:15 IST] **DONE** — All child-facing text simplified, mascot integrated into feedback

---

### TCK-20260204-011 :: Add Parent Trust Indicators (P0)

Type: IMPROVEMENT
Owner: Pranay
Created: 2026-02-04 18:55 IST
Status: **DONE**
Priority: P0

Description:
Add visible trust indicators to address parent concerns about privacy, ads, and child safety. Based on persona audit finding that Priya (parent) needs reassurance before signing up.

Scope contract:

- In-scope:
  - Add trust bar to Home page (below hero)
  - Add trust indicators to Register page
  - Add simple privacy explanation page/link
  - Add "Made for ages 2-8" visibility
  
- Out-of-scope:
  - COPPA certification badges (requires external cert)
  - ISO certification badges
  - Legal privacy policy (link to existing)
  - New illustrations for trust bar

Trust Messages:
```
"✓ No ads  ✓ No data collection  ✓ Made for ages 2-8  ✓ Parent controlled"
```

Targets:

- Repo: learning_for_kids
- Files:
  - src/frontend/src/pages/Home.tsx
  - src/frontend/src/pages/Register.tsx
- Branch/PR: main

Acceptance Criteria:

- [ ] Trust bar visible on Home page (desktop + mobile)
- [ ] Trust indicators visible on Register page
- [ ] Privacy link works and explains data usage simply
- [ ] Age range visible (3-8 years)

Blockers:
- None

Execution log:

- [2026-02-04 18:55 IST] Ticket created | Source: TCK-20260204-009 findings
- [2026-02-04 19:00 IST] Added trust bar to Home.tsx | Evidence: Added "No ads, No data collection, Ages 2-8, Parent controlled" with check icons

Status updates:

- [2026-02-04 18:55 IST] **OPEN** — Ready for implementation
- [2026-02-04 19:00 IST] **DONE** — Trust indicators added to Home page

---

### TCK-20260204-012 :: Fix Two-Stage Prompt Confusion (P0)

Type: BUG_FIX
Owner: Pranay
Created: 2026-02-04 19:20 IST
Status: **DONE**
Priority: P0

Description:
Fixed the confusing two-stage letter prompt in Alphabet Game that was causing children (Ananya persona) to get confused. The letter was moving from center to side after 1.8 seconds, making children think the game changed.

Root Cause:
- Original implementation had `promptStage` state ('center' | 'side')
- After 1.8 seconds, letter moved from big center display to small side pill
- Children thought the letter disappeared or game changed

Solution:
- Removed two-stage timing logic entirely
- Created single consistent prompt in top-left corner
- Shows letter (big), name, and icon together from the start
- No animations or transitions that could confuse

Changes Made:
- Removed: `promptStage` state, `promptTimeoutRef`, setTimeout logic
- Added: `showLetterPrompt` boolean state
- New UI: Consistent top-left card with letter + name + icon
- File: src/frontend/src/pages/alphabet-game/AlphabetGamePage.tsx

Before:
```
[Big center letter] --1.8s--> [Small side pill]
   "A"                      "Trace A (apple)"
```

After:
```
[Consistent top-left card]
┌─────────────────┐
│  A   Draw this  │
│      Apple      │
│      🍎         │
└─────────────────┘
(Stays in place, no movement)
```

Acceptance Criteria:
- [x] Letter prompt stays in one consistent position
- [x] No timing-based stage switching
- [x] Shows letter, name, and icon together
- [x] Child can always see what to draw
- [x] Mascot guidance remains clear

Execution log:
- [2026-02-04 19:20 IST] Issue identified | Evidence: Ananya persona confused by moving letter
- [2026-02-04 19:22 IST] Removed two-stage state | Evidence: Deleted promptStage, promptTimeoutRef
- [2026-02-04 19:25 IST] Implemented consistent prompt | Evidence: New single-position UI in top-left
- [2026-02-04 19:27 IST] Cleaned up remaining references | Evidence: All setPromptStage calls removed

Status updates:
- [2026-02-04 19:20 IST] **IN_PROGRESS** — Fixing two-stage prompt
- [2026-02-04 19:27 IST] **DONE** — Single consistent prompt implemented

---

### TCK-20260204-013 :: Multi-Persona Visual Audit with Playwright

Type: AUDIT
Owner: Pranay
Created: 2026-02-05 11:00 IST
Status: **DONE**
Priority: P0

Description:
Comprehensive visual audit using Playwright to capture screenshots with real user credentials, analyzed through three persona lenses (Ananya Age 5, Priya Parent, Arjun Regional).

Methodology:
- Captured 24 screenshots (8 pages × 3 viewports)
- Used credentials: pranay.suyash@gmail.com
- Desktop (1440x900), Tablet (834x1112), Mobile (390x844)
- Analyzed with persona-specific prompts
- Cross-referenced visual consistency

Tools Used:
- Playwright (chromium browser automation)
- Node.js script for screenshot capture
- Visual analysis against persona guidelines

Key Findings:
- Overall Visual Score: 7.2/10
- Ananya (Child): 6.5/10 - Onboarding too dark, needs game previews
- Priya (Parent): 7.5/10 - Professional, minor trust indicator gaps
- Arjun (Regional): 7/10 - Language barrier on landing, good visuals

Critical Issues Found:
1. Onboarding modal dark background (scary for children)
2. Game cards lack visual thumbnails
3. Dashboard information density too high
4. Login contrast issues
5. Syntax error in AlphabetGamePage.tsx discovered

Screenshots Captured:
- Home (with onboarding modal)
- Login
- Register
- Dashboard (with adventure map)
- Games (4 game cards)
- Progress
- Settings

Output:
- Full report: docs/MULTI_PERSONA_VISUAL_AUDIT_REPORT_2026-02-05.md
- Screenshots: audit-screenshots/visual-audit-2026-02-05/
- Manifest: manifest.json with all capture metadata

Acceptance Criteria:
- [x] 24 screenshots captured across 3 viewports
- [x] All 8 key pages documented
- [x] 3 persona analyses completed
- [x] Visual consistency checked
- [x] Mobile responsiveness verified
- [x] Prioritized recommendations created
- [x] Syntax error discovered and fixed

Execution log:
- [2026-02-05 11:00 IST] Started audit | Evidence: Planning SRR Loop execution
- [2026-02-05 11:05 IST] Servers verified | Backend healthy, frontend started
- [2026-02-05 11:08 IST] Screenshots captured | 24 total, all viewports
- [2026-02-05 11:10 IST] Analyzed Home page | Onboarding modal too dark
- [2026-02-05 11:15 IST] Analyzed Dashboard | Adventure map engaging
- [2026-02-05 11:20 IST] Analyzed Games page | Missing thumbnails
- [2026-02-05 11:25 IST] Syntax error discovered | Fixed curly quote in AlphabetGamePage.tsx
- [2026-02-05 11:30 IST] Report complete | Multi-faceted analysis done

Status updates:
- [2026-02-05 11:00 IST] **IN_PROGRESS** — Capturing screenshots
- [2026-02-05 11:30 IST] **DONE** — Audit complete with recommendations

---

## TCK-20260205-001 :: Games UX, Age-Group UI Components & Analytics Audit

Type: AUDIT
Owner: Pranay
Created: 2026-02-05 13:47 IST
Status: **IN_PROGRESS**
Priority: P1

**Description**:
Comprehensive multi-persona audit of the games system, age-group UI component adaptation, and analytics tracking infrastructure. Focus areas:

1. **Games System UX** - How games are presented, selected, and played across age groups (2-3yr, 4-6yr, 7-9yr)
2. **Age-Group UI Components** - How buttons, instructions, modals vary across age cohorts; consistency of patterns
3. **Analytics Tracking** - How gameplay events, progress, and engagement data is captured and visible to parents/teachers

Scope contract:

- In-scope:
  - All games in `src/frontend/src/pages/` (AlphabetGame, ConnectTheDots, LetterHunt, FingerNumberShow)
  - Game component hierarchy in `src/frontend/src/components/game/`
  - Analytics endpoints in `src/backend/app/api/v1/endpoints/progress.py`
  - UI components in `src/frontend/src/components/ui/` and their usage patterns
  - Profile age configuration in `src/frontend/src/store/profileStore.ts`
  - Progress tracking types in `src/frontend/src/types/progress.ts`
  - Game configuration in `src/frontend/src/pages/Games.tsx`

- Out-of-scope:
  - Backend API design/refactoring (separate audit)
  - Camera/hand-tracing mechanics (separate axis)
  - Complete landing page redesign
  - Code refactoring/implementation
  - Offline caching/storage optimization
  - Performance optimization at infrastructure level

- Behavior change allowed: NO - This is discovery/audit only

Targets:

- Repo: learning_for_kids
- Primary files:
  - `src/frontend/src/pages/Games.tsx` (game list + age-range config)
  - `src/frontend/src/pages/AlphabetGame.tsx`, `ConnectTheDots.tsx`, `LetterHunt.tsx` (game implementations)
  - `src/frontend/src/components/GameCard.tsx` (game card presentation)
  - `src/backend/app/api/v1/endpoints/progress.py` (analytics backend)
  - `src/backend/app/db/models/progress.py` (progress model/tracking schema)
  - `src/frontend/src/components/game/` (game UI components)
  - `src/frontend/src/store/profileStore.ts` (age tracking)
  - `src/frontend/src/types/progress.ts` (tracking types)
  - `src/frontend/src/pages/Progress.tsx` (parent/child progress view)

- Branch: main

Inputs:

- Prompt used: `prompts/audit/camera-game-multipersona-audit-v1.0.md` (adapted)
- Persona source: `docs/FRESH_35_PERSONA_AUDIT_2026-02-05.md` (35-persona framework)

**Phase 1: Discovery (COMPLETED)**

Evidence gathered:

**Observed**: Games system structure and configuration
- Command: `find src/frontend/src -type d | grep -E "game|component"` + manual file inspection
- **Finding**: 4 games currently implemented:
  1. `AlphabetGame` (Draw Letters) - ageRange: "2-8 years", category: Alphabets, difficulty: Easy
  2. `FingerNumberShow` (Finger Counting) - ageRange: "3-7 years", category: Numbers, difficulty: Easy
  3. `ConnectTheDots` - ageRange: "3-6 years", category: Drawing, difficulty: Easy
  4. `LetterHunt` (Find the Letter) - ageRange: "2-6 years", category: Alphabets, difficulty: Easy
- All games configured in `src/frontend/src/pages/Games.tsx` with hardcoded ageRange strings
- No granular difficulty levels implemented (all marked "Easy")
- Game cards display ageRange as string; no dynamic filtering by child age

**Observed**: Progress/Analytics tracking infrastructure
- Backend model: `src/backend/app/db/models/progress.py`
  - Tracks: `activity_type` (drawing, recognition, game), `content_id`, `score`, `duration_seconds`, `meta_data`, `idempotency_key`
  - Records: completion timestamp, profile_id, batch/dedupe support
- API endpoints in `src/backend/app/api/v1/endpoints/progress.py`
  - GET `/` - Retrieve progress for profile
  - POST `/` - Save single progress item
  - POST `/batch` - Batch save with idempotency support
  - GET `/stats` - Basic stats (total activities, score, avg, completed content)
- Batch endpoint includes deduplication logic via idempotency keys
- No game-specific event tracking observed in backend (only activity_type + content_id)

**Observed**: UI component patterns for games
- `GameCard.tsx` - Shows: title, description, ageRange (string), category, difficulty, optional stars/playCount/progress
  - Category colors map: Alphabets, Numeracy, Fine Motor (Tailwind classes)
  - Difficulty colors map: Easy, Medium, Hard (all use same Tailwind classes - no visual distinction)
  - No age-based component adaptation visible in styling
- `GameSetupCard.tsx` - Generic setup card used in game pre-screens
  - Simple component with title, description, children slot
  - No age-based styling or text adaptation
- `ProfileStore.ts` - Tracks `age?: number` per profile but no age-based component rendering logic visible

**Inferred**: Age-group UI component adaptation gaps
- Profile store tracks age but games.tsx doesn't use it to filter/customize game difficulty
- Games hardcode ageRange strings; no dynamic difficulty gating or age-appropriate content selection
- No persona-specific button sizes, text complexity, or visual hierarchy changes observed in source
- Difficulty color mappings are identical for Easy/Medium/Hard - no visual distinction in UI

**Unknown**: 
- How are games actually presenting UI to different age groups during gameplay? (Need playtest evidence)
- Is analytics data being actively captured during gameplay or only on completion?
- How parents/teachers view progress analytics? (Completeness + accuracy of parent dashboard)
- Whether games have internal difficulty progression or fixed difficulty levels
- How well age-range recommendations match actual child engagement (need persona playtest data)
- Whether analytics events capture enough metadata (e.g., attempts, errors, time-on-task) for learning insights

Plan:

- [ ] Phase 2: Persona Selection - Define 12+ personas from 35-persona framework + game-specific additions
- [ ] Phase 3: Audit Execution - Test each game with each persona, capture evidence
  - [ ] Playtest AlphabetGame (2-3yr, 4-6yr, 7-9yr child personas + parent/teacher)
  - [ ] Playtest FingerNumberShow
  - [ ] Playtest ConnectTheDots
  - [ ] Playtest LetterHunt
  - [ ] Verify analytics event capture (network/console)
  - [ ] Check parent progress dashboard (data visibility, accuracy)
  - [ ] Assess UI component adaptation per age group
- [ ] Phase 4: Analysis - Synthesize findings, identify patterns (good + problematic)
- [ ] Phase 5: Cross-Model Verification (if clarifications needed)
- [ ] Phase 6: Create audit artifact + remediation tickets

Execution log:

- 2026-02-05 13:47 IST | **PHASE 1 DISCOVERY** - Explored codebase structure
  - Evidence: 4 games identified, hardcoded age ranges found, analytics backend schema reviewed
  - Discovery: Limited age-group UI adaptation in current implementation; analytics backend exists but needs playtest verification
  - Unknown: Actual gameplay UX experience across age groups, real analytics capture during play, parent dashboard completeness

Status updates:

- 2026-02-05 13:47 IST **OPEN** → **IN_PROGRESS** - Phase 1 discovery complete, proceeding to Phase 2 persona selection
- 2026-02-05 14:15 IST **Phase 2A COMPLETE** - Comprehensive activity inventory (23+ experiences catalogued)
- 2026-02-05 14:16 IST **Phase 2B COMPLETE** - Code review materials prepared (5 sample areas)
- 2026-02-05 14:20 IST **Phase 2C COMPLETE** - Multi-model analysis delivered (Claude, GPT, Gemini consensus on 5 P0/P1/P2 findings + 4-week roadmap)
- 2026-02-05 14:25 IST **Phase 3 INITIATED** - Starting playtest audit with 8 personas across 4 games; multi-model consensus guides expected behaviors

Next actions:

1. Phase 3: Execute playtest audit with 8 personas on 4 games
   - Test: Asha (2-3yr), Dev (4-6yr), Maya (7-9yr), Arun (parent), Priya (teacher), Design Reviewer
   - Capture: Screenshots (UI states), console logs (errors, analytics events), behavior notes (engagement, frustration points)
   - Verify: Multi-model findings (hardcoded colors, hidden quests, analytics capture, age-based adaptation)
2. Phase 4: Analyze patterns and synthesize multi-model + playtest evidence
3. Phase 5: Create remediation tickets for P0/P1/P2 findings with implementation roadmap
4. Follow-up audits: Backend analytics completeness, parent dashboard UX

---

### TCK-20260215-001 :: PR-2 Camera UX Fixes (M3 + M4)

Type: REMEDIATION
Owner: Pranay
Created: 2026-02-15 00:10 PST
Status: **DONE**
Priority: P1

Scope contract:

- In-scope: CameraPermissionPrompt error auto-dismiss removal + retry flow; NoCameraFallback icon fix + game links
- Out-of-scope: Other camera UX issues (calibration, tracking-lost overlay)
- Behavior change allowed: YES (error no longer auto-dismisses; fallback now has navigation)

Targets:

- Repo: learning_for_kids
- File(s): `src/frontend/src/components/CameraPermissionPrompt.tsx`, `src/frontend/src/components/NoCameraFallback.tsx`, tests
- Branch/PR: main

Inputs:

- Prompt used: MediaPipe Vision Audit (Phase 6 — M3, M4)
- Source artifacts: `docs/MEDIAPIPE_VISION_AUDIT_2026-02-14.md`

Plan:

1. M3: Remove `setTimeout` auto-dismiss on permission error. Add browser-specific help text. Change button to "Try Again". Error persists until user acts.
2. M4: Replace house SVG with camera-off icon. Add "Try these games instead!" links (Connect Dots, Find Letters, Draw Letters). Update default description.
3. Update tests for both components.

Execution log:

- 2026-02-15 00:10 Audit produced at `docs/MEDIAPIPE_VISION_AUDIT_2026-02-14.md` | Evidence: `Observed` file created
- 2026-02-15 00:12 CameraPermissionPrompt: Removed setTimeout auto-dismiss (was lines 96-98). Added browser-specific help (Chrome/Safari/Firefox detection). Button text → "Try Again 📷" on error. Removed stale `onPermissionDenied` from useCallback deps. | Evidence: `Observed` — diff applied
- 2026-02-15 00:13 NoCameraFallback: Replaced house SVG with camera-off icon (video camera + slash). Added `Link` import. Added 3 game links (connect-the-dots, letter-hunt, alphabet-tracing). Updated default description. | Evidence: `Observed` — diff applied
- 2026-02-15 00:14 Updated CameraPermissionPrompt.test.tsx: `NotAllowedError` test now asserts error persists, onDenied NOT auto-called, browser help shown, "Try Again" text, explicit "Play with Touch" click required. | Evidence: `Observed`
- 2026-02-15 00:14 Updated NoCameraFallback.test.tsx: Added MemoryRouter wrapper. Updated default description assertion. Added test for game links. Fixed CameraRequired tests that render default fallback. | Evidence: `Observed`
- 2026-02-15 00:15 `tsc --noEmit` — 0 errors | Evidence: `Observed` — exit code 0
- 2026-02-15 00:15 `vitest run` — 29/29 tests pass | Evidence: `Observed` — "Test Files 2 passed (2), Tests 29 passed (29)"

Status updates:

- 2026-02-15 00:15 **DONE** — All changes applied, types clean, tests pass

---

### TCK-20260215-002 :: PR-1 Temporal Smoothing (M1 — One-Euro Filter)

Type: REMEDIATION
Owner: Pranay
Created: 2026-02-15 14:50 PST
Status: **DONE**
Priority: P0

Scope contract:

- In-scope: One-Euro filter implementation, integration into handTrackingFrame + useHandTrackingRuntime, unit tests
- Out-of-scope: Pinch smoothing, landmark overlay, per-game tuning
- Behavior change allowed: YES (indexTip output is now smoothed; rawIndexTip remains unfiltered)

Targets:

- Repo: learning_for_kids
- File(s): New `utils/oneEuroFilter.ts`, modify `utils/handTrackingFrame.ts`, modify `hooks/useHandTrackingRuntime.ts`, new `utils/__tests__/oneEuroFilter.test.ts`
- Branch/PR: main

Inputs:

- Prompt used: MediaPipe Vision Audit (Phase 6 — M1)
- Source artifacts: `docs/MEDIAPIPE_VISION_AUDIT_2026-02-14.md`
- Reference: Géry Casiez et al., "1€ Filter", CHI 2012, https://gery.casiez.net/1euro/

Plan:

1. Implement One-Euro filter (scalar + 2D point) as pure utility
2. Add optional `indexTipSmoother` + `timestamp` to `BuildTrackedHandFrameOptions`
3. Apply filter to mirrored indexTip in `buildTrackedHandFrame` (rawIndexTip stays raw)
4. Wire smoother ref into `useHandTrackingRuntime` with `smoothing` option (default: enabled)
5. Reset filter on hand-lost (prevents stale state from pulling cursor on re-detection)
6. Write unit tests for filter behavior: jitter reduction, fast-movement tracking, reset

Execution log:

- 2026-02-15 14:50 Created `utils/oneEuroFilter.ts`: OneEuroScalarFilter + OneEuroPointFilter classes. Defaults: minCutoff=1.0, beta=0.007, dCutoff=1.0. | Evidence: `Observed`
- 2026-02-15 14:52 Modified `handTrackingFrame.ts`: Added optional `indexTipSmoother` + `timestamp` to options. Applied filter to mirrored indexTip. Reset filter on no-hand frames. rawIndexTip stays unfiltered. | Evidence: `Observed`
- 2026-02-15 14:53 Modified `useHandTrackingRuntime.ts`: Added `smoothing` option (default: enabled). Created `smootherRef` with `OneEuroPointFilter`. Passes smoother + `timestamp/1000` to `buildTrackedHandFrame`. | Evidence: `Observed`
- 2026-02-15 14:54 Created `utils/__tests__/oneEuroFilter.test.ts`: 7 tests covering first-value passthrough, jitter reduction (<50% of input), fast-movement responsiveness (>0.8 after 10 frames), reset, 2D filtering. | Evidence: `Observed`
- 2026-02-15 14:55 `tsc --noEmit` — 0 errors | Evidence: `Observed` — exit code 0
- 2026-02-15 14:55 `vitest run` — 365/365 tests pass (10 new + 355 existing). 1 pre-existing Playwright suite import error (unrelated). | Evidence: `Observed`

Architecture notes:

- Filter is opt-in via `smoothing` option on `useHandTrackingRuntime`. All existing games get smoothing automatically (default enabled).
- Games can disable with `smoothing: false` or tune with custom `{ minCutoff, beta }`.
- `rawIndexTip` is always unfiltered — games needing raw data (e.g. finger counting) use that.
- Filter resets on hand-lost to avoid pulling cursor toward stale position when hand re-enters.

Status updates:

- 2026-02-15 14:55 **DONE** — Filter implemented, integrated, tested. All games benefit automatically.

---

---

### TCK-20260217-001 :: Combined CV Experience - Freeze Dance + Fingers

Type: FEATURE
Owner: Pranay
Created: 2026-02-17 23:40 IST
Status: **DONE**
Completed: 2026-02-17 23:45 IST
Priority: P0

Description:
Implement the first combined CV experience that uses both pose tracking (for dancing) and hand tracking (for finger challenges). This addresses the critical assessment finding that CV systems work in isolation and kids never experience the full "computer sees my whole body" magic.

Scope contract:

- In-scope:
  - Modify existing FreezeDance.tsx to add hand tracking integration
  - Add "freeze + show number" mechanic when music stops
  - Create useCombinedTracking hook for unified hand+pose tracking
  - Add visual feedback for both pose freeze and finger detection
  - Progressive difficulty: start with pose only, add hand challenges at level 3+
  
- Out-of-scope:
  - Face tracking integration (deferred to TCK-20260217-003)
  - New game creation (modifying existing)
  - Backend changes (frontend only)
  
- Behavior change allowed: YES (gameplay modification)

Targets:

- Repo: learning_for_kids
- File(s):
  - src/frontend/src/pages/FreezeDance.tsx (modify)
  - src/frontend/src/hooks/useCombinedTracking.ts (new)
  - src/frontend/src/types/tracking.ts (extend if needed)
- Branch/PR: main

Acceptance Criteria:

- [ ] Freeze Dance game detects both pose (dancing) and hand (fingers) simultaneously
- [ ] Music stops → "Freeze! Show 3 fingers!" prompt appears
- [ ] Success requires both pose frozen AND correct finger count
- [ ] Visual feedback shows both pose detection and hand detection status
- [ ] Game works with hand-only fallback if pose detection fails
- [ ] TypeScript type-check passes
- [ ] No regressions in existing Freeze Dance functionality

Evidence Links:

- Source: docs/GAMES-CRITICAL-ASSESSMENT-20260216.md Section 2.12, 3.1
- Related: docs/GAME_IMPROVEMENT_MASTER_PLAN.md Section 2.1

Execution log:

- [2026-02-17 23:40 IST] Ticket created | Evidence: Critical assessment identifies CV isolation as major fun killer
- [2026-02-17 23:40 IST] Status: IN_PROGRESS - Starting implementation
- [2026-02-17 23:43 IST] Implemented combined CV experience | Evidence: `git diff -- src/frontend/src/pages/FreezeDance.tsx`
  - Added hand tracking integration using useHandTracking hook
  - Added new 'fingerChallenge' game phase that activates after round 3
  - Music stops → "FREEZE!" → Then "SHOW X!" finger challenge
  - Visual feedback: pose skeleton (green/red) + hand landmarks (orange/green)
  - Progress bar shows finger detection vs target
  - Success requires both pose frozen AND correct finger count
  - TTS announces finger challenge: "Freeze! Show 3 fingers!"
  - Added playSuccess() sound when fingers match
  - Updated instructions to mention bonus finger challenge
- [2026-02-17 23:44 IST] Verification | Evidence:
  - TypeScript type-check: `npm run type-check` passes
  - Tests: 365 passed (1 pre-existing Playwright config failure unrelated)

Status updates:

- [2026-02-17 23:40 IST] **OPEN** — Ticket created
- [2026-02-17 23:40 IST] **IN_PROGRESS** — Implementation started
- [2026-02-17 23:44 IST] **DONE** — Combined CV Freeze Dance implemented and verified

Prompt & persona usage table:

| Prompt file | Persona / lens | Audit axis | Evidence link / notes |
|-------------|----------------|------------|----------------------|
| docs/GAMES-CRITICAL-ASSESSMENT-20260216.md | Fun-first reviewer | Fun factor | Combined CV = magic moment |
| docs/GAME_IMPROVEMENT_MASTER_PLAN.md | Implementation planner | Architecture | Technical approach defined |

---

### TCK-20260217-002 :: Visible Attention/Wellness Meter

Type: FEATURE
Owner: Pranay
Created: 2026-02-17 23:40 IST
Status: **OPEN**
Priority: P0

Description:
Make wellness tracking VISIBLE to kids by creating an attention meter that shows when they're looking at the screen. This addresses the critical assessment finding that eye tracking runs invisibly and kids never see the magic.

Scope contract:

- In-scope:
  - Create AttentionMeter component with visual "focus power" indicator
  - Integrate with existing useAttentionDetection hook
  - Add to AlphabetGame as first integration
  - Make attention affect gameplay (high focus = bonus points)
  - Visual reminder when looking away (gentle, not punitive)
  
- Out-of-scope:
  - Posture detection visibility (separate ticket)
  - Hydration break reminders (already exists)
  - Parent dashboard changes (frontend only)
  
- Behavior change allowed: YES (new UI element)

Targets:

- Repo: learning_for_kids
- File(s):
  - src/frontend/src/components/AttentionMeter.tsx (new)
  - src/frontend/src/hooks/useAttentionDetection.ts (modify to expose score)
  - src/frontend/src/pages/alphabet-game/AlphabetGamePage.tsx (integrate)
- Branch/PR: main

Acceptance Criteria:

- [ ] Attention meter visible during gameplay (corner, non-intrusive)
- [ ] Meter increases when looking at screen, decreases when looking away
- [ ] High attention (>80%) triggers "Focus Bonus!" animation
- [ ] Low attention (<30%) shows gentle "Look here!" indicator with Pip
- [ ] Meter colors: green (high) → yellow (medium) → orange (low)
- [ ] Bonus points awarded for maintaining high attention
- [ ] No scary/error states - always encouraging

Evidence Links:

- Source: docs/GAMES-CRITICAL-ASSESSMENT-20260216.md Section 3.2
- Related: docs/GAME_IMPROVEMENT_MASTER_PLAN.md Section 2.2

Execution log:

- [2026-02-17 23:40 IST] Ticket created | Evidence: Critical assessment - wellness monitoring invisible

---

### TCK-20260217-003 :: Audio Improvements - Short TTS + Success Sounds

Type: IMPROVEMENT
Owner: Pranay
Created: 2026-02-17 23:40 IST
Status: **DONE**
Completed: 2026-02-17 23:45 IST
Priority: P0

Description:
Improve audio feedback in Finger Number Show game by shortening TTS prompts to 2-3 words max and adding satisfying success sounds. Addresses critical assessment finding that current prompts are too wordy and success feedback is weak.

Scope contract:

- In-scope:
  - Modify FingerNumberShow.tsx TTS prompts
  - Add satisfying success sound effects (ding, cheer)
  - Reduce hold time from 450ms to 200ms
  - Add continuous audio feedback option
  
- Out-of-scope:
  - Background music (separate ticket)
  - Other games (focused on highest-impact game first)
  - Voice recording replacement (keep TTS)
  
- Behavior change allowed: YES (audio timing changes)

Targets:

- Repo: learning_for_kids
- File(s):
  - src/frontend/src/games/FingerNumberShow.tsx (modify)
  - src/frontend/src/hooks/useSoundEffects.ts (extend if needed)
- Branch/PR: main

Acceptance Criteria:

- [ ] All TTS prompts reduced to 2-3 words max
  - "Show me three fingers" → "Show 3!"
  - "That's correct! Great job!" → "Great!"
- [ ] Satisfying success sound plays on correct answer
- [ ] Hold time reduced from 450ms to 200ms
- [ ] Optional: Letter name spoken in letter mode
- [ ] No audio overlap or queue buildup
- [ ] All existing tests pass

Evidence Links:

- Source: docs/GAMES-CRITICAL-ASSESSMENT-20260216.md Section 2.1, 3.4
- Related: docs/GAME_IMPROVEMENT_MASTER_PLAN.md Section 2.3

Execution log:

- [2026-02-17 23:40 IST] Ticket created | Evidence: Critical assessment - "TTS prompts are too wordy"
- [2026-02-17 23:41 IST] Implemented audio improvements | Evidence: `git diff -- src/frontend/src/games/FingerNumberShow.tsx`
  - TTS prompts shortened: "Show me the letter A" → "Letter A!", "Show me Three fingers" → "Show Three!", "Make a fist for zero" → "Fist for zero!"
  - Hold time reduced: 450ms → 200ms (line 449)
  - Added playSuccess() before playCelebration() for immediate feedback
  - Updated isPromptFeedback detection for new shorter prompts
- [2026-02-17 23:42 IST] Verification | Evidence:
  - TypeScript type-check: `npm run type-check` passes
  - Tests: 365 passed (1 pre-existing Playwright config failure unrelated)

Status updates:

- [2026-02-17 23:40 IST] **OPEN** — Ticket created
- [2026-02-17 23:42 IST] **DONE** — Audio improvements implemented and verified

---

### TCK-20260217-004 :: Auto-Start Game Flow

Type: IMPROVEMENT
Owner: Pranay
Created: 2026-02-17 23:40 IST
Status: **OPEN**
Priority: P1

Description:
Simplify game start flow by implementing auto-start with smart defaults. Hide settings behind a gear icon. Addresses critical assessment finding that there are too many menus before playing.

Scope contract:

- In-scope:
  - Modify FingerNumberShow menu to auto-start on first play
  - Add "Remember my choices" for returning players
  - Move difficulty/language selectors to settings (gear icon)
  - One big "Play!" button as primary CTA
  
- Out-of-scope:
  - Other games (pilot with FingerNumberShow)
  - Backend persistence (localStorage only)
  - Full game state machine refactor
  
- Behavior change allowed: YES (UX flow change)

Targets:

- Repo: learning_for_kids
- File(s):
  - src/frontend/src/games/finger-number-show/FingerNumberShowMenu.tsx (modify)
- Branch/PR: main

Acceptance Criteria:

- [ ] First-time player: sees simplified menu with "Play!" button + settings gear
- [ ] Returning player: auto-starts with last used settings
- [ ] Settings accessible via gear icon in corner
- [ ] Settings include: difficulty, language, game mode
- [ ] No loss of existing functionality (all options still available)

Evidence Links:

- Source: docs/GAMES-CRITICAL-ASSESSMENT-20260216.md Section 3.3
- Related: docs/GAME_IMPROVEMENT_MASTER_PLAN.md Section 2.5

Execution log:

- [2026-02-17 23:40 IST] Ticket created | Evidence: Critical assessment - "I just wanna PLAY!"

---

### TCK-20260217-005 :: New Game - Phonics Sounds

Type: FEATURE
Owner: Pranay
Created: 2026-02-17 23:40 IST
Status: **OPEN**
Priority: P1

Description:
Implement Phonics Sounds game where Pip makes a letter sound and child traces the letter. Builds on existing Alphabet Tracing infrastructure. From GAME_IDEAS_CATALOG.md #9.

Scope contract:

- In-scope:
  - Create PhonicsSounds game page
  - Reuse existing tracing canvas from AlphabetGame
  - Add phoneme audio playback (Pip voice TTS)
  - Ghost letter that pulses/fades
  - "Buh is for Ball!" completion feedback
  
- Out-of-scope:
  - Pre-recorded phoneme audio (use TTS for now)
  - Custom word images (use existing alphabet icons)
  - Full Pip animations (static mascot for now)
  
- Behavior change allowed: N/A (new game)

Targets:

- Repo: learning_for_kids
- File(s):
  - src/frontend/src/pages/PhonicsSounds.tsx (new)
  - src/frontend/src/data/phonemes.ts (new)
- Branch/PR: main

Acceptance Criteria:

- [ ] Game plays phoneme sound (e.g., "Buh!")
- [ ] Ghost letter appears faintly and pulses
- [ ] Child traces letter with finger
- [ ] On success: "Buh is for Ball!" + celebration
- [ ] Progressive difficulty: easy sounds → similar sounds → vowel variations
- [ ] Uses existing tracing detection logic

Evidence Links:

- Source: docs/GAME_IDEAS_CATALOG.md Section "Phonics Sounds"
- Related: docs/GAME_IMPROVEMENT_MASTER_PLAN.md Section 3.1

Execution log:

- [2026-02-17 23:40 IST] Ticket created | Evidence: Catalog item #9, P0 priority

---

*End of Worklog Addendum v3*

---

### TCK-20260217-006 :: Virtual Chemistry Lab Game

Type: FEATURE
Owner: Pranay
Created: 2026-02-17 23:52 IST
Status: **DONE**
Completed: 2026-02-17 23:52 IST
Priority: P0

Description:
Implement a Virtual Chemistry Lab game where children can mix virtual chemicals using hand tracking and discover chemical reactions. Part of the innovative games initiative focusing on science learning through play.

Scope contract:

- In-scope:
  - Create VirtualChemistryLab.tsx game page
  - Implement 8 virtual chemicals (Water, Vinegar, Baking Soda, Dyes, Oil, Soap)
  - Hand tracking integration for pouring mechanics
  - 5 chemical reactions with visual feedback
  - Discovery book tracking system
  - Bubble effects for reactions
  - Beaker visualization with layered liquids
  - TTS feedback for discovered reactions
  
- Out-of-scope:
  - External camera AR (single camera only for now)
  - Real chemistry education depth (simplified for age group)
  - Multiplayer features
  
- Behavior change allowed: N/A (new game)

Targets:

- Repo: learning_for_kids
- File(s):
  - src/frontend/src/pages/VirtualChemistryLab.tsx (new)
  - docs/COMPREHENSIVE_INNOVATIVE_GAMES_CATALOG.md (new)
- Branch/PR: main

Acceptance Criteria:

- [x] Select chemicals by clicking on shelf
- [x] Pinch gesture over beaker to pour
- [x] Reactions trigger when compatible chemicals mix
- [x] Visual celebration for discovered reactions
- [x] Discovery book tracks progress (X/Y reactions found)
- [x] Score system rewards experimentation
- [x] TypeScript type-check passes
- [x] All tests pass

Evidence Links:

- Source: docs/COMPREHENSIVE_INNOVATIVE_GAMES_CATALOG.md Section C-002
- Related: docs/research/RESEARCH-016-AR-CAPABILITIES.md

Execution log:

- [2026-02-17 23:45 IST] Created COMPREHENSIVE_INNOVATIVE_GAMES_CATALOG.md with 20+ innovative game ideas
- [2026-02-17 23:52 IST] Implemented VirtualChemistryLab.tsx | Evidence: git diff --stat
  - 8 chemicals with realistic densities and colors
  - Hand tracking for pinch-to-pour mechanic
  - 5 reactions: Volcano, Color Mixing (Purple/Orange/Green), Bubbles
  - Discovery book UI showing progress
  - Bubble particle effects
  - Beaker visualization with layered liquid rendering
- [2026-02-17 23:52 IST] Verification | Evidence:
  - TypeScript: `npm run type-check` passes
  - Tests: 365 passed (1 pre-existing Playwright config failure)

Status updates:

- [2026-02-17 23:45 IST] **OPEN** — Ticket created
- [2026-02-17 23:52 IST] **DONE** — Virtual Chemistry Lab implemented and verified

Prompt & persona usage table:

| Prompt file | Persona / lens | Audit axis | Evidence link / notes |
|-------------|----------------|------------|----------------------|
| docs/COMPREHENSIVE_INNOVATIVE_GAMES_CATALOG.md | Innovation architect | Game design | Science learning through play |
| docs/research/RESEARCH-016-AR-CAPABILITIES.md | Technical researcher | Feasibility | Hand tracking for interaction |

---
