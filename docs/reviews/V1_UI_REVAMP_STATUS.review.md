# Doc Review Report: V1_UI_REVAMP_STATUS.md

**Audited by:** Doc-to-Code Audit Agent  
**Audit Date:** 2026-03-06  
**Doc Last Updated:** February 2026  
**Phase:** Phase 1 (Review & Validate — NO implementation)

---

## 1. Doc Summary

| Attribute | Value |
|-----------|-------|
| **Purpose** | Source-of-truth checklist for agents performing the "Child-Centric Light Theme" UI revamp. Tells agents which files are done, which are pending, and what the design standards are. |
| **Audience** | AI agents and human contributors making UI/UX changes |
| **Scope** | Frontend only (`src/frontend/src/**`); 5 phases: core pages, global components, per-game internals, remaining views, and extra polish |
| **Status** | **Partially inaccurate** — several "COMPLETED" claims do not match code reality; Phase 3 pending list is completely blank. |

---

## 2. Explicit Claims and Requirements

| # | Claim | Location |
|---|-------|----------|
| E-1 | Phase 1 (Home, Dashboard, Games, Progress, ForgotPassword, ResetPassword) is **COMPLETED** | Line 12 |
| E-2 | Phase 2 global components (Layout, OnboardingFlow, GameContainer, GameHeader, Button, 3× progress sub-components) is **COMPLETED** | Line 24 |
| E-3 | `OnboardingFlow.tsx` has been "Moved from dark overlays to bubbly white modals" | Line 28 |
| E-4 | `Button.tsx` is "Bouncy, thick bordered, shadow-dropping" | Line 31 |
| E-5 | The canonical drop-shadow is `shadow-[0_4px_0_0_#000000]` | Line 4 |
| E-6 | Phase 3 gold-standard examples: `MirrorDraw.tsx` ✅ and `ConnectTheDots.tsx` ✅ | Lines 44–45 |
| E-7 | Phase 3 Pending Rewrite Queue exists (implied — section has a header but no content) | Lines 47–67 |
| E-8 | Phase 4 pending: `Login.tsx`, `Register.tsx`, `Settings.tsx` need light-theme work | Lines 73–75 |
| E-9 | `CelebrationOverlay.tsx` needs Phase 5 upgrade to "massive bouncy 3D typography, dense particle physics, Mascot animation" | Line 82 |
| E-10 | `OptionChips.tsx` and all pause/difficulty popups need `shadow-[0_6px_0_0_#000000]` heavy button standard | Line 83 |
| E-11 | `useSoundEffects` should be wired into every V1 clickable element | Line 84 |
| E-12 | Games.tsx hover → tilt effects, glowing borders, floating particles (Phase 5) | Line 85 |
| E-13 | Mascot needs physics-based breathing/bouncing and glowing backdrop (Phase 5) | Line 86 |

---

## 3. Implicit Assumptions and Inferred Intent

- **A-1:** Any file not on the Phase 3 pending list is either complete or exempt — but the list is blank, so agents have no signal.
- **A-2:** The "gold standard" canonical shadow is `shadow-[0_4px_0_0_#000000]`. Agents will copy this value into new components.
- **A-3:** Modal/overlay backgrounds should all migrate away from `bg-slate-900/xx` to white or `#FFF8F0` panels.
- **A-4:** `Games.tsx` (Phase 1 complete) has no remaining dark overlays — but the game-detail modal in that file still uses `bg-slate-900/60` (see validation).
- **A-5:** Phase 4 (`Login`, `Register`, `Settings`) has not been touched — but `Login.tsx` is already V1-compliant (see validation).

---

## 4. Questions the Doc Asks (Direct and Implied)

| # | Question | Missing Info |
|---|----------|-------------|
| Q-1 | *Which* individual games are in the Phase 3 Pending Rewrite Queue? | The list is completely blank (lines 47–67 are all empty) |
| Q-2 | What is the V1 design pattern for modal overlays? (doc says adopt "bubbly white modals" but gives no concrete class reference) | No code example or CSS token for the modal backdrop |
| Q-3 | Should `useSoundEffects` replace `useAudio` or complement it? `Button.tsx` already uses `useAudio().playClick()` | Hook ownership unclear |
| Q-4 | Is `KenneyButton.tsx` part of the V1 design system or a parallel standard? (not mentioned anywhere in the doc) | Not mentioned |

---

## 5. Tasks Mentioned

### Open Tasks

