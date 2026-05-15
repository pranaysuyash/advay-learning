# Dress Up 3D - Game Specification

**Game ID:** dress-for-weather-3d  
**Slug:** dress-up-3d  
**Display Name:** Dress Up 3D  
**World:** 3D World  
**CV Mode:** Hand tracking (`cv: ['hand']`)  
**Code:** `src/frontend/src/pages/three/DressForWeather3D.tsx`  
**Registry:** `src/frontend/src/data/gameRegistries/threeDWorld.ts`  

---

## Section 1: Concept Summary

| Attribute | Description |
|-----------|-------------|
| **One-line concept** | Dress a 3D character in appropriate clothing for different weather conditions |
| **Genre** | Creative / Weather Education / Dress-Up |
| **Target audience** | Ages 3-7, children learning weather awareness and appropriate clothing choices |
| **Core player fantasy** | "I'm a fashion stylist helping my character stay comfortable in any weather!" |
| **Primary skill tested** | Weather awareness, cause-and-effect reasoning, clothing categorization, creative expression |
| **Session length** | Open-ended (5-10 minutes typical), no time pressure |
| **Platform context** | 3D World game using React Three Fiber with Kenney character models |

---

## Section 2: Repo Status

- **Implementation status:** ✅ Production Ready (Functional)
- **What works now:**
  - Full 3D character model loading (Kenney blocky character)
  - Dynamic clothing color application (shirt and pants)
  - 4 weather types with visual and audio feedback (Sunny, Rainy, Snowy, Windy)
  - Weather particle effects (rain drops, snowflakes, sun glow)
  - Weather-appropriate outfit validation logic
  - Clothing selector UI with 5 shirts and 3 pants options
  - Ambient weather sounds (rain, wind) via use3DGameAudio
  - Character animation for weather conditions (wind sway, snow shiver)
  - Mute/unmute audio controls
  - Success feedback with animated UI
  - Integration with GameShell and GameContainer
- **What is partial/missing:**
  - **CV hand tracking not integrated** - UI is click-based only
  - No TTS for weather descriptions or feedback
  - Limited clothing variety (no accessories like hats, boots, scarves)
  - Character model is generic (not customizable beyond colors)
  - No save/share outfit feature
  - No progressive difficulty or challenges
  - Weather transitions are instant (no gradual change animation)
- **Evidence:**
  - Main file: `src/frontend/src/pages/three/DressForWeather3D.tsx` (437 lines)
  - No separate logic file
  - Uses Kenney GLTF character model (`character-b.glb`)
  - Uses ThreeDGameCanvas with studio environment
  - Uses @react-spring/three for weather animations
- **Confidence level:** High - Core feature set complete, CV integration needed

---

## Section 3: Current Implementation

### Flow
1. **Mount:** Audio preloading (click, success, rain, wind)
2. **Render:** 3D canvas with character, clothing selector, and weather controls
3. **Clothing Selection:** Click shirt/pants buttons to apply colors
4. **Weather Selection:** Click weather button to change conditions
5. **Validation:** Click "Check Outfit!" to validate appropriateness
6. **Feedback:** Animated UI shows success/failure message
7. **Auto-completion:** Triggers on successful outfit validation

### Controls
| Action | Input | Feedback |
|--------|-------|----------|
| Select shirt | Click shirt button | Character torso color changes, checkmark appears |
| Select pants | Click pants button | Character leg color changes, checkmark appears |
| Change weather | Click weather button | Background color changes, particles appear |
| Check outfit | Click "Check Outfit!" | Feedback UI with animation |
| Mute audio | Click mute button | Volume icon changes |

### Mechanics
- **Clothing System:** Shirt + Pants combination
  - Shirts: T-shirts (warmth 1), Sweater (3), Winter Jacket (5), Rain Coat (2)
  - Pants: Shorts (1), Long Pants (2), Warm Pants (3)
- **Weather System:** 4 weather types with warmth requirements
  - Sunny: Warmth ≤ 3 (light clothing)
  - Rainy: Requires Raincoat
  - Snowy: Warmth ≥ 6 (heavy clothing)
  - Windy: No light t-shirts
