# Intent-First Code Review Philosophy v1.0

## "Understand Before You Judge"

**Core Principle:** Before requesting changes or approving code, investigate the problem the code solves, the constraints the author faced, and the broader system context to provide valuable, actionable feedback.

**Codebase-First Focus:** Review in context of existing patterns. Ensure changes integrate well with current codebase rather than introducing inconsistency.

---

## Universal Investigation Framework

### Phase 1: Context Discovery

1. **Understand the problem** (read linked issues, requirements, or user stories)
2. **Review the approach** (understand the solution strategy and alternatives considered)
3. **Check system impact** (how does this change affect other parts of the system?)
4. **Assess constraints** (time, technical, or business limitations that influenced decisions)

### Phase 2: Intent Analysis

- What user or business problem is this solving?
- What constraints or requirements influenced the implementation?
- How does this fit into the larger system architecture?
- Were simpler approaches considered and why were they rejected?
- **Does this follow or enhance existing codebase patterns?**

### Phase 3: Review Prioritization

- **Correctness Impact**: Functional reliability and data integrity
- **Security Impact**: Potential vulnerabilities or exposure
- **Performance Impact**: Efficiency, scalability, resource usage
- **Maintainability Impact**: Readability, extensibility, technical debt risk
- **Consistency Impact**: Alignment with existing codebase patterns
- **Style Impact**: Alignment with agreed team coding standards

---

## Quick Filter

Skip deep review unless one is true:

- Touches authentication, authorization, payment, or data handling
- Changes high-traffic or high-risk code paths
- Introduces a new architectural pattern
- Modifies performance-critical logic
- Removes tests or reduces coverage
- **Deviates significantly from existing patterns**

→ If none apply: **skim for maintainability, consistency & style, don't block unless standards are violated**

---

## Review Priority Matrix

| Issue Type | Impact Level | Action Required |
|------------|-------------|-----------------|
| Security/Correctness | Any | **Request changes immediately** |
| Pattern Consistency | High | **Request changes to match codebase** |
| Performance | High | **Request changes with benchmarks** |
| Maintainability | High | **Request changes with reasoning** |
| Architecture | Medium–High | **Discuss and suggest alternatives** |
| Style/Preference | Any | **Comment but don't block unless standard** |

---

## Codebase-First Review Rule

Always ensure the PR passes these core checks before approval:

1. **Security** – No vulnerabilities or unsafe handling of data
2. **Correctness** – Code works as intended and passes all tests
3. **Maintainability** – Readable, follows team conventions, won't create unnecessary debt
4. **Consistency** – Follows existing codebase patterns unless there's compelling reason not to

**Additional checks for enhancements:**

- Does it preserve existing behavior?
- Does it integrate cleanly with current architecture?
- Are there existing utilities/functions that could be reused?

Optimization, micro-performance tweaks, and style perfection are **secondary** unless they block these four.

---

## Ready-to-Use AI Prompt

```
You are to apply the Intent-First Code Review Philosophy to the following change.

### Context:
[Paste PR description, linked issues, and code changes]

### Investigation Requirements:
1. **Problem Understanding**:
   - What problem is this solving?
   - What requirements and constraints influenced the solution?
   - How does this fit into the larger system?

2. **Codebase Context**:
   - What existing patterns does this relate to?
   - Are there similar implementations elsewhere?
   - Does this follow established conventions?

3. **Solution Analysis**:
   - Is the approach appropriate for the problem?
   - Were simpler alternatives possible?
   - What trade-offs were made and why?
   - Could existing code be reused?

4. **Impact Assessment**:
   - Correctness and reliability
   - Security implications
   - Performance impact
   - Maintainability
   - Consistency with existing code

5. **Review Categories**:
   - Blocking issues (must fix)
   - Consistency issues (should align with codebase)
   - Important issues (should fix)
   - Suggestions (optional)

6. **Output Table**:
   | Category | Issue | Impact | Action Required |
   |----------|-------|--------|-----------------|

### Notes:
- Focus on security, correctness, maintainability, and consistency first
- Provide actionable, specific feedback
- Acknowledge well-made decisions
- Ask for clarification if intent is unclear
- Suggest existing patterns/utilities when applicable
```

---

## Key Questions to Always Ask

- **"What problem is this solving and is the solution appropriate?"**
- **"Are there hidden security or correctness issues?"**
- **"Will future developers understand and maintain this code?"**
- **"Does this follow existing codebase patterns?"**
- **"Is my feedback specific, actionable, and justified?"**
- **"Have I acknowledged what the author did well?"**
- **"Could existing code be reused here?"**

---

## Related

- See `intent-first-development-v1.0.md` for development decisions
- See `reality-first-repo-auditor-v1.0.md` for docs-vs-code verification
