import resend
from app.config import settings

resend.api_key = settings.RESEND_API_KEY

email = resend.Emails.send({
    "from": "onboarding@resend.dev",
    "to": settings.RESEND_TEST_RECIPIENT,
    "subject": "RRH Test",
    "html": "<p>Resend is working.</p>"
})

print(email)