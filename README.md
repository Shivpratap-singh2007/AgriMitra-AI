# 🌱 AgriMitra AI – Dual AI Crop Disease Detection Platform
### कृषिमित्र AI – किसानों का सरल, दोहरी AI तकनीक युक्त डिजिटल साथी

> **AgriMitra AI** is a beginner-friendly, mobile-first agricultural decision-support platform designed for Indian farmers. It focuses initially on two high-value crops: **Tomato (टमाटर)** and **Potato (आलू)**.
>
> Its core innovation is a **Dual AI Image Analysis Engine** allowing farmers and evaluators to analyze crop pathology using:
> 1. **My Own Trained AI Model** (PyTorch MobileNetV2 Transfer Learning on PlantVillage)
> 2. **Google Gemini Vision AI** (Cloud Multimodal Reasoning)
> 3. **Compare Both AI Systems** (Side-by-side consensus verification with disagreement detection)

---

## 🏗️ 1. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Farmer's Device                      │
│       Mobile Browser / Tablet / Desktop Web            │
└───────────────────────────┬────────────────────────────┘
                            │  HTTP / JSON (Port 5001)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Frontend (React + Vite + TS)                │
│  - React 19, TypeScript, Tailwind CSS, Lucide Icons   │
│  - Mode A (PyTorch) / Mode B (Gemini) / Mode C (Dual)  │
│  - Web Speech API (Multilingual Voice-to-Text)         │
│  - Bilingual English & हिन्दी Dictionary                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Backend (Python + FastAPI)               │
│  - FastAPI Application & Lifespan Model Manager        │
│  - CORS Middleware & Safe Environment Key Manager      │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
      ┌────────┴────────┐        ┌────────┴────────┐
      ▼                 ▼        ▼                 ▼
┌──────────────┐ ┌──────────────┐┌──────────────┐ ┌──────────────┐
│  PyTorch     │ │Google Gemini ││ Crop Database│ │ Evaluation   │
│  MobileNetV2 │ │ Vision & Chat││ Tomato/Potato│ │ Precision,   │
│  (8 Classes) │ │ Multimodal   ││ ICAR/CPRI RAG│ │ F1, Conf Mat │
└──────────────┘ └──────────────┘└──────────────┘ └──────────────┘
```

---

## 🎯 2. Three Crop Doctor Modes

### 🔹 Mode A: My Own AI Model (PyTorch MobileNetV2)
- **Architecture**: MobileNetV2 backbone pretrained on ImageNet with custom Dropout + Linear classification heads.
- **Classes Supported (8 classes)**:
  - **Tomato**: `Healthy`, `Early Blight`, `Late Blight`, `Leaf Mold`, `Septoria Leaf Spot`
  - **Potato**: `Healthy`, `Early Blight`, `Late Blight`
- **Startup Loading**: The PyTorch model is loaded into memory **once** when the FastAPI backend starts.
- **Uncertainty & Mismatch Detection**:
  - Dynamically calculates Softmax probabilities across all classes.
  - If top probability is below the threshold (default: 55%), it warns the farmer: *"Low confidence prediction. Leaf pattern could not be determined reliably."*
  - Checks if the selected crop matches the detected class (e.g. Potato leaf submitted under Tomato tab).
- **Zero Mock Results**: Never uses hardcoded or fake prediction results.

### 🔹 Mode B: Google Gemini AI
- Direct integration via secure backend (`POST /api/predict/gemini`).
- Multimodal leaf pathology analysis generating structured outputs:
  - Crop identification
  - Possible disease (English & Hindi)
  - Visible symptoms list
  - Detailed diagnostic explanation
  - Immediate cultural & organic actions
  - Long-term prevention tips
  - Uncertainty notes

### 🔹 Mode C: Compare Both AI Systems (Side-by-Side Consensus)
- Submits **one image** to both AI systems simultaneously.
- Compares predictions and displays:
  - **Consensus Banner**: `Both AI systems agree` (Green) or `Predictions differ` (Amber).
  - **Disagreement Explanation**: Analyzes why models reached differing conclusions based on pattern recognition vs. visual reasoning.
  - **Side-by-Side Comparison Cards**: Custom PyTorch confidence vs. Gemini confidence.
  - **Safety Warning**: Alerts the farmer never to spray chemicals solely based on a disputed AI result.

---

## 💬 3. AI Farmer Chatbot (किसान चौपाल)

- **Context-Aware**: Carries the selected crop context (**Tomato** or **Potato**) into every query.
- **Knowledge-Grounded (RAG)**: Chatbot prompts are enriched with verified agronomic facts from the **ICAR**, **IIHR**, and **CPRI** crop databases.
- **Bilingual & Voice-Enabled**: Supports Hindi, English, and Hinglish dialogue with microphone voice input powered by the Web Speech API.
- **One-Tap Suggested Questions**:
  - *Tomato ki fasal kitne din mein taiyar hoti hai?*
  - *Potato ki buwai kab karni chahiye?*
  - *Patte peele kyun ho rahe hain?*
  - *Late blight se kaise bachein?*
  - *Kitne din mein irrigation karni chahiye?*

---

## 📖 4. Verified Crop Knowledge Database

Located in `backend/crop_knowledge/`:
- **`tomato.json`**: Optimal temperature (21-28°C), sandy loam pH (6.0-7.0), North/Central/South India sowing calendars, drip irrigation, NPK schedules (100:60:60), Blossom End Rot prevention (Calcium Nitrate 0.5%), and leaf pathology guides.
- **`potato.json`**: Critical night temperature (&lt;21°C for tuber bulking), friable soil pH (5.2-6.4 to resist Common Scab), Indo-Gangetic plains sowing calendar, ridge & furrow irrigation, earthing up, dehaulming, and late blight prevention.

---

## 🏋️ 5. Model Training & Evaluation Pipeline

The backend includes a complete PyTorch training and evaluation suite:

### Step 1: Dataset Setup
See [`backend/DATASET_GUIDE.md`](file:///c:/Users/Shiv%20Pratap%20Singh/OneDrive/Desktop/AgriMitra-AI/backend/DATASET_GUIDE.md) for PlantVillage dataset download instructions.
A sample dataset generator is included:
```bash
.venv\Scripts\python.exe backend/model_training/create_sample_dataset.py
```

### Step 2: Train the Model
```bash
.venv\Scripts\python.exe backend/model_training/train.py --data_dir backend/dataset_sample --epochs 10 --batch_size 16 --lr 0.001
```
- Outputs best weights to: `backend/models/agrimitra_mobilenetv2.pth`
- Saves class metadata to: `backend/models/class_names.json`
- Saves training curves to: `backend/models/training_history.json`

### Step 3: Evaluate Performance
```bash
.venv\Scripts\python.exe backend/evaluation/evaluate.py --data_dir backend/dataset_sample
```
- Outputs test accuracy, precision, recall, F1-score, and confusion matrix to:
  `backend/evaluation/evaluation_metrics.json`

---

## 🚀 6. Quick Start Guide

### Step 1: Start the Backend (FastAPI + PyTorch)
```bash
# Run with virtual environment
.venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 5001
```

### Step 2: Open in Browser
👉 Open **[http://localhost:5001](http://localhost:5001)** in your web browser.

The FastAPI backend automatically serves the compiled production React single-page app!

*(Optional for Frontend Development: run `npm run dev --prefix frontend` on port 5173 with automated API proxying).*

---

## 📱 6. Android Phone Deployment & PWA Installation

AgriMitra AI is architected as an **installable Progressive Web App (PWA)** optimized for Android devices.

### How to Install on Android Phones:
1. **HTTPS Requirement**: Android Chrome enforces HTTPS (or `localhost`) to enable camera access, WebAPK generation, and installation.
2. Open the deployed application URL in **Google Chrome** on your Android phone.
3. Tap the in-app **"Install App on Phone"** button in your Profile tab, or tap Chrome's three-dot menu (**⋮**) and select **"Install app"** / **"Add to Home screen"**.
4. The app installs directly onto the Android home screen and app drawer with native standalone display, high-resolution splash screen, and camera integration.

### Testing on Android via Local Development:
* **Option A (Chrome USB Port Forwarding - Recommended for Testing)**:
  1. Connect your Android phone to your PC with USB debugging enabled.
  2. In PC Chrome, visit `chrome://inspect/#devices`.
  3. Configure Port Forwarding: `5001` -> `localhost:5001`.
  4. On your Android phone Chrome, open `http://localhost:5001`. Chrome treats `localhost` as a secure origin, allowing camera and PWA installation testing without an SSL certificate!
