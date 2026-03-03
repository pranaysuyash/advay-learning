# Development Environment Setup

## Prerequisites

- **Python**: 3.13 or higher
- **Node.js**: 22+ (LTS, use `nvm` or `volta` to manage local Node versions)

> Tip: To switch to the recommended Node version (nvm): `nvm use 22`

- **PostgreSQL**: 17+
- **uv**: Python package manager
- **Git**: Version control

## Enable Local Agent Workflow Controls (Required)

This repo uses local git hooks to enforce ticket + evidence discipline (even without PRs).

```bash
# Enable repo-managed hooks
git config core.hooksPath .githooks

# Ensure hook scripts are executable
chmod +x .githooks/* scripts/agent_gate.sh scripts/secret_scan.sh scripts/new_ticket_stamp.sh scripts/db_migration_guard.sh
```

To manually run the gate on your staged changes:

```bash
./scripts/agent_gate.sh --staged
```

Before any code-changing commit, run a findings-first local review using:

```bash
# Follow the repo prompt before committing
cat prompts/review/local-pre-commit-review-v1.0.md
```

For code or audit changes, the updated worklog addendum must include:

```md
Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md
```

The gate also blocks premature completion metadata in worklogs:

- `Status: DONE` with numbered `Next Actions:`
- bulk refactor tickets marked `DONE` without a verification `Command:`
- sidecar-based “100% complete” claims while tracked `*Refactored.tsx` files still exist, unless the ticket explicitly says `Sidecar Status: RETAINED`

`scripts/agent_gate.sh` also blocks unresolved refactor sidecar page files by default:

- touching `src/frontend/src/pages/*Refactored.tsx`
- touching a canonical page `Foo.tsx` while a tracked `FooRefactored.tsx` twin still exists

Temporary override (only when the active worklog explicitly documents why the sidecar must remain):

```bash
ALLOW_REFACTORED_SIDE_CARS=1 git commit ...
```

To generate a unique ticket stamp for worklog entries:

```bash
./scripts/new_ticket_stamp.sh codex
# -> STAMP-20260224T220000Z-codex-ab12
```

### Main Branch Commit Guard (Required)

`pre-commit` blocks direct commits on `main` to enforce PR-based review:

- Keep iterating locally as needed.
- Before commit, switch/create a short-lived branch:
  - `./scripts/start_wip_branch.sh <ticket-or-scope>`
  - or `git switch -c codex/wip-<ticket-or-scope>`
- Commit on that branch, push it, and create a PR to `main` so remote review checks trigger.
  - Example push: `git push -u origin codex/wip-<ticket-or-scope>`
  - Example PR: `gh pr create --base main --head codex/wip-<ticket-or-scope> --fill`

Emergency-only bypass (must be explicitly approved for the current task):

```bash
ALLOW_MAIN_COMMIT=1 git commit ...
```

### Secret Scanning Gate (Required)

Commits and pushes now run `scripts/secret_scan.sh`:

- `pre-commit` scans staged content for leaked credentials.
- `pre-push` scans the pushed commit range for leaked credentials.

Scanner backend:

- Uses local `gitleaks` if installed.
- Falls back to Docker image `ghcr.io/gitleaks/gitleaks:latest` when `gitleaks` is not installed (Docker daemon must be running).

Manual checks:

```bash
# Scan staged files
./scripts/secret_scan.sh --staged

# Scan commit range
./scripts/secret_scan.sh --range origin/main..HEAD
```

Temporary bypass (emergency only):

```bash
SKIP_SECRET_SCAN=1 git commit ...
SKIP_SECRET_SCAN=1 git push ...
```

### DB Migration Guard (Required)

Commits and pushes run `scripts/db_migration_guard.sh` to catch model-layer DB
changes without matching Alembic migrations:

- Triggers when files under `src/backend/app/db/models/` (or `base_class.py`) change.
- Requires a migration change under `src/backend/alembic/versions/` in the same staged/pushed set.

