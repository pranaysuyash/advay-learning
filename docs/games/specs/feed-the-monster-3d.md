# Game Specification: Feed the Monster 3D

> **Slug:** `feed-the-monster-3d`  
> **World:** 3D World  
> **CV Mode:** Hand Tracking (`cv: ['hand']`)  
> **File:** `src/frontend/src/pages/three/FeedTheMonster3D.tsx`  
> **Logic:** `src/frontend/src/games/feedTheMonsterLogic.ts`  
> **Last Updated:** 2026-04-03  
> **Spec Version:** 1.0

---

## Section 1: Concept Summary

| Attribute | Value |
|-----------|-------|
| **One-line concept** | Feed a hungry 3D monster by tossing food items into its mouth using hand-controlled physics |
| **Genre** | Casual Physics Toy / Feeding Simulation |
| **Target audience** | Ages 3-8, younger children who enjoy nurturing play |
| **Core player fantasy** | Being a caretaker for a cute, reactive creature |
| **Primary skill tested** | Hand-eye coordination, spatial reasoning, cause-and-effect |
| **Session length** | 3-5 minutes, open-ended play |
| **Platform context** | 3D World - relaxed, creative experience |

**Educational Value:** Develops fine motor control, understanding of physics (trajectory, gravity), and emotional recognition through monster reactions.

---

## Section 2: Repo Status

### Implementation Status: **BETA - FUNCTIONAL**

| Aspect | Status | Evidence |
|--------|--------|----------|
| Core gameplay | ✅ Complete | Full 3D feeding mechanics |
| Monster reactions | ✅ Complete | 4 emotional states with visuals |
| Food variety | ✅ Complete | 6 different food items |
| Physics throwing | ✅ Complete | Click to launch food |
| Happiness system | ✅ Complete | Dynamic happiness meter |
| Audio | ✅ Complete | Click, eat, crunch, win SFX |
| CV Integration | ⚠️ Partial | Hand tracking declared, click-based |
| 3D Hand Cursor | ❌ Missing | No visible hand tracking cursor |

### What Works Now
- Interactive 3D monster with state-based reactions
- Physics-based food throwing mechanic
- 6 different food types (apple, banana, burger, pizza, carrot, donut)
- Dynamic happiness system (0-100%)
- Variety bonus for feeding different foods
- Color-coded monster based on emotional state
- Win condition at 80% happiness
- Audio feedback for all interactions
- OrbitControls for camera manipulation

### What Is Partial/Missing
- **CV Hand Tracking**: Listed in registry but not actively used for interaction
- **3D Hand Cursor**: No visual representation of hand position
- **Raycast Interaction**: Food selection could use hand pointing
- **Depth Perception**: No hand-to-depth mapping for "grabbing"
- **Mobile Optimization**: Touch targets may be small
- **Food Variety Logic**: Uses simplified version vs. logic file

---

## Section 3: Current Implementation

### Flow
```
Game Start → Load Assets → Show Food Selector → Choose Food → Click to Throw → 
Monster Eats → Happiness Increases → Win at 80% → Reset
```

### Architecture
```
FeedTheMonster3D (main)
├── GameContainer (UI wrapper)
├── ThreeDGameCanvas (rendering context)
│   ├── Physics (Rapier world, gravity [0, -9.82, 0])
│   ├── Ground (static collider)
│   ├── Monster (animated character with state)
│   ├── FoodItem (dynamic physics object - when selected)
│   ├── FoodSelector (HTML UI for food choice)
│   └── ScoreUI (happiness + score display)
└── Controls/Instructions (DOM overlay)
```

### Controls (Current)

| Action | Input | Response |
|--------|-------|----------|
| Select Food | Click food button | Food appears in 3D scene |
| Throw Food | Click on food item | Apply velocity toward monster |
| Reset Game | Click Reset button | Clear state, restart |
| Mute Audio | Click volume icon | Toggle audio on/off |
| Orbit Camera | Drag on canvas | Rotate camera view |

