# Project Exploration & Innovation Prompt (Advay Vision Learning)

**Version:** v1.0-advay
**Purpose:**
Codebase-specific implementation of the generic exploration prompt for Advay Vision Learning. This prompt provides project-specific guidance while following the comprehensive exploration framework.

**Based on:** project-exploration-prompt-v1.0.md (generic)

---

## Project Context

**Domain:** Educational technology for children (ages 3-8)
**Core Technology:** React/TypeScript frontend, FastAPI/Python backend, computer vision
**Target Users:** Children learning letters, parents managing progress
**Current Stage:** MVP with basic letter tracing, authentication, progress tracking

---

## Usage Instructions

### When to Use

- Quarterly planning for Advay Vision Learning
- Before adding new learning modules or features
- When exploring curriculum expansion or gamification
- During technical architecture decisions
- For compliance reviews (COPPA, accessibility)

### Project-Specific Files to Reference

- `docs/clarity/questions.md` - Open questions and decisions
- `docs/WORKLOG_TICKETS.md` - All work tracking
- `docs/PROJECT_EXPLORATION_BACKLOG.md` - Exploration opportunities
- `docs/ROADMAP.md` - Current strategic direction
- `docs/AGE_BANDS.md` - Target user demographics
- `docs/LEARNING_PLAN.md` - Educational objectives

---

## Exploration Framework (Advay-Specific)

### 1. Unresolved Questions & Blockers

**Project-Specific Focus:**

- Email service provider (blocks production deployment)
- Password policy for parent accounts
- Session timeout configuration
- Curriculum expansion strategy

**Checklist:**

- Review `docs/clarity/questions.md` for Q-002, Q-003, Q-004
- Check WORKLOG_TICKETS.md for BLOCKED status items
- Assess technical debt in computer vision pipeline
- Evaluate parent dashboard requirements

### 2. Feature & Product Opportunities

**Educational Focus:**

- New learning modules (numbers, shapes, colors, words)
- Adaptive difficulty progression
- Multi-language support for diverse families
- Parent-teacher collaboration features

**Technical Focus:**

- Offline mode for unreliable internet
- Advanced computer vision (gesture recognition, posture correction)
- Real-time feedback and encouragement
- Progress visualization and analytics

**Gamification:**

- Achievement system and badges
- Streak tracking and rewards
- Family challenges and competitions
- Seasonal events and themes

### 3. Technical Hardening & Infrastructure

**Computer Vision Specific:**

- Model optimization for mobile devices
- Camera permission handling and privacy
- Real-time processing performance
- Fallback for devices without cameras

**Scalability:**

- Database optimization for progress tracking
- CDN for educational assets
- API rate limiting for classroom use
- Multi-tenant support for schools

### 4. Compliance & Legal

**Child-Focused Requirements:**

- COPPA compliance for under-13 users
- Parental consent and data controls
- Educational content accuracy
- Accessibility (WCAG) for children with disabilities

**Privacy:**

- Child data protection and anonymization
- Parent data separation from child data
- Data retention policies for educational records
- International privacy regulations

### 5. User Experience & Design

**Child-Centric Design:**

- Age-appropriate interfaces (3-8 years)
- Engaging animations and feedback
- Simple, intuitive interactions
- Cultural sensitivity and inclusivity

**Parent Experience:**

- Progress dashboards and insights
- Easy account management
- Communication with educators
- Cross-device synchronization

### 6. Business & Growth Opportunities

**Educational Market:**

- School and classroom licensing
- Homeschool curriculum packages
- Special education adaptations
- International market expansion

**Technology Partnerships:**

- Integration with learning management systems
- Educational app ecosystems
- Research partnerships with universities
- Hardware partnerships (tablets, interactive whiteboards)

### 7. Process & Team Improvements

**Educational Development:**

- User testing with children and parents
- Educational content review processes
- Accessibility testing workflows
- Computer vision model validation

**Quality Assurance:**

- Automated testing for computer vision accuracy
- Cross-browser and cross-device testing
- Performance testing for real-time features
- Security testing for child data protection

### 8. Risk Assessment & Mitigation

**Educational Risks:**

- Inaccurate learning content impact
- Computer vision reliability for assessments
- Cultural bias in educational materials
- Over-reliance on technology vs human teaching

**Technical Risks:**

- Camera/microphone permission dependencies
- Computer vision model accuracy and bias
- Real-time processing performance requirements
- Browser compatibility for educational features

---

## Prioritization Framework (Advay-Specific)

### Educational Impact Priority

- **High Educational Value**: Features that significantly improve learning outcomes
- **Accessibility First**: Features that make learning available to more children
- **Parent Empowerment**: Tools that help parents support their children's learning
- **Technical Foundation**: Infrastructure that enables future educational features

### Child-Safety Priority

- **COPPA Critical**: Features affecting child data collection/storage
- **Privacy Essential**: Any feature handling personal information
- **Safety First**: Features involving camera/microphone access
- **Trust Building**: Transparent and secure educational experiences

---

## Documentation & Tracking

### Required Outputs

1. **Exploration Report**: Update `docs/PROJECT_EXPLORATION_BACKLOG.md`
2. **Question Resolution**: Update `docs/clarity/questions.md` when answers found
3. **Ticket Creation**: Add to WORKLOG_TICKETS.md with proper categorization
4. **Research Documentation**: Create research docs in `docs/clarity/research/`

### Project-Specific Categories

- **EDU-**: Educational features and curriculum
- **TECH-**: Technical infrastructure and performance
- **SEC-**: Security and privacy features
- **UX-**: User experience and accessibility
- **BIZ-**: Business and growth opportunities

---

## Example Implementation (Advay-Specific)

### Current Open Questions

1. **Q-002: Email Service** - Choose SendGrid/AWS SES/Mailgun for production
2. **Q-003: Password Policy** - Balance security with parent usability
3. **Q-004: Session Timeout** - Appropriate for shared family devices

### High-Impact Opportunities

1. **Adaptive Learning**: AI-driven difficulty adjustment based on child performance
2. **Multi-Modal Learning**: Combine tracing with audio, video, and games
3. **Parent Dashboard**: Comprehensive progress tracking and insights
4. **Offline Mode**: Core learning functionality without internet
5. **Accessibility Suite**: Voice commands, high contrast, simplified interfaces

### Technical Priorities

1. **Computer Vision Optimization**: Faster, more accurate letter recognition
2. **Progressive Web App**: Installable experience across devices
3. **Real-time Collaboration**: Multiple children learning together
4. **Advanced Analytics**: Learning pattern recognition and recommendations

---

## Success Metrics (Advay-Specific)

- **Learning Outcomes**: Measurable improvements in letter recognition and writing skills
- **User Engagement**: Session length, return usage, feature adoption
- **Parent Satisfaction**: NPS scores, feature request conversion
- **Technical Performance**: Computer vision accuracy, app responsiveness
- **Compliance**: Audit readiness, privacy regulation compliance

---

**Last Updated:** 2026-01-29
**Specific to:** Advay Vision Learning project
**Based on:** project-exploration-prompt-v1.0.md (generic)
