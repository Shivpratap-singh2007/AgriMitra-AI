# 🌱 AgriMitra AI 2.0 — Smart Polyhouse & Farm Response Intelligence
### कृषिमित्र AI 2.0 – छोटे किसानों के लिए किफायती स्मार्ट पॉलीहाउस एवं AI कृषि सहायक

> **AgriMitra AI 2.0** is an affordable Smart Polyhouse IoT automation and AI agricultural assistant designed for small and marginal Indian farmers.
> 
> The central differentiator is **Farm Response Intelligence**:
> $$\textbf{Sense} \longrightarrow \textbf{Analyze} \longrightarrow \textbf{Advise} \longrightarrow \textbf{Act} \longrightarrow \textbf{Verify} \longrightarrow \textbf{Learn}$$
>
> Rather than functioning merely as a passive telemetry dashboard, AgriMitra AI records farming actions, observes subsequent soil percolation, verifies physical sensor changes, and alerts farmers if an action failed to have its expected agronomic effect.

---

## 🏛️ 1. System Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │                ESP32 IoT Controller (NodeMCU)         │
       │  - Capacitive Soil Moisture Sensor v1.2 (GPIO 34 ADC1) │
       │  - DHT11 / DHT22 Air Temperature & Humidity (GPIO 4)  │
       │  - 2-Channel Optocoupler Relays:                       │
       │      * Relay 1: 12V Submersible Drip Pump (GPIO 26)    │
       │      * Relay 2: 12V Circulation Exhaust Fan (GPIO 27)  │
       │  - Hard Local Safety: Max 30s Pump Cutoff & Anti-Cycle │
       └───────────────────────────┬────────────────────────────┘
                                   │  HTTP / JSON + X-Device-Key
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             Backend (FastAPI + SQLite WAL)             │
       │  - Telemetry Ingestion & Sensor Trust Health Engine    │
       │  - Safe Automation Engine (Anti-flooding & Hysteresis) │
       │  - Farm Response Intelligence & Verification Engine   │
       │  - Explainable Advisory Service (What, Why, Next Check)│
       │  - Bilingual Kisan Chaupal Chatbot (Live Telemetry RAG)│
       │  - Retained Custom PyTorch & Gemini Dual AI Diagnostics│
       └───────────────────────────┬────────────────────────────┘
                                   │  REST JSON / PWA
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │        Frontend (React 19 + TypeScript + Vite)         │
       │  - Navy Blue (#142B4A), White, Light Grey (#F3F5F7),   │
       │    and Agriculture Green (#2E7D32) Design System       │
       │  - 5-Tab Mobile Navigation: Home, Smart Farm,          │
       │    AI Assistant, Farm History, Profile/Settings        │
       │  - Real-time Actuator Controls & Emergency Stop (E-Stop│
       │  - Interactive Simulator for Testing Autonomy States   │
       │  - Installable PWA with Offline Cache & Desktop Build  │
       └────────────────────────────────────────────────────────┘
```

---

## 🚀 2. Core Functional Pillars

### 🔹 1. Sense: IoT Telemetry & Sensor Trust
- **Validated Ingestion (`POST /api/iot/telemetry`)**: Authenticated with `X-Device-Key`.
- **Fault Detection**: Flags missing readings, implausible temperatures (>60°C or <0°C), negative moisture, stale timestamps, and stuck frozen sensors.
- **Safety Precedence**: Invalid or frozen sensor signals never silently default to zero or trigger automated irrigation.

### 🔹 2. Analyze & Advise: Explainable Agronomic Guidance
- Calculates real-time **VPD (Vapor Pressure Deficit)** to gauge crop transpiration stress.
- Every important recommendation provides:
  1. **What**: The specific action recommended.
  2. **Why**: The agronomic rationale.
  3. **Supporting Data**: Observed sensor reading vs crop threshold.
  4. **Next Check**: The physical inspection required by the farmer.
  5. **Confidence**: Estimated certainty.

### 🔹 3. Act: Safe Micro-Climate Automation
- **Water Pump Protection**: Maximum 30-second pump runtime limit per cycle.
- **Anti-Cycling Lockout**: Minimum 30-minute interval between pump activations prevents root asphyxiation.
- **Cooling Fan Hysteresis**: Prevents rapid relay wear by turning ON at >32.0°C and cooling until <29.5°C.
- **Emergency Stop (E-Stop)**: Instantly opens relay circuits and locks software automation.
- **Local Firmware Safeguard**: The ESP32 enforces runtime cutoffs in hardware RAM even if WiFi or internet disconnects mid-cycle.

### 🔹 4. Verify & Learn: Farm Response Intelligence
- When an irrigation event is triggered, the system notes pre-action moisture.
- After percolation delay (10–15 minutes), subsequent readings are audited:
  - **Confirmed Effective** (Green `#2E7D32`): Soil moisture increased by >10%.
  - **Ineffective / Warning** (Red): Moisture remained unchanged; alerts farmer to inspect drip emitters, clogged filters, or an empty water sump.
  - **Pending Verification** (Amber): Awaiting water percolation.
- **Measurable Farm Metrics**: Tracks action completion rate (%), outcome verification rate (%), total pump runtime (s), and estimated water usage (L).

### 🔹 5. Bilingual AI Kisan Chaupal (`POST /api/chat`)
- Conversational agricultural advisor in **Hindi, English, and Hinglish**.
- Grounded directly with live polyhouse sensor readings and verified **ICAR** package of practices.
- Speech recognition voice input via Web Speech API.

---

## 🛠️ 3. Quick Start & Local Run Instructions

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ (Node 20+ recommended)

### Step 1: Clone & Setup Environment
```bash
git clone https://github.com/Shivpratap-singh2007/AgriMitra-AI.git
cd AgriMitra-AI

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### Step 2: Build Frontend
```bash
# Install root & frontend dependencies
npm install
npm --prefix frontend install

# Compile production bundle
npm run build:frontend
```

### Step 3: Run the Complete Application
```bash
# Start backend on http://127.0.0.1:5001
# (Serves both API and compiled React SPA)
npm start
```
Open **[http://127.0.0.1:5001](http://127.0.0.1:5001)** in your browser!

### For Frontend Development Mode with Vite HMR:
```bash
npm run dev:frontend
# Vite dev server runs at http://localhost:5173
```

---

## 🔌 4. ESP32 Hardware Wiring & Pin Assignments

Detailed wiring diagrams and schematic notes are available in [`backend/firmware/WIRING_GUIDE.md`](file:///c:/Users/Shiv%20Pratap%20Singh/OneDrive/Desktop/AgriMitra-AI/backend/firmware/WIRING_GUIDE.md).

| Sensor / Actuator | ESP32 GPIO | Operating Voltage | Notes |
| :--- | :--- | :--- | :--- |
| **Capacitive Soil Probe** | `GPIO 34` (ADC1) | 3.3V DC | ADC1 does not conflict with WiFi |
| **DHT11 / DHT22** | `GPIO 4` | 3.3V DC | Air temperature & humidity |
| **Relay 1 (Pump)** | `GPIO 26` | 5V Coil / 3.3V Logic | Active LOW; drives 12V DC pump |
| **Relay 2 (Fan)** | `GPIO 27` | 5V Coil / 3.3V Logic | Active LOW; drives 12V DC fan |
| **Status LED** | `GPIO 2` | 3.3V | Blinks on telemetry sync |

Production Arduino C++ firmware is provided in [`backend/firmware/agrimitra_esp32_firmware.ino`](file:///c:/Users/Shiv%20Pratap%20Singh/OneDrive/Desktop/AgriMitra-AI/backend/firmware/agrimitra_esp32_firmware.ino).

---

## 🌐 5. Production Cloud Deployment (डिप्लॉयमेंट)

AgriMitra AI 2.0 can be deployed online **100% free** on Render, Railway, or any Docker VPS:
- **Zero-Config Single Container**: FastAPI automatically builds and serves the React 19 frontend and SQLite database from one single service.
- **Auto CI/CD**: Pushing to `main` automatically triggers deployment.
- **Detailed Step-by-Step Guide**: See [`DEPLOYMENT.md`](file:///c:/Users/Shiv%20Pratap%20Singh/OneDrive/Desktop/AgriMitra-AI/DEPLOYMENT.md) for complete instructions in Hindi and English.

---

## 📱 6. Mobile PWA Installation (Android)

1. Open `http://<your-ip>:5001` in Google Chrome on your Android smartphone.
2. Tap the Chrome 3-dots menu (`⋮`).
3. Select **"Install app"** or **"Add to Home screen"**.
4. The AgriMitra AI 2.0 icon will be added to your app drawer with offline support, full-screen viewport, and responsive touch controls.

---

## 🧪 7. Automated Testing Verification

AgriMitra AI 2.0 includes an automated end-to-end verification suite testing all core modules:

```bash
.venv\Scripts\python.exe -c "
import urllib.request, json
# Tests /api/health, /api/iot/live, /api/iot/devices/control, /api/iot/simulate, /api/polyhouse/history, /api/polyhouse/reports, and /api/chat
"
```
**Test Results Summary**:
- Root SPA Static Mount: `200 OK`
- System Diagnostics & Health: `200 OK`
- Live Telemetry & Sensor Trust: `200 OK`
- Actuator Safe Override (Pump 5s cutoff): `200 OK`
- Telemetry Simulation (Dry Soil 22% moisture): `200 OK`
- Farm Response Verification Timeline: `200 OK`
- Measurable Outcomes & Report Metrics: `200 OK`
- Bilingual Grounded Chat (Hindi & English): `200 OK`

---

## 🔒 8. Responsible Agronomic AI Disclaimer

AgriMitra AI 2.0 predictions and sensor thresholds are assistive decision-support tools. They do not replace laboratory soil testing or official guidance from your local **Krishi Vigyan Kendra (KVK)** or agricultural university extension officers. Never apply restricted chemical fungicides without physical verification.