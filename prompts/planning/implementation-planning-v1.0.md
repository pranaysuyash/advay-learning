# IMPLEMENTATION PLANNING PROMPT v1.0

**Goal**: Create a detailed, verifiable implementation plan for a feature or work unit before coding begins. This bridges the gap between "ticket exists" and "code is written."

**When to use**:

- Before implementing any non-trivial feature (P1 or higher)
- When the implementation approach is unclear or has multiple options
- When multiple files/components need coordination
- Before requesting a code review

**When NOT to use**:

- For trivial one-line fixes
- When the implementation is already clear and documented
- For audit remediation (use `prompts/remediation/implementation-v1.6.1.md` instead)

---

## ROLE

You are a senior engineer creating an implementation plan. Your job is to think through the approach, identify risks, and produce a plan that another engineer could execute.

You are NOT:

- writing production code
- making final architecture decisions alone
- estimating time/effort

---

## INPUTS

- Ticket ID: `<TCK-YYYY-MM-DD-###>`
- Feature/scope: `<brief description>`
- Target files (expected): `<list>`
- Constraints: `<technical, security, UX, or other constraints>`
- Known unknowns: `<what you're unsure about>`
- Repo access: `<YES/NO>`
- Git availability: `<YES/NO/UNKNOWN>`

---

## NON-NEGOTIABLE RULES

1. **Evidence-first**: All claims about existing code must be labeled Observed / Inferred / Unknown.
2. **Scope discipline**: The plan must fit within the ticket's scope contract.
3. **No code in planning**: Pseudocode and interfaces only, no production code.
4. **Testability**: Every plan must include how to verify it works.

---

## REQUIRED DISCOVERY (run if possible)

If Git availability is YES:

```bash
git status --porcelain
git diff --name-only origin/main...HEAD
```

Always:

```bash
# Find relevant files
rg -n "<feature keywords>" src -S --type-add 'code:*.{ts,tsx,js,jsx,py}' -tcode

# Check existing patterns
rg -n "similar pattern" src -S | head -20

# List target directories
ls -la <expected directories>
```

If any command fails, capture raw output and mark related claims as Unknown.

---

## REQUIRED OUTPUT BEFORE CODING

### A) Discovery Summary

**Observed** (from commands/files):

- Existing code patterns that apply
- Similar features already implemented
- Relevant files and their purposes

**Inferred** (logical deductions):

- How components likely interact
- Potential integration points

**Unknown** (cannot determine without implementation):

- Technical blockers that need prototyping
- Performance characteristics
- Edge case behaviors

### B) Implementation Options

For non-trivial features, present 2-3 implementation approaches:

| Option | Approach | Pros | Cons | Risk Level |
|--------|----------|------|------|------------|
| A | ... | ... | ... | LOW/MED/HIGH |
| B | ... | ... | ... | LOW/MED/HIGH |
| C | ... | ... | ... | LOW/MED/HIGH |

**Recommendation**: State which option you recommend and why.

### C) Detailed Plan (Chosen Option)

#### Phase 1: Foundation

- Files to create/modify
- Interfaces/types to define
- State changes needed

#### Phase 2: Core Implementation

- Step-by-step implementation order
- Key functions/components
- Error handling strategy

#### Phase 3: Integration & Polish

- How it connects to existing code
- UI/UX considerations
- Edge cases to handle

### D) Testing Strategy

- Unit tests: `<what to test, how>`
- Integration tests: `<cross-component validation>`
- Manual verification: `<steps for human testing>`
- Edge cases: `<list specific scenarios>`

### E) Verification Checklist

- [ ] Implementation matches plan
- [ ] All acceptance criteria met
- [ ] Tests pass (unit + integration)
- [ ] Manual verification completed
- [ ] No regressions in related features
- [ ] Documentation updated (if needed)

### F) Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ... | LOW/MED/HIGH | LOW/MED/HIGH | ... |

### G) Rollback Plan

If this goes wrong, how do we revert?

- Files to restore
- Database migrations to consider
- Feature flags to disable

---

## PLAN STRUCTURE (Template)

```markdown
## IMPLEMENTATION PLAN: [Ticket ID]

### Discovery Summary

**Observed**:
- [File:path] contains [pattern]
- Command: [output]

**Inferred**:
- [logical deduction]

**Unknown**:
- [what needs prototyping]

### Options Considered

[Table of options A/B/C]

**Recommendation**: [Option X] because [reasoning]

### Implementation Plan

#### Phase 1: Foundation
1. [Step 1]
2. [Step 2]

#### Phase 2: Core Implementation
1. [Step 1]
2. [Step 2]

#### Phase 3: Integration
1. [Step 1]

### Testing Strategy

- Unit: [...]
- Integration: [...]
- Manual: [...]

### Verification Checklist

- [ ] [...]

### Risks

| Risk | L | I | Mitigation |
|------|---|---|------------|
| ... | M | H | ... |

### Rollback

- [...]
```

---

## STOP CONDITION

Stop after producing the implementation plan. Do not write production code.

The plan should be detailed enough that:

1. Another engineer could implement it
2. A reviewer could validate the approach
3. You could execute it step-by-step

---

## NEXT STEPS

After this planning prompt completes:

1. **Review the plan** with stakeholders (if needed)
2. **Update WORKLOG_TICKETS.md** with the plan reference
3. **Execute the plan** using `prompts/implementation/feature-implementation-v1.0.md`
4. **Verify completion** using `prompts/review/completeness-check-v1.0.md`

---

## EXAMPLE OUTPUT

See `prompts/planning/example-output.md` for a complete example.
