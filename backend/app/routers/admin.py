from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert, AlertStatus
from app.models.user import Users
from app.schemas.alert import AlertResponse
from app.services.auth import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/alerts", response_model=list[AlertResponse])
def list_all_alerts(
    alert_status: AlertStatus | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    _admin: Users = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(Alert).order_by(desc(Alert.created_at))
    if alert_status is not None:
        q = q.filter(Alert.status == alert_status)
    return q.limit(limit).all()
