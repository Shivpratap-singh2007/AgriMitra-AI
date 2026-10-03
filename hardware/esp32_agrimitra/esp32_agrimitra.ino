/*
 * 🌱 AgriMitra AI - ESP32 Smart Polyhouse Controller
 *
 * Hardware Connections (FREEZED CONFIGURATION):
 * 1. DHT11 Sensor (Blue):
 *    - VCC  -> 3.3V
 *    - GND  -> GND
 *    - DATA -> GPIO 4 (D4)
 *
 * 2. Soil Moisture Sensor:
 *    - VCC  -> 3.3V
 *    - GND  -> GND
 *    - AOUT -> GPIO 34 (D34 - ADC1)
 *
 * 3. 2-Channel 5V Relay Module:
 *    - Relay 1 (Polyhouse Fan) -> GPIO 26
 *    - Relay 2 (Water Pump)     -> GPIO 27
 *    - VCC -> ESP32 3.3V (Optocoupler logic)
 *    - JD-VCC -> External 5V (Coils)
 *    - GND -> Common Ground
 *
 * Libraries Required in Arduino IDE:
 * - DHT sensor library by Adafruit
 * - Adafruit Unified Sensor
 * - ArduinoJson by Benoit Blanchon (Version 6 or 7)
 */

#include "DHT.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>

// ======================== CONFIGURATION ========================
// 1. Enter your Wi-Fi Credentials
const char *WIFI_SSID = "Redmi";
const char *WIFI_PASSWORD = "12345678";

// 2. Active AgriMitra AI Server IP on your local Wi-Fi network
const char *SERVER_URL = "http://10.30.25.131:5001/api/iot/telemetry";

// 3. Hardware Pin Definitions (Frozen & Aligned)
#define DHTPIN 4          // GPIO 4 (D4) for DHT11 Data
#define DHTTYPE DHT11     // DHT11 (Blue sensor)
#define SOIL_PIN 34       // GPIO 34 (D34 - Analog ADC1)
#define FAN_RELAY_PIN 26  // GPIO 26 for Relay 1 (Ventilation Fan)
#define PUMP_RELAY_PIN 27 // GPIO 27 for Relay 2 (Water Pump)
#define STATUS_LED 2      // GPIO 2 Built-in Blue LED

// Most Arduino Relay modules are ACTIVE-LOW (LOW = ON, HIGH = OFF)
#define RELAY_ON LOW
#define RELAY_OFF HIGH

// Telemetry interval in milliseconds (e.g. 5000 = 5 seconds)
const unsigned long TELEMETRY_INTERVAL = 5000;
unsigned long lastSendTime = 0;

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==============================================");
  Serial.println("🌱 AgriMitra AI - ESP32 Smart Polyhouse Node");
  Serial.println("==============================================");
  Serial.println("Pins: Fan=GPIO26 | Pump=GPIO27 | DHT=GPIO4 | Soil=GPIO34");

  // Configure Relay Pins
  pinMode(FAN_RELAY_PIN, OUTPUT);
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);

  // Ensure relays are OFF initially
  digitalWrite(FAN_RELAY_PIN, RELAY_OFF);
  digitalWrite(PUMP_RELAY_PIN, RELAY_OFF);
  digitalWrite(STATUS_LED, LOW);

  // Initialize DHT Sensor
  dht.begin();

  // Connect to Wi-Fi
  connectToWiFi();
}

void loop() {
  // Auto-reconnect Wi-Fi if connection drops
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(STATUS_LED, LOW);
    connectToWiFi();
  }

  // Send Telemetry every interval
  if (millis() - lastSendTime >= TELEMETRY_INTERVAL) {
    lastSendTime = millis();
    sendTelemetryAndSyncControls();
  }
}

void connectToWiFi() {
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 25) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.printf("[WiFi] Signal Strength (RSSI): %d dBm\n", WiFi.RSSI());
    Serial.printf("[Target Server] %s\n", SERVER_URL);
    digitalWrite(STATUS_LED, HIGH);
  } else {
    Serial.println("\n[WiFi] Connection timeout. Retrying in background...");
    digitalWrite(STATUS_LED, LOW);
  }
}

float readSoilMoisturePercentage() {
  // ESP32 ADC: 12-bit (0 to 4095)
  // Air / Dry soil gives highest value (~3200-4095)
  // Submerged in wet soil / water gives lowest value (~1200-1800)
  int rawValue = analogRead(SOIL_PIN);

  // Calibration thresholds for standard capacitive/resistive probe
  const int DRY_VALUE = 3500; // Raw reading in completely dry air
  const int WET_VALUE = 1400; // Raw reading in saturated wet soil

  int constrainedVal = constrain(rawValue, WET_VALUE, DRY_VALUE);
  float percentage = map(constrainedVal, DRY_VALUE, WET_VALUE, 0, 100);

  return percentage;
}

void sendTelemetryAndSyncControls() {
  if (WiFi.status() != WL_CONNECTED)
    return;

  // 1. Read Sensors
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  float soilMoisture = readSoilMoisturePercentage();

  // Validate DHT reading
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("[Sensor Warning] DHT11 read returned NaN! Using safe "
                   "fallback readings.");
    temperature = 28.0;
    humidity = 60.0;
  }

  Serial.println("\n--- [Reading Sensors] ---");
  Serial.printf("Temp: %.1f °C | Humidity: %.1f %% | Soil Moisture: %.1f %%\n",
                temperature, humidity, soilMoisture);

  // 2. Prepare JSON Payload
  StaticJsonDocument<256> reqDoc;
  reqDoc["device_id"] = "ESP32_AGRIMITRA";
  reqDoc["temperature"] = temperature;
  reqDoc["humidity"] = humidity;
  reqDoc["soil_moisture"] = soilMoisture;

  String jsonPayload;
  serializeJson(reqDoc, jsonPayload);

  // 3. Send HTTP POST to AgriMitra Backend
  HTTPClient http;
  http.setTimeout(4000); // 4 second timeout prevents blocking if Wi-Fi drops
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(jsonPayload);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("[HTTP] POST Response Code: %d\n", httpCode);

    // 4. Parse Response to get live Pump and Fan commands from Web Dashboard
    StaticJsonDocument<512> resDoc;
    DeserializationError error = deserializeJson(resDoc, response);

    if (!error && resDoc["success"] == true) {
      bool pumpState = resDoc["data"]["pump"].as<bool>();
      bool fanState = resDoc["data"]["fan"].as<bool>();

      // Apply controls to Relay Pins (Fan on 26, Pump on 27)
      digitalWrite(FAN_RELAY_PIN, fanState ? RELAY_ON : RELAY_OFF);
      digitalWrite(PUMP_RELAY_PIN, pumpState ? RELAY_ON : RELAY_OFF);

      Serial.printf(
          ">> [Relays Applied] Fan (GPIO 26): %s | Pump (GPIO 27): %s\n",
          fanState ? "ON 🟢" : "OFF ⚪", pumpState ? "ON 🟢" : "OFF ⚪");
    } else {
      Serial.println("[JSON] Could not parse server response.");
    }
  } else {
    Serial.printf("[HTTP] POST failed, error: %s\n",
                  http.errorToString(httpCode).c_str());
    Serial.printf("-> Tip: Check that backend is running on %s\n", SERVER_URL);
  }

  http.end();
}