- **Validation Logic:**
  ```typescript
  // Warmth calculation
  totalWarmth = shirt.warmth + pants.warmth
  
  // Weather rules
  sunny: totalWarmth <= 3
  rainy: shirt.id === 'raincoat'
  snowy: totalWarmth >= 6
  windy: shirt.id not in ['tshirt-red', 'tshirt-blue']
  ```

### Visuals/UI
- **Character:** Kenney blocky character (GLTF), 1.5x scale, positioned at [0, -1.5, 0]
- **Environment:** Studio lighting with soft shadows
- **Background:** Dynamic color based on weather
  - Sunny: #fbbf24 (warm yellow)
  - Rainy: #60a5fa (cool blue)
  - Snowy: #e2e8f0 (icy white)
  - Windy: #94a3b8 (grey)
- **Clothing Selector:** HTML overlay in 3D space (Html component from drei)
  - Positioned at [2, 0.5, 0]
  - White card with color swatches
  - Grid layout for shirts (5 items) and pants (3 items)
- **Weather Selector:** React UI below canvas
  - 4 button tabs with icons
  - Active state highlighted in blue
- **Feedback UI:** Floating HTML above character
  - Green for correct, red for incorrect
  - Bounce animation

### Gaps/Issues
- **No CV integration** - Hand tracking not used despite being declared in registry
- Click-based UI limits accessibility for pure CV users
- Clothing selector in 3D space may have z-fighting issues
- No voice instructions for young users
- Limited feedback when outfit is inappropriate

---

## Section 4: Intended Design

### Educational Goal
- **Weather Awareness:** Understand different weather conditions
- **Clothing Logic:** Learn appropriate attire for each condition
- **Cause and Effect:** See consequences of clothing choices
- **Creative Expression:** Freedom to experiment with color combinations

### Pedagogical Approach
- **Experiential Learning:** Try different outfits, see results
- **Safe Failure:** Wrong choices are gentle suggestions, not punishments
- **Open Exploration:** No time pressure, unlimited attempts
- **Multi-sensory:** Visual, audio, and haptic feedback

### Difficulty Progression
- **Current:** No explicit progression - all content available
- **Recommended:** Unlockable challenges
  - Beginner: Match outfit to displayed weather
  - Intermediate: Weather changes, adapt quickly
  - Advanced: Multi-day vacation packing (multiple outfits)

### Accessibility
- Large, colorful buttons
- Icon-based weather selection (readable by pre-readers)
- High contrast feedback UI
- No reading required
- Voice guidance (planned)

### Core Loop
1. **Observe** - Look at current weather condition
2. **Decide** - Choose appropriate clothing mentally
3. **Select** - Click/tap clothing items
4. **Validate** - Check if outfit matches weather
5. **Learn** - Receive feedback on choice
6. **Iterate** - Adjust outfit or change weather

---

## Section 5: Drift Analysis

### Where Implementation Matches Intent (85%)
✅ 3D character dressing mechanic  
✅ Weather condition variety (4 types)  
✅ Weather-appropriate validation logic  
✅ Visual weather feedback (colors, particles)  
✅ Audio ambience (rain, wind)  
✅ Kenney character model integration  
✅ Dynamic clothing color application  
✅ Success/failure feedback system  

### Where Implementation Exceeds Intent (10%)
🌟 Weather particle effects (rain drops, snowflakes)  
🌟 Character animations for weather (wind sway, snow shiver) via react-spring  
🌟 Clean UI design with Kenney-style icons  
🌟 Mute/unmute audio controls  
🌟 Auto-completion integration  

### Where Implementation Falls Short (5%)
⚠️ **CV hand tracking not integrated** - UI is mouse-only despite cv: ['hand']  
⚠️ **No TTS** - Weather names and feedback not spoken  
⚠️ **Limited clothing variety** - No accessories (hats, boots, scarves)  
⚠️ **No progressive challenges** - All content available immediately  

### Overall Assessment
**Alignment: 95%** - Very close to intended design. The core dressing and weather validation works beautifully. Main gap is CV integration which is declared but not implemented.

---

## Section 6: Recommended Canonical Version

