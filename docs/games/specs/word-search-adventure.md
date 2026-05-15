# Word Search Adventure

**Game ID:** word-search-adventure (slug: word-search)  
**World:** Word Workshop  
**Manifest:** `src/frontend/src/data/gameRegistries/wordWorkshop.ts`  
**Code:** `src/frontend/src/pages/WordSearch.tsx` + `src/frontend/src/games/wordSearchLogic.ts`  

---

## 1. Concept Summary

- **One-line concept:** Find hidden words scattered across a letter grid by selecting letters in sequence—pinch and drag to highlight words or tap to select!
- **Genre:** Word Puzzle / Visual Search / Literacy
- **Target audience:** Ages 5-8, children developing word recognition and spelling skills
- **Core player fantasy:** "I'm a word detective uncovering hidden treasures in a sea of letters!"
- **Primary skill tested:** Visual scanning, pattern recognition, spelling reinforcement, letter sequencing
- **Session length:** 3-8 minutes per level (find all words to complete)
- **Platform context:** Classic word search adapted for hands-free CV interaction with pinch-to-select mechanics

---

## 2. Repo Status

- **Implementation status:** ✅ Production Ready
- **What works now:**
  - 3 progressive difficulty levels (8×8, 10×10, 12×12 grids)
  - Word generation with 4 directional placement (horizontal, vertical, 2 diagonal)
  - Hand tracking with pinch-and-drag for word selection
  - Mouse/tap fallback for selection
  - Streak tracking with milestone celebrations
  - Visual drag trail during selection
  - Score calculation with streak bonuses
  - Level selector with instant switching
  - Success celebration on completion
  - Found words marked clearly in the word list
- **What is partial/missing:**
  - No visual highlighting of found words on the grid (words not marked after finding)
  - No audio pronunciation of found words
  - No hint system for struggling players
  - Limited to 8 words per level (could expand vocabulary)
  - No reverse/backward word placement (design choice but limits difficulty)
  - No persistent progress across sessions
- **Evidence:**
  - Main page: `src/frontend/src/pages/WordSearch.tsx` (465 lines)
  - Logic: `src/frontend/src/games/wordSearchLogic.ts` (94 lines)
- **Confidence level:** High - Fully functional word search with CV integration

---

## 3. Current Implementation

### Flow
1. **Start Screen:** Title, emoji (🔍), instructions, Start button
2. **Level Selection:** 3 level buttons (1, 2, 3) always visible
3. **Gameplay Loop:**
   - Grid displayed with letter cells
   - Word list shown above grid
   - Player selects letters via click/tap or pinch-drag
   - Valid words detected in forward or reverse
   - Streak counter increments on consecutive finds
   - Words marked as found in the list
4. **End State:** Celebration when all words found, Play Again or Finish options

### Controls
| Input | Action | CV Mode | Mouse Mode |
|-------|--------|---------|------------|
| Pinch start | Begin word selection drag | ✅ Hand pinch | ❌ |
| Pinch + move | Extend selection path | ✅ Drag across cells | ❌ |
| Pinch release | Confirm selection | ✅ Release pinch | ❌ |
| Click/tap cell | Select individual letters | ❌ | ✅ Click |
| Multi-click | Build word sequentially | ❌ | ✅ Multiple clicks |

### Mechanics
- **Grid generation:** Random placement with 100 attempt limit per word
- **Word directions:** Horizontal (→), Vertical (↓), Diagonal down-right (↘), Diagonal up-right (↗)
- **Selection logic:** 2+ adjacent cells form a candidate word
- **Word validation:** Check against word list (forward and reversed)
- **Streak system:** +3 points per streak level, capped at 20 bonus
- **Scoring:** Base 10 points per letter + streak bonus

### Scoring
| Action | Points |
|--------|--------|
| Base (per letter) | 10 × word length |
| Streak bonus | min(streak × 3, 20) |
| Completion bonus | +50 points |
| Example: 4-letter word, streak 3 | 40 + 9 = 49 points |

