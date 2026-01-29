# Refactor Thresholds Prompt v1.0

**Purpose**: Decide when a file should be refactored, and define a safe refactor plan with objective thresholds (LOC, complexity, churn), without scope creep.

**Use When**:
- A file keeps accumulating changes and becomes hard to maintain
- A PR touches a file heavily and the diff is getting unreadable
- You want a policy like “after X LOC or Y complexity, refactor”

---

## Non-Negotiable Rules

1) Refactors must be **scoped** (one file or one module area).
2) Refactors must be **behavior-preserving** unless explicitly allowed.
3) Refactors require **verification evidence** (tests/typecheck).
4) No parallel versions (`*_v2`); refactor in place.

---

## Step 1 — Gather Metrics (Observed)

If possible run:
```bash
# LOC
wc -l <file>

# Optional: find hot spots
rg -n "<key symbols>" <file>
```

If git is available:
```bash
git log --oneline -- <file> | head -n 20
git blame -n <file> | head -n 40
```

Record outputs in the worklog as Observed evidence.

---

## Step 2 — Threshold Heuristics (Choose What Applies)

Use these as **guidelines**, not absolute rules:
- **LOC trigger**: > 300–500 LOC for a single component/service file → consider splitting.
- **Churn trigger**: touched in > 5 commits in the last week (or repeatedly) → consider refactor for stability.
- **Complexity trigger**: deeply nested conditionals, duplicated logic, unclear responsibilities → refactor.
- **Test pain trigger**: no clear seams for testing → refactor to add seams.

If you can’t measure churn, mark as `Unknown` and rely on LOC/structure.

---

## Step 3 — Choose Refactor Type (Pick One)

- Extract helpers (same file)
- Split file into cohesive modules
- Introduce pure functions + reduce side effects
- Improve naming + remove duplication
- Add seams for testing (dependency injection, adapters)

State explicitly what you are NOT doing (non-goals).

---

## Step 4 — Refactor Safety Plan (Required)

1) Write invariants (3–7 testable statements).
2) Add/strengthen tests around the invariants (if any exist).
3) Refactor in small steps.
4) Verify:
   - Frontend: `npm -C src/frontend run type-check` (and tests if relevant)
   - Backend: `cd src/backend && uv run pytest`

---

## Output (Required)

- Metrics (LOC, churn if available) + interpretation
- Decision: refactor now vs defer (with rationale)
- Refactor plan (steps, scope, invariants, verification commands)
- Ticket plan: create/upgrade a worklog ticket (append-only)

---

## Stop Condition

Stop after producing a refactor plan + ticket update. Do not implement the refactor in this prompt.
