# AgriMitra AI — ESP32 Smart Polyhouse Wiring & Hardware Guide

This document specifies the exact physical wiring, power distribution, and component pinouts for the AgriMitra AI IoT controller.

---

## 1. Component List

| Component | Specification | Operating Voltage | Purpose |
| :--- | :--- | :--- | :--- |
| **Microcontroller** | ESP32 NodeMCU / ESP-WROOM-32 (30/38 pin) | 5V USB / 3.3V Logic | Main edge controller & telemetry sync |
| **Soil Moisture Sensor** | Capacitive Soil Moisture Sensor v1.2 | 3.3V DC | Corrosion-free volumetric substrate moisture |
| **Ambient Sensor** | DHT11 or DHT22 (AM2302) | 3.3V – 5V DC | Polyhouse air temperature & relative humidity |
| **Relay Module** | 2-Channel 5V Relay with Optocoupler Isolation | 5V Coil / 3.3V Trigger | Safe switching of 12V pump and fan circuits |
| **Irrigation Pump** | 12V DC Submersible / Diaphragm Pump | 12V DC (1–2A) | Drip irrigation distribution |
| **Circulation Fan** | 12V DC Brushless Exhaust / Circulation Fan | 12V DC (0.3–0.8A) | Temperature regulation & humidity purge |
| **Power Supply** | 12V 3A DC Adapter + LM2596 Step-Down (5V 2A) | 220V AC input | Common clean power supply for pump & ESP32 |

---

## 2. Pinout & Connection Table

### A. ESP32 to Sensors
| Sensor | Sensor Pin | ESP32 Pin | Notes |
| :--- | :--- | :--- | :--- |
| **Capacitive Soil Probe** | VCC | `3.3V` | **Never** power with 5V; ESP32 ADC max is 3.3V |
| | GND | `GND` | Common ground rail |
| | AOUT (Analog) | `GPIO 34` (ADC1_CH6) | ADC1 does not conflict with WiFi |
| **DHT11 / DHT22** | VCC (+) | `3.3V` or `5V` | 3.3V recommended |
| | DATA (Out) | `GPIO 4` | Pull-up 10kΩ resistor to 3.3V if bare sensor |
| | GND (-) | `GND` | Common ground rail |

### B. ESP32 to 2-Channel Relay Module
| Relay Board Pin | ESP32 Pin | Wire Type | Logic Level |
| :--- | :--- | :--- | :--- |
| **VCC** | `5V` (VIN on ESP32) | Power Wire | 5V required for relay coils |
| **GND** | `GND` | Ground Wire | Common ground |
| **IN1 (Pump Relay)** | `GPIO 26` | Signal | Active LOW (`LOW` = Relay ON, `HIGH` = OFF) |
| **IN2 (Fan Relay)** | `GPIO 27` | Signal | Active LOW (`LOW` = Relay ON, `HIGH` = OFF) |

### C. Actuators to Relays (12V High-Current Isolation)
> **CRITICAL ELECTRICAL SAFETY:** Keep mains 220V voltage **away** from exposed breadboards. Use 12V DC low voltage for the pump and fan.

1. **Water Pump Circuit (Relay 1):**
   - 12V (+) Power Supply → Relay 1 `COM` (Common terminal)
   - Relay 1 `NO` (Normally Open) → Pump Red (+) wire
   - Pump Black (-) wire → 12V (-) Power Supply Ground
   - *Flyback Diode:* Connect a `1N4007` diode across pump (+) and (-) in reverse polarity (Cathode/band to +) to suppress inductive EMF spikes!

2. **Cooling Fan Circuit (Relay 2):**
   - 12V (+) Power Supply → Relay 2 `COM`
   - Relay 2 `NO` → Fan Red (+) wire
   - Fan Black (-) wire → 12V (-) Power Supply Ground

---

## 3. Power Distribution Schematic

```
[12V 3A DC Adapter] ──────────────────────────┬──────► [Relay 1 COM: 12V Pump]
       │                                      │
       │                                      └──────► [Relay 2 COM: 12V Fan]
       ▼
[LM2596 Buck Converter (Step down to 5.0V)]
       │
       ├──────► ESP32 VIN (Pin 5V)
       ├──────► Relay Module VCC (Pin 5V)
       └──────► Common GND (All grounds tied together)
```

---

## 4. Calibration Instructions (Capacitive Probe)

1. Connect probe to `GPIO 34` and run `agrimitra_esp32_firmware.ino`.
2. Open Serial Monitor at `115200` baud.
3. Hold probe completely dry in air: Note reading (typically ~3150 ADC counts).
4. Submerge probe up to the white line in a glass of water: Note reading (typically ~1450 ADC counts).
5. Update `SOIL_DRY_ADC` and `SOIL_WET_ADC` constants in firmware if values vary.

---

## 5. Fail-Safe Local Safety Guarantees

1. **Hardware Disconnect Protection:** If the capacitive sensor is unplugged (reading floating or 0), the firmware and backend detect `ERR_MOISTURE_OUT_OF_RANGE` and immediately forbid automatic irrigation.
2. **Local Max Runtime Cutoff:** The ESP32 enforces an absolute 30-second pump cutoff timer in microcontroller RAM. Even if the WiFi drops, the router dies, or the backend crashes mid-irrigation, the pump will automatically shut off after 30 seconds.
3. **Anti-Cycling Interval:** Minimum 30–60 minutes between pump runs prevents waterlogging and substrate flooding.
