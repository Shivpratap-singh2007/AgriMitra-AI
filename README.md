# 🌱 AgriMitra AI

### Smart Polyhouse & Farmer Advisory System

> **AgriMitra AI** is an AI-powered agricultural assistant designed to help farmers make better farming decisions through crop image analysis, intelligent farmer assistance, and smart agricultural advisory.

---

## 👥 Team

### 🚀 Team STPR

**STPR** is the team behind AgriMitra AI, focused on building practical AI-based solutions for real-world agricultural problems.

---

# 📌 Problem Statement

Agriculture plays a major role in the Indian economy, but farmers often face several challenges while making day-to-day farming decisions.

Some of the major problems are:

- 🌾 Difficulty in identifying crop health problems from plant symptoms.
- 🔍 Lack of quick and accessible crop disease analysis.
- 🌦️ Difficulty in deciding suitable crops according to weather conditions.
- 💧 Difficulty in managing irrigation and other farming requirements.
- 🤝 Limited access to personalized agricultural guidance.
- 📱 Farmers may not always have easy access to agricultural experts.
- 🧠 Existing agricultural information can be difficult to understand for farmers without technical knowledge.

These challenges can lead to incorrect farming decisions, crop damage, increased expenses, and reduced productivity.

### 🎯 Our Goal

Our goal is to provide farmers with an **easy-to-use AI-powered agricultural assistant** that can analyze crop images and provide simple, farmer-friendly guidance.

---

# 💡 Our Solution

## 🌱 AgriMitra AI

AgriMitra AI acts as a **digital farming companion** for farmers.

The system combines Artificial Intelligence with a simple farmer-friendly interface to provide agricultural assistance.

Farmers can:

1. 📷 Upload a crop image.
2. 🤖 Get AI-based crop analysis.
3. 💬 Ask agricultural questions to the AI assistant.
4. 🌦️ Get farming-related advisory.
5. 🌱 Receive recommendations based on the available agricultural information.

The main objective is to make AI technology more accessible and useful for farmers.

---

# ⭐ What Makes AgriMitra AI Unique?

AgriMitra AI is not designed as just a simple chatbot.

It combines multiple agricultural assistance features into one platform.

### 🔹 1. AI-Based Crop Vision

Farmers can upload an image of their crop.

The AI analyzes the image and provides information such as:

- Crop identification
- Crop health
- Possible disease
- Confidence level

---

### 🔹 2. Intelligent Farmer Assistant

The farmer can directly communicate with the AI assistant using natural language.

For example:

> "Agra ka mausam kaisa hai aur fasal ke liye kya karna chahiye?"

The assistant provides a simple and farmer-friendly response.

---

### 🔹 3. Farmer-Friendly Communication

The system is designed to avoid unnecessary technical language.

The goal is to provide information in a way that is easy for farmers to understand.

---

### 🔹 4. AI + Agricultural Advisory

Instead of providing only crop identification, AgriMitra AI aims to provide practical agricultural guidance through its advisory and AI assistant features.

---

### 🔹 5. Single Agricultural Assistance Platform

Crop analysis and farmer assistance are brought together into one web application.

This reduces the need for farmers to depend on multiple separate tools.

---

# 🚀 Key Features

## 📷 Crop Vision AI

- Upload crop images
- Image-based crop analysis
- Crop health assessment
- Possible disease detection
- Confidence score

---

## 🤖 Anndata AI – Farmer Assistant

- AI-powered farmer chat
- Natural language interaction
- Agricultural question answering
- Farmer-friendly responses
- Context-based agricultural assistance

---

## 🌾 Smart Agricultural Advisory

The system provides agricultural guidance related to:

- Crop selection
- Weather-related farming decisions
- Crop health
- Irrigation
- General farming practices

---

## 🖥️ Simple Web Interface

The application provides a clean and simple interface designed to make the system easy to use.

---

# 🧠 AI Integration

AgriMitra AI uses AI models to power its intelligent features.

### Gemini AI

Gemini is integrated into the backend for AI-powered:

- Text generation
- Farmer assistance
- Crop image analysis

### Ollama

Ollama can also be used for local AI functionality, allowing AI models to run locally without requiring every interaction to depend on an external API.

---

# 🛠️ Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- Node.js
- Express.js
- Multer
- CORS

## Artificial Intelligence

- Google Gemini API
- Ollama
- Vision AI
- Generative AI

## Development Tools

- Visual Studio Code
- Git
- GitHub

---

# 🏗️ Project Architecture

```text
                 ┌─────────────────────┐
                 │       Farmer        │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   AgriMitra AI      │
                 │    Web Interface    │
                 └──────────┬──────────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      ┌───────────────┐             ┌───────────────┐
      │ Crop Vision AI│             │ Anndata AI    │
      │ Image Analysis│             │ Farmer Chat   │
      └───────┬───────┘             └───────┬───────┘
              │                             │
              └──────────────┬──────────────┘
                             ▼
                    ┌─────────────────┐
                    │   AI Backend    │
                    │ Node + Express  │
                    └────────┬────────┘
                             │
                  ┌──────────┴──────────┐
                  ▼                     ▼
           ┌────────────┐        ┌────────────┐
           │ Gemini AI  │        │  Ollama    │
           └────────────┘        └────────────┘