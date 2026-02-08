# Intent-First Data Philosophy v1.0
## "Question Data Before Acting on It"

**Core Principle:** Before making decisions based on data or implementing data changes, investigate the data quality, context, and business relevance to ensure insights are accurate, actionable, and aligned with reality.

**Codebase-First Focus:** Work with existing data structures. Enhance data collection incrementally rather than redefining schemas unless necessary.

---

## Universal Investigation Framework

### Phase 1: Data Context Discovery
1. **Identify data sources** (where does the data originate and how is it collected?)
2. **Assess collection methods** (look for sampling bias, gaps, or misclassification)
3. **Check data lineage** (understand transformations, joins, and enrichments)
4. **Review business context** (identify conditions/events that may influence data trends)
5. **Review existing schema** (what data structures already exist?)

### Phase 2: Intent Analysis
- What business decision is this data meant to inform?
- Are we looking at the right metrics for the question?
- What assumptions are we making about completeness and accuracy?
- What external or operational factors could influence these numbers?
- **Can we use existing data structures or do we need new ones?**

### Phase 3: Data Reliability Assessment
- **Completeness**: Is all expected data present?
- **Accuracy**: Are values measured and recorded correctly?
- **Consistency**: Do sources agree and trends align over time?
- **Timeliness**: Is the data current enough for the decision?
- **Relevance**: Does it truly measure what matters for the business question?
- **Schema Fit**: Does this align with existing data structures?

---

## Quick Filter

Investigate further if any are true:
- Source or collection method recently changed
- Missing data in high-impact periods
- Unexplained spikes/drops without known cause
- Conflicting trends across sources
- No clear decision linked to the data
- **New data structures proposed when existing ones could work**

→ **Validate quality and schema fit before using in decision-making**

---

## Data Decision Matrix

| Data Quality | Business Impact | Decision Urgency | Schema Fit | Action |
|-------------|----------------|------------------|------------|---------|
| High | High | Any | Strong | **Proceed with confidence** |
| Medium | High | Low | Strong | **Improve data quality first** |
| Medium | High | High | Strong | **Proceed with caveats + monitoring** |
| Low | Any | Any | Any | **Do not base decision on this data** |
| High | Low | Any | Strong | **Proceed but focus on higher-impact metrics** |
| Any | Any | Any | Weak/None | **Evaluate schema change necessity** |

---

## Codebase-First Data Rule

Use the **smallest set of high-quality, relevant, and recent** data to make the decision:
1. **Leverage existing data** before creating new collection
2. **Extend schemas incrementally** - add fields before replacing tables
3. **Maintain backward compatibility** - ensure existing queries still work
4. **Document data lineage** - track where data comes from
5. **Deepen analysis gradually** - start with simple metrics, expand as needed

Avoid over-analysis when a decision can be made confidently with less.

---

## Ready-to-Use AI Prompt

```
You are to apply the Intent-First Data Philosophy to the following dataset or decision.

### Context:
[Describe the data, metrics, or analysis in use]

### Investigation Requirements:
1. **Data Source**:
   - Origin and collection process
   - Known biases or collection issues
   - Transformations applied

2. **Existing Data Structure**:
   - Current schema and relationships
   - Existing data that could answer this question
   - Previous similar analyses

3. **Quality Assessment**:
   - Completeness
   - Accuracy
   - Consistency
   - Timeliness
   - Relevance

4. **Business Context**:
   - Decision this data supports
   - External factors influencing results
   - Alignment with other metrics

5. **Alternative Explanations**:
   - Possible confounding factors
   - Other interpretations of the pattern

6. **Output Table**:
   | Factor | Assessment | Notes |
   |--------|------------|-------|
   | Data Quality |  |  |
   | Schema Fit |  |  |
   | Business Context |  |  |
   | Key Insights |  |  |
   | Confidence Level |  |  |
   | Recommended Actions |  |  |
   | Additional Data Needed |  |  |

### Notes:
- Validate before acting
- Consider context and limitations
- Question assumptions
- Prefer existing data structures
```

---

## Key Questions to Always Ask

- **"How reliable is this data and what are its limitations?"**
- **"What business context might affect interpretation?"**
- **"What else could explain these patterns?"**
- **"Are we measuring the right thing?"**
- **"How confident should we be?"**
- **"What data would increase confidence?"**
- **"Can we use existing data structures?"**

---

## Related

- See `intent-first-product-v1.0.md` for product metrics
- See `intent-first-development-v1.0.md` for implementation
