# Task Checklist: React Stabilization and Asset Repair

## [x] Research & Planning
- [x] Research Aiden Bai's repositories (React Scan, React Doctor, etc.)
- [x] Document utility for agentic ecosystem in `docs/research/AIDEN_BAI_REPOS_CROSS_PROJECT_UTILITY.md`
- [x] Audit "Maximum update depth exceeded" error sources
- [x] Audit "Duplicate key" error in `CircuitBuilder.tsx`
- [x] Audit botched asset migration in `collectibles.ts` and game components

## [/] React Error Fixes
- [x] Fix duplicate key error in `CircuitBuilder.tsx`
- [x] Stabilize state updates in `useGameHandTracking.ts` (FPS, cursor, pinch)
- [x] Stabilize speaking state polling in `useTTS.ts`
- [ ] Verify React fixes with Playwright tests (Visual/E2E)
- [ ] Run `npm run lint` and `npm run type-check` to ensure stability

## [/] Asset Migration Repair (Priority)
- [x] Create detailed asset generation plan in `docs/plans/20260312_ASSET_MIGRATION_REPAIR.md`
- [x] Generate High-Fidelity Creature Icons (7+ items) - *Copied to public/assets*
- [~] [SKIPPED] High-Fidelity Elements (Kept pixel versions due to transparency needs)
- [~] [SKIPPED] High-Fidelity Emotions (Kept pixel versions due to transparency needs)
- [x] High-Fidelity Game Previews (Cinematic 3D Style - Keep these, they look great as headers)
- [x] Verify all assets across the app
- [x] Final visual audit and documentation update
- [x] Update `docs/ASSET_MIGRATION_IMPLEMENTATION_SUMMARY.md` with verified progress

## [ ] Cleanup & Documentation
- [ ] Consolidate implementation reports in `docs/worklogs/`
- [ ] Remove stray artifacts from `.gemini` directory
- [ ] Final verification of app stability (no 404s, no console errors)
