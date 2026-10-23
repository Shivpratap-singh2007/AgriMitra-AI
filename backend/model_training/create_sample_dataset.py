"""
Sample Dataset Generator for AgriMitra AI
Creates a representative minimal dataset in backend/dataset_sample/
for the 8 Tomato and Potato classes to test train.py, evaluate.py, and model loading.
"""

from pathlib import Path
from PIL import Image, ImageDraw

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
SAMPLE_DATASET_DIR = BACKEND_DIR / "dataset_sample"

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

COLOR_MAP = {
    "Tomato___healthy": (34, 139, 34),
    "Tomato___Early_blight": (85, 107, 47),
    "Tomato___Late_blight": (47, 79, 79),
    "Tomato___Leaf_Mold": (107, 142, 35),
    "Tomato___Septoria_leaf_spot": (128, 128, 0),
    "Potato___healthy": (46, 139, 87),
    "Potato___Early_blight": (102, 102, 51),
    "Potato___Late_blight": (60, 80, 60),
}

def create_sample_images(samples_per_class: int = 15):
    """Generates synthetic leaf images to validate training and inference pipelines."""
    SAMPLE_DATASET_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Creating sample dataset with {len(TARGET_CLASSES)} classes at: {SAMPLE_DATASET_DIR}")

    for cls_name in TARGET_CLASSES:
        cls_dir = SAMPLE_DATASET_DIR / cls_name
        cls_dir.mkdir(parents=True, exist_ok=True)
        base_color = COLOR_MAP.get(cls_name, (50, 120, 50))

        for i in range(samples_per_class):
            img = Image.new("RGB", (224, 224), color=base_color)
            draw = ImageDraw.Draw(img)

            # Draw a leaf outline
            draw.ellipse([40, 20, 184, 204], fill=(base_color[0] + 15, base_color[1] + 15, base_color[2] + 10))
            # Draw leaf veins
            draw.line([112, 30, 112, 190], fill=(20, 80, 20), width=3)
            draw.line([112, 70, 70, 95], fill=(20, 80, 20), width=2)
            draw.line([112, 70, 154, 95], fill=(20, 80, 20), width=2)
            draw.line([112, 120, 60, 145], fill=(20, 80, 20), width=2)
            draw.line([112, 120, 164, 145], fill=(20, 80, 20), width=2)

            # Disease symptoms simulation
            if "Early_blight" in cls_name:
                # Concentric brown spots
                draw.ellipse([80, 80, 105, 105], fill=(70, 40, 20))
                draw.ellipse([85, 85, 100, 100], fill=(110, 70, 30))
                draw.ellipse([130, 130, 155, 155], fill=(70, 40, 20))
            elif "Late_blight" in cls_name:
                # Water-soaked irregular lesion
                draw.polygon([(90, 70), (140, 60), (130, 120), (80, 110)], fill=(40, 40, 30))
                draw.rectangle([100, 130, 140, 160], fill=(50, 45, 35))
            elif "Leaf_Mold" in cls_name:
                # Velvety patches
                draw.ellipse([90, 90, 135, 135], fill=(130, 120, 40))
            elif "Septoria" in cls_name:
                # Small circular spots with dark borders
                for offset in [(75, 75), (95, 125), (140, 90), (130, 150)]:
                    draw.ellipse([offset[0], offset[1], offset[0] + 10, offset[1] + 10], fill=(200, 200, 200), outline=(40, 20, 10))

            file_path = cls_dir / f"sample_{i+1:03d}.jpg"
            img.save(file_path, "JPEG", quality=90)

    print("[OK] Sample dataset generation complete.")

if __name__ == "__main__":
    create_sample_images(samples_per_class=15)
