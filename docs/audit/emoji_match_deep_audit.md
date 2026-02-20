# UI/UX & QA Deep Audit — Emoji Match (7-Angle Review)
**Video:** `emoji_match.mov` | **Date:** 2026-02-20 | **Reviewer:** Senior UX + QA + Child Dev Psychology

---

## Summary

The technical core of "Emoji Match" is fundamentally broken for its target audience of 2–5 year olds. The primary failures are **crippling input latency** (measured at ~160–230ms), a **microscopic cursor** that lacks contrast and affordance, and **punishingly small target hitboxes** that demand adult-level fine motor precision. The game loop suffers from "silent failures" where tracking loss is never communicated to the child, and the feedback rhythm is out of sync with toddler processing speeds, often moving to the next challenge before the child has even cognitively registered their success. Essentially, it is a game that requires the hand-eye coordination of a teenager but uses the visual language of a toddler, creating a massive "frustration gap."

---

## Metrics Snapshot

| Metric | Observed Value | Target Value | Verdict |
| :--- | :--- | :--- | :--- |
| Tracking Latency | ~166ms – 233ms (5–7 frames @ 30fps) | < 100ms | **FAIL (S1)** |
| Jitter Rating | Medium-High (snapping at edges) | Low / None | **FAIL (S2)** |
| Cursor Size | ~1.2% of screen height | 5–8% | **FAIL (S1)** |
| Min Target Size | ~8% screen height (exact hitbox) | 15–20% (forgiving) | **FAIL (S1)** |
| Fastest Transition | 350ms (level end → next) | > 1000ms | **FAIL (S2)** |
| Voice-Over / Audio Guide | Partial (names only, no instructions) | Full instruction VO | **FAIL (S3)** |
| Fail Recovery Time | ~2.5s | < 1.0s | **POOR (S2)** |

---

## Angle 1: Hand-Tracking Systems Audit

### A. Latency & Lag
- **0:04–0:07** — Hand sweeps left; cursor begins moving 5–7 frames later. At 30fps, this is **~166–233ms** of end-to-end lag.
- **0:12** — Second rapid sweep confirms the same frame delta range: **~5–6 frames (~166–200ms)**.
- **0:45** — UNCERTAIN: lag appears to worsen slightly (~7–8 frames) versus early in the session; could indicate **thermal throttling** on the device.
- **Pattern:** Lag appears variable, not constant — suggesting adaptive processing or device load fluctuations, not a fixed pipeline delay.

### B. Confidence & Stability
- **0:09** — With hand partially occluded (sleeve overlap), cursor **snaps to position 0,0 (top-left corner)** rather than fading or freezing.
- **0:18** — Near the screen edge, the cursor vibrates rapidly over 5+ frames (micro-jitter) before settling. Triggered by edge-of-frame confidence drop.
- **Recovery time:** ~15–20 frames (0.5–0.67s at 30fps) after hand re-enters full view. Too slow for a toddler.

### C. Filtering & Smoothing
- Cursor motion shows **curved/lagging trailing** rather than straight-line following, indicating a **low-pass or exponential moving average (EMA) filter** is active.
- The smoothing is over-tuned: it reduces jitter at the cost of unacceptable latency. A **One-Euro Filter** would trade latency dynamically based on velocity.
- At high velocity (fast sweeps), smoothing is not reduced — a **velocity-aware filter** is absent.

### D. Gesture Recognition
- **Selection method:** Appears to be **position/hover-based** (dot must be inside hitbox). No dwell time, no pinch observed.
- **0:08, 0:15** — Cursor clearly overlaps the visual edge of an emoji but no selection fires. Confirms hitboxes are smaller than rendered bounds.
- **0:22** — UNCERTAIN: a momentary selection appears to fire with the cursor *near but not inside* the target. Possible phantom activation or mis-read hitbox edge.

---

## Angle 2: Visual Design & Accessibility Audit

### A. Cursor / Dot Design
- **Color:** Bright green/lime (~HSL 120, 80%, 50%). On pastel-heavy backgrounds this is adequate, BUT:
- **0:12** — Background includes a green grass tile. Cursor **completely disappears** into the background. No border, no shadow.
- **Size:** Estimated ~1.2% of screen height. On a 1080p screen: ~13px. On a 10" iPad: ~3mm diameter. This is **below the minimum legible size for a toddler at arm's length**.
- Required: At minimum **5% screen height** (≥50px on 1080p) with a 2px white border and drop shadow.
- **Affordance:** The dot does not communicate "this is your hand / this is what you control." A hand icon or pulsing ring would greatly improve discoverability.
- **WCAG:** Cursor has no 3:1 contrast ratio against all backgrounds. Fails WCAG 2.1 Non-Text Contrast (1.4.11).

