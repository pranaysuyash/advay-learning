# Activity & Games Comprehensive Inventory (TCK-20260205-001 - Phase 2 Part A)

**Audit Date**: 2026-02-05  
**Discovery Method**: Codebase grep + explore agent analysis  
**Status**: Complete inventory of all games, activities, and learning experiences

---

## 📊 INVENTORY SUMMARY

| Category | Count | Status |
|----------|-------|--------|
| **Core Games** | 4 | Released + Active |
| **Quest Chains** | 8 | Backend configured |
| **Social Activities** | 6 | Template-based |
| **Supported Languages** | 5 | EN, HI, KN, TE, TA |
| **Activity Types Tracked** | 3 | drawing, recognition, game |
| **Total Learning Experiences** | 23+ | Across all combinations |

---

## 🎮 CORE GAMES (4 IMPLEMENTED & ACTIVE)

### 1. Draw Letters (Alphabet Tracing)
- **File**: `src/frontend/src/pages/alphabet-game/AlphabetGamePage.tsx`
- **Type**: Drawing/Tracing activity
- **Age Range**: 2-8 years
- **Difficulty**: Easy (hardcoded)
- **Features**:
  - Hand tracking with finger drawing
  - Multilingual support (5 languages)
  - Letter-by-letter progression
  - Visual feedback (letter highlight, sound)
  - Completion celebration
- **Analytics Tracked**: 
  - `activity_type: letter_tracing`
  - `content_id: letter (A-Z per language)`
  - `score: accuracy percentage`
  - `duration_seconds: time spent`

### 2. Finger Counting
- **File**: `src/frontend/src/games/FingerNumberShow.tsx` + `finger-number-show/`
- **Type**: Recognition/Hand gesture activity
- **Age Range**: 3-7 years
- **Difficulty**: Easy (hardcoded)
- **Features**:
  - Hand gesture recognition (1-10 fingers)
  - Dual mode support (numbers + letters)
  - MediaPipe hand landmarks analysis
  - Finger counting visual guidance
  - Celebratory feedback
- **Analytics Tracked**:
  - `activity_type: recognition`
  - `content_id: number (1-10)` or `letter`
  - `score: accuracy (correct/incorrect)`
  - `duration_seconds`

### 3. Connect the Dots
- **File**: `src/frontend/src/pages/ConnectTheDots.tsx`
- **Type**: Drawing/sequencing activity
- **Age Range**: 3-6 years
- **Difficulty**: Easy (hardcoded)
- **Features**:
  - Hand tracking for dot connection
  - Touch fallback mode available
  - Sequential pattern validation
  - Picture reveal on completion
  - Visual guides and feedback
- **Analytics Tracked**:
  - `activity_type: drawing`
  - `content_id: pattern_id`
  - `score: completion_accuracy`
  - `duration_seconds`

### 4. Find the Letter (Letter Hunt)
- **File**: `src/frontend/src/pages/LetterHunt.tsx`
- **Type**: Recognition/search activity
- **Age Range**: 2-6 years
- **Difficulty**: Easy (hardcoded)
- **Features**:
  - Target letter identification
  - Screen scanning task
  - Time-based or attempt-based
  - Visual highlights for success
  - Progressive difficulty (potential)
- **Analytics Tracked**:
  - `activity_type: recognition`
  - `content_id: target_letter`
  - `score: success/attempts`
  - `duration_seconds`

---

## 🏝️ QUEST SYSTEM & LEARNING ISLANDS

**File**: `src/frontend/src/data/quests.ts`

**Architecture**: Island-based progression with unlocking mechanics

### Island 1: Alphabet Lighthouse (Starter)
**Objective**: Master letter tracing and recognition

| Quest ID | Quest Name | Game Type | XP Reward | Difficulty |
|----------|-----------|-----------|-----------|------------|
| Q1 | A-to-Z Adventure | Letter Tracing | 100 | Easy |
| Q2 | Vowel Champion | Vowel Recognition | 75 | Easy |
| Q3 | Upside Down Fun | Rotated Letters | 50 | Medium |

### Island 2: Number Nook (Unlocks after Island 1)
**Objective**: Learn finger counting and number recognition

| Quest ID | Quest Name | Game Type | XP Reward | Difficulty |
|----------|-----------|-----------|-----------|------------|
| Q4 | Count to 10 | Finger Counting | 100 | Easy |
| Q5 | Finger Flash | Speed Recognition | 75 | Medium |

### Island 3: Treasure Bay (Unlocks after Island 2)
**Objective**: Challenge with letter hunting

| Quest ID | Quest Name | Game Type | XP Reward | Difficulty |
|----------|-----------|-----------|-----------|------------|
| Q6 | Treasure Hunter | Letter Hunt | 100 | Medium |

