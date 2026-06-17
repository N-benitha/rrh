from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.prediction import Prediction
from app.models.user import User as Users
from app.schemas.prediction import PredictRequest, PredictResponse, PredictionResponse
from app.services.auth import get_current_user
from app.services import predict as predict_service

router = APIRouter(prefix="/predict", tags=["predict"])


@router.get("", response_model=list[PredictionResponse])
def list_predictions(
    region_id: UUID | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    db: Session = Depends(get_db),
    _current_user: Users = Depends(get_current_user),
):
    q = db.query(Prediction).order_by(desc(Prediction.predicted_at))
    if region_id is not None:
        q = q.filter(Prediction.region_id == region_id)
    return q.limit(limit).all()


@router.post("", response_model=PredictResponse)
def predict(
    body: PredictRequest,
    db: Session = Depends(get_db),
    _current_user: Users = Depends(get_current_user),
):
    return predict_service.run_inference(body.region_id, db)
