from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import Users
from app.schemas.user import UserResponse, UserUpdate
from app.services import user as user_service
from app.services.auth import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Users = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.get("", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    _admin: Users = Depends(require_admin),
):
    return [UserResponse.model_validate(u) for u in user_service.get_all(db)]


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _admin: Users = Depends(require_admin),
):
    return UserResponse.model_validate(user_service.get_by_id(db, user_id))


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    body: UserUpdate,
    db: Session = Depends(get_db),
    _admin: Users = Depends(require_admin),
):
    return UserResponse.model_validate(user_service.update(db, user_id, body))


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _admin: Users = Depends(require_admin),
):
    user_service.soft_delete(db, user_id)
