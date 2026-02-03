# Video-Based Kids App Auditor v1.0 — Demo Audit

**Ticket:** TCK-20260203-044
**Source video (local path)**: `/Users/pranay/Desktop/output_under100mb.mp4`  
**Video duration**: 02:05 (Observed via ffprobe)  
**Method**: Video-only audit using timecoded frame extraction (1 fps) + targeted frame grabs at scene changes (Observed).  
**Audience / personas**: toddler (2–3), kid (4–6), kid (7–9), parent, teacher.  
**Prompt used**: User-provided “VIDEO-BASED KIDS APP AUDITOR v1.0 (TG: kids, parent, teacher)” (curated: `prompts/ux/video-based-kids-app-auditor-v1.0.md`).  

> Evidence discipline: Everything below is based on what is visible in the recording frames (Observed). Any “Implementation suspicion” is explicitly labeled and should not be treated as fact.

---

# 1) Executive Summary (max 12 bullets)

- **Kids blocker**: Most game instructions are **text-first** (e.g., “How to Play” bullets) and assume reading + conceptual pinch control; toddlers will fail before first win. (Observed ~00:06)
- **Kids blocker**: In-game **hand-tracking readiness is unclear** (dark screen + “Loading hand tracking…” with no guidance), creating “it’s broken” moments. (Observed ~00:31)
- **Kids blocker**: Core interaction relies on **pinch gesture** without a visible calibration target, making it feel unfair/jittery and requiring adult coaching. (Observed ~00:31–01:06, ~01:18+)
- **Parent/teacher blocker**: App presents as an **adult dashboard** (small nav, dense progress cards) rather than a kid-first “press one big button and play” entrypoint. (Observed ~00:00–00:03)
- **Parent/teacher blocker**: **Safety / exit flow cues** are mixed: “Home” exists, but it’s small and sometimes hidden; exit modal includes “Press Esc” (desktop-centric) and unclear kid-safe path. (Observed ~01:08–01:52)
- **Parent/teacher blocker**: **Progress meaning is unclear** (“0 XP”, “No progress recorded…”, “Next: Start practicing to sprout!”) with low legibility; hard to assess learning quickly. (Observed ~00:00–00:15, ~02:00)
- **Fast win**: Replace text-only tutorials with **voice + 5-second animated demo** of the gesture + target highlight. (Fix direction; based on observed text-heavy screens)
- **Fast win**: Add a **calibration state** (show hand silhouette + “open hand / pinch” practice) before the round starts. (Fix direction; implied by observed confusion)
- **Fast win**: Ensure every activity has a **big, kid-proof primary action** (Start/Continue) and hide adult nav while playing. (Fix direction; based on observed nav density)
- **Strategic gap**: No evidence of **permission denied / camera blocked recovery** flows in the demo; these are critical failure states for camera apps. (Not observed in video)
- **Strategic gap**: No evidence of **difficulty scaffolding** (adaptive hints, slower mode) across ages; current UI skews 6–9+ reading/gesture. (Observed setup; inference limited)
- **Strategic gap**: Limited **reinforcement variety** (mostly “Correct! Great job!”) and weak end-of-level celebration; risk of low motivation. (Observed ~00:35–01:06)

---

# 2) Timeline of issues (timecoded)

## VID-001
- time_start: 00:00
- time_end: 00:00
- surface: Dashboard
- persona(s): parent, teacher
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Dashboard “Literacy / Accuracy / Time” metrics are small, light, and easy to miss. (Observed)
- why_it_matters: Parents/teachers can’t quickly understand status; adds friction and reduces trust.  
- fix_direction: Increase metric prominence (font size/weight + contrast) and add plain-language meaning (e.g., “Letters mastered”).  
- acceptance_criteria: In a new recording, metrics are readable at normal zoom and have a short label explaining what each means.

## VID-002
- time_start: 00:00
- time_end: 00:01
- surface: Dashboard profile switcher
- persona(s): toddler, 4–6, parent
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: “+ Add Child” appears as small text next to other small controls. (Observed)
- why_it_matters: High misclick risk; kids can trigger account/management actions. Parents have a precision burden.  
- fix_direction: Make child-management actions clearly adult-only (separate area, lock, or moved into Settings) with larger spacing.  
- acceptance_criteria: In a new recording, kid-facing area does not contain child-management controls; adult flow is separated or gated.

