
### TCK-20260316-001 :: Consolidate all better code from local branches

Type: CONSOLIDATION
Owner: Codex
Created: 2026-03-16
Status: IN_PROGRESS

Scope: Nit-pick better code from all unmerged local branches

Branches consolidated:
- codex/wip-midline-violator
- wip-preview-recovery-rotation-v4
- codex/wip-review-thread-tools
- Previous PRs 51, 52, 53

Additions:
- Workflows: bot exclusions
- AGENTS.md: Section 7.1 utility scripts
- Scripts: agent_gate, regression_check, secret_scan
- Tools: review utilities, CV analysis
- Backend: agent files, mypy.ini

Verification:
- TypeScript: ✅
- Lint: ✅
- Tests: ✅

Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md

### TCK-20260316-003 :: Additive-only merge resolution from remaining unmerged branch

Ticket Stamp: STAMP-20260315T202424Z-codex-r9ss

Type: CONSOLIDATION
Owner: Codex
Created: 2026-03-16
Status: IN_PROGRESS

Scope contract:
- In-scope: Resolve merge conflicts from `codex/wip-gamecontainer-remediation` into `codex/wip-utility-tools-merge` using additive/better-comprehensive outcomes only.
- Out-of-scope: Reductive deletions, bypassing gates, and bot-thread ignore expansions.
- Behavior change allowed: YES (additive improvements only)

Execution log:
- 2026-03-16: Resolved `.github/workflows/merge-readiness-gate.yml` conflict in favor of stricter review gate policy (no expanded bot-thread exclusions).
- 2026-03-16: Resolved `src/frontend/src/data/gameRegistries/labOfWonders.ts` conflict in favor of additive registry content, including `shadow-portal` and preserving existing exports.
- 2026-03-16: Verified review-required files are explicitly checked through `feature-check`; regressions in `BubblePop.tsx` and `NumberTracing.tsx` were fixed before merge continuation.
- 2026-03-16: Verified asset delta against `codex/wip-midline-violator`; no missing asset files from that branch into open PR branch (preview asset delta is inverse direction).
- 2026-03-16: Verified consolidation completeness across all unmerged local/remote branches using `git cherry -v HEAD <branch>`; count=0 for each target branch, confirming no unique commits remain outside `codex/wip-utility-tools-merge`.

Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md

### TCK-20260316-002 :: Merge midline-violator improvements into PR branch

Type: CONSOLIDATION
Owner: Codex
Created: 2026-03-16
Status: IN_PROGRESS

Scope: Merge midline-violator branch changes (GameContainer fixes, preview assets, hook improvements) into open PR branch. Also includes: GameContainer improvements, Hooks improvements, Page fixes, Preview assets.

Refs: TCK-20260315-013

Execution log:
- 2026-03-16T01:xx: Merged codex/wip-midline-violator into codex/wip-utility-tools-merge (preferred incoming changes)

Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md

### TCK-20260316-004 :: Branch recovery — apply stash@{0} game improvements

Ticket Stamp: STAMP-20260316T120000Z-copilot-br04

Type: CONSOLIDATION
Owner: Copilot
Created: 2026-03-16
Status: DONE

Scope contract:
- In-scope: Apply stash@{0} improvements to codex/wip-utility-tools-merge; recover unique changes from local branches
- Out-of-scope: stash@{1} (different branch), behavioral regressions
- Behavior change allowed: YES (additive/net-better)

Changes applied:
- .agent/AGENT_KICKOFF_PROMPT.txt: Added CRITICAL PRIORITY multi-modal vision platform block (additive)
- src/frontend/src/pages/BubblePop.tsx: Removed unused CV imports/state; cleaned stash-applied version
- src/frontend/src/pages/ColorByNumber.tsx: Code style simplification from stash
- src/frontend/src/pages/LetterHunt.tsx: Code style simplification from stash
- src/frontend/src/pages/NumberTracing.tsx: Code style simplification from stash
- src/frontend/src/pages/NumberBubblePop.tsx: Code style simplification from stash
- src/frontend/src/hooks/useHandInteraction.ts: Simplified collision detection (cursor→viewport→rect)
- src/frontend/src/hooks/useGameHandTracking.ts: Formatting improvements; kept 'worker' default (behavioral regression in stash reverted)
- src/frontend/src/data/gameRegistries/labOfWonders.ts: Stash reformatting applied; restored shadow-portal + egg-shadow-master entries (stash regression fixed)
- src/frontend/src/games/wordBuilderLogic.ts: Improvements from stash
- find_missing_previews.py, find_visible_missing_v3.py: Improvements from stash
- docs/CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md: Additive content from stash
- .githooks/pre-commit: Applied midline-violator version (adds SKIP_* flag support per AGENTS.md policy)
- src/backend/mypy.ini: Added namespace_packages + explicit_package_bases from wip-all-better-code

