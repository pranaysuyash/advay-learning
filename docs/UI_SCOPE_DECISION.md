# UI Contrast Decision: Medium Scope

**Decision ID:** TCK-20260130-014
**Date:** 2026-01-30
**Owner:** AI Assistant

## Choice
**Selected scope:** Medium (Recommended)

Actions included:
- Apply stronger borders (`border-border`) and `shadow-sm` to key cards and containers.
- Add subtle card background `bg-white/10` where appropriate to increase surface contrast.
- Ensure `select` and `input` elements use `border-border` and `focus:border-border-strong` for clearer affordance.
- Run tests and dev build, collect before/after screenshots, and document changes.

## Rationale
- Provides immediate, measurable accessibility gains with low risk to layout or behavior.
- Balances effort vs. value: quick to implement, easy to roll back if needed, and covers the most visible regressions.
- Prepares the codebase for a future Aggressive theme token update by aligning components to token usage.

## Implementation Plan
1. Capture "before" screenshots across main pages: Home, Dashboard, Game, Progress, Settings.
2. Apply class updates across `Settings`, `Dashboard`, `Game`, `Progress`, `LetterJourney` (verify), and common layout components.
3. Run unit tests and `vite build` to validate no regressions.
4. Capture "after" screenshots and add diffs to `docs/screenshots/ui_contrast/`.
5. Update `docs/UX_IMPROVEMENTS.md` with rationale, PR diff summary, and visual evidence.

---

If you confirm, I'll capture before screenshots now and then apply the Medium changes. Otherwise, reply with another choice: Quick or Aggressive.