from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.database import Base
from app.models.schemas import FloodRiskLevel, UserRole, AlertStatus, SensorStatus

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    alerts = relationship("Alert", back_populates="created_by_user")

class Sensor(Base):
    __tablename__ = "sensors"
    
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    river_basin = Column(String, nullable=False)
    status = Column(Enum(SensorStatus), default=SensorStatus.ONLINE)
    battery_level = Column(Float)
    last_maintenance = Column(DateTime(timezone=True))
    installation_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    readings = relationship("SensorReading", back_populates="sensor")

class SensorReading(Base):
    __tablename__ = "sensor_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, ForeignKey("sensors.sensor_id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Environmental measurements
    water_level = Column(Float)  # meters
    flow_rate = Column(Float)    # m³/s
    rainfall = Column(Float)     # mm
    humidity = Column(Float)     # percentage
    temperature = Column(Float) # Celsius
    soil_moisture = Column(Float) # percentage
    
    # Relationships
    sensor = relationship("Sensor", back_populates="readings")

class WeatherData(Base):
    __tablename__ = "weather_data"
    
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Weather measurements
    temperature = Column(Float)          # Celsius
    humidity = Column(Float)             # percentage
    pressure = Column(Float)             # hPa
    wind_speed = Column(Float)           # km/h
    wind_direction = Column(Float)       # degrees
    rainfall_24h = Column(Float)         # mm
    rainfall_1h = Column(Float)          # mm
    cloud_cover = Column(Float)          # percentage
    visibility = Column(Float)           # km

class FloodRiskPrediction(Base):
    __tablename__ = "flood_risk_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    river_basin = Column(String, nullable=False)
    
    # Prediction results
    risk_level = Column(Enum(FloodRiskLevel), nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0-1
    prediction_timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    valid_until = Column(DateTime(timezone=True), nullable=False)
    
    # Input features
    water_level = Column(Float)
    rainfall_24h = Column(Float)
    rainfall_7d = Column(Float)
    soil_saturation = Column(Float)
    flow_rate = Column(Float)
    
    # Model information
    model_version = Column(String, nullable=False)
    model_type = Column(String, nullable=False)  # "random_forest" or "logistic_regression"
    feature_importance = Column(JSON)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(Enum(FloodRiskLevel), nullable=False)
    status = Column(Enum(AlertStatus), default=AlertStatus.ACTIVE)
    
    # Geographic information
    affected_areas = Column(JSON)  # List of strings
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Float, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True))
    
    # Notification tracking
    sent_via = Column(JSON)  # List of strings: ["email", "sms", "push"]
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    created_by_user = relationship("User", back_populates="alerts")

class DataIngestionLog(Base):
    __tablename__ = "data_ingestion_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)  # "weather_api", "sensor", "manual"
    source_type = Column(String, nullable=False)  # "openweather", "nasa_power", "iot_sensor"
    records_processed = Column(Integer, nullable=False)
    records_failed = Column(Integer, default=0)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True))
    status = Column(String, default="running")  # "running", "completed", "failed"
    error_message = Column(Text)
    
class MLModelMetrics(Base):
    __tablename__ = "ml_model_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    model_type = Column(String, nullable=False)  # "random_forest", "logistic_regression"
    model_version = Column(String, nullable=False)
    training_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Performance metrics
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    roc_auc = Column(Float)
    
    # Training data info
    training_samples = Column(Integer)
    feature_count = Column(Integer)
    cross_validation_score = Column(Float)
    
    # Model parameters
    hyperparameters = Column(JSON)
    feature_importance = Column(JSON)
