from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.prediction import Prediction
from app.models.region import Region
from app.models.sensor_reading import SensorReading
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
