# Product Roadmap

## Vision

Create an engaging, AI-powered learning companion for Advay that makes education fun through natural hand and face interactions.

## MVP (Minimum Viable Product)

**Target**: Core functionality working, single learning module

### Phase 1: Foundation (Weeks 1-2)

| Feature | Status | Priority |
|---------|--------|----------|
| Project setup & architecture | 🔲 Planned | P0 |
| Camera integration | 🔲 Planned | P0 |
| Hand tracking (MediaPipe) | 🔲 Planned | P0 |
| Basic UI framework | 🔲 Planned | P0 |
| Drawing canvas | 🔲 Planned | P0 |

### Phase 2: Core Interaction (Weeks 3-4)

| Feature | Status | Priority |
|---------|--------|----------|
| Hand gesture recognition (pinch, point) | 🔲 Planned | P0 |
| Drawing with hand gestures | 🔲 Planned | P0 |
| Face tracking basics | 🔲 Planned | P1 |
| Basic gamification (points, sounds) | 🔲 Planned | P1 |

### Phase 3: First Learning Module (Weeks 5-6)

| Feature | Status | Priority |
|---------|--------|----------|
| English alphabet tracing | 🔲 Planned | P0 |
| Letter recognition feedback | 🔲 Planned | P0 |
| Progress tracking | 🔲 Planned | P1 |
| Simple rewards system | 🔲 Planned | P1 |

**MVP Definition**: Child can open app, use hand to trace letters, get feedback, see progress.

## Post-MVP Features

### Language Learning

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Hindi alphabet (Swar & Vyanjan) | 🔲 Planned | P1 | Devanagari script |
| Kannada alphabet | 🔲 Planned | P2 | Regional language |
| Number tracing (1-100) | 🔲 Planned | P1 | Multi-language |
| Word formation | 🔲 Planned | P2 | Combine letters |

### Object Recognition

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Object detection module | 🔲 Planned | P2 | Using pre-trained model |
| "Find the object" game | 🔲 Planned | P2 | Camera-based scavenger hunt |
| Object categorization | 🔲 Planned | P3 | Animals, fruits, etc. |
| Color recognition | 🔲 Planned | P2 | Basic colors |

### Games & Activities

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Drawing freeform | 🔲 Planned | P1 | Creative mode |
| Connect the dots | 🔲 Planned | P2 | Fine motor skills |
| Maze navigation | 🔲 Planned | P2 | Using hand tracking |
| Memory game | 🔲 Planned | P3 | Card matching |
| Quiz mode | 🔲 Planned | P2 | Multiple choice with gestures |

### Face Interaction

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Face expression detection | 🔲 Planned | P3 | Smile to confirm |
| Head movement games | 🔲 Planned | P3 | Look left/right |
| Eye tracking (experimental) | 🔲 Planned | P4 | Advanced feature |

### Advanced Features

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Voice feedback / TTS | 🔲 Planned | P2 | Pronunciation help |
| Background themes | 🔲 Planned | P3 | Customizable |
| Multiple profiles | 🔲 Planned | P3 | Siblings support |
| Parent dashboard | 🔲 Planned | P2 | Progress reports |
| Cloud sync | 🔲 Planned | P3 | Backup progress |
| Achievement system | 🔲 Planned | P3 | Badges, streaks |
| Difficulty levels | 🔲 Planned | P2 | Adaptive learning |

## Technical Debt & Infrastructure

| Item | Status | Priority |
|------|--------|----------|
| Comprehensive test suite | 🔲 Planned | P1 |
| Performance optimization | 🔲 Planned | P2 |
| Cross-platform testing | 🔲 Planned | P2 |
| Documentation complete | 🔲 Planned | P1 |
| Error handling & logging | 🔲 Planned | P1 |
| Database migrations | 🔲 Planned | P2 |

## Feature Specification Template

When adding new features, use this template:

```markdown
## Feature: [Name]

### User Story
As a [child/parent], I want [feature] so that [benefit].

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Technical Notes
- Implementation approach
- Dependencies required
- Performance considerations

### UI/UX
- Mockups or descriptions
- Interaction flow
- Sound/feedback requirements

### Priority
P0/P1/P2/P3

### Estimated Effort
Small/Medium/Large
```

## Prioritization Guide

| Priority | Meaning | Timeline |
|----------|---------|----------|
| P0 | Critical, blocks release | Immediate |
| P1 | Important, should have | Near term |
| P2 | Nice to have | Future |
| P3 | Stretch goal | Maybe |

## Decision Log

### 2024-01-XX: Start with English alphabet

**Decision**: MVP will focus on English alphabet tracing before adding other languages.
**Rationale**: Simpler to implement, establish patterns, then expand.

### 2024-01-XX: Local-first architecture

**Decision**: All data stays local by default, optional cloud sync later.
**Rationale**: Privacy, safety, works offline.

### 2024-01-XX: PyQt6 for UI

**Decision**: Use PyQt6 for initial implementation.
**Rationale**: Rich features, good documentation, can switch later if needed.

## Progress Tracking

Update this section as features are completed:

### Completed

_None yet - project in planning phase_

### In Progress

_None yet_

### Next Up

1. Project setup and architecture
2. Camera integration
3. Hand tracking basics

## Feedback & Iteration

After MVP, features will be prioritized based on:

1. Advay's engagement and feedback
2. Parent observations
3. Learning effectiveness
4. Technical feasibility