## VID-003
- time_start: 00:00
- time_end: 00:03
- surface: Global top navigation
- persona(s): toddler, 4–6, 7–9
- severity: High
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Global nav (“Home / Games / Progress / Settings”) is always visible and small. (Observed)
- why_it_matters: Kids can accidentally leave the game; interrupts flow and causes rage-quits.  
- fix_direction: Enter “Kid Play Mode” during games: hide global nav, provide one large “Pause/Home” control with confirmation.  
- acceptance_criteria: During gameplay, top nav is hidden; exiting requires a clear confirmation step.

## VID-004
- time_start: 00:00
- time_end: 00:10
- surface: Dashboard / Games entry
- persona(s): toddler, 4–6
- severity: High
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Primary action to start playing is not a single, obvious “Play” flow; user navigates via menu to games list. (Observed)
- why_it_matters: Time-to-first-win increases; toddlers will quit.  
- fix_direction: Add a large “Play” button on landing that goes directly into the last-used game or a kid-friendly game picker.  
- acceptance_criteria: From initial load, there is one obvious large “Play” action; a child can start within ~2 taps.

## VID-005
- time_start: 00:03
- time_end: 00:03
- surface: Learning Games
- persona(s): parent, teacher
- severity: Low
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: A “MediaPipe Test Page (Dev)” link is visible at the bottom. (Observed)
- why_it_matters: Reduces trust (“unfinished”), and kids/parents can end up on dev pages.  
- fix_direction: Hide dev/test links behind a developer flag and remove from kid/parent UI.  
- acceptance_criteria: In a new recording, no dev/test links are visible in production/kid mode screens.

## VID-006
- time_start: 00:03
- time_end: 00:03
- surface: Learning Games cards
- persona(s): toddler, 4–6
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Game cards contain dense text, small age badges, and similar-looking CTA buttons. (Observed)
- why_it_matters: Kids can’t self-select; parents must read/decide.  
- fix_direction: Use big iconography, “one sentence” voice-ready labels, and differentiate CTAs (color/icon by game type).  
- acceptance_criteria: Cards are scannable without reading paragraphs; CTA labels and icons clearly differ per game.

## VID-007
- time_start: 00:06
- time_end: 00:30
- surface: Letter Hunt tutorial screen
- persona(s): toddler, 4–6
- severity: Blocker
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: “How to Play” relies on multiple lines of text (bulleted instructions, timing, “pinch”) before starting. (Observed)
- why_it_matters: Pre-readers cannot start; high adult coaching; kills “time-to-first-win”.  
- fix_direction: Replace with a 5-second playable onboarding: show hand/gesture animation, play voice, and let kids practice once.  
- acceptance_criteria: New recording shows audio/visual demo plus a short practice step; child can start without reading.

## VID-008
- time_start: 00:06
- time_end: 00:30
- surface: Letter Hunt tutorial screen
- persona(s): teacher, parent
- severity: Medium
- confidence: Medium
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: Tutorial mentions “30 seconds per round” and “complete all 10 rounds” (dense success criteria). (Observed)
- why_it_matters: Pressure may discourage; teachers need adjustable settings; younger kids need fewer rounds.  
- fix_direction: Offer “Quick Play (3 rounds)” and “Classroom (10 rounds)” presets, with visible toggle before start.  
- acceptance_criteria: New recording shows selectable session length preset before starting.

## VID-009
- time_start: 00:06
- time_end: 00:30
- surface: Letter Hunt tutorial actions
- persona(s): toddler
- severity: High
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: “Start Game” button is centered but not extremely large; “Home” is also present directly above it. (Observed)
- why_it_matters: Toddlers may hit “Home” instead of “Start”; accidental exits.  
- fix_direction: Make primary “Start” huge; move “Home” to a safe corner with confirmation.  
- acceptance_criteria: In new recording, primary action is a large single button; “Home” requires confirm or is tucked away.

## VID-010
- time_start: 00:31
- time_end: 00:32
- surface: Letter Hunt gameplay (initial)
- persona(s): toddler, 4–6
- severity: High
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Screen is mostly black with “Loading hand tracking…” text; no progress indicator or tip. (Observed)
- why_it_matters: “It’s broken” moment; children quit quickly.  
- fix_direction: Add friendly loading animation + explicit guidance (“Hold hand up like this”) and a timeout fallback.  
- acceptance_criteria: New recording shows animated loader with a tip; if loading takes >3s, shows fallback/help.

## VID-011
- time_start: 00:31
- time_end: 00:35
- surface: Letter Hunt gameplay HUD
- persona(s): 4–6, 7–9, parent
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Multiple HUD elements appear: “Home”, “Score”, “Level”, “Hand Mode/Reset” buttons. (Observed)
- why_it_matters: Cognitive load; kids tap wrong buttons; parents worry about accidental resets.  
- fix_direction: Reduce HUD to essentials; hide Reset behind “Pause” and confirm.  
- acceptance_criteria: New recording shows simplified HUD; Reset requires confirmation.