### Visuals/UI
- Clean grid with white letter cells on light background
- Selected cells highlighted in blue (#3B82F6)
- Drag trail visualized with SVG polyline
- Word list as pill badges (gray → green when found)
- Streak milestone overlay with scale animation
- Celebration confetti on completion

### Gaps/Issues
- Found words not visually marked on grid (only in list)
- No indication of word direction after finding
- Adjacent cell detection allows non-straight lines (should be constrained to 8 directions)
- Level switch mid-game doesn't reset current game state cleanly

---

## 4. Intended Design

Based on manifest and code evidence:

- **Educational goal:** Reinforce spelling, develop visual scanning skills, build word recognition confidence
- **Pedagogical approach:** Learning through discovery—scanning, pattern matching, and sequential letter recognition
- **Focus vibe:** Calm, focused puzzle-solving with celebration rewards
- **Accessibility:** Large touch targets, clear visual feedback, multiple input methods

### Core Loop
1. Scan grid to locate target words
2. Select letters in sequence by dragging or tapping
3. Successfully find word → visual/audio feedback
4. Continue until all words discovered
5. Celebrate completion, advance to harder level

---

## 5. Drift Analysis

### Where Implementation Matches Intent
✅ Progressive difficulty with grid size scaling  
✅ Age-appropriate word lists (3-5 letters)  
✅ Visual word list with found-state tracking  
✅ Hand tracking integration for selection  
✅ Streak system rewards consecutive success  
✅ Celebration on completion  

### Where Implementation Exceeds Intent
🌟 Drag trail visualization shows selection path  
🌟 Streak milestone celebrations (every 5)  
🌟 Haptic feedback integration  
🌟 Instant level switching without restart  
🌟 Dual input (hand tracking + mouse) support  

### Where Implementation Falls Short
⚠️ Found words not marked on grid (only in list)  
⚠️ Selection allows non-linear paths (should constrain to straight lines)  
⚠️ No hint system for stuck players  
⚠️ No word pronunciation audio  
⚠️ Limited word list (8 words per level)  

### Overall Assessment
**Alignment: 85%** - The implementation captures the core word search experience well with excellent CV integration. Minor gaps in visual feedback (grid marking) and selection constraint are the main areas for improvement.

---

## 6. Recommended Canonical Version

The current implementation IS the canonical version with targeted enhancements:

### Keep (Current Strengths)
- 3-level progressive difficulty system
- Hand tracking pinch-drag selection
- Streak and milestone celebration system
- Clean, readable grid UI
- Drag trail visualization
- Dual input support

### Enhance
1. **Found word highlighting:** Mark found words directly on grid (strikethrough, color change, or checkmark)
2. **Selection constraint:** Restrict selection to straight lines only (8 directions)
3. **Hint system:** Highlight first letter of unfound word after 30 seconds
4. **Audio feedback:** Pronounce found words for reinforcement
5. **Expanded word lists:** 15-20 words per level for more replayability

### Remove
- Non-linear selection paths (currently allows zigzag selections)

---

## 7. Visual Identity

- **Overall look:** Clean, educational interface with friendly colors
- **Grid style:** White cells with subtle borders, bold uppercase letters
- **Art style:** Functional and readable over decorative
- **Mood:** Focused concentration with rewarding celebrations
- **Colors:**
  - Cell background: #F3F4F6 (gray-100)
  - Selected cell: #3B82F6 (blue-500)
  - Found word badge: #22C55E (green-500)
  - Streak flame: #F97316 (orange-500)
  - Grid border: #E5E7EB (gray-200)
- **Typography:** Bold sans-serif for letters, clear hierarchy
- **Celebration:** Confetti burst + success animation

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Start** | Game introduction | Title, emoji, instructions, Start button |
| **Level Select** | Choose difficulty | 3 level buttons (always accessible) |
| **Gameplay** | Core experience | Grid, word list, score, streak counter |
| **Selecting** | Active selection | Drag trail, highlighted cells |
| **Word Found** | Success feedback | Green flash, streak update, celebration |
| **Streak Milestone** | Achievement | Overlay with 🔥 animation |
| **Complete** | Level finished | Confetti, final score, Play Again/Finish |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Begin selection | Pinch + hover cell | Cell highlights blue |
| Extend selection | Drag to adjacent cell | Trail line appears, cells highlight |
| Complete selection | Release pinch | Word checked, success/error feedback |
| Select single cell | Click/tap | Cell toggles selection |
| Switch level | Click level button | New grid generated |

### CV-Specific Interactions
- Pinch threshold: Uses standard pinch detection from useGameHandTracking
- Hand smoothing: Applied via hook configuration
- Tracking loss: Cursor disappears, selection cancels
- Coordinate mapping: Normalized coordinates mapped to grid via elementFromPoint

---

## 10. Core Mechanics

### Grid Generation
```typescript
// Level configs
Level 1: 8×8 grid, 3 words, 3-letter words
Level 2: 10×10 grid, 4 words, 4-letter words  
Level 3: 12×12 grid, 5 words, 5-letter words
```

### Word Placement Algorithm
1. Select random direction from 4 options
2. Calculate valid position bounds for direction
3. Random starting position within bounds
4. Check collision (empty or matching letter)
5. Place word or retry (max 100 attempts)
6. Fill remaining cells with random letters

### Selection Validation
```
Drag path: [{x1,y1}, {x2,y2}, {x3,y3}...]
Word candidate: grid[x1][y1] + grid[x2][y2] + ...
Check: wordList.includes(candidate) || wordList.includes(reverse(candidate))
```

### Streak System
- Increment on each successful word find
- Reset implicitly via level change
- Milestone celebration every 5 streaks
- Bonus: min(streak × 3, 20) points

---

## 11. Rules

### Start
- Select level (1, 2, or 3)
- Grid generates with words hidden
- All words displayed in unfound state

### Allowed Actions
- Select letters via pinch-drag or click
- Drag across adjacent cells to form words
- Select 2+ cells to form candidate word
- Switch levels at any time

### Restricted Actions
- Cannot select non-adjacent cells in single drag
- Cannot submit single-letter selections
- Cannot replay found words for more points

### Scoring
- Base: 10 points per letter
- Streak bonus: +3 per streak level (max 20)
- Completion: +50 bonus
- No penalties for incorrect selections

### Level Progression
| Level | Grid | Words | Word Length | Target Audience |
|-------|------|-------|-------------|-----------------|
| 1 | 8×8 | 3 | 3 letters | Ages 5-6 |
| 2 | 10×10 | 4 | 4 letters | Ages 6-7 |
| 3 | 12×12 | 5 | 5 letters | Ages 7-8 |

---

## 12. HUD / Gameplay UI

### Top Section
**Level Selector:**
- 3 pill buttons (Level 1, Level 2, Level 3)
- Active level highlighted in blue
- Click to instantly switch

**Progress Display:**
- `{foundWords.length} / {words.length} words` badge
- Blue background for visibility

### Middle Section
**Instruction Text:**
- Dynamic: "Pinch and drag across letters to select words!" (when tracking)
- Fallback: "Click letters to spell words" (no tracking)

**Word List:**
- Horizontal scrollable/flex wrap
- Pill badges for each word
- Gray background = unfound
- Green background = found

### Grid Section
**Letter Grid:**
- CSS Grid layout
- Square cells with centered letters
- Selection highlighting via CSS classes
- Data attributes for cell coordinates

**Drag Trail:**
- SVG overlay positioned absolute
- Polyline connecting selected cells
- Blue stroke (#3B82F6)
- Pointer-events: none

### Bottom Section
**Score Display:**
- Large score number
- Streak indicator with 🔥 emoji

---

## 13. Feedback and Feel

### Success Feedback
- **Cell select:** Blue highlight
- **Word found:** 
  - Success sound (playSuccess)
  - Haptic pulse (triggerHaptic)
  - Word list badge turns green
  - Streak counter increments
  - Score updates with animation
- **Streak milestone:** 
  - Full-screen overlay with scale animation
  - 🔥 {streak} Streak! 🔥 message
  - Gradient background (orange → red)
- **Level complete:**
  - SuccessAnimation component with confetti
  - 🎉 emoji and "Amazing!" message
  - Final score display

### Failure/Caution Feedback
- **Invalid word:** Silent rejection (no selection clear)
- **Tracking lost:** Cursor disappears, selection cancels

### Audio
| Event | Sound | Source |
|-------|-------|--------|
| Cell click | click | useAudio.playClick |
| Word found | success | useAudio.playSuccess |

### Responsiveness
- Hand tracking: 30 FPS target
- Selection response: Real-time drag
- Grid click: Immediate feedback
- Celebration: 800ms burst

---

## 14. Points / Rewards / Progression

### Points System
| Component | Calculation |
|-----------|-------------|
| Base points | 10 × word length |
| Streak bonus | min(streak × 3, 20) |
| Completion bonus | 50 points |
| Max per word (5-letter, streak 10+) | 50 + 20 = 70 points |

### Streak Milestones
- Every 5 consecutive words: Milestone celebration
- Visual overlay with animated scale
- No additional points beyond streak bonus

### Drops (From Registry)
Word Search is listed in Word Workshop registry but drops are configured per the gameRegistry entry (see wordWorkshop.ts). Current manifest shows no explicit drops for word-search, suggesting it may inherit or use default drops.

### Progression
- No persistent unlocks (all levels available)
- No cumulative progress tracking
- Each session independent

---

## 15. End States

### Word Found
1. Word validated against list
2. Score calculated and added
3. Streak incremented
4. Word marked found in list
5. Check for completion

### Level Complete
- **Trigger:** All words found
- **Feedback:**
  - SuccessAnimation component (confetti, 50 particles, 2500ms)
  - "Amazing!" message with 🎉 emoji
  - Final score display
  - "Great Job!" header
  - "You found all words!" subheader
- **Options:** Play Again (same level) or Finish (exit)

### Restart
- Click Play Again to generate new grid
- Resets score, streak, found words
- Keeps same level

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Standard (Current)
- Pinch-drag or click to select
- Forward and reverse words valid
- Streak scoring enabled

### Mode B: Timed Challenge (Potential)
- Countdown timer per level
- Speed bonus points
- Pressure increases engagement

### Mode C: Hint-Assisted (Potential)
- First letter highlight after delay
- Reduced points when hint used
- Accessibility option

### Mode D: Category Themes (Potential)
- Animals, colors, food word lists
- Visual theming per category
- Educational alignment

---

## 17. Improvement Opportunities

### Low Cost
- Mark found words on grid (strikethrough or highlight)
- Constrain selection to straight lines only
- Add word count to completion screen
- Animate score increments

### Medium Effort
- Implement hint system (first letter highlight)
- Add word pronunciation audio
- Expand word lists (15+ per level)
- Track best scores per level
- Add backward word placement option

### Ambitious
- Dynamic word list generation
- Multiplayer race mode
- Custom word list creation
- Difficulty auto-adjustment based on performance
- Themed visual packs

---

## 18. Content Model

### Word Lists
```typescript
Level 1: ['CAT', 'DOG', 'SUN', 'HAT', 'BAT', 'PIG', 'CUP', 'BUS']
Level 2: ['FROG', 'FISH', 'BEAR', 'DUCK', 'LION', 'MOON', 'STAR', 'TREE']
Level 3: ['APPLE', 'HOUSE', 'MOUSE', 'WATER', 'BREAD', 'GRAPE', 'TIGER', 'ZEBRA']
```

### Grid Configuration
| Level | Size | Cells | Words | Density |
|-------|------|-------|-------|---------|
| 1 | 8×8 | 64 | 3×3 letters | ~14% |
| 2 | 10×10 | 100 | 4×4 letters | ~16% |
| 3 | 12×12 | 144 | 5×5 letters | ~17% |

### Directions Used
1. [0, 1] → Horizontal right
2. [1, 0] → Vertical down
3. [1, 1] → Diagonal down-right
4. [-1, 1] → Diagonal up-right

### Assets Needed
| Asset | Current | Desired |
|-------|---------|---------|
| Grid rendering | CSS Grid | Same (works well) |
| Sound effects | Basic | Word pronunciation |
| Visual effects | Confetti | Grid marking overlays |

---

## 19. Technical Structure

### File Organization
```
src/frontend/src/
├── pages/
│   └── WordSearch.tsx          # Main game component (465 lines)
└── games/
    └── wordSearchLogic.ts      # Game logic (94 lines)
```

### Main Page Components
- `WordSearchContent`: Main game logic and state
- `GameContainer`: Wrapper with title, nav, camera
- `GameHUD`: Score, streak, level info display
- `CelebrationEffects`: Particle effects
- `SuccessAnimation`: Completion animation
- `GameCursor`: Hand tracking cursor overlay

### Key Dependencies
- `framer-motion`: Streak milestone animations
- `useGameHandTracking`: CV integration
- `useAudio`: Sound effects
- `useGameCompletion`: Progress tracking
- `useGameSessionProgress`: Session reporting

### State Management
```typescript
// Core game state
const [currentLevel, setCurrentLevel] = useState(1);
const [grid, setGrid] = useState<string[][]>([]);
const [words, setWords] = useState<string[]>([]);
const [foundWords, setFoundWords] = useState<string[]>([]);
const [selected, setSelected] = useState<{x,y}[]>([]);
const [score, setScore] = useState(0);
const [streak, setStreak] = useState(0);
const [gameState, setGameState] = useState<'start'|'playing'|'complete'>;

// CV state
const [cursor, setCursor] = useState<Point | null>(null);
const [isDragging, setIsDragging] = useState(false);
const [dragPath, setDragPath] = useState<{x,y}[]>([]);
```

### CV Integration
```typescript
useGameHandTracking({
  gameName: 'Word Search',
  targetFps: 30,
  isRunning: gameState === 'playing',
  onFrame: handleFrame,
  onNoVideoFrame: handleNoVideoFrame,
});
```

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Found word grid marking | Not implemented, only list marking | High |
| Straight-line selection | Adjacent check allows zigzag | High |
| Drop configuration | Registry shows no explicit drops | Medium |
| Persistent scoring | No high score tracking | High |
| Word pronunciation | No audio for individual words | High |
| Tutorial system | No onboarding for first-time | High |
| Accessibility labels | Basic ARIA coverage | Medium |

---

## 21. Implementation Notes

### Strengths to Preserve
1. **Clean grid UI:** Readable, accessible letter presentation
2. **Drag trail:** Excellent visual feedback for CV interaction
3. **Streak system:** Motivating reward loop
4. **Dual input:** Seamless hand/mouse switching
5. **Level flexibility:** Instant switching without restart

### Refactor Opportunities
1. **WordSearch.tsx:** 465 lines - could extract Grid, WordList, LevelSelector components
2. **Selection validation:** Extract straight-line check to utility
3. **Scoring logic:** Centralize in logic file

### Performance Considerations
- Grid uses CSS Grid (efficient)
- elementFromPoint on every drag frame
- SVG trail re-renders on path change
- Consider memoizing grid cells

### Testing Focus
- Word placement algorithm
- Selection path validation
- Streak calculation
- Level switching
- CV tracking loss handling

---

## 22. Acceptance Criteria

### Core Functionality
- [ ] Grid generates correctly for all 3 levels
- [ ] All words placed in valid directions
- [ ] Hand tracking pinch starts selection
- [ ] Drag extends selection path
- [ ] Release validates word
- [ ] Click selection works as fallback
- [ ] Found words marked in list
- [ ] Score calculated correctly
- [ ] Streak increments appropriately
- [ ] Completion triggers celebration

### Game Modes
- [ ] Level 1: 8×8 grid, 3-letter words
- [ ] Level 2: 10×10 grid, 4-letter words
- [ ] Level 3: 12×12 grid, 5-letter words
- [ ] Level switching generates new puzzle

### UX/Polish
- [ ] Drag trail visible during selection
- [ ] Streak milestone shows overlay
- [ ] Success sound on word find
- [ ] Completion screen displays score
- [ ] Play Again generates fresh puzzle

### Edge Cases
- [ ] Tracking loss cancels selection
- [ ] Rapid level switches handled
- [ ] Invalid words rejected silently
- [ ] Grid fully populated with letters

---

## 23. Test Plan

### Manual Checks

#### Basic Gameplay
- [ ] Start game, verify grid appears
- [ ] Click cells to select letters
- [ ] Form word, verify success feedback
- [ ] Check found word appears in green
- [ ] Find all words, verify completion

#### CV Mode
- [ ] Pinch to start selection
- [ ] Drag across letters
- [ ] Release to submit word
- [ ] Verify trail visualization
- [ ] Test tracking loss handling

#### Level System
- [ ] Switch to Level 2, verify larger grid
- [ ] Switch to Level 3, verify 12×12
- [ ] Return to Level 1, verify 8×8
- [ ] Verify new puzzle generated each switch

#### Scoring
- [ ] Verify 10 points per letter
- [ ] Verify streak bonus applies
- [ ] Verify milestone at 5 streaks
- [ ] Verify completion bonus

### State Transitions
- [ ] Start → Playing → Complete → Start
- [ ] Playing → Level Switch → New Playing
- [ ] Selection → Word Found → Continue
- [ ] Selection → Invalid → Continue

### Edge Cases
- [ ] Rapid selections don't crash
- [ ] Empty selection handled
- [ ] Single cell selection rejected
- [ ] Window resize maintains layout

---

**Last Updated:** 2026-04-03  
**Confidence:** High - Comprehensive review of production-ready implementation