### Island 4: Star Studio (Unlocks after Island 3)
**Objective**: Creative drawing and constellation creation

| Quest ID | Quest Name | Game Type | XP Reward | Difficulty |
|----------|-----------|-----------|-----------|------------|
| Q7 | Star Gazer | Constellation Drawing | 100 | Medium |
| Q8 | Galaxy Artist | Creative Drawing | 75 | Hard |

**Status**: ⚠️ Configured in backend, but **NOT EXPOSED in frontend** (Islands not shown in Games page)

---

## 👥 SOCIAL LEARNING ACTIVITIES (6 TEMPLATES)

**File**: `src/frontend/src/data/socialActivities.ts`

**Purpose**: Structured social interaction templates for multiplayer/classroom use

| Activity ID | Activity Name | Min Players | Duration | Learning Focus | Status |
|------------|--------------|------------|----------|-----------------|--------|
| `sharing-circle` | Sharing Circle | 2+ | 5 min | Turn-taking, patience, listening | Template |
| `caring-quest` | Caring Quest | 2+ | 8 min | Empathy, mutual support, encouragement | Template |
| `cooperation-game` | Cooperation Game | 2+ | 6 min | Teamwork, shared goals, collaboration | Template |
| `friendship-builder` | Friendship Builder | 2+ | 4 min | Positive interaction, social skills | Template |
| `patience-practice` | Patience Practice | 3+ | 3 min | Self-control, waiting, impulse control | Template |
| `inclusion-play` | Inclusion Play | 2+ | 5 min | Belonging, group dynamics, acceptance | Template |

**Status**: ⚠️ Defined as templates, **NOT IMPLEMENTED in games** (No UI/gameplay implementation found)

---

## 🌍 MULTILINGUAL SUPPORT (5 LANGUAGES)

**File**: `src/frontend/src/data/alphabets.ts`

### English (EN)
- **Script**: Latin
- **Letters**: 26 (A-Z)
- **Icon Set**: Common objects (Apple, Ball, Cat, Dog, Egg, Fish, etc.)
- **Status**: Full support with visual icons

### Hindi (HI)
- **Script**: Devanagari
- **Structure**: Vowels (Swars: अ, आ, इ, ई, उ, ऊ, ऋ, ए, ऐ, ओ, औ) + Consonants (Vyanjans)
- **Icon Set**: Cultural/regional icons
- **Status**: Full support with cultural adaptation

### Kannada (KN)
- **Script**: Kannada (Dravidian)
- **Letters**: Complete Kannada alphabet
- **Status**: Full support

### Telugu (TE)
- **Script**: Telugu (Dravidian)
- **Letters**: Complete Telugu alphabet
- **Status**: Full support

### Tamil (TA)
- **Script**: Tamil (Dravidian)
- **Letters**: Complete Tamil alphabet
- **Status**: Full support

**Multilingual Implementation**: 
- Language selection in profile (5-language dropdown)
- Game content adapts to selected language
- Learning progress tracked per language
- All games support full multilingual mode

---

## 🗄️ BACKEND ACTIVITY TRACKING SCHEMA

**Files**: 
- `src/backend/app/db/models/progress.py`
- `src/backend/app/api/v1/endpoints/progress.py`
- `src/backend/app/schemas/progress.py`

### Progress Model
```python
class Progress(Base):
    id: UUID (primary key)
    profile_id: UUID (foreign key → Profile)
    activity_type: str  # Enum: drawing, recognition, game
    content_id: str     # Letter, word, number identifier
    score: int          # 0-100
    duration_seconds: int
    meta_data: JSON     # Extensible for future event details
    idempotency_key: str (optional, unique per profile)
    completed_at: datetime
```

### Activity Types Tracked
```
- drawing: Tracing, drawing, connecting activities
- recognition: Letter/number recognition, identification
- game: Generic game activity (currently unused, placeholder for future)
```

### API Endpoints
- `POST /progress` - Save single activity
- `POST /progress/batch` - Batch save with deduplication (idempotency keys)
- `GET /progress` - Retrieve all progress for profile
- `GET /progress/stats` - Summary statistics (total activities, avg score, completed content)

**Status**: ✓ Backend infrastructure complete, but **limited event granularity** (no per-attempt tracking, no gesture quality metrics, no per-game events)

---

## 🛠️ SHARED GAME INFRASTRUCTURE & COMPONENTS

### Core Game Components (Reusable)
- **GameContainer.tsx** - Standardized container with minimal chrome
- **GameLayout.tsx** - Universal layout with webcam integration (ref-forwarded)
- **GameHeader.tsx** - Consistent header across all games (title, controls)
- **GameControls.tsx** - Pause/Resume/Exit unified controls
- **GameCard.tsx** - Game selection UI (title, ageRange, difficulty, category)

