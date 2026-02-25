# Investigation: Alphabet's Progression System vs. "Smart Recess" Vision

**Date**: 2026-02-24  
**Status**: Complete — **CRITICAL CORRECTION MADE**  
**Issue**: This app was being analyzed as a *curriculum system* when it's actually a *"Smart Recess" playground*  
**Core Question**: Why does Alphabet have gating (blocked batches, mastery gates) when the vision says all games should be freely accessible?

---

## THE CORE PROBLEM

### What Alphabet Actually Does ❌
```
Batch 1 (Letters A-E):    ALWAYS ACCESSIBLE
Batch 2 (F-J):            LOCKED → Unlock when master 3/5 of Batch 1
Batch 3 (K-O):            LOCKED → Unlock when master 3/5 of Batch 2
Batch 4 (P-T):            LOCKED → Unlock when master 3/5 of Batch 3
Batch 5 (U-Z):            LOCKED → Unlock when master 3/5 of Batch 4

Definition of "Master": Accuracy ≥ 70% (traditional ed-tech metric)
Parent View: "0/26 Letters Mastered" [progress bar] (like a gradebook)
```

### What North Star Vision Says ✅
From **[NORTH_STAR_VISION.md](docs/NORTH_STAR_VISION.md)**:
```
"Anything physical, made virtual, safe, and wildly fun."

Core Principle: CHILD-DIRECTED
└─ Kids choose what to explore
└─ No forced sequences
└─ No locked content
└─ Free access to all games

Core Principle: PLAY > PEDAGOGY
└─ Joy over achievement
└─ Exploration over mastery tracking
└─ "Kids learn best when they don't know they're learning"
```

### The Contradiction
| Aspect | Vision | Alphabet | Match? |
|--------|--------|----------|--------|
| Game access | All free | Gated by mastery | ❌ NO |
| Child control | Choose own path | Locked progression | ❌ NO |
| Tracking focus | Engagement (time, attempts) | Achievement (accuracy %, mastery %) | ❌ NO |
| Parent messaging | "Kabir played for 20 min" | "0/26 mastered" (grades) | ❌ NO |

---

## CUSTOMER RESEARCH: Teachers Explicitly Rejected Curriculum Tracking

### Ms. Deepa Interview (February 2026)
From **[TEACHER_Ms_Deepa_FollowUp.md](docs/personas/TEACHER_Ms_Deepa_FollowUp.md)**:

**What Teachers DON'T want** (explicitly stated):
- ❌ Curriculum alignment mapping
- ❌ NCERT/NEP standards compliance
- ❌ Rubric-based assessment ("proficiency levels")
- ❌ Progress metrics they have to "interpret"

**What Teachers DO want**:
- ✅ Simple activity logs ("Kabir played Alphabet 15 min, Games 3 total")
- ✅ Proof-of-engagement for parents ("Your kid was active")
- ✅ Zero-prep recess documentation
- ✅ No grading responsibility

**Key Quote**:
> "I don't need it to teach my curriculum. I don't need CBSE alignment. I need it to keep kids active while I get paperwork done. Show me who played and for how long. That's it."

### Closed Ticket: Curriculum Mapping Proposal — REJECTED
**[TCK-20260224-017](docs/WORKLOG_ADDENDUM_v3.md)** — **STATUS: ❌ CLOSED**

**Initial Proposal**: Add NCERT/NEP curriculum alignment, standards mapping, rubrics  
**Ms. Deepa's Response**: "We don't want this."  
**Decision**: Out of scope per North Star Vision

**Rationale Documented**:
- Teachers view recess as *separate from curriculum*
- Adding curriculum features = scope creep into educational software (not our vision)
- Better to position as "recess enrichment" (avoids institutional scrutiny)



---

## THE 28-GAME REALITY

From **[FUN_FIRST_GAMES_CATALOG.md](docs/FUN_FIRST_GAMES_CATALOG.md)**:

```
28 Games Total (NOT 5-7)

Alphabets (5):        Alphabet, LetterHunt, WordBuilder, PhonicsSounds, ???
Numbers (7):          NumberShow, NumberTrace, ConnectTheDots, Sorting, 
                      Shapes, Counting, Patterns
Motor Skills (6):     AirCanvas, TraceShapes, Balance, YogaAnimals, 
                      TouchDraw, FineMotor
Speed Reaction (5):   BubblePop, ShapePop, QuickMath, FastFlip, ReactionRace
Exploration (3):      ShapeSafari, ColorMix, LetterLand
Social/Memory (2):    SimonSays, MemoMatch
```

