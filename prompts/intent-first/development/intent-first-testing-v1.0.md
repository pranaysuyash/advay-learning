# Intent-First Testing Philosophy v1.0

## "Test What Matters Most First"

**Core Principle:** Before writing, modifying, or removing tests, investigate which user flows, integrations, and failure points are most critical to business success and user experience, then design tests accordingly.

**Codebase-First Focus:** Test existing functionality before adding new. Ensure current behavior is preserved when enhancing.

---

## Universal Investigation Framework

### Phase 1: Context Discovery

1. **Identify the testing need** (new feature, bug fix, refactoring, legacy cleanup, or migration)
2. **Map user journeys** (critical paths users take through the system)
3. **Analyze failure impact** (what breaks and who is affected when this component fails?)
4. **Review existing coverage** (what's already tested, what gaps exist, and what's redundant?)

### Phase 2: Value Analysis

- What user problem does this code solve?
- What's the business impact if this fails in production?
- How often is this code path executed?
- What's the cost of failure vs cost of comprehensive testing?

### Phase 3: Test Prioritization

- **Business Impact**: User trust, revenue, compliance
- **Failure Probability**: Historical stability, change frequency
- **Test Effort**: Time to write, maintain, and run
- **Coverage Gap**: Is this a critical untested area?

---

## Quick Filter

Skip detailed test planning if all true:

- Low user/business impact if it fails
- Simple, stable code with low change frequency
- Already well-covered by higher-level tests
- High effort to test with minimal additional value

→ **Document as acceptable test debt** in `test-debt.md`

---

## Priority Matrix

| Business Impact | Failure Probability | Test Effort | Priority |
|-----------------|-------------------|-------------|----------|
| High | High | Low–Medium | **Critical – Test immediately** |
| High | Medium–High | Low–Medium | **High – Test this sprint** |
| Medium | High | Low | **Medium – Test when time permits** |
| High | Any | High | **Evaluate simplified or partial tests** |
| Low | Low | Any | **Skip or use basic smoke test** |

---

## Codebase-First Testing Rule

For *Critical* and *High* priority items, always cover:

1. **Existing behavior preservation** - tests that ensure current functionality stays intact
2. **Happy path success** - core user journey works
3. **One high-impact failure mode** - what happens when it breaks
4. **Any security, data integrity, or compliance constraint**

Leave exhaustive permutations for later unless risk justifies it.

**When enhancing existing code:**

- Write tests for new behavior
- Ensure existing tests still pass
- Add regression tests for bugs found

---

## Ready-to-Use AI Prompt

```
You are to apply the Intent-First Testing Philosophy to the following component or feature.

### Component/Feature:
[Describe the code/feature that needs testing]

### Investigation Requirements:
1. **Business Context**:
   - What user problem does this solve?
   - What's the business impact if it fails?
   - How frequently is it executed?

2. **Existing Test Analysis**:
   - What tests already exist for this component?
   - What's the current coverage % and quality?
   - Are there brittle or redundant tests to refactor?

3. **Risk Assessment**:
   - Failure probability (high/medium/low)
   - Blast radius if it breaks
   - Key dependencies and integrations

4. **Coverage Analysis**:
   - Critical gaps
   - User-facing functionality not tested
   - Edge cases worth covering

5. **Test Strategy**:
   - Unit, integration, end-to-end, performance, or security tests
   - What to test first (existing behavior preservation)
   - Maintenance considerations

6. **Output Format**:
   - **Business Impact**: [impact description]
   - **Risk Level**: [probability + blast radius]
   - **Existing Tests**: [summary of current coverage]
   - **Coverage Gaps**: [summary]
   - **Test Priority**: [Critical/High/Medium/Low]
   - **Recommended Tests**: [types + scope]
   - **First Test to Write**: [behavior preservation test]
   - **Next Steps**: [actions]

### Notes:
- Focus on user-critical paths over implementation details
- Test existing behavior before new behavior
- Prefer behavior testing over implementation testing
- Include maintenance burden in decision-making
```

---

## Key Questions to Always Ask

- **"What user journey breaks if this fails?"**
- **"How much revenue/trust is lost if wrong?"**
- **"Can we test this more efficiently at another level?"**
- **"Will this test still be valuable in 6–12 months?"**
- **"Are we testing behavior, not implementation?"**
- **"Do we have tests for existing behavior before adding new?"**

---

## Related

- See `intent-first-development-v1.0.md` for development decisions
- See `intent-first-code-review-v1.0.md` for review guidelines
