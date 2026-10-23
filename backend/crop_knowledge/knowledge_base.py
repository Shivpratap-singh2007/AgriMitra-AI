"""
Crop Knowledge Base Query Helper
Loads structured agronomic knowledge for Tomato and Potato to support:
1. Disease explanation and recommended next steps
2. AI Chatbot factual grounding (RAG context)
3. Crop guides and official agricultural references
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional, List

KNOWLEDGE_DIR = Path(__file__).resolve().parent

def load_crop_knowledge(crop_name: str) -> Optional[Dict[str, Any]]:
    clean_name = crop_name.lower().strip()
    if "tomato" in clean_name or "टमाटर" in clean_name:
        file_path = KNOWLEDGE_DIR / "tomato.json"
    elif "potato" in clean_name or "आलू" in clean_name:
        file_path = KNOWLEDGE_DIR / "potato.json"
    else:
        return None
    
    if not file_path.exists():
        return None
    
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_all_crops() -> List[Dict[str, Any]]:
    crops = []
    for file_name in ["tomato.json", "potato.json"]:
        path = KNOWLEDGE_DIR / file_name
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                crops.append({
                    "id": data.get("crop", "").lower(),
                    "name": data.get("crop"),
                    "name_hindi": data.get("crop_hindi"),
                    "scientific_name": data.get("scientific_name"),
                    "overview": data.get("overview"),
                    "overview_hindi": data.get("overview_hindi"),
                    "growing_conditions": data.get("growing_conditions"),
                    "sowing_calendar": data.get("sowing_calendar"),
                    "duration_and_harvest": data.get("duration_and_harvest"),
                    "water_management": data.get("water_management"),
                    "nutrient_management": data.get("nutrient_management"),
                    "diseases": [
                        {
                            "id": d.get("id"),
                            "name": d.get("name"),
                            "hindi_name": d.get("hindi_name"),
                            "symptoms": d.get("symptoms", [])
                        }
                        for d in data.get("diseases", [])
                    ],
                    "references": data.get("verified_references", [])
                })
    return crops

def find_disease_info(crop_name: str, disease_keyword: str) -> Optional[Dict[str, Any]]:
    data = load_crop_knowledge(crop_name)
    if not data:
        return None
    keyword = disease_keyword.lower().replace("_", " ").strip()
    for disease in data.get("diseases", []):
        d_name = disease.get("name", "").lower()
        d_id = disease.get("id", "").lower()
        d_hindi = disease.get("hindi_name", "").lower()
        if keyword in d_name or keyword in d_id or keyword in d_hindi or d_name in keyword:
            return disease
    return None

def build_knowledge_context(crop_name: str, query: str = "") -> str:
    """Builds a factual agricultural prompt context for the Gemini AI chatbot."""
    data = load_crop_knowledge(crop_name)
    if not data:
        return "No specific verified crop knowledge available for this crop."
    
    crop = data.get("crop")
    crop_hi = data.get("crop_hindi")
    conditions = data.get("growing_conditions", {})
    water = data.get("water_management", {})
    nutrients = data.get("nutrient_management", {})
    duration = data.get("duration_and_harvest", {})
    diseases = data.get("diseases", [])

    disease_summaries = []
    for d in diseases:
        name = d.get("name")
        hi = d.get("hindi_name")
        syms = "; ".join(d.get("symptoms", [])[:2])
        prev = "; ".join(d.get("prevention_and_cultural", [])[:2]) if d.get("prevention_and_cultural") else ""
        disease_summaries.append(f"- {name} ({hi}): Symptoms: {syms}. Prevention: {prev}")

    context = f"""
