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
  ChevronDown,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Zap,
  Activity
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
  onHeroDemo: () => void; // internal prop preserved
  onOpenEvidenceModal: () => void;
  onSelectComponent: (cid: string) => void;
}

export const LiveBurnInLab: React.FC<LiveBurnInLabProps> = ({
  metrics,
  component,
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
  const lotId = component?.lot_id ?? 'LOT-A17';
  const defectInjected = metrics?.hero_defect_injected ?? false;
  const compList = metrics?.components ?? [];

  // 4 Checkpoint timeline markers (Section 15)
  const timelineMarkers = [
    { hour: 0, label: '0h', title: 'Chamber Start', status: 'PAST' },
    { hour: 24, label: '24h', title: 'EARLY DECISION', status: currentHour >= 24 ? 'ACTIVE' : 'FUTURE' },
    { hour: 96, label: '96h', title: 'MID GATE', status: currentHour >= 96 ? 'ACTIVE' : 'FUTURE' },
    { hour: 168, label: '168h', title: 'FINAL OUTCOME', status: currentHour >= 168 ? 'ACTIVE' : 'FUTURE' }
  ];

  // Prepare chart series from component history
  const historyData = component?.records_history ?? [];

  // Latest telemetry values
  const latest = component?.latest_record;
  const tempVal = latest?.temperature ?? 68.4;
  const standbyVal = latest?.standby_current ?? 28.59;
  const currVal = latest?.current ?? 111.6;
  const voltVal = latest?.voltage ?? 3.298;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* Section 14: Laboratory Control Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Header Info */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-base font-bold font-mono text-slate-900 tracking-tight leading-none">
                LIVE BURN-IN
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                LABORATORY INSTRUMENT
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-600 mt-2">
              <div>
                <span className="text-slate-400">Component:</span>{' '}
                <strong className="text-slate-900">{currentCid}</strong>
              </div>
              <span className="text-slate-300">•</span>
              <div>
                <span className="text-slate-400">Lot:</span>{' '}
                <strong className="text-blue-700">{lotId}</strong>
              </div>
              <span className="text-slate-300">•</span>
              <div>
                <span className="text-slate-400">Burn-in:</span>{' '}
                <strong className="text-slate-900">{currentHour.toFixed(0)}h / 168h</strong>
              </div>
              <span className="text-slate-300">•</span>
              <div>
                <span className="text-slate-400">Speed:</span>{' '}
                <strong className="text-slate-900">{speed}x accelerated</strong>
              </div>
            </div>
          </div>

          {/* Physical Hardware Controls (Section 14) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* START / PAUSE */}
            {isRunning ? (
              <button
                type="button"
                onClick={onPause}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-mono font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs"
              >
                <Pause className="w-3.5 h-3.5 text-amber-700" />
                <span>PAUSE</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStart}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 text-emerald-700" />
                <span>START</span>
              </button>
            )}

            {/* RESET */}
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs"
              title="Reset burn-in to 0h"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>RESET</span>
            </button>

            {/* DEMO MODE (Replaces Hero Demo) */}
            <button
              type="button"
              onClick={onHeroDemo}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-mono font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs"
              title="Run deterministic VIGIL-X demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>DEMO MODE</span>
            </button>

            {/* INJECT LATENT DEFECT */}
            <button
              type="button"
              onClick={onInjectDefect}
              disabled={defectInjected}
              className={`px-3.5 py-2 rounded-xl font-mono font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs border ${
                defectInjected
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{defectInjected ? 'DEFECT ACTIVE' : 'INJECT LATENT DEFECT'}</span>
            </button>
          </div>
        </div>

        {/* Section 15: Clean Engineering Timeline */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span>CHAMBER TIMELINE (168h ENVIRONMENTAL STRESS SCREENING)</span>
            <span className="font-bold text-slate-800">
              Current: {currentHour.toFixed(1)} h ({Math.min(100, (currentHour / 168) * 100).toFixed(0)}%)
            </span>
          </div>

          <div className="relative pt-3 pb-2">
            {/* Thin Horizontal Line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200" />
            <div
              className="absolute top-6 left-0 h-0.5 bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(100, (currentHour / 168) * 100)}%` }}
            />

            {/* Checkpoint Markers */}
            <div className="relative flex justify-between">
              {timelineMarkers.map((m) => {
                const isPassed = currentHour >= m.hour;
                const isExact = Math.abs(currentHour - m.hour) < 4;

                return (
                  <div key={m.hour} className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                        isExact
                          ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-100'
                          : isPassed
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      {isPassed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-900 mt-2">
                      {m.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">
                      {m.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 16: COMPACT CHANNEL TREND CARDS (2x2 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Temperature */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
              Temperature
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
              Drifting (+0.28°C/h)
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {tempVal} °C
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Limit: 125 °C • Case Stress
          </div>
          <div className="h-16 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <Line type="monotone" dataKey="temperature" stroke="#D97706" strokeWidth={1.8} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Standby Leakage Current */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
              Standby Current (Iddq)
            </span>
            <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
              Outlier (+0.18µA/h)
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {standbyVal} µA
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Limit: 50.0 µA • Lot Med: 25.0 µA
          </div>
          <div className="h-16 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <Line type="monotone" dataKey="standby_current" stroke="#0284C7" strokeWidth={1.8} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Active Current */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
              Active Current
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              Nominal Tracking
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {currVal} mA
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Limit: 180 mA • Active Load
          </div>
          <div className="h-16 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <Line type="monotone" dataKey="current" stroke="#7C3AED" strokeWidth={1.8} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Supply Voltage */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
              Rail Voltage
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              Regulated 3.30V
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {voltVal} V
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Limit: 3.60 V • Tolerance ±5%
          </div>
          <div className="h-16 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <Line type="monotone" dataKey="voltage" stroke="#059669" strokeWidth={1.8} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Target Component Selector Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-600">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Switch Monitored Component:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {compList.slice(0, 8).map((c) => {
            const isSelected = c.component_id === currentCid;
            return (
              <button
                key={c.component_id}
                type="button"
                onClick={() => onSelectComponent(c.component_id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {c.component_id}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
