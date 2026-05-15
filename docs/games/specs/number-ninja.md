# Number Ninja (Number Slicer)

**Game ID:** number-ninja  
**Slug:** number-ninja  
**World:** Number Jungle  
**Manifest:** `src/frontend/src/data/gameRegistries/numberJungle.ts` (to be added)  
**Code:** `src/frontend/src/pages/NumberNinja.tsx` (to be created)  
**Logic:** `src/frontend/src/games/numberNinjaLogic.ts` (to be created)  
**CV Mode:** Hand tracking (`cv: ['hand']`)

---

## Section 1: Concept Summary

| Attribute | Description |
|-----------|-------------|
| **One-line concept** | Slice through the correct answers with ninja precision while avoiding wrong numbers and bombs! |
| **Genre** | Educational / Action / Math / Reflex |
| **Target audience** | Ages 5-9, children practicing number recognition and basic math facts |
| **Core player fantasy** | "I'm a math ninja! I slice correct answers with lightning speed!" |
| **Primary skill tested** | Number recognition, addition/subtraction fluency, quick decision making, hand-eye coordination |
| **Session length** | 3-5 minutes per round (60-90 second challenges) |
| **Platform context** | Action math game for Number Jungle, inspired by Fruit Ninja Air but with educational math targets |

**Educational Foundation:** Builds math fluency through rapid-fire practice. The time pressure and physical action create an engaging "flow state" that promotes automatic recall of number facts. Similar to how Fruit Ninja Air develops spatial awareness, Number Ninja develops number sense.

---

## Section 2: Repo Status

| Aspect | Status |
|--------|--------|
| **Implementation status** | 📝 DESIGN SPEC - Not yet implemented |
| **What works now** | N/A - This is a design specification for a new game |
| **What is partial/missing** | All components need to be created |
| **Evidence** | Inspired by existing FruitNinjaAir.tsx pattern |
| **Confidence level** | Design spec - Ready for implementation |

### Files to Create

```
src/frontend/src/
├── pages/
│   └── NumberNinja.tsx              # Main game component (est. 500-600 lines)
├── games/
│   └── numberNinjaLogic.ts          # Target spawning & collision logic (est. 200-250 lines)
└── data/gameRegistries/
    └── numberJungle.ts              # Add manifest entry
```

### Reference Implementation

Base pattern from `FruitNinjaAir.tsx`:
- Canvas-based rendering for performance
- Hand tracking for slice path
- Collision detection between slice path and targets
- Physics-based target movement (gravity, bounce)

---

## Section 3: Current Implementation

**Status:** This game does not exist yet. This section describes the PROPOSED implementation based on FruitNinjaAir and MathJumpers patterns.

### Proposed Flow

1. **Start Screen:** Ninja theme, difficulty select, instructions
2. **Challenge Setup:** Math problem appears at top (e.g., "What is 3 + 4?")
3. **Target Spawn:** Numbers (and bombs!) fly up from bottom
4. **Slicing Phase:** Player waves hand to slice through correct answers
5. **Scoring:** Correct numbers give points, bombs end the round
6. **Combo System:** Multiple correct slices in succession build combo
7. **Round Complete:** Stats shown, next challenge or game complete

### Proposed Controls

| Input | Action | CV Mode | Mouse Fallback |
|-------|--------|---------|----------------|
| Move cursor | Index finger position | ✅ Hand tracking | ✅ Mouse move |
| Slice | Wave hand through targets | ✅ Path-based slicing | ✅ Click and drag |
| Rapid slice | Quick hand movements | ✅ Continuous path tracking | ✅ Rapid mouse movement |

### Proposed Mechanics

**Slice Detection:**
- Hand position tracked over time (last 10 positions = slice path)
- Line segment collision detection between slice path and circular targets
- Minimum slice velocity required (prevents accidental cuts)
- Slice path visually rendered (ninja blade trail)

**Target Types:**

| Type | Appearance | Behavior | Points |
|------|------------|----------|--------|
| Correct Answer | Green circle with number | Floats up, gravity pulls down | +10 |
| Wrong Answer | Red circle with number | Floats up, faster movement | -5 if sliced |
| Bomb | Black circle with skull | Floats up, pulsates | Game Over if sliced |
| Bonus Star | Gold star | Rare, fast movement | +50 |
| Freeze Time | Blue snowflake | Slows all targets for 5s | Special effect |

**Physics System:**
- Targets spawn at bottom with upward velocity
- Gravity accelerates targets downward
- Targets rotate while in air
- Sliced targets split with particle explosion

