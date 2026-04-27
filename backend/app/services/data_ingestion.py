import asyncio
import aiohttp
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd
import logging

from app.core.config import settings
from app.models.schemas import WeatherData, SensorReadingCreate, SensorStatus
from app.models.database import get_db
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class WeatherAPIService:
    """Service for fetching weather data from external APIs"""
    
    def __init__(self):
        self.openweather_api_key = settings.OPENWEATHER_API_KEY
        self.nasa_power_url = settings.NASA_POWER_API_URL
        self.rwanda_bounds = settings.RWANDA_BOUNDS
        
    async def fetch_openweather_data(self, location: Dict[str, float]) -> Optional[WeatherData]:
        """Fetch weather data from OpenWeatherMap API"""
        if not self.openweather_api_key:
            logger.warning("OpenWeather API key not configured, using mock data")
            return self._mock_weather_data(location)
        
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather"
            params = {
                "lat": location["latitude"],
                "lon": location["longitude"],
                "appid": self.openweather_api_key,
                "units": "metric"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_openweather_data(data, location)
                    else:
                        logger.error(f"OpenWeather API error: {response.status}")
                        return self._mock_weather_data(location)
                        
        except Exception as e:
            logger.error(f"Error fetching OpenWeather data: {str(e)}")
            return self._mock_weather_data(location)
    
    def _parse_openweather_data(self, data: dict, location: dict) -> WeatherData:
        """Parse OpenWeatherMap API response"""
        return WeatherData(
            location=f"{location.get('name', 'Unknown')}",
            latitude=location["latitude"],
            longitude=location["longitude"],
            timestamp=datetime.now(),
            temperature=data["main"]["temp"],
            humidity=data["main"]["humidity"],
            pressure=data["main"]["pressure"],
            wind_speed=data["wind"]["speed"],
            wind_direction=data["wind"].get("deg", 0),
            rainfall_24h=data.get("rain", {}).get("24h", 0),
            rainfall_1h=data.get("rain", {}).get("1h", 0),
            cloud_cover=data["clouds"]["all"],
            visibility=data.get("visibility", 10000) / 1000  # Convert to km
        )
    
    def _mock_weather_data(self, location: dict) -> WeatherData:
        """Generate mock weather data for testing"""
        # Simulate realistic weather patterns for Rwanda
        base_temp = 22 + random.uniform(-4, 5)
        humidity = 75 + random.uniform(-15, 20)
        
        return WeatherData(
            location=location.get("name", f"Lat {location['latitude']:.2f}, Lon {location['longitude']:.2f}"),
            latitude=location["latitude"],
            longitude=location["longitude"],
            timestamp=datetime.now(),
            temperature=base_temp,
            humidity=humidity,
            pressure=1013 + random.uniform(-10, 10),
            wind_speed=random.uniform(5, 20),
            wind_direction=random.uniform(0, 360),
            rainfall_24h=max(0, random.uniform(0, 120)),
            rainfall_1h=max(0, random.uniform(0, 25)),
            cloud_cover=random.uniform(20, 90),
            visibility=random.uniform(8, 15)
        )

class SensorSimulationService:
    """Service for simulating IoT sensor data"""
    
    def __init__(self):
        self.rwanda_basins = settings.RIVER_BASINS
        self.sensor_locations = self._initialize_sensor_locations()
        
    def _initialize_sensor_locations(self) -> List[Dict]:
        """Initialize sensor locations for Rwanda river basins"""
        return [
            # Nyabarongo River sensors
            {"sensor_id": "NYB_001", "name": "Nyabarongo - Kigali", "latitude": -1.9536, "longitude": 30.0605, "river_basin": "Nyabarongo"},
            {"sensor_id": "NYB_002", "name": "Nyabarongo - Muyumbu", "latitude": -2.0789, "longitude": 30.1342, "river_basin": "Nyabarongo"},
            {"sensor_id": "NYB_003", "name": "Nyabarongo - Kayonza", "latitude": -1.9531, "longitude": 30.3178, "river_basin": "Nyabarongo"},
            
            # Sebeya River sensors
            {"sensor_id": "SEB_001", "name": "Sebeya - Ruhengeri", "latitude": -1.5097, "longitude": 29.6324, "river_basin": "Sebeya"},
            {"sensor_id": "SEB_002", "name": "Sebeya - Gisenyi", "latitude": -1.6849, "longitude": 29.2586, "river_basin": "Sebeya"},
            
            # Akanyaru River sensors
            {"sensor_id": "AKA_001", "name": "Akanyaru - Nyanza", "latitude": -2.3514, "longitude": 29.6598, "river_basin": "Akanyaru"},
            {"sensor_id": "AKA_002", "name": "Akanyaru - Butare", "latitude": -2.5997, "longitude": 29.7394, "river_basin": "Akanyaru"},
            
            # Mwogo River sensors
            {"sensor_id": "MWG_001", "name": "Mwogo - Gitarama", "latitude": -2.0786, "longitude": 29.8325, "river_basin": "Mwogo"},
            {"sensor_id": "MWG_002", "name": "Mwogo - Ruhango", "latitude": -2.1597, "longitude": 29.7589, "river_basin": "Mwogo"},
            
            # Kagera River sensors
            {"sensor_id": "KAG_001", "name": "Kagera - Rusumo", "latitude": -2.3844, "longitude": 30.4831, "river_basin": "Kagera"},
            {"sensor_id": "KAG_002", "name": "Kagera - Kibungo", "latitude": -2.1786, "longitude": 30.5387, "river_basin": "Kagera"}
        ]
    
    def generate_sensor_reading(self, sensor_location: dict, weather_data: Optional[WeatherData] = None) -> SensorReadingCreate:
        """Generate realistic sensor reading based on location and weather"""
        # Base values with seasonal variations
        base_water_level = 2.0 + random.uniform(-0.5, 1.5)
        base_flow_rate = base_water_level * 45 + random.uniform(-15, 15)
        
        # Adjust based on weather if available
        if weather_data:
            rainfall_factor = weather_data.rainfall_24h / 50  # Normalize rainfall
            base_water_level += rainfall_factor * 0.8
            base_flow_rate += rainfall_factor * 20
        
        # Add sensor noise and occasional anomalies
        if random.random() < 0.05:  # 5% chance of anomaly
            base_water_level += random.uniform(-0.3, 0.3)
            base_flow_rate += random.uniform(-10, 10)
        
        return SensorReadingCreate(
            sensor_id=sensor_location["sensor_id"],
            latitude=sensor_location["latitude"],
            longitude=sensor_location["longitude"],
            river_basin=sensor_location["river_basin"],
            timestamp=datetime.now(),
            water_level=round(max(0, base_water_level), 2),
            flow_rate=round(max(0, base_flow_rate), 2),
            rainfall=weather_data.rainfall_1h if weather_data else random.uniform(0, 15),
            humidity=weather_data.humidity if weather_data else random.uniform(60, 90),
            temperature=weather_data.temperature if weather_data else random.uniform(18, 28),
            soil_moisture=min(100, max(0, 70 + random.uniform(-20, 25) + (weather_data.rainfall_24h / 10) if weather_data else 0))
        )
    
    def get_sensor_status(self, sensor_id: str) -> SensorStatus:
        """Get current status of a sensor"""
        # Simulate sensor status with occasional maintenance
        if random.random() < 0.02:  # 2% chance of maintenance
            return SensorStatus.MAINTENANCE
        elif random.random() < 0.01:  # 1% chance of error
            return SensorStatus.ERROR
        else:
            return SensorStatus.ONLINE

class DataIngestionService:
    """Main service for coordinating data ingestion from various sources"""
    
    def __init__(self):
        self.weather_service = WeatherAPIService()
        self.sensor_service = SensorSimulationService()
        self.ingestion_interval = settings.SENSOR_UPDATE_INTERVAL_SECONDS
        
    async def start_ingestion(self):
        """Start the continuous data ingestion process"""
        logger.info("Starting data ingestion service...")
        
        while True:
            try:
                await self._ingest_cycle()
                await asyncio.sleep(self.ingestion_interval)
            except Exception as e:
                logger.error(f"Error in ingestion cycle: {str(e)}")
                await asyncio.sleep(10)  # Wait before retrying
    
    async def _ingest_cycle(self):
        """Single ingestion cycle"""
        tasks = []
        
        # Generate sensor readings for all locations
        for sensor_location in self.sensor_service.sensor_locations:
            task = self._process_sensor_location(sensor_location)
            tasks.append(task)
        
        # Run all tasks concurrently
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _process_sensor_location(self, sensor_location: dict):
        """Process a single sensor location"""
        try:
            # Get weather data for this location
            weather_data = await self.weather_service.fetch_openweather_data(sensor_location)
            
            # Generate sensor reading
            sensor_reading = self.sensor_service.generate_sensor_reading(sensor_location, weather_data)
            
            # Store sensor reading (in production, save to database)
            await self._store_sensor_reading(sensor_reading)
            
            # Store weather data
            if weather_data:
                await self._store_weather_data(weather_data)
            
            logger.debug(f"Processed data for sensor {sensor_location['sensor_id']}")
            
        except Exception as e:
            logger.error(f"Error processing sensor {sensor_location['sensor_id']}: {str(e)}")
    
    async def _store_sensor_reading(self, reading: SensorReadingCreate):
        """Store sensor reading (mock implementation)"""
        # In production, this would save to database
        logger.info(f"Stored sensor reading: {reading.sensor_id} - Water Level: {reading.water_level}m")
    
    async def _store_weather_data(self, weather: WeatherData):
        """Store weather data (mock implementation)"""
        # In production, this would save to database
        logger.info(f"Stored weather data for {weather.location} - Temp: {weather.temperature}°C, Rain: {weather.rainfall_24h}mm")
    
    async def get_ingestion_status(self) -> Dict:
        """Get current ingestion service status"""
        return {
            "status": "running",
            "last_cycle": datetime.now().isoformat(),
            "sensors_processed": len(self.sensor_service.sensor_locations),
            "ingestion_interval_seconds": self.ingestion_interval,
            "total_cycles": 0,  # Would be tracked in production
            "errors_last_hour": 0
        }

# Global ingestion service instance
ingestion_service = DataIngestionService()

# Background task runner
async def run_ingestion_service():
    """Run the ingestion service in the background"""
    await ingestion_service.start_ingestion()