## VID-012
- time_start: 00:33
- time_end: 00:40
- surface: Letter Hunt task prompt
- persona(s): toddler, 4–6
- severity: High
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Prompt says “Find the letter ‘L’!” and bottom hint says “Point with your index finger - Pinch to select” (text). (Observed)
- why_it_matters: Requires reading + understanding pinch; toddlers won’t parse.  
- fix_direction: Use voice prompt + big letter card + gesture icons (finger point + pinch) near the hand target area.  
- acceptance_criteria: New recording shows voice and icon-based instruction; child can imitate without reading.

## VID-013
- time_start: 00:33
- time_end: 01:06
- surface: Letter Hunt selection row
- persona(s): toddler
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Answer tiles are low-contrast on dark background; letters are small relative to tile size. (Observed)
- why_it_matters: Toddlers can’t visually discriminate quickly; increases wrong picks and frustration.  
- fix_direction: Increase letter size and contrast; add distinct colors/shapes per tile.  
- acceptance_criteria: New recording shows larger letters and higher contrast; tiles are visually distinct.

## VID-014
- time_start: 00:35
- time_end: 00:36
- surface: Letter Hunt feedback (correct)
- persona(s): toddler, 4–6
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Feedback appears as “Correct! Great job!” (toast/bubble) without a clear celebration or sound indicator in the visuals. (Observed)
- why_it_matters: Reinforcement may be too subtle; toddlers need bigger “win” cues.  
- fix_direction: Add a short, calm celebration: sound + confetti-lite + tile animation + next prompt.  
- acceptance_criteria: New recording shows a 1–2s celebration animation + audible/visual reward cue.

## VID-015
- time_start: 00:35
- time_end: 00:36
- surface: Letter Hunt scoring
- persona(s): 7–9, parent, teacher
- severity: Medium
- confidence: Medium
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: Score jumps (e.g., star count in top right appears as “135” shortly after start). (Observed)
- why_it_matters: Kids/parents can’t tell why points changed; feels arbitrary/unfair.  
- fix_direction: Show “+points” breakdown after each round (speed bonus, accuracy).  
- acceptance_criteria: New recording shows points earned explanation after each selection.
- implementation_suspicion: Score may be cumulative/test data or not reset correctly (not proven).

## VID-016
- time_start: 00:44
- time_end: 00:44
- surface: Letter Hunt feedback (incorrect)
- persona(s): toddler, 4–6
- severity: High
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Error message: “Oops! That was S, not N” appears after a wrong selection. (Observed)
- why_it_matters: Corrective feedback is text-only; toddlers can’t read; increases shame/frustration.  
- fix_direction: Use visual correction: highlight correct tile, animate it, and re-voice the correct answer.  
- acceptance_criteria: New recording shows the correct tile highlighted + voice “That’s N!” and a gentle retry cue.

## VID-017
- time_start: 00:44
- time_end: 00:44
- surface: Letter Hunt error recovery
- persona(s): 4–6
- severity: Medium
- confidence: Medium
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: After wrong pick, the game continues, but the retry flow is not clearly shown as guided (no visible step-by-step). (Observed limited)
- why_it_matters: Kids need a clear “Try again” moment; otherwise they panic.  
- fix_direction: After incorrect, pause briefly, show “Try again” with arrow to the correct tile.  
- acceptance_criteria: New recording shows a short pause + explicit retry instruction after wrong pick.

## VID-018
- time_start: 01:04
- time_end: 01:06
- surface: Letter Hunt input mode switch
- persona(s): parent, teacher
- severity: Medium
- confidence: High
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: UI shows “Mouse On” and “Mouse fallback ON” while still in the camera view. (Observed)
- why_it_matters: Mixed input modes confuse users; teachers need predictable classroom control.  
- fix_direction: Make input mode explicit upfront (Camera / Mouse / Touch) and keep it stable during a session unless user confirms switch.  
- acceptance_criteria: New recording shows a clear mode picker before play; no automatic mid-session switching without prompt.
- implementation_suspicion: Hand tracking confidence may be dropping and triggering fallback (not proven).

## VID-019
- time_start: 01:07
- time_end: 01:08
- surface: Letter Hunt tutorial return
- persona(s): 4–6, parent
- severity: Medium
- confidence: High
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: User is returned to the tutorial screen (after gameplay). The transition reason is unclear on-screen. (Observed)
- why_it_matters: Feels like a reset/bug; kids lose context.  
- fix_direction: If session ends, show “Round complete” summary + “Play again” button; avoid dumping back into instructions.  
- acceptance_criteria: New recording shows explicit end state and replay.

