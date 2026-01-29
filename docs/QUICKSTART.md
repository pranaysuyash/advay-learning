# Quick Start Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Python 3.13+ (for backend)
- uv (Python package manager) - `pip install uv`
- Modern browser with WebGL support

## Setup (5 minutes)

### 1. Backend (Terminal 1)

```bash
# Navigate to project root
cd /Users/pranay/Projects/learning_for_kids

# Install dependencies (from project root)
uv sync

# Run backend server (use port 8001 if 8000 is taken)
cd src/backend
uv run python -m uvicorn app.main:app --reload --port 8001
```

Backend API will be at: http://localhost:8001
API docs at: http://localhost:8001/docs

> **Note:** If port 8000 is busy, use 8001, 8002, etc. Update the frontend `.env` file to match.

### 2. Frontend (Terminal 2)

```bash
# Navigate to frontend
cd /Users/pranay/Projects/learning_for_kids/src/frontend

# Install dependencies
npm install

# Create .env file if using different backend port
echo "VITE_API_BASE_URL=http://localhost:8001" > .env

# Start development server
npm run dev
```

Frontend will be at: http://localhost:6173 (or check console output)

### 3. Download MediaPipe Model (Optional - for hand tracking)

```bash
cd /Users/pranay/Projects/learning_for_kids/src/frontend
mkdir -p public/models
curl -o public/models/hand_landmarker.task \
  https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
```

## First Time Setup

When you first open the app:

1. **Register a new account** on the login page
2. **Allow camera access** when prompted (for hand tracking games)
3. **Try the Learning Game** - show your hand to the camera
4. **Explore Settings** to change language (English/Hindi/Kannada)

## Development Workflow

### Frontend Development

```bash
cd src/frontend

# Start dev server with hot reload
npm run dev -- --port 6173

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run tests
npm run test
```

### Backend Development

```bash
# From project root
cd src/backend

# Run with auto-reload (change port if needed)
uv run python -m uvicorn app.main:app --reload --port 8001

# Run database migrations
uv run alembic upgrade head
```

### Before Committing

```bash
# Run all checks from project root
bash scripts/verify.sh
```

## Project Structure

```
src/
  backend/          # FastAPI backend
    app/
      api/          # API endpoints
      db/           # Database models
      schemas/      # Pydantic schemas
      services/     # Business logic
  frontend/         # React + TypeScript frontend
    src/
      pages/        # Page components
      store/        # Zustand state management
      services/     # API client
      components/   # Reusable UI components
  scripts/          # Development scripts
  docs/             # Documentation
```

## Troubleshooting

### Backend won't start
- Check Python 3.13+ is installed
- Ensure uv is installed: `pip install uv`
- Run `uv sync` from **project root** (not src/backend)
- Try a different port: `--port 8001` or `--port 8002`

### Frontend won't start
- Check Node.js 18+ is installed
- Ensure port 6173 is free
- Run `npm install` in `src/frontend`

### Camera not working
- Check browser permissions
- Ensure HTTPS or localhost (required for camera)
- Try refreshing the page

### API connection errors
- Verify backend is running (check port 8000/8001)
- Check browser console for CORS errors
- Update `VITE_API_BASE_URL` in frontend `.env` to match backend port

## Next Steps

See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for full documentation.
