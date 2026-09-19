/**
 * VIGIL-X TypeScript Type Definitions
 * SIH26170 | AI-Driven Anomaly Detection in Component Burn-In & Screening (ISRO)
 */

export type ScreeningDecision = 'ACCEPT' | 'WATCH' | 'HOLD / REVIEW';
export type RiskState = 'NORMAL' | 'WATCH' | 'HIGH RISK';
export type DataQualityStatus = 'GOOD' | 'WARNING' | 'INVALID';

export interface AbsoluteLimit {
  min: number;
  max: number;
  unit: string;
  description: string;
}

export interface TelemetryRecord {
  component_id: string;
  lot_id: string;
  part_type: string;
  burn_in_hour: number;
  timestamp: string;
  temperature: number;
  standby_current: number;
  voltage: number;
  current: number;
  power: number;
  is_checkpoint: boolean;
}

export interface LotTrajectoryPoint {
  hour: number;
  median: number;
  mad: number;
  lower_envelope: number;
  upper_envelope: number;
}

export interface LotParameterProfile {
  trajectory: LotTrajectoryPoint[];
  median_drift_rate: number;
  absolute_limit: AbsoluteLimit;
  summary_baseline: {
    initial_median: number;
    initial_mad: number;
    final_median: number;
  };
}

export interface LotFingerprint {
  lot_id: string;
  component_count: number;
  normal_count?: number;
  watch_count?: number;
  high_risk_count?: number;
  outlier_count?: number;
  parameters: Record<string, LotParameterProfile>;
  correlations: Record<string, Record<string, number>>;
}

export interface AnomalyEvaluation {
  anomaly_score: number;
  lot_deviation_score: number;
  raw_mad_deviation?: number;
  deviation_interpretation?: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  deviation_explanation?: string;
  risk_state: RiskState;
  lot_relative_status?: string;
  anomaly_types: string[];
  absolute_limit_status: 'PASS' | 'FAIL' | 'BREACHED';
  absolute_breaches: string[];
  abnormal_while_under_limit: boolean;
  contributions: Record<string, number>;
  param_z_scores: Record<string, number>;
  slope_deviations: Record<string, number>;
}

export interface ForecastTrajectoryPoint {
  hour: number;
  predicted_value: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ParameterForecast {
  parameter: string;
  current_val: number;
  predicted_168h_value: number;
  lower_bound_168h: number;
  upper_bound_168h: number;
  observed_drift_rate: number;
  predicted_drift_rate: number;
  safety_threshold: number;
  absolute_max: number;
  breaches_safety_threshold: boolean;
  breaches_absolute_limit: boolean;
  confidence_score: number;
  trajectory: ForecastTrajectoryPoint[];
}

export interface ForecastEvaluation {
  forecast_ready: boolean;
  decision_checkpoint: string;
  model_architecture: string;
  overall_confidence: number | null;
  confidence_label?: string;
  display_status?: string;
  status?: string;
  reason?: string;
  low_confidence_flag: boolean;
  parameters: Record<string, ParameterForecast>;
  validation_metrics: Record<string, { mae: number; rmse: number; std_err: number }>;
}

export interface TimeToRisk {
  display_text: string;
  hours_remaining: number | string | null;
  projected_breach_hour: number | null;
  critical_channel: string | null;
  threshold_val?: number;
  urgency: 'INFO' | 'LOW' | 'ELEVATED' | 'WARNING' | 'CRITICAL' | 'HIGH';
  is_uncertain: boolean;
  explanation: string;
}

export interface DecisionEvaluation {
  decision: ScreeningDecision;
  risk_score: number;
  confidence: number | null;
  applied_rule: string;
  plain_english_rationale: string;
  disclaimer: string;
}

export interface EvidenceStep {
  step_number: number;
  title: string;
  status: string;
  summary: string;
  metrics?: Record<string, any>;
  table_data?: any[];
  hour?: number;
  lot_id?: string;
  score?: number;
  risk_state?: string;
  absolute_limit_status?: string;
  abnormal_while_under_limit?: boolean;
  model?: string;
  confidence_score?: string;
  decision?: string;
  time_to_risk?: string;
  applied_rule?: string;
}

export interface Contributor {
  rank: string;
  parameter: string;
  importance_pct: number;
  robust_deviation_units: number;
  insight: string;
}

export interface WhatIfScenario {
  label: string;
  projected_168h_state: string;
  time_to_risk: string;
  outcome: string;
}

export interface EvidenceChain {
  component_id: string;
  lot_id: string;
  burn_in_hour: number;
  absolute_engineering_status?: string;
  lot_relative_status?: string;
  forecast_status?: string;
  chain: EvidenceStep[];
  why_contributors: Contributor[];
  what_if: {
    scenario_a_current: WhatIfScenario;
    scenario_b_counterfactual: WhatIfScenario;
    disclaimer: string;
  };
  executive_summary: string;
}

export interface ComponentEvaluation {
  component_id: string;
  lot_id: string;
  part_type: string;
  current_hour: number;
  latest_record: TelemetryRecord;
  data_quality: {
    status: DataQualityStatus;
    quality_score: number;
    issues: string[];
    sensor_noise_flag: boolean;
    valid_sample_count: number;
  };
  anomaly: AnomalyEvaluation;
  forecast: ForecastEvaluation;
  time_to_risk: TimeToRisk;
  decision: DecisionEvaluation;
  evidence_chain: EvidenceChain;
  records_history: TelemetryRecord[];
}

export interface SystemMetrics {
  current_hour: number;
  is_running: boolean;
  speed_multiplier: number;
  hero_defect_injected: boolean;
  total_components: number;
  normal_count: number;
  watch_count: number;
  high_risk_count: number;
  anomalies_flagged: number;
  early_flags_detected?: number;
  early_risks_detected: number;
  median_detection_latency_hours?: number;
  mean_detection_latency_hours?: number;
  p95_detection_latency_hours?: number;
  avg_detection_latency_hours: string;
  screening_efficiency_acceleration?: string;
  components: Array<{
    component_id: string;
    lot_id: string;
    part_type: string;
    anomaly_score: number;
    lot_deviation_score: number;
    raw_mad_deviation?: number;
    deviation_interpretation?: string;
    absolute_status: string;
    abnormal_while_under_limit: boolean;
    anomaly_types: string[];
    time_to_risk: string;
    confidence: number;
    decision: ScreeningDecision;
    risk_score: number;
    latest_temp: number;
    latest_leakage: number;
  }>;
}

export interface CalibrationSweepPoint {
  threshold: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_alarm_rate: number;
  true_positives: number;
  false_positives: number;
  true_negatives: number;
  false_negatives: number;
  is_selected?: boolean;
}

export interface ModelPerformanceData {
  evaluation_type: string;
  benchmark_seed?: number;
  sample_size: number;
  train_size?: number;
  val_size?: number;
  test_size?: number;
  selected_threshold?: number;
  threshold_selection_criterion?: string;
  calibration_sweep?: CalibrationSweepPoint[];
  disclaimer: string;
  anomaly_detection: {
    precision: number;
    recall: number;
    f1_score: number;
    false_alarm_rate: number;
    true_positives: number;
    false_positives: number;
    true_negatives: number;
    false_negatives: number;
  };
  early_drift_regression: Record<string, { mae: number; rmse: number; std_err: number }>;
  temporal_performance: {
    median_detection_latency_hours?: number;
    mean_detection_latency_hours?: number;
    p95_detection_latency_hours?: number;
    avg_detection_latency_hours: number;
    conventional_screening_hours: number;
    screening_efficiency_acceleration: string;
  };
}