## VID-020
- time_start: 01:08
- time_end: 01:09
- surface: Letter Hunt tutorial “Home”
- persona(s): toddler, 4–6
- severity: High
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Clicking “Home” returns to Dashboard immediately (no kid-confirm visible here). (Observed)
- why_it_matters: Kids can exit instantly and lose flow; parent must restart.  
- fix_direction: Add kid-safe “Are you sure?” confirm with a parent gate (hold-to-exit or simple math for adults).  
- acceptance_criteria: New recording shows a confirmation step before leaving any game.

## VID-021
- time_start: 00:03
- time_end: 00:27
- surface: Learning Games page
- persona(s): 7–9, parent
- severity: Low
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Age ranges shown on cards overlap inconsistently (e.g., Alphabet Tracing “3–8 years”, Finger Number Show “4–7 years”, Letter Hunt “3–6 years”). (Observed)
- why_it_matters: Parents don’t know which to pick; trust hit.  
- fix_direction: Normalize age bands and show “Best for” with a single consistent pattern.  
- acceptance_criteria: New recording shows consistent age band badges and “Best for X” messaging.

## VID-022
- time_start: 00:18
- time_end: 00:21
- surface: Learning Games → game launch
- persona(s): toddler, 4–6
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Clicking “Play Game” launches a new page without a visible loading/transition state. (Observed)
- why_it_matters: Sudden context shifts can feel like “I clicked wrong”; kids need continuity cues.  
- fix_direction: Add a short transition screen (“Get ready!”) with the game icon and a 1s loader.  
- acceptance_criteria: New recording shows a transition state between game selection and game setup.

## VID-023
- time_start: 00:21
- time_end: 00:24
- surface: Letter Finger Show (mode tab)
- persona(s): 4–6, 7–9
- severity: Medium
- confidence: High
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: “Choose Game Mode” has “Numbers” and “Letters” tabs; the page title changes (“Letter Finger Show” vs “Finger Number Show”). (Observed)
- why_it_matters: Naming inconsistency is confusing; kids/parents can’t build mental model.  
- fix_direction: Use one canonical game name and use mode sublabels (e.g., “Finger Show: Letters / Numbers”).  
- acceptance_criteria: New recording shows consistent game naming across list, setup, and gameplay.

## VID-024
- time_start: 00:21
- time_end: 00:24
- surface: Letter Finger Show language row
- persona(s): 4–6, parent
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Language selection uses small pill buttons with flags; no native-script labels visible here. (Observed)
- why_it_matters: Kids/parents may not map flags to language; multilingual classrooms need clarity.  
- fix_direction: Show native-script label first (e.g., “தமிழ்”), with English secondary, and optional flag.  
- acceptance_criteria: New recording shows each language pill including native script + English.

## VID-025
- time_start: 00:21
- time_end: 00:24
- surface: Letter Finger Show instruction block
- persona(s): toddler, 4–6
- severity: High
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Instruction text includes “A=1 finger, B=2 fingers…” (reading + mapping requirement). (Observed)
- why_it_matters: 2–3 can’t do it; 4–6 may struggle; parents must coach.  
- fix_direction: Provide non-reading mapping via visuals (finger icons + letter cards) and optional voice.  
- acceptance_criteria: New recording shows visual mapping and voice prompt; no reliance on text.

## VID-026
- time_start: 00:24
- time_end: 00:27
- surface: Finger Number Show difficulty
- persona(s): teacher, parent
- severity: Medium
- confidence: High
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: Difficulty buttons show “Level 1 0–2”, “Level 2 0–5”, “Level 3 0–10”, “Duo Mode 0–20” without explanation. (Observed)
- why_it_matters: Teachers need to select appropriate range quickly; kids can’t.  
- fix_direction: Add “Recommended” label and a brief explanation (“Counts up to 5”) plus a default selection.  
- acceptance_criteria: New recording shows one default difficulty and explanation; teacher can pick in one tap.

## VID-027
- time_start: 00:24
- time_end: 00:24
- surface: Finger Number Show primary action
- persona(s): toddler
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: “Start Game” appears but is not huge; “Home” icon is near it. (Observed)
- why_it_matters: Misclick risk; toddler exits.  
- fix_direction: Make “Start” full-width/large; hide “Home” or confirm.  
- acceptance_criteria: New recording shows one dominant “Start” and safe exit behavior.

