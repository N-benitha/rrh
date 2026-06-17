from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

from app.models.schemas import DashboardData, DashboardMetrics, RiverBasinStatus, Alert
from app.models.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/", response_model=DashboardData)
async def get_dashboard_data(db: Session = Depends(get_db)):
    """Get comprehensive dashboard data"""
    try:
        # Get metrics
        metrics = await get_dashboard_metrics(db)
        
        # Get river basin statuses
        river_basins = await get_dashboard_river_basins(db)
        
        # Get recent alerts
        recent_alerts = await get_recent_alerts(db)
        
        # Get high-risk locations
        high_risk_locations = await get_high_risk_locations()
        
        return DashboardData(
            metrics=metrics,
            river_basins=river_basins,
            recent_alerts=recent_alerts,
            high_risk_locations=high_risk_locations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")

@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get dashboard metrics"""
    try:
        from app.models.push_notification import PushNotification
        active_alerts = db.query(PushNotification).count()

        metrics = DashboardMetrics(
            total_sensors=3,
            active_sensors=3,
            high_risk_areas=1,
            medium_risk_areas=1,
            low_risk_areas=1,
            active_alerts=active_alerts,
            last_update=datetime.now()
        )
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")

@router.get("/river-basins", response_model=List[RiverBasinStatus])
async def get_dashboard_river_basins(db: Session = Depends(get_db)):
    """Get river basin statuses for dashboard"""
    try:
        river_basins = [
            RiverBasinStatus(
                name="Sebeya",
                current_risk_level="high",
                average_water_level=3.9,
                rainfall_24h=89.0,
                sensor_count=3,
                last_update=datetime.now()
            ),
        ]
        return river_basins
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get river basins: {str(e)}")

@router.get("/recent-alerts", response_model=List[Alert])
async def get_recent_alerts(db: Session = Depends(get_db), limit: int = 10):
    """Get recent alerts for dashboard"""
    try:
        alerts = [
            Alert(
                id=1,
                title="High Flood Risk - Sebeya River Basin",
                message="Elevated water levels detected in Ruhengeri area. Immediate monitoring required.",
                severity="high",
                affected_areas=["Ruhengeri", "Musanze"],
                latitude=-1.5097,
                longitude=29.6324,
                radius_km=15.0,
                status="active",
                created_at=datetime.now() - timedelta(hours=2),
                updated_at=datetime.now() - timedelta(hours=1),
                expires_at=datetime.now() + timedelta(hours=6),
                sent_via=["email", "push"]
            ),
            Alert(
                id=2,
                title="Medium Risk - Nyabarongo River",
                message="Increased rainfall observed in Kigali region. Continue monitoring.",
                severity="medium",
                affected_areas=["Kigali", "Nyarugenge"],
                latitude=-1.9536,
                longitude=30.0605,
                radius_km=10.0,
                status="active",
                created_at=datetime.now() - timedelta(hours=4),
                updated_at=datetime.now() - timedelta(hours=2),
                expires_at=datetime.now() + timedelta(hours=4),
                sent_via=["email"]
            ),
            Alert(
                id=3,
                title="Sensor Maintenance - Akanyaru Basin",
                message="Sensor AKA_001 scheduled for maintenance. Temporary data gaps expected.",
                severity="low",
                affected_areas=["Nyanza"],
                latitude=-2.3514,
                longitude=29.6598,
                radius_km=5.0,
                status="active",
                created_at=datetime.now() - timedelta(hours=6),
                updated_at=datetime.now() - timedelta(hours=6),
                expires_at=datetime.now() + timedelta(hours=18),
                sent_via=["email"]
            )
        ]
        
        return alerts[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recent alerts: {str(e)}")

@router.get("/high-risk-locations")
async def get_high_risk_locations(limit: int = 10):
    """Get high-risk locations for dashboard map"""
    try:
        locations = [
            {
                "id": 1,
                "location": "Kigali City - Nyabugogo",
                "latitude": -1.9536,
                "longitude": 30.0605,
                "risk_level": "high",
                "confidence": 0.92,
                "water_level": 4.1,
                "rainfall_24h": 95.0,
                "population_at_risk": 125000,
                "last_update": datetime.now() - timedelta(minutes=15)
            },
            {
                "id": 2,
                "location": "Ruhengeri - Sebeya Basin",
                "latitude": -1.5097,
                "longitude": 29.6324,
                "risk_level": "high",
                "confidence": 0.88,
                "water_level": 3.8,
                "rainfall_24h": 87.0,
                "population_at_risk": 45000,
                "last_update": datetime.now() - timedelta(minutes=8)
            },
            {
                "id": 3,
                "location": "Gisenyi - Lake Kivu",
                "latitude": -1.6849,
                "longitude": 29.2586,
                "risk_level": "medium",
                "confidence": 0.79,
                "water_level": 3.2,
                "rainfall_24h": 62.0,
                "population_at_risk": 68000,
                "last_update": datetime.now() - timedelta(minutes=22)
            },
            {
                "id": 4,
                "location": "Gitarama - Mwogo River",
                "latitude": -2.0786,
                "longitude": 29.8325,
                "risk_level": "medium",
                "confidence": 0.81,
                "water_level": 2.9,
                "rainfall_24h": 58.0,
                "population_at_risk": 32000,
                "last_update": datetime.now() - timedelta(minutes=31)
            }
        ]
        
        return locations[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get high-risk locations: {str(e)}")

@router.get("/time-series-data")
async def get_time_series_data(
    metric: str = "water_level",
    hours: int = 24,
    location: str = "all"
):
    """Get time series data for dashboard charts"""
    try:
        # Generate stable time series data (seeded so values don't change per refresh)
        rng = random.Random(42)
        data_points = []
        base_time = datetime.now() - timedelta(hours=hours)

        for i in range(hours):
            timestamp = base_time + timedelta(hours=i)

            if metric == "water_level":
                value = 2.5 + rng.uniform(-0.8, 1.8)
            elif metric == "rainfall":
                value = max(0, 30 + rng.uniform(-25, 45))
            elif metric == "temperature":
                value = 22 + rng.uniform(-4, 5)
            elif metric == "risk_score":
                value = rng.uniform(0.2, 0.9)
            else:
                value = rng.uniform(0, 100)
            
            data_points.append({
                "timestamp": timestamp,
                "value": round(value, 2),
                "location": location
            })
        
        return {
            "metric": metric,
            "location": location,
            "data_points": data_points,
            "period_hours": hours
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get time series data: {str(e)}")

@router.get("/statistics/performance")
async def get_performance_statistics(db: Session = Depends(get_db)):
    """Get system performance statistics"""
    try:
        stats = {
            "prediction_accuracy": {
                "random_forest": 0.91,
                "logistic_regression": 0.87,
                "ensemble": 0.93
            },
            "data_quality": {
                "sensor_uptime": 98.7,
                "data_completeness": 95.2,
                "data_accuracy": 0.94
            },
            "alert_performance": {
                "true_positive_rate": 0.89,
                "false_positive_rate": 0.12,
                "average_response_time_minutes": 18
            },
            "system_health": {
                "api_response_time_ms": 145,
                "database_query_time_ms": 23,
                "memory_usage_percent": 67.3,
                "cpu_usage_percent": 42.1
            },
            "last_updated": datetime.now()
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance statistics: {str(e)}")

@router.get("/map-data")
async def get_map_data(
    risk_level: str = "all",
    river_basin: str = "all"
):
    """Get data for dashboard map visualization"""
    try:
        # Mock geo-referenced data points
        map_data = {
            "risk_zones": [
                {
                    "id": 1,
                    "name": "Kigali High Risk Zone",
                    "coordinates": [[-1.95, 30.05], [-1.94, 30.07], [-1.96, 30.07], [-1.96, 30.05]],
                    "risk_level": "high",
                    "population": 125000,
                    "critical_infrastructure": ["hospitals", "schools", "power_stations"]
                },
                {
                    "id": 2,
                    "name": "Sebeya River Basin",
                    "coordinates": [[-1.50, 29.63], [-1.49, 29.65], [-1.52, 29.65], [-1.52, 29.63]],
                    "risk_level": "high",
                    "population": 45000,
                    "critical_infrastructure": ["schools", "markets"]
                }
            ],
            "sensor_locations": [
                {"id": "NYB_001", "lat": -1.9536, "lon": 30.0605, "status": "online", "basin": "Nyabarongo"},
                {"id": "SEB_001", "lat": -1.5097, "lon": 29.6324, "status": "online", "basin": "Sebeya"},
                {"id": "MWG_001", "lat": -2.0786, "lon": 29.8325, "status": "online", "basin": "Mwogo"},
                {"id": "KAG_001", "lat": -2.3844, "lon": 30.4831, "status": "online", "basin": "Kagera"}
            ],
            "river_network": [
                {"name": "Nyabarongo", "coordinates": [[-2.0, 29.8], [-1.9, 30.0], [-1.8, 30.2]]},
                {"name": "Sebeya", "coordinates": [[-1.6, 29.5], [-1.5, 29.6], [-1.4, 29.8]]}
            ]
        }
        
        # Apply filters
        if risk_level != "all":
            map_data["risk_zones"] = [
                zone for zone in map_data["risk_zones"] 
                if zone["risk_level"] == risk_level
            ]
        
        if river_basin != "all":
            map_data["sensor_locations"] = [
                sensor for sensor in map_data["sensor_locations"]
                if sensor["basin"] == river_basin
            ]
        
        return map_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get map data: {str(e)}")