Official Verified Agricultural Context for {crop} ({crop_hi}):
- Scientific Name: {data.get('scientific_name')}
- Ideal Growing Conditions: Temperature: {conditions.get('temperature_range')}; Soil: {conditions.get('soil_type')}, pH: {conditions.get('soil_ph')}.
- Duration & Harvest: {duration.get('crop_duration', duration.get('total_crop_duration'))}; Sowing/Nursery: {duration.get('nursery_period', duration.get('seed_tuber_preparation'))}.
- Irrigation: {water.get('frequency')}. Critical stages: {', '.join(water.get('critical_stages', []))}.
- Nutrients: {nutrients.get('fertilizer_npk_standard')}. Application: {nutrients.get('application_schedule')}.
- Common Diseases & Cultural Solutions:
{chr(10).join(disease_summaries)}
- Official Sources: {', '.join(data.get('verified_references', []))}
"""
    return context.strip()


def answer_from_verified_knowledge(crop_name: str, query: str, language: str = "en") -> Optional[str]:
    """Retrieves verified agronomic guidance from ICAR knowledge base matching farmer query."""
    data = load_crop_knowledge(crop_name)
    if not data:
        return None

    q = query.lower()
    crop = data.get("crop", crop_name)
    crop_hi = data.get("crop_hindi", crop)
    is_hi = language == "hi" or any("\u0900" <= ch <= "\u097F" for ch in query)

    # 1. Disease check
    for disease in data.get("diseases", []):
        d_name = disease.get("name", "").lower()
        d_id = disease.get("id", "").lower()
        d_hi = disease.get("hindi_name", "").lower()

        # Check if query mentions this disease or its keywords
        keywords = d_name.split() + [d_id, d_hi]
        if any(kw and kw in q for kw in keywords if len(kw) > 3):
            symptoms = "\n• " + "\n• ".join(disease.get("symptoms", []))
            prevention = "\n• " + "\n• ".join(disease.get("prevention_and_cultural", []))
            organic = disease.get("basic_organic_care", "Maintain field sanitation and consult local KVK.")

            if is_hi:
                return (
                    f"🌿 **{crop_hi} - {disease.get('hindi_name')} ({disease.get('name')})**\n\n"
                    f"**रोगज़नक़ (Pathogen):** {disease.get('pathogen')}\n\n"
                    f"**प्रमुख लक्षण (Symptoms):**{symptoms}\n\n"
                    f"**रोकथाम व कृषि उपाय (Prevention):**{prevention}\n\n"
                    f"**जैविक उपचार:** {organic}\n\n"
                    f"*(स्रोत: ICAR / CPRI प्रमाणित कृषि अनुसंधान डेटा)*"
                )
            else:
                return (
                    f"🌿 **{crop} - {disease.get('name')} ({disease.get('hindi_name')})**\n\n"
                    f"**Pathogen:** {disease.get('pathogen')}\n\n"
                    f"**Key Symptoms:**{symptoms}\n\n"
                    f"**Prevention & Cultural Practices:**{prevention}\n\n"
                    f"**Organic/Biocontrol Care:** {organic}\n\n"
                    f"*(Source: Verified ICAR / CPRI Agronomic Data)*"
                )

    # 2. Sowing Calendar
    sow_keywords = ["sow", "plant", "season", "calendar", "when", "month", "बुवाई", "रोपाई", "समय", "कब", "मौसम"]
    if any(k in q for k in sow_keywords):
        calendar = data.get("sowing_calendar", {})
        lines = []
        for reg, details in calendar.items():
            reg_title = reg.replace("_", " ").title()
            if isinstance(details, dict):
                sub = "; ".join([f"{k.replace('_', ' ').title()}: {v}" for k, v in details.items()])
                lines.append(f"• **{reg_title}:** {sub}")
            else:
                lines.append(f"• **{reg_title}:** {details}")
        cal_text = "\n".join(lines)

        if is_hi:
            return (
                f"📅 **{crop_hi} की बुवाई एवं रोपाई का समय (ICAR दिशा-निर्देश):**\n\n{cal_text}\n\n"
                f"**अवधि:** {data.get('duration_and_harvest', {}).get('crop_duration', data.get('duration_and_harvest', {}).get('total_crop_duration'))}\n\n"
                f"*(क्षेत्रवार सटीक समय के लिए अपने स्थानीय कृषि विज्ञान केंद्र (KVK) से भी परामर्श लें)*"
            )
        else:
            return (
                f"📅 **{crop} Sowing & Planting Calendar (ICAR Guidelines):**\n\n{cal_text}\n\n"
                f"**Crop Duration:** {data.get('duration_and_harvest', {}).get('crop_duration', data.get('duration_and_harvest', {}).get('total_crop_duration'))}\n\n"
                f"*(Cross-reference with local Krishi Vigyan Kendra for micro-climate adjustments)*"
            )

    # 3. Irrigation / Water
    water_keywords = ["water", "irrigat", "moisture", "पानी", "सिंचाई", "नमी"]
    if any(k in q for k in water_keywords):
        water = data.get("water_management", {})
        stages = "• " + "\n• ".join(water.get("critical_stages", []))
        freq = water.get("frequency", "Regular irrigation based on soil moisture.")
        method = water.get("method_recommendation", "")

        if is_hi:
            return (
                f"💧 **{crop_hi} में सिंचाई प्रबंधन (ICAR दिशानिर्देश):**\n\n"
                f"**सिंचाई की आवृत्ति:** {freq}\n\n"
                f"**महत्वपूर्ण अवस्थाएं (Critical Stages):**\n{stages}\n\n"
                f"**विधि:** {method}\n\n"
                f"*(सिंचाई शाम के समय करने से फफूंद जनित रोगों का खतरा कम होता है)*"
            )
        else:
            return (
                f"💧 **{crop} Irrigation Management (ICAR Guidelines):**\n\n"
                f"**Water Frequency:** {freq}\n\n"
                f"**Critical Moisture Stages:**\n{stages}\n\n"
                f"**Best Method:** {method}\n\n"
                f"*(Avoid foliar wetting in late evening to suppress fungal outbreaks)*"
            )

    # 4. Fertilizer / NPK / Nutrients
    fert_keywords = ["fertiliz", "npk", "manure", "nutrient", "urea", "खाद", "उर्वरक", "यूरिया", "पोटाश", "फास्फोरस"]
    if any(k in q for k in fert_keywords):
        nutr = data.get("nutrient_management", {})
        fym = nutr.get("organic_manure", "")
        npk = nutr.get("fertilizer_npk_standard", "")
        schedule = nutr.get("application_schedule", "")
        extra = nutr.get("calcium_boron_note", nutr.get("earthing_up", ""))

        if is_hi:
            return (
                f"🌱 **{crop_hi} के लिए संतुलित पोषण व खाद (ICAR / CPRI):**\n\n"
                f"**गोबर की खाद (FYM):** {fym}\n\n"
                f"**मानक NPK अनुपात:** {npk}\n\n"
                f"**खाद देने की विधि (Schedule):** {schedule}\n\n"
                f"**अतिरिक्त सुझाव:** {extra}\n\n"
                f"*(मृदा स्वास्थ्य कार्ड (Soil Health Card) के अनुसार मात्रा समायोजित करें)*"
            )
        else:
            return (
                f"🌱 **{crop} Nutrient & Fertilizer Recommendations (ICAR / CPRI):**\n\n"
                f"**Organic Manure (FYM):** {fym}\n\n"
                f"**Standard NPK:** {npk}\n\n"
                f"**Application Schedule:** {schedule}\n\n"
                f"**Key Agronomic Note:** {extra}\n\n"
                f"*(Adjust specific quantities according to your local Soil Health Card)*"
            )

    # 5. Harvest & Duration
    harvest_keywords = ["harvest", "duration", "yield", "days", "कटाई", "तुड़ाई", "उपज", "दिन"]
    if any(k in q for k in harvest_keywords):
        dur = data.get("duration_and_harvest", {})
        lines = [f"• **{k.replace('_', ' ').title()}:** {v}" for k, v in dur.items()]
        dur_text = "\n".join(lines)

        if is_hi:
            return f"🌾 **{crop_hi} की फसल अवधि एवं कटाई दिशानिर्देश:**\n\n{dur_text}"
        else:
            return f"🌾 **{crop} Duration & Harvest Guidelines:**\n\n{dur_text}"

    return None

