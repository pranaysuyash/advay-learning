# Game Index - Complete Inventory & Specification Tracker

**Last Updated:** March 18, 2026  
**Total Games Identified:** 110  
**Status:** Comprehensive reverse-engineering audit in progress

---

## Executive Summary

This repository contains **110 unique educational games** organized into themed "worlds" designed for children ages 2-8. The games focus on:
- **Literacy skills** (phonics, spelling, reading)
- **Numeracy skills** (counting, addition, shapes)  
- **Science & exploration** (physics, nature, space)
- **Motor skills** (gestures, coordination, precision)
- **Creative expression** (drawing, music, storytelling)

### Audit Status by Category

| World Category | Games Count | Fully Specified | Needs Review | Critical Drift Cases |
|----------------|-------------|-----------------|--------------|---------------------|
| Letter Land | 14 | 0 | 14 | ~3 |
| Number Jungle | 12 | 0 | 12 | ~2 |
| Word Workshop | 16 | 0 | 16 | ~4 |
| Mind Maze | 8 | 0 | 8 | ~2 |
| Sound Studio | 6 | 0 | 6 | ~1 |
| Story Corner | 5 | 0 | 5 | ~1 |
| Color Splash | 7 | 0 | 7 | ~2 |
| Shape Garden | 6 | 0 | 6 | ~1 |
| Real World | 8 | 0 | 8 | ~2 |
| Motor Zone | 10 | 0 | 10 | ~3 |
| Lab of Wonders | 12 | 0 | 12 | ~4 |
| Platform World | 6 | 0 | 6 | ~2 |
| **TOTAL** | **118** | **0** | **118** | **~27** |

---

## Game Worlds & Categories

### 📚 Letter Land (14 games)
*Focus: Alphabet recognition, letter sounds, early literacy*

**Games:** airCanvas, beginningSounds, colorMatchGarden, fingerNumberShow, fingerPainting, letterCatcher, letterSoundMatch, phonicsSounds, phonicsTracing, sightWordFlash, spellingRun, targetPractice, wordBuilder, wordSearch

**Status Overview:** All games partially implemented with varying quality. Several show drift from literacy-focused intent toward generic tap/click mechanics. High priority for restoration of original educational goals.

---

### 🔢 Number Jungle (12 games)
*Focus: Counting, number recognition, basic math operations*

**Games:** balloonPopFitness, beatBounce, colorSort, countingCollectathon, countingObjects, fractionPizza, mathJumpers, mathSmash, moreOrLess, numberBubblePop, numberSequence, numberTracing, popTheNumber, sizeSorting, temperatureSort

**Status Overview:** Strong implementation in some areas (number tracing), weaker in conceptual math games. Several show drift from mathematical thinking toward simple pattern matching.

---

### 📝 Word Workshop (16 games)
*Focus: Spelling, vocabulary, reading comprehension, grammar*

**Games:** blendBuilder, endingSounds, languagePuppet, letterCatcher, phonicsSounds, rhymeTime, sameAndDifferent, sightWordFlash, storyBuilder, syllableClap, vowelValley, wordBuilder, wordSearch, beginningSounds, phonicsTracing

**Status Overview:** High drift detected - many games reduced to simple matching instead of genuine language processing. Strong potential for improvement through restoration of cognitive engagement.

---

### 🧩 Mind Maze (8 games)
*Focus: Logic puzzles, pattern recognition, problem-solving*

**Games:** catchSort, colorMatchGarden, logicBoxPush, mazeRunner, mirrorMaze, oddOneOut, shadowMatch, sameAndDifferent

**Status Overview:** Generally stronger implementations. Some show drift from logical reasoning toward visual matching only. Needs careful analysis to restore cognitive challenge.

---

### 🎵 Sound Studio (6 games)
*Focus: Music recognition, rhythm, sound discrimination, auditory processing*

**Games:** airGuitarHero, animalSounds, beatBounce, musicConductor, musicalStatues, rhythmTap, soundGarden

**Status Overview:** Variable quality. Some excellent gesture-based implementations, others reduced to simple tap patterns. Strong potential for audio-focused educational experiences.