Manual checks:

```bash
# Check staged files
./scripts/db_migration_guard.sh --staged

# Check commit range
./scripts/db_migration_guard.sh --range origin/main..HEAD
```

Temporary bypass (emergency only):

```bash
SKIP_DB_MIGRATION_CHECK=1 git commit ...
SKIP_DB_MIGRATION_CHECK=1 git push ...
```

### No-Bypass Push Checks (Required)

`pre-push` now enforces frontend validation for pushed frontend source changes:

- `npm run -s type-check`
- `npx vitest run --related ...` for changed frontend files in the pushed commit range

This prevents `git commit --no-verify` from silently bypassing quality gates.

Emergency-only explicit override (must include reason):

```bash
ALLOW_BYPASS_CHECKS=1 BYPASS_REASON="hotfix rollback window" git push
```

## Install uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Verify
uv --version
```

## VS Code Workspace Configuration

### ESLint Workspace Settings

To ensure TypeScript errors show correctly in VS Code "Problems" panel:

```bash
# Add ESLint workspace configuration
code .vscode/settings.json
```

Example `.vscode/settings.json`:

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

**Evidence**: TCK-20260131-008 (Priority 8) - Updated VS Code settings for proper ESLint workspace configuration and mypy path resolution.

**Related Tickets**:

- TCK-20260131-008: Update VS Code settings
- TCK-20260131-006: Review disabled lint rules (documents ESLint configuration decisions)

## Database Setup (PostgreSQL)

```bash
# macOS with Homebrew
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb advay_learning

# Or via psql
psql postgres -c "CREATE DATABASE advay_learning;"
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

# Edit .env with your settings:
# - DATABASE_URL=postgresql+asyncpg://postgres@localhost:5432/advay_learning
# - Generate secret key: openssl rand -hex 32

# Run database migrations
alembic upgrade head

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

## Test Database Setup

Before running backend tests, set up the test database:

```bash
# Run the test database bootstrap script
./scripts/test-db-bootstrap.sh
```

This script:

- Checks if PostgreSQL is running
- Creates `advay_learning_test` database if it doesn't exist
- Runs alembic migrations on the test database

**Note**: Test database is separate from development database.

## Verify Installation

- Backend: <http://localhost:8001/health>
- API Docs: <http://localhost:8001/docs>
- Frontend: <http://localhost:5173>

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

# UI design-system consistency guard (audit scope files)
npm run audit:ui-design
```

## IDE Setup

### VS Code Extensions

- Python
- Pylance
- ESLint
- Prettier
- Tailwind CSS IntelliSense

## Development Tools

The `tools/` directory contains reusable utilities for development and QA:

- **Video Frame Analyzer** (`tools/video_frame_analyzer.html`) - Frame-by-frame video analysis for UX/QA testing
- **Contrast Calculator** (`tools/contrast_calculator.py`) - WCAG contrast ratio validation
- **Kenney Platformer Asset Sync** (`tools/sync_kenney_platformer_assets.sh`) - Sync downloaded Kenney platformer packs into canonical frontend runtime path

See [tools/README.md](../tools/README.md) for full documentation and usage examples.

**When to add tools**: If you create a helpful utility (analyzer, converter, validator, test harness), save it to `tools/` with documentation instead of creating one-off scripts.

## Kenney Asset Workflow

When new Kenney packs are downloaded under `/Users/pranay/Projects/adhoc_resources`, sync them into the app runtime folder:

```bash
# From repo root
tools/sync_kenney_platformer_assets.sh
```

Canonical platformer asset runtime path:

- `src/frontend/public/assets/kenney/platformer`

Note:

- Keep this path as the source of truth for frontend game asset URLs.
- Avoid creating new ad-hoc runtime paths when importing new packs.

---

**Next**: See [AGENTS.md](../AGENTS.md) for development workflow.