### B. Target / Button Design
- **Emoji hitboxes:** Estimated ~8% screen height by visual bounds. Actual collision hitbox appears smaller (confirmed by miss events at 0:08, 0:15, 0:18).
- Apple HIG minimum: 44×44pt (~6mm physical). These targets are below that threshold at normal viewing distance.
- **Gap between targets:** Estimated 15–20px (insufficient to prevent accidental wrong-target hits). Targets need ≥44px gaps to reduce misfires.
- **Press states:** UNCERTAIN — no visible scale/color change on hover or activation. If absent, the child has no pre-selection feedback.

### C. Visual Hierarchy
- **Primary focus element (the target emoji to match)** is displayed at the top-center: acceptable placement.
- **Distractor emojis** are similar in size and visual weight — they do not feel subordinate to the target.
- No directional glow, ring, or arrow pointing from the target to the choices.
- The cursor (primary interaction object) is the smallest element on screen — inverted hierarchy.

### D. Color
- **0:12** — Green cursor on green background: color-only signal fails for deuteranopia (red-green colorblindness, affects ~8% of males).
- **0:30** — Text labels on some emoji options appear in gray-on-gray sub-12px font. Unreadable at toddler viewing distance.

### E. Animations
- **0:25** — Level transition takes ~350ms: too fast for toddler to parse as state change.
- Success animation (brief particle burst): lasts ~500ms. Insufficient for 2–4 yr old to feel rewarded.
- No slow-motion "freeze frame" on correct match to lock attention. Every competitor game (see: Endless Alphabet) holds for 1.5–2s.

---

## Angle 3: UX / Game Loop Audit

### State Machine Table

| State | Entry Condition | Child Goal | System Signals | Observed Failures | Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Intro/Title** | App load | N/A (passive) | Static title text, no audio | No "raise your hand" prompt. | Animated hand silhouette with pulsing ring. |
| **Hand Detection** | Hand enters frame | Get cursor to appear | Cursor appears on detection | Silent failure if hand is angled wrong. | "I see you! 👋" text + sound on detection. |
| **Active Play** | Hand detected | Move dot to match emoji | Dot + target emoji | Lag + tiny hitbox = constant miss. | 3x cursor, 2x hitbox, <100ms latency. |
| **Tracking Lost** | Hand leaves or occluded | Re-enter hand | NONE (dot vanishes) | Child believes game is broken. | "Where's your hand?" overlay. |
| **Correct Match** | Hitbox overlap | Experience win | Sound + next level load | Transition too fast; sound too soft. | 1.5s freeze + VO "Yes! That's the 🐱!" |
| **Wrong Match** | Hover wrong emoji | Learn/retry | Subtle bounce (if any) | Ambiguous failure — child may not notice. | Distinct "oops" sound + emoji shakes. |
| **Level End** | All matches done | Feel accomplished | None visible | No "You did it!" summary screen. | Add a 3s celebration screen before restart. |

### Onboarding & Instructions
- **0:00–0:03** — No onboarding. Game starts directly with the matching interface.
- A non-reading toddler must guess that they should move their hand toward matching emojis. There is **no self-discovery affordance**.
- Minimum needed: 3-step animated tutorial showing hand → dot → emoji.

### Feedback Quality
- **Success:** 1 modality (audio only — brief ding). No VO. No extended visual reward. **Insufficient.**
- **Failure/Mismatch:** UNCERTAIN — a faint bounce animation may occur at ~0:20, but it is not visible enough to confirm.
- **Silence windows:** ~0.5–1.0s of silence between match and next prompt. For a toddler, this is an eternity that signals "is the game working?"

### Pacing & Cognitive Load
- Response window appears unlimited (no countdown), which is positive.
- Time between success and next challenge: **~350ms** — far too fast.
- On-screen elements at peak: target emoji (top), 4 choice emojis (grid), cursor, background. That is **6+ competing visual elements** — exceeds toddler attention bandwidth.

---

## Angle 4: Audio Audit

- **Background music:** Present throughout. Volume appears adequate but continuous looping without variation will bore/annoy after 2–3 minutes.
- **Sound effects:** Match confirmed = high-pitched ding (~0:07). No hover sound detected. No distinct mismatch sound confirmed.
- **Voice-over (VO):** UNCERTAIN — there may be single-word emoji name audio on match, but no instructional VO (e.g., "Find the apple!") observed.
- **Missing audio cues:**
  - Game start / "Raise your hand!"
  - "Find the [emoji]!" at round start
  - "Oops! Try again!" on mismatch
  - Level-complete fanfare
