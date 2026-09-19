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
  ExternalLink,
  Layers,
  ArrowRight
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
  const lotId = component?.lot_id ?? 'LOT-A17';
  const partType = component?.part_type ?? 'RAD-HARD-FPGA-DSP';
  const decision = component?.decision?.decision ?? 'WATCH';
  const progressPct = Math.min(100, Math.round((currentHour / 168.0) * 100));

  const absStatus = component?.anomaly?.absolute_limit_status ?? 'PASS';
  const lotDevScore = component?.anomaly?.lot_deviation_score ?? 72;
  const anomalyScore = component?.anomaly?.anomaly_score ?? 68;
  const pred168h = component?.forecast?.display_status ?? (anomalyScore > 50 ? 'HIGH RISK' : 'WATCH');
  const confidence = component?.forecast?.overall_confidence ?? 82.5;
  const timeToRisk = component?.time_to_risk?.hours_remaining ?? 20;

  const isHold = decision === 'HOLD / REVIEW';
  const isWatch = decision === 'WATCH';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">
            Inspector Panel
          </span>
          <h3 className="text-base font-bold font-mono text-slate-900 tracking-tight leading-none mt-0.5">
            CURRENT COMPONENT
          </h3>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 shadow-2xs border ${
          isHold ? 'bg-rose-50 text-rose-700 border-rose-200' :
          isWatch ? 'bg-amber-50 text-amber-800 border-amber-200' :
          'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {isWatch && <AlertTriangle className="w-3 h-3 text-amber-600" />}
          <span>{decision === 'HOLD / REVIEW' ? 'HOLD' : decision}</span>
        </span>
      </div>

      {/* Component Identity Block */}
      <div className="flex items-center space-x-3.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
        <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
          <img
            src="/ref_comp_chip.png"
            alt="Component"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-base font-bold font-mono text-slate-900 leading-tight">
              {cid}
            </h4>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {lotId}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 font-medium mt-0.5 truncate">
            Part: {partType}
          </div>
        </div>
      </div>

      {/* Section 13: CRITICAL STATUS PRESENTATION BLOCK */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
        <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500">
          Screening State Comparison
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Absolute Limit Block */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
            <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
              ABSOLUTE LIMIT
            </div>
            <div className="text-sm font-bold font-mono text-emerald-700 mt-0.5 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PASS</span>
            </div>
            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
              Datasheet compliant
            </div>
          </div>

          {/* Lot Relative Block */}
          <div className="bg-white p-2.5 rounded-lg border border-amber-200/80">
            <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
              LOT RELATIVE
            </div>
            <div className="text-sm font-bold font-mono text-amber-800 mt-0.5 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>ANOMALOUS</span>
            </div>
            <div className="text-[9px] text-amber-700 font-mono mt-0.5">
              &gt;3.5 MAD outlier
            </div>
          </div>
        </div>
      </div>

      {/* Clean Diagnostic Rows (Section 12) */}
      <div className="divide-y divide-slate-100 text-xs font-mono">
        {/* Row 1: Burn-in Progress */}
        <div className="flex items-center justify-between py-2 text-slate-600">
          <div className="flex items-center space-x-2 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Burn-in Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">{currentHour.toFixed(0)}h / 168h</span>
            <span className="text-[10px] text-slate-400">({progressPct}%)</span>
          </div>
        </div>

        {/* Row 2: Absolute Limit */}
        <div className="flex items-center justify-between py-2 text-slate-600">
          <div className="flex items-center space-x-2 text-slate-500">
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Absolute Limit</span>
          </div>
          <span className="font-bold text-emerald-700 font-mono">
            {absStatus}
          </span>
        </div>

        {/* Row 3: Lot Deviation */}
        <div className="flex items-center justify-between py-2 text-slate-600">
          <div className="flex items-center space-x-2 text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            <span>Lot Deviation</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-amber-800">ELEVATED</span>
            <span className="text-slate-400">({lotDevScore} / 100)</span>
          </div>
        </div>

        {/* Row 4: Anomaly Score */}
        <div className="flex items-center justify-between py-2 text-slate-600">
          <div className="flex items-center space-x-2 text-slate-500">
            <Gauge className="w-3.5 h-3.5 text-blue-600" />
            <span>Anomaly Score</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-rose-700">{anomalyScore}</span>
            <span className="text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Row 5: Predicted 168h */}
        <div className="flex items-center justify-between py-2 text-slate-600">
          <div className="flex items-center space-x-2 text-slate-500">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
            <span>Predicted 168h</span>
          </div>
          <span className="font-bold text-rose-700">
            {pred168h}
          </span>
        </div>

        {/* Row 6: Confidence */}
        <div className="flex items-center justify-between py-2 text-slate-600">
          <div className="flex items-center space-x-2 text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Confidence</span>
          </div>
          <span className="font-bold text-blue-700">
            {confidence}%
          </span>
        </div>

        {/* Row 7: Time-to-Risk */}
        <div className="flex items-center justify-between py-2 text-slate-600">
          <div className="flex items-center space-x-2 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Time-to-Risk</span>
          </div>
          <span className="font-bold text-blue-700">
            {typeof timeToRisk === 'number' ? `${timeToRisk} h` : timeToRisk}
          </span>
        </div>

        {/* Row 8: Recommendation */}
        <div className="flex items-center justify-between py-2 text-slate-600">
          <div className="flex items-center space-x-2 text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Recommendation</span>
          </div>
          <span className="font-bold text-amber-800">
            {isHold ? 'HOLD / REVIEW' : isWatch ? 'WATCH / REVIEW' : 'ACCEPT'}
          </span>
        </div>
      </div>

      {/* Traceable Evidence CTA Button */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onOpenEvidenceModal}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold tracking-tight transition shadow-xs flex items-center justify-center space-x-2 group"
        >
          <span>VIEW 8-STAGE EVIDENCE CHAIN</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition" />
        </button>
      </div>
    </div>
  );
};
