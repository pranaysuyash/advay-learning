# Comprehensive UX Audit — Advay Vision Learning Platform

**Date:** 2026-03-15
**Auditor Role:** UX Researcher & Product Auditor (Kids Educational Apps)
**Scope:** Full product UX from landing to gameplay, 60+ game pages
**Status:** COMPLETE — Awaiting implementation prioritization

---

## 1. PRODUCT VISION UNDERSTANDING

### What the app appears to be trying to achieve

Advay Vision Learning is an **AI-native, camera-first digital sandbox** for children ages 2–8 (core focus 2–5). The North Star doc explicitly states: *"Anything physical, made virtual, safe, and wildly fun."* The product aims to be a **Playground**, not a linear learning track — children should freely roam into different "worlds" (Music Tent, Math Cave, Chemistry Lab) and explore at will.

The vision describes:
- **Child-directed** exploration (kids choose what to play)
- **Failure-positive** design (mistakes are hilarious, never punishing)
- **Physically interactive** (whole body, not just fingertips)
- **Empathic** (reacts to emotions, fatigue, frustration)
- **Invisible rubber banding** (dynamic difficulty without visible Easy/Medium/Hard buttons)
- **Pip as the UI** (the mascot IS the interface — success = Pip doing a backflip, not a text box)

### Who the primary users seem to be

| User | Role | Key Needs |
|------|------|-----------|
| **Aarav (2–3 years)** | Youngest edge — stress test | Zero text, cause-and-effect delight, 45–90s attention, parent navigates FOR them, 2–3 choices max |
| **Meera (4–5 years)** | Core target | Navigates partially alone, needs big icons not text, linear forward flow |
| **Kabir (6–8 years)** | Older edge | Can read basic labels, can navigate alone, wants challenge |
| **Parents** | Gatekeepers & co-players | Premium feel, predictable patterns, trust signals, quick setup |

### What the core usage loop should be

**Intended (from vision docs):**
1. Parent opens app, selects child profile (or child is already logged in)
2. Child sees an explorable map/world
3. Child taps a game → immediately starts playing (camera-first interaction)
4. Game adapts difficulty invisibly
5. Pip celebrates success with animation + sound (no text scores)
6. Child naturally moves to next game or parent closes app

### UX principles that logically follow from the vision

1. **Zero-tap to play:** From seeing a game to playing it should require ≤1 tap
2. **No pre-play configuration:** Difficulty adapts invisibly — no Easy/Medium/Hard screens
3. **No text-dependent UI for ages 2–5:** Everything should be icon/audio/visual
4. **Pip owns feedback:** Not text boxes, not score breakdowns, not accuracy percentages
5. **One focal point at a time:** No overlay stacking, no competing UI layers
6. **Consistent navigation:** Same exit button in same place on every game
7. **Immediate replay:** Finishing a game should offer instant "again" — not dump you to a menu

### Contradictions between vision docs and actual product UX

| Vision Says | Reality Shows | Severity |
|---|---|---|
| "No 'Hard' labels… difficulty is themed" | GameCard shows `Easy`, `Medium`, `Hard` difficulty badges; BeginningSounds has Level 1/2/3 selector during play | **Critical** |
| "No Easy/Medium/Hard button" (invisible rubber banding) | ShapePop shows explicit Easy/Medium/Hard pre-game menu with 90 lines of inline setup code | **Critical** |
| "The child always feels incredibly capable" | CelebrationOverlay shows `85% Accuracy` with star ratings (1/2/3 stars) — exposing performance metrics to kids | **Critical** |
| "Pip IS the UI" for feedback | Feedback appears as text bars, floating "+10" numbers, streak counters, hearts, and accuracy percentages — Pip barely present during gameplay | **High** |
| "Open Playground" with explorable map | Games page is a long scrollable grid with search bar, CV filters, and world tabs — a content catalog, not a playground | **High** |
| "2–3 options maximum" for toddlers | Games page shows 100+ game cards simultaneously with 15+ world filter tabs | **Critical** |
| "Parent taps a game for [2-year-old]" | Tapping "Jump In!" goes directly to game (good), but some games then show secondary menus (ShapePop, BeginningSounds) | **High** |
| "Failure-positive" | Games use error sounds, "Keep trying!" text, streak-break feedback | **Medium** |

### Where missing/unclear vision is causing poor UX decisions

1. **No single canonical game entry pattern.** Some games start instantly, some show menus, some show tutorials. No consistent contract.
2. **Two game selection pages** (`/games` and `/game-selection`) exist — the first is a modern gallery, the second is an admin-style game picker tied to subscription management. This is an identity crisis.
3. **Dashboard vs Games page** — the dashboard shows recommended games AND profile management AND subscription cards AND progress. It's trying to be both a parent dashboard and a child entry point simultaneously.
4. **No "Playground" implementation** — despite the vision document's emphasis on an explorable map, the actual UI is a standard web catalog with cards, search, and filters.

---

## 2. UX AUDIT ASSUMPTIONS

- Auditing for **ages 2–5 primary, 6–8 secondary**
- Assuming **parent co-play** for ages 2–3, **semi-independent navigation** for 4–5
- Evaluating against the product's own stated North Star vision
- Treating any pre-play friction as higher severity than in adult apps
- Treating any text-dependent interaction for ages 2–5 as a UX failure
- Not auditing backend/API UX — front-end only

