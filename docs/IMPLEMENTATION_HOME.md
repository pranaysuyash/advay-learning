# Implementation Notes: Home Landing P0 Improvements

## Summary

This document records the implementation plan for the Home landing P0 improvements (hydration guard, Try Demo CTA, mascot anchor + accessibility). See TCK-20260202-014 and TCK-20260202-015 in `docs/WORKLOG_TICKETS.md`.

## Goals

- Eliminate onboarding flash on first load
- Add frictionless "Try Demo" CTA that runs without camera or auth
- Anchor/hide mascot on small screens and mark as aria-hidden when decorative

## Local verification

- Unit tests: `pnpm vitest` (target: new tests under `src/pages/__tests__/Home.*`)
- E2E: `pnpm playwright test src/e2e/home-landing.spec.ts`
- Lint/typecheck: `pnpm -w run lint && pnpm -w run typecheck`

## Notes

- Follow preservation principle: don't delete existing onboarding code; add guard ~ store.hydrated checks
- Demo should be opt-in and not request camera permission. Use `sessionStore.demoMode = true` and a demo route/component that renders demo content without initializing camera handlers.
