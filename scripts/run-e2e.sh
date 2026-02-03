#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

# Standard paths for logs and temporary pid files
LOGS_DIR="$ROOT_DIR/logs"
TMP_DIR="$ROOT_DIR/.tmp"

mkdir -p "$LOGS_DIR" "$TMP_DIR"

echo "[e2e] Activating venv and installing frontend dev deps (if needed)"
# Check for backend venv first (most common case)
if [ -d "src/backend/.venv" ]; then
  . src/backend/.venv/bin/activate
  echo "[e2e] Activated backend virtual environment"
elif [ -d ".venv" ]; then
  . .venv/bin/activate
  echo "[e2e] Activated root virtual environment"
else
  echo "[e2e] Error: Virtual environment not found"
  exit 1
fi

# Ensure Playwright browsers installed
cd "$ROOT_DIR/src/frontend"
if [ ! -d "node_modules/playwright" ]; then
  echo "[e2e] Installing Playwright browsers..."
  npm install --no-audit
  npx playwright install --with-deps
else
  echo "[e2e] Playwright appears installed"
fi

# Start backend (skip if already running)
echo "[e2e] Checking backend health at http://127.0.0.1:8001/health"
if curl -fsS http://127.0.0.1:8001/health > /dev/null 2>&1; then
  echo "[e2e] Backend already running, skipping start"
  BACKEND_STARTED=false
else
  echo "[e2e] Starting backend (logs -> $LOGS_DIR/backend-e2e.log)"
  cd "$ROOT_DIR/src/backend"
  mkdir -p "$LOGS_DIR"
  # Use backend's venv
  . "$ROOT_DIR/src/backend/.venv/bin/activate"
  uv run python start.py > "$LOGS_DIR/backend-e2e.log" 2>&1 &
  BACKEND_PID=$!
  echo $BACKEND_PID > "$TMP_DIR/backend-e2e.pid"
  BACKEND_STARTED=true
  # Wait for backend to be healthy
  echo "[e2e] Waiting for backend to be healthy..."
  until curl -sS http://127.0.0.1:8001/health > /dev/null 2>&1; do
    sleep 0.5
  done
fi

# Wait for backend health
echo "[e2e] Waiting for backend to be healthy..."
until curl -sS http://127.0.0.1:8001/health > /dev/null 2>&1; do
  sleep 0.5
done

# Start frontend (skip if already running)
echo "[e2e] Checking frontend at http://127.0.0.1:6173/"
if curl -fsS http://127.0.0.1:6173/ > /dev/null 2>&1; then
  echo "[e2e] Frontend already running, skipping start"
  FRONTEND_STARTED=false
else
  echo "[e2e] Starting frontend dev server (logs -> $LOGS_DIR/frontend-e2e.log)"
  cd "$ROOT_DIR/src/frontend"
  npm run dev > "$LOGS_DIR/frontend-e2e.log" 2>&1 &
  FRONTEND_PID=$!
  echo $FRONTEND_PID > "$TMP_DIR/frontend-e2e.pid"

  # Wait for frontend
  echo "[e2e] Waiting for frontend to be ready..."
  until curl -sS http://127.0.0.1:6173/ > /dev/null 2>&1; do
    sleep 0.5
  done
  FRONTEND_STARTED=true
fi

# Run Playwright tests
echo "[e2e] Running Playwright tests"
npx playwright test --config=playwright.config.ts "$@"

# Teardown
echo "[e2e] Tests finished; stopping servers"
if [ "${FRONTEND_STARTED:-false}" = true ]; then
  echo "[e2e] Stopping frontend (pid $FRONTEND_PID)"
  kill $FRONTEND_PID || true
else
  echo "[e2e] Frontend was not started by this script; leaving it running"
fi

if [ "${BACKEND_STARTED:-false}" = true ]; then
  echo "[e2e] Stopping backend (pid $BACKEND_PID)"
  kill $BACKEND_PID || true
else
  echo "[e2e] Backend was not started by this script; leaving it running"
fi

rm -f "$TMP_DIR/frontend-e2e.pid" "$TMP_DIR/backend-e2e.pid"

echo "[e2e] Done"