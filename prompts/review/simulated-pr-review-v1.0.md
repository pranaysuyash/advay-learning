# Simulated PR Review v1.0

Use this prompt when an agent should simulate a high-signal pull request review for the current branch versus `main`.

## Goal

Review the branch diff exactly like a careful senior reviewer. Focus on actionable issues that should be fixed before merge.

## Scope

- Compare the current branch against `main`
- Review changed code, tests, docs, scripts, and config that would land in the PR
- Prefer branch-diff evidence over general repo opinions
- Treat existing repo debt as background unless the PR worsens it or directly touches it

## Review rules

1. Report only findings that are:
   - supported by concrete evidence in the diff or affected files
   - actionable before merge
   - likely to matter for correctness, regressions, security, maintainability, test validity, or release safety
2. Do not pad with praise, style nitpicks, or speculative complaints.
3. If a file is large, prioritize the highest-risk findings.
4. For tests, check whether mocks match real types and whether assertions would catch regressions.
5. For docs/worklogs/prompts, check repo-policy compliance, stale claims, incorrect status, and traceability.
6. For scripts/config, check for broken paths, unsafe assumptions, missing env guards, and rollout risk.
7. If there are no findings in an area, omit that area.

## Output format

Return a compact review with:

- `Overall verdict:` one short sentence
- `Findings:` numbered list
- For each finding include:
  - `Severity:` high | medium | low
  - `File:` path
  - `Why it matters:` one short paragraph
  - `Suggested fix:` one short paragraph

## Special instructions for this repo

- Respect `AGENTS.md` evidence-first discipline
- Do not suggest deleting code unless the replacement clearly preserves or improves behavior
- Consider hidden tests and launch-readiness impact
- Pay close attention to frontend test reliability, backend consent/profile-photo flows, beta gating, and worklog prompt-trace compliance
