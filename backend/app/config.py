"""
VIGIL-X Configuration & Domain Standards
Smart India Hackathon 2026 | Problem Statement SIH26170
Organization: Indian Space Research Organisation (ISRO)
Category: Software | Theme: Smart Automation

DISCLAIMER: SIMULATION / RESEARCH PROTOTYPE
Not certified for actual flight hardware qualification without rigorous empirical validation on qualified aerospace test rigs.
"""

import os
from pathlib import Path
from pydantic import BaseModel
from typing import Dict, Any

# Root directories (handle read-only serverless filesystems gracefully)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
is_serverless = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))

if is_serverless:
    tmp_dir = Path("/tmp/vigil-x")
    DATA_DIR = tmp_dir / "data"
    MODELS_DIR = tmp_dir / "models"
else:
    DATA_DIR = BASE_DIR / "data"
    MODELS_DIR = BASE_DIR / "models"

try:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass

# Standard Burn-in Checkpoints
CHECKPOINTS = [0, 24, 96, 168]
TOTAL_BURNIN_HOURS = 168.0
EARLY_DECISION_HOUR = 24.0

# Engineering Absolute Safety Limits for Class-S Space-Grade Microelectronics (Hermetic IC / Mixed Signal)
ABSOLUTE_LIMITS = {
    "temperature": {
        "min": 20.0,
        "max": 125.0,     # Max junction/case stress limit (°C)
        "unit": "°C",
        "description": "Operating Case Temperature"
    },
    "standby_current": {
        "min": 0.0,
        "max": 85.0,      # Absolute max quiescent / leakage current (µA)
        "unit": "µA",
        "description": "Quiescent / Leakage Standby Current"
    },
    "voltage": {
        "min": 3.00,
        "max": 3.60,      # Nominal 3.3V ± 0.3V rail limit (V)
        "unit": "V",
        "description": "Core Rail Operating Voltage"
    },
    "current": {
        "min": 10.0,
        "max": 180.0,     # Active operating current limit (mA)
        "unit": "mA",
        "description": "Active Operating Current"
    },
    "power": {
        "min": 30.0,
        "max": 650.0,     # Dissipated power limit (mW)
        "unit": "mW",
        "description": "Total Power Dissipation"
    }
}

# Configured Safety Trajectory Thresholds for Early Warning (Tight risk boundary for 168h forecast)
SAFETY_THRESHOLDS = {
    "standby_current": 55.0,  # Warning if predicted to exceed 55 µA (well before 85 µA absolute failure)
    "temperature": 95.0,      # Warning if predicted to exceed 95 °C
    "current": 145.0,         # Warning if predicted to exceed 145 mA
    "voltage_variance": 0.015 # Maximum allowable rolling variance
}

# Production Lots simulated
LOT_CONFIGS = [
    {
        "lot_id": "LOT-A17",
        "wafer_fab": "SemiFab-7",
        "part_type": "RAD-HARD-FPGA-DSP",
        "sample_size": 25,
        "baseline_temp": 70.0,
        "baseline_leakage": 28.5,
        "baseline_voltage": 3.30,
        "baseline_current": 82.0
    },
    {
        "lot_id": "LOT-B04",
        "wafer_fab": "SemiFab-9",
        "part_type": "PRECISION-ADC-16B",
        "sample_size": 20,
        "baseline_temp": 65.0,
        "baseline_leakage": 19.2,
        "baseline_voltage": 3.30,
        "baseline_current": 64.0
    },
    {
        "lot_id": "LOT-C12",
        "wafer_fab": "SemiFab-7",
        "part_type": "POWER-MGMT-PMIC",
        "sample_size": 20,
        "baseline_temp": 75.0,
        "baseline_leakage": 35.0,
        "baseline_voltage": 3.30,
        "baseline_current": 110.0
    }
]

# Simulated Reference Lots for baseline population comparison (Clearly labeled simulated research cohorts)
REFERENCE_LOT_CONFIGS = [
    {
        "lot_id": "REFERENCE-LOT-01",
        "wafer_fab": "SemiFab-7-Ref",
        "part_type": "RAD-HARD-FPGA-DSP",
        "sample_size": 25,
        "baseline_temp": 69.8,
        "baseline_leakage": 27.8,
        "baseline_voltage": 3.30,
        "baseline_current": 81.5,
        "is_reference": True,
        "description": "SIMULATED REFERENCE LOT 01 • Certified Nominal Baseline"
    },
    {
        "lot_id": "REFERENCE-LOT-02",
        "wafer_fab": "SemiFab-7-Ref",
        "part_type": "RAD-HARD-FPGA-DSP",
        "sample_size": 25,
        "baseline_temp": 70.2,
        "baseline_leakage": 28.2,
        "baseline_voltage": 3.30,
        "baseline_current": 82.2,
        "is_reference": True,
        "description": "SIMULATED REFERENCE LOT 02 • Historical Control Cohort"
    },
    {
        "lot_id": "REFERENCE-LOT-03",
        "wafer_fab": "SemiFab-9-Ref",
        "part_type": "PRECISION-ADC-16B",
        "sample_size": 20,
        "baseline_temp": 65.1,
        "baseline_leakage": 19.1,
        "baseline_voltage": 3.30,
        "baseline_current": 63.8,
        "is_reference": True,
        "description": "SIMULATED REFERENCE LOT 03 • Mixed-Signal Calibration Cohort"
    }
]

# Simulated Test Environment Metadata
TEST_CHANNELS = ["CHANNEL-A", "CHANNEL-B", "CHANNEL-C", "CHANNEL-D"]
TEST_CHAMBERS = ["CHAMBER-01", "CHAMBER-02"]
TEST_SYSTEMS = ["SYS-01", "SYS-02"]

# Deterministic Root-Cause Triangulation Demo Scenarios
DEMO_SCENARIOS = {
    "isolated_component": "Isolated Component Anomaly",
    "lot_drift": "Common-Cause Lot Drift",
    "test_system_drift": "Test-System Drift Suspected",
    "combined_risk": "Component + Lot Systemic Risk"
}

HERO_COMPONENT_ID = "C-104"
HERO_LOT_ID = "LOT-A17"
RANDOM_SEED = 42
