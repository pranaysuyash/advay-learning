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

- [x] **Phase 1: Discovery** - Explore games folder structure and analytics code
  - [x] List all games and their age-group targeting
  - [x] Find analytics tracking code (event logging, progress storage)
  - [x] Identify UI component patterns used per age group
  - [x] Create ticket: TCK-20260205-001

- [ ] **Phase 2: Persona Selection** - Curate personas from existing 35-persona pack
  - [ ] Game Designer persona (objective assessment)
  - [ ] Parent/Guardian personas (3 per age cohort: 2-3yr, 4-6yr, 7-9yr)
  - [ ] Child learner personas (1 per age cohort)
  - [ ] Teacher/Educator persona
  - [ ] Total: ~12 active personas for this audit

- [ ] **Phase 3: Audit Execution** - Run multi-persona audit with evidence-first discipline
  - [ ] Test each game with each relevant persona
  - [ ] Capture UI component usage patterns
  - [ ] Verify analytics events are firing
  - [ ] Document observations with evidence (screenshots, code references, console logs)
  - [ ] Check accessibility/inclusivity per age group

- [ ] **Phase 4: Analysis & Reporting**
  - [ ] Synthesize findings across personas
  - [ ] Identify patterns (good and problematic)
  - [ ] Map findings to specific game files and components
  - [ ] Create audit artifact with actionable recommendations

- [ ] **Phase 5: Cross-Model Verification** (optional, per user request)
  - [ ] If findings are unclear, consult alternative models (Claude, GPT, Gemini) for second opinions
  - [ ] Document model consensus or disagreements

- [ ] **Phase 6: Ticketing & Documentation**
  - [ ] Update WORKLOG_TICKETS.md with discovery findings
  - [ ] Link audit artifact to worklog ticket
  - [ ] Queue next audit or remediation ticket

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
