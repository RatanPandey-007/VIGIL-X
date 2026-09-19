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
import { Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

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
