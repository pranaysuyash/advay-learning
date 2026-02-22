# Game Research Master Document

**Project:** Advay Vision Learning  
**Date:** 2026-02-22  
**Status:** Living Document - Research & Implementation Tracker  

---

## Executive Summary

This document consolidates research on ALL planned, designed, and conceptualized games across the platform. It serves as the foundation for systematic implementation with evidence-based decisions.

### Current State

| Metric | Value |
|--------|-------|
| **Implemented Games** | 21 (19 gallery + 2 unlisted) |
| **P0 Priority Games** | 5 (ready for immediate implementation) |
| **P1 Priority Games** | 19 (detailed designs, near-term) |
| **P2-P3 Explored Games** | ~63 (concept designs) |
| **Frontier/Moonshot Ideas** | ~43 (future exploration) |
| **Total Universe** | **270+ unique concepts** |

### Critical Gaps Identified

1. **Logic/Reasoning** - 0 games (CRITICAL) ❗
2. **Math Operations** - Only counting exists ❗
3. **Time/Calendar** - 0 games ❗
4. **Storytelling/Narrative** - 0 games ❗
5. **Geography/World Knowledge** - 0 games ❗

---

## Part 1: Implemented Games Analysis

### 1.1 Complete Inventory

#### Gallery Games (19)

| # | Game | Category | CV Tech | Input Method | Complexity | Code Quality |
|---|------|----------|---------|--------------|------------|--------------|
| 1 | Alphabet Tracing | Literacy | Hand | Trace | High | ✅ Modern hooks |
| 2 | Finger Number Show | Numeracy | Hand | Finger count | Medium | ✅ Modern hooks |
| 3 | Connect The Dots | Motor/Numbers | Hand+Mouse | Pinch/Click | Medium | ✅ Modern hooks |
| 4 | Letter Hunt | Literacy | Hand | Pinch select | Medium | ✅ Modern hooks |
| 5 | Music Pinch Beat | Music/Rhythm | Hand | Pinch | Medium | ✅ Modern hooks |
| 6 | Steady Hand Lab | Motor Skills | Hand | Hold still | Medium | ✅ Modern hooks |
| 7 | Shape Pop | Shapes | Hand | Pinch | Low | ✅ Modern hooks |
| 8 | Color Match Garden | Colors | Hand | Pinch | Low | ✅ Modern hooks |
| 9 | Number Tap Trail | Numeracy | Hand | Pinch sequence | Medium | ✅ Modern hooks |
| 10 | Shape Sequence | Memory | Hand | Pinch sequence | Medium | ✅ Modern hooks |
| 11 | Yoga Animals | Movement | Pose | Match pose | High | ✅ Pose tracking |
| 12 | Freeze Dance | Movement | Pose+Hand | Dance/Freeze | High | ✅ Multi-modal |
| 13 | Simon Says | Movement | Pose | Match pose | Medium | ✅ Pose tracking |
| 14 | Virtual Chemistry Lab | Science | Hand | Pinch/pour | High | ✅ Modern hooks |
| 15 | Word Builder | Literacy | Hand | Pinch letters | Medium | ✅ Modern hooks |
| 16 | Emoji Emotion Match | Social-Emotional | Hand | Pinch select | Low | ✅ Modern hooks |
| 17 | Air Canvas | Creativity | Hand | Draw | Medium | ✅ Modern hooks |
| 18 | Mirror Draw | Creativity/Motor | Hand | Trace symmetric | High | ✅ Modern hooks |
| 19 | Phonics Sounds | Literacy | Hand+Audio | Trace + sound | Medium | ✅ Modern hooks |

#### Unlisted Games (2)

| # | Game | Category | Status | Notes |
|---|------|----------|--------|-------|
| 20 | Bubble Pop Symphony | Music | ✅ Complete | Has route, not in gallery |
| 21 | Dress For Weather | Life Skills | ✅ Complete | Has route, not in gallery |

### 1.2 Technical Architecture Analysis

#### Shared Infrastructure

