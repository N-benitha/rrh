from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
from typing import List, Optional
from datetime import datetime, timedelta
import os

from app.models.database import engine, Base
from app.routers import auth, flood_risk, sensors, alerts, dashboard, weather, notifications
from app.core.config import settings
from app.core.security import verify_token

# Create database tables for both our models and the partner's models
Base.metadata.create_all(bind=engine)

# Also create the partner's tables (regions, sensor_readings, predictions, alerts)
# They use the same SQLite file via app.database.Base
try:
    from app.database import Base as PartnerBase, engine as partner_engine
    import app.models.region      # noqa: F401 — registers Region with PartnerBase
    import app.models.sensor_reading  # noqa: F401
    import app.models.prediction  # noqa: F401
    PartnerBase.metadata.create_all(bind=partner_engine)
except Exception:
    pass  # Partner models unavailable — continue without them

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Rwanda Resilience Hub API starting up...")
    yield
    # Shutdown
    print("Rwanda Resilience Hub API shutting down...")

app = FastAPI(
    title="Rwanda Resilience Hub API",
    description="Flood Risk Prediction and Monitoring Platform for Rwanda",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(flood_risk.router, prefix="/api/v1/flood-risk", tags=["flood-risk"])
app.include_router(sensors.router, prefix="/api/v1/sensors", tags=["sensors"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["alerts"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(weather.router, prefix="/api/v1/weather", tags=["weather"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])

security = HTTPBearer()

@app.get("/")
async def root():
    return {
        "message": "Rwanda Resilience Hub API",
        "version": "1.0.0",
        "status": "operational",
        "description": "Flood Risk Prediction and Monitoring Platform for Rwanda",
        "endpoints": {
            "auth": "/api/v1/auth",
            "flood-risk": "/api/v1/flood-risk",
            "sensors": "/api/v1/sensors",
            "alerts": "/api/v1/alerts",
            "dashboard": "/api/v1/dashboard",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "Rwanda Resilience Hub API",
        "version": "1.0.0"
    }

@app.get("/api/v1/protected")
async def protected_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = verify_token(credentials.credentials)
        return {"message": "Access granted", "user": payload}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