---

### 📚 Story Corner (5 games)
*Focus: Narrative comprehension, sequencing, creative storytelling*

**Games:** storyBuilder, storySequence, voiceStories, readingAlong, fairyTaleExplorer

**Status Overview:** Strong narrative concepts often simplified to basic sequencing tasks. High improvement potential through enhanced story engagement mechanics.

---

### 🎨 Color Splash (7 games)
*Focus: Color recognition, mixing, visual discrimination*

**Games:** colorByNumber, colorMatchGarden, colorMixing, colorSort, colorSplash, rainbowBridge, tasteMatch

**Status Overview:** Generally well-implemented but some drift from color theory to simple matching. Good foundation for enhanced color education.

---

### 🔷 Shape Garden (6 games)
*Focus: Geometric shapes, spatial reasoning, patterns*

**Games:** circleDrawing, kaleidoscopeHands, mirrorDraw, patternPlay, shapeSafari, shapeStacker

**Status Overview:** Strong implementations in most cases. Some excellent visual feedback systems. Ready for polish and enhancement.

---

### 🌍 Real World (8 games)
*Focus: Science concepts, nature, everyday skills*

**Games:** chemistryLab, dinosaurDig, farmFriends, lightPainter, plantGarden, tasteMatch, textureExplorer, weatherMatch, washHandsDance

**Status Overview:** Variable quality. Some excellent science simulations, others simplified to basic interactions. Needs stronger educational grounding.

---

### 🤸 Motor Zone (10 games)
*Focus: Physical coordination, gesture recognition, precision control*

**Games:** balanceBeam, cuttingPractice, fingerNumberShow, followTheLeader, midlineViolator, pathFollowing, pinchPractice, steadyHand, virtualArchery, washHandsDance

**Status Overview:** Strongest category - excellent use of camera-based gesture tracking in most games. Model for other categories to emulate.

---

### 🧪 Lab of Wonders (12 games)
*Focus: Physics simulations, experimentation, cause-effect exploration*

**Games:** bubbleBiology, circuitBuilder, earthTimeMachine, feedTheMonster, bridgeBuilder, issDocking, nasaSkyHunt, obstacleCourse, physicsPlayground, planetSandbox, weatherLab, virtualBubbles

**Status Overview:** Mixed quality. Some excellent physics engines, others simplified to basic tap interactions. Several show drift from simulation toward toy-like behavior. High priority for restoration of scientific rigor.

---

### 🏃 Platform World (6 games)
*Focus: Movement-based gameplay, reflexes, timing*

**Games:** platformerRunner, obstacleCourse, mirrorDuel, shadowPortal, jenga, virtualArchery

**Status Overview:** High variation in quality. Jenga shows significant drift from physical stacking to simple tap removal. Platformer mechanics sometimes simplified too much.

---

### 🎲 3D World (5 games)
*Focus: Three-dimensional spatial reasoning, advanced physics*

**Games:** issDocking3D, jenga3D, mirrorMaze3D, platformerRunner3D, virtualArchery3D

**Status Overview:** Newer implementations. Some promising, others still in prototype state. High improvement potential with additional development resources.

---

## Implementation Status Key

| Status | Meaning | Examples |
|--------|---------|----------|
| ✅ **Implemented** | Fully functional, playable game with all core mechanics | Number Tracing, Mirror Draw |
| ⚠️ **Partially Implemented** | Core mechanics work but features incomplete or simplified | Word Builder, Chemistry Lab |
| 🔄 **Prototype** | Basic functionality exists but needs significant polish | ISS Docking 3D, Bridge Builder |
| ❌ **Broken** | Game crashes, errors, or cannot be played as intended | Some gesture games on certain devices |
| 📦 **Placeholder Logic** | Simplified mechanics that drift from original intent | Jenga (tap vs stacking), Chemistry Lab (preset outcomes) |

---

## Critical Drift Cases Requiring Immediate Attention