Regressions prevented:
- useGameHandTracking.ts: Did NOT apply 'main-thread' default (stash removed the documented 'worker' default without explanation)
- labOfWonders.ts: shadow-portal and egg-shadow-master were removed in stash; restored

Evidence:
- Command: cd src/frontend && npx tsc --noEmit → exit 0 (no TypeScript errors)
- Command: git stash pop stash@{0} → applied, conflict in WORKLOG resolved by keeping upstream (more detailed)

Prompt Trace: branch-recovery-implementation-agent

---

### TCK-20260316-002 :: Branch Recovery — CV Coordinate Fixes from codex/wip-gamecontainer-remediation

Type: REMEDIATION
Owner: Pranay
Created: 2026-03-16
Status: **DONE**
Priority: P1

Ticket Stamp: STAMP-20260316T052613Z-copilot

Scope contract:
- In-scope: Apply CV coordinate fixes and UX improvements from codex/wip-gamecontainer-remediation
- Out-of-scope: Workflow bot pattern changes, AGENTS.md downgrades, QWEN.md deletion
- Behavior change allowed: YES (additive/net-better)

Assessment of midline-violator branch:
- HEAD (codex/wip-utility-tools-merge) is already MORE complete than codex/wip-midline-violator
- All 17 preview images already present on HEAD
- All game pages on HEAD are larger/more complete (branch is older state)
- Workflows on branch REGRESS 4-bot patterns — NOT taken
- AGENTS.md on branch is older/less complete — NOT taken
- QWEN.md deletion on branch — NOT taken (parallel-work preservation policy)
- Tools (README, cv_gap_analysis, cv_hook_scan) on HEAD are larger — NOT taken from branch

Changes applied from codex/wip-gamecontainer-remediation:
- src/frontend/src/pages/OddOneOut.tsx: Added isRunning + coordinateSpace="normalized" + containerRef
- src/frontend/src/pages/PopTheNumber.tsx: Normalized bounds check (0-1 range) + pinch state detection
- src/frontend/src/pages/SizeSorting.tsx: Added isRunning=Boolean(activeRound) + normalized cursor
- src/frontend/src/pages/WordBuilder.tsx: Better UX feedback messages + auto-start + motion.div animations
- src/frontend/src/pages/NumberBubblePop.tsx: Auto-start + normalized coords + coordinateSpace="normalized"
- src/frontend/src/pages/BubblePop.tsx: Added hand tracking (CursorEmbodiment + useGameHandTracking)
- src/frontend/src/pages/ColorByNumber.tsx: Auto-start tracking on game begin + startTracking hook
- src/frontend/src/pages/NumberTracing.tsx: checkStrokeCompletion refactor + improvements
- src/frontend/src/games/wordBuilderLogic.ts: TARGET_SIZE-based column calculation for grid layout
- src/frontend/src/services/progressQueue.ts: Remove self-import + add optional config to ApiClient.post + fix processItemWithRetry to use apiClient.post
- src/frontend/src/hooks/useHandInteraction.ts: Normalized coordinate comparison (container-relative bounds check)

Files NOT taken from codex/wip-midline-violator (HEAD already better or regression risk):
- .github/workflows/merge-readiness-gate.yml: Branch removes 4-bot patterns → SKIP
- .github/workflows/pr-comment-gate.yml: Branch removes 4-bot patterns → SKIP
- .githooks/pre-push: Branch removes security checks (disallowed overrides, non-FF detection) → SKIP
- AGENTS.md: Branch has older/less complete version → SKIP
- QWEN.md: Branch deletes file → SKIP (parallel-work policy)
- All game pages: HEAD is larger/more complete than branch → SKIP
- All game registries: HEAD has previewImage fields and more entries that branch is missing → SKIP
- scripts/agent_gate.sh etc: HEAD is more comprehensive → SKIP

Evidence:
- Command: cd src/frontend && npx tsc --noEmit → exit 0 (clean)

Prompt Trace: branch recovery agent
