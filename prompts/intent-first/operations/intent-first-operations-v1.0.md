# Intent-First Operations Philosophy v1.0
## "Automate What Scales, Not What's Easy"

**Core Principle:** Before implementing processes, automating workflows, or optimizing operations, investigate what business outcomes you're trying to achieve and ensure operational changes create measurable value and scalability.

**Codebase-First Focus:** Improve existing processes before building new ones. Automate current workflows incrementally.

---

## Universal Investigation Framework

### Phase 1: Context Discovery
1. **Identify the operational need** (process gap, efficiency problem, scaling challenge, or compliance requirement)
2. **Understand current state** (how is work currently being done and what are the pain points?)
3. **Assess business impact** (how does this operational issue affect business outcomes?)
4. **Map stakeholder needs** (who is affected and what do they need to be successful?)
5. **Review existing processes** (what's already in place that could be improved?)

### Phase 2: Value Analysis
- What business outcome will this operational improvement enable?
- How does the current process limitation affect productivity, quality, or growth?
- What would success look like for the people doing this work?
- How will this change scale as the business grows?
- **Can we improve existing processes before building new ones?**

### Phase 3: Operational Priority Assessment
- **Business Impact**: Effect on revenue, customer satisfaction, or strategic goals
- **Scalability Need**: How critical is this for handling business growth?
- **Team Productivity**: Impact on employee efficiency and satisfaction
- **Implementation Effort**: Time, cost, and complexity required
- **Existing Process Fit**: Can current processes be enhanced?

---

## Quick Filter

Consider simpler alternatives if all true:
- Current process works adequately for business needs
- Low frequency activity with minimal business impact
- High implementation effort for marginal improvement
- Process likely to change significantly in near future
- **Existing process could be improved without automation**

→ **Document as operational debt** in `ops-debt.md`

---

## Operations Priority Matrix

| Business Impact | Scalability Need | Team Productivity | Existing Process | Priority |
|----------------|-----------------|------------------|------------------|----------|
| High | High | High | Needs Improvement | **Critical – Implement immediately with full automation** |
| High | Medium | High | Needs Improvement | **High – Implement this quarter with process optimization** |
| Medium | High | Medium | Needs Improvement | **Medium – Plan for next quarter with scalable solution** |
| High | High | Low | Needs Improvement | **Evaluate user-friendly solution before full automation** |
| Low | Low | Any | Adequate | **Maintain status quo or simple process improvements** |

---

## Codebase-First Operations Rule

For *Critical* and *High* priority operational improvements:
1. **Improve before automating** - optimize current process first
2. **Enhance incrementally** - make small improvements, measure, iterate
3. **Document current state** - understand existing process fully
4. **Train on existing tools** - ensure team uses current capabilities
5. **Measure improvement** - verify changes actually help

Advanced automation, comprehensive integration, and optimization can be added iteratively based on usage patterns and business growth.

---

## Ready-to-Use AI Prompt

```
You are to apply the Intent-First Operations Philosophy to the following operational challenge.

### Operations Context:
[Describe the process, workflow, or operational issue]

### Investigation Requirements:
1. **Business Impact Analysis**:
   - What business outcome is affected by this operational issue?
   - How does the current process limit productivity, growth, or quality?
   - What's the cost of not improving this process?

2. **Current State Assessment**:
   - How is this work currently being done?
   - What are the main pain points and inefficiencies?
   - How much time and effort is invested in this process?
   - What existing processes could be improved?

3. **Scalability Evaluation**:
   - How will this process need to change as the business grows?
   - What would happen if volume increased 5x or 10x?
   - Are there compliance or quality requirements to consider?

4. **Solution Options**:
   - Process improvement without technology
   - Partial automation of high-impact steps
   - Full automation and integration
   - Outsourcing or vendor solutions

5. **Output Table**:
   | Factor | Assessment | Notes |
   |--------|------------|-------|
   | Business Impact |  |  |
   | Scalability Need |  |  |
   | Team Productivity |  |  |
   | Existing Process |  |  |
   | Implementation Effort |  |  |
   | Recommended Approach |  |  |
   | Improvement Scope |  |  |
   | Success Metrics |  |  |

### Notes:
- Focus on business outcomes, not just process efficiency
- Consider scalability and growth requirements
- Evaluate automation value vs. implementation complexity
- Ensure team adoption and change management needs
- Improve existing processes before building new ones
```

---

## Key Questions to Always Ask

- **"What business outcome will this operational improvement enable?"**
- **"How will this process need to scale as our business grows?"**
- **"What's the total cost of the current manual process including errors and delays?"**
- **"How will we measure if this improvement actually helps the business?"**
- **"What's the simplest solution that would solve 80% of the problem?"**
- **"How will we ensure the team successfully adopts this new process?"**
- **"Can we improve existing processes before building new ones?"**

---

## Related

- See `intent-first-development-v1.0.md` for engineering operations
- See `intent-first-deployment-v1.0.md` for deployment operations
