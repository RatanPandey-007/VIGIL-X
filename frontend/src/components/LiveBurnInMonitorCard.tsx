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
import { ChevronDown } from 'lucide-react';

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
  const [selectedParam, setSelectedParam] = useState<'temperature' | 'current' | 'voltage' | 'power'>('temperature');
  const [activeCheckpoint, setActiveCheckpoint] = useState<'24h' | '96h' | '168h'>('24h');

  const compList = metrics?.components ?? [];
  const currentCid = component?.component_id ?? 'C-104';

  const paramSettings = {
    temperature: {
      label: 'Temperature (°C)',
      unit: '°C',
      safetyLimit: 135,
      yMin: 20,
      yMax: 150,
      ticks: [20, 60, 100, 140],
      observedKey: 'temperature',
      nominalMedian: 70,
      envelopeOffset: 12
    },
    current: {
      label: 'Current (mA)',
      unit: 'mA',
      safetyLimit: 180,
      yMin: 50,
      yMax: 200,
      ticks: [50, 100, 150, 200],
      observedKey: 'current',
      nominalMedian: 110,
      envelopeOffset: 18
    },
    voltage: {
      label: 'Voltage (V)',
      unit: 'V',
      safetyLimit: 3.6,
      yMin: 3.1,
      yMax: 3.7,
      ticks: [3.1, 3.3, 3.5, 3.7],
      observedKey: 'voltage',
      nominalMedian: 3.3,
      envelopeOffset: 0.05
    },
    power: {
      label: 'Power (mW)',
      unit: 'mW',
      safetyLimit: 450,
      yMin: 200,
      yMax: 500,
      ticks: [200, 300, 400, 500],
      observedKey: 'power',
      nominalMedian: 360,
      envelopeOffset: 35
    }
  };

  const currentSetting = paramSettings[selectedParam];

  // Construct chart data matching the exact trajectory curves
  const chartData = useMemo(() => {
    const hours = [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144, 156, 168];
    const history = component?.records_history ?? [];

    return hours.map((h) => {
      // Lot envelope curve rising gently
      const tRatio = h / 168.0;
      const baseMedian = currentSetting.nominalMedian + (tRatio * 28);
      const envelopeSpread = currentSetting.envelopeOffset + (tRatio * 8);

      const envLower = Math.round(baseMedian - envelopeSpread);
      const envUpper = Math.round(baseMedian + envelopeSpread);

      // Component observed point if h <= 24h (or currentHour)
      let observedVal: number | null = null;
      let forecastVal: number | null = null;
      let isAnomalyPoint: boolean = false;

      // Check real records
      const matchRec = history.find((r) => Math.abs(r.burn_in_hour - h) < 6);
      if (h <= 24) {
        if (matchRec) {
          observedVal = (matchRec as any)[currentSetting.observedKey] ?? baseMedian;
        } else {
          // Synthetic smooth curve matching screenshot
          observedVal = Math.round(baseMedian - 14 + (h * 0.45));
        }
      }

      // Forecast curve from 24h to 168h
      if (h >= 24) {
        // Upward trending drift for hero component
        forecastVal = Math.round(baseMedian - 3 + ((h - 24) * 0.42));
      }

      // Anomaly marker at ~104h or 24h as displayed in screenshot
      if (h === 108 || (currentHour >= 24 && h === 24)) {
        isAnomalyPoint = true;
      }

      return {
        hour: h,
        hourLabel: `${h}h`,
        envelopeRange: [envLower, envUpper],
        envelopeLower: envLower,
        envelopeUpper: envUpper,
        observed: observedVal,
        forecast: forecastVal,
        anomalyMarker: isAnomalyPoint && (forecastVal || observedVal) ? (forecastVal || observedVal) : null,
        safetyThreshold: currentSetting.safetyLimit
      };
    });
  }, [component, selectedParam, currentHour, currentSetting]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 tracking-tight leading-none">
              Live Burn-In Monitor
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Real-time simulation • Accelerated mode (1x)
            </p>
          </div>
        </div>

        {/* Right Controls: Component dropdown + Checkpoint Pills */}
        <div className="flex items-center space-x-2">
          {/* Component Selector Dropdown */}
          <div className="relative">
            <select
              value={currentCid}
              onChange={(e) => onSelectComponent(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-mono font-bold text-slate-700 outline-none hover:border-slate-300 cursor-pointer shadow-xs"
            >
              {compList.length > 0 ? (
                compList.map((c) => (
                  <option key={c.component_id} value={c.component_id}>
                    {c.component_id}
                  </option>
                ))
              ) : (
                <option value="C-104">C-104</option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Checkpoint Pills Matching Screenshot */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-mono font-bold">
            {(['24h', '96h', '168h'] as const).map((cp) => (
              <button
                key={cp}
                onClick={() => setActiveCheckpoint(cp)}
                className={`px-2.5 py-1 rounded-md transition ${
                  activeCheckpoint === cp
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parameter Selector Pills Matching Screenshot */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { id: 'temperature', label: 'Temperature (°C)' },
          { id: 'current', label: 'Current (mA)' },
          { id: 'voltage', label: 'Voltage (V)' },
          { id: 'power', label: 'Power (mW)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedParam(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition select-none ${
              selectedParam === tab.id
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Canvas */}
      <div className="relative h-64 w-full pt-4">
        {/* Safety Threshold Label at Top Right */}
        <div className="absolute right-4 top-1 text-[11px] font-mono font-bold text-rose-500 z-10">
          Safety Threshold ({currentSetting.safetyLimit}{currentSetting.unit})
        </div>

        {/* 24h Early Decision Gate Badge at Top */}
        <div
          className="absolute top-0 transform -translate-x-1/2 z-10 px-2 py-0.5 rounded bg-sky-600 text-white text-[10px] font-mono font-bold shadow-xs"
          style={{ left: '21.5%' }}
        >
          24h Early Decision Gate
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={true} />

            <XAxis
              dataKey="hourLabel"
              stroke="#94A3B8"
              tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
            />

            <YAxis
              domain={[currentSetting.yMin, currentSetting.yMax]}
              ticks={currentSetting.ticks}
              stroke="#94A3B8"
              tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'monospace',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            />

            {/* Horizontal Safety Threshold Line */}
            <ReferenceLine
              y={currentSetting.safetyLimit}
              stroke="#F43F5E"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {/* Vertical 24h Early Decision Gate Line */}
            <ReferenceLine
              x="24h"
              stroke="#0284C7"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {/* Shaded Lot Envelope Area */}
            <Area
              type="monotone"
              dataKey="envelopeRange"
              fill="#E0E7FF"
              fillOpacity={0.65}
              stroke="none"
              name="Lot Envelope"
            />

            {/* Observed Component Trajectory (0 to 24h) */}
            <Line
              type="monotone"
              dataKey="observed"
              stroke="#0284C7"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
              name="Component Trajectory"
            />

            {/* Forecast Trajectory (24h to 168h) */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#2563EB"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              connectNulls={false}
              name="Forecast (24h-168h)"
            />

            {/* Anomaly Marker Point */}
            <Line
              type="monotone"
              dataKey="anomalyMarker"
              stroke="none"
              dot={{ r: 4, fill: '#EF4444', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              name="Anomaly"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Matching Reference Screenshot */}
      <div className="flex flex-wrap items-center justify-center gap-5 pt-2 border-t border-slate-100 text-xs font-mono text-slate-600">
        <div className="flex items-center space-x-1.5">
          <div className="w-4 h-0.5 bg-sky-600 rounded" />
          <span>Component Trajectory</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-4 h-0.5 border-b-2 border-dashed border-blue-600" />
          <span>Forecast (24h-168h)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded-sm" />
          <span>Lot Envelope</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-4 h-0.5 border-b-2 border-dashed border-rose-500" />
          <span>Safety Threshold (135°C)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Anomaly</span>
        </div>
      </div>
    </div>
  );
};
