# Analytics Architecture Documentation

**Version**: 1.0  
**Date**: 2026-03-03  
**Status**: Active

---

## 1. Executive Summary

The Advay Vision Learning platform implements a comprehensive analytics system that tracks student progress through computer vision games. This document describes the current architecture, identified gaps, and proposed enhancements.

**Key Metrics Tracked:**
- 39+ CV-powered learning games
- 3,000+ potential progress data points per child per month
- Offline-first architecture with automatic sync

---

## 2. Current Architecture

### 2.1 Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Game Play     │────▶│  Progress Queue  │────▶│   Backend API   │
│  (CV-enabled)   │     │  (Offline-first) │     │   (FastAPI)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │   PostgreSQL    │
                                                 │   Database      │
                                                 └─────────────────┘
                                                          │
                        ┌───────────────────────────────┘
                        ▼
               ┌─────────────────────┐     ┌────────────────  Parent Dashboard ─┐
               │ │◀────│   Progress     │
               │   (Progress.tsx)   │     │   Calculations │
               └─────────────────────┘     └─────────────────┘
```

### 2.2 Frontend Components

| File | Lines | Purpose |
|------|-------|---------|
| `src/services/progressTracking.ts` | 171 | Core progress recording with idempotency |
| `src/services/progressQueue.ts` | ~300 | Offline queue with retry/dead-letter |
| `src/services/progressConstants.ts` | ~50 | Activity type constants |
| `src/services/progressValidation.ts` | ~100 | Payload validation |
| `src/utils/progressCalculations.ts` | ~400 | Metrics computation |
| `src/types/progress.ts` | 109 | TypeScript interfaces |
| `src/store/progressStore.ts` | ~200 | Zustand state management |
| `src/pages/Progress.tsx` | 542 | Parent dashboard UI |

### 2.3 Backend Components

| File | Purpose |
|------|---------|
| `app/api/v1/endpoints/progress.py` | REST API for progress CRUD |
| `app/services/progress_service.py` | Business logic for progress |
| `app/db/models/progress.py` | SQLAlchemy ORM model |
| `app/schemas/progress.py` | Pydantic validation schemas |

### 2.4 Database Schema

**Table: `progress`**
```sql
- id: UUID (PK)
- profile_id: UUID (FK)
- activity_type: VARCHAR (e.g., 'letter_tracing', 'game')
- content_id: VARCHAR (e.g., 'letter-A', 'alphabet-game')
- score: INTEGER
- completed: BOOLEAN
- completed_at: TIMESTAMP
- duration_seconds: INTEGER
- meta_data: JSONB
- attempt_count: INTEGER (NEW - added 2026-02-27)
- idempotency_key: VARCHAR (unique constraint)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

## 3. Metrics Tracked

### 3.1 Current Metrics

| Metric | Type | Source | Display |
|--------|------|--------|---------|
| **Practice Score** | Computed | All activities | Parent dashboard |
| **Mastery Level** | Computed | Letter activities | Parent dashboard |
| **Challenge Score** | Computed | Game completions | Parent dashboard |
| **Consistency Score** | Computed | Daily activity | Parent dashboard |
| **Unique Letters** | Count | Letter tracing | Parent dashboard |
| **Total Score** | Sum | All activities | Parent dashboard |
| **Completion Rate** | Percentage | Game sessions | Quality system |
| **Engagement Rate** | Percentage | Play frequency | Quality system |

### 3.2 Progress Types

```typescript
type ActivityType = 
  | 'letter_tracing'    // Alphabet tracing games
  | 'letter_recognition' // Beginning sounds, etc.
  | 'math'              // Number games
  | 'game'              // General games
  | 'exploration';      // Discovery lab, etc.
```

### 3.3 Scorecard System

The `UnifiedMetrics` system provides:
- **Practice**: Regular engagement score
- **Mastery**: Letter/number mastery level
- **Challenge**: Difficulty progression
- **Consistency**: Daily habit formation

