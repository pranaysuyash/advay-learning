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

## TCK-20260227-013 :: Enforce WIP Branch PR Flow Before Commit
Ticket Stamp: STAMP-20260227T122024Z-codex-cs3o

Type: HARDENING
Owner: Pranay
Created: 2026-02-27
Status: **DONE**
Priority: P1

Prompt/persona traceability:

- Prompt used: `prompts/workflow/agent-entrypoint-v1.0.md` + repo `AGENTS.md` policy hardening
- Audit axis/lens: Workflow integrity + review quality

Scope contract:

- In-scope:
  - Update repo policy to require short-lived `codex/wip-*` branch before commit.
  - Block direct commits on `main` via `.githooks/pre-commit`.
  - Update setup/docs so all agents learn the same flow.
- Out-of-scope:
  - CI pipeline changes
  - PR template redesign
- Behavior change allowed: YES

Targets:

- Repo: learning_for_kids
- File(s):
  - `AGENTS.md`
  - `prompts/workflow/agent-entrypoint-v1.0.md`
  - `.githooks/pre-commit`
  - `docs/SETUP.md`
  - `scripts/setup.sh`
- Branch/PR: `codex/wip-<scope>` -> `main`

Execution log:

- [2026-02-27] Updated branch policy to require PR branch before commit.
- [2026-02-27] Added pre-commit guard to block direct commits on `main` (override via `ALLOW_MAIN_COMMIT=1`).
- [2026-02-27] Updated onboarding/setup docs with required WIP branch workflow.
- [2026-02-27] Updated entrypoint prompt so agents align with the new policy.

### Evidence

Command: `bash -n .githooks/pre-commit scripts/setup.sh`
Command: `rg -n "Direct commits on 'main'|codex/wip-|ALLOW_MAIN_COMMIT" AGENTS.md .githooks/pre-commit docs/SETUP.md prompts/workflow/agent-entrypoint-v1.0.md`
Observed: All policy and enforcement points present in AGENTS, prompt, hook, and setup docs.
Inferred: Agents following repo prompts/hooks now default to PR review path before merge to `main`.
Unknown: Whether every external/non-hook-aware tool invocation path will always honor this policy.

Status updates:

- [2026-02-27] **DONE** — WIP branch + PR review workflow documented and locally enforced.

### TCK-20260227-013 Addendum :: WIP Branch Helper Script

Execution log:

- [2026-02-27] Added helper `scripts/start_wip_branch.sh` to standardize WIP branch creation from `main`.
- [2026-02-27] Updated pre-commit message and setup/process docs to recommend helper script.

Evidence:

Command: `bash -n scripts/start_wip_branch.sh .githooks/pre-commit scripts/setup.sh`
Command: `./scripts/start_wip_branch.sh --help`
Observed: Helper script exists, is executable, and documented in setup + command references.

Status updates:

- [2026-02-27] **DONE** — WIP branch helper added and documented.
