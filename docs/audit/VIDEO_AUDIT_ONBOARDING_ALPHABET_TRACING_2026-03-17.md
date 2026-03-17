# Video Audit: Onboarding & Alphabet Tracing — Full UX/UI Analysis

**Ticket**: TCK-20260319-014

**Source:** `~/Desktop/1.mov` (132MB, 2:23, 2306×1042 @ 60fps)
**Compressed:** `tools/qa_analysis/onboarding_review/1_compressed.mp4` (8.8MB)
**Frames:** `tools/qa_analysis/onboarding_review/frames/` (287 frames @ 2fps)
**Date:** 2026-03-17
**Skills used:** web-design-guidelines, UX audit thread T-019cf108
**Prior audit reference:** Thread T-019cf108 — Comprehensive UX Audit

---

## Executive Summary

The recording reveals a UI that looks like **an adult SaaS dashboard**, not a children's learning app for ages 3-8. Almost every screen violates the established design principles:

- **"Click play → jump to game"** — violated. User passes through **~8 screens** before tracing a letter.
- **"Zero text for young children"** — violated. Every screen is text-heavy with paragraph descriptions.
- **"Max 3 choices"** — violated. Dashboard shows 8+ game cards, games page shows 16 cards, filter bar has 17 category pills.
- **"One focal point at a time"** — violated. Gameplay HUD has 6+ concurrent UI elements (score, streak, hearts, accuracy bar, sidebar, webcam, floating buttons).

---

## Part 1: Entry Friction — The "8-Screen Gauntlet"

The recording shows the complete path from app load to first gameplay. Here's every screen the child must navigate:

```
Screen 1: Welcome modal ("Learn with Your Hands!")     [0:00]
Screen 2: "Activate Magic Vision!" camera modal        [0:02]
Screen 3: "The Pinch Gesture" tutorial                 [0:10]
Screen 4: Dashboard — browse games                     [0:17]
Screen 5: Games page — scroll through 128 games        [0:30]
Screen 6: "How to Play" Step 1 (camera again!)         [1:05]
Screen 7: "How to Play" Step 2-3 (hands/pinch again!)  [1:10-1:15]
Screen 8: "Ready to Learn?" language/difficulty modal   [1:30]
--- FINALLY: Tracing begins ---                        [1:50]
```

**It takes 1 minute 50 seconds and 8 screens to start playing.**

### What it should be:
```
Screen 1: Pip says "Hi!" (audio + animation, 3 seconds)
Screen 2: Dashboard — 4-6 large game tiles
--- Child taps a game tile → game starts immediately ---
```

**Target: 2 screens, under 10 seconds.**

### Specific Friction Issues

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| F-1 | Onboarding asks for camera permission upfront | 🔴 P0 | Frame 5 — "Activate Magic Vision!" shown before child has chosen ANY game. Camera should be requested only when a CV game is launched via `CameraSafeRoute` |
| F-2 | Pinch gesture tutorial before any game context | 🔴 P0 | Frame 20 — Teaching pinch gesture when child hasn't even seen the game yet. This is abstract and meaningless without context |
| F-3 | Game-specific tutorial REPEATS onboarding content | 🔴 P0 | Frames 130-150 — "How to Play" re-teaches camera + hands + pinch, duplicating the onboarding the child JUST completed |
| F-4 | Language/difficulty modal before play | 🟠 P1 | Frame 180 — "Ready to Learn?" shows 5 languages + difficulty slider. Should auto-default and let parents change in settings |
| F-5 | "Trace with Your Finger!" overlay before play | 🟡 P2 | Frame 160 — Yet another instruction overlay before the tracing canvas becomes interactive |

---

## Part 2: Visual Design Failures

### 2A. Header & Navigation — Adult SaaS Pattern

**Every single frame** in the recording shows an adult-style navigation bar with text links: HOME, GAMES, PROGRESS, SETTINGS, Log In, Sign Up.

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| V-1 | Full text navigation bar visible to children | 🔴 P0 | All frames — A 3-year-old cannot read "PROGRESS" or "SETTINGS." These are parent/admin functions that should be behind a parent gate |
| V-2 | Dual branding: "Advay." + "AdvayLearning" | 🟡 P2 | Frame 1 — Redundant logos waste vertical space |
| V-3 | Header consumes ~72px+ of vertical space | 🟠 P1 | All frames — Reduces playable area, especially on shorter displays. During gameplay this chrome should collapse or disappear entirely |
| V-4 | "Log In" / "Sign Up" buttons visible to children | 🟠 P1 | Frame 1 — Authentication is an adult concept. Children will accidentally tap these |
| V-5 | "Exit Demo" button in header during play | 🟠 P1 | Frames 50-120 — A child tapping this leaves the experience entirely |

### 2B. Dashboard — Adult Catalog, Not Playground

