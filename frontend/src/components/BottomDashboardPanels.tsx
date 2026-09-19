import React from 'react';
import {
  Activity,
  Layers,
  BarChart2,
  TrendingUp,
  Info,
  Clock,
  ExternalLink,
  Target
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { ComponentEvaluation, LotFingerprint, ModelPerformanceData } from '../types';

interface BottomDashboardPanelsProps {
  component: ComponentEvaluation | null;
  lotFingerprint: LotFingerprint | null;
  modelPerf: ModelPerformanceData | null;
  onOpenLotDetails: () => void;
  onOpenModelDetails: () => void;
  onOpenEvidenceModal: () => void;
}

export const BottomDashboardPanels: React.FC<BottomDashboardPanelsProps> = ({
  component,
  lotFingerprint,
  modelPerf,
  onOpenLotDetails,
  onOpenModelDetails,
  onOpenEvidenceModal
}) => {
  const cid = component?.component_id ?? 'C-104';
  const lotId = component?.lot_id ?? 'LOT-A17';

  // Mini sparkline data for the 4 channel trends
  const channelData = [
    { hour: '0h', temp: 65, standby: 22, volt: 3.28, curr: 102 },
    { hour: '24h', temp: 68.4, standby: 28.59, volt: 3.298, curr: 111.6 },
    { hour: '48h', temp: 71, standby: 32, volt: 3.305, curr: 115 },
    { hour: '72h', temp: 73.5, standby: 35.5, volt: 3.312, curr: 118 },
    { hour: '96h', temp: 76, standby: 39, volt: 3.318, curr: 122 },
    { hour: '120h', temp: 79, standby: 43, volt: 3.325, curr: 125 },
    { hour: '144h', temp: 82, standby: 47, volt: 3.332, curr: 128 },
    { hour: '168h', temp: 85, standby: 52, volt: 3.340, curr: 132 },
  ];

  // Reliability trajectory data
  const trajData = [
    { h: '0h', comp: 65, forecast: null, lower: 60, upper: 72 },
    { h: '24h', comp: 68.4, forecast: 68.4, lower: 62, upper: 75 },
    { h: '48h', comp: null, forecast: 72, lower: 64, upper: 78 },
    { h: '72h', comp: null, forecast: 76, lower: 66, upper: 82 },
    { h: '96h', comp: null, forecast: 80, lower: 68, upper: 86 },
    { h: '120h', comp: null, forecast: 85, lower: 70, upper: 90 },
    { h: '144h', comp: null, forecast: 91, lower: 72, upper: 94 },
    { h: '168h', comp: null, forecast: 98, lower: 74, upper: 98 },
  ];

  // Lot median comparison data
  const lotCompData = [
    { h: '0h', median: 67, comp: 65, lower: 63, upper: 71 },
    { h: '24h', median: 69, comp: 68.4, lower: 65, upper: 73 },
    { h: '48h', median: 70, comp: 72, lower: 66, upper: 74 },
    { h: '72h', median: 71, comp: 76, lower: 67, upper: 75 },
    { h: '96h', median: 72, comp: 81, lower: 68, upper: 76 },
    { h: '120h', median: 73, comp: 87, lower: 69, upper: 77 },
    { h: '144h', median: 74, comp: 93, lower: 70, upper: 78 },
    { h: '168h', median: 75, comp: 100, lower: 71, upper: 79 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* CARD 1 & 2: Left 6 columns containing Channel Trends & Reliability Trajectory */}
      <div className="lg:col-span-6 space-y-4">
        {/* Card 1: Channel Trends (C-104) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-bold font-mono text-slate-800 tracking-tight">
              Channel Trends ({cid})
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Sparkline 1: Temperature */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-mono">Temperature (°C)</div>
              <div className="text-xs font-bold font-mono text-amber-600 mt-0.5">68.41 °C</div>
              <div className="h-14 w-full mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={channelData}>
                    <Line type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={1.8} dot={false} />
                    <XAxis dataKey="hour" hide />
                    <YAxis domain={[60, 90]} hide />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                <span>0h</span><span>48h</span><span>96h</span><span>168h</span>
              </div>
            </div>

            {/* Sparkline 2: Standby Current */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-mono">Standby Current (µA)</div>
              <div className="text-xs font-bold font-mono text-emerald-600 mt-0.5">28.59 µA</div>
              <div className="h-14 w-full mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={channelData}>
                    <Line type="monotone" dataKey="standby" stroke="#10B981" strokeWidth={1.8} dot={false} />
                    <XAxis dataKey="hour" hide />
                    <YAxis domain={[20, 55]} hide />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                <span>0h</span><span>48h</span><span>96h</span><span>168h</span>
              </div>
            </div>

            {/* Sparkline 3: Voltage */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-mono">Voltage (V)</div>
              <div className="text-xs font-bold font-mono text-purple-600 mt-0.5">3.298 V</div>
              <div className="h-14 w-full mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={channelData}>
                    <Line type="monotone" dataKey="volt" stroke="#A855F7" strokeWidth={1.8} dot={false} />
                    <XAxis dataKey="hour" hide />
                    <YAxis domain={[3.25, 3.35]} hide />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                <span>0h</span><span>48h</span><span>96h</span><span>168h</span>
              </div>
            </div>

            {/* Sparkline 4: Active Current */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-mono">Active Current (mA)</div>
              <div className="text-xs font-bold font-mono text-sky-600 mt-0.5">111.6 mA</div>
              <div className="h-14 w-full mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={channelData}>
                    <Line type="monotone" dataKey="curr" stroke="#0284C7" strokeWidth={1.8} dot={false} />
                    <XAxis dataKey="hour" hide />
                    <YAxis domain={[100, 135]} hide />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                <span>0h</span><span>48h</span><span>96h</span><span>168h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Reliability Trajectory */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-sky-600" />
              <h4 className="text-xs font-bold font-mono text-slate-800 tracking-tight">
                Reliability Trajectory
              </h4>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold">
              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                OBSERVED (0–24h)
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                FORECAST (24–168h)
              </span>
            </div>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trajData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="h" tick={{ fontSize: 9, fill: '#64748B', fontFamily: 'monospace' }} stroke="#CBD5E1" />
                <YAxis domain={[50, 110]} tick={{ fontSize: 9, fill: '#64748B', fontFamily: 'monospace' }} stroke="#CBD5E1" />
                <Area type="monotone" dataKey="upper" fill="#E0E7FF" fillOpacity={0.6} stroke="none" />
                <Line type="monotone" dataKey="comp" stroke="#0284C7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="forecast" stroke="#6366F1" strokeWidth={1.8} strokeDasharray="3 3" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CARD 3: Lot Intelligence (Middle Right 3 columns) */}
      <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <h4 className="text-xs font-bold font-mono text-slate-800 tracking-tight">
                Lot Intelligence
              </h4>
            </div>
            <button
              onClick={onOpenLotDetails}
              className="text-[11px] font-mono text-sky-600 hover:text-sky-800 font-semibold flex items-center space-x-0.5"
            >
              <span>View All</span>
              <span>&rarr;</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs font-bold font-mono text-slate-900">{lotId}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
              3 components
            </span>
          </div>

          <div className="text-[10px] text-slate-400 font-mono mt-1">Lot Median vs Component</div>

          {/* Mini Lot Median vs Component Chart */}
          <div className="h-16 w-full mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lotCompData} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
                <Area type="monotone" dataKey="upper" fill="#E0F2FE" stroke="none" />
                <Line type="monotone" dataKey="median" stroke="#94A3B8" strokeDasharray="2 2" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="comp" stroke="#0284C7" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Footnote callout */}
          <div className="mt-2 text-[10px] font-mono text-sky-700 bg-sky-50/70 p-1.5 rounded-lg border border-sky-200/80 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{cid} is 3.7σ above the lot thermal trajectory.</span>
          </div>
        </div>

        {/* Why Flagged? Driver decomposition matching screenshot */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold font-mono text-slate-700">Why Flagged?</span>
            <button
              onClick={onOpenEvidenceModal}
              className="text-[10px] font-mono text-sky-600 hover:text-sky-800"
            >
              View Details &rarr;
            </button>
          </div>

          <div className="space-y-1.5 text-[10px] font-mono">
            <div>
              <div className="flex justify-between text-slate-600 mb-0.5">
                <span>Temperature Drift</span>
                <span className="font-bold text-slate-900">47%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-600 h-full rounded-full" style={{ width: '47%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-0.5">
                <span>Current Instability</span>
                <span className="font-bold text-slate-900">31%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '31%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-0.5">
                <span>Lot Deviation</span>
                <span className="font-bold text-slate-900">17%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: '17%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-0.5">
                <span>Voltage Variation</span>
                <span className="font-bold text-slate-900">5%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-300 h-full rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 4: Model Performance (Far Right 3 columns) */}
      <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-sky-600" />
              <h4 className="text-xs font-bold font-mono text-slate-800 tracking-tight">
                Model Performance
              </h4>
            </div>
            <button
              onClick={onOpenModelDetails}
              className="text-slate-400 hover:text-slate-700"
              aria-label="View validation"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stepper Dot */}
          <div className="flex items-start space-x-2 mt-2 font-mono">
            <div className="w-2 h-2 rounded-full bg-sky-600 mt-1 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-slate-800">24h Early Decision Gate</div>
              <div className="text-[10px] text-slate-400">Module B activated</div>
            </div>
          </div>

          {/* 2x3 Metric Pill Grid Matching Screenshot */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-center font-mono">
            <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/70">
              <div className="text-[9px] text-slate-400 uppercase font-semibold">AUC (0-24h)</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">86.2%</div>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/70">
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Recall</div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">92.7%</div>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/70">
              <div className="text-[9px] text-slate-400 uppercase font-semibold">F1 Score</div>
              <div className="text-xs font-bold text-blue-600 mt-0.5">89.3%</div>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/70">
              <div className="text-[9px] text-slate-400 uppercase font-semibold">MAE (168h)</div>
              <div className="text-xs font-bold text-purple-600 mt-0.5">4.8 µA</div>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/70">
              <div className="text-[9px] text-slate-400 uppercase font-semibold">False Negatives</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">2</div>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200/70">
              <div className="text-[9px] text-slate-400 uppercase font-semibold">False Alarm Rate</div>
              <div className="text-xs font-bold text-amber-600 mt-0.5">8.6%</div>
            </div>
          </div>
        </div>

        {/* Latency Stats at Bottom */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <div>
              <div className="text-[9px] text-slate-400">Median Detection Time</div>
              <div className="font-bold text-slate-800">7.5 h</div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <div>
              <div className="text-[9px] text-slate-400">Mean Detection Time</div>
              <div className="font-bold text-slate-800">19.5 h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
