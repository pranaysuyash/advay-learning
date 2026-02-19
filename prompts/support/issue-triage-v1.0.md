# ISSUE TRIAGE PROMPT v1.0 (Support/Eng)

**Goal**: Triage a reported issue into: reproduce → root-cause hypothesis → scoped ticket(s) or “need more info”.

---

## INPUTS

- Issue report: `<text>`
- Artifacts: `<logs/screenshots/console output>`
- Repo access: `<YES/NO>`
- Git availability: `<YES/NO/UNKNOWN>`

---

## REQUIRED DISCOVERY (if repo access)

```bash
rg -n "<key terms from issue>" -S src docs || true
```

If the issue references a specific route or component, search it directly:

```bash
rg -n "<route|component|function>" -S src/frontend/src src/backend/app || true
```

---

## OUTPUT (REQUIRED)

### A) Repro status

- Reproducible: YES/NO/UNKNOWN
- Evidence: Observed/Inferred/Unknown

### B) Severity + blast radius

- P0/P1/P2/P3 with justification

### C) Likely root causes (ranked)

- 1–3 hypotheses labeled Inferred unless directly proven

### D) Next action

- If reproducible: create 1–2 tickets (append-ready) with acceptance criteria and discovery commands.
- If not reproducible: list minimum info needed + a “debug instrumentation” ticket (optional).

---

## STOP CONDITION

Stop after tickets or “need more info”.
