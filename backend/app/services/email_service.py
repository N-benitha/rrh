import logging
from pathlib import Path

import resend
from jinja2 import Environment, FileSystemLoader

from app.config import settings

logger = logging.getLogger(__name__)

_TEMPLATES_DIR = Path(__file__).parent.parent / "templates" / "emails"
_jinja_env = Environment(loader=FileSystemLoader(str(_TEMPLATES_DIR)), autoescape=True)


def send_flood_alert_email(
    to_email: str,
    region_name: str,
    risk_level: str,
    confidence_score: float | None = None,
) -> bool:
    try:
        message = (
            f"Rwanda Resilience Hub has detected {risk_level} flood risk conditions "
            f"in {region_name}. Please take immediate precautions and follow guidance "
            f"from local authorities."
        )
        html = _jinja_env.get_template("flood_alert.html").render(
            region_name=region_name,
            risk_level=risk_level,
            message=message,
            confidence_score=round(confidence_score * 100) if confidence_score is not None else None,
        )

        resend.api_key = settings.RESEND_API_KEY
        params: resend.Emails.SendParams = {
            "from": settings.RESEND_SENDER_EMAIL,
            "to": [to_email],
            "subject": f"⚠️ Flood Risk Alert — {region_name}",
            "html": html,
        }
        resend.Emails.send(params)
        return True

    except Exception as e:
        logger.error("[EmailService] Failed to send alert to %s: %s", to_email, e)
        return False
