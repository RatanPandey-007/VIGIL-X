import React from 'react';
import {
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Sliders,
  Cpu,
  Wrench
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { LotHealthRadarData, FourStateMatrix } from '../types';

interface LotHealthRadarCardProps {
  radarData?: LotHealthRadarData | null;
  lotId?: string;
  fourStateMatrix?: FourStateMatrix | null;
  attribution?: string;
  attributionLabel?: string;
  recommendedAction?: string;
  evidenceText?: string;
  className?: string;
}

export const LotHealthRadarCard: React.FC<LotHealthRadarCardProps> = ({
  radarData,
  lotId = 'LOT-A17',
  fourStateMatrix,
  attribution,
  attributionLabel,
  recommendedAction,
  evidenceText,
  className = ''
}) => {
  const healthScore = radarData?.lot_health_score ?? 82.5;
  const driftingFraction = radarData?.population_showing_drift ?? '2 / 25';
  const driftingPct = radarData?.drifting_percentage ?? 8.0;
  const dominantParam = radarData?.dominant_parameter ?? 'Operating Temperature';
  const refMad = radarData?.reference_deviation_mad ?? 0.85;
  const commonCauseState = radarData?.common_cause_drift ?? 'NORMAL';

  // Determine health color
  const getHealthColor = (score: number) => {
    if (score >= 70) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', fill: '#10B981' };
    if (score >= 45) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', fill: '#F59E0B' };
    return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', fill: '#EF4444' };
  };

  const healthColors = getHealthColor(healthScore);

  // Distribution chart data
  const distData = radarData?.population_distribution && radarData.population_distribution.length > 0
    ? radarData.population_distribution
    : [
        { offset: '-3σ', current_density: 0.03, reference_density: 0.04 },
        { offset: '-2σ', current_density: 0.12, reference_density: 0.14 },
        { offset: '-1σ', current_density: 0.28, reference_density: 0.34 },
        { offset: 'Median', current_density: 0.38, reference_density: 0.40 },
        { offset: '+1σ', current_density: 0.34, reference_density: 0.34 },
        { offset: '+2σ', current_density: 0.18, reference_density: 0.14 },
        { offset: '+3σ', current_density: 0.08, reference_density: 0.04 },
      ];

  const activeCell = fourStateMatrix?.active_cell ?? 'NORMAL';
  const counts = fourStateMatrix?.counts ?? { normal: 23, lot_drift: 1, individual_defect: 1, systemic_risk: 0 };

  return (
    <div className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col space-y-5 ${className}`}>
      {/* 1. Header & Disclaimers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-700 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold font-mono tracking-tight text-slate-900">
                LOT HEALTH RADAR & POPULATION DISPERSION
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {lotId}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Multi-signal statistical analysis vs simulated reference lots (Flight Heritage Baseline)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-50 text-slate-600 border border-slate-200 flex items-center space-x-1">
            <Info className="w-3 h-3 text-slate-400" />
            <span>AI-ASSISTED SCREENING DIAGNOSIS</span>
          </span>
        </div>
      </div>

      {/* 2. Key Indicator Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Lot Health Score */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-extrabold border ${healthColors.bg} ${healthColors.text} ${healthColors.border}`}>
            <span className="text-base leading-none">{healthScore.toFixed(0)}</span>
            <span className="text-[9px] text-slate-400">/100</span>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Lot Health Score
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
              {healthScore >= 70 ? 'Optimal Flight Margin' : healthScore >= 45 ? 'Degraded Margin' : 'Critical Drift'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              MAD dispersion ratio
            </div>
          </div>
        </div>

        {/* Coordinated Drift Ratio */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-extrabold border ${
            driftingPct > 30 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            <span className="text-xs leading-none">{driftingPct.toFixed(0)}%</span>
            <span className="text-[9px] text-slate-400 mt-0.5">drift</span>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Drifting Population
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5 font-mono">
              {driftingFraction} units
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {driftingPct > 30 ? 'Coordinated drift' : 'Sub-threshold noise'}
            </div>
          </div>
        </div>

        {/* Reference Deviation MAD */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Reference Envelope Shift
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5 font-mono">
              +{refMad.toFixed(2)} MAD units
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate">
              vs REFERENCE-LOT-01
            </div>
          </div>
        </div>

        {/* Dominant Drift Vector */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Primary Drift Channel
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
              {dominantParam}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Common-Cause: <span className="font-bold">{commonCauseState}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Distribution Curve & 4-State Reliability Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Population Distribution Shift Curve (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-mono font-bold text-slate-800">
                POPULATION DENSITY vs REFERENCE LOT BASELINE
              </span>
              <p className="text-[11px] text-slate-500">
                Gaussian kernel density comparison against heritage flight qualification envelope
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono">
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="w-2.5 h-0.5 bg-slate-400 inline-block border-dashed" />
                <span>Heritage Baseline</span>
              </span>
              <span className="flex items-center space-x-1 text-blue-600 font-bold">
                <span className="w-2.5 h-1.5 bg-blue-600 rounded-xs inline-block" />
                <span>{lotId} Active</span>
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="activeLotGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="refLotGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="offset" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} domain={[0, 0.6]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.5rem', fontSize: '11px' }}
                />
                <Area
                  type="monotone"
                  dataKey="reference_density"
                  name="Flight Heritage"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#refLotGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="current_density"
                  name={`${lotId} Active Density`}
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#activeLotGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span>Statistical divergence: <span className="font-bold text-slate-700">+{refMad.toFixed(2)} MAD</span></span>
            <span className="text-slate-400">Simulated Heritage Baseline (N=200)</span>
          </div>
        </div>

        {/* Right: 4-State Reliability Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-800">
              4-STATE RELIABILITY MATRIX
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Component vs Lot Level
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            {/* Cell 1: Top-Left: Normal */}
            <div className={`p-2.5 rounded-lg border text-left transition-all ${
              activeCell === 'NORMAL'
                ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-200'
                : 'bg-white border-slate-200/80 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-800">NORMAL</span>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 rounded">
                  {counts.normal}
                </span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                Lot & component within flight boundaries
              </p>
            </div>

            {/* Cell 2: Top-Right: Lot-Wide Drift */}
            <div className={`p-2.5 rounded-lg border text-left transition-all ${
              activeCell === 'LOT-WIDE DRIFT'
                ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-200 shadow-xs'
                : 'bg-white border-slate-200/80 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-rose-800">LOT-WIDE DRIFT</span>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 rounded">
                  {counts.lot_drift}
                </span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                Wafer fabrication or diffusion common-cause
              </p>
            </div>

            {/* Cell 3: Bottom-Left: Individual Defect */}
            <div className={`p-2.5 rounded-lg border text-left transition-all ${
              activeCell === 'INDIVIDUAL DEFECT'
                ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-200 shadow-xs'
                : 'bg-white border-slate-200/80 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-800">INDIVIDUAL DEFECT</span>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 rounded">
                  {counts.individual_defect}
                </span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                Isolated die or wire-bond packaging defect
              </p>
            </div>

            {/* Cell 4: Bottom-Right: Systemic Risk */}
            <div className={`p-2.5 rounded-lg border text-left transition-all ${
              activeCell === 'SYSTEMIC + INDIVIDUAL RISK'
                ? 'bg-purple-50/90 border-purple-400 ring-2 ring-purple-200 shadow-xs'
                : 'bg-white border-slate-200/80 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-800">SYSTEMIC RISK</span>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 rounded">
                  {counts.systemic_risk}
                </span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                Individual outlier inside a degrading wafer lot
              </p>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span>Matrix State: <span className="font-bold text-blue-700">{activeCell}</span></span>
            <span className="text-slate-400">Total: {radarData?.components_monitored ?? 25} Units</span>
          </div>
        </div>
      </div>

      {/* 4. Actionable Attribution & Recommendation Strip */}
      {(attribution || recommendedAction) && (
        <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-blue-950 uppercase tracking-tight">
                  {attributionLabel || attribution || 'TRIANGULATION DIAGNOSIS'}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  ACTIONABLE
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                {evidenceText || 'Multi-signal analysis complete. Follow engineering protocol.'}
              </p>
            </div>
          </div>

          {recommendedAction && (
            <div className="shrink-0 self-stretch sm:self-auto flex items-center">
              <div className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 shadow-2xs font-mono text-[11px] font-bold text-blue-900 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>{recommendedAction}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
