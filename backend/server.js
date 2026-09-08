const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 5000;
const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const GEMINI_VISION_MODEL = "gemini-3.6-flash";
const GEMINI_TEXT_MODEL = "gemini-3.6-flash";

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// =====================================================
// OLLAMA CONFIG (Local AI - No API key, No internet needed)
// =====================================================

const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_TEXT_MODEL = "llama3.2";
const OLLAMA_VISION_MODEL = "llava";

// =====================================================
// TEMPORARY SENSOR DATA
// Later ESP32 will send real data here
// =====================================================

let sensorData = {
    temperature: 28,
    humidity: 65,
    soilMoisture: 42,
    rainExpected: false,
    pump: false,
    fan: false
};

// =====================================================
// HOME / SERVER TEST
// =====================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🌱 Anndata AI Backend is running (Local AI - Ollama)!",
        version: "2.0.0"
    });
});

// =====================================================
// GET SENSOR DATA
// =====================================================

app.get("/api/sensors", (req, res) => {
    res.json({
        success: true,
        data: sensorData
    });
});

// =====================================================
// UPDATE SENSOR DATA
// =====================================================

app.post("/api/sensors", (req, res) => {
    const { temperature, humidity, soilMoisture, rainExpected } = req.body;

    if (temperature !== undefined) sensorData.temperature = Number(temperature);
    if (humidity !== undefined) sensorData.humidity = Number(humidity);
    if (soilMoisture !== undefined) sensorData.soilMoisture = Number(soilMoisture);
    if (rainExpected !== undefined) sensorData.rainExpected = Boolean(rainExpected);

    res.json({
        success: true,
        message: "Sensor data updated",
        data: sensorData
    });
});

// =====================================================
// PUMP CONTROL
// =====================================================

app.post("/api/device/pump", (req, res) => {
    const { state } = req.body;

    if (typeof state !== "boolean") {
        return res.status(400).json({
            success: false,
            message: "state must be true or false"
        });
    }

    sensorData.pump = state;

    res.json({
        success: true,
        device: "pump",
        state: sensorData.pump
    });
});

// =====================================================
// FAN CONTROL
// =====================================================

app.post("/api/device/fan", (req, res) => {
    const { state } = req.body;

    if (typeof state !== "boolean") {
        return res.status(400).json({
            success: false,
            message: "state must be true or false"
        });
    }

    sensorData.fan = state;

    res.json({
        success: true,
        device: "fan",
        state: sensorData.fan
    });
});

// =====================================================
// AUTOMATIC CONTROL
// =====================================================

app.post("/api/auto-control", (req, res) => {
    if (sensorData.soilMoisture < 30) {
        sensorData.pump = true;
    } else if (sensorData.soilMoisture > 45) {
        sensorData.pump = false;
    }

    if (sensorData.temperature > 30) {
        sensorData.fan = true;
    } else if (sensorData.temperature < 28) {
        sensorData.fan = false;
    }

    res.json({
        success: true,
        message: "Automatic control executed",
        data: sensorData
    });
});

// =====================================================
// HELPER: CALL OLLAMA (TEXT)
// =====================================================

async function callOllamaText(prompt) {
    const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: OLLAMA_TEXT_MODEL,
            prompt: prompt,
            stream: false
        })
    });

    if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
}

// =====================================================
// HELPER: CALL GEMINI (VISION)
// =====================================================

async function callGeminiVision(prompt, base64Image, mimeType) {
    const response = await gemini.models.generateContent({
        model: GEMINI_VISION_MODEL,
        contents: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                }
            },
            {
                text: prompt
            }
        ],
        config: {
            responseMimeType: "application/json"
        }
    });

    return response.text;
}

// =====================================================
// HELPER: CALL GEMINI (TEXT)
// =====================================================

async function callGeminiText(prompt) {
    const response = await gemini.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt
    });

    return response.text;
}

// =====================================================
// ANNDATA AI CHAT
// =====================================================

