/*
 * AgriMitra AI 2.0 - ESP32 Smart Polyhouse Controller Firmware
 * 
 * Hardware:
 * - ESP32 NodeMCU / ESP-WROOM-32
 * - Capacitive Soil Moisture Sensor v1.2 (Analog ADC GPIO 34)
 * - DHT11 / DHT22 Temperature & Humidity Sensor (Digital GPIO 4)
 * - 2-Channel 5V Relay Module (Optocoupler isolated):
 *     - Relay 1 (Water Pump): GPIO 26 (Active LOW)
 *     - Relay 2 (Cooling Fan): GPIO 27 (Active LOW)
 * - Status LED: GPIO 2
 * 
 * Fail-Safe Local Safety Logic:
 * - MAX_PUMP_RUNTIME_MS (Hard cutoff at 30 seconds max per cycle)
 * - MIN_IRRIGATION_INTERVAL_MS (Minimum 30 minutes between cycles)
 * - If WiFi is disconnected, ESP32 maintains local threshold protection without freezing!
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ----------------------------------------------------------------------------
// 1. WiFi & Server Configuration
// ----------------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_POLYHOUSE_WIFI";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Replace with your backend domain or local IP (e.g., "http://192.168.1.100:5001/api/iot/telemetry")
const char* SERVER_URL    = "http://192.168.1.100:5001/api/iot/telemetry";
const char* DEVICE_ID     = "esp32-polyhouse-01";
const char* DEVICE_KEY    = "agrimitra-secret-key-2026";

// ----------------------------------------------------------------------------
// 2. Hardware Pin Assignments
// ----------------------------------------------------------------------------
#define DHT_PIN          4
#define DHT_TYPE         DHT11   // Or DHT22
#define SOIL_ANALOG_PIN  34
#define RELAY_PUMP_PIN   26      // Active LOW
#define RELAY_FAN_PIN    27      // Active LOW
#define STATUS_LED_PIN   2

// ----------------------------------------------------------------------------
// 3. Calibration & Local Safety Constraints
// ----------------------------------------------------------------------------
// Capacitive sensor ADC values: In air (~3200), In pure water (~1400)
const int SOIL_DRY_ADC  = 3150;
const int SOIL_WET_ADC  = 1450;

// Hard local fail-safe limits (Enforced locally on ESP32 even if backend drops!)
const unsigned long MAX_PUMP_RUNTIME_MS      = 30000;  // Max 30 seconds per run
const unsigned long MIN_IRRIG_INTERVAL_MS    = 1800000; // Min 30 minutes between runs
const unsigned long TELEMETRY_INTERVAL_MS    = 15000;  // Push readings every 15s

// Local emergency threshold if offline
const float LOCAL_OFFLINE_DRY_THRESHOLD      = 28.0;   // Irrigate below 28% if offline

DHT dht(DHT_PIN, DHT_TYPE);

// ----------------------------------------------------------------------------
// State Variables
// ----------------------------------------------------------------------------
bool pumpActive = false;
bool fanActive  = false;
unsigned long pumpStartTime = 0;
unsigned long lastIrrigationTime = 0;
unsigned long lastTelemetryTime = 0;

void setPump(bool state) {
  if (state) {
    // Check local safety interval
    if (millis() - lastIrrigationTime < MIN_IRRIG_INTERVAL_MS && lastIrrigationTime != 0) {
      Serial.println("[SAFETY] Local anti-cycle guard prevented pump start.");
      return;
    }
    digitalWrite(RELAY_PUMP_PIN, LOW); // Active LOW
    pumpActive = true;
    pumpStartTime = millis();
    lastIrrigationTime = millis();
    Serial.println("[ACTUATOR] Pump STARTED.");
  } else {
    digitalWrite(RELAY_PUMP_PIN, HIGH); // Off
    pumpActive = false;
    Serial.println("[ACTUATOR] Pump STOPPED.");
  }
}

void setFan(bool state) {
  digitalWrite(RELAY_FAN_PIN, state ? LOW : HIGH);
  fanActive = state;
  Serial.print("[ACTUATOR] Fan ");
  Serial.println(state ? "STARTED" : "STOPPED");
}

float readSoilMoisture() {
  int raw = analogRead(SOIL_ANALOG_PIN);
  // Constrain and map to 0 - 100%
  raw = constrain(raw, SOIL_WET_ADC, SOIL_DRY_ADC);
  float pct = map(raw, SOIL_DRY_ADC, SOIL_WET_ADC, 0, 100);
  return pct;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n[INIT] AgriMitra AI 2.0 ESP32 Controller Booting...");

  // Setup GPIOs
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  pinMode(RELAY_FAN_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);

  // Default Relays to OFF (Active LOW = HIGH is OFF)
  digitalWrite(RELAY_PUMP_PIN, HIGH);
  digitalWrite(RELAY_FAN_PIN, HIGH);
  digitalWrite(STATUS_LED_PIN, LOW);

  // Initialize DHT
  dht.begin();

  // Connect to WiFi
  Serial.print("[WIFI] Connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected! IP: " + WiFi.localIP().toString());
    digitalWrite(STATUS_LED_PIN, HIGH);
  } else {
    Serial.println("\n[WIFI] Offline mode active. Local safety timer engaged.");
    digitalWrite(STATUS_LED_PIN, LOW);
  }
}

void loop() {
  unsigned long now = millis();

  // 1. Fail-Safe Pump Cutoff Check
  if (pumpActive && (now - pumpStartTime >= MAX_PUMP_RUNTIME_MS)) {
    Serial.println("[SAFETY CUTOFF] Max pump runtime reached (30s). Stopping pump.");
    setPump(false);
  }

  // 2. Scheduled Telemetry Push
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = now;

    float t = dht.readTemperature();
    float h = dht.readHumidity();
    float m = readSoilMoisture();

    // Check for sensor hardware disconnects
    if (isnan(t) || isnan(h)) {
      Serial.println("[SENSOR WARN] DHT read failed.");
    }

    Serial.printf("[READINGS] Temp: %.1fC | Humidity: %.1f%% | Moisture: %.1f%%\n", t, h, m);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SERVER_URL);
      http.addHeader("Content-Type", "application/json");
      http.addHeader("X-Device-Key", DEVICE_KEY);

      StaticJsonDocument<256> doc;
      doc["device_id"]        = DEVICE_ID;
      doc["temperature"]      = isnan(t) ? -99.0 : t;
      doc["humidity"]         = isnan(h) ? -99.0 : h;
      doc["soil_moisture"]    = m;
      doc["pump_state"]       = pumpActive;
      doc["fan_state"]        = fanActive;
      doc["voltage"]          = 5.02;
      doc["firmware_version"] = "2.0.0";

      String requestBody;
      serializeJson(doc, requestBody);

      int httpResponseCode = http.POST(requestBody);

      if (httpResponseCode == 200) {
        String response = http.getString();
        StaticJsonDocument<256> respDoc;
        deserializeJson(respDoc, response);

        JsonObject cmds = respDoc["commands"];
        if (!cmds.isNull()) {
          bool shouldPump = cmds["pump"];
          bool shouldFan  = cmds["fan"];
          bool emStop     = cmds["emergency_stop"];

          if (emStop) {
            setPump(false);
            setFan(false);
          } else {
            if (shouldPump && !pumpActive) {
              setPump(true);
            } else if (!shouldPump && pumpActive) {
              setPump(false);
            }

            if (shouldFan != fanActive) {
              setFan(shouldFan);
            }
          }
        }
      } else {
        Serial.printf("[HTTP ERROR] Status: %d\n", httpResponseCode);
      }
      http.end();
    } else {
      // Offline fallback protection
      if (m < LOCAL_OFFLINE_DRY_THRESHOLD && !pumpActive) {
        Serial.println("[OFFLINE LOGIC] Moisture below threshold. Running local irrigation cycle.");
        setPump(true);
      }
    }
  }

  delay(50);
}