**Frames 50-60** (Dashboard / "For You"):

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| D-1 | 8+ game cards visible simultaneously | 🔴 P0 | Frame 50 — "For You" (4 cards) + "New Games" (4+ cards). Creates choice paralysis. Target: 4-6 max |
| D-2 | Every card has multi-line text descriptions | 🔴 P0 | Frame 50 — "Hidden letters are everywhere..." — A 3-year-old can't read this. Cards should be IMAGE-ONLY with large tap targets |
| D-3 | Small "Play Now!" text buttons inside cards | 🟠 P1 | Frame 50 — Button is a small orange rectangle inside the card. The ENTIRE card should be the tap target |
| D-4 | "Good morning, Guest Player!" greeting | 🟡 P2 | Frame 50 — Largest text element on screen but provides zero value to a child. Replace with Pip animation |
| D-5 | "Trending This Week" / "New Games" labels | 🟡 P2 | Frame 50 — Marketing language meaningless to children. Use visual themes (animals, space, music) instead |

### 2C. Games Page — The 128-Game Wall

**Frames 60-100** (Games / Explore pages):

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| G-1 | 16 game tiles visible in 4-column grid | 🔴 P0 | Frame 80 — Overwhelming wall of content. Target: 2x2 or 2x3 grid with large tiles |
| G-2 | 17 category filter pills exposed to children | 🔴 P0 | Frame 100 — "Letter Land, Number Jungle, Word Workshop, Science Lab..." Children cannot parse a horizontal scrolling pill cloud |
| G-3 | "Search & Filter" button visible | 🟠 P1 | Frame 100 — Children ages 3-8 cannot type search queries. This is adult-only functionality |
| G-4 | "128 GAMES READY" badge | 🟠 P1 | Frame 100/120 — Creates anxiety/paralysis. Also misleading if many games are placeholder/incomplete |
| G-5 | Multiple placeholder question-mark icons | 🟠 P1 | Frames 90-100 — "Spelling Run", "Story Builder", "Phonics Sounds", etc. show generic orange question marks instead of real thumbnails. For a non-reader, icons ARE the navigation |
| G-6 | "Jump In!" text buttons inside cards | 🟡 P2 | Frame 80 — Same as D-3; entire card should be the target. "Jump In!" label mismatch — it promises immediacy but may lead to more menus |
| G-7 | "PLAYING AS ADVAY SINHA" identity badge | 🟡 P2 | Frame 120 — Profile management concept exposed in child view |
| G-8 | Cards use identical layouts with no visual distinction | 🟡 P2 | Frame 80 — Uniform white rectangles make it hard to distinguish games at a glance. Each game should have a distinctive color/character |

### 2D. Gameplay HUD — Visual Overload

**Frames 220-287** (Active tracing):

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| H-1 | 6+ HUD elements competing for attention | 🔴 P0 | Frame 220 — Visible simultaneously: "LEVEL 1" badge, star count, 5 hearts, "TRACING ACCURACY 0%" bar, "DRAW THIS LETTER" sidebar, webcam overlay, "Hand seen — pinch to draw" tooltip, 2 floating action buttons. The child should see: the letter to trace, and NOTHING else |
| H-2 | "TRACING ACCURACY" percentage display | 🟠 P1 | Frame 220-287 — Numeric accuracy is an adult metric. Per design principles: "Remove numeric accuracy and stars. Replace with Pip animation intensity" |
| H-3 | Hearts/lives system visible during learning | 🟠 P1 | Frame 220 — Lives imply failure/punishment. For ages 3-5, learning activities should be judgment-free |
| H-4 | "DRAW THIS LETTER" sidebar card | 🟡 P2 | Frame 220 — Takes horizontal space from the canvas. The letter template IS the instruction; a separate sidebar repeating it is redundant |
| H-5 | Floating orange/red action buttons (bottom-right) | 🟡 P2 | Frames 220-287 — Unlabeled circular buttons (power icon, bell icon) that children will accidentally tap |
| H-6 | Webcam overlay shows "... you!" truncated text | 🟡 P2 | Frame 240 — Overlay text is cut off; overlay itself is too small to be useful and distracts from tracing |

---

## Part 3: TTS / Voiceover Sync Issues (User-Reported)

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| T-1 | TTS reads previous screen content while new screen shows | 🔴 P0 | Frames 140-150 — "Speaking..." button visible on step 2 while step 3 renders. Root cause: Mascot.tsx has 400ms debounce + 1500ms rate-limit. `ttsService.stop()` must be called IMMEDIATELY on step change, before debounce |
| T-2 | VoiceButton autoPlay={false} — instructions don't auto-speak | 🟠 P1 | GameTutorial.tsx line 254 — For pre-readers, step instructions MUST auto-speak. The "🔊 Listen" button requires reading to discover |
| T-3 | Kokoro model loading latency adds to TTS delay | 🟡 P2 | When Kokoro is still loading, fallback to WebSpeech adds perceptible delay. Should pre-warm Kokoro during splash/loading |

### TTS Fix Plan
```
Current (buggy):
  Step change → 400ms debounce → check 1500ms rate-limit → speak

Recommended:
  Step change → IMMEDIATELY stop() → 150ms debounce → speak (no rate-limit on step changes)

Files to modify:
  - src/frontend/src/components/Mascot.tsx (line 174-196)
  - src/frontend/src/components/OnboardingFlow.tsx (handleNext)
  - src/frontend/src/components/GameTutorial.tsx (step transitions)
```

