"""
VIGIL-X Backend API Endpoints
Smart India Hackathon 2026 | Problem Statement SIH26170
Organization: Indian Space Research Organisation (ISRO)
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.simulation.live_engine import live_sim_controller
from app.core.lot_fingerprint import lot_fingerprint_engine
from app.core.model_validation import model_validation_engine
from app.config import HERO_COMPONENT_ID, ABSOLUTE_LIMITS, SAFETY_THRESHOLDS

router = APIRouter()

class SpeedRequest(BaseModel):
    speed: int

class StepRequest(BaseModel):
    hour: float

class DefectRequest(BaseModel):
    component_id: Optional[str] = HERO_COMPONENT_ID

@router.get("/health")
def get_health():
    """System health & readiness check."""
    return {
        "status": "HEALTHY",
        "system": "VIGIL-X Dynamic Reliability Sentinel",
        "sih_problem_statement": "SIH26170 (ISRO)",
        "mode": "SIMULATION / RESEARCH PROTOTYPE",
        "engine_initialized": live_sim_controller.initialized,
        "current_hour": live_sim_controller.current_hour,
        "is_running": live_sim_controller.is_running
    }

@router.get("/metrics")
def get_system_metrics():
    """System-level overview KPIs for Overview Command Center."""
    return live_sim_controller.get_system_summary()

@router.get("/components")
def get_all_components(lot_id: Optional[str] = None):
    """List all evaluated components at current burn-in hour, with optional lot filter."""
    summary = live_sim_controller.get_system_summary()
    components = summary.get("components", [])
    if lot_id:
        components = [c for c in components if c["lot_id"] == lot_id]
    return {
        "current_hour": summary["current_hour"],
        "total_count": len(components),
        "components": components
    }

@router.get("/components/{component_id}")
def get_component_details(component_id: str):
    """Deep-dive forensic telemetry and evaluation for a specific component."""
    res = live_sim_controller.get_component_evaluation(component_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.get("/lots")
def get_all_lots():
    """Robust Lot Reliability Fingerprints across all production lots."""
    live_sim_controller.update_clock()
    cached_lots = lot_fingerprint_engine._cache
    summary = live_sim_controller.get_system_summary()
    
    # Calculate counts per lot
    lot_stats = {}
    for c in summary.get("components", []):
        lid = c["lot_id"]
        if lid not in lot_stats:
            lot_stats[lid] = {"total": 0, "normal": 0, "watch": 0, "high_risk": 0, "outliers": 0}
        lot_stats[lid]["total"] += 1
        if c["decision"] == "ACCEPT":
            lot_stats[lid]["normal"] += 1
        elif c["decision"] == "WATCH":
            lot_stats[lid]["watch"] += 1
        else:
            lot_stats[lid]["high_risk"] += 1
        if c["anomaly_score"] >= 35.0:
            lot_stats[lid]["outliers"] += 1

    lots_output = []
    for lid, fp in cached_lots.items():
        stats = lot_stats.get(lid, {"total": fp.get("component_count", 0), "normal": 0, "watch": 0, "high_risk": 0, "outliers": 0})
        lots_output.append({
            "lot_id": lid,
            "component_count": stats["total"],
            "normal_count": stats["normal"],
            "watch_count": stats["watch"],
            "high_risk_count": stats["high_risk"],
            "outlier_count": stats["outliers"],
            "parameters": fp.get("parameters", {}),
            "correlations": fp.get("correlations", {})
        })

    return {
        "current_hour": live_sim_controller.current_hour,
        "lots": lots_output
    }

@router.get("/burnin/{component_id}")
def get_burnin_telemetry(component_id: str):
    """Raw and processed burn-in parametric timeline up to current hour."""
    eval_res = live_sim_controller.get_component_evaluation(component_id)
    if "error" in eval_res:
        raise HTTPException(status_code=404, detail=eval_res["error"])
    return {
        "component_id": component_id,
        "current_hour": eval_res["current_hour"],
        "records": eval_res["records_history"]
    }

@router.get("/alerts")
def get_active_alerts():
    """List all active anomalous alerts and screening flags."""
    summary = live_sim_controller.get_system_summary()
    alerts = []
    for c in summary.get("components", []):
        if c["decision"] in ["WATCH", "HOLD / REVIEW"] or c["anomaly_score"] >= 35.0:
            alerts.append({
                "component_id": c["component_id"],
                "lot_id": c["lot_id"],
                "hour": summary["current_hour"],
                "decision": c["decision"],
                "risk_score": c["risk_score"],
                "anomaly_score": c["anomaly_score"],
                "lot_deviation_score": c["lot_deviation_score"],
                "abnormal_under_limit": c["abnormal_while_under_limit"],
                "anomaly_types": c["anomaly_types"],
                "time_to_risk": c["time_to_risk"]
            })
    # Sort descending by risk score
    alerts.sort(key=lambda x: x["risk_score"], reverse=True)
    return {
        "current_hour": summary["current_hour"],
        "alert_count": len(alerts),
        "alerts": alerts
    }

@router.get("/components/{component_id}/evidence")
def get_component_evidence_chain(component_id: str):
    """Traceable 8-stage Reliability Evidence Chain and Counterfactual Sensitivity."""
    eval_res = live_sim_controller.get_component_evaluation(component_id)
    if "error" in eval_res:
        raise HTTPException(status_code=404, detail=eval_res["error"])
    return eval_res["evidence_chain"]

@router.get("/components/{component_id}/forecast")
def get_component_forecast(component_id: str):
    """Early 168h forecast trajectory and uncertainty intervals."""
    eval_res = live_sim_controller.get_component_evaluation(component_id)
    if "error" in eval_res:
        raise HTTPException(status_code=404, detail=eval_res["error"])
    return eval_res["forecast"]

@router.get("/model-performance")
def get_model_performance():
    """Dynamic synthetic validation benchmark metrics (F1, Precision, Recall, MAE, Latency)."""
    return model_validation_engine.calculate_benchmark_metrics()

# Simulation & Demo Controls
@router.post("/simulate/start")
def start_simulation():
    """Resume or start the accelerated burn-in clock."""
    live_sim_controller.start()
    return {"status": "RUNNING", "current_hour": live_sim_controller.current_hour, "speed": live_sim_controller.speed_multiplier}

@router.post("/simulate/pause")
def pause_simulation():
    """Pause the accelerated burn-in clock."""
    live_sim_controller.pause()
    return {"status": "PAUSED", "current_hour": live_sim_controller.current_hour}

@router.post("/simulate/reset")
def reset_simulation():
    """Reset simulation back to 0h."""
    live_sim_controller.reset(reset_defect=True)
    return {"status": "RESET", "current_hour": 0.0}

@router.post("/simulate/speed")
def set_simulation_speed(req: SpeedRequest):
    """Set playback speed multiplier (1x, 10x, 50x)."""
    live_sim_controller.set_speed(req.speed)
    return {"status": "SPEED_UPDATED", "speed": live_sim_controller.speed_multiplier}

@router.post("/simulate/step")
def step_simulation_hour(req: StepRequest):
    """Scrub simulation directly to specific burn-in hour."""
    live_sim_controller.set_hour(req.hour)
    return {"status": "HOUR_UPDATED", "current_hour": live_sim_controller.current_hour}

@router.post("/simulate/inject-defect")
def inject_latent_defect(req: Optional[DefectRequest] = None):
    """Inject progressive latent defect into C-104 (or target component)."""
    cid = req.component_id if req and req.component_id else HERO_COMPONENT_ID
    res = live_sim_controller.inject_latent_defect(cid)
    return res

@router.post("/demo/hero-reset")
def hero_demo_reset():
    """1-Click Hero Demo Reset to deterministic presentation state."""
    res = live_sim_controller.hero_demo_reset()
    return res
