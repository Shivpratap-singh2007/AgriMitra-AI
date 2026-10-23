"""
AgriMitra AI 2.0 - Sensor Trust and Fault Detection Engine
Validates incoming IoT sensor readings, detects anomalies, stale telemetry,
implausible values, and stuck sensors to guarantee safe automation.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional
import logging

logger = logging.getLogger("agrimitra.sensor_health")

# Plausibility limits for polyhouse sensors
LIMITS = {
    "temperature": {"min": -5.0, "max": 65.0, "unit": "°C"},
    "humidity": {"min": 5.0, "max": 100.0, "unit": "%"},
    "soil_moisture": {"min": 0.0, "max": 100.0, "unit": "%"},
    "voltage": {"min": 3.0, "max": 12.5, "unit": "V"}
}

STALE_THRESHOLD_SECONDS = 300     # 5 minutes -> Stale warning
OFFLINE_THRESHOLD_SECONDS = 900   # 15 minutes -> Device offline


def validate_telemetry_payload(payload: Dict[str, Any]) -> Tuple[bool, List[str], List[Dict[str, Any]]]:
    """
    Validates sensor values against physical plausibility ranges.
    Returns:
        (is_valid: bool, fault_flags: List[str], generated_alerts: List[Dict])
    """
    fault_flags = []
    generated_alerts = []
    is_valid = True

    temp = payload.get("temperature")
    humidity = payload.get("humidity")
    moisture = payload.get("soil_moisture")

    # 1. Temperature Validation
    if temp is None:
        fault_flags.append("MISSING_TEMPERATURE")
        is_valid = False
    elif not isinstance(temp, (int, float)) or temp < LIMITS["temperature"]["min"] or temp > LIMITS["temperature"]["max"]:
        fault_flags.append("ERR_TEMP_OUT_OF_RANGE")
        is_valid = False
        generated_alerts.append({
            "severity": "critical",
            "sensor_name": "DHT11/22 Temperature",
            "message": f"Temperature reading {temp}°C is physically implausible (expected -5°C to 65°C).",
            "message_hi": f"तापमान {temp}°C अमान्य है (संभावित सीमा: -5°C से 65°C)।",
            "suggested_action": "Check DHT sensor wiring, pin 4 connection, and power supply.",
            "suggested_action_hi": "DHT सेंसर की वायरिंग और पिन 4 कनेक्शन की जांच करें।"
        })

    # 2. Humidity Validation
    if humidity is None:
        fault_flags.append("MISSING_HUMIDITY")
        is_valid = False
    elif not isinstance(humidity, (int, float)) or humidity < LIMITS["humidity"]["min"] or humidity > LIMITS["humidity"]["max"]:
        fault_flags.append("ERR_HUMIDITY_OUT_OF_RANGE")
        is_valid = False
        generated_alerts.append({
            "severity": "warning",
            "sensor_name": "DHT11/22 Humidity",
            "message": f"Humidity reading {humidity}% is outside realistic boundary (5% to 100%).",
            "message_hi": f"हवा में नमी {humidity}% अस्वाभाविक है (सीमा: 5% से 100%)।",
            "suggested_action": "Inspect DHT sensor mesh for water condensation or dust.",
            "suggested_action_hi": "सेंसर पर धूल या पानी की बूंदों की जांच करें।"
        })

    # 3. Soil Moisture Validation
    if moisture is None:
        fault_flags.append("MISSING_SOIL_MOISTURE")
        is_valid = False
    elif not isinstance(moisture, (int, float)) or moisture < LIMITS["soil_moisture"]["min"] or moisture > LIMITS["soil_moisture"]["max"]:
        fault_flags.append("ERR_MOISTURE_OUT_OF_RANGE")
        is_valid = False
        generated_alerts.append({
            "severity": "critical",
            "sensor_name": "Capacitive Soil Moisture Probe",
            "message": f"Soil moisture reading {moisture}% is outside 0-100% calibration range.",
            "message_hi": f"मिट्टी की नमी {moisture}% अमान्य सीमा में है (0-100%)।",
            "suggested_action": "Check analog probe connection on GPIO 34/35. Sensor may be disconnected from substrate.",
            "suggested_action_hi": "क्यारी में नमी सेंसर की स्थिति और पिन 34/35 कनेक्शन जांचें।"
        })

    return is_valid, fault_flags, generated_alerts


def check_stuck_readings(recent_readings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detects if sensor readings have remained frozen at the exact same value
    for multiple consecutive cycles (possible sensor corrosion or ADC freeze).
    """
    alerts = []
    if len(recent_readings) < 8:
        return alerts

    # Check soil moisture frozen
    moistures = [r.get("soil_moisture") for r in recent_readings[:8] if r.get("soil_moisture") is not None]
    if len(moistures) >= 8 and len(set(round(m, 1) for m in moistures)) == 1:
        alerts.append({
            "severity": "warning",
            "sensor_name": "Soil Moisture Probe",
            "message": f"Soil moisture has read exactly {moistures[0]}% for 8+ consecutive cycles. Possible probe detachment or freeze.",
            "message_hi": f"नमी सेंसर लगातार 8 चक्रों से {moistures[0]}% पर स्थिर है। प्रोब की जांच करें।",
            "suggested_action": "Gently shake or reposition the moisture probe in the root zone.",
            "suggested_action_hi": "सेंसर को पौधे की जड़ के पास थोड़ा हिलाकर या साफ करके पुनः लगाएं।"
        })

    return alerts


def evaluate_device_liveness(last_seen_iso: str) -> Tuple[str, Optional[str]]:
    """
    Evaluates connection health based on last report timestamp.
    Returns: ('online' | 'stale' | 'offline', human_description)
    """
    if not last_seen_iso:
        return "offline", "Never connected"

    try:
        # Support both SQLite space format and ISO format
        clean_ts = last_seen_iso.replace("Z", "+00:00")
        if " " in clean_ts and "T" not in clean_ts:
            clean_ts = clean_ts.replace(" ", "T")
        
        # SQLite CURRENT_TIMESTAMP is UTC
        last_dt = datetime.fromisoformat(clean_ts)
        now_dt = datetime.utcnow()
        diff_sec = (now_dt - last_dt).total_seconds()

        if diff_sec < STALE_THRESHOLD_SECONDS:
            return "online", "Live (Reporting actively)"
        elif diff_sec < OFFLINE_THRESHOLD_SECONDS:
            mins = int(diff_sec // 60)
            return "stale", f"Stale ({mins} mins since last report)"
        else:
            mins = int(diff_sec // 60)
            return "offline", f"Disconnected ({mins} mins offline)"
    except Exception as e:
        logger.warning(f"Error parsing timestamp {last_seen_iso}: {e}")
        return "stale", "Timestamp unverified"
