# Audit: FingerNumberShow (Multi-Persona, Camera-First)

**Ticket**: TCK-20260203-013  
**Target file**: `src/frontend/src/games/FingerNumberShow.tsx`  
**Audit artifact**: `docs/audit/src__frontend__src__games__FingerNumberShow.tsx.md`  
**Date**: 2026-02-03  
**Prompt(s) used**: `prompts/audit/camera-game-multipersona-audit-v1.0.md` (+ repo rules in `AGENTS.md`)  

## Scope Contract

- In-scope:
  - Single-file audit of `src/frontend/src/games/FingerNumberShow.tsx`
  - Multi-persona lenses: Child UX, Parent UX, MediaPipe/CV reliability, Accessibility, Privacy/Safety, Engineering quality
- Out-of-scope:
  - Implementing fixes (file changes belong in separate remediation ticket(s))
  - Auditing other games/files
- Behavior change allowed: NO (audit only)

## Context (Observed)

- This is a camera-first MediaPipe hand-landmark game that asks the child to show a number of fingers (and has a “letters” mode that asks for letters while still measuring finger counts).
- Hand tracking is provided via the centralized hook `useHandTracking` and scheduled via `useGameLoop`.

## Executive Summary

### P0 (must fix)

1) **Letter mode is incompatible with non-English alphabets.** `getLetterNumberValue()` maps A–Z to 1–26 using ASCII math; for Hindi/Tamil/etc letters (non A–Z), the computed numeric target becomes huge or meaningless, making letter mode effectively impossible. (Observed)

### P1 (should fix)

1) **State updates are likely heavier than needed.** `setCurrentCount(totalFingers)` runs every frame at ~30fps; this can force frequent rerenders on low-end devices. (Inferred)
2) **Untracked success timeout can fire after stop/navigation.** The `setTimeout(..., 2500)` after a success isn’t stored/cleared, so it may update state after a stop/unmount. (Inferred)

### P2 (nice-to-have / design polish)

1) **Canvas overlay may read as “debug” to parents.** The game draws wrist dots and per-hand counts on the canvas; this can be good feedback, but for a kids app it might be worth making it minimal (or toggled) so the camera feed feels less “technical.” (Inferred)

## Persona Findings (Combined)

### 1) Child Learning UX (Ages ~3–8, early reader)

- (Observed) Success loop: stable-match gating (~450ms) avoids flicker-trigger successes; celebration overlay + sound reward the correct pose.
- (Inferred) The “letters” mode is a cognitive mismatch for pre-readers unless constrained to very small sets; with non-Latin scripts it will hard-fail (see P0).
- (Inferred) The prompt copy is short and direct; targets are visually emphasized via the HUD component. Good.

### 2) Parent/Guardian UX (setup, trust, “play together”)

- (Observed) Duo Mode exists and maps to total finger count 0–20.
- (Observed) Adaptive max-hands exists via `getMaxHandsForDifficultyIndex()` (2 normally, 4 for Duo Mode).
- (Inferred) “Duo Mode” naming may be ambiguous for parents; “Family / Play Together” may communicate better, but this is product choice.

### 3) MediaPipe/CV Reliability

- (Observed) Uses `useHandTracking` with GPU delegate and fallback enabled.
- (Observed) Uses `getHandLandmarkLists(results)` to normalize result shape drift.
- (Inferred) Confidence thresholds are low (0.3) which helps detection but may increase false positives; acceptable if stability gating handles it (it mostly does).

### 4) Accessibility

- (Observed) Setup controls are implemented via `OptionChips` and `GameControls`, which can support keyboard interaction.
- (Unknown) Whether the overall page meets contrast requirements in all states (depends on global tokens + CSS).
- (Inferred) Consider adding an option for reduced motion (framer-motion is used in setup menu).

### 5) Privacy/Safety (Kids + Camera)

- (Observed) No explicit “GPU/delegate/landmarks” UI is shown in this game screen (technical details only appear in console via hooks).
- (Unknown) Whether camera permission denial is handled in this game (no dedicated recovery UI is present in this file).

### 6) Engineering Quality / Maintainability

