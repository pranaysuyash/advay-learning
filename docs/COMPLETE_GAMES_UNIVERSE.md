# Complete Games Universe — Advay Vision Learning

**Created:** 2026-02-22
**Status:** Living Master Reference
**Purpose:** Single document covering ALL implemented, planned, explored, and dreamed-of games across the entire platform.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Implemented Games (21)](#2-implemented-games-21)
3. [Categories & Real-Life Skills](#3-categories--real-life-skills)
4. [Gap Analysis](#4-gap-analysis)
5. [Planned Games (P0–P1)](#5-planned-games-p0p1)
6. [Explored & Designed Games (P2–P3)](#6-explored--designed-games-p2p3)
7. [Frontier & Moonshot Ideas (P4+)](#7-frontier--moonshot-ideas-p4)
8. [Full Game Universe by Category](#8-full-game-universe-by-category)
9. [Skill Coverage Matrix](#9-skill-coverage-matrix)
10. [Technology Capabilities](#10-technology-capabilities)
11. [Source Documents](#11-source-documents)

---

## 1. Platform Overview

| Metric | Value |
|--------|-------|
| **Implemented games** | 21 (19 in gallery + 2 unlisted) |
| **Planned P0–P1 games** | ~15 |
| **Explored/designed ideas** | ~80 |
| **Frontier/moonshot ideas** | ~100+ |
| **Total game universe** | **270+** unique concepts |
| **CV systems** | Hand tracking, Face/Eye tracking, Pose tracking |
| **Target age** | 2–12 years |
| **Tech stack** | React + TypeScript + MediaPipe + Canvas + Web Audio |

---

## 2. Implemented Games (21)

### In Gallery (19 games)

| # | Game | Route | Category | Age | CV Type | Difficulty |
|---|------|-------|----------|-----|---------|------------|
| 1 | **Draw Letters** | `/games/alphabet-tracing` | Alphabets | 2-8 | Hand+Face | Easy |
| 2 | **Finger Counting** | `/games/finger-number-show` | Numbers | 3-7 | Hand | Easy |
| 3 | **Connect Dots** | `/games/connect-the-dots` | Drawing | 3-6 | Hand | Easy |
| 4 | **Find the Letter** | `/games/letter-hunt` | Alphabets | 2-6 | Hand | Easy |
| 5 | **Music Pinch Beat** | `/games/music-pinch-beat` | Music | 3-7 | Hand | Easy |
| 6 | **Steady Hand Lab** | `/games/steady-hand-lab` | Motor Skills | 4-7 | Hand | Medium |
| 7 | **Shape Pop** | `/games/shape-pop` | Shapes | 3-7 | Hand | Easy |
| 8 | **Color Match Garden** | `/games/color-match-garden` | Colors | 3-7 | Hand | Medium |
| 9 | **Number Tap Trail** | `/games/number-tap-trail` | Numbers | 4-8 | Hand | Medium |
| 10 | **Shape Sequence** | `/games/shape-sequence` | Memory | 4-8 | Hand | Medium |
| 11 | **Yoga Animals** | `/games/yoga-animals` | Movement | 3-8 | Pose | Easy |
| 12 | **Freeze Dance** | `/games/freeze-dance` | Movement | 3-8 | Pose | Easy |
| 13 | **Simon Says** | `/games/simon-says` | Movement | 3-8 | Pose | Easy |
| 14 | **Chemistry Lab** | `/games/chemistry-lab` | Science | 4-8 | Hand | Easy |
| 15 | **Word Builder** | `/games/word-builder` | Literacy | 3-7 | Hand | Easy |
| 16 | **Emoji Match** | `/games/emoji-match` | Emotions | 3-7 | Hand | Easy |
| 17 | **Air Canvas** | `/games/air-canvas` | Creativity | 3-8 | Hand | Easy |
| 18 | **Mirror Draw** | `/games/mirror-draw` | Creativity | 4-7 | Hand | Medium |
| 19 | **Phonics Sounds** | `/games/phonics-sounds` | Literacy | 3-7 | Hand | Easy |

### Unlisted (2 games — have routes but NOT in Games gallery)

| # | Game | Route | Category | Notes |
|---|------|-------|----------|-------|
| 20 | **Bubble Pop Symphony** | `/games/bubble-pop-symphony` | Music | Pop bubbles to play melodies |
| 21 | **Dress For Weather** | `/games/dress-for-weather` | Life Skills | Dress character for weather |

> ⚠️ **Quick win:** Add these 2 to `Games.tsx` to make them discoverable.

---

## 3. Categories & Real-Life Skills

### Current Category Breakdown

| Category | Count | Games |
|----------|-------|-------|
| **Alphabets** | 2 | Draw Letters, Find the Letter |
| **Numbers** | 2 | Finger Counting, Number Tap Trail |
| **Literacy** | 2 | Word Builder, Phonics Sounds |
| **Shapes** | 1 | Shape Pop |
| **Colors** | 1 | Color Match Garden |
| **Drawing** | 1 | Connect the Dots |
| **Motor Skills** | 1 | Steady Hand Lab |
| **Music** | 2 | Music Pinch Beat, Bubble Pop Symphony* |
| **Memory** | 1 | Shape Sequence |
| **Movement** | 3 | Yoga Animals, Freeze Dance, Simon Says |
| **Science** | 1 | Chemistry Lab |
| **Emotions** | 1 | Emoji Match |
| **Creativity** | 2 | Air Canvas, Mirror Draw |
| **Life Skills** | 1 | Dress For Weather* |

*\* Not in gallery*

### Real-Life Skill Mapping

| Real-Life Skill | Games That Teach It | Why It Matters |
|----------------|---------------------|----------------|
| **Reading readiness** | Draw Letters, Find the Letter, Word Builder, Phonics Sounds | Letter recognition, phonemic awareness — foundation for reading |
| **Math foundations** | Finger Counting, Number Tap Trail | Counting, number sequence, quantity concept |
| **Spatial reasoning** | Shape Pop, Connect the Dots, Mirror Draw, Shape Sequence | Geometry, symmetry, pattern recognition |
| **Fine motor control** | Steady Hand Lab, Connect the Dots, Air Canvas, Mirror Draw, Draw Letters | Pencil grip readiness, hand-eye coordination |
| **Gross motor / Body awareness** | Yoga Animals, Freeze Dance, Simon Says | Balance, body control, following multi-step instructions |
| **Impulse control** | Freeze Dance, Simon Says | Self-regulation — stopping on command |
| **Creative expression** | Air Canvas, Mirror Draw | Imagination, artistic confidence, no-wrong-answer play |
| **Music & rhythm** | Music Pinch Beat, Bubble Pop Symphony | Auditory processing, timing, pattern |
| **Emotional intelligence** | Emoji Match | Recognizing and naming emotions — critical social skill |
| **Scientific thinking** | Chemistry Lab | Cause-effect reasoning, experimentation, hypothesis |
| **Color recognition** | Color Match Garden | Visual discrimination, vocabulary |
| **Spelling & vocabulary** | Word Builder, Phonics Sounds | Letter-sound connection, word formation |
| **Practical life skills** | Dress For Weather | Weather awareness, dressing appropriately, independence |
| **Memory & sequencing** | Shape Sequence, Number Tap Trail | Working memory, sequential processing |

---

## 4. Gap Analysis

### 🔴 Critical Gaps (0 games)

| Gap | Why Critical | Best Candidates |
|-----|-------------|----------------|
| **Logic / Reasoning** | Problem-solving is a core cognitive skill. No game teaches it. | Story Sequence, Odd One Out, Pattern Complete |
| **Math Operations** | Only counting exists — no addition, subtraction, or comparison | Math Monsters, Simple Addition, More or Less |
| **Time & Calendar** | Fundamental life skill, no coverage | Clock Reading, Days of the Week |
| **Storytelling / Narrative** | Language development, comprehension — 0 games | Story Sequence, Story Builder, Voice Stories |
| **Geography / World Knowledge** | 0 games about the world | Map Explorer, Animal Habitats, Flag Match |

### 🟠 Weak Areas (1 game only)

| Area | Current | What's Missing |
|------|---------|---------------|
| **Science** | Chemistry Lab only | Physics, biology, nature, weather |
| **Emotions / Social** | Emoji Match only | Sharing, turn-taking, empathy scenarios |
| **Shapes** | Shape Pop only | Shape Safari, shape identification in scenes |
| **Colors** | Color Match Garden only | Color mixing, color by number |
| **Drawing** | Connect the Dots only | Free draw, color by number |
| **Motor Skills** | Steady Hand Lab only | Maze Runner, path following, cutting practice |
| **Life Skills** | Dress For Weather (unlisted!) | Tooth brushing, food sorting, hygiene |

### 🟢 Strong Areas

| Area | Count | Notes |
|------|-------|-------|
| **Movement** | 3 games | Good variety: yoga, dance, body commands |
| **Literacy** | 4 games | Letters + phonics + words — solid foundation |
| **Numbers** | 2 games | Adequate for counting |
| **Creativity** | 2 games | New, fills previous gap |
| **Music** | 2 games | Good with Bubble Pop Symphony (needs gallery listing) |

---

## 5. Planned Games (P0–P1)

These have detailed designs in docs and are ready for implementation.

### P0 — Next Sprint

| Game | Category | CV | Effort | Source Doc |
|------|----------|----|---------|----|
| **Shape Safari** | Shapes + Motor | Hand | 1 week | GAME_ROADMAP.md |
| **Rhyme Time** | Literacy | Hand+Audio | 1 week | GAME_IDEAS_CATALOG.md |
| **Story Sequence** | Logic | Hand | 1 week | GAME_ROADMAP.md |
| **Free Draw / Finger Painting** | Creativity | Hand | 3 days | FUN_FIRST_GAMES_CATALOG.md |
| **Particle Playground** | Experimental | Hand | 1 week | FUN_FIRST_GAMES_CATALOG.md |

### P1 — Near-Term (1–2 months)

| Game | Category | CV | Effort | Source Doc |
|------|----------|----|---------|----|
| **Color by Number** | Numeracy + Creativity | Hand | 1.5 weeks | GAME_ROADMAP.md |
| **Number Tracing** | Numbers | Hand | 1.5 weeks | GAME_IMPROVEMENT_MASTER_PLAN.md |
| **Math Monsters** | Math Operations | Hand | 2 weeks | GAME_ROADMAP.md |
| **Phonics Tracing** | Literacy | Hand+Audio | 1.5 weeks | GAME_IDEAS_CATALOG.md |
| **Beginning Sounds** | Literacy | Hand+Audio | 1 week | GAME_IDEAS_CATALOG.md |
| **Memory Match** | Logic | Hand | 1 week | GAME_IDEAS_CATALOG.md |
| **Odd One Out** | Logic | Hand | 1 week | GAME_IDEAS_CATALOG.md |
| **Shadow Puppet Theater** | Creativity | Hand | 1 week | FUN_FIRST_GAMES_CATALOG.md |
| **Virtual Bubbles** | Experimental | Hand+Mic | 3 days | FUN_FIRST_GAMES_CATALOG.md |
| **Kaleidoscope Hands** | Creativity | Hand | 4 days | FUN_FIRST_GAMES_CATALOG.md |
| **Air Guitar Hero** | Music | Hand | 1.5 weeks | FUN_FIRST_GAMES_CATALOG.md |
| **Finger Drum Kit** | Music | Hand | 1 week | FUN_FIRST_GAMES_CATALOG.md |
| **Fruit Ninja Air** | Sports/Reflex | Hand | 1 week | FUN_FIRST_GAMES_CATALOG.md |
| **Hand Ball Toss** | Sports | Hand | 1 week | FUN_FIRST_GAMES_CATALOG.md |
| **Virtual Bowling** | Sports | Hand | 1 week | FUN_FIRST_GAMES_CATALOG.md |
| **Tower of Balance** | Logic | Hand | 1 week | COMPREHENSIVE_INNOVATIVE_GAMES_CATALOG.md |
| **Sand Art Studio** | Creativity | Hand | 1 week | COMPREHENSIVE_INNOVATIVE_GAMES_CATALOG.md |
| **Virtual Garden** | Science / Nature | Hand | 1.5 weeks | COMPREHENSIVE_INNOVATIVE_GAMES_CATALOG.md |
| **Bug Hunter** | Nature | Hand | 1.5 weeks | COMPREHENSIVE_INNOVATIVE_GAMES_CATALOG.md |

---

## 6. Explored & Designed Games (P2–P3)

These have concept designs but need more work before implementation.

### Literacy & Phonics (P2–P3)

| Game | Concept | Age |
|------|---------|-----|
| Ending Sounds | "What sound does CAT end with?" | 4-6 |
| Blend Builder | Blend 3 phonemes into a word | 5-7 |
| Syllable Clap | Clap syllables: BA-NA-NA = 3 | 4-6 |
| Vowel Valley | Short vs long vowel sounds | 5-7 |
| Sight Word Flash | High-frequency word recognition | 5-7 |
| Story Builder | Arrange words into sentences | 5-8 |
| Reading Along | Highlighted words as Pip reads | 4-7 |

### Numbers & Math (P2–P3)

| Game | Concept | Age |
|------|---------|-----|
| Counting Objects | "How many apples?" | 3-5 |
| More or Less | Which group is bigger? | 3-5 |
| Number Sequence | Fill the missing number | 4-6 |
| Simple Addition | 2 + 3 = ? with visual objects | 4-7 |
| Simple Subtraction | 5 - 2 = ? with visual objects | 4-7 |
| Number Bonds | Ways to make 10 | 5-7 |
| Shape Counting | Count triangles in picture | 4-6 |
| Time Telling | Clock reading basics | 5-7 |
| Pattern Continue | ABAB → ? patterns | 4-6 |

### Motor Skills (P2–P3)

| Game | Concept | Age |
|------|---------|-----|
| Maze Runner | Navigate hand through a maze | 4-7 |
| Path Following | Stay on a winding road | 3-6 |
| Cutting Practice | Virtual scissor lines | 4-6 |
| Pinch Practice | Fine motor exercises | 3-5 |
| Circle Drawing | Spirals, circles, curves | 3-6 |
| Sticker Placement | Precision targeting | 3-5 |

### Logic & Cognitive (P2–P3)

| Game | Concept | Age |
|------|---------|-----|
| Size Sorting | Small → Big ordering | 3-5 |
| Same & Different | Find matching pair | 3-5 |
| Puzzle Builder | Jigsaw assembly | 4-7 |
| Shadow Match | Object to its shadow | 3-6 |
| Pattern Complete | What comes next in sequence? | 4-6 |
| Mirror Maze | Guide light beams with mirrors | 6-12 |
| Escape Room Junior | Age-appropriate puzzle rooms | 6-12 |

### Knowledge & World (P2–P3)

| Game | Concept | Age |
|------|---------|-----|
| Animal Sounds | Match animal to its sound | 2-5 |
| Body Parts | Point to named body part | 3-5 |
| Nature Explorer | Camera identifies plants/insects | 4-8 |
| Weather Watch | What's the weather today? | 3-6 |
| Colors of Life | Find colors in photos | 3-5 |

### Music & Audio (P2–P3)

| Game | Concept | Age |
|------|---------|-----|
| Conductor's Orchestra | Control virtual orchestra tempo/volume | 4-10 |
| Beatbox Battle | Create beats with gestures + voice | 6-12 |
| Pitch Match | Sing to match Pip's pitch | 5-8 |
| Sound Garden | Touch flowers to play notes | 3-6 |
| Rhythm Tap | Copy rhythm patterns | 4-7 |
| Sing Along | Nursery rhyme karaoke | 3-6 |
| Sound Effects | "What made that sound?" | 3-5 |
| Echo Game | Repeat what Pip says | 3-5 |

### Creative (P2–P3)

| Game | Concept | Age |
|------|---------|-----|
| Color Mixing | Red + Blue = ? | 3-5 |
| Dress Up Pip | Character customization | 3-6 |
| Scene Builder | Compose scenes with objects | 4-7 |
| 3D Sculpture Studio | Virtual clay sculpting | 6-12 |
| Rorschach Inkblots | Symmetrical ink art | 4+ |
| Hand-Controlled Lava Lamp | Mesmerizing blob physics | 3+ |
| Pottery Wheel | Virtual pottery with hand shaping | 5-12 |

### Sports & Physical (P2–P3)

| Game | Concept | Age |
|------|---------|-----|
| Virtual Archery | Draw bow, aim, shoot | 6-12 |
| Virtual Tennis | Hand = racket | 6-12 |
| Hand Pong | Hand position controls paddle | 5-12 |

### Roleplay & Imagination (P2–P3)

| Game | Concept | Age |
|------|---------|-----|
| Superpower Simulator | Fire, ice, lightning gestures | 4-10 |
| Magic Wand Workshop | Cast spells with gestures | 5-10 |
| Puppet Master | Control virtual puppets | 4-8 |

---

## 7. Frontier & Moonshot Ideas (P4+)

These are innovative, higher-effort ideas that push the platform's boundaries.

### Combined CV Experiences (Hand + Pose + Face together)

| Idea | Concept | Why It's Magic |
|------|---------|---------------|
| **Yoga + Hand Tracing** | Hold tree pose while tracing letters in air | Body + hand coordination |
| **Freeze Dance + Fingers** | Dance → freeze → show number with fingers | Two CV systems at once |
| **Attention-Aware Games** | Game speeds up when kid looks away | Face tracking becomes visible gameplay |
| **Posture + Precision** | Steady hand game is easier with good posture | Wellness = game mechanic |
| **Full Body Simon Says** | "Touch head" (pose) + "Show 3 fingers" (hand) | All three CV systems |

### AR Experiences (Camera + Digital Overlay)

| Idea | Concept | Effort |
|------|---------|--------|
| AR Virtual Science Lab | Table becomes a lab | 2 weeks |
| AR Solar System | Planets orbit in your room | 2 weeks |
| AR Dinosaur Dig | Floor becomes dig site | 1.5 weeks |
| AR Petri Dish | Grow virtual bacteria on paper | 1.5 weeks |
| AR Anatomy Explorer | Life-size body in living room | 2.5 weeks |
| Dinosaur World AR | Dinos roam your room | 2 weeks |

### Advanced Science

| Idea | Concept | Age |
|------|---------|-----|
| Element Mixer 3000 | Combine elements like Little Alchemy | 7-12 |
| Physics Playground | Build machines, see physics | 5-12 |
| Circuit Builder | Build electronic circuits virtually | 6-12 |
| Weather Maker | Control temperature + humidity → see weather | 4-10 |
| Molecular Builder | Build molecules atom by atom | 8-14 |
| Ocean Explorer | Room becomes aquarium | 4-12 |

### AI-Powered (Future)

| Idea | Concept |
|------|---------|
| Doodle to Image | Draw rough → AI makes it beautiful |
| Story from Movement | Movements generate narrated story |
| AI Tutor Pip | GPT-powered Pip answers science questions |
| "Finish My Drawing" | AI completes kid's sketch |
| Voice-Activated Potions | Say ingredient names to add them |

### Cultural & Indian-Specific

| Idea | Concept |
|------|---------|
| Rangoli Maker | Create traditional rangoli patterns with hand tracking |
| Shadow Puppet Theater (Indian) | Traditional puppetry: Raja, Rani, Hanuman |
| Indian Classical Music (Sitar mode) | Air Guitar with sitar skin |
| Festival-themed content | Diwali diyas, Holi colors, Republic Day flags |
| Hindi/Kannada Phonics | Language-specific phoneme games |

### Multiplayer & Social

| Idea | Concept |
|------|---------|
| Family Band | Multiple people play instruments together |
| Collaborative Story Builder | Take turns adding to a story |
| Simon Says Team Edition | Captain, crew, spy roles |
| Dance Battle | Split-screen competitive dance |
| Hand Pong Tournament | Bracket-style competition |

### Experimental Toys (Zero Learning Goals)

| Idea | Concept |
|------|---------|
| Particle Playground | Sand, water, fire, bubbles — play with physics |
| Voice + Hand Visualizer | Sound + movement = art |
| Hand Heat Map | Thermal-camera-style trails |
| Slow Motion Studio | Record movements, replay in slow-mo |
| Lava Lamp Controller | Mesmerizing blob physics |

---

## 8. Full Game Universe by Category

### Summary Table

| Category | Implemented | Planned (P0–P1) | Explored (P2–P3) | Frontier (P4+) | **Total** |
|----------|-------------|-----------------|-------------------|----------------|-----------|
| **Literacy & Phonics** | 4 | 3 | 7 | 2 | **16** |
| **Numbers & Math** | 2 | 3 | 9 | 0 | **14** |
| **Shapes & Spatial** | 1 | 1 | 0 | 0 | **2** |
| **Colors** | 1 | 1 | 1 | 0 | **3** |
| **Motor Skills** | 2 | 0 | 6 | 0 | **8** |
| **Drawing** | 1 | 1 | 0 | 1 | **3** |
| **Movement / Gross Motor** | 3 | 0 | 0 | 2 | **5** |
| **Music & Rhythm** | 2 | 3 | 8 | 1 | **14** |
| **Memory & Logic** | 1 | 3 | 7 | 0 | **11** |
| **Science & Nature** | 1 | 2 | 5 | 6 | **14** |
| **Creativity & Art** | 2 | 3 | 7 | 3 | **15** |
| **Emotions & Social** | 1 | 0 | 0 | 2 | **3** |
| **Knowledge & World** | 0 | 1 | 5 | 2 | **8** |
| **Sports & Physical** | 0 | 3 | 3 | 0 | **6** |
| **Roleplay & Imagination** | 0 | 0 | 3 | 2 | **5** |
| **Life Skills** | 1 | 0 | 0 | 1 | **2** |
| **Experimental Toys** | 0 | 2 | 2 | 5 | **9** |
| **AR Experiences** | 0 | 0 | 0 | 6 | **6** |
| **AI-Powered** | 0 | 0 | 0 | 5 | **5** |
| **Multiplayer** | 0 | 0 | 0 | 5 | **5** |
| **TOTAL** | **21** | **~26** | **~63** | **~43** | **~153** |

> Note: Some games appear in multiple categories. Unique concepts across all docs: **270+** (many overlap).

---

## 9. Skill Coverage Matrix

### Developmental Domain Coverage

| Developmental Domain | Current Coverage | Target | Status |
|---------------------|-----------------|--------|--------|
| **Cognitive — Literacy** | ████████░░ 80% | 4+ games | ✅ Strong |
| **Cognitive — Numeracy** | ██████░░░░ 60% | 3+ games | 🟡 Adequate |
| **Cognitive — Logic/Problem-Solving** | ░░░░░░░░░░ 0% | 3+ games | 🔴 CRITICAL GAP |
| **Cognitive — Memory** | ██░░░░░░░░ 20% | 2+ games | 🟠 Weak |
| **Physical — Fine Motor** | ██████░░░░ 60% | 3+ games | 🟡 Adequate |
| **Physical — Gross Motor** | ████████░░ 80% | 3+ games | ✅ Strong |
| **Creative — Art/Expression** | ████████░░ 80% | 2+ games | ✅ Strong (NEW) |
| **Creative — Music** | ██████░░░░ 60% | 2+ games | 🟡 Adequate |
| **Social-Emotional** | ██░░░░░░░░ 20% | 2+ games | 🟠 Weak |
| **Knowledge — Science** | ██░░░░░░░░ 20% | 2+ games | 🟠 Weak |
| **Knowledge — World** | ░░░░░░░░░░ 0% | 2+ games | 🔴 CRITICAL GAP |
| **Life Skills** | █░░░░░░░░░ 10% | 2+ games | 🔴 GAP (unlisted!) |

### CV Modality Usage

| CV System | Games Using It | Potential |
|-----------|---------------|-----------|
| **Hand Tracking** | 16 games | Core interaction — well utilized |
| **Pose Tracking** | 3 games | Underutilized — only movement games |
| **Face/Eye Tracking** | 1 game (background wellness) | **Massively underutilized** — invisible to kids |
| **Combined (2+ systems)** | 0 games | **Biggest missed opportunity** |

---

## 10. Technology Capabilities

### What We Can Build With Today

| Capability | Status | Games That Use It |
|-----------|--------|-------------------|
| Hand landmark detection (21 points) | ✅ Working | 16 games |
| Pinch detection | ✅ Working | ShapePop, ColorMatch, NumberTap, Phonics |
| Finger extension counting | ✅ Working | Finger Number Show |
| Finger tip position tracking | ✅ Working | Air Canvas, Mirror Draw, AlphabetGame |
| Hand velocity / shake detection | ✅ Working | Air Canvas (clear gesture) |
| Pose detection (33 keypoints) | ✅ Working | Yoga, Freeze Dance, Simon Says |
| Face/eye tracking | ✅ Working | Wellness monitoring (hidden) |
| Canvas 2D rendering | ✅ Working | Air Canvas, Mirror Draw, most games |
| Web Audio API synthesis | ✅ Working | Music Pinch Beat, Phonics Sounds |
| Speech synthesis (TTS) | ✅ Working | Phonics Sounds, various feedback |
| Asset preloading | ✅ Working | All games |
| Celebration overlays | ✅ Working | All games |
| Multi-language support | ✅ Working | Alphabet Tracing |

### What We Could Add

| Capability | Effort | Enables |
|-----------|--------|---------|
| Combined hand + pose tracking | 1 week | Yoga + tracing, dance + fingers |
| Microphone input (blow/clap detection) | 3 days | Bubbles, rhythm clap, voice games |
| Physics engine (Matter.js) | 1 week | Particle playground, bowling, archery |
| 3D rendering (Three.js) | 2 weeks | Sculpting, solar system, molecules |
| AI image generation | 2 weeks | Doodle-to-image, story illustration |
| Multi-camera support | 1 week | AR experiences with external camera |
| Pitch detection | 1 week | Singing games, pitch match |
| Haptic feedback (vibration) | 2 days | Mobile tactile feedback |

---

## 11. Source Documents

All game ideas in this document are sourced from these files:

| Document | Content | Ideas |
|----------|---------|-------|
| `docs/GAME_ROADMAP.md` | Original roadmap with 8 detailed game designs | ~8 |
| `docs/GAME_IDEAS_CATALOG.md` | Full catalog of 67+ game ideas across all categories | ~67 |
| `docs/FUN_FIRST_GAMES_CATALOG.md` | Fun-first creative games: drawing, music, sports, experiments | ~40 |
| `docs/COMPREHENSIVE_INNOVATIVE_GAMES_CATALOG.md` | AR, science, nature, logic, multiplayer concepts | ~50 |
| `docs/COMPLETE_GAME_ACTIVITIES_CATALOG.md` | Synthesis document with 270+ total activities | ~270 |
| `docs/MUSIC_LEARNING_AR_GAMES.md` | 55 music and AR music game concepts | ~55 |
| `docs/GAME_IMPROVEMENT_MASTER_PLAN.md` | Improvement plan for existing 13 games + planned 7 | ~20 |
| `docs/GAMES-CRITICAL-ASSESSMENT-20260216.md` | Critical assessment of fun factor + combined CV vision | ~10 |
| `docs/plans/NEXT_3_GAMES_PLAN.md` | Implementation plan for Air Canvas, Mirror Draw, Phonics | 3 |

---

## Recommended Next Moves

### Immediate (This Week)

1. **Add Bubble Pop Symphony + Dress For Weather to Games.tsx gallery** — 2 free games hiding in the codebase
2. **Build Story Sequence** — fills the #1 critical gap (Logic/Reasoning), 1 week effort, design exists in GAME_ROADMAP.md
3. **Build Simple Addition (Math Monsters)** — fills #2 critical gap (Math Operations)

### Short-Term (Next 2 Weeks)

4. **Build Shape Safari** — fills shapes gap, reuses canvas + tracing infra
5. **Build Rhyme Time** — strengthens literacy with phonological awareness
6. **Build Particle Playground** — pure fun, showcases CV magic, zero-frustration toy

### Medium-Term (Next Month)

7. **Implement combined CV game** (Freeze Dance + Fingers) — biggest "wow" opportunity
8. **Make face/eye tracking visible** — attention meter as gameplay element
9. **Build first AR prototype** — AR Science Lab on real table

---

*This document consolidates ALL game-related planning, ideas, and explorations from the codebase into one master reference. See individual source docs for detailed designs.*

*Last Updated: 2026-02-22*
