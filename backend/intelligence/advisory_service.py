"""
AgriMitra AI 2.0 - Explainable Farming Advisory Engine
Generates transparent, structured agronomic recommendations grounded in
live sensor readings, crop stage, growing medium, and ICAR guidelines.
"""

import math
from typing import Dict, Any, List, Optional
from datetime import datetime

from database.db import get_db_connection


def calculate_vpd(temp_c: float, humidity_pct: float) -> float:
    """
    Calculates Vapor Pressure Deficit (VPD) in kPa.
    VPD indicates plant transpiration stress inside a polyhouse.
    Target optimal range for tomatoes/vegetables is 0.8 - 1.2 kPa.
    """
    svp = 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))
    avp = svp * (humidity_pct / 100.0)
    return round(svp - avp, 2)


def generate_polyhouse_advisory(
    device_id: str,
    telemetry: Dict[str, Any],
    settings: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Generates explainable, actionable recommendations based on live sensor conditions.
    """
    recs = []
    temp = telemetry.get("temperature", 25.0)
    humidity = telemetry.get("humidity", 65.0)
    moisture = telemetry.get("soil_moisture", 50.0)
    crop = settings.get("crop_name", "Tomato")
    medium = settings.get("growing_medium", "Cocopeat/Soilless")
    stage = settings.get("crop_stage", "Vegetative")

    vpd = calculate_vpd(temp, humidity)

    # 1. Moisture & Irrigation Advice
    low_thresh = float(settings.get("moisture_threshold_low", 35.0))
    if moisture < low_thresh:
        recs.append({
            "id": f"rec-irrig-low-{int(datetime.utcnow().timestamp())}",
            "device_id": device_id,
            "crop_name": crop,
            "category": "irrigation",
            "title": "Root Zone Depletion: Drip Irrigation Recommended",
            "title_hi": "जड़ क्षेत्र में नमी की कमी: ड्रिप सिंचाई आवश्यक",
            "what": f"Deliver a short {settings.get('max_pump_runtime_seconds', 25)}-second drip irrigation pulse.",
            "what_hi": f"लगभग {settings.get('max_pump_runtime_seconds', 25)} सेकंड के लिए ड्रिप सिंचाई चक्र चलाएं।",
            "why": f"Substrate moisture has dropped to {moisture:.1f}%, below the critical absorption threshold of {low_thresh:.1f}% for {crop} ({medium}).",
            "why_hi": f"वर्तमान नमी {moisture:.1f}% है, जो {crop} के लिए निर्धारित न्यूनतम सीमा ({low_thresh:.1f}%) से नीचे है।",
            "supporting_data": {
                "current_moisture": moisture,
                "low_threshold": low_thresh,
                "medium": medium,
                "stage": stage
            },
            "next_check": "Inspect root ball feel after 20 minutes to confirm percolation.",
            "next_check_hi": "20 मिनट बाद क्यारी की मिट्टी/कोकोपीट को छूकर नमी की जांच करें।",
            "confidence": 0.94,
            "action_required": True,
            "action_type": "irrigation_pump"
        })
    elif moisture > 85.0:
        recs.append({
            "id": f"rec-irrig-high-{int(datetime.utcnow().timestamp())}",
            "device_id": device_id,
            "crop_name": crop,
            "category": "irrigation",
            "title": "Excess Root Saturation: Halt Irrigation",
            "title_hi": "जड़ों में अधिक पानी: सिंचाई तुरंत रोकें",
            "what": "Keep pump off and ensure bottom drainage slits are unblocked.",
            "what_hi": "सिंचाई बंद रखें और ग्रो बैग के नीचे जल निकासी की जांच करें।",
            "why": f"Moisture is {moisture:.1f}%. Saturated roots lack oxygen, encouraging Pythium and Phytophthora root rot.",
            "why_hi": f"नमी {moisture:.1f}% बहुत अधिक है। जड़ों को हवा न मिलने से फफूंद और सड़न का खतरा होता है।",
            "supporting_data": {"current_moisture": moisture, "safe_max": 80.0},
            "next_check": "Allow substrate to dry down to 60% before next cycle.",
            "next_check_hi": "नमी 60% तक उतरने तक पानी न दें।",
            "confidence": 0.90,
            "action_required": False,
            "action_type": "none"
        })

    # 2. Temperature & Heat Stress Advice
    if temp >= 32.0:
        recs.append({
            "id": f"rec-heat-{int(datetime.utcnow().timestamp())}",
            "device_id": device_id,
            "crop_name": crop,
            "category": "ventilation",
            "title": "High Thermal Stress: Increase Airflow & Shading",
            "title_hi": "तापमान में अत्यधिक वृद्धि: वेंटिलेशन और छाया बढ़ाएं",
            "what": "Deploy 50% aluminet shade net and run exhaust/circulation fans.",
            "what_hi": "शेड नेट लगाएं और एग्जॉस्ट व सर्कुलेशन पंखे चालू करें।",
            "why": f"Polyhouse temperature is {temp:.1f}°C. Sustained heat >32°C causes flower abortion and pollen sterility in {crop}.",
            "why_hi": f"तापमान {temp:.1f}°C है। 32°C से अधिक गर्मी में फूल झड़ने और परागकण सूखने का खतरा बढ़ जाता है।",
            "supporting_data": {"temperature": temp, "fan_trigger": settings.get("fan_temp_trigger", 30.0)},
            "next_check": "Monitor temperature drop within 30 minutes.",
            "next_check_hi": "अगले 30 मिनट में तापमान में गिरावट देखें।",
            "confidence": 0.92,
            "action_required": True,
            "action_type": "fan_cooling"
        })

    # 3. Humidity & Fungal Disease Risk (Late Blight / Leaf Mold)
    if humidity >= 82.0 and temp >= 18.0 and temp <= 26.0:
        recs.append({
            "id": f"rec-mold-{int(datetime.utcnow().timestamp())}",
            "device_id": device_id,
            "crop_name": crop,
            "category": "disease_risk",
            "title": "Foliar Condensation Alert: Fungal Blight Risk",
            "title_hi": "पत्तियों पर नमी का खतरा: फफूंद एवं झुलसा की संभावना",
            "what": "Open top natural ventilation curtains to purge stagnant humid air.",
            "what_hi": "पॉलीहाउस के ऊपरी पर्दे खोलें ताकि स्थिर नम हवा बाहर निकल सके।",
            "why": f"Relative humidity {humidity:.1f}% at {temp:.1f}°C produces leaf dew point favorable for Alternaria and Passalora spores.",
            "why_hi": f"नमी {humidity:.1f}% और तापमान {temp:.1f}°C फफूंद बीजाणुओं के अंकुरण के लिए अनुकूल है।",
            "supporting_data": {"humidity": humidity, "temperature": temp, "vpd": vpd},
            "next_check": "Inspect underside of lower foliage for white downy patches.",
            "next_check_hi": "निचली पत्तियों के नीचे फफूंद के धब्बों की जांच करें।",
            "confidence": 0.88,
            "action_required": False,
            "action_type": "ventilation_curtain"
        })

    # 4. Vapor Pressure Deficit (VPD) Transpiration Guidance
    if vpd < 0.4:
        recs.append({
            "id": f"rec-vpd-low-{int(datetime.utcnow().timestamp())}",
            "device_id": device_id,
            "crop_name": crop,
            "category": "ventilation",
            "title": "Stagnant VPD (Low Transpiration Rate)",
            "title_hi": "हवा में दबाव की कमी (VPD कम - मंद वाष्पोत्सर्जन)",
            "what": "Ventilate beds to stimulate calcium and nutrient uptake through roots.",
            "what_hi": "हवा का प्रवाह बढ़ाएं ताकि जड़ें कैल्शियम और पोषक तत्व सोख सकें।",
            "why": f"VPD is {vpd} kPa (optimal is 0.8-1.2 kPa). Low VPD restricts calcium delivery, causing Blossom End Rot.",
            "why_hi": f"VPD {vpd} kPa है (उचित सीमा 0.8-1.2 kPa)। कम दबाव से फल में कैल्शियम की कमी हो सकती है।",
            "supporting_data": {"vpd": vpd, "target_range": "0.8 - 1.2 kPa"},
            "next_check": "Aim to lower humidity to 70% during peak daytime.",
            "next_check_hi": "दिन के समय हवा की नमी को 70% तक लाने का प्रयास करें।",
            "confidence": 0.86,
            "action_required": False,
            "action_type": "none"
        })

    # Save to database
    if recs:
        conn = get_db_connection()
        cursor = conn.cursor()
        for r in recs:
            cursor.execute("""
            INSERT OR REPLACE INTO recommendations (
                id, device_id, crop_name, category, title, title_hi, what, what_hi,
                why, why_hi, supporting_data, next_check, next_check_hi,
                confidence, action_required, action_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r["id"], r["device_id"], r["crop_name"], r["category"],
                r["title"], r["title_hi"], r["what"], r["what_hi"],
                r["why"], r["why_hi"], str(r["supporting_data"]),
                r["next_check"], r["next_check_hi"], r["confidence"],
                1 if r["action_required"] else 0, r["action_type"]
            ))
        conn.commit()
        conn.close()

    return recs
