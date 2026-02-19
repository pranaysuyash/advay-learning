# Prompt: Research AI Technology or Approach

**Version:** 1.0.0
**Purpose:** Deep-dive research into specific AI technology or approach
**When to Use:** Before making major technical decisions, evaluating new providers
**Estimated Time:** 2-4 hours

---

## Context

You are conducting focused research on a specific AI technology, provider, or approach for the Advay Vision Learning app. This prompt guides thorough investigation with documented findings.

## Research Setup

### Research Topic

- **Topic:** [Fill in specific topic]
- **Research Goal:** [What decision will this inform?]
- **Time Budget:** [How long to spend]
- **Researcher:** [Name]
- **Date:** [Date]

---

## Research Categories

### Category A: Provider Research

Evaluating an AI service provider (Claude, OpenAI, ElevenLabs, etc.)

### Category B: Technology Research

Understanding a technology approach (local LLMs, TTS engines, etc.)

### Category C: Implementation Research

How to implement a specific capability

### Category D: Safety/Compliance Research

Understanding requirements and best practices

---

## Category A: Provider Research Template

### Provider Overview

```markdown
## Provider: [Name]

### Basic Information
- **Company:** [Name]
- **Product:** [Service name]
- **Website:** [URL]
- **Documentation:** [URL]
- **Pricing Page:** [URL]

### Service Description
[What does this provider offer?]

### Target Use Cases
[What is it designed for?]
```

### Capability Assessment

| Capability | Supported | Quality | Notes |
|------------|-----------|---------|-------|
| Text Generation | Yes/No | 1-5 | |
| Conversation | Yes/No | 1-5 | |
| Child-Appropriate | Yes/No | 1-5 | |
| Low Latency | Yes/No | 1-5 | |
| Streaming | Yes/No | 1-5 | |
| Custom Prompts | Yes/No | 1-5 | |
| Content Filtering | Yes/No | 1-5 | |

### Pricing Analysis

```markdown
## Pricing Structure

### Free Tier
- **Limits:** [Description]
- **Sufficient for:** [Use case]

### Paid Tiers
| Tier | Price | Limits | Best For |
|------|-------|--------|----------|
| | | | |
| | | | |

### Cost Estimation
- **Low usage (100 users):** $X/month
- **Medium usage (1000 users):** $X/month
- **High usage (10000 users):** $X/month

### Cost Optimization Options
- [Option 1]
- [Option 2]
```

### Technical Integration

```markdown
## Integration Details

### API Style
- [ ] REST
- [ ] WebSocket
- [ ] SDK (languages: )

### Authentication
- [ ] API Key
- [ ] OAuth
- [ ] Other:

### Rate Limits
- **Requests per minute:**
- **Tokens per minute:**
- **Concurrent connections:**

### SDK/Libraries
- **JavaScript:** [Package name, quality]
- **Python:** [Package name, quality]
- **TypeScript types:** [Available?]

### Code Example
```typescript
// Example API call
```

```

### Safety & Compliance

| Aspect | Status | Details |
|--------|--------|---------|
| COPPA Compliant | Yes/No | |
| GDPR Compliant | Yes/No | |
| Data Retention | | |
| Content Moderation | | |
| Child Safety Features | | |
| Audit Logging | | |

### Pros & Cons

| Pros | Cons |
|------|------|
| | |
| | |
| | |

### Recommendation

```markdown
## Recommendation

### Overall Score: X/10

### Use Cases
- **Best for:** [Scenarios]
- **Not recommended for:** [Scenarios]

### Decision
- [ ] Adopt as primary provider
- [ ] Adopt as fallback provider
- [ ] Monitor for future use
- [ ] Do not use

### Rationale
[Explain decision]
```

---

## Category B: Technology Research Template

### Technology Overview

```markdown
## Technology: [Name]

### What Is It?
[Clear explanation]

### How Does It Work?
[Technical explanation at appropriate level]

### Current State
- **Maturity:** [Emerging/Maturing/Mature]
- **Adoption:** [Niche/Growing/Widespread]
- **Trend:** [Declining/Stable/Growing]
```

### Available Options

| Option | Type | Maturity | Performance | Cost |
|--------|------|----------|-------------|------|
| | | | | |
| | | | | |
| | | | | |

### Comparison Matrix

| Criteria | Option A | Option B | Option C |
|----------|----------|----------|----------|
| Speed | | | |
| Quality | | | |
| Cost | | | |
| Ease of Use | | | |
| Local Support | | | |
| Child Suitability | | | |

### Proof of Concept

```markdown
## POC Details

### Objective
[What we're testing]

### Setup
[How to set up the test]

### Test Cases
1. [Test case 1]
2. [Test case 2]
3. [Test case 3]

### Results
| Test | Expected | Actual | Pass/Fail |
|------|----------|--------|-----------|
| | | | |
| | | | |

### Observations
[What did we learn?]
```

