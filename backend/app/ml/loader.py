import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib

logger = logging.getLogger(__name__)

_ML_DIR = Path(__file__).parent


@dataclass
class ModelBundle:
    model: Any
    scaler: Any
    label_encoder: Any
    region_encoder: Any


_bundle: ModelBundle | None = None


def load_models() -> None:
    global _bundle
    logger.info("Loading ML artifacts from %s", _ML_DIR)
    _bundle = ModelBundle(
        model=joblib.load(_ML_DIR / "rf_model.joblib"),
        scaler=joblib.load(_ML_DIR / "scaler.joblib"),
        label_encoder=joblib.load(_ML_DIR / "label_encoder.joblib"),
        region_encoder=joblib.load(_ML_DIR / "region_encoder.joblib"),
    )
    logger.info("ML artifacts loaded successfully")


def get_model_bundle() -> ModelBundle:
    if _bundle is None:
        raise RuntimeError("ML models not loaded — call load_models() at startup")
    return _bundle