---

## 3. UX ISSUE REGISTER

### UX-001: Explicit Difficulty Selection Violates Invisible Rubber Banding Vision

- **Severity:** Critical
- **Category:** Vision misalignment, kids-app expectation failure
- **User scenario:** A 4-year-old taps "Jump In!" on ShapePop, expecting to immediately pop shapes. Instead, they see a 90-line inline menu asking them to choose Easy, Medium, or Hard.
- **Current flow:** GameCard → click "Jump In!" → ShapePop loads → shows pre-game menu with 3 difficulty buttons → child must choose → then game starts
- **Why this is poor UX:** Adds a decision point between desire and play. A 3-year-old cannot meaningfully choose between "Easy" and "Hard." A 5-year-old will always pick Easy. The vision explicitly says difficulty should be invisible.
- **Why especially bad for kids:** Young children don't understand difficulty meta-choices. They want to DO the thing, not think about HOW HARD the thing should be.
- **Why it conflicts with vision:** NORTH_STAR_VISION.md §3 explicitly says: "The child always feels incredibly capable. They never know the game is helping them." Showing Easy/Medium/Hard is the opposite.
- **Evidence:**
  - `src/frontend/src/pages/ShapePop.tsx` lines 93–94: `const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');` `const [showMenu, setShowMenu] = useState(true);`
  - `src/frontend/src/pages/BeginningSounds.tsx` lines 356–373: explicit Level 1/2/3 selector buttons visible during active gameplay
  - `src/frontend/src/components/GameCard.tsx` line 259: difficulty badge shown on game card
- **Recommendation:** Remove all explicit difficulty UI. Start all games at a calibrated default. Implement invisible rubber banding: if the child succeeds 3x in a row, silently increase difficulty; if they fail 2x, silently decrease. Store the per-game difficulty level per profile. Remove "Easy"/"Medium"/"Hard" badges from GameCard entirely. Replace the BeginningSounds level selector with automatic progression.
- **Better flow:** Card → "Jump In!" → game starts at last-known difficulty → difficulty auto-adjusts → child never sees a difficulty label
- **Effort:** M (remove menus: S; implement adaptive difficulty: M)
- **Risk:** Some parents may want to override difficulty — offer this in a parent-gated settings page, not in the child-facing game flow.
- **Acceptance criteria:** No game shows difficulty/level selection UI to the child. Difficulty adapts silently based on performance.

---

### UX-002: Accuracy Scores and Star Ratings Shown to Small Children

- **Severity:** Critical
- **Category:** Kids-app expectation failure, vision misalignment
- **User scenario:** A 3-year-old traces the letter "B" and sees "85% Accuracy" with 2 out of 3 stars. They don't know what 85% means. They see they're missing a star. This is a judgment they can't process.
- **Current flow:** Trace letter → CelebrationOverlay appears → shows AccuracyBadge with 1/2/3 stars based on numeric accuracy → shows "85% Accuracy" percentage
- **Why this is poor UX:** Accuracy percentages are adult metrics. Star ratings imply judgment. For a 3-year-old, ANY attempt should feel like success.
- **Why it conflicts with vision:** "Failure-positive… mistakes are hilarious and informative, never punishing." Showing 1 star out of 3 IS punishment.
- **Evidence:**
  - `src/frontend/src/components/CelebrationOverlay.tsx` lines 125–154: AccuracyBadge component that shows 1/2/3 stars based on percentage thresholds (90%→3★, 75%→2★, else 1★)
  - CelebrationOverlay props require `accuracy: number` — this metric leaks to the child
- **Recommendation:** Remove AccuracyBadge from child-facing celebration. Replace with always-3-stars or just Pip celebrating. Log accuracy silently for parent dashboard. If you want tiered celebration, use intensity (bigger confetti, Pip does more excited animation) rather than visible star ratings.
- **Better label:** Instead of "85% Accuracy", show nothing — or "Amazing!" / "Beautiful!" / "You did it!"
- **Effort:** S
- **Risk:** Parents may want to see accuracy — show it on parent dashboard/progress page, not in the child's celebration moment.
- **Acceptance criteria:** CelebrationOverlay never shows numeric accuracy or fewer-than-max stars to the child.

---

### UX-003: Games Page Is a Content Catalog, Not a Playground

- **Severity:** High
- **Category:** Vision misalignment, cognitive load
- **User scenario:** A 4-year-old opens the Games page and sees 100+ game cards in a scrolling grid with a search bar, CV filters (✋ Hand, 🤸 Pose, 😊 Face, 🎤 Voice), 15 world filter tabs, "What Makes This Special" cards, and a "How It Works" section. This is an adult content catalog.
- **Current flow:** Dashboard → "See All" → Games page → search/filter/scroll through 100+ cards
- **Why this is poor UX:** A 2-year-old persona (Aarav) needs "2–3 options, maximum." A 4-year-old (Meera) is overwhelmed by infinite scroll. The search bar is useless for pre-literate children. CV filters ("✋ Hand") are developer concepts, not kid concepts.
- **Evidence:**
  - `src/frontend/src/pages/Games.tsx` lines 177–226: Search bar + 4 CV filter buttons
  - `src/frontend/src/pages/Games.tsx` lines 228–276: 15+ World filter tabs
  - `src/frontend/src/pages/Games.tsx` line 290: unbounded grid of ALL games
  - North Star §2: "Free Roaming Map" — the vision calls for a spatial/explorable interface, not a catalog
