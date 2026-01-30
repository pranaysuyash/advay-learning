# Content Library Index

**Quick reference guide to all learning content documentation.**

---

## 📚 Primary Content Documents

| Document | Purpose | Key Content |
|----------|---------|-------------|
| **GAME_CATALOG.md** | Master activity library | 48+ games organized by domain, 8 core patterns, MVP recommendations |
| **GAME_MECHANICS.md** | Core gameplay systems | Scoring, feedback, progression, anti-frustration, rewards |
| **GAME_ENHANCEMENTS_IDEAS.md** | Visual effects & interactions | Virtual brushes, particles, 3D, gestures, power-ups |
| **GESTURE_TEACHING_IDEAS.md** | Cultural gestures & body language | Namaste, head wobble, ISL, universal gestures |
| **LEARNING_PLAN.md** | Educational progression | Age bands, skill areas, mastery criteria, content sequencing |
| **AGE_BANDS.md** | Age-specific guidance | 3-4, 5-6, 7-8, 9+ age groups with appropriate activities |

---

## 🎮 Quick Game Finder

### By Learning Domain

| Skill Area | Catalog Section | # of Games | Key Activities |
|------------|-----------------|------------|----------------|
| Pre-writing & Fine Motor | A | 6 | Air Tracing, Maze Walk, Connect Dots |
| Alphabets & Phonics | B | 5 | Letter Hunt, Build a Word, Sight Word Pop |
| Numbers & Math | C | 7 | Finger Count, Count & Drag, Make 10 |
| Colors & Sorting | D | 7 | Sort by Color, Pattern Builder, Paint Mixer |
| Language Learning | E | 5 | Bilingual Mode, Action Verbs, Prepositions |
| Gross Motor | F | 5 | Simon Says, Freeze Dance, Yoga Animals |
| Social-Emotional | G | 2 | Expression Mirror, Feelings Story |
| Creativity | H | 3 | Magic Backgrounds, Silhouette Painting |
| Logic & Memory | I | 4 | Gesture Sequence, Memory Match |
| STEM | J | 4 | Space Clean-up, Underwater Bubbles |

### By Core Pattern

| Pattern | Games Using It | Difficulty Knobs |
|---------|---------------|------------------|
| Touch Targets | Letter Hunt, Balloon Pop, Odd One Out | Target size, speed, distractors |
| Drag & Drop | Sort by Color, Count & Drag, Feed Animals | Categories, moving targets, penalties |
| Trace Paths | Air Tracing, Maze Walk, Number Tracing | Tolerance, stroke order, complexity |
| Hold Still | Steady Hand, Balance, Freeze Dance | Duration, tolerance, distractions |
| Match Pose | Simon Says, Yoga Animals, Action Verbs | Angle tolerance, hold time |
| Sequence Memory | Gesture Sequence, Pattern Builder | Sequence length, speed |
| Catch & Avoid | Jungle Fruit Run, Bubble Pop | Spawn rate, speed, distractors |
| Scavenger Hunt | Color Hunt, Object Finder | Hint strength, time limit |

---

## ✨ Enhancement Quick Reference

### Virtual Brushes
| Brush | Effect | Best For |
|-------|--------|----------|
| Magic Wand | Sparkle trail | Letter tracing |
| Crayon | Waxy texture | Pre-writing |
| Rainbow Brush | Color cycling | Creative mode |
| Spray Can | Particle scatter | Art activities |

### Particle Effects
| Effect | Trigger | Mood |
|--------|---------|------|
| Sparkle Trail | Drawing | Magic |
| Confetti | Success | Celebration |
| Fireflies | Idle | Calm |
| Bubbles | Movement | Playful |

### Gesture Interactions
| Gesture | Action | Game Use |
|---------|--------|----------|
| Clap | Confirm/Celebrate | Trigger success |
| Wave | Dismiss/Navigate | Menu control |
| Hands Far | Zoom out | Overview mode |
| Hands Close | Zoom in | Detail view |

---

## 🚀 MVP Priority Queue

**Ship These First** (8 games, maximum impact):

1. **Finger Paint Trace** - Pre-writing, hand tracking
2. **Pick and Drop Sort** - Colors, categorization
3. **Balloon Pop** - Recognition + fun
4. **Simon Says Body** - Following instructions
5. **Freeze Dance** - Motor + self-control
6. **Finger Count Show Me N** - Number sense
7. **Maze Finger Walk** - Control + planning
8. **Magic Background Story Mode** - Creativity + "wow"

