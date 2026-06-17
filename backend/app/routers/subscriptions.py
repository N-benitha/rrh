from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.region import Region
from app.models.user import User as Users
from app.models.user_region_subscription import UserRegionSubscription
from app.schemas.subscription import SubscribeRequest, SubscriptionResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_200_OK)
def subscribe(
    body: SubscribeRequest,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    region = db.query(Region).filter(Region.id == body.region_id).first()
    if not region:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")

    existing = (
        db.query(UserRegionSubscription)
        .filter(
            UserRegionSubscription.user_id == current_user.id,
            UserRegionSubscription.region_id == body.region_id,
        )
        .first()
    )
    if existing:
        if existing.is_deleted:
            existing.restore()
            db.commit()
            db.refresh(existing)
        return existing

    sub = UserRegionSubscription(user_id=current_user.id, region_id=body.region_id)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/{region_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsubscribe(
    region_id: UUID,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    sub = (
        db.query(UserRegionSubscription)
        .filter(
            UserRegionSubscription.user_id == current_user.id,
            UserRegionSubscription.region_id == region_id,
            UserRegionSubscription.is_deleted == False,  # noqa: E712
        )
        .first()
    )
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    sub.soft_delete()
    db.commit()


@router.get("", response_model=list[SubscriptionResponse])
def list_subscriptions(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    return (
        db.query(UserRegionSubscription)
        .filter(
            UserRegionSubscription.user_id == current_user.id,
            UserRegionSubscription.is_deleted == False,  # noqa: E712
        )
        .all()
    )