| ID | Task | Phase |
|----|------|-------|
| OT-1 | Fill in Phase 3 Pending Rewrite Queue (currently blank) | Phase 3 |
| OT-2 | Rip `bg-slate-900`/dark overlays from all individual game internal renders | Phase 3 |
| OT-3 | Spot-check and align `Login.tsx`, `Register.tsx`, `Settings.tsx` | Phase 4 |
| OT-4 | Upgrade `CelebrationOverlay.tsx` — bouncy 3D type, dense confetti, Mascot | Phase 5 |
| OT-5 | Standardize `OptionChips.tsx` + pause popups to `shadow-[0_6px_0_0_#000000]` | Phase 5 |
| OT-6 | Wire `useSoundEffects` into every V1 clickable | Phase 5 |
| OT-7 | Add hover tilt/glow/particles to `Games.tsx` game cards | Phase 5 |
| OT-8 | Add physics-based breathing/bounce + glow to `Mascot.tsx` | Phase 5 |

### Completed Tasks (Verification Results)

| ID | Claimed Done | Verified? | Evidence |
|----|-------------|-----------|---------|
| CT-1 | Phase 1 pages completed | ✅ **Verified** | All 6 files exist, use `bg-[#FFF8F0]`, V1 palette |
| CT-2 | `GameContainer.tsx` done | ✅ **Verified** | Line 60: `bg-[#FFF8F0] font-nunito` |
| CT-3 | `GameHeader.tsx` done | ⚠️ **Unverified** | File exists but not deeply read; contains V1 border classes |
| CT-4 | `Button.tsx` done — "thick bordered" | ✅ **Verified (with caveat)** | Uses `shadow-[0_6px_0_0_#000000]` — but **doc says `[0_4px_0_0_#000000]`** (wrong value in doc) |
| CT-5 | `OnboardingFlow.tsx` — "Moved from dark overlays to bubbly white modals" | ❌ **FALSE** | Line 101: outer wrapper is still `bg-slate-900/60`. Inner card uses white; overlay is dark. |
| CT-6 | Progress sub-components completed | ✅ **Verified** | MetricsCard, RecommendationCard, PlantVisualization all exist and use light palette |
| CT-7 | `MirrorDraw.tsx` ✅ Phase 3 example | ✅ **Verified** | Uses `bg-[#FFF8F0]` for canvas background (line 138) and game overlay (line 477) |
| CT-8 | `ConnectTheDots.tsx` ✅ Phase 3 example | ✅ **Verified** | Uses `OptionChips` (V1 pattern), file exists at expected path |

---

## 6. Confusions, Contradictions, and Suspect Parts

| # | Description |
|---|-------------|
| CON-1 | **Phase 3 Pending Queue is blank.** 18+ empty lines where the game list should be. The doc is missing its most actionable section — agents have no guidance. |
| CON-2 | **Shadow token inconsistency.** Doc line 4 defines the canonical shadow as `shadow-[0_4px_0_0_#000000]`, but `Button.tsx` (the reference component) uses `shadow-[0_6px_0_0_#000000]`. Phase 5 line 83 also specifies `[0_6px_0_0_#000000]` for `OptionChips`. The doc's own header contradicts its body. |
| CON-3 | **OnboardingFlow "done" claim is false.** The doc says it "moved from dark overlays to bubbly white modals." The code at line 101 shows the outer `<motion.div>` backdrop is `bg-slate-900/60 backdrop-blur-md`. Only the inner card is white. The modal's experience is still dark. |
| CON-4 | **Login.tsx listed as Phase 4 pending but it's already done.** `Login.tsx` already uses `bg-[#FFF8F0]`, split-screen layout matching `ForgotPassword.tsx`, V1 shadow tokens, and V1 color palette. Listing it as pending could trigger agents to redundantly re-rewrite it. |
| CON-5 | **Games.tsx listed as Phase 1 "COMPLETED" but has a dark overlay.** Line 330 of `Games.tsx`: `bg-slate-900/60 backdrop-blur-md` on the game detail modal popup. The outer library page is V1 but the in-page modal is not. |
| CON-6 | **`useSoundEffects` vs `useAudio` hook ambiguity.** Phase 5 says to wire `useSoundEffects` into every clickable. But `Button.tsx` (the base component) already calls `useAudio().playClick()`. These are different hooks — `useSoundEffects` (`src/hooks/useSoundEffects.ts`) and `useAudio` (`src/utils/hooks/useAudio.ts`). The doc doesn't acknowledge the existing hook or propose a consolidation strategy. |
| CON-7 | **No mention of `KenneyButton.tsx`.** A parallel button component exists at `src/frontend/src/components/ui/KenneyButton.tsx`. It's not referenced in the doc. Unknown whether it should be deprecated, kept, or migrated. |
| CON-8 | **`Register.tsx` is partly done.** Like `Login.tsx`, it already uses `bg-[#FFF8F0]` and the split-screen pattern (line 81, 104). The Phase 4 task may only need minor spot-checking, not a full rewrite. |

