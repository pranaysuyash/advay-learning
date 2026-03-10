# Copy & Microcopy Review Prompt — v1.0

**Category:** Review / Content  
**Use when:** Reviewing any staged or committed changes that touch user-visible text — game instructions, button labels, error messages, TTS scripts, onboarding flows, empty states, loading states, celebration text, feedback messages.

---

## MISSION

Ensure every piece of user-visible text in the diff is:
1. **Age-appropriate** — clear, friendly, encouraging for children ages 3–8
2. **Consistent** — same voice, tone, and capitalization style across the app
3. **Accurate** — instructions match the actual game mechanic
4. **Accessible** — TTS-friendly, ARIA labels present, screen reader text correct
5. **Complete** — no placeholder text, no TODO strings, no empty labels

---

## OPERATING RULES

- Do NOT modify files unless explicitly authorized.
- Do NOT use /tmp.
- Only flag text that has a genuine usability, accuracy, or safety impact.
- Do NOT flag style preferences (Oxford comma, etc.) unless they create ambiguity.

---

## REVIEW WORKFLOW

### STEP 0 — Extract all user-visible text from the diff

```bash
git diff --staged | grep -E "^\+" | grep -iE "(title|label|text|message|placeholder|aria|alt|tooltip|hint|feedback|instruction|celebrate|error|empty|loading|button|prompt|announce)" | grep -v "^+++"
```

Also check:
```bash
# Game instruction strings
git diff --staged | grep -E "^\+" | grep -E '"[A-Z][^"]{10,}"'

# TTS / speak() calls
git diff --staged | grep -E "^\+" | grep -E "speak\(|tts\.|speakWord|speakLetter|announcement"

# ARIA attributes
git diff --staged | grep -E "^\+" | grep -E "aria-(label|description|live|role)"
```

### STEP 1 — Evaluate each string

For each user-visible string found, check:

| Check | Criteria |
|-------|----------|
| **Reading level** | Appropriate for ages 3–8. Short sentences. Simple words. No jargon. |
| **Tone** | Warm, encouraging, playful. Never condescending or negative. |
| **Action clarity** | Instructions tell the child exactly what to do in one sentence. |
| **Positive framing** | "Try again!" not "Wrong." "Almost!" not "Incorrect." |
| **Consistency** | Same capitalization style as the rest of the app (Title Case for buttons, sentence case for instructions). |
| **TTS pronunciation** | Strings passed to `speak()` are natural spoken language — no abbreviations, no symbols that read oddly aloud. |
| **ARIA accuracy** | ARIA labels describe what the element IS and DOES, not just its visual appearance. |
| **Placeholder/TODO** | No "TODO", "placeholder", "lorem ipsum", "test string", or empty strings in production paths. |
| **Character limits** | Button labels ≤ 24 chars. Toast/popup messages ≤ 60 chars. |

### STEP 2 — Check new game instructions specifically

For any new game page in the diff:
- Is there a clear "how to play" instruction visible before the game starts?
- Is the win condition communicated?
- Is the failure/retry path communicated with encouragement (not shame)?
- Does the celebration text match the game theme?

### STEP 3 — Classify findings

```
COPY-001
Severity: HIGH | MEDIUM | LOW
File: path/to/file.tsx  Line: 45
Current text: "Incorrect answer"
Issue: Negative framing — discourages children
Suggested: "Nice try! Give it another go!"
```

**Severity guide:**
- **HIGH**: Inaccurate instruction (child can't play), missing critical label, ARIA describes wrong thing
- **MEDIUM**: Negative framing, age-inappropriate language, TTS pronunciation issue, placeholder text
- **LOW**: Inconsistent capitalization, slightly awkward phrasing, minor tone issue

### STEP 4 — Verdict

```
COPY APPROVED       — All visible text is age-appropriate, accurate, consistent.
COPY WITH NOTES     — Minor issues flagged; safe to ship, fix in follow-up.
COPY BLOCKED        — HIGH severity issue found (inaccurate instruction, missing label, broken ARIA).
```

---

## REPORT FORMAT

```markdown
## Copy & Microcopy Review — <date>

### User-Visible Text Found
[List of strings reviewed, by file]

### Findings

#### HIGH
[COPY-XXX or "None"]

#### MEDIUM
[COPY-XXX or "None"]

#### LOW
[COPY-XXX or "None"]

### Verdict
[COPY APPROVED / COPY WITH NOTES / COPY BLOCKED]
```

---

## VOICE & TONE GUIDE (for this repo)

| Context | Tone | Example |
|---------|------|---------|
| Game instructions | Clear, action-first | "Draw the letter A with your finger!" |
| Success | Enthusiastic, specific | "Amazing! You drew a perfect A!" |
| Retry | Warm, encouraging | "Almost there! Try again!" |
| Loading | Calm, friendly | "Getting ready..." |
| Error | Matter-of-fact, no blame | "Camera not found. Using mouse mode." |
| Button labels | Short, verb-first | "Start", "Try Again", "Next Letter" |
| Wellness prompts | Gentle, caring | "Time for a water break! 💧" |

---

*Prompt version: v1.0 | Created: 2026-03-10 | Owner: Copilot agent coordination*
