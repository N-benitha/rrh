from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import random
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

from app.models.schemas import User, UserCreate, Token, UserRole
from app.models.database import get_db
from app.models.entities import User as UserEntity
from app.core.security import create_access_token, create_refresh_token, verify_password, get_password_hash, verify_token
from app.core.config import settings


class LoginRequest(BaseModel):
    email: str
    password: str

class VerifyRequest(BaseModel):
    email: str
    code: str

class SendVerifyRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

router = APIRouter()
security = HTTPBearer()

# In-memory OTP store: email → {code, expires_at}
_otp_store: dict[str, dict] = {}
# Emails that passed OTP verification and can now reset password
_verified: set[str] = set()


def _send_verification_email(to_email: str, code: str) -> bool:
    """Send OTP via SMTP. Returns True if sent, False if SMTP not configured."""
    if not (settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD):
        logger.warning("SMTP not configured — OTP for %s generated but not sent", to_email)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Rwanda Resilience Hub — Your verification code: {code}"
    msg["From"]    = settings.SMTP_FROM
    msg["To"]      = to_email

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px">
      <div style="background:#1e3a5f;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px">
        <h1 style="color:#fff;font-size:22px;margin:0">Rwanda Resilience Hub</h1>
        <p style="color:rgba(255,255,255,.7);font-size:13px;margin:6px 0 0">Flood Intelligence Platform</p>
      </div>
      <h2 style="color:#1e3a5f;font-size:18px">Verify your email address</h2>
      <p style="color:#4b5563;font-size:15px">Enter the code below to activate your account:</p>
      <div style="background:#fff;border:2px solid #1e3a5f;border-radius:10px;padding:24px;text-align:center;margin:20px 0">
        <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#1e3a5f">{code}</span>
      </div>
      <p style="color:#9ca3af;font-size:13px">This code expires in <strong>5 minutes</strong>. If you did not register, ignore this email.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
      <p style="color:#9ca3af;font-size:12px;text-align:center">
        Rwanda Resilience Hub · Sebeya River Basin · Rubavu District
      </p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        port = settings.SMTP_PORT or 587
        if port == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, 465) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, port) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
        logger.info("Verification email sent to %s", to_email)
        return True
    except Exception as e:
        logger.error("SMTP error sending to %s: %s", to_email, e)
        return False

# Seed accounts — always available regardless of DB state
MOCK_USERS = {
    "admin@rrh.rw": {
        "id": 1, "email": "admin@rrh.rw", "full_name": "System Administrator",
        "institution": "Rwanda Resilience Hub", "role": UserRole.ADMIN,
        "is_active": True, "hashed_password": get_password_hash("admin123"),
        "created_at": datetime.now()
    },
    "analyst@meteo.rw": {
        "id": 2, "email": "analyst@meteo.rw", "full_name": "Weather Analyst",
        "institution": "Meteo Rwanda", "role": UserRole.ANALYST,
        "is_active": True, "hashed_password": get_password_hash("analyst123"),
        "created_at": datetime.now()
    },
    "yvettetuyizere@gmail.com": {
        "id": 3, "email": "yvettetuyizere@gmail.com", "full_name": "Yvette Tuyizere",
        "institution": "University of Rwanda", "role": UserRole.SUPERADMIN,
        "is_active": True, "hashed_password": get_password_hash("yvette123"),
        "created_at": datetime.now()
    },
    "tuyizere_221007271@stud.ur.ac.rw": {
        "id": 4, "email": "tuyizere_221007271@stud.ur.ac.rw", "full_name": "Yvette Tuyizere",
        "institution": "University of Rwanda", "role": UserRole.SUPERADMIN,
        "is_active": True, "hashed_password": get_password_hash("yvette123"),
        "created_at": datetime.now()
    },
}


def _db_user_to_dict(u: UserEntity) -> dict:
    return {
        "id": u.id, "email": u.email, "full_name": u.full_name,
        "institution": u.institution, "role": u.role,
        "is_active": u.is_active, "hashed_password": u.hashed_password,
        "created_at": u.created_at or datetime.now(),
    }


def _find_user(email: str, db: Session) -> Optional[dict]:
    if email in MOCK_USERS:
        return MOCK_USERS[email]
    db_user = db.query(UserEntity).filter(UserEntity.email == email).first()
    return _db_user_to_dict(db_user) if db_user else None

@router.post("/send-verification")
async def send_verification(req: SendVerifyRequest) -> dict:
    """Generate a 6-digit OTP and send it to the user's email."""
    code = str(random.randint(100000, 999999))
    _otp_store[req.email] = {
        "code": code,
        "expires_at": datetime.now() + timedelta(minutes=5),
    }
    emailed = _send_verification_email(req.email, code)
    return {"sent": True, "emailed": emailed, "email": req.email}


