# UX Feedback & Learning Design Analysis

## 1. Persona-Based feedback

### 👩‍👧 Parent of Toddler (2–3 years)

**"I need safety and simplicity."**

- **First Impression**: "It looks a bit dark and serious. Is this for big kids?"
- **Pain Points**:
  - "My kid keeps tapping the 'Settings' gear because it's a fun icon. Then I have to fix it."
  - "I don't know if the camera is working right until the game starts."
  - "The 'Start Game' button is too small for me to hit quickly while holding a squirming toddler."
- **Delight**: "I love seeing the 'Mascot' pop up. My kid waved at it!"

### 👩‍👦 Parent of Preschooler (4–6 years)

**"I want progress and independence."**

- **First Impression**: "Okay, letters. What else? Numbers?"
- **Pain Points**:
  - "He finishes the letter game too fast. Is there a harder level?"
  - "I want to see *what* he practiced today without looking over his shoulder."
- **Delight**: "The 'Streak' fire is a great motivator. We try to keep it lit."

### 👩‍🏫 Teacher / Educator

**"I need classroom flow and data."**

- **First Impression**: "Can I run this on 5 iPads at once? Does it need internet?"
- **Pain Points**:
  - "The sound is too loud for a classroom. I need a quick 'Mute' button on the game screen."
  - "The letters are hard to see against the messy classroom background in the camera view." (**Critical**: Contrast issue)
- **Delight**: "Hand tracking is much better than mouse clicking for fine motor skills."

### 👶 Kid Persona A (2–3 years) - "The Explorer"

- **Behavior**: Taps randomly. Waving hand wildly.
- **Friction**:
  - Doesn't understand "Pinch". Just waves palm.
  - Gets confused when the line doesn't appear (false negative pinch).
  - Can't reach the "Next" button easily if it's small.
  - **Visual**: "I can see me! But I can't see the letter 'A'!" (Webcam is too bright/dominant).
- **Needs**: "Wave mode" (Palm detection) instead of Pinch. larger, glowing hit targets.

### 🧒 Kid Persona B (4–6 years) - "The Achiever"

- **Behavior**: Tries to trace perfectly. Wants the "Ding" sound.
- **Friction**:
  - Frustrated when 60% accuracy says "Try Again". Wants a "Bronze Star" at least.
  - "Why is the camera looking at me? I want to see the drawing!"
- **Needs**: Clearer visual feedback on *where* the line is being drawn relative to their finger.

### 🧑 Kid Persona C (7–9 years) - "The Gamer"

- **Behavior**: Tries to break it. Rapidly clicks buttons.
- **Friction**: "It's too slow. I want to race."
- **Needs**: Time-attack mode. "Speed Run" for the alphabet.

---

## 2. Learning Design Critique

### Clarity of Objectives

- **Current**: "Trace the letter". Interactive but basic.
- **Improved**: "Help the Panda find the letter!" (Narrative wrap).
- **Gap**: The relationship between "Pinching" and "Drawing" is abstract. A visual metaphor (hold a magical pen) would bridge this.

### Feedback Loops

- **Positive**: Mascot jumps -> Good. Particles -> Good.
- **Negative**: Red text "Try Again" -> Bad. Use "Oops! Missed a spot!" with a spotlight on the missing segment.
- **Latency**: The ~100ms delay is acceptable for learning but prevents "fast" gameplay.

### Difficulty Scaling

- **Easy**: Should accept "Palm" detection or very loose pinching.
- **Medium**: Current implementation.
- **Hard**: Should require stroke order (Top-to-bottom) enforcement. Currently, it accepts any scribbling as long as it covers the area.

### Accessibility

- **Visual**: The Letter overlay needs a "High Contrast" background (semi-transparent black layer behind the letter) so the camera feed doesn't wash it out.
- **Audio**: Essential for navigation. "Click the Green Button!" voiceover is missing.

---

## Related Tickets

**TCK-20260131-003: Child Usability Enhancements**

- Status: OPEN
- Created: 2026-01-31 00:00 UTC
- Addresses findings from this audit (Kid A & Kid B feedback)
- See docs/tickets/TCK-20260131-003.md for full details

**TCK-20260130-014: Medium-scope UI Contrast Sweep**

- Status: OPEN
- Created: 2026-01-30 00:00 UTC
- Addresses contrast findings from this audit
- See docs/audit/ui__game_visual_accessibility.md
