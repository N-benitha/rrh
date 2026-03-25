from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timedelta
import random

from app.models.schemas import SensorReading, SensorReadingCreate, SensorStatus
from app.models.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_all_sensors(
    river_basin: Optional[str] = None,
    status: Optional[SensorStatus] = None,
    db: Session = Depends(get_db)
):
    """Get all sensor data with optional filtering"""
    try:
        # Mock sensor data for Rwanda
        sensors = [
            {
                "id": "NYB_001",
                "name": "Nyabarongo River - Kigali",
                "latitude": -1.9536,
                "longitude": 30.0605,
                "river_basin": "Nyabarongo",
                "status": "online",
                "battery_level": 87.5,
                "last_reading": {
                    "water_level": 3.2,
                    "rainfall": 45.0,
                    "temperature": 22.5,
                    "humidity": 78.0,
                    "timestamp": datetime.now() - timedelta(minutes=15)
                }
            },
            {
                "id": "SEB_001", 
                "name": "Sebeya River - Ruhengeri",
                "latitude": -1.5097,
                "longitude": 29.6324,
                "river_basin": "Sebeya",
                "status": "online",
                "battery_level": 92.1,
                "last_reading": {
                    "water_level": 3.8,
                    "rainfall": 67.0,
                    "temperature": 20.8,
                    "humidity": 82.0,
                    "timestamp": datetime.now() - timedelta(minutes=8)
                }
            },
            {
                "id": "AKA_001",
                "name": "Akanyaru River - Nyanza",
                "latitude": -2.3514,
                "longitude": 29.6598,
                "river_basin": "Akanyaru",
                "status": "maintenance",
                "battery_level": 45.3,
                "last_reading": {
                    "water_level": 2.1,
                    "rainfall": 23.0,
                    "temperature": 23.1,
                    "humidity": 75.0,
                    "timestamp": datetime.now() - timedelta(hours=2)
                }
            },
            {
                "id": "MWG_001",
                "name": "Mwogo River - Gitarama",
                "latitude": -2.0786,
                "longitude": 29.8325,
                "river_basin": "Mwogo",
                "status": "online",
                "battery_level": 78.9,
                "last_reading": {
                    "water_level": 2.8,
                    "rainfall": 52.0,
                    "temperature": 21.9,
                    "humidity": 80.0,
                    "timestamp": datetime.now() - timedelta(minutes=22)
                }
            },
            {
                "id": "KAG_001",
                "name": "Kagera River - Rusumo",
                "latitude": -2.3844,
                "longitude": 30.4831,
                "river_basin": "Kagera",
                "status": "online",
                "battery_level": 95.2,
                "last_reading": {
                    "water_level": 2.5,
                    "rainfall": 38.0,
                    "temperature": 24.2,
                    "humidity": 73.0,
                    "timestamp": datetime.now() - timedelta(minutes=5)
                }
            }
        ]
        
        # Apply filters
        if river_basin:
            sensors = [s for s in sensors if s["river_basin"] == river_basin]
        
        if status:
            sensors = [s for s in sensors if s["status"] == status.value]
        
        return sensors
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve sensors: {str(e)}")