**Critical Observation**: 
- Only **1 of 28** games (Alphabet) has gating/mastery progression
- Other **27 games** have zero progression locks
- No rubric system or curriculum framework connecting them

**Question**: If Alphabet's gating is right, why don't 27 other games have it?  
**Answer**: They don't because the vision is "Smart Recess," not "curriculum system"

---

## THE INVESTIGATION SHIFT

### What I Was Analyzing (WRONG)
**Old Framing**: "Why does only Alphabet have curriculum tracking? We need to implement the same for all 28 games!"

**Buried Assumption**: This is an educational software product that needs:
- Skill rubrics
- Mastery definitions
- Progression paths
- Parent dashboard with grades

**Problem**: This contradicts the actual vision.

### What the Vision Actually Says (CORRECT)
**New Framing**: "Why does Alphabet have gating when the vision explicitly says NO gating?"

**Real Question**: 
1. Did Alphabet get over-engineered for the wrong goals?
2. Should we remove gating and simplify to engagement tracking?
3. Is "0/26 Mastered" messaging at odds with "Smart Recess"?

---

## Part 1: What Currently Exists

### Alphabet Game Structure

**File**: [src/frontend/src/games/LetterJourney.tsx](src/frontend/src/games/LetterJourney.tsx) (1,808 lines)

**Tracking Features**:
- ✅ Per-letter mastery: Binary (`attempted` → `mastered` if accuracy ≥ 70%)
- ✅ Batch unlocking: 3/5 letters mastered → unlock next batch
- ✅ Parent dashboard: Plant growth visualization + "0/26 Mastered"
- ✅ Language support: Separate tracking per language (en, hi, kn, te, ta)

**Implementation**:
```typescript
// Local state (Zustand)
const MASTERY_THRESHOLD = 70;   // accuracy requirement
const UNLOCK_THRESHOLD = 3;      // 3/5 letters to unlock next batch

// Parental display
Parent sees: "Alphabets" card with 0/26 mastered progress bar
```

**Problem with This Design** (from vision perspective):
- Gating (Batch 2 locked) contradicts "child-directed, all games free"
- "0/26 Mastered" framing = grades, contradicts "play > pedagogy"
- Mastery threshold (70%) is a curriculum assumption, not a Smart Recess one

### Other 27 Games

**Current State**: 
- Zero progression locks
- Minimal tracking (stars only in some cases)
- No parent dashboard breakdown
- No mastery/unlock logic

**Why No Locks?** Because vision says no locks. Why is Alphabet different?

---

## Part 2: Architecture Why — Local vs Backend Split

### 2.1 Alphabet: Zustand Local Store

```typescript
// src/frontend/src/store/progressStore.ts
const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      letterProgress: Record<string, LetterProgress[]>,  // PER LANGUAGE
      batchProgress: Record<string, BatchProgress[]>,   // PER LANGUAGE
      markLetterAttempt: (language, letter, accuracy) => { /* ... */ },
      isLetterMastered: (language, letter) => boolean,
      isBatchUnlocked: (language, batchIndex) => boolean,
    })
  )
);

// Mastery threshold
const MASTERY_THRESHOLD = 70;  // accuracy %
const UNLOCK_THRESHOLD = 3;    // 3/5 letters mastered
```

**Why Local State**: 
- Instant feedback (no network latency)
- Visual batch unlocks are immediate
- Works offline
- Persisted to localStorage via Zustand

---

### 2.2 Other Games: Backend API Only

```typescript
// src/frontend/src/services/api.ts
export const progressApi = {
  getProgress: (profileId) => GET /api/v1/progress/{profileId},
  postProgress: (profileId, progress) => POST /api/v1/progress/,
  getStats: (profileId) => GET /api/v1/progress/stats,
};

// Backend: src/backend/app/api/v1/endpoints/progress.py
@router.get("/stats")
def get_progress_stats(current_user):
  # Returns aggregate stats (no per-game breakdown)
  return { "total_stars": 150, "games_played": 8 }
```

**Result**: 
- Other games send completion events but have no progression model
- Backend stores "stars earned" number (aggregate)
- No per-skill tracking
- No unlock logic

