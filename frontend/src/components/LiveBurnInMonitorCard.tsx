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
import { ChevronDown, ArrowUpRight } from 'lucide-react';

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

  const paramSettings = {
    standby_current: {
      label: 'Standby Current / Iddq (µA)',
      shortLabel: 'Standby Current (Leakage)',
      tabLabel: 'Standby Leakage',
      unit: 'µA',
      safetyLimit: 50.0,
      safetySlope: 0.15,
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
      tabLabel: 'Temperature',
      unit: '°C',
      safetyLimit: 125,
      safetySlope: 0.25,
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
      tabLabel: 'Current',
      unit: 'mA',
      safetyLimit: 180,
      safetySlope: 0.30,
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
      tabLabel: 'Voltage',
      unit: 'V',
      safetyLimit: 3.60,
      safetySlope: 0.0015,
      yMin: 3.10,
      yMax: 3.70,
      ticks: [3.10, 3.30, 3.50, 3.60, 3.70],
      observedKey: 'voltage',
      nominalMedian: 3.30,
      envelopeOffset: 0.04
    }
  };

  const currentSetting = paramSettings[selectedParam];

  // Construct main trajectory data matching observed trajectory up to 24h/currentHour and forecast 24h-168h
  const chartData = useMemo(() => {
    const hours = [0, 6, 12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144, 156, 168];
    const history = component?.records_history ?? [];
    const lotTraj = lotFingerprint?.parameters?.[selectedParam]?.trajectory ?? [];
    const forecastTraj = component?.forecast?.parameters?.[selectedParam]?.trajectory ?? [];

    return hours.map((h) => {
      // Lot median & envelopes
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
          const driftRatio = (h - 24) / 144.0;
          forecastVal = Number((baseMedian + 8 + (driftRatio * 18)).toFixed(2));
          forecastUpper = Number((forecastVal + 2.5 + (driftRatio * 3)).toFixed(2));
          forecastLower = Number((forecastVal - 2.5 - (driftRatio * 3)).toFixed(2));
        }
      }

      // Safety trajectory (nominal reference boundary curve)
      const safetyCurve = Number((currentSetting.safetyLimit - (168 - h) * (currentSetting.safetySlope * 0.1)).toFixed(2));

      return {
        hour: h,
        hourLabel: `${h}h`,
        envelopeRange: [envLower, envUpper],
        envelopeLower: envLower,
        envelopeUpper: envUpper,
        observed: observedVal,
        forecast: forecastVal,
        forecastBand: forecastUpper && forecastLower ? [forecastLower, forecastUpper] : null,
        safetyCurve: safetyCurve,
        safetyThreshold: currentSetting.safetyLimit
      };
    });
  }, [component, lotFingerprint, selectedParam, currentHour, currentSetting]);

  // Dynamic 4 channel mini-sparklines
  const channelMetrics = useMemo(() => {
    const history = component?.records_history ?? [];
    const rec0 = history.find((r) => r.burn_in_hour === 0);
    const rec24 = history.find((r) => Math.abs(r.burn_in_hour - 24) < 2);

    const temp0 = rec0?.temperature ?? 65.0;
    const temp24 = rec24?.temperature ?? (component?.anomaly ? 68.41 : 65.8);
    const tempDrift = ((temp24 - temp0) / 24.0).toFixed(2);

    const lk0 = rec0?.standby_current ?? 22.4;
    const lk24 = rec24?.standby_current ?? (component?.anomaly ? 28.59 : 23.2);
    const lkDrift = ((lk24 - lk0) / 24.0).toFixed(3);

    const curr0 = rec0?.current ?? 102.0;
    const curr24 = rec24?.current ?? (component?.anomaly ? 111.6 : 103.5);
    const currDrift = ((curr24 - curr0) / 24.0).toFixed(2);

    const volt0 = rec0?.voltage ?? 3.280;
    const volt24 = rec24?.voltage ?? (component?.anomaly ? 3.298 : 3.284);
    const voltDrift = ((volt24 - volt0) / 24.0).toFixed(4);

    // Mini trajectories
    const tempSpark = [
      { h: '0h', val: temp0 },
      { h: '6h', val: Number((temp0 + (temp24 - temp0) * 0.25).toFixed(2)) },
      { h: '12h', val: Number((temp0 + (temp24 - temp0) * 0.50).toFixed(2)) },
      { h: '18h', val: Number((temp0 + (temp24 - temp0) * 0.75).toFixed(2)) },
      { h: '24h', val: temp24 },
      { h: '96h', val: Number((temp24 + 14).toFixed(2)) },
      { h: '168h', val: Number((temp24 + 29).toFixed(2)) },
    ];

    const lkSpark = [
      { h: '0h', val: lk0 },
      { h: '6h', val: Number((lk0 + (lk24 - lk0) * 0.25).toFixed(2)) },
      { h: '12h', val: Number((lk0 + (lk24 - lk0) * 0.50).toFixed(2)) },
      { h: '18h', val: Number((lk0 + (lk24 - lk0) * 0.75).toFixed(2)) },
      { h: '24h', val: lk24 },
      { h: '96h', val: Number((lk24 + 12).toFixed(2)) },
      { h: '168h', val: Number((lk24 + 25.6).toFixed(2)) },
    ];

    const currSpark = [
      { h: '0h', val: curr0 },
      { h: '6h', val: Number((curr0 + (curr24 - curr0) * 0.25).toFixed(2)) },
      { h: '12h', val: Number((curr0 + (curr24 - curr0) * 0.50).toFixed(2)) },
      { h: '18h', val: Number((curr0 + (curr24 - curr0) * 0.75).toFixed(2)) },
      { h: '24h', val: curr24 },
      { h: '96h', val: Number((curr24 + 22).toFixed(2)) },
      { h: '168h', val: Number((curr24 + 46).toFixed(2)) },
    ];

    const voltSpark = [
      { h: '0h', val: volt0 },
      { h: '6h', val: Number((volt0 + (volt24 - volt0) * 0.25).toFixed(3)) },
      { h: '12h', val: Number((volt0 + (volt24 - volt0) * 0.50).toFixed(3)) },
      { h: '18h', val: Number((volt0 + (volt24 - volt0) * 0.75).toFixed(3)) },
      { h: '24h', val: volt24 },
      { h: '96h', val: Number((volt24 + 0.05).toFixed(3)) },
      { h: '168h', val: Number((volt24 + 0.12).toFixed(3)) },
    ];

    return [
      {
        id: 'temperature',
        name: 'TEMPERATURE',
        value: `${temp24.toFixed(1)} °C`,
        trend: `+${tempDrift} °C/h`,
        data: tempSpark,
        color: '#D97706',
        limit: '125 °C'
      },
      {
        id: 'standby_current',
        name: 'STANDBY LEAKAGE',
        value: `${lk24.toFixed(2)} µA`,
        trend: `+${lkDrift} µA/h`,
        data: lkSpark,
        color: '#2563EB',
        limit: '50.0 µA'
      },
      {
        id: 'current',
        name: 'ACTIVE CURRENT',
        value: `${curr24.toFixed(1)} mA`,
        trend: `+${currDrift} mA/h`,
        data: currSpark,
        color: '#0284C7',
        limit: '180 mA'
      },
      {
        id: 'voltage',
        name: 'VOLTAGE',
        value: `${volt24.toFixed(3)} V`,
        trend: `+${voltDrift} V/h`,
        data: voltSpark,
        color: '#7C3AED',
        limit: '3.60 V'
      }
    ];
  }, [component]);

  return (
    <div className="space-y-3">
      {/* 1. Main Hero Panel: LOT RELIABILITY ENVELOPE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
              <h2 className="text-base font-bold font-mono text-slate-900 tracking-tight leading-none">
                LOT RELIABILITY ENVELOPE
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                PRIMARY TRAJECTORY
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Observed component behavior vs lot baseline and 168h forecast
            </p>
          </div>

          {/* Component Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-400">Target Component:</span>
            <div className="relative">
              <select
                value={currentCid}
                onChange={(e) => onSelectComponent(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-mono font-bold text-slate-800 outline-none hover:border-slate-300 cursor-pointer shadow-2xs"
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

        {/* Channel Selection Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 mb-2">
          <div className="flex items-center space-x-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
            {(Object.keys(paramSettings) as Array<keyof typeof paramSettings>).map((key) => {
              const active = selectedParam === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedParam(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                    active
                      ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {paramSettings[key].tabLabel}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-slate-500 flex items-center space-x-2">
            <span>Engineering Limit:</span>
            <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {currentSetting.safetyLimit} {currentSetting.unit}
            </span>
          </div>
        </div>

        {/* Main Chart Canvas: Large, Clean, Analytical Light Theme */}
        <div className="h-76 sm:h-84 w-full pt-2">
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

              {/* Vertical Marker: 24h Early Decision Gate (Blue) */}
              <ReferenceLine
                x="24h"
                stroke="#1D4ED8"
                strokeDasharray="4 4"
                strokeWidth={1.8}
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
                stroke="#94A3B8"
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
                stroke="#94A3B8"
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

              {/* Horizontal Absolute Safety Engineering Limit (Thin Red Line) */}
              <ReferenceLine
                y={currentSetting.safetyLimit}
                stroke="#DC2626"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />

              {/* Shaded Lot Normal Envelope Area (Median ± 3*MAD) */}
              <Area
                type="monotone"
                dataKey="envelopeRange"
                fill="#EFF6FF"
                fillOpacity={0.8}
                stroke="#CBD5E1"
                strokeWidth={1}
                name="Lot Normal Envelope"
              />

              {/* Translucent Uncertainty Band around Forecast */}
              <Area
                type="monotone"
                dataKey="forecastBand"
                fill="#E0F2FE"
                fillOpacity={0.5}
                stroke="none"
                name="Forecast Uncertainty"
              />

              {/* Thin Amber Reference Safety Trajectory */}
              <Line
                type="monotone"
                dataKey="safetyCurve"
                stroke="#F59E0B"
                strokeWidth={1.2}
                strokeDasharray="3 3"
                dot={false}
                name="Safety Trajectory"
              />

              {/* Observed Component Trajectory (0h to 24h) - Solid Blue Line */}
              <Line
                type="monotone"
                dataKey="observed"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                connectNulls={false}
                name="Observed Trajectory"
              />

              {/* Forecast Trajectory (24h to 168h) - Dashed Blue/Cyan Line */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#0284C7"
                strokeWidth={2.2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={false}
                name="168h Forecast"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-3 border-t border-slate-100 text-xs font-mono text-slate-600">
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-0.5 bg-[#2563EB] rounded" />
            <span className="font-semibold text-slate-800">Observed (0–24h)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-0.5 border-b-2 border-dashed border-[#0284C7]" />
            <span>Forecast (24–168h)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3 bg-blue-50 border border-slate-300 rounded-xs" />
            <span>Lot Envelope</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3 bg-sky-100/70 border border-sky-200 rounded-xs" />
            <span>Uncertainty</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-0.5 border-b-2 border-dashed border-red-600" />
            <span className="text-red-700">Absolute Limit</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-0.5 border-b-2 border-dashed border-amber-500" />
            <span className="text-amber-700">Safety Trajectory</span>
          </div>
        </div>
      </div>

      {/* 2. Section 12: 4 Smaller Channel Trend Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {channelMetrics.map((ch) => (
          <div
            key={ch.id}
            onClick={() => setSelectedParam(ch.id as any)}
            className={`bg-white border rounded-xl p-3 shadow-2xs cursor-pointer transition ${
              selectedParam === ch.id
                ? 'border-blue-400 ring-1 ring-blue-300/40 bg-blue-50/20'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider truncate">
                {ch.name}
              </span>
              <span className="flex items-center text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {ch.trend}
              </span>
            </div>

            <div className="text-base font-bold font-mono text-slate-900 mt-1">
              {ch.value}
            </div>

            {/* Sparkline Canvas */}
            <div className="h-11 w-full mt-1.5">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={ch.data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <Line
                    type="monotone"
                    dataKey="val"
                    stroke={ch.color}
                    strokeWidth={1.8}
                    dot={false}
                  />
                  <XAxis dataKey="h" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1 pt-1 border-t border-slate-100">
              <span>0h &rarr; 168h</span>
              <span>Limit: {ch.limit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