---

## 7. Validation Against Code

### Verified Items

| Item | Code Evidence |
|------|--------------|
| `#FFF8F0` background on Phase 1 pages | `Home.tsx:67`, `Dashboard.tsx:285`, `Progress.tsx:112`, `ForgotPassword.tsx:31`, `ResetPassword.tsx:90` |
| `Button.tsx` V1 bouncy shadow | `Button.tsx:35` — `shadow-[0_6px_0_0_#000000]` on all non-ghost variants |
| `GameContainer.tsx` V1 background | `GameContainer.tsx:60` — `bg-[#FFF8F0] font-nunito` |
| `MirrorDraw.tsx` gold standard | `MirrorDraw.tsx:138,477` — `#FFF8F0` fill, no dark overlays |
| `OptionChips.tsx` exists | `src/frontend/src/components/game/OptionChips.tsx:22` |
| `useSoundEffects` hook exists | `src/hooks/useSoundEffects.ts:8` |
| `CelebrationOverlay.tsx` exists (but needs upgrade) | File exists at `src/frontend/src/components/CelebrationOverlay.tsx:286` |

### Mismatches and Evidence

| # | Mismatch | Code Evidence |
|---|----------|--------------|
| M-1 | **OnboardingFlow outer overlay is dark** | `OnboardingFlow.tsx:101` — `bg-slate-900/60 backdrop-blur-md` |
| M-2 | **CelebrationOverlay uses `bg-black/60`** | `CelebrationOverlay.tsx:216` — not V1; text is white on dark background |
| M-3 | **Shadow token in doc header is wrong** | Doc line 4: `[0_4px_0_0_#000000]`; `Button.tsx:35`: `[0_6px_0_0_#000000]` |
| M-4 | **30+ game files still have `bg-slate-900` dark overlays** | `VirtualChemistryLab.tsx:633`, `ColorByNumber.tsx:322`, `ShapeSequence.tsx:453,506`, `NumberTapTrail.tsx:392,444`, `EmojiMatch.tsx:862`, `FreezeDance.tsx:823`, `FeedTheMonster.tsx:333`, `SteadyHandLab.tsx:343`, `Games.tsx:330`, `PhysicsPlayground.tsx:515,557,601`, `MazeRunner.tsx:222`, `ObstacleCourse.tsx:598,691`, `WordBuilder.tsx:695,762,868`, `YogaAnimals.tsx:799`, `SimonSays.tsx:883`, `PhonicsSounds.tsx:568,600`, `ShapePop.tsx:305`, and more |
| M-5 | **Login.tsx already V1-compliant** | `Login.tsx:97,100,233` — `bg-[#FFF8F0]`, split-screen, `shadow-[0_6px_0_0_#000000]` on CTA |
| M-6 | **Register.tsx already mostly V1-compliant** | `Register.tsx:81,104` — `bg-[#FFF8F0]`, split-screen layout |
| M-7 | **Phase 3 Pending Queue is blank** | `V1_UI_REVAMP_STATUS.md:47–67` — 17 empty lines |
| M-8 | **`GamePauseModal.tsx` (shared) uses dark overlay** | `game/GamePauseModal.tsx:35` — `bg-slate-900/40` |
| M-9 | **`StoryModal.tsx` uses dark overlay** | `StoryModal.tsx:28` — `bg-slate-900/60` |
| M-10 | **`Games.tsx` (Phase 1 "COMPLETED") has dark modal** | `Games.tsx:330` — `bg-slate-900/60 backdrop-blur-md` |

### Missing Tests / Missing Repro Steps

- No visual/snapshot tests enforce the V1 theme tokens. A component using `bg-slate-900` anywhere would not be caught by CI.
- No programmatic audit (linting or custom rule) to detect `bg-slate-900` in non-camera-related contexts.
- `CelebrationOverlay.tsx` has no unit test file at all.

---

## 8. Findings Backlog