---

## 4. Identified Gaps

### 4.1 Gap Analysis Matrix

| Gap ID | Gap Name | Severity | Impact | Effort |
|--------|----------|----------|--------|--------|
| GAP-01 | Per-attempt tracking | HIGH | Can't detect struggle patterns | Medium |
| GAP-02 | Error pattern detection | HIGH | No learning difficulty alerts | Medium |
| GAP-03 | Time-on-task per item | MEDIUM | Can't identify attention issues | Low |
| GAP-04 | Class-level analytics | MEDIUM | Teachers can't see aggregate | High |
| GAP-05 | A/B testing events | LOW | Can't experiment | Medium |
| GAP-06 | Real-time engagement | LOW | No live signals | Medium |

### 4.2 GAP-01: Per-attempt Tracking

**Current Behavior:**
- Only final attempt saved to backend
- `attempt_count` field exists but not populated by games

**Impact:**
- Can't detect if child struggled (many attempts = difficulty)
- Can't provide targeted help

**Required Changes:**
- Games must emit attempt events
- Backend must accept array of attempts
- UI must show attempt history

### 4.3 GAP-02: Error Pattern Detection

**Current Behavior:**
- Score saved but not error types
- No pattern recognition

**Impact:**
- Can't identify letter confusion (b/d, p/q)
- Can't detect motor control issues
- Can't provide specific interventions

**Required Changes:**
- Capture error types per attempt
- Implement pattern detection algorithm
- Add alerts for teachers/parents

### 4.4 GAP-03: Time-on-Task

**Current Behavior:**
- Total session duration tracked
- No per-item time breakdown

**Impact:**
- Can't identify attention issues
- Can't measure true engagement
- Can't optimize game length

**Required Changes:**
- Track start/end time per item
- Calculate active vs idle time
- Display in analytics

### 4.5 GAP-04: Class-level Analytics

**Current Behavior:**
- Individual child progress only
- No teacher view

**Impact:**
- Teachers can't see class-wide trends
- No rubric-based assessment
- Can't identify struggling students

**Required Changes:**
- Teacher role & permissions
- Aggregate dashboard
- Rubric system (Emerging/Developing/Proficient/Advanced)

### 4.6 GAP-05: A/B Testing

**Current Behavior:**
- No experiment tracking

**Impact:**
- Can't optimize game design
- Can't measure feature impact

**Required Changes:**
- Experiment assignment system
- Event tracking for variants
- Statistical analysis

### 4.7 GAP-06: Real-time Engagement

**Current Behavior:**
- Post-session sync only

**Impact:**
- No live intervention possible
- Can't detect frustration early
- Can't adjust difficulty

**Required Changes:**
- WebSocket or polling for live events
- Engagement score calculation
- Automatic difficulty adjustment

---

## 5. Implementation Priority

### Phase 1 (This Sprint)
1. **GAP-01**: Per-attempt tracking - High ROI, enables GAP-02
2. **GAP-03**: Time-on-task - Low effort, valuable data

### Phase 2 (Next Sprint)
3. **GAP-02**: Error pattern detection - Builds on GAP-01
4. **GAP-04**: Class analytics - Teacher demand

### Phase 3 (Future)
5. **GAP-05**: A/B testing framework
6. **GAP-06**: Real-time engagement

---

## 6. Related Documentation

- [Progress Tracking Integration](./PROGRESS_INTEGRATION.md)
- [Quality Metrics System](./GAME_QUALITY_SYSTEM.md)
- [Parent Dashboard UX](./PARENT_DASHBOARD.md)
- [Teacher Dashboard Spec](./TEACHER_DASHBOARD.md)

---

## 7. New Implementations (2026-03-03)

### 7.1 Per-Attempt Tracking (GAP-01)

**Files:**
- `src/types/progress.ts` - Added `Attempt`, `ErrorDetail`, `StruggleIndicator` types
- `src/utils/progressCalculations.ts` - Added `createAttempt()`, `calculateStruggleIndicator()`, `detectErrorPatterns()`, `aggregateAttempts()`

