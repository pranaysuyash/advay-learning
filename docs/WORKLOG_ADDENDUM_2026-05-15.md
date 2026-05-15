# Worklog Addendum — 2026-05-15

## TCK-20260515-001 :: Unblock Merge Readiness Gate (pnpm + Trivy)

Ticket Stamp: STAMP-20260515T085813Z-codex-d2c5

Type: CI_FAILURE
Owner: Pranay
Created: 2026-05-15 08:58 UTC
Status: **IN_PROGRESS**
Priority: P0

Scope contract:

- In-scope:
  - Fix `Merge Readiness Gate` failures caused by pnpm version mismatch
  - Eliminate Trivy-reported vulnerabilities introduced by tracked lockfiles
- Out-of-scope:
  - Resolving/dismissing historical code-scanning alerts manually in GitHub UI
  - Addressing lint/test failures outside this PR’s changed files
- Behavior change allowed: YES (CI/workflow tooling only)

Targets:

- Repo: advay-learning
- File(s): `package.json`, `src/frontend/package.json`, `package-lock.json`
- PR: #55 (`codex/wip-docs-cleanup`)

Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md

Execution log:

- 2026-05-15 08:52 UTC — Observed merge gate failures:
  - `regression-policy` failed: pnpm/action-setup version mismatch with `packageManager` hash suffix.
  - `code-scanning-policy` failed: open Trivy alerts for `basic-ftp` sourced from `package-lock.json`.
- 2026-05-15 08:56 UTC — Updated `packageManager` fields to `pnpm@10.30.1` (no hash suffix) to match CI.
- 2026-05-15 08:56 UTC — Removed root `package-lock.json` to eliminate Trivy/npm lockfile vulnerability surface.

Evidence:

- Command: `docker run --rm -v "$PWD:/src" -w /src aquasec/trivy:0.56.2@sha256:26245f364b6f5d223003dc344ec1eb5eb8439052bfecb31d79aeba0c74344b3a fs --config .github/trivy/trivy.yaml --format table . | rg -n "Total:" || true`
  - Observed: no `Total:` vulnerability summary lines produced after removing `package-lock.json`

Status updates:

- 2026-05-15 08:58 UTC — **IN_PROGRESS** — local fixes applied; awaiting CI confirmation

Next actions:

1. Re-run CI on PR #55 and confirm `regression-policy` and `code-scanning-policy` pass.
2. Resolve remaining `review-policy` blocker (unresolved review threads) in PR UI.

- 2026-05-15 10:59 UTC — Addressed remaining `review-policy` technical blockers from unresolved threads:
  - `src/frontend/src/pages/AirCanvas.tsx`: split tracking lifecycle so cleanup `stopTracking` is unmount-only.
  - `src/frontend/src/games/wordLadderLogic.ts`: replaced variable-length chain with same-length transitions.
  - `src/frontend/src/components/game/GlobalCVCursor.tsx`: set `coordinateSpace='normalized'` for `KenneyHandCursor`.
- 2026-05-15 11:01 UTC — Validation: `cd src/frontend && npm run lint` => pass (`0 errors`, `149 warnings`, threshold `150`).
- 2026-05-15 11:05 UTC — Current blocker remains PR thread resolution (`review-policy` reports 3 unresolved non-bot threads).
- 2026-05-15 13:44 UTC — Resolved 7 newly-opened review threads from review-bot reruns by applying code/data fixes:
  - `GlobalCVCursor`: added `containerRef` + explicit viewport sizing for normalized cursor conversion.
  - `wordWorkshop` registry: removed undeclared `voice` CV mode from `phonics-fun`.
  - `AlphabetGame`: fixed analytics content ID to use `currentLetter.char`.
  - `magicELogic`: replaced invalid/non-word pairs (`mug->muge`, `pun->pune`) with valid educational alternatives.
  - `PhonicsTracing` + `BeginningSounds`: passed rendered `webcamRef` into `useGameHandTracking`.
  - `WordSearch`: completion now gates on actual matched word, not any drag path.
- 2026-05-15 13:45 UTC — Validation: targeted eslint over all 7 touched frontend files passed.