### Physics Configuration
```typescript
// Food Item RigidBody
{
  type: 'dynamic',
  mass: 1,
  colliders: 'ball',      // Spherical collider
  friction: 0.5,
  restitution: 0.3        // Slight bounce
}

// World Physics
{
  gravity: [0, -9.82, 0], // Standard Earth gravity
  timestep: 1/60
}

// Throw Velocity (on click)
{
  x: (Math.random() - 0.5) * 2,  // Random spread
  y: 8,                           // Upward arc
  z: 5 + Math.random() * 2        // Toward monster
}
```

### Monster State Machine
```typescript
type MonsterState = 'idle' | 'happy' | 'eating' | 'sad';

const stateBehaviors = {
  idle:    { animation: 'breathing',  color: 0.35, emoji: '😐' },
  happy:   { animation: 'jumping',    color: 0.30, emoji: '😋' },
  eating:  { animation: 'chewing',    color: 0.15, emoji: '😮' },
  sad:     { animation: 'slumped',    color: 0.60, emoji: '😢' }
};
```

### Visuals/UI
- **Canvas**: 600px height, rounded-xl, slate background (`#1e293b`)
- **Environment**: Warehouse preset lighting
- **Camera**: OrbitControls enabled, position `[0, 2, 6]`
- **Monster**: Kenney character-b model, scaled 1.5x
- **Food Selector**: HTML overlay with emoji buttons
- **Happiness Meter**: Color-coded progress bar (red/yellow/green)

### Gaps/Issues
1. **CV Not Integrated**: Hand tracking declared but click-based
2. **No Hand Cursor**: Missing 3D hand-to-cursor projection
3. **Food Collision**: No mouth detection, purely timing-based
4. **Limited Food Items**: 6 items vs. 11 in logic file
5. **No Emotion Matching**: Logic has emotion categories, not used

---

## Section 4: Intended Design

### Educational Goal
Develop fine motor control and spatial reasoning through physics-based interaction, combined with emotional intelligence through monster reaction reading.

### Pedagogical Approach
- **Experimentation**: Try different throw velocities
- **Observation**: Watch monster reactions to learn preferences
- **Variety Awareness**: Different foods give different reactions
- **Caregiving**: Nurturing the monster to happiness

### Difficulty Progression (Planned)

| Level | Foods Available | Monster Mood | Challenge |
|-------|-----------------|--------------|-----------|
| 1 | 3 basic foods | Happy | Easy introduction |
| 2 | 4 foods | Neutral | Mix of preferences |
| 3 | 5 foods | Picky | Must match emotion |
| 4+ | All 11 foods | Changing | Dynamic emotions |

### Accessibility
- **Visual**: Large emoji buttons, clear color coding
- **Motor**: Multiple input methods (hand, click, touch)
- **Cognitive**: Simple cause-and-effect, no time pressure
- **Audio**: Clear feedback sounds, mute option

### Engagement
- **Reactive Monster**: Immediate emotional feedback
- **Variety Bonus**: Encourages exploration
- **Win Celebration**: Satisfying completion moment
- **Open Play**: No penalties, experimentation encouraged

### Core Loop
```
Select Food → Throw at Monster → Monster Eats → React Emotionally → 
Happiness Changes → Repeat → Win at Threshold
```

---

## Section 5: Drift Analysis

### Where Implementation Matches Intent (70%)

| Feature | Alignment | Notes |
|---------|-----------|-------|
| 3D Feeding Core | ✅ 100% | Physics-based throwing works |
| Monster Reactions | ✅ 95% | 4 states with animations |
| Happiness System | ✅ 90% | Dynamic meter, color changes |
| Audio Feedback | ✅ 100% | Complete SFX coverage |
| Visual Polish | ✅ 85% | Nice animations, color shifts |
| Win Condition | ✅ 100% | 80% happiness threshold |

### Where Implementation Exceeds Intent (10%)

| Feature | Exceeds By | Notes |
|---------|------------|-------|
| Camera Control | +OrbitControls | Can rotate around scene |
| Performance Monitor | +Telemetry | Built-in FPS tracking |
| Reset Functionality | +Instant | Clean state reset |