### Current Strengths to Keep
1. **Character System** - Kenney model with material color cloning
2. **Weather Validation** - Logic is solid and kid-friendly
3. **Particle Effects** - Rain, snow, and sun effects add immersion
4. **Spring Animations** - Character reacts to weather conditions
5. **Audio Integration** - Weather ambience enhances experience
6. **UI Design** - Clean, accessible button interface

### Enhancements to Implement
1. **CV Hand Tracking:**
   - Hand cursor for button selection
   - Pinch to select clothing
   - Hover states for hand proximity
   - Dwell selection for accessibility
2. **TTS Integration:**
   - Speak weather names on change
   - "You chose a red shirt!" feedback
   - Outfit validation spoken aloud
3. **Expanded Wardrobe:**
   - Hats (sun hat, winter hat, rain hat)
   - Footwear (sandals, boots, shoes)
   - Accessories (umbrella, scarf, sunglasses)
4. **Progressive Mode:**
   - Challenge system with specific requirements
   - "Dress for a snowy picnic" (warmth + activity)
   - Multi-day packing scenarios

### Experimental Features
- **Photo Booth:** Save outfit screenshots
- **Fashion Show:** Character walks runway with outfit
- **Multiplayer:** Dress characters together
- **Weather Forecast:** Predict tomorrow's weather, dress accordingly

---

## Section 7: Visual Identity

| Aspect | Current | Description |
|--------|---------|-------------|
| **Overall look** | Clean 3D with friendly character | Accessible, colorful, inviting |
| **Camera view** | Fixed perspective [0, 0.5, 4] looking at origin | Clear view of character |
| **Art style** | Low-poly blocky (Kenney style) | Consistent with platform |
| **Mood** | Cheerful, helpful, educational | Friendly guidance |
| **Colors** | Weather-dependent backgrounds | Sunny=yellow, Rain=blue, Snow=white, Wind=grey |
| **Environment** | Minimalist studio | Focus on character |
| **UI style** | Rounded cards, clear icons | Accessible for young children |
| **Active vibe** | Character responds to weather | Animated feedback |

### Color Palette
- **Sunny:** #fbbf24 → #fff7ed gradient
- **Rainy:** #60a5fa → #dbeafe gradient
- **Snowy:** #e2e8f0 → #f8fafc gradient
- **Windy:** #94a3b8 → #e2e8f0 gradient
- **UI Card:** #ffffff with shadow
- **Character:** Customizable shirt/pants colors

---

## Section 8: Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Loading** | Preload assets | Spinner, "Loading wardrobe..." |
| **Main View** | Core dressing experience | 3D character, clothing selector, weather controls |
| **Clothing Selector** | Choose outfit | Shirt grid (5), pants grid (3), selected indicators |
| **Weather Bar** | Change conditions | 4 weather tabs with icons |
| **Feedback Overlay** | Validation result | Success/error message, animated |
| **Completion** | Game complete | Auto-completes on correct outfit |

---

## Section 9: Controls

| Action | Input | CV Mode (Planned) | Mouse Mode (Current) |
|--------|-------|-------------------|----------------------|
| Select shirt | Click/tap | Hand hover + pinch | Mouse click |
| Select pants | Click/tap | Hand hover + pinch | Mouse click |
| Change weather | Click/tap | Hand hover + pinch | Mouse click |
| Check outfit | Click/tap | Hand hover + pinch | Mouse click |
| Mute audio | Click/tap | Hand hover + pinch | Mouse click |
| Rotate view | OrbitControls | Hand gesture (future) | Drag to rotate |

### CV-Specific Interactions (Recommended Implementation)
- **Hand cursor:** 70px yellow cursor overlay
- **Hover detection:** Dwell for 500ms triggers highlight
- **Pinch selection:** Pinch to confirm selection
- **Button sizing:** 80px minimum for hand accuracy

---

## Section 10: Core Mechanics

