# Unified Activity Tracking Implementation

**Ticket:** TCK-20260307-ARCH-001  
**Title:** Unify Activity Tracking Architecture (Alphabet + Games)  
**Date:** 2026-03-07  
**Type:** ARCHITECTURE & REFACTORING  
**Priority:** P1  
**Status:** OPEN

---

## Step 1: Analysis (Current State)

### Observed Evidence

**Current Architecture (Fragmented):**
```
Alphabet Progress (Special Case)
├── Stored: progressStore.letterProgress
├── Displayed: Settings.tsx (wrong location)
├── Reset: Settings.tsx (language-specific)
├── Structure: LetterProgress { letter, attempts, bestAccuracy, mastered }
└── Threshold: 70% accuracy = "mastered"

Game Progress (Generic)
├── Stored: progressStore.gameHistory
├── Displayed: Dashboard.tsx (partial)
├── Reset: Not available
├── Structure: GamePlayHistoryEntry { gameId, lastPlayed, playCount, score }
└── No mastery tracking

Teacher Assessment (Unused Types)
├── Stored: types/teacher.ts (RubricLevel, RubricAssessment)
├── Displayed: Not implemented
└── Status: Planned for B2B teacher dashboard
```

**Files Analyzed:**
- `src/store/progressStore.ts` - Two parallel tracking systems
- `src/pages/Settings.tsx` - Alphabet tracking displayed here (wrong place)
- `src/pages/Dashboard.tsx` - Game history displayed here
- `src/types/teacher.ts` - Rubric types defined but unused
- `docs/INVESTIGATION_Why_Only_Alphabet_Tracked.md` - Prior research

---

## Step 2: Intended Spec (Target State)

### User Stories

**As a parent:**
- I want to see ALL my child's activity in one place (not hunt between Settings and Dashboard)
- I want to see engagement (time, variety, enjoyment) not just achievement
- I want to understand play patterns (creative, exploratory, mastery)

**As a teacher (B2B future):**
- I need rubric-based assessment (Emerging/Developing/Proficient/Advanced)
- I need curriculum alignment for reporting
- I need class-level aggregation

**As a child:**
- I want all content always available (no gating)
- I don't want to feel "graded"
- I want to explore freely

### Target Architecture

```
Unified Activity Store
├── ActivityRecord (all types)
│   ├── type: 'alphabet' | 'game' | 'creative'
│   ├── activityId: string
│   ├── profileId: string
│   ├── durationSeconds: number
│   ├── engagementScore: number (not accuracy)
│   ├── playPattern: 'creative' | 'exploration' | 'mastery' | 'physical'
│   └── timestamp
│
├── Views
│   ├── Parent View (Dashboard): Engagement-focused
│   │   ├── Recently Played (all types mixed)
│   │   ├── Play Pattern Breakdown
│   │   └── Time/Variety metrics
│   │
│   └── Teacher View (Future): Assessment-focused
│       ├── Rubric Assessment per activity
│       ├── Curriculum alignment
│       └── Class aggregation
│
└── Settings: NO progress tracking (configuration only)
```

---

## Step 3: Gap Analysis

| ID | Gap | Impact | Fix Approach | Priority |
|----|-----|--------|--------------|----------|
| GAP-01 | Alphabet tracking in Settings | Wrong location, inconsistent UX | Move to Dashboard | P0 |
| GAP-02 | Two parallel data models | Code duplication, maintenance burden | Unify to ActivityRecord | P0 |
| GAP-03 | No play pattern tracking | Can't show "creative vs mastery" play | Add playPattern field | P1 |
| GAP-04 | Mastery threshold (70%) | Performance pressure, gating | Remove threshold, track engagement | P1 |
| GAP-05 | Teacher types unused | Planned B2B feature not connected | Integrate with unified model | P2 |
| GAP-06 | Content gating by batch | Violates "open playground" | Remove UNLOCK_THRESHOLD | P1 |

---

## Step 4: Research