### Proposed Visuals/UI

- **Background:** Japanese-inspired dojo with bamboo elements
- **Targets:** Circular with numbers, distinct colors per type
- **Slice trail:** Glowing blade effect that fades over time
- **Problem display:** Large banner at top showing current math challenge
- **Score/combo:** Floating indicators near top
- **Lives:** Ninja shuriken icons

### Gaps/Issues (Design Level)

1. **Difficulty balancing:** Ensuring targets are hittable but challenging
2. **Bomb placement:** Fair warning without being too easy to avoid
3. **Math problem variety:** Keeping problems age-appropriate per difficulty
4. **Slice detection accuracy:** Balancing precision vs forgiveness
5. **Performance:** Many moving objects + collision detection

---

## Section 4: Intended Design

### Educational Goal

Build rapid math fact fluency through engaging, action-based practice. Children will:
- Instantly recognize correct answers to math problems
- Develop automatic recall of addition/subtraction facts
- Practice number recognition under time pressure
- Build confidence through repetition and positive reinforcement

### Pedagogical Approach

1. **Drill with Purpose:** Repetition in engaging context (vs. worksheets)
2. **Immediate Feedback:** Instant visual/audio confirmation of correct/incorrect
3. **Progressive Difficulty:** Start simple, add complexity gradually
4. **Error-Friendly:** Wrong answers only reduce score, don't end game (bombs do)
5. **Multisensory:** Visual (numbers), auditory (sounds), kinesthetic (slicing)

### Difficulty Progression

| Level | Problem Type | Number Range | Target Speed | Special Features |
|-------|--------------|--------------|--------------|------------------|
| 1 | Number recognition | 1-10 | Slow | No bombs, only correct/wrong |
| 2 | Addition (sums 2-10) | 1-10 | Medium | Bombs introduced |
| 3 | Addition (sums up to 20) | 1-20 | Fast | More bombs, faster spawn |
| 4 | Subtraction (within 10) | 1-10 | Medium | Mixed with addition |
| 5 | Mixed +/- (within 20) | 1-20 | Fast | All features, high intensity |

### Accessibility

- **Large targets:** Minimum 60px diameter for easy slicing
- **Visual contrast:** High contrast numbers on colored backgrounds
- **Audio cues:** Distinct sounds for correct/wrong/bomb
- **Multiple correct answers:** Sometimes multiple right answers fly up
- **No time limit per problem:** Round timer only, self-paced within round

### Engagement

- **Ninja theme:** "Become the Number Ninja!"
- **Combo system:** Slicing multiple correct answers builds combo multiplier
- **Power-ups:** Freeze time, double points, screen clear
- **Visual spectacle:** Particle explosions, screen shake on bomb
- **Progress tracking:** Unlock new ninja ranks/belts

### Core Loop

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ See Math    │ → │ Targets fly  │ → │ Slice       │
│ Problem     │    │ up           │    │ Correct     │
│ (3 + 4 = ?) │    │ (7, 5, bomb) │    │ Numbers     │
└─────────────┘    └──────────────┘    └─────────────┘
       ↑                                      │
       └────── New Problem / Next Round ←─────┘
