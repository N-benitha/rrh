from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.alert import Alert, AlertStatus
from app.models.enums import RiskLevel
from app.models.prediction import Prediction
from app.models.region import Region
from app.models.sensor_reading import SensorReading
from app.models.user import User as Users
from app.repositories import user_repository


def get_users_paginated(db: Session, page: int, page_size: int) -> list[Users]:
    all_users = user_repository.get_all(db)
    offset = (page - 1) * page_size
    return all_users[offset : offset + page_size]


def get_stats(db: Session) -> dict:
    risk_counts = (
        db.query(Prediction.risk_level, func.count(Prediction.id))
        .group_by(Prediction.risk_level)
        .all()
    )
    predictions_by_risk = {level.value: 0 for level in RiskLevel}
    for risk_level, count in risk_counts:
        predictions_by_risk[risk_level.value] = count

    status_counts = (
        db.query(Alert.status, func.count(Alert.id))
        .group_by(Alert.status)
        .all()
    )
    alerts_by_status = {status.value: 0 for status in AlertStatus}
    for status, count in status_counts:
        alerts_by_status[status.value] = count

    return {
        "total_users": db.query(func.count(Users.id)).scalar(),
        "total_predictions": db.query(func.count(Prediction.id)).scalar(),
        "total_alerts": db.query(func.count(Alert.id)).scalar(),
        "predictions_by_risk_level": predictions_by_risk,
        "alerts_by_status": alerts_by_status,
        "total_sensor_readings": db.query(func.count(SensorReading.id)).scalar(),
        "regions_count": db.query(func.count(Region.id)).scalar(),
    }


def get_model_performance(db: Session) -> dict:
    dist_counts = (
        db.query(Prediction.risk_level, func.count(Prediction.id))
        .group_by(Prediction.risk_level)
        .all()
    )
    distribution = {level.value: 0 for level in RiskLevel}
    for risk_level, count in dist_counts:
        distribution[risk_level.value] = count

    return {
        "model": "Random Forest",
        "version": "rf_v1",
        "metrics": {
            "accuracy": 0.9831,
            "f1_macro": 0.8790,
            "f1_weighted": 0.9823,
            "f1_critical": 0.6000,
            "f1_high": 0.9375,
        },
        "prediction_distribution": distribution,
        "note": "Metrics from validation set. Model trained on synthetic Sebeya River Basin data.",
    }
