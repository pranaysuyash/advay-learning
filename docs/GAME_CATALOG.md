# Game & Activity Catalog

**A comprehensive library of camera-based learning activities for Advay's learning app.**

This catalog organizes all game ideas by learning domain, core mechanic, and age appropriateness. Use this as the master reference for content planning and implementation.

---

## Core Game Patterns (Build Once, Reskin Forever)

All games in this catalog are built from 8 core interaction primitives:

| Pattern | Description | MediaPipe Feature | Difficulty Knobs |
|---------|-------------|-------------------|------------------|
| **Touch Targets** | Touch appearing targets with fingertip/body part | Hand Landmarker | Target size, speed, distractors, required order |
| **Drag & Drop** | Pick item with pinch, move, drop into zones | Hand Landmarker | Categories, moving targets, wrong-drop penalty |
| **Trace Paths** | Follow outline or maze with fingertip | Hand Landmarker | Tolerance, stroke order, path complexity |
| **Hold Still** | Keep pose/fingertip in position for N seconds | Hand/Pose Landmarker | Duration, movement tolerance, distractions |
| **Match Pose** | Mirror a target pose shown on screen | Pose Landmarker | Angle tolerance, hold time, multi-step sequences |
| **Sequence Memory** | Do actions in order | Hand/Pose Landmarker | Sequence length, speed, mixed modalities |
| **Catch & Avoid** | Catch correct items, avoid incorrect ones | Hand Landmarker | Spawn rate, item speed, distractor ratio |
| **Scavenger Hunt** | Show real-world objects/colors to camera | Segmentation/Object Detection | Hint strength, time limit, categories |

---

## Activity Library by Learning Domain

### A) Pre-Writing & Fine Motor Skills

#### A1. Air Tracing Letters (English, Hindi, Kannada)
- **Pattern**: Trace Paths
- **Description**: Show ghost stroke; child traces with index finger
- **Features**: Start dot, direction arrows, multi-language support
- **Scoring**: Path closeness + smoothness + completion
- **Age**: 3-6 years
- **Languages**: English, Hindi, Kannada, Telugu, Tamil

#### A2. Shape Tracing
- **Pattern**: Trace Paths
- **Description**: Circle, square, triangle, star, spiral tracing
- **Features**: "Trace without lifting" mode, progressive difficulty
- **Age**: 3-5 years

#### A3. Maze Finger Walk
- **Pattern**: Trace Paths
- **Description**: Keep fingertip inside a road to reach goal
- **Features**: Traffic lights (stop/go), increasing complexity
- **Skills**: Control, patience, planning
- **Age**: 4-7 years

#### A4. Connect-the-Dots
- **Pattern**: Touch Targets + Trace Paths
- **Description**: Make letters, numbers, animals by connecting dots in order
- **Features**: Numbered dots, audio guidance
- **Bridge**: From pure tracing to purposeful shapes
- **Age**: 4-6 years

#### A5. Pinch Control Drills
- **Pattern**: Drag & Drop
- **Description**: Pick berries one by one, pull zipper, build sandwich
- **Skills**: Fine motor control, pinch gesture mastery
- **Age**: 3-5 years

#### A6. Steady Hand Lab
- **Pattern**: Hold Still
- **Description**: Hold finger inside shrinking circle
- **Skills**: Control, patience, precision
- **Age**: 4-6 years

---

### B) Alphabets, Phonics & Early Reading

#### B1. Letter Hunt
- **Pattern**: Touch Targets
- **Description**: Find the letter shown at top among distractors
- **Features**: Sound cues ("Find A, /a/ as in apple")
- **Age**: 3-6 years

#### B2. Letter-Sound Sorting
- **Pattern**: Drag & Drop
- **Description**: Drag pictures into "A sound" vs "B sound" buckets
- **Skills**: Phonics awareness, categorization
- **Age**: 4-6 years

#### B3. Build a Word (3-letter)
- **Pattern**: Drag & Drop
- **Description**: Drag letters to form "CAT", "DOG"
- **Features**: Audio prompts, visual hints
- **Age**: 5-7 years

#### B4. Syllable Clap
- **Pattern**: Hold Still + Touch Targets
- **Description**: Show word, child claps syllables, system counts claps
- **Features**: Rhythm detection, visual feedback
- **Age**: 4-6 years

#### B5. Sight Word Pop
- **Pattern**: Touch Targets
- **Description**: Pop only target sight words ("the", "is", "you")
- **Skills**: Reading speed, word recognition
- **Age**: 5-7 years

---

### C) Numbers & Mathematics