```
Hooks (Core):
├── useHandTracking.ts          - MediaPipe initialization
├── useHandTrackingRuntime.ts   - Detection loop
├── usePoseTracking.ts          - Body tracking
├── useSoundEffects.ts          - Audio feedback
└── useGameState.ts             - State management

Components (Reusable):
├── GameContainer.tsx           - Standard layout
├── GameControls.tsx            - Control buttons
├── CelebrationOverlay.tsx      - Success animation
├── Mascot.tsx                  - Pip character
└── Webcam.tsx                  - Camera feed

Game Logic Modules:
├── fingerCounting.ts           - Finger detection
├── musicPinchLogic.ts          - Music lane logic
├── steadyHandLogic.ts          - Hold progress
├── targetPracticeLogic.ts      - Hit detection
├── hitTarget.ts                - Generic targeting
├── wordBuilderLogic.ts         - Word spelling
├── emojiMatchLogic.ts          - Emotion matching
├── airCanvasLogic.ts           - Drawing strokes
├── mirrorDrawLogic.ts          - Symmetry drawing
└── phonicsSoundsLogic.ts       - Phonics rounds
```

#### Code Quality Assessment

| Aspect | Status | Evidence |
|--------|--------|----------|
| Hook Pattern | ✅ Unified | All games use useHandTracking |
| Type Safety | ✅ Strong | TypeScript throughout |
| Test Coverage | 🟡 Partial | Unit tests for logic modules |
| Documentation | ✅ Good | GAMES.md catalog complete |
| Accessibility | 🟡 Basic | ARIA labels present |

---

## Part 2: P0 Priority Games - Deep Research

### 2.1 Shape Safari

**Source:** GAME_ROADMAP.md  
**Effort:** 1 week  
**Age:** 3-5 years  
**Category:** Shapes + Motor Skills  
**Fills Gap:** Shapes (only 1 game currently)

#### Research Findings

**Educational Value:**
- Shape recognition is foundational for geometry and spatial reasoning
- Children typically master circles (2-3 yrs), squares (3-4 yrs), triangles (4-5 yrs)
- Hidden shape discovery builds visual scanning skills

**Prior Art Research:**
- **Toca Boca - Shape Builder**: Simple drag-drop, good but no tracing
- **Khan Academy Kids**: Has shape tracing but no "discovery" element
- **Endless Numbers**: Shape character animations are engaging

**Unique Value Proposition:**
- Combines shape recognition WITH fine motor tracing
- "Hidden object" discovery mechanic adds excitement
- Progressive scene complexity maintains engagement

**Technical Requirements:**
```typescript
// Core mechanics needed
interface ShapeSafariConfig {
  scenes: Scene[];           // Background images
  shapes: Shape[];           // Traceable shape paths
  difficulty: {
    shapeCount: number;      // 3 → 10 shapes per scene
    complexity: 'simple' | 'compound';
    hints: boolean;
  };
}

interface Shape {
  type: 'circle' | 'square' | 'triangle' | 'rectangle' | 'star';
  path: SVGPath;             // Tracing path
  position: { x: number; y: number };
  hiddenObject: string;      // What appears when traced
}
```

**Asset Requirements:**
| Asset Type | Quantity | Source |
|------------|----------|--------|
| Scene backgrounds | 10 | CC0 illustrations or custom |
| Shape overlays | 20 | SVG paths |
| Hidden object sprites | 30 | CC0 animal/object art |
| Sound effects | 10 | Shared library |

**Implementation Notes:**
- Reuses AlphabetGame tracing infrastructure
- Similar to Mirror Draw symmetry canvas
- Can use existing hit detection from targetPracticeLogic

**Learning Outcomes:**
1. Shape identification (circle, square, triangle, etc.)
2. Fine motor control through tracing
3. Visual scanning and discovery
4. Vocabulary building (shape names + hidden objects)

---

### 2.2 Rhyme Time

**Source:** GAME_IDEAS_CATALOG.md  
**Effort:** 1 week  
**Age:** 4-6 years  
**Category:** Literacy / Phonological Awareness  
**Fills Gap:** Phonics (strengthens existing)

#### Research Findings

**Educational Value:**
- Rhyme awareness is #1 predictor of reading success
- Phonological awareness > letter knowledge for early reading
- Children who can rhyme at 4 read better at 6 (research-backed)

**Scientific Basis:**
> "Phonological awareness is the strongest predictor of early reading success."
> - National Reading Panel, 2000

**Rhyme Families to Include:**

| Family | Words | Difficulty |
|--------|-------|------------|
| -at | cat, bat, hat, mat, rat, sat | Easy (CVC) |
| -an | can, fan, man, pan, van, ran | Easy (CVC) |
| -ig | big, dig, fig, pig, wig | Easy (CVC) |
| -op | cop, hop, mop, pop, top | Easy (CVC) |
| -ug | bug, hug, jug, mug, rug | Easy (CVC) |
| -ake | cake, make, take, bake | Medium (CVCe) |
| -ight | light, night, sight, fight | Hard (complex) |

