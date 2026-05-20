from uuid import UUID

from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import Users
from app.schemas.user import UserUpdate


def get_by_email(db: Session, email: str) -> Users | None:
    return db.query(Users).filter(Users.email == email, Users.is_deleted == False).first()


def get_by_id(db: Session, user_id: UUID | str) -> Users | None:
    return db.query(Users).filter(Users.id == user_id, Users.is_deleted == False).first()


def get_all(db: Session) -> list[Users]:
    return db.query(Users).filter(Users.is_deleted == False).all()


def create(
    db: Session,
    name: str,
    email: str,
    phone_number: str,
    hashed_password: str,
    role: UserRole = UserRole.USER,
) -> Users:
    user = Users(
        name=name,
        email=email,
        phone_number=phone_number,
        password=hashed_password,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update(db: Session, user: Users, data: UserUpdate) -> Users:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def soft_delete(db: Session, user: Users) -> None:
    user.soft_delete()
    db.commit()