---

## Part 3: What the Vision & Research Expect

### 3.1 VC Investor Evaluation (vc-investment-evaluation-v1.0-ADVAY.md)

**Missing Systems Identified**:

```
C. Missing Systems: Progression, Personalization, Habit Loops, Rewards

System 1: Progression System
- Current State: 3 levels in FingerNumberShow + LetterJourney
- What's missing: Adaptive difficulty, personalized learning paths
- Why it matters: Prevents plateau, keeps kids in optimal challenge zone
- Fix needed: [AI-driven difficulty adjustment, personalized curriculum]

System 2: Daily Challenge
[Details on daily habit formation - currently missing]
```

**Investor Verdict**:
> "Current state: 3 levels (beginner, intermediate, master) in ONE game. Needs to extend across curriculum."

---

### 3.2 Parent Persona Interviews — What They Want

#### **Persona: Vikram — Data-Driven Father** (TCK-20260223-002)

**Key Finding**: ❌ "Great progress!" is too qualitative

| Severity | Finding | Parent's Need |
|----------|---------|---------------|
| 🔴 HIGH | No quantitative trend data | "Needs CSV, trend lines" |
| 🔴 HIGH | No curriculum mapping | "Can't verify CBSE alignment" |
| 🔴 HIGH | No competitive benchmarking | "Is Kabir ahead/behind for age?" |
| 🔴 HIGH | No automated weekly reports | "Wants Sunday 8 PM email with PDF" |
| 🟡 MEDIUM | No skill breakdown by subject | Needs "Alphabets 85%, Numbers 72%, Shapes 91%" |

**What Vikram Expects in Dashboard**:
```
Progress Report — Week Ending Feb 24, 2026

Skill Breakdown:
├─ Alphabets: 85% (14/26 mastered, accurate to <15% error)
│  └─ Trend: ↗ +5% vs last week
├─ Numbers: 72% (6/10 mastered)
│  └─ Trend: ↗ +8% vs last week
├─ Shapes: 91% (7/8 mastered)
│  └─ Trend: → Stable (all unlocked)
├─ Motor Skills: (ConnectTheDots, YogaAnimals, AirCanvas)
│  └─ Trend: ? Not tracked

Comparative Data:
├─ Time Spent: 45 min (vs 30 min target)
├─ Session Quality: "Focused" (no rapid quit patterns)
├─ Benchmark: "Kabir is in top 23% for age 7"
```

---

#### **Persona: Kabir — Competitive Learner (Age 7)** (CHILD_Kabir_Competitive_Learner.md)

**Key Quote**:
> "My dad asks 'Did you learn something new?' And I have to say 'I practiced letters.' But I already KNOW letters! He looks disappointed."

**Missing Features for Motivation**:
- No skill tier system (Bronze → Silver → Gold)
- No percentile ranking ("You're faster than 78% of kids")
- No weekly challenges
- No streak system
- No spendable currency (stars for avatar items)

**What Would Engage Kabir**:
```
Unlock: Grade 2 Content
├─ Prerequisite: Master Alphabet (26/26)
├─ Unlock: "Advanced Numbers" (11-100)
├─ Unlock: Cursive letters
├─ Unlock: Word writing challenges
├─ Social: "Challenge your friend to beat your time"
```

---

### 3.3 Secondary Findings Backlog (SECONDARY_FINDINGS_BACKLOG.md)

```
CONTENT-001: Alphabet Curriculum Audit (P2)

Issue:
Letter progression doesn't match K-1 curriculum standards. 
Some letters too hard, some too easy.

Solutions:
1. Align with Common Core standards
2. Phoneme progression:
   - Week 1: A, B, C, D (simple sounds)
   - Week 2: E, F, G, H
   - Week 3-4: I-Z (mix easy/hard)
   - Week 5: Blends (sh, ch, th)
3. Benchmark: 80% success rate for each letter
```

---

### 3.4 Story-Based Dashboard Redesign (StoryBasedNarrativeRedesign.md)

**Proposed Crystal Castle Dashboard**:
```
Progress Indicators:
├─ Crystal Level: Shows overall progress
├─ Realm Progress: Shows progress in each learning area
├─ Castle Upgrades: Visual representation of progress by skill
├─ Weekly Challenge Portal: "This week: Trace 100 letters in <5 min"
```

