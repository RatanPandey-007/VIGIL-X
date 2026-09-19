"""
Realistic Burn-in Telemetry Generator with Root-Cause Attribution Signals
Smart India Hackathon 2026 | Problem Statement SIH26170
Organization: Indian Space Research Organisation (ISRO)

DISCLAIMER: SIMULATION / RESEARCH PROTOTYPE
Generates synthetic burn-in parametric screening data across production lots with physical correlations,
component-to-component variability, subtle progressive latent defects, simulated reference lots,
and test-system hardware channel/chamber metadata.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from app.config import (
    LOT_CONFIGS,
    REFERENCE_LOT_CONFIGS,
    TEST_CHANNELS,
    TEST_CHAMBERS,
    TEST_SYSTEMS,
    RANDOM_SEED,
    HERO_COMPONENT_ID,
    HERO_LOT_ID,
    CHECKPOINTS,
    TOTAL_BURNIN_HOURS
)

class BurnInDataGenerator:
    """
    Simulates multi-lot burn-in parametric telemetry.
    Supports continuous hourly timelines (0h to 168h) and standard PS checkpoints (0h, 24h, 96h, 168h).
    Extended to support Root-Cause Triangulation: Component, Lot-Wide, and Test-System drift.
    """

    def __init__(self, seed: int = RANDOM_SEED):
        self.seed = seed
        self.rng = np.random.default_rng(seed)

    def generate_all_lots_data(
        self,
        inject_hero_defect: bool = False,
        hours: int = 168,
        target_defect_comp_id: Optional[str] = None,
        demo_scenario: str = "isolated_component"
    ) -> Dict[str, Any]:
        """
        Generates full dataset across all configured production lots and simulated reference lots.
        Returns dictionary containing:
        - records: list of all point-in-time parametric measurements
        - components: metadata per component (lot, part_type, latent_behavior, is_defective, test hardware)
        - lots: lot summaries (including reference lots)
        """
        all_records = []
        components_meta = {}
        base_time = datetime(2026, 3, 15, 8, 0, 0)
        target_comp = target_defect_comp_id or HERO_COMPONENT_ID

        # Combine production lots with simulated reference lots
        all_lots = LOT_CONFIGS + REFERENCE_LOT_CONFIGS

        for lot in all_lots:
            lot_id = lot["lot_id"]
            part_type = lot["part_type"]
            sample_size = lot["sample_size"]
            is_ref = lot.get("is_reference", False)

            for i in range(1, sample_size + 1):
                # ID prefix: C-xxx for prod, R-xxx for ref
                if is_ref:
                    comp_id = f"R-{lot_id[-2:]}-{i:02d}"
                else:
                    comp_id = f"C-{i:03d}"
                    if lot_id == HERO_LOT_ID and i == 4:
                        comp_id = HERO_COMPONENT_ID

                # Assign test hardware metadata deterministically
                chan_idx = (i - 1) % len(TEST_CHANNELS)
                chamber_idx = (i - 1) % len(TEST_CHAMBERS)
                sys_idx = 0 if chamber_idx == 0 else 1

                test_chan = TEST_CHANNELS[chan_idx]
                chamber = TEST_CHAMBERS[chamber_idx]
                test_sys = TEST_SYSTEMS[sys_idx]

                # Ensure C-104 is always on CHANNEL-A in CHAMBER-01
                if comp_id == HERO_COMPONENT_ID:
                    test_chan = "CHANNEL-A"
                    chamber = "CHAMBER-01"
                    test_sys = "SYS-01"

                # Assign behavior based on scenario
                behavior, is_defective = self._assign_behavior_scenario(
                    lot_id=lot_id,
                    comp_id=comp_id,
                    is_ref=is_ref,
                    inject_hero_defect=inject_hero_defect,
                    target_comp=target_comp,
                    demo_scenario=demo_scenario,
                    test_channel=test_chan,
                    index=i
                )

                components_meta[comp_id] = {
                    "component_id": comp_id,
                    "lot_id": lot_id,
                    "part_type": part_type,
                    "latent_behavior": behavior,
                    "is_defective": is_defective,
                    "is_reference": is_ref,
                    "test_channel_id": test_chan,
                    "chamber_id": chamber,
                    "test_system_id": test_sys
                }

                comp_records = self._generate_component_trajectory(
                    comp_id=comp_id,
                    lot=lot,
                    behavior=behavior,
                    base_time=base_time,
                    max_hour=hours,
                    test_channel=test_chan,
                    demo_scenario=demo_scenario,
                    is_ref=is_ref
                )
                all_records.extend(comp_records)

        lots_meta = {l["lot_id"]: l for l in all_lots}

        return {
            "records": all_records,
            "components": components_meta,
            "lots": lots_meta
        }

    def _assign_behavior_scenario(
        self,
        lot_id: str,
        comp_id: str,
        is_ref: bool,
        inject_hero_defect: bool,
        target_comp: str,
        demo_scenario: str,
        test_channel: str,
        index: int
    ) -> tuple[str, bool]:
        """
        Assigns degradation modes across lot samples deterministically according to the active scenario.
        """
        # Simulated Reference lots are always 100% healthy controls
        if is_ref:
            return "HEALTHY", False

        # Scenario 1: Isolated Component Anomaly
        if demo_scenario == "isolated_component":
            if comp_id == target_comp:
                if inject_hero_defect:
                    return "HERO_PROGRESSIVE_DEFECT", True
                return "HEALTHY", False
            return self._assign_nominal_background_behavior(lot_id, comp_id)

        # Scenario 2: Common-Cause Lot Drift (LOT-A17 drifts population-wide)
        elif demo_scenario == "lot_drift":
            if lot_id == HERO_LOT_ID:
                # 72% of components in LOT-A17 show coordinated drift
                if index % 4 != 0:
                    return "LOT_COORDINATED_DRIFT", True
                return "HEALTHY", False
            return self._assign_nominal_background_behavior(lot_id, comp_id)

        # Scenario 3: Test-System / Measurement Drift (CHANNEL-A shifts across ALL lots)
        elif demo_scenario == "test_system_drift":
            if test_channel == "CHANNEL-A":
                return "TEST_CHANNEL_DRIFT", True
            return self._assign_nominal_background_behavior(lot_id, comp_id)

        # Scenario 4: Combined Component + Lot Risk
        elif demo_scenario == "combined_risk":
            if comp_id == target_comp:
                return "HERO_PROGRESSIVE_DEFECT", True
            if lot_id == HERO_LOT_ID and index % 3 != 0:
                return "LOT_COORDINATED_DRIFT", True
            return self._assign_nominal_background_behavior(lot_id, comp_id)

        # Default fallback
        if comp_id == target_comp:
            if inject_hero_defect:
                return "HERO_PROGRESSIVE_DEFECT", True
            return "HEALTHY", False
        return self._assign_nominal_background_behavior(lot_id, comp_id)

    def _assign_nominal_background_behavior(self, lot_id: str, comp_id: str) -> tuple[str, bool]:
        """
        Controlled baseline distribution for non-hero components.
        """
        h = abs(hash(f"{lot_id}_{comp_id}_{self.seed}")) % 100
        if h < 84:
            return "HEALTHY", False
        elif h < 90:
            return "THERMAL_DRIFT", True
        elif h < 95:
            return "CURRENT_DRIFT", True
        elif h < 98:
            return "VOLTAGE_INSTABILITY", True
        else:
            return "SENSOR_NOISE", False

    def _generate_component_trajectory(
        self,
        comp_id: str,
        lot: Dict[str, Any],
        behavior: str,
        base_time: datetime,
        max_hour: int = 168,
        test_channel: str = "CHANNEL-A",
        demo_scenario: str = "isolated_component",
        is_ref: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Generates physically correlated hourly trajectory for a component with test hardware attribution.
        """
        comp_seed = abs(hash(f"{comp_id}_{lot['lot_id']}_{self.seed}")) % (2**31 - 1)
        comp_rng = np.random.default_rng(comp_seed)

        # Intrinsic offsets around lot baseline (tight process window for reference lots)
        spread_scale = 0.5 if is_ref else 1.0
        t_offset = comp_rng.normal(0.0, 1.2 * spread_scale)
        leakage_offset = comp_rng.normal(0.0, 1.5 * spread_scale)
        v_offset = comp_rng.normal(0.0, 0.012 * spread_scale)
        i_offset = comp_rng.normal(0.0, 2.5 * spread_scale)

        base_t = lot["baseline_temp"] + t_offset
        base_leakage = lot["baseline_leakage"] + leakage_offset
        base_v = lot["baseline_voltage"] + v_offset
        base_i = lot["baseline_current"] + i_offset

        records = []

        for h in range(max_hour + 1):
            ts = base_time + timedelta(hours=h)

            meas_t_noise = comp_rng.normal(0.0, 0.35)
            meas_leakage_noise = comp_rng.normal(0.0, 0.45)
            meas_v_noise = comp_rng.normal(0.0, 0.005)
            meas_i_noise = comp_rng.normal(0.0, 0.60)

            nominal_aging = 0.008 * np.log1p(h)

            drift_t = 0.0
            drift_leakage = 0.0
            drift_v = 0.0
            drift_i = 0.0
            v_jitter = 0.0

            # 1. HERO PROGRESSIVE DEFECT (Isolated Component)
            if behavior == "HERO_PROGRESSIVE_DEFECT":
                if h > 8:
                    drift_t = 0.22 * (h - 8) ** 1.08
                if h > 15:
                    drift_leakage = 0.38 * (h - 15) ** 1.15
                    drift_i = 0.42 * (h - 15) ** 1.05
                    v_jitter = comp_rng.normal(0.0, 0.015 * min(3.0, (h - 15) / 10.0))

            # 2. COMMON-CAUSE LOT COORDINATED DRIFT
            elif behavior == "LOT_COORDINATED_DRIFT":
                # Subtle coordinated wafer-level oxidation/passivation shift across entire lot
                if h > 10:
                    drift_t = 0.14 * (h - 10) ** 1.02
                    drift_leakage = 0.22 * (h - 10) ** 1.05
                    drift_i = 0.18 * (h - 10)

            # 3. TEST-SYSTEM / CHANNEL-SPECIFIC MEASUREMENT DRIFT
            elif behavior == "TEST_CHANNEL_DRIFT":
                # Sensor amp drift / measurement instrumentation offset on this channel
                if h > 8:
                    drift_leakage = 0.32 * (h - 8) ** 1.04
                    drift_t = 0.10 * (h - 8)
                    v_jitter = 0.018 * min(2.5, (h - 8) / 15.0)

            elif behavior == "THERMAL_DRIFT":
                if h > 10:
                    drift_t = 0.18 * (h - 10) ** 1.05
                    drift_leakage = 0.25 * (h - 10) ** 1.08

            elif behavior == "CURRENT_DRIFT":
                if h > 12:
                    drift_leakage = 0.35 * (h - 12) ** 1.12
                    drift_i = 0.45 * (h - 12) ** 1.08

            elif behavior == "VOLTAGE_INSTABILITY":
                if h > 14:
                    v_jitter = comp_rng.normal(0.0, 0.012 + 0.001 * (h - 14))

            elif behavior == "SENSOR_NOISE":
                if h in (36, 102):
                    meas_t_noise += comp_rng.choice([-6.5, 7.2])
                    meas_leakage_noise += comp_rng.choice([-5.0, 6.0])

            cur_temp = base_t + nominal_aging * 2.0 + drift_t + meas_t_noise
            cur_leakage = base_leakage + nominal_aging * 1.5 + drift_leakage + (0.15 * drift_t) + meas_leakage_noise
            cur_v = base_v + v_jitter + meas_v_noise
            cur_i = base_i + nominal_aging * 3.0 + drift_i + (0.35 * drift_t) + meas_i_noise
            cur_power = (cur_v * cur_i)

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
                "is_checkpoint": h in CHECKPOINTS,
                "test_channel_id": test_channel,
                "is_reference": is_ref
            })

        return records

# Global singleton generator instance
burnin_generator = BurnInDataGenerator()
