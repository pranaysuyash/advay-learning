# UX Audit: Alphabet Tracing Onboarding Flow

**Date:** 2026-03-17
**Source:** Video analysis of `1.mov` (2:23 at 60fps)
**Analyst:** Frame-by-frame review at 2fps (287 frames)
**Status:** 🔴 CRITICAL — Immediate remediation required

---

## Executive Summary

**The onboarding experience violates the core "click play, jump to game" principle.**

Users wait **1 minute 45 seconds** through multiple modals before actual gameplay begins. For a children's learning app targeting ages 3-8, this is unacceptable friction.

### Timeline Breakdown (from video)

| Time | Duration | Screen | User Action Required |
|------|----------|--------|---------------------|
| 0:00-0:02 | 2s | Welcome modal ("Learn with Your Hands!") | Click "Let's Get Started!" |
| 0:02-0:10 | 8s | Magic Vision modal (camera permission) | Allow camera + wait |
| 0:10-0:17 | 7s | Pinch Gesture tutorial | Read/understand, click "Start Playing!" |
| **0:17** | **→** | **Dashboard loads** | **Browse games grid** |
| 0:17-1:05 | **48s** | Dashboard browsing (Trending, Games, Progress, Explore) | Find Alphabet Tracing card |
| **1:05** | **→** | **GameTutorial Step 1: Camera Access** | Click button (stuck on "Trying...") |
| 1:10-1:15 | 5s | Step 2: Show Your Hands | Wait for hand detection |
| 1:15-1:20 | 5s | Step 3: Pinch Your Fingers | Wait for pinch detection |
| 1:20-1:25 | 5s | Step 4: Trace the Letter | Read overlay |
| **1:30** | **→** | **Language selection modal** | **Select English/Telugu** |
| **1:45** | **→** | **Actual gameplay begins** | **Finally trace letter** |

**Total time to gameplay: 105 seconds (1:45)**

---

## Critical Design Violations

### 1. Violates "Click Play, Jump to Game" Principle

**Principle:** When a child selects a game, they should be playing within seconds.

**Current Reality:** 7 separate modals/screens before gameplay:
1. Welcome modal (OnboardingFlow)
2. Magic Vision modal (OnboardingFlow)
3. Pinch tutorial (OnboardingFlow)
4. Dashboard (navigation)
5. GameTutorial Step 1 (camera)
6. GameTutorial Step 2 (hands)
7. GameTutorial Step 3 (pinch)
8. GameTutorial Step 4 (trace)
9. Language selection modal

**Impact:** Children lose interest. Parents think something is broken.

---

### 2. Duplicate Tutorial Content

**Problem:** The same content is taught twice:

| OnboardingFlow (0:00-0:17) | GameTutorial (1:05-1:25) |
|----------------------------|---------------------------|
| Magic Vision (camera) | Step 1: Camera Access |
| Pinch Gesture | Step 3: Pinch Your Fingers |

**Evidence:** Both show pinch gesture with emoji 🤏 and explanation.

**Why this happens:**
- `OnboardingFlow` is app-level onboarding (checks `onboardingCompleted` in settings)
- `GameTutorial` is per-game tutorial (checks `ALPHABET_GAME_TUTORIAL_KEY` in localStorage)
- Both run when first playing Alphabet Tracing

**Fix:** Consolidate into a single tutorial, or make app-level onboarding truly skippable and game-specific tutorial optional.

---

### 3. Dashboard is a Distraction, Not a Launcher

**Evidence:** Frames 40-130 (0:17-1:05) show user browsing dashboard for 48 seconds:
- Trending section
- Games grid with placeholder icons
- Categories (Play & Discover, For You)
- Progress page (47% complete, 68/100 avg)
- Multiple navigation clicks

**Problem:** The dashboard is designed for exploration, but the user just clicked "Try Demo" and wants to play a game.

**Expected Flow:** Demo button → Game selection (if needed) → Play
**Actual Flow:** Demo button → Onboarding → Dashboard → Browse → Select game → Another tutorial → Language → Play

