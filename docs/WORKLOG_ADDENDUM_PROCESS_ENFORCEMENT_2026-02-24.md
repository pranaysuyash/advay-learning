## TCK-20260224-033 :: Enforce No-Bypass Validation + Stabilize Frontend Typecheck
Ticket Stamp: STAMP-20260224T180958Z-codex-2jxp

Type: HARDENING
Owner: Pranay
Created: 2026-02-24
Status: **DONE**
Priority: P1

Prompt/persona traceability:

- Prompt used: `prompts/hardening/hardening-v1.1.md` (policy + guardrail hardening)
- Audit axis/lens: Workflow integrity + correctness

Scope contract:

- In-scope:
  - Enforce no-bypass quality checks at `pre-push` so commit-hook skipping cannot silently ship.
  - Add explicit repo policy/docs for bypass prohibition unless user-authorized.
  - Fix concrete TypeScript/runtime breakages in touched frontend files.
- Out-of-scope:
  - Full legacy test-suite remediation across unrelated areas.
  - CI pipeline changes outside repo hooks.
- Behavior change allowed: YES

Targets:

- Repo: learning_for_kids
- File(s):
  - `.githooks/pre-push`
  - `AGENTS.md`
  - `docs/SETUP.md`
  - `src/frontend/src/pages/PlatformerRunner.tsx`
  - `src/frontend/src/pages/YogaAnimals.tsx`
  - `src/frontend/src/pages/NumberTapTrail.tsx`
  - `src/frontend/src/pages/DressForWeather.tsx`
  - `src/frontend/src/pages/MathMonsters.tsx`
  - `src/frontend/src/utils/audioManager.ts`
- Branch/PR: main

Execution log:

- [2026-02-24] Added `pre-push` frontend guardrail: mandatory frontend typecheck + related test invocation for changed frontend files in push range.
- [2026-02-24] Added explicit bypass protocol requiring `ALLOW_BYPASS_CHECKS=1` and `BYPASS_REASON`.
- [2026-02-24] Updated agent policy docs to prohibit `--no-verify`/`SKIP_*` unless explicitly authorized by user.
- [2026-02-24] Repaired `PlatformerRunner` import/path/runtime issues and corrected missing symbols in `YogaAnimals`/`NumberTapTrail`.
- [2026-02-24] Wired `onGameComplete()` calls in `DressForWeather` and `MathMonsters` completion paths.
- [2026-02-24] Hardened `audioManager.playPop()` with fallback when mocked/test audio context lacks buffer APIs.
- [2026-02-24] Verified frontend typecheck passes.

Evidence:

- Command: `cd src/frontend && npm run -s type-check`
- Output: pass (no TypeScript errors)
- Command: `cd src/frontend && npx vitest related --run --reporter=dot <changed-files>`
- Output: command succeeds (no related test files found for current change set)
- Observed: `.githooks/pre-push` now runs `type-check` and `vitest related` for changed frontend source files in push range.
- Observed: `AGENTS.md` and `docs/SETUP.md` document no-bypass policy and emergency override protocol.
- Inferred: Commit-hook bypasses are now constrained by push-time validation, reducing risk of silently shipping unchecked code.
- Unknown: Remaining historical full-suite test failures outside this remediation scope until dedicated cleanup ticket.

Status updates:

- [2026-02-24] **DONE** — policy enforcement and targeted frontend stabilization completed.