#### C1. Finger Number Show
- **Pattern**: Hold Still + Match Pose
- **Description**: "Show 3", "Show 7 using both hands"
- **Progression**: "Show 5 then add 2" by changing fingers
- **Skills**: Number sense, finger counting
- **Age**: 3-6 years

#### C2. Count & Drag
- **Pattern**: Drag & Drop
- **Description**: Drag exactly N apples to basket with real-time counter
- **Skills**: One-to-one correspondence, counting
- **Age**: 3-5 years

#### C3. Compare Quantities
- **Pattern**: Touch Targets
- **Description**: Two piles, "which has more?" Point left or right
- **Skills**: Quantity comparison, estimation
- **Age**: 4-6 years

#### C4. Number Line Swipe
- **Pattern**: Drag & Drop
- **Description**: Swipe to move character along number line
- **Skills**: Number ordering, magnitude sense
- **Age**: 5-7 years

#### C5. Make 10
- **Pattern**: Drag & Drop
- **Description**: Drag numbers into slots that sum to 10
- **Skills**: Addition, number bonds
- **Age**: 6-8 years

#### C6. Simple Addition (Objects)
- **Pattern**: Drag & Drop
- **Description**: Two groups of apples merge, drag right number card
- **Skills**: Addition concept, problem solving
- **Age**: 5-7 years

#### C7. Number Tracing
- **Pattern**: Trace Paths
- **Description**: Trace numbers 0-9, then 10-20
- **Features**: Same scoring as letter tracing
- **Age**: 4-6 years

---

### D) Colors, Shapes & Sorting

#### D1. Sort by Color (Apples into Buckets)
- **Pattern**: Drag & Drop
- **Description**: Pick apples with pinch, drop into colored buckets
- **Progression**: 2 colors → 4 colors, add distractors
- **Features**: Wrong bucket gives gentle bounce-back
- **Age**: 3-5 years

#### D2. Sort by Shape
- **Pattern**: Drag & Drop
- **Description**: Blocks into shape holes (classic shape sorter)
- **Skills**: Shape recognition, spatial reasoning
- **Age**: 3-5 years

#### D3. Sort by Attribute
- **Pattern**: Drag & Drop
- **Description**: "Big vs small", "striped vs plain", "has wheels vs no wheels"
- **Skills**: Classification, attribute identification
- **Age**: 4-7 years

#### D4. Odd One Out
- **Pattern**: Touch Targets
- **Description**: Three items, one differs by color or shape
- **Skills**: Pattern recognition, critical thinking
- **Age**: 4-6 years

#### D5. Pattern Continuation
- **Pattern**: Touch Targets
- **Description**: Red blue red blue, choose the next
- **Progression**: AB, AAB, ABB, ABC patterns
- **Skills**: Pattern recognition, prediction
- **Age**: 4-7 years

#### D6. Paint Mixer
- **Pattern**: Touch Targets + Drag & Drop
- **Description**: "Collect" colors by touching blobs, mix two colors to match target
- **Skills**: Color theory, experimentation
- **Age**: 4-7 years

#### D7. Color Scavenger Hunt
- **Pattern**: Scavenger Hunt
- **Description**: "Show something red" - uses simple color detection on center crop
- **Skills**: Real-world color recognition
- **Age**: 3-6 years

---

### E) Language & Multilingual Learning

#### E1. Bilingual Prompt Mode
- **Pattern**: Any
- **Description**: Same activity, prompts alternate English/Hindi/Kannada
- **Benefit**: Builds instruction-following across languages
- **Age**: 3-8 years

#### E2. Point and Say (Listening)
- **Pattern**: Touch Targets
- **Description**: Say "apple", child points to apple card
- **Progression**: Sentence-level: "Put apple in red bucket"
- **Skills**: Vocabulary, listening comprehension
- **Age**: 3-6 years

#### E3. Action Verbs
- **Pattern**: Match Pose
- **Description**: "Wave", "clap", "jump", "sit", "stand", "turn around"
- **Skills**: Language + motor, following instructions
- **Age**: 3-6 years

#### E4. Prepositions with Body
- **Pattern**: Match Pose
- **Description**: "Put hand above head", "behind back", "near face"
- **Skills**: Spatial language, body awareness
- **Age**: 4-7 years

#### E5. Storybook Interactive
- **Pattern**: Mixed
- **Description**: Short story scene; child "helps" by doing actions
- **Examples**: "Feed lion 3 apples", "Put fish in water"
- **Skills**: Comprehension, following narrative
- **Age**: 4-7 years

---

### F) Gross Motor & Coordination

#### F1. Simon Says (Body)
- **Pattern**: Match Pose
- **Description**: Touch head, shoulders, knees, toes
- **Progression**: "Do NOT do" traps, multi-step sequences
- **Skills**: Body awareness, following instructions
- **Age**: 3-7 years