- **Audio-visual sync:** UNCERTAIN (cannot precisely measure offset from video without frame tools), but no gross desync observed.
- **Toddler-appropriateness:** No sudden loud sounds observed. Background music is calm. Positive.

---

## Angle 5: Child Development & Cognitive Load Audit

### Fine Motor Control
- Age 2: ~2–3cm pointing imprecision. Target hitboxes require <5mm precision. **Gap: 4–6×.**
- Age 4: ~1cm imprecision. Still 2× tighter than toddlers can reliably hit.
- The game is effectively gated behind a motor skill milestone that most of its target audience has not yet reached.

### Working Memory
- The child must hold in mind: (1) the target emoji, (2) the dot's position, (3) which choice to move toward.
- That is 3 simultaneous memory slots — at the upper limit of a 4-year-old, and 1 slot beyond a 2-year-old's capacity.
- Reducing to 2 choices (instead of 4) in early levels would cut load by ~33%.

### Attention Span & Novelty Loop
- **0:00–end** — No visible novelty mechanic (new backgrounds, character reactions, countdown). The visual environment appears constant.
- Without reinforcement variation, engagement for under-3s likely drops after ~90 seconds.

### Frustration Tolerance & Adaptation
- No evidence of adaptive difficulty (e.g., slowing down, reducing choices, enlarging targets after repeated fails).
- A child who misses repeatedly will experience an endless identical failure loop with no support — a strong dropout trigger.

### Learning Outcome
- The game appears to teach emoji-to-emoji visual matching. This maps to early **visual discrimination and categorization** skills.
- However, because play is so frequently interrupted by tracking failures and rapid transitions, the **learning loop is unreliable**: the child may internalize "hand movement = random result" rather than "I matched those!"

---

## Angle 6: Parent / Caregiver Perspective

- **Trust:** A parent watching the first 30 seconds would likely perceive the game as "glitchy" due to the cursor lag and small targets. Trust is lost within the first minute.
- **Dark patterns:** None observed (no purchase prompts, no forced ads). Positive.
- **Difficulty ramp:** No visible adaptation. A child who is struggling will not get help from the system. Parent must intervene manually — not ideal for independent play scenarios.
- **Session control:** No visible pause, exit, or session timer. Parent cannot easily extract child from a mid-session state.
- **Accessibility/Motor diversity:** The game is inaccessible to children with motor delays, tremors, or atypical hand positions (e.g., fist instead of flat palm). UNCERTAIN — unclear if tracking supports multiple hand poses.

---

## Angle 7: Technical / Performance Audit

- **Frame rate:** Visual cadence appears ~30fps. Cursor motion has stepping artifacts consistent with 30fps rendering (not 60fps smooth).
- **Dropped frames / stutter:** ~0:14 — 1–2 frame freeze observed during tracking recovery. Possible GC pause or model inference spike.
- **Visual artifacts:** UNCERTAIN — some edge cases where cursor appears to render one frame behind the UI overlay (z-ordering stutter). Needs frame-accurate analysis.
- **Late loads / pop-in:** ~0:01 — background renders ~2 frames after emoji UI. Minor but noticeable.
- **Smoothness verdict:** The experience feels closer to 24fps than 60fps due to the tracking lag compounding the UI frame rate.

---

## Issue Backlog

