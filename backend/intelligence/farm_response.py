"""
AgriMitra AI - Farm Response Intelligence Engine
USP: Sense -> Analyze -> Advise -> Act -> Verify -> Learn
Tracks farming actions, monitors subsequent sensor responses, verifies outcomes,
and flags ineffective actions (e.g. dry run, clogged drippers, pipe disconnection).
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

from database.db import get_db_connection

logger = logging.getLogger("agrimitra.farm_response")

# Typical mini polyhouse 12V DC diaphragm pump flow estimate: ~0.42 liters per second
DEFAULT_PUMP_FLOW_LPS = 0.42


def log_farming_action(
    device_id: str,
    crop_name: str,
    action_type: str,
    triggered_by: str,
    parameters: Dict[str, Any],
    pre_readings: Dict[str, Any],
    recommendation_id: Optional[str] = None
) -> str:
    """
    Logs an initiated action and schedules it for subsequent sensor response verification.
    """
    action_id = f"act-{int(datetime.utcnow().timestamp())}-{action_type[:4]}"
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO farming_actions (
        id, device_id, crop_name, crop_stage, action_type, triggered_by,
        recommendation_id, parameters, pre_sensor_readings, status,
        verification_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'pending', CURRENT_TIMESTAMP)
    """, (
        action_id,
        device_id,
        crop_name,
        parameters.get("crop_stage", "Vegetative"),
        action_type,
        triggered_by,
        recommendation_id,
        json.dumps(parameters),
        json.dumps(pre_readings)
    ))

    conn.commit()
    conn.close()
    logger.info(f"Farming action logged: {action_id} ({action_type}) by {triggered_by}")
    return action_id