#### F2. Freeze Dance
- **Pattern**: Hold Still + Match Pose
- **Description**: Dance to music, freeze in pose when stops
- **Scoring**: Score stability, not precision
- **Skills**: Rhythm, balance, self-control
- **Age**: 3-8 years

#### F3. Balance Challenges
- **Pattern**: Hold Still
- **Description**: Stand on one leg for 3 seconds, arms out like airplane
- **Features**: Visual feedback on stability
- **Skills**: Balance, focus
- **Age**: 4-8 years

#### F4. Reach the Stars
- **Pattern**: Touch Targets
- **Description**: Stars appear at different heights; reach left/right hand
- **Skills**: Coordination, range of motion
- **Age**: 3-7 years

#### F5. Yoga Animals
- **Pattern**: Hold Still + Match Pose
- **Description**: Tree pose, star pose, frog squat
- **Features**: Animal facts, sounds
- **Skills**: Body control, learning about animals
- **Age**: 4-8 years

---

### G) Social-Emotional & Expression

#### G1. Expression Mirror
- **Pattern**: Match Pose (Face)
- **Description**: Copy "happy", "surprised", "sleepy"
- **Note**: Use for teaching labels, NOT emotion detection
- **Skills**: Emotional vocabulary, imitation
- **Age**: 3-6 years

#### G2. Feelings Story
- **Pattern**: Touch Targets
- **Description**: Character is sad, child picks what helps: hug, kind word, help fix
- **Skills**: Empathy, problem solving
- **Age**: 4-7 years

---

### H) Creativity & Rewards

#### H1. Magic Background Worlds
- **Pattern**: Segmentation
- **Description**: Underwater, space, jungle backgrounds using body segmentation
- **Use**: Reward for completing session, not constant stimulation
- **Age**: 3-8 years

#### H2. Silhouette Painting
- **Pattern**: Segmentation
- **Description**: Paint inside your silhouette by moving body
- **Skills**: Creativity, body awareness
- **Age**: 3-8 years

#### H3. Shadow Puppets Digital
- **Pattern**: Hand Landmarker
- **Description**: Show silhouette target (rabbit, bird), match with hand shape
- **Scoring**: Similarity score
- **Skills**: Creativity, hand control
- **Age**: 4-8 years

---

### I) Logic, Memory & Problem Solving

#### I1. Gesture Sequence
- **Pattern**: Sequence Memory
- **Description**: Show sequence: pinch, wave, thumbs up. Child repeats.
- **Progression**: Increase length gradually
- **Skills**: Memory, sequencing
- **Age**: 4-8 years

#### I2. Pattern Builder
- **Pattern**: Drag & Drop
- **Description**: Red, blue, red, blue. Drag next color.
- **Progression**: Complex patterns, multiple attributes
- **Skills**: Pattern recognition, logic
- **Age**: 4-7 years

#### I3. Memory Match
- **Pattern**: Touch Targets
- **Description**: Visual cards matching, add sounds later
- **Skills**: Memory, concentration
- **Age**: 4-8 years

#### I4. Sequencing Pictures
- **Pattern**: Drag & Drop
- **Description**: Put pictures in order (story sequence, process)
- **Skills**: Logical thinking, narrative
- **Age**: 5-8 years

---

### J) STEM & Exploration

#### J1. Sorting by Properties
- **Pattern**: Drag & Drop
- **Description**: Big/small, heavy/light (simulated), color/shape
- **Skills**: Classification, scientific thinking
- **Age**: 4-7 years

#### J2. Space Clean-up
- **Pattern**: Drag & Drop + Segmentation
- **Description**: Trash floats around child; pinch and throw into bin
- **Background**: Space, child's silhouette is astronaut
- **Skills**: Coordination, environmental awareness
- **Age**: 4-8 years

#### J3. Underwater Bubbles
- **Pattern**: Touch Targets + Segmentation
- **Description**: Pop bubbles with fingertips, feed fish by dropping food
- **Skills**: Coordination, timing
- **Age**: 3-7 years

#### J4. Jungle Fruit Run
- **Pattern**: Catch & Avoid + Segmentation
- **Description**: Fruits fall, catch correct ones on silhouette area
- **Skills**: Reaction time, categorization
- **Age**: 4-8 years

---

## Lesson Packs (Curriculum Chunks)

### Pack 1: Fine Motor Foundations (2-4 weeks)
**Activities**:
1. Trace shapes
2. Maze finger walk
3. Drag-drop sorting (2 buckets)
4. Hold still mini-game

**Outcome**: Better control, less frustration, readiness for letters

---

### Pack 2: Letters & Sounds (4-8 weeks)
**Activities**:
1. Letter hunt
2. Trace uppercase
3. Match letter to object
4. Simple 3-letter word builder

