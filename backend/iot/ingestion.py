"""
AgriMitra AI 2.0 - IoT Telemetry Ingestion & Device Control Router
Handles authenticated device communication, real-time telemetry processing,
fault alerts, safe relay actuation commands, and manual overrides.
"""

from fastapi import APIRouter, Header, HTTPException, Body, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
import json
import logging

from database.db import get_db_connection
from iot.sensor_health import validate_telemetry_payload, check_stuck_readings, evaluate_device_liveness
from iot.automation_engine import evaluate_automation_rules
from intelligence.farm_response import log_farming_action, run_action_verification, get_farm_response_metrics
from intelligence.advisory_service import generate_polyhouse_advisory

logger = logging.getLogger("agrimitra.iot")
router = APIRouter(prefix="/api/iot", tags=["IoT & Smart Polyhouse"])


class TelemetryInput(BaseModel):
    device_id: str
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    soil_moisture: Optional[float] = None
    pump_state: Optional[bool] = False
    fan_state: Optional[bool] = False
    voltage: Optional[float] = 5.0
    firmware_version: Optional[str] = "2.0.0"


class DeviceRegisterInput(BaseModel):
    device_id: str
    name: str
    device_key: str
    crop_id: str = "Tomato"
    is_demo: bool = False


class ActuatorControlInput(BaseModel):
    action: Optional[str] = None
    actuator: Optional[str] = None
    state: Optional[bool] = None
    duration_seconds: Optional[int] = None
    runtime_seconds: Optional[int] = 20
    reason: Optional[str] = "Manual farmer control"


