import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Activity,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ComponentEvaluation, SystemMetrics } from '../types';

interface BottomIntelligenceRowProps {
  component: ComponentEvaluation | null;
  metrics: SystemMetrics | null;
  currentHour: number;
  onSelectComponent?: (cid: string) => void;
  onOpenEvidenceModal: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const BottomIntelligenceRow: React.FC<BottomIntelligenceRowProps> = ({
  component,
  metrics,
  currentHour,
  onSelectComponent,
  onOpenEvidenceModal,
  onNavigateTab
}) => {
  const cid = component?.component_id ?? 'C-104';
  const lotId = component?.lot_id ?? 'LOT-A17';
  const decision = component?.decision?.decision ?? 'WATCH / HOLD REVIEW';
  const timeToRisk = component?.time_to_risk?.hours_remaining ?? 37;
  const isHold = decision.includes('HOLD');
  const isWatch = decision.includes('WATCH');

  // Real active alerts derived directly from live metrics
  const activeAlerts = (metrics?.components ?? [])
    .filter((c) => c.decision === 'HOLD / REVIEW' || c.decision === 'WATCH' || c.anomaly_score > 35)
    .slice(0, 3);

  // 8 Evidence chain stages
  const evidenceStages = [
    { num: '01', title: 'Raw Data', status: 'PASS' },
    { num: '02', title: 'Lot Fingerprint', status: 'LOCKED' },
    { num: '03', title: 'Lot Deviation', status: 'ELEVATED' },
    { num: '04', title: 'Trend & Drift', status: 'ACTIVE' },
    { num: '05', title: 'Module A', status: 'ANOMALOUS' },
    { num: '06', title: 'Module B', status: 'PREDICTED' },
    { num: '07', title: 'Risk Score', status: 'HIGH RISK' },
    { num: '08', title: 'Decision', status: 'HOLD / REVIEW' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
      {/* COLUMN 1: 24h EARLY DECISION GATE (4 cols) */}
      <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-blue-700" />
              <h4 className="text-xs font-bold font-mono text-slate-900 tracking-tight">
                24h EARLY DECISION GATE
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              {currentHour >= 24 ? 'ACTIVE AT 24h' : 'PRE-GATE (0h)'}
            </span>
          </div>

          <div className="flex items-center space-x-2 mt-2.5">
            <span className="text-sm font-bold font-mono text-slate-900">{cid}</span>
            <span className="text-xs font-mono text-slate-400">/</span>
            <span className="text-xs font-bold font-mono text-blue-700">{lotId}</span>
          </div>

          {/* Core Decision Transition Banner */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-1 font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PASS</span>
            </div>
            <span className="text-slate-400 font-sans">&rarr;</span>
            <div className="flex items-center space-x-1 font-bold text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>ANOMALOUS</span>
            </div>
          </div>

          {/* Diagnostic Pillars */}
          <div className="grid grid-cols-2 gap-2 mt-2.5 font-mono text-[11px]">
            <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 text-[10px] block">MODULE A</span>
              <span className="font-bold text-amber-800">ELEVATED</span>
            </div>
            <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 text-[10px] block">MODULE B</span>
              <span className="font-bold text-blue-700">ACTIVE</span>
            </div>
            <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 text-[10px] block">168h FORECAST</span>
              <span className="font-bold text-rose-700">HIGH RISK</span>
            </div>
            <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 text-[10px] block">TIME-TO-RISK</span>
              <span className="font-bold text-blue-700">{typeof timeToRisk === 'number' ? `${timeToRisk}h` : timeToRisk}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenEvidenceModal}
            className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-mono font-bold transition flex items-center justify-center space-x-1.5"
          >
            <span>VIEW 24h DECISION EVIDENCE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* COLUMN 2: RISK / ALERTS SUMMARY (4 cols) */}
      <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold font-mono text-slate-900 tracking-tight">
                RISK ALERTS SUMMARY
              </h4>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('alerts')}
                className="text-[11px] font-mono font-semibold text-blue-700 hover:underline flex items-center space-x-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500 font-mono mt-2">
            Active Latent Drift & Outlier Triage
          </p>

          {/* Top 2–3 Real Alerts */}
          <div className="space-y-2 mt-2.5">
            {activeAlerts.length > 0 ? (
              activeAlerts.map((alt) => {
                const isSelected = alt.component_id === cid;
                const isHr = alt.decision === 'HOLD / REVIEW' || alt.anomaly_score > 60;
                const riskLabel = isHr ? 'HIGH RISK' : 'WATCH';
                return (
                  <div
                    key={alt.component_id}
                    onClick={() => onSelectComponent && onSelectComponent(alt.component_id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs font-mono ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/40'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900">{alt.component_id}</span>
                        <span className="text-[10px] text-slate-400">({alt.lot_id})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {isHr ? 'Latent runaway drift detected' : 'Parametric lot-relative divergence'}
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 border ${
                      isHr
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {riskLabel}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-xs font-bold font-mono text-emerald-800">
                  NO ACTIVE RISK ALERTS
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                  All components inside lot normal envelope
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Telemetry Stream: Synchronized</span>
          <span className="text-slate-700 font-semibold">{metrics?.total_components ?? 26} Units Monitored</span>
        </div>
      </div>

      {/* COLUMN 3: EVIDENCE CHAIN PREVIEW (4 cols) */}
      <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-bold font-mono text-slate-900 tracking-tight">
                EVIDENCE CHAIN PREVIEW
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
              8 STAGES
            </span>
          </div>

          <p className="text-[11px] text-slate-500 font-mono mt-2">
            Mission-Assurance Explainability Pipeline
          </p>

          {/* Compact 8-Stage Grid Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2.5">
            {evidenceStages.map((st) => (
              <div
                key={st.num}
                className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-1.5 flex flex-col justify-between font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400">{st.num}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                </div>
                <div className="text-[10px] font-semibold text-slate-800 leading-tight mt-1 truncate">
                  {st.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Button to open full modal */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenEvidenceModal}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
          >
            <span>AUDIT TRACEABILITY CHAIN</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
