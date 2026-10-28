"""
AgriMitra AI - Safe Automation & Actuator Control Engine
Guarantees fail-safe relay switching, enforces anti-cycling intervals,
limits maximum pump runtimes, and prevents runaway irrigation.
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple, Optional

from database.db import get_db_connection

logger = logging.getLogger("agrimitra.automation")


def evaluate_automation_rules(
    device_id: str,
    latest_telemetry: Dict[str, Any],
    settings: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates irrigation and ventilation rules safely.
    Returns:
        {
            "should_pump_run": bool,
            "pump_runtime_seconds": int,
            "pump_reason": str,
            "should_fan_run": bool,
            "fan_reason": str,
            "action_triggered": Optional[str]
        }
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    decision = {
        "should_pump_run": False,
        "pump_runtime_seconds": 0,
        "pump_reason": "Normal status - no irrigation needed",
        "should_fan_run": False,
        "fan_reason": "Normal temperature range",
        "action_triggered": None
    }

    # 1. Hard Emergency Stop Check
    if settings.get("emergency_stop_active", False):
        decision["pump_reason"] = "EMERGENCY STOP ACTIVE - All actuators locked OFF"
        decision["fan_reason"] = "EMERGENCY STOP ACTIVE - All actuators locked OFF"
        conn.close()
        return decision

    # 2. Sensor Validity Guard
    if not latest_telemetry.get("is_valid", True):
        decision["pump_reason"] = "SAFETY HALT: Sensor data invalid or faulty. Auto-irrigation prohibited."
        decision["fan_reason"] = "SAFETY HALT: Temperature reading untrusted."
        conn.close()
        return decision

    moisture = latest_telemetry.get("soil_moisture")
    temperature = latest_telemetry.get("temperature")

    # -------------------------------------------------------------------------
    # 3. IRRIGATION AUTOMATION SAFETY RULES
    # -------------------------------------------------------------------------
    auto_irrigation = bool(settings.get("auto_irrigation_enabled", 1))
    threshold_low = float(settings.get("moisture_threshold_low", 35.0))
    min_interval_mins = int(settings.get("min_irrigation_interval_minutes", 60))
    max_runtime_sec = int(settings.get("max_pump_runtime_seconds", 25))

    if auto_irrigation and moisture is not None:
        if moisture < threshold_low:
            # Check last irrigation timestamp to enforce anti-cycle interval
            cursor.execute("""
            SELECT created_at FROM farming_actions
            WHERE device_id = ? AND action_type IN ('irrigation_pump', 'manual_irrigation')
            ORDER BY created_at DESC LIMIT 1
            """, (device_id,))
            last_action = cursor.fetchone()

            can_irrigate = True
            if last_action and last_action["created_at"]:
                try:
                    clean_ts = last_action["created_at"].replace("Z", "").replace(" ", "T")
                    last_time = datetime.fromisoformat(clean_ts)
                    diff_mins = (datetime.utcnow() - last_time).total_seconds() / 60.0
                    if diff_mins < min_interval_mins:
                        can_irrigate = False
                        remaining = int(min_interval_mins - diff_mins)
                        decision["pump_reason"] = (
                            f"Moisture is low ({moisture:.1f}%), but minimum interval between pump runs "
                            f"enforced. Waiting {remaining} more minutes to allow water absorption."
                        )
                except Exception as e:
                    logger.warning(f"Error parsing last action timestamp: {e}")

            if can_irrigate:
                decision["should_pump_run"] = True
                decision["pump_runtime_seconds"] = max_runtime_sec
                decision["pump_reason"] = (
                    f"Substrate moisture {moisture:.1f}% below low threshold ({threshold_low:.1f}%). "
                    f"Automated drip cycle scheduled for {max_runtime_sec} seconds."
                )
                decision["action_triggered"] = "irrigation_pump"
        else:
            decision["pump_reason"] = f"Soil moisture {moisture:.1f}% is healthy (threshold is {threshold_low:.1f}%)."

    # -------------------------------------------------------------------------
    # 4. VENTILATION / FAN AUTOMATION (With Hysteresis)
    # -------------------------------------------------------------------------
    auto_fan = bool(settings.get("auto_fan_enabled", 1))
    fan_trigger = float(settings.get("fan_temp_trigger", 30.0))
    fan_hysteresis = float(settings.get("fan_temp_hysteresis", 2.0))
    current_fan_state = bool(latest_telemetry.get("fan_state", False))

    if auto_fan and temperature is not None:
        if current_fan_state:
            # Currently running: keep running until temp drops below (trigger - hysteresis)
            cutoff_temp = fan_trigger - fan_hysteresis
            if temperature > cutoff_temp:
                decision["should_fan_run"] = True
                decision["fan_reason"] = f"Cooling active ({temperature:.1f}°C). Remains ON until temp <= {cutoff_temp:.1f}°C."
            else:
                decision["should_fan_run"] = False
                decision["fan_reason"] = f"Temperature cooled to {temperature:.1f}°C (below {cutoff_temp:.1f}°C). Fan turning OFF."
        else:
            # Currently off: turn ON only if temperature >= trigger
            if temperature >= fan_trigger:
                decision["should_fan_run"] = True
                decision["fan_reason"] = f"Polyhouse temperature {temperature:.1f}°C reached warning trigger ({fan_trigger:.1f}°C). Fan turning ON."
            else:
                decision["should_fan_run"] = False
                decision["fan_reason"] = f"Temperature {temperature:.1f}°C is within acceptable range (fan trigger: {fan_trigger:.1f}°C)."

    conn.close()
    return decision