- **Recommendation:** For children: Replace the card grid with an explorable world map (per the North Star vision) or a curated "3–5 recommended games" approach. Keep the full catalog accessible via a parent-mode or "Browse All" option. For immediate wins before building a map: limit visible games to 6–8 based on recommendations + world filter, with a "Show More" progressive disclosure.
- **Effort:** L (full map), S (limit visible games + progressive disclosure)
- **Acceptance criteria:** Default Games view shows ≤8 games. Search/filter UI is behind progressive disclosure or parent-accessible only. No CV filter buttons in child-facing UI.

---

### UX-004: Two Separate Game Selection Pages

- **Severity:** High
- **Category:** Consistency, navigation
- **User scenario:** A parent sees both `/games` and `/game-selection` in the navigation. `/game-selection` is a completely different UI (admin-style checkboxes for subscription game picking) while `/games` is the colorful game gallery. Neither page knows about the other.
- **Current flow:** `/games` = game gallery with world cards. `/game-selection` = subscription admin with checkboxes, game limits, "Save Selection" button.
- **Why this is poor UX:** Two paths to "choose games" creates confusion. The admin-style `/game-selection` should never be child-facing.
- **Evidence:**
  - `src/frontend/src/pages/GameSelection.tsx` — entirely different component, fetches from `subscriptionApi.getGamesCatalog()`, has checkboxes, save button, error/success alerts
  - `src/frontend/src/App.tsx` line 228–231: `/game-selection` route exists alongside `/games`
- **Recommendation:** Merge game selection logic into the parent settings/subscription flow. Remove `/game-selection` as a standalone route or gate it behind parent auth. The `/games` page should be the ONLY game browsing surface for children.
- **Effort:** S
- **Acceptance criteria:** Children never encounter the `/game-selection` admin interface. One canonical game browsing page exists.

---

### UX-005: Dashboard Serves Two Masters (Parent Admin + Child Entry)

- **Severity:** High
- **Category:** Cognitive load, vision misalignment
- **User scenario:** A child sees the Dashboard and encounters: profile management with "Right-click to edit" tooltip, subscription status cards, "Export Progress" button, star currency counter, pending/failed progress badges, and a "For You" game section all on one page.
- **Current flow:** Login → Dashboard → mix of parent controls (export, settings, subscription, profile editing) and child content (recommended games, greeting)
- **Why this is poor UX:** A 4-year-old doesn't know what "Export Progress" means. "Right-click to edit" is a desktop-only interaction invisible on tablets. The subscription card is billing information shown alongside game recommendations.
- **Evidence:**
  - `src/frontend/src/pages/Dashboard.tsx` line 500: "Tip: Right-click a profile to edit"
  - `src/frontend/src/pages/Dashboard.tsx` lines 437–444: Export button, Settings link in child view
  - `src/frontend/src/pages/Dashboard.tsx` line 507: SubscriptionCard rendered inline
  - `src/frontend/src/pages/Dashboard.tsx` lines 408–433: PendingBadge and DeadLetterBadge (technical concepts)
- **Recommendation:** Split the dashboard into two clear modes: (1) **Child view:** greeting + recommended games + world map entry — nothing else. (2) **Parent view:** profile management, subscription, export, settings — accessed via a parent gate (math problem or hold-to-unlock). The child view should be the default after login.
- **Better flow:** Login → Child sees: "Hi Meera! 🌟" + 4–6 recommended game cards + "Explore Worlds" button → that's it
- **Effort:** M
- **Acceptance criteria:** Child-facing dashboard shows ONLY greeting + game recommendations. Parent tools require explicit parent-mode entry.

---

### UX-006: "Report Issue" Button Visible to Children in AirCanvas

- **Severity:** High
- **Category:** Kids-app expectation failure
- **User scenario:** A 4-year-old is painting in AirCanvas and sees a green "Report Issue" button in the header next to "Hide Tools." They tap it because it's colorful. A bug report modal appears. They are confused.
- **Current flow:** AirCanvas header shows `[← Back] [Air Canvas title] [Report Issue] [Hide Tools]`
- **Why this is poor UX:** Bug reporting is a developer/parent function. Placing it as a primary header button in a kids' game is like putting a "File a Complaint" button next to the coloring crayons.
- **Evidence:**
  - `src/frontend/src/pages/AirCanvas.tsx` lines 410–414: `<button onClick={() => setShowIssueReport(true)} className="px-5 py-3 bg-[#10B981]…"> Report Issue </button>`
  - `src/frontend/src/pages/AirCanvas.tsx` line 28: `import { IssueReportFlowModal }`
- **Recommendation:** Remove "Report Issue" from the game header entirely. If needed, move it to parent settings or a hidden gesture (e.g., shake device, or triple-tap the title).
- **Effort:** S
- **Acceptance criteria:** No game has a "Report Issue" button visible to children during gameplay.

