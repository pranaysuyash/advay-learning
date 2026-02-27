# Audit Plan: Games UX, Age-Group UI Components, & Analytics Integration

## Problem Statement

Conduct a comprehensive **multi-persona audit** of:

1. **Games system** - How games are presented, selected, and played across age groups
2. **Age-group UI component selection** - How UI components are adapted for 2-3yr, 4-6yr, 7-9yr cohorts
3. **Analytics tracking** - How gameplay events, progress, and engagement are captured and reported

## Proposed Approach

- **Audit Type**: Multi-persona camera game audit (per user selection)
- **Personas**: Leverage existing 35-persona framework from `docs/FRESH_35_PERSONA_AUDIT_2026-02-05.md` + add game-specific personas as needed
- **Prompt**: `prompts/audit/camera-game-multipersona-audit-v1.0.md` (focused on games, but adapted for analytics + UI component lens)
- **Scope**: Games folder + Analytics tracking endpoints + UI component adaptation patterns
- **Output**: Audit artifact in `docs/audit/` + Worklog ticket + Evidence pack

## Key Questions to Answer

1. **Games UX**: Are games appropriately presented for each age group? Do difficulty levels match intended age ranges?
2. **Component Adaptation**: How do components (buttons, modals, instructions) vary across age cohorts? Are patterns consistent?
3. **Analytics**: Is gameplay data (attempts, completion, engagement) being tracked? Is it visible to parents/teachers?

## Workplan

- [x] **Phase 1: Discovery** - Explore games folder structure and analytics code ✅ DONE
  - [x] List all games and their age-group targeting (4 found initially)
  - [x] Find analytics tracking code (event logging, progress storage)
  - [x] Identify UI component patterns used per age group
  - [x] Create ticket: TCK-20260205-001

- [ ] **Phase 2: Comprehensive Discovery + Multi-Model Analysis** - EXPANDED SCOPE
  - [ ] Part A: Find ALL games/activities (not just 4)
    - [ ] Grep codebase for game components, activities, lessons, mini-games, exercises
    - [ ] Catalog all activity types (games, drawings, recognitions, etc.)
    - [ ] Find WIP/hidden activities or placeholder components
    - [ ] Map activity types to backend tracking schema
  
  - [ ] Part B: Code Quality & Architecture Review (Multi-Model)
    - [ ] Analyze game component patterns (Claude vs GPT vs Gemini)
    - [ ] Review analytics schema design (consensus check)
    - [ ] Audit UI component consistency (multiple models)
    - [ ] Identify code duplication/refactoring opportunities
    - [ ] Get improvement suggestions from 3+ models
  
  - [ ] Part C: UX Pattern Analysis (Multi-Model)
    - [ ] How are games structured for age groups? (analysis across models)
    - [ ] UI adaptation patterns - consistency and gaps
    - [ ] Analytics instrumentation - completeness check
    - [ ] Engagement loop design assessment
  
  - [ ] Part D: Cross-Model Consensus
    - [ ] Compare findings from Claude, GPT, Gemini
    - [ ] Identify areas of agreement vs disagreement
    - [ ] Document conflicting recommendations with reasoning
    - [ ] Synthesize best ideas from all models

- [ ] **Phase 3: Playtest Audit (After Multi-Model Analysis)** - Test persona-based with evidence from analysis
- [ ] **Phase 4: Analysis & Reporting** - Synthesize all findings
- [ ] **Phase 5: Cross-Model Verification** - Validate audit findings with models
- [ ] **Phase 6: Ticketing & Documentation** - Create remediation tickets

## Scope & Constraints

**In-Scope:**

- Games system architecture and UX
- UI component library usage across age groups
- Analytics event tracking and storage
- Parent/Teacher progress visibility
- Safety controls per game

**Out-of-Scope:**

- Backend API design (separate audit)
- Camera/hand-tracing mechanics (separate axis)
- Full landing page redesign
- Code refactoring

**Behavior Change Allowed**: NO - This is discovery/audit only. No code changes.

## Evidence & Quality Gates

- All findings must be backed by **Observed** (code + console/screenshot) or **Inferred** (logical from code)
- No "Suggested" changes during audit phase
- Detailed reproduction steps for every finding
- Persona context for every recommendation

## Phase 1 Discovery - Completed ✓

**Games Discovered** (4 total):

1. AlphabetGame (Draw Letters) - 2-8yr, Alphabets, Easy
2. FingerNumberShow (Finger Counting) - 3-7yr, Numbers, Easy
3. ConnectTheDots - 3-6yr, Drawing, Easy
4. LetterHunt (Find the Letter) - 2-6yr, Alphabets, Easy

**Key Finding**: All hardcoded "Easy" difficulty - NO progression

**Analytics Backend**:

- Progress model exists with activity_type, content_id, score, duration_seconds, meta_data
- Batch API with idempotency support
- Limited granularity (no game-specific events)

**UI Components**:

- GameCard.tsx shows ageRange but identical difficulty colors (no visual distinction)
- ProfileStore tracks age but doesn't use it for filtering
- GameSetupCard generic with no age-based adaptation

**Critical Gaps**:

1. No difficulty progression (all "Easy")
2. Age filtering not implemented
3. Difficulty colors identical (no visual feedback)
4. Limited analytics granularity
5. No game-specific events

**Ticket**: TCK-20260205-001 in `docs/WORKLOG_ADDENDUM_v3.md`

---

**Status**: PHASE 1 COMPLETE → PHASE 2 READY  
**Next**: Persona selection and playtest audit
