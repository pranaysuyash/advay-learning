#!/bin/bash
# Code quality check script
# Runs linting, formatting checks, and type checking

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Flags
QUICK=false
FIX=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK=true
            shift
            ;;
        --fix)
            FIX=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--quick] [--fix]"
            exit 1
            ;;
    esac
done

echo "🔍 Running code quality checks..."

# Check if virtual environment is activated
if [[ -z "${VIRTUAL_ENV}" ]]; then
    echo -e "${YELLOW}Virtual environment not activated. Activating...${NC}"
    # Check for backend venv first (most common case)
    if [ -d "src/backend/.venv" ]; then
        source src/backend/.venv/bin/activate
        echo -e "${GREEN}Activated backend virtual environment${NC}"
    elif [ -d ".venv" ]; then
        source .venv/bin/activate
        echo -e "${GREEN}Activated root virtual environment${NC}"
    else
        echo -e "${RED}Error: Virtual environment not found. Run ./scripts/setup.sh first.${NC}"
        exit 1
    fi
fi

# Run ruff (linting)
echo ""
echo "Running ruff (linting)..."
if [ "$FIX" = true ]; then
    ruff check src/ tests/ --fix
else
    ruff check src/ tests/
fi

# Run black (formatting)
echo ""
if [ "$FIX" = true ]; then
    echo "Running black (formatting)..."
    black src/ tests/
else
    echo "Running black (formatting check)..."
    black --check src/ tests/
fi

# Run mypy (type checking)
echo ""
echo "Running mypy (type checking)..."
mypy src/

# Run tests (unless quick mode)
if [ "$QUICK" = false ]; then
    echo ""
    echo "Running pytest..."
    pytest --cov=src --cov-report=term-missing
else
    echo ""
    echo -e "${YELLOW}Skipping tests (quick mode)${NC}"
fi

# Security audit
echo ""
echo "Running security audit..."
pip-audit --desc || true  # Don't fail on audit warnings

echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
