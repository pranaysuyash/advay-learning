# Emoji Match Game - Video UX Audit

## Game Information

- **Game**: Emoji Match
- **Date**: February 20, 2026
- **Auditor**: AI Agent (Video UX Analysis)
- **Scope**: Gameplay UX, hand-tracking performance, child-friendliness, timer/pacing
- **Ticket**: TCK-20260220-002
- **Video Source**: `/Users/pranay/Desktop/emoji_match.mov` (compressed to 4MB for analysis)

---

## Executive Summary

### Overall Child-Friendliness Rating: **6/10** ⚠️

The game has strong visual foundations but critical pacing and progression bugs that break the experience for young children.

### Critical Issues Found: **4**
### Medium Issues: **5**
### Minor Issues: **2**

**🚨 Note:** Two critical bugs discovered: (1) Level progression repeats incorrectly, (2) Start button doesn't work with hand tracking.

---

## 🔴 Critical Issues (Must Fix)

### Issue #1: Level Progression Bug - Levels Repeat Incorrectly

**Severity:** CRITICAL  
**Impact:** Confuses children about progress, breaks game flow  
**Category:** Game Logic / Progression Bug

**Evidence:**
- Video timestamp: 00:22 - "Level 1 complete!" celebration shown
- Video timestamp: 00:40 - "Level 1 complete!" celebration shown **AGAIN** (second time for same level)
- Video timestamp: 00:54 - "Level 2 complete!" celebration shown
- Video timestamp: 01:28 - "Level 3 complete!" celebration shown, but should be Level 4 (reached twice in 01:28 and 01:46)

**Problem:**
- Level 1 completed twice before progressing to Level 2
- Level 3 appears to be reached multiple times
- Children lose sense of achievement when levels repeat
- Progression feels broken and unpredictable

**Root Cause Analysis:**
- Possible state management bug where level counter doesn't increment
- Or round counter within level vs actual level progression confusion
- "R1/10" counter might be triggering level complete at wrong intervals

**Recommendation:**
- Fix state management to ensure level increments correctly after each 10-round set
- Add logging to track level transitions
- Add assertion tests: Level N complete → Level N+1 starts (never repeat)
- Consider adding level number display during gameplay

**Fix Priority:** P0 - Game-breaking bug

---

### Issue #2: Start Button Not Interactive (Not Pinchable)

**Severity:** CRITICAL  
**Impact:** Children can't start the game with hand gestures  
**Category:** Interaction Design / Hand Tracking

**Evidence:**
- Video timestamp: 00:00 - "Start Emoji Match" button visible
- Player hand moves toward button but game starts via other means (mouse/touch?)
- Button appears to be a standard web button, not hand-tracked

**Problem:**
- Game promotes hand tracking as primary input method
- But the START button requires mouse/touch to activate
- Breaks the immersion and interaction paradigm
- Children may wave hands at button wondering why it doesn't work

**Recommendation:**
- **Option A:** Make button pinchable (detect pinch gesture over button area)
- **Option B (Preferred):** Transform into a **big physical-style button**:
  - Large square or circle (150-200px minimum)
  - 3D "pushable" appearance with depth/shadow
  - Visual press animation when hand approaches
  - Registers activation when palm/hand covers button (not just pinch)
  - Use whole-hand "push" gesture - more intuitive for children
  - Add sound effect: "boing" or "pop" when pressed

**Child-Friendly Design Reference:**
Think of a big colorful arcade button or elevator button - kids love slapping/pushing them with their whole hand.

**Fix Priority:** P0 - Core interaction broken

---

### Issue #3: Extremely Tight Timer (20 seconds for 10 rounds)

**Severity:** CRITICAL  
**Impact:** Children will feel rushed and frustrated  
**Category:** Pacing / Child Psychology

**Evidence:**
- Video timestamp: 00:00 - Timer starts at 20s for 10 rounds (R1/10)
- Gives only ~2 seconds per emoji selection
- Observed: Player rushing through selections

**Problem:**
- 2 seconds per decision is too fast for children aged 4-8
- Creates anxiety rather than learning environment
- No time to process the emotion word and find matching emoji

**Recommendation:**
- Increase to **40 seconds minimum** for Level 1
- Or remove timer entirely for younger children
- Implement adaptive difficulty (faster only after consistent success)

**Fix Priority:** P0 - Blocks release for target age group

---

### Issue #4: Confusing Progress Notation "R1/10"

**Severity:** CRITICAL  
**Impact:** Children don't understand their progress  
**Category:** UI Copy / Child Communication