* **Option B (HTTPS Tunnel via Cloudflare or ngrok)**:
  ```bash
  # Using cloudflared (free HTTPS tunnel)
  cloudflared tunnel --url http://127.0.0.1:5001
  # Or using ngrok
  ngrok http 5001
  ```
  Open the generated HTTPS URL on your Android phone to test live camera capture and PWA installation.

---

## 🌐 7. Production Web Deployment Guide

### Single-Container Deployment (Docker / Cloud Run / Render)
The FastAPI backend is preconfigured to serve both the production static frontend assets from `frontend/dist` and the REST API from `/api`.

1. **Build the production frontend bundle**:
   ```bash
   npm run build
   ```
2. **Start the production server** on `0.0.0.0`:
   ```bash
   npm run start:prod
   ```

### Production Environment Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Listening port for web server | `5001` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed domains (e.g. `https://yourdomain.com`) | `*` |
| `GEMINI_API_KEY` | Google Gemini API key from AI Studio | `.env` |
| `VITE_API_BASE_URL` | Frontend API base URL (for split deployments) | `/api` |

---

## 💻 8. Windows Electron Desktop Build

The Windows Electron desktop application is preserved and configured via `electron/main.js`.

### Run Desktop App in Development:
```bash
npm run electron
```

### Build Windows Installer (.exe / NSIS):
```bash
npm run electron:dist
```
Installer packages are generated into the `dist_electron/` directory.

---

## 🔑 9. Setting Up Google Gemini API Key

1. Click the **"⚙️ API Settings"** button in the navigation header.
2. Enter your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Click **"Save Key"** — it persists directly to your `.env` file and updates the live runtime environment.

---

## 🛡️ Agronomic Safety Standard

> **Safety Notice**: AgriMitra AI is an assistive decision-support tool. It does **not** provide final laboratory pathology diagnoses, nor does it invent unsafe chemical pesticide dosages. Farmers are consistently advised to verify recommendations with local Krishi Vigyan Kendras (KVKs) and extension officers.

---

**Developed with ❤️ for Indian Farmers by Team EOOECODERS**