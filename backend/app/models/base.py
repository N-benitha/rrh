"""
Base Model and Mixins for SQLAlchemy Models

This module provides base classes and mixins that can be used
across all domain models in the platform.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy import Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, declared_attr


class TimestampMixin:
    """
    Mixin that adds created_at and updated_at columns to a model.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class SoftDeleteMixin:
    """
    Mixin that adds soft delete functionality to a model.
    """

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    def soft_delete(self) -> None:
        """Mark the record as deleted."""
        self.is_deleted = True
        self.deleted_at = datetime.now(timezone.utc)

    def restore(self) -> None:
        """Restore a soft-deleted record."""
        self.is_deleted = False
        self.deleted_at = None


class BaseModelMixin(TimestampMixin):
    """
    Mixin with common fields for all tables.
    """

    @declared_attr
    def id(cls) -> Mapped[uuid.UUID]:
        return mapped_column(
            UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
            unique=True,
            nullable=False,
        )

    @staticmethod
    def searchable_fields() -> List[str]:
        """
        Override in child classes to specify searchable fields.
        Returns a list of field names that can be searched.
        """
        return []

    def update_from_dict(self, data: Dict[str, Any]) -> None:
        """
        Update ORM model attributes from a dictionary.
        Only updates attributes that exist on the model.

        Args:
            data: Dictionary of field names to values
        """
        for key, value in data.items():
            if hasattr(self, key) and not key.startswith("_"):
                setattr(self, key, value)

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model instance to dictionary.

        Returns:
            Dictionary representation of the model
        """
        result: Dict[str, Any] = {}

        for column in self.__table__.columns:
            value = getattr(self, column.name)

            if isinstance(value, datetime):
                value = value.isoformat()
            elif isinstance(value, uuid.UUID):
                value = str(value)

            result[column.name] = value

        return result

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(id={self.id})>"