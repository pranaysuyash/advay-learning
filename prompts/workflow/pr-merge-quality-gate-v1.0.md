# PR / Merge Quality Gate Prompt v1.0

**Purpose**: Decide if a PR is ready to merge based on scope alignment, diff quality, verification, and cleanliness. Designed to reduce “big diff, unclear value” merges.

**Use When**:
- Reviewing a PR before merge
- You want a consistent pass/fail gate for changes
- There are big diffs or refactors involved

---

## Non-Negotiable Rules

1) PR must map to a worklog ticket (or create one).
2) No scope creep: diff must match ticket scope contract.
3) Evidence-first: verification outputs must be included (or explicitly Unknown).
4) Preserve behavior unless declared.

---

## Step 1 — Identify Scope + Expected Outcomes

Collect:
- Ticket ID(s)
- Acceptance criteria
- “Behavior change allowed” value

If missing, BLOCK and request ticket update.

---

## Step 2 — Diff Health Checks (Observed)

If git is available:
```bash
git diff --stat <base>..<head>
git diff <base>..<head>
```

Key questions:
- Are changes concentrated in the intended files?
- Is there any unrelated churn (formatting, renames, dependency bumps)?
- Is there duplicated “new version” code instead of refactoring?

---

## Step 3 — Deviation Heuristic (LOC + Concentration)

Compute:
- Total changed LOC (additions + deletions)
- Top 3 files by change size

Guidance:
- If one file has huge delta (>200–300 LOC), require a refactor rationale and added tests.
- If the diff spans many unrelated areas, BLOCK and request split.

---

## Step 4 — Verification Gate

Must include at least one of (depending on area):
- Backend: `cd src/backend && uv run pytest`
- Frontend: `npm -C src/frontend run type-check`
- Lint where configured

If verification not run, status is REQUEST CHANGES unless explicitly impossible (then mark Unknown and explain).

---

## Step 5 — PR Cleanliness Gate

Confirm:
- No stray artifacts (logs, caches, db files) are committed
- Docs updated if behavior/config changed
- Worklog updated with evidence + final status

---

## Output (Required)

- Verdict: APPROVE | REQUEST CHANGES | BLOCK
- Scope alignment: PASS/FAIL (why)
- Diff quality: PASS/FAIL (top issues)
- Verification: PASS/FAIL/UNKNOWN (commands + outputs)
- Required follow-ups (bulleted, concrete)

---

## Stop Condition

Stop after giving the verdict and listing required follow-ups.
