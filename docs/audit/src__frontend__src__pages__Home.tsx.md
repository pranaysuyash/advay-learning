# Audit: Home Landing Page (src/pages/Home.tsx)

**Version**: 1.0
**Date**: 2026-02-02
**Auditor**: GitHub Copilot (agent)

## Summary

**Ticket**: TCK-20260202-014

A lightweight audit of the Home landing page identified several high-priority UX and correctness issues affecting first-time conversions and trust signals. Issues fall into three P0 items: (1) onboarding gating/hydration flash on first render, (2) lack of an explicit "Try Demo" CTA for frictionless trial without camera/auth, and (3) mascot positioning/overlap on small screens causing perceived obstruction of primary CTAs.

## Findings

1. Onboarding gating can flash briefly before store hydration completes.
   - Evidence: Observed code returns onboarding UI unguarded on server/hydration boundary. This leads to a flash of onboarding overlays, then immediate dismissal once local store hydrates. (Observed)
   - Risk: User confusion; increased bounce for first-time users.
   - Severity: P0

2. No frictionless demo CTA available.
   - Evidence: Home CTA routes primarily to sign-up and login flows; there is no explicit demo mode that can be launched without camera or account. (Observed)
   - Risk: Parents who want to preview quickly may bounce or not engage; lowers conversion. (P0)

3. Mascot overlaps primary CTAs at small breakpoints.
   - Evidence: Mascot is positioned absolute without container anchoring and lacks responsive hide/placement rules. On mobile narrow widths CTAs are occluded in manual testing. (Observed)
   - Risk: Visual obstruction reduces CTA discoverability and may create UX friction. (P0)

4. Privacy/trust strip and parent cues are minimal.
   - Evidence: No short trust text or privacy hint (e.g., "Try demo — no camera required") is attached to the demo flow or CTA. (Inferred)
   - Severity: P1

5. Accessibility improvements: Ensure CTAs have accessible names and the mascot decorative elements are aria-hidden.
   - Evidence: Mascot image lacks aria-hidden attribute; CTA text is icon-only on some breakpoints. (Observed)
   - Severity: P1

## Recommendations

P0 (High priority):
- Implement a hydration guard when deciding whether to show the onboarding modal/overlay to eliminate flash.
- Add a prominent "Try Demo" CTA (primary or secondary depending on design) which launches a no-camera demo session. Ensure route or component triggers a demo-mode store flag (e.g., `sessionStore.demoMode = true`) that avoids camera permission prompts.
- Anchor mascot to the page container and apply responsive rules (hide on small screens or move below fold). Ensure it is aria-hidden and does not obstruct interactive elements.

P1 (Medium priority):
- Add a short trust strip near the demo CTA: "Try the demo — no camera or sign-up required".
- Add aria-hidden to decorative mascot and ensure CTAs have text labels at all breakpoints.

## Acceptance criteria (for P0):
- Onboarding does not flash before hydration completes (testable by simulating immediate rehydration and verifying no flash).
- "Try Demo" CTA is visible and launches an in-page demo without request for camera or auth; landing demo completes and shows first-screen content.
- Mascot non-overlapping on small screens (Playwright screenshot assertion for mobile viewport).
- Unit tests and one Playwright E2E test exist covering the flows above.

## Test Plan (high-level)

- Unit tests (Vitest):
  - Assert the onboarding modal only renders when store.hydrated === true OR user explicit action.
  - Assert the presence of the "Try Demo" CTA and that clicking it sets `sessionStore.demoMode` (or navigates to /demo) without calling camera permission APIs.
  - Assert mascot DOM node has `aria-hidden` and `display: none` at small viewport via CSS class presence.

- Playwright E2E:
  - Mobile viewport screenshot: verify mascot does not overlap CTA.
  - Flow: click Try Demo -> ensure no camera permission requested -> show demo scene.

## Files to modify
- `src/frontend/src/pages/Home.tsx` (core)
- `src/frontend/src/components/Mascot.tsx` (anchor + aria-hidden)
- `src/frontend/src/components/OnboardingFlow.tsx` (hydrate guard)
- Add tests in `src/frontend/src/pages/__tests__/Home.*` and Playwright e2e under `src/frontend/e2e/home-landing.spec.ts`

## Notes
- Follow the repo audit-to-ticket policy: create a TCK ticket before making implementation changes. See `docs/AGENTS.md` for the ticket template and workflow.

---

*Audit artifact created by GitHub Copilot. Evidence labels: Observed / Inferred as noted above.*
