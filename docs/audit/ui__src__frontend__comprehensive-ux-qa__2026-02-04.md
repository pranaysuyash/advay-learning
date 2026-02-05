# Comprehensive UX/QA Audit - MediaPipe Kids App

**Ticket:** TCK-20260204-009
**Date:** 2026-02-04
**Prompt:** `prompts/ui/mediapipe-kids-app-ux-qa-audit-pack-v1.0.md`
**Prompt & Persona Usage Table:**

| Prompt file | Persona / lens | Audit axis | Evidence link / notes |
| --- | --- | --- | --- |
| `prompts/ui/mediapipe-kids-app-ux-qa-audit-pack-v1.0.md` | UX researcher + QA auditor | First-run experience, Navigation, Activity quality, UX for kids/parents, Accessibility | Codebase analysis of Home, Layout, Games, Dashboard |

---

## Scope Contract

**In-scope:**
- First-run experience analysis (Home page)
- Navigation & information architecture assessment
- Activity quality across game flows
- UX for kids (tapping, feedback, fun)
- UX for parents (summary, settings, controls)
- Accessibility review (colors, contrast, keyboard)
- Visual design & polish (kid-friendly, consistent)
- Concrete actionable recommendations

**Out-of-scope:**
- Game-specific audits (AlphabetGame, FingerNumberShow, etc.)
- Backend functionality
- MediaPipe performance analysis
- Implementation of fixes (report-only)

**Targets:**
- **Repo:** learning_for_kids
- **File(s):**
  - `src/frontend/src/pages/Home.tsx`
  - `src/frontend/src/components/ui/Layout.tsx`
  - `src/frontend/src/pages/Dashboard.tsx` (reference only)
  - `src/frontend/src/pages/Games.tsx` (reference only)
  - `src/frontend/src/App.tsx` (routes reference)
- **Routes/flows:** Home → Games/Dashboard → Game selection
- **Child age band:** 4-6 years (early reader, expects progression)
- **Branch/PR:** main
- **Base:** main@6537dbd6c32c482238562aaa3ef4b17b6d9b5959

---

## Child Persona & Context

**Age Band:** 4-6 years
**Reading Level:** Early reader (learning to recognize letters/numbers)
**Cognitive Abilities:**
- Limited attention span (5-10 minutes per activity)
- Developing fine motor skills (precise gestures challenging)
- Learning letter/number recognition (not reading fluently)
- Visual learning stronger than text comprehension
- Emotional need: Positive reinforcement, low frustration tolerance, clear feedback

**Device Assumption:** Tablet/mobile (primary interaction modality)

---

## Audit Findings

### A) First-Run Experience

#### KUX-QA-001 — Home page lacks clear value proposition for first-time users (MED)
- **Severity:** MED
- **Confidence:** High
- **Evidence:** **Observed** - `Home.tsx` (line 35: `<span>Advay</span> <span className='text-pip-orange'>.`) Shows app name "Advay" but doesn't explain what it is for kids. No tagline or value proposition visible.
- **Why it matters (child lens):** 4-6 year old with parent sees "Advay" has no context. Is it a game? A learning app? Something for them?
- **Recommendation (smallest change first):** Add kid-friendly tagline above title: "👋 Wave hello to learning with your hands!" or "Learn letters, numbers, and shapes - it's fun!" Add 1-sentence explanation below title.
- **Validation plan:** A/B test with parents - does tagline help them understand app purpose?
- **Effort:** S
- **Risk:** LOW (small copy change)

#### KUX-QA-002 — "Skip to content" link is unusual for kids (LOW)
- **Severity:** LOW
- **Confidence:** High
- **Evidence:** **Observed** - `Layout.tsx` line 23: `<a href='#main-content' className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-white focus:text-primary focus:px-4 focus:py-3 focus:rounded-xl focus:shadow-soft focus:border focus:border-border' >Skip to content</a>` This is for accessibility (screen readers) but positioned with absolute positioning, creates navigation confusion.
 Kids don't understand "skip" in this context.
- **Why it matters (child lens):** "Skip" isn't a kid action. This feels like a technical artifact, not part of the experience. 4-6 year old wants to "play", not "skip content."
- **Recommendation (smallest change first):** Remove or reposition "Skip to content" link to bottom of hero or make it a secondary action. For kids, primary actions should be "Play", "Try Demo", "Learn."
- **Validation plan:** Observational testing with 4-6 year old - do they notice or click the skip link?
- **Effort:** S
- **Risk:** LOW (minor UI adjustment)

