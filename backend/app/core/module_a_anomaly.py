"""
Module A: Dynamic Outlier Detection Engine
Smart India Hackathon 2026 | Problem Statement SIH26170
Organization: Indian Space Research Organisation (ISRO)

Combines:
1. Robust Statistical Deviation (MAD-based Z-scores)
2. Lot-Relative Envelope Deviation
3. Trend / Slope Divergence
4. Multivariate Isolation Forest
Outputs:
- anomaly_score: 0–100
- lot_deviation_score: 0–100
- risk_state: NORMAL, WATCH, HIGH RISK
- anomaly_types: List[str]
- parameter_contributions: Dict[str, float]
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from app.config import ABSOLUTE_LIMITS

class DynamicAnomalyEngine:
    """
    Hybrid lot-relative anomaly detector designed for semiconductor burn-in screening.
    """

    def __init__(self):
        self.iforest_models: Dict[str, IsolationForest] = {}
        self.parameters = ["temperature", "standby_current", "voltage", "current", "power"]

    def fit_lot_models(self, records: List[Dict[str, Any]]):
        """
        Fits Isolation Forest models per lot using early (0-24h) multi-parametric features.
        """
        df = pd.DataFrame(records)
        lots = df["lot_id"].unique()

        for lot_id in lots:
            lot_df = df[(df["lot_id"] == lot_id) & (df["burn_in_hour"] <= 24.0)]
            # Group by component and extract feature vector: initial, 24h, and delta
            feature_rows = []
            for comp_id, group in lot_df.groupby("component_id"):
                row = {"component_id": comp_id}
                for param in self.parameters:
                    vals = group[param].values
                    row[f"{param}_mean"] = float(np.mean(vals)) if len(vals) > 0 else 0.0
                    row[f"{param}_std"] = float(np.std(vals)) if len(vals) > 0 else 0.0
                    row[f"{param}_delta"] = float(vals[-1] - vals[0]) if len(vals) > 1 else 0.0
                feature_rows.append(row)

            if len(feature_rows) >= 5:
                feat_df = pd.DataFrame(feature_rows).drop(columns=["component_id"])
                clf = IsolationForest(
                    n_estimators=100,
                    contamination=0.10,
                    random_state=42
                )
                clf.fit(feat_df)
                self.iforest_models[lot_id] = (clf, list(feat_df.columns))

    def evaluate_component(
        self,
        component_records: List[Dict[str, Any]],
        lot_fingerprint: Dict[str, Any],
        current_hour: float
    ) -> Dict[str, Any]:
        """
        Evaluates a component up to current_hour.
        """
        if not component_records:
            return {
                "anomaly_score": 0.0,
                "lot_deviation_score": 0.0,
                "risk_state": "NORMAL",
                "anomaly_types": [],
                "absolute_limit_status": "PASS",
                "abnormal_while_under_limit": False,
                "contributions": {}
            }

        df = pd.DataFrame(component_records)
        df = df[df["burn_in_hour"] <= current_hour].sort_values("burn_in_hour")
        if df.empty:
            df = pd.DataFrame(component_records).iloc[[-1]]

        latest = df.iloc[-1]
        lot_id = latest["lot_id"]

        # 1. Absolute Limit Check
        abs_breached = False
        abs_breach_reasons = []
        for param, lim in ABSOLUTE_LIMITS.items():
            if param in latest:
                val = float(latest[param])
                if val < lim["min"] or val > lim["max"]:
                    abs_breached = True
                    abs_breach_reasons.append(f"{param} ({val} {lim['unit']}) breached absolute limit [{lim['min']} - {lim['max']}]")

        abs_status = "BREACHED" if abs_breached else "PASS"

        # 2. Robust Lot-Relative Z-Scores & Envelope Deviations
        param_z_scores = {}
        envelope_violations = {}
        drift_rate_deviations = {}
        contributions = {}

        for param in self.parameters:
            val = float(latest[param])
            lot_param_info = lot_fingerprint.get("parameters", {}).get(param, {})
            trajectory = lot_param_info.get("trajectory", [])

            if trajectory:
                closest = min(trajectory, key=lambda x: abs(x["hour"] - current_hour))
                med = closest["median"]
                mad = max(closest["mad"], 1e-4)
                lower_env = closest["lower_envelope"]
                upper_env = closest["upper_envelope"]

                # Robust Z-score: (val - median) / (1.4826 * MAD)
                robust_z = abs(val - med) / (1.4826 * mad)
                param_z_scores[param] = float(robust_z)

                # Envelope violation ratio
                if val > upper_env:
                    violation = (val - upper_env) / (upper_env - med + 1e-4)
                elif val < lower_env:
                    violation = (lower_env - val) / (med - lower_env + 1e-4)
                else:
                    violation = 0.0
                envelope_violations[param] = float(max(0.0, violation))

                # Trend / Slope deviation
                if len(df) >= 2:
                    dt = max(1.0, float(df.iloc[-1]["burn_in_hour"] - df.iloc[0]["burn_in_hour"]))
                    observed_slope = (val - float(df.iloc[0][param])) / dt
                    lot_median_slope = float(lot_param_info.get("median_drift_rate", 0.0))
                    drift_rate_deviations[param] = abs(observed_slope - lot_median_slope)
                else:
                    drift_rate_deviations[param] = 0.0

                # Parameter contribution weight
                weight = 1.3 if param in ["temperature", "standby_current"] else 1.0
                contributions[param] = float(round(robust_z * weight, 2))

        # 3. Isolation Forest scoring
        iforest_score_norm = 0.0
        if lot_id in self.iforest_models and len(df) >= 2:
            clf, feature_cols = self.iforest_models[lot_id]
            feat_dict = {}
            for param in self.parameters:
                vals = df[param].values
                feat_dict[f"{param}_mean"] = float(np.mean(vals))
                feat_dict[f"{param}_std"] = float(np.std(vals))
                feat_dict[f"{param}_delta"] = float(vals[-1] - vals[0])

            # Prepare 1-row DataFrame aligned with training columns
            x_row = pd.DataFrame([{col: feat_dict.get(col, 0.0) for col in feature_cols}])
            # decision_function gives anomaly score: negative for anomaly
            raw_score = clf.decision_function(x_row)[0]
            # Normalize to 0-100 where higher means more anomalous
            iforest_score_norm = float(np.clip((0.15 - raw_score) * 250.0, 0.0, 100.0))

        # 4. Synthesize Lot-Relative Deviation Score (0 - 100)
        # Based on maximum parameter robust Z and envelope violation
        max_z = max(param_z_scores.values()) if param_z_scores else 0.0
        max_envelope_viol = max(envelope_violations.values()) if envelope_violations else 0.0
        
        # Raw MAD calculation across parameters: max |val - med| / mad
        max_raw_mad = 0.0
        for param in self.parameters:
            val = float(latest[param])
            lot_param_info = lot_fingerprint.get("parameters", {}).get(param, {})
            traj = lot_param_info.get("trajectory", [])
            if traj:
                closest = min(traj, key=lambda x: abs(x["hour"] - current_hour))
                med = closest["median"]
                mad = max(closest["mad"], 1e-4)
                raw_mad = abs(val - med) / mad
                if raw_mad > max_raw_mad:
                    max_raw_mad = raw_mad

        # Mapping: robust Z of 2.5 ~ 40, Z of 4.0 ~ 75, Z of 6+ ~ 95+
        lot_deviation_score = float(np.clip(
            (max_z / 3.5) * 45.0 + (max_envelope_viol * 35.0),
            0.0, 100.0
        ))

        # 5. Specialized Physical Failure Mode Boosts
        # 5a. Voltage instability via rolling variance
        v_boost = 0.0
        if len(df) >= 4:
            v_var = float(np.var(df["voltage"].values[-8:]))
            if v_var > 0.00008:
                # Nominal variance is ~0.000025; 0.00008+ indicates regulator jitter
                v_boost = float(np.clip((v_var - 0.00006) / 0.00025 * 55.0 + 30.0, 0.0, 85.0))

        # 5b. Slope / Drift acceleration significance (damped at very early hours to reject finite-difference noise)
        time_factor = float(min(1.0, max(0.0, (current_hour - 6.0) / 10.0)))
        t_slope = drift_rate_deviations.get("temperature", 0.0)
        leak_slope = drift_rate_deviations.get("standby_current", 0.0)
        curr_slope = drift_rate_deviations.get("current", 0.0)
        max_drift_sig = max(t_slope / 0.04, leak_slope / 0.05, curr_slope / 0.08)
        slope_boost = float(np.clip(max_drift_sig * 16.0 * time_factor, 0.0, 75.0)) if max_drift_sig > 1.5 else 0.0

        # 5c. Correlated multivariate drift boost (requires true anomalous Z >= 2.2 across multiple channels)
        elevated_params = [k for k, z in param_z_scores.items() if z >= 2.2]
        multi_boost = float(min(35.0, len(elevated_params) * 12.0)) if len(elevated_params) >= 2 else 0.0

        # 6. Synthesize Combined Anomaly Score (0 - 100)
        max_slope_dev = max(drift_rate_deviations.values()) if drift_rate_deviations else 0.0
        base_slope_score = float(np.clip(max_slope_dev * 80.0, 0.0, 100.0))

        base_combined = (
            0.50 * lot_deviation_score +
            0.30 * iforest_score_norm +
            0.20 * base_slope_score
        )
        physical_guided = (lot_deviation_score * 0.55) + (slope_boost * 0.35) + multi_boost
        combined_anomaly_score = max(base_combined, v_boost, physical_guided)

        if abs_breached:
            combined_anomaly_score = max(combined_anomaly_score, 95.0)

        anomaly_score = round(float(np.clip(combined_anomaly_score, 0.0, 100.0)), 1)
        lot_deviation_score = round(lot_deviation_score, 1)
        raw_mad_deviation = round(float(max_raw_mad), 2)

        # Interpretation of Lot Deviation Score & Raw MAD
        if lot_deviation_score < 25.0:
            deviation_interpretation = "NORMAL"
            deviation_explanation = "Parametric dispersion is within expected lot process variations."
        elif lot_deviation_score < 45.0:
            deviation_interpretation = "ELEVATED"
            deviation_explanation = "Slight variance from lot median; acceptable without active drift."
        elif lot_deviation_score < 65.0:
            deviation_interpretation = "HIGH"
            deviation_explanation = "Significant statistical departure from lot envelope; requires close tracking."
        else:
            deviation_interpretation = "CRITICAL"
            deviation_explanation = "Severe statistical outlier; high probability of latent silicon defect."

        # Determine Risk State
        if anomaly_score >= 65.0 or abs_breached:
            risk_state = "HIGH RISK"
        elif anomaly_score >= 35.0:
            risk_state = "WATCH"
        else:
            risk_state = "NORMAL"

        # Classify Anomaly Types
        anomaly_types = []
        if (param_z_scores.get("temperature", 0.0) > 2.2 and t_slope > 0.06) or t_slope > 0.10:
            anomaly_types.append("THERMAL DRIFT")
        if (param_z_scores.get("standby_current", 0.0) > 2.2 and leak_slope > 0.08) or leak_slope > 0.15:
            anomaly_types.append("CURRENT DRIFT")
        if v_boost > 0.0 or (len(df) >= 4 and float(np.var(df["voltage"].values[-8:])) > 0.00008):
            anomaly_types.append("VOLTAGE INSTABILITY")
        if len(elevated_params) >= 2 or multi_boost > 0.0:
            anomaly_types.append("CORRELATED PARAMETER SHIFT")

        # Check for intermittent anomaly
        diffs = np.abs(np.diff(df["standby_current"].values)) if len(df) >= 4 else []
        if len(diffs) > 0 and np.max(diffs) > 3.0 and anomaly_score < 60.0:
            anomaly_types.append("INTERMITTENT ANOMALY")

        # Normal fallback if empty
        if not anomaly_types and risk_state == "NORMAL":
            anomaly_types.append("NOMINAL PROCESS VARIATION")

        # The Crucial Insight: Abnormal while under absolute limit
        abnormal_while_under_limit = (abs_status == "PASS") and (anomaly_score >= 40.0 or lot_deviation_score >= 40.0)
        lot_relative_status = "ANOMALOUS" if (lot_deviation_score >= 45.0 or anomaly_score >= 45.0) else ("ELEVATED" if lot_deviation_score >= 25.0 else "CONFORMING")

        return {
            "anomaly_score": anomaly_score,
            "lot_deviation_score": lot_deviation_score,
            "raw_mad_deviation": raw_mad_deviation,
            "deviation_interpretation": deviation_interpretation,
            "deviation_explanation": deviation_explanation,
            "risk_state": risk_state,
            "lot_relative_status": lot_relative_status,
            "anomaly_types": anomaly_types,
            "absolute_limit_status": abs_status,
            "absolute_breaches": abs_breach_reasons,
            "abnormal_while_under_limit": abnormal_while_under_limit,
            "contributions": contributions,
            "param_z_scores": {k: round(v, 2) for k, v in param_z_scores.items()},
            "slope_deviations": {k: round(v, 4) for k, v in drift_rate_deviations.items()}
        }

# Global singleton
dynamic_anomaly_engine = DynamicAnomalyEngine()
