"""
Rwanda Resilience Hub - Simple Backend Server
Minimal FastAPI server without complex dependencies
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime
import json

app = FastAPI(
    title="Rwanda Resilience Hub API",
    description="Flood Risk Monitoring Platform for Rwanda",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for demonstration
MOCK_DASHBOARD_DATA = {
    "metrics": {
        "total_sensors": 25,
        "active_sensors": 22,
        "high_risk_areas": 3,
        "medium_risk_areas": 5,
        "low_risk_areas": 17,
        "active_alerts": 4,
        "last_update": datetime.now().isoformat()
    },
    "river_basins": [
        {
            "name": "Nyabarongo",
            "current_risk_level": "medium",
            "average_water_level": 3.2,
            "rainfall_24h": 72.0,
            "sensor_count": 8,
            "last_update": datetime.now().isoformat()
        },
        {
            "name": "Sebeya",
            "current_risk_level": "high",
            "average_water_level": 3.9,
            "rainfall_24h": 89.0,
            "sensor_count": 5,
            "last_update": datetime.now().isoformat()
        }
    ],
    "recent_alerts": [
        {
            "id": 1,
            "title": "High Flood Risk - Sebeya River Basin",
            "message": "Elevated water levels detected in Ruhengeri area.",
            "severity": "high",
            "affected_areas": ["Ruhengeri", "Musanze"],
            "latitude": -1.5097,
            "longitude": 29.6324,
            "radius_km": 15.0,
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "expires_at": datetime.now().isoformat()
        }
    ],
    "high_risk_locations": [
        {
            "id": 1,
            "name": "Kigali City - Nyabugogo",
            "latitude": -1.9536,
            "longitude": 30.0605,
            "risk_level": "high",
            "confidence": 0.92,
            "water_level": 4.1,
            "rainfall_24h": 95.0,
            "population_at_risk": 125000,
            "last_update": datetime.now().isoformat()
        }
    ]
}

@app.get("/")
async def root():
    return {"message": "Rwanda Resilience Hub API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/v1/dashboard")
async def get_dashboard():
    return JSONResponse(MOCK_DASHBOARD_DATA)

@app.get("/api/v1/dashboard/map-data")
async def get_map_data(risk_level: str = "all", river_basin: str = "all"):
    return JSONResponse({
        "high_risk_locations": MOCK_DASHBOARD_DATA["high_risk_locations"],
        "sensor_locations": [
            {"id": "NYB_001", "lat": -1.9536, "lon": 30.0605, "status": "online", "basin": "Nyabarongo"},
            {"id": "SEB_001", "lat": -1.5097, "lon": 29.6324, "status": "online", "basin": "Sebeya"}
        ],
        "risk_zones": MOCK_DASHBOARD_DATA["high_risk_locations"]
    })

if __name__ == "__main__":
    print("🚀 Starting Rwanda Resilience Hub Backend API...")
    print("📍 API will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🗺️ Interactive Docs: http://localhost:8000/redoc")
    print("-" * 50)
    
    uvicorn.run(
        "main-simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