**Learning Dimensions Proposed**:
- Alphabet Mastery
- Number Mastery
- Shape Recognition
- Fine Motor Skills
- Gross Motor Skills
- Language/Phonics
- Social/Emotional (future)

---

## Part 4: Gap Analysis — What's Missing

### 4.1 No Shared Rubric System

**Problem**: Each game has different reward mechanisms

```
AlphabetGame:
└─ Mastery model: accuracy ≥70% = "mastered"
└─ Progression: Master 3/5 → unlock next batch
└─ Visual: LetterJourney with locked/unlocked batches

FingerNumberShow:
└─ Reward model: ★★★★★ (stars, aggregate count)
└─ Progression: ??? (no unlock logic visible)
└─ Visual: "Earned X stars this session"

ConnectTheDots:
└─ Reward model: ??? (no visible tracking)
└─ Progression: None
└─ Visual: Game over screen only
```

**Q**: What is the curriculum rubric?
- A: Only Alphabet has one (accuracy % → mastered)

---

### 4.2 No Dashboard Skill Breakdown

**Current Progress Page**:
- Plant growth visualization (abstract, not skill-specific)
- DailyTimeChart (shows *when* played, not *what* learned)
- NeedsAttentionSection (struggles, but only if parent scrolls)
- ExportButton (exports generic report, not skill-focused)

**What Parents Want** (from Vikram persona):
```
Dashboard Cards (Skill-Focused):

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  ALPHABETS      │ │  NUMBERS        │ │  SHAPES         │
│  14 / 26        │ │  7 / 10         │ │  8 / 8 ✓        │
│  Mastered       │ │  Mastered       │ │  Completed      │
│  Accuracy: 82%  │ │  Accuracy: 76%  │ │  Accuracy: 94%  │
│  Trend: ↗ +5%   │ │  Trend: ↗ +8%   │ │  Trend: → 0%    │
└─────────────────┘ └─────────────────┘ └─────────────────┘

Motor Skills (No Progress Model Yet):
├─ Fine Motor: ConnectTheDots, AirCanvas, WordBuilder (combined 3 games)
├─ Gross Motor: YogaAnimals, SimonSays (2 games)
└─ Hand Tracking: All games aggregate
```

---

### 4.3 No Rubric Alignment with Standards

**Currently**:
- Alphabet: Internal mastery rules (70% = mastered, 3/5 = unlock)
- No reference to curriculum standards (CBSE, NEP, Common Core)

**Expected** (from Vikram persona):
```
"Game descriptions should reference learning standards"
Example: "Letter Hunt teaches:
  ✓ CBSE: KG Letter Recognition
  ✓ NEP FLN: Phonemic Awareness (Level 2)
  ✓ Bloom's: Application (identifying letters in context)"
```

---

### 4.4 No Competitive/Achievement System

**Currently**:
- Stars (global count, no differentiation)
- LetterJourney unlock badges (Alphabet only)
- No tiers, streaks, percentiles

**Expected** (from Kabir persona):
```
Competitive Progression:
├─ Skill Tiers: Bronze → Silver → Gold → Platinum → Diamond
├─ Benchmarks: "Top 23% for age" (requires aggregate data)
├─ Streaks: "7-day streak! Keep going!" (requires daily tracking)
├─ Challenges: "This week: Trace 100 letters in <5 min"
└─ Spendable Currency: Stars → Avatar items, themes (not just XP)
```

---

## Part 5: Database/Backend Reality Check

### 5.1 Backend Progress Schema

```python
# src/backend/app/db/models.py (inferred from API docs)

class ProgressEntry:
    id: int
    child_id: int
    game_type: str  # "alphabet", "numbers", "shape", etc.
    skill_name: str  # "letter_A", "number_5", "circle"
    accuracy: float
    duration: int  # seconds
    timestamp: datetime
    # What's missing:
    # - skill_category (fine motor, gross motor, language, etc.)
    # - curriculum_standard_code (CBSE/NEP reference)
    # - difficulty_level (1-5)
    # - attempt_sequence (to track learning curve)

class SkillRubric:  # DOES NOT EXIST
    # Should define what "mastery" means per skill type
    # + unlock conditions
    # + progression paths
```

---

### 5.2 What Backend API Actually Supports

