"""
AgriMitra AI 2.0 - Polyhouse Settings, History, Alerts & Reports API Router
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import json
from datetime import datetime

from database.db import get_db_connection
from intelligence.farm_response import get_farm_response_metrics

router = APIRouter(prefix="/api/polyhouse", tags=["Polyhouse Management"])


class SettingsUpdatePayload(BaseModel):
    device_id: str = "esp32-polyhouse-demo"
    crop_name: Optional[str] = None
    crop_stage: Optional[str] = None
    growing_medium: Optional[str] = None
    auto_irrigation_enabled: Optional[bool] = None
    moisture_threshold_low: Optional[float] = None
    moisture_target_high: Optional[float] = None
    min_irrigation_interval_minutes: Optional[int] = None
    max_pump_runtime_seconds: Optional[int] = None
    auto_fan_enabled: Optional[bool] = None
    fan_temp_trigger: Optional[float] = None
    fan_temp_hysteresis: Optional[float] = None


@router.get("/settings")
async def get_settings(device_id: str = "esp32-polyhouse-demo"):
    """Returns current automation and agronomic configuration for the polyhouse."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM polyhouse_settings WHERE device_id = ?", (device_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Settings not found for device.")
    return {"success": True, "settings": dict(row)}


@router.api_route("/settings", methods=["POST", "PUT"])
async def update_settings(payload: SettingsUpdatePayload):
    """Updates automation thresholds, crop stage, and safety cutoffs."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM polyhouse_settings WHERE device_id = ?", (payload.device_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Device settings not found.")

    curr = dict(existing)
    new_crop = payload.crop_name if payload.crop_name is not None else curr["crop_name"]
    new_stage = payload.crop_stage if payload.crop_stage is not None else curr["crop_stage"]
    new_medium = payload.growing_medium if payload.growing_medium is not None else curr["growing_medium"]
    new_auto_irrig = 1 if (payload.auto_irrigation_enabled if payload.auto_irrigation_enabled is not None else curr["auto_irrigation_enabled"]) else 0
    new_thresh_low = payload.moisture_threshold_low if payload.moisture_threshold_low is not None else curr["moisture_threshold_low"]
    new_thresh_high = payload.moisture_target_high if payload.moisture_target_high is not None else curr["moisture_target_high"]
    new_interval = payload.min_irrigation_interval_minutes if payload.min_irrigation_interval_minutes is not None else curr["min_irrigation_interval_minutes"]
    new_max_runtime = payload.max_pump_runtime_seconds if payload.max_pump_runtime_seconds is not None else curr["max_pump_runtime_seconds"]
    new_auto_fan = 1 if (payload.auto_fan_enabled if payload.auto_fan_enabled is not None else curr["auto_fan_enabled"]) else 0
    new_fan_trigger = payload.fan_temp_trigger if payload.fan_temp_trigger is not None else curr["fan_temp_trigger"]
    new_fan_hys = payload.fan_temp_hysteresis if payload.fan_temp_hysteresis is not None else curr["fan_temp_hysteresis"]

    cursor.execute("""
    UPDATE polyhouse_settings
    SET crop_name = ?, crop_stage = ?, growing_medium = ?,
        auto_irrigation_enabled = ?, moisture_threshold_low = ?, moisture_target_high = ?,
        min_irrigation_interval_minutes = ?, max_pump_runtime_seconds = ?,
        auto_fan_enabled = ?, fan_temp_trigger = ?, fan_temp_hysteresis = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE device_id = ?
    """, (
        new_crop, new_stage, new_medium,
        new_auto_irrig, new_thresh_low, new_thresh_high,
        new_interval, new_max_runtime,
        new_auto_fan, new_fan_trigger, new_fan_hys,
        payload.device_id
    ))

    conn.commit()
    conn.close()

    return {"success": True, "message": "Polyhouse settings updated successfully."}


@router.get("/history")
async def get_farming_history(
    device_id: str = "esp32-polyhouse-demo",
    limit: int = Query(25, ge=1, le=100)
):
    """Returns chronological timeline of farming actions with post-action verification status."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM farming_actions
    WHERE device_id = ?
    ORDER BY created_at DESC LIMIT ?
    """, (device_id, limit))
    raw_actions = [dict(r) for r in cursor.fetchall()]
    conn.close()

    actions = []
    for r in raw_actions:
        item = dict(r)
        pre = {}
        post = {}
        params = {}
        try:
            if item.get("pre_sensor_readings"):
                pre = json.loads(item["pre_sensor_readings"]) if isinstance(item["pre_sensor_readings"], str) else item["pre_sensor_readings"]
        except Exception:
            pass
        try:
            if item.get("post_sensor_readings"):
                post = json.loads(item["post_sensor_readings"]) if isinstance(item["post_sensor_readings"], str) else item["post_sensor_readings"]
        except Exception:
            pass
        try:
            if item.get("parameters"):
                params = json.loads(item["parameters"]) if isinstance(item["parameters"], str) else item["parameters"]
        except Exception:
            pass

        item["pre_moisture"] = pre.get("soil_moisture")
        item["pre_temperature"] = pre.get("temperature")
        item["post_moisture"] = post.get("soil_moisture")
        item["post_temperature"] = post.get("temperature")
        item["duration_seconds"] = params.get("runtime_seconds", 20)
        item["trigger_source"] = item.get("triggered_by", "manual")
        item["outcome_notes"] = item.get("verification_summary") or params.get("reason")
        actions.append(item)

    return {"success": True, "actions": actions, "history": actions}


@router.get("/alerts")
async def get_alerts(
    device_id: str = "esp32-polyhouse-demo",
    include_resolved: bool = False
):
    """Returns active or historic sensor and actuator alerts."""
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM sensor_alerts WHERE device_id = ?"
    params = [device_id]
    if not include_resolved:
        query += " AND is_resolved = 0"
    query += " ORDER BY created_at DESC LIMIT 50"

    cursor.execute(query, params)
    alerts = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {"success": True, "alerts": alerts}


@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Marks an alert as inspected and resolved by the farmer."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE sensor_alerts
    SET is_resolved = 1, resolved_at = CURRENT_TIMESTAMP
    WHERE id = ?
    """, (alert_id,))
    conn.commit()
    conn.close()

    return {"success": True, "message": f"Alert '{alert_id}' marked as resolved."}


@router.get("/reports")
async def get_performance_report(device_id: str = "esp32-polyhouse-demo"):
    """
    Returns verified outcomes, water consumption estimates,
    action completion rates, and sensor health statistics.
    """
    metrics = get_farm_response_metrics(device_id)
    return {"success": True, "report": metrics, "metrics": metrics}
