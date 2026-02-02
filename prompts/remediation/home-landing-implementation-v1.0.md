# Prompt: Implement Home Landing P0 Improvements (v1.0)

## Goal
Implement the P0 items from the Home landing audit: hydration-guarded onboarding, "Try Demo" CTA (no-camera demo flow), responsive mascot anchoring and accessibility fixes. Add unit tests and a Playwright check.

## Scope
- Modify: `src/pages/Home.tsx`, `src/components/Mascot.tsx`, `src/components/OnboardingFlow.tsx`
- Add tests: `src/pages/__tests__/Home.*`, Playwright e2e under `src/e2e/home-landing.spec.ts`
- Update docs: `docs/IMPLEMENTATION_HOME.md` with a short change summary and verification steps

## Implementation plan
1. Create small ticket and link this prompt: TCK-20260202-014 (already created).
2. Add store hydration guard in `OnboardingFlow` so it only renders after store.hydrated or explicit user click.
3. Add `Try Demo` CTA component; clicking it should set `sessionStore.startDemo()` (or `sessionStore.demoMode = true`) and navigate to the demo route (or render demo inline) without requesting camera permissions.
4. Update `Mascot`:
   - Make mascot accept `position="anchored"` prop to anchor it to a container using `position: relative` on the page container.
   - Add `aria-hidden` for decorative variant.
   - Add CSS rules to hide mascot on small screens (mobile breakpoint) and ensure it sits below CTAs.
5. Tests:
   - Unit: assert gating/hydration behavior, `Try Demo` click sets demo flag and does not call `navigator.mediaDevices.getUserMedia`, mascot has `aria-hidden` and has `hidden-on-mobile` class.
   - Playwright: mobile viewport screenshot asserting mascot not overlapping CTA, e2e click-through for Try Demo (no camera prompt).
6. Accessibility: ensure CTA has visible text at all breakpoints and aria-labels where icon-only.
7. Document changes in `docs/IMPLEMENTATION_HOME.md`.

## Commands & verification
- Run unit tests: `pnpm vitest -r` (or configured runner)
- Run Playwright test: `pnpm playwright test e2e/home-landing.spec.ts`
- Type-check & lint: `pnpm -w run typecheck && pnpm -w run lint`

## Acceptance criteria
- All tests pass and Playwright assertions succeed.
- No onboarding flash on cold load; demo CTA works without camera permission requests; mascot not overlapping CTAs on mobile.

---

*Use this prompt to drive an implementation PR. Keep changes small and test-driven; follow the repo's preservation-first policy in `docs/AGENTS.md`.*