### Input & Gesture Recognition
- **useHandTracking()** - MediaPipe HandLandmarker hook (GPU/CPU fallback)
- **useGameLoop()** - FPS-limited game loop (default 30fps)
- **pinchDetection.ts** - Pinch gesture detection (start/release thresholds)
- **gestureRecognizer.ts** - Extended gesture recognition
- **drawing.ts** - Canvas drawing utilities (smoothing, line segments, glow effects)
- **landmarkUtils.ts** - Hand landmark normalization and processing

### Wellness & Monitoring
- **useInactivityDetector()** - 60-second default timeout
- **useAttentionDetection()** - Eye gaze/engagement tracking (MediaPipe Face Mesh)
- **usePostureDetection()** - Body posture monitoring
- **CelebrationsOverlay** - Confetti + achievement animations
- **WellnessReminder** - Break reminders at configurable intervals

### Game Data & Store
- **characterStore.ts** - Mascot character state (Pip, Lumi)
- **settingsStore.ts** - Game settings and preferences
- **profileStore.ts** - Active child profile (age, language, progress)
- **progressQueue.ts** - Local offline progress buffering

---

## 🧪 TESTING & QA ARTIFACTS

### Test Files
- `src/frontend/src/pages/__tests__/Game.smoke.test.tsx` - General game smoke tests
- `src/frontend/src/pages/__tests__/Game.pending.test.tsx` - Pending test cases
- `src/frontend/src/games/__tests__/fingerCounting.test.ts` - Finger counting unit tests
- Alphabet tracing E2E tests in `e2e/` folder
- Connect the Dots visual regression tests

### Dev/Debug Features
- **MediaPipeTest page** - Hand tracking visualization (dev-only)
- **Debug console logs** - Hand landmark data, gesture state
- **Network tab monitoring** - Analytics events, progress API calls
- **React DevTools** - Game state inspection

---

## ⚠️ CRITICAL GAPS & OBSERVATIONS

### Games
- **No difficulty progression**: All 4 games hardcoded to "Easy"
- **No progressive content**: Games don't get harder as child improves
- **Islands configured but hidden**: 8 quests exist in backend but not shown in UI
- **Social activities undefined**: 6 templates exist but no gameplay implementation

### Analytics
- **Limited event granularity**: Only completion tracked, not per-attempt data
- **No gesture quality metrics**: Can't track hand steadiness, accuracy per stroke
- **No engagement metrics**: Missing time-to-first-interaction, retry patterns
- **No game-specific events**: All games map to generic "drawing" or "recognition"

### Multilingual
- **Full support implemented**: 5 languages with cultural adaptation
- **Learning progress isolated**: Kids can't progress across languages easily
- **No mixed-language mode**: Can't practice letters from multiple languages in one session

### UI/Components
- **No age-based adaptation**: Same UI for 2yr and 8yr old
- **Difficulty colors identical**: Easy/Medium/Hard have same styling
- **Profile age not used**: Age tracked but not used for content filtering
- **No personalization**: Same progression path for all ages

---

## 🔄 EVIDENCE CLASSIFICATION

**Observed** (Code-verified):
- 4 games implemented (files found, code reviewed)
- Backend progress model with batch API (schema verified)
- 5-language support with icon sets (data files reviewed)
- 8 quest chains configured (quests.ts data reviewed)
- 6 social activity templates (socialActivities.ts found)
- Game components reusable and well-structured

**Inferred** (Logical from code):
- Islands not exposed in frontend (quests.ts defined but Games.tsx doesn't load them)
- Social activities not implemented (templates exist but no gameplay code)
- Age-based adaptation not implemented (profileStore.age exists but Games.tsx doesn't filter by it)
- Difficulty not progressive (Games.tsx shows all as "Easy", no configuration for difficulty levels)

**Unknown** (Requires testing):
- How do children actually experience games across age ranges?
- Are analytics events firing correctly during gameplay?
- Is parent progress dashboard accurate and actionable?
- Do children match the age-range recommendations?
- Are gesture recognition thresholds appropriate for each age?

---

## 📈 NEXT STEPS

This comprehensive inventory provides baseline for multi-model analysis:
- **Part B**: Code Quality & Architecture Review (Claude, GPT, Gemini)
- **Part C**: UX Pattern Analysis & Improvement Suggestions
- **Part D**: Cross-Model Consensus & Synthesis

---

**Audit Ticket**: TCK-20260205-001 in docs/WORKLOG_ADDENDUM_v3.md  
**Updated Plan**: docs/AUDIT_PLAN_GAMES_UX.md
