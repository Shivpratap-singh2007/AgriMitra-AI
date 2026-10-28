"""
AgriMitra AI - Smart Polyhouse & AI Agriculture Platform Backend
Integrates:
- ESP32 IoT Sensor Telemetry & Authenticated Ingestion
- Safe Automation Relay Control (Anti-cycle intervals, Max pump runtimes, Fan hysteresis)
- Farm Response Intelligence (Sense -> Analyze -> Advise -> Act -> Verify -> Learn)
- Bilingual Kisan Chaupal AI Assistant (Gemini API + Real-time Sensor Grounding)
- Sensor Health, Fault Detection & Actionable Alerts
- Crop Knowledge Database (ICAR/CPRI Tomato, Potato & Polyhouse Greens)
"""

import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

# Load environment variables
load_dotenv()

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from database.db import init_db
from iot.ingestion import router as iot_router
from api.routes_polyhouse import router as polyhouse_router
from api.routes_chat import router as chat_router
from api.routes_crops import router as crops_router
from api.routes_weather import router as weather_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("==================================================")
    print("[START] AgriMitra AI Backend (Smart Polyhouse & AI)")
    # 1. Initialize SQLite Database & Schema
    try:
        init_db()
        print("[OK] Database: SQLite initialized with thread-safe WAL mode.")
    except Exception as e:
        print(f"[ERR] Database initialization failed: {e}")

    # 2. Check Gemini configuration
    print(f"Gemini API Key: {'Configured' if os.getenv('GEMINI_API_KEY') else 'Offline Rule Grounding Mode'}")
    print(f"Server PORT: {os.getenv('PORT', 'default')}")
    print("==================================================")
    yield
    print("[STOP] Shutting down AgriMitra AI Backend.")


app = FastAPI(
    title="AgriMitra AI — Smart Polyhouse & Farm Response Intelligence",
    description="Affordable IoT and AI Farming Assistant for small and marginal farmers",
    version="1.0.0",
    lifespan=lifespan
)

# Configurable CORS for production web deployments
raw_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
allowed_origins = [o.strip() for o in raw_origins if o.strip()]
is_wildcard = len(allowed_origins) == 1 and allowed_origins[0] == "*"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if not is_wildcard else ["*"],
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# Include API Routers
app.include_router(iot_router)
app.include_router(polyhouse_router)
app.include_router(chat_router)
app.include_router(crops_router)
app.include_router(weather_router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AgriMitra AI Backend",
        "version": "1.0.0",
        "modules": [
            "IoT Telemetry & Relay Actuation",
            "Farm Response Intelligence",
            "Explainable Farming Advisory",
            "Kisan Chaupal AI Assistant"
        ]
    }


# --- Static Frontend Serving with SPA Fallback ---
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    # Mount static assets (JS, CSS, images) under /assets
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="static-assets")

    # Serve known static files at root (favicon, manifest, icons, sw.js, etc.)
    @app.get("/{filename:path}")
    async def serve_frontend(request: Request, filename: str):
        """
        SPA catch-all: serves static files from frontend/dist if they exist,
        otherwise falls back to index.html for client-side routing.
        """
        # Don't intercept /api routes (already handled above)
        if filename.startswith("api/"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)

        # Try to serve the exact file
        file_path = FRONTEND_DIST / filename
        if filename and file_path.exists() and file_path.is_file():
            # For sw.js, never cache
            if filename == "sw.js":
                return FileResponse(str(file_path), headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
            return FileResponse(str(file_path))

        # Fallback to index.html for SPA client-side routing with no-cache headers
        index_path = FRONTEND_DIST / "index.html"
        if index_path.exists():
            return FileResponse(
                str(index_path),
                headers={
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                }
            )

        return JSONResponse({"detail": "Not Found"}, status_code=404)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