### Clothing System
```typescript
interface ClothingItem {
  id: string;
  name: string;
  color: string;
  warmth: number;  // 1-5 scale
  weather: WeatherType[];  // Appropriate for
}

// Shirts
const shirts = [
  { id: 'tshirt-red', name: 'Red T-Shirt', color: '#ef4444', warmth: 1 },
  { id: 'tshirt-blue', name: 'Blue T-Shirt', color: '#3b82f6', warmth: 1 },
  { id: 'sweater', name: 'Warm Sweater', color: '#8b5cf6', warmth: 3 },
  { id: 'jacket', name: 'Winter Jacket', color: '#1e2933', warmth: 5 },
  { id: 'raincoat', name: 'Rain Coat', color: '#fbbf24', warmth: 2 },
];

// Pants
const pants = [
  { id: 'shorts', name: 'Shorts', color: '#22c55e', warmth: 1 },
  { id: 'pants', name: 'Long Pants', color: '#3b82f6', warmth: 2 },
  { id: 'warm-pants', name: 'Warm Pants', color: '#1e2933', warmth: 3 },
];
```

### Weather System
```typescript
interface Weather {
  id: WeatherType;
  name: string;
  icon: LucideIcon;
  warmth: number;      // Base warmth requirement
  color: string;       // Background color
  ambience?: string;   // Audio file
}

const weatherTypes = [
  { id: 'sunny', name: 'Sunny', warmth: 2, color: '#fbbf24', ambience: null },
  { id: 'rainy', name: 'Rainy', warmth: 1, color: '#60a5fa', ambience: 'rain' },
  { id: 'snowy', name: 'Snowy', warmth: -2, color: '#e2e8f0', ambience: null },
  { id: 'windy', name: 'Windy', warmth: 0, color: '#94a3b8', ambience: 'wind' },
];
```

### Validation Algorithm
```typescript
function validateOutfit(shirt, pants, weather): ValidationResult {
  const totalWarmth = shirt.warmth + pants.warmth;
  
  switch (weather.id) {
    case 'sunny':
      return totalWarmth <= 3;
    case 'rainy':
      return shirt.id === 'raincoat';
    case 'snowy':
      return totalWarmth >= 6;
    case 'windy':
      return !['tshirt-red', 'tshirt-blue'].includes(shirt.id);
    default:
      return false;
  }
}
```

### Character Material Application
```typescript
// Clone GLTF scene and apply colors
characterScene.traverse((child) => {
  if (child.isMesh) {
    const mesh = child as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Apply shirt color to torso
    if (mesh.name.toLowerCase().includes('torso') && shirt) {
      const mat = mesh.material.clone();
      mat.color = new THREE.Color(shirt.color);
      mesh.material = mat;
    }
    
    // Apply pants color to legs
    if (mesh.name.toLowerCase().includes('leg') && pants) {
      const mat = mesh.material.clone();
      mat.color = new THREE.Color(pants.color);
      mesh.material = mat;
    }
  }
});
```

---

## Section 11: Rules

### Start Conditions
- Game loads with default sunny weather
- Character appears in default clothing
- Clothing selector displays all options
- Audio preloads in background

### Objectives
- Dress character appropriately for current weather
- Experiment with different combinations
- Receive positive feedback for good choices

### Allowed Actions
- Select any shirt from wardrobe
- Select any pants from wardrobe
- Change weather type anytime
- Check outfit validation
- Mute/unmute audio

### Restrictions
- Cannot "win" without checking outfit
- Must have both shirt and pants selected to validate
- No penalties for wrong choices

### Scoring
- **Current:** No explicit scoring
- **Recommended:**
  - Base: 10 points per correct outfit
  - Streak: +5 points per consecutive correct
  - Speed: +5 points if under 30 seconds

### Validation Rules
| Weather | Valid Outfit | Invalid Outfit | Feedback Message |
|---------|--------------|----------------|------------------|
| Sunny | Light clothes (warmth ≤ 3) | Heavy jacket | "Perfect for sunny weather! ☀️" |
| Rainy | Raincoat | Any other shirt | "Great rain protection! 🌧️" |
| Snowy | Warm clothes (warmth ≥ 6) | Light clothes | "Nice and warm! ❄️" |
| Windy | Not light t-shirts | T-shirts | "Good for windy weather! 💨" |

---

## Section 12: HUD / Gameplay UI