### Where Implementation Falls Short (20%)

| Feature | Shortfall | Impact |
|---------|-----------|--------|
| CV Hand Tracking | ❌ Not wired | Listed but unused |
| 3D Hand Cursor | ❌ Missing | No visual hand position |
| Emotion Matching | ❌ Simplified | Logic exists, not used |
| Food Variety | ❌ 6 vs 11 items | Reduced content |
| Mouth Detection | ❌ Timing only | No collision detection |

### Overall Assessment
**Implementation-to-Intent Alignment: 75%**

The game successfully delivers the core feeding experience with engaging monster reactions, but lacks the intended CV hand tracking integration that would make it a true vision-based experience.

---

## Section 6: Recommended Canonical Version

### Current Strengths to Keep
1. **Monster State System**: Excellent emotional reactions
2. **Physics Throwing**: Satisfying trajectory mechanics
3. **Happiness Meter**: Clear, motivating progress indicator
4. **Variety Bonus**: Rewards exploration
5. **Audio Design**: Rich SFX enhances interaction

### Enhancements to Implement

#### P0: CV Integration (Critical)
- Add `useGameHandTracking` hook
- Project 2D hand to 3D cursor via raycasting
- Use pinch gesture to "grab" and throw food
- Visual hand cursor in 3D space

#### P1: Emotion Matching
- Implement emotion categories from logic file
- Monster requests specific emotion foods
- Reward correct matches with bonus happiness

#### P2: Content Expansion
- Add all 11 foods from logic file
- Create 3 difficulty levels
- Add "picky eater" mode with changing preferences

### Experimental Features
- **Multi-Monster**: Feed multiple creatures
- **Food Combos**: Combine foods for special reactions
- **Monster Customization**: Change colors/accessories
- **Feeding Frenzy**: Timed mode with rapid feeding

---

## Section 7: Visual Identity

### Overall Look
Charming, toy-like 3D scene with a cute monster character. Bright, inviting colors that appeal to young children.

### Camera View
Perspective camera with OrbitControls enabled. Default position `[0, 2, 6]` looking at monster. Users can rotate around the scene.

### Art Style
- **Poly Count**: Low-poly optimized for web
- **Character**: Kenney character-b with dynamic color shifting
- **Food**: Kenney food pack models
- **Environment**: Simple ground plane, warehouse lighting

### Mood
Warm, nurturing, playful. "Take care of this cute creature" vibe.

### Colors
| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark Slate | `#1e293b` |
| Ground | Blue Gray | `#3d5a80` |
| Monster (Happy) | Green | `#4ade80` |
| Monster (Sad) | Blue | `#60a5fa` |
| Monster (Eating) | Orange | `#fb923c` |
| UI Panel | White | `#ffffff` |
| Happiness Bar (High) | Green | `#22c55e` |
| Happiness Bar (Med) | Yellow | `#eab308` |
| Happiness Bar (Low) | Red | `#ef4444` |

### Environment
- **Setting**: Simple studio/platform environment
- **Lighting**: Warehouse preset with soft shadows
- **Ground**: Solid blue-gray platform

### UI Style
- **Font**: System sans-serif, friendly rounded
- **Panels**: White with slight transparency
- **Buttons**: Emoji-based food selection, colored borders
- **Feedback**: Large emoji reactions above monster

### Active Vibe
😴 **Relaxed** - Calm, nurturing, no time pressure

---

## Section 8: Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| Game Container | Frame the experience | Title, home button, game area |
| 3D Canvas | Main gameplay | Monster, food, physics world |
| Food Selector | Choose what to feed | 6 food emoji buttons |
| Happiness Meter | Show monster mood | Percentage + progress bar |
| Score Display | Track points | Current score |
| Monster Reaction | Emotional feedback | Emoji above monster |
| Controls | Input reference | Click to throw hint |
| Win Screen | Completion | Happiness celebration |

---

## Section 9: Controls

### Current Implementation (Mouse/Click)

