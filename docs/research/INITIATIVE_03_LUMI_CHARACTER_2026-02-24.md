# Initiative 3: Lumi Companion Character — Research & Implementation Plan

**Date**: 2026-02-24  
**Status**: RESEARCH COMPLETE  
**Priority**: P0  
**Estimated Effort**: 2-3 weeks (8 story points)  

---

## Executive Summary

**Current State**: App has Pip (main mascot) only. No story, multiplayer feel, or achievement recognition beyond percentages.

**Target State**: Introduce Lumi (Pip's companion) to:
- Build story momentum ("Help Pip and Lumi on their learning adventure")
- Celebrate achievements (Lumi appears at unlocks, rewards)
- Introduce multiplayer future (Lumi can be another child)
- Create emotional investment (kids care about Lumi's progress too)

**Key dependencies**: 
- Initiative 1 (Visual Transformation) for Lumi visual design
- Sound Infrastructure ready (Lumi needs voice)

---

## Part 1: Lumi Character Definition

### Visual Design

**Physical Characteristics**:
- **Type**: Cloud or star creature (different from Pip, complementary)
- **Size**: Similar to Pip (25-30% game canvas)
- **Color**: Hot pink (#FF69B4) with soft white core
- **Style**: Soft, rounded, approachable (not threatening)
- **Distinguishing marks**: Sparkles, gentle glow effect

**How Lumi differs from Pip**:
| Aspect | Pip | Lumi |
|--------|-----|------|
| Role | Teacher/Guide | Friend/Cheerleader |
| Color | Warm orange | Hot pink |
| Animation | Encouraging, patient | Excited, energetic |
| Voice | Calm, instructional | Happy, enthusiastic |
| Appears in | All games (always present) | Key moments (achievements) |
| Behavior | Shows what to do | Celebrates what you did |

**Animation States** (8-10):
1. Idle (gentle floating)
2. Excited (bouncing)
3. Celebrating (spinning, sparkles)
4. Cheering (jumping with joy)
5. Peeking (reveals from corner)
6. Hiding (disappears with effect)
7. Proud (chest puffed out)
8. Inquisitive (question mark appears)
9. Supportive (thumbs up motion)
10. Surprise (sudden appearance with sparkle)

---

## Part 2: Lumi Story Arc

### Introduction (First Visit)

**Scene 1: Home Page**
```
[Pip is visible, saying "Welcome!"]
[Lumi peeks from right side, saying "Hi! I'm Lumi!"]
[Pip introduces: "Lumi helps me cheer you on!"]
[Lumi: "Let's learn together!"]
```

**Duration**: 3-5 seconds, non-blocking (kids can skip)

### Appearance Mechanics

**Trigger 1: Letter Unlock** (When child unlocks a new letter)
```
[Game ends successfully]
[Pip celebrates]
[Lumi appears with "You unlocked a new letter! I'm so proud!"]
[Show next letter being added to journey]
```

**Trigger 2: Batch Unlock** (When N letters unlocked → unlock new game)
```
[5th letter unlocked → Freeze Dance game unlocks]
[Lumi excitement: "Wow! You unlocked a NEW GAME!"]
[Pip dances with Lumi]
```

**Trigger 3: Milestone Achievement** (Every 5 games won, 10 letters, etc.)
```
[User wins 5th game]
[Lumi appears with giant "5⭐ ACHIEVEMENT UNLOCKED!"]
[Pip + Lumi dance together]
```

**Trigger 4: Daily Streak** (If played 3+ days in a row)
```
[Login on day 3+]
[Lumi says "You're on a 3-day streak! Amazing!"]
[Show streak counter with Lumi]
```

**Trigger 5: Parent/Caregiver Mode Event** (Coming from Initiative: Backend Monitoring)
```
[Parent unlocks achievement for child]
[Lumi: "Your parent is proud of you! 🎉"]
[Show parent message]
```

---

## Part 3: Story Progression

### Story Beats (Unfolding Over 8-10 Weeks)

**Week 1-2**: Introduction
- Lumi meets child
- Establish that Pip teaches, Lumi cheerleads
- First 5 letters unlocked

**Week 3**: First Game Unlock
- Achieved milestone (5 letters)
- Lumi celebrates new game discovery
- Pip + Lumi dance together

**Week 4-5**: Momentum Building
- Unlock 2nd game
- Lumi says "You're a letter expert!"
- New achievement: "10 Letter Master"

**Week 6**: Emotional Peak
- Unlock special story scene
- Lumi + Pip picture book moment
- Parent message: "I'm proud of how hard you're trying!"

**Week 7-8**: New Companion?
- Hint at multiplayer feature
- Lumi: "Soon, YOU can be the teacher for a friend!"
- Optional: Setup for Lumi as friend's avatar

### Visual Story Elements

**Story Scenes** (5-10 key moments):
1. **Introduction**: Lumi emerges from clouds, meets child
2. **First Unlock**: Lumi celebrates with confetti
3. **First Game**: Lumi and Pip play together in mini scene
4. **Milestone**: Lumi painting/drawing the child's name
5. **Parent Recognition**: Letter scene with caregiver voice
6. **Emotional Peak**: Pip + Lumi hugging child avatar
7. **Future Hint**: Lumi pointing at multiscreen showing "Will you bring your friends?"
8. **Looping Celebration**: Daily achievement summary with Lumi

**Visual Style**: Illustration-based, 2D flat design, soft shadows (consistent with Initiative 1)

---

## Part 4: Voice & Sound Design

### Lumi Voice Characteristics

**Voice parameters** (for Kokoro TTS or custom VO):
- **Age**: 8-12 years old girl (relatable peer, not adult)
- **Tone**: Enthusiastic, warm, encouraging
- **Speed**: Slightly faster than Pip (excitement)
- **Pitch**: Higher than Pip (slightly, but not annoying)
- **Accent**: Clear English, option for other languages

### Sample Voice Lines

**Introduction**:
- "Hi! I'm Lumi! I'm so excited to meet you!"
- "I'm Pip's best friend, and I can't wait to see you learn!"

**Celebrating**:
- "You did it! That was amazing!"
- "Wow, wow, WOW! You're getting so good!"
- "I'm so proud of you!"

**Encouragement**:
- "You can do this! I believe in you!"
- "Try again! It's okay!"
- "You're getting closer!"

**Achievements**:
- "You unlocked a new game! Let's try it!"
- "10 letters! You're a superstar!"
- "I'm marking this day down — you were GREAT!"

**Story Moments**:
- "Do you know what? I think we're going to be best friends."
- "You're teaching me so much about learning!"
- "Can we do this together tomorrow too?"

### Voice Recording Plan

**Option 1: Professional VO** (1-2 weeks, $1-3K)
- Hire child voice actor (8-12 years old)
- Record 30-40 lines in studio
- High quality, consistent delivery
- All languages covered via VO actors

**Option 2: TTS via Kokoro** (Existing, 1 hour setup)
- No cost, instant generation
- Slight robotic feel, but acceptable
- Easy to update lines
- Multi-language support immediate

**Recommendation**: Start with Option 2 (Kokoro TTS) for MVP speed, upgrade to Option 1 (VO) in follow-up phase if budget allows.

---

## Part 5: Technical Implementation

### Component Structure

**File**: `src/frontend/src/components/Lumi/LumiCharacter.tsx` (new)

```typescript
interface LumiProps {
  state: 'idle' | 'excited' | 'celebrating' | 'peeking' | 'hidden';
  voiceLine?: string;
  position?: 'left' | 'right' | 'center';
  scale?: number; // 1 = full size, 0.5 = half
}

export function LumiCharacter(props: LumiProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (props.state !== 'hidden' && props.voiceLine) {
      // Play voice line
      speakLine(props.voiceLine);
      setIsAnimating(true);
    }
  }, [props.state, props.voiceLine]);
  
  return (
    <div className="lumi-container">
      {/* SVG or PNG rendering of Lumi */}
      <LumiSVG state={props.state} isAnimating={isAnimating} />
      
      {/* Voice bubble if speaking */}
      {props.voiceLine && (
        <VoiceBubble text={props.voiceLine} duration={3000} />
      )}
    </div>
  );
}
```

### Integration Points

**1. Home Page**
```typescript
// In Home.tsx
const [showLumiIntro, setShowLumiIntro] = useState(!localStorage.hasSeenLumiIntro);

return (
  <>
    {showLumiIntro && (
      <LumiIntroScene onComplete={() => setShowLumiIntro(false)} />
    )}
    {/* Rest of home page */}
  </>
);
```

**2. Game Pages** (on achievement unlock)
```typescript
// In any game page
if (achievementUnlocked) {
  return <LumiAchievementScene achievement={achievement} />;
}
```

**3. LetterJourney** (when letter unlocked)
```typescript
// In LetterJourney.tsx
const onLetterUnlocked = (letter) => {
  setShouldShowLumiCelebration(true);
  // Auto-hide after 3 seconds
  setTimeout(() => setShouldShowLumiCelebration(false), 3000);
};
```

### Animation Library

**File**: `src/frontend/src/animations/lumi.animations.ts` (new)

```typescript
export const lumiAnimations = {
  idle: {
    duration: 3000,
    frames: [
      { transform: 'translateY(0px)', opacity: 1 },
      { transform: 'translateY(-5px)', opacity: 1 }, // Gentle float up
      { transform: 'translateY(0px)', opacity: 1 },
    ],
    easing: 'ease-in-out',
  },
  excited: {
    duration: 600,
    frames: [
      { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      { transform: 'scale(1.1) rotate(-5deg)', opacity: 1 },
      { transform: 'scale(1) rotate(0deg)', opacity: 1 },
    ],
  },
  celebrating: {
    duration: 1000,
    frames: [
      { transform: 'scale(1) rotate(0deg) translateY(0px)' },
      { transform: 'scale(1.15) rotate(360deg) translateY(-20px)' },
      { transform: 'scale(1) rotate(0deg) translateY(0px)' },
    ],
    // Add sparkle particles
  },
  peeking: {
    duration: 500,
    frames: [
      { transform: 'translateX(200px)', opacity: 0 },
      { transform: 'translateX(0px)', opacity: 1 },
    ],
  },
};
```

### Data Structure for Achievements

**File**: `src/frontend/src/types/achievements.ts` (new)

```typescript
interface Achievement {
  id: string;
  type: 'letter_unlock' | 'game_unlock' | 'milestone' | 'streak';
  title: string;
  lumiLine: string; // What Lumi says
  icon: string; // Emoji
  timestamp: number;
  showLumi: boolean; // Should Lumi appear?
}

interface LumiAppearance {
  achievementId: string;
  state: 'peeking' | 'celebrating' | 'cheering';
  duration: number; // ms to show
  voiceLine: string;
}
```

**Store tracking**:
```typescript
// In settingsStore or new lumiStore.ts
const lumiEvents = useStore(state => state.lumiEvents); // Array of achievements
const recordAchievement = (achievement: Achievement) => {
  // Save to store
  // Trigger Lumi appearance
  // Log for analytics
};
```

---

## Part 6: Implementation Phases

### Phase 1: Character Design & Assets (Days 1-5)

**Goal**: Lumi visual design finalized, SVG created

**Tasks**:
1. Design Lumi character (color, shape, style)
2. Create Lumi SVG with 10 states (idle, excited, celebrating, etc.)
3. Design voice bubble component (appears above Lumi)
4. Create story scene layouts (introduction, celebration, etc.)
5. Asset review (100% design sign-off)

**Deliverables**:
- Lumi SVG file (`assets/characters/lumi.svg`)
- Design specification doc (`docs/LUMI_DESIGN_SPEC.md`)
- Tailwind CSS classes for Lumi styling

**Acceptance**:
- [ ] Lumi renders without errors
- [ ] All 10 animation states visual complete
- [ ] Color matches target #FF69B4
- [ ] Design team approves

### Phase 2: Component Implementation (Days 6-10)

**Goal**: LumiCharacter component working, animations smooth

**Tasks**:
1. Create `LumiCharacter.tsx` component
2. Implement animation states (CSS or Framer Motion)
3. Create voice line system (TTS via Kokoro)
4. Build voice bubble component
5. Create story scenes (introduction, achievement)
6. Test rendering on multiple devices

**Acceptance**:
- [ ] Component renders without TypeScript errors
- [ ] Animations are smooth (60fps)
- [ ] Voice lines play correctly
- [ ] No console errors on render

### Phase 3: Integration with Achievements (Days 11-15)

**Goal**: Lumi appears at key moments (unlocks, milestones)

**Tasks**:
1. Create achievements data structure
2. Track achievement triggers in games
3. Trigger Lumi appearance on letter unlock
4. Trigger Lumi appearance on game unlock
5. Trigger Lumi appearance on milestone (5 games, 10 letters)
6. Test all trigger points

**Acceptance**:
- [ ] Letter unlock triggers Lumi
- [ ] Game unlock triggers Lumi
- [ ] Milestones trigger Lumi
- [ ] Lumi disappears after duration
- [ ] No achievement duplication

### Phase 4: Story Progression (Days 16-20)

**Goal**: Lumi story unfolds over time, gets richer

**Tasks**:
1. Implement story beats (Week 1-2 intro, Week 3 game unlock, etc.)
2. Create daily streak tracking
3. Create parent message system (for Initiative 4)
4. Create story scene triggers
5. Playtest story progression with users

**Acceptance**:
- [ ] Story beats appear at right times
- [ ] Lumi voice lines vary (not repetitive)
- [ ] Parent messages integrate
- [ ] No breaking changes to existing features

### Phase 5: Voice Recording & Polish (Days 21-25)

**Goal**: Lumi voice feels alive, all lines recorded

**Tasks**:
1. Finalize all 30-40 voice lines
2. Record/generate all lines via Kokoro TTS
3. Test audio quality, volume balance
4. Add voice line variations (3-5 versions of each line)
5. Integrate with Lumi animations (lip-sync)
6. Final playtest with kids

**Acceptance**:
- [ ] All voice lines recorded clearly
- [ ] Volume normalized across lines
- [ ] Audio doesn't conflict with game sounds
- [ ] Children engage emotionally with Lumi
- [ ] No perceptible delays in voice playback

---

## Part 7: Files Created/Modified

**New files** (10):
- `src/frontend/src/components/Lumi/LumiCharacter.tsx`
- `src/frontend/src/components/Lumi/LumiIntroScene.tsx`
- `src/frontend/src/components/Lumi/LumiAchievementScene.tsx`
- `src/frontend/src/components/Lumi/VoiceBubble.tsx`
- `src/frontend/src/animations/lumi.animations.ts`
- `src/frontend/src/types/achievements.ts`
- `src/frontend/src/hooks/useLumiDialog.ts`
- `src/frontend/src/store/achievementsStore.ts`
- `assets/characters/lumi.svg`
- Tests for Lumi component

**Modified files** (~10):
- All 13 game pages (add achievement tracking)
- `src/frontend/src/pages/Home.tsx` (add Lumi intro)
- `src/frontend/src/components/LetterJourney.tsx` (show Lumi on unlock)

---

## Part 8: Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Lumi presence | Key moments (5+) | Achievement audit |
| Voice quality | Clear and engaging | Child feedback survey |
| Animation smoothness | 60fps minimum | Profiler |
| Story coherence | Linear progression | Narrative review |
| Engagement boost | +20% retention | Retention metrics |
| No regressions | All games work | Game function test |

---

## Part 9: Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Lumi overshadows Pip | Clear role separation (Pip teaches, Lumi cheers) |
| Voice generation sounds robotic | Start with Kokoro; upgrade to VO if needed |
| Animations cause performance dip | Profile early; optimize if needed |
| Kids find Lumi annoying | Tone in playtest; adjust if needed |
| Story feels forced | Real story designer review; iterate |
| Lumi disappears bugs (showing too long) | Rigorous timer testing; cleanup on unmount |

---

## Conclusion

**This is the "heart" initiative**: Lumi transforms the app from "educational tool" to "adventure with a friend."

**Success = Kids think "Lumi believes in me, and I want to keep playing to see what happens next!"**

