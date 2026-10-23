"""
AgriMitra AI - FastAPI Dual AI Backend Application
Integrates:
- Custom PyTorch MobileNetV2 Model (Transfer Learning)
- Google Gemini Multimodal Vision API
- Dual AI Comparison Engine
- Grounded AI Farmer Chatbot
- Structured Crop Knowledge Database (Tomato & Potato)
"""

import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Load environment variables
load_dotenv()

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from api.routes_predict import router as predict_router
from api.routes_chat import router as chat_router
from api.routes_crops import router as crops_router
from api.routes_weather import router as weather_router
from model_inference.predict import CustomModelInference

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("==================================================")
    print("[START] AgriMitra AI Backend (FastAPI + PyTorch)")
    # Load custom PyTorch model once on startup
    inference = CustomModelInference.get_instance()
    if inference.is_loaded:
        print(f"[OK] PyTorch Model Active: {len(inference.classes)} classes loaded.")
    else:
        print(f"[INFO] PyTorch Model Status: {inference.load_error or 'Weights pending training'}")
    print(f"Gemini API Key: {'Configured' if os.getenv('GEMINI_API_KEY') else 'Missing'}")
    print("==================================================")
    yield
    print("[STOP] Shutting down AgriMitra AI Backend.")

app = FastAPI(
    title="AgriMitra AI - Dual AI Crop Disease Detection Platform",
    description="Mobile-first AI agriculture assistant for Indian farmers supporting Tomato and Potato",
    version="2.0.0",
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
app.include_router(predict_router)
app.include_router(chat_router)
app.include_router(crops_router)
app.include_router(weather_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AgriMitra AI FastAPI Backend",
        "version": "2.0.0"
    }

@app.get("/api/sensors")
async def get_sensors():
    return {
        "success": True,
        "status": "idle",
        "telemetry": {}
    }

# Serve static frontend files if frontend build or assets exist
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"
FRONTEND_DIR = BASE_DIR.parent / "frontend"

if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="static-dist")
elif FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="static-frontend")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
