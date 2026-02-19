# Intent-First UX Design Philosophy v1.0

## "Design for the Experience, Not the Pixels"

**Core Principle:** Before creating, modifying, or removing any design element, investigate the user's actual needs, workflows, and pain points to ensure every design change has measurable user and business impact.

**Codebase-First Focus:** Evolve existing UI patterns. Build upon current design system rather than introducing new patterns unless necessary.

---

## Universal Investigation Framework

### Phase 1: Context Discovery

1. **Identify the design challenge** (new feature, usability issue, or aesthetic update)
2. **Research existing user behavior** (analytics, heatmaps, support tickets, user interviews)
3. **Map current user journeys** (compare actual usage patterns with intended flows)
4. **Analyze design system context** (check consistency with existing patterns, components, and accessibility standards)

### Phase 2: User Intent Analysis

- What task is the user trying to accomplish?
- What's their mental model and expectations?
- Where do users currently struggle or drop off?
- What would success look like from their perspective?
- Does this affect a core or secondary workflow?

### Phase 3: Design Impact Assessment

- **User Impact**: Improvement in task success, speed, or error rate
- **Business Impact**: Effect on conversion, retention, satisfaction, or compliance
- **Design Effort**: Time to design, validate, and document
- **Technical Complexity**: Development and QA effort, performance implications
- **Design System Fit**: Consistency with existing patterns

---

## Quick Filter

Skip detailed design work if all true:

- Purely cosmetic with no measurable usability improvement
- Very low-traffic area with minimal impact
- High implementation complexity for minimal gain
- Recent change with no evidence of user problems

→ **Document as UX debt** in `ux-debt.md`

---

## Design Priority Matrix

| User Impact | Business Impact | Implementation Effort | Existing Pattern Fit | Priority |
|-------------|----------------|---------------------|---------------------|----------|
| High | High | Low–Medium | Strong | **Critical – Design immediately** |
| High | Medium | Low–Medium | Strong | **High – Include in next design sprint** |
| Medium | High | Low | Strong | **Medium – Schedule in upcoming iterations** |
| High | High | High | Strong | **Enhance existing, defer new patterns** |
| High | High | Any | Weak/None | **Evaluate new pattern necessity** |
| Low | Low | Any | Any | **Defer or log as future consideration** |

---

## Codebase-First Design Rule

For *Critical* and *High* priority items:

1. **Use existing components** first - leverage current design system
2. **Extend, don't replace** - enhance existing patterns before creating new ones
3. **Maintain consistency** - ensure new elements fit established visual language
4. **Document variations** - if new patterns are necessary, document when to use them
5. **Test with users** - validate changes against real user behavior

**When introducing new patterns:**

- Must solve a problem existing patterns cannot
- Should be reusable across multiple features
- Needs documentation and design rationale

---

## Ready-to-Use AI Prompt

```
You are to apply the Intent-First UX Design Philosophy to the following design challenge.

### Design Element/Challenge:
[Describe the UI component, flow, or experience needing review]

### Investigation Requirements:
1. **User Context**:
   - Task users are trying to accomplish
   - Current experience & pain points
   - Insights from analytics/feedback

2. **Existing Design Analysis**:
   - What components/patterns already exist?
   - How does current design handle similar tasks?
   - What's working well that we should preserve?

3. **Impact Assessment**:
   - User experience impact (high/medium/low)
   - Business metric impact (conversion, retention, satisfaction)
   - Implementation complexity

4. **Design System Constraints**:
   - Technical limitations
   - Design system consistency requirements
   - Accessibility and performance considerations
   - Pattern reuse opportunities

5. **Solution Options**:
   - Quick wins using existing patterns
   - Medium-term improvements (extend existing components)
   - New patterns (only if necessary)

6. **Output Table**:
   | Problem | User Impact | Business Impact | Effort | Existing Pattern Fit | Recommendation | Next Steps |
   |---------|-------------|----------------|--------|---------------------|----------------|------------|

### Notes:
- Prioritize completion of tasks over visual polish
- Validate assumptions with real user testing
- Address accessibility and performance from the start
- Reuse existing patterns unless there's a compelling reason not to
```

---

## Key Questions to Always Ask

- **"What specific user problem does this solve?"**
- **"How will we measure success?"**
- **"Can users with disabilities complete this task?"**
- **"Does it fit our design system, and if not, why?"**
- **"What's the simplest version that improves the experience?"**
- **"Have we validated this with real users?"**
- **"Can we achieve this with existing components?"**

---

## Related

- See `intent-first-development-v1.0.md` for implementation considerations
- See `intent-first-product-v1.0.md` for feature decisions