---

### 4. GameTutorial Doesn't Auto-Detect as Expected

**Evidence:** Frame 130 (1:05) shows camera button stuck on "Trying..." despite camera already being granted during OnboardingFlow.

**Root Cause:**
- `OnboardingFlow` grants camera permission and stores `cameraPermissionState: 'granted'`
- But `GameTutorial` creates its own webcamRef and runs `useGameHandTracking` independently
- No shared state between the two camera instances

**User Impact:** Confusion — "I already allowed the camera, why is it asking again?"

---

### 5. Language Selection Breaks Flow

**Evidence:** Frame 200 (1:30) shows language modal AFTER all tutorials.

**Problem:**
- Language is a preference that should be set earlier
- For pre-readers (target audience), this requires parent involvement
- Breaks immersion after child is finally ready to play

**Better approach:** Set language in profile, or default to English with subtle switcher always available.

---

## Vercel Web Interface Guidelines Violations

### Rule Violation: Cluttered Interface

**Guideline:** "Focus on the primary action. Remove unnecessary elements."

**Current State:**
- Progress indicators on every modal
- Mascot Pip on every screen
- VoiceButton requiring manual click
- Multiple "Skip" buttons (creates decision paralysis)
- Decorative blobs, shadows, borders everywhere

**Evidence:**
- OnboardingFlow: 3 progress dots + title + Pip + message + 2 buttons
- GameTutorial: Step indicators + webcam preview + detection message + 2 buttons + VoiceButton
- PreGameMenu: Stats + controls + language selector + play button

---

### Rule Violation: Modal Overload

**Guideline:** "Use modals sparingly. Each modal adds cognitive load."

**Current Reality:** 4 full-screen modals before gameplay:
1. Welcome (OnboardingFlow)
2. Magic Vision (OnboardingFlow)
3. Pinch (OnboardingFlow)
4. Language (PreGameMenu)

Plus GameTutorial which is technically a modal overlay.

---

### Rule Violation: No Clear Exit

**Guideline:** "Always provide a clear way to dismiss or exit."

**Current State:**
- Multiple "Skip" buttons with different labels
- User at 0:17 clicked "Start Playing!" but got dashboard, not gameplay
- No "Play Anyway" option that bypasses tutorials
- Can't return to game from dashboard without re-navigating

---

## Recommendations

### Option A: Aggressive Streamlining (Recommended)

**Flow:** Click game → Ask camera (once) → Play

```
┌─────────────────────────────────────────────────────────────┐
│  User clicks "Alphabet Tracing"                             │
│           ↓                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Single compact modal (500px wide, not full screen)  │   │
│  │                                                       │   │
│  │  📷 Allow camera to draw in the air                  │   │
│  │                                                       │   │
│  │  [ Allow ]  [ Play with touch/mouse ]                │   │
│  └─────────────────────────────────────────────────────┘   │
│           ↓                                                  │
│  Gameplay (with subtle tutorial overlays as needed)          │
└─────────────────────────────────────────────────────────────┘
```

**Changes:**
1. Remove `OnboardingFlow` entirely for demo/guest users
2. Remove `GameTutorial` modal — teach pinch inline during first letter
3. Remove language modal — default to profile language or English
4. Dashboard becomes optional, not mandatory
5. Demo button → Direct to game or game picker (not dashboard)

---

### Option B: Progressive Disclosure (Fallback)

Keep tutorials but make them contextual and skippable:

```
┌─────────────────────────────────────────────────────────────┐
│  User clicks "Alphabet Tracing"                             │
│           ↓                                                  │
│  Gameplay starts IMMEDIATELY with default letter "A"        │
│           ↓                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Subtle overlay (dismissible)                        │   │
│  │  👆 Pinch to draw, release to stop                   │   │
│  │                       [ Got it ]                     │   │
│  └─────────────────────────────────────────────────────┘   │
│           ↓                                                  │
│  Full gameplay with real-time feedback                       │
└─────────────────────────────────────────────────────────────┘
```

