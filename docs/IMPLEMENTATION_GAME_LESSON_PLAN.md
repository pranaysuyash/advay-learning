# Game & Lesson Implementation Plan

**Last Updated:** 2026-02-16

---

## Executive Summary

This document outlines the implementation plan for adding new games and organizing them into lesson packs/curriculum.

**Current Status:**

- ✅ 10 games implemented and available
- 📋 100+ games documented in catalogs
- 🎯 Focus: Implement quick-win games + create lesson pack structure

---

## Part 1: Currently Implemented Games (10)

| #   | Game                            | Path                        | Category     | Status  |
| --- | ------------------------------- | --------------------------- | ------------ | ------- |
| 1   | Draw Letters (Alphabet Tracing) | `/games/alphabet-tracing`   | Alphabets    | ✅ Live |
| 2   | Finger Counting                 | `/games/finger-number-show` | Numbers      | ✅ Live |
| 3   | Connect Dots                    | `/games/connect-the-dots`   | Drawing      | ✅ Live |
| 4   | Letter Hunt                     | `/games/letter-hunt`        | Alphabets    | ✅ Live |
| 5   | Music Pinch Beat                | `/games/music-pinch-beat`   | Music        | ✅ Live |
| 6   | Steady Hand Lab                 | `/games/steady-hand-lab`    | Motor Skills | ✅ Live |
| 7   | Shape Pop                       | `/games/shape-pop`          | Shapes       | ✅ Live |
| 8   | Color Match Garden              | `/games/color-match-garden` | Colors       | ✅ Live |
| 9   | Number Tap Trail                | `/games/number-tap-trail`   | Numbers      | ✅ Live |
| 10  | Shape Sequence                  | `/games/shape-sequence`     | Memory       | ✅ Live |

---

## Part 2: Priority Games to Implement

### Phase 1: Quick Wins (1-2 weeks)

| #   | Game                    | Pattern                      | Effort    | Priority |
| --- | ----------------------- | ---------------------------- | --------- | -------- |
| 1   | **Yoga Animals**        | Match Pose                   | 2 weeks   | P0       |
| 2   | **Freeze Dance**        | Hold Still                   | 1 week    | P0       |
| 3   | **Simon Says Body**     | Sequence Memory + Match Pose | 1.5 weeks | P1       |
| 4   | **Bubble Pop Symphony** | Touch Targets                | 1.5 weeks | P1       |
| 5   | **Dress for Weather**   | Drag & Drop                  | 1 week    | P1       |

### Phase 2: Medium Effort (2-3 weeks)

| #   | Game                         | Pattern             | Effort    |
| --- | ---------------------------- | ------------------- | --------- |
| 6   | Festival Games (Diwali/Holi) | Cultural + Canvas   | 2 weeks   |
| 7   | Shadow Puppets               | Hand shape analysis | 2 weeks   |
| 8   | Light Painter                | Canvas effects      | 1.5 weeks |
| 9   | Sign Language Basics         | Hand shapes         | 2 weeks   |

### Phase 3: Larger Projects (3-4 weeks)

| #   | Game                       | Pattern                  | Effort  |
| --- | -------------------------- | ------------------------ | ------- |
| 10  | Space/Underwater Adventure | Rich environments        | 3 weeks |
| 11  | Hand Puppet Theater        | Multi-hand tracking      | 3 weeks |
| 12  | Mudra Master               | Complex hand recognition | 3 weeks |
| 13  | Co-Draw                    | Multiplayer sync         | 2 weeks |

---

## Part 3: Lesson Packs (Curriculum Structure)

Based on `GAME_CATALOG.md` lesson packs:

### Pack 1: Fine Motor Foundations (2-4 weeks)

**Goal:** Better control, less frustration, readiness for letters

Activities:

- [ ] Trace shapes (existing: Alphabet Tracing)
- [ ] Maze finger walk
- [ ] Drag-drop sorting (2 buckets)
- [ ] Hold still mini-game (existing: Steady Hand Lab)
- [ ] Pinch Control Drills

### Pack 2: Letters & Sounds (4-8 weeks)

**Goal:** Letter recognition and early phonics

Activities:

- [ ] Letter hunt (existing)
- [ ] Trace uppercase (existing: Alphabet Tracing)
- [ ] Match letter to object
- [ ] Simple 3-letter word builder
- [ ] Phonics Sounds
- [ ] Rhyme Time

