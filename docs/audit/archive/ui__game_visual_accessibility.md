# UI Visual Accessibility Audit: Game & Letter Journey

**Date:** 2026-01-30 00:12 IST
**Reviewer:** GitHub Copilot
**Scope:** Visual/accessibility review focusing on borders, separation, contrast, brightness, and overall clarity for `Game` and `Letter Journey` screens (observed from screenshots).

---

## Observations (from provided screenshots)

- Very low contrast between foreground text and pale background in multiple places (e.g., navigation, hints, batch labels). **(Observed)**
- Card tiles (letters) lack visible borders and separation; rounded cards blend into background making interactive regions unclear. **(Observed)**
- Primary call-to-action (Start Game) has decent contrast but surrounding text is nearly invisible due to low brightness. **(Observed)**
- Language selection buttons have inconsistent emphasis; the active language uses a heavy shadow and red fill which is good, but other options are too faded (low affordance). **(Observed)**
- Small text (e.g., batch unlock counts, helper text) is very faint and likely fails WCAG AA contrast thresholds for normal text. **(Observed)**

---

## Problems & Impact

- Low visibility and unclear interactive affordances reduce discoverability for children (especially visually impaired or in bright ambient light) — affects usability and accessibility. (Impact: HIGH)
- Lack of borders and clear separation can cause mis-taps and confusion around which element to interact with (Impact: MEDIUM)
- Poor contrast for secondary text reduces information transfer (Impact: MEDIUM)

---

## Recommendations (prioritized)

1. Introduce clear card borders or subtle elevation (box-shadow) for letter tiles to improve separation. Use a subtle neutral border (e.g., rgba(0,0,0,0.06)) or elevation token. (HIGH)
2. Increase contrast of secondary text to meet WCAG AA (4.5:1 for normal text, 3:1 for large text). Update CSS tokens for `text-muted` and ensure readability on real devices. (HIGH)
3. Ensure interactive elements (language buttons, Start) have visible focus states, larger hit targets, and consistent emphasis for active state. (MEDIUM)
4. Add optional theme/toggle for higher brightness/contrast for children with visibility needs. (LOW)
5. Create visual regression tests (storyshots) for core screens to detect contrast or border regressions. (MEDIUM)

---

## Tests & Acceptance Criteria

- Automated contrast checks (axe-core or pa11y) pass for Home and Game pages
- Visual diff test shows consistent border/shadow on letter tiles
- Manual: Confirm in bright ambient light (phone in bright light) that text remains legible

---

## Next steps

- Create a small PR that adjusts color tokens for `text-muted` and adds a `card` CSS utility with border/elevation applied to letter tiles. Add unit + visual tests. (Estimate: 0.5-1 day)
- Run automated a11y audits as part of CI.

**Artifact:** This file saved to `docs/audit/ui__game_visual_accessibility.md` ✅

**Prepared by:** GitHub Copilot

---

## Related Tickets

**TCK-20260130-014: Medium-scope UI Contrast Sweep**

- Status: OPEN
- Created: 2026-01-30 00:00 UTC
- Addresses all contrast and separation findings from this audit
- See worklog TCK-20260130-014 for full details

**TCK-20260131-002: Fix Accessibility & Form Issues**

- Status: OPEN
- Created: 2026-01-31 00:00 UTC
- Addresses accessibility (WCAG AA, keyboard nav, form attributes)
- See docs/tickets/TCK-20260131-002.md for full details

**TCK-20260130-008: Add Home/Exit Button to Game Screen**

- Status: OPEN
- Created: 2026-01-30 00:00 UTC
- Addresses Issue #1 from audit_report_v1.md
- See worklog for full details

**TCK-20260130-009: Implement Parent Gate for Settings**

- Status: OPEN
- Created: 2026-01-30 00:00 UTC
- Addresses Issue #3 from audit_report_v1.md
- See worklog for full details

**TCK-20260130-010: Add Tutorial Overlay for First-Time Users**

- Status: OPEN
- Created: 2026-01-30 00:00 UTC
- Addresses Issue #2 from audit_report_v1.md
- See worklog for full details