| ID | Severity | Angle | Category | Timestamp | Evidence | Impact | Root Cause Hypothesis | Fix | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **001** | **S1** | 1 | Performance | 0:04–0:07 | Cursor lags hand by 5–7 frames (~166–233ms). | Toddler overshots targets; breaks physical connection. | Heavy EMA filter / slow inference pipeline. | One-Euro Filter; reduce smoothing weight at high velocity. | Lag < 3 frames at 30fps (< 100ms). |
| **002** | **S1** | 2 | UI | 0:12 | Green cursor vanishes on green background. | Child thinks tracking is broken. | Color-only cursor, no border. | Add 2px white border + rgba drop-shadow. | Cursor visible at ≥ 4.5:1 contrast on all backgrounds. |
| **003** | **S1** | 2 | UI | 0:08, 0:15 | Cursor visually overlaps emoji; no selection fires. | Unfair miss; toddler gives up. | Hitbox = exact visual bounds (no padding). | Expand hitbox radius by 1.75× visual bounds. | Selection fires when cursor is within 20px of visual edge. |
| **004** | **S1** | 2 | UI | Always | Cursor is ~1.2% screen height (~13px). | Invisible at toddler viewing distance. | Minimalist aesthetic. | Scale cursor to ≥ 5% screen height. | Cursor ≥ 48px on 1080p display. |
| **005** | **S1** | 3 | UX | 0:00 | No onboarding; game starts immediately. | Child cannot discover interaction. | Skipped during dev. | 3-frame animated tutorial showing hand → dot → match. | First-time players complete round 1 without parent help. |
| **006** | **S2** | 1 | Tracking | 0:09 | Cursor snaps to 0,0 on occlusion. | Jarring visual; child panics. | No confidence threshold / fallback position. | Fade cursor on confidence < 0.5; freeze at last position. | Cursor never jumps > 100px in a single frame unless hand moved that far. |
| **007** | **S2** | 3 | UX | 0:25 | Level transitions in ~350ms. | Child can't register success. | Pacing tuned for developer throughput. | Insert 1.2s freeze + VO on match before transition. | ≥ 1200ms between match-sound and next-target-appear. |
| **008** | **S2** | 3 | UX | Throughout | No tracking loss indicator. | "Silent failures" are invisible to child. | UI state for tracking loss not implemented. | Show "Where's your hand? 👋" overlay when cursor invisible > 1s. | Overlay appears within 100ms of tracking loss. |
| **009** | **S2** | 4 | Audio | Throughout | No instructional VO ("Find the cat!"). | Non-reading toddlers cannot play alone. | VO assets not recorded. | Record + integrate "Find the [emoji]!" on each round start. | Audio plays within 300ms of new target appearing. |
| **010** | **S2** | 5 | Child-friendly | Throughout | 4 simultaneous choices; 3 memory slots active. | Exceeds 2-3yr working memory. | Designed for older kids or adults. | Reduce to 2 choices for levels 1–3; add 3rd at level 4+. | 2yr test group completes round 1 with <2 misses. |
| **011** | **S2** | 5 | Child-friendly | Throughout | No difficulty adaptation on repeated failure. | Child stuck in frustration loop. | No adaptive logic. | After 3 consecutive misses: enlarge hitbox +25%, slow transitions. | After 3 misses, detection rate improves by measurable %. |
| **012** | **S3** | 6 | UX | Throughout | No pause / exit controls. | Parent cannot safely interrupt session. | UI was not designed for caregiver control. | Add always-visible home-button in corner. | Parent can exit in < 2 taps/gestures. |
| **013** | **S3** | 7 | Performance | 0:14 | 1–2 frame freeze during tracking recovery. | Breaks immersion. | GC pause / model spike. | Profile inference thread; off-load to Worker thread. | No single frame drop > 33ms. |
| **014** | **S3** | 2 | Accessibility | Throughout | Color-only signals (green cursor). | Inaccessible for colorblind users. | Design did not consider colorblindness. | Use shape + color (star shape? animated ring?). | Passes Deuteranopia simulation. |

---

## Design Principles Violated

1. **Visibility of System Status** (0:09, 0:15): Tracking drops with zero UI feedback. Child has no idea if game is frozen or if their hand is missing.
2. **Match Between System and Real World** (0:04–0:07): 233ms lag destroys the physical metaphor of "your hand controls the dot." The world and system feel disconnected.
3. **User Control and Freedom** (Throughout): No pause, no easy exit, no undo. Once in the game, the child (and parent) are locked in.
4. **Error Prevention** (0:08, 0:15, 0:18): Pixel-exact hitboxes practically guarantee errors for a toddler's motor imprecision. The system is architected to fail.
5. **Recognition Rather Than Recall** (0:00): The child must recall what to do (no instruction visible) rather than recognizing affordances on screen.
6. **Flexibility and Efficiency** (Throughout): One fixed difficulty level for all ages — no accessibility, no adaptation, no novice path.
7. **Aesthetic and Minimalist Design** (0:08+): Background detail competes with the cursor for visual attention. The least important element (background) has the highest visual fidelity.
8. **Feedback** (0:25): Success feedback lasts 350–500ms — insufficient for a child's reward circuitry to register the win before the next demand arrives.
9. **Consistency and Standards** (0:07 vs 0:20): Match sound appears on some interactions; its absence on others (UNCERTAIN) creates unpredictable feedback.
10. **Forgiveness Principle (Kids HCI)**: The game is designed with adult precision expectations. Zero forgiveness margin for imprecise inputs.

---

## Quick Wins (≤2 hours each)