---

### UX-007: Duplicate Score Display (GameContainer Header + GameHUD Overlay)

- **Severity:** High
- **Category:** Consistency, cognitive load
- **User scenario:** A child plays ShapePop and sees their score displayed twice — once in the GameContainer header (top bar), and again in the GameHUD overlay below it. Both show the same number.
- **Current flow:** ShapePop uses `<GameContainer score={score}>` (shows score in header) AND renders `<GameHUD score={score} streak={streak}>` inside the game area.
- **Why this is poor UX:** Two score displays = visual clutter. A child doesn't understand why the same number appears in two places. The design spec explicitly identifies this as a problem.
- **Evidence:**
  - `src/frontend/src/pages/ShapePop.tsx` lines 438–445: `<GameContainer score={score}…>` wraps the game
  - `src/frontend/src/pages/ShapePop.tsx` lines 460–465: `<GameHUD score={score} streak={streak}…/>` rendered INSIDE GameContainer
  - GAME_UI_COMPONENT_REFACTOR.md identifies ~15 games with this duplication
- **Recommendation:** Score should appear in exactly ONE place — the GameTopBar (from the refactored component system). Remove all GameHUD instances from games that use GameContainer. GameHUD should be deprecated.
- **Effort:** S (per game, M total across ~15 games)
- **Acceptance criteria:** No game displays score in more than one UI element simultaneously.

---

### UX-008: Inconsistent Game Start Patterns

- **Severity:** High
- **Category:** Consistency, friction
- **User scenario:** A child plays three games in a row. NumberTracing starts immediately when loaded. ShapePop shows a difficulty menu first. BeginningSounds shows the game but with a Level selector always visible. Each game has a different start experience.
- **Current flow varies per game:**
  - NumberTracing: loads → immediately playing
  - ShapePop: loads → shows pre-game menu (Easy/Medium/Hard) → user picks → starts
  - BeginningSounds: loads → game is showing but Level 1/2/3 selector visible during play
  - SimonSays: loads → shows custom "start" phase with its own header
- **Why this is poor UX:** Children rely on pattern recognition. If every game works differently, they can't build confidence in the app's mechanics. Parents can't predict what their child will encounter.
- **Evidence:** Direct code review of NumberTracing.tsx, ShapePop.tsx, BeginningSounds.tsx, SimonSays.tsx — each has a unique entry pattern.
- **Recommendation:** Establish the "New Game Contract" from the refactor spec. Every game should: load → show `PreGameMenu` with game name + illustration + "Let's Go!" button (single tap) → game starts. OR: games that need no setup should start immediately. Never show configuration to the child.
- **Better flow:** Card → "Jump In!" → game loads → [optional: single "Let's Go!" screen with illustration] → playing
- **Effort:** M
- **Acceptance criteria:** All games follow one of two patterns: (A) instant start, or (B) single-screen PreGameMenu with one "Let's Go!" button (no configuration).

---

### UX-009: Streak Hearts, Floating "+10" Text, and Screen Shake — Visual Overload

- **Severity:** High
- **Category:** Kids-app expectation failure, cognitive load
- **User scenario:** A child plays ShapePop and simultaneously sees: score in header, GameHUD with streak hearts (full/empty hearts), floating "+15" text popping up, particle explosions, screen shake, a feedback bar, and a separate streak counter badge. 6+ visual layers competing for attention.
- **Current flow:** Pop a shape → screen shakes → particles explode → "+15" floats up → streak heart fills → streak badge appears → score updates in header → GameHUD score updates → feedback text changes
- **Why this is poor UX:** The design principles say "one focal point at a time" and "calm, not chaotic." This is the opposite — it's a visual assault that could overwhelm a 3-year-old.
- **Evidence:**
  - `src/frontend/src/pages/ShapePop.tsx` line 99: `const [screenShake, setScreenShake] = useState(0);`
  - `src/frontend/src/pages/ShapePop.tsx` lines 97–98: particles + floating text systems
  - `src/frontend/src/pages/ShapePop.tsx` lines 182–190: screen shake effect timer
  - `src/frontend/src/components/game/GameHUD.tsx` lines 87–119: streak hearts + animated streak badge
  - Design spec §Animation Budget: max 1 simultaneous animation during play
- **Recommendation:** Remove screen shake entirely. Remove floating score text. Remove streak hearts. Replace ALL of these with a single `GameFeedback` channel (from the refactored component system). One subtle "Nice!" message at a time, auto-dismissing. Confetti ONLY on level completion, not on every pop.
- **Effort:** M
- **Acceptance criteria:** During gameplay, at most 1 feedback animation is visible at a time. No screen shake. No floating score text. No persistent streak counters.

---

### UX-010: "Jump In!" Button Text Does Not Communicate What Happens Next

- **Severity:** Medium
- **Category:** Label mismatch
- **User scenario:** On the Games page, every game card shows "Jump In!" as the CTA. When tapped, some games immediately start playing, some show pre-game menus, and some show difficulty selection. "Jump In!" promises immediacy but doesn't always deliver.
- **Current flow:** "Jump In!" → unpredictable (sometimes immediate play, sometimes extra screens)
- **Evidence:**
  - `src/frontend/src/pages/Games.tsx` lines 312–315: `buttonText` defaults to `'Jump In!'` for most games
  - Different game pages handle entry differently (see UX-008)
