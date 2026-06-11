from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.push_notification import PushNotification
from app.models.push_token import PushToken

router = APIRouter()

# Polling fallback — mobile drains this when the app opens
_pending: list[dict[str, Any]] = []

LEVEL_EMOJI = {
    "critical": "🔴",
    "high":     "🟠",
    "moderate": "🟡",
    "low":      "🟢",
}

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


async def _send_expo_push(tokens: list[str], title: str, body: str) -> None:
    if not tokens:
        return
    messages = [
        {"to": t, "title": title, "body": body, "sound": "default", "channelId": "rrh-alerts"}
        for t in tokens
    ]
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                EXPO_PUSH_URL,
                json=messages,
                headers={
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                },
            )
    except Exception as exc:
        print(f"[RRH PUSH] Expo delivery error: {exc}")


class AlertRequest(BaseModel):
    title: str
    body: str
    level: str = "high"


@router.post("/send-alert")
async def send_alert(req: AlertRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    emoji = LEVEL_EMOJI.get(req.level.lower(), "⚠️")
    full_title = f"{emoji} {req.title}"

    record = PushNotification(title=full_title, body=req.body, level=req.level)
    db.add(record)
    db.commit()

    _pending.append({
        "title": full_title, "body": req.body, "level": req.level,
        "sent_at": datetime.now(timezone.utc).isoformat(),
    })

    tokens = [row.token for row in db.query(PushToken).all()]
    await _send_expo_push(tokens, full_title, req.body)

    return {"queued": True, "pending_count": len(_pending), "push_sent_to": len(tokens)}


@router.get("/history")
async def get_history(db: Session = Depends(get_db)) -> dict[str, Any]:
    records = db.query(PushNotification).order_by(PushNotification.sent_at.desc()).all()
    return {
        "history": [
            {"title": r.title, "body": r.body, "level": r.level,
             "sent_at": r.sent_at.isoformat()}
            for r in records
        ]
    }


@router.get("/pending")
async def get_pending() -> dict[str, Any]:
    notifications = list(_pending)
    _pending.clear()
    return {"notifications": notifications}


class TokenRequest(BaseModel):
    token: str


@router.post("/register-token")
async def register_token(req: TokenRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    existing = db.query(PushToken).filter(PushToken.token == req.token).first()
    if not existing:
        db.add(PushToken(token=req.token))
        db.commit()
    total = db.query(PushToken).count()
    return {"registered": True, "total_tokens": total}


@router.get("/token-count")
async def token_count(db: Session = Depends(get_db)) -> dict[str, int]:
    return {"count": db.query(PushToken).count()}