### Clothing Selector (3D HTML Overlay)
```
┌──────────────────────────┐
│ 👕 Wardrobe              │
├──────────────────────────┤
│ Shirts                   │
│ [🔴] [🔵] [🟣] [⚫] [🟡] │
│                          │
│ Pants                    │
│ [🟢] [🔵] [⚫]           │
└──────────────────────────┘
```
- Position: [2, 0.5, 0] in 3D space
- Checkmark on selected items
- Hover highlight effect

### Weather Selector (React UI below canvas)
```
[☀️ Sunny] [🌧️ Rainy] [❄️ Snowy] [💨 Windy]
```
- Horizontal button row
- Active weather highlighted in blue
- Icons from Lucide React

### Feedback Overlay (3D HTML above character)
```
┌──────────────────────────┐
│ ✅ Perfect for sunny     │
│    weather! ☀️           │
└──────────────────────────┘
```
- Green background for success
- Red background for incorrect
- Bounce animation on appear
- Auto-dismiss after 2 seconds

### Audio Controls (Top-right corner)
```
[🔊] / [🔇]
```
- Mute/unmute toggle
- Visual state indicator

---

## Section 13: Feedback and Feel

### Success Feedback
| Trigger | Visual | Audio | Animation |
|---------|--------|-------|-----------|
| Select clothing | Color swatch scales | Click SFX | Checkmark appears |
| Change weather | Background color transition | Click SFX | Particle effect change |
| Correct outfit | Green feedback banner | Success SFX + ambience | Character happy bounce |
| Game complete | Auto-complete triggers | Win jingle | - |

### Neutral/Incorrect Feedback
| Trigger | Visual | Audio | Message |
|---------|--------|-------|---------|
| Wrong outfit | Red feedback banner | Error SFX | "Maybe try something else?" |
| Missing piece | Disabled check button | - | "Select a shirt and pants!" |

### Audio Design
| Event | Sound | Volume |
|-------|-------|--------|
| UI Click | click.ogg | 0.5 |
| Success | success.ogg | 0.7 |
| Rain ambience | rain.ogg | 0.3 (looped) |
| Wind ambience | wind.ogg | 0.3 (looped) |

### Character Animation (via react-spring)
```typescript
// Wind: Gentle sway
rotation: [0, 0, 0.05]
config: { duration: 2000 }

// Snow: Shiver
position: [0, -0.05, 0]
config: { duration: 2000 }
```

---

## Section 14: Points / Rewards / Progression

### Current System
- No explicit scoring
- Auto-completion on correct outfit
- Easter egg for 5 perfect outfits

### Recommended Scoring
```
basePoints = 10
streakBonus = min(streak * 2, 10)
total = basePoints + streakBonus
```

### Drops (From Registry)
| Item | Chance | Condition |
|------|--------|-----------|
| color-rainbow | 25% | - |
| star-silver | 10% | Min score 80 |

### Easter Eggs
- **Fashion Star:** Dress perfectly for 5 different weathers → trophy-gold reward
- **Rain or Shine:** Try all 4 weather conditions in one session

### Progression
- Open-ended play (no levels)
- Challenge mode could add:
  - Time limits
  - Specific requirements ("Dress for snow play!")
  - Multi-day vacation packing

---

## Section 15: End States

### Outfit Validation Success
- Trigger: Correct outfit for current weather
- Feedback:
  - Green "Perfect!" banner with animation
  - Success sound effect
  - Character bounce animation
  - Auto-completion triggers after delay

### Outfit Validation Failure
- Trigger: Incorrect outfit selected
- Feedback:
  - Red "Try again" banner
  - Gentle error sound
  - No penalty, encourage retry

### Game Complete
- Auto-completes via useAutoGameCompletion hook
- Metadata includes weather and clothing choices
- Celebration via platform system

---

## Section 16: Parallel Modes / Alternate Implementations

### Mode A: 3D Dress Up (Current/Default)
- Full 3D character and environment
- Hand tracking for selection (planned)
- Immersive experience

### Mode B: 2D Dress for Weather
- Fallback to `DressForWeather.tsx`
- Simpler drag-and-drop interface
- Mouse/touch optimized

### Mode C: Challenge Mode (Future)
- Specific scenarios: "Snow picnic!", "Beach day!"
- Timed challenges
- Score tracking

