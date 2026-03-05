### TCK-20260303-019 :: Shape Pop Game Analysis and Improvement

Ticket Stamp: STAMP-20260303T064434Z-codex-kivm

Type: GAME_IMPROVEMENT
Owner: Pranay
Created: 2026-03-03 11:30 IST
Status: **IN_PROGRESS**
Priority: P1

Scope contract:

- In-scope: Deep analysis of Shape Pop game, identify gaps vs intended behavior, document findings, implement improvements following 9-step workflow
- Out-of-scope: Changes to other games, backend modifications, asset creation
- Behavior change allowed: YES (game balance, UX enhancements)

Targets:

- Repo: learning_for_kids
- File(s): `src/frontend/src/pages/ShapePop.tsx`
- Analysis artifact: `docs/GAME_IMPROVEMENT_SHAPE_POP_ANALYSIS.md`
- Branch/PR: local development

Inputs:

- Game selection criteria: Hand-tracking target practice game, no existing audit, different from Bubble Pop (microphone) and Memory Match (cards)
- Prompt used: User's 9-step workflow (analysis → document → plan → research → document → implement → test → document)

Acceptance Criteria:

- [ ] Analysis document created with Intended Spec, Observed Spec, Gap Analysis
- [ ] All findings backed by concrete code evidence (file paths, line numbers)
- [ ] Implementation units planned with clear scope boundaries
- [ ] Changes implemented in small, reversible units
- [ ] Tests pass (TypeScript, ESLint)
- [ ] Worklog updated with evidence

Prompt Trace: user's 9-step workflow
Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md

Execution log:

- 2026-03-03 11:30 IST | Selected Shape Pop game | Evidence: No audit files, cv: ['hand'] in registry, target practice mechanics
- 2026-03-03 11:30 IST | Created worklog addendum | Evidence: This file with ticket stamp STAMP-20260303T064434Z-codex-kivm
- 2026-03-03 11:35 IST | Analyzed game structure | Evidence: `ShapePop.tsx` lines 1-279, uses `targetPracticeLogic.ts`
- 2026-03-03 11:35 IST | Documented Intended Spec | Evidence: Target practice loop, hand tracking pinch mechanics
- 2026-03-03 11:35 IST | Documented Observed Spec | Evidence: Flat scoring (15 pts), no difficulty levels, fixed target size
- 2026-03-03 11:35 IST | Created Gap Analysis | Evidence: 6 gaps identified (GAP-01 to GAP-06)
- 2026-03-03 11:35 IST | Created analysis document | Evidence: `docs/GAME_IMPROVEMENT_SHAPE_POP_ANALYSIS.md` (10,206 bytes)
- 2026-03-03 12:30 IST | **UNIT 1 Implemented**: Combo scoring + Difficulty selection | Evidence: `GAME_CONFIG` with Easy/Medium/Hard, streak tracking, combo bonus calculation
- 2026-03-03 12:30 IST | **Features added**: Streak UI, difficulty menu, adaptive target sizing | Evidence: Streak display with fire emoji, 3 difficulty buttons
- 2026-03-03 12:35 IST | TypeScript check passed | Evidence: `npm run type-check` - no errors
- 2026-03-03 12:35 IST | ESLint check passed | Evidence: `npx eslint src/pages/ShapePop.tsx` - clean

Status updates:

- 2026-03-03 12:35 IST **DONE** — Unit 1 complete (combo scoring + difficulty selection), tests passing

## Implementation Summary

**Unit 1 Changes**:
1. Added `GAME_CONFIG` constant with Easy (180px), Medium (144px), Hard (120px) target sizes
2. Implemented streak tracking with visual indicator (🔥 5x, ✨ 3x)
3. Added combo scoring: base 10 + combo bonus (+2 per streak, max +10) + streak bonus (+25 at 5x)
4. Created difficulty selection menu with 3 options (🌱 Easy, 🌟 Medium, 🔥 Hard)
5. Miss now resets streak with feedback
6. Updated TTS to announce streaks and difficulty mode

**Files Modified**:
- `src/frontend/src/pages/ShapePop.tsx` (+~120 lines)

**Key Code Changes**:
```typescript
// Scoring with combo bonus
const calculateScore = useCallback((currentStreak: number) => {
  const basePoints = 10;
  const comboBonus = Math.min(currentStreak * 2, 10);
  const streakBonus = currentStreak >= 5 ? 25 : 0;
  return basePoints + comboBonus + streakBonus;
}, []);

// Difficulty-based sizing
const GAME_CONFIG = {
  easy: { targetSize: 180, popRadius: 0.20, cursorSize: 100 },
  medium: { targetSize: 144, popRadius: 0.16, cursorSize: 84 },
  hard: { targetSize: 120, popRadius: 0.12, cursorSize: 72 },
} as const;
```

Next Actions:

1. **UNIT 1**: Combo scoring system (streak tracking, bonus points)
2. **UNIT 2**: Difficulty selection (Easy/Medium/Hard with scaled targets)
3. **UNIT 3**: Streak UI and visual feedback
4. Run tests (TypeScript, ESLint)
5. Update worklog with implementation evidence

## Analysis Summary

**Location**: `docs/GAME_IMPROVEMENT_SHAPE_POP_ANALYSIS.md`

**Key Gaps Documented**:
- GAP-01 (P0): Flat scoring (fixed 15 pts) → needs combo system
- GAP-02 (P0): No difficulty levels → needs Easy/Medium/Hard
- GAP-03 (P1): No streak/miss tracking → needs streak system
- GAP-04 (P1): Fixed target size (144px) → needs adaptive sizing
- GAP-05 (P2): No progressive challenge → needs scaling
- GAP-06 (P2): Limited shape variety (5) → needs expansion

**Implementation Plan**:
- Unit 1: Combo scoring (base 10 + combo bonus + streak bonus)
- Unit 2: Difficulty selection (target size, hit radius scaling)
- Unit 3: Streak UI and enhanced feedback

*Ready for implementation upon user approval.*

---

## Game Selection Evidence

**File**: `src/frontend/src/pages/ShapePop.tsx` (279 lines)  
**Registry**: `gameRegistry.ts` lines 891-923  
**CV**: `['hand']`  
**Existing Audits**: None (`docs/audit/*shape*` = 0 matches)  

**Why Selected**:
- Different mechanics from previous improvements (Bubble Pop = microphone, Memory Match = cards)
- Hand-tracking target practice with pinch detection
- No existing audit documentation
- Kid-friendly with haptics already implemented (precedent to follow)

---

*Following 9-step workflow: Analysis → Document → Plan → Research → Document → Implement → Test → Document*