**Game Mechanics:**
```
Round 1: "What rhymes with CAT?"
Options: [DOG] [BAT] [CAR]
Correct: BAT

Round 2: "Find the word that rhymes with TREE"
Options: [FISH] [BEE] [DOG]
Correct: BEE

Round 3+: Progressive difficulty with visual distractors
```

**Technical Design:**
```typescript
interface RhymeRound {
  targetWord: string;
  targetImage: string;
  rhymeFamily: string;      // -at, -an, -ig, etc.
  options: RhymeOption[];   // 3-4 choices
  correctAnswer: string;
}

interface RhymeOption {
  word: string;
  image: string;
  rhymes: boolean;
}

// Pinch-to-select using existing hitTarget system
// Audio pronunciation of each word on hover
```

**Accessibility:**
- Visual (word + image) for pre-readers
- Audio pronunciation support
- Large touch targets (80px minimum)

**Prior Art:**
- **Starfall**: Excellent rhyme matching, simple interface
- **ABCmouse**: Has rhyme games but too complex
- **Teach Your Monster**: Fun but not rhyme-focused

---

### 2.3 Story Sequence

**Source:** GAME_ROADMAP.md  
**Effort:** 1 week  
**Age:** 4-6 years  
**Category:** Logic / Sequencing  
**Fills Gap:** CRITICAL - Logic/Reasoning (0 games currently!)

#### Research Findings

**Why This is CRITICAL:**
- Logic/reasoning = 0 games currently
- Story sequencing builds:
  - Temporal understanding (before/after)
  - Cause-and-effect reasoning
  - Narrative comprehension
  - Executive function (planning)

**Developmental Appropriateness:**
- 4 years: Can sequence 3 familiar events
- 5 years: Can sequence 4-5 events
- 6 years: Can predict missing steps

**Sequence Themes:**

| Theme | Steps | Example | Age |
|-------|-------|---------|-----|
| Life Cycles | 3-4 | Egg → Chick → Chicken | 4+ |
| Daily Routine | 4-5 | Wake → Brush → Eat → School → Sleep | 4+ |
| Cooking | 4 | Crack → Mix → Cook → Eat | 5+ |
| Plant Growth | 4 | Seed → Sprout → Plant → Flower | 5+ |
| Weather | 3 | Clouds → Rain → Rainbow | 4+ |
| Building | 4 | Foundation → Walls → Roof → House | 5+ |

**Game Mechanics:**
```
Scene: Life Cycle
Cards shown scrambled: [🥚→🐣] [🐔] [🥚]

Task: Drag cards to numbered slots
[ 1 ] → [ 2 ] → [ 3 ]

Correct order: [🥚] → [🥚→🐣] → [🐔]

Feedback: Animation plays showing full sequence
```

**Technical Design:**
```typescript
interface StorySequence {
  id: string;
  theme: string;
  difficulty: 1 | 2 | 3;     // Number of cards
  cards: SequenceCard[];
  correctOrder: string[];    // Card IDs in order
  animation: string;         // Completion animation
}

interface SequenceCard {
  id: string;
  image: string;
  description: string;       // For audio
  position: number;          // Correct position
}

// Drag-and-drop with hand tracking
// Snap to slot when released near it
// Visual feedback on correct/incorrect placement
```

**Progressive Difficulty:**
- Level 1: 3 cards, obvious sequences (life cycles)
- Level 2: 4 cards, daily routines
- Level 3: 4-5 cards, cause-effect (baking)
- Level 4: 5 cards, with distractor cards

**Validation Strategy:**
- Immediate feedback on card placement
- Hints: "What comes before the chicken?"
- Success animation reinforces correct sequence

---

### 2.4 Free Draw / Finger Painting

**Source:** FUN_FIRST_GAMES_CATALOG.md  
**Effort:** 3 days  
**Age:** 2-6 years  
**Category:** Creativity  
**Fills Gap:** Creativity (2 games, but no pure painting)

#### Research Findings

**Educational Value:**
- Open-ended creative play builds confidence
- No wrong answers = safe exploration
- Finger painting = sensory development
- Color mixing = science discovery

