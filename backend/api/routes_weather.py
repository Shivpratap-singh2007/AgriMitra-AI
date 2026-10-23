"""
FastAPI Routes for Live Farm Weather via Open-Meteo API
Zero API Key required. Live global satellite and forecast feed.
"""

from typing import Optional
from fastapi import APIRouter, Query
import httpx

router = APIRouter(prefix="/api/weather", tags=["Live Farm Weather"])

WMO_WEATHER_MAP = {
    0: {"en": "Clear sky", "hi": "साफ आसमान", "icon": "☀️"},
    1: {"en": "Mainly clear", "hi": "मुख्य रूप से साफ", "icon": "🌤️"},
    2: {"en": "Partly cloudy", "hi": "आंशिक बादल", "icon": "⛅"},
    3: {"en": "Overcast", "hi": "घने बादल", "icon": "☁️"},
    45: {"en": "Foggy / Mist", "hi": "कोहरा / धुंध", "icon": "🌫️"},
    48: {"en": "Depositing rime fog", "hi": "घना पाला व कोहरा", "icon": "🌫️"},
    51: {"en": "Light drizzle", "hi": "हल्की बूंदाबांदी", "icon": "🌦️"},
    53: {"en": "Moderate drizzle", "hi": "मध्यम बूंदाबांदी", "icon": "🌧️"},
    55: {"en": "Dense drizzle", "hi": "तेज़ बूंदाबांदी", "icon": "🌧️"},
    61: {"en": "Slight rain", "hi": "हल्की बारिश", "icon": "🌦️"},
    63: {"en": "Moderate rain", "hi": "मध्यम बारिश", "icon": "🌧️"},
    65: {"en": "Heavy rain", "hi": "भारी बारिश", "icon": "⛈️"},
    71: {"en": "Slight snow fall", "hi": "हल्की बर्फबारी", "icon": "🌨️"},
    73: {"en": "Moderate snow fall", "hi": "मध्यम बर्फबारी", "icon": "🌨️"},
    75: {"en": "Heavy snow fall", "hi": "भारी बर्फबारी", "icon": "❄️"},
    80: {"en": "Slight rain showers", "hi": "हल्की बारिश की बौछारें", "icon": "🌦️"},
    81: {"en": "Moderate rain showers", "hi": "मध्यम बारिश की बौछारें", "icon": "🌧️"},
    82: {"en": "Violent rain showers", "hi": "तेज़ बारिश की बौछारें", "icon": "⛈️"},
    95: {"en": "Thunderstorm", "hi": "तूफान व बिजली", "icon": "⚡"},
    96: {"en": "Thunderstorm with hail", "hi": "ओलों के साथ तूफान", "icon": "⛈️"},
    99: {"en": "Heavy thunderstorm with hail", "hi": "भारी ओलों के साथ तूफान", "icon": "⛈️"}
}

DEFAULT_LOCATION = {
    "name": "Kangra, Himachal Pradesh",
    "latitude": 32.09135,
    "longitude": 76.26267
}

@router.get("")
async def get_live_weather(
    location: Optional[str] = Query(None, description="City or district name (e.g. Agra, Kangra, Karnal)"),
    lat: Optional[float] = Query(None, description="Optional latitude"),
    lon: Optional[float] = Query(None, description="Optional longitude")
):
    resolved_name = DEFAULT_LOCATION["name"]
    target_lat = DEFAULT_LOCATION["latitude"]
    target_lon = DEFAULT_LOCATION["longitude"]

    async with httpx.AsyncClient(timeout=6.0) as client:
        # If coordinates provided directly
        if lat is not None and lon is not None:
            target_lat = lat
            target_lon = lon
            resolved_name = location or f"GPS ({round(lat, 2)}, {round(lon, 2)})"
        elif location and location.strip():
            clean_query = location.strip().split(",")[0].strip()
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={clean_query}&count=1"
            try:
                geo_res = await client.get(geo_url)
                if geo_res.status_code == 200:
                    geo_data = geo_res.json()
                    match = geo_data.get("results", [None])[0]
                    if match:
                        target_lat = match.get("latitude", target_lat)
                        target_lon = match.get("longitude", target_lon)
                        admin1 = match.get("admin1", "")
                        country = match.get("country", "")
                        resolved_name = f"{match.get('name', clean_query)}{', ' + admin1 if admin1 else ''}{', ' + country if country else ''}"
            except Exception as e:
                print(f"[Weather Geocoding Notice] {e}")

        # Fetch Open-Meteo Forecast
        forecast_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={target_lat}&longitude={target_lon}"
            f"&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
            f"&hourly=precipitation_probability&forecast_days=1"
        )

        try:
            w_res = await client.get(forecast_url)
            if w_res.status_code == 200:
                w_data = w_res.json()
                current = w_data.get("current", {})
                code = int(current.get("weather_code", 0))
                cond = WMO_WEATHER_MAP.get(code, {"en": "Clear sky", "hi": "साफ आसमान", "icon": "🌤️"})

                hourly_rain = w_data.get("hourly", {}).get("precipitation_probability", [])
                rain_prob = round(max(hourly_rain[:12]) if hourly_rain else 15)

                temp = round(current.get("temperature_2m", 26.0), 1)
                humidity = round(current.get("relative_humidity_2m", 55))
                wind = round(current.get("wind_speed_10m", 8.0), 1)

                # Agricultural guidance calculation
                spray_favorable = wind < 15 and rain_prob < 40 and humidity < 85
                blight_risk = humidity > 80 and 12 <= temp <= 24

                return {
                    "success": True,
                    "provider": "Open-Meteo Satellite Feed",
                    "location": resolved_name,
                    "coordinates": {"latitude": target_lat, "longitude": target_lon},
                    "data": {
                        "temperature": temp,
                        "humidity": humidity,
                        "windSpeed": wind,
                        "rainProbability": rain_prob,
                        "weatherCode": code,
                        "summary": cond["en"],
                        "summaryHindi": cond["hi"],
                        "icon": cond["icon"],
                        "sprayFavorable": spray_favorable,
                        "blightRisk": blight_risk,
                        "sprayAdvice": "Favorable for pesticide/fungicide spray" if spray_favorable else "Postpone spray due to wind/rain risk",
                        "sprayAdviceHindi": "कीटनाशक/फफूंदनाशी छिड़काव के लिए अनुकूल समय" if spray_favorable else "हवा/बारिश के खतरे के कारण छिड़काव टालें"
                    }
                }
        except Exception as e:
            print(f"[Weather Forecast Notice] {e}")

    # Fallback response
    return {
        "success": False,
        "location": resolved_name,
        "message": "Live weather feed currently unavailable. Please check your internet connection."
    }