- (Observed) UI concerns were extracted into `FingerNumberShowMenu` and `FingerNumberShowHud`.
- (Inferred) The main file still mixes:
  - game-state machine (targets, bag, scoring)
  - tracking loop + canvas drawing
  - TTS prompt management
  Consider further extraction only if it reduces regression risk and adds test seams.

## Findings (Detailed)

### Finding 1 (P0): Letter mode numeric mapping breaks for non-English alphabets

- **Observed**: `getLettersForGame(selectedLanguage)` can return Tamil/Hindi/etc letters. `getLetterNumberValue()` assumes A–Z and returns 0 for non A–Z.
- **Impact**: Letter mode can become impossible or inconsistent for non-English selections, causing immediate frustration/churn.
- **Suggested patch**:
  - Option A: Restrict letter mode to English (hide language selector or gate it).
  - Option B: For every language, map letter target to a small 1–10 (or 1–20) index based on the letter bag order, not ASCII. Example: `targetIndex = (letterIndexInLanguageBag % 10) + 1`.
  - Option C: Redesign letter mode to “show the letter card” while using a *different* gesture (e.g., pinch selection) instead of finger-count-as-label.

### Finding 2 (P1): Unbounded per-frame rerenders via `setCurrentCount`

- **Inferred**: `setCurrentCount(totalFingers)` is called on every frame, even when unchanged.
- **Impact**: On mobile/low-end devices, this may reduce FPS and increase battery usage.
- **Suggested patch**: Only set state when value changes, or throttle UI updates (e.g., at 10fps) while tracking continues at 30fps.

### Finding 3 (P1): Success timeout not tracked/cleared

- **Inferred**: The success `setTimeout` callback may run after stop/unmount and attempt state updates.
- **Impact**: Potential memory leak warnings and “ghost” UI updates after leaving the page.
- **Suggested patch**: Store the timeout handle in a ref and clear it in `stopGame()` and in the cleanup effect.

## Patch Plan (Non-Implementing)

1) Fix letter-mode mapping (P0) and add a unit test for the mapping behavior.
2) Add timeout refs for success + prompt stage; clear on stop/unmount (P1).
3) Throttle or conditionalize state updates (`currentCount`) for perf (P1).
4) Decide on canvas overlay posture (keep as kid feedback vs toggle/dev-only) (P2).

## Evidence Appendix (Raw Outputs)

**Command**: `git status --porcelain=v1 | head -n 80`

**Output**:

```
M docs/WORKLOG_ADDENDUM_v2.md
M docs/WORKLOG_TICKETS.md
M docs/audit/src__frontend__src__pages__alphabet-game__AlphabetGamePage.tsx.md
M prompts/README.md
...
M src/frontend/src/games/FingerNumberShow.tsx
...
```

**Interpretation**: Observed — repo is dirty; this audit reflects current working tree, not a clean commit.

**Command**: `wc -l src/frontend/src/games/FingerNumberShow.tsx`

**Output**:

```
692 src/frontend/src/games/FingerNumberShow.tsx
```

**Interpretation**: Observed — large single-file component with multiple concerns.

**Command**: `rg -n "useHandTracking\\(|useGameLoop\\(" src/frontend/src/games/FingerNumberShow.tsx`

**Output**:

```
84:  } = useHandTracking({
349:  useGameLoop({
```

**Interpretation**: Observed — centralized tracking hook + controlled scheduler are used.

**Command**: `rg -n "requestAnimationFrame\\(|setInterval\\(|setTimeout\\(" src/frontend/src/games/FingerNumberShow.tsx`

**Output**:

```
212:        promptTimeoutRef.current = setTimeout(
258:        promptTimeoutRef.current = setTimeout(
318:    reinitTimerRef.current = setTimeout(() => {
490:        setTimeout(() => {
```

**Interpretation**: Observed — multiple timers exist; one success timeout is not ref-tracked.

**Command**: `cd src/frontend && npm run type-check`

**Output**:

```
> advay-vision-frontend@0.1.0 type-check
> tsc --noEmit
```

**Interpretation**: Observed — TypeScript passes.

**Command**: `cd src/frontend && npx vitest run src/games/finger-number-show/handTrackingConfig.test.ts`

**Output**:

```
✓ src/games/finger-number-show/handTrackingConfig.test.ts (2 tests)
```

**Interpretation**: Observed — adaptive max-hands mapping is unit-tested.