- **Recommendation:** If every game starts immediately: "Jump In!" is fine. If some games have setup: either make ALL games start immediately (preferred), or change the label to "Let's Go!" which is softer and less promise-of-immediacy. Best option: make the label truthful by removing all pre-game menus so "Jump In!" always means instant play.
- **Better label:** "Play!" (universally understood, short, honest)
- **Effort:** S
- **Acceptance criteria:** Button label accurately reflects what happens next. If "Jump In!" is used, tapping it must lead directly to gameplay.

---

### UX-011: "Exit Game" Navigates to /games — But Dashboard Has Its Own Game Cards

- **Severity:** Medium
- **Category:** Navigation, consistency
- **User scenario:** A child starts a game from the Dashboard "For You" section. After finishing, they tap "Exit Game" and land on `/games` — a completely different page than where they came from. They don't see the familiar Dashboard greeting or their recommended games.
- **Current flow:** Dashboard → tap recommended game → play → "Exit Game" → `/games` page (not Dashboard)
- **Why this is poor UX:** Breaks the back-navigation mental model. The child ends up somewhere unexpected. They wanted to go "back" but ended up "forward" to a different page.
- **Evidence:**
  - All games navigate to `/games` on exit (confirmed from the navigation refactor context)
  - Dashboard has its own game cards at `src/frontend/src/pages/Dashboard.tsx` lines 522–549
- **Recommendation:** "Exit Game" should navigate to the page the user came from (use router state or history.back). If the user came from Dashboard, go back to Dashboard. If from Games page, go back to Games page. If deep-linked, go to Games page as fallback.
- **Effort:** S
- **Acceptance criteria:** Exit button returns the user to the page they navigated from, or to `/games` as a fallback.

---

### UX-012: "Right-Click to Edit" Profile — Desktop-Only, Text-Instruction UX

- **Severity:** Medium
- **Category:** Kids-app expectation failure
- **User scenario:** On the Dashboard, profile editing is triggered by right-clicking a profile avatar. A text tip says "Tip: Right-click a profile to edit." On tablets and phones (the primary devices for kids), right-click doesn't exist.
- **Evidence:**
  - `src/frontend/src/pages/Dashboard.tsx` lines 470–473: `onContextMenu={(e) => { e.preventDefault(); handleEditProfile(p); }}`
  - `src/frontend/src/pages/Dashboard.tsx` lines 500–502: `<p className="text-xs text-slate-400 mt-2 ml-2">Tip: Right-click a profile to edit</p>`
- **Recommendation:** Add a visible edit icon (pencil) button next to each profile. Remove the right-click dependency and the text tip. Long-press on mobile is an option as secondary, but a visible affordance must exist.
- **Effort:** S
- **Acceptance criteria:** Profile editing is accessible via a visible button on all devices. No text instructions about right-clicking.

---

### UX-013: CelebrationOverlay Has "Tap Anywhere to Continue" + Auto-Dismiss Race

