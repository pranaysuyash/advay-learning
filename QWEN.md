# Advay Vision Learning - QWEN.md Context Guide

## Project Overview

**Advay Vision Learning** is an AI-powered interactive learning platform for young children (ages 2-8) that uses **computer vision** as the primary interaction method. The platform enables hands-free learning through camera-based tracking, making it accessible for young children who cannot reliably use keyboards or mice.

### Core Identity: Multi-Modal Vision Platform

This is a **vision-first** platform where children interact with games using:

- **Hand tracking** (index finger pointing, pinch-to-grab, hand gestures)
- **Face tracking** (head tilt, facial expressions)
- **Pose tracking** (full body movements, arm positions, jumping)
- **Voice input** (speech recognition for voice-controlled games)

**Critical:** Every game MUST have at least one CV control mode (`hand`, `face`, `pose`, or `voice`). This is not optional—it is the core product identity.

### Key Features

- Real-time hand & face tracking for drawing and interaction
- Multi-language support (English, Hindi, Kannada, expandable)
- Interactive drawing using hand gestures
- Object recognition through camera
- Gamified learning with progress tracking, rewards, achievements
- Parent dashboard for monitoring progress
- 114+ game routes with varying levels of CV integration

---

## Tech Stack

### Frontend

- **Framework:** React 19 + TypeScript + Vite
- **State Management:** Zustand, React Query
- **Styling:** Tailwind CSS, Framer Motion
- **Computer Vision:** MediaPipe Tasks Vision, TensorFlow.js
- **3D Engine:** Three.js + React Three Fiber + Rapier Physics
- **2D Games:** React + Canvas, Matter.js
- **Testing:** Vitest, Playwright (E2E)
- **Package Manager:** pnpm

### Backend

- **Framework:** Python 3.13+ + FastAPI
- **ORM:** SQLAlchemy 2.0, Alembic (migrations)
- **Authentication:** JWT-based
- **Database:** PostgreSQL 16+ (required, no SQLite)
- **Cache:** Redis
- **Package Manager:** uv
- **Testing:** pytest, mypy, ruff, black

### Infrastructure

- **Containerization:** Docker + Docker Compose
- **Storage:** AWS S3 / Local filesystem
- **Web Server:** Nginx (for frontend)

---

## Project Structure

```
learning_for_kids/
├── src/
│   ├── backend/           # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/       # REST API endpoints
│   │   │   ├── core/      # Core utilities, config
│   │   │   ├── db/        # Database models, sessions
│   │   │   ├── schemas/   # Pydantic schemas
│   │   │   └── services/  # Business logic
│   │   ├── alembic/       # Database migrations
│   │   └── tests/
│   │
│   ├── frontend/          # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/     # CV tracking hooks
│   │   │   ├── games/     # Game implementations
│   │   │   └── data/      # Game registry, config
│   │   ├── e2e/           # Playwright tests
│   │   └── __tests__/
│   │
│   ├── e2e/               # End-to-end tests
│   └── pages/             # Additional pages
│
├── docs/                  # Comprehensive documentation
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   ├── SECURITY.md
│   ├── audit/             # Audit artifacts
│   ├── worklogs/          # Work tracking
│   ├── process/           # Process docs
│   └── [480+ docs files]
│
├── prompts/               # AI agent prompts (36 categories)
│   ├── audit/
│   ├── remediation/
│   ├── review/
│   ├── verification/
│   └── ...
│
├── scripts/               # Development & automation scripts
├── tools/                 # Reusable utilities
├── .githooks/             # Git hooks for workflow enforcement
└── .agent/                # Agent context metadata
```

---

## Building and Running

### Prerequisites

- Python 3.13+
- Node.js 22+ (use `nvm` or `volta`)
- PostgreSQL 16+
- uv (Python package manager)
- Git

### Quick Start

#### 0. Database Setup

```bash
createdb advay_learning
```

#### 1. Backend Setup

```bash
cd src/backend
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -e ".[dev]"
cp .env.example .env
# Edit .env: set DATABASE_URL and SECRET_KEY
alembic upgrade head  # Run migrations
```

#### 2. Frontend Setup

```bash
cd src/frontend
pnpm install
cp .env.example .env.local
```

#### 3. Run Development Servers

**Terminal 1 - Backend:**

```bash
cd src/backend
python -m uvicorn app.main:app --reload --port 8001
```

**Terminal 2 - Frontend:**

```bash
cd src/frontend
pnpm dev
```

**Access:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

### Docker Deployment

