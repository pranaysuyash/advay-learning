# Game Setup System Prompt (v1.0)

## Work type: UI / REFACTOR (Frontend)

**Goal**: Create a reusable “Game Setup System” for camera-based games so every game has a consistent, kid-friendly, parent-friendly setup experience (mode/language/difficulty) and we avoid regressions from copy-pasted setup UI.

This prompt is designed for:
- repeated setup patterns across multiple games
- child-centered UX constraints (low reading burden, big targets)
- camera-first flows (per `docs/INPUT_METHODS_SPECIFICATION.md`)

## Scope Contract (MUST FILL)

- In-scope:
  - Shared setup primitives (generic, composable)
  - Adopt shared primitives in ONE target game first (prove it works)
- Out-of-scope:
  - Redesigning gameplay
  - Changing tracking logic
  - Reworking navigation or app-wide design system
- Behavior change allowed: NO (UI structure changes only; semantics preserved)

Targets:
- Primary file(s):
- Secondary file(s) (new shared components):
- Game(s) to adopt first:

## Target Group (MUST STATE)

- Child age band: `3-5 | 6-8 | 9-12 | mixed`
- Reading level: `pre-reader | early reader | fluent`
- Device assumption: `phone | tablet | desktop`

## Best-Practice Constraints (Kids + Parents)

- Keep primary choices to 3–5 per screen.
- Tap targets >= 44px, generous spacing.
- No technical language (“GPU”, “delegate”, “landmarks”) in kid UI.
- Clear camera readiness messaging and permission failure guidance.
- Preserve accessibility: keyboard focus order, ARIA labels on icon-only buttons.

## Discovery (Required Evidence)

Run and paste raw outputs:
```bash
git status --porcelain
rg -n "Choose Game Mode|Choose Difficulty|Choose Language" src/frontend/src -S
rg -n "GameControls\\(" src/frontend/src -S
```

## Design: Shared Components (Propose Before Coding)

Define these (names can vary, but keep the roles):

1) `GameSetupCard` (layout wrapper)
2) `OptionChips` (generic selectable chip group)
3) `DifficultySelector` (thin wrapper around OptionChips)
4) `LanguageSelector` (thin wrapper around OptionChips)

Each must define:
- Props contract
- States: loading/disabled/selected
- A11y: labels + keyboard interaction rules
- Visual tokens: use existing classes/tokens

## Implementation Plan (Use `prompts/planning/implementation-planning-v1.0.md`)

Create a plan with:
- Step order (shared primitives first, then adopt into one game)
- Tests to add (at least one small unit test for mapping logic; and one component test if available)
- Manual verification checklist (kid flow; camera permission denied)

## Success Criteria

- Setup UI is reusable across at least 2 games
- No gameplay behavior changes
- `npm run type-check` passes
- Scoped eslint passes
- No regressions in the “Input Methods” contract messaging

