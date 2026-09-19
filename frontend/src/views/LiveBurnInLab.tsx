import React from 'react';
import {
  ComponentEvaluation,
  LotFingerprint,
  SystemMetrics
} from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Zap,
  Target
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
import { DecisionBadge } from '../components/DecisionBadge';
import { LiquidButton, LiquidCard } from '../components/LiquidInteraction';

interface LiveBurnInLabProps {
  metrics: SystemMetrics | null;
  component: ComponentEvaluation | null;
  lotFingerprint: LotFingerprint | null;
  currentHour: number;
  isRunning: boolean;
  speed: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onInjectDefect: () => void;
  onHeroDemo: () => void;
  onOpenEvidenceModal: () => void;
  onSelectComponent: (cid: string) => void;
}

export const LiveBurnInLab: React.FC<LiveBurnInLabProps> = ({
  metrics,
  component,
  lotFingerprint,
  currentHour,
  isRunning,
  speed,
  onStart,
  onPause,
  onReset,
  onSpeedChange,
  onInjectDefect,
  onHeroDemo,
  onOpenEvidenceModal,
  onSelectComponent
}) => {
  const currentCid = component?.component_id ?? 'C-104';
  const isHero = currentCid === 'C-104';
  const defectInjected = metrics?.hero_defect_injected ?? false;

  // Derive stage and phase directly from the Header Global Clock (Single Source of Truth)
  const getClockPhase = (h: number) => {
    if (h < 8) return { label: 'STAGE 1 — NOMINAL BASELINE', sublabel: '0-8h: Nominal Process Variation', color: 'text-emerald-700', step: 1 };
    if (h < 15) return { label: 'STAGE 1 / DRIFT ONSET', sublabel: '8-15h: Incipient Thermal Drift', color: 'text-amber-800', step: 2 };
    if (h < 20) return { label: 'CURRENT VARIANCE / EARLY DRIFT', sublabel: '15-20h: Elevated Current Variance', color: 'text-amber-800', step: 3 };
    if (h < 24) return { label: 'STAGE 2 — LATENT DRIFT', sublabel: '20-24h: Lot Envelope Divergence', color: 'text-amber-900', step: 4 };
    if (h < 96) return { label: '24h EARLY DECISION GATE', sublabel: '24-96h: Module B 168h Forecast Active', color: 'text-sky-700', step: 5 };
    if (h < 168) return { label: '96h MID GATE', sublabel: '96-168h: Mid-Burn-In Recalculation', color: 'text-rose-700', step: 6 };
    return { label: '168h FINAL OUTCOME', sublabel: '168h: Final Screening Qualification', color: 'text-rose-800', step: 7 };
  };

  const currentPhase = getClockPhase(currentHour);

  // Active state flags for the 3 visualizer cards strictly derived from clock and limits
  const isBreached = component?.anomaly?.absolute_limit_status === 'FAIL' || component?.anomaly?.absolute_limit_status === 'BREACHED';
  const isStage1Active = currentHour < 20.0 && !isBreached;
  const isStage2Active = currentHour >= 20.0 && currentHour < 90.0 && !isBreached;
  const isStage3Active = currentHour >= 90.0 || isBreached;
  const isAt24hGate = Math.abs(currentHour - 24.0) < 4.0;

  // Prepare chart series from component history
  const historyData = component?.records_history ?? [];

  return (
    <div className="space-y-6">
      {/* Top Banner: Hero Demo Control Center */}
      <div className="engineering-card rounded-2xl p-5 border border-slate-200 bg-white shadow-liquid">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 shadow-xs">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold font-mono text-slate-900">
                    LIVE BURN-IN SIMULATION LAB
                  </h2>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs text-slate-500 font-mono">Component:</span>
                    <select
                      value={currentCid}
                      onChange={(e) => onSelectComponent(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 text-sky-700 font-mono text-xs font-semibold border border-slate-200 outline-none hover:border-sky-400 transition cursor-pointer shadow-xs"
                    >
                      <option value="C-104">C-104 (Hero Latent Drift)</option>
                      <option value="C-003">C-003 (LOT-A17)</option>
                      <option value="C-001">C-001 (LOT-A17)</option>
                      <option value="C-002">C-002 (LOT-A17)</option>
                      <option value="C-005">C-005 (LOT-A17)</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Real-time environmental stress acceleration • SIH26170 Demonstration Lab
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Hero Reset & Defect Injection with Visceral Physical Response */}
          <div className="flex flex-wrap items-center gap-2">
            <LiquidButton
              variant="secondary"
              onClick={onHeroDemo}
              className="px-3 py-2 text-xs font-mono font-medium rounded-xl"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>1-Click Hero Reset</span>
            </LiquidButton>

            <LiquidButton
              variant="danger"
              onClick={onInjectDefect}
              disabled={defectInjected}
              compressScale="active:scale-[0.995]"
              className="px-4 py-2 text-xs font-mono font-bold rounded-xl"
            >
              <Flame className="w-4 h-4 text-white" />
              <span>{defectInjected ? `Latent Defect Active (${currentCid})` : `INJECT LATENT DEFECT (${currentCid})`}</span>
            </LiquidButton>
          </div>
        </div>

        {/* Burn-in Timeline Scrubber & Progression Stepper */}
        <div className="mt-5 pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Clock Phase:</span>
              <strong className={currentPhase.color}>{currentPhase.label}</strong>
              <span className="text-slate-400 font-normal">({currentPhase.sublabel})</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Time-to-Risk:</span>
              <strong className="text-sky-700 font-bold">{component?.time_to_risk?.display_text ?? 'UNAVAILABLE / AWAITING EARLY DATA'}</strong>
            </div>
          </div>

          {/* 168-Hour Scrub Bar */}
          <div className="relative w-full bg-slate-100 h-3.5 rounded-full border border-slate-200 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 rounded-full transition-all duration-300"
              style={{ width: `${(currentHour / 168.0) * 100}%` }}
            />
            {/* Checkpoint Markers */}
            {[0, 24, 96, 168].map((cp) => (
              <div
                key={cp}
                className="absolute top-0 bottom-0 w-0.5 bg-slate-400/80"
                style={{ left: `${(cp / 168.0) * 100}%` }}
              />
            ))}
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0h (Load)</span>
            <span className="text-sky-700 font-bold">24h (Early Gate)</span>
            <span>96h (Mid Gate)</span>
            <span>168h (Final Qualification)</span>
          </div>
        </div>
      </div>

      {/* 24h Early Decision Gate Callout (Hero Focus Beacon) */}
      {isAt24hGate && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 shadow-sm flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 mt-0.5">
              <Target className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <strong className="text-sky-900 font-bold text-sm">24h EARLY DECISION GATE REACHED</strong>
                <span className="px-2 py-0.5 rounded bg-sky-200/80 text-sky-800 text-[10px] font-bold">CRITICAL DECISION CHECKPOINT</span>
              </div>
              <p className="text-slate-600 mt-1 font-sans text-xs">
                Component exhibits subtle lot-relative divergence while passing absolute limits. Module B 168h regression is now active.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded-lg border border-sky-200 shadow-xs">
              <span className="text-slate-500 block text-[9px]">ABSOLUTE LIMIT</span>
              <span className="font-bold text-emerald-700">PASS</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-sky-200 shadow-xs">
              <span className="text-slate-500 block text-[9px]">LOT STATUS</span>
              <span className="font-bold text-amber-700">ANOMALOUS</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-sky-200 shadow-xs">
              <span className="text-slate-500 block text-[9px]">MODULE B</span>
              <span className="font-bold text-sky-700">ACTIVE</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-sky-200 shadow-xs">
              <span className="text-slate-500 block text-[9px]">DECISION</span>
              <span className="font-bold text-rose-700">{component?.decision?.decision ?? 'HOLD / REVIEW'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Progression 3-Stage Flow Visualizer strictly synchronized with Clock */}
      <div className="engineering-card rounded-2xl p-4 border border-slate-200 bg-white shadow-liquid text-xs font-mono space-y-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500">
          <span>3-Stage Screening Scenario ({currentCid})</span>
          <span className="text-sky-700 font-bold">Clock: {currentHour.toFixed(1)} / 168.0h • {currentPhase.label}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`p-3.5 rounded-xl border transition duration-200 ${
            isStage1Active
              ? 'bg-emerald-50 border-emerald-300 shadow-sm ring-1 ring-emerald-400/30'
              : 'bg-slate-50/70 border-slate-200 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase ${isStage1Active ? 'text-emerald-800' : 'text-slate-400'}`}>
                Stage 1: Healthy (0–8h)
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                isStage1Active ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-400'
              }`}>
                ACCEPT
              </span>
            </div>
            <div className={`font-bold mt-1 ${isStage1Active ? 'text-slate-900' : 'text-slate-500'}`}>Nominal Lot Tracking</div>
            <p className="text-[11px] text-slate-600 font-sans mt-1">
              Absolute limit: <strong className="text-emerald-700">PASS</strong> • Lot deviation: <strong className="text-slate-700">LOW</strong> • Module B: <strong className="text-sky-700">AWAITING 24h GATE</strong> • Decision: <strong className="text-emerald-700">ACCEPT</strong>.
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border transition duration-200 ${
            isStage2Active
              ? 'bg-amber-50 border-amber-300 shadow-md ring-1 ring-amber-400/30'
              : 'bg-slate-50/70 border-slate-200 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase ${isStage2Active ? 'text-amber-800' : 'text-slate-400'}`}>
                Stage 2: Latent Drift (20–24h)
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                isStage2Active ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-400'
              }`}>
                WATCH / HOLD REVIEW
              </span>
            </div>
            <div className={`font-bold mt-1 ${isStage2Active ? 'text-slate-900' : 'text-slate-500'}`}>Lot-Relative Outlier Gate</div>
            <p className="text-[11px] text-slate-600 font-sans mt-1">
              Absolute limit: <strong className="text-emerald-700">PASS</strong> • Lot deviation: <strong className="text-amber-700">HIGH</strong> • Anomaly: <strong className="text-amber-700">60–75</strong> • 168h: <strong className="text-rose-700">RISK</strong> • Time-to-Risk: <strong className="text-sky-700">Calculated</strong>.
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border transition duration-200 ${
            isStage3Active
              ? 'bg-rose-50 border-rose-300 shadow-md ring-1 ring-rose-400/30'
              : 'bg-slate-50/70 border-slate-200 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase ${isStage3Active ? 'text-rose-800' : 'text-slate-400'}`}>
                Stage 3: Eventual Limit Breach (&gt;90h)
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                isStage3Active ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-400'
              }`}>
                HOLD / REVIEW
              </span>
            </div>
            <div className={`font-bold mt-1 ${isStage3Active ? 'text-slate-900' : 'text-slate-500'}`}>SIMULATED LIMIT BREACH</div>
            <p className="text-[11px] text-slate-600 font-sans mt-1">
              Absolute limit: <strong className="text-rose-700">BREACHED</strong> • Anomaly: <strong className="text-rose-700">HIGH</strong> • Time-to-Risk: <strong className="text-rose-700">BREACHED</strong> • AI-assisted screening quarantine.
            </p>
          </div>
        </div>
      </div>

      {/* Live Parametric Telemetry Channels (2x2 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Channel 1: Case Temperature */}
        <div className="engineering-card rounded-2xl p-4 border border-slate-200 bg-white shadow-liquid">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="font-bold text-slate-900">Channel 1: Case Temperature (°C)</span>
            <span className="text-amber-700 font-bold">
              {component?.latest_record?.temperature ?? '--'} °C
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="burn_in_hour" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${v}h`} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} domain={[65, 105]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }} />
                <ReferenceLine y={95} stroke="#D97706" strokeDasharray="3 3" label={{ value: 'Safety (95°C)', fill: '#D97706', fontSize: 10, fontWeight: 'bold' }} />
                <ReferenceLine y={125} stroke="#DC2626" label={{ value: 'Max (125°C)', fill: '#DC2626', fontSize: 10, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="temperature" stroke="#D97706" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel 2: Standby / Leakage Current */}
        <div className="engineering-card rounded-2xl p-4 border border-slate-200 bg-white shadow-liquid">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="font-bold text-slate-900">Channel 2: Standby Leakage Current (µA)</span>
            <span className="text-sky-700 font-bold">
              {component?.latest_record?.standby_current ?? '--'} µA
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="burn_in_hour" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${v}h`} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} domain={[20, 70]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }} />
                <ReferenceLine y={55} stroke="#D97706" strokeDasharray="3 3" label={{ value: 'Safety (55µA)', fill: '#D97706', fontSize: 10, fontWeight: 'bold' }} />
                <ReferenceLine y={85} stroke="#DC2626" label={{ value: 'Max (85µA)', fill: '#DC2626', fontSize: 10, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="standby_current" stroke="#0284C7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel 3: Operating Rail Voltage */}
        <div className="engineering-card rounded-2xl p-4 border border-slate-200 bg-white shadow-liquid">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="font-bold text-slate-900">Channel 3: Core Voltage Rail (V)</span>
            <span className="text-emerald-700 font-bold">
              {component?.latest_record?.voltage ?? '--'} V
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="burn_in_hour" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${v}h`} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} domain={[3.2, 3.4]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }} />
                <ReferenceLine y={3.45} stroke="#D97706" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="voltage" stroke="#059669" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel 4: Operating Current */}
        <div className="engineering-card rounded-2xl p-4 border border-slate-200 bg-white shadow-liquid">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="font-bold text-slate-900">Channel 4: Active Current (mA)</span>
            <span className="text-purple-700 font-bold">
              {component?.latest_record?.current ?? '--'} mA
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="burn_in_hour" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${v}h`} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 10, fill: '#64748B' }} domain={[75, 120]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }} />
                <ReferenceLine y={145} stroke="#D97706" strokeDasharray="3 3" label={{ value: 'Safety (145mA)', fill: '#D97706', fontSize: 10, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="current" stroke="#7C3AED" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