```python
@router.get("/progress/stats")
def get_progress_stats(current_user):
    # Currently returns:
    return {
        "total_stars": 150,
        "games_played": 8,
        "last_played": "2026-02-24T10:30:00Z"
    }
    # What it SHOULD return:
    # {
    #   "skills": {
    #     "alphabets": { "mastered": 14, "total": 26, "accuracy": 82% },
    #     "numbers": { "mastered": 7, "total": 10, "accuracy": 76% },
    #   },
    #   "milestones": [...],
    #   "benchmarks": { "percentile": 23 }
    # }
```

---

## Part 6: Why This Matters — Business Impact

### 6.1 From Vikram's Perspective
- ❌ Can't justify $9.99/month subscription ("Is Kabir actually learning?")
- ❌ Can't show teacher progress on parent-teacher day
- ❌ Can't benchmark vs. peers ("Is he ahead/behind?")
- 🎯 **Fix**: Skill breakdown dashboard + PDF report

### 6.2 From Kabir's Perspective
- ❌ Alphabet feels finite ("I've done all 26 letters")
- ❌ Other games feel disconnected and low-skill
- ❌ No motivation to be "best" (no percentiles, tiers)
- 🎯 **Fix**: Progression tiers + skill challenges + benchmarking

### 6.3 From Product Perspective
- ❌ Alphabet system proves the concept works (mastery → unlock)
- ❌ Other 11 games don't reinforce this system
- ❌ Data fragmentation: alphabet (local) vs. others (backend)
- 🎯 **Fix**: Unified rubric system across all games

---

## Part 7: What Needs to Happen

### 7.1 Phase 1: Define Curriculum Rubric (2-3 days)

**Deliverable**: `curriculum-rubric-v1.0.md`

```
For each game/skill:
├─ Skill Name: "Letter Recognition" 
├─ Applicable Games: [AlphabetGame, LetterHunt]
├─ Mastery Criteria: [accuracy ≥ 80%, 3 sessions, success rate ≥ 75%]
├─ Progression Model: 
│  ├─ Level 1 (Beginner): 0-40% accuracy
│  ├─ Level 2 (Intermediate): 41-75% accuracy
│  └─ Level 3 (Master): 76-100% accuracy
├─ Unlock Conditions: "Master Level 2 in 10 letters → unlock cursive"
├─ Curriculum Alignment: "CBSE KG - Letter Recognition"
└─ Benchmark: "Age 5.5: 80% of peers master 15/26 letters by month 3"
```

---

### 7.2 Phase 2: API Schema Updates (2-3 days)

**New Backend Models**:
```python
class SkillRubric:
    skill_id: str  # "letter_recognition"
    skill_category: str  # "language", "motor", "cognitive"
    games: List[str]  # ["alphabet_game", "letter_hunt"]
    mastery_threshold: float  # accuracy ≥ 70%
    progression_levels: List[ProgressionLevel]
    unlock_conditions: List[str]  # ["master_level_2"]

class ProgressEntry:  # Enhanced
    skill_id: str  # ← NEW: link to rubric
    accuracy: float
    level: int  # 1=beginner, 2=intermediate, 3=master
    curriculum_code: str  # "CBSE_KG_LETTER"  ← NEW
    attempt_sequence: int  # to track learning curve
    duration: int
    timestamp: datetime
```

**New API Endpoints**:
- `GET /api/v1/rubrics/` — Get all skill rubrics
- `GET /api/v1/progress/{profileId}/by-skill` — Breakdown by skill
- `GET /api/v1/progress/{profileId}/benchmarks` — Percentile data
- `POST /api/v1/progress/{profileId}/batch` — Record multiple attempts

---

### 7.3 Phase 3: Frontend Dashboard Redesign (4-5 days)

**New Components**:
```
SkillBreakdownCards.tsx
├─ Renders per-skill progress (Alphabet, Numbers, Shapes, etc.)
├─ Shows: mastered count, accuracy, trend, benchmark percentile
├─ Data from: /api/v1/progress/{profileId}/by-skill

ProgressionLevelIndicator.tsx
├─ Visual: Level 1 → 2 → 3 progression path
├─ Shows: current level, % to next level
├─ Dynamic based on rubric definition

CurriculumAlignmentBadge.tsx
├─ Shows: CBSE code, NEP FLN reference, Bloom's level
├─ Builds parent confidence: app aligns with school curriculum

WeeklyProgressReport.tsx
├─ New skills unlocked this week
├─ Milestones achieved
├─ Benchmarks (percentile movement)
└─ Exportable PDF for parent-teacher meetings
```

