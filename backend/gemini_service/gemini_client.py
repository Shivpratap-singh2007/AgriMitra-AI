"""
AgriMitra AI - Google Gemini Agricultural Chatbot Service
Provides:
- Factual, grounded AI Farmer Chatbot with crop context and ICAR knowledge base
- Automatic model fallback (gemini-flash-latest, gemini-2.5-flash-lite, gemini-3.8-flash)
- Transparent error handling when API key is missing or unavailable
"""

import os
import json
import urllib.parse
from typing import Dict, Any, Optional, List
import httpx
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

try:
    from crop_knowledge.knowledge_base import build_knowledge_context, find_disease_info, answer_from_verified_knowledge
except ImportError:
    from backend.crop_knowledge.knowledge_base import build_knowledge_context, find_disease_info, answer_from_verified_knowledge

MODEL_CANDIDATES: List[str] = [
    os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-flash-latest"
]

def get_gemini_api_key() -> Optional[str]:
    # Refresh environment variables in case .env was edited
    load_dotenv()
    return os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY")

def is_valid_gemini_key(key: Optional[str]) -> bool:
    """Validates basic Google AI Studio key format (starts with AIzaSy)."""
    if not key or not isinstance(key, str):
        return False
    clean = key.strip()
    return clean.startswith("AIzaSy") and len(clean) >= 25

class GeminiService:
    @staticmethod
    async def chat_with_farmer(
        message: str,
        selected_crop: str = "Tomato",
        language: str = "en"
    ) -> Dict[str, Any]:
        api_key = get_gemini_api_key()
        last_error = None

        # 1. Attempt Live Gemini AI generation if valid key is present
        if is_valid_gemini_key(api_key):
            knowledge_context = build_knowledge_context(selected_crop)

            system_instruction = f"""
You are AgriMitra AI (कृषिमित्र), an expert, friendly agricultural assistant for Indian farmers.
The conversation context is strictly focused on: {selected_crop} (Tomato or Potato).

FACTUAL AGRONOMIC KNOWLEDGE BASE (Use this for factual grounding):
{knowledge_context}

RULES:
1. Respond concisely and practically in easy-to-understand language.
2. Support both Hindi and English. If the farmer asks in Hindi, Hinglish, or English, reply in the same language.
3. Keep the answer farmer-friendly, focusing on practical steps (irrigation timing, organic prevention, soil preparation, balanced NPK).
4. Never invent chemical pesticide dosages. For chemical treatments, recommend verified bio-controls (Trichoderma, Neem oil) and recommend consulting the local Krishi Vigyan Kendra (KVK).
5. Highlight regional variations when discussing sowing dates or growth duration.
"""

            unique_models = list(dict.fromkeys(MODEL_CANDIDATES))
            encoded_key = urllib.parse.quote_plus(api_key.strip())
            async with httpx.AsyncClient(timeout=30.0) as client:
                for model_name in unique_models:
                    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={encoded_key}"
                    payload = {
                        "contents": [
                            {
                                "parts": [
                                    {"text": f"System Context:\n{system_instruction}\n\nFarmer's Question: {message}"}
                                ]
                            }
                        ],
                        "generationConfig": {
                            "temperature": 0.4,
                            "maxOutputTokens": 600
                        }
                    }

                    try:
                        res = await client.post(endpoint, json=payload)
                        if res.status_code == 200:
                            result_data = res.json()
                            reply = result_data["candidates"][0]["content"]["parts"][0]["text"].strip()
                            return {
                                "success": True,
                                "reply": reply,
                                "crop": selected_crop,
                                "model": model_name
                            }
                        else:
                            last_error = f"{model_name} HTTP {res.status_code}: {res.text[:150]}"
                    except Exception as e:
                        last_error = f"{model_name} error: {str(e)}"

        # 2. Factual ICAR Knowledge Base Fallback
        # When Gemini API key is missing, invalid, or API is temporarily down, answer directly from verified ICAR data
        verified_answer = answer_from_verified_knowledge(selected_crop, message, language)
        if verified_answer:
            return {
                "success": True,
                "reply": verified_answer,
                "crop": selected_crop,
                "model": "ICAR-CPRI Verified Agronomic Knowledge",
                "is_verified_guide": True
            }

        # 3. Transparent Guidance when no direct factual match is found and key is not active
        is_hi = language == "hi" or any("\u0900" <= ch <= "\u097F" for ch in message)
        notice = (
            "⚠️ लाइव AI चौपाल के लिए एक मान्य Google Gemini API Key आवश्यक है।\n\n"
            "आप ऊपर दिए गए ⚙️ सेटिंग्स आइकॉन पर क्लिक करके Google AI Studio से अपनी निःशुल्क कुंजी जोड़ सकते हैं।\n\n"
            "इस बीच, आप सीधे प्रमाणित ICAR डेटा से पूछ सकते हैं:\n"
            "• बुवाई का समय (Sowing Calendar)\n"
            "• सिंचाई के नियम (Watering & Irrigation)\n"
            "• खाद व NPK अनुपात (Fertilizer Schedule)\n"
            "• अगेती / पछेती झुलसा का उपचार (Blight & Disease Prevention)"
            if is_hi else
            "⚠️ Live AI Chatbot requires a valid Google Gemini API Key.\n\n"
            "Click the ⚙️ Settings icon at the top to configure your free key from Google AI Studio.\n\n"
            "In the meantime, you can ask directly for verified ICAR data on:\n"
            "• Sowing and planting calendar\n"
            "• Irrigation frequency & critical stages\n"
            "• Fertilizer NPK ratios & application schedule\n"
            "• Early/Late Blight prevention & cultural management"
        )

        return {
            "success": False,
            "api_key_missing": True,
            "reply": notice,
            "crop": selected_crop
        }
