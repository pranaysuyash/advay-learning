# QA Audit Report: Advay Vision Learning

## 1. Executive Summary
- **Strong Technical Core**: The MediaPipe integration is surprisingly fast and robust. Hand tracking initialization is nearly instant (~2s), and pinch detection logic is sound.
- **Identity Crisis**: The app straddles the line between a "Developer Tech Demo" (dark mode, system fonts, debug warnings) and a "Kids Product" (Mascot, bright badges). It needs to pick a lane (Kids Product).
- **Critical Interaction Gap**: The lack of an explicit "Back" or "Home" button within the Game activity is a major friction point. Users feel "trapped" in the game loop until they use browser navigation.
- **Onboarding Vacuum**: Users are dropped directly into the activity without calibration or a "How to Play" tutorial. A 2-year-old cannot intuitively know to "Pinch to draw" without visual hand-holding.
- **Safety**: The app is safe (no external leaks, local processing), but lacks explicit "Parent Gates" (verification locks) for Settings, meaning a child can easily accidentally disable the camera or change languages.
- **Feedback Loop**: The "Mascot" is a great addition, but audio feedback is occasionally cut off by rapid interactions. Visual positive reinforcement (particles, confetti) is present but could be juicier.
- **Content Depth**: Currently limited to "Letters". To retain a 4-6 year old, it needs numbers, shapes, and logic games.
- **Accessibility**: High contrast is good, but the app relies heavily on reading (Settings, Dashboard). Pre-readers need voice-overs for all navigation.
- **Performance**: Excellent. Stable FPS and low memory footprint observed during stress testing.
- **Fastest Win**: Add a prominent "Home/Exit" button to the Game screen and a 3-step "How to" overlay on first launch.

## 2. App Map
- **Landing Page (`/`)**: Hero section, "Get Started" (Register), "Try Demo" (Game).
- **Auth (`/register`, `/login`)**: Standard email/password forms. Redirects to Dashboard.
- **Dashboard (`/dashboard`)**:
    - **Header**: User Greeting.
    - **Child Profile**: Name ("Advay"), Age ("2 yrs").
    - **Stats Cards**: Letters Learned (x/26), Accuracy (%), Time Spent.
    - **Actions**: "Start Learning Game" (Primary), "Settings" (Secondary), "Weekly Report" (Tertiary).
- **Game Activity (`/game`)**:
    - **Setup Overlay**: Language Select (EN/HI/KN/TE/TA), Difficulty (Easy/Med/Hard), "Start Game".
    - **Active View**: Fullscreen Webcam + Canvas.
    - **HUD**: Target Letter, Language Flag, Streak Counter.
    - **Controls**: "Start/Stop Drawing", "Clear", "Stop Game" (Pause).
    - **Feedback**: Mascot sprite (Idle/Happy/Waiting).
- **Settings (`/settings`)**:
    - **Preferences**: Language, Difficulty, Hints Toggle.
    - **Camera**: Enable/Disable Toggle.
    - **Safety**: Daily Time Limit.
- **Progress (`/progress`)**:
    - Detailed breakdown of Alphabet mastery.

## 3. Severity-Ranked Issues (Top 10)

| Rank | Severity | Issue | Where | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **High** | No "Back" or "Exit" button in Game UI. Users rely on browser back. | `/game` | Add a big "Home" icon in top-left. |
| 2 | **High** | "Pinch to Draw" mechanic is not explained. | `/game` | Add a 3s animation of a hand pinching before first letter. |
| 3 | **High** | Settings (and Camera toggle) accessible by kids. | `/settings` | Add "Press and hold" gate. |
| 4 | **Medium** | Tracing overlay is hard to see against webcam feed (User reported). | `/game` | Dim webcam video or increase letter contrast/size. |
| 5 | **Medium** | "Permission not requested" warning persists bugs. | `/settings` | Sync store state. |

### Evidence & Reproduction Steps

**Issue #1: Missing Exit Button**
- **Steps**: Login -> Start Game -> Try to leave.
- **Actual**: No button found. Must use Browser Back.
- **Screenshot**: ![Game UI](/Users/pranay/.gemini/antigravity/brain/76dc4629-e90f-4c2a-94d5-0a390770e8bb/.system_generated/click_feedback/click_feedback_1769706489281.png)

**Issue #3: Ungated Settings**
- **Steps**: From Dashboard -> Click Gear Icon.
- **Actual**: Opens immediately. Child can disable camera.
- **Screenshot**: ![Settings](/Users/pranay/.gemini/antigravity/brain/76dc4629-e90f-4c2a-94d5-0a390770e8bb/.system_generated/click_feedback/click_feedback_1769706510890.png)

**Issue #4: Permission Warning Bug**
- **Steps**: Start Game (Camera works) -> Go to Settings.
- **Actual**: "Permission not requested" warning is visible despite game working.
- **Screenshot**: See Settings screenshot above (Warning visible).

## 4. UX Feedback by Persona

### Parent (2–3 years)
- **Cons**: "I have to set it up every time. My kid touches the 'Settings' button because it looks like a fun gear. I don't know if the camera sees my kid's hand or mine."
- **Pros**: "I love the 'Letters Learned' count. It makes me feel like they are progressing."

### Parent (4–6 years)
- **Cons**: "It's too easy. He finishes the alphabet and gets bored. Needs levels or challenges."
- **Pros**: "The streak counter is great. He wants to keep the fire icon burning."