## VID-028
- time_start: 00:29
- time_end: 00:30
- surface: Letter Hunt tutorial revisit
- persona(s): parent
- severity: Low
- confidence: Medium
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: User returns again to Letter Hunt tutorial screen before starting gameplay. (Observed limited)
- why_it_matters: Indicates navigation friction: too many steps between selection and play.  
- fix_direction: Provide “Quick Start” that skips the tutorial after first time (with a replay-help button).  
- acceptance_criteria: New recording shows tutorial only first time, then a quick start path.

## VID-029
- time_start: 00:33
- time_end: 01:06
- surface: Letter Hunt camera view
- persona(s): parent
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Camera view shows the environment; there is no visible privacy reassurance or “camera not recorded” indicator. (Observed)
- why_it_matters: Parents worry about recording/storage; critical for trust in kid camera apps.  
- fix_direction: Add a clear “Camera used only for on-device tracking. Not recorded.” badge + link in settings.  
- acceptance_criteria: New recording shows a persistent, readable privacy badge during camera activities.

## VID-030
- time_start: 01:11
- time_end: 01:12
- surface: Alphabet Tracing (Learning Game) setup
- persona(s): 4–6
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Setup area is far down the page; user scrolls to reach language and “Start Learning!”. (Observed)
- why_it_matters: Extra scrolling is difficult on tablets; kids may not find the start button.  
- fix_direction: Keep the primary “Start” above the fold; compress header area.  
- acceptance_criteria: New recording shows start controls visible without scrolling on common screens.

## VID-031
- time_start: 01:12
- time_end: 01:15
- surface: Alphabet Tracing language selection
- persona(s): toddler, 4–6, parent
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Language pills display English names (e.g., “Tamil”) rather than native script; a non-English letter/word appears above. (Observed)
- why_it_matters: Kids learning that script need to see native names; parents may mis-select.  
- fix_direction: Use bilingual labels with native script primary.  
- acceptance_criteria: New recording shows “தமிழ் (Tamil)” on the pill.

## VID-032
- time_start: 01:12
- time_end: 01:16
- surface: Wellness Timer overlay
- persona(s): toddler, 4–6, teacher
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: “Wellness Timer” overlay panel sits on the right during setup and gameplay. (Observed)
- why_it_matters: Visual clutter; covers game; teachers don’t want timers on the kid canvas.  
- fix_direction: Make wellness timer optional and minimized by default (tiny icon) or move to parent/teacher view.  
- acceptance_criteria: New recording shows timer off/minimized in kid mode; can be enabled in settings.

## VID-033
- time_start: 01:16
- time_end: 01:18
- surface: Tamil Alphabet gameplay (start state)
- persona(s): toddler, 4–6
- severity: High
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Game starts on a dark screen with “Show your hand to start” but no visible hand target. (Observed)
- why_it_matters: Kids don’t know where to place hand; feels broken.  
- fix_direction: Show a hand silhouette/target box and a “move closer/farther” guide.  
- acceptance_criteria: New recording shows an on-screen hand target and distance cue.

## VID-034
- time_start: 01:17
- time_end: 01:18
- surface: Tamil Alphabet gameplay (camera ready)
- persona(s): toddler, 4–6
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: “Camera ready!” appears as a small speech bubble near mascot. (Observed)
- why_it_matters: Status is easy to miss; kids may not realize they can begin.  
- fix_direction: Use a large center “Ready!” animation and automatically prompt the next action (e.g., “Pinch to draw”).  
- acceptance_criteria: New recording shows a prominent “Ready” cue and immediate next-step instruction.

## VID-035
- time_start: 01:18
- time_end: 01:22
- surface: Tamil Alphabet gameplay (gesture instruction)
- persona(s): toddler, 4–6
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Status text reads “Hand seen — pinch to draw” near the top; it’s small and text-based. (Observed)
- why_it_matters: Kids can’t read; they need icons and immediate demo.  
- fix_direction: Replace with icons + animated pinch demo near the cursor/hand marker.  
- acceptance_criteria: New recording shows an icon-based prompt and brief animation.

## VID-036
- time_start: 01:18
- time_end: 01:24
- surface: Tamil Alphabet gameplay (cursor/line)
- persona(s): 4–6, 7–9
- severity: Medium
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: A red drawing line appears and can sweep across the screen (large strokes visible). (Observed)
- why_it_matters: Without constraints/smoothing, drawing can look messy and feel unfair; kids don’t know if they’re tracing correctly.  
- fix_direction: Add path guidance: thicker ghost path, “snap-to-path” tolerance, and smoothing to reduce jitter.  
- acceptance_criteria: New recording shows smoother line and visible “on-path/off-path” feedback.

