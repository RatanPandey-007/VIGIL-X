"""
Screening Decision Engine
Smart India Hackathon 2026 | Problem Statement SIH26170
Organization: Indian Space Research Organisation (ISRO)

Synthesizes multi-tier inputs:
- Absolute Engineering Limits
- Dynamic Lot-Relative Anomaly Score
- Predicted 168h Endpoint & Safety Breach
- Time-to-Risk Urgency
- Model Confidence Level
Produces:
- Decision: ACCEPT | WATCH | HOLD / REVIEW
- Rule-based rationale ("WHY THIS DECISION?")
- Space compliance disclaimer
"""

from typing import Dict, Any

class ScreeningDecisionEngine:
    """
    Transparent rule-based decision arbiter enforcing space-grade quality criteria.
    Never acts as an unverified black box.
    """

    def evaluate_decision(
        self,
        anomaly_eval: Dict[str, Any],
        forecast_eval: Dict[str, Any],
        time_to_risk: Dict[str, Any],
        data_quality: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Determines component screening status.
        """
        # 1. Data Quality Gate Pre-check
        if data_quality.get("status") == "INVALID":
            return {
                "decision": "HOLD / REVIEW",
                "risk_score": 90.0,
                "confidence": 30.0,
                "applied_rule": "DQ-01: Severe Telemetry Data Quality Corruption",
                "plain_english_rationale": "Sensor stream failed data quality gates (missing or physically impossible values). Immediate manual laboratory review required.",
                "disclaimer": "AI-ASSISTED SCREENING RECOMMENDATION. Manual engineer sign-off mandatory."
            }

        abs_status = anomaly_eval.get("absolute_limit_status", "PASS")
        anomaly_score = anomaly_eval.get("anomaly_score", 0.0)
        lot_dev_score = anomaly_eval.get("lot_deviation_score", 0.0)
        abnormal_under_limit = anomaly_eval.get("abnormal_while_under_limit", False)
        
        confidence = forecast_eval.get("overall_confidence", 85.0)
        low_confidence = forecast_eval.get("low_confidence_flag", False) or time_to_risk.get("is_uncertain", False)

        ttr_hours = time_to_risk.get("hours_remaining")
        ttr_urgency = time_to_risk.get("urgency", "LOW")

        # Check if any parameter breaches safety threshold at 168h (only applicable once forecast is ready)
        forecast_ready = forecast_eval.get("forecast_ready", False)
        param_forecasts = forecast_eval.get("parameters", {})
        breaches_168h = forecast_ready and any(p.get("breaches_safety_threshold", False) for p in param_forecasts.values())

        # Synthesize composite risk score (0-100)
        base_risk = 0.40 * anomaly_score + 0.35 * lot_dev_score
        if breaches_168h:
            base_risk += 25.0
        if abs_status in ["FAIL", "BREACHED"]:
            base_risk = 100.0
        risk_score = round(float(min(100.0, max(0.0, base_risk))), 1)

        # 2. Rule 1: Hard Absolute Limit Breach
        if abs_status in ["FAIL", "BREACHED"]:
            return {
                "decision": "HOLD / REVIEW",
                "risk_score": 100.0,
                "confidence": 99.0,
                "applied_rule": "CRIT-01: Absolute Engineering Limit Breach",
                "plain_english_rationale": f"Component reached SIMULATED LIMIT BREACH: {', '.join(anomaly_eval.get('absolute_breaches', []))}. Immediate test-rig isolation required.",
                "disclaimer": "AI-ASSISTED SCREENING RECOMMENDATION. Formal qualification protocol required."
            }

        # 3. Rule 2: Low Confidence Forecast
        if low_confidence and anomaly_score > 35.0 and forecast_ready:
            return {
                "decision": "HOLD / REVIEW",
                "risk_score": max(risk_score, 65.0),
                "confidence": confidence,
                "applied_rule": "UNCERT-02: Low Model Confidence on Anomalous Trend",
                "plain_english_rationale": "High residual uncertainty in ML extrapolation. Model cannot confirm long-term stability. Hold for manual lab re-measurement.",
                "disclaimer": "AI-ASSISTED SCREENING RECOMMENDATION. Never auto-certify high-uncertainty units."
            }

        # 4. Rule 3: Lot Relative Anomaly + Predicted 168h Risk (The Hero Case!)
        if abnormal_under_limit and (breaches_168h or ttr_urgency in ["CRITICAL", "WARNING"] or anomaly_score >= 60.0):
            return {
                "decision": "HOLD / REVIEW",
                "risk_score": max(risk_score, 75.0),
                "confidence": confidence,
                "applied_rule": "DYNAMIC-03: Lot-Relative Outlier with Early Drift Divergence",
                "plain_english_rationale": (
                    f"Component remains inside absolute limits, but exhibits severe lot-relative divergence "
                    f"(Lot Deviation: {lot_dev_score}/100, Anomaly Score: {anomaly_score}/100). "
                    f"Forecast predicts safety boundary breach at 168h (Time-to-Risk: {time_to_risk.get('display_text')}). "
                    f"Recommend early screening quarantine before infant mortality in assembly."
                ),
                "disclaimer": "AI-ASSISTED SCREENING RECOMMENDATION. Early-screening prioritization."
            }

        # 5. Rule 3B: Module A Low/Mod + Module B High Risk Interplay
        if anomaly_score < 50.0 and breaches_168h and forecast_ready:
            return {
                "decision": "WATCH",
                "risk_score": max(risk_score, 55.0),
                "confidence": confidence,
                "applied_rule": "PRED-04: Early Trajectory Drift Risk (Module B Divergence)",
                "plain_english_rationale": (
                    f"Current behavior remains near the lot-normal region (Module A: {anomaly_score}/100), "
                    f"but the observed early trajectory indicates elevated future drift risk "
                    f"(Time-to-Risk: {time_to_risk.get('display_text')}). Checkpoint monitoring scheduled."
                ),
                "disclaimer": "AI-ASSISTED SCREENING RECOMMENDATION."
            }

        # 6. Rule 4: Moderate lot deviation or early watch flags
        if anomaly_score >= 35.0 or lot_dev_score >= 35.0 or breaches_168h:
            return {
                "decision": "WATCH",
                "risk_score": max(risk_score, 45.0),
                "confidence": confidence,
                "applied_rule": "WATCH-05: Mild Parametric Drift / Elevated Dispersion",
                "plain_english_rationale": (
                    f"Component shows mild lot divergence (Score: {anomaly_score}/100). "
                    f"Current trajectory remains compliant but requires frequent checkpoint monitoring at 96h."
                ),
                "disclaimer": "AI-ASSISTED SCREENING RECOMMENDATION."
            }

        # 7. Rule 5: Conforming / Nominal Lot Status
        is_elevated_lot = (anomaly_eval.get("lot_relative_status") in ["ELEVATED", "ANOMALOUS"]) or (lot_dev_score >= 25.0)
        raw_mad = anomaly_eval.get("raw_mad_deviation", 0.0)

        if is_elevated_lot:
            if not forecast_ready:
                nom_rule = "NOMINAL-05: Elevated Lot Dispersion (Pre-24h Phase)"
                nom_rationale = (
                    f"Component exhibits elevated dispersion relative to lot median (Lot Deviation: {lot_dev_score}/100, "
                    f"Raw: {raw_mad} MAD), but parametric trajectory remains stable and compliant. Module B awaiting 24h early decision gate."
                )
            else:
                nom_rule = "NOMINAL-05: Elevated Lot Dispersion with Conforming 168h Forecast"
                nom_rationale = (
                    f"Component exhibits elevated dispersion relative to lot median (Lot Deviation: {lot_dev_score}/100, "
                    f"Raw: {raw_mad} MAD), but parametric trajectory remains stable and compliant with 168h screening boundaries."
                )
        else:
            if not forecast_ready:
                nom_rule = "NOMINAL-06: High Lot Conformance (Pre-24h Phase)"
                nom_rationale = (
                    f"Component trajectory closely tracks lot median envelope (Anomaly Score: {anomaly_score}/100, "
                    f"Lot Deviation: {lot_dev_score}/100). Module B awaiting 24h early decision gate."
                )
            else:
                nom_rule = "NOMINAL-06: High Lot Conformance & Stable 168h Trajectory"
                nom_rationale = (
                    f"Component trajectory closely tracks lot median envelope (Anomaly Score: {anomaly_score}/100, "
                    f"Lot Deviation: {lot_dev_score}/100). 168h forecast indicates safe margin with high confidence."
                )

        return {
            "decision": "ACCEPT",
            "risk_score": min(risk_score, 20.0),
            "confidence": confidence if forecast_ready else None,
            "applied_rule": nom_rule,
            "plain_english_rationale": nom_rationale,
            "disclaimer": "AI-ASSISTED SCREENING RECOMMENDATION."
        }

# Global singleton
screening_decision_engine = ScreeningDecisionEngine()
