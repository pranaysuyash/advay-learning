#!/bin/bash
# Development script for Advay's Learning App
# Runs the application in development mode with auto-reload

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting development mode...${NC}"

# Check if virtual environment is activated
if [[ -z "${VIRTUAL_ENV}" ]]; then
    echo -e "${YELLOW}Virtual environment not activated. Activating...${NC}"
    if [ -d ".venv" ]; then
        source .venv/bin/activate
    else
        echo "Error: Virtual environment not found. Run ./scripts/setup.sh first."
        exit 1
    fi
fi

# Set development environment
export APP_ENV=development
export DEBUG=true
export LOG_LEVEL=DEBUG

# Run pre-checks
echo "Running code checks..."
./scripts/check.sh --quick

# Run the application
echo -e "${GREEN}Starting application...${NC}"
python -m src.main "$@"
