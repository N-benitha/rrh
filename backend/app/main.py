import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.ingestion.scheduler import start_scheduler
from app.ml.loader import load_models
from app.routers import auth, regions, ingestion, predict, users

logger  = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: launch background data ingestion
    logging.basicConfig(level=logging.INFO)
    logger.info("Starting data ingestion scheduler...")
    start_scheduler()
    load_models()
    yield
    # Shutdown: daemon threads die automatically
    logger.info("Shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
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
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(regions.router, prefix="/api/v1")
app.include_router(ingestion.router, prefix="/api/v1")
app.include_router(predict.router, prefix="/api/v1")

@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok", "service": settings.APP_NAME}
