# Code Review Prompt — v1.0

**Category:** Review  
**Use when:** Reviewing any code change — whether in a PR, after a refactor, before a commit, or during an audit remediation. This prompt drives a human-quality, intent-first code review that goes beyond TypeScript and lint.

---

## MISSION

Perform a thorough code review that verifies:
1. **Intent is preserved or improved** — not just syntax correctness
2. **No silent regressions** — no features dropped, no behavior changed without documentation
3. **No security or data-integrity hazards** introduced
4. **Correctness at the call-site** — props, callbacks, contracts, and edge cases are right
5. **Only signal-level findings** — not style, not preference, not nitpicks

---

## OPERATING RULES

- Do NOT modify any files unless explicitly authorized by the task.
- Do NOT use /tmp. All analysis is in-repo.
- Do NOT rely on TypeScript alone — TS cannot detect silent data-source swaps, wrong constant values, dropped state, missing callbacks, or behavioral regressions.
- Do NOT report style, formatting, or trivial naming issues.
- DO cite every finding with file path + line range + the specific evidence.

---

## REVIEW WORKFLOW

### STEP 0 — Understand the change intent

Before reading a single line of diff:

1. Read the commit message / PR description / task description.
2. State in one sentence: **"This change is supposed to do X."**
3. List the files changed and what role each plays.
4. Identify the risk tier:

| Tier | Description | Scrutiny Level |
|------|-------------|----------------|
| **T1** | Core game logic, state machines, physics, scoring | Maximum — line-by-line |
| **T2** | UI components, event handlers, hooks | Standard — feature + edge case |
| **T3** | Constants, configs, style, comments | Spot-check |
| **T4** | Pure refactors (no behavior change claimed) | Intent verification required |

### STEP 1 — Read the original (for any T1/T2/T4 change)

For every T1/T2/T4 file in the diff:

```bash
git show HEAD:<path/to/file>
```

Extract the **original intent** by listing:
- What the file was responsible for
- Key behaviors / invariants it maintained
- Any known issues or TODOs it carried

### STEP 2 — Read the diff in full

```bash
git diff HEAD -- <path/to/file>
# Do NOT pipe to head -N. Read the complete diff.
```

For each hunk, note:
- What was removed
- What was added
- What the net behavioral change is

### STEP 3 — Verify each finding category

Check all of the following. Mark each ✅ PASS, ⚠️ CONCERN, or ❌ FAIL with evidence.

#### A. Intent preservation
- Does the change achieve its stated purpose?
- Is the stated purpose the right purpose (does it match the actual user/gameplay need)?

#### B. Feature completeness
- Is anything present in the old code silently absent in the new code?
- Any state variables dropped? Any handlers missing? Any overlays removed?
- Any exports that callers depend on that are no longer exported?

#### C. Correctness
- Are constants moved to a new location with **identical values**?
- Are extracted functions **behaviorally equivalent** to the original inline logic?
- Are consolidated `useEffect`s covering **all** original dep arrays?
- Is any null/undefined narrowing weaker than before?
- Are there new off-by-one errors, wrong types, wrong comparisons?

#### D. Data integrity
- Are data sources consistent? (e.g., analytics reading from the same storage key as before)
- Are IDs, keys, and localStorage/sessionStorage keys unchanged?
- Are API contracts (request/response shapes) preserved?

#### E. Security
- No secrets hardcoded
- No new XSS vectors (unescaped user content in DOM)
- No authentication/authorization checks removed
- No new unvalidated inputs to sensitive operations
- No new network calls or telemetry pathways without explicit documentation

#### F. Props and contracts
- Are all required props still passed at every call site?
- Are any new required props missing from callers?
- Are callback directions correct (parent→child, child→parent)?
- Do generics/types still match at the boundaries?

#### G. Edge cases
- What happens with empty arrays, null values, zero counts, undefined refs?
- What happens at game start before state initializes?
- What happens if a camera or permission request fails?
- Are loading states and error boundaries still intact?

#### H. Orphans and dead code introduced
- Are there any props accepted but never used?
- Are there any exported symbols that have no consumers?
- Are there any unreachable branches?
- **Do not flag as regressions** — flag as "minor cleanup opportunity" with evidence.

### STEP 4 — Classify findings

For each finding:

```
FINDING-001
Severity: CRITICAL | HIGH | MEDIUM | LOW | INFO
Category: (A–H from above)
File: path/to/file.ts
Lines: 45–52
Description: What the problem is
Evidence: Quote the relevant code
Impact: What breaks / what user-visible behavior changes
Fix: Concrete suggested fix (1–3 lines if possible)
```

**Severity guide:**
- **CRITICAL**: Data loss, security vulnerability, broken core gameplay, silent wrong value
- **HIGH**: Feature regression, dropped state, broken callback chain
- **MEDIUM**: Edge case failure, wrong constant, stale closure
- **LOW**: Orphaned prop/export, missing error handling for unlikely path
- **INFO**: Observation only, no action required

### STEP 5 — Verdict

```
## Review Verdict

APPROVE         — All categories pass. Zero CRITICAL/HIGH findings.
APPROVE + NOTES — No CRITICAL/HIGH. One or more MEDIUM/LOW noted for follow-up.
REQUEST CHANGES — One or more CRITICAL or HIGH findings. Must fix before commit/merge.
BLOCK           — Security vulnerability or data integrity issue. Immediate escalation.
```

List all findings grouped by severity. For APPROVE verdicts, briefly state what was verified.

---

## REPORT FORMAT

```markdown
## Code Review Report — <FileName(s)> — <date>

### Change Intent
[One-sentence statement of what this change does]

### Risk Tier
[T1 / T2 / T3 / T4 + reasoning]

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
[APPROVE / APPROVE + NOTES / REQUEST CHANGES / BLOCK]
[Summary statement with evidence]
```

---

## WHAT NOT TO REPORT

These are explicitly out of scope:
- Formatting, indentation, whitespace
- Variable naming style (camelCase vs snake_case is a convention, not a bug)
- Comment quality or documentation completeness (unless a contract is undocumented and ambiguous)
- TypeScript strictness preferences beyond what the project already enforces
- File organization opinions
- Performance micro-optimizations unless the feature has explicit latency constraints

---

## RELATED PROMPTS

- `prompts/verification/regression-verification-v1.0.md` — deep feature-by-feature regression check for LOC-changed files
- `prompts/review/pre-push-staged-review-v1.0.md` — pre-push review of all staged files before branch push
- `prompts/review/local-pre-commit-review-v1.0.md` — local commit gate (findings-first)
- `prompts/review/pr-review-v1.6.1.md` — post-push PR review

---

*Prompt version: v1.0 | Created: 2026-03-10 | Owner: Copilot agent coordination*
