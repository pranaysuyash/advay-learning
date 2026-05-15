# Word Builder - Comprehensive Game Specification

**Game ID:** `word-builder`  
**World:** Word Workshop  
**Category:** Literacy / Spelling / Phonics  
**Audit Date:** March 20, 2026  
**Spec Version:** 1.0 (Full 23-Section Audit Format)

---

## 1. Concept Summary

**One-line concept:** Children spell words by selecting letters in order from a scattered cloud, building reading and spelling skills through interactive letter recognition.

**Genre/Subgenre:** Educational / Literacy / Visual Recognition

**Target Audience:** Children ages 5-8, early readers, ESL learners

**Core Player Fantasy:** "I'm a word detective finding the right letters to build words"

**Primary Skills Tested:**
- Letter recognition (uppercase)
- Spelling sequence memory
- Phonemic awareness (in phonics mode)
- Pattern recognition (CVC, blends, digraphs)
- Fine motor control (target selection)

**Session Length:** 3-10 minutes (timed mode: 90 seconds)

**Platform/Context:** Browser-based with camera hand tracking primary, touch/mouse fallback

---

## 2. Repo Status

**Implementation Status:** ✅ **Implemented** - Functional with curriculum system

**What Works Now:**
- 1,200+ word database with tagging system
- Two game modes: Explore and Phonics
- 8 phonics stages (CVC, blends, digraphs, etc.)
- Letter target generation with distractors
- Hand tracking with pinch selection
- Scoring with streak bonuses
- Analytics tracking per session
- Voice instructions (TTS)

**What Is Partial/Missing/Broken:**
- Limited to uppercase letters only
- No actual phonics audio (letter sounds not pronounced)
- No adaptive difficulty based on performance
- Limited accessibility options

**Evidence (Files/Paths/Line Ranges):**
- Main logic: `src/frontend/src/games/wordBuilderLogic.ts` (lines 1-658)
- Component: `src/frontend/src/pages/WordBuilder.tsx` (lines 1-998)
- Word bank: `src/frontend/src/games/wordbank/wordbank.json`
- Curriculum: `src/frontend/src/games/wordbank/curriculum.json`

**Confidence Level:** HIGH

---

## 3. Current Implementation

### Core Gameplay Loop
1. **Select Mode:** Choose Explore (difficulty-based) or Phonics (curriculum-based)
2. **Generate Word:** Pick word from wordbank based on criteria
3. **Create Targets:** Generate letter targets + distractors
4. **Position Targets:** Scatter across game area
5. **Display Prompt:** Show word and first letter hint
6. **Select Letters:** Player taps letters in spelling order
7. **Validate:** Check if selected letter matches current position
8. **Feedback:** Visual/audio feedback for correct/incorrect
9. **Complete Word:** Celebration when fully spelled
10. **Next Word:** Continue until time expires or session ends

### Controls

**Hand Tracking (Primary):**
- Move cursor: Index finger position
- Select: Pinch gesture (hold to confirm)

**Mouse/Touch Fallback:**
- Move: Cursor/touch position
- Select: Click/tap

**Keyboard:**
- Limited support (UI navigation only)

### Mechanics

**Word Selection:**
- Explore mode: Filter by difficulty level (1-4)
- Phonics mode: Filter by curriculum stage criteria
- LRU cache prevents immediate repetition

**Target Generation:**
- Correct letters: One per character in word
- Distractors: 2-3 random letters not in word
- Positions: Randomly scattered with minimum spacing

**Scoring:**
```typescript
basePoints = 10;
streakBonus = min(streak × 2, 15);
total = basePoints + streakBonus;
```

**Timing:**
- Session timer: 90 seconds
- No per-word time limit

### Visuals/UI
- Scattered letter targets (circular buttons)
- Word display at top
- Progress dots showing current position
- Score and timer in HUD
- Cursor with pinch indicator

### Gaps/Bugs/Placeholders
- No phonics audio (letters not sounded out)
- Only uppercase letters
- No visual indication of word meaning

---

## 4. Intended Design

**Evidence from Name/Theme/Assets:**
- "Word Builder" suggests constructing words meaningfully
- "Phonics mode" implies sound-based learning
- 1,200 word database with pronunciation/meaning fields suggests deeper language focus
- Curriculum JSON with stage progression suggests structured literacy development

**Stronger Mechanic Interpretation:**
The game was likely intended to be:
1. A **phonics-first** learning tool where letter sounds are primary
2. A **meaningful vocabulary builder** with picture/word associations
3. A **pattern recognition** trainer for decoding skills
4. An **adaptive** system that responds to child's performance

**Missing Features Implied by Concept:**
- Letter sound pronunciation (phonics audio)
- Picture cues for word meanings
- Lowercase letter exposure
- Word-in-context (simple sentences)
- Spelling rule explanations

