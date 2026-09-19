import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { ComponentEvaluation, LotFingerprint, SystemMetrics } from '../types';
import { ChevronDown, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LiveBurnInMonitorCardProps {
  component: ComponentEvaluation | null;
  lotFingerprint: LotFingerprint | null;
  currentHour: number;
  metrics: SystemMetrics | null;
  onSelectComponent: (cid: string) => void;
}

export const LiveBurnInMonitorCard: React.FC<LiveBurnInMonitorCardProps> = ({
  component,
  lotFingerprint,
  currentHour,
  metrics,
  onSelectComponent
}) => {
  const [selectedParam, setSelectedParam] = useState<'standby_current' | 'temperature' | 'current' | 'voltage'>('standby_current');

  const compList = metrics?.components ?? [];
  const currentCid = component?.component_id ?? 'C-104';
  const lotId = component?.lot_id ?? 'LOT-A17';
  const decision = component?.decision?.decision ?? 'WATCH';
  const isHold = decision === 'HOLD / REVIEW';
  const isWatch = decision === 'WATCH';
  const timeToRisk = component?.time_to_risk?.hours_remaining ?? 20;

  const paramSettings = {
    standby_current: {
      label: 'Standby Current / Iddq (µA)',
      shortLabel: 'Standby Current',
      unit: 'µA',
      safetyLimit: 50.0,
      yMin: 10,
      yMax: 65,
      ticks: [10, 25, 40, 50, 60],
      observedKey: 'standby_current',
      nominalMedian: 25.0,
      envelopeOffset: 3.5
    },
    temperature: {
      label: 'Operating Temperature (°C)',
      shortLabel: 'Temperature',
      unit: '°C',
      safetyLimit: 125,
      yMin: 20,
      yMax: 140,
      ticks: [25, 60, 95, 125, 140],
      observedKey: 'temperature',
      nominalMedian: 70,
      envelopeOffset: 9
    },
    current: {
      label: 'Active Current (mA)',
      shortLabel: 'Active Current',
      unit: 'mA',
      safetyLimit: 180,
      yMin: 50,
      yMax: 200,
      ticks: [50, 90, 130, 180, 200],
      observedKey: 'current',
      nominalMedian: 105,
      envelopeOffset: 12
    },
    voltage: {
      label: 'Supply Voltage (V)',
      shortLabel: 'Voltage',
      unit: 'V',
      safetyLimit: 3.60,
      yMin: 3.10,
      yMax: 3.70,
      ticks: [3.10, 3.30, 3.50, 3.60, 3.70],
      observedKey: 'voltage',
      nominalMedian: 3.30,
      envelopeOffset: 0.04
    }
  };

  const currentSetting = paramSettings[selectedParam];

  // Construct chart data matching observed trajectory up to 24h/currentHour and forecast 24h-168h
  const chartData = useMemo(() => {
    const hours = [0, 6, 12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144, 156, 168];
    const history = component?.records_history ?? [];
    const lotTraj = lotFingerprint?.parameters?.[selectedParam]?.trajectory ?? [];
    const forecastTraj = component?.forecast?.parameters?.[selectedParam]?.trajectory ?? [];

    return hours.map((h) => {
      // Find real lot median if available, otherwise calculate
      const lotPt = lotTraj.find((pt) => Math.abs(pt.hour - h) < 4);
      const tRatio = h / 168.0;
      const baseMedian = lotPt ? lotPt.median : currentSetting.nominalMedian + (tRatio * 8);
      const envLower = lotPt ? lotPt.lower_envelope : baseMedian - currentSetting.envelopeOffset;
      const envUpper = lotPt ? lotPt.upper_envelope : baseMedian + currentSetting.envelopeOffset;

      // Component observed point if h <= currentHour (or h <= 24h)
      let observedVal: number | null = null;
      let forecastVal: number | null = null;
      let forecastUpper: number | null = null;
      let forecastLower: number | null = null;

      const matchRec = history.find((r) => Math.abs(r.burn_in_hour - h) < 3.5);
      if (h <= Math.max(24, currentHour)) {
        if (matchRec) {
          observedVal = (matchRec as any)[currentSetting.observedKey] ?? baseMedian;
        } else {
          // Nominal or drifting early trajectory
          observedVal = Number((baseMedian + (h <= 24 ? h * 0.35 : 0)).toFixed(2));
        }
      }

      // Forecast trajectory from 24h to 168h
      if (h >= 24) {
        const fPt = forecastTraj.find((pt) => Math.abs(pt.hour - h) < 4);
        if (fPt) {
          forecastVal = fPt.predicted_value;
          forecastUpper = fPt.upper_bound;
          forecastLower = fPt.lower_bound;
        } else {
          // Synthetic forecast curve with slight upward latent drift
          const driftRatio = (h - 24) / 144.0;
          forecastVal = Number((baseMedian + 8 + (driftRatio * 18)).toFixed(2));
          forecastUpper = Number((forecastVal + 2.5 + (driftRatio * 3)).toFixed(2));
          forecastLower = Number((forecastVal - 2.5 - (driftRatio * 3)).toFixed(2));
        }
      }

      return {
        hour: h,
        hourLabel: `${h}h`,
        envelopeRange: [envLower, envUpper],
        envelopeLower: envLower,
        envelopeUpper: envUpper,
        observed: observedVal,
        forecast: forecastVal,
        forecastBand: forecastUpper && forecastLower ? [forecastLower, forecastUpper] : null,
        safetyThreshold: currentSetting.safetyLimit
      };
    });
  }, [component, lotFingerprint, selectedParam, currentHour, currentSetting]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Top Header Row: Section 10 Specification */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h2 className="text-base font-bold font-mono text-slate-900 tracking-tight leading-none">
              LOT RELIABILITY ENVELOPE
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              MODULE A + B INTEGRATED
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Observed component behavior compared with lot baseline and 168h forecast.
          </p>
        </div>

        {/* Right Controls: Component Selector */}
        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-mono text-slate-400">Target Component:</span>
          <div className="relative">
            <select
              value={currentCid}
              onChange={(e) => onSelectComponent(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-mono font-bold text-slate-800 outline-none hover:border-slate-300 cursor-pointer shadow-xs"
            >
              {compList.length > 0 ? (
                compList.map((c) => (
                  <option key={c.component_id} value={c.component_id}>
                    {c.component_id} ({c.lot_id})
                  </option>
                ))
              ) : (
                <option value="C-104">C-104 (LOT-A17)</option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Parameter Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {(Object.keys(paramSettings) as Array<keyof typeof paramSettings>).map((key) => {
            const active = selectedParam === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedParam(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                  active
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {paramSettings[key].shortLabel}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono text-slate-500 flex items-center space-x-2">
          <span>Safety Boundary:</span>
          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            {currentSetting.safetyLimit} {currentSetting.unit}
          </span>
        </div>
      </div>

      {/* Main Chart Canvas: Clean Light Theme */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

            <XAxis
              dataKey="hourLabel"
              stroke="#94A3B8"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />

            <YAxis
              domain={[currentSetting.yMin, currentSetting.yMax]}
              ticks={currentSetting.ticks}
              stroke="#94A3B8"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tickFormatter={(v) => `${v}`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '10px',
                fontSize: '11px',
                fontFamily: 'monospace',
                boxShadow: '0 4px 12px rgba(15,23,42,0.08)'
              }}
            />

            {/* Vertical Marker: 24h Early Decision Gate */}
            <ReferenceLine
              x="24h"
              stroke="#1D4ED8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: '24h EARLY GATE',
                position: 'top',
                fill: '#1D4ED8',
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: 700
              }}
            />

            {/* Vertical Marker: 96h Mid-Gate */}
            <ReferenceLine
              x="96h"
              stroke="#64748B"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: '96h MID GATE',
                position: 'top',
                fill: '#64748B',
                fontSize: 9,
                fontFamily: 'monospace'
              }}
            />

            {/* Vertical Marker: 168h Final Outcome */}
            <ReferenceLine
              x="168h"
              stroke="#64748B"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: '168h FINAL',
                position: 'top',
                fill: '#64748B',
                fontSize: 9,
                fontFamily: 'monospace'
              }}
            />

            {/* Horizontal Absolute Safety Threshold */}
            <ReferenceLine
              y={currentSetting.safetyLimit}
              stroke="#DC2626"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />

            {/* Shaded Lot Envelope Area (Median ± 3*MAD) */}
            <Area
              type="monotone"
              dataKey="envelopeRange"
              fill="#F1F5F9"
              fillOpacity={0.8}
              stroke="#CBD5E1"
              strokeWidth={1}
              name="Lot Envelope (Median ± 3 MAD)"
            />

            {/* Translucent Uncertainty Band around Forecast */}
            <Area
              type="monotone"
              dataKey="forecastBand"
              fill="#E0F2FE"
              fillOpacity={0.5}
              stroke="none"
              name="Forecast Uncertainty (90% CI)"
            />

            {/* Observed Component Trajectory (0h to 24h) - Solid Line */}
            <Line
              type="monotone"
              dataKey="observed"
              stroke="#1D4ED8"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#1D4ED8', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              connectNulls={false}
              name="Observed (0-24h)"
            />

            {/* Forecast Trajectory (24h to 168h) - Dashed Line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#0284C7"
              strokeWidth={2.2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls={false}
              name="Forecast (24-168h)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Rules */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs font-mono text-slate-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-[#1D4ED8] rounded" />
          <span className="font-semibold text-slate-800">Observed (0–24h)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 border-b-2 border-dashed border-[#0284C7]" />
          <span>Forecast (24–168h)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3.5 h-3.5 bg-slate-100 border border-slate-300 rounded-xs" />
          <span>Lot Envelope</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3.5 h-3.5 bg-sky-100/70 border border-sky-200 rounded-xs" />
          <span>Uncertainty Band</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 border-b-2 border-dashed border-red-600" />
          <span className="text-red-700">Safety Boundary</span>
        </div>
      </div>

      {/* Section 11: 24h EARLY DECISION GATE CALLOUT */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Diagnostic Pillars */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-400 text-[10px]">ABSOLUTE LIMIT:</span>
              <span className="font-bold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 inline" />
                <span>PASS</span>
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-400 text-[10px]">LOT-RELATIVE:</span>
              <span className="font-bold text-amber-800 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 inline text-amber-600" />
                <span>ANOMALOUS</span>
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-400 text-[10px]">MODULE A:</span>
              <span className="font-bold text-amber-800">ELEVATED</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-400 text-[10px]">MODULE B:</span>
              <span className="font-bold text-blue-700">ACTIVE</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-400 text-[10px]">168h FORECAST:</span>
              <span className="font-bold text-rose-700">RISK</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-400 text-[10px]">TIME-TO-RISK:</span>
              <span className="font-bold text-blue-700">{timeToRisk} h</span>
            </div>
          </div>

          {/* Decision Pill */}
          <div className="shrink-0 flex items-center space-x-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">DECISION:</span>
            <span className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-xs shadow-2xs flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHold ? 'HOLD / REVIEW' : isWatch ? 'WATCH / REVIEW' : 'ACCEPT'}</span>
            </span>
          </div>
        </div>

        {/* Supporting Text */}
        <p className="text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-200/60 font-medium leading-relaxed">
          &ldquo;Component remains inside the absolute engineering limit but is diverging from its lot-normal trajectory.&rdquo;
        </p>
      </div>
    </div>
  );
};
