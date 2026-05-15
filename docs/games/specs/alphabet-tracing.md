# Alphabet Tracing (Draw Letters)

**Game ID:** alphabet-tracing  
**World:** Letter Land  
**Manifest:** `src/frontend/src/data/gameRegistries/letterLand.ts`  
**Code:** `src/frontend/src/pages/AlphabetGame.tsx` (+ subdirectory)

---

## 1. Concept Summary

- **One-line concept:** Trace letters with your finger/hand to learn handwriting
- **Genre:** Educational / Tracing / Pre-writing skills
- **Target audience:** Ages 2-8, early literacy learners
- **Core player fantasy:** "I can write letters!" - magical transformation of hand movements into written characters
- **Primary skill tested:** Fine motor control, letter recognition, handwriting formation
- **Session length:** 2-5 minutes per letter
- **Platform context:** Flagship CV game, most polished learning experience

---

## 2. Repo Status

- **Implementation status:** ✅ Production Ready
- **What works now:**
  - Multi-language support (English, Hindi, Kannada, Telugu, Tamil)
  - Hand tracking-based drawing
  - Real-time accuracy calculation
  - Progress persistence
  - Tutorial system
  - Wellness break reminders
  - Session restoration
- **What is partial/missing:**
  - Advanced analytics (marked in code but not fully implemented)
- **Evidence:**
  - Main file: `src/frontend/src/pages/AlphabetGame.tsx` (993 lines)
  - Components: `src/frontend/src/pages/alphabet-game/` (10 files)
  - Data: `src/frontend/src/data/alphabets.ts`
- **Confidence level:** High - Most mature game in repo

---

## 3. Current Implementation

### Flow
1. **Pre-game menu:** Language selection, difficulty, progress display
2. **Tutorial:** Optional hand tracking tutorial
3. **Gameplay:** 
   - Letter displayed with tracing guide
   - Player uses hand pinch to draw
   - Real-time accuracy feedback
   - Score calculated on completion
4. **Completion:** Celebration, next letter, progress save

### Controls
- **Hand pinch:** Start/stop drawing
- **Hand movement:** Trace letter shape
- **Primary controls:** Hand pinch drawing with mouse/touch fallback and keyboard pause/escape support

### Mechanics
- Pinch to start drawing
- Trace within letter boundaries
- Accuracy calculated by overlap with target letter
- Score based on accuracy percentage
- Streak tracking for consecutive good traces

### Scoring
- **Accuracy 90-100%:** 3 stars, maximum points
- **Accuracy 70-89%:** 2 stars, good points
- **Accuracy 40-69%:** 1 star, partial points
- **Accuracy <40%:** Retry

### Visuals/UI
- Large letter display with tracing guide
- Canvas overlay for drawing
- Real-time accuracy indicator
- Score popup on completion
- Celebration confetti on success

### Gaps/Issues
- No alternative input methods (pure CV)
- Accuracy calculation may feel strict for young children

---

## 4. Intended Design

Based on manifest and code evidence:

- **Educational goal:** Pre-writing skills, letter recognition
- **Pedagogical approach:** Multi-sensory (visual + kinesthetic)
- **Language support:** Progressive literacy across multiple Indian languages
- **Accessibility:** Reduced motion support, wellness breaks
- **Progression:** Letter-by-letter, language-by-language mastery

### Core Loop
1. See letter with example word (A for Apple)
2. Trace with hand
3. Get immediate feedback (color-coded accuracy)
4. Earn stars and rewards
5. Progress to next letter
6. Build writing confidence

---

## 5. Drift Analysis

### Where Implementation Matches Intent
✅ Multi-language support implemented  
✅ Hand tracking drawing works well  
✅ Accuracy feedback is clear  
✅ Progress persistence works  
✅ Tutorial system helps onboarding  

### Where Implementation Exceeds Intent
🌟 Wellness features (break reminders, hydration)  
🌟 Session persistence (resume where left off)  
🌟 Multiple icon choices per letter  

