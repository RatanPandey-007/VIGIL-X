"""
Realistic Burn-in Telemetry Generator
Smart India Hackathon 2026 | Problem Statement SIH26170
Organization: Indian Space Research Organisation (ISRO)

DISCLAIMER: SIMULATION / RESEARCH PROTOTYPE
Generates synthetic burn-in parametric screening data across production lots with physical correlations,
component-to-component variability, and subtle progressive latent defects.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from app.config import LOT_CONFIGS, RANDOM_SEED, HERO_COMPONENT_ID, HERO_LOT_ID, CHECKPOINTS, TOTAL_BURNIN_HOURS

class BurnInDataGenerator:
    """
    Simulates multi-lot burn-in parametric telemetry.
    Supports continuous hourly timelines (0h to 168h) and standard PS checkpoints (0h, 24h, 96h, 168h).
    """

    def __init__(self, seed: int = RANDOM_SEED):
        self.seed = seed
        self.rng = np.random.default_rng(seed)

    def generate_all_lots_data(
        self,
        inject_hero_defect: bool = False,
        hours: int = 168,
        target_defect_comp_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates full dataset across all configured lots.
        Returns dictionary containing:
        - raw_records: list of all point-in-time parametric measurements
        - components_meta: metadata per component (lot, part_type, latent_behavior, is_defective)
        - lots_meta: lot summaries
        """
        all_records = []
        components_meta = {}
        base_time = datetime(2026, 3, 15, 8, 0, 0)
        target_comp = target_defect_comp_id or HERO_COMPONENT_ID

        for lot in LOT_CONFIGS:
            lot_id = lot["lot_id"]
            part_type = lot["part_type"]
            sample_size = lot["sample_size"]

            for i in range(1, sample_size + 1):
                comp_id = f"C-{i:03d}"
                # For LOT-A17, map C-104 explicitly
                if lot_id == HERO_LOT_ID and i == 4:
                    comp_id = HERO_COMPONENT_ID

                # Assign latent defect behavior
                behavior, is_defective = self._assign_behavior(lot_id, comp_id, inject_hero_defect, target_comp)
                
                components_meta[comp_id] = {
                    "component_id": comp_id,
                    "lot_id": lot_id,
                    "part_type": part_type,
                    "latent_behavior": behavior,
                    "is_defective": is_defective
                }

                comp_records = self._generate_component_trajectory(
                    comp_id=comp_id,
                    lot=lot,
                    behavior=behavior,
                    base_time=base_time,
                    max_hour=hours
                )
                all_records.extend(comp_records)

        return {
            "records": all_records,
            "components": components_meta,
            "lots": {l["lot_id"]: l for l in LOT_CONFIGS}
        }

    def _assign_behavior(
        self,
        lot_id: str,
        comp_id: str,
        inject_hero_defect: bool,
        target_comp: str = HERO_COMPONENT_ID
    ) -> tuple[str, bool]:
        """
        Assigns subtle degradation modes across lot samples deterministically.
        """
        if comp_id == target_comp:
            if inject_hero_defect:
                return "HERO_PROGRESSIVE_DEFECT", True
            return "HEALTHY", False

        # Controlled distribution for other components:
        # 80% Healthy, 5% Thermal Drift, 5% Current Drift, 3% Voltage Instability, 4% Combined Degradation, 3% Sensor Noise
        # Use deterministic hash of comp_id and lot_id
        h = abs(hash(f"{lot_id}_{comp_id}_{self.seed}")) % 100
        if h < 78:
            return "HEALTHY", False
        elif h < 84:
            return "THERMAL_DRIFT", True
        elif h < 90:
            return "CURRENT_DRIFT", True
        elif h < 94:
            return "VOLTAGE_INSTABILITY", True
        elif h < 97:
            return "COMBINED_DEGRADATION", True
        else:
            return "SENSOR_NOISE", False

    def _generate_component_trajectory(
        self,
        comp_id: str,
        lot: Dict[str, Any],
        behavior: str,
        base_time: datetime,
        max_hour: int = 168
    ) -> List[Dict[str, Any]]:
        """
        Generates physically correlated hourly trajectory for a component.
        """
        # Component-level intrinsic baseline offsets (semiconductor process variation)
        comp_seed = abs(hash(f"{comp_id}_{lot['lot_id']}_{self.seed}")) % (2**31 - 1)
        comp_rng = np.random.default_rng(comp_seed)

        # Intrinsic offsets around lot baseline
        t_offset = comp_rng.normal(0.0, 1.2)
        leakage_offset = comp_rng.normal(0.0, 1.5)
        v_offset = comp_rng.normal(0.0, 0.012)
        i_offset = comp_rng.normal(0.0, 2.5)

        base_t = lot["baseline_temp"] + t_offset
        base_leakage = lot["baseline_leakage"] + leakage_offset
        base_v = lot["baseline_voltage"] + v_offset
        base_i = lot["baseline_current"] + i_offset

        records = []

        for h in range(max_hour + 1):
            ts = base_time + timedelta(hours=h)

            # Nominal measurement noise
            meas_t_noise = comp_rng.normal(0.0, 0.35)
            meas_leakage_noise = comp_rng.normal(0.0, 0.45)
            meas_v_noise = comp_rng.normal(0.0, 0.005)
            meas_i_noise = comp_rng.normal(0.0, 0.60)

            # Nominal aging drift across 168h in standard healthy devices (very slight bathtub / stabilization)
            nominal_aging = 0.008 * np.log1p(h)

            # Dynamic progressive drift contributions based on latent defect
            drift_t = 0.0
            drift_leakage = 0.0
            drift_v = 0.0
            drift_i = 0.0
            v_jitter = 0.0

            if behavior == "HERO_PROGRESSIVE_DEFECT":
                # Crucial Hero Component Progression:
                # 0-8h: completely normal
                # 8-15h: subtle thermal drift
                # 15-20h: current variance increases
                # 20-24h: lot relative deviation becomes noticeable
                # 24h+: forecast diverges toward safety threshold
                if h > 8:
                    # Subtle progressive thermal drift
                    drift_t = 0.22 * (h - 8) ** 1.08
                if h > 15:
                    # Leakage and current drift correlated with thermal escalation
                    drift_leakage = 0.38 * (h - 15) ** 1.15
                    drift_i = 0.42 * (h - 15) ** 1.05
                    v_jitter = comp_rng.normal(0.0, 0.015 * min(3.0, (h - 15) / 10.0))
            
            elif behavior == "THERMAL_DRIFT":
                # Gradual thermal runaway / heat-sink voiding
                if h > 10:
                    drift_t = 0.18 * (h - 10) ** 1.05
                    drift_leakage = 0.25 * (h - 10) ** 1.08

            elif behavior == "CURRENT_DRIFT":
                # Gate oxide leakage / electro-migration precursor
                if h > 12:
                    drift_leakage = 0.35 * (h - 12) ** 1.12
                    drift_i = 0.45 * (h - 12) ** 1.08

            elif behavior == "VOLTAGE_INSTABILITY":
                # Internal bandgap reference instability / regulator oscillation
                if h > 14:
                    v_jitter = comp_rng.normal(0.0, 0.012 + 0.001 * (h - 14))

            elif behavior == "COMBINED_DEGRADATION":
                # Multi-channel subtle degradation
                if h > 10:
                    drift_t = 0.12 * (h - 10)
                    drift_leakage = 0.22 * (h - 10)
                    drift_i = 0.25 * (h - 10)

            elif behavior == "SENSOR_NOISE":
                # Sporadic isolated spike at h=36 and h=102 without physical degradation
                if h in (36, 102):
                    meas_t_noise += comp_rng.choice([-6.5, 7.2])
                    meas_leakage_noise += comp_rng.choice([-5.0, 6.0])

            # Calculate instantaneous values
            cur_temp = base_t + nominal_aging * 2.0 + drift_t + meas_t_noise
            cur_leakage = base_leakage + nominal_aging * 1.5 + drift_leakage + (0.15 * drift_t) + meas_leakage_noise
            cur_v = base_v + v_jitter + meas_v_noise
            cur_i = base_i + nominal_aging * 3.0 + drift_i + (0.35 * drift_t) + meas_i_noise
            cur_power = (cur_v * cur_i)  # P (mW) = V * I (mA)

            records.append({
                "component_id": comp_id,
                "lot_id": lot["lot_id"],
                "part_type": lot["part_type"],
                "burn_in_hour": float(h),
                "timestamp": ts.isoformat(),
                "temperature": round(float(cur_temp), 2),
                "standby_current": round(float(cur_leakage), 2),
                "voltage": round(float(cur_v), 4),
                "current": round(float(cur_i), 2),
                "power": round(float(cur_power), 2),
                "is_checkpoint": h in CHECKPOINTS
            })

        return records

# Global singleton generator instance
burnin_generator = BurnInDataGenerator()
