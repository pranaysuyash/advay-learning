# Intent-First Documentation Philosophy v1.0
## "Document What Developers Actually Need"

**Core Principle:** Before writing, updating, or removing documentation, investigate what knowledge gaps exist, what decisions need context, and what information developers actually need to be effective.

**Codebase-First Focus:** Document existing code before new features. Keep docs in sync with current implementation.

---

## Universal Investigation Framework

### Phase 1: Context Discovery
1. **Identify the knowledge gap** (what information is missing or unclear?)
2. **Understand the audience** (who needs this information and what's their context?)
3. **Research existing documentation** (what already exists and why isn't it working?)
4. **Analyze usage patterns** (how do people currently find and use information?)
5. **Review existing code** (what's implemented that needs documenting?)

### Phase 2: Intent Analysis
- What specific problem will this documentation solve?
- What decisions or actions will this information enable?
- Who will read this and what do they need to accomplish?
- What happens when this information becomes outdated?
- **How does this relate to existing documentation?**

### Phase 3: Documentation Value Assessment
- **Knowledge Impact**: How critical is this information for success?
- **Audience Size**: How many people need this information?
- **Update Frequency**: How often will this need maintenance?
- **Discovery Effort**: How easy is it to find when needed?
- **Codebase Alignment**: Does this match current implementation?

---

## Quick Filter

Skip detailed documentation if all true:
- Information is self-explanatory from code or UI
- Very few people need this specific information
- Information changes frequently and is hard to keep current
- Existing documentation already covers this adequately
- **Code is changing rapidly (wait for stabilization)**

→ **Document as documentation debt** in `docs-debt.md`

---

## Documentation Priority Matrix

| Knowledge Impact | Audience Size | Maintenance Effort | Codebase Alignment | Priority |
|-----------------|---------------|-------------------|-------------------|----------|
| High | Large | Low-Medium | Aligned | **Critical – Document immediately** |
| High | Medium | Low-Medium | Aligned | **High – Document this sprint** |
| Medium | Large | Low | Aligned | **Medium – Plan for next iteration** |
| High | Large | High | Misaligned | **Update docs to match code first** |
| Low | Small | Any | Any | **Skip or create minimal reference** |

---

## Codebase-First Documentation Rule

For *Critical* and *High* priority items:
1. **Document existing code** before new features
2. **Keep docs in sync** - update when code changes
3. **Reference actual code** - link to files, functions, lines
4. **Document decisions** - why, not just what
5. **Make discoverable** - put where people look for it

Advanced features like comprehensive examples, edge case handling, or detailed API references can be added iteratively based on user feedback.

---

## Ready-to-Use AI Prompt

```
You are to apply the Intent-First Documentation Philosophy to the following documentation need.

### Documentation Context:
[Describe the code, feature, process, or decision that needs documentation]

### Investigation Requirements:
1. **Knowledge Gap Analysis**:
   - What specific information is missing?
   - Who is struggling without this documentation?
   - What questions come up repeatedly?

2. **Codebase Review**:
   - What code needs documenting?
   - How does current implementation work?
   - Are there existing docs that need updating?

3. **Audience Assessment**:
   - Who will read this documentation?
   - What is their background and context?
   - What are they trying to accomplish?

4. **Content Strategy**:
   - What format best serves the audience?
   - How detailed should this documentation be?
   - How will people discover this information?

5. **Maintenance Considerations**:
   - How often will this need updates?
   - Who will maintain this documentation?
   - How will we know if it becomes outdated?

6. **Output Table**:
   | Factor | Assessment | Notes |
   |--------|------------|-------|
   | Knowledge Impact |  |  |
   | Audience Size |  |  |
   | Maintenance Effort |  |  |
   | Codebase Alignment |  |  |
   | Recommended Format |  |  |
   | MVP Content |  |  |
   | Success Metrics |  |  |

### Notes:
- Focus on enabling decisions and actions, not just describing features
- Prioritize information that prevents confusion or mistakes
- Consider maintenance burden and keep documentation sustainable
- Test documentation with actual users when possible
- Keep docs in sync with code
```

---

## Key Questions to Always Ask

- **"What specific decision or action will this documentation enable?"**
- **"Who exactly needs this information and when do they need it?"**
- **"What happens if someone can't find this information?"**
- **"How will we know if this documentation is helping people?"**
- **"Who will maintain this and how will they know when it's outdated?"**
- **"Is there a simpler way to make this information unnecessary?"**
- **"Does this match current code implementation?"**

---

## Related

- See `intent-first-development-v1.0.md` for code decisions
- See `reality-first-repo-auditor-v1.0.md` for docs-vs-code verification