## VID-037
- time_start: 01:18
- time_end: 01:24
- surface: Tamil Alphabet gameplay (letter visibility)
- persona(s): 4–6
- severity: Medium
- confidence: High
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: The trace template letter is faint/large in the background; active target/starting point is not obvious. (Observed)
- why_it_matters: Kids don’t know where to start; they scribble.  
- fix_direction: Show a glowing start dot + directional arrows + step-by-step segments.  
- acceptance_criteria: New recording shows a clear starting point and direction cues.

## VID-038
- time_start: 01:16
- time_end: 01:52
- surface: Tamil Alphabet gameplay (reward/progress)
- persona(s): 4–6, 7–9
- severity: Medium
- confidence: Medium
- frequency_likelihood: High
- type: User-facing issue
- what_happens: No visible “progress bar” for completing the trace or clear completion state is shown within the frames; user keeps drawing. (Observed limited)
- why_it_matters: Kids need a finish line; without it they scribble and lose satisfaction.  
- fix_direction: Add segment completion + “You did it!” end state with next button.  
- acceptance_criteria: New recording shows a completion moment and a clear next action.

## VID-039
- time_start: 01:52
- time_end: 01:52
- surface: Exit modal
- persona(s): parent, teacher
- severity: Medium
- confidence: High
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: Modal says “Save Progress?” with buttons “Save & Go Home” and “Keep Playing”, plus “Press Esc to cancel”. (Observed)
- why_it_matters: “Esc” is irrelevant on tablets; also unclear if progress is auto-saved; teachers need consistent exit semantics.  
- fix_direction: Remove keyboard-only instruction; clarify autosave; add explicit “Exit without saving” (adult-only) if needed.  
- acceptance_criteria: New recording shows touch-first modal copy; no “Press Esc”.

## VID-040
- time_start: 01:52
- time_end: 01:53
- surface: Exit modal buttons
- persona(s): toddler, 4–6
- severity: High
- confidence: High
- frequency_likelihood: High
- type: User-facing issue
- what_happens: “Save & Go Home” is the primary button and looks tappable by kids. (Observed)
- why_it_matters: Kids will exit unintentionally and break session flow.  
- fix_direction: Gate exits behind a parent action (hold 2s, corner pattern) or hide exit UI during kid play.  
- acceptance_criteria: New recording shows kid-safe gating before leaving gameplay.

## VID-041
- time_start: 01:54
- time_end: 02:00
- surface: Learning Progress page
- persona(s): parent, teacher
- severity: Medium
- confidence: Medium
- frequency_likelihood: High
- type: User-facing issue
- what_happens: Progress page shows multiple colored cards (Practice/Mastery/Challenge/Consistency) with “0/100” and “No data” type text. (Observed)
- why_it_matters: Hard to interpret; does not tell parent/teacher what to do next.  
- fix_direction: Replace “No data” with a clear action (“Play Letter Hunt once to start tracking”) and show next recommended game.  
- acceptance_criteria: New recording shows a concrete next-step CTA on empty progress.

## VID-042
- time_start: 02:00
- time_end: 02:03
- surface: Learning Progress header filters
- persona(s): parent, teacher
- severity: Low
- confidence: Medium
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: Filter chips/buttons appear near the top; labels are not clearly legible in the frames. (Observed limited)
- why_it_matters: Filters that aren’t readable aren’t usable; adds clutter.  
- fix_direction: Increase contrast/size; use explicit labels and default to “All”.  
- acceptance_criteria: New recording shows clearly readable filter labels and selected state.

## VID-043
- time_start: 02:05
- time_end: 02:05
- surface: End of recording
- persona(s): parent, teacher
- severity: Low
- confidence: High
- frequency_likelihood: Medium
- type: User-facing issue
- what_happens: OS screenshot UI (“Capture”) appears, suggesting the app may not provide an in-app way to share/export progress. (Observed)
- why_it_matters: Teachers/parents want shareable summaries; absence pushes them to screenshots.  
- fix_direction: Add “Share progress” (export PDF/image) in Progress view.  
- acceptance_criteria: New recording shows an in-app export/share option.

---

# 3) Activity-by-activity audit

## A) Learning Games (selection)
- Time range: 00:03–00:29
- Objective clarity (0–10): 6
- Fun (0–10): 4
- Fairness/robustness (0–10): 8 (selection is stable; no camera yet)
- Coaching required (0–10, higher = worse): 4
- Notes (Observed):
  - Cards are readable for adults; not kid-self-serve.
  - Dev link visible (“MediaPipe Test Page (Dev)”).