**Prior Art Analysis:**
- **Toca Paint My Wings**: Butterfly painting, limited canvas
- **Drawing Pad**: Good tools but not hand-tracking
- **Doodle Buddy**: Social drawing, not age-appropriate

**Unique Features:**
- Hand tracking = paint with finger in air
- Color mixing = realistic (blue + yellow = green)
- Multiple brush types
- No objectives, pure exploration

**Technical Design:**
```typescript
interface FreeDrawConfig {
  canvas: {
    width: number;
    height: number;
    background: 'white' | 'black' | 'pattern';
  };
  brushes: Brush[];
  colors: string[];
  tools: ('brush' | 'stamp' | 'eraser' | 'clear')[];
}

interface Brush {
  type: 'round' | 'flat' | 'splatter' | 'glitter';
  size: number;
  texture?: string;
  behavior: 'normal' | 'mix' | 'smear';
}

// Gesture controls:
// - Index finger = draw
// - Pinch = pick color from palette
// - Shake hand = clear canvas
// - Two hands = two colors at once
```

**Color Mixing System:**
```javascript
// Realistic color mixing using subtractive color model
const colorMix = {
  'red+blue': 'purple',
  'red+yellow': 'orange', 
  'blue+yellow': 'green',
  'red+blue+yellow': 'brown',
  // etc.
};
```

**Asset Requirements:**
- Minimal! Mostly procedural
- Color palette UI
- Brush stroke textures (5-6 types)
- Stamps: shapes, animals, stars (optional)

---

### 2.5 Particle Playground

**Source:** FUN_FIRST_GAMES_CATALOG.md  
**Effort:** 1 week  
**Age:** 3+ years  
**Category:** Experimental / Science  
**Fills Gap:** Science exploration (only Chemistry Lab exists)

#### Research Findings

**Educational Value:**
- Physics concepts through play
- Cause-and-effect learning
- Scientific exploration without "teaching"
- Zero objectives = pure discovery

**Particle Types:**

| Type | Behavior | Interaction |
|------|----------|-------------|
| Sand | Falls, piles up | Pour with hand tilt |
| Water | Flows, splashes | Hand creates waves |
| Fire | Rises, spreads | Burns sand, evaporates water |
| Bubbles | Float up, pop | Touch to pop |
| Stars | Orbit hand | Gravity simulation |
| Leaves | Float, drift | Wind from hand movement |

**Technical Design:**
```typescript
interface ParticleSystem {
  type: 'sand' | 'water' | 'fire' | 'bubbles' | 'stars' | 'leaves';
  particles: Particle[];
  physics: PhysicsConfig;
  maxCount: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

// Physics engine: Matter.js or custom
// Hand influence: Attract/repel particles
// Pinch: Scoop/spawn particles
// Two hands: Create "tornado" between them
```

**Interactions:**
- Hand position = gravity source (for stars)
- Hand movement = wind (for leaves)
- Pinch = scoop/spawn particles
- Two hands = vortex between them
- Blow into mic = scatter particles (optional)

**Performance Considerations:**
- Max 1000 particles at once
- Spatial hashing for collision
- GPU acceleration if possible
- Frame rate target: 60fps

---

## Part 3: P1 Priority Games - Research Summary

### 3.1 Math Monsters (Math Operations)

**Source:** GAME_ROADMAP.md  
**Fills Gap:** CRITICAL - Math Operations  
**Effort:** 2 weeks

**Concept:** Feed monsters by showing answer with fingers

**Research Basis:**
- Extends existing Finger Number Show
- Visual + kinesthetic = better retention
- Monster theme appeals to 5-8 age range

**Progression:**
| Level | Operation | Examples |
|-------|-----------|----------|
| 1 | Recognition | "Show 5!" |
| 2 | Addition | "3 + 2 = ?" |
| 3 | Subtraction | "7 - 3 = ?" |
| 4 | Mixed | Random + and - |

**Technical Notes:**
- Reuses `fingerCounting.ts` logic
- Reuses monster assets from Word Builder
- Two-hand counting for numbers 11-20

---

### 3.2 Color by Number

**Source:** GAME_ROADMAP.md  
**Category:** Numeracy + Creativity  
**Effort:** 1.5 weeks

**Research Basis:**
- Classic activity with proven engagement
- Number recognition + fine motor
- Completeness motivation (finish the picture)

**Mechanics:**
- Numbered regions on image
- Select color from palette
- Trace inside region to fill
- Progressive reveal creates anticipation

