import React from 'react';
import {
  SystemMetrics,
  ComponentEvaluation,
  LotFingerprint,
  ModelPerformanceData
} from '../types';
import { SummaryKPICards } from '../components/SummaryKPICards';
import { LiveBurnInMonitorCard } from '../components/LiveBurnInMonitorCard';
import { CurrentComponentPanel } from '../components/CurrentComponentPanel';
import { BottomIntelligenceRow } from '../components/BottomIntelligenceRow';
import { Clock, AlertTriangle, ShieldAlert, Compass } from 'lucide-react';

interface OverviewDashboardProps {
  metrics: SystemMetrics | null;
  selectedComponent: ComponentEvaluation | null;
  lotFingerprint: LotFingerprint | null;
  modelPerf?: ModelPerformanceData | null;
  currentHour: number;
  onSelectComponent: (componentId: string) => void;
  onOpenEvidenceModal: () => void;
  onNavigateTab?: (tab: string) => void;
  onInjectDefect?: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  metrics,
  selectedComponent,
  lotFingerprint,
  currentHour,
  onSelectComponent,
  onOpenEvidenceModal,
  onNavigateTab,
  onInjectDefect
}) => {
  const cid = selectedComponent?.component_id ?? 'C-104';
  const lotId = selectedComponent?.lot_id ?? 'LOT-A17';
  const decision = selectedComponent?.decision?.decision ?? 'WATCH';
  const isWatch = decision.includes('WATCH');
  const isHold = decision.includes('HOLD');

  return (
    <div className="space-y-3.5 max-w-[1720px] mx-auto pb-4 select-none">
      {/* 1. Concise Engineering Context (Section 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-extrabold font-mono text-slate-900 tracking-tight leading-none">
              COMMAND CENTER
            </h1>
            <span className="text-slate-300 font-mono">/</span>
            <span className="text-xs text-slate-500 font-medium">
              Live component reliability overview
            </span>
          </div>
        </div>

        {/* Dynamic Context Tag: C-104 / LOT-A17 • WATCH • 24h Early Decision Pending */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
            <span className="font-bold text-slate-900">{cid}</span>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-blue-700">{lotId}</span>
          </div>

          <div className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${
            isHold ? 'bg-rose-50 text-rose-700 border-rose-200' :
            isWatch ? 'bg-amber-50 text-amber-800 border-amber-200' :
            'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>{isHold ? 'HOLD' : isWatch ? 'WATCH' : 'NOMINAL'}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-[11px]">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>24h Early Decision Pending</span>
          </div>
        </div>
      </div>

      {/* Root-Cause Triangulation Quick Sentinel */}
      {selectedComponent?.triangulation && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-slate-900 uppercase tracking-tight text-[11px]">
                  ROOT-CAUSE TRIANGULATION
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedComponent.triangulation.attribution}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Confidence: {selectedComponent.triangulation.confidence}%
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-1">
                {selectedComponent.triangulation.evidence_text}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-stretch md:self-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            {/* 3 Signal Meters */}
            <div className="flex items-center space-x-1.5 font-mono text-[10px]">
              <span className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700" title="Component Signal Score">
                COMP: <span className="font-bold text-slate-900">{selectedComponent.triangulation.component_signal.score.toFixed(0)}</span>
              </span>
              <span className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700" title="Lot-Wide Signal Score">
                LOT: <span className="font-bold text-slate-900">{selectedComponent.triangulation.lot_signal.score.toFixed(0)}</span>
              </span>
              <span className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700" title="Test-System Hardware Signal Score">
                HARNESS: <span className="font-bold text-slate-900">{selectedComponent.triangulation.test_system_signal.score.toFixed(0)}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenEvidenceModal}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-[11px] transition"
            >
              AUDIT TRAIL
            </button>
          </div>
        </div>
      )}

      {/* 2. 7 Compact KPI Cards (Section 6) */}
      <SummaryKPICards metrics={metrics} />

      {/* 3. Primary Analytical Workspace: 12-Column Grid (Sections 7, 8, 10, 11, 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column (8 cols): LOT RELIABILITY ENVELOPE + 4 CHANNEL TREND CARDS */}
        <div className="lg:col-span-8 space-y-3.5">
          <LiveBurnInMonitorCard
            component={selectedComponent}
            lotFingerprint={lotFingerprint}
            currentHour={currentHour}
            metrics={metrics}
            onSelectComponent={onSelectComponent}
          />
        </div>

        {/* Right Column (4 cols): CURRENT COMPONENT INTELLIGENCE */}
        <div className="lg:col-span-4">
          <CurrentComponentPanel
            component={selectedComponent}
            currentHour={currentHour}
            onOpenEvidenceModal={onOpenEvidenceModal}
            onInjectDefect={onInjectDefect}
          />
        </div>
      </div>

      {/* 4. Bottom Intelligence Row: 3 Equal Columns (Sections 13, 14, 15) */}
      <BottomIntelligenceRow
        component={selectedComponent}
        metrics={metrics}
        currentHour={currentHour}
        onSelectComponent={onSelectComponent}
        onOpenEvidenceModal={onOpenEvidenceModal}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