```

**Loop duration:** 60-90 seconds per round
**Engagement hook:** Combo building, avoiding bombs, beating high score

---

## Section 5: Drift Analysis

**Note:** Since this is a design spec for a new game, drift analysis compares DESIGN INTENT vs PLATFORM PATTERNS.

### Where Design Matches Platform Patterns

✅ **Canvas-based rendering** - Follows FruitNinjaAir pattern  
✅ **Hand tracking integration** - Standard `useGameHandTracking`  
✅ **Collision detection** - Similar to FruitNinjaAir slicing  
✅ **Combo/scoring system** - Uses `useStreakTracking` pattern  
✅ **GameShell wrapper** - Standard container  
✅ **Audio feedback** - `useAudio` integration  
✅ **Completion tracking** - `useGameCompletion` hook  

### Where Design Extends Platform Patterns

🌟 **Math problem integration** - Educational content + action gameplay  
🌟 **Multiple target types** - Correct, wrong, bomb, power-up  
🌟 **Penalty system** - Wrong answers and bombs have consequences  
🌟 **Round-based structure** - Timed rounds vs. completion-based  
🌟 **Progressive unlocks** - Ninja ranks/belts as motivation  

### Where Design Requires New Patterns

⚠️ **Math problem generation** - Need dynamic problem generator  
⚠️ **Multiple collision types** - Different outcomes per target type  
⚠️ **Round timer system** - Countdown vs. count-up  
⚠️ **Power-up system** - Temporary effects on game state  

### Alignment Assessment

**Platform Alignment: 80%** - Core action mechanics follow existing patterns, but educational math integration and penalty systems require new development.

---

## Section 6: Recommended Canonical Version

### Current Design Strengths to Keep

1. **Fast-paced action** - Keeps children engaged
2. **Clear visual feedback** - Immediate success/failure indication
3. **Combo system** - Rewards skill and speed
4. **Progressive difficulty** - Grows with child's ability
5. **Bomb penalty** - Adds tension without being too punitive

### Enhancements to Implement

1. **Ninja rank system** - Belts/ranks based on cumulative score
2. **Daily challenges** - Special math facts of the day
3. **Practice mode** - Focus on specific number families (all +7s)
4. **Two-player mode** - Head-to-head on split screen
5. **Custom problem sets** - Parent/teacher can specify facts to practice

### Experimental Features

1. **Voice answers** - Say the answer instead of slicing (accessibility)
2. **Gesture combos** - Specific patterns for special moves
3. **Boss battles** - Giant numbers requiring multiple slices
4. **Seasonal themes** - Halloween pumpkins, winter snowballs, etc.
5. **AR mode** - Targets appear in real room via camera

---

## Section 7: Visual Identity

### Overall Look

A dynamic Japanese dojo meets jungle temple. Bamboo accents, floating lanterns, and mystical jungle vines create a unique "Number Ninja" atmosphere that bridges the ninja theme with the Number Jungle world.

### Camera View

Full-screen canvas game area. Camera thumbnail in corner (standard). Math problem banner at top, HUD elements at edges.

### Art Style

- **2D canvas rendering** - Performance for many moving objects
- **Bold, clear numbers** - Sans-serif, highly readable
- **Particle effects** - Explosions, sparks, smoke
- **Anime-inspired** - Dynamic motion lines, impact frames

### Mood

Energetic, focused, exciting. The urgency of a ninja mission combined with the satisfaction of correct answers.

### Colors

| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark dojo brown | `#3E2723` |
| Correct target | Bright green | `#22C55E` |
| Wrong target | Warning red | `#EF4444` |
| Bomb | Dark gray/black | `#1F2937` / `#000000` |
| Bonus star | Gold | `#FCD34D` |
| Freeze power-up | Ice blue | `#60A5FA` |
| Slice trail | Cyan glow | `#22D3EE` |
| Problem banner | Cream paper | `#FEF3C7` |
| Score | Bright white | `#FFFFFF` |

### Environment

- Tatami mat floor pattern at bottom
- Bamboo poles on sides
- Hanging lanterns (animated swaying)
- Jungle vines creeping in from edges
- Rising sun motif in background

### UI Style

- Bold, angular buttons (ninja aesthetic)
- Japanese-inspired decorative elements
- Sharp contrast for readability
- Dynamic motion on all interactions

### Active Vibe

Highly active and intense. Constant movement, quick decisions, and explosive feedback. The child is always in motion, always reacting.

---

## Section 8: Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Start** | Game intro, difficulty select | Title, ninja character, level buttons, instructions |
| **Pre-Round** | Show math problem, get ready | Problem display, countdown, tip |
| **Gameplay** | Main action - slice targets | Canvas, problem banner, HUD, slice trail |
| **Combo Display** | Celebrate combo milestones | Floating text, effects |
| **Power-up** | Activate special effects | Screen overlay, timer |
| **Round Complete** | Show round stats | Score, accuracy, rank progress |
| **Game Complete** | Final results | Total score, new rank, rewards |
| **Game Over** | Bomb sliced or time out | Explosion effect, try again option |

---

## Section 9: Controls

| Action | Input | CV Mode | Mouse Fallback | Feedback |
|--------|-------|---------|----------------|----------|
| Move cursor | Index finger position | ✅ Hand tracking | ✅ Mouse move | Cursor follows hand |
| Slice targets | Wave hand through target | ✅ Path-based collision | ✅ Drag through | Target splits, particles |
| Rapid slicing | Continuous hand movement | ✅ Continuous tracking | ✅ Rapid dragging | Multiple splits |
| Pause | Pinch gesture | ✅ Pinch detection | ✅ Click pause button | Pause menu appears |

### CV-Specific Interactions

