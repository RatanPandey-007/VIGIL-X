"""
Lot Reliability Fingerprint Engine
Smart India Hackathon 2026 | Problem Statement SIH26170
Extracts robust lot-level baselines (median, MAD, envelope, drift, correlations)
ensuring latent defective components cannot corrupt the baseline.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from app.config import ABSOLUTE_LIMITS

class LotFingerprintEngine:
    """
    Computes time-indexed robust parametric envelopes and correlation profiles for production lots.
    Uses median and MAD (Median Absolute Deviation) instead of mean and standard deviation.
    """

    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def compute_lot_fingerprints(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Processes multi-lot records and stores robust fingerprint profiles.
        """
        df = pd.DataFrame(records)
        lots = df["lot_id"].unique()
        parameters = ["temperature", "standby_current", "voltage", "current", "power"]
        
        fingerprints = {}

        for lot_id in lots:
            lot_df = df[df["lot_id"] == lot_id]
            hours = sorted(lot_df["burn_in_hour"].unique())
            num_components = lot_df["component_id"].nunique()

            param_profiles = {}
            for param in parameters:
                param_series_by_hour = []
                for h in hours:
                    h_vals = lot_df[lot_df["burn_in_hour"] == h][param].dropna().values
                    if len(h_vals) == 0:
                        continue
                    med = float(np.median(h_vals))
                    # Robust MAD calculation
                    mad = float(np.median(np.abs(h_vals - med)))
                    if mad < 1e-4:
                        mad = float(np.std(h_vals) if np.std(h_vals) > 1e-4 else 0.1)

                    # Robust 2.5 MAD boundary (approx. 99% coverage under normality without outlier corruption)
                    lower_env = float(med - 2.5 * 1.4826 * mad)
                    upper_env = float(med + 2.5 * 1.4826 * mad)

                    param_series_by_hour.append({
                        "hour": float(h),
                        "median": round(med, 3),
                        "mad": round(mad, 3),
                        "lower_envelope": round(lower_env, 3),
                        "upper_envelope": round(upper_env, 3)
                    })

                # Compute median drift rate over 168h
                if len(param_series_by_hour) >= 2:
                    val_0 = param_series_by_hour[0]["median"]
                    val_end = param_series_by_hour[-1]["median"]
                    h_end = param_series_by_hour[-1]["hour"]
                    median_drift_rate = (val_end - val_0) / max(1.0, h_end)
                else:
                    median_drift_rate = 0.0

                param_profiles[param] = {
                    "trajectory": param_series_by_hour,
                    "median_drift_rate": round(float(median_drift_rate), 4),
                    "absolute_limit": ABSOLUTE_LIMITS.get(param, {}),
                    "summary_baseline": {
                        "initial_median": param_series_by_hour[0]["median"] if param_series_by_hour else 0.0,
                        "initial_mad": param_series_by_hour[0]["mad"] if param_series_by_hour else 0.0,
                        "final_median": param_series_by_hour[-1]["median"] if param_series_by_hour else 0.0,
                    }
                }

            # Parameter Correlation Matrix across lot (at 24h checkpoint)
            h24_df = lot_df[lot_df["burn_in_hour"] == 24.0][parameters]
            if len(h24_df) > 3:
                corr_matrix = h24_df.corr().round(3).to_dict()
            else:
                corr_matrix = {}

            fingerprints[lot_id] = {
                "lot_id": lot_id,
                "component_count": int(num_components),
                "evaluated_hours": len(hours),
                "parameters": param_profiles,
                "correlations": corr_matrix,
                "timestamp_updated": pd.Timestamp.utcnow().isoformat()
            }

        self._cache = fingerprints
        return fingerprints

    def get_lot_fingerprint(self, lot_id: str) -> Optional[Dict[str, Any]]:
        return self._cache.get(lot_id)

    def get_envelope_at_hour(self, lot_id: str, param: str, hour: float) -> Dict[str, float]:
        """
        Interpolates or returns the envelope for a lot parameter at a given hour.
        """
        lot_data = self._cache.get(lot_id)
        if not lot_data or param not in lot_data["parameters"]:
            return {"median": 0.0, "lower": 0.0, "upper": 0.0, "mad": 0.0}

        trajectory = lot_data["parameters"][param]["trajectory"]
        # Exact match or nearest
        closest = min(trajectory, key=lambda x: abs(x["hour"] - hour))
        return {
            "median": closest["median"],
            "lower": closest["lower_envelope"],
            "upper": closest["upper_envelope"],
            "mad": closest["mad"]
        }

# Global singleton instance
lot_fingerprint_engine = LotFingerprintEngine()