**Templates:**
- Animals, vehicles, nature
- Festival themes (Diwali, Christmas)
- Characters (Pip)

---

### 3.3 Memory Match

**Source:** GAME_IDEAS_CATALOG.md  
**Category:** Logic/Memory  
**Effort:** 1 week

**Research Basis:**
- Working memory training
- Classic game pattern = familiar
- Can use existing card assets

**Variations:**
- Pictures only (3-4 years)
- Picture + word (5-6 years)
- Audio match (sound + image)

---

### 3.4 Odd One Out

**Source:** GAME_IDEAS_CATALOG.md  
**Category:** Logic/Critical Thinking  
**Effort:** 1 week

**Research Basis:**
- Categorization skill building
- Pattern recognition
- Visual discrimination

**Difficulties:**
- Level 1: Color difference (red, red, blue)
- Level 2: Shape difference (circle, circle, square)
- Level 3: Category difference (2 fruits + 1 vehicle)
- Level 4: Abstract (2 animals with stripes + 1 with spots)

---

### 3.5 Shadow Puppet Theater

**Source:** FUN_FIRST_GAMES_CATALOG.md  
**Category:** Creativity + Cultural  
**Effort:** 1 week

**Research Basis:**
- Traditional Indian art form
- Hand shape recognition
- Cultural connection
- Storytelling skills

**Characters:**
- Raja (King)
- Rani (Queen)
- Rakshasa (Demon)
- Garuda (Bird)
- Hanuman (Monkey)

**Mechanics:**
- Hand shape triggers character
- Character animates when held
- Two characters interact
- Record puppet shows

---

## Part 4: Research on Educational Game Design

### 4.1 Learning Principles Applied

#### 1. Multisensory Learning
- **Visual:** Colors, shapes, animations
- **Auditory:** Sound effects, TTS, music
- **Kinesthetic:** Hand movements, gestures
- **Research:** Multi-sensory = 30% better retention

#### 2. Spaced Repetition
- Revisit concepts across different games
- Gradual difficulty increase
- Built-in review cycles

#### 3. Immediate Feedback
- Instant visual/audio response
- Error correction without punishment
- Success celebration

#### 4. Scaffolding
- Start with support (ghost letters)
- Gradually remove support
- Independent mastery

#### 5. Flow State
- Challenge matches skill level
- Clear goals
- Immediate feedback
- Sense of control

### 4.2 Age-Appropriate Design

| Age | Attention | Input | Complexity | Feedback |
|-----|-----------|-------|------------|----------|
| 2-3 | 2-5 min | Simple touch | 1 step | Instant |
| 3-4 | 5-8 min | Pinch + drag | 2 steps | Immediate |
| 4-5 | 8-12 min | Gestures | 3 steps | Celebratory |
| 5-6 | 12-15 min | Complex gestures | Multi-step | Delayed OK |
| 6-8 | 15-20 min | Full hand tracking | Sequences | Scoring |

### 4.3 Competitor Analysis

| Competitor | Strengths | Weaknesses | Opportunities |
|------------|-----------|------------|---------------|
| Khan Academy Kids | Curriculum structure | No camera interaction | Our CV tech is unique |
| Duolingo ABC | Gamification | Limited to literacy | Cross-domain games |
| HOMER | Personalization | Expensive subscription | Free alternative |
| Endless Alphabet | Character delight | Passive learning | Active engagement |
| Toca Boca | Open play | No learning objectives | Combine fun + learning |

---

## Part 5: Implementation Roadmap

### Phase 1: Critical Gap Fillers (Weeks 1-4)

| Week | Game | Priority | Gap Filled |
|------|------|----------|------------|
| 1 | Story Sequence | P0 | Logic/Reasoning ❗ |
| 1-2 | Shape Safari | P0 | Shapes |
| 2 | Rhyme Time | P0 | Phonics |
| 3 | Free Draw | P0 | Creativity |
| 4 | Math Monsters | P1 | Math Operations ❗ |

### Phase 2: Portfolio Expansion (Weeks 5-8)

| Week | Game | Category |
|------|------|----------|
| 5 | Color by Number | Math + Art |
| 5-6 | Memory Match | Logic |
| 6 | Odd One Out | Logic |
| 7 | Particle Playground | Science |
| 7-8 | Shadow Puppet Theater | Creativity |