**Changes:**
1. Remove `OnboardingFlow` modal
2. Start gameplay immediately on game selection
3. Show single dismissible overlay with pinch instruction
4. Language in settings/subtle menu, not modal
5. Dashboard only accessible via explicit "Browse Games" button

---

## Implementation Priority

### P0 (Critical — Fix Now)

1. **Remove OnboardingFlow for demo/guest users**
   - File: `src/frontend/src/components/OnboardingFlow.tsx`
   - Change line 84-91: Only show onboarding for registered users on first visit
   - Demo users should skip directly to dashboard or game

2. **Make GameTutorial truly skippable**
   - File: `src/frontend/src/components/GameTutorial.tsx`
   - Add "Play Now" button that skips all steps
   - Auto-advance steps faster (currently 500ms delay between detections)

3. **Direct demo flow to gameplay**
   - File: `src/frontend/src/pages/Home.tsx`
   - Change `startDemo()` to navigate directly to a game or game picker
   - Not dashboard (dashboard is for exploration, not first play)

### P1 (High — Fix This Week)

4. **Consolidate camera permission**
   - Reuse camera state between OnboardingFlow and GameTutorial
   - Don't re-request if already granted

5. **Remove language modal friction**
   - File: `src/frontend/src/pages/AlphabetGame.tsx` or `PreGameMenu.tsx`
   - Default to profile language or English
   - Show language switcher in-game, not before gameplay

6. **Simplify PreGameMenu**
   - Remove stats/progress display before playing
   - Single "Start Learning" button, not menu controls

### P2 (Medium — Next Sprint)

7. **Add "Quick Play" option**
   - Bypass dashboard entirely
   - Dropdown menu: "Play" → "Alphabet Tracing", "Yoga Animals", etc.

8. **Inline tutorials**
   - Teach pinch gesture during first letter with overlay
   - Remove separate GameTutorial modal

---

## Metrics to Track

Before/After comparison:

| Metric | Current | Target |
|--------|---------|--------|
| Time to gameplay (from demo click) | 105s | <5s |
| Number of modals before gameplay | 7 | 0-1 |
| Tutorial completion rate | ? | >80% |
| Game session start rate | ? | >90% |

---

## Files Requiring Changes

| File | Change Type | Notes |
|------|-------------|-------|
| `OnboardingFlow.tsx` | Modify | Skip for demo users |
| `GameTutorial.tsx` | Modify | Make skippable, auto-advance faster |
| `AlphabetGame.tsx` | Modify | Remove language modal before gameplay |
| `PreGameMenu.tsx` | Simplify | Reduce friction |
| `Home.tsx` | Modify | Direct demo to game, not dashboard |
| `App.tsx` / Routes | Add | Direct game launch URLs |

---

## Appendix: Video Frame References

| Frame | Time | UI Element | Issue |
|-------|------|------------|-------|
| 1-20 | 0:00-0:10 | Welcome + Magic Vision | 2 modals in 10 seconds |
| 20-35 | 0:10-0:17 | Pinch tutorial | Third modal before dashboard |
| 40-130 | 0:17-1:05 | Dashboard browsing | 48 seconds of navigation |
| 130-150 | 1:05-1:15 | GameTutorial Steps 1-2 | Duplicate camera permission |
| 150-170 | 1:15-1:25 | GameTutorial Steps 3-4 | Duplicate pinch content |
| 180 | 1:30 | Language modal | Fourth modal before gameplay |
| 200+ | 1:45+ | Gameplay | Finally started |

---

## Conclusion

The current onboarding flow is designed like a productivity app with extensive tutorials, not a children's game that should be instantly playable.

**Kids don't read tutorials.** They learn by doing.

**Recommendation:** Implement Option A (Aggressive Streamlining) and measure the impact on time-to-gameplay and session completion rate.