```typescript
// Slice path tracking
const SLICE_PATH_LENGTH = 10;
const slicePathRef = useRef<Point[]>([]);

function updateSlicePath(cursor: Point) {
  slicePathRef.current.push(cursor);
  if (slicePathRef.current.length > SLICE_PATH_LENGTH) {
    slicePathRef.current.shift();
  }
}

// Collision detection
function checkSliceCollision(
  target: Target,
  slicePath: Point[]
): boolean {
  for (let i = 0; i < slicePath.length - 1; i++) {
    const p1 = slicePath[i];
    const p2 = slicePath[i + 1];
    if (lineIntersectsCircle(p1, p2, target.position, target.radius)) {
      return true;
    }
  }
  return false;
}
```

---

## Section 10: Core Mechanics

### Target Spawning System

```typescript
interface Target {
  id: number;
  x: number;           // Position (0-1 normalized)
  y: number;
  vx: number;          // Velocity X
  vy: number;          // Velocity Y (negative = up)
  value: number;       // Number displayed
  type: 'correct' | 'wrong' | 'bomb' | 'bonus' | 'freeze';
  radius: number;
  rotation: number;
  isSliced: boolean;
}

// Spawn configuration per difficulty
const SPAWN_CONFIG = {
  easy: { interval: 1500, speed: 0.3, bombChance: 0 },
  medium: { interval: 1200, speed: 0.4, bombChance: 0.1 },
  hard: { interval: 900, speed: 0.5, bombChance: 0.15 },
  expert: { interval: 700, speed: 0.6, bombChance: 0.2 },
};
```

### Math Problem Generator

```typescript
interface MathProblem {
  text: string;        // "3 + 4 = ?"
  answer: number;      // 7
  wrongAnswers: number[]; // [5, 6, 8, 9]
}

function generateProblem(difficulty: number, type: 'add' | 'subtract' | 'mixed'): MathProblem {
  const max = difficulty <= 2 ? 10 : 20;
  const a = randomInt(1, max);
  const b = randomInt(1, max);
  
  if (type === 'subtract') {
    // Ensure positive result
    const [larger, smaller] = a > b ? [a, b] : [b, a];
    return {
      text: `${larger} - ${smaller} = ?`,
      answer: larger - smaller,
      wrongAnswers: generateWrongAnswers(larger - smaller, max),
    };
  }
  
  return {
    text: `${a} + ${b} = ?`,
    answer: a + b,
    wrongAnswers: generateWrongAnswers(a + b, max),
  };
}
```

### Scoring System

| Action | Base Points | Combo Multiplier |
|--------|-------------|------------------|
| Correct answer sliced | +10 | ×(1 + combo/10) |
| Wrong answer sliced | -5 | - |
| Bomb sliced | Game Over | - |
| Bonus star sliced | +50 | ×2 |
| Freeze power-up | +0 (effect only) | - |

**Combo System:**
- Combo increases for each consecutive correct slice
- Resets to 0 if wrong answer sliced or 3 seconds pass
- Visual indicator shows current combo
- Milestones at 5, 10, 15, 20+ with special effects

### Physics Parameters

```typescript
const PHYSICS = {
  gravity: 0.5,           // Acceleration downward
  spawnVelocityY: -0.4,   // Initial upward velocity
  spawnVelocityX: 0.1,    // Horizontal spread
  maxRotationSpeed: 0.1,  // Rotation per frame
  sliceThreshold: 0.3,    // Minimum slice velocity
};
```

---

## Section 11: Rules

### Start Conditions

- Select difficulty level (1-5)
- 60-second round timer
- 3 lives (shuriken icons)
- Score starts at 0, combo at 0

### Objectives

- Slice all correct answers to the displayed math problem
- Avoid slicing wrong answers (point penalty)
- Avoid bombs at all costs (instant game over)
- Build highest combo possible
- Score as many points as possible before time runs out

### Allowed Actions

- Slice through correct number targets
- Slice bonus stars for extra points
- Slice freeze power-ups to slow time
- Let wrong answers fall off screen (no penalty)
- Let bombs fall off screen (safest option!)

### Restrictions

- Cannot slice bomb (game over)
- Wrong answer slices deduct points and reset combo
- Minimum slice velocity required (prevents accidental cuts)
- Cannot pause during slice (safety feature)

### Scoring