| Action | Input | Feedback |
|--------|-------|----------|
| Select Food | Click food button | Button highlights, food spawns |
| Throw Food | Click on food item | Velocity applied, click SFX |
| Orbit Camera | Drag on canvas | Camera rotates |
| Reset | Click Reset button | State clears, reset SFX |
| Mute | Click volume icon | Toggle audio |

### Intended CV Controls (Hand Tracking)

| Action | Hand Gesture | Feedback |
|--------|--------------|----------|
| Select Food | Point + pinch at food button | Button highlights |
| Grab Food | Pinch gesture on food | Food "attached" to hand |
| Throw Food | Release pinch + flick motion | Velocity applied |
| Move Cursor | Hand position | 3D cursor follows |

### Hand-to-3D Mapping Pattern
```typescript
// Pattern from 3D_WORLD_PATTERNS.md
const hand2D = useGameHandTracking();
const hand3D = useMemo(() => ({
  x: (hand2D.x - 0.5) * viewport.width,
  y: (0.5 - hand2D.y) * viewport.height,
  z: 0  // Or raycast to find depth
}), [hand2D, viewport]);
```

---

## Section 10: Core Mechanics

### Food Throwing Physics
```typescript
// Launch food toward monster
const throwVelocity = {
  x: (Math.random() - 0.5) * 2,  // Random X spread (-1 to 1)
  y: 8,                           // Upward arc
  z: 5 + Math.random() * 2        // Forward toward monster (5-7)
};

rigidBody.setLinvel(throwVelocity, true);
```

### Happiness Calculation
```typescript
// Base increase
const baseIncrease = 5;

// Variety bonus
const uniqueFoods = new Set(fedFoods).size;
const varietyBonus = uniqueFoods * 2;

// Total
const newHappiness = Math.min(100, current + baseIncrease + varietyBonus);
```

### Scoring Formula
```typescript
// Base points
const baseScore = 10;

// Variety bonus
const varietyBonus = uniqueFoods * 10;

// Total
score += baseScore + varietyBonus;
```

### Monster State Transitions
```typescript
// After eating
if (happiness > 80) {
  setMonsterState('happy');
  playSFX('win');
} else {
  setMonsterState('sad');
  setTimeout(() => setMonsterState('idle'), 1000);
}

// Auto-return to idle
setTimeout(() => setMonsterState('idle'), 2000);
```

### Emotion Color Mapping
```typescript
const hue = 
  state === 'happy'   ? 0.30  // Green
  : state === 'sad'   ? 0.60  // Blue  
  : state === 'eating'? 0.15  // Orange
  : 0.35;                     // Default green

const color = new THREE.Color().setHSL(hue, 0.7, 0.5);
```

---

## Section 11: Rules

### Start Conditions
- Monster spawns in idle state
- Food selector UI displayed
- Happiness starts at 50%
- Score starts at 0

### Objectives
1. Feed the monster various foods
2. Increase happiness to 80%
3. Discover variety bonuses
4. Win the game

### Allowed Actions
- Select any available food
- Throw food toward monster
- Rotate camera view
- Reset game at any time

### Restrictions
- Only one food active at a time
- Must click food to throw (not drag)
- Cannot feed while monster is "eating"
- No penalties for missing

### Scoring
| Action | Points |
|--------|--------|
| Feed Monster | +10 base |
| Variety Bonus | +10 per unique food |
| Win Bonus | Automatic completion |

### Win/Lose Conditions
| Condition | Trigger | Result |
|-----------|---------|--------|
| Win | Happiness ≥ 80% | Win screen, drops awarded |
| Continue | Happiness < 80% | Keep playing indefinitely |
| Reset | Manual button | Clear all progress |

---

## Section 12: HUD / Gameplay UI

### Elements

| Element | Purpose | Update |
|---------|---------|--------|
| Score | Track points | On each successful feed |
| Happiness Meter | Show monster mood | Real-time |
| Happiness % | Numeric value | Real-time |
| Food Selector | Choose food | Static options |
| Monster Emoji | Emotional state | On state change |

