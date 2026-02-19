# Feature: Number Tracing Game

**Status**: 🔲 Planned
**Priority**: P1
**Owner**: TBD
**Created**: 2026-01-29
**Last Updated**: 2026-01-29

---

## 1. Overview

### 1.1 Description

A number tracing game where children trace numbers 0-9 using hand tracking (same mechanics as letter tracing). This extends the existing tracing game to teach numeracy skills.

### 1.2 Problem Statement

- Currently only have letter tracing (A-Z)
- No numeracy/number recognition games
- Children need to learn numbers 0-9 before advancing to math

### 1.3 Success Criteria

- [ ] Children can trace numbers 0-9
- [ ] Accuracy scoring works same as letter tracing
- [ ] Progress is saved to backend
- [ ] Numbers display with visual aids (dots, fingers, etc.)

---

## 2. User Stories

### Story 1: Child Tracing Numbers

**As a** child (age 4-6)
**I want** to trace numbers with my finger
**So that** I can learn to write numbers

**Acceptance Criteria:**

- Given I'm on the game page, when I select "Numbers" mode, then I see numbers 0-9
- Given a number is displayed, when I trace it correctly, I get points
- Given I complete a number, when my accuracy is >70%, I advance to next number

### Story 2: Parent Viewing Progress

**As a** parent
**I want** to see my child's number tracing progress
**So that** I know they're learning numeracy

**Acceptance Criteria:**

- Given I'm on the dashboard, when I view progress, I see numbers learned
- Given my child traces numbers, when I check stats, I see accuracy over time

---

## 3. Functional Requirements

### 3.1 Core Functionality

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | Display numbers 0-9 for tracing | P0 | Same UI as letter tracing |
| FR-2 | Hand tracking for number tracing | P0 | Reuse existing hand tracking |
| FR-3 | Accuracy calculation for numbers | P0 | Same algorithm as letters |
| FR-4 | Progress saving (activity_type: 'number_tracing') | P0 | Backend support |
| FR-5 | Visual aids (dots representing number value) | P1 | e.g., 5 has 5 dots |
| FR-6 | Number pronunciation audio | P2 | Optional enhancement |

### 3.2 Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Child traces backwards | Still counts if accuracy is good |
| Number is partially traced | Show partial accuracy |
| All numbers mastered | Show celebration, loop back or unlock next difficulty |

---

## 4. Technical Specification

### 4.1 Architecture

```
Game.tsx (existing)
  ├── LetterTracingMode (existing)
  └── NumberTracingMode (NEW)
        ├── NumberDisplay (0-9 with dots)
        ├── HandTrackingCanvas (reuse)
        └── AccuracyScoring (reuse)
```

### 4.2 Data Model

```typescript
// New data file: src/frontend/src/data/numbers.ts
interface NumberData {
  char: string;        // '0', '1', '2', etc.
  name: string;        // 'Zero', 'One', etc.
  value: number;       // 0, 1, 2, etc.
  dots: number;        // Visual dots to display
  color: string;       // Theme color
}

// Activity type for backend
activity_type: 'number_tracing'
```

### 4.3 API/Interface

No new backend APIs needed. Uses existing:

- `POST /progress/` with `activity_type: 'number_tracing'`

### 4.4 Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| Hand tracking (MediaPipe) | Finger tracking | ✅ Already integrated |
| Accuracy algorithm | Scoring | ✅ Already implemented |
| Progress API | Save progress | ✅ Already exists |

---

## 5. UI/UX Specification

### 5.1 User Flow

```
Dashboard → Select Profile → Game Page → Choose "Numbers" Mode → Trace 0-9
```

### 5.2 Screen Details

**Number Tracing Mode**

- Same layout as letter tracing
- Number displayed large center
- Dots representing number value (e.g., 3 = ● ● ●)
- Hand tracking overlay
- Accuracy bar at bottom

### 5.3 Sound & Haptics

| Action | Sound | Haptic |
|--------|-------|--------|
| Number appears | "Trace the number 5" | No |
| Good tracing | Success chime | Light |
| Perfect tracing | Celebration sound | Medium |

---

## 6. Testing Strategy

### 6.1 Manual Testing

- [ ] Can switch between Letters and Numbers mode
- [ ] All numbers 0-9 display correctly
- [ ] Hand tracking works on numbers
- [ ] Accuracy calculates correctly
- [ ] Progress saves to backend
- [ ] Dashboard shows number progress

---

## 7. Implementation Plan

### 7.1 Tasks

- [ ] Create `src/frontend/src/data/numbers.ts` with number data (0-9)
- [ ] Add "Game Mode" selector to Game page (Letters / Numbers)
- [ ] Create NumberTracing component (reuse hand tracking)
- [ ] Update progress store to track numbers
- [ ] Update Dashboard to show number progress
- [ ] Add activity_type: 'number_tracing' to backend (if not exists)

### 7.2 Estimated Effort

- **Total**: 2-3 days
- **Breakdown**:
  - Data/model setup: 2 hours
  - UI components: 4 hours
  - Integration: 2 hours
  - Testing: 2 hours

---

## 8. Open Questions

1. Should we include numbers 10-20 in v1 or keep it 0-9?
2. Should numbers game have different difficulty levels?
3. Do we want quantity matching (e.g., match number 3 to 3 apples)?

---

## 9. Notes

- Reuse as much existing code as possible
- Keep same interaction model as letter tracing (familiar to kids)
- Can extend to "Counting Game" later (match numbers to quantities)
