# Technology Stack

## Core Technologies

### Language & Runtime

- **Python 3.13+**: Modern Python with improved performance and type hints
- **Type Hints**: Full type annotation for better code quality

### Package Management

- **uv**: Fast Python package installer and resolver
- **venv**: Standard library virtual environments
- **pip-tools**: For requirements.txt generation if needed

### Computer Vision & AI

- **OpenCV (opencv-python)**: Core computer vision operations
- **MediaPipe**: Google's ML solutions for hand, face, and pose tracking
  - `mediapipe`: Hand landmark detection
  - `mediapipe`: Face mesh for face tracking
- **NumPy**: Numerical operations for image processing

### UI Framework (Decision Pending)

Option A: **PyQt6**

- Pros: Rich widgets, mature, good performance
- Cons: Heavy dependency, licensing considerations

Option B: **Tkinter + Custom Canvas**

- Pros: Built-in, lightweight, simple
- Cons: Limited styling, less polished

Option C: **Dear PyGui**

- Pros: GPU-accelerated, immediate mode
- Cons: Less mature, smaller community

**Recommendation**: Start with PyQt6 for rapid prototyping, can switch to lighter option if needed.

### Storage

- **PostgreSQL**: Primary database (via `asyncpg` async driver)
  - Connection pooling: pool_size=10, max_overflow=20
  - Pool recycling every 30 minutes
  - Connection health checks enabled (pool_pre_ping)
- **SQLAlchemy ORM**: Async ORM for database operations
- **Pydantic**: Data validation and serialization
- **Alembic**: Database migrations

### Audio (Future)

- **pygame.mixer**: Simple sound playback
- **gTTS**: Google Text-to-Speech for pronunciation (offline alternatives: `pyttsx3`)

### Utilities

- **Pillow (PIL)**: Image manipulation
- **pydantic-settings**: Configuration management
- **structlog**: Structured logging
- **rich**: Terminal formatting for dev tools

## Development Tools

### Code Quality

- **ruff**: Fast Python linter (replaces flake8, pylint, isort)
- **black**: Code formatter
- **mypy**: Static type checking
- **pre-commit**: Git hooks for quality checks

### Testing

- **pytest**: Test framework
- **pytest-cov**: Coverage reporting
- **pytest-asyncio**: For async tests if needed
- **factory-boy**: Test data generation

### Documentation

- **mkdocs**: Documentation site generator (future)
- **pdoc**: API documentation from docstrings

## Project Structure

```
learning_for_kids/
├── src/
│   ├── __init__.py
│   ├── main.py                 # Application entry point
│   ├── config/                 # Configuration management
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   └── constants.py
│   ├── hand_tracking/          # Hand detection & tracking
│   │   ├── __init__.py
│   │   ├── detector.py
│   │   ├── gestures.py
│   │   └── drawing.py
│   ├── face_tracking/          # Face detection & tracking
│   │   ├── __init__.py
│   │   ├── detector.py
│   │   └── expressions.py
│   ├── ui/                     # User interface
│   │   ├── __init__.py
│   │   ├── main_window.py
│   │   ├── canvas.py
│   │   └── components/
│   ├── learning_modules/       # Educational content
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── alphabets/
│   │   ├── words/
│   │   └── objects/
│   ├── games/                  # Gamification layer
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── drawing_game.py
│   │   └── quiz_game.py
│   ├── storage/                # Data persistence
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── repository.py
│   ├── auth/                   # Authentication (parent mode)
│   │   ├── __init__.py
│   │   └── local_auth.py
│   └── utils/                  # Utilities
│       ├── __init__.py
│       ├── camera.py
│       ├── logger.py
│       └── helpers.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── assets/
│   ├── models/                 # ML models if not using MediaPipe
│   ├── fonts/
│   ├── sounds/
│   └── images/
├── docs/
├── scripts/
├── prompts/
├── pyproject.toml
├── .python-version
└── README.md
```

## Data Flow

```
Camera Feed
    ↓
[OpenCV Capture]
    ↓
[MediaPipe Hand/Face Detection]
    ↓
[Gesture Recognition]
    ↓
[Game/Module Logic]
    ↓
[UI Update]
    ↓
[Storage (Progress Save)]
```

## Performance Considerations

1. **Frame Rate Target**: 30 FPS minimum for smooth interaction
2. **Resolution**: 640x480 for processing, upscale for display if needed
3. **Model Optimization**: Use MediaPipe's lighter models
4. **Async Processing**: Consider threading for heavy operations

## Security Considerations

1. **Camera Data**: Process frames in memory only, never store video
2. **Local-First**: All data stays on device by default
3. **Optional Cloud**: Encrypted sync only with explicit consent
4. **No PII**: No collection of personally identifiable information

## Future Tech Considerations

- **ONNX Runtime**: For custom models if MediaPipe is insufficient
- **TensorFlow Lite**: Edge ML for specific learning modules
- **Web Version**: Pyodide or separate web app using TensorFlow.js
