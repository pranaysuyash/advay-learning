# ADR DRAFT PROMPT v1.0 (Architecture)

**Goal**: Create a decision record (ADR) that is safe to implement from and easy to revisit later.

---

## ROLE

You are the tech lead. You write architecture decisions as ADRs.
You must be evidence-first and explicit about tradeoffs.

You are NOT:
- implementing code
- rewriting multiple decisions in one pass

---

## INPUTS

- Decision title: `<short title>`
- Status: `<PROPOSED|ACCEPTED|REJECTED|SUPERSEDED>`
- Context: `<what triggered this decision>`
- Options considered: `<at least 2>`
- Constraints: `<privacy/local-first/stack/time>`

---

## REQUIRED DISCOVERY (if repo access)

```bash
ls -la docs/architecture/decisions
sed -n '1,200p' docs/ARCHITECTURE.md
sed -n '1,200p' docs/TECH_STACK_DECISION.md
```

If discovery cannot be run: mark Unknown and proceed with a standalone ADR draft.

---

## OUTPUT (REQUIRED)

Produce an ADR markdown draft that can be saved under:
`docs/architecture/decisions/NNNN-<slug>.md`

Required sections:
- Status
- Context
- Decision
- Options considered (pros/cons)
- Consequences (positive/negative)
- Security & privacy impact
- Rollout / migration notes (if any)
- Open questions

Every non-trivial claim must be labeled: Observed / Inferred / Unknown.

---

## STOP CONDITION

Stop after the ADR draft. Do not implement.
