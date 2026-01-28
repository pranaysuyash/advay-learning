# Project Overview: Advay's AI Learning App

## Quick Links

| Resource | Path |
|----------|------|
| 🗺️ Roadmap | [docs/features/ROADMAP.md](features/ROADMAP.md) |
| 🏗️ Architecture | [docs/architecture/TECH_STACK.md](architecture/TECH_STACK.md) |
| 🔒 Security | [docs/security/SECURITY.md](security/SECURITY.md) |
| 🎓 Learning Plan | [docs/LEARNING_PLAN.md](LEARNING_PLAN.md) |
| 🎮 Game Mechanics | [docs/GAME_MECHANICS.md](GAME_MECHANICS.md) |
| 👶 Age Bands | [docs/AGE_BANDS.md](AGE_BANDS.md) |
| 🤝 Contributing | [docs/project-management/CONTRIBUTING.md](project-management/CONTRIBUTING.md) |
| 📝 Feature Template | [docs/features/FEATURE_TEMPLATE.md](features/FEATURE_TEMPLATE.md) |

## Project Structure

```
learning_for_kids/
├── 📁 src/                      # Source code
│   ├── hand_tracking/           # Hand detection & gestures
│   ├── face_tracking/           # Face detection & expressions
│   ├── ui/                      # User interface
│   ├── games/                   # Gamification
│   ├── learning_modules/        # Educational content
│   ├── storage/                 # Data persistence
│   ├── auth/                    # Parent authentication
│   └── utils/                   # Utilities
│
├── 📁 tests/                    # Test suite
│   ├── unit/                    # Unit tests
│   └── integration/             # Integration tests
│
├── 📁 docs/                     # Documentation
│   ├── architecture/            # System design, ADRs
│   ├── project-management/      # Git workflow, PR guidelines
│   ├── security/                # Security & privacy
│   ├── features/                # Roadmap, specs
│   └── api/                     # API documentation
│
├── 📁 prompts/                  # AI prompts for development
├── 📁 scripts/                  # Development scripts
├── 📁 assets/                   # Static assets
└── 📁 .github/                  # GitHub templates
```

## Getting Started

### 1. Initial Setup

```bash
# Run the setup script
./scripts/setup.sh

# Activate environment
source .venv/bin/activate
```

### 2. Development Workflow

```bash
# Start development
./scripts/dev.sh

# Run checks before committing
./scripts/check.sh

# Check PR size before creating PR
./scripts/check_pr_size.sh
```

### 3. Creating a Feature

1. **Plan**: Create feature spec in `docs/features/specs/`
2. **Branch**: `git checkout -b feature/your-feature`
3. **Develop**: Write code with tests
4. **Check**: Run `./scripts/check.sh`
5. **Commit**: Follow conventional commits
6. **PR**: Create PR with template, ensure size < 300 LOC

## Key Decisions

| Decision | Status | Document |
|----------|--------|----------|
| Local-First Architecture | ✅ Accepted | [ADR-001](architecture/decisions/001-local-first-architecture.md) |
| Python + PyQt6 Stack | ✅ Accepted | [ADR-002](architecture/decisions/002-python-tech-stack.md) |
| SQLite Storage | ✅ Accepted | [ADR-003](architecture/decisions/003-storage-strategy.md) |

## Current Status

### MVP Definition
Child can:
1. Open the app
2. Use hand gestures to interact
3. Trace English alphabet letters
4. Get feedback on progress
5. See their learning progress

### In Progress
- Project setup and documentation ✅

### Next Up
1. Camera integration
2. Hand tracking basics
3. Basic UI framework
4. Drawing canvas
5. English alphabet module

## Development Guidelines

### Code Quality
- Type hints required
- Docstrings for public APIs
- Tests for new code
- Pre-commit hooks run automatically

### PR Guidelines
- Size: < 300 LOC preferred
- Reviews: At least 1 approval
- Tests: Must pass
- Docs: Update as needed

### No CI/CD
We use manual quality gates:
- Pre-commit hooks for style
- Local test runs
- PR review checklist
- Manual merge verification

## Communication

### Questions?
1. Check documentation in `docs/`
2. Review existing feature specs
3. Create issue for discussion

### Reporting Issues
- Use clear, descriptive titles
- Include steps to reproduce
- Note environment details
- Attach screenshots if UI-related

## Resources

### External Documentation
- [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- [OpenCV Python](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)
- [PyQt6 Reference](https://www.riverbankcomputing.com/static/Docs/PyQt6/)
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)

### Tools
- **Package Manager**: [uv](https://github.com/astral-sh/uv)
- **Linter**: [ruff](https://docs.astral.sh/ruff/)
- **Formatter**: [black](https://black.readthedocs.io/)
- **Type Checker**: [mypy](https://mypy.readthedocs.io/)
- **Testing**: [pytest](https://docs.pytest.org/)

## Success Metrics

### Technical
- [ ] 30 FPS hand tracking
- [ ] < 200MB memory usage
- [ ] < 1 second startup time
- [ ] 80%+ test coverage

### User Experience
- [ ] Child can use independently
- [ ] Parent can review progress
- [ ] Works offline
- [ ] No crashes in normal use

## Roadmap Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Foundation | Weeks 1-2 | Camera, tracking, basic UI |
| Core Interaction | Weeks 3-4 | Gestures, drawing, face tracking |
| First Module | Weeks 5-6 | English alphabet, progress tracking |
| Polish & Test | Week 7 | Bug fixes, optimization |
| **MVP Release** | **Week 8** | **Working learning app** |

## Notes

- This is a learning project for Advay ❤️
- Prioritize safety and privacy
- Keep it fun and engaging
- Document as we build
