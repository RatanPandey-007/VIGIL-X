import React from 'react';
import {
  Calendar,
  Scale,
  ShieldAlert,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ComponentEvaluation } from '../types';

interface CurrentComponentPanelProps {
  component: ComponentEvaluation | null;
  currentHour: number;
  onOpenEvidenceModal: () => void;
}

export const CurrentComponentPanel: React.FC<CurrentComponentPanelProps> = ({
  component,
  currentHour,
  onOpenEvidenceModal
}) => {
  const cid = component?.component_id ?? 'C-104';
  const partType = component?.part_type ?? 'RAD-HARD-FPGA-DSP';
  const decision = component?.decision?.decision ?? 'WATCH';
  const progressPct = Math.min(100, Math.round((currentHour / 168.0) * 100));

  const absStatus = component?.anomaly?.absolute_limit_status ?? 'PASS';
  const lotDevScore = component?.anomaly?.lot_deviation_score ?? 72;
  const anomalyScore = component?.anomaly?.anomaly_score ?? 68;
  const pred168h = component?.forecast?.display_status ?? (anomalyScore > 50 ? 'HIGH RISK' : 'WATCH');
  const confidence = component?.forecast?.overall_confidence ?? 82.5;
  const timeToRisk = component?.time_to_risk?.hours_remaining ?? 37;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-sm font-bold font-mono text-slate-800 tracking-tight">
          Current Component
        </h3>
        <span className="px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] text-xs font-mono font-bold flex items-center space-x-1 shadow-xs">
          <AlertTriangle className="w-3 h-3 text-[#D97706]" />
          <span>{decision === 'HOLD / REVIEW' ? 'HOLD' : decision}</span>
        </span>
      </div>

      {/* Component Identity Block Matching Screenshot */}
      <div className="flex items-center space-x-3">
        <img
          src="/ref_comp_chip.png"
          alt="Component Chip"
          className="w-10 h-9 object-contain shrink-0"
        />
        <div>
          <h4 className="text-lg font-bold font-mono text-slate-900 leading-tight">
            {cid}
          </h4>
          <div className="text-[11px] font-mono text-slate-400 font-medium mt-0.5">
            Part: {partType}
          </div>
        </div>
      </div>

      {/* Diagnostic & Telemetry Rows Matching Screenshot */}
      <div className="space-y-2 text-xs font-mono">
        {/* Row 1: Burn-in Progress */}
        <div className="flex items-center justify-between text-slate-600 py-0.5">
          <div className="flex items-center space-x-2 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>Burn-in Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">{currentHour.toFixed(0)}h / 168h</span>
            <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">{progressPct}%</span>
          </div>
        </div>

        {/* Row 2: Absolute Limit */}
        <div className="flex items-center justify-between text-slate-600 py-0.5">
          <div className="flex items-center space-x-2 text-slate-500">
            <Scale className="w-3.5 h-3.5 text-sky-600" />
            <span>Absolute Limit</span>
          </div>
          <span className="font-bold text-[#10B981] font-mono tracking-tight">
            {absStatus}
          </span>
        </div>

        {/* Row 3: Lot Deviation */}
        <div className="flex items-center justify-between text-slate-600 py-0.5">
          <div className="flex items-center space-x-2 text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-sky-600" />
            <span>Lot Deviation</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#EF4444]">HIGH</span>
            <span className="text-slate-400">{lotDevScore} / 100</span>
          </div>
        </div>

        {/* Row 4: Anomaly Score */}
        <div className="flex items-center justify-between text-slate-600 py-0.5">
          <div className="flex items-center space-x-2 text-slate-500">
            <Gauge className="w-3.5 h-3.5 text-sky-600" />
            <span>Anomaly Score</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#EF4444]">{anomalyScore}</span>
            <span className="text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Row 5: Predicted 168h */}
        <div className="flex items-center justify-between text-slate-600 py-0.5">
          <div className="flex items-center space-x-2 text-slate-500">
            <AlertTriangle className="w-3.5 h-3.5 text-sky-600" />
            <span>Predicted 168h</span>
          </div>
          <span className="font-bold text-[#EF4444]">
            {pred168h}
          </span>
        </div>

        {/* Row 6: Confidence */}
        <div className="flex items-center justify-between text-slate-600 py-0.5">
          <div className="flex items-center space-x-2 text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Confidence</span>
          </div>
          <span className="font-bold text-[#0284C7]">
            {confidence}%
          </span>
        </div>

        {/* Row 7: Time-to-Risk */}
        <div className="flex items-center justify-between text-slate-600 py-0.5">
          <div className="flex items-center space-x-2 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Time-to-Risk</span>
          </div>
          <span className="font-bold text-[#0284C7]">
            {typeof timeToRisk === 'number' ? `${timeToRisk} h` : timeToRisk}
          </span>
        </div>
      </div>

      {/* Decision Rationale & Screening Recommendation Box Matching Screenshot */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          <Sparkles className="w-3 h-3 text-sky-600" />
          <span>AI-ASSISTED SCREENING RECOMMENDATION</span>
        </div>

        <button
          type="button"
          onClick={onOpenEvidenceModal}
          className="w-full py-2 px-3 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-xs font-mono font-bold tracking-tight transition shadow-xs flex items-center justify-center space-x-1.5"
        >
          <span>WATCH / HOLD REVIEW</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#D97706]" />
        </button>
      </div>
    </div>
  );
};
