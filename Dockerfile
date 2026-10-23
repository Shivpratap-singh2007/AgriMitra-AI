# ==============================================================================
# AgriMitra AI 2.0 — Production Multi-Stage Dockerfile
# Full-Stack Deployment: FastAPI Backend + React 19 SPA + ESP32 Ingestion
# Compatible with Render, Railway, Fly.io, AWS App Runner, Google Cloud Run, etc.
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the React 19 Frontend
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Python Backend Runtime
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runner

WORKDIR /app

# Prevent Python from writing .pyc files and buffer stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5001 \
    DATABASE_PATH="/app/backend/data/agrimitra_v2.db"

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install lightweight CPU-only PyTorch & Python dependencies for fast container boot
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend application source
COPY backend/ /app/backend/

# Copy compiled frontend from Stage 1 into backend-served static directory
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Ensure SQLite data directory exists
RUN mkdir -p /app/backend/data

# Expose server port
EXPOSE 5001

# Healthcheck to monitor container health
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT}/api/health || exit 1

# Start Uvicorn bound to dynamic cloud $PORT
CMD ["sh", "-c", "uvicorn main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-5001}"]
