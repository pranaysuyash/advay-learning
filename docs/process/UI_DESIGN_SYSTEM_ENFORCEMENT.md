# UI Design-System Enforcement

**Version:** 1.0  
**Last Updated:** 2026-02-02

This document codifies the enforcement steps added after the single-axis UI design-system audit (TCK-20260202-021) and remediation (TCK-20260202-022).

## Automated Check

Run from `src/frontend`:

```bash
npm run audit:ui-design
```

This executes `scripts/check_ui_design_tokens.sh` and currently enforces:

1. No inline hex colors in:
   - `src/frontend/src/pages/Home.tsx`
   - `src/frontend/src/pages/alphabet-game/AlphabetGamePage.tsx`
   - `src/frontend/src/pages/ConnectTheDots.tsx`
   - `src/frontend/src/pages/Games.tsx`
   - `src/frontend/src/components/GameCard.tsx`
2. No low-contrast/non-token Home hero patterns:
   - `text-white/70`
   - `text-white/80`
   - `bg-white/10`
   - `from-red-400`
   - `from-red-500`
   - `to-red-600`
3. Home must import canonical `Button` component.

## PR Checklist (UI Axis)

For PRs touching UI design-system consistency, verify:

- [ ] Uses palette/spacing/type tokens (no ad-hoc color literals in audited files).
- [ ] Uses canonical shared components for CTAs/cards where available.
- [ ] `npm run audit:ui-design` passes locally.
- [ ] Focus/hover/active/disabled states remain visible and consistent.
- [ ] Any exception is documented in the worklog with evidence and rationale.

## Ongoing Audit Cadence

- Run a single-axis UI design-system audit every 2–3 sprints.
- Expand `check_ui_design_tokens.sh` target files as additional pages are remediated.
- Keep this document and `docs/SETUP.md` updated when enforcement changes.
