# Development Environment Setup

## Prerequisites

- **Python**: 3.13 or higher
- **Node.js**: 18 or higher
- **uv**: Python package manager
- **Git**: Version control

## Install uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Verify
uv --version
```

## Backend Setup

```bash
cd src/backend

# Create virtual environment
uv venv

# Activate
source .venv/bin/activate  # macOS/Linux
# or: .venv\Scripts\activate  # Windows

# Install dependencies
uv pip install -e ".[dev]"

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Generate secret key: openssl rand -hex 32

# Run server
python -m uvicorn app.main:app --reload --port 8001
```

## Frontend Setup

```bash
cd src/frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

## Verify Installation

- Backend: http://localhost:8001/health
- API Docs: http://localhost:8001/docs
- Frontend: http://localhost:5173

## Running Tests

```bash
# Backend
cd src/backend
# Prefer running via the project environment (avoids accidentally using system `pytest`)
uv run pytest
# or:
./.venv/bin/python -m pytest
# (If you activate the venv, plain `pytest` is fine too)

# Frontend
cd src/frontend
npm test
```

## IDE Setup

### VS Code Extensions
- Python
- Pylance
- ESLint
- Prettier
- Tailwind CSS IntelliSense

---

**Next**: See [AGENTS.md](../AGENTS.md) for development workflow.
