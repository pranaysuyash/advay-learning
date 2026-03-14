# Digital Jenga Follow-up TODOs (Post-Current Completion)

Date: 2026-03-14  
Scope: Non-blocking improvements intentionally deferred after current Jenga completion.

## Status

These are **not blockers** for current Jenga usability/fix scope.  
They are tracked here so future passes can implement them with explicit scope.

## TODO List

1. Add explicit mode split: `Guided` vs `Real Physics`.
- Why: keep kid-friendly defaults while allowing reference-like free/physical mode.
- Expected changes:
  - UI mode selector extension
  - Separate drag/physics profile sets
  - Mode-specific tutorial copy

2. Expand read-aloud into full narration pack.
- Why: current read-aloud cues are minimal phase prompts.
- Expected changes:
  - Structured phrase map per phase/mode/outcome
  - Voice locale preferences
  - Cooldown/debounce rules to avoid repeated prompts

3. Add adaptive quality profile by device/frame budget.
- Why: keep frame pacing consistent across low/mid/high hardware.
- Expected changes:
  - dynamic stars/shadows/label complexity
  - optional reduced effects mode
  - runtime quality switch UI for parents

4. Clean non-Jenga dev-console noise from global app routes.
- Why: reduce false-positive debugging load while testing games.
- Current examples:
  - unauthenticated `401 /api/v1/auth/me`
  - `404 /api/v1/data-export/export/summary` when route not available

5. Add one scripted live-CDP visual regression smoke for Jenga.
- Why: preserve validated behaviors after future merges.
- Minimum assertions:
  - mode buttons visible
  - extraction ends at `place` phase (no auto-place)
  - HUD auto-hide during pull
  - Place On Top completes turn
  - no critical runtime errors in console

## Ownership

- Product owner: Pranay
- Execution: next Jenga UX/perf refinement ticket
