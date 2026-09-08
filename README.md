# 🌱 AgriMitra AI

<div align="center">
  <img src="https://img.shields.io/badge/AI-Agriculture%20Assistant-green" alt="AI Agriculture Assistant" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-blue" alt="Node.js + Express" />
  <img src="https://img.shields.io/badge/Frontend-HTML%20%2F%20CSS%20%2F%20JS-orange" alt="Frontend" />
  <img src="https://img.shields.io/badge/Status-Prototype-lightgrey" alt="Prototype" />
</div>

### Smart Polyhouse & Farmer Advisory System

AgriMitra AI is an AI-powered agricultural assistant built to help farmers monitor crop health, understand real-time environmental conditions, and receive practical guidance for improving agricultural decisions.

This project combines crop image analysis, synthetic sensor monitoring, AI-driven advisory, and a simple farmer-friendly web interface into a single smart agriculture platform.

---

## 🚀 Problem We Solve

Farmers often struggle with:

- crop disease detection
- lack of quick agricultural guidance
- uncertainty about irrigation and climate needs
- poor access to expert advice
- difficulty understanding complex technical recommendations

AgriMitra AI reduces these challenges by making decisions simple, accessible, and actionable.

---

## ✨ Features

### 1. Crop Vision
- Upload crop images
- Detect crop health status
- Identify possible disease
- Show confidence level

### 2. AI Farmer Assistant
- Ask farming questions in simple natural language
- Receive practical crop and irrigation advice
- Access guidance in an easy-to-understand format

### 3. Smart Advisory Engine
- Irrigation suggestions
- Humidity and temperature guidance
- Crop condition recommendations
- Polyhouse activity recommendations

### 4. Live Sensor Dashboard
- Temperature
- Humidity
- Soil moisture
- Rain status
- Pump and fan control state

### 5. Automation
- Smart auto mode
- Manual override for devices

---

## 🧠 AI Workflow

```text
Farmer input / crop image
        ↓
Frontend web app
        ↓
Node.js + Express backend
        ↓
Gemini API / Ollama AI model
        ↓
Farmer-friendly agricultural advice
```

---

## 🏗️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- Multer
- CORS
- dotenv

### AI
- Google Gemini API
- Ollama
- Vision analysis

---

## 📁 Project Structure

```text
AgriMitra-AI/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── .gitignore
├── README.md
└── package.json
```

---

## ⚙️ Setup and Run

### 1. Clone the repository

```bash
git clone https://github.com/Shivpratap-singh2007/AgriMitra-AI.git
cd AgriMitra-AI
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Add Gemini API key

Create a `.env` file inside `backend`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start the backend

```bash
cd backend
node server.js
```

Server runs at:

```text
http://localhost:5000
```

### 5. Open the frontend

Open `frontend/index.html` in the browser, or use Live Server in VS Code.

---

## 🧪 Optional Local AI Setup

If you want to run AI locally using Ollama:

```bash
ollama pull llama3.2
ollama pull llava
```

The backend is configured to call Ollama at:

```text
http://localhost:11434
```

---

## 📲 How to Use

1. Open the web application.
2. Observe live polyhouse sensor values.
3. Upload a crop image for AI crop analysis.
4. Ask the AI assistant about farming problems.
5. Review irrigation and environmental recommendations.

---

## 👥 Team

**Team STPR**

---

## 🌾 Future Scope

This project can be extended with:

- real IoT sensor integration
- weather API integration
- multilingual support
- farmer login system
- database support
- production deployment
- mobile app version

---

## 🔗 Repository

https://github.com/Shivpratap-singh2007/AgriMitra-AI

---

## 📝 Note

This project is a smart agriculture prototype designed to demonstrate AI + farming assistance for real-world agricultural use cases.