@router.post("/verify-email")
async def verify_email(req: VerifyRequest) -> dict:
    """Validate the OTP and mark the email as verified."""
    otp = _otp_store.get(req.email)
    if not otp:
        raise HTTPException(status_code=400, detail="No verification code found. Please request a new one.")
    if datetime.now() > otp["expires_at"]:
        _otp_store.pop(req.email, None)
        raise HTTPException(status_code=400, detail="Code expired. Please request a new one.")
    if otp["code"] != req.code:
        raise HTTPException(status_code=400, detail="Invalid code. Please check and try again.")
    _otp_store.pop(req.email, None)
    _verified.add(req.email)
    return {"verified": True, "email": req.email}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict:
    """Set a new password for the user after OTP has been verified."""
    if req.email not in _verified:
        raise HTTPException(status_code=400, detail="Email not verified. Please complete the verification step first.")
    _verified.discard(req.email)

    # Update password in mock users if present
    if req.email in MOCK_USERS:
        MOCK_USERS[req.email]["hashed_password"] = get_password_hash(req.new_password)
        return {"reset": True}

    # Update in database
    db_user = db.query(UserEntity).filter(UserEntity.email == req.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found.")
    db_user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"reset": True}


@router.post("/register", response_model=dict)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        if _find_user(user.email, db):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        db_user = UserEntity(
            email=user.email,
            full_name=user.full_name,
            institution=user.institution or "",
            hashed_password=get_password_hash(user.password),
            role=user.role,
            is_active=True,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        access_token = create_access_token(
            data={"sub": db_user.email, "role": db_user.role.value, "user_id": db_user.id},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = create_refresh_token(
            data={"sub": db_user.email, "user_id": db_user.id}
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user_id": db_user.id,
            "email": db_user.email,
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
        user = _find_user(email, db)
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
        
        # Create tokens — 24h expiry so demo sessions stay alive
        access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"].value, "user_id": user["id"]},
            expires_delta=access_token_expires
        )

        refresh_token = create_refresh_token(
            data={"sub": user["email"], "user_id": user["id"]}
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "institution": user["institution"],
                "role": user["role"].value,
            },
        }
        
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
        
        email = payload.get("sub")
        user = _find_user(email, db)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        role = user["role"]
        return {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "institution": user["institution"],
            "role": role.value if hasattr(role, "value") else role,
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
        
        # Find user — check both MOCK_USERS and DB
        email = payload.get("sub")
        user = _find_user(email, db)

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

        # Update in DB
        db_user = db.query(UserEntity).filter(UserEntity.email == email).first()
        if db_user:
            db_user.hashed_password = get_password_hash(new_password)
            db.commit()
        # Also update in-memory mock if present
        if email in MOCK_USERS:
            MOCK_USERS[email]["hashed_password"] = get_password_hash(new_password)

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
        
        if (payload.get("role") or "").lower() not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Return all real DB users
        db_users = db.query(UserEntity).all()
        seen_emails = set()
        users_list = []
        for u in db_users:
            if u.email in seen_emails:
                continue
            seen_emails.add(u.email)
            role = u.role
            users_list.append({
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name or "",
                "institution": u.institution or "",
                "role": role.value if hasattr(role, "value") else str(role),
                "is_active": u.is_active,
                "created_at": (u.created_at or datetime.now()).isoformat(),
            })

        return users_list
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users: {str(e)}"
        )


class CreateUserRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str
    institution: str = ""


@router.post("/users")
async def admin_create_user(
    body: CreateUserRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = verify_token(credentials.credentials)
    caller_role = (payload.get("role") or "").lower()
    if caller_role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        raise HTTPException(status_code=403, detail="Admin access required")

    if db.query(UserEntity).filter(UserEntity.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        role = UserRole(body.role.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {body.role}")

    new_user = UserEntity(
        email=body.email,
        full_name=body.full_name,
        institution=body.institution,
        hashed_password=get_password_hash(body.password),
        role=role,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created", "id": new_user.id, "email": new_user.email, "role": role.value}


class UpdateRoleRequest(BaseModel):
    role: str


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    body: UpdateRoleRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = verify_token(credentials.credentials)
    if (payload.get("role") or "").lower() not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(UserEntity).filter(UserEntity.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        user.role = UserRole(body.role.upper())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {body.role}")

    db.commit()
    return {"message": "Role updated", "user_id": user_id, "role": user.role.value}


@router.patch("/users/{user_id}/status")
async def toggle_user_status(
    user_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = verify_token(credentials.credentials)
    if (payload.get("role") or "").lower() not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(UserEntity).filter(UserEntity.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    return {"message": "Status updated", "user_id": user_id, "is_active": user.is_active}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = verify_token(credentials.credentials)
    if (payload.get("role") or "").lower() not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(UserEntity).filter(UserEntity.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted", "user_id": user_id}
