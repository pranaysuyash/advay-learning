# Persona Audit: Meera × Emoji Match

**Date:** 2026-02-22  
**Ticket:** TCK-20260223-001
**Persona:** Meera — The Playful Explorer (4y 6m)  
**Game:** Emoji Match (`/games/emoji-match`)  
**Audit Method:** Live walkthrough on `localhost:6173`, screenshot capture, source code review  

---

## Persona Quick Reference

| Attribute | Value |
|---|---|
| Age | 4 years, 6 months |
| Motor skills | Can point, tap, and do a deliberate pinch gesture |
| Attention span | 3–5 minutes if engaged; drops instantly if bored |
| Reading level | Recognizes all 26 letters; reads 3-letter CVC words slowly |
| Key motivation | "I did it!" moments, variety, Pip as a friend, stars and badges |
| Key frustration | Waiting, ambiguous instructions, difficulty spikes, Pip disappearing |

---

## Screen-by-Screen Evaluation

### Screen 1: Start / Instructions Screen

![Emoji Match Start Screen](file:///Users/pranay/.gemini/antigravity/brain/033b2424-14e6-48fa-9875-169ea99e3913/emoji_match_meera_audit_1771785515948.webp)

| Criteria | Meera's Experience | Verdict |
|---|---|---|
| **Can she start the game without reading?** | The big blue "Start Emoji Match" button is prominent and visually obvious. She would tap it based on color/size alone. | ✅ Pass |
| **Are instructions understandable?** | 3 cards with icons (👋, 🟡, 🤏). The ICONS are clear. The TEXT ("Pinch when you are on the right emoji") uses words Meera cannot read yet ("pinch", "emoji"). However, she doesn't need to read them — the icons carry the meaning. | ⚠️ Partial — icons save it |
| **Is Pip present?** | No. Pip is nowhere on the start screen. Meera expects her friend to greet her: "Hey Meera! Let's find some emojis!" | ❌ Fail — Missing Pip |
| **Is there audio instruction?** | No TTS fires on the start screen. Meera hears silence. She must either read the cards or guess. | ❌ Fail — No spoken instructions at start |
| **Visual density** | 3 cards + 1 button. Clean and appropriate for her age. Not overwhelming. | ✅ Pass |
| **Button size** | The "Start Emoji Match" button is full-width and ~60px tall. Easy finger/hand target. | ✅ Pass |

**Meera's likely behavior:** She ignores the cards, taps the big blue button, and enters the game without understanding the instructions. This is acceptable IF the game itself teaches by doing — which we evaluate next.

---

### Screen 2: Active Gameplay

![Emoji Match Gameplay](file:///Users/pranay/.gemini/antigravity/brain/033b2424-14e6-48fa-9875-169ea99e3913/emoji_match_gameplay_meera_audit_1771785572371.png)

| Criteria | Meera's Experience | Verdict |
|---|---|---|
| **Does she know what to do?** | The top instruction reads "Pinch the Silly emoji!" — she can't read "Silly" but sees two emojis on screen. The word "Silly" is semantically complex for a 4-year-old. She may not map "Silly" → 🤪. | ⚠️ Partial — word-emoji mapping is hard at this age |
| **TTS (Spoken instructions)** | Code confirms `speak("Find the Silly emoji!")` fires via TTS at round start. This is crucial — if Meera hears "Find the Silly emoji!" she can look for "the funny face." TTS bridges the reading gap. | ✅ Pass (if TTS is enabled) |
| **Cursor visibility** | Bright yellow circle with black border ~48px. Highly visible against the blurred webcam background. She can see where her hand is. | ✅ Pass |
| **Target size** | Emoji circles are ~150px diameter. Large, easy to hit with tracked hand. Appropriate for 4y motor precision. | ✅ Pass |
| **Number of targets** | 2 targets on screen (Level 1, Round 2). Simple binary choice. Perfect for Meera — not overwhelming. | ✅ Pass |
| **Success feedback** | "You found Sleepy!" modal with a gold ⭐ star. Immediate, positive, visual. Meera would clap. | ✅ Pass — strong "I did it!" moment |
| **Failure feedback** | (Not observed in screenshot, verified in code): Score decrements, no buzzer. The game says "Try again!" Not punitive. | ✅ Pass |
| **Timer visibility** | "Time left: 53s" in top right. Meera cannot read this. The number means nothing to her. However, since there's no visual urgency (no red flashing), it doesn't stress her either. | ⚠️ Neutral — harmless but useless to her |
| **Round indicator** | "ROUND 2 OF 10" — she can't read this. It's for the parent watching over her shoulder. | ⚠️ Neutral — aimed at parents |
| **Pip presence during gameplay** | Pip is NOT on screen during active gameplay. Source code confirms no `<Mascot>` component rendered in `EmojiMatch.tsx`. | ❌ Fail — Meera feels alone |
| **Difficulty progression** | Level 1 = 2 targets. Code shows Level 2 = 3, Level 3 = 4. Gradual increase of +1 per level. | ✅ Pass — gentle progression |
| **Webcam feed** | Blurred background showing Meera's silhouette. She can see herself, which is delightful for this age. | ✅ Pass |
| **Controls (Restart/Pause)** | Small buttons in bottom-right corner. Meera would not find these. They are for parent/adult use. Appropriately hidden. | ✅ Pass |

---

## Findings Summary

### What Works Well for Meera (Keep)

| # | Finding | Why It Works |
|---|---|---|
| 1 | Large, colorful emoji targets (~150px) | Age-appropriate motor targeting |
| 2 | Binary choice at Level 1 (2 emojis) | Simple decision for a 4-year-old |
| 3 | Immediate "You found it!" modal with ⭐ | Delivers the "I did it!" dopamine hit she craves |
| 4 | TTS speaks the instruction aloud | Bridges the reading gap — she hears what to find |
| 5 | Blurred webcam showing her silhouette | "That's ME!" — self-recognition is delightful at this age |
| 6 | Gentle +1 difficulty per level | No sudden spike; matches her frustration tolerance |
| 7 | Big blue Start button | She can start the game independently |

### What Fails for Meera (Fix)

| # | Finding | Severity | Design Implication | Persona Reference |
|---|---|---|---|---|
| 1 | **Pip is absent during gameplay** | 🔴 High | Meera expects her companion. Add Pip in a corner reacting to events (cheering on correct, looking confused on wrong). | "Pip as a friend — talks to the mascot." |
| 2 | **No audio on the start screen** | 🔴 High | Pip should greet Meera and explain the game: "Hey! Show me your hand and let's find some emojis!" She cannot read the instruction cards. | "Instruction delivery: 100% audio + animated demo." |
| 3 | **Emotion words are too complex** | 🟡 Medium | "Silly," "Fearful," "Sleepy" are abstract vocabulary for 4-year-olds. Consider: show the target emoji LARGER in the instruction bubble alongside the word, so she matches by face, not by reading the word "Silly." | "Reading level: reads 3-letter CVC words slowly." |
| 4 | **Timer is text-only** | 🟡 Medium | Replace "Time left: 53s" with a visual countdown: a shrinking colored bar (green → yellow → red). Meera understands "bar getting small = hurry up" but not "53s." | "Cannot read numbers meaningfully in context." |
| 5 | **No celebration animation on level complete** | 🟡 Medium | The ⭐ modal is good, but Meera wants CONFETTI. Full-screen particles, Pip dancing, and a sound effect ("Woohoo!"). The current modal is too static. | "Craves the celebration screen. Will replay a level just to see the confetti again." |
| 6 | **Success modal blocks gameplay** | 🟢 Low | The "You found Sleepy!" modal overlays the entire play area. For Meera this is fine (she pauses to celebrate). But for Kabir (7y), this is too slow. Consider: auto-dismiss after 1.5s instead of requiring interaction. | Cross-persona: Kabir wants faster pacing. |

---

## Recommended Changes (Prioritized)

### P0 — Must Fix (Meera would struggle without these)

1. **Add Pip to gameplay screen** — Render `<Mascot>` component in bottom-left corner of the game area. Pip should:
   - Wave when the game starts
   - Cheer (bounce animation) on correct match
   - Look confused (tilt head) on wrong match
   - Encourage if no match for 10+ seconds: "You can do it!"

2. **Add TTS greeting on start screen** — When the start screen renders, fire: `speak("Hey! Hold your hand up and find the emoji I say!")`. This replaces the need to read the 3 instruction cards.

### P1 — Should Fix (Improves experience significantly)

3. **Show the target emoji in the instruction bubble** — Change `"Pinch the Silly emoji!"` → Show the 🤪 emoji inline: `"Find this one! 🤪"`. She matches faces, not words.

4. **Replace text timer with visual bar** — Horizontal bar at the top that shrinks from left to right, changing color from green → yellow → red as time runs out.

5. **Add confetti/particle celebration on correct match** — Use `canvas-confetti` library (15KB) to spawn 50–100 confetti pieces on each correct match. This is the #1 "wow factor" moment for this age group.

### P2 — Nice to Have

6. **Auto-dismiss success modal after 2s** — Or add a "Next!" button with Pip pointing at it.

---

## Score Card

| Category | Score (1-5) | Notes |
|---|---|---|
| **Usability (can Meera play alone?)** | 3/5 | She can start and tap targets, but needs TTS for instructions |
| **Engagement (does she want to keep playing?)** | 3/5 | The "I did it!" moment is good, but celebrations are too muted |
| **Emotional Safety (does she ever feel bad?)** | 5/5 | No punitive feedback. Gentle, encouraging tone throughout |
| **Delight Factor ("WOW!")** | 2/5 | No Pip, no confetti, no dancing. The magic is missing |
| **Accessibility (works without reading?)** | 3/5 | TTS helps, but emotion words and timer are text-dependent |
| **Overall Meera Score** | **3.2 / 5** | Functional but not yet magical. Pip + celebrations would push this to 4.5+ |

---

## Prompts & Method Used for This Audit

**Persona selected:** Persona 2 (Meera) from `docs/USER_PERSONAS.md`

**Audit process:**
1. Opened `http://localhost:6173/games/emoji-match` in a headless browser
2. Captured the start screen and gameplay screen via screenshots
3. Grep-searched the source code (`EmojiMatch.tsx`) for: `speak`, `Pip`, `Mascot`, `celebration`, `confetti` to verify what's implemented vs missing
4. Evaluated each screen element against Meera's persona attributes (motor skills, reading level, attention span, motivations, frustrations)
5. Scored each criterion as Pass / Partial / Fail with direct citations to the persona document

**Source files reviewed:**
- `src/frontend/src/pages/EmojiMatch.tsx` — game logic, TTS calls, round structure
- `src/frontend/src/games/emojiMatchLogic.ts` — round building, difficulty
- `docs/USER_PERSONAS.md` — Meera's full persona profile
