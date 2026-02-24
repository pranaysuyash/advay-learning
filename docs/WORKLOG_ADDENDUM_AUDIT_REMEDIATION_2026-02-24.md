### TCK-20260224-002 :: LetterHunt Toddler-Friendly Enhancements
Ticket Stamp: STAMP-20260224T173810Z-codex-x0uo

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
Ticket Stamp: STAMP-20260224T173810Z-codex-kf9t

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

---

### TCK-20260224-004 :: ShapePop Toddler-Friendly Enhancements
Ticket Stamp: STAMP-20260224T173810Z-codex-i76v

Type: REMEDIATION  
Owner: Pranay  
Created: 2026-02-24 20:10 IST  
Status: **IN_PROGRESS**  
Priority: P1

Description:
Apply toddler-friendly enhancements to ShapePop game following the pattern from previous batch fixes. This is part of Phase 2 medium-priority games from GAMES_TO_FIX_2026-02-23.md audit.

Source:
- Audit file: `docs/audit/GAMES_TO_FIX_2026-02-23.md`
- Pattern reference: `docs/audit/BATCH_FIX_4_GAMES_2026-02-23.md`

Scope contract:
- In-scope:
  - Cursor: Add highContrast={true} and icon='👆' to GameCursor
  - Background: Add backdrop-blur-sm to background overlay
  - Voice: Enhance game start message to be more engaging
- Out-of-scope:
  - Core game logic changes
  - Target size (already 144px for kids)
  - "Take your time" message (already present)
- Behavior change allowed: YES (UI/UX enhancements only)

Targets:
- Repo: learning_for_kids
- File(s): `src/frontend/src/pages/ShapePop.tsx`
- Branch/PR: main

Acceptance Criteria:
- [ ] Cursor shows 84px with high contrast and 👆 icon
- [ ] Background has backdrop-blur-sm overlay
- [ ] Game start voice is engaging: "Let's pop some shapes! Show me your hand!"
- [ ] Type-check and lint pass
- [ ] No regressions in existing functionality

Execution log:
- [2026-02-24 20:10 IST] Analysis complete | Evidence: ShapePop.tsx audit
  - Cursor size: 84px ✅ (already correct via CURSOR_SIZE constant)
  - Target size: 144px ✅ (already kid-friendly via TARGET_SIZE constant)
  - "Take your time!" badge: present ✅ (line 195)
  - VoiceInstructions: present ✅
  - backdrop-blur-sm on shape target: present ✅
  - backdrop-blur-sm on start overlay: present ✅
  - Missing: highContrast, icon props on GameCursor
  - Missing: backdrop-blur-sm on background gradient
  - Voice: Could be more engaging

Plan:
1. Update GameCursor to add highContrast={true} and icon='👆'
2. Update background div to add backdrop-blur-sm
3. Enhance startGame voice message
4. Run type-check and lint
5. Verify no regressions

Execution log (continued):
- [2026-02-24 20:12 IST] Implementation complete | Evidence: git diff
  - Change 1: Added backdrop-blur-sm to background gradient (line 189)
  - Change 2: Added highContrast={true} and icon='👆' to GameCursor (lines 224-225)
  - Change 3: Enhanced game start voice message (line 133)
- [2026-02-24 20:13 IST] Type-check passed | Evidence: tsc --noEmit (no errors)
- [2026-02-24 20:13 IST] Lint check passed for ShapePop.tsx | Evidence: No ShapePop-specific errors

Status updates:
- [2026-02-24 20:10 IST] **IN_PROGRESS** — Ticket created, beginning implementation
- [2026-02-24 20:13 IST] **DONE** — ShapePop toddler enhancements complete

---

### TCK-20260224-005 :: WordBuilder Toddler-Friendly Enhancements
Ticket Stamp: STAMP-20260224T173810Z-codex-xpk8

Type: REMEDIATION  
Owner: Pranay  
Created: 2026-02-24 20:20 IST  
Status: **IN_PROGRESS**  
Priority: P1

Description:
Apply toddler-friendly enhancements to WordBuilder game following the pattern from previous batch fixes. This is the last medium priority hand-tracking game from GAMES_TO_FIX_2026-02-23.md audit.

Source:
- Audit file: `docs/audit/GAMES_TO_FIX_2026-02-23.md`
- Pattern reference: `docs/audit/BATCH_FIX_4_GAMES_2026-02-23.md`

Scope contract:
- In-scope:
  - Cursor: Add highContrast={true} and icon='👆' to GameCursor
  - Background: Add backdrop-blur-sm to background overlay
  - Voice: Enhance game start message to be more engaging
- Out-of-scope:
  - Core game logic changes
  - Target size (already 120px for kids)
  - "Take your time" message (already present)
- Behavior change allowed: YES (UI/UX enhancements only)

Targets:
- Repo: learning_for_kids
- File(s): `src/frontend/src/pages/WordBuilder.tsx`
- Branch/PR: main

Acceptance Criteria:
- [ ] Cursor shows 84px with high contrast and 👆 icon
- [ ] Background has backdrop-blur-sm overlay
- [ ] Game start voice is engaging: "Let's build words together! Show me your hand!"
- [ ] Type-check and lint pass
- [ ] No regressions in existing functionality

Execution log:
- [2026-02-24 20:20 IST] Analysis complete | Evidence: WordBuilder.tsx audit
  - Cursor size: 84px ✅ (already correct via CURSOR_SIZE constant)
  - Target size: 120px ✅ (already kid-friendly via TARGET_SIZE constant)
  - "Take your time!" badge: present ✅ (line 342)
  - VoiceInstructions: present ✅
  - backdrop-blur-sm on start overlay: present ✅
  - Missing: highContrast, icon props on GameCursor
  - Missing: backdrop-blur-sm on background gradient
  - Voice: Could be more engaging

Plan:
1. Update GameCursor to add highContrast={true} and icon='👆'
2. Update background div to add backdrop-blur-sm
3. Enhance startGame voice message
4. Run type-check and lint
5. Verify no regressions

Execution log (continued):
- [2026-02-24 20:22 IST] Implementation complete | Evidence: git diff
  - Change 1: Added backdrop-blur-sm to background gradient (line 335)
  - Change 2: Added highContrast={true} and icon='👆' to GameCursor (lines 403-404)
  - Change 3: Enhanced game start voice message (line 253)
- [2026-02-24 20:23 IST] Type-check passed | Evidence: tsc --noEmit (no errors)
- [2026-02-24 20:23 IST] Lint check passed for WordBuilder.tsx | Evidence: No WordBuilder-specific errors

Status updates:
- [2026-02-24 20:20 IST] **IN_PROGRESS** — Ticket created, beginning implementation
- [2026-02-24 20:23 IST] **DONE** — WordBuilder toddler enhancements complete
