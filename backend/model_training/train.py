"""
AgriMitra AI - PyTorch Transfer Learning Training Pipeline
Model: MobileNetV2 (Transfer Learning for Tomato & Potato Disease Classification)
Author: AgriMitra AI Team
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models

# Ensure model_training is in path
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.append(str(BACKEND_DIR))

from model_training.dataset import prepare_dataloaders, TARGET_CLASSES, CLASS_DISPLAY_NAMES

MODELS_DIR = BACKEND_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def build_model(num_classes: int = len(TARGET_CLASSES), freeze_features: bool = True) -> nn.Module:
    """Builds MobileNetV2 with custom classifier for target crop disease classes."""
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    
    if freeze_features:
        for param in model.features.parameters():
            param.requires_grad = False

    # MobileNetV2 classifier is Sequential(Dropout, Linear(1280, num_classes))
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes)
    )
    return model

def train_model(
    data_dir: str,
    epochs: int = 10,
    batch_size: int = 32,
    lr: float = 0.001,
    output_model_name: str = "agrimitra_mobilenetv2.pth",
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
):
    print("==================================================")
    print("AgriMitra AI - Training Custom PyTorch Model")
    print(f"Device: {device.upper()}")
    print(f"Dataset: {data_dir}")
    print(f"Target Epochs: {epochs} | Batch Size: {batch_size} | LR: {lr}")
    print("==================================================")

    train_loader, val_loader, test_loader, classes = prepare_dataloaders(
        data_dir=data_dir,
        batch_size=batch_size
    )
    num_classes = len(classes)
    print(f"[OK] Loaded {num_classes} classes: {classes}")

    # Save class names mapping
    class_metadata = {
        "classes": classes,
        "display_info": {c: CLASS_DISPLAY_NAMES.get(c, {"crop": "Crop", "disease": c, "disease_hi": c}) for c in classes},
        "num_classes": num_classes,
        "input_size": [224, 224],
        "model_architecture": "mobilenet_v2",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    class_file = MODELS_DIR / "class_names.json"
    with open(class_file, "w", encoding="utf-8") as f:
        json.dump(class_metadata, f, indent=2, ensure_ascii=False)
    print(f"Saved class metadata to: {class_file}")

    model = build_model(num_classes=num_classes, freeze_features=True)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=2)

    best_val_acc = 0.0
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
    best_weights_path = MODELS_DIR / output_model_name

    start_time = time.time()
    for epoch in range(1, epochs + 1):
        # Training Phase
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

        epoch_train_loss = running_loss / total
        epoch_train_acc = correct / total

        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(device)
                labels = labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += torch.sum(preds == labels.data).item()
                val_total += labels.size(0)

        epoch_val_loss = val_loss / val_total
        epoch_val_acc = val_correct / val_total
        scheduler.step(epoch_val_acc)

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 4))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["val_acc"].append(round(epoch_val_acc, 4))

        print(f"Epoch [{epoch}/{epochs}] - Train Loss: {epoch_train_loss:.4f}, Acc: {epoch_train_acc:.4f} | Val Loss: {epoch_val_loss:.4f}, Acc: {epoch_val_acc:.4f}")

        # Save checkpoint if best
        if epoch_val_acc > best_val_acc:
            best_val_acc = epoch_val_acc
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "val_accuracy": best_val_acc,
                "classes": classes,
                "architecture": "mobilenet_v2"
            }, best_weights_path)
            print(f"  [BEST] Saved best model checkpoint (Val Acc: {best_val_acc:.4f}) to {best_weights_path}")

    elapsed = time.time() - start_time
    history["total_training_time_seconds"] = round(elapsed, 2)
    history["best_val_accuracy"] = round(best_val_acc, 4)

    history_file = MODELS_DIR / "training_history.json"
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)
    print(f"[OK] Training completed in {elapsed:.1f}s. Metrics saved to {history_file}")

    return best_weights_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriMitra AI PyTorch Model Trainer")
    parser.add_argument("--data_dir", type=str, default=str(BACKEND_DIR / "dataset"), help="Path to PlantVillage dataset folder")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    args = parser.parse_args()

    train_model(data_dir=args.data_dir, epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
