"""
AgriMitra AI - PyTorch Model Evaluation Script
Computes:
- Overall Test Accuracy
- Per-class and Macro Precision, Recall, F1-Score
- Confusion Matrix (Saved as JSON and readable text)
"""

import sys
import json
import argparse
from pathlib import Path
import torch
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.append(str(BACKEND_DIR))

from model_training.dataset import prepare_dataloaders
from model_training.train import build_model

MODELS_DIR = BACKEND_DIR / "models"
EVAL_DIR = BACKEND_DIR / "evaluation"

def evaluate_model(
    data_dir: str,
    weights_path: str = str(MODELS_DIR / "agrimitra_mobilenetv2.pth"),
    batch_size: int = 32,
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
):
    print("==================================================")
    print("Evaluating AgriMitra AI Model Performance")
    print(f"Weights: {weights_path}")
    print(f"Dataset: {data_dir}")
    print("==================================================")

    weights_file = Path(weights_path)
    if not weights_file.exists():
        raise FileNotFoundError(f"Model weights file not found at {weights_path}. Train model first.")

    checkpoint = torch.load(weights_file, map_location=device)
    classes = checkpoint.get("classes", [])

    _, _, test_loader, present_classes = prepare_dataloaders(
        data_dir=data_dir,
        batch_size=batch_size
    )

    model = build_model(num_classes=len(classes))
    model.load_state_dict(checkpoint["model_state_dict"])
    model = model.to(device)
    model.eval()

    all_preds = []
    all_targets = []

    with torch.no_grad():
        for images, targets in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(targets.numpy())

    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)

    # Calculate metrics
    accuracy = float(np.mean(all_preds == all_targets))
    precision, recall, f1, _ = precision_recall_fscore_support(all_targets, all_preds, average="macro", zero_division=0)
    cm = confusion_matrix(all_targets, all_preds)

    clf_report = classification_report(
        all_targets,
        all_preds,
        target_names=classes,
        output_dict=True,
        zero_division=0
    )

    results = {
        "model_architecture": "mobilenet_v2",
        "weights_file": str(weights_file.name),
        "overall_accuracy": round(accuracy, 4),
        "macro_precision": round(float(precision), 4),
        "macro_recall": round(float(recall), 4),
        "macro_f1_score": round(float(f1), 4),
        "confusion_matrix": cm.tolist(),
        "classes": classes,
        "per_class_metrics": clf_report
    }

    eval_json = EVAL_DIR / "evaluation_metrics.json"
    with open(eval_json, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\n[OK] Evaluation Metrics:")
    print(f"Accuracy:  {accuracy * 100:.2f}%")
    print(f"Precision: {precision * 100:.2f}%")
    print(f"Recall:    {recall * 100:.2f}%")
    print(f"F1-Score:  {f1 * 100:.2f}%")
    print(f"Metrics saved to: {eval_json}")

    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default=str(BACKEND_DIR / "dataset"))
    parser.add_argument("--weights", type=str, default=str(MODELS_DIR / "agrimitra_mobilenetv2.pth"))
    args = parser.parse_args()

    evaluate_model(data_dir=args.data_dir, weights_path=args.weights)
