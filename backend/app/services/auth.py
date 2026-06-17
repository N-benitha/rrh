from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.enums import UserRole
from app.models.user import Users
from app.repositories import token_blacklist_repository, user_repository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, TokenUserInfo

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
auth_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def register(db: Session, body: RegisterRequest) -> TokenResponse:
    if user_repository.get_by_email(db, body.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = user_repository.create(
        db,
        name=body.name,
        email=body.email,
        phone_number=body.phone_number,
        hashed_password=hash_password(body.password),
    )
    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        user=TokenUserInfo.model_validate(user),
    )


def login(db: Session, body: LoginRequest) -> TokenResponse:
    user = user_repository.get_by_email(db, body.email)
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        user=TokenUserInfo.model_validate(user),
    )


def logout(db: Session, token: str) -> None:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        exp = payload.get("exp")
        expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    token_blacklist_repository.add(db, token=token, expires_at=expires_at)


def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
    db: Session = Depends(get_db),
) -> Users:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token is None:
        raise credentials_exception
    raw_token = token.credentials
    try:
        payload = jwt.decode(
            raw_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if token_blacklist_repository.is_blacklisted(db, raw_token):
        raise credentials_exception

    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise credentials_exception
    return user


def require_admin(current_user: Users = Depends(get_current_user)) -> Users:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user