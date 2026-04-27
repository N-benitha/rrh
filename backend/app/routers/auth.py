from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

from app.models.schemas import User, UserCreate, Token, UserRole
from app.models.database import get_db
from app.core.security import create_access_token, create_refresh_token, verify_password, get_password_hash
from app.core.config import settings


class LoginRequest(BaseModel):
    email: str
    password: str

router = APIRouter()
security = HTTPBearer()

# Mock user database (in production, this would be actual database queries)
MOCK_USERS = {
    "admin@rrh.rw": {
        "id": 1,
        "email": "admin@rrh.rw",
        "full_name": "System Administrator",
        "institution": "Rwanda Resilience Hub",
        "role": UserRole.ADMIN,
        "is_active": True,
        "hashed_password": get_password_hash("admin123"),
        "created_at": datetime.now()
    },
    "analyst@meteo.rw": {
        "id": 2,
        "email": "analyst@meteo.rw",
        "full_name": "Weather Analyst",
        "institution": "Meteo Rwanda",
        "role": UserRole.ANALYST,
        "is_active": True,
        "hashed_password": get_password_hash("analyst123"),
        "created_at": datetime.now()
    },
    "yvettetuyizere@gmail.com": {
        "id": 3,
        "email": "yvettetuyizere@gmail.com",
        "full_name": "Yvette Tuyizere",
        "institution": "University of Rwanda",
        "role": UserRole.ADMIN,
        "is_active": True,
        "hashed_password": get_password_hash("yvette123"),
        "created_at": datetime.now()
    },
    "tuyizere_221007271@stud.ur.ac.rw": {
        "id": 4,
        "email": "tuyizere_221007271@stud.ur.ac.rw",
        "full_name": "Yvette Tuyizere",
        "institution": "University of Rwanda",
        "role": UserRole.ADMIN,
        "is_active": True,
        "hashed_password": get_password_hash("yvette123"),
        "created_at": datetime.now()
    }
}

@router.post("/register", response_model=dict)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if user already exists
        if user.email in MOCK_USERS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user
        new_user = {
            "id": len(MOCK_USERS) + 1,
            "email": user.email,
            "full_name": user.full_name,
            "institution": user.institution,
            "role": user.role,
            "is_active": True,
            "hashed_password": get_password_hash(user.password),
            "created_at": datetime.now()
        }

        MOCK_USERS[user.email] = new_user

        # Auto-login: return access token so frontend can go straight to dashboard
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user["email"], "role": new_user["role"].value, "user_id": new_user["id"]},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(
            data={"sub": new_user["email"], "user_id": new_user["id"]}
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user_id": new_user["id"],
            "email": user.email,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """Authenticate user and return tokens"""
    try:
        email = credentials.email
        password = credentials.password
        # Find user
        user = MOCK_USERS.get(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Create tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"].value, "user_id": user["id"]},
            expires_delta=access_token_expires
        )
        
        refresh_token = create_refresh_token(
            data={"sub": user["email"], "user_id": user["id"]}
        )
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/refresh", response_model=dict)
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        payload = verify_token(credentials.credentials)
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Find user
        email = payload.get("sub")
        user = MOCK_USERS.get(email)
        
        if not user or not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"].value, "user_id": user["id"]},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )

@router.get("/me", response_model=dict)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        
        # Find user
        email = payload.get("sub")
        user = MOCK_USERS.get(email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "institution": user["institution"],
            "role": user["role"].value,
            "is_active": user["is_active"],
            "created_at": user["created_at"],
            "last_login": datetime.now()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user info: {str(e)}"
        )

@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Logout user (token invalidation would be handled in production)"""
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        
        return {
            "message": "Logged out successfully",
            "timestamp": datetime.now()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )

@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Change user password"""
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        
        # Find user
        email = payload.get("sub")
        user = MOCK_USERS.get(email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify current password
        if not verify_password(current_password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Update password (in production, save to database)
        user["hashed_password"] = get_password_hash(new_password)
        
        return {
            "message": "Password changed successfully",
            "timestamp": datetime.now()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password change failed: {str(e)}"
        )

@router.get("/users", response_model=list)
async def get_users(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    try:
        # Verify token and check admin role
        payload = verify_token(credentials.credentials)
        
        if payload.get("role") != UserRole.ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Return all users (without passwords)
        users_list = []
        for user_data in MOCK_USERS.values():
            users_list.append({
                "id": user_data["id"],
                "email": user_data["email"],
                "full_name": user_data["full_name"],
                "institution": user_data["institution"],
                "role": user_data["role"].value,
                "is_active": user_data["is_active"],
                "created_at": user_data["created_at"]
            })
        
        return users_list
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users: {str(e)}"
        )
