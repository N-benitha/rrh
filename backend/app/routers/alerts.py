from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert, AlertStatus
from app.models.user import Users
from app.schemas.alert import AlertResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertResponse])
def list_my_alerts(
    alert_status: AlertStatus | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    q = (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(desc(Alert.created_at))
    )
    if alert_status is not None:
        q = q.filter(Alert.status == alert_status)
    return q.all()


@router.patch("/{alert_id}/read", response_model=AlertResponse)
def mark_alert_read(
    alert_id: UUID,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    if alert.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your alert")

    alert.status = AlertStatus.READ
    db.commit()
    db.refresh(alert)
    return alert