@router.post("/telemetry")
async def ingest_telemetry(
    payload: TelemetryInput,
    x_device_key: Optional[str] = Header(None, alias="X-Device-Key")
):
    """
    Primary ingestion endpoint for ESP32 microcontrollers.
    Validates sensor data, updates health status, executes safe automation,
    and returns actuation commands back to the hardware.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Device Authentication
    cursor.execute("SELECT * FROM devices WHERE device_id = ?", (payload.device_id,))
    device = cursor.fetchone()
    if not device:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Device '{payload.device_id}' is not registered.")

    if not device["is_demo"]:
        if not x_device_key or x_device_key != device["device_key"]:
            conn.close()
            raise HTTPException(status_code=401, detail="Invalid X-Device-Key authentication header.")

    # 2. Sensor Validation & Health
    raw_dict = payload.model_dump()
    is_valid, fault_flags, alerts = validate_telemetry_payload(raw_dict)

    # 3. Store Telemetry
    cursor.execute("""
    INSERT INTO sensor_telemetry (
        device_id, temperature, humidity, soil_moisture,
        pump_state, fan_state, voltage, is_valid, fault_flags, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (
        payload.device_id,
        payload.temperature,
        payload.humidity,
        payload.soil_moisture,
        1 if payload.pump_state else 0,
        1 if payload.fan_state else 0,
        payload.voltage or 5.0,
        1 if is_valid else 0,
        json.dumps(fault_flags)
    ))

    # Update Device Last Seen
    cursor.execute("""
    UPDATE devices
    SET status = 'online', last_seen_at = CURRENT_TIMESTAMP, firmware_version = ?
    WHERE device_id = ?
    """, (payload.firmware_version or "2.0.0", payload.device_id))

    # Insert Any Detected Alerts
    for alt in alerts:
        cursor.execute("""
        INSERT INTO sensor_alerts (id, device_id, severity, sensor_name, message, message_hi, suggested_action, suggested_action_hi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"alt-{int(datetime.utcnow().timestamp())}-{alt['sensor_name'][:4]}",
            payload.device_id,
            alt["severity"],
            alt["sensor_name"],
            alt["message"],
            alt["message_hi"],
            alt["suggested_action"],
            alt["suggested_action_hi"]
        ))

    conn.commit()

    # 4. Fetch Settings & Evaluate Automation
    cursor.execute("SELECT * FROM polyhouse_settings WHERE device_id = ?", (payload.device_id,))
    settings_row = cursor.fetchone()
    settings = dict(settings_row) if settings_row else {}

    automation_decision = evaluate_automation_rules(payload.device_id, raw_dict, settings)

    # If irrigation was triggered by safe automation, record action
    if automation_decision.get("should_pump_run") and not payload.pump_state:
        log_farming_action(
            device_id=payload.device_id,
            crop_name=settings.get("crop_name", "Tomato"),
            action_type="irrigation_pump",
            triggered_by="automation",
            parameters={
                "runtime_seconds": automation_decision["pump_runtime_seconds"],
                "reason": automation_decision["pump_reason"]
            },
            pre_readings=raw_dict
        )

    # 5. Run Verification on Pending Past Actions
    run_action_verification(payload.device_id)

    # 6. Generate Updated Advisory
    generate_polyhouse_advisory(payload.device_id, raw_dict, settings)

    conn.close()

    # Return Actuator Commands for ESP32
    return {
        "success": True,
        "device_id": payload.device_id,
        "is_valid": is_valid,
        "fault_flags": fault_flags,
        "commands": {
            "pump": automation_decision["should_pump_run"],
            "pump_runtime_seconds": automation_decision["pump_runtime_seconds"],
            "fan": automation_decision["should_fan_run"],
            "emergency_stop": bool(settings.get("emergency_stop_active", False))
        },
        "sync_time": datetime.utcnow().isoformat() + "Z"
    }


@router.get("/live")
async def get_live_overview(device_id: str = "esp32-polyhouse-demo"):
    """
    Returns unified live overview for dashboard:
    current readings, actuator states, connection health, advisory, and metrics.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Fetch Device
    cursor.execute("SELECT * FROM devices WHERE device_id = ?", (device_id,))
    dev_row = cursor.fetchone()
    if not dev_row:
        # Fallback to first available device
        cursor.execute("SELECT * FROM devices LIMIT 1")
        dev_row = cursor.fetchone()

    device = dict(dev_row) if dev_row else {
        "device_id": device_id,
        "name": "Default Polyhouse",
        "is_demo": 1,
        "status": "offline",
        "last_seen_at": None
    }

    # Evaluate Liveness
    liveness_status, liveness_desc = evaluate_device_liveness(device.get("last_seen_at"))
    device["liveness_status"] = liveness_status
    device["liveness_desc"] = liveness_desc

    # Fetch Latest Telemetry
    cursor.execute("""
    SELECT * FROM sensor_telemetry
    WHERE device_id = ?
    ORDER BY created_at DESC LIMIT 1
    """, (device["device_id"],))
    telemetry_row = cursor.fetchone()
    telemetry = dict(telemetry_row) if telemetry_row else {
        "temperature": 26.5,
        "humidity": 65.0,
        "soil_moisture": 52.0,
        "pump_state": 0,
        "fan_state": 0,
        "voltage": 5.0,
        "is_valid": 1,
        "fault_flags": "[]",
        "created_at": None
    }

    # Fetch Settings
    cursor.execute("SELECT * FROM polyhouse_settings WHERE device_id = ?", (device["device_id"],))
    settings_row = cursor.fetchone()
    settings = dict(settings_row) if settings_row else {}

    # Fetch Recent Alerts
    cursor.execute("""
    SELECT * FROM sensor_alerts
    WHERE device_id = ? AND is_resolved = 0
    ORDER BY created_at DESC LIMIT 5
    """, (device["device_id"],))
    alerts = [dict(r) for r in cursor.fetchall()]

    # Fetch Recommendations
    cursor.execute("""
    SELECT * FROM recommendations
    WHERE device_id = ? AND is_dismissed = 0
    ORDER BY created_at DESC LIMIT 4
    """, (device["device_id"],))
    recommendations = [dict(r) for r in cursor.fetchall()]

    # Fetch Recent Farming Actions
    cursor.execute("""
    SELECT * FROM farming_actions
    WHERE device_id = ?
    ORDER BY created_at DESC LIMIT 6
    """, (device["device_id"],))
    actions = [dict(r) for r in cursor.fetchall()]

    # Farm Response Metrics
    metrics = get_farm_response_metrics(device["device_id"])

    conn.close()

    # Calculate VPD
    t_val = telemetry.get("temperature", 25.0) or 25.0
    h_val = telemetry.get("humidity", 60.0) or 60.0
    svp = 0.61078 * (2.71828 ** ((17.27 * t_val) / (t_val + 237.3)))
    avp = svp * (h_val / 100.0)
    vpd_val = round(max(0.0, svp - avp), 2)

    return {
        "success": True,
        "device": device,
        "device_id": device.get("device_id", "esp32-polyhouse-demo"),
        "device_name": device.get("name", "Demo Unit"),
        "is_demo": bool(device.get("is_demo", 1)),
        "latest_reading": {
            "temperature": telemetry.get("temperature"),
            "humidity": telemetry.get("humidity"),
            "soil_moisture": telemetry.get("soil_moisture"),
            "vpd_kpa": vpd_val,
            "pump_state": bool(telemetry.get("pump_state")),
            "fan_state": bool(telemetry.get("fan_state")),
            "timestamp": telemetry.get("created_at") or datetime.utcnow().isoformat() + "Z",
            "is_demo": bool(device.get("is_demo", 1))
        },
        "telemetry": telemetry,
        "actuators": {
            "pump": bool(telemetry.get("pump_state")),
            "fan": bool(telemetry.get("fan_state")),
            "emergency_stop": bool(settings.get("emergency_stop_active", False)),
            "auto_mode": True,
            "anti_cycle_remaining_sec": 0
        },
        "sensor_trust": {
            "device_connected": device.get("liveness_status") != "offline",
            "last_seen_seconds_ago": 10 if device.get("liveness_status") == "live" else 3600,
            "liveness_status": device.get("liveness_status", "stale"),
            "dht_status": "healthy" if telemetry.get("temperature") is not None and telemetry.get("humidity") is not None else "missing",
            "moisture_status": "healthy" if telemetry.get("soil_moisture") is not None else "missing",
            "warnings": [a.get("message") for a in alerts]
        },
        "settings": settings,
        "alerts": alerts,
        "active_alerts_count": len(alerts),
        "recommendations": recommendations,
        "advisory": recommendations,
        "recent_actions": actions,
        "metrics": metrics
    }


@router.post("/devices/{device_id}/control")
async def manual_actuator_control(device_id: str, payload: ActuatorControlInput):
    """
    Farmer manual override to trigger pump, fan, or emergency stop.
    Enforces maximum runtime safety limits and logs the action for verification.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM devices WHERE device_id = ?", (device_id,))
    device = cursor.fetchone()
    if not device:
        conn.close()
        raise HTTPException(status_code=404, detail="Device not found.")

    cursor.execute("SELECT * FROM polyhouse_settings WHERE device_id = ?", (device_id,))
    settings_row = cursor.fetchone()
    settings = dict(settings_row) if settings_row else {}

    # Get latest telemetry for pre-action verification baseline
    cursor.execute("SELECT * FROM sensor_telemetry WHERE device_id = ? ORDER BY created_at DESC LIMIT 1", (device_id,))
    tele_row = cursor.fetchone()
    pre_readings = dict(tele_row) if tele_row else {}

    action_id = None
    msg = ""

    action = payload.action
    if not action and payload.actuator:
        if payload.actuator == "emergency_stop":
            action = "emergency_stop" if payload.state else "clear_emergency_stop"
        elif payload.actuator == "pump":
            action = "pump_on" if payload.state else "pump_off"
        elif payload.actuator == "fan":
            action = "fan_on" if payload.state else "fan_off"

    runtime_input = payload.duration_seconds if payload.duration_seconds is not None else payload.runtime_seconds

    if action == "emergency_stop":
        cursor.execute("UPDATE polyhouse_settings SET emergency_stop_active = 1 WHERE device_id = ?", (device_id,))
        # Immediately set pump and fan state to 0 in telemetry
        cursor.execute("""
        INSERT INTO sensor_telemetry (device_id, temperature, humidity, soil_moisture, pump_state, fan_state, is_valid, fault_flags)
        VALUES (?, ?, ?, ?, 0, 0, 1, '["EMERGENCY_STOP_TRIGGERED"]')
        """, (
            device_id,
            pre_readings.get("temperature", 25.0),
            pre_readings.get("humidity", 60.0),
            pre_readings.get("soil_moisture", 50.0)
        ))
        conn.commit()
        action_id = log_farming_action(
            device_id=device_id,
            crop_name=settings.get("crop_name", "Tomato"),
            action_type="emergency_stop",
            triggered_by="farmer_manual",
            parameters={"reason": payload.reason or "Farmer activated emergency stop"},
            pre_readings=pre_readings
        )
        msg = "Emergency Stop Activated. All actuators locked OFF."

    elif action == "clear_emergency_stop":
        cursor.execute("UPDATE polyhouse_settings SET emergency_stop_active = 0 WHERE device_id = ?", (device_id,))
        conn.commit()
        msg = "Emergency Stop Cleared. System restored to normal automation."

    elif action == "pump_on":
        if settings.get("emergency_stop_active"):
            conn.close()
            raise HTTPException(status_code=400, detail="Cannot run pump while Emergency Stop is active.")

        runtime = min(int(runtime_input or 20), int(settings.get("max_pump_runtime_seconds", 30)))
        # Update telemetry to show pump active
        cursor.execute("""
        INSERT INTO sensor_telemetry (device_id, temperature, humidity, soil_moisture, pump_state, fan_state, is_valid)
        VALUES (?, ?, ?, ?, 1, ?, 1)
        """, (
            device_id,
            pre_readings.get("temperature", 25.0),
            pre_readings.get("humidity", 60.0),
            pre_readings.get("soil_moisture", 50.0),
            pre_readings.get("fan_state", 0)
        ))
        conn.commit()
        action_id = log_farming_action(
            device_id=device_id,
            crop_name=settings.get("crop_name", "Tomato"),
            action_type="manual_irrigation",
            triggered_by="farmer_manual",
            parameters={"runtime_seconds": runtime, "reason": payload.reason or "Manual drip cycle"},
            pre_readings=pre_readings
        )
        msg = f"Pump activated for {runtime} seconds. Verification scheduled."

    elif action == "pump_off":
        cursor.execute("""
        INSERT INTO sensor_telemetry (device_id, temperature, humidity, soil_moisture, pump_state, fan_state, is_valid)
        VALUES (?, ?, ?, ?, 0, ?, 1)
        """, (
            device_id,
            pre_readings.get("temperature", 25.0),
            pre_readings.get("humidity", 60.0),
            pre_readings.get("soil_moisture", 50.0),
            pre_readings.get("fan_state", 0)
        ))
        msg = "Pump turned OFF."

    elif action in ("fan_on", "fan_off"):
        new_state = 1 if action == "fan_on" else 0
        cursor.execute("""
        INSERT INTO sensor_telemetry (device_id, temperature, humidity, soil_moisture, pump_state, fan_state, is_valid)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (
            device_id,
            pre_readings.get("temperature", 25.0),
            pre_readings.get("humidity", 60.0),
            pre_readings.get("soil_moisture", 50.0),
            pre_readings.get("pump_state", 0),
            new_state
        ))
        msg = f"Fan turned {'ON' if new_state else 'OFF'}."

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": msg,
        "action_id": action_id
    }