### Layout
```
┌─────────────────────────────────────┐
│  Score: 150    Happiness: 65% [██░░]│  ← HUD (top-left)
├─────────────────────────────────────┤
│                                     │
│         [3D SCENE]                  │  ← Main Canvas
│                                     │
│            😋                       │  ← Monster reaction
│         [MONSTER]                   │
│                                     │
├─────────────────────────────────────┤
│  🍎 🍌 🍔 🍕 🥕 🍩  |  [Reset]      │  ← Food selector + controls
└─────────────────────────────────────┘
```

### Food Selector Layout
```
┌──────────────────────────┐
│      Choose Food         │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐    │
│  │🍎│ │🍌│ │🍔│ │🍕│    │
│  └──┘ └──┘ └──┘ └──┘    │
│  ┌──┐ ┌──┐              │
│  │🥕│ │🍩│              │
│  └──┘ └──┘              │
│  Click food, then throw! │
└──────────────────────────┘
```

---

## Section 13: Feedback and Feel

### Success Feedback

| Action | Visual | Audio | Animation |
|--------|--------|-------|-----------|
| Select Food | Button highlight | Click sound | Scale pulse |
| Throw Food | Food launches | Whoosh | Trajectory arc |
| Monster Eats | Emoji change | Eat sound | Chewing motion |
| Happiness Up | Bar fills | Crunch | Bounce effect |
| Win | Confetti, glow | Victory | Happy jumping |

### During Gameplay
- **Monster Idle**: Gentle breathing (scale Y oscillation)
- **Monster Happy**: Jumping animation (position Y oscillation)
- **Monster Eating**: Chewing (scale Y pulse)
- **Monster Sad**: Slumped (rotation Z slight tilt)

### State-Based Visuals

| State | Color | Emoji | Animation |
|-------|-------|-------|-----------|
| Idle | Green | 😐 | Breathing |
| Happy | Bright Green | 😋 | Jumping |
| Eating | Orange | 😮 | Chewing |
| Sad | Blue | 😢 | Slumped |

### Streak/Progress Feedback
- Happiness bar color transitions smoothly
- Monster emoji bounces on significant changes
- Score updates with subtle scale animation

---

## Section 14: Points / Rewards / Progression

### Points Breakdown

| Source | Base | Bonus | Notes |
|--------|------|-------|-------|
| Feed Monster | 10 | - | Per feeding |
| Variety | - | 10×unique | Encourages trying all foods |
| Win | - | - | Automatic at 80% happiness |

### Final Score Calculation
```typescript
finalScore = (feedCount * 10) + (uniqueFoods * 10);
```

### Rewards/Drops
From `gameRegistry.ts`:
- Color Green (25% chance)
- Star Silver (10% chance, min score 75)

### Easter Eggs
- **Monster Chef**: Feed the monster 50 times
  - Reward: Star Gold
  - Trigger: `feed-50-times`
  - Difficulty: Medium

### Progression System (Planned)
- Level system with increasing difficulty
- Unlock new foods as rewards
- Monster customization options
- Feeding statistics tracking

---

## Section 15: End States

### Correct/Success (Win)
- **Trigger**: Happiness ≥ 80%
- **Visual**: Confetti, bright glow, trophy
- **Audio**: Victory fanfare
- **Monster State**: Happy jumping
- **Actions**: Continue feeding or reset
- **Rewards**: Drops calculated, progress saved

### Continue Playing (No Lose)
- **Trigger**: Happiness < 80%
- **Visual**: Normal gameplay continues
- **Audio**: Ambient sounds
- **Actions**: Keep feeding indefinitely

### Manual Reset
- **Trigger**: Click Reset button
- **Visual**: Fade out, fade in
- **Audio**: Reset click sound
- **State**: All values reset to initial

---

## Section 16: Parallel Modes / Alternate Implementations

### Mode A: Click Controls (Current)
- **Input**: Mouse click on food buttons and items
- **Pros**: Precise, works on all devices
- **Cons**: Not vision-based as intended
- **Use Case**: Desktop, fallback mode

