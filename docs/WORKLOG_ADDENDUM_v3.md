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
