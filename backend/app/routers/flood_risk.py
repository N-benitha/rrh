from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Any
from datetime import datetime, timedelta
import pandas as pd
import httpx

from app.models.schemas import (
    FloodRiskRequest, FloodRiskResponse, FloodRiskPrediction,
    RiverBasinStatus, DashboardMetrics
)
from app.ml.models import model_manager
from app.models.database import get_db
from app.core.config import settings
from sqlalchemy.orm import Session

router = APIRouter()

# ── Sebeya River sensor station definitions ───────────────────────────────
_SEBEYA_STATIONS = [
    {
        "id": 1,
        "name": "SEBY-DS-03 — Kanama / Rubavu",
        "region": "Downstream · Rubavu District",
        "lat": -1.6849, "lng": 29.3892,
        "typical": {"water_level": 2.8, "rainfall_1h": 85.0, "soil_saturation": 88.0, "flow_rate": 210.0},
        "desc_tpl": "Water level {wl}m at SEBY-DS-03. {extra} Critical threshold: 2.5m. 131 fatalities from May 2023 event.",
    },
    {
        "id": 2,
        "name": "SEBY-MS-02 — Nyundo",
        "region": "Midstream · Rubavu District",
        "lat": -1.5554, "lng": 29.5375,
        "typical": {"water_level": 2.1, "rainfall_1h": 68.0, "soil_saturation": 76.0, "flow_rate": 155.0},
        "desc_tpl": "Water level {wl}m at SEBY-MS-02. Rainfall {rf}mm/h. {extra}",
    },
    {
        "id": 3,
        "name": "SEBY-US-01 — Rutsiro",
        "region": "Upstream · Rutsiro District",
        "lat": -1.3954, "lng": 29.4849,
        "typical": {"water_level": 1.4, "rainfall_1h": 52.0, "soil_saturation": 61.0, "flow_rate": 95.0},
        "desc_tpl": "Water level {wl}m at SEBY-US-01. Rainfall {rf}mm/h. {extra} Monitoring for downstream impact.",
    },
]

def _risk_level(water_level: float, rainfall_1h: float, score_pct: float) -> str:
    if water_level >= 2.5 or rainfall_1h >= 70 or score_pct >= 80:
        return "CRITICAL"
    if water_level >= 2.0 or rainfall_1h >= 50 or score_pct >= 60:
        return "HIGH"
    if water_level >= 1.5 or rainfall_1h >= 30 or score_pct >= 40:
        return "MODERATE"
    return "LOW"

def _trend(water_level: float, prev_level: float) -> str:
    if water_level > prev_level + 0.05:
        return "up"
    if water_level < prev_level - 0.05:
        return "dn"
    return "st"

@router.get("/zones")
async def get_zones() -> list[dict[str, Any]]:
    """Return live risk data for the 3 Sebeya River sensor stations."""
    results = []

    async with httpx.AsyncClient(timeout=8.0) as client:
        for i, station in enumerate(_SEBEYA_STATIONS):
            typ = station["typical"]
            water_level  = typ["water_level"]
            rainfall_1h  = typ["rainfall_1h"]
            humidity     = 75.0
            temperature  = 21.0

            # Try live OpenWeather data
            if settings.OPENWEATHER_API_KEY:
                try:
                    r = await client.get(
                        "https://api.openweathermap.org/data/2.5/weather",
                        params={"lat": station["lat"], "lon": station["lng"],
                                "appid": settings.OPENWEATHER_API_KEY, "units": "metric"},
                    )
                    if r.status_code == 200:
                        wd = r.json()
                        rain = wd.get("rain", {})
                        main = wd.get("main", {})
                        rainfall_1h = rain.get("1h", rain.get("3h", 0.0) / 3 if "3h" in rain else 0.0)
                        humidity    = float(main.get("humidity", humidity))
                        temperature = float(main.get("temp", temperature))
                except Exception:
                    pass

            features = {
                "water_level":     water_level,
                "rainfall_24h":    rainfall_1h * 24,
                "rainfall_7d":     rainfall_1h * 24 * 4.5,
                "soil_saturation": typ["soil_saturation"],
                "flow_rate":       typ["flow_rate"],
                "humidity":        humidity,
                "temperature":     temperature,
                "wind_speed":      8.0,
                "pressure":        1013.0,
            }

            pred       = model_manager.predict_flood_risk(features)
            score_pct  = round(pred["confidence_score"] * 100, 1)
            level      = _risk_level(water_level, rainfall_1h, score_pct)
            prev_level = water_level - 0.1  # simulate slight upward trend
            trend      = _trend(water_level, prev_level)

            extra_msgs = {
                "CRITICAL": "Evacuation of riverside communities required immediately.",
                "HIGH":     "Downstream communities should prepare to evacuate.",
                "MODERATE": "Monitor for rapid increase.",
                "LOW":      "No immediate flood risk.",
            }
            desc = station["desc_tpl"].format(
                wl=round(water_level, 1),
                rf=round(rainfall_1h, 0),
                extra=extra_msgs[level],
            )

            results.append({
                "id":       station["id"],
                "name":     station["name"],
                "region":   station["region"],
                "lat":      station["lat"],
                "lng":      station["lng"],
                "level":    level,
                "rainfall": f"{round(rainfall_1h, 0):.0f}mm/h",
                "river":    f"{round(water_level, 1)}m",
                "score":    int(score_pct),
                "trend":    trend,
                "updated":  f"{(i + 1) * 2}m ago",
                "desc":     desc,
            })

    return results

