# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the project.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences. It helps future developers understand why certain decisions were made.

## Format

Each ADR follows this structure:
1. **Title**: Descriptive title
2. **Status**: Proposed, Accepted, Deprecated, Superseded
3. **Context**: What is the issue that we're seeing that is motivating this decision?
4. **Decision**: What is the change that we're proposing or have agreed to implement?
5. **Consequences**: What becomes easier or more difficult to do because of this change?

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| 001 | Local-First Architecture | Accepted | 2024-01-XX |
| 002 | Python Tech Stack | Accepted | 2024-01-XX |
| 003 | Storage Strategy | Accepted | 2024-01-XX |

## Creating New ADRs

1. Copy the template from `templates/adr-template.md`
2. Name it `XXX-short-description.md`
3. Update the index above
4. Link related ADRs

## Template

```markdown
# ADR XXX: Title

## Status
Proposed / Accepted / Deprecated / Superseded by [ADR YYY](YYY-new-adr.md)

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing or have agreed to implement?

## Consequences

### Positive
- 

### Negative
- 

## Implementation Notes
Any specific implementation details or notes.

## Related Decisions
- Link to related ADRs

## Notes
Any additional notes or context.
```
