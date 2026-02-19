# Learning Plan (Age-Based)

This document defines the educational progression for the app: what we teach, in what order, how we measure mastery, and how we adapt to age and ability.

## Principles

1. **Short, repeatable sessions**: 3–10 minutes per activity; stop on success.
2. **One new thing at a time**: Introduce only one new letter/skill per mini-session.
3. **Multi-sensory**: See (shape), do (trace), hear (sound), say (optional), recall (quiz).
4. **Error-friendly**: Encourage effort; never punish mistakes; guide back to success.
5. **Local-first & private**: No camera frames stored; only progress signals are stored (see `docs/security/SECURITY.md`).

## Skill Areas (Modules)

### 1) Pre-writing foundations

- Finger control and “follow the path”
- Basic strokes (vertical, horizontal, diagonal, circle)
- Start/stop control (drawing vs cursor only)

### 2) Letter knowledge (per language)

- Letter recognition (visual)
- Letter-sound association (optional audio)
- Writing/tracing (motor + shape)
- Discrimination (confusable pairs: O/0, b/d, p/q, etc.)

### 3) Early literacy

- Phonics primitives (CVC blending) when ready
- Sight words (later)
- Simple reading games (later)

### 4) Numeracy (optional later)

Goal: build number sense, patterns, and early math confidence through play.

- Counting (1–10, then 20, then 100) with objects and movement
- Number tracing and formation (0–9)
- Quantity matching (dot patterns, ten-frames, tally marks)
- Compare (more/less, bigger/smaller, longer/shorter)
- Simple operations (add/remove objects; later symbols + and −)
- Place value foundations (tens/ones) for older kids
- Patterns and sequences (AB, AAB, ABB, ABC; later skip counting)
- Estimation (“which pile has more?”) with friendly feedback

Puzzles for numeracy:

- Number mazes (follow increasing numbers)
- “Make 10” with blocks/tiles (older)
- Sudoku-lite (4x4 shapes/numbers; older)

### 5) Creative Studio (create, invent, express)

Goal: make learning feel like play while building planning, attention, and creativity.

- Free draw with “smart brushes” (thickness stabilization, gentle smoothing)
- Shape builder: combine primitives (circle + line + triangle) to make objects
- Story drawing: draw a scene, then answer questions (“What happens next?”)
- Pattern art: symmetry/mirroring, repeating patterns, mandalas
- Color & emotion: pick colors for moods; name emotions and practice empathy
- “Draw from clues”: follow 3–5 constraints (“draw a house with 2 windows and a red door”)

Privacy note:

- All creation should be local-only. If exports exist, they should be parent-controlled and explicit.

### 6) Face + Body Play (AR-style, but privacy-safe)

Goal: make camera-based interaction fun without storing sensitive imagery.

- Face paint overlays (stickers/paint) with a clear “camera on” indicator
- “Emotion mirror”: match expressions (happy/surprised/sad) with encouraging feedback
- “Dress-up” overlays (hats/glasses) that never store frames

Safety + privacy constraints:

- Do not store camera frames.
- Avoid biometric identity features (no face recognition).
- Parent can disable camera features anytime (see `docs/security/SECURITY.md`).

### 7) Thinking Games (logic, memory, planning)

Goal: build executive function and problem solving.

- Memory match (visual cards; later add sounds)
- Odd-one-out (categorization)
- Sequencing (“put these pictures in order”)
- Mazes (path planning; later add timed modes for older kids)
- Simple logic puzzles (IF/THEN with icons, not text-heavy)
- Spatial puzzles (tangrams, fit-the-shape, rotate-and-place)
- Pattern puzzles (continue the sequence, find the missing piece)
- “Spot the difference” (attention to detail)
- “Build the rule” (child chooses a sorting rule and explains it)
- “Explain your choice” prompts (build reasoning, not just answers)

### 8) STEM Play (curiosity-driven, hands-on)

Goal: support “why/how” thinking beyond school worksheets.

- Sorting by properties (big/small, heavy/light simulated, color/shape)
- Cause/effect mini-sims (ramps, bouncing balls, magnets—simple versions)
- Measurement games (compare lengths/volumes with visual units)
- Build-and-test challenges (“make a bridge that holds 3 blocks”)

