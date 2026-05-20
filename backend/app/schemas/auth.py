from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import UserRole

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone_number: str
    email_alerts_enabled: bool = False

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., description="Password")


class TokenUserInfo(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: UserRole

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: TokenUserInfo
