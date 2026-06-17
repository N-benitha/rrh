"""
Base Schemas

This module contains base schemas and common utilities used across all domains.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import Query
from pydantic import BaseModel, ConfigDict, Field, field_validator

def sanitize_any(value):
    """
    Recursively sanitize strings inside dicts, lists, and tuples.
    Strips leading/trailing whitespace from all string values.
    """
    if isinstance(value, dict):
        return {k: sanitize_any(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        sanitized = (sanitize_any(x) for x in value)
        return type(value)(sanitized)
    if isinstance(value, str):
        return value.strip()
    return value

class MainSchema(BaseModel):
    """
    Main schema that all other schemas can inherit from.
    """
    model_config = ConfigDict(from_attributes=True)

    @field_validator("*", mode="before")
    @classmethod
    def _sanitize_input_fields(cls, value):
        """
        Recursively sanitize strings inside dicts, lists, and tuples.
        Strips leading/trailing whitespace from all string values.
        """
        return sanitize_any(value)


class ResponseBase(BaseModel):
    """
    Base response schema with common fields.
    """
    
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ErrorResponse(BaseModel):
    """
    Standard error response schema.
    """
    detail: str
    error_code: Optional[str] = None
    field_errors: Optional[Dict[str, List[str]]] = None

class SuccessResponse(BaseModel):
    """
    Standard success response schema.
    """
    message: str
    data: Optional[Any] = None