| Change | Exact Modification | Expected Impact |
| :--- | :--- | :--- |
| **Cursor size** | Scale tracking dot from ~13px to ≥ 48px | Immediately legible at viewing distance. |
| **Cursor contrast** | Add CSS/engine `filter: drop-shadow(0 0 6px white)` + 2px white border | Eliminates invisibility on all tested backgrounds. |
| **Hitbox padding** | Multiply collision radius by 1.75× in the match-detection function | Reduces "unfair miss" events by estimated 60–70%. |
| **Post-match pause** | Add `sleep(1200ms)` between match-success event and next-round-start | Gives child 1.2s to process win before new challenge. |
| **Tracking loss UI** | If cursor invisible > 800ms, show "👋 Show your hand!" overlay | Eliminates silent failure confusion. |
| **VO on round start** | Play pre-recorded clip "Find the [emoji name]!" at each round start | Enables non-reader participation. |

---

## Deep Work Items (Multi-day)

| Item | Scope | Risk | Dependencies |
| :--- | :--- | :--- | :--- |
| **Latency optimization / One-Euro Filter** | Replace current smoothing with One-Euro Filter; tune cutoff by velocity. Full tracking pipeline profiling required. | May require refactoring core tracking module. Regression risk on stability. | Tracking module, inference pipeline. |
| **Adaptive difficulty engine** | Monitor per-session miss rate; dynamically adjust hitbox size, number of choices, transition speed. | Complex state machine. Needs session data instrumentation first. | Analytics layer must be in place. |
| **Tutorial system ("Ghost Hand")** | Build animated hand-demo that plays on first launch; shows hand → dot → emoji sequence. | Asset creation effort (animation). Must not be skippable for new users. | Art/animation assets, VO recording. |
| **Accessibility pass** | Full colorblind simulation; motor-accessibility options (larger cursor, single-choice mode); support for atypical hand poses. | Wide scope; may require tracking model fine-tuning. | New tracking model variants. |

---

## Regression Test Checklist

| Fix | Test Procedure | Pass Criteria |
| :--- | :--- | :--- |
| Latency reduction | Attach high-fps camera; measure frame delta between hand start and cursor start across 10 sweeps. | Median ≤ 3 frames at 30fps (≤ 100ms). |
| Cursor legibility | Move cursor over every distinct background tile in every level. | Cursor never drops below 4.5:1 contrast ratio. |
| Hitbox expansion | Touch each emoji at its visual edge (not center) with cursor. | All 8 directional edge-touches trigger selection. |
| Post-match pause | Record with slow-motion at 240fps; measure time from match-sound to next target appearing. | Interval ≥ 1200ms across all rounds. |
| Tracking loss overlay | Occlude hand partially for 1 second. | Overlay appears within 100ms of cursor disappearing. |
| VO round-start | Mute all music; confirm audio plays on each new round. | VO plays within 300ms of new target appearing, every time. |
| Occlusion recovery | Cover hand with sleeve for 3 seconds, re-expose. | Cursor fades, does not snap to 0,0. Re-tracks within 500ms. |
| Edge jitter | Hold hand at screen edge for 5 seconds. | Cursor jitter < 5px RMS; no phantom selections. |

---

## Open Questions (for Developer)

1. **What is the inference FPS of the hand-tracking model vs. UI render loop?** If the model runs at 15fps but the UI at 60fps, the cursor will stutter even without lag — this would explain the 30fps stepping artifacts.
2. **What smoothing algorithm is currently applied, and what are its parameters?** If it is EMA, what is the alpha? A value below 0.3 would explain the observed lag.
3. **Are hitboxes dynamically generated from sprite transparency masks?** If so, they will match visual bounds and will not have padding — which is the likely root cause of issue #003.
4. **Is there any dwell/hover time before a selection fires, or is it instant overlap?** If instant, rapid hand movement through the target zone will cause false positives.
5. **What device is the target platform?** Thermal throttling (issue at 0:45) suggests this may be tested on an underpowered device. Frame budget affects everything above.
6. **Is the tracking model running on-device or via a remote API?** Remote API would add network latency on top of inference latency, explaining the high end of the 233ms range.
7. **Are there per-level difficulty settings in the current build?** If not, is there a sprint planned for adaptive difficulty?
8. **Has any usability testing been done with actual 2–4 year olds?** If not, many of these issues would surface within the first 5 minutes of a real session.
9. **Is the background art procedurally generated or static?** A full colorblind/contrast audit requires knowing all possible background states.
10. **Is haptic feedback used on compatible devices?** If not, adding it on match/mismatch events is a free win for sensory reinforcement.
