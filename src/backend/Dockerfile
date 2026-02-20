FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy application code
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./
COPY start.py ./

# Create storage directory
RUN mkdir -p /app/storage

# Expose port
EXPOSE 8001

# Run database migrations and start server
CMD ["sh", "-c", "alembic upgrade head && python start.py --production"]