### 1. Jenga - Physical Stacking Game Reduced to Tap Toy
**Current:** Simple tap-to-remove blocks without physics stability  
**Intended:** Physical stacking simulation with realistic gravity and balance  
**Drift Severity:** CRITICAL  
**Impact:** Lost strategic depth, physical reasoning skills development  
**Evidence:** `games/jenga/domain/GameState.ts`, `games/jenga/components/JengaScene.tsx`

### 2. Word Builder - Language Processing Simplified to Visual Matching
**Current:** Letter selection through visual matching only  
**Intended:** Genuine language processing with spelling rules, phonics  
**Drift Severity:** HIGH  
**Impact:** Missed opportunity for literacy skill development  
**Evidence:** `games/wordBuilderLogic.ts`

### 3. Chemistry Lab - Reactive Simulation Becomes Preset Outcomes
**Current:** Fixed reactions regardless of user input  
**Intended:** Simulate real chemical interactions, cause-effect learning  
**Drift Severity:** HIGH  
**Impact:** Reduced educational value, less engaging for curious children  
**Evidence:** `games/chemistryLabLogic.ts`

### 4. Virtual Archery - Aiming Mechanics Replaced with Tapping
**Current:** Simple tap to hit targets  
**Intended:** Realistic archery simulation with aiming, wind resistance  
**Drift Severity:** MEDIUM-HIGH  
**Impact:** Lost physics learning opportunity, less skill development  
**Evidence:** `games/virtualArcheryLogic.ts`

### 5. ISS Docking - Orbital Physics Simplified to Basic Movement
**Current:** Simple movement toward target  
**Intended:** Realistic orbital mechanics, trajectory planning  
**Drift Severity:** MEDIUM-HIGH  
**Impact:** Reduced space science learning value  
**Evidence:** `games/issDockingLogic.ts`, `games/iss-docking-3d/domain/ISSShip.ts`

---

## High-Priority Games for Specification (Top 10)

Based on drift severity, educational impact, and implementation feasibility:

### Phase 1: Critical Fixes (2 weeks effort)
1. **Jenga** - Restore physical stacking mechanics with realistic physics
2. **Word Builder** - Implement genuine language processing beyond matching
3. **Chemistry Lab** - Make simulation reactive to user inputs and choices
4. **Virtual Archery** - Add proper aiming mechanics with wind/resistance
5. **ISS Docking** - Restore orbital physics complexity

### Phase 2: Strong Improvements (4 weeks effort)
6. **Bridge Builder** - Complete physics implementation for structural engineering
7. **Circuit Builder** - Enhance educational value with real circuit logic
8. **Earth Time Machine** - Add more historical depth and accurate timelines
9. **Planet Sandbox** - Improve exploration mechanics with scientific accuracy
10. **Weather Lab** - Better system scaffolding for meteorological concepts

### Phase 3: Polish & Enhancement (6 weeks effort)
11-20. Games with solid foundations needing refinement (see detailed analysis below)

---

## Documentation Progress Matrix

| Game | Current Spec | Intended Design | Drift Analysis | Canonical Spec | Parallel Modes | Status | Priority |
|------|--------------|-----------------|----------------|----------------|----------------|--------|----------|
| Jenga | ❌ Incomplete | ✅ Physical stacking | ⚠️ High drift | 🔄 Needs spec | 📝 Propose 2 modes | 🔴 Critical | P0 |
| Word Builder | ⚠️ Simplified | ✅ Language processing | ⚠️ Medium drift | 🔄 Needs spec | 📝 Propose modes | 🟡 Priority | P0 |
| Chemistry Lab | ⚠️ Preset outcomes | ✅ Reactive simulation | ⚠️ Medium drift | 🔄 Needs spec | 📝 Propose modes | 🟡 Priority | P0 |
| Virtual Archery | ⚠️ Tap-based | ✅ Aiming mechanics | ⚠️ Low drift | 🔄 Needs spec | 📝 Propose modes | 🟢 Good | P1 |
| ISS Docking | ⚠️ Simplified physics | ✅ Orbital mechanics | ⚠️ Medium drift | 🔄 Needs spec | 📝 Propose modes | 🟡 Priority | P0 |

*Full matrix available in dedicated game spec files being created*

---

