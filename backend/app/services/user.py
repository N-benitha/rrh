from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import Users
from app.repositories import user_repository
from app.schemas.user import UserUpdate


def get_all(db: Session) -> list[Users]:
    return user_repository.get_all(db)


def get_by_id(db: Session, user_id: UUID) -> Users:
    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def update(db: Session, user_id: UUID, body: UserUpdate) -> Users:
    user = get_by_id(db, user_id)
    return user_repository.update(db, user, body)


def soft_delete(db: Session, user_id: UUID) -> None:
    user = get_by_id(db, user_id)
    user_repository.soft_delete(db, user)


def restore(db: Session, user_id: UUID) -> Users:
    user = user_repository.get_by_id_any(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_deleted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not suspended")
    user.restore()
    db.commit()
    db.refresh(user)
    return user