```bash
# Production deployment
docker-compose up -d

# Access via http://localhost:80
```

---

## Testing

### Frontend Tests

```bash
cd src/frontend

# Unit tests (single run)
npm test

# Watch mode
npm run test:watch

# CI mode with coverage
npm run test:ci

# E2E tests
npm run test:e2e
```

### Backend Tests

```bash
cd src/backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

### Type Checking

```bash
# Frontend
cd src/frontend && npm run type-check

# Backend
cd src/backend && mypy app/
```

### Linting

```bash
# Frontend
cd src/frontend && npm run lint

# Backend
cd src/backend && ruff check .
```

---

## Development Conventions

### Git Workflow

This repository enforces strict workflow discipline via git hooks:

```bash
# Enable local git hooks (required)
git config core.hooksPath .githooks
chmod +x .githooks/* scripts/*.sh
```

#### Pre-commit Gates (enforced in order):

1. **Agent Gate** (`scripts/agent_gate.sh`): Worklog updates, ticket evidence
2. **Secret Scan** (`scripts/secret_scan.sh`): Block leaked credentials
3. **Maintainability Guard** (`scripts/maintainability_guard.sh`): Block oversized files
4. **Feature Regression Check** (`scripts/feature_regression_check.sh`): Detect removed functionality
5. **Regression Tests** (`scripts/regression_check.sh`): Tests, exports, TypeScript

#### Branch Discipline

- **All local work on `main`** — commit freely to local `main`.
- **Never push to `origin/main` directly** — all code reaches `main` via merged PRs.
- **Agents MUST NOT create branches** with `git switch -c` / `git checkout -b` / `git branch` — only `./scripts/start_wip_branch.sh <scope>`.
- **Branch creation = explicit user trigger** ("start git workflow" / "open a PR" / "create a branch").
- **Never delete unrecognized changes** from parallel agents

### Work Tracking

All work must be tracked in worklog tickets:

```bash
# Create/update worklog entry
docs/WORKLOG_ADDENDUM_*.md

# Ticket format: TCK-YYYYMMDD-###
# Example: TCK-20260315-001
```

### Evidence Discipline

Every claim must be labeled:

- **Observed:** Directly verified from file or command output
- **Inferred:** Logically implied from Observed facts
- **Unknown:** Cannot be determined from available evidence

### Commit Requirements

Before committing:

1. Review diff: `git diff --staged`
2. Run local pre-commit review using `prompts/review/local-pre-commit-review-v1.0.md`
3. Update worklog addendum with prompt trace
4. Run pre-commit checks: `./scripts/agent_gate.sh --staged`
5. **Wait for explicit user approval** before running `git commit`

### Merge Requirements

Before merging to `main`:

- All review threads resolved (`gh pr view <number> --comments`)
- Verification audit passed
- Linked issue(s) closed
- Pre-merge checklist snapshot posted
- **Wait for explicit user approval**

---

## AI Agent System

This project uses a comprehensive AI agent coordination system:

### Key Documents

| Document                          | Purpose                              |
| --------------------------------- | ------------------------------------ |
| `AGENTS.md`                       | Central coordination guide (PRIMARY) |
| `.github/copilot-instructions.md` | Lightweight Copilot quick-start      |
| `docs/WORKLOG_ADDENDUM_*.md`      | Active work tracking                 |
| `docs/CLAIMS.md`                  | Append-only claim registry           |
| `docs/audit/*.md`                 | Audit artifacts                      |

### Agent Metadata

The project uses `.agent/` directories for context alignment:

```bash
# Generate context pack
/Users/pranay/Projects/agent-start

# Load session defaults
source .agent/STEP1_ENV.sh
```

### Prompt System

All work should use prompts from `prompts/`:

| Work Type      | Prompt File                                    |
| -------------- | ---------------------------------------------- |
| File Audit     | `prompts/audit/audit-v1.5.1.md`                |
| Remediation    | `prompts/remediation/implementation-v1.6.1.md` |
| Hardening      | `prompts/hardening/hardening-v1.1.md`          |
| PR Review      | `prompts/review/pr-review-v1.6.1.md`           |
| Verification   | `prompts/verification/verification-v1.2.md`    |
| Merge Conflict | `prompts/merge/merge-conflict-v1.2.md`         |

See `prompts/README.md` for the complete list.

### GitHub Integration

- **Project Board:** [Advay Engineering Board](https://github.com/users/pranaysuyash/projects/1)
- **Issue Forms:** `.github/ISSUE_TEMPLATE/`
- **PR Requirements:**
  - `Closes #<issue-number>`
  - `TCK-YYYYMMDD-NNN` in PR body

---

## Key Files for Vision Implementation

| File                                                  | Purpose                              |
| ----------------------------------------------------- | ------------------------------------ |
| `src/frontend/src/hooks/useGameHandTracking.ts`       | Hand tracking hook                   |
| `src/frontend/src/hooks/useGamePoseTracking.ts`       | Pose tracking hook                   |
| `src/frontend/src/hooks/useGameFaceTracking.ts`       | Face tracking hook                   |
| `docs/CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md` | Implementation guide                 |
| `src/frontend/src/data/gameRegistry.ts`               | Game manifest with `cv: [...]` field |
| `docs/audit/CONTROL_MODE_AUDIT_2026-03-12.md`         | Full audit of CV vs pointer status   |

---

## Common Commands

```bash
# Check git status
git status --porcelain

# Stage ALL changes (required)
git add -A

# Find references to symbol
rg -n "symbol_name" src/

# Run full pre-commit simulation
./scripts/agent_gate.sh --staged

# Feature regression check only
./scripts/feature_regression_check.sh --staged

# All regression checks
./scripts/regression_check.sh --staged

# Check running servers
lsof -i :6173  # Frontend
lsof -i :8001  # Backend
```

---

## Security & Privacy

### Critical Rules

- **No secrets in code:** Use environment variables only
- **Camera access:** Local-first with optional cloud processing
- **No video storage:** Only processed data/frames
- **Parental consent required:** COPPA compliant design
- **Visual indicator:** Show when camera is active

### Secret Remediation

- Fix hardcoded secrets in tracked code/config files
- **Do not edit `.env` or `.env.*` files** unless explicitly requested
- Replace literals with `os.getenv(...)` or settings-based loading

---

## Prohibited Actions

1. Never create multiple venvs (use repo root `/.venv` only)
2. Never commit secrets to git
3. Never upgrade Inferred to Observed evidence
4. Never mix unrelated fixes in one PR
5. Never delete contributor code without clear justification
6. Never skip worklog updates
7. Never claim "ready" without evidence
8. Never expand scope without explicit approval
9. Never delete other agents' work/artifacts
10. Never create one-off tools in `/tmp`—save to `tools/`
11. Never use `git commit --no-verify` without explicit approval
12. Never bypass check failures—fix or report blockers
13. Never reclassify staged files as "out of scope"
14. Never modify `.env*` files while remediating secret scans
15. Never push after hook failures without resolving
16. Never commit directly on `main` without explicit approval
17. **Never commit/push without explicit user approval**

---

## Troubleshooting

### Common Issues

| Problem                                  | Solution                                                    |
| ---------------------------------------- | ----------------------------------------------------------- |
| TypeScript errors not showing in VS Code | Update `.vscode/settings.json` with ESLint workspace config |
| Frontend test failures                   | Run `pnpm install`, clear `node_modules/.vite` cache        |
| Mypy import errors                       | Verify mypy config path in `pyproject.toml`                 |
| Pre-commit hook failures                 | Run `./scripts/agent_gate.sh --staged` to see details       |

### VS Code Configuration

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

---

## Documentation Resources

### Core Docs

- `README.md` - Project overview
- `AGENTS.md` - AI agent coordination (1483 lines)
- `docs/ARCHITECTURE.md` - System design
- `docs/SETUP.md` - Detailed setup guide
- `docs/SECURITY.md` - Security guidelines
- `docs/PROCESS_PROMPTS.md` - Prompt registry

### Audit & Work Tracking

- `docs/WORKLOG_ADDENDUM_*.md` - Active worklogs
- `docs/WORKLOG_TICKETS.md` - Curated ticket index
- `docs/audit/*.md` - Audit artifacts (480+ files)
- `docs/CLAIMS.md` - Claim registry

### Process & Guidelines

- `docs/process/CODE_PRESERVATION_GUIDELINES.md` - When to delete vs. implement
- `docs/process/AGENT_SHELL_WRITE_AND_COMPLETION_GUARDRAILS.md` - Safe shell writes
- `docs/LINTING_GUIDELINES.md` - Linting standards
- `docs/POST_ERROR_RESOLUTION_PLAN.md` - Post-resolution workflow

---

## Version History

| Version | Date       | Changes                       |
| ------- | ---------- | ----------------------------- |
| 1.0     | 2026-03-15 | Initial QWEN.md context guide |

---

**Remember:** Evidence first. Scope discipline. Preservation over perfection. Always wait for explicit user approval before committing or pushing changes.