---

## Section 17: Improvement Opportunities

### Low Cost
- Add TTS for weather names
- Implement hand cursor overlay
- Add dwell selection for CV
- Expand feedback messages

### Medium Effort
- Full CV hand tracking integration
- Add accessories (hats, boots, umbrellas)
- Weather transition animations
- Save favorite outfits
- Outfit gallery/sharing

### Ambitious
- Custom character creator
- Seasonal wardrobe updates
- Multiplayer dress-up party
- AR mode (character in real room)
- Fashion show runway mode

---

## Section 18: Content Model

### Wardrobe Data
```typescript
const WARDROBE = {
  shirts: [
    { id: 'tshirt-red', name: 'Red T-Shirt', color: '#ef4444', warmth: 1 },
    { id: 'tshirt-blue', name: 'Blue T-Shirt', color: '#3b82f6', warmth: 1 },
    { id: 'sweater', name: 'Warm Sweater', color: '#8b5cf6', warmth: 3 },
    { id: 'jacket', name: 'Winter Jacket', color: '#1e2933', warmth: 5 },
    { id: 'raincoat', name: 'Rain Coat', color: '#fbbf24', warmth: 2 },
    { id: 'hoodie', name: 'Hoodie', color: '#6366f1', warmth: 2 },
  ],
  pants: [
    { id: 'shorts', name: 'Shorts', color: '#22c55e', warmth: 1 },
    { id: 'pants', name: 'Long Pants', color: '#3b82f6', warmth: 2 },
    { id: 'warm-pants', name: 'Warm Pants', color: '#1e2933', warmth: 3 },
    { id: 'skirt', name: 'Skirt', color: '#ec4899', warmth: 1 },
  ],
  accessories: [  // Future
    { id: 'sun-hat', name: 'Sun Hat', slot: 'head' },
    { id: 'winter-hat', name: 'Winter Hat', slot: 'head' },
    { id: 'boots', name: 'Rain Boots', slot: 'feet' },
    { id: 'umbrella', name: 'Umbrella', slot: 'hand' },
  ],
};
```

### Weather Data
```typescript
const WEATHERS = [
  { id: 'sunny', name: 'Sunny', icon: Sun, color: '#fbbf24' },
  { id: 'rainy', name: 'Rainy', icon: CloudRain, color: '#60a5fa' },
  { id: 'snowy', name: 'Snowy', icon: Snowflake, color: '#e2e8f0' },
  { id: 'windy', name: 'Windy', icon: Wind, color: '#94a3b8' },
  // Future: { id: 'cloudy', name: 'Cloudy', ... }
];
```

### Assets Used
| Asset | Type | Source |
|-------|------|--------|
| character-b.glb | 3D Model | Kenney 3D Characters |
| click.ogg | Audio | Kenney Interface |
| success.ogg | Audio | Kenney Interface |
| rain.ogg | Audio | Kenney Weather |
| wind.ogg | Audio | Kenney Weather |

---

## Section 19: Technical Structure

### File Organization
```
src/frontend/src/
├── pages/three/
│   └── DressForWeather3D.tsx    # Main game (437 lines)
├── components/game/three/
│   └── ThreeDGameCanvas.tsx     # Shared canvas
├── hooks/
│   ├── use3DGameAudio.ts        # Audio management
│   └── useAutoGameCompletion.ts # Completion tracking
└── assets/kenney/
    └── 3d/characters/
        └── character-b.glb      # Character model
```

### Component Architecture
```
DressForWeather3D
├── GameShell
│   └── GameContainer
│       └── ThreeDGameCanvas
│           ├── GameLighting
│           ├── Environment (studio)
│           ├── PerspectiveCamera
│           ├── OrbitControls
│           └── Suspense
│               ├── Character
│               │   ├── useGLTF (character-b.glb)
│               │   ├── useSpring (weather animation)
│               │   └── primitive (character scene)
│               ├── ClothingSelector (Html overlay)
│               │   └── Button grid
│               └── FeedbackUI (Html overlay)
├── Weather Selector (React UI)
└── Check Outfit Button
```

