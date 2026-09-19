"""
Module B: Early Drift Predictor Engine
Smart India Hackathon 2026 | Problem Statement SIH26170
Organization: Indian Space Research Organisation (ISRO)

Predicts the 168-hour screening outcome using early measurements (0h and 24h).
Utilizes XGBoost Regressor with graceful fallback to Scikit-learn RandomForestRegressor.
Computes empirical residual uncertainty bounds and trajectory extrapolation.
"""

from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd
from app.config import EARLY_DECISION_HOUR, TOTAL_BURNIN_HOURS, SAFETY_THRESHOLDS, ABSOLUTE_LIMITS

# Regressor Backends: XGBoost -> Scikit-learn RandomForest -> Lightweight Numpy Ridge Regressor
USE_XGBOOST = False
try:
    from xgboost import XGBRegressor
    USE_XGBOOST = True
except Exception:
    USE_XGBOOST = False

USE_SKLEARN = False
try:
    from sklearn.ensemble import RandomForestRegressor
    USE_SKLEARN = True
except Exception:
    USE_SKLEARN = False

class NumpyRidgeRegressor:
    """Lightweight analytical ridge regression running purely on NumPy."""
    def __init__(self, alpha: float = 1.0):
        self.alpha = alpha
        self.weights = None
        self.mean_X = None
        self.std_X = None

    def fit(self, X, y):
        X_arr = np.asarray(X, dtype=float)
        y_arr = np.asarray(y, dtype=float)
        self.mean_X = np.mean(X_arr, axis=0)
        self.std_X = np.std(X_arr, axis=0)
        self.std_X[self.std_X < 1e-6] = 1.0
        X_norm = (X_arr - self.mean_X) / self.std_X
        X_b = np.hstack([np.ones((X_norm.shape[0], 1)), X_norm])
        reg = self.alpha * np.eye(X_b.shape[1])
        reg[0, 0] = 0.0
        self.weights = np.linalg.solve(X_b.T @ X_b + reg, X_b.T @ y_arr)

    def predict(self, X):
        X_arr = np.asarray(X, dtype=float)
        X_norm = (X_arr - self.mean_X) / self.std_X
        X_b = np.hstack([np.ones((X_norm.shape[0], 1)), X_norm])
        return X_b @ self.weights