---

## Part 4: Functional Bugs

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| B-1 | Tracing accuracy stuck at 0% despite heavy drawing | 🔴 P0 | Frames 220-287 — User draws extensively over letter "A" but accuracy never moves from 0%. Stroke-to-template matching is broken |
| B-2 | Telugu alphabet broken image | 🟠 P1 | Frame 200 — Telugu "అ" word illustration shows broken image placeholder |
| B-3 | Hand tracking drops mid-session | 🟠 P1 | Frame 280 — "Show your hand to start" while user's hand is visible in webcam feed |
| B-4 | Drawing goes wildly outside letter bounds | 🟠 P1 | Frames 240-260 — No constraint prevents strokes far outside the letter "A" template area |
| B-5 | Camera "Trying..." button stuck | 🟡 P2 | Frame 130 — Camera permission button stays on "Trying..." state |
| B-6 | Number Catch demo flash on transition | 🟡 P2 | Frame 40 — Brief flash of a different game during dashboard load |

---

## Part 5: Web Interface Guidelines Violations

Based on the Web Interface Guidelines (Vercel Labs):

| Guideline | Issue | Location |
|-----------|-------|----------|
| **Accessibility: Icon buttons need aria-label** | Floating action buttons (orange power, red bell) are icon-only with no visible label or likely aria-label | Gameplay HUD, bottom-right |
| **Touch: touch-action: manipulation** | Small "Play Now!" / "Jump In!" buttons inside cards are tiny tap targets without touch optimization | Dashboard + Games page cards |
| **Animation: Honor prefers-reduced-motion** | Framer Motion animations throughout (onboarding, card hovers, modals) with no reduced-motion variant observed | All modals + transitions |
| **Content: Handle empty states** | Placeholder question-mark icons render instead of proper empty/loading states | Games page cards |
| **Typography: Loading states end with "…"** | "Trying..." uses three dots instead of ellipsis character "…" | GameTutorial camera step |
| **Navigation: URL reflects state** | Game filter/category selection doesn't appear to update the URL | Games/Explore page |
| **Anti-pattern: div with click handler** | Game cards likely use div+onClick rather than being proper link/button elements | Dashboard + Games cards |

---

## Part 6: Recommended Design Direction

### What "Click Play → Jump to Game" Should Look Like

**App Load → Child View:**
1. Full-screen Pip greeting (audio: "Hi! Let's play!") — 3 seconds, auto-advance
2. 4-6 LARGE game tiles in 2x3 grid:
   - Each tile is ~30% of viewport
   - Full-bleed thumbnail/illustration — NO text descriptions
   - Game title spoken on hover/focus via TTS
   - Tapping ANYWHERE on the tile → game starts immediately
   - No "Play Now!" sub-buttons
3. Simple icon-only bottom nav: 🏠 Home | 🎮 Games | 🏆 Progress (trophies, not metrics)
4. Parent gate (long-press corner) → Settings, Search, Filters, Language, Accounts

**Game Load:**
1. Game canvas fills screen — NO header bar during gameplay
2. Single floating exit button (top-left corner, small)
3. NO score/hearts/accuracy/streak during play
4. Pip provides audio encouragement (not text tooltips)
5. Camera permission requested here IF needed (not upfront)
6. On completion: Pip celebrates (animation intensity = performance) + "Play Again" or "Next Game"

### Visual Style Target
- **Cards**: Bold, rounded, colorful. Each game has a unique dominant color. No white-box uniformity
- **Typography**: Large, chunky, rounded fonts (not thin sans-serif)
- **Icons**: Literal, representative (a real apple for "A is for Apple", not an abstract glyph)
- **Spacing**: Generous — touch targets ≥48px, card gaps ≥16px
- **Chrome**: Near-zero during gameplay. Hide everything that isn't the game

---

## Issue Summary

| Severity | Count | Key Themes |
|----------|-------|------------|
| 🔴 P0 | 8 | Entry friction, catalog UX, HUD overload, TTS sync, accuracy bug |
| 🟠 P1 | 12 | Adult concepts exposed, placeholder icons, metrics visible to kids, hand tracking drops |
| 🟡 P2 | 12 | Redundant elements, truncated text, minor UI polish |
| **Total** | **32** | |

### Top 5 Actions (Impact-Ordered)

1. **Kill the onboarding gauntlet** — Remove screens 1-3 entirely. Defer camera/gesture teaching to in-game contextual moments
2. **Rebuild dashboard as child playground** — 4-6 large visual tiles, no text, full-card tap targets, hide adult nav behind parent gate
3. **Strip gameplay HUD to bare minimum** — Remove hearts, accuracy %, sidebar, floating buttons. Keep ONLY: exit button + game canvas
4. **Fix TTS sync** — Immediate `stop()` on step change, enable autoPlay for pre-readers
5. **Fix tracing accuracy detection** — The core gameplay loop is broken if accuracy stays at 0%