@router.get("/{sensor_id}/readings", response_model=List[dict])
async def get_sensor_readings(
    sensor_id: str,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """Get historical readings for a specific sensor"""
    try:
        # Generate mock historical readings
        readings = []
        base_time = datetime.now() - timedelta(hours=hours)
        
        for i in range(hours):
            timestamp = base_time + timedelta(hours=i)
            
            # Simulate realistic sensor data patterns
            base_water_level = 2.5 + random.uniform(-0.5, 1.5)
            rainfall = max(0, 30 + random.uniform(-20, 40) + (i % 6) * 5)
            temperature = 22 + random.uniform(-3, 4)
            humidity = 75 + random.uniform(-10, 15)
            
            readings.append({
                "timestamp": timestamp,
                "water_level": round(base_water_level, 2),
                "flow_rate": round(base_water_level * 45 + random.uniform(-10, 10), 2),
                "rainfall": round(rainfall, 1),
                "temperature": round(temperature, 1),
                "humidity": round(humidity, 1),
                "soil_moisture": round(70 + random.uniform(-15, 20), 1)
            })
        
        return readings
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve sensor readings: {str(e)}")

@router.post("/{sensor_id}/readings", response_model=dict)
async def add_sensor_reading(
    sensor_id: str,
    reading: SensorReadingCreate,
    db: Session = Depends(get_db)
):
    """Add a new sensor reading"""
    try:
        # Validate sensor exists (mock validation)
        valid_sensors = ["NYB_001", "SEB_001", "AKA_001", "MWG_001", "KAG_001"]
        if sensor_id not in valid_sensors:
            raise HTTPException(status_code=404, detail="Sensor not found")
        
        # Mock saving to database
        saved_reading = {
            "id": random.randint(1000, 9999),
            "sensor_id": sensor_id,
            "timestamp": reading.timestamp,
            "water_level": reading.water_level,
            "flow_rate": reading.flow_rate,
            "rainfall": reading.rainfall,
            "temperature": reading.temperature,
            "humidity": reading.humidity,
            "soil_moisture": reading.soil_moisture,
            "status": SensorStatus.ONLINE,
            "created_at": datetime.now()
        }
        
        return {
            "message": "Sensor reading added successfully",
            "reading": saved_reading
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add sensor reading: {str(e)}")

@router.get("/{sensor_id}/status")
async def get_sensor_status(sensor_id: str, db: Session = Depends(get_db)):
    """Get current status of a specific sensor"""
    try:
        # Mock sensor status data
        sensor_statuses = {
            "NYB_001": {
                "sensor_id": "NYB_001",
                "status": "online",
                "battery_level": 87.5,
                "last_maintenance": datetime.now() - timedelta(days=45),
                "uptime_percentage": 99.2,
                "data_quality_score": 0.94,
                "alerts_count": 0
            },
            "SEB_001": {
                "sensor_id": "SEB_001",
                "status": "online",
                "battery_level": 92.1,
                "last_maintenance": datetime.now() - timedelta(days=12),
                "uptime_percentage": 98.7,
                "data_quality_score": 0.96,
                "alerts_count": 1
            },
            "AKA_001": {
                "sensor_id": "AKA_001",
                "status": "maintenance",
                "battery_level": 45.3,
                "last_maintenance": datetime.now() - timedelta(days=60),
                "uptime_percentage": 85.3,
                "data_quality_score": 0.78,
                "alerts_count": 3
            }
        }
        
        if sensor_id not in sensor_statuses:
            raise HTTPException(status_code=404, detail="Sensor not found")
        
        return sensor_statuses[sensor_id]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sensor status: {str(e)}")

@router.post("/simulate-data")
async def simulate_sensor_data(
    duration_minutes: int = 60,
    interval_seconds: int = 30,
    db: Session = Depends(get_db)
):
    """Simulate real-time sensor data for testing"""
    try:
        simulation_config = {
            "duration_minutes": duration_minutes,
            "interval_seconds": interval_seconds,
            "sensors_to_simulate": ["NYB_001", "SEB_001", "MWG_001", "KAG_001"],
            "start_time": datetime.now(),
            "estimated_readings": (duration_minutes * 60) // interval_seconds,
            "status": "started"
        }
        
        return {
            "message": "Sensor data simulation started",
            "config": simulation_config
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start simulation: {str(e)}")

@router.get("/statistics/summary")
async def get_sensor_statistics(db: Session = Depends(get_db)):
    """Get summary statistics for all sensors"""
    try:
        stats = {
            "total_sensors": 25,
            "online_sensors": 22,
            "offline_sensors": 1,
            "maintenance_sensors": 2,
            "average_battery_level": 81.3,
            "data_quality_score": 0.91,
            "readings_last_24h": 3240,
            "alerts_last_24h": 8,
            "river_basin_distribution": {
                "Nyabarongo": 8,
                "Sebeya": 5,
                "Akanyaru": 4,
                "Mwogo": 4,
                "Kagera": 4
            },
            "last_update": datetime.now()
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sensor statistics: {str(e)}")
