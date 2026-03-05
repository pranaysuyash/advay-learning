# Dashboard Gap Analysis & Implementation Plan

**Date**: 2026-03-03  
**Status**: Consolidated from multiple docs & research

---

## 0. Decision: Parked

**Parent Dashboard** (`Progress.tsx`) and **Teacher Dashboard** are **PARKED** for now. Focus is on Child Home Page (`Dashboard.tsx`).

---

## 1. Current State

### 1.1 Existing Dashboards

| Dashboard | Location | Status | Lines |
|-----------|----------|--------|-------|
| **Parent Dashboard** | `src/pages/Progress.tsx` | ✅ Working | 542 |
| **Child Dashboard** | `src/pages/Dashboard.tsx` | ✅ Working | ~600+ |
| **Wellness Dashboard** | `src/components/WellnessDashboard.tsx` | ✅ Working | ~200 |
| **Teacher Dashboard** | ❌ NOT IMPLEMENTED | N/A | N/A |

### 1.2 Parent Dashboard Features (Progress.tsx)

| Feature | Status | Notes |
|---------|--------|-------|
| Profile selection | ✅ | Multi-child support |
| Progress metrics | ✅ | Score, mastery, consistency |
| Daily time chart | ✅ | 7-day breakdown |
| Plant visualization | ✅ | Gamification |
| Recommendations | ✅ | AI-driven suggestions |
| Export to PDF | ✅ | Report generation |
| Needs attention | ✅ | Struggle detection |
| Offline sync | ✅ | Queue with retry |
| Letter metrics | ✅ | Fixed Feb 2026 |

### 1.3 Missing Features (from discussions)

| Gap | Priority | Evidence |
|-----|----------|----------|
| **No teacher dashboard** | HIGH | Multiple docs mention need for "class-level analytics" |
| **No curriculum mapping** | HIGH | Docs: "cannot recommend without curriculum alignment" |
| **No rubric-based assessment** | HIGH | Teacher needs: Emerging/Developing/Proficient/Advanced |
| **No CSV export** | MEDIUM | Parent requests "professional progress reports" |
| **No real-time monitoring** | MEDIUM | Teacher wants "real-time teacher monitoring dashboard" |
| **No multi-student (class) view** | HIGH | Need "18 of 35 children struggling" view |
| **No printable reports** | MEDIUM | "Printable one-page reports for parent-teacher meetings" |

---

## 2. Requirements from Research

### 2.1 Teacher Persona (Ms. Deepa)

From `docs/personas/TEACHER_Ms_Deepa.md`:
- Class-level analytics
- Curriculum-aligned progress reports
- Bulk student accounts
- Printable reports

### 2.2 Best Practices (from research)

Key principles for K-12 learning dashboards:
1. **Simplicity** - Reduce cognitive load, simple graphs
2. **Curriculum alignment** - Metrics map to learning outcomes
3. **Real-time** - Timely insights for intervention
4. **Actionable** - Clear recommendations, not just data
5. **Rubric-based** - Emerging/Developing/Proficient/Advanced
6. **Privacy** - Role-based access control

---

## 3. PARENT & TEACHER DASHBOARDS - PARKED

These are documented here but **NOT PRIORITIZED** for implementation.

| Gap ID | Feature | Status | Priority |
|--------|---------|--------|----------|
| PG-01 | Curriculum mapping | ❌ Missing | P0 |
| PG-02 | Detailed attempt history | 🔄 Partial | P1 |
| TG-01 | Teacher role/auth | ❌ Missing | P0 |
| TG-02 | Class-level aggregation | ❌ Missing | P0 |
| TG-03 | Rubric assessment view | ❌ Missing | P0 |

---

## 4. Home Page Dashboard (Dashboard.tsx) - IMPLEMENTED ✅

**Research**: `docs/research/GAME_ROTATION_DISCOVERY_STRATEGY_2026-02-25.md`

### Implemented Features (2026-03-05)

| Feature | Status | File |
|---------|--------|------|
| Dynamic game recommendations | ✅ | `src/services/gameRecommendations.ts` |
| Personal history (continue playing) | ✅ | Uses progress API |
| New games section | ✅ | Based on isNew flag |
| Popular with kids | ✅ | Random shuffle fallback |
| Time-based vibes | ✅ | Morning=brainy, Afternoon=active, Evening=chill |
| Age-appropriate filtering | ✅ | Filters based on profile age |
| Device capability check | ✅ | Filters CV games if no camera |
| Time-of-day greeting | ✅ | "Good morning/afternoon/evening" |
| "For You" personalized section | ✅ | Dashboard.tsx |

### How It Works

1. Dashboard fetches progress from API on mount
2. Extracts played game IDs from progress items
3. Generates dynamic recommendations:
   - **Continue Playing**: Games from play history
   - **New Games**: Games with isNew flag
   - **Popular**: Randomized selection
   - **Perfect for [time]**: Based on current hour
   - **Haven't Tried**: Unplayed games filtered by age

---

## 5. Implementation Plan

### Phase 1: Home Page Dynamic Recommendations (NOW)</1. Replace hardcoded `RECOMMENDED_GAMES` with dynamic system2. Use existing game metadata (worldId, vibe, ageRange)3. Integrate with progress store for personalization

2. **Frontend**
   - Create TeacherDashboard page
   - Class overview component
   - Student roster with progress
   - Rubric-based assessment UI
   - Export functionality

### Phase 3: Advanced Features

1. Real-time WebSocket updates
2. A/B testing for dashboard
3. Parental controls integration

---

## 5. Technical Dependencies

### Already Implemented (this session)
- `src/types/teacher.ts` - Teacher types
- `src/types/progress.ts` - Extended with attempts/struggle
- `src/hooks/useTimeOnTask.ts` - Time tracking
- `src/services/experiments.ts` - A/B testing

### Needed for Teacher Dashboard
- Backend: Teacher role + class management
- Frontend: New page + components
- API: Aggregation endpoints

---

## 6. Files to Create/Modify

### New Files
```
src/frontend/src/pages/TeacherDashboard.tsx
src/frontend/src/components/teacher/
  ClassOverview.tsx
  StudentRoster.tsx
  RubricView.tsx
  ExportControls.tsx
src/backend/app/models/class.py (new)
src/backend/app/api/v1/endpoints/teacher.py (new)
```

### Modify
```
src/backend/app/models/user.py - Add teacher role
src/frontend/src/App.tsx - Add teacher routes
src/frontend/src/types/teacher.ts - Already created
```

---

## 7. Next Steps

1. **Confirm**: Should we prioritize teacher dashboard over parent enhancements?
2. **Decision**: Build teacher dashboard from scratch OR extend existing Progress page?
3. **Scope**: What features are MVP for pilot?

---

## Evidence Sources

- `docs/personas/TEACHER_Ms_Deepa.md` - Teacher needs
- `docs/WORKLOG_ADDENDUM_v3.md` - Line 2141, 3145
- `docs/analytics/ARCHITECTURE.md` - Current analytics state
- `src/frontend/src/pages/Progress.tsx` - Parent dashboard (working)
- Research: Learning Analytics Dashboards K-12 best practices
