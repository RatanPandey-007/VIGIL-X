"""
Automated Test Suite for Root-Cause Triangulation & Lot Health Intelligence
Smart India Hackathon 2026 | Problem Statement SIH26170
Organization: Indian Space Research Organisation (ISRO)
"""

import pytest
from app.config import HERO_COMPONENT_ID, HERO_LOT_ID
from app.simulation.live_engine import live_sim_controller
from app.core.root_cause_triangulation import root_cause_engine

@pytest.fixture(scope="module")
def initialized_sim():
    live_sim_controller.initialize()
    return live_sim_controller

def test_isolated_component_scenario(initialized_sim):
    """Scenario 1: Verify isolated component defect has high component signal and low lot/test-system signals."""
    initialized_sim.hero_demo_reset(scenario="isolated_component")
    initialized_sim.set_hour(24.0)
    
    comp_eval = initialized_sim.get_component_evaluation(HERO_COMPONENT_ID)
    triangulation = comp_eval["triangulation"]
    
    assert triangulation["component_signal"]["score"] >= 35.0
    assert triangulation["lot_signal"]["score"] < 50.0
    assert triangulation["test_system_signal"]["score"] < 50.0
    assert triangulation["attribution"] == "ISOLATED COMPONENT ANOMALY"
    assert triangulation["confidence"] >= 80.0
    assert "C-104" in triangulation["evidence_text"]

def test_lot_drift_scenario(initialized_sim):
    """Scenario 2: Verify common-cause lot drift has elevated lot signal and correct attribution."""
    initialized_sim.set_demo_scenario("lot_drift")
    initialized_sim.set_hour(24.0)
    
    comp_eval = initialized_sim.get_component_evaluation(HERO_COMPONENT_ID)
    triangulation = comp_eval["triangulation"]
    
    assert triangulation["lot_signal"]["score"] >= 45.0
    assert triangulation["lot_signal"]["drifting_percentage"] >= 50.0
    assert triangulation["attribution"] in ["COMMON-CAUSE LOT DRIFT", "COMPONENT + LOT SYSTEMIC RISK"]
    assert "LOT-A17" in triangulation["evidence_text"]

def test_test_system_drift_scenario(initialized_sim):
    """Scenario 3: Verify cross-lot channel shift flags test-system drift suspected."""
    initialized_sim.set_demo_scenario("test_system_drift")
    initialized_sim.set_hour(24.0)
    
    comp_eval = initialized_sim.get_component_evaluation(HERO_COMPONENT_ID)
    triangulation = comp_eval["triangulation"]
    
    assert triangulation["test_system_signal"]["score"] >= 55.0
    assert triangulation["test_system_signal"]["channel_drift_detected"] is True
    assert triangulation["attribution"] == "TEST-SYSTEM DRIFT SUSPECTED"
    assert "CHANNEL-A" in triangulation["evidence_text"]
    assert "VERIFY TEST SYSTEM" in triangulation["recommended_action"]

def test_combined_risk_scenario(initialized_sim):
    """Scenario 4: Verify combined individual defect and drifting lot results in systemic risk."""
    initialized_sim.set_demo_scenario("combined_risk")
    initialized_sim.set_hour(24.0)
    
    comp_eval = initialized_sim.get_component_evaluation(HERO_COMPONENT_ID)
    triangulation = comp_eval["triangulation"]
    
    assert triangulation["component_signal"]["score"] >= 45.0
    assert triangulation["lot_signal"]["score"] >= 45.0
    assert triangulation["attribution"] == "COMPONENT + LOT SYSTEMIC RISK"
    assert "QUARANTINE" in triangulation["recommended_action"]

def test_lot_health_radar_structure(initialized_sim):
    """Verify statistical structure of Lot Health Radar."""
    radar = initialized_sim.get_lot_health_radar(HERO_LOT_ID)
    
    assert "lot_health_score" in radar
    assert 0.0 <= radar["lot_health_score"] <= 100.0
    assert "components_monitored" in radar
    assert "population_showing_drift" in radar
    assert "population_distribution" in radar
    assert len(radar["population_distribution"]) == 7

def test_triangulation_benchmark_endpoint():
    """Verify synthetic attribution benchmark metrics."""
    bench = root_cause_engine.get_attribution_benchmark()
    assert bench["attribution_accuracy"] >= 90.0
    assert "scenario_accuracies" in bench
    assert "confusion_matrix" in bench
    assert len(bench["confusion_matrix"]) == 4