@router.post("/predict", response_model=FloodRiskResponse)
async def predict_flood_risk(
    request: FloodRiskRequest,
    db: Session = Depends(get_db)
):
    """Predict flood risk for a specific location"""
    try:
        # Get recent sensor data for the location (mock data for now)
        features = {
            'water_level': 2.8,
            'rainfall_24h': 65.0,
            'rainfall_7d': 120.0,
            'soil_saturation': 75.0,
            'flow_rate': 150.0,
            'humidity': 85.0,
            'temperature': 22.0,
            'wind_speed': 12.0,
            'pressure': 1013.25
        }
        
        # Get prediction from ML model
        prediction_result = model_manager.predict_flood_risk(features)
        
        # Create prediction object
        current_risk = FloodRiskPrediction(
            location=f"Lat {request.latitude:.4f}, Lon {request.longitude:.4f}",
            latitude=request.latitude,
            longitude=request.longitude,
            river_basin="Nyabarongo",  # Would be determined by geo lookup
            risk_level=prediction_result['risk_level'],
            confidence_score=prediction_result['confidence_score'],
            prediction_timestamp=datetime.now(),
            valid_until=datetime.now() + timedelta(hours=request.prediction_hours),
            water_level=features['water_level'],
            rainfall_24h=features['rainfall_24h'],
            rainfall_7d=features['rainfall_7d'],
            soil_saturation=features['soil_saturation'],
            flow_rate=features['flow_rate'],
            model_version=prediction_result['model_version'],
            model_type=prediction_result['model_type']
        )
        
        # Generate recommendations based on risk level
        recommendations = _generate_recommendations(prediction_result['risk_level'])
        
        return FloodRiskResponse(
            current_risk=current_risk,
            historical_risks=None,  # Would fetch from database
            forecast_risks=None,     # Would fetch from database
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/river-basins", response_model=List[RiverBasinStatus])
async def get_river_basin_status(db: Session = Depends(get_db)):
    """Get current status of all Rwanda river basins"""
    try:
        # Mock data for Rwanda's major river basins
        river_basins = [
            {
                "name": "Nyabarongo",
                "water_level": 3.2,
                "rainfall_24h": 72.0,
                "sensor_count": 15
            },
            {
                "name": "Akanyaru",
                "water_level": 2.1,
                "rainfall_24h": 45.0,
                "sensor_count": 8
            },
            {
                "name": "Mwogo",
                "water_level": 2.8,
                "rainfall_24h": 58.0,
                "sensor_count": 12
            },
            {
                "name": "Sebeya",
                "water_level": 3.9,
                "rainfall_24h": 89.0,
                "sensor_count": 10
            },
            {
                "name": "Kagera",
                "water_level": 2.5,
                "rainfall_24h": 52.0,
                "sensor_count": 18
            }
        ]
        
        basin_status = []
        for basin in river_basins:
            # Get risk prediction for each basin
            features = {
                'water_level': basin['water_level'],
                'rainfall_24h': basin['rainfall_24h'],
                'rainfall_7d': basin['rainfall_24h'] * 2.5,
                'soil_saturation': 70.0,
                'flow_rate': basin['water_level'] * 50,
                'humidity': 80.0,
                'temperature': 21.0,
                'wind_speed': 10.0,
                'pressure': 1012.0
            }
            
            prediction = model_manager.predict_flood_risk(features)
            
            basin_status.append(RiverBasinStatus(
                name=basin['name'],
                current_risk_level=prediction['risk_level'],
                average_water_level=basin['water_level'],
                rainfall_24h=basin['rainfall_24h'],
                sensor_count=basin['sensor_count'],
                last_update=datetime.now()
            ))
        
        return basin_status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get river basin status: {str(e)}")

@router.get("/high-risk-areas")
async def get_high_risk_areas(
    risk_level: Optional[str] = Query("high", description="Filter by risk level"),
    limit: int = Query(10, ge=1, le=100)
):
    """Get locations with high flood risk"""
    try:
        # Mock high-risk locations in Rwanda
        high_risk_locations = [
            {
                "location": "Kigali City - Nyabugogo",
                "latitude": -1.9536,
                "longitude": 30.0605,
                "risk_level": "high",
                "confidence": 0.92,
                "water_level": 4.1,
                "rainfall_24h": 95.0
            },
            {
                "location": "Ruhengeri - Sebeya Basin",
                "latitude": -1.5097,
                "longitude": 29.6324,
                "risk_level": "high",
                "confidence": 0.88,
                "water_level": 3.8,
                "rainfall_24h": 87.0
            },
            {
                "location": "Gisenyi - Lake Kivu",
                "latitude": -1.6849,
                "longitude": 29.2586,
                "risk_level": "medium",
                "confidence": 0.79,
                "water_level": 3.2,
                "rainfall_24h": 62.0
            }
        ]
        
        if risk_level:
            high_risk_locations = [
                loc for loc in high_risk_locations 
                if loc['risk_level'] == risk_level
            ]
        
        return high_risk_locations[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get high risk areas: {str(e)}")

@router.get("/historical-data")
async def get_historical_risk_data(
    latitude: float,
    longitude: float,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get historical flood risk data for a location"""
    try:
        # Mock historical data
        historical_data = []
        base_date = datetime.now() - timedelta(days=days)
        
        for i in range(days):
            date = base_date + timedelta(days=i)
            # Generate mock risk levels with some pattern
            day_of_year = date.timetuple().tm_yday
            # Higher risk during rainy seasons (Mar-May, Sep-Nov)
            if 60 <= day_of_year <= 150 or 240 <= day_of_year <= 330:
                risk_level = "high" if i % 7 < 3 else "medium"
            else:
                risk_level = "low" if i % 10 < 8 else "medium"
            
            historical_data.append({
                "date": date.date().isoformat(),
                "risk_level": risk_level,
                "water_level": 2.0 + (i % 5) * 0.3,
                "rainfall_24h": 20 + (i % 7) * 15,
                "confidence": 0.75 + (i % 4) * 0.05
            })
        
        return {"historical_data": historical_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get historical data: {str(e)}")

@router.get("/basin-predictions")
async def get_basin_predictions() -> dict[str, Any]:
    """Run ML flood risk predictions for all Rwanda basins.

    Fetches current weather from OpenWeather (if key is set) to use as real
    input features; otherwise falls back to basin-typical values. Each basin
    is scored by the trained Random Forest model.
    """
    # Sebeya River — 3 virtual IoT sensor stations (proposal: SEBY-US-01, SEBY-MS-02, SEBY-DS-03)
    BASINS = [
        {"name": "SEBY-DS-03 — Kanama/Rubavu", "zone": "Downstream · Rubavu District",
         "lat": -1.6849, "lon": 29.3892,
         "typical": {"water_level": 2.8, "rainfall_24h": 85.0, "soil_saturation": 88.0, "flow_rate": 210.0}},
        {"name": "SEBY-MS-02 — Nyundo",        "zone": "Midstream · Rubavu District",
         "lat": -1.5554, "lon": 29.5375,
         "typical": {"water_level": 2.1, "rainfall_24h": 68.0, "soil_saturation": 76.0, "flow_rate": 155.0}},
        {"name": "SEBY-US-01 — Rutsiro",       "zone": "Upstream · Rutsiro District",
         "lat": -1.3954, "lon": 29.4849,
         "typical": {"water_level": 1.4, "rainfall_24h": 52.0, "soil_saturation": 61.0, "flow_rate": 95.0}},
    ]

    results = []
    fetched_at = datetime.now()
    weather_source = "typical values"

    async with httpx.AsyncClient(timeout=10.0) as client:
        for basin in BASINS:
            features = {
                "water_level":     basin["typical"]["water_level"],
                "rainfall_24h":    basin["typical"]["rainfall_24h"],
                "rainfall_7d":     basin["typical"]["rainfall_24h"] * 4.5,
                "soil_saturation": basin["typical"]["soil_saturation"],
                "flow_rate":       basin["typical"]["flow_rate"],
                "humidity":        70.0,
                "temperature":     22.0,
                "wind_speed":      8.0,
                "pressure":        1013.0,
            }

            # Override with live OpenWeather data when available
            if settings.OPENWEATHER_API_KEY:
                try:
                    r = await client.get(
                        "https://api.openweathermap.org/data/2.5/weather",
                        params={"lat": basin["lat"], "lon": basin["lon"],
                                "appid": settings.OPENWEATHER_API_KEY, "units": "metric"},
                    )
                    if r.status_code == 200:
                        wd = r.json()
                        main = wd.get("main", {})
                        rain = wd.get("rain", {})
                        wind = wd.get("wind", {})
                        rainfall_1h = rain.get("1h", rain.get("3h", 0.0) / 3 if "3h" in rain else 0.0)
                        features.update({
                            "rainfall_24h":    rainfall_1h * 24,
                            "rainfall_7d":     rainfall_1h * 24 * 4.5,
                            "humidity":        float(main.get("humidity", 70)),
                            "temperature":     float(main.get("temp", 22)),
                            "wind_speed":      float(wind.get("speed", 8)),
                            "pressure":        float(main.get("pressure", 1013)),
                        })
                        weather_source = "OpenWeather Live"
                except Exception:
                    pass

            prediction = model_manager.predict_flood_risk(features)

            results.append({
                "basin":          basin["name"],
                "zone":           basin["zone"],
                "risk_level":     prediction["risk_level"],
                "confidence":     round(prediction["confidence_score"] * 100, 1),
                "model_type":     prediction["model_type"],
                "features": {
                    "rainfall_24h":    round(features["rainfall_24h"], 1),
                    "water_level":     round(features["water_level"], 2),
                    "humidity":        round(features["humidity"], 1),
                    "soil_saturation": round(features["soil_saturation"], 1),
                },
            })

    results.sort(
        key=lambda r: ["high", "medium", "low"].index(r["risk_level"])
    )

    return {
        "predictions": results,
        "weather_source": weather_source,
        "model_version": model_manager.models.get("random_forest", object).__dict__.get(
            "model_version", "v1.0"
        ),
        "fetched_at": fetched_at.isoformat(),
    }


def _generate_recommendations(risk_level: str) -> List[str]:
    """Generate recommendations based on flood risk level"""
    recommendations = {
        "low": [
            "Continue normal monitoring activities",
            "Maintain sensor equipment and communication systems",
            "Review emergency response plans with community leaders",
            "Monitor weather forecasts for any changes"
        ],
        "medium": [
            "Increase monitoring frequency to every 30 minutes",
            "Alert emergency response teams to be on standby",
            "Check drainage systems and clear any blockages",
            "Prepare evacuation routes and temporary shelters",
            "Issue early warning notifications to at-risk communities"
        ],
        "high": [
            "Activate emergency response protocols immediately",
            "Issue mandatory evacuation warnings for high-risk zones",
            "Deploy emergency response teams to affected areas",
            "Coordinate with MINEMA and local authorities",
            "Monitor river levels continuously and report changes",
            "Open emergency shelters and distribute relief supplies",
            "Implement traffic restrictions on flooded routes"
        ]
    }
    
    return recommendations.get(risk_level, recommendations["low"])
