# 🌱 AgriMitra AI - ESP32 Hardware Setup Guide

Ye guide aapko real **ESP32 Microcontroller** ko AgriMitra AI platform se connect karne ka step-by-step tareeqa batati hai.

---

## 🔌 1. Hardware Requirements & Circuit Wiring

### Components:
1. **ESP32 NodeMCU Development Board** (30 or 38 pin)
2. **DHT11 or DHT22** (Temperature & Humidity Sensor)
3. **Capacitive / Resistive Soil Moisture Sensor**
4. **2-Channel 5V Relay Module** (Submersible Pump & Fan ke liye)
5. **Mini 5V Submersible Water Pump** + **5V/12V DC Fan**
6. Breadboard & Jumper wires

---

### Wiring Connections (ESP32 Pinout):

#### A. DHT11 / DHT22 Sensor
| DHT Pin | ESP32 Pin | Note |
|---|---|---|
| **VCC** | `3.3V` ya `VIN (5V)` | Power supply |
| **DATA** | `GPIO 4` | Digital data pin |
| **GND** | `GND` | Ground |

#### B. Soil Moisture Sensor
| Sensor Pin | ESP32 Pin | Note |
|---|---|---|
| **VCC** | `3.3V` | Power supply |
| **GND** | `GND` | Ground |
| **AOUT (Analog)** | `GPIO 34` | ADC1 analog read pin |

#### C. 2-Channel Relay Module (Fan & Pump)
| Relay Pin | ESP32 Pin / Power | Note |
|---|---|---|
| **VCC** | `3.3V` | ESP32 3.3V (Optocoupler logic) |
| **JD-VCC** | `External 5V` | External 5V Power Supply for Coils (Jumper removed) |
| **GND** | `GND` | Common Ground with ESP32 & External Supply |
| **IN1 (Fan)** | `GPIO 26` | Relay 1: Polyhouse Fan control |
| **IN2 (Pump)** | `GPIO 27` | Relay 2: Submersible Pump control |

---

## 💻 2. Arduino IDE Setup

1. **Arduino IDE Open karein**:
   Agar nahi hai to [arduino.cc](https://www.arduino.cc/en/software) se download karein.

2. **ESP32 Board Package Install karein**:
   - `File` -> `Preferences` -> `Additional Board Manager URLs` mein add karein:
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - `Tools` -> `Board` -> `Boards Manager` mein search karein **ESP32 by Espressif Systems** aur install karein.

3. **Libraries Install karein**:
   `Tools` -> `Manage Libraries` mein search karke install karein:
   - **DHT sensor library** (by Adafruit)
   - **Adafruit Unified Sensor** (by Adafruit)
   - **ArduinoJson** (by Benoit Blanchon - Version 6 or 7)

---

## ⚙️ 3. Configure ESP32 Code

Arduino IDE mein file open karein:
👉 [`hardware/esp32_agrimitra/esp32_agrimitra.ino`](file:///c:/Users/Shiv%20Pratap%20Singh/OneDrive/Desktop/AgriMitra-AI/hardware/esp32_agrimitra/esp32_agrimitra.ino)

Code ke top par lines check karein:

```cpp
// 1. Apna Wi-Fi Name aur Password daalein
const char* WIFI_SSID     = "Apna_WiFi_Name";
const char* WIFI_PASSWORD = "Apna_WiFi_Password";

// 2. Apne Laptop/PC ka Local IP address daalein
// (CMD mein 'ipconfig' likh kar IPv4 Address check karein)
const char* SERVER_URL    = "http://10.30.25.131:5001/api/iot/telemetry";
```

> **IMPORTANT**: Aapka ESP32 aur Laptop **dono same Wi-Fi network ya phone hotspot se connected hone chahiye!**

---

## 🚀 4. Upload & Verify

1. ESP32 ko USB cable se computer mein connect karein.
2. `Tools` -> `Board` -> Select karein **ESP32 Dev Module**.
3. `Tools` -> `Port` -> Select karein apna COM port (e.g. `COM3` ya `COM5`).
4. **Upload** button (Arrow icon) click karein.
5. Upload complete hone par `Tools` -> **Serial Monitor** (Baud rate: `115200`) open karein:
   Aapko dikhega:
   ```
   [WiFi] Connected successfully!
   [WiFi] ESP32 IP Address: 192.168.1.45
   --- [Reading Sensors] ---
   Temp: 27.5 °C | Humidity: 62.0 % | Soil Moisture: 44.0 %
   [HTTP] POST Response Code: 200
   >> [Controls Applied] Water Pump: OFF ⚪ | Ventilation Fan: ON 🟢
   ```

---

## 🔄 5. Live Two-Way Communication Kaise Kaam Karta Hai?

1. **Sensors se Dashboard Tak**:
   - ESP32 har 5 seconds mein real temperature, humidity aur soil moisture AgriMitra AI backend ko bhejta hai.
   - Website dashboard par values real-time update hoti hain aur SQLite database mein store hoti hain.

2. **Dashboard se Physical Hardware Tak**:
   - Jab aap website par **"PUMP: ON"** ya **"FAN: ON"** click karte hain,
   - Agle cycle mein ESP32 ko command milti hai aur ESP32 ka relay physical pump ya fan ko turant ON kar deta hai!
