# Game Design Prompt v1.0

**Purpose**: Generate new camera-based learning game ideas for Advay's learning app following established patterns and pedagogical principles.

---

## 🎯 MANDATORY: Vision-First Design

**This is a multi-modal vision platform.** Every game MUST use at least one camera-based CV control mode:
- **Hand tracking** (index finger pointing, pinch-to-grab, gestures)
- **Face tracking** (head tilt, facial expressions)
- **Pose tracking** (full body movements, jumping, arm positions)
- **Voice input** (speech recognition for voice-controlled games)

CV integration is **Step 1** of game design, not an afterthought. The `cv: [...]` field in the game registry MUST accurately reflect which modes the game uses.

Reference: `docs/CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md`

---

## Input Parameters

When requesting a new game design, provide:

1. **Learning Domain**: (e.g., "math - addition", "language - vocabulary", "motor - fine control")
2. **Target Age**: (e.g., "3-4 years", "5-6 years", "7-8 years")
3. **Core Mechanic Preference**: (optional - see patterns below)
4. **Language Context**: (e.g., "English", "Hindi", "Kannada", "multilingual")
5. **Special Requirements**: (optional - e.g., "needs to work in low light", "accessibility focus")

---

## Core Game Patterns (Choose One or Combine)

> **CRITICAL**: Every pattern MUST specify which CV modes it uses. The `cv: [...]` field in the game registry must match.

### Pattern 1: Touch Targets

**Interaction**: Touch appearing targets with fingertip/body part
**Best for**: Recognition, speed, reaction time
**CV Modes**: `hand` (primary), `pose` (body touch), `face` (head touch variants)
**Hook**: `useGameHandTracking` for index finger, `useGamePoseTracking` for body
**Difficulty knobs**: Target size, speed, distractors, required order

### Pattern 2: Drag & Drop (Pinch Grab)

**Interaction**: Pick item with pinch, move, drop into zones
**Best for**: Categorization, sorting, spatial reasoning
**CV Modes**: `hand` (pinch detection)
**Hook**: `useGameHandTracking` with pinch callback
**Difficulty knobs**: Number of categories, moving targets, wrong-drop penalty

### Pattern 3: Trace Paths

**Interaction**: Follow outline or maze with fingertip
**Best for**: Pre-writing, letter formation, control
**CV Modes**: `hand` (index finger tracking)
**Hook**: `useGameHandTracking` with landmark 8 (index tip)
**Difficulty knobs**: Tolerance, stroke order strictness, path complexity

### Pattern 4: Hold Still

**Interaction**: Keep pose/fingertip in position for N seconds
**Best for**: Balance, control, patience
**CV Modes**: `hand`, `pose`, or `face` depending on game
**Hook**: Appropriate tracking hook based on mode
**Difficulty knobs**: Duration, movement tolerance, distractions

### Pattern 5: Match Pose/Expression

**Interaction**: Mirror target pose shown on screen
**Best for**: Body awareness, following instructions, gross motor
**CV Modes**: `pose` (body poses), `face` (facial expressions), `hand` (hand poses)
**Hook**: `useGamePoseTracking` and/or `useGameFaceTracking`
**Difficulty knobs**: Angle tolerance, hold time, multi-step sequences

### Pattern 6: Sequence Memory

**Interaction**: Do actions in order
**Best for**: Working memory, pattern recognition
**CV Modes**: `hand`, `pose` — supports mixed modalities
**Hook**: Multiple hooks for multi-modal sequences
**Difficulty knobs**: Sequence length, speed, mixed modalities

### Pattern 7: Catch & Avoid

**Interaction**: Catch correct items, avoid incorrect ones
**Best for**: Reaction time, categorization under pressure
**CV Modes**: `hand` (primary), `pose` (body catchers)
**Hook**: `useGameHandTracking` or `useGamePoseTracking`
**Difficulty knobs**: Spawn rate, item speed, distractor ratio

### Pattern 8: Scavenger Hunt

**Interaction**: Show real-world objects/colors to camera
**Best for**: Real-world learning, exploration
**CV Modes**: `hand` (pointing), segmentation/object detection
**Hook**: `useGameHandTracking` + object detection
**Difficulty knobs**: Hint strength, time limit, categories

### Pattern 9: Voice-Controlled

**Interaction**: Speak commands, answers, or sounds
**Best for**: Language learning, phonics, vocabulary
**CV Modes**: `voice` (primary)
**Hook**: Voice recognition APIs
**Difficulty knobs**: Vocabulary complexity, response time, accents

---

## Output Format

For each game idea, provide:

