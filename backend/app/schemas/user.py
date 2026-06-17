"""
User domain schemas

This module contains all Pydantic schemas for user-related operations.
"""

import re
from typing import Optional
from uuid import UUID

from pydantic import EmailStr, Field, field_validator

from app.models.enums import UserRole
from app.schemas.base import MainSchema, ResponseBase

PASSWORD_REGEX = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_+=\-\[\]\\\/~`]).{8,30}$'
PASSWORD_MESSAGE = "Password must be 8-30 characters with at least one lowercase, uppercase, digit, and special character"

class UsersModel(MainSchema):
    """Schema for user shape."""
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone_number: str = Field(..., max_length=20)
    password: str = Field(..., min_length=6, max_length=255)
    role: UserRole = UserRole.USER
    email_alerts_enabled: bool = False

class UserCreate(UsersModel):
    """Schema for creating a new user."""
    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value):
        if isinstance(value, str):
            return value.lower()
        return value
    
    @field_validator("password", mode="after")
    @classmethod
    def validate_password(cls, value: str):
        if not re.match(PASSWORD_REGEX, value):
            raise ValueError(PASSWORD_MESSAGE)
        return value

class UserUpdate(MainSchema):
    """Schema for updating user information."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(None, max_length=20)
    role: Optional[UserRole] = None
    email_alerts_enabled: Optional[bool] = None

class UserResponse(ResponseBase):
    """Schema for user response."""
    name: str
    email: EmailStr
    phone_number: str
    role: UserRole
    email_alerts_enabled: bool

