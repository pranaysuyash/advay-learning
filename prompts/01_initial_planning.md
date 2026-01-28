# Prompt: Initial Project Planning for Advay's AI Learning App

## Context
You are helping plan and build an AI/Computer Vision-based educational app for a child named Advay. The app uses laptop camera for hand and face tracking to enable interactive learning experiences.

## Project Goals
1. Create a gamified learning platform for kids
2. Use computer vision (hand/face tracking) for natural interaction
3. Support multiple learning modules: alphabets (multi-language), words, object identification
4. Enable drawing/interaction on screen through gestures
5. Make it fun, safe, and educational

## Planning Scope

### 1. Documentation Structure
- Create comprehensive documentation hierarchy
- Define documentation maintenance workflow
- Establish document templates and standards

### 2. Project Management Setup
- Git workflow (branching strategy, commit conventions)
- UV + venv Python environment setup
- Task/todo tracking system
- No CI - manual quality gates instead

### 3. Security & Privacy
- Local-first data storage
- Parental controls and consent
- Camera permission handling
- Data retention policies

### 4. Storage & Auth
- Local SQLite for offline-first approach
- Optional cloud sync for progress backup
- Simple local auth (PIN for parent mode)
- Child profile management

### 5. Code Quality & Merge Management
- Pre-commit hooks (ruff, black)
- PR templates and review checklist
- LOC change limits for PRs
- Branch protection rules (manual enforcement)
- Test requirements

### 6. Feature Tracking
- Feature specification template
- Roadmap documentation
- Status tracking (Planned → In Progress → Testing → Done)
- MVP vs Future features distinction

## Output Requirements

Create the following:
1. Complete documentation structure under `docs/`
2. Project setup scripts (`scripts/setup.sh`, `scripts/dev.sh`)
3. Configuration files (`.python-version`, `pyproject.toml`)
4. Git configuration (`.gitignore`, commit message template)
5. Initial feature roadmap
6. Security and privacy policy draft

## Constraints
- Keep it simple but extensible
- Prioritize offline/local-first
- Child safety is paramount
- Easy for non-technical parent to maintain
- No complex CI/CD - focus on code quality gates

## Questions to Consider
1. What age range are we targeting? (Affects UI complexity)
2. Which languages for alphabet learning? (Start with 2-3)
3. Should progress sync across devices?
4. What level of parental reporting is needed?
5. Any specific learning methodologies to follow?

## Success Criteria
- [ ] Documentation is comprehensive and navigable
- [ ] Setup script works on macOS/Linux/Windows
- [ ] Git workflow is documented and enforceable manually
- [ ] Security considerations are documented
- [ ] Feature roadmap has clear MVP definition
