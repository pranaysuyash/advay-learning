#!/bin/bash
# Setup script for Advay's Learning App
# This script sets up the development environment

set -e  # Exit on error

echo "🚀 Setting up Advay's Learning App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python 3.11+ is installed
print_info "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
REQUIRED_VERSION="3.13"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Python $PYTHON_VERSION is installed, but Python $REQUIRED_VERSION or higher is required."
    exit 1
fi

print_info "Python $PYTHON_VERSION found ✓"

# Check if uv is installed
print_info "Checking for uv..."
if ! command -v uv &> /dev/null; then
    print_warn "uv not found. Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    # Add to PATH for current session
    export PATH="$HOME/.cargo/bin:$PATH"
fi

UV_VERSION=$(uv --version)
print_info "uv $UV_VERSION found ✓"

# Create virtual environment
print_info "Creating virtual environment..."
if [ -d ".venv" ]; then
    print_warn "Virtual environment already exists. Removing old environment..."
    rm -rf .venv
fi

uv venv --python python3
print_info "Virtual environment created ✓"

# Activate virtual environment
print_info "Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
print_info "Installing dependencies..."
uv pip install -e ".[dev]"
print_info "Dependencies installed ✓"

# Install pre-commit hooks
print_info "Setting up pre-commit hooks..."
if [ -f ".pre-commit-config.yaml" ]; then
    pre-commit install
    print_info "Pre-commit hooks installed ✓"
else
    print_warn ".pre-commit-config.yaml not found, skipping pre-commit setup"
fi

# Create necessary directories
print_info "Creating project directories..."
mkdir -p data
mkdir -p logs
mkdir -p app_data
print_info "Directories created ✓"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    cat > .env << EOF
# Advay's Learning App - Environment Configuration
# Copy this to .env.local for local overrides

# App Settings
APP_NAME="Advay Learning"
APP_ENV=development
DEBUG=true

# Paths
DATA_DIR=./data
LOG_DIR=./logs

# Camera Settings
CAMERA_DEVICE_ID=0
CAMERA_WIDTH=640
CAMERA_HEIGHT=480
CAMERA_FPS=30

# Hand Tracking
HAND_TRACKING_CONFIDENCE=0.7
HAND_TRACKING_MODEL_COMPLEXITY=1

# Face Tracking
FACE_TRACKING_CONFIDENCE=0.5

# Database
DATABASE_URL=sqlite:///./data/app.db

# Logging
LOG_LEVEL=INFO
EOF
    print_info ".env file created ✓"
fi

# Set up git configuration
print_info "Setting up git configuration..."
if [ -d ".git" ]; then
    git config --local commit.template .gitmessage
    print_info "Git commit template configured ✓"
else
    print_warn "Not a git repository, skipping git configuration"
fi

# Run initial checks
print_info "Running initial checks..."
if ! python -c "import src" 2>/dev/null; then
    print_warn "Could not import src package. This is expected if no code exists yet."
fi

print_info "Checking code quality tools..."
ruff --version || print_warn "ruff not found"
black --version || print_warn "black not found"
mypy --version || print_warn "mypy not found"
pytest --version || print_warn "pytest not found"

echo ""
echo "========================================"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Activate the virtual environment:"
echo "     source .venv/bin/activate"
echo ""
echo "  2. Run the application:"
echo "     python -m src.main"
echo ""
echo "  3. Run tests:"
echo "     pytest"
echo ""
echo "  4. Run code quality checks:"
echo "     ./scripts/check.sh"
echo ""
echo "  5. Start development server:"
echo "     ./scripts/dev.sh"
echo ""
