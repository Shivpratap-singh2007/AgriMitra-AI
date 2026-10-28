# ==============================================================================
# AgriMitra AI — Production Multi-Stage Dockerfile
# Full-Stack Deployment: FastAPI Backend + React 19 SPA + ESP32 Ingestion
# Compatible with Render, Railway, Fly.io, AWS App Runner, Google Cloud Run, etc.
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the React 19 Frontend (Debian-slim with glibc for lightningcss)
# ------------------------------------------------------------------------------
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

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
    PORT=10000 \
    HOST=0.0.0.0 \
    DATABASE_PATH="/app/backend/data/agrimitra.db"

# Install system dependencies (curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install lightweight Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend application source and start script
COPY backend/ /app/backend/
COPY start.py /app/start.py

# Copy compiled frontend from Stage 1 into backend-served static directory
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Ensure SQLite data directory exists
RUN mkdir -p /app/backend/data

# Render dynamically passes PORT (typically 10000)
EXPOSE 10000

# Healthcheck to monitor container health
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT:-10000}/api/health || exit 1

# Start server using start.py with proxy headers support
CMD ["python", "start.py"]