**Coverage**: Writing, math, colors, motor, creativity

---

## 🎨 Enhancement Implementation Priority

### Phase 1: Quick Wins (1-2 weeks)
- ✨ Sparkle trail effect → **TCK-20260129-402**
- 🎨 3-5 basic brushes → **TCK-20260129-403**
- 🎉 Confetti burst on success → **TCK-20260129-404**
- 🎈 Simple particles → **TCK-20260129-405**

### Phase 2: Enhanced (2-4 weeks)
- 🖐️ Virtual hand overlay
- 🌈 Rainbow trails
- 🎵 Audio-reactive elements
- 🏆 Combo system

### Phase 3: Advanced (1-2 months)
- 🎮 3D object manipulation
- 🎭 Multi-hand games → **TCK-20260129-406**
- 🌟 Complex particles
- 🎪 Transformation animations

### Implementation Tickets
| Ticket | Feature | Priority |
|--------|---------|----------|
| TCK-20260129-402 | Sparkle Trail Effect | P1 |
| TCK-20260129-403 | Virtual Brush Selector | P1 |
| TCK-20260129-404 | Confetti Success Effects | P1 |
| TCK-20260129-405 | Ambient Particle System | P2 |
| TCK-20260129-406 | Hand Distance Zoom | P2 |

---

## 📖 Lesson Packs

| Pack | Duration | Focus | Key Games |
|------|----------|-------|-----------|
| 1. Fine Motor | 2-4 weeks | Control, confidence | Tracing, Mazes, Sorting |
| 2. Letters & Sounds | 4-8 weeks | Recognition, phonics | Letter Hunt, Tracing, Word Builder |
| 3. Numbers & Counting | 4-8 weeks | Number sense | Finger Count, Drag N items |
| 4. Colors & Patterns | Ongoing | Categorization, logic | Sorting, Patterns, Odd One Out |
| 5. Movement | Ongoing | Comprehension, coordination | Simon Says, Action Verbs |
| 6. Multilingual | Layer | Cross-language mapping | All games with bilingual prompts |

---

## 🛠️ Implementation Resources

### Prompts
- `prompts/content/game-design-prompt-v1.0.md` - Generate new game ideas

### Specifications
- `docs/features/specs/001-hand-tracking-basics.md`
- `docs/features/specs/002-number-tracing-game.md`

### Enhancement Guides
- `docs/GAME_ENHANCEMENTS_IDEAS.md` - 50+ visual/interaction ideas

### Technical Architecture
- MediaPipe Tasks (Hands, Pose, Face, Segmentation)
- React frontend + FastAPI backend
- Local processing (no cloud for gameplay)
- Canvas 2D (current) → Three.js (future 3D)

---

## 🎯 Content Generation Workflow

1. **Need new game?** Use `prompts/content/game-design-prompt-v1.0.md`
2. **Check existing** - Search GAME_CATALOG.md
3. **Select pattern** - Choose from 8 core patterns
4. **Add enhancements** - Pick from GAME_ENHANCEMENTS_IDEAS.md
5. **Define progression** - Which lesson pack?
6. **Document** - Add to GAME_CATALOG.md

---

## 📊 Content Metrics

| Metric | Count |
|--------|-------|
| Total Game Ideas | 48+ |
| Core Patterns | 8 |
| Learning Domains | 10 |
| Lesson Packs | 6 |
| MVP Games | 8 |
| Enhancement Ideas | 50+ |
| Virtual Brush Types | 10 |
| Particle Effects | 10+ |
| Supported Languages | 5 (EN, HI, KN, TE, TA) |

---

## 🔗 Related Documentation

- **Vision**: VISION_AI_NATIVE_LEARNING.md, UX_VISION_CLAUDE.md
- **Safety**: docs/security/SECURITY.md, docs/ai-native/SAFETY_GUIDELINES.md
- **Technical**: ARCHITECTURE.md, GAME_MECHANICS.md
- **Enhancements**: GAME_ENHANCEMENTS_IDEAS.md
- **Gestures**: GESTURE_TEACHING_IDEAS.md
- **Branding**: BRAND_KIT.md (primary), BRAND_NAMING_EXPLORATION.md, BRAND_ARCHITECTURE_COMPLETE.md
- **Project Status**: PROJECT_STATUS.md, WORKLOG_TICKETS.md

---

*Quick reference for content planning and game design*
*Last updated: 2026-01-30*