**Evidence:**
- Video shows text "R1/10", "R2/10", "R3/10" in top-left
- "R" is not a child-friendly abbreviation

**Problem:**
- "R" is unclear (Round? Repetition?)
- Young children may not understand fractions like "1/10"
- No visual sense of completion progress

**Recommendation:**
- Replace with visual progress dots (10 dots, filling as completed)
- Or use text: "1 of 10" with larger font
- Add celebratory "X more to go!" messages

**Fix Priority:** P0 - Confuses target users

---

## 🟠 Medium Issues (Should Fix)

### Issue #5: Hand Tracking Lag & Detection Issues

**Severity:** MEDIUM  
**Impact:** Selections don't register, causing frustration  
**Category:** Hand Tracking / Technical Performance

**Evidence:**
- 00:07: Hand reaches sad emoji, selection doesn't register immediately
- 00:10: Pinch gesture over emoji, no response
- 00:26: Message appears "Pinch directly on an emoji" - indicates missed attempts
- 00:57: Same issue - "Pinch directly on an emoji" tooltip appears

**Problem:**
- Detection radius is too small
- Lag between hand position and registration
- Children need precise positioning which is difficult

**Recommendation:**
- Increase hit detection radius by 20-30%
- Add visual feedback when hand enters "pinch zone"
- Implement tolerance for near-misses (within 20px counts)
- Consider reducing pinch gesture precision requirement

**Fix Priority:** P1 - Affects core gameplay

---

### Issue #6: Poor Hand Tracking Visibility

**Severity:** MEDIUM  
**Impact:** Children can't see where their hand is detected  
**Category:** Visual Feedback / Accessibility

**Evidence:**
- Cyan pinch indicator circles are tiny (~15px diameter)
- Color blends with dark background
- Hard to see in peripheral vision

**Problem:**
- Small children can't track their hand position visually
- No clear indication of "active" pinch state
- Difficult to align hand with targets

**Recommendation:**
- Increase indicator size to 40-50px
- Add glowing/pulsing animation when in pinch zone
- Consider a "laser pointer" trail effect
- Use brighter color (white with cyan outline)

**Fix Priority:** P1 - Accessibility issue

---

### Issue #7: Cluttered Background Interferes with Gameplay

**Severity:** MEDIUM  
**Impact:** Visual distraction, reduces focus on emojis  
**Category:** Visual Design / AR Overlay

**Evidence:**
- Ceiling fan constantly spinning in background (distracting motion)
- Room furniture and curtains visible
- Child's reflection/face partially visible

**Problem:**
- Real-world environment competes for attention
- Moving objects (fan) are especially distracting
- Makes it harder to locate emojis against busy background

**Recommendation:**
- Add semi-transparent dark overlay (50-60% opacity)
- Or blur background using CSS backdrop-filter
- Option: Virtual background or solid color backdrop

**Fix Priority:** P1 - Would improve engagement significantly

---

### Issue #8: Inconsistent Instruction Messaging

**Severity:** MEDIUM  
**Impact:** Confusion about what to do  
**Category:** UX Copy / Instructions

**Evidence:**
- Initial: "Pinch the emoji that matches the emotion!"
- During play: "Find: [Emotion]"
- On miss: "Pinch directly on an emoji."
- Three different instruction styles observed

**Problem:**
- Inconsistent language confuses children
- "Pinch directly on an emoji" is reactive (after failure) not proactive
- No consistent verb (Pinch vs Find vs Tap)

**Recommendation:**
- Standardize on one instruction: "Pinch the [EMOTION] emoji!"
- Use consistent verb throughout
- Show emotion word with emoji icon for pre-readers

**Fix Priority:** P2 - Confusion but not blocking

---

### Issue #9: Timer Text Too Small and Low Contrast

**Severity:** MEDIUM  
**Impact:** Hard to see time remaining  
**Category:** Typography / Readability

**Evidence:**
- Timer in top-right is small (~14px)
- White text on dark background has low contrast
- No visual urgency indicator (color change when low)

**Problem:**
- Children with developing vision can't read it
- No sense of time pressure until too late
- Poor accessibility for visually impaired users

**Recommendation:**
- Increase font size to 24px minimum
- Add colored background pill behind timer
- Change color as time runs low (green → yellow → red)
- Consider removing timer entirely for Level 1

**Fix Priority:** P2 - Accessibility improvement

---

## 🟡 Minor Issues (Nice to Have)

### Issue #10: Level Complete Animation Timing

**Severity:** LOW  
**Impact:** Celebration feels abrupt  
**Category:** Animation / Polish

**Evidence:**
- 00:22, 00:55, 01:28: Confetti appears while gameplay elements still visible
- "Tap anywhere to continue" is easy to miss

