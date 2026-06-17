from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timedelta
import random

from app.models.schemas import Alert, AlertCreate, AlertStatus, FloodRiskLevel
from app.models.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/", response_model=List[Alert])
async def get_alerts(
    status: Optional[AlertStatus] = None,
    severity: Optional[FloodRiskLevel] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all alerts from the database"""
    try:
        from app.models.push_notification import PushNotification
        records = db.query(PushNotification).order_by(PushNotification.sent_at.desc()).limit(limit).all()

        alerts = [
            Alert(
                id=r.id,
                title=r.title,
                message=r.body,
                severity=r.level if r.level in ("low", "medium", "high", "critical") else "high",
                affected_areas=["Sebeya River Basin", "Rubavu District"],
                latitude=-1.7469,
                longitude=29.2589,
                radius_km=10.0,
                status="active",
                created_at=r.sent_at,
                updated_at=r.sent_at,
                expires_at=r.sent_at + timedelta(hours=24),
                sent_via=["push"]
            )
            for r in records
        ]

        if status:
            alerts = [a for a in alerts if a.status == status.value]
        if severity:
            alerts = [a for a in alerts if a.severity == severity.value]

        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve alerts: {str(e)}")

@router.post("/", response_model=Alert)
async def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    """Create a new alert"""
    try:
        # Mock alert creation
        new_alert = Alert(
            id=random.randint(1000, 9999),
            title=alert.title,
            message=alert.message,
            severity=alert.severity,
            affected_areas=alert.affected_areas,
            latitude=alert.latitude,
            longitude=alert.longitude,
            radius_km=alert.radius_km,
            status=AlertStatus.ACTIVE,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            expires_at=alert.expires_at or datetime.now() + timedelta(hours=6),
            sent_via=["email"]
        )
        
        return new_alert
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create alert: {str(e)}")

@router.get("/{alert_id}", response_model=Alert)
async def get_alert(alert_id: int, db: Session = Depends(get_db)):
    """Get a specific alert by ID"""
    try:
        # Mock alert lookup
        alerts = {
            1: Alert(
                id=1,
                title="High Flood Risk - Sebeya River Basin",
                message="Elevated water levels detected in Ruhengeri area. Immediate monitoring required.",
                severity="high",
                affected_areas=["Ruhengeri", "Musanze"],
                latitude=-1.5097,
                longitude=29.6324,
                radius_km=15.0,
                status="active",
                created_at=datetime.now() - timedelta(hours=2),
                updated_at=datetime.now() - timedelta(hours=1),
                expires_at=datetime.now() + timedelta(hours=6),
                sent_via=["email", "push", "sms"]
            )
        }
        
        if alert_id not in alerts:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return alerts[alert_id]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve alert: {str(e)}")

@router.put("/{alert_id}/status")
async def update_alert_status(
    alert_id: int,
    status: AlertStatus,
    db: Session = Depends(get_db)
):
    """Update alert status"""
    try:
        # Mock status update
        valid_statuses = ["active", "resolved", "false_alarm"]
        
        if status.value not in valid_statuses:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        return {
            "alert_id": alert_id,
            "previous_status": "active",
            "new_status": status.value,
            "updated_at": datetime.now(),
            "updated_by": "system"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update alert status: {str(e)}")

@router.delete("/{alert_id}")
async def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    """Delete an alert"""
    try:
        # Mock deletion
        return {
            "message": f"Alert {alert_id} deleted successfully",
            "deleted_at": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete alert: {str(e)}")

@router.post("/{alert_id}/notify")
async def send_alert_notifications(
    alert_id: int,
    channels: List[str],
    db: Session = Depends(get_db)
):
    """Send alert notifications through specified channels"""
    try:
        valid_channels = ["email", "sms", "push", "broadcast"]
        
        for channel in channels:
            if channel not in valid_channels:
                raise HTTPException(status_code=400, detail=f"Invalid channel: {channel}")
        
        # Mock notification sending
        notifications_sent = []
        for channel in channels:
            notifications_sent.append({
                "channel": channel,
                "status": "sent",
                "recipients_count": random.randint(50, 500),
                "sent_at": datetime.now()
            })
        
        return {
            "alert_id": alert_id,
            "notifications": notifications_sent,
            "total_recipients": sum(n["recipients_count"] for n in notifications_sent)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send notifications: {str(e)}")

@router.get("/statistics/summary")
async def get_alert_statistics(db: Session = Depends(get_db)):
    """Get alert statistics summary"""
    try:
        stats = {
            "total_alerts": 47,
            "active_alerts": 4,
            "resolved_alerts": 38,
            "false_alarms": 5,
            "alerts_by_severity": {
                "high": 8,
                "medium": 22,
                "low": 17
            },
            "alerts_by_status": {
                "active": 4,
                "resolved": 38,
                "false_alarm": 5
            },
            "recent_trend": {
                "last_24h": 3,
                "last_7d": 18,
                "last_30d": 47
            },
            "notification_channels": {
                "email": 47,
                "sms": 12,
                "push": 35,
                "broadcast": 3
            },
            "average_response_time_minutes": 18.5,
            "true_positive_rate": 0.89,
            "last_updated": datetime.now()
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alert statistics: {str(e)}")

@router.get("/templates")
async def get_alert_templates():
    """Get predefined alert templates"""
    try:
        templates = [
            {
                "id": "high_risk_template",
                "name": "High Flood Risk Alert",
                "severity": "high",
                "title_template": "High Flood Risk - {river_basin} River Basin",
                "message_template": "Elevated water levels detected in {location}. Immediate monitoring required. {recommendations}",
                "default_duration_hours": 6,
                "notification_channels": ["email", "sms", "push", "broadcast"]
            },
            {
                "id": "medium_risk_template",
                "name": "Medium Flood Risk Alert",
                "severity": "medium",
                "title_template": "Medium Risk - {river_basin} River",
                "message_template": "Increased rainfall observed in {location}. Continue monitoring and prepare contingency plans.",
                "default_duration_hours": 4,
                "notification_channels": ["email", "push"]
            },
            {
                "id": "sensor_maintenance_template",
                "name": "Sensor Maintenance Notification",
                "severity": "low",
                "title_template": "Sensor Maintenance - {river_basin} Basin",
                "message_template": "Sensor {sensor_id} scheduled for maintenance. Temporary data gaps expected for the next {duration} hours.",
                "default_duration_hours": 24,
                "notification_channels": ["email"]
            }
        ]
        
        return templates
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alert templates: {str(e)}")

@router.post("/test-notification")
async def test_notification_system(
    channel: str = "email",
    test_message: str = "This is a test notification from Rwanda Resilience Hub"
):
    """Test the alert notification system"""
    try:
        valid_channels = ["email", "sms", "push", "broadcast"]
        
        if channel not in valid_channels:
            raise HTTPException(status_code=400, detail=f"Invalid channel: {channel}")
        
        # Mock test notification
        test_result = {
            "channel": channel,
            "status": "success",
            "test_message": test_message,
            "sent_at": datetime.now(),
            "delivery_time_seconds": random.uniform(0.5, 3.2),
            "recipients_count": 1
        }
        
        return test_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to test notification: {str(e)}")