| Action | Points | Effect |
|--------|--------|--------|
| Correct target sliced | 10×multiplier | Combo +1, particles |
| Wrong target sliced | -5 | Combo reset, red flash |
| Bomb sliced | Game Over | Explosion, game ends |
| Bonus star sliced | 50×2 | Special celebration |
| Freeze power-up | 0 | 5s slow motion |
| Combo milestone | +bonus | 5=+25, 10=+50, 15=+100, 20+=+200 |

### Win/Lose Conditions

| Condition | Trigger | Result |
|-----------|---------|--------|
| Round Complete | Time reaches 0 | Stats screen, score calculated |
| Game Over | Bomb sliced | Explosion, option to retry |
| High Score | Beat previous best | Celebration, record saved |

---

## Section 12: HUD / Gameplay UI

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [← Home]  NUMBER NINJA     ⏱️ 45s    Score: 1,240   🔥 8   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌─────────────────────────┐                    │
│              │    What is 7 + 5?       │                    │  ← Problem Banner
│              └─────────────────────────┘                    │
│                                                             │
│                    🍃  🎋                                     │
│                                                             │
│        💣  12      ✨  12      ✓  12      ✗  15             │  ← Flying targets
│                                                             │
│                                                             │
│         ═══════════════════════════════════                 │  ← Slice trail
│                                                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⚔️ ⚔️ ⚔️     🔥 COMBO x8! 🔥                        │   │  ← Lives & Combo
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### HUD Elements

| Element | Position | Purpose | Update |
|---------|----------|---------|--------|
| Home button | Top-left | Exit to menu | Static |
| Title | Top-center | Game identification | Static |
| Timer | Top-center-right | Countdown (60s) | Every second |
| Score | Top-right | Points earned | Real-time |
| Combo | Top-right | Current streak | Real-time |
| Problem banner | Center-top | Current math problem | Per problem |
| Game canvas | Center | Main gameplay area | 60fps |
| Lives | Bottom-center | Shuriken icons | On bomb hit |
| Combo celebration | Center | Milestone feedback | At milestones |

---

## Section 13: Feedback and Feel

### Success Feedback (Correct Slice)

- **Audio:** `playPop()` + rising pitch based on combo
- **Haptic:** Short success pulse
- **Visual:** 
  - Target splits in half
  - Particle burst (green sparkles)
  - Score popup: "+10" floats up
  - Combo counter increments
- **Screen:** Brief flash at combo milestones

### Combo Feedback

| Combo | Feedback |
|-------|----------|
| 5 | "Nice!" + small burst |
| 10 | "Great!" + medium burst + screen flash |
| 15 | "Amazing!" + large burst + shake |
| 20 | "UNSTOPPABLE!" + massive effect + time slow |
| 25+ | "LEGENDARY!" + screen-wide celebration |

### Wrong Answer Feedback

- **Audio:** Error sound (not too harsh)
- **Haptic:** Double pulse
- **Visual:** 
  - Target turns gray
  - Red X appears
  - Score popup: "-5" in red
  - Combo resets to 0 with fade
- **Screen:** Red flash overlay (subtle)

### Bomb Feedback

- **Audio:** Explosion sound
- **Haptic:** Heavy vibration
- **Visual:**
  - Massive explosion particle effect
  - Screen shake
  - Slow-motion effect
  - "GAME OVER" dramatic text
- **Screen:** Blackout transition to results

### Power-up Feedback

**Freeze Time:**
- Blue wave expands from power-up
- All targets turn blue-tinted
- Movement slows to 25% speed
- Timer countdown pauses
- 5-second duration with visual indicator

### During Gameplay

- Slice trail glows brighter with higher combo
- Background subtly pulses with music
- Targets leave faint motion trails
- Ambient dojo sounds (wind chimes)

---

## Section 14: Points / Rewards / Progression

### Points Breakdown

| Source | Base | Combo Multiplier | Max |
|--------|------|------------------|-----|
| Correct target | 10 | ×(1 + combo/10) | 30 (at combo 20) |
| Bonus star | 50 | ×2 | 100 |
| Combo milestone | Bonus | - | 200 |

**Example Scoring:**
- Combo 5, correct slice: 10 × 1.5 = 15 points
- Combo 10, correct slice: 10 × 2 = 20 points + 50 bonus
- Combo 20, bonus star: 50 × 2 × 2 = 200 points + 200 bonus

### Final Score Calculation

```
baseScore = sum of all target points
accuracyBonus = (correctSlices / totalSlices) × 100
comboBonus = maxCombo × 5
survivalBonus = livesRemaining × 50

finalScore = baseScore + accuracyBonus + comboBonus + survivalBonus
```