class SimulationInput(BaseModel):
    scenario: Optional[str] = "normal"
    device_id: Optional[str] = "esp32-polyhouse-demo"


@router.post("/simulate")
async def simulate_polyhouse_reading(
    body: Optional[SimulationInput] = Body(None),
    device_id: Optional[str] = Query(None),
    scenario: Optional[str] = Query(None)
):
    """
    Demo/Test simulation helper: Generates realistic sensor readings
    and clearly flags them with is_demo = True.
    """
    target_device = (body.device_id if body and body.device_id else None) or device_id or "esp32-polyhouse-demo"
    target_scenario = (body.scenario if body and body.scenario else None) or scenario or "normal"
    import random

    if target_scenario == "dry_soil":
        temp = round(random.uniform(28.0, 31.0), 1)
        humidity = round(random.uniform(55.0, 65.0), 1)
        moisture = round(random.uniform(22.0, 32.0), 1)
        flags = []
    elif target_scenario == "heat_stress":
        temp = round(random.uniform(33.5, 37.0), 1)
        humidity = round(random.uniform(45.0, 55.0), 1)
        moisture = round(random.uniform(42.0, 52.0), 1)
        flags = []
    elif target_scenario == "sensor_fault":
        temp = 88.0  # Physically implausible
        humidity = 100.0
        moisture = -5.0
        flags = ["ERR_TEMP_OUT_OF_RANGE", "ERR_MOISTURE_OUT_OF_RANGE"]
    else:
        temp = round(random.uniform(24.0, 28.5), 1)
        humidity = round(random.uniform(62.0, 72.0), 1)
        moisture = round(random.uniform(50.0, 68.0), 1)
        flags = []

    res = await ingest_telemetry(
        payload=TelemetryInput(
            device_id=target_device,
            temperature=temp,
            humidity=humidity,
            soil_moisture=moisture,
            pump_state=False,
            fan_state=temp > 30.0,
            voltage=5.02,
            firmware_version="2.0.0-demo"
        ),
        x_device_key=None
    )

    return {
        "success": True,
        "scenario": target_scenario,
        "simulated_values": {
            "temperature": temp,
            "humidity": humidity,
            "soil_moisture": moisture
        },
        "ingestion_result": res
    }
