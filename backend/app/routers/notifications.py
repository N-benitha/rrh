"""Notification endpoints.

send-alert  — called by the web dashboard "Notify" button.
              Stores the alert in a pending queue for mobile polling.
pending     — polled by the mobile app every 15 s; returns and clears the queue.
"""

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# In-memory pending queue — mobile polls and clears this
_pending: list[dict[str, Any]] = []
# Permanent history — never cleared
_history: list[dict[str, Any]] = []

LEVEL_EMOJI = {
    "critical": "🔴",
    "high":     "🟠",
    "moderate": "🟡",
    "low":      "🟢",
}


class AlertRequest(BaseModel):
    title: str
    body: str
    level: str = "high"


@router.post("/send-alert")
async def send_alert(req: AlertRequest) -> dict[str, Any]:
    """Queue an alert for the mobile app to pick up via polling."""
    emoji = LEVEL_EMOJI.get(req.level.lower(), "⚠️")
    entry = {
        "title":    f"{emoji} {req.title}",
        "body":     req.body,
        "level":    req.level,
        "sent_at":  datetime.now(timezone.utc).isoformat(),
    }
    _pending.append(entry)
    _history.append(entry)
    return {"queued": True, "pending_count": len(_pending)}


@router.get("/history")
async def get_history() -> dict[str, Any]:
    """Return all sent notifications, newest first."""
    return {"history": list(reversed(_history))}


@router.get("/pending")
async def get_pending() -> dict[str, Any]:
    """Return all pending notifications and clear the queue.

    The mobile app calls this every 15 s and shows any returned alerts.
    """
    notifications = list(_pending)
    _pending.clear()
    return {"notifications": notifications}


# Keep register-token endpoint so existing frontend code doesn't break
class TokenRequest(BaseModel):
    token: str


@router.post("/register-token")
async def register_token(req: TokenRequest) -> dict[str, Any]:
    return {"registered": True, "total_tokens": 0}


@router.get("/token-count")
async def token_count() -> dict[str, int]:
    return {"count": 0}
