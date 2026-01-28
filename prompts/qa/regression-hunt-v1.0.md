# REGRESSION HUNT PROMPT v1.0

**Goal**: Identify regressions caused by a change (before/after) using deterministic smoke checks and focused diffs.

---

## INPUTS

- Change context: `<ticket/PR/range>`
- Suspected surfaces: `<routes/features>`
- Baseline reference: `<previous build/commit/tag or \"unknown\">`
- Repo access: `<YES/NO>`
- Git availability: `<YES/NO/UNKNOWN>`

---

## REQUIRED DISCOVERY

If Git availability is YES:
```bash
git diff --name-only <base>..<head>
git diff <base>..<head> --stat
```

Always:
```bash
rg -n "<affected route/symbol>" -S src || true
```

---

## PROCESS

1) Build a “top 5 flows” list impacted by the change.
2) Run deterministic smoke checks for each flow.
3) Capture Observed evidence (commands + output or UI observation).
4) Triangulate to likely root cause using diffs and call sites.

---

## OUTPUT (REQUIRED)

```markdown
REGRESSION REPORT v1.0

Change summary (Observed/Unknown):
- ...

Smoke checks:
1) <flow> -> PASS/FAIL/UNKNOWN
   - Evidence: ...

Suspected root causes:
- RCA-001: <title> | Claim: Observed/Inferred/Unknown | Evidence: ...

Next actions (scoped):
1) ...
```

---

## STOP CONDITION

Stop after the report. Do not implement fixes.
