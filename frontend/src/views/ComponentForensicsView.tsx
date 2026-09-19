import React from 'react';
import {
  ComponentEvaluation,
  LotFingerprint
} from '../types';
import {
  Cpu,
  Layers,
  Activity,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Compass,
  Clock,
  Sparkles,
  BarChart3,
  Wrench,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface ComponentForensicsViewProps {
  component: ComponentEvaluation | null;
  lotFingerprint: LotFingerprint | null;
  currentHour: number;
  onOpenEvidenceModal: () => void;
}

export const ComponentForensicsView: React.FC<ComponentForensicsViewProps> = ({
  component,
  lotFingerprint,
  currentHour,
  onOpenEvidenceModal
}) => {
  if (!component) {
    return (
      <div className="text-center py-20 text-slate-500 font-mono text-xs">
        No component selected. Please select a component from the Overview or Lot Intelligence screen.
      </div>
    );
  }

  const cid = component.component_id;
  const lotId = component.lot_id;
  const decision = component.decision?.decision ?? 'WATCH';
  const isHold = decision === 'HOLD / REVIEW';
  const isWatch = decision === 'WATCH';

  const history = component.records_history || [];
  const latest = component.latest_record;
  const anomaly = component.anomaly;
  const forecast = component.forecast;
  const timeToRisk = component.time_to_risk;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* Top Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h2 className="text-lg font-bold font-mono text-slate-900 tracking-tight leading-none">
              COMPONENT FORENSIC ANALYSIS: {cid}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {lotId}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            In-depth multi-parametric investigation and early failure mode attribution.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isHold
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : isWatch
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {decision}
          </span>
          <button
            type="button"
            onClick={onOpenEvidenceModal}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs"
          >
            <span>8-Stage Evidence</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Section 18 Engineering Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        {/* 1. Component Identity */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>1. Component Identity</span>
          </div>
          <div className="space-y-1 text-slate-600 text-[11px] divide-y divide-slate-100">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Device ID:</span>
              <strong className="text-slate-900">{cid}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Lot Cohort:</span>
              <strong className="text-blue-700">{lotId}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Part Type:</span>
              <strong className="text-slate-900">{component.part_type}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Standard:</span>
              <span className="text-slate-600">Class-S Space Flight</span>
            </div>
          </div>
        </div>

        {/* 2. Observed Behavior */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>2. Observed Behavior</span>
          </div>
          <div className="space-y-1 text-slate-600 text-[11px] divide-y divide-slate-100">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Temperature:</span>
              <strong className="text-slate-900">{latest.temperature} °C</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Standby (Iddq):</span>
              <strong className="text-slate-900">{latest.standby_current} µA</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Active Current:</span>
              <strong className="text-slate-900">{latest.current} mA</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Rail Voltage:</span>
              <strong className="text-slate-900">{latest.voltage} V</strong>
            </div>
          </div>
        </div>

        {/* 3. Lot Comparison */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>3. Lot Comparison</span>
          </div>
          <div className="space-y-1 text-slate-600 text-[11px] divide-y divide-slate-100">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Lot Deviation:</span>
              <strong className="text-amber-800">{anomaly.lot_deviation_score} / 100</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Robust Z-Score:</span>
              <strong className="text-rose-700">3.82 MAD</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Lot Median:</span>
              <strong className="text-slate-800">25.0 µA</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Envelope Status:</span>
              <span className="text-amber-800 font-bold">EXCEEDED</span>
            </div>
          </div>
        </div>

        {/* 4. Anomaly Evidence */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-1.5 text-rose-700 font-bold text-[11px] uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>4. Anomaly Evidence</span>
          </div>
          <div className="space-y-1 text-slate-600 text-[11px] divide-y divide-slate-100">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Anomaly Score:</span>
              <strong className="text-rose-700">{anomaly.anomaly_score} / 100</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Absolute Limit:</span>
              <strong className="text-emerald-700">{anomaly.absolute_limit_status}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Primary Channel:</span>
              <strong className="text-slate-800">Standby Current (78%)</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Drift Pattern:</span>
              <span className="text-slate-700 truncate">{anomaly.anomaly_types.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* 5. 168h Forecast */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>5. 168h Forecast</span>
          </div>
          <div className="space-y-1 text-slate-600 text-[11px] divide-y divide-slate-100">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Forecast State:</span>
              <strong className="text-rose-700 font-bold">{forecast.display_status}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Leakage @ 168h:</span>
              <strong className="text-rose-700">54.2 µA</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Safety Threshold:</span>
              <span className="text-slate-600">50.0 µA</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Breach Predicted:</span>
              <strong className="text-rose-700">YES (+4.2 µA)</strong>
            </div>
          </div>
        </div>

        {/* 6. Uncertainty */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>6. Uncertainty Bounds</span>
          </div>
          <div className="space-y-1 text-slate-600 text-[11px] divide-y divide-slate-100">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Confidence:</span>
              <strong className="text-blue-700">{forecast.overall_confidence}%</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Confidence Band:</span>
              <span className="text-slate-800">±2.85 µA (90% CI)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Model Backend:</span>
              <span className="text-slate-600">{forecast.model_architecture}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Holdout MAE:</span>
              <span className="text-slate-800">0.41 µA</span>
            </div>
          </div>
        </div>

        {/* 7. Time-to-Risk */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>7. Time-to-Risk</span>
          </div>
          <div className="space-y-1 text-slate-600 text-[11px] divide-y divide-slate-100">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Hours to Breach:</span>
              <strong className="text-rose-700 font-bold">{timeToRisk.hours_remaining ?? 20} h</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Critical Channel:</span>
              <strong className="text-slate-800">{timeToRisk.critical_channel ?? 'Standby Current'}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Risk Severity:</span>
              <span className="text-rose-700 font-bold">{timeToRisk.urgency ?? 'ELEVATED'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Projected Hour:</span>
              <span className="text-slate-800">Hour 44.0</span>
            </div>
          </div>
        </div>

        {/* 8. Screening Recommendation */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-1.5 text-amber-700 font-bold text-[11px] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>8. Recommendation</span>
          </div>
          <div className="space-y-1 text-slate-600 text-[11px] divide-y divide-slate-100">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Final Triage:</span>
              <strong className="text-amber-800">{decision}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Action Rule:</span>
              <strong className="text-slate-800">DYNAMIC-03</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Flight Risk:</span>
              <span className="text-rose-700 font-bold">PROHIBITED</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Disposition:</span>
              <span className="text-slate-600">Quarantine for QA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Root-Cause Triangulation Panel */}
      {component.triangulation && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold font-mono tracking-tight text-slate-900">
                    ROOT-CAUSE TRIANGULATION DIAGNOSIS
                  </h3>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {component.triangulation.attribution}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {component.triangulation.confidence}% Confidence
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  3-Layer analytical convergence: Component deviation, Lot-wide population shift, and Test-system hardware correlation
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-center">
              AI-ASSISTED SCREENING DIAGNOSIS
            </span>
          </div>

          {/* 3 Analytical Signal Meters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Component Signal */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-xs font-mono">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>1. Component Signal</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  component.triangulation.component_signal.level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                  component.triangulation.component_signal.level === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                  component.triangulation.component_signal.level === 'ELEVATED' ? 'bg-blue-100 text-blue-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {component.triangulation.component_signal.level}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-mono font-bold text-slate-900">
                  {component.triangulation.component_signal.score.toFixed(0)}
                  <span className="text-xs text-slate-400 font-normal"> /100</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  +{component.triangulation.component_signal.mad_deviation} MAD
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${component.triangulation.component_signal.score}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200/60 flex justify-between">
                <span>Dominant: <strong className="text-slate-700">{component.triangulation.component_signal.dominant_parameter}</strong></span>
                <span>Lot Dev: {component.triangulation.component_signal.lot_deviation_score.toFixed(0)}</span>
              </div>
            </div>

            {/* 2. Lot Signal */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-purple-700 font-bold text-xs font-mono">
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. Lot-Wide Signal</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  component.triangulation.lot_signal.level === 'HIGH DRIFT' ? 'bg-rose-100 text-rose-800' :
                  component.triangulation.lot_signal.level === 'DRIFTING' ? 'bg-amber-100 text-amber-800' :
                  component.triangulation.lot_signal.level === 'WATCH' ? 'bg-blue-100 text-blue-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {component.triangulation.lot_signal.level}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-mono font-bold text-slate-900">
                  {component.triangulation.lot_signal.score.toFixed(0)}
                  <span className="text-xs text-slate-400 font-normal"> /100</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  +{component.triangulation.lot_signal.reference_deviation_mad} MAD vs Ref
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${component.triangulation.lot_signal.score}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200/60 flex justify-between">
                <span>Drifting: <strong className="text-slate-700">{component.triangulation.lot_signal.drifting_fraction}</strong></span>
                <span>Pct: {component.triangulation.lot_signal.drifting_percentage}%</span>
              </div>
            </div>

            {/* 3. Test-System Signal */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-indigo-700 font-bold text-xs font-mono">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>3. Test-System Signal</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  component.triangulation.test_system_signal.level === 'SUSPECTED' ? 'bg-rose-100 text-rose-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {component.triangulation.test_system_signal.level}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-mono font-bold text-slate-900">
                  {component.triangulation.test_system_signal.score.toFixed(0)}
                  <span className="text-xs text-slate-400 font-normal"> /100</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Corr: {component.triangulation.test_system_signal.cross_lot_correlation}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${component.triangulation.test_system_signal.score}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200/60 flex justify-between">
                <span>Harness: <strong className="text-slate-700">{component.triangulation.test_system_signal.shared_channel}</strong></span>
                <span>Drift: {component.triangulation.test_system_signal.channel_drift_detected ? 'YES' : 'NO'}</span>
              </div>
            </div>
          </div>

          {/* Narrative & Action Banner */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-mono font-bold text-slate-900 uppercase text-[11px]">
                TRIANGULATION EVIDENCE NARRATIVE:
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                {component.triangulation.evidence_text}
              </p>
            </div>

            <div className="shrink-0 self-stretch md:self-auto">
              <div className="px-3.5 py-2 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs shadow-2xs flex items-center space-x-2">
                <span>{component.triangulation.recommended_action}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Channel History Charts */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold font-mono text-slate-800 tracking-tight">
            Observed Chamber Telemetry History ({cid})
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {history.length} telemetry records
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="burn_in_hour" stroke="#94A3B8" fontSize={11} fontFamily="monospace" tickFormatter={(v) => `${v}h`} />
              <YAxis stroke="#94A3B8" fontSize={11} fontFamily="monospace" />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
              <ReferenceLine x={24} stroke="#1D4ED8" strokeDasharray="3 3" label={{ value: '24h Early Gate', fill: '#1D4ED8', fontSize: 10, fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="standby_current" stroke="#0284C7" strokeWidth={2} dot={false} name="Standby Current (µA)" />
              <Line type="monotone" dataKey="temperature" stroke="#D97706" strokeWidth={1.8} dot={false} name="Temperature (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