- Top 5 fixes:
  1. Kid-first “big tiles” mode with voice labels.
  2. Remove dev/test links from user UI.
  3. Consistent age/difficulty labeling.
  4. Visual “what you do” 3-second preview per game.
  5. One-tap “Quick Play” route.

## B) Letter Hunt (tutorial + gameplay)
- Time range: 00:06–01:08
- Objective clarity (0–10): 5
- Fun (0–10): 6
- Fairness/robustness (0–10): 5 (hand tracking + pinch)
- Coaching required (0–10, higher = worse): 8
- Notes (Observed):
  - Text-heavy tutorial and gesture reliance.
  - Loading hand tracking state is minimal.
  - Feedback exists but is mostly text-toasts.
  - Input mode flips to mouse fallback.
- Top 5 fixes:
  1. Gesture onboarding + practice (voice + icons).
  2. Better loading + calibration states.
  3. Stronger reinforcement (animation + sound).
  4. Clear score explanation.
  5. Stable input mode per session.

## C) Finger Number Show / Letter Finger Show (setup only)
- Time range: 00:21–00:27
- Objective clarity (0–10): 6
- Fun (0–10): 5 (setup only)
- Fairness/robustness (0–10): Unknown (not observed in gameplay)
- Coaching required (0–10, higher = worse): 7 (text mapping A=1 finger etc.)
- Notes (Observed):
  - Mode naming inconsistency.
  - Difficulty ranges not explained.
- Top 5 fixes:
  1. Rename + unify game title/modes.
  2. Visual mapping (letters ↔ fingers) + voice.
  3. Default recommended difficulty.
  4. Big start + safe home.
  5. Add quick “practice recognition” calibration.

## D) Alphabet Tracing (Tamil flow + gameplay)
- Time range: 01:11–01:52
- Objective clarity (0–10): 6
- Fun (0–10): 5
- Fairness/robustness (0–10): 4 (jitter/precision risk)
- Coaching required (0–10, higher = worse): 7
- Notes (Observed):
  - Scroll needed to reach setup.
  - “Show your hand to start” without a target.
  - Drawing/trace seems unconstrained.
- Top 5 fixes:
  1. Keep start controls above fold.
  2. Calibration target box + distance guidance.
  3. Segment-based tracing with start dot + arrows.
  4. Smoothing + on-path feedback.
  5. Completion state + next letter flow.

---

# 4) Design system and consistency notes (from video)

- Light “dashboard/app” theme vs dark “camera gameplay” theme feels like two products (Observed).
- “Home” appears as top nav text in app pages, but as a small icon/button in game pages (Observed).
- Primary CTA buttons vary (orange “Play Game”, green “Start Game”, different shapes) without consistent meaning (Observed).
- Toast feedback styling is inconsistent in size/placement (center vs corner speech bubble) (Observed).
- Prototype tell: dev/test link visible in a user-facing screen (Observed).

**10 changes that most increase “kids app” feel (directional)**
1. Big, voice-labeled game tiles (tap to hear).
2. Mascot-led onboarding with 5s demo.
3. Larger, bouncier but calm animations for success.
4. Use consistent “kid mode” header during games (minimal UI).
5. More playful typography for kid-facing pages (still readable).
6. Color-code primary actions (Start/Next/Retry) consistently across games.
7. Add friendly “hand target box” overlay during camera games.
8. Show simple progress meters during play (“2/5 stars”).
9. Replace long paragraphs with icon cards.
10. Add end-of-level summary with a sticker/collectible.

---

# 5) Behaviour and motivation lens

- **Frustration triggers observed**
  - Waiting on “Loading hand tracking…” with no guidance (00:31).
  - Wrong answer feedback is text-only and mildly scolding (“Oops! That was S, not N”) (00:44).
  - Unclear start mechanics (“Show your hand to start”) without target (01:16).
- **Overstimulation risks observed**
  - Large red tracing strokes over the camera feed can dominate the screen; if jittery, it can feel chaotic (01:18+).
  - UI overlays (Wellness Timer) compete with game content (01:11+).
- **Reinforcement quality**
  - Feedback exists (“Correct! Great job!”) but is generic and may not build learning (“You found N!”) (00:35+).
- **Calm mode recommendations (UI changes)**
  - Offer “Calm Mode” toggle: reduce overlays, slow animations, and emphasize gentle voice guidance.
  - Use consistent, low-saturation success effects (no flashing) and a short “breathe” pause after errors.

---

# 6) What’s missing (inferred only if clearly absent from video)