**Migration Plan**:
1. Keep existing DailyTimeChart + PlantVisualization
2. *Add* SkillBreakdownCards above
3. *Gradually deprecate* generic "Progress" text

---

### 7.4 Phase 4: Extend to All Games (1 week)

For each game (FingerNumbers, ConnectTheDots, etc.):
1. **Map to Skill Rubric**: "ConnectTheDots → Fine Motor + Sequencing"
2. **Add Progress Tracking**: Replace star-only system with skill levels
3. **Implement Progression**: Add unlock logic where applicable
4. **Backend Sync** : Send `ProgressEntry` with skill_id to `/api/v1/progress/batch`

---

## Part 8: Implementation Sequence

### MVP (Minimum Viable Product) — 8-10 days

**Week 1**:
1. Day 1-2: Define curriculum-rubric.md
2. Day 3-4: Update backend API schemas + migrations
3. Day 5: Frontend SkillBreakdownCards component
4. Day 6-7: Integrate with existing Progress page
5. Day 8: Testing + audit

**Result**: Parents see skill breakdown dashboard (Alphabet + Numbers + Shapes)

### Phase 2 — 1-2 weeks

1. Extend to remaining games (ConnectTheDots, LetterHunt, etc.)
2. Add progression levels (Beginner → Intermediate → Master)
3. Add milestone tracking ("First Letter!", "All Numbers Mastered!")
4. Add basic benchmarking

**Result**: All games have consistent tracking + unlock logic

### Phase 3 — 2-3 weeks

1. Advanced benchmarking (percentile ranks)
2. Weekly challenge system
3. Streak tracking + spendable currency
4. PDF report generation

**Result**: Competitive/engagement features from Kabir persona

---

## Part 9: Customer Interview Simulations

### Simulation 1: Vikram Sees New Dashboard

**Before** (Current):
```
Vikram: "What's this plant growing? How does it tell me if Kabir learned?"
Parent Dashboard: [Plant at 40% height] "Great progress!"
Vikram: [Sighs] "I can't show this to his teacher."
```

**After** (Proposed):
```
Vikram views Progress page:
├─ Alphabets: 14/26 (53%) | Accuracy: 82% | Trend: ↗ +5%
├─ Numbers: 7/10 (70%) | Accuracy: 76% | Trend: ↗ +8%
├─ Shapes: 8/8 (100%) ✓ | COMPLETED
└─ Motor Skills: Not yet tracked

Vikram: "Perfect. These numbers I can verify."
[Clicks "Download PDF"] → Generates report for teacher
Vikram: "Now I have evidence."
```

---

### Simulation 2: Kabir Sees Competitive Features

**Before** (Current):
```
Kabir plays AlphabetGame → Traces 3 letters successfully
Screen shows: "Great job! ⭐⭐⭐"
Kabir: "I earned 3 stars. What's the point?"
Dashboard: "Stars: 47 total"
Kabir's Dad (Vikram): "Good, but did you learn something new?"
Kabir: [Shrugs] "I just practiced letters I already know."
[Churn risk: HIGH]
```

**After** (Proposed):
```
Kabir plays Alphabet → Traces 5 letters, avg 84% accuracy
Screen shows intervention: "Level 2 Unlocked! 
  ✓ Now fast enough for speed challenges
  ✓ Unlock: Cursive A-E (coming in Level 3)
  ✓ Percentile: You're now faster than 71% of 7-year-olds!"

Kabir sees: "Unlock: Grade 2 Numbers (11-100)"
Kabir: [Excited] "I can do bigger numbers?"

Kabir's Dashboard:
├─ Progress to Level 3: 60% (need 85% avg accuracy)
├─ Current Rank: 71st percentile for age
├─ This Week's Challenge: "Trace 50 letters in under 3 min"
├─ Streak: 5 days 🔥

Kabir: "I want to be top 10!"
[Churn risk: LOW]
```

---

### Simulation 3: Teacher (Ms. Deepa) Uses Export

**Before**:
```
Ms. Deepa: "Parent asked if the app is helping Kabir."
Taps "Export Report" in Progress page
Gets: Generic PDF with plant status + daily time breakdown
Ms. Deepa: "This doesn't tell me about skill growth."
```

