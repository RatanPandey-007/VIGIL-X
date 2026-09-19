"""
Data Quality Gate
Smart India Hackathon 2026 | Problem Statement SIH26170
Validates telemetry prior to ML inference, distinguishing between sensor glitches and physical component drift.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from app.config import ABSOLUTE_LIMITS

class DataQualityGate:
    """
    Evaluates raw burn-in telemetry streams against physics and sensory bounds:
    - Missing samples / timestamp drops
    - Duplicate or out-of-order timestamps
    - Non-physical values (e.g., negative leakage, extreme voltage jumps)
    - Sensor noise / sporadic single-sample spikes vs true multi-hour drift
    """

    def __init__(self):
        self.spike_threshold_z = 3.5

    def evaluate_component_telemetry(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluate a time-series list of telemetry records for a single component.
        """
        if not records:
            return {
                "status": "INVALID",
                "quality_score": 0.0,
                "issues": ["No telemetry records provided."],
                "sensor_noise_flag": False,
                "valid_sample_count": 0
            }

        df = pd.DataFrame(records)
        issues = []
        status = "GOOD"
        quality_score = 100.0
        sensor_noise_flag = False

        # 1. Check order and duplicate hours
        if "burn_in_hour" in df.columns:
            hours = df["burn_in_hour"].values
            # Check monotonic increasing
            if not np.all(np.diff(hours) >= 0):
                issues.append("Out-of-order burn-in timestamps detected.")
                quality_score -= 15.0
                status = "WARNING"
            
            # Check duplicates
            if len(hours) != len(np.unique(hours)):
                issues.append("Duplicate burn-in hour samples detected and deduplicated.")
                quality_score -= 10.0
                status = "WARNING"
                df = df.drop_duplicates(subset=["burn_in_hour"]).sort_values("burn_in_hour")

        # 2. Check missing values
        expected_cols = ["temperature", "standby_current", "voltage", "current", "power"]
        missing_counts = df[expected_cols].isnull().sum()
        total_missing = int(missing_counts.sum())
        if total_missing > 0:
            issues.append(f"Missing parametric values in stream ({total_missing} cells).")
            quality_score -= min(30.0, total_missing * 5.0)
            status = "WARNING"

        # 3. Check physical validity (impossible values)
        for col in expected_cols:
            if col in df.columns:
                vals = df[col].dropna()
                if col == "voltage" and (vals < 0).any():
                    issues.append("Impossible negative voltage observed.")
                    quality_score -= 40.0
                    status = "INVALID"
                elif col == "standby_current" and (vals < 0).any():
                    issues.append("Impossible negative leakage current observed.")
                    quality_score -= 40.0
                    status = "INVALID"
                elif col == "temperature" and ((vals < -40) | (vals > 250)).any():
                    issues.append("Out-of-physical-range temperature sensor reading.")
                    quality_score -= 35.0
                    status = "INVALID"

        # 4. Sensor noise vs physical degradation distinction
        # Physical degradation displays persistent multi-step directional drift or increased variance.
        # Sensor noise manifests as an isolated 1-sample spike that immediately returns to baseline.
        for col in ["temperature", "standby_current", "current"]:
            if col in df.columns and len(df) >= 4:
                series = df[col].values
                diffs = np.abs(np.diff(series))
                if len(diffs) > 2:
                    median_diff = np.median(diffs)
                    mad_diff = np.median(np.abs(diffs - median_diff)) + 1e-6
                    spike_indices = np.where(diffs > (median_diff + self.spike_threshold_z * mad_diff))[0]
                    
                    for idx in spike_indices:
                        # Check if it reverts immediately on next step
                        if idx + 2 < len(series):
                            step1 = series[idx + 1] - series[idx]
                            step2 = series[idx + 2] - series[idx + 1]
                            if np.sign(step1) != np.sign(step2) and abs(step2) > 0.8 * abs(step1):
                                sensor_noise_flag = True
                                issues.append(f"Isolated single-sample sensor glitch detected on channel '{col}' at hour {df['burn_in_hour'].iloc[idx+1]}.")
                                quality_score = max(50.0, quality_score - 10.0)
                                if status == "GOOD":
                                    status = "WARNING"

        quality_score = round(max(0.0, min(100.0, quality_score)), 1)
        if quality_score < 50.0:
            status = "INVALID"

        return {
            "status": status,
            "quality_score": quality_score,
            "issues": issues if issues else ["Telemetry passed all sensory and physical consistency gates."],
            "sensor_noise_flag": sensor_noise_flag,
            "valid_sample_count": len(df)
        }

# Global singleton
data_quality_gate = DataQualityGate()