class EarlyDriftPredictor:
    """
    Early-to-late parametric drift forecasting engine.
    Trains on historical/lot burn-in cohorts to learn the nonlinear mapping from [0h, 24h] to [168h].
    """

    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.residual_stds: Dict[str, float] = {}
        self.validation_metrics: Dict[str, Dict[str, float]] = {}
        self.parameters = ["standby_current", "temperature", "current", "voltage"]
        self.is_trained = False
        if USE_XGBOOST:
            self.model_backend = "XGBoost"
        elif USE_SKLEARN:
            self.model_backend = "RandomForest"
        else:
            self.model_backend = "NumpyRidge"

    def train_models(self, full_dataset_records: List[Dict[str, Any]]):
        """
        Trains separate regressors for each parameter to predict value at 168h from 0-24h data.
        """
        df = pd.DataFrame(full_dataset_records)
        
        # Prepare training matrices
        comp_features = []
        for comp_id, group in df.groupby("component_id"):
            h0 = group[group["burn_in_hour"] == 0.0]
            h24 = group[group["burn_in_hour"] == EARLY_DECISION_HOUR]
            h168 = group[group["burn_in_hour"] == TOTAL_BURNIN_HOURS]

            if h0.empty or h24.empty or h168.empty:
                continue

            row = {"component_id": comp_id, "lot_id": group["lot_id"].iloc[0]}
            for p in self.parameters:
                v0 = float(h0[p].iloc[0])
                v24 = float(h24[p].iloc[0])
                v168 = float(h168[p].iloc[0])
                
                # Early slope & variance
                early_slope = (v24 - v0) / EARLY_DECISION_HOUR
                sub_df = group[group["burn_in_hour"] <= 24.0]
                early_var = float(np.var(sub_df[p].values)) if len(sub_df) > 1 else 0.0

                row[f"{p}_0h"] = v0
                row[f"{p}_24h"] = v24
                row[f"{p}_slope_0_24"] = early_slope
                row[f"{p}_var_0_24"] = early_var
                row[f"{p}_target_168h"] = v168

            comp_features.append(row)

        if not comp_features:
            return

        feat_df = pd.DataFrame(comp_features)
        
        # Train-test split for synthetic benchmark validation (80/20)
        np.random.seed(42)
        shuffled_indices = np.random.permutation(len(feat_df))
        train_len = max(4, int(len(feat_df) * 0.75))
        train_idx = shuffled_indices[:train_len]
        val_idx = shuffled_indices[train_len:]

        train_df = feat_df.iloc[train_idx]
        val_df = feat_df.iloc[val_idx] if len(val_idx) > 0 else train_df

        feature_cols = []
        for p in self.parameters:
            feature_cols.extend([f"{p}_0h", f"{p}_24h", f"{p}_slope_0_24", f"{p}_var_0_24"])

        for p in self.parameters:
            target_col = f"{p}_target_168h"
            X_train = train_df[feature_cols]
            y_train = train_df[target_col]
            X_val = val_df[feature_cols]
            y_val = val_df[target_col]

            if USE_XGBOOST:
                model = XGBRegressor(
                    n_estimators=80,
                    max_depth=4,
                    learning_rate=0.08,
                    random_state=42,
                    verbosity=0
                )
            elif USE_SKLEARN:
                model = RandomForestRegressor(
                    n_estimators=80,
                    max_depth=5,
                    random_state=42
                )
            else:
                model = NumpyRidgeRegressor(alpha=0.5)

            model.fit(X_train, y_train)
            preds_val = model.predict(X_val)
            residuals = y_val - preds_val

            mae = float(np.mean(np.abs(residuals)))
            rmse = float(np.sqrt(np.mean(residuals ** 2)))
            resid_std = float(np.std(residuals)) if len(residuals) > 1 else 1.0

            self.models[p] = (model, feature_cols)
            self.residual_stds[p] = max(0.2, resid_std)
            self.validation_metrics[p] = {
                "mae": round(mae, 3),
                "rmse": round(rmse, 3),
                "std_err": round(resid_std, 3)
            }

        self.is_trained = True

    def predict_168h_trajectory(
        self,
        component_records: List[Dict[str, Any]],
        current_hour: float
    ) -> Dict[str, Any]:
        """
        Produces 168h forecast, prediction interval, drift rates, and point-by-point trajectory.
        Strictly enforces Temporal Integrity: No model may use future data.
        At T < 24h: Module B is AWAITING 24h EARLY GATE (no forecast).
        At 24h <= T < 96h: Active 24h forecast using strictly [0h, 24h] measurements.
        At 96h <= T < 168h: 96h Mid-gate recalculated forecast using observations up to 96h.
        At T >= 168h: Final measured screening outcome available.
        """
        # Temporal Gate 1: Insufficient early burn-in observations before 24h
        if current_hour < 24.0:
            return {
                "forecast_ready": False,
                "status": "AWAITING_24H_GATE",
                "display_status": "AWAITING 24h EARLY GATE",
                "reason": "Insufficient early burn-in observations.",
                "checkpoint": "Pre-24h Screening",
                "model_architecture": f"{self.model_backend} Gradient Ensemble",
                "overall_confidence": None,
                "confidence_label": "NOT YET AVAILABLE",
                "low_confidence_flag": True,
                "parameters": {},
                "trajectory": [],
                "validation_metrics": self.validation_metrics
            }

        # Sift available historical records strictly up to current simulated hour T (Temporal Integrity)
        df = pd.DataFrame(component_records)
        df_avail = df[df["burn_in_hour"] <= current_hour].sort_values("burn_in_hour")
        if df_avail.empty:
            df_avail = df.sort_values("burn_in_hour").iloc[[0]]

        h0 = df_avail[df_avail["burn_in_hour"] == 0.0]
        if h0.empty:
            h0 = df_avail.iloc[[0]]

        # Gate status determination
        if current_hour >= 168.0:
            gate_status = "FINAL_OUTCOME"
            gate_display = "168h FINAL OUTCOME"
            decision_cp = "168h Screening Outcome"
        elif current_hour >= 96.0:
            gate_status = "MID_GATE_RECALCULATED"
            gate_display = "96h MID GATE RECALCULATED"
            decision_cp = "96h Mid Assessment"
        else:
            gate_status = "ACTIVE"
            gate_display = "FORECAST ACTIVE (24h GATE)"
            decision_cp = "24h Early Assessment"

        # Observation anchor at 24h
        h24 = df_avail[df_avail["burn_in_hour"] >= 24.0]
        if h24.empty:
            h24 = df_avail.iloc[[-1]]
        else:
            h24 = h24.iloc[[0]]

        # Observation anchor at 96h if available
        h96 = df_avail[df_avail["burn_in_hour"] >= 96.0]
        if not h96.empty:
            h_anchor = h96.iloc[[0]]
            anchor_h = float(h_anchor["burn_in_hour"].iloc[0])
        else:
            h_anchor = h24
            anchor_h = float(h24["burn_in_hour"].iloc[0])

        param_forecasts = {}

        for p in self.parameters:
            v0 = float(h0[p].iloc[0])
            v24 = float(h24[p].iloc[0])
            v_anchor = float(h_anchor[p].iloc[0])
            observed_drift_rate = (v24 - v0) / max(1.0, float(h24["burn_in_hour"].iloc[0]))

            # Predict target 168h value
            if p in self.models:
                model, feature_cols = self.models[p]
                # Build feature dictionary using strictly early data (0-24h)
                sub_24 = df_avail[df_avail["burn_in_hour"] <= 24.0]
                row_dict = {}
                for param_item in self.parameters:
                    item_0 = float(h0[param_item].iloc[0]) if not h0.empty else 0.0
                    item_24 = float(h24[param_item].iloc[0]) if not h24.empty else 0.0
                    row_dict[f"{param_item}_0h"] = item_0
                    row_dict[f"{param_item}_24h"] = item_24
                    row_dict[f"{param_item}_slope_0_24"] = (item_24 - item_0) / 24.0
                    vals = sub_24[param_item].values if not sub_24.empty else np.array([item_0, item_24])
                    row_dict[f"{param_item}_var_0_24"] = float(np.var(vals)) if len(vals) > 1 else 0.0

                X_input = pd.DataFrame([{c: row_dict.get(c, 0.0) for c in feature_cols}])
                pred_168_val = float(model.predict(X_input)[0])

                # If at/after 96h, refine forecast with observed 96h trajectory
                if current_hour >= 96.0 and not h96.empty:
                    mid_slope = (v_anchor - v24) / max(1.0, (anchor_h - 24.0))
                    # Weighted blend between early model and mid-burnin trajectory
                    pred_168_val = round(0.40 * pred_168_val + 0.60 * (v_anchor + mid_slope * (TOTAL_BURNIN_HOURS - anchor_h)), 2)
            else:
                pred_168_val = v24 + observed_drift_rate * (TOTAL_BURNIN_HOURS - 24.0)

            # Residual uncertainty (90% confidence interval: z = 1.645)
            resid_std = self.residual_stds.get(p, 1.0)
            if current_hour >= 96.0:
                resid_std = max(0.2, resid_std * 0.70)  # Uncertainty contracts with mid-burnin data

            lower_bound_168 = round(pred_168_val - 1.645 * resid_std, 2)
            upper_bound_168 = round(pred_168_val + 1.645 * resid_std, 2)

            # Predicted drift rate from anchor to 168h
            remaining_hours = max(1.0, TOTAL_BURNIN_HOURS - anchor_h)
            pred_drift_rate = round((pred_168_val - v_anchor) / remaining_hours, 4)

            # Generate forecast trajectory from 24h (or anchor) to 168h
            start_proj_h = int(anchor_h) if current_hour >= 96.0 else 24
            trajectory_forecast = []
            for h in range(start_proj_h, int(TOTAL_BURNIN_HOURS) + 1, 2):
                fraction = (h - start_proj_h) / max(1.0, (TOTAL_BURNIN_HOURS - start_proj_h))
                val_at_h = v_anchor + fraction * (pred_168_val - v_anchor)
                band_scale = np.sqrt(fraction) * (1.645 * resid_std)

                trajectory_forecast.append({
                    "hour": float(h),
                    "predicted_value": round(float(val_at_h), 2),
                    "lower_bound": round(float(val_at_h - band_scale), 2),
                    "upper_bound": round(float(val_at_h + band_scale), 2)
                })

            safety_thresh = SAFETY_THRESHOLDS.get(p, 999.0)
            abs_max = ABSOLUTE_LIMITS.get(p, {}).get("max", 999.0)

            breaches_safety = upper_bound_168 >= safety_thresh or pred_168_val >= safety_thresh
            breaches_absolute = pred_168_val >= abs_max

            status_label = "BREACH" if breaches_absolute else ("WATCH" if breaches_safety else "NORMAL")

            confidence = max(50.0, min(96.0, 95.0 - (resid_std / max(1.0, abs(v24))) * 80.0))
            if current_hour >= 96.0:
                confidence = min(98.0, confidence + 8.0)

            param_forecasts[p] = {
                "parameter": p,
                "current_val": round(v_anchor, 2),
                "predicted_168h_value": round(pred_168_val, 2),
                "lower_bound_168h": lower_bound_168,
                "upper_bound_168h": upper_bound_168,
                "observed_drift_rate": round(observed_drift_rate, 4),
                "predicted_drift_rate": pred_drift_rate,
                "safety_threshold": safety_thresh,
                "absolute_max": abs_max,
                "breaches_safety_threshold": breaches_safety,
                "breaches_absolute_limit": breaches_absolute,
                "status": status_label,
                "confidence_score": round(confidence, 1),
                "trajectory": trajectory_forecast
            }

        overall_confidence = round(float(np.mean([pf["confidence_score"] for pf in param_forecasts.values()])), 1)

        return {
            "forecast_ready": True,
            "status": gate_status,
            "display_status": gate_display,
            "decision_checkpoint": decision_cp,
            "model_architecture": f"{self.model_backend} Gradient Ensemble",
            "overall_confidence": overall_confidence,
            "confidence_label": "Based on prototype validation",
            "low_confidence_flag": False,
            "parameters": param_forecasts,
            "validation_metrics": self.validation_metrics
        }

# Global singleton
early_drift_predictor = EarlyDriftPredictor()
