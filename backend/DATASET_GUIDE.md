# 🌱 AgriMitra AI – PlantVillage Dataset & Model Training Guide

This guide describes how to prepare the **PlantVillage** dataset, train the custom **PyTorch MobileNetV2** transfer learning model for **Tomato** and **Potato** disease classification, and evaluate performance.

---

## 📁 1. Dataset Directory Structure

Create a dataset directory (for example `backend/dataset/`) containing the 8 target disease classes:

```text
backend/dataset/
├── Tomato___healthy/
│   ├── image_001.jpg
│   └── ...
├── Tomato___Early_blight/
│   ├── image_001.jpg
│   └── ...
├── Tomato___Late_blight/
│   ├── image_001.jpg
│   └── ...
├── Tomato___Leaf_Mold/
│   ├── image_001.jpg
│   └── ...
├── Tomato___Septoria_leaf_spot/
│   ├── image_001.jpg
│   └── ...
├── Potato___healthy/
│   ├── image_001.jpg
│   └── ...
├── Potato___Early_blight/
│   ├── image_001.jpg
│   └── ...
└── Potato___Late_blight/
    ├── image_001.jpg
    └── ...
```

---

## 📥 2. Downloading the PlantVillage Dataset

### Option A: From Kaggle (Recommended)
1. Download the [PlantVillage Dataset on Kaggle](https://www.kaggle.com/datasets/emmarex/plantdisease).
2. Extract the archive.
3. Copy the 8 Tomato and Potato folders listed above into `backend/dataset/`.

### Option B: From GitHub PlantVillage Repository
1. Clone or download from the official GitHub repository:
   ```bash
   git clone https://github.com/spMohanty/PlantVillage-Dataset.git
   ```
2. The relevant folders are under `raw/color/`:
   - `Tomato___healthy`
   - `Tomato___Early_blight`
   - `Tomato___Late_blight`
   - `Tomato___Leaf_Mold`
   - `Tomato___Septoria_leaf_spot`
   - `Potato___healthy`
   - `Potato___Early_blight`
   - `Potato___Late_blight`

---

## 🏋️ 3. Training the Model

Execute the training script from the project root:

```bash
# Activate your virtual environment
.venv\Scripts\activate   # Windows
# source .venv/bin/activate # Linux/Mac

# Run training
python backend/model_training/train.py --data_dir backend/dataset --epochs 10 --batch_size 32 --lr 0.001
```

### What the training script does:
1. **Splits Data**: Automatically creates **70% Train**, **15% Validation**, and **15% Test** splits using a fixed random seed.
2. **Data Augmentation**: Applies random horizontal flips, vertical flips, rotations, and color jitter to boost model generalization on real-world farmer field photos.
3. **Transfer Learning**: Freezes MobileNetV2 pretrained convolutional backbone and fine-tunes custom Dropout + Linear classification heads.
4. **Learning Rate Scheduler**: Reduces learning rate dynamically on plateau when validation accuracy levels off.
5. **Model Checkpointing**: Saves the best checkpoint based on validation accuracy to:
   - Weights: `backend/models/agrimitra_mobilenetv2.pth`
   - Class Mapping: `backend/models/class_names.json`
   - Training Curve Metrics: `backend/models/training_history.json`

---

## 📊 4. Evaluating the Model

Once trained, evaluate the model on the unseen test set:

```bash
python backend/evaluation/evaluate.py --data_dir backend/dataset --weights backend/models/agrimitra_mobilenetv2.pth
```

This generates:
- **Overall Test Accuracy**
- **Macro Precision, Recall, and F1-score**
- **Confusion Matrix** (Saved in `backend/evaluation/evaluation_metrics.json`)

---

## 🔄 5. Retraining with Farmer Field Images

When you gather new photographs of diseased leaves from Indian farm fields:
1. Place the verified photos into their corresponding class folder (e.g., `Tomato___Early_blight`).
2. Run `train.py` with fine-tuning (e.g., `--epochs 5 --lr 0.0001`).
3. The server will automatically reload the newly saved model weights upon restart without changing any client-side code!
