import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import pickle
import json
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime, timedelta
import logging

from app.models.schemas import FloodRiskLevel
from app.core.config import settings

logger = logging.getLogger(__name__)

class FloodRiskModel:
    """ML model for flood risk prediction using Random Forest and Logistic Regression"""
    
    def __init__(self, model_type: str = "random_forest"):
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_columns = [
            'water_level', 'rainfall_24h', 'rainfall_7d', 'soil_saturation',
            'flow_rate', 'humidity', 'temperature', 'wind_speed', 'pressure'
        ]
        self.model_version = f"v1.0_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.is_trained = False
        
        # Initialize model based on type
        if model_type == "random_forest":
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                class_weight='balanced'
            )
        elif model_type == "logistic_regression":
            self.model = LogisticRegression(
                random_state=42,
                max_iter=1000,
                class_weight='balanced',
                solver='liblinear'
            )
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
    
    def prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Prepare and engineer features for training/prediction"""
        df = data.copy()
        
        # Handle missing values
        for col in self.feature_columns:
            if col in df.columns:
                df[col] = df[col].fillna(df[col].median())
        
        # Feature engineering
        if 'water_level' in df.columns and 'rainfall_24h' in df.columns:
            df['water_rainfall_ratio'] = df['water_level'] / (df['rainfall_24h'] + 0.001)
        
        if 'rainfall_24h' in df.columns and 'rainfall_7d' in df.columns:
            df['rainfall_intensity'] = df['rainfall_24h'] / (df['rainfall_7d'] + 0.001)
        
        if 'temperature' in df.columns and 'humidity' in df.columns:
            df['heat_index'] = df['temperature'] * (1 + df['humidity'] / 100)
        
        # Add temporal features if timestamp available
        if 'timestamp' in df.columns:
            df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
            df['month'] = pd.to_datetime(df['timestamp']).dt.month
            df['season'] = df['month'].apply(self._get_season)
        
        return df
    
    def _get_season(self, month: int) -> int:
        """Get season number from month (1-4)"""
        if month in [12, 1, 2]:
            return 1  # Dry season
        elif month in [3, 4, 5]:
            return 2  # Short rainy season
        elif month in [6, 7, 8]:
            return 3  # Long dry season
        else:
            return 4  # Long rainy season
    
    def train(self, data: pd.DataFrame, target_column: str = 'risk_level') -> Dict[str, Any]:
        """Train the flood risk model"""
        try:
            # Prepare features
            df = self.prepare_features(data)
            
            # Ensure target column exists
            if target_column not in df.columns:
                raise ValueError(f"Target column '{target_column}' not found in data")
            
            # Encode target variable
            y = self.label_encoder.fit_transform(df[target_column])
            
            # Select feature columns (ensure they exist)
            available_features = [col for col in self.feature_columns if col in df.columns]
            
            # Add engineered features if they exist
            engineered_features = ['water_rainfall_ratio', 'rainfall_intensity', 'heat_index', 'hour', 'month', 'season']
            available_features.extend([col for col in engineered_features if col in df.columns])
            
            X = df[available_features]
            
            # Handle any remaining missing values
            X = X.fillna(X.median())
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Make predictions
            y_pred = self.model.predict(X_test_scaled)
            y_pred_proba = self.model.predict_proba(X_test_scaled)
            
            # Calculate metrics
            metrics = self._calculate_metrics(y_test, y_pred, y_pred_proba)
            
            # Cross-validation
            cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=5, scoring='f1_weighted')
            metrics['cross_validation_score'] = cv_scores.mean()
            metrics['cross_validation_std'] = cv_scores.std()
            
            # Feature importance (for tree-based models)
            if hasattr(self.model, 'feature_importances_'):
                feature_importance = dict(zip(available_features, self.model.feature_importances_))
                metrics['feature_importance'] = feature_importance
            
            # Store training info
            self.is_trained = True
            metrics['model_type'] = self.model_type
            metrics['model_version'] = self.model_version
            metrics['training_samples'] = len(X_train)
            metrics['feature_count'] = len(available_features)
            metrics['training_date'] = datetime.now().isoformat()
            
            logger.info(f"Model trained successfully. Accuracy: {metrics['accuracy']:.3f}")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise
    
    def predict(self, data: pd.DataFrame) -> Tuple[List[str], List[float]]:
        """Make predictions on new data"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        try:
            # Prepare features
            df = self.prepare_features(data)
            
            # Select same features as training
            available_features = [col for col in self.feature_columns if col in df.columns]
            engineered_features = ['water_rainfall_ratio', 'rainfall_intensity', 'heat_index', 'hour', 'month', 'season']
            available_features.extend([col for col in engineered_features if col in df.columns])
            
            X = df[available_features]
            
            # Handle missing values
            X = X.fillna(X.median())
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Make predictions
            predictions = self.model.predict(X_scaled)
            probabilities = self.model.predict_proba(X_scaled)
            
            # Convert predictions back to labels
            predicted_labels = self.label_encoder.inverse_transform(predictions)
            
            # Get confidence scores (max probability)
            confidence_scores = np.max(probabilities, axis=1)
            
            return predicted_labels.tolist(), confidence_scores.tolist()
            
        except Exception as e:
            logger.error(f"Error making predictions: {str(e)}")
            raise
    
    def _calculate_metrics(self, y_true, y_pred, y_pred_proba) -> Dict[str, float]:
        """Calculate classification metrics"""
        metrics = {}
        
        try:
            metrics['accuracy'] = accuracy_score(y_true, y_pred)
            metrics['precision'] = precision_score(y_true, y_pred, average='weighted', zero_division=0)
            metrics['recall'] = recall_score(y_true, y_pred, average='weighted', zero_division=0)
            metrics['f1_score'] = f1_score(y_true, y_pred, average='weighted', zero_division=0)
            
            # ROC AUC (for multi-class)
            try:
                metrics['roc_auc'] = roc_auc_score(y_true, y_pred_proba, multi_class='ovr', average='weighted')
            except:
                metrics['roc_auc'] = 0.0
                
        except Exception as e:
            logger.warning(f"Error calculating some metrics: {str(e)}")
            # Set default values
            metrics.update({
                'accuracy': 0.0, 'precision': 0.0, 'recall': 0.0, 
                'f1_score': 0.0, 'roc_auc': 0.0
            })
        
        return metrics
    
    def save_model(self, filepath: str) -> None:
        """Save the trained model"""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoder': self.label_encoder,
            'feature_columns': self.feature_columns,
            'model_type': self.model_type,
            'model_version': self.model_version,
            'is_trained': self.is_trained
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """Load a trained model"""
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.label_encoder = model_data['label_encoder']
            self.feature_columns = model_data['feature_columns']
            self.model_type = model_data['model_type']
            self.model_version = model_data['model_version']
            self.is_trained = model_data['is_trained']
            
            logger.info(f"Model loaded from {filepath}")
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise

class ModelManager:
    """Manages multiple ML models and provides prediction interface"""
    
    def __init__(self):
        self.models = {}
        self.active_model = None
        self.load_models()
    
    def load_models(self):
        """Load or initialize models, then auto-train on synthetic Rwanda data."""
        try:
            rf_model = FloodRiskModel("random_forest")
            lr_model = FloodRiskModel("logistic_regression")

            self.models["random_forest"] = rf_model
            self.models["logistic_regression"] = lr_model
            self.active_model = "random_forest"

            self.auto_train()
            logger.info("Models initialized and trained successfully")

        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            raise

    def auto_train(self, samples_per_class: int = 400) -> None:
        """Train all models on synthetic Rwanda-calibrated data.

        Generates realistic feature distributions for each risk class based on
        observed conditions in Rwanda's river basins, then trains each model.
        """
        rng = np.random.default_rng(42)

        def _samples(n, ranges):
            return {k: rng.uniform(lo, hi, n) for k, (lo, hi) in ranges.items()}

        low = _samples(samples_per_class, {
            "water_level":     (0.5, 2.2),
            "rainfall_24h":    (0.0, 25.0),
            "rainfall_7d":     (0.0, 80.0),
            "soil_saturation": (15.0, 48.0),
            "flow_rate":       (10.0, 80.0),
            "humidity":        (35.0, 62.0),
            "temperature":     (17.0, 25.0),
            "wind_speed":      (0.5, 7.0),
            "pressure":        (1012.0, 1022.0),
        })
        med = _samples(samples_per_class, {
            "water_level":     (2.2, 3.4),
            "rainfall_24h":    (25.0, 70.0),
            "rainfall_7d":     (80.0, 190.0),
            "soil_saturation": (48.0, 74.0),
            "flow_rate":       (80.0, 180.0),
            "humidity":        (62.0, 80.0),
            "temperature":     (19.0, 28.0),
            "wind_speed":      (6.0, 14.0),
            "pressure":        (1007.0, 1014.0),
        })
        high = _samples(samples_per_class, {
            "water_level":     (3.4, 6.5),
            "rainfall_24h":    (70.0, 220.0),
            "rainfall_7d":     (190.0, 420.0),
            "soil_saturation": (74.0, 100.0),
            "flow_rate":       (180.0, 550.0),
            "humidity":        (80.0, 100.0),
            "temperature":     (20.0, 32.0),
            "wind_speed":      (10.0, 28.0),
            "pressure":        (1003.0, 1010.0),
        })

        rows = []
        for d, label in [(low, "low"), (med, "medium"), (high, "high")]:
            df_part = pd.DataFrame(d)
            df_part["risk_level"] = label
            rows.append(df_part)

        training_data = pd.concat(rows, ignore_index=True).sample(
            frac=1, random_state=42
        )

        for model in self.models.values():
            try:
                model.train(training_data, target_column="risk_level")
            except Exception as exc:
                logger.warning(f"Could not train {model.model_type}: {exc}")
    
    def predict_flood_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Make flood risk prediction using active model"""
        if not self.active_model or self.active_model not in self.models:
            raise ValueError("No active model available")
        
        model = self.models[self.active_model]
        
        if not model.is_trained:
            # For demo purposes, create a mock prediction
            return self._mock_prediction(features)
        
        # Convert features to DataFrame
        df = pd.DataFrame([features])
        
        try:
            predictions, confidence_scores = model.predict(df)
            
            return {
                'risk_level': predictions[0],
                'confidence_score': confidence_scores[0],
                'model_type': model.model_type,
                'model_version': model.model_version,
                'prediction_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return self._mock_prediction(features)
    
    def _mock_prediction(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Create mock prediction for demonstration"""
        # Simple heuristic based on water level and rainfall
        water_level = features.get('water_level', 0)
        rainfall_24h = features.get('rainfall_24h', 0)
        
        if water_level > 3.5 or rainfall_24h > 80:
            risk_level = "high"
            confidence = 0.85
        elif water_level > 2.5 or rainfall_24h > 50:
            risk_level = "medium"
            confidence = 0.75
        else:
            risk_level = "low"
            confidence = 0.90
        
        return {
            'risk_level': risk_level,
            'confidence_score': confidence,
            'model_type': 'mock_heuristic',
            'model_version': 'v1.0_demo',
            'prediction_timestamp': datetime.now().isoformat()
        }

# Global model manager instance
model_manager = ModelManager()
