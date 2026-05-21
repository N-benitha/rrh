import enum

class BaseEnum(str, enum.Enum):
    """
    Base enumeration class that extends str and enum.Enum for better string representation.
    """

    def __str__(self):
        return self.value

    def __repr__(self):
        return self.value


class UserRole(BaseEnum):
    ADMIN = "admin"
    USER = "user"

class RiskLevel(BaseEnum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"
