# React Best Practices (Vercel-aligned) :: Hardening / Performance Prompt (v1.0)

## Purpose

Use this prompt when you want a Vercel-aligned, practical checklist and remediation flow for React apps, with an emphasis on performance, maintainability, and modern React patterns.

**Primary reference**: Vercel blog post “Introducing React best practices” (2026-01-14).

## Scope Contract (MUST FILL)

- In-scope:
  - React client performance and rendering best practices (as applied to this repo)
  - Data fetching patterns and avoiding async waterfalls
  - Bundle sizing and code-splitting opportunities
  - React component patterns (state, effects, memoization) that reduce wasted renders
  - Practical refactors with tests where applicable
- Out-of-scope:
  - Framework migration (e.g., Vite → Next.js) unless explicitly requested
  - Styling rewrites / design refresh
  - Major dependency upgrades unless explicitly requested
- Behavior change allowed: [YES/NO/UNKNOWN]

Targets:

- Repo: learning_for_kids
- Frontend path(s): `src/frontend/...`
- File(s): (list)

Acceptance criteria:

- Clear list of prioritized findings (with evidence)
- Focused patch that improves the chosen metric(s)
- Verification evidence (commands + outputs)

## Evidence Discipline (Repo policy)

Every non-trivial claim MUST be labeled:

- **Observed**: backed by command output / code inspection
- **Inferred**: logically implied, not directly verified
- **Unknown**: cannot be determined in this session

Do not upgrade **Inferred** → **Observed**.

## Operating Mode

1) Prefer the ordering from Vercel’s “React best practices” guidance:
   - Fix async waterfalls first
   - Then reduce bundle size
   - Then reduce wasted rendering / state churn
   - Then micro-optimizations (only if still needed)
2) Preserve contributor intent. Avoid “rewrite” solutions unless required.
3) Keep diffs scoped: one hardening slice per change-set.

## Required Discovery (run and log outputs)

- `git status --porcelain`
- `rg -n "fetch\\(|axios\\(|useEffect\\(|useMemo\\(|useCallback\\(|React\\.memo|lazy\\(" src/frontend/src`
- `npm -v && node -v` (from `src/frontend`)
- `npm test` (or repo-standard frontend test command)

If this is a perf task, also capture:

- **Observed**: a baseline measurement (pick one)
  - `npm run build` output (bundle stats if present)
  - Browser profiling capture notes (React DevTools Profiler or Chrome Performance)

## Output Format (deliverable)

### 1) Findings (ranked)

For each finding:

- ID: `RBP-###`
- Category: `Async Waterfalls | Bundle Size | Rendering | State/Effects | Misc`
- Severity: `HIGH | MED | LOW`
- Evidence:
  - **Observed**: (command output/code anchor)
  - **Inferred/Unknown**: (if applicable)
- Recommendation:
  - Minimal change path
  - Test/verification plan

### 2) Patch Plan (scoped)

- Files to change (exact)
- Non-goals
- Rollback plan

### 3) Implementation + Verification

- Apply the smallest safe change
- Add/adjust tests for HIGH/MED findings where feasible
- Run verification commands and include raw outputs

## Practical Heuristics (safe defaults)

- Treat repeated “fetch in chained effects” as a top priority (waterfalls).
- Prefer consolidating requests in one place, or parallelizing independent requests.
- Prefer “move computation out of render” and “stable props” before adding memoization.
- Avoid premature `useMemo/useCallback`; use only when you can point to wasted work.
- Prefer code-splitting at route boundaries (or equivalent) before component-level splits.
- Watch for “derived state” bugs: compute from source-of-truth when possible.

## If Blocked

If you cannot measure/prove improvement:

- Mark the claim **Unknown**
- Still ship a correctness-preserving refactor with tests
- List what measurement is needed (exact commands/tools) to upgrade to **Observed**
