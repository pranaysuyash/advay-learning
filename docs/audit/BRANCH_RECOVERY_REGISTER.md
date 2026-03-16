# Branch Recovery Register
<!-- Canonical tracker for all branch recovery decisions. Append-only for accepted/rejected findings. -->
<!-- TCK-20260316-004 -->

**Generated**: 2026-03-16  
**Auditor**: Copilot (Branch Recovery Agent)  
**Current PR**: #53 `codex/wip-utility-tools-merge` — "chore: Add utility scripts and update workflows"  
**Target branch for recovery**: `codex/wip-utility-tools-merge`

---

## 1. Branch Inventory

| Branch | Local/Remote | Status vs main | Status vs PR #53 | Main purpose | Risk | Inspect? |
|--------|-------------|----------------|------------------|--------------|------|----------|
| `codex/wip-utility-tools-merge` | Both | 10 ahead | — (IS the PR) | PR #53: tools/ review utilities, workflow bot exclusions | — | Current |
| `backup/codex-wip-utility-tools-merge-before-nitpick-20260316` | Local only | 10 ahead | **0 diff from PR** | Snapshot taken before today's nitpick session | None | No — identical to PR |
| `backup/codex-wip-utility-tools-merge-pre-squash-20260316` | Local only | Diverged | **11 files different from PR** | Snapshot before squash: has BETTER scripts and tools | Medium | **YES — has recovered quality** |
| `codex/wip-agents-md-utility-guide` | Local | 0 diff from main | n/a | Empty locally (same as main) | None | No — empty locally |
| `origin/codex/wip-agents-md-utility-guide` | Remote only | 15 commits ahead | 39 files different | PR #52 (CLOSED): game source improvements, hook changes | High (scope creep) | **YES — out-of-scope but has non-trivial content** |
| `codex/wip-all-better-code` | Both | 2 commits ahead | Already merged in | PR #54 (CLOSED): consolidated source improvements | None | No — already in PR |
| `codex/wip-review-thread-tools` | Remote | 1 commit ahead | Already in PR | PR #51 (CLOSED): review thread tools | None | No — already in PR |
| `codex/wip-gamecontainer-remediation` | Local | Diverged (squash merged as PR #50) | Large diff (misleading) | PR #50 (MERGED): GameContainer remediation — content IS in main via squash | Low | **No — content confirmed in main** |
| `codex/wip-midline-violator` | Local only | Diverged | 1 unique commit (d1f73f7) | GameContainer type fixes — same content as main (squash merged via PR #50) | None | No — content in main |
| `wip-preview-recovery-rotation-v4` | Local only | 0 diff from main | 0 diff | Empty — no content vs main | None | No — identical to main |
| `stash@{0}` | Local stash | On current branch | Minor differences | `.agent/AGENT_KICKOFF_PROMPT.txt` multi-modal vision note; CV guide small fix | Low | **YES — additive content** |
| `stash@{1}` | Local stash | On `codex/wip-app-tsx-audit` | Unrelated branch | Separate audit branch work — not touching | High | No — different branch/scope |

---

## 2. Comparison Method

All comparisons use:
- `git diff --stat A...B` (three-dot: changes from merge-base to B)
- `git diff --name-only A...B` (file-level discovery)
- `git log --oneline A..B` (commits unique to B not reachable from A)
- `git merge-base --is-ancestor COMMIT BRANCH` (to verify if content is in target)
- `git diff A B -- file` (two-dot: file-level content check between tips)

**Key clarification on `codex/wip-gamecontainer-remediation`**:  
`git diff --stat main...gamecontainer-remediation` showed 13,919 insertions, which appears alarming. However this is a three-dot artifact showing what the branch contributed *from its merge-base perspective*. Confirmed via `git diff main gamecontainer-remediation -- GameContainer.tsx` → **empty diff**: content is in main. PR #50 was merged as a squash merge, so the individual commit `d1f73f7` is not an ancestor of main but the code content is identical.

---

## 3. Recovery Findings Register

### BR-001 — `tools/cv_gap_analysis.py`: eval() → ast.literal_eval() security fix
**Source**: `backup/codex-wip-utility-tools-merge-pre-squash-20260316`  
**Category**: security, reliability  
**Files**: `tools/cv_gap_analysis.py`  
**What pre-squash has**: Replaces `eval(cv_str)` with `ast.literal_eval()` (prevents arbitrary code execution). Also adds markdown code-block stripping, robust fallback regex parsing, and multi-path file resolution (handles absolute vs relative paths, tries multiple locations).  
**What current PR has**: `eval(cv_str)` — an active security vulnerability. File path handling is incomplete (broken in CI/automation environments).  
**Relationship**: Better on pre-squash branch  
**Why it matters**: `eval()` on untrusted data is a CVE-class vulnerability. The tool is run in pre-commit hooks and CI. Additionally, path resolution is broken in the current PR version, making the tool non-functional outside developer workstation.  
**Confidence**: Observed (direct diff)  
**Recovery difficulty**: Trivial port (checkout single file)  
**Decision**: ✅ **KEEP AS-IS from pre-squash** (replace in PR)  
**Priority**: **P0**  

---

### BR-002 — `tools/cv_hook_scan.py`: static audit-file parser → dynamic registry scan
**Source**: `backup/codex-wip-utility-tools-merge-pre-squash-20260316`  
**Category**: tooling, reliability  
**Files**: `tools/cv_hook_scan.py`  
**What pre-squash has**: Complete rewrite. Scans `src/frontend/src/data/gameRegistries/*.ts` dynamically using regex. Has proper shebang, module docstring, intelligent component-to-file path matching, markdown output with ✅/❌ status indicators. Future-proof: works for new games without manual updates.  
**What current PR has**: Parses a hardcoded static audit markdown table (`docs/audit/CONTROL_MODE_AUDIT_2026-03-12.md`). That file may not exist in all environments. Tool silently produces no output if file is missing.  
**Relationship**: Better on pre-squash branch — fundamentally different approach  
**Why it matters**: The current version depends on a stale audit file; the pre-squash version is self-maintaining. Any new game added to registries is automatically picked up.  
**Confidence**: Observed (direct diff + code inspection)  
**Recovery difficulty**: Trivial port (checkout single file)  
**Decision**: ✅ **KEEP AS-IS from pre-squash** (replace in PR)  
**Priority**: **P0**  

---

### BR-003 — `scripts/regression_check.sh`: block bypass flags
**Source**: `backup/codex-wip-utility-tools-merge-pre-squash-20260316`  
**Category**: security, reliability  
**Files**: `scripts/regression_check.sh`  
**What pre-squash has**: `SKIP_REGRESSION_TESTS` and `SKIP_EXPORT_CHECK` env vars now trigger `exit 2` with a policy error message ("Bypass is disabled by repo policy. Resolve failing tests instead of bypassing."). Docs updated to "No bypass flags are supported."  
**What current PR has**: `SKIP_REGRESSION_TESTS=1` silently skips test execution; `SKIP_EXPORT_CHECK=1` silently skips export checking. Agents and developers can bypass these critical gates.  
**Relationship**: Better on pre-squash (stricter)  
**Why it matters**: Bypass flags invite agents to skip failing tests rather than fixing them. AGENTS.md principle: "agent who encounters a failing issue must resolve it before commit/push."  
**Confidence**: Observed  
**Recovery difficulty**: Trivial port  
**Decision**: ✅ **KEEP AS-IS from pre-squash**  
**Priority**: **P0**  

---

### BR-004 — `scripts/secret_scan.sh`: block SKIP_SECRET_SCAN bypass
**Source**: `backup/codex-wip-utility-tools-merge-pre-squash-20260316`  
**Category**: security  
**Files**: `scripts/secret_scan.sh`  
**What pre-squash has**: `SKIP_SECRET_SCAN` env var now triggers `die()` with policy message. If anyone sets `SKIP_SECRET_SCAN=anything` (not just =1), the scan is blocked with an error.  
**What current PR has**: `SKIP_SECRET_SCAN=1` silently exits 0, bypassing secret detection entirely.  
**Relationship**: Better on pre-squash  
**Why it matters**: A bypassed secret scan is worse than no scan. Any committed secret could persist indefinitely.  
**Confidence**: Observed  
**Recovery difficulty**: Trivial port (3-line change)  
**Decision**: ✅ **KEEP AS-IS from pre-squash**  
**Priority**: **P0**  

---

### BR-005 — `scripts/maintainability_guard.sh`: block bypass flag
**Source**: `backup/codex-wip-utility-tools-merge-pre-squash-20260316`  
**Category**: reliability  
**Files**: `scripts/maintainability_guard.sh`  
**What pre-squash has**: `SKIP_MAINTAINABILITY_CHECK` triggers error exit. Error messages updated to say "Bypass is disabled. Fix the file or adjust MAX_FILE_LOC/MAX_FILE_BYTES/MAX_FILE_CCN thresholds with justification."  
**What current PR has**: `SKIP_MAINTAINABILITY_CHECK=1` exits 0 silently.  
**Relationship**: Better on pre-squash  
**Why it matters**: Consistent with the repo's policy of no bypass flags for quality gates. Thresholds can still be tuned via env vars — the bypass of the entire check cannot.  
**Confidence**: Observed  
**Recovery difficulty**: Trivial port  
**Decision**: ✅ **KEEP AS-IS from pre-squash**  
**Priority**: **P0**  

---

### BR-006 — `scripts/agent_gate.sh`: `read_added_lines_from_target()` + worklog phrasing gate
**Source**: `backup/codex-wip-utility-tools-merge-pre-squash-20260316`  
**Category**: reliability, tooling  
**Files**: `scripts/agent_gate.sh`  
**What pre-squash has**:  
  1. New helper `read_added_lines_from_target()` — extracts only newly-added lines from a file, supporting both `--staged` and commit-hash modes. Needed for the next item.  
  2. Worklog validation gate: detects "pre-existing/unrelated failure" phrasing in worklog addendum additions and blocks the commit with error: "In this repo, the agent who encounters a failing issue must resolve it before commit/push."  
  3. Sidecar check refactored to always run (removes the early `ALLOW_REFACTORED_SIDE_CARS` escape hatch from the outer `if`), with cleaner error messages.  
**What current PR has**: No worklog phrasing validation. Sidecar checks are wrapped in `ALLOW_REFACTORED_SIDE_CARS=1` guard that allows the entire check to be skipped.  
**Relationship**: Better on pre-squash  
**Why it matters**: The worklog gate directly enforces AGENTS.md principle against agents claiming issues are "pre-existing/unrelated." Without it, agents can commit while documenting that failing tests were "pre-existing."  
**Confidence**: Observed  
**Recovery difficulty**: Selective port (the two additions are cleanly separable)  
**Decision**: ✅ **KEEP AS-IS from pre-squash**  
**Priority**: **P1**  

---

### BR-007 — `AGENTS.md` policy table: bypass-flag column → None
**Source**: `backup/codex-wip-utility-tools-merge-pre-squash-20260316`  
**Category**: docs  
**Files**: `AGENTS.md`  
**What pre-squash has**: The "What is Enforced at Commit Time" table's "Skip Flag" column now shows `None` for Secret Scan, Maintainability, and Regression, with table formatting aligned. Removes guidance on `SKIP_SECRET_SCAN=1` etc.  
**What current PR has**: Table lists `SKIP_SECRET_SCAN=1`, `SKIP_MAINTAINABILITY_CHECK=1`, `SKIP_REGRESSION_CHECK=1` as valid skip flags, which is now misleading since the scripts block them.  
**Relationship**: Better on pre-squash (documentation matches the code)  
**Why it matters**: If docs say bypass flags exist but the scripts reject them with exit 2, agents will waste time trying to use them and get confusing errors.  
**Confidence**: Observed  
**Recovery difficulty**: Selective port (table only)  
**Decision**: ✅ **ADAPT INTO CURRENT BRANCH**  
**Priority**: **P1**  

---

### BR-008 — `stash@{0}`: `.agent/AGENT_KICKOFF_PROMPT.txt` multi-modal vision note
**Source**: `stash@{0}` on `codex/wip-utility-tools-merge`  
**Category**: docs  
**Files**: `.agent/AGENT_KICKOFF_PROMPT.txt`  
**What stash has**: Adds critical priority block: "This is a MULTI-MODAL VISION PLATFORM. Every game MUST use camera-based CV controls (hand, face, pose, or voice). The `cv: [...]` field in gameRegistry.ts defines what each game requires. When adding or modifying games, CV integration is Step 1, NOT an afterthought. See AGENTS.md section 'MULTI-MODAL VISION PLATFORM' for full rules."  
**What current PR has**: No such note in the kickoff prompt.  
**Relationship**: Missing in PR  
**Why it matters**: This note would appear at the START of every agent session, preventing agents from implementing games without CV controls. Core architectural guardrail.  
**Confidence**: Observed  
**Recovery difficulty**: Trivial port (6-line addition)  
**Decision**: ✅ **KEEP AS-IS from stash**  
**Priority**: **P1**  

---

### BR-009 — `origin/codex/wip-agents-md-utility-guide`: `useHandInteraction.ts` collision simplification
**Source**: `origin/codex/wip-agents-md-utility-guide` (PR #52, CLOSED)  
**Category**: refactor, reliability  
**Files**: `src/frontend/src/hooks/useHandInteraction.ts`  
**What PR #52 has**: Eliminates the complex `isOverTargetNormalized` useMemo (38 lines → 10 lines). Separates the coordinate transform (`cursorPoint` useMemo) from the hit-test (done inline in useEffect). Removes redundant window-normalized fallback path. Cleaner, fewer dependencies.  
**What current PR/main has**: A 38-line useMemo doing both coordinate transform and hit-test in one pass, with a fallback for when no `containerRef` is present.  
**Relationship**: Implemented differently — PR #52 is more modular  
**Why it matters**: The current code has a dead code path (window-normalized fallback that no callers use). PR #52 removes it. However this is outside PR #53's scope.  
**Risks**: Unknown if any callers depend on the window-normalized fallback (the `!containerRef` branch). Needs call-site audit before porting.  
**Confidence**: Observed (diff shows logic change)  
**Recovery difficulty**: Needs adaptation (call-site audit required)  
**Decision**: 🔶 **DEFER** — separate PR, needs call-site audit  
**Priority**: **P2**  

---

### BR-010 — `origin/codex/wip-agents-md-utility-guide`: `useGameHandTracking.ts` default mode change
**Source**: `origin/codex/wip-agents-md-utility-guide` (PR #52, CLOSED)  
**Category**: bugfix (possibly) or regression (possibly)  
**Files**: `src/frontend/src/hooks/useGameHandTracking.ts`  
**What PR #52 has**: `return params.requestedMode ?? 'main-thread'` — defaults hand tracking to main thread when `requestedMode` is unspecified.  
**What current PR/main has**: `return params.requestedMode ?? 'worker'` with comment "Default to worker when supported and enabled (as documented)."  
**Relationship**: Conflicting — opposing defaults  
**Why it matters**: Defaulting to 'worker' offloads MediaPipe to a Web Worker (better perf). Defaulting to 'main-thread' runs it on the UI thread (may cause frame drops). Changing this silently could cause performance regressions in all CV games.  
**Risks**: HIGH. This is a system-wide behavioral change affecting every game using hand tracking. No commit message context available to understand intent.  
**Confidence**: Observed (diff), but intent Unknown  
**Recovery difficulty**: Needs adaptation (intent must be verified first)  
**Decision**: 🔶 **DEFER** — investigate intent before touching  
**Priority**: **P3 until clarified**  

---

### BR-011 — `origin/codex/wip-agents-md-utility-guide`: game page simplifications (BubblePop, ColorByNumber, etc.)
**Source**: `origin/codex/wip-agents-md-utility-guide` (PR #52, CLOSED)  
**Category**: refactor  
**Files**: `BubblePop.tsx`, `ColorByNumber.tsx`, `LetterHunt.tsx`, `NumberTracing.tsx`, `WordBuilder.tsx`, `NumberBubblePop.tsx`, `OddOneOut.tsx`, `PopTheNumber.tsx`, `SizeSorting.tsx`  
**What PR #52 has**: Net LOC reduction across 9 game pages (1,334 deletions vs 843 insertions). BubblePop removes `gameAreaRef` and `cursor` state. NumberTracing expanded (+68 lines vs main). Games appear to be simplifying or removing unused hand-tracking state.  
**What current PR/main has**: Fuller implementations with more state management.  
**Relationship**: Partially overlapping, complex  
**Why it matters**: The simplifications may remove dead state (good), or may remove needed state that was just temporarily unused (bad). Each page needs individual evaluation.  
**Risks**: Cannot evaluate without running the games. Some simplifications may be correct, others may be regressions.  
**Confidence**: Observed (diff sizes), but quality Unknown  
**Recovery difficulty**: Needs adaptation per page  
**Decision**: 🔶 **DEFER** — needs game-by-game UX testing in separate PR  
**Priority**: **P3**  

---

### BR-012 — `origin/codex/wip-agents-md-utility-guide`: `labOfWonders.ts` game entry removals
**Source**: `origin/codex/wip-agents-md-utility-guide` (PR #52, CLOSED)  
**Category**: cleanup  
**Files**: `src/frontend/src/data/gameRegistries/labOfWonders.ts`  
**What PR #52 has**: Removes multiple game registry entries including `earth-time-machine`, `bubble-biology`, and others. 471 total line changes.  
**What current PR/main has**: These games are in the registry.  
**Relationship**: Conflicting — registry entries removed  
**Why it matters**: Removing registry entries hides games from the game catalog. If the games have no implementation, removal is correct cleanup. If they have implementations, this breaks routing.  
**Risks**: Unknown if games have implementations. Needs verification.  
**Confidence**: Observed (diff shows removal), intent Unknown  
**Recovery difficulty**: Needs re-implementation (verify each removed game)  
**Decision**: 🔴 **DEFER** until game implementations verified  
**Priority**: **P3**  

---

### BR-013 — `backup/codex-wip-utility-tools-merge-pre-squash-20260316`: `merge-readiness-gate.yml` bot pattern regression
**Source**: `backup/codex-wip-utility-tools-merge-pre-squash-20260316`  
**Category**: regression  
**Files**: `.github/workflows/merge-readiness-gate.yml`  
**What pre-squash has**: Removes `copilot-pull-request-reviewer` and `chatgpt-codex-connector` from the bot patterns list. Bot patterns become only `['[bot]', 'github-advanced-security']`.  
**What current PR has**: Bot patterns include `['[bot]', 'github-advanced-security', 'copilot-pull-request-reviewer', 'chatgpt-codex-connector']` — correctly excluding these AI reviewers from unresolved-thread blocking.  
**Relationship**: Worse on pre-squash  
**Why it matters**: Removing these patterns would cause the merge-readiness gate to BLOCK PRs that have unresolved Copilot or ChatGPT review threads, including threads that agents cannot resolve. This is a regression that would break the PR workflow.  
**Confidence**: Observed — this is clearly a regression  
**Decision**: 🔴 **REJECT** — do not port this change  
**Notes**: The current PR's version is correct per repo memory: "Merge/readiness gates treat authors containing '[bot]', 'github-advanced-security', 'copilot-pull-request-reviewer', and 'chatgpt-codex-connector' as bots."  

---

### BR-014 — `wip-preview-recovery-rotation-v4`: no content
**Source**: `wip-preview-recovery-rotation-v4` (local)  
**Category**: n/a  
**Evidence**: `git diff --stat main...wip-preview-recovery-rotation-v4` → empty. `git log main..wip-preview-recovery-rotation-v4` → empty. Branch tip = main tip.  
**Decision**: 🔴 **REJECT** — identical to main, nothing to recover  

---

### BR-015 — `stash@{1}`: unrelated branch (wip-app-tsx-audit)
**Source**: `stash@{1}` on `codex/wip-app-tsx-audit`  
**Category**: n/a  
**Evidence**: Stash description: "WIP on codex/wip-app-tsx-audit: 3f9f28e feat: add log sanitization to consent.py"  
**Decision**: 🔴 **OUT OF SCOPE** — belongs to a different branch and task. Do not touch.  

---

## 4. Prioritization Matrix

| ID | Finding | Impact | Bug risk | UX | Arch | Effort | Conflict | Confidence | Priority |
|----|---------|--------|----------|-----|------|--------|----------|------------|----------|
| BR-001 | cv_gap_analysis eval() security fix | High | High | Low | Low | Trivial | None | Observed | **P0** |
| BR-002 | cv_hook_scan dynamic rewrite | Medium | Medium | Low | Medium | Trivial | None | Observed | **P0** |
| BR-003 | regression_check bypass block | Medium | High | Low | Low | Trivial | None | Observed | **P0** |
| BR-004 | secret_scan bypass block | High | High | Low | Low | Trivial | None | Observed | **P0** |
| BR-005 | maintainability bypass block | Medium | Medium | Low | Low | Trivial | None | Observed | **P0** |
| BR-006 | agent_gate worklog validation | Medium | Medium | Low | Low | Selective | Low | Observed | **P1** |
| BR-007 | AGENTS.md policy table fix | Low | Low | Low | Low | Trivial | None | Observed | **P1** |
| BR-008 | AGENT_KICKOFF multi-modal note | Medium | Low | Low | Medium | Trivial | None | Observed | **P1** |
| BR-009 | useHandInteraction simplification | Low | Low | Low | Medium | Adaptation | Medium | Observed | **P2** |
| BR-010 | useGameHandTracking default mode | Unknown | High | High | High | Adaptation | High | Observed+Unknown | **P3** |
| BR-011 | Game page simplifications | Unknown | Medium | Medium | Low | Adaptation | Medium | Observed | **P3** |
| BR-012 | labOfWonders.ts game removals | Unknown | High | High | Medium | Re-implement | High | Unknown | **P3** |
| BR-013 | merge-readiness-gate regression | Negative | N/A | N/A | N/A | N/A | N/A | Observed | **REJECT** |
| BR-014 | wip-preview-rotation-v4 empty | N/A | N/A | N/A | N/A | N/A | N/A | Observed | **REJECT** |
| BR-015 | stash@{1} unrelated branch | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **OUT OF SCOPE** |

### Quick Wins (P0, trivial port)
- BR-001, BR-002, BR-003, BR-004, BR-005 — all file-level checkouts from pre-squash backup

### High-Risk Recoveries
- BR-010 — useGameHandTracking default mode: affects all CV games system-wide. Unknown intent.
- BR-012 — labOfWonders game removals: could break game routing if implementations exist.

### Hidden Gems
- BR-006 — agent_gate worklog phrasing gate: subtle but powerful. Catches agents claiming pre-existing failures.
- BR-002 — cv_hook_scan rewrite: v1 (current) is broken if the audit markdown file moves. v2 (pre-squash) is self-maintaining.

### False Friends
- BR-013 — merge-readiness-gate.yml in pre-squash: looks like a simplification but is actually a regression that would break the PR gate for Copilot/ChatGPT review threads.
- BR-003/BR-004/BR-005 — "bypass removal" might seem risky, but this is intended policy: AGENTS.md already says agents must resolve failures, not bypass them.

---

## 5. Recommended Recovery Units

### UNIT-1: Restore pre-squash script/tool quality (P0 + P1)
**Findings covered**: BR-001, BR-002, BR-003, BR-004, BR-005, BR-006, BR-007  
**Source**: `backup/codex-wip-utility-tools-merge-pre-squash-20260316`  
**Goal**: Replace the squash-degraded versions of 6 scripts/tools with their better pre-squash versions. Update AGENTS.md policy table for consistency.  
**Files**:
- `tools/cv_gap_analysis.py` — checkout from pre-squash
- `tools/cv_hook_scan.py` — checkout from pre-squash
- `scripts/regression_check.sh` — checkout from pre-squash
- `scripts/secret_scan.sh` — checkout from pre-squash
- `scripts/maintainability_guard.sh` — checkout from pre-squash
- `scripts/agent_gate.sh` — checkout from pre-squash
- `AGENTS.md` — selective port (policy table columns only)
**NOT included**: `.github/workflows/merge-readiness-gate.yml` (regression in pre-squash, REJECT)  
**Tests to run**: `bash scripts/agent_gate.sh --staged`, `bash scripts/secret_scan.sh --staged`  
**Docs to update**: `docs/WORKLOG_ADDENDUM_2026-03-15.md` (append recovery entry)  
**Risks**: Bypass flag removal makes gates stricter. Agents/devs cannot skip these checks. Intended.  
**In scope**: scripts/, tools/ improvements from pre-squash  
**Out of scope**: Any source code changes from PR #52; merge-readiness-gate.yml

### UNIT-2: Restore .agent/AGENT_KICKOFF_PROMPT.txt (P1)
**Findings covered**: BR-008  
**Source**: `stash@{0}`  
**Goal**: Add multi-modal vision platform note to kickoff prompt  
**Files**: `.agent/AGENT_KICKOFF_PROMPT.txt`  
**Tests**: Manual review  
**Risks**: None — additive documentation  
**Status**: PENDING (after UNIT-1)

### UNIT-3: Investigate and defer PR #52 source changes (P2–P3)
**Findings covered**: BR-009, BR-010, BR-011, BR-012  
**Goal**: Open tracking ticket(s) for deferred evaluation; do not bring into current PR  
**Action**: Create worklog entries documenting these deferrals; do not modify source  
**Status**: PENDING

---

## 6. Red Flags and Uncertainties

1. **PR #50 squash merge**: PR shows as MERGED but `d1f73f7` is not an ancestor of main. Content is in main but individual commit lineage is broken. This is not harmful but future `git bisect` operations will be impaired.

2. **PR #52 (CLOSED, not merged)**: Has 15 commits of source code work that is not in main or any open PR. Some of this may be intentionally abandoned; some may be valuable. The `useGameHandTracking` default-mode change (BR-010) has no commit message context available in this audit — its intent is Unknown and risk is High.

3. **Pre-squash backup's merge-readiness-gate.yml regression**: An earlier consolidation agent appears to have introduced a bot-pattern regression that was caught during the nitpick phase. The pre-squash backup preserves this regression. This is the reason the "before-nitpick" backup exists — the nitpick correctly removed it. **Do not re-introduce this.**

4. **Script bypass removal may break CI**: If any existing CI workflows use `SKIP_REGRESSION_TESTS=1` or `SKIP_SECRET_SCAN=1`, they will fail with exit code 2 after UNIT-1. Check CI workflows for these env vars before merging.

---

## 7. Status Tracking

| ID | Finding | Decision | Unit | Status | Notes |
|----|---------|----------|------|--------|-------|
| BR-001 | cv_gap_analysis security fix | KEEP from pre-squash | UNIT-1 | 🔴 PENDING | P0 — security |
| BR-002 | cv_hook_scan dynamic rewrite | KEEP from pre-squash | UNIT-1 | 🔴 PENDING | P0 |
| BR-003 | regression_check bypass block | KEEP from pre-squash | UNIT-1 | 🔴 PENDING | P0 |
| BR-004 | secret_scan bypass block | KEEP from pre-squash | UNIT-1 | 🔴 PENDING | P0 |
| BR-005 | maintainability bypass block | KEEP from pre-squash | UNIT-1 | 🔴 PENDING | P0 |
| BR-006 | agent_gate worklog gate | KEEP from pre-squash | UNIT-1 | 🔴 PENDING | P1 |
| BR-007 | AGENTS.md policy table | ADAPT | UNIT-1 | 🔴 PENDING | P1 |
| BR-008 | AGENT_KICKOFF multi-modal | KEEP from stash | UNIT-2 | 🔴 PENDING | P1 |
| BR-009 | useHandInteraction simplification | DEFER | UNIT-3 | 📋 DEFERRED | Needs call-site audit |
| BR-010 | useGameHandTracking default mode | DEFER | UNIT-3 | 📋 DEFERRED | Intent unknown, high risk |
| BR-011 | Game page simplifications | DEFER | UNIT-3 | 📋 DEFERRED | Needs game testing |
| BR-012 | labOfWonders game removals | DEFER | UNIT-3 | 📋 DEFERRED | Needs implementation verification |
| BR-013 | merge-readiness-gate regression | REJECT | — | ✅ REJECTED | Confirmed regression |
| BR-014 | wip-preview-rotation-v4 | REJECT | — | ✅ REJECTED | Identical to main |
| BR-015 | stash@{1} unrelated branch | OUT OF SCOPE | — | ✅ REJECTED | Different branch |
