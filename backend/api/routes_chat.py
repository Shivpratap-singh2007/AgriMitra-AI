"""
FastAPI Routes for AI Farmer Chatbot
Endpoint: POST /api/chat
Supports:
- Crop context awareness (Tomato or Potato)
- Factual grounding via ICAR crop knowledge base
- Hindi, English, and Hinglish dialogue
- Suggested questions
"""

from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

from gemini_service.gemini_client import GeminiService

router = APIRouter(prefix="/api", tags=["AI Chatbot"])

class ChatRequest(BaseModel):
    message: str
    crop: str = "Tomato"
    language: str = "en"

@router.post("/chat")
async def chat_with_ai(payload: ChatRequest):
    """Processes agricultural queries using Gemini with crop knowledge grounding."""
    if not payload.message or not payload.message.strip():
        return {
            "success": False,
            "reply": "Please enter a valid agricultural question.",
            "crop": payload.crop
        }

    res = await GeminiService.chat_with_farmer(
        message=payload.message.strip(),
        selected_crop=payload.crop,
        language=payload.language
    )
    return res