- Permission denied recovery (camera blocked) — **Not observed in video**.
- Explicit tracking-lost state (“I can’t see your hand”) — **Not observed in video** (only “loading” and “hand seen”).
- Pause/resume and “take a break” flow inside games — **Not observed in video** (wellness timer exists but no pause flow shown).
- Teacher “classroom reset” (reset all progress / quick start for next student) — **Not observed in video**.
- Audio settings / mute-friendly UX verification — **Unknown** (audio not verifiable via frames).

---

# State Audit (required)

## Permission denied
- Exists: Not observed in video
- Recovery quality: Unknown
- Missing: Pre-permission explanation, deny handling, retry CTA, fallback input mode picker.

## Tracking lost
- Exists: Not observed explicitly
- Recovery quality: Unknown
- Missing: “We lost your hand” overlay + re-calibration guidance + auto-pause.

## Loading
- Exists: Yes (“Loading hand tracking…”) (00:31)
- Recovery quality: Weak (no progress/tips) (Observed)
- Missing: animated indicator + tips + timeout fallback.

## Empty state
- Exists: Yes (“No progress recorded…”, “No data…”) (00:00, ~02:00)
- Recovery quality: Weak (low-action guidance) (Observed)
- Missing: direct “Start a game to begin tracking” CTA.

## Success state
- Exists: Yes (“Correct! Great job!”) (00:35+)
- Recovery quality: Moderate (immediate feedback) (Observed)
- Missing: specific reinforcement + small celebration + clear next prompt animation.

## Exit flow
- Exists: Yes (“Save Progress?” modal) (01:52)
- Recovery quality: Mixed (clear buttons, but desktop-centric “Esc”) (Observed)
- Missing: kid-safe exit gating + clearer autosave messaging.

---

# 7) Top 20 ticket list (prioritized)

> Each ticket references VID issues above. Effort is a rough UX+frontend estimate (S/M/L). Risks call out potential product/regression risk.

1) **Kid-first game onboarding (voice + gesture demo)** — Effort: M — Risks: needs audio assets, accessibility toggles  
   - Covers: VID-007, VID-012, VID-025, VID-035

2) **Hand tracking loading + calibration state** — Effort: M — Risks: calibration UX must not block older kids  
   - Covers: VID-010, VID-033, VID-034

3) **Kid Mode navigation (hide top nav during play + safe exit)** — Effort: M — Risks: impacts routing and teacher flows  
   - Covers: VID-003, VID-020, VID-040

4) **Replace text-only error feedback with visual+voice correction** — Effort: S — Risks: ensure it doesn’t feel punitive  
   - Covers: VID-016, VID-017

5) **Score transparency (“why did I get points?”)** — Effort: S — Risks: may reveal scoring bugs  
   - Covers: VID-015

6) **Stabilize input mode per session + explicit mode picker** — Effort: M — Risks: edge cases for accessibility  
   - Covers: VID-018

7) **Increase tile/letter legibility in Letter Hunt** — Effort: S — Risks: layout break on small screens  
   - Covers: VID-013

8) **Make “Start” always above-the-fold and dominant** — Effort: S — Risks: responsive layout changes  
   - Covers: VID-009, VID-027, VID-030

9) **Tracing guidance: start dot + segment arrows** — Effort: M — Risks: multi-script letter complexities  
   - Covers: VID-037

10) **Tracing smoothing + on-path feedback** — Effort: L — Risks: performance, perceived fairness tuning  
   - Covers: VID-036

11) **Clear trace completion + next letter flow** — Effort: M — Risks: progress persistence semantics  
   - Covers: VID-038

12) **Make wellness timer optional/minimized in kid mode** — Effort: S — Risks: may reduce “wellness” feature visibility  
   - Covers: VID-032

13) **Unify game naming (“Finger Show” vs “Finger Number Show”)** — Effort: S — Risks: analytics/progress mapping  
   - Covers: VID-023

14) **Language pills: native script + English label** — Effort: S — Risks: translation/localization asset work  
   - Covers: VID-024, VID-031

15) **Explain difficulty ranges (recommended defaults)** — Effort: S — Risks: none  
   - Covers: VID-026

16) **Remove dev/test links from user UI** — Effort: S — Risks: developers lose shortcut unless gated  
   - Covers: VID-005

17) **Empty progress: actionable CTA (“Play once to start tracking”)** — Effort: S — Risks: needs correct routing targets  
   - Covers: VID-041

18) **Progress readability improvements (contrast/labels)** — Effort: S — Risks: none  
   - Covers: VID-001, VID-041, VID-042

19) **End-of-session summary + replay from gameplay** — Effort: M — Risks: needs consistent end conditions  
   - Covers: VID-019

20) **In-app export/share of progress (teacher-friendly)** — Effort: L — Risks: privacy/PII handling  
   - Covers: VID-043