**Research Item 1: Play Pattern Taxonomy**
- Source: `docs/VISION_ALIGNED_OPPORTUNITIES.md`
- Finding: 7 play patterns identified (Creative, Mastery, Exploration, Social, Physical, Narrative, Challenge)
- Decision: Use 4 primary patterns for MVP

**Research Item 2: Engagement vs Achievement Metrics**
- Source: `docs/research/PARENT_DASHBOARD_SPEC.md`
- Finding: Parents want "time spent, activities completed, favorites" not "accuracy, percentiles"
- Decision: Focus on engagement metrics for parent view

**Research Item 3: Rubric Assessment for Teachers**
- Source: `src/types/teacher.ts`
- Finding: RubricLevel types already defined (emerging/developing/proficient/advanced)
- Decision: Preserve for teacher dashboard, separate from parent view

---

## Step 5: Improvement Plan

### Phase 1: Immediate Fixes (1-2 days)
1. Remove alphabet tracking from Settings
2. Move to Dashboard under unified view
3. Simplify labels ("Played With" vs "Mastered")

### Phase 2: Data Model Unification (3-4 days)
1. Create unified ActivityRecord type
2. Migrate letterProgress to ActivityRecord
3. Migrate gameHistory to ActivityRecord
4. Deprecate old types

### Phase 3: Play Pattern Tracking (2-3 days)
1. Add playPattern classification to each game
2. Track engagement score (not accuracy)
3. Update Dashboard to show play patterns

### Phase 4: Remove Gating (1 day)
1. Remove UNLOCK_THRESHOLD
2. Remove batch unlock logic
3. Make all content available

---

## Step 6: Implementation Units

### Unit 1: Settings Cleanup
```typescript
// REMOVE from Settings.tsx:
- getMasteredLettersCount display
- "Letters Explored" section
- resetProgress button (alphabet-specific)
```

### Unit 2: Dashboard Unified View
```typescript
// ADD to Dashboard.tsx:
+ UnifiedActivityFeed component
+ PlayPatternBreakdown component
+ RecentActivity (all types mixed)
```

### Unit 3: Unified Data Model
```typescript
// NEW: src/types/activity.ts
export interface ActivityRecord {
  id: string;
  type: 'alphabet' | 'game' | 'creative';
  activityId: string;
  profileId: string;
  startedAt: string;
  durationSeconds: number;
  playPattern: 'creative' | 'exploration' | 'mastery' | 'physical';
  engagementScore: number; // 0-100, not accuracy-based
  metadata?: Record<string, unknown>;
}

// Teacher extension
export interface ActivityWithRubric extends ActivityRecord {
  rubricAssessment?: {
    level: 'emerging' | 'developing' | 'proficient' | 'advanced';
    assessedAt: string;
    assessedBy?: string;
  };
}
```

### Unit 4: Remove Gating
```typescript
// REMOVE from progressStore.ts:
- UNLOCK_THRESHOLD
- batch unlock logic
- mastered boolean

// KEEP but rename:
- markLetterAttempt → recordLetterPlay
- Remove accuracy threshold
```

---

## Step 7: Acceptance Criteria

- [ ] Alphabet tracking removed from Settings
- [ ] Unified activity view in Dashboard
- [ ] All activities (alphabet + games) displayed together
- [ ] No "mastered" language (use "played", "explored")
- [ ] Play pattern tracking implemented
- [ ] Content gating removed (all always available)
- [ ] Teacher rubric types preserved (for future B2B)
- [ ] Migration path for existing data
- [ ] TypeScript compiles without errors
- [ ] Tests updated

---

## Step 8: Documentation

**Execution Log:**
- [timestamp] [action] | Evidence: [output]

**Status Updates:**
- 2026-03-07 **OPEN** - Ticket created, awaiting implementation

---

## Next Actions

1. Create feature branch: `codex/wip-unified-activity`
2. Implement Unit 1: Settings cleanup
3. Implement Unit 2: Dashboard unified view
4. Run migration script for existing data
5. Test and verify

---

**Evidence Label:** Observed - Code analysis; Inferred - User needs from research docs

**Prompt Trace:** AGENTS.md §8 lifecycle, User 9-step workflow
