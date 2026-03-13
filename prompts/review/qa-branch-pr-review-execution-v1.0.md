# QA Branch PR Review Execution v1.0

Use this prompt when delegating a full branch-versus-`main` pull request review to a QA-style subagent.

## Goal

Simulate a high-signal PR review for the current branch using the repo's saved PR review rules.

## Instructions

1. Load and follow `prompts/review/simulated-pr-review-v1.0.md` as the governing review rubric.
2. Compare the current branch against `main`.
3. Review the full branch diff — not a narrow file subset and not only unstaged changes.
4. Inspect changed code, tests, docs, scripts, config, and release-risk changes that would land in the PR.
5. Report only actionable findings that should be fixed before merge.
6. Prioritize correctness, regressions, security, maintainability, test validity, repo-policy compliance, and release safety.
7. Pay close attention to:
   - frontend test reliability
   - backend consent/profile-photo flows
   - beta gating
   - docs/worklog/prompt traceability
   - scripts with path/env assumptions
   - large asset/doc additions that may violate repo practices
8. Omit praise and omit areas with no findings.

## Output format

- `Overall verdict:` one sentence
- `Findings:` numbered list

For each finding include:
- `Severity:` high | medium | low
- `File:` path
- `Why it matters:` short paragraph with concrete evidence
- `Suggested fix:` short paragraph

## Constraints

- Evidence first; do not speculate.
- Do not suggest deleting code unless replacement clearly preserves behavior.
- Focus on findings supported by the actual branch diff and affected files.
- Cap the list to the highest-signal findings (ideally 10 or fewer).
