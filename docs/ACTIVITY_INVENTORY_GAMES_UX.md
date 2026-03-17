# Activity & Games Comprehensive Inventory

**Document ID**: TCK-20260205-001 - Phase 2 Part A  
**Audit Date**: 2026-02-05  
**Last Updated**: 2026-03-19 (Updated to reflect equal priority for all games)  
**Discovery Method**: Codebase grep + explore agent analysis  
**Status**: Complete inventory of all games, activities, and learning experiences

---

## 📊 INVENTORY SUMMARY

| Category                       | Count | Status                     |
| ------------------------------ | ----- | -------------------------- |
| **All Games**                  | 114+  | Active in Production       |
| **3D Games**                   | 12    | Released + Active          |
| **Quest Chains**               | 8     | Backend configured         |
| **Social Activities**          | 6     | Template-based             |
| **Supported Languages**        | 5     | EN, HI, KN, TE, TA         |
| **Activity Types Tracked**     | 3     | drawing, recognition, game |
| **Total Learning Experiences** | 120+  | Across all combinations    |

**Vision Alignment**: ✅ All games have **EQUAL PRIORITY**. No "core" vs "secondary" distinction. Each game serves different learning objectives and age groups.

---

## 🎮 ALL GAMES (EQUAL PRIORITY)

**Note**: The following games are all production-ready and actively used. They are listed alphabetically, not by priority.

### 1. Alphabet Tracing (Draw Letters)

- **File**: `src/frontend/src/pages/AlphabetGame.tsx`
- **Route**: `/games/alphabet-tracing`
- **Type**: Drawing/Tracing activity
- **Age Range**: 2-8 years
- **CV Mode**: Hand tracking
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

### 2. Connect the Dots

- **File**: `src/frontend/src/pages/ConnectTheDots.tsx`
- **Route**: `/games/connect-the-dots`
- **Type**: Drawing/sequencing activity
- **Age Range**: 3-6 years
- **CV Mode**: Hand tracking
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

### 3. Finger Counting (Finger Number Show)

- **File**: `src/frontend/src/games/FingerNumberShow.tsx` + `finger-number-show/`
- **Route**: `/games/finger-number-show`
- **Type**: Recognition/Hand gesture activity
- **Age Range**: 3-7 years
- **CV Mode**: Hand gesture recognition
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

### 4. Find the Letter (Letter Hunt)

- **File**: `src/frontend/src/pages/LetterHunt.tsx`
- **Route**: `/games/letter-hunt`
- **Type**: Recognition/search activity
- **Age Range**: 2-6 years
- **CV Mode**: Hand tracking
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

**Status**: ⚠️ Backend configured, but **NOT EXPOSED in frontend** (Islands not shown in Games page)

---

## 👥 SOCIAL LEARNING ACTIVITIES (6 TEMPLATES)

**File**: `src/frontend/src/data/socialActivities.ts`

**Purpose**: Structured social interaction templates for multiplayer/classroom use

**Status**: ⚠️ Defined as templates, **NOT IMPLEMENTED in games** (No UI/gameplay implementation found)

---

## 🌍 MULTILINGUAL SUPPORT (5 LANGUAGES)

**File**: `src/frontend/src/data/alphabets.ts`

### Supported Languages

| Language | Code | Script     | Letters             | Status          |
| -------- | ---- | ---------- | ------------------- | --------------- |
| English  | EN   | Latin      | 26 (A-Z)            | ✅ Full support |
| Hindi    | HI   | Devanagari | Vowels + Consonants | ✅ Full support |
| Kannada  | KN   | Kannada    | Complete alphabet   | ✅ Full support |
| Telugu   | TE   | Telugu     | Complete alphabet   | ✅ Full support |
| Tamil    | TA   | Tamil      | Complete alphabet   | ✅ Full support |

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

**Status**: ✅ Backend infrastructure complete, but **limited event granularity** (no per-attempt tracking, no gesture quality metrics, no per-game events)

---

## � NOTES

### Analytics Implementation Status

**CRITICAL**: While the inventory lists analytics fields, the actual implementation is **NOT PRESENT** in the game files. Analytics infrastructure exists (`analyticsStore.ts`) but is not integrated into any games.

**Action Required**: Implement analytics tracking in all games.

### Difficulty Implementation

Most games have **dynamic difficulty** (not hardcoded):

- Alphabet Tracing: Uses global settings store
- Finger Counting: Has DIFFICULTY_LEVELS array
- Connect the Dots: Has easy/medium/hard modes
- Letter Hunt: Currently hardcoded (needs update)

### Hand Tracking

All games use robust hand tracking with:

- Error handling and recovery
- Multiple lifecycle states
- Graceful degradation

---

**Last Verified**: 2026-03-19  
**Next Review**: After analytics implementation
