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
        # Sebeya River — 3 virtual IoT sensor stations (Rubavu District, NW Rwanda)
        # Proposal sensors: SEBY-US-01 (Rutsiro), SEBY-MS-02 (Nyundo), SEBY-DS-03 (Kanama/Rubavu)
        # Critical thresholds: water_level > 2.5m at DS-03, rainfall > 70mm/h
        sensors = [
            {
                "id": "SEBY-DS-03",
                "name": "Sebeya Downstream — Kanama/Rubavu",
                "latitude": -1.6849,
                "longitude": 29.3892,
                "river_basin": "Sebeya",
                "position": "downstream",
                "status": "online",
                "battery_level": 91.4,
                "risk_level": "CRITICAL",
                "last_reading": {
                    "water_level": 2.8,
                    "rainfall": 85.0,
                    "temperature": 20.2,
                    "humidity": 92.0,
                    "timestamp": datetime.now() - timedelta(minutes=2)
                }
            },
            {
                "id": "SEBY-MS-02",
                "name": "Sebeya Midstream — Nyundo",
                "latitude": -1.5554,
                "longitude": 29.5375,
                "river_basin": "Sebeya",
                "position": "midstream",
                "status": "online",
                "battery_level": 87.3,
                "risk_level": "HIGH",
                "last_reading": {
                    "water_level": 2.1,
                    "rainfall": 68.0,
                    "temperature": 20.8,
                    "humidity": 85.0,
                    "timestamp": datetime.now() - timedelta(minutes=5)
                }
            },
            {
                "id": "SEBY-US-01",
                "name": "Sebeya Upstream — Rutsiro",
                "latitude": -1.3954,
                "longitude": 29.4849,
                "river_basin": "Sebeya",
                "position": "upstream",
                "status": "online",
                "battery_level": 94.8,
                "risk_level": "MODERATE",
                "last_reading": {
                    "water_level": 1.4,
                    "rainfall": 52.0,
                    "temperature": 21.5,
                    "humidity": 76.0,
                    "timestamp": datetime.now() - timedelta(minutes=8)
                }
            },
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