| ID | Title | Type | Impact | Confidence | Proposed Resolution |
|----|-------|------|--------|------------|---------------------|
| **F-001** | Phase 3 Pending Rewrite Queue is blank | Docs gap | High — agents have no guidance, risking missed migrations | **High** — plainly visible in the doc | Enumerate all ~30+ game files that still contain `bg-slate-900`; generate a prioritized sub-list |
| **F-002** | `OnboardingFlow` outer backdrop is still dark (Phase 2 false-positive) | Bug | High — first user experience is a dark overlay, contradicts V1 aesthetic | **High** — `OnboardingFlow.tsx:101` | Replace outer `bg-slate-900/60` with a V1 light scrim (e.g., `bg-[#FFF8F0]/80` or white/warm blur) |
| **F-003** | Shadow canonical value in doc header is wrong (`4px` vs `6px`) | Docs gap | Med — agents will copy the wrong token, creating inconsistency over time | **High** — `Button.tsx:35` is the reference | Update doc line 4: `shadow-[0_4px_0_0_#000000]` → `shadow-[0_6px_0_0_#000000]` |
| **F-004** | `CelebrationOverlay` uses `bg-black/60` dark overlay + white text (not V1) | Bug | Med — celebration moment is the most joyful UX touchpoint; dark screen feels wrong | **High** — `CelebrationOverlay.tsx:216` | Replace outer backdrop with V1 light + colorful gradient; apply Phase 5 upgrade (F-009 dependency) |
| **F-005** | `Login.tsx` and `Register.tsx` listed as Phase 4 pending but already done | Docs gap | Low-Med — agents may unnecessarily rewrite compliant pages | **High** — code matches `ForgotPassword.tsx` pattern exactly | Mark both as ✅ in Phase 4, or remove them from the pending list |
| **F-006** | `Games.tsx` (Phase 1 "COMPLETED") has a dark `bg-slate-900/60` game-detail modal | Bug | Med — library modal is dark-mode; inconsistent with Phase 1 completed claim | **High** — `Games.tsx:330` | Port the game detail modal overlay to V1 bubbly white card pattern |
| **F-007** | `GamePauseModal.tsx` + `StoryModal.tsx` + `TrackingLossOverlay.tsx` use dark overlays | Tech debt | High — these overlays appear in most games; dark-on-light jarring | **High** — confirmed at `GamePauseModal.tsx:35`, `StoryModal.tsx:28`, `TrackingLossOverlay.tsx:63` | Migrate backdrops to V1 white card; add to Phase 3 queue |
| **F-008** | `useSoundEffects` vs `useAudio` hook conflict unaddressed | Tech debt | Med — Phase 5 proposes wiring `useSoundEffects` but `Button.tsx` already uses `useAudio` | **High** — two separate hook files exist | Document which hook is canonical; consider consolidation or explicit delegation |
| **F-009** | No lint/test guard for `bg-slate-900` regressions | Missing feature | High — dark-mode tokens can re-enter codebase silently | **High** — zero test coverage on theme enforcement | Add ESLint custom rule or Vitest snapshot tests to disallow `bg-slate-900` in game pages |
| **F-010** | `KenneyButton.tsx` exists but is not mentioned in V1 doc | Risk | Low — unknown whether it's deprecated or part of the design system | **Med** — file exists at `ui/KenneyButton.tsx` | Clarify its status; add to doc as "deprecated" or reference it as an alternative pattern |

---

## 9. Recommendations for Next Step Discussion

Ordered by leverage (highest impact, lowest effort first):

1. **[F-001] Reconstruct the Phase 3 Pending Queue** — Run a codebase scan for all `bg-slate-900` occurrences in `pages/` and build the missing list. This is a pure doc fix with zero code change and unblocks all agent work on Phase 3. (~30 files need entries)

2. **[F-003] Fix the canonical shadow token in the doc header** — One-line change: `[0_4px_0_0_#000000]` → `[0_6px_0_0_#000000]`. High-leverage because every future component an agent builds will copy this value.

3. **[F-005] Mark Login + Register as ✅ in Phase 4** — Prevents redundant rewrites of already-compliant pages. Pure doc fix.

4. **[F-002] Fix `OnboardingFlow` dark overlay** — Single `className` change on `OnboardingFlow.tsx:101`. Fixes the most user-visible dark-mode remnant in a Phase 2 "COMPLETED" component.

5. **[F-006] Fix `Games.tsx` dark game-detail modal** — Single modal panel port in `Games.tsx:330`. Fixes a Phase 1 "COMPLETED" page regression.

6. **[F-007] Port `GamePauseModal` + `StoryModal` to V1** — Two small components used by nearly every game. Fixing them provides the widest blast radius per line of code changed.

7. **[F-009] Add a theme enforcement lint rule** — A custom ESLint rule or Vitest snapshot check to disallow `bg-slate-900` in non-camera contexts will prevent future regressions and make the Phase 3 queue self-maintaining.

---

## Proposed Storage Location

```
docs/reviews/V1_UI_REVAMP_STATUS.review.md
```
(This file — already placed here.)