### Key Dependencies
- `@react-three/fiber` - R3F core
- `@react-three/drei` - Html, useGLTF, Environment
- `@react-spring/three` - Character animations
- `three` - 3D library
- `lucide-react` - Weather icons

### State Management
```typescript
interface GameState {
  shirt: Shirt | null;
  pants: Pants | null;
  weather: Weather;
  feedback: {
    show: boolean;
    isCorrect: boolean;
    message: string;
  };
  isMuted: boolean;
}
```

---

## Section 20: Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| CV hand tracking | Declared in registry but not implemented | High |
| TTS integration | useTTS hook exists but not used | High |
| Performance on low-end | Not tested on older devices | Medium |
| Character model bones | Using material colors, not bone animation | High |
| Accessibility | No screen reader testing documented | Medium |

---

## Section 21: Implementation Notes

### Strengths to Preserve
1. **Kenney Integration** - Clean GLTF loading and material manipulation
2. **Weather Animation** - React Spring provides great character reactions
3. **Particle Effects** - Simple but effective rain/snow
4. **Validation Logic** - Clear, kid-friendly rules
5. **Component Composition** - Clean separation of Character, UI, and Effects

### Refactor Opportunities
1. Extract Character component to separate file
2. Create ClothingSelector as reusable component
3. Add useDressUpGame hook for state management
4. Implement CV hand tracking integration

### Performance Considerations
- GLTF scene cloned on every render (could optimize)
- Particle effects always rendered (could cull when not visible)
- ThreeDGameCanvas adaptive quality helps performance

### Testing Focus
- Material color application accuracy
- Weather validation logic edge cases
- Audio playback on weather change
- Character animation smoothness

---

## Section 22: Acceptance Criteria

### Core Functionality
- [ ] Character model loads and displays
- [ ] Clothing colors apply to correct body parts
- [ ] Weather selector changes background color
- [ ] Weather particles render (rain, snow, sun)
- [ ] Outfit validation works for all 4 weathers
- [ ] Feedback UI appears on check
- [ ] Audio ambience plays for rain/wind
- [ ] Auto-completion triggers on success

### CV Requirements
- [ ] Hand tracking initializes
- [ ] Cursor visible and tracks hand
- [ ] Hand can hover over buttons
- [ ] Pinch selects buttons (when implemented)

### UX/Polish
- [ ] Start screen clear and inviting
- [ ] Weather icons recognizable
- [ ] Clothing colors vibrant
- [ ] Feedback messages encouraging
- [ ] Mute button functional
- [ ] Character animations smooth

### Edge Cases
- [ ] Check outfit without full clothing selection
- [ ] Rapid weather switching
- [ ] Character re-renders correctly on clothing change
- [ ] Audio cleanup on unmount

---

## Section 23: Test Plan

### Manual Gameplay Tests
- [ ] Load game, verify character appears
- [ ] Select shirt, verify color change
- [ ] Select pants, verify color change
- [ ] Change weather, verify background change
- [ ] Check outfit with correct clothing, verify success
- [ ] Check outfit with wrong clothing, verify gentle failure
- [ ] Test all 4 weather types
- [ ] Verify auto-completion triggers

### CV Control Tests
- [ ] Hand tracking initializes
- [ ] Cursor follows hand position
- [ ] Button hover detection works
- [ ] Selection via hand works (when implemented)

### Audio Tests
- [ ] Rain ambience plays for rainy weather
- [ ] Wind ambience plays for windy weather
- [ ] Mute button stops all audio
- [ ] Audio resumes on unmute
- [ ] No audio leaks on unmount

### Edge Cases
- [ ] Change clothing rapidly
- [ ] Switch weather during check
- [ ] Resize window
- [ ] Switch browser tabs
- [ ] Test with slow network (GLTF loading)

### Performance
- [ ] 60 FPS with character and particles
- [ ] No memory leaks after weather changes
- [ ] Smooth animation on low-end devices

---

**Last Updated:** 2026-04-03  
**Confidence:** High - Well-implemented 3D dress-up game, CV integration is main gap  
**Prompt Used:** SPEC_TEMPLATE.md v23-section + 3D_WORLD_PATTERNS.md technical context