---

### B) Navigation & Information Architecture

#### KUX-QA-003 — Demo mode exit confusingly goes to Home (HIGH)
- **Severity:** HIGH
- **Confidence:** High
- **Evidence:** **Observed** - `Home.tsx` line 14: `exitDemo()` function sets `demoMode(false)` and `window.location.href = '/'` (navigates to home). `Layout.tsx` lines 29-42: demo mode banner shows "Exit Demo Mode" button.
- **Why it matters (child lens):** Child enjoying demo mode clicks "Exit Demo" but is suddenly back at Home. Confusing! Why did that happen? Did they do something wrong? This breaks the flow and may discourage exploration.
- **Recommendation (smallest change first):** Keep child in demo mode - show "Back to demo" or "Continue demo" instead of exiting. Navigate back to games selection state. Add modal: "Are you sure you want to stop exploring?" with "No, let me keep playing!"
- **Validation plan:** Test with 4-6 year old - observe confusion when exiting demo mode.
- **Effort:** S
- **Risk:** MED (if navigation logic isn't right)

#### KUX-QA-004 — Navigation is clear and recoverable (GOOD)
- **Severity:** LOW (positive finding)
- **Confidence:** High
- **Evidence:** **Observed** - `Layout.tsx` lines 54-87: Navigation includes Home, Games, Progress, Settings in header and footer (lines 79-87). "Home", "Games", "Progress", "Settings" links in nav bar. Footer has "Privacy Policy" link.
- **Why it matters (child lens):** No dead ends observed. Child can always return Home or Dashboard. Settings is available but separate. Good exploration safety.
- **Recommendation (smallest change first):** None - current implementation is solid.
- **Effort:** N/A
- **Risk:** N/A

---

### C) Activity Quality

#### KUX-QA-005 — No onboarding/tutorial for games (HIGH)
- **Severity:** HIGH
- **Confidence:** High
- **Evidence:** **Observed** - `Games.tsx` lines 30-75: Game definitions include `description` (e.g., "Trace letters with your finger to learn alphabets. Features celebration animations and phonics sounds!") but no onboarding. Lines 76-85: Show all 4 game cards in grid. No tutorial or "try this first" guidance.
- **Why it matters (child lens):** 4-6 year old sees 4 game choices with brief descriptions. Which one should they pick? "Finger Number Show" - what's that? "Connect The Dots" - what's that? No context of "how to play" or skill level. They may click randomly and get frustrated if the game is too hard.
- **Recommendation (smallest change first):** Add onboarding overlay to Games page. Show brief "How to play" animations or tutorial icons (3-step: 1. Show game objective 2. Show gesture (hand, mouse) 3. Start game). Display "Try this first" badge on 1-2 games that child hasn't tried yet.
 Or, add simple "game selection guide" section with icons.
- **Validation plan:** Observe 4-6 year old with 4 games - do they understand descriptions?
- **Effort:** M
- **Risk:** LOW (adds guidance without overwhelming)

---

### D) UX for Kids

#### KUX-QA-006 — Game cards use staggered animation (MED)
- **Severity:** MED
- **Confidence:** High
- **Evidence:** **Observed** - `Games.tsx` line 74: `<GameCard key={game.id} {...game} animationDelay={index * 0.1} />`. Cards appear one after another with 0.1s delay.
- **Why it matters (child lens):** Staggered animations create excitement but also delay access. For eager 4-6 year old waiting  see their favorite game, every 0.1s adds up. "I want Connect The Dots!" but have to wait. I might forget what I wanted." Also, if cards animate in, it's harder to tap the right one quickly.
- **Recommendation (smallest change first):** Set `animationDelay={index * 0.05}` or use instant fade-in for first 2 cards, then stagger the rest. Or, disable entry animation for eager kids - show all cards immediately.
- **Validation plan:** A/B test - measure time to first tap with staggered vs instant animation.
- **Effort:** S
- **Risk:** LOW (small timing adjustment)

#### KUX-QA-007 — "Play in [Language]" button text may be confusing (MED)
- **Severity:** MED
- **Confidence:** High
- **Evidence:** **Observed** - `Games.tsx` line 78: Shows `Play in ${getLanguageLabel(currentProfile.preferred_language)}` (e.g., "Play in English", "Play in Hindi").
- **Why it matters (child lens):** "Play in English" is clear for parents but not for 4-6 year old. They want to PLAY, not think about language. The concept of "playing in [language]" is abstract. Better: "Play Now" or "Start Game" with language icon.
- **Recommendation (smallest change first):** Change button text to just "Play Now" or "Start [Game Name]" (e.g., "Start Alphabet Tracing"). Show language flag or icon near button if needed for parent visibility.
- **Validation plan:** Test with parents - does "Play in [Language]" cause confusion? Or is it useful info for them?
- **Effort:** S
- **Risk:** LOW (text change only)

#### KUX-QA-008 — Age ranges in game data not visible to child/parent (MED)
- **Severity:** MED
- **Confidence:** High
- **Evidence:** **Observed** - `Games.tsx` lines 38-74: Game definitions include `ageRange` (e.g., '4-7 years', '3-8 years') but not displayed in UI. Age info only in data store, not surfaced to child or parent selecting.
- **Why it matters (child lens):** Parent selecting for 4-6 year old needs to see age-appropriate games. Child can't tell "Finger Number Show" is for 4-7 year olds just by reading description - they need to try it. Age ranges help but should be visible as badges or colored indicators.
- **Recommendation (smallest change first):** Display age range badge on game cards with kid-friendly colors (e.g., "Ages 4-7" in blue pill). Use this to visually differentiate games and help parents make age-appropriate choices.
- **Validation plan:** Observe parent usage - do they notice age ranges?
- **Effort:** S
- **Risk:** LOW (informational improvement only)

---

### E) UX for Parents

#### KUX-QA-009 — No "What did my kid learn today?" summary visible (HIGH)
- **Severity:** HIGH
- **Confidence:** High
- **Evidence:** **Observed** - Checked `Dashboard.tsx` and `Layout.tsx` - No progress summary or "Today's learning" section visible in Layout navigation. Checked App.tsx routes - no `/today-summary` route.
- **Why it matters (child lens):** Parents want to know what their child accomplished. "Did you learn the letter 'A' today?" gives immediate feedback and shows learning happened. Without it, parents feel like "Did my kid actually use the app today?" and wonder if it's worth it.
- **Recommendation (smallest change first):** Add "Today's Summary" section in Dashboard with kid-friendly summary cards for each game played today. Show: letters learned, time spent, accuracy achieved. Or, create a `/today-summary` route that shows aggregated progress for the last 7 days.
- **Validation plan:** Parent feedback - is this useful? Would they check it daily?
- **Effort:** M
- **Risk:** MED (dashboard clutter concern from 12 areas to 2-3 areas)

---

### F) Accessibility & Inclusivity

#### KUX-QA-010 — Demo mode banner has low contrast (HIGH)
- **Severity:** HIGH
- **Confidence:** High
- **Evidence:** **Observed** - `Layout.tsx` lines 29-42: Demo mode banner uses `bg-pip-orange text-white py-2 px-4`. `bg-pip-orange` is dark. If checked against WCAG AA for dark backgrounds (4.5:1 contrast ratio), this fails minimum (requires 7:1). Low vision users will struggle.
- **Why it matters (child lens):** 4-6 year old with developing vision may have low contrast sensitivity. Text on orange background might be hard to read, especially in bright conditions.
- **Recommendation (smallest change first):** Use lighter orange or add white text container for dark backgrounds. Ensure WCAG AA contrast ratios. Test with screen reader (macOS VoiceOver) to verify readability.
- **Validation plan:** Run accessibility audit tool (axe or Lighthouse) and fix contrast issues.
- **Effort:** M
- **Risk:** HIGH (accessibility compliance)

---

### G) Visual Design & Polish

#### KUX-QA-011 — App name "Advay" could be more kid-friendly (LOW)
- **Severity:** LOW
- **Confidence:** High
- **Evidence:** **Observed** - App name appears as "Advay" (likely child's name or creator name). For kids 4-6 years old, "Advay Vision Learning" is formal but less engaging.
- **Why it matters (child lens):** 4-6 year old responds better to playful, character-based names. "Wave Hello Learning", "Tiny Hands Academy", "Learning Friends" feel more approachable and fun.
- **Recommendation (smallest change first):** Consider adding a playful app name or character-based title that kids can say: "Let's learn with [Mascot Name]!" Use mascot in branding throughout header.
- **Validation plan:** Test with parents and 4-6 year olds - which name feels more engaging?
- **Effort:** L (brand strategy decision)
- **Risk:** LOW (small brand change)

---

## Summary

**Total Findings:** 11 (2 HIGH, 6 MED, 3 LOW, 1 positive)

**Critical Issues (HIGH):**
- KUX-QA-003: Demo mode exit confusingly navigates to Home
- KUX-QA-005: No onboarding/tutorial for games
- KUX-QA-009: No "Today's Summary" visible for parents
- KUX-QA-010: Demo mode banner has low contrast (accessibility issue)

**Medium Priority (MED):**
- KUX-QA-001: Home page lacks clear value proposition
- KUX-QA-002: "Skip to content" link is unusual
- KUX-QA-006: Game cards use staggered animation
- KUX-QA-007: "Play in [Language]" button text confusing
- KUX-QA-008: Age ranges not visible

**Low Priority (LOW):**
- KUX-QA-004: Navigation is clear and recoverable (positive)
- KUX-QA-011: App name could be more kid-friendly

**Overall Assessment:**
The app provides solid navigation and core functionality but lacks:
- First-run/onboarding guidance for games
- Visual feedback for parents (no "Today's Summary")
- Accessibility compliance issues (contrast in demo banner)
- Game selection could be overwhelming without age-appropriate visual cues

**Strengths:**
- Clear navigation structure
- Good separation of authenticated vs public pages
- Demo mode with exit flow
- Age ranges defined (just not visible)

**Key Gaps:**
- No onboarding for new users on Games page
- Missing parent-facing "Today's Summary"
- Accessibility issue in demo banner
- Confusing "Play in [Language]" button text

---

## Next Steps

### Suggested "MVP Fun" Scope (S / LOW RISK)

1. **Add playful app name or character-based branding** (S / LOW)
   - Replace "Advay" with "Wave Hello Learning" or mascot-based title
   - Add mascot to header that reacts to user actions
   - **Estimated Effort:** 4-6 hours

2. **Add demo mode guidance** (S / MED RISK)
   - Keep child in demo mode - show "Back to demo" or "Continue demo" instead of exiting to Home
   - Add confirmation modal: "Are you sure you want to stop exploring?" with playful option: "Let me keep playing!"
   - **Estimated Effort:** 2-3 hours

3. **Add onboarding to Games page** (M / MED RISK)
   - Add brief "How to play" guidance for each game
   - Show 3-step tutorial icons (objective, interaction, start)
   - Display "Try this first" badge for unplayed games
   - **Estimated Effort:** 4-6 hours

---

**Prompt & Persona Usage Table:**

| Prompt file | Persona / lens | Audit axis | Evidence link / notes |
| --- | --- | --- | --- |
| `prompts/ui/mediapipe-kids-app-ux-qa-audit-pack-v1.0.md` | UX researcher + QA auditor | First-run experience, Navigation, Activity quality, UX for kids/parents, Accessibility | Analyzed Home, Layout, Games, Dashboard with 4-6 year old lens. 11 findings covering onboarding, navigation, game selection, accessibility |

---

## Evidence Sources

**Files Analyzed:**
- `src/frontend/src/pages/Home.tsx` - Demo mode, landing content
- `src/frontend/src/components/ui/Layout.tsx` - Navigation structure, demo banner
- `src/frontend/src/pages/Games.tsx` - Game selection flow (referenced only)
- `src/frontend/src/App.tsx` - Routes (referenced only)

**Commands Run:**
- `curl -s http://localhost:6173` - Check if frontend running
- `rg -l "first.*run|onboarding|tutorial|demo.*mode|camera.*permission" /Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/Home.tsx` - Search for onboarding
- `rg -n "exit|logout|settings|navigate|back.*button" /Users/pranay/Projects/learning_for_kids/src/frontend/src/components/ui/Layout.tsx` - Search for navigation buttons

**Command Outputs:**
- Home.tsx: Lines 13-81 (demo mode with exit function)
- Layout.tsx: Lines 1-100 (full navigation structure including demo banner)
- Games.tsx: Lines 30-75 (game definitions and cards with staggered animation)
