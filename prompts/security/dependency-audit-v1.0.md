# DEPENDENCY AUDIT PROMPT v1.0

**Goal**: Assess dependency risks (known vulns, risky packages) and produce a scoped remediation plan.

---

## INPUTS

- Scope: `<frontend|backend|both>`
- Repo access: `<YES/NO>`

---

## REQUIRED DISCOVERY (if repo access)

Frontend:
```bash
ls -la src/frontend/package.json
cd src/frontend && npm audit --audit-level=moderate
```

Backend:
```bash
ls -la pyproject.toml
pip-audit || true
```

If these tools are unavailable, record that as Observed and mark results Unknown.

---

## OUTPUT (REQUIRED)

### A) Tooling status
- Which commands ran vs failed

### B) Findings list (prioritized)
For each finding:
- Package + version
- Severity (from tool output)
- Exposure (runtime vs dev)
- Suggested next action (pin/upgrade/remove) — do not implement

### C) Ticket recommendations (MANDATORY)
Create 1–5 scoped tickets to address findings safely.

---

## STOP CONDITION

Stop after findings + ticket recommendations.
