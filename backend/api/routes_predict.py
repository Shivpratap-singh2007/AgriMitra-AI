"""
FastAPI Routes for AI Disease Detection:
1. Mode A: POST /api/predict/custom-model (Own PyTorch MobileNetV2 Model)
2. Mode B: POST /api/predict/gemini (Google Gemini Multimodal Vision)
3. Mode C: POST /api/predict/compare (Side-by-side comparison of both AI systems)
"""

import io
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PIL import Image

from model_inference.predict import CustomModelInference
from gemini_service.gemini_client import GeminiService

router = APIRouter(prefix="/api/predict", tags=["AI Disease Prediction"])

def load_image_from_upload(upload_file: UploadFile) -> Image.Image:
    """Validates and loads image from uploaded file."""
    if not upload_file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a valid JPG or PNG image.")
    try:
        contents = upload_file.file.read()
        if len(contents) > 15 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image file too large (max 15MB).")
        img = Image.open(io.BytesIO(contents))
        img.verify()
        # Re-open after verify
        img = Image.open(io.BytesIO(contents))
        return img
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Corrupt or unreadable image file: {str(e)}")

@router.post("/custom-model")
async def predict_custom_model(
    image: UploadFile = File(...),
    crop: str = Form("Tomato"),
    confidence_threshold: float = Form(0.55)
):
    """Mode A: Predict disease using own trained PyTorch MobileNetV2 model."""
    img = load_image_from_upload(image)
    inference = CustomModelInference.get_instance()
    result = inference.predict(
        image=img,
        selected_crop=crop,
        confidence_threshold=confidence_threshold
    )
    return result

@router.post("/gemini")
async def predict_gemini(
    image: UploadFile = File(...),
    crop: str = Form("Tomato"),
    language: str = Form("en")
):
    """Mode B: Predict disease using Google Gemini Multimodal Vision API."""
    img = load_image_from_upload(image)
    result = await GeminiService.analyze_crop_image(
        image=img,
        selected_crop=crop,
        language=language
    )
    return result

@router.post("/compare")
async def predict_compare(
    image: UploadFile = File(...),
    crop: str = Form("Tomato"),
    language: str = Form("en"),
    confidence_threshold: float = Form(0.55)
):
    """Mode C: Dual AI Comparison Mode. Evaluates the same image on both AI systems."""
    img = load_image_from_upload(image)

    # 1. Custom PyTorch Model
    inference = CustomModelInference.get_instance()
    custom_res = inference.predict(
        image=img,
        selected_crop=crop,
        confidence_threshold=confidence_threshold
    )

    # 2. Gemini Vision Model
    gemini_res = await GeminiService.analyze_crop_image(
        image=img,
        selected_crop=crop,
        language=language
    )

    # 3. Intelligent Comparison Logic
    custom_disease = custom_res.get("disease", "").lower() if custom_res.get("success") else ""
    gemini_disease = gemini_res.get("disease", "").lower() if gemini_res.get("success") else ""

    # Check for agreement
    agreement = False
    agreement_status = "UNKNOWN"
    disagreement_explanation = None

    if custom_res.get("success") and gemini_res.get("success"):
        # Normalize and match keywords
        keywords = ["healthy", "early blight", "late blight", "leaf mold", "septoria"]
        c_matched = next((k for k in keywords if k in custom_disease), custom_disease)
        g_matched = next((k for k in keywords if k in gemini_disease), gemini_disease)

        if c_matched and g_matched and (c_matched == g_matched or c_matched in g_matched or g_matched in c_matched):
            agreement = True
            agreement_status = "AGREE"
            comparison_summary = f"Both AI systems agree on the diagnosis: '{custom_res.get('disease')}'. High multi-model consensus."
        else:
            agreement = False
            agreement_status = "DISAGREE"
            comparison_summary = f"Predictions differ. Custom Model predicted '{custom_res.get('disease')}' while Gemini detected '{gemini_res.get('disease')}'."
            disagreement_explanation = (
                f"Discrepancy detected: Custom Model identified '{custom_res.get('disease')}' ({custom_res.get('confidence_percentage')}%) "
                f"whereas Gemini Vision identified '{gemini_res.get('disease')}' ({gemini_res.get('confidence_percentage', 0)}%). "
                "Because different AI architectures focus on different leaf features, please verify the symptoms with an agricultural officer."
            )
    else:
        agreement_status = "PARTIAL"
        comparison_summary = "One of the AI systems could not complete analysis. Check individual system status."

    # Low confidence warning flag
    low_confidence_warning = False
    warning_notes = []

    if custom_res.get("is_uncertain"):
        low_confidence_warning = True
        warning_notes.append("Custom PyTorch model flagged low confidence (<55%). Image may have atypical lesions or poor lighting.")
    
    if gemini_res.get("uncertainty_notes"):
        warning_notes.append(f"Gemini note: {gemini_res.get('uncertainty_notes')}")

    if not agreement and agreement_status == "DISAGREE":
        warning_notes.append("Never spray chemicals solely based on a disputed AI prediction. Seek physical verification at nearest KVK.")

    return {
        "success": True,
        "selected_crop": crop,
        "comparison": {
            "agreement": agreement,
            "agreement_status": agreement_status,
            "summary": comparison_summary,
            "disagreement_explanation": disagreement_explanation,
            "low_confidence_warning": low_confidence_warning,
            "warning_notes": warning_notes,
            "safety_recommendation": (
                "Neither AI model is infallible. Always cross-reference visible symptoms and consult local agricultural extension specialists before undertaking expensive or chemical interventions."
            )
        },
        "custom_model": custom_res,
        "gemini_model": gemini_res
    }
