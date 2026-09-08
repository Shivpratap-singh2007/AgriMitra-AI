# 🌱 AgriMitra AI

Smart Polyhouse & Farmer Advisory System

AgriMitra AI is an AI-powered agricultural assistant built to help farmers make better decisions using crop image analysis, weather and sensor monitoring, and smart farming guidance.

## Overview

This project combines:

- Crop image analysis
- Smart agricultural advisory
- Farmer-friendly AI assistant
- Sensor-based irrigation and climate monitoring
- Polyhouse automation suggestions

It is designed to make farming decisions easier, faster, and more understandable for farmers in India.

## Features

### 1. Crop Vision AI
- Upload a crop image
- Detect crop health condition
- Identify possible disease
- Show confidence score

### 2. Farmer Assistant
- Ask farming-related questions in natural language
- Get simple, practical recommendations
- Use farmer-friendly explanations

### 3. Smart Advisory
- Irrigation suggestions
- Temperature and humidity guidance
- Crop monitoring advice
- Actionable polyhouse recommendations

### 4. Live Sensor Dashboard
- Temperature
- Humidity
- Soil moisture
- Rain status
- Device status for pump and fan

### 5. Automation Support
- Auto mode for smart control
- Manual override for pump and fan

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- Multer
- CORS
- dotenv

### AI Tools
- Google Gemini API
- Ollama (local AI support)

## Project Structure

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

## Prerequisites

Before running the app, install:

- Node.js LTS
- npm
- Git
- VS Code (recommended)
- Gemini API key
- Optional: Ollama for local AI

## Setup Instructions

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

### 3. Add environment variables

Create a `.env` file inside the `backend` folder:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start the backend server

```bash
cd backend
node server.js
```

The backend will run on:

```text
http://localhost:5000
```

### 5. Run the frontend

Open the frontend file in a browser, or use Live Server in VS Code.

```text
frontend/index.html
```

The frontend will connect to the backend on:

```text
http://localhost:5000
```

## Optional: Local AI with Ollama

If you want to use local AI models:

```bash
ollama pull llama3.2
ollama pull llava
```

Then the backend is configured to call Ollama locally on:

```text
http://localhost:11434
```

## Usage

1. Open the web app.
2. View live sensor readings.
3. Upload a crop image for crop analysis.
4. Ask the AI assistant farming questions.
5. Review smart advisory suggestions.

## Team

Team STPR

## License

This project is for educational and prototype purposes.

## Notes

This app is intended as a smart agriculture prototype and can be extended with real IoT sensor integration, weather APIs, database storage, and deployment to cloud hosting.