# RELEASE READINESS PROMPT v1.0

**Goal**: Decide if a release is ready and produce a checklist with evidence.

---

## INPUTS

- Release target: `<dev demo | internal alpha | external alpha>`
- Version/tag: `<if any>`
- Repo access: `<YES/NO>`
- Git availability: `<YES/NO/UNKNOWN>`

---

## REQUIRED DISCOVERY (if repo access)

```bash
ls -la
sed -n '1,120p' CHANGELOG.md
```

If Git availability is YES (optional but recommended):

```bash
git status --porcelain
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Run the project’s verification commands if they exist and are applicable; otherwise list Unknown:

- frontend: `npm run lint`, `npm run type-check`, `npm run test`
- backend: `pytest`

---

## OUTPUT (REQUIRED)

### A) Release checklist (PASS/FAIL/UNKNOWN)

- Build/boot (frontend + backend)
- Tests
- Security/privacy review
- Docs updated (quickstart + setup)
- Data export/delete verified (if applicable)

### B) Evidence log

- Commands + raw outputs (or Unknown)

### C) Go/No-Go decision

- GO / NO-GO / GO WITH RISKS
- Risks and rollback notes

---

## STOP CONDITION

Stop after checklist + decision.
