from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.token_blacklist import TokenBlacklist


def add(db: Session, token: str, expires_at: datetime) -> TokenBlacklist:
    entry = TokenBlacklist(token=token, expires_at=expires_at)
    db.add(entry)
    db.commit()
    return entry


def is_blacklisted(db: Session, token: str) -> bool:
    return db.query(TokenBlacklist).filter(TokenBlacklist.token == token).first() is not None


def delete_expired(db: Session) -> int:
    now = datetime.now(timezone.utc)
    deleted = db.query(TokenBlacklist).filter(TokenBlacklist.expires_at < now).delete()
    db.commit()
    return deleted