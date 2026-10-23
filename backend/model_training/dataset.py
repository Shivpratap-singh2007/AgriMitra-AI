"""
PlantVillage Dataset Preparation and Augmentation Module
Supports configurable dataset directory, train/val/test splits,
and PyTorch ImageFolder transforms for Tomato and Potato crops.
"""

import os
from pathlib import Path
from typing import Tuple, Dict, List
import torch
from torch.utils.data import DataLoader, Dataset, random_split
from torchvision import datasets, transforms

# 8 Target Classes across Tomato and Potato from PlantVillage
TARGET_CLASSES = [
    "Tomato___healthy",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Potato___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight"
]

CLASS_DISPLAY_NAMES = {
    "Tomato___healthy": {"crop": "Tomato", "disease": "Healthy", "disease_hi": "स्वस्थ टमाटर"},
    "Tomato___Early_blight": {"crop": "Tomato", "disease": "Early Blight", "disease_hi": "टमाटर अगेती झुलसा"},
    "Tomato___Late_blight": {"crop": "Tomato", "disease": "Late Blight", "disease_hi": "टमाटर पछेती झुलसा"},
    "Tomato___Leaf_Mold": {"crop": "Tomato", "disease": "Leaf Mold", "disease_hi": "टमाटर लीफ मोल्ड"},
    "Tomato___Septoria_leaf_spot": {"crop": "Tomato", "disease": "Septoria Leaf Spot", "disease_hi": "टमाटर सेप्टोरिया धब्बा रोग"},
    "Potato___healthy": {"crop": "Potato", "disease": "Healthy", "disease_hi": "स्वस्थ आलू"},
    "Potato___Early_blight": {"crop": "Potato", "disease": "Early Blight", "disease_hi": "आलू अगेती झुलसा"},
    "Potato___Late_blight": {"crop": "Potato", "disease": "Late Blight", "disease_hi": "आलू पछेती झुलसा"}
}

def get_data_transforms() -> Dict[str, transforms.Compose]:
    """Image transforms: Training augmentation + standard ImageNet normalization."""
    return {
        "train": transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomVerticalFlip(p=0.3),
            transforms.RandomRotation(degrees=20),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ]),
        "val": transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ]),
        "test": transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    }

class FilteredDataset(Dataset):
    """Wrapper that filters an ImageFolder dataset to target classes only."""
    def __init__(self, base_dataset: datasets.ImageFolder, target_classes: List[str], transform=None):
        self.transform = transform
        self.classes = target_classes
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(target_classes)}
        
        self.samples = []
        base_classes = base_dataset.classes
        for img_path, class_idx in base_dataset.samples:
            class_name = base_classes[class_idx]
            if class_name in self.class_to_idx:
                new_idx = self.class_to_idx[class_name]
                self.samples.append((img_path, new_idx))
                
    def __len__(self):
        return len(self.samples)
        
    def __getitem__(self, idx):
        from PIL import Image
        path, target = self.samples[idx]
        with open(path, "rb") as f:
            img = Image.open(f).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, target

def prepare_dataloaders(
    data_dir: str,
    batch_size: int = 32,
    train_split: float = 0.7,
    val_split: float = 0.15,
    test_split: float = 0.15,
    num_workers: int = 0
) -> Tuple[DataLoader, DataLoader, DataLoader, List[str]]:
    """Loads dataset from folder structure, creates train/val/test splits and DataLoaders."""
    data_path = Path(data_dir)
    if not data_path.exists():
        raise FileNotFoundError(f"Dataset directory '{data_dir}' does not exist.")

    transforms_dict = get_data_transforms()
    base_raw = datasets.ImageFolder(root=str(data_path))
    
    # Check present classes
    present_classes = [c for c in TARGET_CLASSES if c in base_raw.classes]
    if not present_classes:
        # Fallback to whatever classes exist in data_dir
        present_classes = base_raw.classes

    filtered_data = FilteredDataset(base_raw, present_classes, transform=transforms_dict["train"])
    total_len = len(filtered_data)
    if total_len == 0:
        raise ValueError(f"No valid images found in '{data_dir}' matching target classes.")

    train_len = int(train_split * total_len)
    val_len = int(val_split * total_len)
    test_len = total_len - train_len - val_len

    train_ds, val_ds, test_ds = random_split(
        filtered_data,
        [train_len, val_len, test_len],
        generator=torch.Generator().manual_seed(42)
    )

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    return train_loader, val_loader, test_loader, present_classes
