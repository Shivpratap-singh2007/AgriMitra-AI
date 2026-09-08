// =====================================================
// ANNDATA AI - FRONTEND JAVASCRIPT (Local AI - Ollama)
// =====================================================

const API_URL = "http://localhost:5000";

// =====================================================
// GLOBAL STATE
// =====================================================

let autoMode = true;
let pumpState = false;
let fanState = false;
let selectedImageFile = null;

// =====================================================
// HELPER
// =====================================================

function getElement(id) {
    return document.getElementById(id);
}

// =====================================================
// SENSOR DATA
// =====================================================

async function fetchSensors() {
    try {
        const res = await fetch(`${API_URL}/api/sensors`);
        const data = await res.json();

        if (data.success) {
            updateSensorUI(data.data);
        }
    } catch (err) {
        console.error("Failed to fetch sensors:", err);
    }
}

function updateSensorUI(sensors) {
    getElement("temperature").textContent = `${sensors.temperature}°C`;
    getElement("humidity").textContent = `${sensors.humidity}%`;
    getElement("soilMoisture").textContent = `${sensors.soilMoisture}%`;
    getElement("rainStatus").textContent = sensors.rainExpected ? "Rain Expected" : "No Rain";

    getElement("temperatureBar").style.width = `${Math.min(sensors.temperature * 2, 100)}%`;
    getElement("humidityBar").style.width = `${sensors.humidity}%`;
    getElement("soilBar").style.width = `${sensors.soilMoisture}%`;

    const soilStatus = getElement("soilStatus");
    if (sensors.soilMoisture < 30) {
        soilStatus.textContent = "Low - Irrigation Needed";
    } else if (sensors.soilMoisture > 45) {
        soilStatus.textContent = "High - Well Watered";
    } else {
        soilStatus.textContent = "Normal";
    }

    pumpState = sensors.pump;
    fanState = sensors.fan;
    updateDeviceUI("pump", pumpState);
    updateDeviceUI("fan", fanState);

    updateAdvisory(sensors);
}

function updateDeviceUI(device, state) {
    const statusEl = getElement(`${device}Status`);
    const toggleEl = getElement(`${device}Toggle`);

    if (state) {
        statusEl.textContent = "ON";
        statusEl.className = "device-status on";
        toggleEl.classList.add("active");
    } else {
        statusEl.textContent = "OFF";
        statusEl.className = "device-status off";
        toggleEl.classList.remove("active");
    }
}

// =====================================================
// DEVICE CONTROL
// =====================================================

async function togglePump() {
    if (autoMode) {
        alert("Auto mode is ON. Turn it OFF first to control this device manually.");
        return;
    }

    pumpState = !pumpState;

    try {
        const res = await fetch(`${API_URL}/api/device/pump`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: pumpState })
        });

        const data = await res.json();
        if (data.success) {
            updateDeviceUI("pump", data.state);
        }
    } catch (err) {
        console.error("Failed to toggle pump:", err);
    }
}

