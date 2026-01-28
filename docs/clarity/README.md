# Clarity & Questions System

**Purpose**: Centralized place for questions, clarifications, research needs, and decisions that require input from multiple agents or stakeholders.

## How It Works

1. **Create a Question**: Add a new entry to `questions.md` with status `OPEN`
2. **Agent Research**: Any agent can pick up an open question and research/propose answers
3. **Discussion**: Multiple agents can contribute perspectives
4. **Resolution**: Question is marked `RESOLVED` with final decision documented
5. **Implementation**: Create tickets/work items based on resolution

## Question Status

- `OPEN` - Needs input/research
- `IN_RESEARCH` - Being investigated by an agent
- `PENDING_DECISION` - Awaiting stakeholder decision
- `RESOLVED` - Decision made, documented
- `SUPERSEDED` - Replaced by newer question/issue

## File Structure

```
docs/clarity/
├── README.md           # This file
├── questions.md        # Active and resolved questions
├── decisions.md        # Architecture/feature decisions log
└── research/           # Research findings and reports
    └── YYYY-MM-DD-topic.md
```

## Question Template

```markdown
### Q-[NUMBER]: [Brief Title]
**Status**: OPEN | IN_RESEARCH | PENDING_DECISION | RESOLVED | SUPERSEDED
**Created**: YYYY-MM-DD
**Tags**: #tag1 #tag2

**Question**:
[Clear description of what needs clarification]

**Context**:
[Background information, why this matters]

**Options/Approaches** (if applicable):
1. [Option A]
2. [Option B]

**Research Notes**:
- [Agent Name]: [Findings, links, evidence]

**Decision** (when resolved):
[Final decision with rationale]

**Next Steps**:
- [Action items]
```

## When to Use This System

- Architecture decisions with trade-offs
- UX behavior that needs clarification
- Performance optimization strategies
- Feature prioritization questions
- Integration approaches
- Security/privacy concerns
- Anything needing multi-agent input

## When NOT to Use

- Simple bugs (use WORKLOG_TICKETS.md)
- Clear feature requests (create ticket directly)
- Already-decided implementations

---

**Last Updated**: 2026-01-28