```markdown
### Game Title

**Pattern**: [Core pattern from list above]
**Learning Domain**: [e.g., Math - Addition, Language - Vocabulary]
**Target Age**: [e.g., 4-6 years]
**Languages**: [e.g., All supported, or specific]

## 🎯 CV MODES (REQUIRED)

**Registry `cv` field**: `['hand']` or `['pose']` or `['face']` or `['voice']` or `['hand', 'face']` etc.
**Hooks to use**:
- Hand: `useGameHandTracking` — specify which landmarks (8=index tip, etc.)
- Pose: `useGamePoseTracking` — specify which joints (0=nose, 15/16=wrists, etc.)
- Face: `useGameFaceTracking` — specify roll/pitch/yaw usage
- Voice: `useMicrophoneInput` or `useVoicePrompt` — specify trigger words or volume thresholds

**Camera behavior**: [What does the camera preview show? Visual feedback?]

**Description**: 
[2-3 sentence description of gameplay]

**How to Play**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Learning Objectives**:
- [Objective 1]
- [Objective 2]

**Scoring & Feedback**:
- Success: [What constitutes success]
- Feedback: [Immediate feedback mechanism]
- Difficulty scaling: [How it gets harder/easier]

**CV Implementation Details**:
- [e.g., Hand Landmarker - index fingertip tracking for touch targets]
- [e.g., Pinch detection for grab/drag operations]
- [e.g., Pose tracking for full-body movements]
- [e.g., Face tracking for head tilt steering]

**Visual & Audio Design**:
- Theme: [e.g., Space, Jungle, Underwater]
- Characters: [e.g., Pip the Panda, robots, animals]
- Sound effects: [e.g., Pop sound on success, gentle bounce on miss]

**Accessibility Considerations**:
- [How it works for different abilities]
- [Hand tracking vs pose tracking alternatives]

**Estimated Development Effort**:
- [Small/Medium/Large] - [reasoning]

**Dependencies**:
- [Any required assets, features, or prior games]
- [CV hooks required]
```

---

## Pedagogical Principles (Must Follow)

1. **Learning-first**: Points support learning; they don't replace it
2. **Fast feedback**: Child sees "what to do next" within 1-2 seconds
3. **Predictable controls**: Stable even with shaky hands
4. **Anti-frustration**: Game adapts down before child quits
5. **Generous scoring**: Toddlers quit if system feels unfair
6. **Short loops**: 20-60 seconds per activity
7. **Visual instructions**: Always show "what to do" visually

---

## Example Request

**User Input**:

```
Domain: Math - counting and one-to-one correspondence
Age: 3-4 years
Language: Multilingual (English/Hindi)
Preference: Drag & Drop pattern
Special: Should feel like feeding animals
```

**Expected Output**:

```markdown
### Feed the Animals

**Pattern**: Drag & Drop (Pinch Grab)
**Learning Domain**: Math - Counting and One-to-One Correspondence
**Target Age**: 3-4 years
**Languages**: All supported (prompts in chosen language)

**Description**:
Hungry animals appear with number bubbles showing how many food items they want. Child pinches to pick up food items and drags them to the animal's mouth. Each successful feeding triggers a happy animation and counting sound.

**How to Play**:
1. Animal appears with number bubble (e.g., "3")
2. Child sees scattered food items (apples, bananas, fish)
3. Child pinches and drags food to animal's mouth
4. Counter updates: "1... 2... 3!"
5. Animal eats and shows happy reaction
6. New animal appears with different number

**Learning Objectives**:
- One-to-one correspondence (each item = one count)
- Number recognition (1-5 for age 3-4)
- Counting sequence
- Fine motor control (pinch and drag)

**Scoring & Feedback**:
- Success: Correct count fed to animal
- Feedback: Immediate number announcement, animal happy animation
- Difficulty scaling: Start with 1-2, progress to 5; increase food variety

**MediaPipe Features**:
- Hand Landmarker: Index fingertip for hover, pinch detection for grab
- Cursor: Visible hand tracking cursor
- Smoothing: EMA smoothing for jitter reduction

**Visual & Audio Design**:
- Theme: Friendly zoo/farm
- Characters: Panda, elephant, rabbit (cute, simple designs)
- Pip appears: "The panda is hungry! Can you give him 3 bamboo?"
- Sounds: Crunch on eat, happy animal sounds, number announcements

**Accessibility Considerations**:
- Large hit areas for drops (animal mouths)
- No time pressure
- Visual number display + audio
- Works with one hand or two

**Estimated Development Effort**:
- Small - Uses existing drag-drop pattern, simple assets

**Dependencies**:
- Drag-drop system from "Sort by Color" game
- Animal sprites (can reuse mascot style)
```

---

## Content Expansion Rules

When generating multiple games:

1. **Reuse patterns**: Prefer reskinning existing mechanics over new code
2. **Progressive difficulty**: Games should form learning progressions
3. **Cross-domain**: Good games often teach multiple skills
4. **Cultural relevance**: Include themes relevant to Indian context (festivals, animals, foods)
5. **Seasonal variety**: Can suggest holiday/themed variants

---

## Evaluation Checklist

Before finalizing a game idea, verify:

- [ ] **CV MODES DEFINED**: `cv: [...]` field specified with correct modes
- [ ] **HOOKS SPECIFIED**: Which tracking hooks will be used
- [ ] Learning objective is clear and measurable
- [ ] Appropriate for target age (not too hard/easy)
- [ ] Uses MediaPipe capabilities efficiently
- [ ] Can be implemented with existing or planned patterns
- [ ] Privacy-safe (no stored frames, no biometric ID)
- [ ] Fun factor: Would a child want to play this 3+ times?
- [ ] Parent-friendly: Can parent understand what child is learning?

---

**Version**: 1.0
**Last Updated**: 2026-01-29
**Related Docs**: GAME_CATALOG.md, GAME_MECHANICS.md, LEARNING_PLAN.md
