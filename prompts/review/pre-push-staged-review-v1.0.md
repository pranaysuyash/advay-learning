# Pre-Push Staged Files Review — v1.0

**Category:** Review  
**Use when:** All staged changes are ready, TypeScript and tests pass, and you are about to push to a remote branch and open a PR. This is the **last human-quality gate before the branch leaves your machine.**

This prompt is NOT a PR review (that happens after push). This is a focused review of `git diff --staged` — the exact bytes that will be committed — with the goal of catching anything that would embarrass you in a PR review or regress the codebase.

---

## MISSION

Answer one question with evidence: **"Is every staged change safe to push, or is there anything that must be fixed first?"**

The bar is:
> No CRITICAL or HIGH findings. Every change is either additive, behavior-preserving, or an intentional documented improvement. No silent regressions, no hardcoded secrets, no broken contracts.

---

## OPERATING RULES

- Do NOT modify any files unless explicitly authorized.
- Do NOT use /tmp. All analysis is in-repo.
- Read the **full** staged diff — do NOT truncate with `| head -N`.
- Every finding must cite file path + line range + specific evidence.
- Do NOT report style, formatting, or trivial naming. Signal only.

---

## REQUIRED WORKFLOW

### STEP 0 — Get the full picture

```bash
# Full staged diff
git diff --staged

# File-level summary
git diff --staged --stat

# Count of staged files
git diff --staged --name-only | wc -l
```

State:
- Total staged files
- Files by category: src changes / docs / prompts / config / tests
- Brief description of what this commit represents

### STEP 1 — Triage staged files by risk

Group staged files:

| Risk | Criteria | Action |
|------|----------|--------|
| **HIGH** | Core game logic, state machines, hooks, utilities shared across games | Full review (STEP 2) |
| **MEDIUM** | UI components, pages, new game files | Standard review (STEP 3) |
| **LOW** | Constants, config, prompts, docs, test additions | Spot-check (STEP 4) |
| **SKIP** | node_modules, lock files, generated assets | No review needed |

### STEP 2 — Full review of HIGH-risk files

For each HIGH-risk staged file:

1. Read the complete staged diff for that file
2. Read the committed HEAD version: `git show HEAD:<path>`
3. Run the feature-by-feature comparison (from `regression-verification-v1.0.md` STEP 3):
   - All state variables preserved?
   - All handlers/callbacks preserved?
   - All exports preserved?
   - All constants moved with identical values?
   - Any data sources changed (storage keys, API endpoints, analytics stores)?

4. Check correctness:
   - Null/undefined narrowing still correct?
   - Consolidated effects cover all original deps?
   - Extracted functions behaviorally equivalent?

5. Check security:
   - No secrets or tokens hardcoded?
   - No new unvalidated inputs to sensitive paths?
   - No auth/permission checks removed?

### STEP 3 — Standard review of MEDIUM-risk files

For each MEDIUM-risk staged file:

1. Read the complete staged diff
2. Verify:
   - All required props still passed at call sites?
   - New required props added to callers?
   - Routing/registry entries correct (new games registered)?
   - Game shell props correct (gameId, gameName, showWellnessTimer)?
   - TypeScript two-component pattern followed (inner memo-wrapped + outer GameShell)?
3. Spot-check edge cases:
   - Empty/null/loading states handled?
   - Error boundaries present for new game pages?

### STEP 4 — Spot-check LOW-risk files

For constants, configs, docs, prompts:
- Constants have correct values (not copy-paste errors)?
- New prompt files added to `prompts/README.md`?
- Docs updated to match code changes (no stale references)?
- Worklog updated for any code changes to `src/`?

### STEP 5 — Run final checks

```bash
# TypeScript clean?
(cd src/frontend && npx tsc --noEmit 2>&1 | grep -v node_modules | head -30)

# Tests passing?
(cd src/frontend && npx vitest run --reporter=verbose 2>&1 | tail -20)

# Agent gate (worklog / audit artifact discipline)?
scripts/agent_gate.sh --staged
```