**Problem:**
- Confetti overlays active game UI
- No clear transition to "level complete" state
- Easy to accidentally tap through celebration

**Recommendation:**
- Pause/fade background gameplay before celebration
- Make celebration fullscreen with clear CTA
- Auto-progress after 3-5 seconds if no input

**Fix Priority:** P3 - Polish item

---

### Issue #11: Score Display Too Subtle

**Severity:** LOW  
**Impact:** Children don't feel rewarded for points  
**Category:** Gamification / Visual Design

**Evidence:**
- Score shown as small number in top-right
- No visual accumulation (coins filling, bar increasing)
- "690" final score is just a number

**Problem:**
- Abstract numbers don't motivate young children
- No visual feedback for correct answers
- Missed opportunity for positive reinforcement

**Recommendation:**
- Replace with visual progress (stars filling up)
- Show "+10" popups on each correct answer
- Animate score counting up at level end

**Fix Priority:** P3 - Engagement improvement

---

## ✅ Strengths to Preserve

| Feature | Why It Works | Location in Video |
|---------|--------------|-------------------|
| **Color-coded emoji rings** | Intuitive association (Red=Angry, Blue=Sad, etc.) | Throughout |
| **Immediate visual feedback** | Green checkmark on correct selection | 00:07, 00:10 |
| **Confetti celebration** | Engaging reward animation | 00:22, 00:55 |
| **Fox mascot** | Cute character adds personality | Level complete screens |
| **Glowing emoji rings** | High visibility against dark background | Throughout |
| **Clear success messages** | "Yes! That's Happy!" reinforces learning | 00:22, 01:48 |

---

## Recommendations Summary by Priority

### P0 (Fix Before Release)
1. **Fix level progression bug** - Ensure levels don't repeat (Level 1 celebrated twice)
2. **Make start button pinchable** or transform into big pushable physical-style button
3. **Increase timer to 40s** for Level 1, or remove entirely for younger children
4. **Replace "R1/10" with visual progress dots** or "1 of 10" text

### P1 (High Priority)
5. **Increase hand tracking detection radius** by 20-30%
6. **Make hand tracking indicators 2x larger** with glow effect
7. **Add background blur/overlay** to reduce distraction

### P2 (Medium Priority)
8. **Standardize instruction text** to "Pinch the [EMOTION] emoji!"
9. **Increase timer text size** and add color urgency indicator

### P3 (Polish)
10. **Improve level complete transition** (pause background first)
11. **Make score visual** with animated coins/stars instead of numbers

---

## Video Evidence Reference

| Timestamp | Observation | Issue # |
|-----------|-------------|---------|
| 00:00 | Timer starts at 20s for 10 rounds | #3 |
| 00:00 | Start button not pinchable (hand tracking only) | #2 |
| 00:07 | Hand reaches emoji, slight delay before registration | #5 |
| 00:10 | Pinch over emoji, no immediate response | #5 |
| 00:22 | Level 1 complete (first occurrence) | #1 |
| 00:40 | Level 1 complete (**second occurrence - BUG**) | #1 |
| 00:54 | Level 2 complete | #1 |
| 00:22 | Level complete confetti overlays active game | #10 |
| 00:26 | "Pinch directly on an emoji" tooltip appears | #5, #8 |
| 00:57 | Pinch tooltip appears again | #5 |
| 01:28 | Level 3 complete | #1 |
| 01:46 | Level 3 complete (**second occurrence - BUG**) | #1 |
| 01:48 | "Emotion Expert!" celebration screen | ✅ Good |

---

## Child Development Considerations

**Target Age:** 4-8 years

### What's Appropriate:
- ✅ Simple emotion matching (age 4+)
- ✅ Color coding as visual aid
- ✅ Immediate feedback (checkmarks)
- ✅ Cute mascot (fox character)

### What's Challenging:
- ⚠️ Reading emotion words (ages 4-5 may struggle)
- ⚠️ Fast-paced decision making under time pressure
- ⚠️ Precise hand tracking coordination

### Suggested Age Adaptations:
- **Ages 4-5:** Remove timer, show emotion icons with words, larger hit targets
- **Ages 6-7:** 40s timer, current format
- **Ages 8+:** Optional 20s challenge mode

---

## Related Tickets

- TCK-20260201-012: ConnectTheDots camera integration (hand tracking reference)
- TCK-20260218-001: Games exploration and smoke tests
- docs/GAMES.md: Game catalog with Emoji Match entry

---

*Audit conducted via video analysis. For implementation, see video_compress.py tool in tools/ directory.*