**Outcome**: Letter recognition and early phonics

---

### Pack 3: Numbers & Counting (4-8 weeks)
**Activities**:
1. Finger show number
2. Drag exactly N items
3. Compare quantities
4. Number line movement

**Outcome**: Counting, quantity sense

---

### Pack 4: Colors, Shapes, Patterns (ongoing)
**Activities**:
1. Sort by color and shape
2. Odd one out
3. Pattern continuation

**Outcome**: Categorization, early logic

---

### Pack 5: Movement & Listening (ongoing)
**Activities**:
1. Simon says
2. Action verbs
3. Freeze dance

**Outcome**: Comprehension, coordination, attention

---

### Pack 6: Multilingual Mode (layer on top)
**Activities**: Same activities, prompts in rotation

**Outcome**: Vocabulary and instruction mapping across languages

---

## Daily & Weekly Plans

### Daily Session Template (8-12 minutes)
1. **Warm-up**: Easy win (balloon pop) - 2 min
2. **Skill builder**: Tracing or counting - 4 min
3. **Fun challenge**: Sorting apples, freeze dance - 4 min
4. **Recap**: Show sticker earned - 20 sec

### Weekly Plan (5 days)
- **2 days**: Fine motor + letters
- **2 days**: Numbers + sorting
- **1 day**: Movement + story quest

**Principle**: Repetition builds mastery; toddlers learn by looping, not novelty.

---

## Difficulty Scaling System

### Adjustable Parameters (per game)
| Parameter | Easy | Medium | Hard |
|-----------|------|--------|------|
| Target size | Large (100px) | Medium (60px) | Small (40px) |
| Speed | Slow | Medium | Fast |
| Distractors | 0-1 | 2-3 | 4+ |
| Tolerance | High (20px) | Medium (10px) | Low (5px) |
| Time limit | None/Generous | Moderate | Tight |
| Sequence length | 2 steps | 3-4 steps | 5+ steps |

### Adaptive Difficulty Rules
- **3 wins in a row**: Slightly harder
- **2 fails in a row**: Easier + hint
- **Never** increase difficulty immediately after failure

---

## MVP Game Set (First 8 to Ship)

Ship these first for maximum impact with minimal code:

1. **Finger Paint Trace** (letters/shapes) - Pre-writing
2. **Pick and Drop Sort** (apples into buckets) - Colors/categorization
3. **Balloon Pop** (by color/letter) - Recognition + fun
4. **Simon Says Body** - Following instructions
5. **Freeze Dance** - Motor + self-control
6. **Finger Count Show Me N** - Number sense
7. **Maze Finger Walk** - Control + planning
8. **Magic Background Story Mode** - Creativity + reward

**Coverage**: Pre-writing, math, colors, motor, creativity, "wow" factor

---

## MediaPipe Implementation Notes

### Hand Landmarker (21 keypoints per hand)
**Use for**: All touch, drag, trace, pinch games
**Landmarks**: 
- Index fingertip (8) for pointing/tracing
- Thumb tip (4) for pinch detection

### Pose Landmarker (33 keypoints)
**Use for**: Body games, Simon Says, balance
**Key points**: Head, shoulders, elbows, wrists, hips, knees, ankles

### Face Landmarker (468+ points + blendshapes)
**Use for**: Expression mirror, simple AR effects
**Note**: Never store frames; use only transient landmarks

### Segmentation
**Use for**: Magic backgrounds, silhouette painting, space clean-up

### Timestamp Critical
Always pass timestamps in stream mode for smooth tracking:
```javascript
// Critical: include timestampMs
handLandmarker.detectForVideo(video, performance.now());
```

---

## Privacy & Safety Notes

- **No camera frames stored** - ever
- **No cloud by default** - all processing local
- **Parent controls** - can disable camera features
- **Clear indicators** - when camera is active
- **No biometric identity** - no face recognition, just transient effects

See `docs/security/SECURITY.md` for full privacy guidelines.

---

## Content Expansion Strategy

To reach 100+ games without chaos:

1. **Build 8-10 core patterns** (listed above)
2. **Create content packs** as JSON configurations:
   ```json
   {
     "gameType": "dragDropSort",
     "theme": "space",
     "items": ["meteor", "star", "planet"],
     "categories": ["rock", "gas", "ice"],
     "difficulty": "medium"
   }
   ```
3. **Reskin, don't rebuild** - Same code, new art/audio
4. **Quest lines** connect mini-games with narrative

---

*Last updated: 2026-01-29*
*Related docs: GAME_MECHANICS.md, LEARNING_PLAN.md, AGE_BANDS.md*
