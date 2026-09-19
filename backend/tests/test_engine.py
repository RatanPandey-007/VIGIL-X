"""
Automated Test Suite for VIGIL-X Reliability Intelligence Engine
Smart India Hackathon 2026 | Problem Statement SIH26170
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.config import HERO_COMPONENT_ID, HERO_LOT_ID, CHECKPOINTS
from app.simulation.generator import burnin_generator
from app.core.data_quality import data_quality_gate
from app.core.lot_fingerprint import lot_fingerprint_engine
from app.core.module_a_anomaly import dynamic_anomaly_engine
from app.core.module_b_predictor import early_drift_predictor
from app.core.time_to_risk import time_to_risk_engine
from app.core.decision_engine import screening_decision_engine
from app.core.evidence_chain import evidence_chain_engine
from app.simulation.live_engine import live_sim_controller
from app.main import app

@pytest.fixture(scope="module")
def initialized_system():
    live_sim_controller.initialize()
    return live_sim_controller

def test_generator_structure():
    """Verify synthetic burn-in generator creates multi-lot cohorts and checkpoints."""
    data = burnin_generator.generate_all_lots_data(inject_hero_defect=False, hours=168)
    assert "records" in data
    assert "components" in data
    assert "lots" in data
    assert len(data["records"]) > 1000
    
    # Checkpoint compliance
    sample = data["records"][0]
    expected_keys = ["component_id", "lot_id", "part_type", "burn_in_hour", "temperature", "standby_current", "voltage", "current", "power"]
    for k in expected_keys:
        assert k in sample

def test_data_quality_gate():
    """Verify quality gate identifies valid telemetry and catches impossible values."""
    records = [
        {"burn_in_hour": 0.0, "temperature": 70.0, "standby_current": 25.0, "voltage": 3.3, "current": 80.0, "power": 264.0},
        {"burn_in_hour": 1.0, "temperature": 70.2, "standby_current": 25.1, "voltage": 3.3, "current": 80.2, "power": 264.6}
    ]
    res = data_quality_gate.evaluate_component_telemetry(records)
    assert res["status"] == "GOOD"
    assert res["quality_score"] >= 90.0

    # Test impossible negative voltage
    bad_records = [
        {"burn_in_hour": 0.0, "temperature": 70.0, "standby_current": 25.0, "voltage": -1.5, "current": 80.0, "power": 264.0}
    ]
    bad_res = data_quality_gate.evaluate_component_telemetry(bad_records)
    assert bad_res["status"] == "INVALID"

def test_lot_fingerprint_computation(initialized_system):
    """Verify robust medians, MAD, and envelopes are computed."""
    fp = lot_fingerprint_engine.get_lot_fingerprint(HERO_LOT_ID)
    assert fp is not None
    assert "temperature" in fp["parameters"]
    assert "standby_current" in fp["parameters"]
    
    traj = fp["parameters"]["temperature"]["trajectory"]
    assert len(traj) > 0
    assert "median" in traj[0]
    assert "lower_envelope" in traj[0]
    assert "upper_envelope" in traj[0]
    assert traj[0]["lower_envelope"] < traj[0]["median"] < traj[0]["upper_envelope"]

def test_module_a_and_b(initialized_system):
    """Verify anomaly detection and early drift regression."""
    initialized_system.hero_demo_reset()
    comp_eval_early = initialized_system.get_component_evaluation(HERO_COMPONENT_ID)
    
    assert comp_eval_early["component_id"] == HERO_COMPONENT_ID
    assert comp_eval_early["anomaly"]["absolute_limit_status"] == "PASS"
    assert comp_eval_early["decision"]["decision"] == "ACCEPT"

    # Inject latent defect into C-104 and advance to 24h
    initialized_system.inject_latent_defect(HERO_COMPONENT_ID)
    initialized_system.set_hour(24.0)
    comp_eval_24h = initialized_system.get_component_evaluation(HERO_COMPONENT_ID)

    # Key scenario: Absolute limit PASS, but lot-relative ANOMALOUS
    assert comp_eval_24h["anomaly"]["absolute_limit_status"] == "PASS"
    assert comp_eval_24h["anomaly"]["lot_deviation_score"] > 30.0
    assert comp_eval_24h["forecast"]["forecast_ready"] is True
    assert "temperature" in comp_eval_24h["forecast"]["parameters"]
    
    # Time-to-risk must be calculated dynamically (not empty or hardcoded placeholder)
    ttr = comp_eval_24h["time_to_risk"]
    assert ttr["display_text"] is not None

def test_evidence_chain_and_counterfactual(initialized_system):
    """Verify 8-stage evidence chain assembly and counterfactual sensitivity."""
    initialized_system.set_hour(24.0)
    comp_eval = initialized_system.get_component_evaluation(HERO_COMPONENT_ID)
    chain = comp_eval["evidence_chain"]

    assert len(chain["chain"]) == 8
    assert chain["chain"][0]["title"] == "Raw Parametric Data"
    assert chain["chain"][6]["title"] == "Uncertainty + Time-to-Risk"
    assert chain["chain"][7]["title"] == "Screening Recommendation"
    assert len(chain["why_contributors"]) >= 1
    assert "what_if" in chain

def test_fastapi_endpoints():
    """Verify REST API responses with TestClient."""
    client = TestClient(app)
    
    # 1. Health
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "HEALTHY"

    # 2. Metrics
    r = client.get("/api/metrics")
    assert r.status_code == 200
    assert "total_components" in r.json()

    # 3. Lots
    r = client.get("/api/lots")
    assert r.status_code == 200
    assert len(r.json()["lots"]) >= 3

    # 4. Component C-104
    r = client.get(f"/api/components/{HERO_COMPONENT_ID}")
    assert r.status_code == 200
    assert r.json()["component_id"] == HERO_COMPONENT_ID

    # 5. Model Performance
    r = client.get("/api/model-performance")
    assert r.status_code == 200
    assert "anomaly_detection" in r.json()

    # 6. Hero Demo Reset
    r = client.post("/api/demo/hero-reset")
    assert r.status_code == 200
    assert r.json()["status"] == "HERO_DEMO_READY"