app.post("/api/ai/chat", async (req, res) => {
    try {
        const { message, language, location, crop } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const prompt = `
You are Anndata AI, an intelligent agricultural assistant for Indian farmers.

IMPORTANT RULES:
1. Reply in the same language selected by the farmer.
2. Use simple farmer-friendly language.
3. Avoid unnecessary technical words.
4. Consider the farmer's location, crop, and sensor conditions.
5. Never invent current weather information.
6. Do not claim a crop disease with certainty without proper evidence.
7. Keep the answer short and practical (max 5-6 lines).

FARMER INFORMATION
Language: ${language || "English"}
Location: ${location || "Not provided"}
Crop: ${crop || "Not provided"}

CURRENT POLYHOUSE CONDITIONS
Temperature: ${sensorData.temperature} °C
Humidity: ${sensorData.humidity} %
Soil Moisture: ${sensorData.soilMoisture} %
Rain Expected: ${sensorData.rainExpected ? "Yes" : "No"}
Water Pump: ${sensorData.pump ? "ON" : "OFF"}
Fan: ${sensorData.fan ? "ON" : "OFF"}

FARMER QUESTION
${message}

Give a clear and useful answer.
`;

        const reply = await callGeminiText(prompt);
        res.json({
            success: true,
            reply: reply
        });

    } catch (error) {
        console.error("Anndata AI Error:", error);
        res.status(500).json({
            success: false,
            message: "AI request failed. Please check your Gemini API configuration.",
            error: error.message
        });
    }
});

// =====================================================
// AI FARMING ADVISORY
// =====================================================

app.get("/api/ai/advice", async (req, res) => {
    try {
        const prompt = `
You are Anndata AI, an agricultural advisory assistant for Indian farmers.

Analyze the current farm conditions.

Temperature: ${sensorData.temperature} °C
Humidity: ${sensorData.humidity} %
Soil Moisture: ${sensorData.soilMoisture} %
Rain Expected: ${sensorData.rainExpected ? "Yes" : "No"}
Pump: ${sensorData.pump ? "ON" : "OFF"}
Fan: ${sensorData.fan ? "ON" : "OFF"}

Give a short advisory containing:
1. Crop condition
2. Main risk
3. Irrigation advice
4. Ventilation advice
5. Important farmer action

Use simple language. Do not invent weather information.
`;

        const advice = await callOllamaText(prompt);

        res.json({
            success: true,
            advice: advice
        });

    } catch (error) {
        console.error("AI Advisory Error:", error);
        res.status(500).json({
            success: false,
            message: "AI advisory failed",
            error: error.message
        });
    }
});

// =====================================================
// CROP VISION - IMAGE ANALYSIS
// =====================================================

app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required"
            });
        }

        const base64Image = req.file.buffer.toString("base64");

        const prompt = `You are a crop health expert analyzing a plant/crop photo.
Look at the image carefully and respond ONLY with strict JSON, no extra text, no markdown, in exactly this structure:
{"crop": "name of crop/plant if identifiable, else Unknown", "health": "Healthy or Unhealthy", "confidence": a number between 0 and 100, "disease": "name of visible disease/problem if any, else None detected"}`;

        const rawResponse = await callGeminiVision(
    prompt,
    base64Image,
    req.file.mimetype
);
        let result;
        try {
            const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
            result = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
        } catch (parseErr) {
            result = {
                crop: "Unknown",
                health: "Unknown",
                confidence: 0,
                disease: "Could not analyze clearly, try a clearer photo"
            };
        }

        res.json({
            success: true,
            crop: result.crop || "Unknown",
            health: result.health || "Unknown",
            confidence: result.confidence || 0,
            disease: result.disease || "None detected"
        });

    } catch (error) {
        console.error("Crop Analysis Error:", error);
        res.status(500).json({
            success: false,
            message: "Gemini crop analysis failed. Please check your Gemini API configuration.", 
            error: error.message
        });
    }
});

// =====================================================
// SERVER START
// =====================================================

app.listen(PORT, () => {
    console.log("=================================");
    console.log("🌱 Anndata AI Backend (Ollama - Local AI)");
    console.log("=================================");
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Text model: ${OLLAMA_TEXT_MODEL}`);
    console.log(`Vision model: ${OLLAMA_VISION_MODEL}`);
    console.log("=================================");
});