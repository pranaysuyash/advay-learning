# Wash Hands Dance Game Specification

**Game ID:** `wash-hands-dance`
**World:** Wellness
**Vibe:** Active
**Age Range:** 3-6 years
**CV Requirements:** Hand tracking

---

## Overview

Wash Hands Dance is a wellness game where children follow Pip through the 5 key handwashing steps. The camera detects hand movement (waving) to confirm each step is performed, making hygiene practice interactive and fun.

### Tagline
"Dance your hands clean with Pip! 🧼💧"

---

## Mechanics

### Core Loop

1. **See the Step** — A step card shows the current action (e.g. "Wet Hands 🚿") with its instruction and hint.
2. **Perform the Action** — The child waves or moves their hands in front of the camera.
3. **Fill the Progress Bar** — Enough hand movement fills the gesture bar and advances the step.
4. **Complete All 5 Steps** — After all steps, a star rating and score summary are shown.

### Controls

| Input | Action |
|-------|--------|
| Hand movement (camera) | Advance current step |
| "Start Washing!" button | Begin game |
| "Play Again" button | Restart |
| "Finish" button | Return to game hub |

### The 5 Steps

| Step | Name | Emoji | Instruction |
|------|------|-------|-------------|
| 0 | Wet Hands | 🚿 | Put your hands under the water! |
| 1 | Soap Time | 🧼 | Rub soap all over! |
| 2 | Scrub Scrub | 🧽 | Scrub between your fingers! |
| 3 | Rinse Clean | 💧 | Rinse all the bubbles away! |
| 4 | Dry Off | ✋ | Shake your hands dry! |

### Scoring

- **Per step:** 100 base points − 20 × (attempts − 1), minimum 10 pts
- **Stars:** Average attempts across steps → 1 attempt = 5 stars, up to 6+ = 1 star

---

## Learning Goals

1. **Hygiene Habits** — Reinforces the correct handwashing sequence.
2. **Gross Motor Skills** — Encourages full arm/hand movement.
3. **Sequencing** — Following steps in order builds procedural memory.
4. **Health Literacy** — Associates handwashing with fun, reducing resistance.
