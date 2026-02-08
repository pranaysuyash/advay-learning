# Intent-First Product Philosophy v1.0
## "Validate Need Before Building Features"

**Core Principle:** Before building, modifying, or removing product features, investigate the actual user problem, validate the solution approach, and ensure the effort creates measurable value for users and business.

**Codebase-First Focus:** Enhance existing features before building new ones. Build upon what's working rather than starting fresh.

---

## Universal Investigation Framework

### Phase 1: Context Discovery
1. **Identify the opportunity** (user request, data insight, competitive gap, or strategic initiative)
2. **Understand the user problem** (who has this problem, when, and how severely?)
3. **Research existing solutions** (how do users currently solve this, and what are the limitations?)
4. **Assess strategic alignment** (how does this fit with business goals and product vision?)
5. **Review existing features** (what's already built that could be enhanced?)

### Phase 2: Problem Validation
- What specific job are users trying to get done?
- How painful is the current solution or lack thereof?
- What would success look like for users and business?
- What assumptions are we making about user needs and behavior?
- **Can we enhance existing features instead of building new ones?**

### Phase 3: Solution Prioritization
- **User Impact**: How many users are affected and how significantly?
- **Business Impact**: Effect on acquisition, retention, revenue, or strategic goals
- **Solution Confidence**: How confident are we this approach will work?
- **Development Effort**: Time, complexity, and resources required
- **Existing Foundation**: Can we build on current features?

---

## Quick Filter

Skip feature development if all true:
- Very few users experience this problem
- Existing workarounds are adequate
- High development effort for unclear user value
- Solution doesn't align with product strategy
- **Existing features could be enhanced instead**

→ **Document as product debt** in `product-debt.md`

---

## Product Priority Matrix

| User Impact | Business Impact | Solution Confidence | Existing Foundation | Priority |
|-------------|----------------|-------------------|---------------------|----------|
| High | High | High | Strong | **Critical – Enhance/Build immediately** |
| High | Medium | High | Strong | **High – Enhance/Build this quarter** |
| Medium | High | High | Strong | **Medium – Plan for next quarter** |
| High | High | Low | Strong | **Research and validate before building** |
| High | High | Any | Weak/None | **Evaluate new feature necessity** |
| Low | Low | Any | Any | **Skip or add to backlog for future consideration** |

---

## Codebase-First Product Rule

For *Critical* and *High* priority features:
1. **Enhance before building new** - improve existing features where possible
2. **Extend working patterns** - build upon features users already adopt
3. **Leverage existing foundation** - use what's already built and working
4. **Validate incrementally** - test enhancements before major new features
5. **Measure impact** - ensure changes actually help users

Advanced functionality, edge cases, and optimization can be added iteratively based on user feedback and adoption data.

---

## Ready-to-Use AI Prompt

```
You are to apply the Intent-First Product Philosophy to the following product opportunity.

### Product Context:
[Describe the feature idea, user request, or product opportunity]

### Investigation Requirements:
1. **Problem Analysis**:
   - What specific user problem does this address?
   - How many users experience this problem?
   - How do they currently solve it and what are the limitations?

2. **Existing Feature Analysis**:
   - What features already exist in this area?
   - How could existing features be enhanced?
   - What foundation is already built?

3. **Solution Validation**:
   - What approaches could solve this problem?
   - What assumptions are we making about user behavior?
   - How confident are we this solution will work?

4. **Impact Assessment**:
   - User value and experience improvement
   - Business impact on key metrics
   - Technical complexity and resource requirements

5. **Strategic Alignment**:
   - How does this fit product vision and roadmap?
   - What are the opportunity costs of building this?
   - How does this compare to other priorities?

6. **Output Table**:
   | Factor | Assessment | Notes |
   |--------|------------|-------|
   | User Impact |  |  |
   | Business Impact |  |  |
   | Solution Confidence |  |  |
   | Existing Foundation |  |  |
   | Development Effort |  |  |
   | Recommended Approach |  |  |
   | Enhancement Scope |  |  |
   | Success Metrics |  |  |

### Notes:
- Validate user problems before building solutions
- Consider enhancing existing features before building new ones
- Consider multiple solution approaches
- Define clear success criteria and metrics
- Ensure strategic alignment with product vision
```

---

## Key Questions to Always Ask

- **"What specific user problem are we solving?"**
- **"How do we know users want this solution?"**
- **"What's the simplest version that would validate our hypothesis?"**
- **"How will we measure if this actually improves user experience?"**
- **"What would we stop doing to make room for this?"**
- **"What assumptions could we be wrong about?"**
- **"Can we enhance existing features instead?"**

---

## Related

- See `intent-first-development-v1.0.md` for implementation decisions
- See `intent-first-ux-design-v1.0.md` for design considerations