**Usage:**
```typescript
import { createAttempt, aggregateAttempts } from '../utils/progressCalculations';

const attempts = [
  createAttempt(1, 60, 30, { accuracy: 0.7 }),
  createAttempt(2, 80, 25, { accuracy: 0.85 }),
  createAttempt(3, 95, 20, { accuracy: 0.95, completed: true }),
];

const progressItem = aggregateAttempts('letter_tracing', 'letter-A', attempts);
```

### 7.2 Struggle Detection (GAP-02)

**Features:**
- Tracks error patterns (confusion between b/d, p/q, etc.)
- Detects timeout issues
- Identifies helped vs independent completion
- Classifies attention level (none/low/medium/high)

**Error Pattern Detection:**
```typescript
import { detectErrorPatterns } from '../utils/progressCalculations';

const pattern = detectErrorPatterns(attempts);
// Returns: "confusion:b-d" | "confusion:p-q" | "timeout-issues" | undefined
```

### 7.3 Time-on-Task (GAP-03)

**Files:**
- `src/hooks/useTimeOnTask.ts` - React hook for real-time tracking
- `src/services/progressTracking.ts` - Extended with `TimeOnTask` interface

**Usage:**
```typescript
import { useTimeOnTask } from '../hooks/useTimeOnTask';

function LetterTracingGame() {
  const { recordActivity, getTimeOnTask } = useTimeOnTask('letter-A');
  
  // Call on each interaction
  recordActivity();
  
  // Get current time tracking
  const timeData = getTimeOnTask();
}
```

### 7.4 Class-Level Analytics (GAP-04)

**Files:**
- `src/types/teacher.ts` - Types for teacher dashboard

**Features:**
- `StudentProgress` - Individual student rubric assessment
- `ClassAnalytics` - Aggregate class statistics
- `RubricLevel` - Emerging/Developing/Proficient/Advanced
- `GroupProgress` - Group-based analysis

### 7.5 A/B Testing Framework (GAP-05)

**Files:**
- `src/services/experiments.ts` - Full A/B testing system

**Usage:**
```typescript
import { assignToExperiment, trackExperimentEvent, calculateExperimentResults } from '../services/experiments';

const assignment = assignToExperiment('new-game-ui', ['control', 'a', 'b'], profileId);

trackExperimentEvent({
  experimentId: 'new-game-ui',
  variant: assignment.variant,
  eventName: 'game_completed',
  value: score,
});

const results = calculateExperimentResults('new-game-ui', 'game_completed');
```

### 7.6 Real-Time Engagement (GAP-06)

**Files:**
- `src/hooks/useRealTimeEngagement.ts` - Live engagement tracking

**Usage:**
```typescript
import { useRealTimeEngagement } from '../hooks/useRealTimeEngagement';

function Game() {
  const { engagementLevel, recordInteraction, recordSuccess, recordError } = 
    useRealEngagement('alphabet-game', profileId);
  
  // Call on interactions
  recordInteraction();
  recordSuccess();
  // or
  recordError();
  
  // engagementLevel: 'high' | 'medium' | 'low' | 'idle'
}
```

---

## 8. Appendix: Code References

### Key Types (src/types/progress.ts)
```typescript
interface ProgressItem {
  id: string;
  activity_type: string;
  content_id: string;
  score: number;
  completed?: boolean;
  completed_at: string;
  duration_seconds?: number;
  meta_data?: Record<string, unknown>;
  attempt_count?: number;
}
```

### Progress Payload (src/services/progressTracking.ts)
```typescript
interface GameProgressPayload {
  profileId?: string | null;
  gameName: string;
  score: number;
  durationSeconds: number;
  level?: number;
  accuracy?: number;
  routePath?: string;
  sessionId?: string;
  metaData?: Record<string, unknown>;
  completed?: boolean;
}
```
