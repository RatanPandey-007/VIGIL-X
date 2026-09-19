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
  BarChart3
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
