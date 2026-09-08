# 🌱 AgriMitra AI

<div align="center">
  <img src="https://img.shields.io/badge/AI-Agriculture%20Assistant-green" alt="AI Agriculture Assistant" />
  <img src="https://img.shields.io/badge/Tech-Node.js%20%2B%20AI-blue" alt="Node.js + AI" />
  <img src="https://img.shields.io/badge/Status-Prototype-orange" alt="Prototype" />
</div>

### Smart Polyhouse & Farmer Advisory System

AgriMitra AI is an AI-powered agricultural assistant designed to help farmers monitor crops, understand environmental conditions, and receive simple, practical recommendations for better farming decisions.

It combines crop image analysis, smart advisory logic, and farmer-friendly AI support into one web application.

---

## 🚀 Why This Project Matters

Indian farmers often face difficulty in:

- identifying crop diseases early
- understanding soil and weather conditions
- deciding irrigation needs
- getting timely farming advice
- accessing clear guidance in simple language

AgriMitra AI solves this by turning complex agricultural information into easy, actionable recommendations for farmers.

---

## ✨ Key Features

### Crop Vision
- Upload crop images
- Detect crop health
- Identify possible disease
- Display confidence score

### Farmer AI Assistant
- Ask agriculture-related questions in natural language
- Get practical, simple answers
- Understand recommendations without technical complexity

### Smart Advisory
- Irrigation guidance
- Temperature and humidity monitoring
- Health and crop recommendation engine
- Polyhouse-based action suggestions

### Live Monitoring Dashboard
- Temperature
- Humidity
- Soil moisture
- Rain prediction status
- Pump and fan state

### Automation Support
- Auto mode for smart control
- Manual override for devices

---

## 🧠 AI Integration

This project uses:

- Google Gemini API for text and analysis features
- Ollama for local AI support
- Vision-based crop assessment

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

### AI / ML
- Gemini AI
- Ollama
- Vision-based crop analysis

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

## ⚙️ Setup Instructions

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

### 3. Create environment file

Inside `backend`, create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start the backend

```bash
cd backend
node server.js
```

Backend runs at:

```text
http://localhost:5000
```

### 5. Run the frontend

Open the file below in the browser or use Live Server in VS Code:

```text
frontend/index.html
```

The frontend connects to:

```text
http://localhost:5000
```

---

## 🧪 Optional: Local AI with Ollama

If you want local AI models:

```bash
ollama pull llama3.2
ollama pull llava
```

The backend is designed to talk to Ollama at:

```text
http://localhost:11434
```

---

## 📲 How to Use

1. Open the app in the browser.
2. Check live sensor data.
3. Upload a crop image for AI-based crop analysis.
4. Ask a farming question to the assistant.
5. Review smart recommendations for crop health and irrigation.

---

## 👥 Team

**Team STPR**

---

## 📝 License

This project is currently a prototype for agricultural AI and smart polyhouse solutions.

---

## 🌾 Future Scope

This project can be extended with:

- real IoT sensor integration
- weather API integration
- database-backed user data
- farmer login system
- multilingual support
- deployment on cloud platforms
- mobile app version

---

## 🔗 Repository

https://github.com/Shivpratap-singh2007/AgriMitra-AI
