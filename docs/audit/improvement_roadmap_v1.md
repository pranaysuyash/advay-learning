# Improvement Roadmap

## 1. Missing Features Gap Analysis

### Must-Have (MVP Polish)
- [ ] **Home Button in Game**: Critical for navigation safety.
- [ ] **Tutorial Overlay**: 3-step GIF/Animation showing "Hands up" -> "Pinch" -> "Trace".
- [ ] **Visibility Fix**: Dim the webcam feed by 30% or add a "High Contrast" toggle to make letters pop (User Request).
- [ ] **Parent Gate**: Simple 3-second hold to enter Settings.

### Should-Have (Retention)
- [ ] **Level Progression**: Easy (Palm) -> Medium (Pinch) -> Hard (Precision).
- [ ] **Star System**: 1-3 stars based on accuracy percent.
- [ ] **Audio Voiceover**: "Find the letter A!" prompts.
- [ ] **Offline Indicator**: Visual cue if internet drops.

### Could-Have (Delight)
- [ ] **Avatar Customization**: Unlock hats for the Mascot.
- [ ] **Playground Mode**: Free-draw canvas without rules.
- [ ] **Daily Report Email**: "Advay learned 3 letters today!"

## 2. New Activity Ideas (Camera-First)

### Hand Tracking (Fine Motor)
1.  **Bubble Popper**: Pinch to pop bubbles floating up.
2.  **Connect-the-Dots**: Pinch & Drag to form shapes (Triangle, Square).
3.  **Shadow Hand**: Match the hand pose (Peace sign, Thumbs up).
4.  **Letter Catch**: Catch falling letters with an open palm.
5.  **Paint Bucket**: Dip finger in color bucket -> Draw on canvas.

### Face/Body (Gross Motor)
6.  **Roar like a Lion**: Open mouth wide to trigger sound.
7.  **Head Tilt Maze**: Tilt head L/R to roll a ball through a maze.
8.  **Blinky Bird**: Blink to make a bird fly over pipes.
9.  **Statue Freeze**: Move when music plays, freeze when it stops (Pose detection).
10. **Emotion Mirror**: "Show me a Happy Face" (Face landmark detection).

## 3. Prioritized Timeline

### Phase 1: Squashing Friction (Next 24 Hours)
- **Goal**: Make the first 60 seconds feel seamless.
- **Tasks**:
    1.  Add `HomeButton` to `Game.tsx`.
    2.  Add `.overlay { background: rgba(0,0,0,0.3) }` to webcam container for contrast.
    3.  Fix "Permission Not Requested" bug in `Settings.tsx`.
    4.  Add "Pinch to Start" instruction text.

### Phase 2: Retention Loop (Next 1 Week)
- **Goal**: Make them want to come back tomorrow.
- **Tasks**:
    1.  Implement **Star Rating** component (visual reward).
    2.  Add **Level 2: Shapes** (Circle/Square tracing).
    3.  Add **Parent Lock** on Settings route.

### Phase 3: The "Product" (Next 1 Month)
- **Goal**: Paid conversion / Viral growth.
- **Tasks**:
    1.  **Offline PWA**: Cache models and assets.
    2.  **Voiceovers**: Recorded human voice for all prompts.
    3.  **Mascot Accessories**: Unlockable content.

---

## Related Tickets

All Phase 1 tasks have been addressed by the following tickets:

| Task | Ticket ID | Status |
|------|------------|--------|
| Add Home button | TCK-20260130-008 | OPEN |
| Fix contrast | TCK-20260130-014 | OPEN |
| Fix permission bug | TCK-20260131-002 | OPEN |
| Add pinch animation | TCK-20260130-010 | OPEN |
| Parent gate | TCK-20260130-009 | OPEN |

Phase 2 and Phase 3 tasks remain to be implemented.

See worklog for full ticket details.

