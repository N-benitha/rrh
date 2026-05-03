import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.ingestion.scheduler import start_scheduler
from app.routers import auth, regions, ingestion

logger  = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: launch background data ingestion
    logging.basicConfig(level=logging.INFO)
    logger.info("Starting data ingestion scheduler...")
    start_scheduler()
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
app.include_router(auth.router)
app.include_router(regions.router)
app.include_router(ingestion.router)

@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok", "service": settings.APP_NAME}