- **Severity:** Medium
- **Category:** Recovery/momentum
- **User scenario:** A child traces a letter. The CelebrationOverlay appears. It auto-dismisses after 2 seconds AND says "Tap anywhere to continue." The child sees the celebration, reaches out to tap it (because they're told to), but it's already gone. Or they tap immediately and miss the celebration they earned.
- **Evidence:**
  - `src/frontend/src/components/CelebrationOverlay.tsx` lines 173–179: auto-dismiss after 2000ms
  - `src/frontend/src/components/CelebrationOverlay.tsx` lines 284–290: "Tap anywhere to continue" text shown at delay 1.5s — giving only 0.5s to read and act before auto-dismiss
- **Recommendation:** Remove auto-dismiss. Let the child enjoy the celebration as long as they want. Dismiss only on tap. The "Tap anywhere to continue" text can appear immediately. For 2-year-olds who can't tap reliably, add a large visible "Next!" button as well.
- **Effort:** S
- **Acceptance criteria:** CelebrationOverlay persists until explicitly dismissed by tap. No auto-dismiss timer.

---

### UX-014: Subscription/Premium Gating Language Shown to Children

- **Severity:** Medium
- **Category:** Kids-app expectation failure
- **User scenario:** A child taps a locked game and sees: "🔒 Premium Game — [Game Name] is available with a subscription. Ask a parent to unlock all games!" with a "View Plans" button. The child cannot process "subscription" or "plans."
- **Evidence:**
  - `src/frontend/src/components/GameShell.tsx` lines 148–176: access denied screen with "Premium Game" heading, "subscription" language, and "View Plans" CTA
  - `src/frontend/src/components/ui/AccessDenied.tsx` (used by GamePage)
- **Recommendation:** Replace text with a child-friendly message: "Ask a grownup to unlock this game! 🔑" with a single "Ask a Grownup" button that shows a parent-gate (math problem) before revealing pricing. Remove the word "subscription" from all child-facing UI.
- **Better label:** "This game needs a magic key! Ask a grownup to help. 🔑"
- **Effort:** S
- **Acceptance criteria:** No child-facing screen contains the words "subscription," "plan," or "premium." Locked game messaging is age-appropriate.

---

### UX-015: Search Bar and CV Filters on Games Page Are Developer/Adult Concepts

- **Severity:** Medium
- **Category:** Cognitive load, kids-app expectation failure
- **User scenario:** A 4-year-old sees a search bar with 🔍 icon and typed text input, plus filter buttons labeled "✋ Hand", "🤸 Pose", "😊 Face", "🎤 Voice". These are input-method filters that make sense to a developer but not a child. The child can't type to search.
- **Evidence:**
  - `src/frontend/src/pages/Games.tsx` lines 177–226: full search + CV filter bar
- **Recommendation:** Remove search bar and CV filters from the child-facing Games view. If parents need to find specific games, add search to a parent-accessible filter panel. Children should browse by tapping worlds/categories visually, not by typing keywords or filtering by input modality.
- **Effort:** S
- **Acceptance criteria:** No text input search field in the child-facing game browsing interface. No CV-mode filter buttons visible to children.

---

### UX-016: No "Play Again" Button on Game Completion

- **Severity:** Medium
- **Category:** Recovery/momentum
- **User scenario:** A child finishes a game. The CelebrationOverlay shows and auto-dismisses. There is no clear "Play Again!" button. The child has to navigate back to the games list and find the same game card to replay.
- **Evidence:**
  - `src/frontend/src/components/CelebrationOverlay.tsx` — no replay/restart action; `onComplete` callback exists but is used differently per game
  - NumberTracing has a reset function but no visible "Play Again" UI after completion
  - The refactored `GameResultScreen` design includes `primaryAction` for replay — but it's not yet deployed
- **Recommendation:** Every game completion screen must show a large "Play Again! 🔄" button and a secondary "Try Something New 🎮" button. This is standard in all kids' games (PBS Kids, Khan Kids, Duolingo Kids).
- **Better flow:** Game complete → Celebration → "Play Again! 🔄" (large) + "New Game 🎮" (small) → child taps
- **Effort:** M (implement via GameResultScreen migration)
- **Acceptance criteria:** Every game completion screen offers an immediate replay option.

---

### UX-017: Onboarding Flow Is Technical (Camera Test, Gesture Tutorial)

- **Severity:** Medium
- **Category:** Friction, kids-app expectation failure
- **User scenario:** First-time user lands on Home, taps "Try The Magic." An OnboardingFlow modal appears with 3 steps: Welcome → Camera Test → Gesture Tutorial. The camera step tries to automatically request permissions and shows success/error states.
- **Current flow:** Home → "Try The Magic" → OnboardingFlow (3-step modal) → Dashboard
- **Evidence:**
  - `src/frontend/src/components/OnboardingFlow.tsx` lines 12–24: 3 steps: 'welcome', 'camera', 'gesture'
  - Camera test immediately requests `getUserMedia` on step entry (line 57–70)
- **Recommendation:** Defer camera permission to the first game that needs it (the CameraSafeRoute already handles this). Remove the camera/gesture steps from initial onboarding. The onboarding should be: "Hi! Let's play! 🎉" → go directly to games. The camera prompt should happen naturally when the child enters their first camera-based game.
- **Effort:** S
- **Acceptance criteria:** First-time onboarding is ≤1 screen. Camera permission is requested in-context when needed, not upfront.

---

### UX-018: ShapePop "Home" Button Navigates to /dashboard (Not /games)

- **Severity:** Medium
- **Category:** Consistency
- **User scenario:** In ShapePop, the inline "Home" control button navigates to `/dashboard`, while the GameContainer exit button navigates to `/games`. Two exit paths go to two different destinations.
- **Evidence:**
  - `src/frontend/src/pages/ShapePop.tsx` line 407: `const goHome = () => { resetGame(); navigate('/dashboard'); };`
  - Same file line 438: `<GameContainer ... onHome={goHome}>` — passes the /dashboard navigation
  - This contradicts the navigation refactor which standardized all exits to /games
- **Recommendation:** All exit/home paths should go to `/games` consistently. ShapePop's `goHome` should be `navigate('/games')`.
- **Effort:** S
- **Acceptance criteria:** Every exit path in every game navigates to `/games`.

---

### UX-019: GameContainer Header Is 72px Tall — Large for Small Screens

- **Severity:** Low
- **Category:** Play-area design
- **User scenario:** On a phone in landscape (common for games), the GameContainer header takes 72px from the top, leaving less vertical space for the actual game. Camera thumbnail takes additional space.
- **Evidence:**
  - `src/frontend/src/components/GameContainer.tsx` line 64: `<header className='h-[72px]…>`
  - The refactored GameTopBar design spec uses `h-16` (64px) — 8px smaller
- **Recommendation:** Adopt the 64px GameTopBar as specified in the refactor. Consider auto-hiding the header during active play (e.g., after 3 seconds of activity, fade out; show on tap near top edge).
- **Effort:** S
- **Acceptance criteria:** Game header is ≤64px. No scroll/layout issues on small screens.

---

### UX-020: 7 Games Use Custom Inline Headers Instead of GameContainer

- **Severity:** Medium
- **Category:** Consistency
- **User scenario:** A child plays SimonSays (custom header), then AirCanvas (custom header with different layout), then NumberTracing (GameContainer header). Each game has a different look for exit, title, and controls placement.
- **Evidence:**
  - SimonSays: uses GameShell but builds its own in-game header
  - AirCanvas: custom `<header>` at line 395–423 with different layout + Report Issue button
  - Per GAME_UI_COMPONENT_REFACTOR.md: SimonSays, YogaAnimals, VirtualChemistryLab, AirCanvas, FreezeDance, DiscoveryLab, LetterHunt all have custom headers
- **Recommendation:** Migrate all 7 games to use GameTopBar (Phase 3 of the component refactor). This is already planned.
- **Effort:** M
- **Acceptance criteria:** All games use GameTopBar. Zero custom inline headers.

---

### UX-021: BeginningSounds Level Selector Visible During Active Gameplay

- **Severity:** Medium
- **Category:** Play-area design, cognitive load
- **User scenario:** A child is actively answering "What sound does CAT start with?" and at the top of the play area, Level 1/2/3 buttons are visible. They might accidentally tap Level 2, resetting their progress.
- **Evidence:**
  - `src/frontend/src/pages/BeginningSounds.tsx` lines 355–373: Level selector buttons rendered inside the game area, always visible regardless of game state
- **Recommendation:** Remove the level selector from the play area. If level choice is needed (which it shouldn't be per invisible rubber banding), move it to a PreGameMenu or pause menu. Never show navigation/configuration controls during active gameplay.
- **Effort:** S
- **Acceptance criteria:** No configuration controls visible during active gameplay.

---

### UX-022: Worlds/Categories Use Adult Academic Labels

- **Severity:** Low
- **Category:** Vision misalignment
- **User scenario:** A child browsing games sees category labels like "Numeracy", "Literacy", "Motor Skills" — curriculum terminology that means nothing to a child.
- **Evidence:**
  - `src/frontend/src/components/GameCard.tsx` lines 34–49: CATEGORY_COLORS includes "Numeracy", "Literacy", "Motor Skills"
  - The Worlds system (`src/frontend/src/data/worlds.ts`) has better kid-friendly names ("Letter Land", "Number Jungle", "Shape Garden") but the GameCard still shows old category labels
- **Recommendation:** Ensure only World names appear in child-facing UI ("Letter Land" not "Literacy"). Remove or hide academic category labels. The vision says: "No 'Hard' Labels" — this extends to curriculum labels too.
- **Effort:** S
- **Acceptance criteria:** No child-facing UI uses curriculum terminology ("Numeracy", "Literacy", "Motor Skills"). Only World names are shown.

---

## 4. TOP UX PRINCIPLES THE APP IS CURRENTLY VIOLATING

| # | Principle | How It's Violated |
|---|---|---|
| 1 | **Zero pre-play configuration** | ShapePop difficulty menu, BeginningSounds level selector, per-game tutorials |
| 2 | **No adult metrics shown to children** | Accuracy percentages, star ratings (1/3, 2/3, 3/3), streak counters, score breakdowns |
| 3 | **One focal point at a time** | GameContainer header + GameHUD overlay + feedback bar + floating text + particles + screen shake |
| 4 | **Consistent entry pattern** | Each game has its own start flow (instant, menu, tutorial, level selector) |
| 5 | **Label = outcome** | "Jump In!" sometimes leads to menus, not gameplay |
| 6 | **Child-facing UI has zero adult/developer concepts** | Search bar, CV filters, "Report Issue", "subscription", "Right-click to edit", "Export Progress" |
| 7 | **Pip IS the UI** for feedback | Pip barely appears during gameplay; feedback is text bars and floating numbers |
| 8 | **Playground, not catalog** | Games page is an infinite-scroll grid with search + filters, not an explorable world |

---

## 5. FASTEST HIGH-IMPACT FIXES

| Priority | Fix | Effort | Impact |
|---|---|---|---|
| 1 | Remove accuracy % and star ratings from CelebrationOverlay | S | Eliminates judgment from celebration |
| 2 | Remove "Report Issue" from AirCanvas header | S | Removes developer UI from child play |
| 3 | Remove ShapePop difficulty menu — start at medium, auto-adjust | S | Removes pre-play friction from flagship game |
| 4 | Remove BeginningSounds level selector from play area | S | Removes configuration from active gameplay |
| 5 | Fix ShapePop "Home" to go to /games not /dashboard | S | Consistent navigation |
| 6 | Remove search bar + CV filters from Games page default view | S | Reduces cognitive load dramatically |
| 7 | Remove duplicate GameHUD from games using GameContainer | S per game | Eliminates double-score display |
| 8 | Replace "Premium Game / subscription" with kid-friendly lock message | S | Age-appropriate gating language |
| 9 | Remove auto-dismiss from CelebrationOverlay | S | Let kids enjoy their celebration |
| 10 | Add "Play Again!" button to game completion | M | Critical momentum/replay loop |

---

## 6. STRUCTURAL UX PROBLEMS

### 6A. No Canonical Game Lifecycle

The app has no enforced contract for how a game starts, runs, and ends. Each of 60+ games implements its own flow. The new GameScaffold components (Phase 1 complete) define this contract but are not yet adopted by any game.

**Fix:** Complete Phase 3–4 of the component refactor. Enforce the contract: every game must use `GameScaffold` with `phase` prop controlling intro/playing/paused/complete states.

### 6B. Dashboard/Games Page Identity Crisis

The Dashboard tries to be both a parent admin panel and a child entry point. The Games page tries to be both a kid playground and a content catalog with developer filters. Neither page serves either audience well.

**Fix:** Create clear audience separation. Child view = curated games + world exploration. Parent view = profile management + progress + settings + subscription.

### 6C. Progress/Score System Leaks Internal Metrics to Children

The entire score/accuracy/streak system was designed as an internal tracking mechanism but is surfaced directly to children. A 3-year-old doesn't need to see "Score: 142" or "Accuracy: 85%" or "x3 STREAK!" — these are analytics, not UX.

**Fix:** Hide all numeric metrics from child-facing UI. Use Pip's animation intensity and celebration quality to communicate success. Show numbers only on parent-facing progress/dashboard pages.

### 6D. No Adaptive Difficulty Implementation

The vision calls for "Invisible Rubber Banding" but no game implements it. Every game that has difficulty levels exposes them as explicit user choices.

**Fix:** Build a `useAdaptiveDifficulty(gameId)` hook that tracks success rate and adjusts difficulty silently. Store difficulty per profile+game. Remove all explicit difficulty UI.

---

## 7. IDEAL TARGET PATTERN

### Card to gameplay: 1 tap

```
Games Page → Game Card shows [title] [illustration] [🎮 Play!]
         → Tap "Play!" → Game starts immediately at last difficulty
         → Camera permission handled by CameraSafeRoute if needed
         → No difficulty menu, no level selector, no tutorial blocking play
```

### During play: 1 visual layer

```
GameTopBar: [Exit] [Title] [⭐ score] [progress bar]
GameStage: [game scene only]
GameFeedback: [single transient message, auto-dismiss]
No: floating text, particles, streak hearts, duplicate scores, screen shake
```

### On completion: celebrate → replay/next

```
Game ends → GameResultScreen (overlay):
  - Pip celebrating (animation intensity scales with performance)
  - "Amazing!" / "You did it!" (no accuracy numbers)
  - [Play Again! 🔄] (large, primary)
  - [New Game 🎮] (secondary)
  → No auto-dismiss. Child controls when to proceed.
```

### Exit: back to where you came from

```
Tap [Exit Game] → return to previous page (Dashboard or Games)
If deep-linked → go to /games as fallback
```

---

## 8. FILES / AREAS TO FIX FIRST

| Priority | File(s) | What to Fix |
|---|---|---|
| **P0** | `src/frontend/src/components/CelebrationOverlay.tsx` | Remove AccuracyBadge, remove auto-dismiss, add Play Again button |
| **P0** | `src/frontend/src/pages/ShapePop.tsx` | Remove difficulty menu, remove GameHUD, remove screen shake/particles/floating text |
| **P0** | `src/frontend/src/pages/AirCanvas.tsx` | Remove "Report Issue" button |
| **P0** | `src/frontend/src/pages/BeginningSounds.tsx` | Remove level selector from play area |
| **P1** | `src/frontend/src/pages/Games.tsx` | Remove/hide search bar + CV filters; limit visible games |
| **P1** | `src/frontend/src/components/GameShell.tsx` | Replace "Premium Game" / "subscription" with kid-friendly language |
| **P1** | All 15 games with GameHUD inside GameContainer | Remove duplicate score display |
| **P2** | `src/frontend/src/pages/Dashboard.tsx` | Separate child view from parent admin |
| **P2** | All 7 custom-header games | Migrate to GameTopBar |
| **P2** | `src/frontend/src/components/OnboardingFlow.tsx` | Simplify to 1 screen, defer camera |
| **P3** | `src/frontend/src/pages/GameSelection.tsx` | Remove or gate behind parent auth |
| **P3** | `src/frontend/src/data/gameRegistry.ts` + `GameCard.tsx` | Remove difficulty badges from cards |

---

## 9. WHERE "ONE MORE PAGE / ONE MORE STEP / ONE MORE CHOICE" IS DAMAGING THE PRODUCT

| Location | Extra Step | How to Remove |
|---|---|---|
| ShapePop difficulty menu | +1 page before play | Remove; auto-adjust difficulty |
| BeginningSounds level selector | +1 decision during play | Remove; auto-progress levels |
| OnboardingFlow camera test | +2 steps before first play | Defer to CameraSafeRoute |
| Games page search/filters | +cognitive overhead before browsing | Hide behind progressive disclosure |
| Dashboard admin tools | +distraction for children | Separate child/parent views |
| ShapePop tutorial modal | +3 steps before first play | Show hints inline during play instead |
| CelebrationOverlay auto-dismiss | -1 moment of enjoyment | Remove timer, let child control |
| "Premium Game" modal | +1 confusing screen for locked games | Simplify language |
| `/game-selection` page | +1 entire page that shouldn't exist for kids | Merge into parent settings |

---

*Audit complete. Awaiting instructions before implementing changes.*
