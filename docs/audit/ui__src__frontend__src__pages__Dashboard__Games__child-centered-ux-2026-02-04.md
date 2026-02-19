# Child-Centered UX Audit - Dashboard & Games Flow

**Ticket:** TCK-20260204-007
**Date:** 2026-02-04
**Prompt:** `prompts/ui/child-centered-ux-audit-v1.0.md`
**Audit Axes:** Cognitive Load, Motivation & Feedback, Exploration Safety, Accessibility, Learning Flow

---

## Evidence Policy

**Observed**: Direct code evidence from files
**Inferred**: Logically implied from code structure
**Unknown**: Cannot be determined without running app

---

## Scope Contract

**In-scope:**

- One target UI surface: Dashboard + Games page flow
- Usability and learning experience issues for children (age 4-6 years, early reader)
- Concrete recommendations that can be implemented in this repo
- Routes/flows: Home → Dashboard → Games → Game selection

**Out-of-scope:**

- Framework migrations
- Major design overhauls
- Backend changes
- Individual game page audits (AlphabetGame, FingerNumberShow, etc.)

**Targets:**

- **Repo:** learning_for_kids
- **File(s):**
  - `src/frontend/src/pages/Dashboard.tsx` (831 lines)
  - `src/frontend/src/pages/Games.tsx` (361 lines)
  - `src/frontend/src/App.tsx` (routes reference)
- **Routes/flows:** Home → Dashboard → Games → Game selection
- **Child age band:** 4-6 years (early reader - expects progression and more structure)
- **Reading level:** Early reader (learning to recognize letters/numbers)
- **Behavior change allowed:** YES (for small UX improvements)

---

## Child Persona & Context

**Age Band:** 4-6 years
**Reading Level:** Early reader
**Cognitive Abilities:**

- Limited attention span (5-10 minutes max per activity)
- Developing fine motor skills (precise gestures challenging)
- Learning letter/number recognition (not reading fluently)
- Visual learning stronger than text comprehension
- Emotional need: positive reinforcement, low frustration tolerance

**Device Assumption:** Tablet/mobile (primary interaction modality)

---

## Audit Findings

### A) Cognitive Load & Clarity

#### KUX-001 — Dashboard has too many sections at once (HIGH)

