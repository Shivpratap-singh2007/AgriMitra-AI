"""
AgriMitra AI 2.0 - FastAPI Routes for AI Farmer Chatbot
Endpoint: POST /api/chat
Grounded in real-time polyhouse sensor telemetry, substrate moisture,
anti-cycle status, and verified ICAR agricultural knowledge.
"""

from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

from chat.kisan_chaupal import answer_farmer_query

router = APIRouter(prefix="/api", tags=["AI Chatbot"])


class ChatRequest(BaseModel):
    message: str
    crop: str = "Tomato"
    language: str = "en"
    device_id: Optional[str] = "esp32-polyhouse-demo"


@router.post("/chat")
async def chat_with_ai(payload: ChatRequest):
    """Processes agricultural queries grounded in live sensor facts and ICAR knowledge."""
    if not payload.message or not payload.message.strip():
        return {
            "success": False,
            "reply": "Please enter a valid agricultural question.",
            "crop": payload.crop
        }

    res = await answer_farmer_query(
        message=payload.message.strip(),
        device_id=payload.device_id or "esp32-polyhouse-demo",
        language=payload.language
    )
    return res