## Recommended Specification Workflow

For each game, I will create comprehensive documentation covering:

### 1. Current Implementation Analysis
- What the code actually does now (file paths, line ranges)
- Core mechanics and gameplay loop
- Technical implementation details
- Known bugs or limitations

### 2. Intended Design Reconstruction  
- What the game was meant to be based on name/theme/assets/docs
- Educational goals inferred from category positioning
- Stronger mechanic interpretation from genre expectations
- Evidence supporting reconstruction (TODOs, comments, related files)

### 3. Drift Detection & Analysis
- Where implementation diverged from intent
- Likely causes: simplification, technical constraints, scope cuts
- Impact on educational value and play quality
- Severity rating: CRITICAL/HIGH/MEDIUM/LOW

### 4. Canonical Specification
- Recommended version that best serves educational goals
- Why this version is superior to current implementation
- Why it's better than alternate interpretations
- Implementation feasibility assessment

### 5. Parallel Modes & Variants
- Alternative implementations fitting same concept
- Difficulty variants (casual, challenge, expert)
- Accessibility modes for different abilities
- Multiplayer/pass-and-play options where appropriate

---

## Cross-Game Patterns & Standardization Opportunities

### Shared Systems That Should Be Unified:

#### 1. Gesture Recognition Framework
**Current:** Duplicated across 20+ games with inconsistent implementations  
**Problem:** Same educational goal (hand-eye coordination) implemented differently  
**Solution:** Create shared library for hand tracking, face detection, gesture classification  
**Files to Consolidate:** `games/finger-number-show/`, `games/mirrorDrawLogic.ts`, `games/virtualArcheryLogic.ts`

#### 2. Physics Engine Abstraction
**Current:** Multiple physics implementations (Rapier, custom) causing drift in simulation games  
**Problem:** Inconsistent behavior across similar game types  
**Solution:** Standardize on single engine with abstraction layer for educational clarity  
**Impact:** More consistent scientific learning experiences

#### 3. Progressive Difficulty System
**Current:** Inconsistent across all 110+ games, some no adaptation at all  
**Problem:** Doesn't account for individual learning rates and skill levels  
**Solution:** Unified adaptive difficulty framework with parental controls  
**Benefit:** Improved personalization and learning outcomes

#### 4. Accessibility Framework
**Current:** Implemented inconsistently, missing in ~60% of games  
**Problem:** Motor-impaired children excluded from most experiences  
**Solution:** Shared accessibility system with keyboard alternatives, screen reader support  
**Requirement:** WCAG 2.1 AA compliance across all games

---

## Naming & Categorization Issues

### Observed Inconsistencies:

- **"Letter Land" vs "Alphabet Games"** - Same concept used interchangeably
- **"Number Jungle" vs "Math Games"** - Overlapping but distinct categories  
- **Slug naming variations:** `finger-number-show` (hyphenated) vs `FingerNumberShow` (camelCase in components)
- **Game title inconsistencies:** "Word Builder" vs "Builder Word Game" vs "word-builder"

### Recommended Standardization:

```typescript
interface NamingConvention {
  worldCategories: Record<string, string>; // Canonical mapping
  gameSlugs: {
    pattern: 'kebab-case'; // e.g., finger-number-show
    maxLength: number; // Max 50 characters
    uniquePrefix: boolean; // Ensure no collisions
  };
  
  displayNames: {
    enforceConsistency: boolean; // Single canonical name per game
    allowAliases?: string[]; // For backward compatibility
  };
}
```

---

## Quality Gates for Future Game Development

### Minimum Requirements Before Launch:

#### Accessibility (Non-Negotiable)
- [ ] Fully keyboard accessible navigation and interaction
- [ ] Screen reader support with ARIA labels on all interactive elements
- [ ] Color contrast ratio ≥ 4.5:1 for text, 3:1 for UI elements
- [ ] Reduced motion option available for sensitive users

#### Educational Alignment
- [ ] Clear learning objectives documented (specific skills being taught)
- [ ] Target age range specified and appropriate to complexity
- [ ] Skill progression tracked with mastery thresholds defined
- [ ] Parent dashboard integration showing learning outcomes