### Mode B: Hand Tracking (Intended Primary)
- **Input**: Hand gestures via camera
- **Pros**: Natural interaction, active play
- **Cons**: Requires camera, calibration
- **Use Case**: Main intended experience

### Mode C: Touch Controls (Tablets)
- **Input**: Tap food, flick to throw
- **Pros**: Mobile-native
- **Cons**: Less precise than mouse
- **Use Case**: iPads, tablets

### Mode D: Emotion Challenge Mode (Planned)
- **Input**: Hand or click
- **Gameplay**: Match food to monster's requested emotion
- **Pros**: Educational value, cognitive challenge
- **Cons**: More complex rules
- **Use Case**: Older children, extended play

---

## Section 17: Improvement Opportunities

### Low Cost (1-2 days)
1. **Integrate Hand Tracking**: Add `useGameHandTracking` hook
2. **3D Hand Cursor**: Visual cursor following hand position
3. **Pinch Detection**: Use pinch for "grabbing" food
4. **All Food Items**: Add remaining 5 foods from logic file

### Medium Effort (3-5 days)
1. **Mouth Collision**: Add trigger collider for "caught" detection
2. **Emotion Matching**: Implement emotion-based feeding
3. **Drag to Throw**: Click and drag for aiming
4. **Food Trajectory**: Visual arc prediction
5. **Particle Effects**: Crumbs, sparkles on eat

### Ambitious (1-2 weeks)
1. **Multi-Monster Mode**: Feed multiple creatures
2. **Level System**: Progressive difficulty with new foods
3. **Monster Creator**: Customize monster appearance
4. **Food Combos**: Mix foods for special reactions
5. **Social Features**: Share happy monster photos

---

## Section 18: Content Model

### Food Data Structure
```typescript
interface FoodItem {
  id: string;
  name: string;
  icon: string;      // Emoji
  color: string;     // Hex color
  emotion?: 'happy' | 'sad' | 'angry' | 'excited' | 'calm';
}

// Current implementation (6 items)
const foodItems = [
  { id: 'apple',  name: 'Apple',  icon: '🍎', color: '#ef4444' },
  { id: 'banana', name: 'Banana', icon: '🍌', color: '#eab308' },
  { id: 'burger', name: 'Burger', icon: '🍔', color: '#f97316' },
  { id: 'pizza',  name: 'Pizza',  icon: '🍕', color: '#fbbf24' },
  { id: 'carrot', name: 'Carrot', icon: '🥕', color: '#f97316' },
  { id: 'donut',  name: 'Donut',  icon: '🍩', color: '#ec4899' },
];
```

### Extended Food Set (from logic file)
Additional items available:
- Ice Cream, Tissues, Teddy Bear, Hot Cocoa, Tea
- Energy Drink, Candy, Hot Pepper, Lemon

### Monster Emotions (from logic file)
```typescript
const emotions = [
  { emotion: 'happy',   emoji: '😄', prompt: 'Yummy!' },
  { emotion: 'sad',     emoji: '😢', prompt: 'I need comfort food...' },
  { emotion: 'calm',    emoji: '😌', prompt: 'So peaceful...' },
  { emotion: 'excited', emoji: '🤩', prompt: 'Wow! So exciting!' },
  { emotion: 'angry',   emoji: '😠', prompt: 'Too spicy!' },
];
```

### Asset Dependencies
```typescript
// Foods (Kenney 3D food pack)
'/assets/kenney/3d/food/apple.glb'
'/assets/kenney/3d/food/banana.glb'
'/assets/kenney/3d/food/burger.glb'
'/assets/kenney/3d/food/pizza.glb'
'/assets/kenney/3d/food/carrot.glb'
'/assets/kenney/3d/food/donut.glb'

// Character
'/assets/kenney/3d/characters/character-b.glb'
```

---

## Section 19: Technical Structure

### Main Files

| File | Purpose | Lines |
|------|---------|-------|
| `FeedTheMonster3D.tsx` | Main game component | 449 |
| `feedTheMonsterLogic.ts` | Game logic definitions | 93 |
| `ThreeDGameCanvas.tsx` | Shared 3D renderer | 361 |

