import React from 'react';
import { Cpu, Layers, Activity, Calendar, AlertTriangle } from 'lucide-react';
import { ComponentEvaluation } from '../types';

interface HeroBannerCardProps {
  component: ComponentEvaluation | null;
  currentHour: number;
}

export const HeroBannerCard: React.FC<HeroBannerCardProps> = ({ component, currentHour }) => {
  const cid = component?.component_id ?? 'C-104';
  const lotId = component?.lot_id ?? 'LOT-A17';
  const decision = component?.decision?.decision ?? 'WATCH';
  const progressPct = Math.min(100, Math.round((currentHour / 168.0) * 100));

  const isHold = decision === 'HOLD / REVIEW';
  const isWatch = decision === 'WATCH';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* Brand & Mission Information Matching Screenshot */}
        <div className="flex items-center space-x-3.5 pr-2">
          <img
            src="/ref_chip.png"
            alt="RAD-HARD FPGA"
            className="w-14 h-14 rounded-xl object-cover shadow-sm shrink-0 border border-slate-100"
          />
          <div>
            <h2 className="text-xl font-bold font-mono tracking-tight text-slate-900 leading-none">
              VIGIL-X
            </h2>
            <div className="text-xs font-semibold text-slate-700 mt-1">
              Dynamic Reliability Sentinel
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-1 font-medium">
              <span>AI-powered anomaly detection</span>
              <span>•</span>
              <span>Predictive insights</span>
              <span>•</span>
              <span>Explainable decisions</span>
            </div>
          </div>
        </div>

        {/* 4 Diagnostic Metric Pills Matching Screenshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 max-w-3xl">
          {/* Pill 1: Component ID */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Component ID</div>
              <div className="text-base font-bold font-mono text-slate-900">{cid}</div>
            </div>
          </div>

          {/* Pill 2: Lot ID */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Lot ID</div>
              <div className="text-base font-bold font-mono text-[#0284C7]">{lotId}</div>
            </div>
          </div>

          {/* Pill 3: Current Status */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
              isHold ? 'bg-rose-50 text-rose-600 border-rose-100' :
              isWatch ? 'bg-amber-50 text-amber-600 border-amber-100' :
              'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Current Status</div>
              <div className={`text-base font-bold font-mono flex items-center space-x-1 ${
                isHold ? 'text-rose-600' : isWatch ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                <span>{decision === 'HOLD / REVIEW' ? 'HOLD' : decision}</span>
                {isWatch && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline" />}
              </div>
            </div>
          </div>

          {/* Pill 4: Burn-in Progress */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Burn-in Progress</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold font-mono text-slate-900">
                {currentHour.toFixed(0)}h / 168h
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {progressPct}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-[#10B981] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
