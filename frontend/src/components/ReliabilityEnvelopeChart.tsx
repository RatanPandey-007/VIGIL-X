import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { ComponentEvaluation, LotFingerprint } from '../types';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { LiquidTab } from './LiquidInteraction';

interface ReliabilityEnvelopeChartProps {
  component: ComponentEvaluation | null;
  lotFingerprint: LotFingerprint | null;
  currentHour: number;
}

export const ReliabilityEnvelopeChart: React.FC<ReliabilityEnvelopeChartProps> = ({
  component,
  lotFingerprint,
  currentHour
}) => {
  const [selectedParam, setSelectedParam] = useState<'standby_current' | 'temperature' | 'current' | 'voltage'>('standby_current');

  const paramConfigs = {
    standby_current: {
      label: 'Standby / Leakage Current',
      shortLabel: 'Leakage',
      unit: 'µA',
      safetyThresh: 55.0,
      absMax: 85.0,
      yMin: 15,
      yMax: 90
    },
    temperature: {
      label: 'Operating Temperature',
      shortLabel: 'Temp',
      unit: '°C',
      safetyThresh: 95.0,
      absMax: 125.0,
      yMin: 55,
      yMax: 130
    },
    current: {
      label: 'Active Operating Current',
      shortLabel: 'Active I',
      unit: 'mA',
      safetyThresh: 145.0,
      absMax: 180.0,
      yMin: 60,
      yMax: 190
    },
    voltage: {
      label: 'Rail Operating Voltage',
      shortLabel: 'Voltage',
      unit: 'V',
      safetyThresh: 3.45,
      absMax: 3.60,
      yMin: 3.10,
      yMax: 3.70
    }
  };

  const config = paramConfigs[selectedParam];

  // Merge lot envelope, observed component points, and predicted points into a single timeline array
  const chartData = React.useMemo(() => {
    if (!lotFingerprint || !lotFingerprint.parameters[selectedParam]) return [];

    const lotTraj = lotFingerprint.parameters[selectedParam].trajectory || [];
    const compHistory = component?.records_history || [];
    const forecastTraj = component?.forecast?.parameters?.[selectedParam]?.trajectory || [];

    const pointsMap: Record<number, any> = {};

    // 1. Lot envelopes
    lotTraj.forEach((pt) => {
      const h = Math.round(pt.hour);
      pointsMap[h] = {
        hour: h,
        lot_median: pt.median,
        lot_lower: pt.lower_envelope,
        lot_upper: pt.upper_envelope,
        lot_range: [pt.lower_envelope, pt.upper_envelope]
      };
    });

    // 2. Component observed history (0h to currentHour)
    compHistory.forEach((rec) => {
      const h = Math.round(rec.burn_in_hour);
      if (pointsMap[h]) {
        pointsMap[h].observed = (rec as any)[selectedParam];
      } else {
        pointsMap[h] = {
          hour: h,
          observed: (rec as any)[selectedParam]
        };
      }
    });

    // 3. Predicted trajectory and uncertainty band (strictly active only when currentHour >= 24)
    if (currentHour >= 24.0 && forecastTraj.length > 0) {
      forecastTraj.forEach((fpt) => {
        const h = Math.round(fpt.hour);
        if (pointsMap[h]) {
          pointsMap[h].forecast = fpt.predicted_value;
          pointsMap[h].forecast_lower = fpt.lower_bound;
          pointsMap[h].forecast_upper = fpt.upper_bound;
          pointsMap[h].forecast_range = [fpt.lower_bound, fpt.upper_bound];
        }
      });
    }

    return Object.values(pointsMap).sort((a, b) => a.hour - b.hour);
  }, [lotFingerprint, component, selectedParam, currentHour]);

  const pForecast = component?.forecast?.parameters?.[selectedParam];
  const isAbnormalUnderLimit = component?.anomaly?.abnormal_while_under_limit ?? false;
  const isForecastReady = currentHour >= 24.0 && (component?.forecast?.forecast_ready ?? false);

  return (
    <div className="engineering-card rounded-2xl p-5 border border-slate-200 bg-white shadow-liquid">
      {/* Header & Parameter Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
              Lot Reliability Envelope & Drift Projection
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] bg-sky-50 text-sky-700 border border-sky-200 font-mono font-semibold">
              {currentHour < 24.0 ? 'Observed Phase (0-24h)' : 'Observed + 168h Forecast'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compares component trajectory against robust lot dispersion (MAD) and predicts 168h drift endpoint.
          </p>
        </div>

        {/* Parameter Selector using LiquidTab */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 space-x-1">
          {(Object.keys(paramConfigs) as Array<keyof typeof paramConfigs>).map((key) => (
            <LiquidTab
              key={key}
              id={key}
              label={`${paramConfigs[key].shortLabel} (${paramConfigs[key].unit})`}
              active={selectedParam === key}
              onClick={(k) => setSelectedParam(k as any)}
            />
          ))}
        </div>
      </div>

      {/* Module A vs Module B Architectural Clarifier */}
      <div className="mb-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 text-slate-600">
        <div className="flex items-center space-x-2">
          <span className="text-sky-700 font-bold">MODULE A:</span>
          <span>"Is the component behaving abnormally now?"</span>
        </div>
        <div className="hidden md:block text-slate-300">•</div>
        <div className="flex items-center space-x-2">
          <span className="text-amber-700 font-bold">MODULE B:</span>
          <span>"Based on early behavior, where is the component heading by 168h?"</span>
        </div>
      </div>

      {/* Latent Drift Detected Alert Banner */}
      {isAbnormalUnderLimit && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs font-mono shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-900">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
              <strong className="tracking-wider text-amber-800">LATENT DRIFT DETECTED</strong>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
              Stage 2: 20–24h Gate
            </span>
          </div>
          <p className="text-slate-700 mt-1.5 font-sans">
            Component remains inside the absolute limit ({component?.latest_record ? (component.latest_record as any)[selectedParam] : '--'} {config.unit} &lt; {config.absMax} {config.unit}), but is diverging from the normal trajectory of its production lot ({lotFingerprint?.lot_id ?? 'LOT-A17'}).
          </p>
        </div>
      )}

      {/* Main Trajectory Chart */}
      <div className="h-[360px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            
            <XAxis
              dataKey="hour"
              stroke="#94A3B8"
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => `${v}h`}
              domain={[0, 168]}
            />
            <YAxis
              stroke="#94A3B8"
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              domain={[config.yMin, config.yMax]}
              unit={` ${config.unit}`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white/95 border border-slate-200 p-3.5 rounded-xl shadow-xl text-xs font-mono backdrop-blur-md">
                      <div className="font-bold text-sky-700 mb-1.5 border-b border-slate-200 pb-1 flex justify-between">
                        <span>Burn-In Hour: {label}h</span>
                        <span className="text-slate-500 font-normal">
                          {label <= 24 ? 'OBSERVED PHASE' : 'FORECAST PHASE'}
                        </span>
                      </div>
                      {data.observed !== undefined && (
                        <div className="text-slate-800 flex justify-between space-x-4">
                          <span className="text-slate-500">Observed {component?.component_id}:</span>
                          <span className="font-bold text-emerald-600">{data.observed} {config.unit}</span>
                        </div>
                      )}
                      {data.forecast !== undefined && (
                        <div className="text-amber-800 flex justify-between space-x-4">
                          <span>AI Forecast (168h):</span>
                          <span className="font-bold">{data.forecast} {config.unit}</span>
                        </div>
                      )}
                      {data.forecast_upper !== undefined && (
                        <div className="text-amber-700/80 flex justify-between space-x-4 text-[11px]">
                          <span>Uncertainty (90% CI):</span>
                          <span>[{data.forecast_lower} - {data.forecast_upper}] {config.unit}</span>
                        </div>
                      )}
                      {data.lot_median !== undefined && (
                        <div className="text-slate-600 flex justify-between space-x-4 mt-1 pt-1 border-t border-slate-200 text-[11px]">
                          <span>Lot Median:</span>
                          <span className="font-semibold text-sky-700">{data.lot_median} {config.unit}</span>
                        </div>
                      )}
                      {data.lot_upper !== undefined && (
                        <div className="text-slate-500 flex justify-between space-x-4 text-[11px]">
                          <span>Lot Normal Envelope:</span>
                          <span>[{data.lot_lower} - {data.lot_upper}]</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Vertical Dividers at Key Screening Gates with Special 24h Early Gate Beacon */}
            <ReferenceLine
              x={24}
              stroke="#0284C7"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: '24h EARLY DECISION GATE',
                position: 'top',
                fill: '#0284C7',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
                fontWeight: 'bold'
              }}
            />

            <ReferenceLine
              x={96}
              stroke="#7C3AED"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: '96h MID GATE',
                position: 'top',
                fill: '#7C3AED',
                fontSize: 10,
                fontFamily: 'JetBrains Mono'
              }}
            />

            <ReferenceLine
              x={168}
              stroke="#DB2777"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: '168h FINAL OUTCOME',
                position: 'top',
                fill: '#DB2777',
                fontSize: 10,
                fontFamily: 'JetBrains Mono'
              }}
            />

            {/* Configured Safety Trajectory Threshold */}
            <ReferenceLine
              y={config.safetyThresh}
              stroke="#D97706"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: `Configured Safety Trajectory (${config.safetyThresh} ${config.unit})`,
                position: 'insideBottomRight',
                fill: '#D97706',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
                fontWeight: 'bold'
              }}
            />

            {/* Absolute Engineering Safety Limit */}
            <ReferenceLine
              y={config.absMax}
              stroke="#DC2626"
              strokeWidth={2}
              label={{
                value: `Absolute Engineering Limit (${config.absMax} ${config.unit})`,
                position: 'insideTopRight',
                fill: '#DC2626',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
                fontWeight: 'bold'
              }}
            />

            {/* Shaded Lot Normal Envelope (Lower to Upper 2.5 MAD) */}
            <Area
              dataKey="lot_range"
              stroke="none"
              fill="#0284C7"
              fillOpacity={0.08}
              name="Lot Normal Envelope (2.5 MAD)"
            />

            {/* Prediction Uncertainty Band */}
            <Area
              dataKey="forecast_range"
              stroke="none"
              fill="#D97706"
              fillOpacity={0.12}
              name="90% Prediction Uncertainty Band"
            />

            {/* Lot Median Trajectory Reference Line */}
            <Line
              type="monotone"
              dataKey="lot_median"
              stroke="#0284C7"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              name="Lot Median Baseline"
            />

            {/* 168h Forecast Line (24h to 168h) */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#D97706"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={false}
              name="Forecast Trajectory (24-168h Dashed)"
            />

            {/* Observed Component Trajectory (0h to 24h/current) */}
            <Line
              type="monotone"
              dataKey="observed"
              stroke="#059669"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#059669' }}
              activeDot={{ r: 5, fill: '#0284C7' }}
              name="Observed Trajectory (Solid)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Telemetry Summary Below Chart */}
      <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 text-[11px]">Observed at {currentHour.toFixed(0)}h</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {component?.latest_record ? (component.latest_record as any)[selectedParam] : '--'} {config.unit}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            Absolute Limit: {component?.anomaly?.absolute_limit_status ?? 'PASS'}
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 text-[11px]">Predicted 168h Endpoint</div>
          {isForecastReady ? (
            <>
              <div className="text-base font-bold text-amber-800 mt-0.5">
                {pForecast?.predicted_168h_value ?? '--'} {config.unit}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                90% CI: [{pForecast?.lower_bound_168h ?? '--'} to {pForecast?.upper_bound_168h ?? '--'}]
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-sky-700 mt-0.5">
                AWAITING 24h GATE
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Insufficient early observations
              </div>
            </>
          )}
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 text-[11px]">Time-to-Risk</div>
          <div className="text-base font-bold text-sky-700 mt-0.5">
            {isForecastReady ? (component?.time_to_risk?.display_text ?? '> 168 h') : 'AWAITING DATA'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isForecastReady ? `Urgency: ${component?.time_to_risk?.urgency ?? 'LOW'}` : 'Activates at 24h early gate'}
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 text-[11px] uppercase tracking-wider">MODEL CONFIDENCE</div>
          <div className="text-base font-bold text-blue-700 mt-0.5">
            {isForecastReady ? `${component?.forecast?.overall_confidence ?? 85.0}%` : 'NOT YET AVAILABLE'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isForecastReady ? 'Based on prototype validation' : 'Pre-24h Screening Phase'}
          </div>
        </div>
      </div>
    </div>
  );
};