**Places Where Current Build Undershoots Concept:**
- Letters are silent (no phonics audio)
- Visual matching dominates over sound/spelling connection
- No word meanings shown
- Static difficulty (no adaptation)

---

## 5. Drift Analysis

**Where Implementation Diverged from Intent:**

| Aspect | Intended | Current | Severity |
|--------|----------|---------|----------|
| Letter sounds | Phonetic pronunciation | Silent letters | HIGH |
| Learning focus | Sound-spelling connection | Visual matching | HIGH |
| Vocabulary | Word meanings shown | Letters only | MEDIUM |
| Case exposure | Upper + lower | Upper only | MEDIUM |
| Difficulty | Adaptive per child | Static levels | LOW |

**Likely Causes:**
1. **Missing audio assets:** Phonics pronunciation not recorded/integrated
2. **Scope reduction:** Meaningful vocabulary features cut for MVP
3. **Technical constraint:** Lowercase recognition deemed lower priority

**Impact Assessment:**
- **Play quality:** Functional but shallow
- **Educational value:** SIGNIFICANTLY REDUCED - missing phonics connection
- **Engagement:** Lower without audio feedback
- **Overall:** HIGH drift - core educational value compromised

---

## Mechanic Quality Check

**Current Mechanic:** Visual letter matching with silent letters

**Why It Is Weak:**
- Children match shapes, not sounds
- No phonemic awareness development
- Word becomes "find the right shape" not "spell the word"
- Distractors are arbitrary, not phonetically similar

**What the Stronger Mechanic Should Be:**
1. **Audio-first:** Letter pronounced on hover/selection
2. **Phoneme blending:** Sound out letters as they're selected
3. **Picture-word association:** Image shown with word
4. **Phonetic distractors:** Wrong answers that sound similar

**Recommendation:** REFACTOR to audio-first phonics approach. The current visual-matching mechanic should be retained only as a "Silent Mode" accessibility option.

---

## 6. Recommended Canonical Version

**What the Game Should Be:**

Word Builder should be a **phonics-centered spelling experience** that:
1. Teaches sound-letter correspondence through audio
2. Builds phonemic awareness by blending sounds
3. Connects spelling to meaning through visuals
4. Adapts difficulty based on mastery

**Why This Version Is Superior:**
- Phonics is evidence-based for early reading
- Audio feedback reinforces correct associations
- Picture cues support vocabulary development
- Adaptive difficulty prevents frustration/boredom

**Key Improvements Over Current:**
1. Add letter sound pronunciation (TTS or recorded)
2. Show word picture throughout spelling
3. Sound-blend as letters are selected
4. Add lowercase letters (toggle or progression)
5. Implement adaptive difficulty

---

## 7. Visual Identity

**Overall Look/Feel:**
- Clean, educational aesthetic
- Friendly and approachable
- Focus on readability

**Camera/View:**
- Fixed 2D view (no camera movement)
- Full-screen game area

**Art Style:**
- Flat design with subtle shadows
- Circular letter targets
- Clear, sans-serif typography

**Mood/Colors:**
- Background: Learning cream/off-white
- Correct: Green glow
- Wrong: Red glow with shake
- Neutral: Blue/gray targets

**UI Elements:**
- Word display at top
- Progress dots
- Score/timer badges
- Letter targets (circular)

---

## 8. Screen Map

### Mode Select
- **Purpose:** Choose Explore or Phonics mode
- **Elements:** Mode cards, stage selector (if phonics)

### Gameplay
- **Purpose:** Main spelling activity
- **Elements:** Word display, letter targets, cursor, HUD

### Results
- **Purpose:** Session summary
- **Elements:** Words completed, score, accuracy, streak

### Settings
- **Purpose:** Adjust game options
- **Elements:** Mode switch, audio toggle, auto-advance

---

## 9. Controls

### Hand Tracking
| Action | Input |
|--------|-------|
| Move cursor | Index finger |
| Select | Pinch and hold |

### Mouse/Touch
| Action | Input |
|--------|-------|
| Move | Cursor/touch |
| Select | Click/tap |

**Accessibility Considerations:**
- Large hit targets (circular)
- Visual cursor always visible
- Audio feedback for all actions

---

## 10. Core Mechanics

### Player Actions
1. **Scan** - Look for next letter
2. **Aim** - Position cursor over target
3. **Select** - Confirm selection
4. **Sequence** - Repeat for each letter

### System Response
- Correct: Target disappears, progress advances, positive audio
- Wrong: Target shakes, error sound, no progress
- Complete: Celebration, score added, next word

### Entities
- **Letter Targets:** Selectable letters
- **Word:** Current target word
- **Progress:** Position in spelling sequence

