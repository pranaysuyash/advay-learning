# Advay Vision Learning 🎨👋

**Active Discovery Vision AI for Youth**

AI-powered interactive learning platform for young children (2-8 years) using computer vision for hand tracking, drawing, and language recognition.

## ⚡ Start Here by Role

- **Product/education reviewer**
  - `Features`
  - `Quick Start`
  - `Games` docs under `docs/games/`
- **Backend engineer**
  - `Quick Start` (backend setup)
  - `docs/ARCHITECTURE.md`
  - `docs/SETUP.md`
- **Frontend engineer**
  - `Quick Start` (frontend setup)
  - `docs/QUICKSTART.md`
  - `docs/LINTING_GUIDELINES.md`
- **Coding agent**
  - `AGENTS.md`
  - `docs/context/agent-start/AGENT_KICKOFF_PROMPT.txt`
  - `docs/context/agent-start/SESSION_CONTEXT.md`

## ✅ 10-minute sanity verification

```bash
# Backend (from repo root)
cd src/backend
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
pytest -q

# Frontend
cd ../frontend
pnpm install
pnpm test  # already runs vitest --run
```

Use this as a minimum pre-PR baseline before broader CI/full-suite runs.

## 🌟 Features

- **Hand & Face Tracking**: Real-time gesture recognition for drawing and interaction
- **Multi-language Support**: English, Hindi, Kannada (expandable)
- **Interactive Drawing**: Draw letters, shapes, and objects using hand gestures
- **Object Recognition**: Identify and learn objects through camera
- **Gamified Learning**: Progress tracking, rewards, and achievements
- **Parent Dashboard**: Monitor learning progress and customize content

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 22+
- PostgreSQL 17+
- Redis 7+ (for caching/sessions)
- uv (Python package manager)
- Docker & Docker Compose (for production-like local dev)

### Setup

```bash
# 0. Database setup (PostgreSQL required)
createdb advay_learning

# 1. Backend setup
cd src/backend
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -e ".[dev]"
cp .env.example .env
# Edit .env: set DATABASE_URL and SECRET_KEY
alembic upgrade head  # Run migrations

# 2. Frontend setup
cd ../frontend
pnpm install
cp .env.example .env.local

# 3. Run development servers
# Terminal 1 - Backend
cd src/backend
python -m uvicorn app.main:app --reload --port 8001

# Terminal 2 - Frontend
cd src/frontend
pnpm dev
```

Access:

- Frontend: <http://localhost:6173> (Vite dev server)
- Backend API: <http://localhost:8001>
- API Docs: <http://localhost:8001/docs>

> **Note:** the frontend `npm run test` script now runs a single pass
> (equivalent to `vitest --run`). Use `npm run test:watch` for a
> continuous watcher, or `npm run test:ci` when running in CI environments.
> The old behavior of staying in watch mode and waiting for `q` has been
> replaced.

## 🧪 Test Accounts

Use locally seeded development accounts only. Keep test credentials in local environment or fixture setup, not in repo docs.

- Suggested flow: create accounts through the running app or backend fixtures after local setup.
- If you need deterministic credentials for manual testing, store them in an untracked local notes file or shell variables.

## 🏗️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Python 3.13+, FastAPI, SQLAlchemy, Alembic
- **CV Engine**: MediaPipe, TensorFlow.js, OpenCV
- **3D Engine**: Three.js + React Three Fiber + Rapier Physics
- **Database**: PostgreSQL 17
- **Cache**: Redis 7 (sessions, caching)
- **Storage**: AWS S3 / Local filesystem
- **Deployment**: Docker Compose

### Game Development Stack

**3D Games:** React Three Fiber + Rapier Physics  
See [docs/architecture/GAME_ENGINES_AND_PHYSICS.md](docs/architecture/GAME_ENGINES_AND_PHYSICS.md) for full comparison of physics engines and game frameworks.

- **Rapier**: Modern WASM-based 3D physics (current choice)
- **Cannon.js**: Legacy physics (being phased out)
- **Three.js**: 3D rendering engine
- **React Three Fiber**: React integration for Three.js

**2D Games:** React + Canvas or Phaser (for complex 2D)
- **Auth**: JWT-based authentication

## 📚 Documentation

### Getting Started
- [AGENTS.md](AGENTS.md) - AI agent coordination guide
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture & design
- [docs/SETUP.md](docs/SETUP.md) - Development environment setup
- [docs/QUICKSTART.md](docs/QUICKSTART.md) - Quick start guide

### Operations & Deployment
- [docs/runbooks/BACKUP_PROCEDURE.md](docs/runbooks/BACKUP_PROCEDURE.md) - Database backup & restore
- [docs/runbooks/MONITORING.md](docs/runbooks/MONITORING.md) - Uptime monitoring setup
- [docs/runbooks/ROLLBACK_PROCEDURE.md](docs/runbooks/ROLLBACK_PROCEDURE.md) - Deployment rollback

