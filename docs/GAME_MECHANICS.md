# Game Mechanics Plan

This document defines the gameplay loops, feedback, scoring, and progression for the learning activities. It is designed for children, so it prioritizes clarity, low frustration, and privacy.

## Design Goals

1. **Learning-first**: points support learning; they do not replace it.
2. **Fast feedback**: child sees “what to do next” within 1–2 seconds.
3. **Predictable controls**: interaction should be stable even with shaky hands.
4. **Anti-frustration**: the game adapts down before the child quits.
5. **Safe by default**: offline-first; no stored camera frames; minimal data.

## Core Loop (Letter Tracing)

### Player actions
1. Select/receive a target letter.
2. Trace on top of a guide.
3. Press “Check” (or auto-check after short pause).
4. Receive feedback + reward.
5. Repeat or move to next letter.

### System actions
1. Show hint/guide (optional).
2. Track cursor (hand or mouse fallback).
3. Record stroke path (normalized points).
4. Score attempt.
5. Adjust difficulty/hints and choose next content.

## Interaction Modes

The game should support multiple “drawing control” modes because children’s comfort varies:

### Mode A: Button Toggle (baseline)
- Tap/hover a large “Draw” button to start/stop drawing.
- Pros: simplest mentally; works without reliable gesture recognition.
- Cons: requires control access without breaking flow.

### Mode B: Pinch to Draw
- Draw only while pinch gesture is detected.
- Pros: feels natural; no UI buttons needed.
- Cons: pinch detection must be tolerant for kids.

### Mode C: Dwell to Toggle
- Hover over a big on-screen control for 0.5–1.0s to toggle drawing.
- Pros: no click; good for touchless.
- Cons: needs stable cursor.

### Mode D: Two-Handed Control
- One hand controls; the other starts/stops drawing with simple open/closed pose.
- Pros: separates “control” from “drawing”.
- Cons: requires two hands in frame.

Recommendation: implement Mode A first (baseline), then add others as optional settings once the baseline is stable.

## Creative Modes (Non-Competitive Play)

These modes are designed to encourage exploration and “out-of-box” thinking. They should be calm, open-ended, and parent-controllable.

### Creative Mode 1: Free Draw + Smart Brushes
- Gentle smoothing and stabilization to reduce frustration from shaky hands.
- Big, simple toolset (2–6 brushes; 3–8 colors depending on age).
- No “fail states”; only optional prompts.

### Creative Mode 2: Draw From Clues (Constraint Creativity)
- Give 2–6 constraints (age-based), e.g. “Draw a house with 2 windows”.
- Reward completion and creativity, not correctness.
- Great for language development (“tell a story about your drawing”).

### Creative Mode 3: Shape Builder (STEM + Design)
- Provide primitives and ask the child to build an object.
- Encourage iteration (“Try another way to make a rocket”).

### Face + Body Play (AR-style)
- Stickers/paint overlays and expression games.
- Must never store camera frames; keep a clear camera indicator.
- Avoid identity/recognition features; use only transient landmark-based effects.

## Scoring & Feedback

### Scoring signals (letter tracing)
Use a few simple signals that are explainable:
- **Coverage**: how much of the expected area/path was visited.
- **Stability**: smoothness of stroke (optional later).
- **Completeness**: did the child trace enough points (minimum length).

Keep scoring coarse:
- 0–39: “Try again” (with more guidance)
- 40–69: “Good try” (repeat with hint)
- 70–89: “Great” (progress)
- 90–100: “Amazing” (bonus reward)

### Feedback rules
- Always show *one* actionable hint (e.g., “Start at the top”).
- Show success feedback immediately, then gently advance.
- Avoid negative language; avoid losing points.

## Progression & Mastery

### Mastery thresholds (suggested)
- “Unlocked” after first success ≥ 70%.
- “Mastered” after 3 sessions ≥ 80% across different days.

### Content selection
1. Prefer current focus letter.
2. Mix in 1 previously mastered letter for spaced repetition.
3. Avoid confusable pairs back-to-back for younger ages.

### Session pacing
- 1–3 letters per short session for young children.
- Cap retries per letter (e.g., 3) before switching to an easier activity.

## Anti-Frustration System

Detect early quitting patterns:
- Multiple low scores
- Time spent without improvement
- Rapid stop/start or no strokes

Interventions:
- Increase hint opacity / show guide path.
- Enlarge target letter and stroke width tolerance.
- Switch to “stroke practice” mini-game (lines/circles) for 60 seconds.
- Offer “Skip” without penalty.

## Rewards

Rewards should reinforce effort and mastery:
- Stickers for “first time” success
- Badges for “3 days in a row” (short streaks)
- Collection book (letters mastered by language)

Avoid:
- Loot boxes
- Daily login pressure
- Long streak penalties
 - “Perfect score” obsession (avoid overly precise grading in creative modes)

## UI/UX Requirements

### Child view
- Big targets, large buttons, few choices at once.
- Consistent “Start / Stop / Clear / Check / Skip”.
- Always show “what to do” in one sentence.

### Parent view
- Clear progress per child profile.
- Settings: language, difficulty, hint policy, control mode.
- Safety: time caps; camera permission reminders.

## Data & Telemetry (Local-Only)

Store only what is needed for learning:
- Per-letter attempt summaries (scores, timestamps, duration)
- Mastery status
- Settings used

Do not store:
- Camera frames
- Raw audio
- PII (see `docs/security/SECURITY.md`)
 - Face images or embeddings (no identity features)

## Next Implementation Docs (Suggested)

If you want to operationalize this into feature specs:
1. “Scoring v1” for letter tracing (coverage-based)
2. “Adaptive difficulty v1”
3. “Control mode selector UI”
4. “Spaced repetition scheduler”

## Numeracy + Puzzle Game Loops (Recommended)

These are additional core loops that complement tracing and build “smart thinking” skills.

### Loop A: Number Tracing
Player:
1) See a number (0–9, then 10–20).
2) Trace (or copy-from-memory for older kids).
3) Get feedback.

System:
- Use the same scoring approach as letter tracing, with age-based tolerance.

### Loop B: Quantity Match (Number Sense)
Player:
1) See a target number (e.g., 6).
2) Choose the matching quantity (dots/ten-frame/objects).
3) Get immediate feedback + “why” hint (optional).

Scoring:
- Correctness first; speed only as an optional older-kid challenge.

### Loop C: Patterns & Sequences
Player:
1) See a pattern (AB, AAB, ABC).
2) Choose the next item or fill the missing slot.
3) Explain (optional) “what rule did you see?”

### Loop D: Mazes & Spatial Puzzles
Player:
1) Plan a path / place shapes.
2) Execute with finger/cursor.
3) Get feedback and a “try another way” prompt.

Design notes:
- Prefer multiple valid solutions where possible.
- Reward persistence and strategy, not perfection.
