"""
Time-to-Risk Engine
Smart India Hackathon 2026 | Problem Statement SIH26170
Organization: Indian Space Research Organisation (ISRO)

Dynamically computes remaining operational burn-in hours until forecasted parametric
trajectories cross configured safety boundaries.
Never returns hardcoded static numbers.
"""

from typing import Dict, Any, Optional
from app.config import SAFETY_THRESHOLDS, ABSOLUTE_LIMITS, TOTAL_BURNIN_HOURS

class TimeToRiskEngine:
    """
    Computes remaining hours to risk condition from model forecast trajectories.
    """

    def calculate_time_to_risk(
        self,
        forecast_result: Dict[str, Any],
        current_hour: float
    ) -> Dict[str, Any]:
        """
        Evaluates hourly forecasted trajectory points against safety boundaries.
        Enforces Temporal Integrity:
        - At T < 24h: UNAVAILABLE / AWAITING EARLY DATA (Module B awaiting 24h gate).
        - At T >= 24h: Calculated strictly from early/mid-gate model forecast.
        - At limit breach: BREACHED.
        """
        if current_hour < 24.0 or not forecast_result.get("forecast_ready", False):
            return {
                "display_text": "UNAVAILABLE / AWAITING EARLY DATA",
                "hours_remaining": None,
                "projected_breach_hour": None,
                "critical_channel": None,
                "urgency": "LOW",
                "is_uncertain": False,
                "explanation": "Module B awaiting 24h early burn-in decision gate. Insufficient observations to project 168h trajectory."
            }

        if forecast_result.get("low_confidence_flag", False):
            return {
                "display_text": "UNCERTAIN",
                "hours_remaining": None,
                "projected_breach_hour": None,
                "critical_channel": None,
                "urgency": "HIGH",
                "is_uncertain": True,
                "explanation": "High residual variance. Model cannot reliably extrapolate without engineer review."
            }

        param_forecasts = forecast_result.get("parameters", {})
        earliest_breach_hour: Optional[float] = None
        critical_param: Optional[str] = None
        threshold_val = 0.0

        for param_name, p_data in param_forecasts.items():
            thresh = p_data.get("safety_threshold", 9999.0)
            trajectory = p_data.get("trajectory", [])

            for pt in trajectory:
                h = pt["hour"]
                # Evaluate both mean trajectory and upper uncertainty boundary
                val = pt["predicted_value"]
                upper_bound = pt["upper_bound"]

                # If the predicted value (or upper 90% envelope) crosses the safety boundary
                if val >= thresh or upper_bound >= thresh:
                    if earliest_breach_hour is None or h < earliest_breach_hour:
                        earliest_breach_hour = h
                        critical_param = param_name
                        threshold_val = thresh
                    break

        if earliest_breach_hour is None:
            return {
                "display_text": "> 168 h",
                "hours_remaining": "> 168 h",
                "projected_breach_hour": None,
                "critical_channel": None,
                "urgency": "LOW",
                "is_uncertain": False,
                "explanation": "Component is projected to remain within configured safety envelope through full 168h screening."
            }

        # Hours remaining from current hour
        hours_remaining = max(0.0, round(earliest_breach_hour - current_hour, 1))

        # Categorize urgency
        if hours_remaining <= 30.0:
            urgency = "CRITICAL"
        elif hours_remaining <= 72.0:
            urgency = "WARNING"
        else:
            urgency = "ELEVATED"

        display_text = f"{int(round(hours_remaining))} h" if hours_remaining > 0 else "BREACHED"

        return {
            "display_text": display_text,
            "hours_remaining": hours_remaining,
            "projected_breach_hour": earliest_breach_hour,
            "critical_channel": critical_param,
            "threshold_val": threshold_val,
            "urgency": urgency,
            "is_uncertain": False,
            "explanation": f"Trajectory on channel '{critical_param}' projected to breach configured safety limit ({threshold_val}) at hour {earliest_breach_hour} ({display_text} remaining)."
        }

# Global singleton
time_to_risk_engine = TimeToRiskEngine()