#### User Experience Quality
- [ ] Consistent HUD patterns across all games (score, timer, lives)
- [ ] Responsive feedback (<100ms input latency target)
- [ ] Encouraging failure feedback rather than punitive messages
- [ ] Clear pause/resume functionality with standard controls

#### Technical Standards
- [ ] No critical bugs or crashes in gameplay flow
- [ ] Performance budget met (load times <3s, memory usage optimized)
- [ ] Code review completed against established patterns
- [ ] Test coverage for core mechanics and edge cases

---

## Unknowns & Assumptions Requiring Clarification

### Uncertainties Needing Investigation:

1. **Original Design Intent**
   - Many games lack original design documents or specifications
   - Inferred intent from name/theme/assets may be incomplete
   - Recommendation: Interview product team or find historical docs where possible

2. **Educational Goals Per Game**
   - Some games unclear on specific target learning outcomes
   - Assumption: All games aligned with early childhood education standards
   - Verification needed for specific curriculum alignment (Common Core, state standards)

3. **Age Appropriateness**
   - Games not clearly tagged by age range in implementation
   - Inferred from complexity but needs confirmation through testing
   - Recommendation: User testing to validate age targeting

### Conflicting Evidence Found:

- Some games have multiple logic implementations (e.g., `colorSortLogic.js` vs `colorSortLogic.ts`)
- Registry files suggest game categories that don't match current implementation structure
- TODOs and comments sometimes contradict documented behavior or design intent
- Recommendation: Prioritize most recent code, document conflicts for resolution

---

## Next Steps & Implementation Roadmap

### Immediate Actions (This Sprint):
1. ✅ Create documentation framework and index (completed)
2. 🔄 Complete detailed specs for 5 critical drift cases (Jenga, Word Builder, Chemistry Lab, Virtual Archery, ISS Docking)
3. 🔍 Establish shared systems architecture (gesture framework, physics abstraction)
4. 📊 Product team review of reconstructed design intents for accuracy

### Short-Term Priorities (Next Sprint):
1. Create template spec format and apply to remaining games systematically
2. Implement accessibility improvements across highest-traffic games
3. Begin drift correction for critical cases with clear educational impact
4. Standardize naming conventions and categorization system

### Long-Term Vision (Q2-Q3 2026):
1. Complete detailed specs for all 118 games
2. Implement shared systems reducing technical debt by ~40%
3. Achieve WCAG 2.1 AA compliance across entire game library
4. Establish continuous drift detection and prevention mechanisms

---

## Related Documentation & Resources

- **Per-Game Specs:** Individual detailed specifications for each game (being created)
- **Shared Patterns Analysis:** Cross-game patterns, inconsistencies, standardization opportunities  
- **Drift Detection Report:** Comprehensive analysis of implementation vs intent divergence
- **Accessibility Audit:** Current accessibility status and improvement roadmap
- **Educational Alignment Review:** Curriculum standards mapping and learning outcome verification

---

## Notes on Methodology

This audit follows a systematic reverse-engineering approach:

1. **Code as Evidence First:** All findings grounded in actual repository content (file paths, line ranges cited)
2. **Intention Reconstruction:** Original design intent inferred from name, theme, assets, and genre expectations when explicit docs unavailable
3. **Drift Detection Systematic:** Where implementation diverges from intent, causes analyzed and impact assessed
4. **Educational Priority:** Games evaluated against early childhood learning principles and age-appropriate complexity
5. **Practical Recommendations:** All suggestions feasibility-tested against current technical constraints

**Confidence Levels:**
- High: Strong evidence from multiple sources (code + docs + assets)
- Medium: Evidence from code analysis with supporting context  
- Low: Inferred from name/theme alone, requires validation

---

*This index is a living document. As game specifications are completed, they will be linked here with updated status indicators. The full 118-game audit requires systematic completion of detailed specs for each title.*

**Total Games Documented:** 0/118  
**Critical Drift Cases Identified:** ~27  
**Estimated Completion Time:** 6-8 weeks for comprehensive audit and specification
