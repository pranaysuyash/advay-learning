## TCK-20260314-001 :: Research Vite+ Alpha Launch (VoidZero)
Ticket Stamp: STAMP-20260314T121049Z-codex-mc1q

Type: RESEARCH
Owner: Pranay
Created: 2026-03-14
Status: **DONE**
Priority: P2

Prompt/persona traceability:

- Prompt used: `research the launch of vite plus today`
- Audit axis/lens: tooling adoption & upgrade risk analysis

Scope contract:

- In-scope:
  - Identify the latest (Mar 2026) public launch/announcement for Vite+ (alpha).
  - Capture key capabilities, CLI commands, and licensing position.
  - Note implications for teams using Vite today.
- Out-of-scope:
  - Any in-depth technical migration work or code changes for this repo.
  - Implementation of Vite+ in this repository.
- Behavior change allowed: NO

Targets:

- Repo: learning_for_kids
- File(s): `docs/WORKLOG_ADDENDUM_VITE_PLUS_LAUNCH_2026-03-14.md`

Execution log:

- [2026-03-14] Researched Vite+ alpha announcement (Mar 13 2026) via VoidZero blog post `announcing-vite-plus-alpha`.
- [2026-03-14] Summarized the Vite+ alpha toolchain components, CLI command set, performance claims, and open-source licensing position.

Evidence:

- Source: https://voidzero.dev/posts/announcing-vite-plus-alpha (Vite+ Alpha announcement)
- Key facts captured:
  - Vite+ is a unified toolchain combining Vite/Vitest/Oxlint/Oxfmt/Rolldown/tsdown and a task runner (`Vite Task`).
  - New global CLI is `vp` (e.g. `vp dev`, `vp check`, `vp test`, `vp build`, `vp run`).
  - Alpha is released under MIT license and publicly open source.
  - Performance claims: Rolldown builds 1.6×–7.7× faster; Oxlint 50–100× faster than ESLint; Oxfmt up to 30× faster than Prettier.

Status updates:

- [2026-03-14] **DONE** — research captured and documented in worklog; no code changes made.

## TCK-20260314-002 :: Plan + Prototype Vite+ Migration (Critical)
Ticket Stamp: STAMP-20260314T000001Z-codex

Type: HARDENING
Owner: Pranay
Created: 2026-03-14
Status: **OPEN**
Priority: P0

Prompt/persona traceability:

- Prompt used: “plan Vite+ migration for existing Vite project”
- Audit axis/lens: toolchain standardization, build/test performance, tooling reliability

Scope contract:

- In-scope:
  - Create a safe, experimental migration plan for the frontend repo to trial Vite+.
  - Define exactly what to change, what to keep, and what to verify.
  - Identify critical risks (build breakage, tooling incompatibilities, test regressions).
- Out-of-scope:
  - Actual full migration in mainline branch without experimental validation.
  - Any backend or non-frontend tooling changes.
- Behavior change allowed: NO (except within a dedicated experimental branch)

Targets:

- Repo: learning_for_kids
- File(s): `src/frontend/package.json`, `vite.config.ts`, `docs/WORKLOG_ADDENDUM_VITE_PLUS_LAUNCH_2026-03-14.md`, `docs/WORKLOG_ADDENDUM_PROCESS_ENFORCEMENT_2026-02-24.md`

Plan (next actions):

1. Create experimental branch (`codex/wip/viteplus-experiment`).
2. Add `vite-plus` (and/or `vite-plus-alpha`) as a dev dependency; keep current `vite` / tooling scripts untouched.
3. Install `vp` globally via the recommended install script and confirm `vp --version`.
4. Run initial checks under Vite+:
   - `vp check` (lint/format/typecheck)
   - `vp dev` (dev server sanity)
   - `vp build` (production build)
   - `vp test` (unit tests)
5. Document any incompatibilities (Vite config, plugin usage, bundling differences, etc.).
6. Decide whether to keep Vite+ as an alternative path (e.g., adding new `vp:*` scripts) or fully replace existing tooling.

Next actions:

1. [ ] Create branch `codex/wip/viteplus-experiment`.
2. [ ] Add `vite-plus` dev dependency and install.
3. [ ] Execute `vp env` / `vp install` / `vp check` in the repo.
4. [ ] Summarize results and recommend go/no-go.