### Where Implementation Falls Short
✅ Phonics audio feedback is implemented via usePhonics (spoken examples and prompts)  
⚠️ Limited error correction guidance  
⚠️ No collaborative/multiplayer mode  

### Overall Assessment
**Alignment: 95%** - This is the flagship implementation that other games should emulate.

---

## 6. Recommended Canonical Version

The current implementation IS the canonical version with minor enhancements:

### Keep (Current Strengths)
- Multi-language support
- Hand tracking drawing
- Accuracy calculation
- Progress persistence
- Tutorial system
- Wellness integration

### Enhance
1. **Phonics audio:** Play letter sound + example word pronunciation
2. **Better error feedback:** Show where trace went wrong
3. **Difficulty levels:** 
   - Easy: Thicker guide lines
   - Medium: Current implementation
   - Hard: No guide lines
4. **Celebration variety:** Different animations for 1/2/3 stars

### Remove
- Nothing significant

---

## 7. Visual Identity

- **Overall look:** Clean, bright, educational
- **Camera view:** Side panel (not full screen)
- **Art style:** Friendly icons, rounded shapes
- **Mood:** Encouraging, patient, rewarding
- **Colors:** Letter-specific colors (A=red, B=blue, etc.)
- **Environment:** Simple background, focus on letter
- **UI style:** Large buttons, clear text, mascot presence

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Pre-Game Menu** | Language/setup | Language flags, difficulty, progress stats, play button |
| **Tutorial** | Onboarding | Hand tracking guide, pinch demonstration |
| **Gameplay** | Core experience | Letter display, canvas, accuracy indicator, progress |
| **Completion** | Reward | Stars earned, score, next letter button, celebration |
| **Pause** | Break | Resume, restart, exit options |
| **Wellness Reminder** | Health | Break suggestion after 20 minutes |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Start drawing | Pinch fingers | Cursor changes color |
| Draw | Move hand | Line appears on canvas |
| Stop drawing | Release pinch | Accuracy calculated |
| Select letter | Menu tap | Letter loads |
| Change language | Menu tap | Language switches |

---

## 10. Core Mechanics

### Drawing System
- Hand position tracked → cursor position
- Pinch state tracked → drawing on/off
- Points recorded when pinch active
- Path smoothed for display

### Accuracy Calculation
```typescript
// Inferred from useRealTimeAccuracy.ts
// Compare drawn path to ideal letter shape
// Percentage overlap = accuracy score
```

### Progression
- Letters presented in alphabet order
- Must achieve 40%+ to advance
- Can retry any letter
- Progress saved to backend

---

## 11. Rules

- **Start:** Select language and difficulty
- **Allowed:** Trace any path while pinching
- **Restricted:** Cannot draw without pinching
- **Scoring:** Based on accuracy percentage
- **Retry:** Unlimited attempts per letter
- **Advance:** Automatic after completion

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Letter display | Show target | Static per round |
| Tracing guide | Help formation | Static overlay |
| Accuracy % | Feedback | Real-time while drawing |
| Score | Reward | On completion |
| Progress bar | Session progress | After each letter |
| Language flag | Current language | Menu selection |
| Streak counter | Motivation | On consecutive successes |

---

## 13. Feedback and Feel

### Success
- Color-coded accuracy (green/orange/red)
- Star rating (1-3 stars)
- Confetti celebration
- Positive mascot feedback
- Score popup animation

### Failure
- Gentle retry prompt
- No punishment for mistakes
- Encouraging messages

### Responsiveness
- Real-time cursor following
- Immediate pinch response
- Smooth line drawing
- No perceptible lag

---

## 14. Points / Rewards / Progression

### Points
- Base points for completion
- Accuracy multiplier
- Streak bonus

### Rewards
- Stars (1-3 per letter)
- Drops: Rainbow color, paintbrush tool
- Progress tracking across sessions

### Progression
- Individual letter mastery
- Alphabet completion per language
- Cross-language learning supported

