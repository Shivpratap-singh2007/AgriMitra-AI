"""
FastAPI Routes for Crop Knowledge and System Configuration:
- GET /api/crops
- GET /api/crops/{crop_name}
- GET /api/config
- POST /api/config
"""

import os
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from crop_knowledge.knowledge_base import get_all_crops, load_crop_knowledge
from gemini_service.gemini_client import is_valid_gemini_key

router = APIRouter(prefix="/api", tags=["Crop Knowledge & System Config"])

class ConfigPayload(BaseModel):
    gemini_api_key: Optional[str] = None

@router.get("/crops")
async def list_crops():
    """Returns overview of supported crops (Tomato and Potato)."""
    return {
        "success": True,
        "crops": get_all_crops()
    }

@router.get("/crops/{crop_name}")
async def get_crop_details(crop_name: str):
    """Returns full agronomic knowledge guide for specified crop."""
    data = load_crop_knowledge(crop_name)
    if not data:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_name}' not found. Supported crops: Tomato, Potato.")
    return {
        "success": True,
        "crop": data
    }

@router.get("/config")
async def get_system_config():
    """Returns runtime AI status, Gemini key availability, and version info."""
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    has_valid_key = is_valid_gemini_key(gemini_key)

    return {
        "success": True,
        "gemini": {
            "has_key": has_valid_key,
            "model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            "status_message": "Gemini API key configured" if has_valid_key else "API key missing or needs setup"
        },
        "crops_supported": ["Tomato", "Potato"],
        "weather_provider": "Open-Meteo (Free Live Satellite Weather, No Key Required)"
    }

@router.post("/config")
async def update_system_config(payload: ConfigPayload):
    """Saves Gemini API key to runtime environment and updates local .env file."""
    if payload.gemini_api_key is not None:
        key = payload.gemini_api_key.strip()
        os.environ["GEMINI_API_KEY"] = key

        # Persist to .env file
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        try:
            lines = []
            key_updated = False
            if os.path.exists(env_path):
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.startswith("GEMINI_API_KEY="):
                            lines.append(f"GEMINI_API_KEY={key}\n")
                            key_updated = True
                        else:
                            lines.append(line)
            if not key_updated:
                lines.append(f"GEMINI_API_KEY={key}\n")

            with open(env_path, "w", encoding="utf-8") as f:
                f.writelines(lines)
        except Exception as e:
            print(f"Warning: Could not update .env: {e}")

    return {
        "success": True,
        "message": "Configuration updated successfully.",
        "has_key": bool(os.environ.get("GEMINI_API_KEY"))
    }
