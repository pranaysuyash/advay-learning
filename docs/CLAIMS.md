# Claims Registry (Append-Only)

Purpose: prevent cross-agent contradictions by requiring every non-trivial claim to be recorded with evidence.

Rules:
- Append-only (never rewrite prior entries).
- Every claim must be labeled exactly one of: `Observed`, `Inferred`, `Unknown`.
- Claims that affect audits/reviews must be referenced in the relevant `docs/audit/*.md` artifact.

## Template

```markdown
### CLM-YYYYMMDD-### :: <Short claim title>

Date: YYYY-MM-DD
Owner: <person/agent>
Scope: <file(s)/component(s)>
Claim: <one sentence>
Evidence type: Observed|Inferred|Unknown

Evidence:

**Command**: `<command run>`  # OR: File reference(s)

**Output**:
<paste output or cite file path + snippet anchor>

Interpretation: <what the evidence shows, without upgrading Inferred to Observed>

Refs:
- Ticket: TCK-YYYYMMDD-###
```