Record: command run, exit code, any failures.

### STEP 6 — Check for commit hygiene

Before signing off, verify:

```bash
# No secrets in staged files
git diff --staged | grep -iE "(api_key|secret|password|token|credential)" | grep -v "# " | grep -v "test" | grep -v "example"

# No /tmp paths committed
git diff --staged | grep -E "\/tmp\/"

# No debug console.log left in production code
git diff --staged | grep -E "^\+.*console\.(log|warn|error)\(" | grep -v "test\|spec\|__tests__"

# No .skip or .only in tests
git diff --staged | grep -E "^\+.*(\.skip|\.only)\("
```

### STEP 7 — Classify all findings

For each finding:

```
FINDING-001
Severity: CRITICAL | HIGH | MEDIUM | LOW | INFO
File: path/to/file.ts  Lines: 45–52
Description: What the problem is
Evidence: [quote the relevant code]
Impact: What breaks or what user-visible behavior changes
Fix: Concrete suggested fix
```

**Severity guide:**
- **CRITICAL**: Data loss, security vulnerability, wrong constant value, broken core path
- **HIGH**: Feature regression, dropped state, broken contract, missing required prop
- **MEDIUM**: Edge case failure, stale closure, orphaned export that callers depend on
- **LOW**: Dead prop, missing error handling for unlikely path, stale comment
- **INFO**: Observation with no action required

### STEP 8 — Verdict

```
PUSH APPROVED       — No CRITICAL or HIGH findings. Safe to push.
PUSH WITH NOTES     — No CRITICAL or HIGH. MEDIUM or LOW findings noted; 
                       push allowed, follow-up tickets recommended.
DO NOT PUSH         — One or more CRITICAL or HIGH findings. 
                       Fix all before pushing.
SECURITY HOLD       — Potential secret, credential, or security issue found.
                       Must resolve before any push.
```

---

## REPORT FORMAT

```markdown
## Pre-Push Staged Review — <branch-name> — <date>

### Staged Change Summary
- Total files staged: N
- HIGH-risk files: [list]
- MEDIUM-risk files: [list]
- LOW-risk files: [list]

### Checks Run
| Check | Command | Result |
|-------|---------|--------|
| TypeScript | npx tsc --noEmit | ✅ 0 errors |
| Tests | npx vitest run | ✅ N passed |
| Agent gate | scripts/agent_gate.sh | ✅ passed |
| Secret scan | grep pattern | ✅ clean |

### Findings

#### CRITICAL
[FINDING-XXX entries or "None"]

#### HIGH
[FINDING-XXX entries or "None"]

#### MEDIUM
[FINDING-XXX entries or "None"]

#### LOW / INFO
[FINDING-XXX entries or "None"]

### Verdict
[PUSH APPROVED / PUSH WITH NOTES / DO NOT PUSH / SECURITY HOLD]

### What Was Verified
[Brief list of what was checked and found clean]

### Follow-up Tickets (if PUSH WITH NOTES)
[List of MEDIUM/LOW findings to track post-push]
```

---

## RELATIONSHIP TO OTHER REVIEW PROMPTS

| Prompt | When | Focus |
|--------|------|-------|
| `code-review-v1.0.md` | Any code change | Deep single-file intent + correctness |
| `regression-verification-v1.0.md` | Files with >10% LOC delta | Feature-by-feature old vs new |
| **`pre-push-staged-review-v1.0.md`** (this) | Before every push | Full staged diff, final gate |
| `local-pre-commit-review-v1.0.md` | Before commit | Pre-commit gate, findings-first |
| `pr-review-v1.6.1.md` | After push, in PR | PR-level review for merge |

**The standard pipeline is:**  
`code-review` → `regression-verification` (if LOC delta) → **`pre-push-staged-review`** → push → `pr-review`

---

*Prompt version: v1.0 | Created: 2026-03-10 | Owner: Copilot agent coordination*
