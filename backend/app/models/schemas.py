from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class FloodRiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class UserRole(str, Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"
    EMERGENCY_MANAGER = "emergency_manager"

class AlertStatus(str, Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"
    FALSE_ALARM = "false_alarm"

class SensorStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    ERROR = "error"

# User schemas
class UserBase(BaseModel):
    email: str
    full_name: str = ""
    institution: str = ""
    role: UserRole = UserRole.VIEWER
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    institution: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    user_id: Optional[str] = None
    permissions: List[str] = []

# Sensor data schemas
class SensorReadingBase(BaseModel):
    sensor_id: str
    latitude: float
    longitude: float
    river_basin: str
    timestamp: datetime
    
    @validator('latitude')
    def validate_latitude(cls, v):
        if not -2.8426 <= v <= 1.0642:  # Rwanda bounds
            raise ValueError('Latitude must be within Rwanda bounds')
        return v
    
    @validator('longitude')
    def validate_longitude(cls, v):
        if not 28.8570 <= v <= 30.9059:  # Rwanda bounds
            raise ValueError('Longitude must be within Rwanda bounds')
        return v

class SensorReadingCreate(SensorReadingBase):
    water_level: float = Field(..., ge=0, description="Water level in meters")
    flow_rate: Optional[float] = Field(None, ge=0, description="Flow rate in m³/s")
    rainfall: float = Field(..., ge=0, description="Rainfall in mm")
    humidity: Optional[float] = Field(None, ge=0, le=100, description="Humidity percentage")
    temperature: Optional[float] = Field(None, description="Temperature in Celsius")
    soil_moisture: Optional[float] = Field(None, ge=0, le=100, description="Soil moisture percentage")

class SensorReading(SensorReadingCreate):
    id: int
    status: SensorStatus = SensorStatus.ONLINE
    battery_level: Optional[float] = None
    last_maintenance: Optional[datetime] = None

    class Config:
        from_attributes = True

# Weather data schemas
class WeatherData(BaseModel):
    location: str
    latitude: float
    longitude: float
    timestamp: datetime
    temperature: float
    humidity: float
    pressure: float
    wind_speed: float
    wind_direction: float
    rainfall_24h: float
    rainfall_1h: float
    cloud_cover: float
    visibility: float

# Flood risk prediction schemas
class FloodRiskPrediction(BaseModel):
    location: str
    latitude: float
    longitude: float
    river_basin: str
    risk_level: FloodRiskLevel
    confidence_score: float = Field(..., ge=0, le=1)
    prediction_timestamp: datetime
    valid_until: datetime
    
    # Contributing factors
    water_level: Optional[float] = None
    rainfall_24h: Optional[float] = None
    rainfall_7d: Optional[float] = None
    soil_saturation: Optional[float] = None
    flow_rate: Optional[float] = None
    
    # Model information
    model_version: str
    model_type: str  # "random_forest" or "logistic_regression"
    feature_importance: Optional[Dict[str, float]] = None

class FloodRiskRequest(BaseModel):
    latitude: float
    longitude: float
    include_historical: bool = False
    prediction_hours: int = Field(default=24, ge=1, le=168)

class FloodRiskResponse(BaseModel):
    current_risk: FloodRiskPrediction
    historical_risks: Optional[List[FloodRiskPrediction]] = None
    forecast_risks: Optional[List[FloodRiskPrediction]] = None
    recommendations: List[str]

# Alert schemas
class AlertBase(BaseModel):
    title: str
    message: str
    severity: FloodRiskLevel
    affected_areas: List[str]
    latitude: float
    longitude: float
    radius_km: float = Field(..., gt=0)

class AlertCreate(AlertBase):
    expires_at: Optional[datetime] = None

class Alert(AlertBase):
    id: int
    status: AlertStatus = AlertStatus.ACTIVE
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime] = None
    sent_via: List[str] = []  # ["email", "sms", "push"]

    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardMetrics(BaseModel):
    total_sensors: int
    active_sensors: int
    high_risk_areas: int
    medium_risk_areas: int
    low_risk_areas: int
    active_alerts: int
    last_update: datetime

class RiverBasinStatus(BaseModel):
    name: str
    current_risk_level: FloodRiskLevel
    average_water_level: float
    rainfall_24h: float
    sensor_count: int
    last_update: datetime

class DashboardData(BaseModel):
    metrics: DashboardMetrics
    river_basins: List[RiverBasinStatus]
    recent_alerts: List[Alert]
    high_risk_locations: List[Dict[str, Any]]