### Ninja Rank System

| Rank | Title | Score Required | Visual |
|------|-------|----------------|--------|
| White | Beginner | 0-500 | White belt icon |
| Yellow | Student | 500-1000 | Yellow belt icon |
| Orange | Practitioner | 1000-2000 | Orange belt icon |
| Green | Skilled | 2000-3500 | Green belt icon |
| Blue | Expert | 3500-5500 | Blue belt icon |
| Purple | Master | 5500-8000 | Purple belt icon |
| Brown | Sensei | 8000-11000 | Brown belt icon |
| Black | Grandmaster | 11000+ | Black belt icon |

### Drops (From Registry)

```typescript
drops: [
  { itemId: 'star-ninja', chance: 0.2 },
  { itemId: 'shuriken-silver', chance: 0.15 },
  { itemId: 'belt-yellow', chance: 0.1, minScore: 500 },
  { itemId: 'belt-black', chance: 0.02, minScore: 5000 },
]
```

### Easter Eggs

```typescript
easterEggs: [
  {
    id: 'egg-first-slice',
    name: 'First Cut!',
    description: 'Slice your first correct answer',
    trigger: 'first-correct-slice',
    reward: { itemId: 'star-ninja', quantity: 1 },
    hint: 'Wave your hand to slice!',
    difficulty: 'easy',
  },
  {
    id: 'egg-bomb-dodger',
    name: 'Bomb Dodger',
    description: 'Complete a hard round without hitting a bomb',
    trigger: 'perfect-hard-round',
    reward: { itemId: 'shuriken-gold', quantity: 1 },
    hint: 'Let those bombs fall!',
    difficulty: 'medium',
  },
  {
    id: 'egg-grandmaster',
    name: 'Number Grandmaster',
    description: 'Achieve a 25+ combo',
    trigger: 'combo-25',
    reward: { itemId: 'belt-black', quantity: 1 },
    hint: 'Slice fast and accurate!',
    difficulty: 'hard',
  },
]
```

---

## Section 15: End States

### Round Complete (Time Expired)

- Trigger: Timer reaches 0
- Display: Results modal with stats
- Content:
  - Final score
  - Accuracy percentage
  - Max combo achieved
  - Rank progress
  - New rank unlock (if applicable)
- Audio: Celebration sound
- Options: Play again, next difficulty, exit

### Game Over (Bomb Sliced)

- Trigger: Player slices a bomb
- Display: Dramatic explosion sequence
- Content:
  - "KA-BOOM!" animation
  - Score up to that point
  - Encouraging message
  - Try again button
- Audio: Explosion sound
- Options: Retry same level, exit

### High Score Achievement

- Trigger: Final score exceeds previous best
- Display: Special celebration
- Content:
  - "NEW HIGH SCORE!" banner
  - Old vs new score comparison
  - Rank promotion (if applicable)
  - Special reward
- Audio: Extended celebration
- Save: Score recorded to leaderboard

### Early Exit

- Trigger: Player clicks home
- Display: Confirm dialog
- Save: Current progress lost (this is an arcade-style game)
- Options: "Keep Playing" / "Exit"

---

## Section 16: Parallel Modes / Alternate Implementations

### Mode A: Classic Ninja (Default)

- 60-second rounds
- Problems change every 10-15 seconds
- All target types active
- Best for: Standard play, skill building

### Mode B: Zen Mode (Relaxation)

- No timer
- No bombs
- Focus on accuracy over speed
- Meditative background music
- Best for: Stress-free practice, younger children

### Mode C: Survival Mode (Challenge)

- Single life (bomb = game over)
- Time extends slightly per correct slice
- Increasing speed over time
- Best for: Expert players, high score chasing

### Mode D: Practice Mode (Learning)

- Choose specific math fact family (+7s, -5s, etc.)
- Slower target speed
- Hints available
- No penalties
- Best for: Targeted practice, homework help

### Mode E: Blitz Mode (Speed)

- 30-second rounds
- Rapid-fire problems
- Double points
- Fastest pace
- Best for: Advanced players, fluency building

---

## Section 17: Improvement Opportunities

### Low Cost (Can add post-launch)

1. **Additional target types** - Confusion (swaps correct/wrong), multiplier
2. **New backgrounds** - Seasonal themes, different dojo styles
3. **Sound variations** - Different slice sounds per combo level
4. **Particle polish** - More elaborate explosion effects
5. **Daily challenges** - Special math fact focus each day

