import React from 'react';
import { Cpu, Layers, Activity, Calendar, AlertTriangle } from 'lucide-react';
import { ComponentEvaluation } from '../types';

interface CommandSummaryCardProps {
  component: ComponentEvaluation | null;
  currentHour: number;
}

export const CommandSummaryCard: React.FC<CommandSummaryCardProps> = ({ component, currentHour }) => {
  const cid = component?.component_id ?? 'C-104';
  const lotId = component?.lot_id ?? 'LOT-A17';
  const partType = component?.part_type ?? 'RAD-HARD-FPGA-DSP';
  const decision = component?.decision?.decision ?? 'WATCH';
  const progressPct = Math.min(100, Math.round((currentHour / 168.0) * 100));

  const isHold = decision === 'HOLD / REVIEW';
  const isWatch = decision === 'WATCH';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Product Identity & Context */}
        <div className="flex items-center space-x-3.5 pr-4 border-b xl:border-b-0 xl:border-r border-slate-100 pb-3 xl:pb-0">
          <div className="w-12 h-12 rounded-xl border border-blue-200 bg-blue-50/70 flex items-center justify-center shrink-0 p-1.5 shadow-xs">
            <img
              src="/ref_chip.png"
              alt="Component"
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold font-mono tracking-tight text-slate-900 leading-none">
                VIGIL-X
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                CLASS-S SCREENING
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-700 mt-1">
              Dynamic Reliability Sentinel
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5 font-medium">
              <span>Time-Series Drift Analysis</span>
              <span>•</span>
              <span>Lot-Relative Anomaly Gate</span>
            </div>
          </div>
        </div>

        {/* 4 Core Engineering Diagnostic Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          {/* 1: Component ID */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono truncate">
                Component
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5 truncate">
                {cid}
              </div>
              <div className="text-[9px] font-mono text-slate-400 truncate">
                {partType}
              </div>
            </div>
          </div>

          {/* 2: Lot ID */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/60 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono truncate">
                Lot Cohort
              </div>
              <div className="text-sm font-bold font-mono text-blue-700 mt-0.5 truncate">
                {lotId}
              </div>
              <div className="text-[9px] font-mono text-slate-400 truncate">
                Wafer Baseline
              </div>
            </div>
          </div>

          {/* 3: Current Status */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              isHold ? 'bg-rose-50 text-rose-700 border-rose-200' :
              isWatch ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono truncate">
                Current Status
              </div>
              <div className={`text-sm font-bold font-mono flex items-center space-x-1 mt-0.5 truncate ${
                isHold ? 'text-rose-700' : isWatch ? 'text-amber-800' : 'text-emerald-700'
              }`}>
                <span>{decision === 'HOLD / REVIEW' ? 'HOLD' : decision}</span>
                {isWatch && <AlertTriangle className="w-3 h-3 text-amber-600 inline shrink-0" />}
              </div>
              <div className="text-[9px] font-mono text-slate-400 truncate">
                Dynamic Gate Triage
              </div>
            </div>
          </div>

          {/* 4: Burn-in Progress */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Burn-in</span>
              </div>
              <span className="text-slate-700 font-mono">{progressPct}%</span>
            </div>
            <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
              {currentHour.toFixed(0)}h / 168h
            </div>
            <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
