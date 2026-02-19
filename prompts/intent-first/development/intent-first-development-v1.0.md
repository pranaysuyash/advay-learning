# Intent-First Development Philosophy v1.0

## "Investigate Intent Before Acting"

**Core Principle:** Before removing, suppressing, or "fixing" any code, feature, or element — investigate the original intent and determine if completing/enhancing it would create more value than removing it.

**Codebase-First Focus:** Work with what's already there. Enhance existing features rather than starting from scratch unless the current implementation is fundamentally flawed.

---

## Universal Investigation Framework

### Phase 1: Context Discovery

1. **Identify the element** (code, feature, UI element, database structure, etc.)
2. **Search for references** across codebase, documentation, user stories, designs
3. **Check related systems** (UI, backend, DB, third-party integrations)
4. **Review history** (Git commits, PRs, issue discussions, meeting notes)

### Phase 2: Intent Analysis

- What user problem was this meant to solve?
- What workflow was this part of?
- Are there similar completed features showing the pattern?
- Would users expect this functionality to work?
- **What's already working that we can build upon?**

### Phase 3: Impact Assessment

- **User Value**: High/Medium/Low impact on user experience
- **Business Value**: Revenue, retention, or operational impact
- **Technical Effort**: Hours/days/weeks to complete properly
- **Operational Risk**: New monitoring, alerts, data storage, or maintenance overhead
- **Codebase Fit**: How well does this integrate with existing patterns?

---

## Quick Filter

Skip deep analysis if all true:

- No user-facing connection
- No business value identified
- High technical effort required
- No strategic importance
- **No existing foundation to build upon**

→ **Default to "Document as Technical Debt"**

---

## Decision Matrix

| User Value | Technical Effort | Operational Risk | Existing Foundation | Action |
|------------|------------------|------------------|---------------------|---------|
| High | Low-Medium | Low | Strong | **Enhance immediately** |
| High | High | Low-Medium | Strong | **Plan incremental enhancement** |
| High | High | Low-Medium | Weak/None | **Evaluate rebuild vs refactor** |
| Medium | Low | Low | Strong | **Quick enhancement if time permits** |
| Medium | Medium-High | Any | Any | **Document as technical debt** |
| Low | Any | Any | Any | **Consider removal with stakeholder approval** |
| Any | Any | High | Any | **Defer until risk mitigated** |

---

## Codebase-First Enhancement Rule

For *Critical* and *High* priority items:

1. **Start with what's there** - understand existing implementation fully
2. **Build incrementally** - enhance rather than replace where possible
3. **Preserve working patterns** - follow established codebase conventions
4. **Add, don't destroy** - extend functionality before removing old code
5. **Test at each step** - ensure existing functionality remains intact

---

## Ready-to-Use AI Prompt

```
You are to apply the Intent-First Development Philosophy to the following element.

### Element:
[Paste file path, code snippet, or description]

### Investigation Requirements:
1. **Identify Intent**: Based on code search patterns, documentation, commit history, and similar features, determine what the original purpose was.

2. **Assess Existing Foundation**:
   - What's already implemented and working?
   - What patterns does this follow?
   - How does it integrate with the rest of the system?

3. **Assess Enhancement Potential**:
   - Would completing/enhancing this add user or business value?
   - Is there evidence the frontend/backend expected this feature?
   - Can we build incrementally on what's there?

4. **Risk & Effort**:
   - Technical effort (low/medium/high)
   - Risk to stability/security/performance
   - Operational impact (monitoring, alerts, data growth)
   - Compatibility with existing codebase

5. **Decision Options**:
   - Enhance existing (incremental improvement)
   - Refactor then enhance (clean up, then build)
   - Replace (only if foundation is fundamentally flawed)
   - Document as technical debt
   - Remove (with stakeholder approval)

6. **Output Format**:
   - **Original Intent**: [summary]
   - **Evidence Found**: [list of references]
   - **Existing Foundation**: [what's already there]
   - **Value Assessment**: [user/business impact]
   - **Risk/Effort**: [summary]
   - **Recommendation**: [Enhance/Refactor/Replace/Defer/Remove + reasoning]
   - **Next Steps**: [actions]

### Notes:
- Apply this for audits, refactors, or legacy cleanup - not just PRs
- Favor enhancement over removal when there is clear user/business value
- Work with existing patterns unless they are fundamentally broken
- Limit scope to incremental improvements, defer major rewrites unless critical
```

---

## Key Questions to Always Ask

- **"What feature or improvement is this trying to enable?"**
- **"Was this supposed to be used, or is it truly dead code?"**
- **"What would make this code complete and valuable?"**
- **"What existing code can we build upon?"**
- **"Can we enhance this incrementally rather than starting over?"**

---

## Related

- See `reality-first-repo-auditor-v1.0.md` for docs-vs-code verification
- See `intent-first-testing-v1.0.md` for testing strategy
- See `intent-first-code-review-v1.0.md` for review guidelines
