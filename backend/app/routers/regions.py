from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.prediction import Prediction
from app.models.region import Region
from app.models.sensor_reading import DataSource, SensorReading
from app.models.user import Users
from app.schemas.prediction import PredictionResponse
from app.schemas.region import RegionDetailResponse, RegionResponse
from app.schemas.sensor_reading import SensorReadingResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/regions", tags=["regions"])


@router.get("", response_model=list[RegionResponse])
def list_regions(
    db: Session = Depends(get_db),
    _current_user: Users = Depends(get_current_user),
):
    regions = db.query(Region).all()
    result = []
    for region in regions:
        latest_pred = (
            db.query(Prediction)
            .filter(Prediction.region_id == region.id)
            .order_by(desc(Prediction.predicted_at))
            .first()
        )
        region_resp = RegionResponse.model_validate(region)
        if latest_pred:
            region_resp.latest_prediction = PredictionResponse.model_validate(
                latest_pred
            )
        result.append(region_resp)
    return result


@router.get("/{region_id}", response_model=RegionDetailResponse)
def get_region(
    region_id: UUID,
    db: Session = Depends(get_db),
    _current_user: Users = Depends(get_current_user),
):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Region not found"
        )

    recent_readings = (
        db.query(SensorReading)
        .filter(SensorReading.region_id == region_id)
        .order_by(desc(SensorReading.recorded_at))
        .limit(50)
        .all()
    )
    recent_predictions = (
        db.query(Prediction)
        .filter(Prediction.region_id == region_id)
        .order_by(desc(Prediction.predicted_at))
        .limit(20)
        .all()
    )

    latest_pred = recent_predictions[0] if recent_predictions else None

    resp = RegionDetailResponse.model_validate(region)
    resp.latest_prediction = (
        PredictionResponse.model_validate(latest_pred) if latest_pred else None
    )
    resp.recent_readings = [
        SensorReadingResponse.model_validate(r) for r in recent_readings
    ]
    resp.recent_predictions = [
        PredictionResponse.model_validate(p) for p in recent_predictions
    ]
    return resp


@router.get("/{region_id}/sensor-readings/latest", response_model=SensorReadingResponse)
def get_latest_sensor_reading(
    region_id: UUID,
    source: DataSource | None = Query(default=None, description="Filter by data source (e.g. iot_real, nasa_power)"),
    db: Session = Depends(get_db),
    _current_user: Users = Depends(get_current_user),
):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Region not found"
        )

    q = db.query(SensorReading).filter(SensorReading.region_id == region_id)
    if source is not None:
        q = q.filter(SensorReading.source == source)

    reading = q.order_by(desc(SensorReading.recorded_at)).first()
    if not reading:
        detail = (
            f"No sensor readings found for this region with source '{source.value}'"
            if source
            else "No sensor readings found for this region"
        )
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

    return SensorReadingResponse.model_validate(reading)


# Comment this out before deployment, not for production-scale querying.
@router.get("/{region_id}/sensor-readings", response_model=list[SensorReadingResponse])
def list_sensor_readings(
    region_id: UUID,
    source: DataSource | None = Query(default=None, description="Filter by data source (e.g. iot_real, nasa_power)"),
    limit: int = Query(default=50, ge=1, le=200),
    page: int = Query(default=1, ge=1),
    db: Session = Depends(get_db),
    _current_user: Users = Depends(get_current_user),
):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Region not found"
        )

    q = db.query(SensorReading).filter(SensorReading.region_id == region_id)
    if source is not None:
        q = q.filter(SensorReading.source == source)

    offset = (page - 1) * limit
    readings = q.order_by(desc(SensorReading.recorded_at)).offset(offset).limit(limit).all()
    return [SensorReadingResponse.model_validate(r) for r in readings]