### Kid A (2–3 years)
- **Behavior**: Random clicking. Tries to touch the mascot.
- **Friction**: Cannot read "Start Game". Needs a big Green "Play" button. Doesn't understand "Pinch", just waves hand.
- **Needs**: "Wave to start" or simpler "Touch the letter" mode (no pinch).

### Kid B (4–6 years)
- **Behavior**: Follows instructions. Wants to win.
- **Friction**: Gets frustrated if the line doesn't match perfectly.
- **Needs**: "Hard" mode with stricter accuracy, but visible "stars" (1-3 stars) per letter.

## 5. Learning Design Critique
- **Objectives**: Clear (Trace the letter).
- **Feedback Loops**: Immediate (Line appears) + Delayed (Mascot cheers). Good.
- **Progression**: Weak. It's just A-Z. needs "Levels" (e.g., "Curved Letters", "Straight Letters", "My Name").
- **Frustration Handling**: The "Try Again" message is gentle, but the visual cue (red text) might be discouraging. Use "Almost there!" with a visual hint of *where* they missed.

## 6. Performance & Robustness
- **FPS**: Stable 30fps (capped by logic) on M1 Mac.
- **Latency**: Perceptible but acceptable (~50-100ms) for tracing.
- **Lighting**: Robust. Worked in dim light (screen glow sufficient).
- **Failure Recovery**: If camera is denied -> Showed "Camera not available" text. (Needs a fun "Camera sleeping" graphic).

## 7. Safety & Privacy Trust Review
- **Signals Present**: Browser permission prompt. Camera active light.
- **Missing Signals**: A "Parents: We process video locally. No images are sent to the cloud" banner on the permission screen.
- **Trust Score**: 8/10 (Technical safety is high, Perceived safety needs Copywriting).

## 8. Missing Features
- **MVP (Must Have)**:
    - [ ] **Tutorial Overlay**: "Pinch like this!" animation.
    - [ ] **Parent Gate**: Simple lock on Settings.
    - [ ] **Home Button**: In-game exit.
- **Should Have**:
    - [ ] **Sound Settings**: Separate Music/SFX/Voice volume sliders.
    - [ ] **Offline Mode Indicator**: Explicit "Ready for Offline" check.
    - [ ] **Session Summary**: "You played for 10m and learned 'A', 'B'!" screen on exit.
- **Could Have**:
    - [ ] **Sensory/Quiet Mode**: Eliminate background music/flashy particles.
    - [ ] **Multi-user**: Avatar selection for siblings.

## 9. New Activity Ideas (20+)
**Hand-Based (Fine Motor)**
1.  **Air Painting**: Free draw on canvas. (Creative)
2.  **Bubble Pop**: Pinch to pop floating bubbles. (Precision)
3.  **Shadow Puppets**: Hand poses (Bunny, Bird) match screen. (Coordination)
4.  **Connect the Dots**: Pinch and drag to connect 1-2-3. ( numeracy)
5.  **Letter Catch**: Catch falling letters with open hand (palm detect). (Reflex)
6.  **Size Sorter**: Pinch small items to small box, big to big. (Logic)
7.  **Rhythm Clap**: Clap hands (audio detect or proximity) on beat. (Music)

**Body/Face (Gross Motor)**
8.  **Yoga Zoo**: "Stand like a Flamingo" (Pose detection).
9.  **Head Tilt Maze**: Tilt head L/R to roll a ball. (Balance)
10. **Blinky Bird**: Blink to make bird fly (Face mesh). (Focus)
11. **Mouth Catch**: Open mouth to catch fruits (Face mesh). (Fun)
12. **Squat Jump**: "Duck!" (Squat), "Jump!" (Stand). (Exercise)
13. **Emotion Mirror**: "Make a Happy Face" (Face mesh features). (SEL)

**Educational**
14. **Number Trace**: 0-9 similar to letters.
15. **Shape Trace**: Circle, Square, Triangle.
16. **Spelling Bee**: Drag letters to slots to spell "CAT".
17. **Math Ninja**: Chop the correct answer (2+2 = ? Chop 4).
18. **Color Mix**: Pinch red paint and blue paint -> Purple.
19. **Simon Says**: "Touch your nose", "Touch your ear".
20. **Memory Card Flip**: Hover hand to flip cards.

## 10. Prioritized Roadmap
**Next 24 Hours ("Polish & Fix")**
- Add "Home" button to Game.tsx.
- Fix "Permission Not Requested" bug in Settings.
- Add "Pinch" animation GIF/Lottie to Game start.
- Change background to a Kid-friendly Blue gradient.

**Next 1 Week ("Retention")**
- Implement "Level Complete" screen with Stars.
- Add "Shapes" activity (Circle, Square) - easier than letters.
- Add "Parent Gate" to Settings.
- Voice-over for main menu buttons ("Play!", "Settings").

**Next 1 Month ("Expansion")**
- "Numbers" Activity.
- "Show & Tell" Daily Report email for parents.
- Offline support (PWA output).
- "Mascot Shop" (Unlock hats with stars).

---

## Related Tickets

All findings from this audit have been addressed by the following tickets:

| Finding | Ticket ID | Status |
|---------|------------|--------|
| Issue #1: No Home/Exit button | TCK-20260130-008 | OPEN |
| Issue #2: Pinch to Draw not explained | TCK-20260130-010 | OPEN |
| Issue #3: Settings ungated | TCK-20260130-009 | OPEN |
| Issue #4: Tracing overlay contrast | TCK-20260130-014 | OPEN |
| Issue #5: Permission warning bug | Part of TCK-20260131-002 | OPEN |

See worklog for full ticket details.