### Key Components (In Main File)

```typescript
// FoodItem.tsx (inline component)
function FoodItem({ food, position, onFeed }) {
  // Dynamic RigidBody with ball collider
  // Kenney food model
  // Click-to-throw handler
}

// Monster.tsx (inline component)
function Monster({ state }) {
  // Animated character with useFrame
  // State-based color shifting
  // Emoji reaction indicator
}

// Ground.tsx (inline component)
function Ground() {
  // Static collider floor
  // Receive shadows
}

// FoodSelector.tsx (inline component)
function FoodSelector({ foods, onSelect, selectedFood }) {
  // HTML overlay UI
  // Emoji button grid
}

// ScoreUI.tsx (inline component)
function ScoreUI({ score, happiness }) {
  // Floating score display
  // Happiness percentage and bar
}
```

### Hooks Used

| Hook | Source | Purpose |
|------|--------|---------|
| `useState` | React | Game state (score, happiness, etc.) |
| `useRef` | React | RigidBody refs |
| `useEffect` | React | Audio preloading |
| `useMemo` | React | Scene cloning, color calculations |
| `useCallback` | React | Event handlers |
| `useFrame` | R3F | Animation loop (monster reactions) |
| `useGLTF` | @react-three/drei | 3D model loading |
| `useAnimations` | @react-three/drei | Animation clips |
| `use3DGameAudio` | Custom | Audio management |
| `useAutoGameCompletion` | Custom | Progress tracking |
| `usePerformanceMonitor` | Custom | FPS monitoring |

### State Management
```typescript
// Game state
const [isMuted, setIsMuted] = useState(false);
const [score, setScore] = useState(0);
const [happiness, setHappiness] = useState(50);
const [monsterState, setMonsterState] = useState('idle');
const [selectedFood, setSelectedFood] = useState(null);
const [fedFoods, setFedFoods] = useState([]);

// Physics refs
const rigidBodyRef = useRef(null);
```

### Dependencies
```json
{
  "@react-three/fiber": "R3F core",
  "@react-three/drei": "R3F utilities",
  "@react-three/rapier": "Physics engine",
  "three": "3D rendering",
  "lucide-react": "UI icons"
}
```

---

## Section 20: Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Why CV not connected? | Prioritized click for reliability | High |
| Is emotion system needed? | Logic exists but unused | High |
| Performance on mobile? | No testing data | Medium |
| Food item count? | 6 vs 11 suggests phased approach | Medium |
| Mouth collision? | Timing simpler than physics detection | High |

---

## Section 21: Implementation Notes

### Strengths to Preserve
1. **Monster State Machine**: Clean, extensible emotion system
2. **Physics Feel**: Satisfying throw mechanics
3. **Visual Feedback**: Immediate, clear reactions
4. **Audio Integration**: Rich soundscape
5. **Component Organization**: Well-structured inline components

### Architecture Patterns
- **Inline Components**: All game objects in main file
- **State-Driven Rendering**: Monster appearance from state
- **Physics Callbacks**: onFeed for game logic
- **Asset Preloading**: useGLTF.preload pattern

### Testing Considerations
- **Physics Stability**: Food items should settle naturally
- **State Transitions**: Ensure no stuck states
- **Audio Timing**: SFX sync with animations
- **Memory Management**: Clean up spawned food items

### Performance Notes
- **Draw Calls**: Low (few objects)
- **Physics Bodies**: 1-2 dynamic at a time
- **Animation**: useFrame for smooth updates
- **Target FPS**: 60 (easily maintained)

---

## Section 22: Acceptance Criteria

### Core Functionality
- [ ] Food selector displays all 6 foods
- [ ] Clicking food spawns it in 3D scene
- [ ] Clicking food applies throw velocity
- [ ] Monster reacts to feeding (state change)
- [ ] Happiness increases on feeding
- [ ] Win triggers at 80% happiness
- [ ] Reset clears all state

### CV Integration (When Implemented)
- [ ] Hand tracking initializes
- [ ] 3D cursor visible and follows hand
- [ ] Pinch gesture selects food
- [ ] Pinch + flick throws food
- [ ] Interaction feels natural