### Security & Compliance  
- [docs/security/SECURITY.md](docs/security/SECURITY.md) - Security guidelines & privacy policy
- [docs/LINTING_GUIDELINES.md](docs/LINTING_GUIDELINES.md) - Code quality guidelines

### Games
- [docs/games/README.md](docs/games/README.md) - Game specifications & audit documentation

### 🎮 Game Specification Audit (In Progress)

**Status:** Critical drift cases complete (5/5), 105 games remaining  
**Agent:** Hermes Agent (LM Studio)  
**Started:** March 20, 2026

Comprehensive reverse-engineering audit of all 110+ educational games. Each game receives a 23-section specification covering current implementation, intended design, drift analysis, and recommendations.

**Key Finding:** Word Builder requires phonics audio implementation (critical educational gap).

See [docs/games/CRITICAL_DRIFT_CASES_COMPLETE_REPORT.md](docs/games/CRITICAL_DRIFT_CASES_COMPLETE_REPORT.md) for audit summary.
- [docs/SECURITY.md](docs/security/SECURITY.md) - Security guidelines
- [docs/LINTING_GUIDELINES.md](docs/LINTING_GUIDELINES.md) - Linting guidelines
- [docs/POST_ERROR_RESOLUTION_PLAN.md](docs/POST_ERROR_RESOLUTION_PLAN.md) - Post-resolution work plan

## 🔒 Troubleshooting

### VS Code Workspace Issues

**Problem**: TypeScript errors not showing in VS Code "Problems" panel
**Solution**: Update `.vscode/settings.json` with ESLint workspace configuration

```json
{
  "eslint.workingDirectories": ["src/frontend"],
  "eslint.validate": ["javascript", "typescript"],
  "eslint.options": {
    "rules": {
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "warn"
    }
  }
}
```

**Evidence**: TCK-20260131-008 (Priority 8) updated settings and both frontend and backend linters working correctly.

### Common Development Issues

See [docs/SETUP.md#troubleshooting](docs/SETUP.md#troubleshooting) for comprehensive troubleshooting guide covering:
- Git hooks failures
- Database connection issues
- Redis connection issues
- Port conflicts
- uv command failures

**Quick fixes:**

**Problem**: Frontend tests failing due to vite/dependency issues
**Solution**: Always run `pnpm install` after package.json changes, clear `node_modules/.vite` cache if needed

**Problem**: TypeScript errors after refactoring
**Solution**: Run `npm run type-check` to verify compilation before committing changes

**Problem**: Mypy import errors
**Solution**: Ensure mypy config path is correct (`pyproject.toml` not `src/backend/pyproject.toml`)

## 🤖 AI Agent System

This project uses a comprehensive AI agent coordination system:

- **AGENTS.md**: Central coordination guide
- **prompts/**: Reusable AI prompts for all development phases
- **docs/audit/ISSUE_REGISTER.md**: Canonical deduplicated issue status
- **docs/WORKLOG_ADDENDUM_*.md**: Execution logs and evidence trail
- **docs/audit/**: Audit artifacts for code review

### Agent metadata folders

- Certain nested paths (for example `src/frontend/src/frontend/`) only exist to hold the `.agent/AGENT_KICKOFF_PROMPT.txt`/`.agent/SESSION_CONTEXT.md` metadata that tells a localized agent which sources to load next. The actual running frontend lives in `src/frontend/src`. Do not delete or rearrange the `.../frontend/src/frontend/.agent` hierarchy without updating the automation instructions that depend on it, because removing those metadata files will cause the prompt cascade described in `/Users/pranay/Projects/learning_for_kids/src/frontend/src/.agent/AGENT_KICKOFF_PROMPT.txt` to break.

### GitHub Task Backbone (Required)

- Issues are the shared collaboration layer for all agents.
- Project board: [Advay Engineering Board](https://github.com/users/pranaysuyash/projects/1)
- Every implementation PR must include:
  - `Closes #<issue-number>`
  - `TCK-YYYYMMDD-NNN`
- Use issue forms under `.github/ISSUE_TEMPLATE/` for bug, feature, audit/remediation, and CI failures.

One-time maintainer bootstrap commands:

```bash
./scripts/bootstrap_github_labels.sh
./scripts/bootstrap_github_project.sh
```

See [AGENTS.md](AGENTS.md) for detailed workflow.

## 🔒 Privacy & Security

- Camera access is **local-first** with optional cloud processing
- No video storage - only processed data/frames
- Parental consent required
- COPPA compliant design considerations

## 📝 License

Private - For Advay's Learning Journey ❤️

## 👥 Team

Built with ❤️ for Advay and young learners everywhere.