### Win/Fail Conditions
- **Win:** Complete word spelling
- **Fail:** Time expires (timed mode only)

---

## 11. Rules

### Start Conditions
- Mode selected
- Word generated from bank
- Targets scattered

### Allowed Actions
- Select any visible letter
- Proceed in correct spelling order only

### Restricted Actions
- Cannot skip letters
- Cannot select already-found letters

### Scoring
- Base: 10 points per word
- Streak: +2 per consecutive word (max +15)

---

## 12. HUD / Gameplay UI

### Score
- **Where:** Top-left
- **Shows:** Current points

### Timer
- **Where:** Top-right (timed mode)
- **Shows:** Seconds remaining

### Progress
- **Where:** Below word
- **Shows:** Dots for each letter (filled = found)

### Word Display
- **Where:** Top-center
- **Shows:** Current word (optional: picture)

---

## 13. Feedback and Feel

### Success
- Pop sound
- Target fades out
- Progress dot fills
- Streak milestone celebration

### Failure
- Error sound
- Target shakes
- No progress

### Complete Word
- Celebration sound
- Score popup
- "Great job!" message

---

## 14. Points / Rewards / Progression

### Points
- Per word: 10-25 points
- Streak bonus: Up to +15

### Achievements
- Word Wizard: 10 words error-free
- Stage Master: Complete all phonics stages

### Progression
- Phonics stages unlock sequentially
- Explore mode levels increase word length

---

## 15. End States

### Session End (Timed)
- **Trigger:** Timer reaches 0
- **Shows:** Final score, words completed, accuracy

### Session End (Manual)
- **Trigger:** Player exits
- **Shows:** Progress saved (if applicable)

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Audio-First (Canonical)
- Letters pronounced on hover
- Phoneme blending
- Picture cues

### Mode B: Visual Only (Current)
- Silent letters
- Shape matching focus
- For hearing-impaired or quiet environments

### Mode C: Type Mode
- Keyboard input instead of selection
- Typing practice

### Mode D: Sentence Builder
- Words in sentence context
- Reading comprehension focus

---

## 17. Improvement Opportunities

### Low-Cost
1. Add letter sound TTS
2. Show word pictures
3. Add lowercase option

### Medium-Effort
1. Phoneme blending audio
2. Adaptive difficulty
3. Word meanings/definitions

### Ambitious
1. Speech recognition (child says letter)
2. Handwriting recognition (child writes letter)
3. AI tutor with hints

---

## 18. Content Model

### Words
- 1,200 tagged words
- Difficulty 1-4
- Patterns: CVC, blends, digraphs, sight words

### Curriculum
- 8 phonics stages
- Sequential progression
- Mastery tracking

---

## 19. Technical Structure

### Main Files
- `wordBuilderLogic.ts` - Core logic
- `WordBuilder.tsx` - Component
- `wordbank.json` - Word database
- `curriculum.json` - Stage definitions

### Dependencies
- Hand tracking hook
- TTS system
- Analytics SDK

---

## 20. Gaps and Unknowns

### Missing
| Gap | Impact |
|-----|--------|
| Phonics audio | HIGH - Core learning missing |
| Word pictures | MEDIUM - Context missing |
| Lowercase | MEDIUM - Incomplete literacy |

### Evidence Needed
- User testing on phonics vs visual focus
- Performance data on learning outcomes

---

## 21. Implementation Notes

### Priority Fixes
1. Integrate letter sound audio
2. Add word picture display
3. Implement adaptive difficulty

### Feature Flags
```typescript
const FEATURES = {
  PHONICS_AUDIO: false, // Enable when audio ready
  PICTURE_CUES: false,
  ADAPTIVE_DIFFICULTY: false,
};
```

---

## 22. Acceptance Criteria

### Functional
- [ ] 1,200 words load correctly
- [ ] All 8 phonics stages work
- [ ] Hand tracking selection functional
- [ ] Scoring calculates correctly

### Educational
- [ ] Letter sounds play (when implemented)
- [ ] Curriculum progression logical
- [ ] Difficulty appropriate for age

### Quality
- [ ] No crashes during play
- [ ] Audio syncs with actions
- [ ] Responsive on target devices

---

## 23. Test Plan

### Manual Tests
| Test | Steps | Expected |
|------|-------|----------|
| Spell word | Select letters in order | Word completes |
| Wrong letter | Select wrong letter | Error feedback |
| Streak | Complete 3+ words | Bonus increases |
| Mode switch | Change explore/phonics | Different words |

### Edge Cases
- Empty word bank fallback
- Rapid selections
- Hand loss mid-game

---

*Spec created: March 20, 2026*  
**Drift Assessment: HIGH - Phonics audio missing significantly impacts educational value**