### Visual/Audio
- [ ] All Kenney assets load
- [ ] Monster color changes with state
- [ ] Emoji reactions display correctly
- [ ] Audio plays for all actions
- [ ] Mute toggle works

### Performance
- [ ] 60 FPS maintained
- [ ] No memory leaks
- [ ] Smooth animations

---

## Section 23: Test Plan

### Manual Gameplay Tests

| Test | Steps | Expected |
|------|-------|----------|
| Select Food | Click apple button | Apple button highlights |
| Spawn Food | Select any food | Food appears in 3D scene |
| Throw Food | Click spawned food | Food launches toward monster |
| Monster Reaction | After throw | Monster shows eating animation |
| Happiness Increase | Feed monster | Happiness bar increases |
| Win Condition | Reach 80% happiness | Win state triggered |
| Reset | Click reset button | All values reset to initial |

### CV Control Tests (When Implemented)

| Test | Steps | Expected |
|------|-------|----------|
| Hand Tracking | Show hand to camera | Cursor appears in 3D |
| Point at Food | Point at food button | Button highlights |
| Pinch Select | Pinch at food button | Food spawns |
| Grab Food | Pinch on spawned food | Food "sticks" to hand |
| Throw Motion | Release pinch with flick | Food launches |

### Fallback Tests

| Test | Steps | Expected |
|------|-------|----------|
| No Camera | Disable camera | Click controls still work |
| No Assets | Block asset loading | Graceful fallback |
| Low FPS | Throttle CPU | Game still playable |

### Edge Cases

| Case | Test | Expected |
|------|------|----------|
| Rapid Feeding | Click rapidly | Each food spawns, no crash |
| Miss Throw | Throw away from monster | Food falls, no error |
| Multiple Foods | Spawn multiple before throw | Each is independent |
| Max Happiness | Feed at 100% | Stays at 100%, no overflow |

### Performance Tests

| Test | Method | Target |
|------|--------|--------|
| FPS Stability | Extended play | > 55 FPS |
| Memory Usage | DevTools | < 150MB |
| Asset Loading | Throttled | < 3s load |
| Animation Smoothness | Visual check | No stuttering |

---

## Appendix A: Food-Emotion Mapping

From `feedTheMonsterLogic.ts`, foods map to emotions:

| Food | Emotion | Effect |
|------|---------|--------|
| Pizza | Happy | Standard happiness gain |
| Carrot | Happy | Standard happiness gain |
| Ice Cream | Happy | High happiness gain |
| Tissues | Sad | Comfort food (sad monster) |
| Teddy Bear | Sad | Comfort food (sad monster) |
| Hot Cocoa | Calm | Calms excited monster |
| Tea | Calm | Calms excited monster |
| Energy Drink | Excited | Excites calm monster |
| Candy | Excited | Excites calm monster |
| Hot Pepper | Angry | Wrong for happy monster |
| Lemon | Angry | Wrong for happy monster |

To implement emotion matching:
1. Monster displays desired emotion
2. Player must select matching food category
3. Correct match = bonus happiness
4. Wrong match = reduced/no gain

---

## Appendix B: Animation System

Monster uses `useFrame` for procedural animations:

```typescript
useFrame(({ clock }) => {
  if (state === 'happy') {
    // Jumping: absolute sine wave
    position.y = -1 + Math.abs(Math.sin(clock.elapsedTime * 10)) * 0.3;
  } else if (state === 'eating') {
    // Chewing: scale pulse
    scale.y = 1 + Math.sin(clock.elapsedTime * 15) * 0.1;
  } else if (state === 'sad') {
    // Slumped: slight tilt
    rotation.z = Math.sin(clock.elapsedTime * 2) * 0.05;
  } else {
    // Idle: gentle breathing
    position.y = -1 + Math.sin(clock.elapsedTime * 2) * 0.05;
  }
});
```

This approach avoids complex animation clips while maintaining expressive character.

---

*End of Specification for Feed the Monster 3D*
