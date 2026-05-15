# Game Audit & Spec Creation Plan

**Date:** 2026-04-01  
**Scope:** A, B, E - Game Specs, Cross-Game Analysis, Category Focus  
**Target:** 10 flagship games + cross-game patterns + 3D World focus

---

## Phase 1: Flagship Game Specs (A)

### Selected Games (Representative Sample)

| # | Game | World | Why Selected | Priority |
|---|------|-------|--------------|----------|
| 1 | **Alphabet Tracing** | Letter Land | ✅ Reference implementation | DONE |
| 2 | **Emoji Match** | Wellness | Has detailed audit, voice features | P0 |
| 3 | **Digital Jenga** | 3D World | Flagship 3D game, physics | P0 |
| 4 | **Air Guitar Hero** | Word Workshop | Music/creative, unique mechanics | P1 |
| 5 | **Shape Pop** | Shape Garden | Simple/popular, good pattern | P1 |
| 6 | **Math Jumpers** | Number Jungle | Active/educational hybrid | P1 |
| 7 | **Freeze Dance** | Body Zone | Pose-based (different CV mode) | P1 |
| 8 | **Bubble Pop Symphony** | Sound Studio | Musical, auditory feedback | P2 |
| 9 | **Obstacle Course 3D** | 3D World | Active 3D, different from Jenga | P2 |
| 10 | **Feed the Monster 3D** | 3D World | Educational 3D, different vibe | P2 |

### Spec Template (23 Sections)
1. Concept Summary
2. Repo Status
3. Current Implementation
4. Intended Design
5. Drift Analysis
6. Recommended Canonical Version
7. Visual Identity
8. Screen Map
9. Controls
10. Core Mechanics
11. Rules
12. HUD / Gameplay UI
13. Feedback and Feel
14. Points / Rewards / Progression
15. End States
16. Parallel Modes / Alternate Implementations
17. Improvement Opportunities
18. Content Model
19. Technical Structure
20. Gaps and Unknowns
21. Implementation Notes
22. Acceptance Criteria
23. Test Plan

---

## Phase 2: Cross-Game Analysis (B)

### Analysis Areas

#### 1. Shared Components Audit
- Common hooks (useGameHandTracking, etc.)
- Shared UI components (GameContainer, GameShell)
- Common utilities (coordinate transforms, pinch detection)
- Shared stores (progress, settings)

#### 2. Pattern Inconsistencies
- Different pause menu implementations
- Inconsistent scoring systems
- Varied tutorial approaches
- Different celebration patterns
- Inconsistent CV cursor behavior

#### 3. Control Schemes
- Hand tracking variations
- Pinch vs hover vs other gestures
- Fallback input methods (or lack thereof)
- Accessibility support gaps

#### 4. Visual Language
- UI consistency (buttons, menus, HUD)
- Color schemes
- Animation patterns
- Feedback timing

#### 5. Educational Patterns
- Progress tracking approaches
- Difficulty scaling
- Learning objective clarity
- Age appropriateness

#### 6. Technical Patterns
- State management approaches
- Canvas vs DOM rendering
- 3D vs 2D implementation differences
- Asset loading patterns

### Output: SHARED_PATTERNS.md
- Pattern catalog
- Recommended standards
- Refactoring opportunities

---

## Phase 3: 3D World Deep Dive (E)

### Why 3D World?
- Newest game category (cutting edge)
- Different technical stack (Three.js, Rapier)
- 11 games with shared patterns
- High production value target

### 3D Games to Analyze

| Game | Type | Unique Aspects |
|------|------|----------------|
| Digital Jenga | Physics puzzle | Stack stability, balance |
| Obstacle Course 3D | Platformer | Movement, jumping, dodging |
| Feed the Monster 3D | Educational | Feeding mechanics, monster AI |
| Dress for Weather 3D | Creative | Character dressing, weather |
| Bubble Pop 3D | Casual | Bubble physics, popping |
| Color Match Garden 3D | Matching | 3D spatial matching |
| Shape Safari 3D | Educational | Shape finding in 3D |
| Cutting Practice 3D | Precision | Slicing mechanics |
| Virtual Bubbles 3D | Casual | Float physics |
| Counting Collectathon 3D | Educational | Collection mechanics |
| Pattern Pop 3D | Pattern | 3D pattern recognition |

### Analysis Focus
- Three.js + React Three Fiber patterns
- Rapier physics integration
- 3D CV interaction (depth perception)
- Performance considerations
- Asset management (models, textures)
- Common 3D components

### Output: 3D_WORLD_PATTERNS.md
- 3D-specific patterns
- Shared 3D components
- Performance best practices
- Common pitfalls

---

## Execution Order

### Sprint 1: Foundation (Today)
1. ✅ Alphabet Tracing spec (DONE)
2. Emoji Match spec
3. Digital Jenga spec
4. Begin cross-game component audit

### Sprint 2: Core Games (Next)
5. Air Guitar Hero spec
6. Shape Pop spec
7. Math Jumpers spec
8. Continue cross-game analysis

### Sprint 3: Variety (Next)
9. Freeze Dance spec (pose-based)
10. Bubble Pop Symphony spec (musical)
11. Obstacle Course 3D spec
12. Feed the Monster 3D spec

### Sprint 4: Analysis Complete
13. Finalize SHARED_PATTERNS.md
14. Finalize 3D_WORLD_PATTERNS.md
15. Create game comparison matrix
16. Document improvement priorities

---

## Success Criteria

- [ ] 10 flagship game specs complete (23 sections each)
- [ ] SHARED_PATTERNS.md with actionable recommendations
- [ ] 3D_WORLD_PATTERNS.md with technical guidance
- [ ] Cross-game inconsistency list
- [ ] Improvement priority ranking

---

## Estimated Effort

| Task | Games/Files | Time Each | Total |
|------|-------------|-----------|-------|
| Game Specs | 9 remaining | 30 min | 4.5 hrs |
| Cross-Game Analysis | 1 doc | - | 2 hrs |
| 3D World Focus | 1 doc | - | 1.5 hrs |
| **Total** | | | **8 hrs** |

---

## Progress Tracking

| Game | Status | File |
|------|--------|------|
| Alphabet Tracing | ✅ DONE | `specs/alphabet-tracing.md` |
| Emoji Match | 🔄 NEXT | `specs/emoji-match.md` |
| Digital Jenga | ⏳ QUEUED | `specs/digital-jenga.md` |
| Air Guitar Hero | ⏳ QUEUED | `specs/air-guitar-hero.md` |
| Shape Pop | ⏳ QUEUED | `specs/shape-pop.md` |
| Math Jumpers | ⏳ QUEUED | `specs/math-jumpers.md` |
| Freeze Dance | ⏳ QUEUED | `specs/freeze-dance.md` |
| Bubble Pop Symphony | ⏳ QUEUED | `specs/bubble-pop-symphony.md` |
| Obstacle Course 3D | ⏳ QUEUED | `specs/obstacle-course-3d.md` |
| Feed the Monster 3D | ⏳ QUEUED | `specs/feed-the-monster-3d.md` |

---

## Next Action

Start with **Emoji Match** - has existing audit data to build from.