### Best Practices

```markdown
## Best Practices for [Technology]

### Do
- [Practice 1]
- [Practice 2]
- [Practice 3]

### Don't
- [Anti-pattern 1]
- [Anti-pattern 2]
- [Anti-pattern 3]

### Common Pitfalls
1. [Pitfall and how to avoid]
2. [Pitfall and how to avoid]
```

---

## Category C: Implementation Research Template

### Problem Definition

```markdown
## Implementation Research: [Feature]

### Problem Statement
[What are we trying to implement?]

### Requirements
- **Functional:** [List]
- **Performance:** [List]
- **Safety:** [List]
- **Privacy:** [List]

### Constraints
- [Constraint 1]
- [Constraint 2]
```

### Existing Solutions

| Solution | Source | Approach | Pros | Cons |
|----------|--------|----------|------|------|
| | | | | |
| | | | | |

### Code Examples

```markdown
## Example 1: [Source]

### Context
[Where this code is from]

### Code
```typescript
// Code example
```

### What We Can Learn

[Key takeaways]

### What We'd Change

[Adaptations for our use case]

```

### Architecture Options

```markdown
## Option A: [Name]

### Diagram
[ASCII or description]

### Components
- [Component 1]
- [Component 2]

### Data Flow
[Description]

### Pros
- [Pro 1]
- [Pro 2]

### Cons
- [Con 1]
- [Con 2]
```

### Recommended Approach

```markdown
## Recommended Implementation

### Architecture
[Selected approach]

### Technology Stack
- [Technology 1]: [Reason]
- [Technology 2]: [Reason]

### Implementation Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Estimated Effort
- **Development:** [Time]
- **Testing:** [Time]
- **Integration:** [Time]

### Risks & Mitigations
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| | | | |
```

---

## Category D: Safety/Compliance Research Template

### Regulatory Overview

```markdown
## Regulation: [Name]

### Full Name
[Official name]

### Jurisdiction
[Where it applies]

### Effective Date
[When it took effect]

### Enforcement Body
[Who enforces]

### Summary
[What it requires]
```

### Requirements Checklist

| Requirement | Description | Our Status | Gap |
|-------------|-------------|------------|-----|
| | | | |
| | | | |

### Best Practices Research

```markdown
## Industry Best Practices

### Source 1: [Name]
- **Organization:** [Name]
- **Document:** [Title]
- **Key Recommendations:**
  1. [Recommendation]
  2. [Recommendation]

### Source 2: [Name]
- **Organization:** [Name]
- **Document:** [Title]
- **Key Recommendations:**
  1. [Recommendation]
  2. [Recommendation]
```

### Compliance Gap Analysis

| Area | Requirement | Current State | Gap | Remediation |
|------|-------------|---------------|-----|-------------|
| | | | | |
| | | | | |

---

## Research Output Template

```markdown
# Research Report: [Topic]

## Metadata
- **Researcher:** [Name]
- **Date:** [Date]
- **Time Spent:** [Hours]
- **Category:** [A/B/C/D]

## Executive Summary
[2-3 paragraphs summarizing findings]

## Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

## Detailed Analysis
[Main body of research]

## Recommendations
| Priority | Recommendation | Rationale |
|----------|----------------|-----------|
| P0 | | |
| P1 | | |
| P2 | | |

## Open Questions
1. [Question needing further research]
2. [Question needing stakeholder input]

## Resources
- [Resource 1]: [URL/Reference]
- [Resource 2]: [URL/Reference]

## Appendices
[Supporting materials]
```

---

## Research Sources

### AI/ML Documentation

- Anthropic Docs: <https://docs.anthropic.com>
- OpenAI Docs: <https://platform.openai.com/docs>
- Hugging Face: <https://huggingface.co/docs>
- TensorFlow.js: <https://www.tensorflow.org/js>
- MediaPipe: <https://developers.google.com/mediapipe>

### Educational Technology

- EdTech Evidence: <https://www.edtechevidence.org>
- What Works Clearinghouse: <https://ies.ed.gov/ncee/wwc/>
- Common Sense Media: <https://www.commonsensemedia.org>

### Child Safety

- COPPA: <https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy>
- kidSAFE: <https://www.kidsafeseal.com>
- PRIVO: <https://www.privo.com>

### Technical Benchmarks

- Papers With Code: <https://paperswithcode.com>
- Hugging Face Leaderboards: <https://huggingface.co/spaces>
- AI Benchmarks: Various model-specific resources

---

## Related Prompts

- After research: `ai-feature-explore-v1.0.md` (ideation)
- For decisions: See decision template in project management
- For implementation: `ai-feature-build-v1.0.md`
