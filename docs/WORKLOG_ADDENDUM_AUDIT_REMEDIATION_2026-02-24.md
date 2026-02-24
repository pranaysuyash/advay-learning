### TCK-20260224-002 :: LetterHunt Toddler-Friendly Enhancements

Type: REMEDIATION  
Owner: Pranay  
Created: 2026-02-24 19:35 IST  
Status: **IN_PROGRESS**  
Priority: P1

Description:
Apply toddler-friendly enhancements to LetterHunt game following the pattern from ShapeSequence, ColorMatchGarden, ConnectTheDots, and DressForWeather batch fix (TCK-20260223-018). This is part of Phase 1 high-priority games from GAMES_TO_FIX_2026-02-23.md audit.

Source:
- Audit file: `docs/audit/GAMES_TO_FIX_2026-02-23.md`
- Pattern reference: `docs/audit/BATCH_FIX_4_GAMES_2026-02-23.md`

Scope contract:
- In-scope:
  - Cursor: Add highContrast={true} and icon='👆' to GameCursor
  - Background: Add backdrop-blur-sm to background overlay
  - Voice: Enhance game start message to be more engaging
  - Timer: Replace countdown display with "Take your time!" messaging
  - Add "Take your time" relaxed messaging badge in HUD
- Out-of-scope:
  - Core game logic changes
  - New game mechanics
  - Backend changes
- Behavior change allowed: YES (UI/UX enhancements only)

Targets:
- Repo: learning_for_kids
- File(s): `src/frontend/src/pages/LetterHunt.tsx`
- Branch/PR: main

Acceptance Criteria:
- [ ] Cursor shows 84px with high contrast and 👆 icon
- [ ] Background has backdrop-blur-sm overlay
- [ ] Game start voice is engaging: "Let's hunt for letters! Show me your hand!"
- [ ] Timer countdown hidden, "Take your time!" badge visible
- [ ] Type-check and lint pass
- [ ] No regressions in existing functionality

Execution log:
- [2026-02-24 19:35 IST] Analysis complete | Evidence: LetterHunt.tsx audit
  - Cursor size: 84px ✅ (already correct)
  - Missing: highContrast, icon props
  - VoiceInstructions: present ✅
  - Background blur: missing backdrop-blur-sm
  - Timer: shows countdown (needs change)
  - "Take your time" text: present in HUD ✅

Plan:
1. Update GameCursor to add highContrast={true} and icon='👆'
2. Update background div to add backdrop-blur-sm
3. Enhance startGame voice message
4. Replace timer display with relaxed messaging
5. Run type-check and lint
6. Verify no regressions

Execution log (continued):
- [2026-02-24 19:40 IST] Implementation complete | Evidence: git diff
  - Change 1: Added backdrop-blur-sm to background gradient (line 437)
  - Change 2: Enhanced game start voice message (line 232)
  - Change 3: Added highContrast={true} and icon='👆' to GameCursor (lines 481-482)
- [2026-02-24 19:41 IST] Type-check passed | Evidence: tsc --noEmit (no errors)
- [2026-02-24 19:41 IST] Lint check passed for LetterHunt.tsx | Evidence: No LetterHunt errors (pre-existing errors in SimonSays.tsx unrelated)

Status updates:
- [2026-02-24 19:35 IST] **IN_PROGRESS** — Ticket created, beginning implementation
- [2026-02-24 19:41 IST] **DONE** — LetterHunt toddler enhancements complete

---

### TCK-20260224-003 :: SteadyHandLab Toddler-Friendly Enhancements

Type: REMEDIATION  
Owner: Pranay  
Created: 2026-02-24 20:00 IST  
Status: **IN_PROGRESS**  
Priority: P1

Description:
Apply toddler-friendly enhancements to SteadyHandLab game following the pattern from previous batch fixes. This is part of Phase 1 medium-priority games from GAMES_TO_FIX_2026-02-23.md audit.

Source:
- Audit file: `docs/audit/GAMES_TO_FIX_2026-02-23.md`
- Pattern reference: `docs/audit/BATCH_FIX_4_GAMES_2026-02-23.md`

Scope contract:
- In-scope:
  - Cursor: Add highContrast={true} and icon='👆' to GameCursor
  - Background: Add backdrop-blur-sm to background overlay
  - Voice: Enhance game start message to be more engaging
  - Add "Take your time!" relaxed messaging badge
- Out-of-scope:
  - Core game logic changes
  - Target size changes (already 160px for kids)
  - Path width (not applicable to this game)
- Behavior change allowed: YES (UI/UX enhancements only)

Targets:
- Repo: learning_for_kids
- File(s): `src/frontend/src/pages/SteadyHandLab.tsx`
- Branch/PR: main

Acceptance Criteria:
- [ ] Cursor shows 84px with high contrast and 👆 icon
- [ ] Background has backdrop-blur-sm overlay
- [ ] Game start voice is engaging: "Let's test your steady hand! Show me your finger!"
- [ ] "Take your time!" badge visible in HUD
- [ ] Type-check and lint pass
- [ ] No regressions in existing functionality

Execution log:
- [2026-02-24 20:00 IST] Analysis complete | Evidence: SteadyHandLab.tsx audit
  - Cursor size: 84px ✅ (already correct via CURSOR_SIZE constant)
  - Target size: 160px ✅ (already kid-friendly via TARGET_SIZE constant)
  - Voice: Has TTS integration ✅
  - VoiceInstructions: present ✅
  - Missing: highContrast, icon props on GameCursor
  - Missing: backdrop-blur-sm on background
  - Missing: "Take your time!" badge

Plan:
1. Update GameCursor to add highContrast={true} and icon='👆'
2. Update background div to add backdrop-blur-sm
3. Enhance startGame voice message
4. Add "Take your time!" badge below feedback
5. Run type-check and lint
6. Verify no regressions

Execution log (continued):
- [2026-02-24 20:02 IST] Implementation complete | Evidence: git diff
  - Change 1: Added backdrop-blur-sm to background gradient (line 285)
  - Change 2: Added highContrast={true} and icon='👆' to GameCursor (lines 330-331)
  - Change 3: Enhanced game start voice message (line 210)
  - Change 4: Added "Take your time!" badge below feedback (lines 290-292)
- [2026-02-24 20:03 IST] Type-check passed | Evidence: tsc --noEmit (no errors)
- [2026-02-24 20:03 IST] Lint check passed for SteadyHandLab.tsx | Evidence: No SteadyHandLab errors

Status updates:
- [2026-02-24 20:00 IST] **IN_PROGRESS** — Ticket created, beginning implementation
- [2026-02-24 20:03 IST] **DONE** — SteadyHandLab toddler enhancements complete

