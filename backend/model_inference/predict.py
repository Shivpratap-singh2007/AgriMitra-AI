"""
AgriMitra AI - PyTorch Model Inference Engine
Loads the trained MobileNetV2 disease classification model once at backend startup.
Provides:
- Image preprocessing & Softmax inference
- Top-1 prediction with probability distribution
- Uncertainty detection (low confidence thresholding)
- Crop mismatch check (e.g. Potato uploaded under Tomato tab)
- Linkage to structured agronomic guidance
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
from PIL import Image
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.append(str(BACKEND_DIR))

from model_training.dataset import CLASS_DISPLAY_NAMES, TARGET_CLASSES
from crop_knowledge.knowledge_base import find_disease_info

MODELS_DIR = BACKEND_DIR / "models"
DEFAULT_WEIGHTS_PATH = MODELS_DIR / "agrimitra_mobilenetv2.pth"
DEFAULT_CLASSES_PATH = MODELS_DIR / "class_names.json"

class CustomModelInference:
    _instance = None

    def __init__(self, weights_path: Optional[Path] = None, classes_path: Optional[Path] = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.weights_path = Path(weights_path) if weights_path else DEFAULT_WEIGHTS_PATH
        self.classes_path = Path(classes_path) if classes_path else DEFAULT_CLASSES_PATH
        
        self.model: Optional[nn.Module] = None
        self.classes: List[str] = TARGET_CLASSES
        self.class_metadata: Dict[str, Any] = {}
        self.is_loaded: bool = False
        self.load_error: Optional[str] = None
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        self._load_model()

    @classmethod
    def get_instance(cls) -> "CustomModelInference":
        if cls._instance is None:
            cls._instance = CustomModelInference()
        return cls._instance

    def _load_model(self):
        """Loads weights and class metadata once at startup."""
        try:
            if not self.weights_path.exists():
                self.is_loaded = False
                self.load_error = f"Model weights not found at '{self.weights_path}'. Please run model training pipeline first."
                print(f"[INFO] [Custom Model] {self.load_error}")
                return

            if self.classes_path.exists():
                with open(self.classes_path, "r", encoding="utf-8") as f:
                    self.class_metadata = json.load(f)
                    self.classes = self.class_metadata.get("classes", TARGET_CLASSES)

            checkpoint = torch.load(self.weights_path, map_location=self.device)
            if "classes" in checkpoint:
                self.classes = checkpoint["classes"]

            # Build MobileNetV2 architecture
            base_model = models.mobilenet_v2(weights=None)
            in_features = base_model.classifier[1].in_features
            base_model.classifier = nn.Sequential(
                nn.Dropout(p=0.3),
                nn.Linear(in_features, 256),
                nn.ReLU(),
                nn.Dropout(p=0.2),
                nn.Linear(256, len(self.classes))
            )

            state_dict = checkpoint["model_state_dict"] if "model_state_dict" in checkpoint else checkpoint
            base_model.load_state_dict(state_dict)
            base_model.to(self.device)
            base_model.eval()

            self.model = base_model
            self.is_loaded = True
            self.load_error = None
            print(f"[OK] [Custom Model] PyTorch MobileNetV2 model loaded successfully on {self.device.type.upper()} ({len(self.classes)} classes)")

        except Exception as e:
            self.is_loaded = False
            self.load_error = str(e)
            print(f"[ERROR] [Custom Model] Failed to load model weights: {e}")

    def predict(
        self,
        image: Image.Image,
        selected_crop: str = "Tomato",
        confidence_threshold: float = 0.55
    ) -> Dict[str, Any]:
        """Runs model inference on PIL image with uncertainty check."""
        if not self.is_loaded or self.model is None:
            return {
                "success": False,
                "model_ready": False,
                "message": self.load_error or "Custom PyTorch model is not trained yet.",
                "training_guide": "To train the custom model on PlantVillage, run: python backend/model_training/train.py"
            }

        try:
            # Ensure RGB
            if image.mode != "RGB":
                image = image.convert("RGB")

            tensor = self.transform(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                logits = self.model(tensor)
                probabilities = F.softmax(logits, dim=1).squeeze(0)

            top_probs, top_indices = torch.topk(probabilities, min(3, len(self.classes)))
            top_prob = float(top_probs[0].item())
            top_idx = int(top_indices[0].item())
            predicted_raw_class = self.classes[top_idx]

            display_info = CLASS_DISPLAY_NAMES.get(predicted_raw_class, {
                "crop": "Tomato" if "Tomato" in predicted_raw_class else "Potato",
                "disease": predicted_raw_class,
                "disease_hi": predicted_raw_class
            })

            predicted_crop = display_info.get("crop", "Tomato")
            predicted_disease = display_info.get("disease", "Unknown")
            disease_hi = display_info.get("disease_hi", predicted_disease)

            # Build top probability distribution
            all_probabilities = {}
            for i, cls_name in enumerate(self.classes):
                prob_val = float(probabilities[i].item())
                info = CLASS_DISPLAY_NAMES.get(cls_name, {})
                all_probabilities[cls_name] = {
                    "crop": info.get("crop", cls_name),
                    "disease": info.get("disease", cls_name),
                    "disease_hi": info.get("disease_hi", cls_name),
                    "probability": round(prob_val, 4),
                    "percentage": round(prob_val * 100, 1)
                }

            # Check uncertainty threshold
            is_uncertain = top_prob < confidence_threshold
            crop_mismatch = (selected_crop.lower() not in predicted_crop.lower()) and (not is_uncertain)

            # Query crop knowledge database for grounded next steps
            disease_info = find_disease_info(predicted_crop, predicted_disease)
            next_steps = []
            prevention_tips = []
            if disease_info:
                next_steps = disease_info.get("prevention_and_cultural", [])[:3]
                if disease_info.get("basic_organic_care"):
                    next_steps.append(disease_info["basic_organic_care"])
                prevention_tips = disease_info.get("prevention_and_cultural", [])[3:]
                if not prevention_tips and disease_info.get("symptoms"):
                    prevention_tips = [f"Watch for: {s}" for s in disease_info.get("symptoms", [])[:2]]

            return {
                "success": True,
                "model_ready": True,
                "model_name": "MobileNetV2 (AgriMitra PyTorch Transfer Learning)",
                "raw_class": predicted_raw_class,
                "crop": predicted_crop,
                "selected_crop": selected_crop,
                "disease": predicted_disease,
                "disease_hindi": disease_hi,
                "confidence": round(top_prob, 4),
                "confidence_percentage": round(top_prob * 100, 1),
                "is_uncertain": is_uncertain,
                "crop_mismatch": crop_mismatch,
                "uncertainty_warning": (
                    "Low confidence prediction. The leaf pattern could not be determined reliably. "
                    "Please upload a clearer, well-lit photo of an affected leaf."
                    if is_uncertain else None
                ),
                "crop_mismatch_warning": (
                    f"Selected crop is '{selected_crop}', but model detected '{predicted_crop}' characteristics. "
                    "Please ensure the crop selection matches your uploaded plant leaf."
                    if crop_mismatch else None
                ),
                "probabilities": all_probabilities,
                "next_steps": next_steps,
                "prevention_tips": prevention_tips,
                "disclaimer": "This is an automated prediction from our custom PyTorch neural network. It is an assistive decision tool and not a verified laboratory pathology diagnosis."
            }

        except Exception as e:
            return {
                "success": False,
                "model_ready": True,
                "error": str(e),
                "message": f"Inference error during model prediction: {str(e)}"
            }