def run_action_verification(device_id: str) -> List[Dict[str, Any]]:
    """
    Inspects pending actions that occurred 10 to 90 minutes ago,
    compares post-action sensor readings, and verifies outcome.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Find pending actions from the last 2 hours
    cursor.execute("""
    SELECT * FROM farming_actions
    WHERE device_id = ? AND verification_status = 'pending'
    ORDER BY created_at ASC
    """, (device_id,))
    pending_actions = [dict(row) for row in cursor.fetchall()]

    verified_results = []

    for action in pending_actions:
        action_id = action["id"]
        created_str = action["created_at"].replace("Z", "").replace(" ", "T")
        try:
            created_dt = datetime.fromisoformat(created_str)
        except Exception:
            continue

        elapsed_mins = (datetime.utcnow() - created_dt).total_seconds() / 60.0

        # Wait at least 10 minutes to allow soil percolation & sensor response
        if elapsed_mins < 10.0:
            continue

        # Get latest valid sensor reading
        cursor.execute("""
        SELECT * FROM sensor_telemetry
        WHERE device_id = ? AND is_valid = 1
        ORDER BY created_at DESC LIMIT 1
        """, (device_id,))
        latest_row = cursor.fetchone()

        if not latest_row:
            if elapsed_mins > 90.0:
                cursor.execute("""
                UPDATE farming_actions
                SET verification_status = 'unverified_timeout',
                    verification_summary = 'No sensor telemetry received within 90 minutes to verify outcome.',
                    verified_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """, (action_id,))
            continue

        latest_telemetry = dict(latest_row)
        post_readings = {
            "soil_moisture": latest_telemetry.get("soil_moisture"),
            "temperature": latest_telemetry.get("temperature"),
            "humidity": latest_telemetry.get("humidity")
        }

        # Parse pre-readings
        pre_readings = {}
        try:
            pre_readings = json.loads(action["pre_sensor_readings"] or "{}")
        except Exception:
            pass

        pre_moisture = pre_readings.get("soil_moisture")
        post_moisture = post_readings.get("soil_moisture")

        if action["action_type"] in ("irrigation_pump", "manual_irrigation"):
            if pre_moisture is not None and post_moisture is not None:
                delta_m = post_moisture - pre_moisture

                if delta_m >= 6.0 or post_moisture >= 60.0:
                    status = "confirmed_effective"
                    summary = (
                        f"Substrate moisture increased by +{delta_m:.1f}% (from {pre_moisture:.1f}% to {post_moisture:.1f}%) "
                        f"within {int(elapsed_mins)} mins. Drip irrigation verified effective."
                    )
                else:
                    status = "ineffective_warning"
                    summary = (
                        f"Substrate moisture did not rise adequately (+{delta_m:.1f}%, currently {post_moisture:.1f}%). "
                        f"Check for pipe disconnection, pump dry-run, or clogged drippers."
                    )
                    # Add an actionable alert
                    cursor.execute("""
                    INSERT INTO sensor_alerts (id, device_id, severity, sensor_name, message, message_hi, suggested_action, suggested_action_hi)
                    VALUES (?, ?, 'warning', 'Irrigation Delivery', ?, ?, ?, ?)
                    """, (
                        f"alt-irrig-{action_id[-6:]}",
                        device_id,
                        f"Irrigation ran for action {action_id}, but soil moisture did not rise (+{delta_m:.1f}%).",
                        f"सिंचाई पंप चला, लेकिन क्यारी में नमी अपेक्षित रूप से नहीं बढ़ी (+{delta_m:.1f}%)।",
                        "Check water tank level, pump suction pipe, and drip nozzle outlets.",
                        "पानी की टंकी का स्तर, पंप का पाइप और ड्रिप नोजल की जांच करें।"
                    ))
            else:
                status = "unverified_timeout"
                summary = "Missing moisture values to compute verification."

            cursor.execute("""
            UPDATE farming_actions
            SET verification_status = ?,
                verification_summary = ?,
                post_sensor_readings = ?,
                verified_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """, (status, summary, json.dumps(post_readings), action_id))

            verified_results.append({
                "action_id": action_id,
                "status": status,
                "summary": summary
            })

    conn.commit()
    conn.close()
    return verified_results


def get_farm_response_metrics(device_id: str) -> Dict[str, Any]:
    """
    Computes measurable Farm Response Intelligence statistics:
    - Total actions
    - Action completion rate
    - Verified percentage
    - Confirmed effective percentage
    - Total pump runtime & estimated water volume
    - Sensor faults count
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM farming_actions WHERE device_id = ?", (device_id,))
    total_actions = cursor.fetchone()[0]

    cursor.execute("""
    SELECT COUNT(*) FROM farming_actions
    WHERE device_id = ? AND verification_status IN ('confirmed_effective', 'ineffective_warning')
    """, (device_id,))
    verified_actions = cursor.fetchone()[0]

    cursor.execute("""
    SELECT COUNT(*) FROM farming_actions
    WHERE device_id = ? AND verification_status = 'confirmed_effective'
    """, (device_id,))
    effective_actions = cursor.fetchone()[0]

    cursor.execute("""
    SELECT parameters FROM farming_actions
    WHERE device_id = ? AND action_type IN ('irrigation_pump', 'manual_irrigation')
    """, (device_id,))
    pump_rows = cursor.fetchall()

    total_runtime_seconds = 0
    for r in pump_rows:
        try:
            params = json.loads(r["parameters"] or "{}")
            total_runtime_seconds += int(params.get("runtime_seconds", 20))
        except Exception:
            total_runtime_seconds += 20

    estimated_liters = round(total_runtime_seconds * DEFAULT_PUMP_FLOW_LPS, 1)

    cursor.execute("SELECT COUNT(*) FROM sensor_alerts WHERE device_id = ? AND is_resolved = 0", (device_id,))
    active_alerts = cursor.fetchone()[0]

    conn.close()

    verified_rate = round((verified_actions / total_actions * 100), 1) if total_actions > 0 else 100.0
    effective_rate = round((effective_actions / verified_actions * 100), 1) if verified_actions > 0 else 100.0

    return {
        "total_actions": total_actions,
        "verified_actions": verified_actions,
        "verification_rate_percent": verified_rate,
        "effective_actions": effective_actions,
        "effective_rate_percent": effective_rate,
        "total_pump_runtime_seconds": total_runtime_seconds,
        "total_pump_runtime_minutes": round(total_runtime_seconds / 60.0, 1),
        "estimated_water_liters": estimated_liters,
        "active_alerts_count": active_alerts
    }