### Medium Effort (Nice to have)

6. **Multiplication/division** - Advanced difficulty levels
7. **Two-player mode** - Split screen competition
8. **Custom problem sets** - Parent/teacher configuration
9. **Achievement system** - Extended goals beyond ranks
10. **Replay viewing** - Watch best rounds

### Ambitious (Future versions)

11. **Boss battles** - Giant number bosses with health bars
12. **Story mode** - Ninja adventure with math challenges
13. **AR integration** - Slice targets in real world
14. **AI difficulty** - Adapts to player skill in real-time
15. **Global leaderboards** - Compete worldwide

---

## Section 18: Content Model

### Problem Database Schema

```typescript
interface MathProblem {
  id: string;
  type: 'add' | 'subtract' | 'multiply' | 'recognize';
  text: string;
  answer: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

interface ProblemSet {
  difficulty: number;
  problems: MathProblem[];
  targetCount: number;
  bombChance: number;
  spawnRate: number;
}

// Number recognition for level 1
const RECOGNITION_PROBLEMS: MathProblem[] = [
  { id: 'r1', type: 'recognize', text: 'Find the number 7', answer: 7, difficulty: 1 },
  // ... 20 problems
];

// Addition problems
const ADDITION_PROBLEMS: MathProblem[] = [
  { id: 'a1', type: 'add', text: '3 + 4 = ?', answer: 7, difficulty: 1 },
  // ... 50 problems per difficulty
];
```

### Target Value Generation

```typescript
function generateTargetValues(
  correctAnswer: number,
  count: number,
  maxValue: number
): number[] {
  const values: number[] = [correctAnswer];
  
  // Add wrong answers (close to correct)
  while (values.length < count) {
    const offset = randomInt(-3, 3);
    const wrong = correctAnswer + offset;
    if (wrong > 0 && wrong <= maxValue && !values.includes(wrong)) {
      values.push(wrong);
    }
  }
  
  return shuffle(values);
}
```

### Content Scaling

| Level | Problem Pool Size | Unique Problems Per Round | Target Spawn Rate |
|-------|-------------------|---------------------------|-------------------|
| 1 | 20 | 10 | 1.5s |
| 2 | 40 | 15 | 1.2s |
| 3 | 60 | 20 | 1.0s |
| 4 | 80 | 25 | 0.8s |
| 5 | 100 | 30 | 0.7s |

---

## Section 19: Technical Structure

### File Organization

```
src/frontend/src/
├── pages/
│   └── NumberNinja.tsx               # Main game component (~550 lines)
├── games/
│   └── numberNinjaLogic.ts           # Logic & physics (~220 lines)
├── components/game/
│   ├── NinjaTarget.tsx               # Individual target component
│   ├── SliceTrail.tsx                # Slice path renderer
│   ├── ParticleSystem.tsx            # Explosion effects
│   └── ProblemBanner.tsx             # Math problem display
└── data/gameRegistries/
    └── numberJungle.ts               # Add manifest entry
```

### Key Components

**NumberNinja.tsx:**
- State: `gameState`, `targets`, `score`, `combo`, `problem`, `timeLeft`
- Canvas: `useRef<HTMLCanvasElement>` for rendering
- Hand tracking: `useGameHandTracking` with path tracking
- Game loop: `requestAnimationFrame` for physics + render
- Audio: `useAudio` for slice/pop/explosion sounds
- Completion: `useGameCompletion`

**numberNinjaLogic.ts:**
- Problem generation: `generateProblem()`, `generateTargetValues()`
- Physics: `updateTargets()`, `applyGravity()`, `checkBounds()`
- Collision: `checkSliceCollision()`, `lineIntersectsCircle()`
- Scoring: `calculatePoints()`, `calculateFinalScore()`

### Hooks Used

| Hook | Purpose |
|------|---------|
| `useGameHandTracking` | Hand position for slice path |
| `useGameCompletion` | Game completion tracking |
| `useAudio` | Sound effects |
| `useStreakTracking` | Combo management |
| `useRef` | Canvas, game loop, slice path |
| `useState` | Game state |

### Dependencies

```json
{
  "framer-motion": "^11.x",
  "react": "^18.x",
  "react-webcam": "^7.x"
}
```

### Performance Considerations

- Canvas rendering at 60fps
- Object pooling for targets and particles
- Spatial partitioning for collision detection (if many targets)
- Throttled slice path updates (every 2-3 frames)
- Efficient array operations (avoid allocations in loop)