async function toggleFan() {
    if (autoMode) {
        alert("Auto mode is ON. Turn it OFF first to control this device manually.");
        return;
    }

    fanState = !fanState;

    try {
        const res = await fetch(`${API_URL}/api/device/fan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: fanState })
        });

        const data = await res.json();
        if (data.success) {
            updateDeviceUI("fan", data.state);
        }
    } catch (err) {
        console.error("Failed to toggle fan:", err);
    }
}

function toggleAutoMode() {
    autoMode = !autoMode;
    const btn = getElement("autoModeBtn");
    btn.textContent = autoMode ? "🤖 AUTO MODE: ON" : "🤖 AUTO MODE: OFF";
}

async function runAutoControl() {
    if (!autoMode) return;

    try {
        const res = await fetch(`${API_URL}/api/auto-control`, {
            method: "POST"
        });

        const data = await res.json();
        if (data.success) {
            updateSensorUI(data.data);
        }
    } catch (err) {
        console.error("Auto control failed:", err);
    }
}

// =====================================================
// ADVISORY
// =====================================================

function updateAdvisory(sensors) {
    const irrigationEl = getElement("irrigationAdvice");
    if (sensors.soilMoisture < 30) {
        irrigationEl.textContent = "Soil moisture is low. Immediate irrigation is needed.";
    } else if (sensors.soilMoisture > 45) {
        irrigationEl.textContent = "Soil moisture is high. No irrigation is needed right now.";
    } else {
        irrigationEl.textContent = "Soil moisture is normal. No irrigation is needed right now.";
    }

    const tempEl = getElement("temperatureAdvice");
    if (sensors.temperature > 30) {
        tempEl.textContent = "Temperature is high. Running the ventilation fan is recommended.";
    } else if (sensors.temperature < 28) {
        tempEl.textContent = "Temperature is slightly low. Watch for cold stress.";
    } else {
        tempEl.textContent = "Temperature is within the comfortable range.";
    }
}

// =====================================================
// CHAT
// =====================================================

function appendMessage(sender, text) {
    const chatMessages = getElement("chatMessages");

    const messageDiv = document.createElement("div");
    messageDiv.className = sender === "user" ? "message user-message" : "message ai-message";

    messageDiv.innerHTML = `
        <div class="avatar">${sender === "user" ? "🧑‍🌾" : "🌱"}</div>
        <div>
            <strong>${sender === "user" ? "You" : "Anndata AI"}</strong>
            <p>${text}</p>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

async function sendMessage() {
    const input = getElement("chatInput");
    const message = input.value.trim();

    if (!message) return;

    appendMessage("user", message);
    input.value = "";

    const typingMsg = appendMessage("ai", "Thinking...");

    try {
        const res = await fetch(`${API_URL}/api/ai/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                language: "English"
            })
        });

        const data = await res.json();

        typingMsg.remove();

        if (data.success) {
            appendMessage("ai", data.reply);
        } else {
            appendMessage("ai", "Sorry, something went wrong. Please check that the backend server is running.");
        }
    } catch (err) {
        typingMsg.remove();
        appendMessage("ai", "Unable to connect to the backend. Please start the server with node server.js.");
        console.error("Chat error:", err);
    }
}

function handleChatKey(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// =====================================================
// VOICE INPUT
// =====================================================

function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice input is not supported in this browser. Please try Chrome.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    const micButton = getElement("micButton");
    micButton.textContent = "🔴";

    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        getElement("chatInput").value = transcript;
        micButton.textContent = "🎤";
        sendMessage();
    };

    recognition.onerror = () => {
        micButton.textContent = "🎤";
    };

    recognition.onend = () => {
        micButton.textContent = "🎤";
    };
}

// =====================================================
// CROP VISION (Image Upload + AI Analysis)
// =====================================================

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    selectedImageFile = file;

    const preview = getElement("imagePreview");
    const reader = new FileReader();

    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block";
    };

    reader.readAsDataURL(file);
}

async function analyzeCrop() {
    if (!selectedImageFile) {
        alert("Please select a crop image first.");
        return;
    }

    const statusEl = getElement("visionStatus");
    statusEl.textContent = "Analyzing...";

    const formData = new FormData();
    formData.append("image", selectedImageFile);

    try {
        const res = await fetch(`${API_URL}/api/analyze`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            getElement("cropName").textContent = data.crop || "Unknown";
            getElement("healthScore").textContent = `${data.confidence || 0}%`;

            const healthEl = getElement("cropHealth");
            healthEl.textContent = data.health || "Unknown";
            healthEl.className = data.health === "Healthy" ? "healthy" : "";

            getElement("disease").textContent = data.disease || "None detected";
            statusEl.textContent = "Done";
        } else {
            statusEl.textContent = "Failed";
            alert("Analysis failed: " + (data.message || "Unknown error"));
        }
    } catch (err) {
        statusEl.textContent = "Error";
        alert("Crop analysis is currently unavailable. Please check that the server and Ollama are running.");
        console.error("Crop analysis error:", err);
    }
}

// =====================================================
// INIT
// =====================================================

window.addEventListener("DOMContentLoaded", () => {
    fetchSensors();
    setInterval(fetchSensors, 5000);
    setInterval(runAutoControl, 8000);
});