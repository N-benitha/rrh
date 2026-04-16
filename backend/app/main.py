from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, regions

app = FastAPI(
    title=settings.APP_NAME,
    description="Flood risk prediction platform for Rwanda",
    version="0.1.0",
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(regions.router)


@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok", "service": settings.APP_NAME}
