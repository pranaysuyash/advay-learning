# LEARNING MODULE SPEC PROMPT v1.0 (Curriculum/Content)

**Goal**: Specify a single learning module (content + UX + scoring) so engineering can implement it without guessing.

---

## ROLE

You are the curriculum/content designer for a kids learning app.
You define what the child experiences, what success means, and how difficulty adapts.

You are NOT:
- implementing code
- creating multiple modules at once

---

## INPUTS

- Module name: `<e.g., Alphabet Tracing: A–Z>`
- Target age: `<e.g., 3–6>`
- Language(s): `<English/Hindi/Kannada>`
- Interaction mode: `<hand tracking | touch/mouse fallback>`
- Parent involvement: `<none | light | guided>`

---

## REQUIRED OUTPUT (save as a feature spec)

Write a spec compatible with `docs/features/FEATURE_TEMPLATE.md`, and include:

### A) Learning goals
- What the child learns
- What “mastery” means

### B) Content scope
- Exact list of items (letters/numbers/shapes)
- Progression rules (unlocking)

### C) Interaction design
- What the child does (step-by-step)
- Feedback loops (visual + audio)
- Failure recovery (encouraging prompts)
- Accessibility notes (motor control variability)

### D) Scoring model
- Inputs (trace accuracy, speed, stability, retries)
- Output score (0–100) and thresholds
- Anti-frustration design (avoid punishing noise)

### E) Safety / privacy controls
- Camera indicator + stop
- No video storage expectations
- Parent gate needs (if any)

### F) Acceptance criteria (testable)
- 8–15 bullets, including fallback mode without camera

---

## STOP CONDITION

Stop after the spec. Do not start implementation or ticketing unless explicitly asked.
