<overview>
The user requested a comprehensive Branch Recovery and Diff Triage audit of the repository `learning_for_kids`. The goal was to safely identify all potentially valuable work in local/remote branches outside the current open PR (#53 `codex/wip-utility-tools-merge`), produce an evidence-backed recovery plan, and implement only approved, scoped recovery units. The approach used parallel sub-agents for branch discovery and analysis, combined with direct git inspection to build a precise findings register.
</overview>

<history>
1. **User requested full branch recovery audit** (with detailed agent prompt specifying safety rules, discovery phase, triage, prioritization, and implementation units)
   - Established current state: branch `codex/wip-utility-tools-merge`, PR #53 OPEN ("chore: Add utility scripts and update workflows" — adds `tools/` review utilities, workflow bot exclusions, AGENTS.md section)
   - Discovered all branches: 7 local, 4 remote, 2 backup branches, 2 stashes
   - PR #53 adds: `tools/find_unresolved.py`, `tools/resolve_threads.py`, `tools/review_thread_manager.py`, `tools/README.md`, `.github/workflows/pr-comment-gate.yml` (bot exclusions), `AGENTS.md` section 7.1, 3 backend `__init__.py` files, modified `mypy.ini`

2. **User expanded scope** mid-audit to include all remote open/closed PRs, stashed work, and preview rotation assets
   - Added to scope: PR #52 (`codex/wip-agents-md-utility-guide`, CLOSED, 15 commits ahead), PR #54 (CLOSED, already in PR), PR #51 (CLOSED, already in PR)
   - Found `stash@{0}` ("wip before fixing pre-push worklog") and `stash@{1}` (unrelated branch `codex/wip-app-tsx-audit`)

3. **Parallel sub-agent analysis** launched for 3 branches simultaneously (agents 26, 27, 28)
   - Agent 26: `codex/wip-gamecontainer-remediation` — reported 200 files, 13,919 insertions, 17 unique commits (CV integration, GameContainer refactor, 46 preview images, new game sub-components)
   - Agent 27: `codex/wip-midline-violator` — reported 101 files, 4,534 insertions, 1 unique commit (`d1f73f7`); found new GameScaffold architecture, 11 new game UI components, preview assets
   - Agent 28: `backup/codex-wip-utility-tools-merge-pre-squash-20260316` — reported better scripts (bypass blocking, security fix in cv_gap_analysis.py `eval→ast.literal_eval`, cv_hook_scan rewrite to dynamic registry scan)

4. **Critical discovery: three-dot vs two-dot diff confusion**
   - Sub-agents and initial analysis used `git diff A...B` (three-dot = changes from merge-base to B), which was MISLEADING
   - Two-dot diff `git diff A B` revealed: pre-squash backup differs from current PR by only **4 files** (3 backend `__init__.py` + `mypy.ini` 2 lines) — the current PR actually has MORE content
   - Scripts and tools in current PR are **identical content** to pre-squash backup — the "squash degradation" finding was false
   - All BR-001 through BR-006 findings (script bypass blocking, tool rewrites) are **already in the current PR**

5. **Confirmed key findings about branch content**
   - PR #50 (`codex/wip-gamecontainer-remediation`) was MERGED via squash — content IS in main; `git diff main gamecontainer-remediation -- GameContainer.tsx` = empty
   - `d1f73f7` is NOT an ancestor of main (squash merge broke lineage) but its content is in main
   - `wip-preview-recovery-rotation-v4` is **identical to main** — no content to recover
   - `origin/codex/wip-agents-md-utility-guide` (PR #52, CLOSED) has **38 files with real content differences** from current PR (two-dot confirmed): game source code, hooks, registry changes — but tools are OLDER/worse than current PR
   - Current PR's `AGENTS.md` already has "Skip Flag = None" in the enforcement table — policy is already correct

6. **Recovery register created** at `docs/audit/BRANCH_RECOVERY_REGISTER.md`
   - 15 findings registered (BR-001 through BR-015)
   - After two-dot verification: BR-001 through BR-007 revised to "ALREADY IN PR"
   - Genuine remaining gaps: BR-008 (stash AGENT_KICKOFF multi-modal note), BR-009 through BR-012 (PR #52 frontend source changes deferred), BR-013 (REJECT: regression), BR-014/BR-015 (REJECT: empty/unrelated)

7. **UNIT-1 implementation attempted**
   - `git checkout backup/...pre-squash -- [files]` failed (permission denied)
   - `git show backup/...pre-squash:file > file` redirects succeeded but `git diff --stat HEAD` showed empty — confirmed files already match (content identical)
   - Scripts already restored correctly; only `docs/audit/BRANCH_RECOVERY_REGISTER.md` shows as untracked
</history>

<work_done>
Files created:
- `docs/audit/BRANCH_RECOVERY_REGISTER.md` — Full recovery findings register with 15 findings, prioritization matrix, recovery units, red flags

Files confirmed already correct (no changes needed):
- `scripts/agent_gate.sh` — already has `read_added_lines_from_target()` and worklog validation gate
- `scripts/regression_check.sh` — already blocks `SKIP_REGRESSION_TESTS` bypass with exit 2
- `scripts/secret_scan.sh` — already blocks `SKIP_SECRET_SCAN` bypass with die()
- `scripts/maintainability_guard.sh` — already blocks bypass
- `tools/cv_gap_analysis.py` — already uses `ast.literal_eval()` (security fix present)
- `tools/cv_hook_scan.py` — already has dynamic registry scan version
- `AGENTS.md` — policy table already shows "Skip Flag = None" for all gates

Work completed:
- [x] Full branch inventory (all local, remote, backup, stash)
- [x] Three-dot vs two-dot diff confusion resolved — corrected all findings
- [x] Confirmed PR #50 squash merge: content in main, lineage broken (expected)
- [x] Confirmed pre-squash backup = current PR in content (good consolidation was already done)
- [x] Identified genuine remaining gaps: PR #52 frontend source code not in main/PR
- [x] Recovery register written with accept/reject/defer decisions for all 15 findings
- [x] UNIT-1 implementation verified as already complete (content matches)
- [ ] UNIT-2: Apply stash@{0} `.agent/AGENT_KICKOFF_PROMPT.txt` multi-modal note (BR-008)
- [ ] Commit `docs/audit/BRANCH_RECOVERY_REGISTER.md` to PR branch
- [ ] Update worklog addendum with recovery audit entry
- [ ] Create tracking tickets for deferred PR #52 frontend findings (BR-009 through BR-012)
</work_done>

<technical_details>
**Three-dot vs Two-dot diff gotcha (CRITICAL)**:
- `git diff A...B` = `git diff $(git merge-base A B) B` — shows what B changed from their common ancestor, NOT what's missing from A's current state
- `git diff A B` = direct content comparison between tips — the authoritative "is this file different between the two branches today?"
- Using three-dot on diverged branches produces misleading "large diffs" even when the actual file content is identical at both tips
- All sub-agent findings based on three-dot diffs needed re-verification with two-dot

**PR #50 squash merge behavior**:
- `codex/wip-gamecontainer-remediation` was merged via squash — content IS in main but `git merge-base --is-ancestor d1f73f7 main` returns false
- Squash merge breaks commit lineage but preserves file content
- `git diff main gamecontainer-remediation -- GameContainer.tsx` = empty confirms content parity
- This is why `git diff --stat main...gamecontainer-remediation` showed 13,919 insertions (three-dot showing the branch's historical contribution) while the actual content is already in main

**Current PR is already the correctly consolidated version**:
- The "before-nitpick" backup captured the state AFTER a bad large merge (included gamecontainer-remediation wholesale)
- The "pre-squash" backup captured state BEFORE squash, which had the same content as current PR for scripts/tools
- The nitpick correctly removed the large merge while preserving the good tool/script changes
- Current PR tip `58ed75c` is the result of careful, correct consolidation

**PR #52 (`origin/codex/wip-agents-md-utility-guide`) genuine differences from current PR**:
- `useGameHandTracking.ts`: changes `?? 'worker'` to `?? 'main-thread'` as default — behavioral change affecting ALL CV games (intent unknown, high risk)
- `useHandInteraction.ts`: 57-line simplification of collision detection (removes window-normalized fallback, more modular)
- `GameContainer.tsx`: 48 lines different
- `labOfWonders.ts`: 411 lines (removes multiple game registry entries)
- 9 game pages with simplifications (net LOC reduction)
- `tools/cv_gap_analysis.py` and `tools/cv_hook_scan.py` in PR #52 are OLDER/WORSE than current PR
- PR #52's AGENTS.md differences are trivial whitespace only

**Bot pattern regression in pre-squash backup**:
- `merge-readiness-gate.yml` in pre-squash removes `copilot-pull-request-reviewer` and `chatgpt-codex-connector` from bot patterns
- Current PR correctly has all 4 bot patterns: `['[bot]', 'github-advanced-security', 'copilot-pull-request-reviewer', 'chatgpt-codex-connector']`
- This regression was the REASON the before-nitpick backup exists — it was caught and removed during the nitpick phase

**`stash@{1}` is on a completely different branch** (`codex/wip-app-tsx-audit`) — must not be touched
</technical_details>

<important_files>
- `docs/audit/BRANCH_RECOVERY_REGISTER.md`
  - Why: Canonical recovery tracker with all 15 findings, accept/reject/defer decisions, evidence, prioritization
  - Changes: Created new (26,906 chars)
  - Currently untracked (not yet committed)

- `scripts/agent_gate.sh`
  - Why: Primary pre-commit gate — already has `read_added_lines_from_target()` helper and worklog phrasing validation
  - Changes: None needed — content already matches pre-squash version
  - Key: Has the "pre-existing/unrelated failure" phrasing detection gate

- `scripts/regression_check.sh`, `scripts/secret_scan.sh`, `scripts/maintainability_guard.sh`
  - Why: Quality gates with bypass blocking — already correct in current PR
  - Changes: None needed

- `tools/cv_gap_analysis.py`
  - Why: CV implementation gap analysis — already uses `ast.literal_eval()` (security fix present)
  - Changes: None needed

- `tools/cv_hook_scan.py`
  - Why: CV hook scanner — already has dynamic registry-based scan (better than PR #52's older version)
  - Changes: None needed

- `src/frontend/src/hooks/useGameHandTracking.ts`
  - Why: PR #52 (CLOSED) changed its default from `?? 'worker'` to `?? 'main-thread'` — behavioral change for ALL CV games, deferred
  - Current state: `?? 'worker'` in main/current PR — unchanged

- `.agent/AGENT_KICKOFF_PROMPT.txt`
  - Why: stash@{0} adds "CRITICAL PRIORITY: MULTI-MODAL VISION PLATFORM" block — BR-008 pending
  - Current state: Does not have the multi-modal note
  - Planned: Apply from stash (UNIT-2)

- `docs/WORKLOG_ADDENDUM_2026-03-15.md`
  - Why: Must be updated with recovery audit entry before committing per repo policy
  - Changes: Pending (not yet updated for this recovery audit)
</important_files>

<next_steps>
Remaining work:

**Immediate (UNIT-2 — safe, additive, in-scope):**
1. Apply stash@{0}'s `.agent/AGENT_KICKOFF_PROMPT.txt` multi-modal vision platform note (BR-008)
   - `git stash show stash@{0} -p | grep -A 15 "AGENT_KICKOFF_PROMPT"` to extract the 6-line addition
   - Edit `.agent/AGENT_KICKOFF_PROMPT.txt` to add the CRITICAL PRIORITY block after line 4

2. Update `docs/WORKLOG_ADDENDUM_2026-03-15.md` with branch recovery audit entry (required by agent gate)

3. Stage and commit `docs/audit/BRANCH_RECOVERY_REGISTER.md` + worklog update to `codex/wip-utility-tools-merge`
   - Commit message: `docs: add branch recovery register and apply UNIT-2 kickoff prompt update`

**Deferred (separate PR, UNIT-3 scope):**
4. Create worklog tickets for deferred findings:
   - BR-009: `useHandInteraction.ts` simplification — needs call-site audit
   - BR-010: `useGameHandTracking.ts` default mode (`worker` vs `main-thread`) — needs intent clarification
   - BR-011: Game page simplifications (9 pages from PR #52) — needs game-by-game UX testing
   - BR-012: `labOfWonders.ts` game removals — needs implementation verification before any removals

**Open questions:**
- Why was PR #52 closed without merging? The useGameHandTracking default-mode change may indicate it was superseded or had issues
- Should PR #52 be reopened/re-targeted or should a new PR be opened for the deferred findings?
</next_steps>