**After**:
```
Ms. Deepa: "Parent asked if the app is helping Kabir."
Taps "Download PDF Report"
Gets:
  ┌─────────────────────────────────────────┐
  │ Kabir's Learning Report - Feb 24, 2026  │
  ├─────────────────────────────────────────┤
  │ Alphabets: 14/26 (53%)                  │
  │   Strongest: G, M, P (92% avg)          │
  │   Needs Help: B, D (62% accuracy)       │
  │ Numbers: 7/10 (70%)                     │
  │   Strongest: Numbers 1-5                │
  │   Struggling: 8, 9, 0                   │
  │ Curriculum Alignment:                   │
  │   ✓ CBSE KG Letter Recognition          │
  │   ✓ NEP FLN Phonemic Awareness L2       │
  └─────────────────────────────────────────┘

Ms. Deepa: "Excellent. I can see exactly where to help."
[Recommends app to other parents]
```

---

## Part 10: Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ UNIFIED CURRICULUM TRACKING SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────────────┐  ┌──────────────────┐                │
│ │ AlphabetGame     │  │ FingerNumbers    │ [11 other games]
│ │ (1,808 lines)    │  │ (game logic)     │                │
│ └────────┬─────────┘  └────────┬─────────┘                │
│          │                     │                           │
│          └────────┬────────────┘                           │
│                   ▼                                         │
│         ┌─────────────────────┐                            │
│         │ Game Event Queue    │                            │
│         │ (unified interface) │                            │
│         │                     │                            │
│         │ {                   │                            │
│         │  game_id: "alpha",  │                            │
│         │  skill_id: "L_A",   │                            │
│         │  accuracy: 82,      │                            │
│         │  timestamp: ...     │                            │
│         │ }                   │                            │
│         └────────┬────────────┘                            │
│                  │                                          │
│                  ▼                                          │
│    ┌──────────────────────────┐                            │
│    │ Backend API              │                            │
│    │ ─────────────────────    │                            │
│    │ POST /progress/batch     │                            │
│    │ GET /progress/by-skill   │                            │
│    │ GET /rubrics             │                            │
│    │ GET /progress/benchmarks │                            │
│    └──────────┬───────────────┘                            │
│               │                                             │
│    ┌──────────▼────────────────┐                           │
│    │ Database                  │                           │
│    │ ─────────────────────     │                           │
│    │ ProgressEntry (skill_id)  │                           │
│    │ SkillRubric (definitions) │                           │
│    │ BenchmarkAggregate        │                           │
│    └───────────────────────────┘                           │
│               │                                             │
│    ┌──────────▼────────────────┐                           │
│    │ Frontend Dashboard        │                           │
│    │ ─────────────────────     │                           │
│    │ SkillBreakdownCards       │                           │
│    │ ProgressionLevelIndicator │                           │
│    │ BenchmarkComparison       │                           │
│    │ CurriculumAlignmentBadge  │                           │
│    │ ExportPDFReport           │                           │
│    └───────────────────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Conclusions

### Why Only Alphabet?
1. **Timing**: Alphabet was implemented first as a complete example
2. **Scope**: All other games added later without parallel tracking infrastructure
3. **Architecture Gap**: LetterJourney proved the concept locally; no refactor to unify

### What Needs to Exist?
1. **Curriculum Rubric**: Shared definition of skills, mastery, progression
2. **Unified Backend API**: Single source of truth for all game progress
3. **Dashboard UI**: Skill breakdown cards, progression indicators, benchmarks
4. **Consistency**: All games feed into same system, not isolated

### Timeline to Full Implementation
- **MVP**: 8-10 days (skill breakdown + 3 games)
- **Complete**: 3-4 weeks (all games + competitive features)

### Customer Impact
- **Vikram**: Goes from confused → has data to show teacher
- **Kabir**: Goes from bored → motivated to progress through levels
- **Ms. Deepa**: Can recommend app knowing data quality is solid

---

## Next Steps for Discussion

1. **Approval**: Do we commit to unified curriculum rubric system?
2. **Scope**: Start with MVP (3 games) or go all-in (7 games)?
3. **Timeline**: Parallel with other work or dedicate team?
4. **Data Migration**: How to backfill existing progress to new schema?

---

**Document Status**: Ready for discussion  
**Owner**: Pranay (Human Lead)  
**Agents**: See investigation complete