### 9) Mindfulness + Self-Regulation (optional)

Goal: help kids calm down and refocus, especially after frustration.

- 30–60s breathing animations
- “Name the feeling” check-ins
- Gentle body movement prompts (stretch, shake, reset)

## Age Bands

These are guidelines. A child’s “band” can be overridden by observed performance.

### Ages 3–4 (Pre-K)

**Goal**: Enjoy interaction; develop control and confidence.

Activities:

- Path tracing with thick guides
- Large letters and shapes
- Very small set of content (2–5 items)

Defaults:

- Session length: 3–6 minutes
- Difficulty: Easy
- Hints: ON
- Scoring: Minimal; focus on encouragement

Success signals:

- Completes a trace without quitting
- Stays within the guide most of the time

Mastery criteria (suggested):

- 5 successful traces of the same letter/stroke over 3 different days
- “Frustration guard”: if 3 low attempts in a row → simplify

### Ages 5–6 (K–1)

**Goal**: Build letter formation, recognition, and early sound mapping.

Activities:

- Letter tracing with decreasing guides
- “Find the letter” (recognition)
- Confusable pair games

Defaults:

- Session length: 6–10 minutes
- Difficulty: Easy → Medium as mastery increases
- Hints: ON initially; taper off
- Streaks: Short (3–5)

Mastery criteria (suggested):

- Accuracy (shape coverage + smoothness) ≥ 70% on 3 sessions
- Recognition: ≥ 80% correct on quick “pick the letter” trials

### Ages 7–8 (2–3)

**Goal**: Fluency and transfer to reading/spelling tasks.

Activities:

- Faster tracing / thinner stroke tolerance
- Copy-from-memory: show letter briefly then hide
- Phonics: letter-sound blending, simple words

Defaults:

- Session length: 8–12 minutes
- Difficulty: Medium → Hard
- Hints: OFF by default, but user-toggleable

Mastery criteria (suggested):

- Consistent accuracy ≥ 80% across multiple letters
- Time-to-complete improves without accuracy drop

### Ages 9+ (Optional extension)

**Goal**: Enrichment, multilingual literacy, handwriting refinement.

Activities:

- Cursive/advanced writing (optional)
- Vocabulary games, spelling
- Multi-language practice (script-specific)
- Creative Studio “projects” (multi-step drawings, comics, posters)
- Deeper puzzles (logic grids, planning challenges)
- STEM challenges (build, test, iterate; record results as simple badges)

## Progression Model

### Content sequencing (per language)

1. **High-utility, simple shapes first**: straight-line letters before complex curves.
2. **Avoid early confusables**: don’t introduce b/d/p/q adjacent.
3. **Spaced repetition**: re-surface mastered letters at longer intervals.

Example (English, illustrative):

- Stage A: I, L, T, E, F
- Stage B: O, C, G, Q
- Stage C: A, H, K, M, N
- Stage D: B, D, P, R
- Stage E: S, U, V, W, X, Y, Z

### Difficulty ladder (applies to any activity)

- **Easy**: thick guides, always-visible hint, slow pacing
- **Medium**: thinner guides, hint fades after start, light timing goals
- **Hard**: minimal guide, optional time pressure, higher precision

### Adaptive rules (simple, transparent)

- If last 3 attempts ≥ mastery threshold → unlock next item and reduce hints.
- If last 3 attempts < frustration threshold → increase hints and reduce complexity.
- Never increase difficulty immediately after a failure.

## Measurement (What we store)

Store aggregated signals only (no camera frames):

- Attempts per item
- Best score, average score, recent trend
- Time spent per session
- Hint usage
- Streak history (optional)

## Rewards (Age-Appropriate)

Avoid addictive mechanics; use gentle motivation:

- Stickers/collectibles tied to mastery
- “You improved!” deltas (show progress compared to self)
- Parent-visible milestones (“10 letters mastered”)
- Creative galleries (local-only) that celebrate “projects completed”, not perfection

## Parent Controls (Recommended)

- Set daily time cap and quiet hours
- Choose language(s), difficulty, hint policy
- Review progress by module and by letter
- Data export/delete controls (see `docs/security/SECURITY.md`)
- Toggle camera-based play features (Face + Body Play)