### Phase 3: Polish & Advanced (Weeks 9-12)

| Week | Game | Category |
|------|------|----------|
| 9-10 | Phonics Tracing | Literacy |
| 10 | Beginning Sounds | Literacy |
| 11 | Virtual Bubbles | Experimental |
| 11-12 | Kaleidoscope Hands | Creativity |

### Phase 4: Integration (Weeks 13-16)

- Add Bubble Pop Symphony to gallery
- Add Dress For Weather to gallery
- Combined CV games (Pose + Hand)
- Parent dashboard integration

---

## Part 6: Technical Research

### 6.1 MediaPipe Capabilities

| Feature | Status | Use Cases |
|---------|--------|-----------|
| Hand Landmarker (21 points) | ✅ Working | All hand games |
| Pose Landmarker (33 points) | ✅ Working | Yoga, Freeze Dance |
| Face Landmarker (468 points) | ✅ Available | Expressions, attention |
| Gesture Recognizer | ⚠️ Beta | Pre-defined gestures |
| Image Segmenter | ⚠️ Available | AR backgrounds |

### 6.2 Browser APIs

| API | Support | Use |
|-----|---------|-----|
| Web Audio API | ✅ 95%+ | Sound synthesis |
| Web Speech API | ✅ 90%+ | TTS |
| getUserMedia | ✅ 95%+ | Camera access |
| Canvas 2D | ✅ 99%+ | 2D rendering |
| WebGL | ✅ 95%+ | 3D/Effects |
| Device Orientation | ✅ 90%+ | Tilt controls |
| Vibration API | ✅ 85%+ | Mobile haptic |

### 6.3 Performance Budgets

| Metric | Target | Max |
|--------|--------|-----|
| First Paint | < 1s | 2s |
| Time to Interactive | < 3s | 5s |
| Frame Rate | 60fps | 30fps |
| Memory Usage | < 100MB | 200MB |
| Bundle Size | < 500KB | 1MB |

---

## Part 7: Research Citations & Sources

### Educational Research

1. **National Reading Panel (2000)** - Phonological awareness importance
2. **Vygotsky's Zone of Proximal Development** - Scaffolding principle
3. **Csikszentmihalyi's Flow Theory** - Engagement optimization
4. **Montessori Method** - Multi-sensory learning
5. **Common Core State Standards** - Age-appropriate milestones

### Technical Sources

1. **MediaPipe Documentation** - Google AI
2. **Web Audio API Spec** - W3C
3. **Canvas API Best Practices** - MDN
4. **React Performance Patterns** - React Docs
5. **TypeScript Handbook** - Microsoft

### Competitor Research

1. **Khan Academy Kids** - App Store, Play Store
2. **Duolingo ABC** - Public reviews, feature analysis
3. **HOMER** - Product website, pricing
4. **Toca Boca** - Portfolio analysis
5. **Endless Alphabet** - Gameplay videos

---

## Part 8: Research Artifacts

### Documents Referenced

| Document | Purpose | Key Insights |
|----------|---------|--------------|
| GAME_ROADMAP.md | P0 game designs | 8 detailed designs |
| FUN_FIRST_GAMES_CATALOG.md | Creative games | 40+ fun-first ideas |
| GAME_IDEAS_CATALOG.md | Full catalog | 67 game concepts |
| COMPREHENSIVE_INNOVATIVE_GAMES_CATALOG.md | AR/Science | 50+ advanced games |
| COMPLETE_GAMES_UNIVERSE.md | Master reference | 270+ total concepts |
| GAMES.md | Current inventory | 21 implemented |

### Tools Used

- **Frame Analysis:** emoji_frame_analysis_results.json (634 frames analyzed)
- **Performance:** latency_analysis.json
- **Test Coverage:** vitest run results
- **Code Analysis:** Manual review of 31 game files

---

## Part 9: Open Questions for Further Research

### Technical
1. WebGPU for particle systems - worth the complexity?
2. WebRTC for multiplayer - privacy implications?
3. TensorFlow.js on-device - performance vs accuracy?

### Educational
1. Optimal session length by age?
2. Spaced repetition intervals?
3. Adaptive difficulty algorithms?

### Product
1. Parent dashboard priorities?
2. Subscription model vs one-time?
3. Multiplayer demand?

---

*Document Status: Research Phase Complete*  
*Next Step: Implementation of P0 games*  
*Last Updated: 2026-02-22*
