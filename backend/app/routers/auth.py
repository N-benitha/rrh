from fastapi import APIRouter, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import Users
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.base import SuccessResponse
from app.services import auth as auth_service
from app.services.auth import auth_scheme, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(db, body)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, body)


@router.post("/logout", response_model=SuccessResponse)
def logout(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(auth_scheme),
    _current_user: Users = Depends(get_current_user),
):
    auth_service.logout(db, credentials.credentials)
    return SuccessResponse(message="Logged out successfully")