---

## 15. End States

### Round End (Letter Complete)
- Accuracy calculated
- Stars awarded
- Score displayed
- Next letter button
- Option to retry

### Session End
- Progress saved automatically
- Can resume from last letter
- Profile statistics updated

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Canonical)
Hand tracking + pinch drawing

### Mode B: Touch/Mouse Fallback
For devices without camera:
- Touch/mouse drawing
- Same accuracy calculation
- Lower engagement but accessible

### Mode C: Guided Mode (Easier)
- Thicker guide lines
- Snap-to-guide assistance
- Higher tolerance for accuracy
- For younger children (ages 2-3)

### Mode D: Challenge Mode (Harder)
- No guide lines
- Faster accuracy calculation
- Time limit per letter
- For older children (ages 6-8)

---

## 17. Improvement Opportunities

### Low Cost
- Add phonics audio feedback
- More celebration animations
- Better error indication

### Medium Effort
- Difficulty levels (guided/normal/challenge)
- Parent dashboard integration
- Detailed progress analytics

### Ambitious
- AI-powered handwriting assessment
- Adaptive difficulty based on performance
- Multiplayer "write together" mode
- AR letter projection on paper

---

## 18. Content Model

### Letters
- 26 English letters
- Similar sets for Hindi, Kannada, Telugu, Tamil
- Each with: char, name, icons, color, pronunciation

### Icons
- Multiple icon options per letter
- SVG format
- Themed to letter sound

### Data Source
`src/frontend/src/data/alphabets.ts`

---

## 19. Technical Structure

### Main Files
- `src/frontend/src/pages/AlphabetGame.tsx` - Main component (993 lines)
- `src/frontend/src/pages/alphabet-game/PreGameMenu.tsx` - Setup UI
- `src/frontend/src/pages/alphabet-game/GamePlayArea.tsx` - Drawing canvas
- `src/frontend/src/pages/alphabet-game/useDrawingLoop.ts` - Drawing logic
- `src/frontend/src/pages/alphabet-game/useRealTimeAccuracy.ts` - Accuracy calc

### State Management
- Zustand stores for progress, settings
- Local refs for drawing state
- Session persistence for resume

### CV Integration
- `useGameHandTracking` hook
- Pinch detection for draw on/off
- Hand position for cursor

### Dependencies
- MediaPipe hand tracking
- Framer Motion for animations
- Canvas API for drawing

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Phonics audio | Mentioned in docs but not in code | High |
| Parent progress view | Backend supports, UI unclear | Medium |
| Analytics | Code present but not fully wired | Medium |

---

## 21. Implementation Notes

### Strengths to Preserve
- Component separation (alphabet-game/ subdirectory)
- Hook-based architecture
- Session persistence pattern
- Wellness integration

### Refactor Opportunities
- Main file is 993 lines - could split further
- Some prop drilling in PreGameMenu

### Testing Focus
- Accuracy calculation edge cases
- Session persistence reliability
- Language switching

---

## 22. Acceptance Criteria

- [ ] Hand tracking draws smoothly
- [ ] Accuracy calculates correctly
- [ ] All 5 languages work
- [ ] Progress persists across sessions
- [ ] Tutorial helps new users
- [ ] Wellness reminders appear
- [ ] Celebrations feel rewarding

---

## 23. Test Plan

### Manual Checks
- [ ] Trace letter A, verify accuracy
- [ ] Switch language, verify letter changes
- [ ] Complete session, verify progress saved
- [ ] Resume session, verify continues correctly

### State Transitions
- [ ] Menu → Tutorial → Gameplay → Completion
- [ ] Gameplay → Pause → Resume
- [ ] Gameplay → Wellness reminder → Continue

### Edge Cases
- [ ] No hand detected
- [ ] Very inaccurate tracing
- [ ] Rapid language switching
- [ ] Session timeout

---

**Last Updated:** 2026-04-01  
**Confidence:** High - This is the reference implementation for the platform