### Pack 3: Numbers & Counting (4-8 weeks)

**Goal:** Counting, quantity sense

Activities:

- [ ] Finger show number (existing: Finger Counting)
- [ ] Drag exactly N items
- [ ] Compare quantities
- [ ] Number line movement
- [ ] Number Tracing
- [ ] Make 10

### Pack 4: Colors, Shapes, Patterns (ongoing)

**Goal:** Categorization, early logic

Activities:

- [ ] Sort by color (existing: Color Match Garden)
- [ ] Sort by shape (existing: Shape Pop)
- [ ] Odd one out
- [ ] Pattern continuation (existing: Shape Sequence)
- [ ] Color Scavenger Hunt

### Pack 5: Movement & Listening (ongoing)

**Goal:** Comprehension, coordination, attention

Activities:

- [ ] Simon Says (NEW)
- [ ] Action verbs
- [ ] Freeze Dance (NEW)
- [ ] Yoga Animals (NEW)

### Pack 6: Multilingual Mode (layer on top)

**Goal:** Vocabulary and instruction mapping across languages

Activities: Same activities, prompts in rotation

- English, Hindi, Kannada, Telugu, Tamil

---

## Part 4: Implementation Checklist

### New Games to Add to Games.tsx

```typescript
// Add these to availableGames array in Games.tsx
{
  id: 'yoga-animals',
  title: 'Yoga Animals',
  description: 'Copy animal poses with Pip! 🦁',
  path: '/games/yoga-animals',
  icon: 'activity',
  ageRange: '3-6 years',
  category: 'Motor Skills',
  difficulty: 'Easy',
},
{
  id: 'freeze-dance',
  title: 'Freeze Dance',
  description: 'Dance and freeze when the music stops! 💃',
  path: '/games/freeze-dance',
  icon: 'music',
  ageRange: '2-6 years',
  category: 'Motor Skills',
  difficulty: 'Easy',
},
{
  id: 'simon-says',
  title: 'Simon Says',
  description: 'Follow Pip\'s body movements! 🏃',
  path: '/games/simon-says',
  icon: 'target',
  ageRange: '3-7 years',
  category: 'Memory',
  difficulty: 'Medium',
},
```

### Lesson Pack Structure

```
/lesson-packs
  /fine-motor
  /letters-sounds
  /numbers-counting
  /colors-shapes
  /movement-listening
  /multilingual
```

---

## Part 5: Technical Implementation Notes

### Core Patterns (Build Once, Reskin Forever)

All games are built from 8 core interaction primitives:

| Pattern         | MediaPipe Feature    | Games Using It                     |
| --------------- | -------------------- | ---------------------------------- |
| Touch Targets   | Hand Landmarker      | Letter Hunt, Shape Pop, Bubble Pop |
| Drag & Drop     | Hand Landmarker      | Color Match, Dress for Weather     |
| Trace Paths     | Hand Landmarker      | Alphabet Tracing, Connect Dots     |
| Hold Still      | Hand/Pose Landmarker | Steady Hand, Freeze Dance          |
| Match Pose      | Pose Landmarker      | Yoga Animals, Simon Says           |
| Sequence Memory | Hand/Pose Landmarker | Shape Sequence, Simon Says         |
| Catch & Avoid   | Hand Landmarker      | Bubble Pop                         |
| Scavenger Hunt  | Segmentation         | Color Hunt                         |

### MediaPipe Integration

- **Hand Landmarker** (21 keypoints): All touch, drag, trace, pinch games
- **Pose Landmarker** (33 keypoints): Body games, Simon Says, balance
- **Face Landmarker** (468+ points): Expression mirror (future)

---

## Part 6: Next Steps

1. **Immediate:** Implement Phase 1 quick-win games (Yoga Animals, Freeze Dance, Simon Says)
2. **Create lesson pack pages** in the app to organize games by learning goal
3. **Add progress tracking** per lesson pack
4. **Add multilingual support** to new games

---

## Related Documentation

- `docs/GAME_CATALOG.md` - Full game catalog by domain
- `docs/COMPLETE_GAME_ACTIVITIES_CATALOG.md` - 100+ game ideas
- `docs/LEARNING_PLAN.md` - Learning progression
- `docs/AGE_BANDS.md` - Age-appropriate activities
- `docs/GAME_MECHANICS.md` - Game design patterns
