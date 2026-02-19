# ADR 002: Python Tech Stack

## Status

Accepted

## Context

We need to select the programming language and core technologies for the learning app. Requirements:

- Good computer vision library support
- Cross-platform (macOS, Windows, Linux)
- Easy to maintain by non-technical parent
- Good performance for real-time CV

## Decision

We will use **Python 3.13+** with the following stack:

### Core

- **Language**: Python 3.13+
- **Package Manager**: uv (fast, modern)
- **Environment**: venv (standard library)

### Computer Vision

- **OpenCV**: Image processing and camera access
- **MediaPipe**: Hand and face tracking (Google's pre-trained models)
- **NumPy**: Numerical operations

### UI

- **PyQt6**: Desktop UI framework
- **Alternative**: Tkinter (if PyQt6 licensing is concern)

### Data

- **Pydantic**: Data validation and settings
- **PostgreSQL**: Database (both dev and production)

## Consequences

### Positive

- ✅ Excellent CV/ML ecosystem
- ✅ MediaPipe provides production-ready tracking
- ✅ Cross-platform support
- ✅ Large community and documentation
- ✅ Easy to prototype and iterate

### Negative

- ❌ Python distribution can be heavy
- ❌ PyQt6 has licensing considerations (GPL/commercial)
- ❌ Slower than compiled languages (acceptable for our use case)
- ❌ Dependency management complexity

## Alternatives Considered

### JavaScript/Electron

- Pros: Web tech, easy UI
- Cons: CV libraries less mature, heavier runtime

### C++ with Qt

- Pros: Maximum performance
- Cons: Harder to maintain, longer development time

### Unity

- Pros: Good for games, cross-platform
- Cons: Overkill for this use case, licensing cost

## Implementation Notes

### Python Version

- Minimum: 3.11
- Target: 3.11 or 3.12
- Use type hints throughout

### Dependency Management

- Use `uv` for fast installs
- Pin versions in `pyproject.toml`
- Regular security audits with `pip-audit`

### Performance Considerations

- Target 30 FPS for tracking
- Use efficient MediaPipe models
- Consider threading for heavy operations

## Related Decisions

- ADR 001: Local-First Architecture
- ADR 003: Storage Strategy (PostgreSQL)
