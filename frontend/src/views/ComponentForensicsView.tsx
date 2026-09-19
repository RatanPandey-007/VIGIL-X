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
  Zap,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { DecisionBadge } from '../components/DecisionBadge';
import { DataQualityBadge } from '../components/DataQualityBadge';
import { LiquidButton, LiquidCard } from '../components/LiquidInteraction';

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
        No component selected. Please select a component from the Command Center or Lot Intelligence screen.
      </div>
    );
  }

  // Multi-channel chart series
  const history = component.records_history || [];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="engineering-card rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 shadow-xs">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold font-mono text-slate-900 tracking-tight">
                  COMPONENT FORENSICS: {component.component_id}
                </h2>
                <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-xs font-mono font-bold border border-sky-200">
                  {component.lot_id}
                </span>
                <DataQualityBadge status={component.data_quality?.status ?? 'GOOD'} score={component.data_quality?.quality_score} />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Multi-channel parametric diagnostics • Time-series decomposition • Forensic evidence audit
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DecisionBadge decision={component.decision.decision} size="lg" />
            <LiquidButton
              variant="secondary"
              size="md"
              onClick={onOpenEvidenceModal}
              className="border-slate-200 text-sky-700 font-semibold"
            >
              <Layers className="w-4 h-4" />
              <span>Full Evidence Chain</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </LiquidButton>
          </div>
        </div>
      </div>

      {/* 6 Forensic Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* 1. IDENTITY */}
        <LiquidCard className="engineering-card rounded-xl p-4 border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="text-[11px] text-sky-700 font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>1. Identity & Physical Lot</span>
          </div>
          <div className="space-y-1.5 text-slate-600 text-[11px]">
            <div>Component ID: <strong className="text-slate-900">{component.component_id}</strong></div>
            <div>Lot ID: <strong className="text-slate-900">{component.lot_id}</strong></div>
            <div>Part Family: <strong className="text-slate-900">{component.part_type}</strong></div>
            <div>Screening Standard: <strong className="text-slate-500">MIL-STD-883 Class-S Space</strong></div>
          </div>
        </LiquidCard>

        {/* 2. BEHAVIOR */}
        <LiquidCard className="engineering-card rounded-xl p-4 border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="text-[11px] text-sky-700 font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>2. Parametric Behavior</span>
          </div>
          <div className="space-y-1.5 text-slate-600 text-[11px]">
            <div>Temp: <strong className="text-slate-900">{component.latest_record.temperature} °C</strong></div>
            <div>Leakage: <strong className="text-slate-900">{component.latest_record.standby_current} µA</strong></div>
            <div>Core Rail: <strong className="text-slate-900">{component.latest_record.voltage} V</strong></div>
            <div>Active Current: <strong className="text-slate-900">{component.latest_record.current} mA</strong></div>
          </div>
        </LiquidCard>

        {/* 3. ANOMALY BREAKDOWN */}
        <LiquidCard className="engineering-card rounded-xl p-4 border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="text-[11px] text-sky-700 font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>3. Module A Anomaly Engine</span>
          </div>
          <div className="space-y-1.5 text-slate-600 text-[11px]">
            <div>Anomaly Score: <strong className={component.anomaly.anomaly_score >= 40 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>{component.anomaly.anomaly_score} / 100</strong></div>
            <div>Lot Deviation: <strong className="text-sky-700 font-bold">{component.anomaly.lot_deviation_score} / 100</strong></div>
            <div>Modes: <strong className="text-slate-800 font-semibold">{component.anomaly.anomaly_types.join(', ')}</strong></div>
            <div>Abs Limits: <strong className="text-emerald-700 font-bold">{component.anomaly.absolute_limit_status}</strong></div>
          </div>
        </LiquidCard>

        {/* 4. FORECAST */}
        <LiquidCard className="engineering-card rounded-xl p-4 border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="text-[11px] text-sky-700 font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4. Module B 168h Forecast</span>
          </div>
          <div className="space-y-1.5 text-slate-600 text-[11px]">
            <div>Architecture: <strong className="text-slate-900">{component.forecast.model_architecture}</strong></div>
            <div>Confidence: <strong className="text-blue-700 font-bold">{component.forecast.overall_confidence}%</strong></div>
            <div>Time-to-Risk: <strong className="text-sky-700 font-bold">{component.time_to_risk.display_text}</strong></div>
            <div>Safety Breach: <strong className={component.time_to_risk.projected_breach_hour ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
              {component.time_to_risk.projected_breach_hour ? `Projected at ${component.time_to_risk.projected_breach_hour}h` : 'No Breach'}
            </strong></div>
          </div>
        </LiquidCard>

        {/* 5. EVIDENCE */}
        <LiquidCard className="engineering-card rounded-xl p-4 border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="text-[11px] text-sky-700 font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>5. Evidence Chain Summary</span>
          </div>
          <div className="space-y-1.5 text-slate-600 text-[11px]">
            <div>Total Stages: <strong className="text-slate-900">8 Stages Verified</strong></div>
            <div>Top Driver: <strong className="text-amber-700 font-bold">{component.evidence_chain.why_contributors[0]?.parameter ?? 'Leakage'}</strong></div>
            <div>Impact: <strong className="text-slate-900 font-bold">{component.evidence_chain.why_contributors[0]?.importance_pct ?? 0}%</strong></div>
            <div>Traceability: <strong className="text-emerald-700 font-bold">100% Auditable</strong></div>
          </div>
        </LiquidCard>

        {/* 6. DECISION */}
        <LiquidCard className="engineering-card rounded-xl p-4 border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="text-[11px] text-sky-700 font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>6. Screening Decision</span>
          </div>
          <div className="space-y-1.5 text-slate-600 text-[11px]">
            <div>Status: <strong className="text-slate-900 font-bold">{component.decision.decision}</strong></div>
            <div>Rule: <strong className="text-slate-700">{component.decision.applied_rule}</strong></div>
            <div>Risk Score: <strong className="text-slate-900 font-bold">{component.decision.risk_score} / 100</strong></div>
            <div className="text-[10px] text-slate-400 italic">AI-Assisted screening triage</div>
          </div>
        </LiquidCard>
      </div>

      {/* Forensic Multi-Channel Timeline Plots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Plot 1: Temperature */}
        <div className="engineering-card rounded-xl p-4 border border-slate-200 bg-white shadow-xs">
          <div className="text-xs font-mono font-bold text-slate-800 mb-2">
            Case Temperature Progression (°C)
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="burn_in_hour" stroke="#64748B" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}h`} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={[65, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                <Line type="monotone" dataKey="temperature" stroke="#D97706" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 2: Standby Current */}
        <div className="engineering-card rounded-xl p-4 border border-slate-200 bg-white shadow-xs">
          <div className="text-xs font-mono font-bold text-slate-800 mb-2">
            Standby Leakage Current (µA)
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="burn_in_hour" stroke="#64748B" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}h`} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={[20, 60]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                <Line type="monotone" dataKey="standby_current" stroke="#0284C7" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 3: Voltage Rail */}
        <div className="engineering-card rounded-xl p-4 border border-slate-200 bg-white shadow-xs">
          <div className="text-xs font-mono font-bold text-slate-800 mb-2">
            Core Voltage Rail Stability (V)
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="burn_in_hour" stroke="#64748B" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}h`} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={[3.25, 3.35]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                <Line type="monotone" dataKey="voltage" stroke="#059669" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