- **Severity:** HIGH
- **Confidence:** High
- **Evidence:** **Observed** - `Dashboard.tsx` lines 59-830 contain: StatsBar, Quick Play Card, Progress Chart (Learning Progress + Multi-Language Progress), Adventure Map + XP, Badges Summary, Quick Actions, Play Games Button, Letter Journey, Tips Section - **12 distinct content areas**
- **Why it matters (child lens):** 4-6 year olds have limited working memory. Displaying 12 content areas simultaneously creates cognitive overload and paralysis of choice. Child doesn't know where to look first.
- **Recommendation (smallest change first):** Reorganize dashboard with collapsible/expandable sections. Show 2-3 primary areas (Continue Learning, Progress, Adventure Map) by default, hide advanced sections (Multi-Language Progress, Tips, Letter Journey) behind "More" or "Explore" accordions.
- **Validation plan:** Parent user testing with 4-6 year olds - observe first-click behavior and time to find "Continue Learning" or favorite activity.
- **Effort:** M
- **Risk:** MED (child confusion if reorganization isn't intuitive)

#### KUX-002 — Progress uses complex metrics without kid-friendly framing (HIGH)

- **Severity:** HIGH
- **Confidence:** High
- **Evidence:** **Observed** - `Dashboard.tsx` lines 309-334 show progress bars with "Average Accuracy" as percentage, "Time Played" in hours/minutes, star ratings based on 90%/70%/40% thresholds. Line 309: `value: "Letters"` but display shows "X of Y letters" which is abstract.
- **Why it matters (child lens):** 4-6 year olds don't understand percentages or "90% accuracy." They understand "You did great!" or "Almost mastered!" Current presentation is abstract and requires adult interpretation.
- **Recommendation (smallest change first):** Replace percentage-based progress with kid-friendly visual cues: 🌱 Seed → 🌱 Sprout → 🌱 Tree progression for letters learned. Replace accuracy % with emoji faces: 😊 Great! 😐 Good effort! Keep trying! Replace "Time Played" with "You've learned for [X hours]!" or adventure-themed time display (e.g., "Explorer for 2 journeys").
- **Validation plan:** A/B test with kids - current metrics vs kid-friendly framing. Observe comprehension and motivation.
- **Effort:** M
- **Risk:** MED (if new framing isn't clear)

#### KUX-003 — Games page offers 4 choices simultaneously without guidance (MED)

- **Severity:** MED
- **Confidence:** High
- **Evidence:** **Observed** - `Games.tsx` lines 30-75 define `availableGames` array with 4 games: Alphabet Tracing, Finger Number Show, Connect The Dots, Letter Hunt. Lines 69-85 show all 4 game cards in a grid with `animationDelay={index * 0.1}` staggered entry.
- **Why it matters (child lens):** For a 4-6 year old, choosing from 4 options without context is challenging. "Which one should I play?" requires understanding game titles, descriptions, and category (Alphabets/Numeracy/Fine Motor). No guidance on "best starting game" or "try this first."
- **Recommendation (smallest change first):** Add a "Recommended for you" or "Start Here" badge on one game card based on child's age/progress. For 4-6 year olds: Alphabet Tracing (age 3-8, early reader) or Finger Number Show (age 4-7, visual). Add playful language: "Ready to trace letters?" or "Let's count with fingers!"
- **Validation plan:** Observe child's first-click behavior. Do they pause and look at parent for guidance?
- **Effort:** S
- **Risk:** LOW (small improvement, easy to revert)

---

### B) Motivation & Feedback Loops

#### KUX-004 — Progress shows mastery status that may feel punitive (MED)

- **Severity:** MED
- **Confidence:** High
- **Evidence:** **Observed** - `Dashboard.tsx` lines 547-606: Letters with 0% best accuracy show "Not started" in gray/circle icon with no outline. Lines 575-595: Progress bar uses `getAccuracyProgressClass()` with colors: success (70%+), warning (40-70%), error (<40%). Line 597: Empty state shows "No progress recorded in other languages yet."
- **Why it matters (child lens):** "Not started" with gray circle feels boring/unpunished compared to colorful "Mastered" state. Error-colored progress bar (<40% accuracy) may discourage child - they tried! Progress gaps (no data) feel like "you haven't done anything" rather than "let's start exploring."
- **Recommendation (smallest change first):** Change "Not started" to "Ready to start!" with neutral but positive icon (e.g., 📖 open book). Add minimal "first step" encouragement for low accuracy (e.g., "Keep practicing, you're learning!" instead of red warning bar). For empty states: "Let's try [Game Name]!" or "Start your adventure!" with playful placeholder graphics.
- **Validation plan:** Child testing - observe reaction to seeing "Not started" vs "Ready to start." Does motivation improve?
- **Effort:** S
- **Risk:** MED (if encouragement isn't age-appropriate)

#### KUX-005 — XP and badges shown but celebration is modal-only (MED)

- **Severity:** MED
- **Confidence:** High
- **Evidence:** **Observed** - `Dashboard.tsx` lines 86-106: `questSummary` shows total XP, completed quests, unlocked islands. Lines 729-751: Display shows "⭐ {totalXp} XP" and badges summary. Line 816: `StoryModal` is only shown when `showStoryModal=true` (line 95 triggers on quest completion).
- **Why it matters (child lens):** 4-6 year olds need IMMEDIATE celebration when earning XP/badges, not after clicking through to see a modal. "I earned stars!" followed by waiting for animation creates a gap between achievement and reward. Child may not make connection between earning badge and seeing the celebration.
- **Recommendation (smallest change first):** Trigger confetti/particle celebration immediately when badge is earned (in-line celebration), not just show in modal. Add sound effect or visual flair when XP is displayed. Make celebration "poppable" - child can dismiss and see it overlaying content briefly.
- **Validation plan:** Observe child's reaction to earning badges - do they look excited when it happens, or only when they open the modal?
- **Effort:** M
- **Risk:** LOW (adding celebration doesn't remove modal flow, just adds immediate feedback)

---

### C) Exploration Safety ("safe to poke")

#### KUX-006 — Edit Profile modal accessible without parent confirmation (HIGH)

- **Severity:** HIGH
- **Confidence:** High
- **Evidence:** **Observed** - `Dashboard.tsx` lines 76-84 and 87-110: `EditProfileModal` (child component) has `onSubmit` handler that directly calls `updateProfile()` without parent gate. Lines 438-457: Edit button is accessible to any user, visible on each child profile card (line 439: `<button onClick={() => handleOpenEditModal(child)}>`).
- **Why it matters (child lens):** Child can accidentally or intentionally edit their own profile (name, language). While not destructive, this creates "I changed it myself" moments that parent didn't authorize. More critically: edit button next to child name makes it a target for taps.
- **Recommendation (smallest change first):** Move "Edit Profile" to a parent-only section (settings) or require parent PIN/password confirmation. Remove edit button from child's dashboard view - keep in Settings page only. If child needs to customize (e.g., change avatar), make it a separate "Customize" flow with parent oversight.
- **Validation plan:** Test with 4-6 year old - can they access edit? Does parent know about it?
- **Effort:** S
- **Risk:** LOW (security improvement, child won't lose access)

#### KUX-007 — Navigation always has "Back" available (GOOD)

- **Severity:** LOW (positive finding)
- **Confidence:** High
- **Evidence:** **Observed** - `Dashboard.tsx` lines 400-412: Dashboard header shows "Dashboard" title. Games.tsx line 53: `navigate('/games')` returns to game selection. Dashboard has no "Home" button but "Play Games" at bottom (line 758) and "All Games" (line 720) navigate to `/games`.
- **Why it matters (child lens):** Child can always return from Dashboard to Games to main menu. No dead ends observed.
- **Recommendation (smallest change first):** None - current implementation is good. Keep "Back" affordances prominent.

---

### D) Accessibility & Motor Skills

#### KUX-008 — Child selector buttons may be too small on tablets (MED)

- **Severity:** MED
- **Confidence:** Med
- **Evidence:** **Observed** - `Dashboard.tsx` lines 419-438: Child selector button has `className='flex items-center gap-2 px-3 py-1.5 rounded-lg'` with `text-lg`. No explicit min-height specification. Lines 435-436: Edit button has `min-h-[36px] min-w-[36px]` but main child button doesn't.
- **Why it matters (child lens):** 4-6 year olds have developing motor skills. Small tap targets (44px minimum WCAG) are hard to hit accurately. On 7" tablet, text-lg + 12px padding = ~44px, which meets minimum but may feel cramped.
- **Recommendation (smallest change first):** Add explicit `min-h-[56px] min-w-[112px]` to child selector buttons for larger touch targets on tablets. Ensure spacing between buttons is adequate (gap-4 is 16px, may need more).
- **Validation plan:** Test on 7" tablet - can 4-6 year old consistently select correct child?
- **Effort:** S
- **Risk:** LOW (small sizing adjustment)

#### KUX-009 — Games page uses age ranges but no visual distinction (LOW)

- **Severity:** LOW
- **Confidence:** High
- **Evidence:** **Observed** - `Games.tsx` lines 38-74: Game definitions include `ageRange` (e.g., '3-8 years', '4-7 years') but these aren't displayed in `GameCard` or visible in UI. Age info exists in data but not surfaced to child/parent.
- **Why it matters (child lens):** Parent selecting for 4-6 year old needs to know which games are age-appropriate. Currently hidden information requires checking code to find age ranges.
- **Recommendation (smallest change first):** Display age range badge on game cards (e.g., "Ages 3-8" in colorful pill). Use this to help parents quickly identify suitable games.
- **Validation plan:** Parent user testing - ask "Which game would you choose for your 4-year-old?" Do they use age ranges?
- **Effort:** S
- **Risk:** LOW (informational improvement only)

---

### E) Learning Flow & Scaffolding

#### KUX-010 — "Continue Learning" button always links to Alphabet Tracing (MED)

- **Severity:** MED
- **Confidence:** High
- **Evidence:** **Observed** - `Dashboard.tsx` lines 488-509: Quick Play Card has `to='/games/alphabet-tracing'`. Lines 310-318: Selected child logic defaults to `children[0]` if no `selectedChild`. No logic that suggests "next game" based on progress or child's last played game.
- **Why it matters (child lens):** For 4-6 year olds, always returning to same game limits exploration. Child may get stuck in "I only play alphabet tracing" loop instead of trying number show or dots game. Variety is important for engagement and broad skill development.
- **Recommendation (smallest change first):** Store `lastPlayedGame` in profile and default "Continue Learning" to that game. Add "Try Something New" badge on other games if child has played same game 3+ times in row. Rotate between game categories (Alphabets → Numeracy → Fine Motor) to encourage variety.
- **Validation plan:** Observe child over week - do they rotate games or always choose same one?
- **Effort:** M
- **Risk:** MED (if recommendation logic doesn't match child's preference)

#### KUX-011 — Adventure Map exists but "Play Now" flow skips map engagement (MED)

- **Severity:** MED
- **Confidence:** High
- **Evidence:** **Observed** - `Dashboard.tsx` lines 672-728: Adventure Map section includes `<AdventureMap />` component. Lines 709-727: Quick Actions include "Start Alphabet Quest" button that directly links to `/games/alphabet-tracing?quest=quest-a-to-z`. This bypasses the map entirely - child doesn't see or interact with map to unlock islands, just clicks button to play.
- **Why it matters (child lens):** Adventure map is designed to teach exploration, goal-setting, and progression visualization. Skipping map eliminates this learning opportunity. 4-6 year old loses the fun of "I'm going to the Star Studio island!"
- **Recommendation (smallest change first):** Make quest flow go THROUGH map. When "Start Quest" is clicked, show Adventure Map first with quest highlighted, then have child click the island to unlock/start. Add "Adventure Map" button prominently so child can explore outside of quest flow.
- **Validation plan:** Observe child - do they ever see the Adventure Map? Or do they always click through buttons?
- **Effort:** M
- **Risk:** LOW (adds one step, easy to remove if disliked)

---

## "Fun & Exploratory" Upgrade Ideas

### MVP Fun (S - LOW RISK)

1. **Add playful onboarding for first-time dashboard visit** (S / LOW)
   - Brief animated character (mascot) greeting: "Hi [Child Name]! Ready to learn?"
   - "Tap here to explore" with bouncing arrow pointing to games
   - Shown once, then auto-dismisses after dashboard visit
   - **Dependency:** None

2. **Add sound effects to game selection** (S / LOW)
   - Subtle "pop" sound when hovering game cards
   - Satisfying "click" sound when selecting game
   - Toggleable in Settings (child/parent control)
   - **Dependency:** Audio assets (can start with simple tones)

3. **Add character reactions to progress** (M / MED)
   - Mascot shows thumbs-up 🔥 when new letter mastered
   - Mascot looks encouraging ("Almost there!") when accuracy is 60-80%
   - Mascot celebrates with confetti when major milestone reached (5 letters)
   - **Dependency:** Mascot component enhancement

### Bigger Exploration (M - MED RISK)

1. **Add "Explore Mode" for safe game discovery** (M / MED)
   - Random game selection from filtered options: "Try something new! 🎲"
   - Removes pressure of choosing "right" game
   - 3 random suggestions based on child's age and progress
   - **Dependency:** Random selection logic

2. **Add mini-games in dashboard (M / MED)
   - Quick 30-second activities to reinforce learning without full game commitment
   - "Quick Trace" (one letter from alphabet)
   - "Number Flash" (show number 1-10, child shows with fingers)
   - Earn small XP, encourage exploration
   - **Dependency:** New component development

3. **Add "Daily Quest" to encourage variety** (M / MED)
   - Daily challenge that rotates game types
   - "Today's Quest: Play Finger Number Show for 5 minutes!"
   - Completes unlocks small reward (sticker, badge)
   - **Dependency:** Quest system integration

### Deep Exploration (L - HIGH RISK)

1. **Add interactive mascot companion in dashboard** (L / HIGH)
   - Mascot follows child's cursor and reacts to interactions
   - Mascot offers hints: "Need help? Try [Game Name]!"
   - Mascot can be petted/tapped for fun micro-interactions
   - Builds emotional connection, keeps child engaged
   - **Dependency:** Significant mascot system overhaul

2. **Add AR-style "scan for secrets" feature** (L / HIGH)
   - Dashboard shows hidden letters that child can "scan" with camera to reveal
   - Uses existing MediaPipe, new playful application
   - "Find the hidden letter!" moment creates delight
   - **Dependency:** Camera integration with dashboard

---

## Next Steps

### Suggested "MVP Fun" PR Scope (≤2 files)

**Implement Ideas #1-3:**

- Add playful mascot greeting on first dashboard visit
- Add hover/click sound effects to game cards
- Add mascot reactions to progress display

**Files:**

- `src/frontend/src/pages/Dashboard.tsx` (enhance with greeting + mascot reactions)
- `src/frontend/src/components/GameCard.tsx` (add sound interactions)

**Estimated Effort:** 4-6 hours

**Validation:** Parent user testing with 4-6 year old - observe engagement, facial expressions, and repeat visits

---

### One Suggested "Bigger Exploration" Epic Scope

**Implement Ideas #4-6:**

- Explore Mode: Random game selection
- Mini-games in dashboard
- Daily Quest system for variety

**Files:**

- `src/frontend/src/pages/Dashboard.tsx` (mini-games, daily quest widget)
- `src/frontend/src/components/ExploreMode.tsx` (new)
- `src/frontend/src/components/DailyQuest.tsx` (new)
- `src/frontend/src/store/questStore.ts` (update for daily quests)

**Estimated Effort:** 12-16 hours

**Validation:** A/B test - current flow vs explore mode. Measure game variety and engagement time.

---

## Summary

**Critical Issues (HIGH):**

- KUX-001: Dashboard cognitive overload (12 content areas)
- KUX-002: Progress metrics not kid-friendly (percentages, abstract labels)
- KUX-006: Edit Profile accessible to child (no parent gate)

**Medium Issues (MED):**

- KUX-003: Games page offers 4 choices without guidance
- KUX-004: Progress mastery status may feel punitive ("Not started", error colors)
- KUX-005: XP/badges celebration is modal-only (delayed feedback)
- KUX-008: Child selector buttons may be too small
- KUX-010: "Continue Learning" always links to same game
- KUX-011: Adventure Map skipped in quest flow

**Positive Findings:**

- KUX-007: Navigation always has "Back" available (good exploration safety)

**Overall Assessment:**
The Dashboard and Games flow provide solid functionality (selection, progress, navigation) but lack child-centered polish. The experience feels designed for parents to understand data, not for children to have fun and explore. Key gaps: cognitive overload, kid-friendly framing, immediate celebration feedback, and variety encouragement.

---

**Prompt & Persona Usage Table:**

| Prompt file | Persona / lens | Audit axis | Evidence link / notes |
| --- | --- | --- | --- |
| `prompts/ui/child-centered-ux-audit-v1.0.md` | Child learning expert (early childhood + UX) | Cognitive load, motivation, exploration safety, accessibility, learning flow | Analyzed Dashboard.tsx (831 lines) and Games.tsx (361 lines) through 4-6 year old early reader lens |