---

## Section 20: Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Collision performance | May need optimization for 20+ targets | Medium |
| Gesture sensitivity | Requires tuning for child hand sizes | High |
| Problem difficulty | Need age-appropriate verification | Medium |
| Bomb frequency | Balance challenge vs frustration | High |
| Canvas vs DOM | Canvas preferred for performance | High |
| Particle count | Limit to maintain 60fps | Medium |

---

## Section 21: Implementation Notes

### Architecture Patterns

1. **GameShell wrapper** - Standard error boundary
2. **Canvas-based rendering** - Performance for many objects
3. **Game loop pattern** - rAF with delta time
4. **Object pooling** - Reuse target/particle objects
5. **Collision detection** - Line-circle intersection

### Strengths to Preserve

- Fast-paced, engaging action
- Immediate feedback
- Clear educational goal
- Progressive difficulty
- Combo reward system

### Testing Considerations

- Slice detection accuracy
- Collision detection performance
- Math problem appropriateness
- Bomb visibility/clarity
- Accessibility alternatives
- Frame rate on various devices

### Performance Notes

- Use `requestAnimationFrame` with delta time
- Pool target objects: `createTargetPool(50)`
- Limit active particles to 100
- Use `transform` instead of `left/top` for any DOM elements
- Throttle collision checks (not every frame)
- Consider offscreen canvas for double buffering

---

## Section 22: Acceptance Criteria

### Core Functionality

- [ ] Start screen with difficulty selection
- [ ] Math problem displays clearly at top
- [ ] Targets spawn and move with physics
- [ ] Correct targets give points
- [ ] Wrong targets deduct points
- [ ] Bombs end the game
- [ ] Combo system works and rewards
- [ ] 60-second timer counts down
- [ ] Results screen shows stats
- [ ] Can replay or exit

### CV/Hand Tracking

- [ ] Cursor follows index finger
- [ ] Slice path tracks hand movement
- [ ] Collision detection works accurately
- [ ] Slice trail renders visibly
- [ ] Minimum velocity prevents accidental slices
- [ ] Camera thumbnail visible

### Content

- [ ] 5 difficulty levels
- [ ] 100+ unique math problems
- [ ] All basic math operations covered
- [ ] Age-appropriate number ranges
- [ ] Clear problem display

### Edge Cases

- [ ] Handles rapid successive slices
- [ ] Multiple targets sliced in one motion
- [ ] Graceful handling of hand loss
- [ ] Pause functionality works
- [ ] Early exit with confirmation

### Accessibility

- [ ] Visual indicators for target types
- [ ] Audio cues for each target type
- [ ] Alternative mouse controls
- [ ] High contrast UI
- [ ] No penalty for slow play (in Zen mode)

---

## Section 23: Test Plan

### Manual Gameplay Tests

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Basic slice | Slice correct target | Target splits, points added |
| Combo build | Slice 5 correct in a row | Combo counter shows 5, bonus awarded |
| Wrong penalty | Slice wrong target | -5 points, combo resets |
| Bomb game over | Slice bomb | Explosion, game ends |
| Time expiration | Wait for timer | Round ends, stats shown |

### CV Control Tests

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Cursor tracking | Move hand | Cursor follows smoothly |
| Slice detection | Swipe through target | Target splits |
| Path rendering | Move hand quickly | Slice trail visible |
| Multi-target slice | Slice through multiple | All targets in path split |
| Hand loss | Hide hand | Game pauses or continues gracefully |

### Fallback Tests

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Mouse slice | Drag mouse through target | Target splits |
| Click pause | Click pause button | Game pauses |
| Touch input | Use touch screen | Slicing works |

### Edge Cases

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Rapid spawn | Play on hardest difficulty | Frame rate stays acceptable |
| Many particles | Build high combo | No visual lag |
| Early exit | Click home during round | Confirmation dialog appears |
| Pause during slice | Pause while slicing | Slice ends, then pauses |

### Performance Tests

| Test | Metric | Target |
|------|--------|--------|
| Frame rate | FPS during gameplay | 60fps |
| Memory usage | Heap size during round | <150MB |
| Load time | Initial game load | <3 seconds |
| Collision accuracy | False positives | <5% |

---

**Last Updated:** 2026-04-03  
**Confidence:** High - Comprehensive design specification ready for implementation  
**Estimated Implementation Time:** 3-4 days  
**Inspired By:** FruitNinjaAir.tsx pattern
