import React from 'react';
import {
  SystemMetrics,
  ComponentEvaluation,
  LotFingerprint,
  ModelPerformanceData
} from '../types';
import { CommandSummaryCard } from '../components/CommandSummaryCard';
import { SummaryKPICards } from '../components/SummaryKPICards';
import { LiveBurnInMonitorCard } from '../components/LiveBurnInMonitorCard';
import { CurrentComponentPanel } from '../components/CurrentComponentPanel';
import { BottomDashboardPanels } from '../components/BottomDashboardPanels';

interface OverviewDashboardProps {
  metrics: SystemMetrics | null;
  selectedComponent: ComponentEvaluation | null;
  lotFingerprint: LotFingerprint | null;
  modelPerf?: ModelPerformanceData | null;
  currentHour: number;
  onSelectComponent: (componentId: string) => void;
  onOpenEvidenceModal: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  metrics,
  selectedComponent,
  lotFingerprint,
  modelPerf = null,
  currentHour,
  onSelectComponent,
  onOpenEvidenceModal,
  onNavigateTab
}) => {
  return (
    <div className="space-y-4 max-w-[1680px] mx-auto pb-6">
      {/* 1. Top Engineering Application Status Bar */}
      <CommandSummaryCard
        component={selectedComponent}
        currentHour={currentHour}
      />

      {/* 2. 7 Uniform Clean White KPI Cards */}
      <SummaryKPICards metrics={metrics} />

      {/* 3. Primary Analytical Workspace: LOT RELIABILITY ENVELOPE & CURRENT COMPONENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Primary Anchor: Lot Reliability Envelope Chart (8 cols) */}
        <div className="lg:col-span-8">
          <LiveBurnInMonitorCard
            component={selectedComponent}
            lotFingerprint={lotFingerprint}
            currentHour={currentHour}
            metrics={metrics}
            onSelectComponent={onSelectComponent}
          />
        </div>

        {/* Contextual Right Column: Current Component Inspector (4 cols) */}
        <div className="lg:col-span-4">
          <CurrentComponentPanel
            component={selectedComponent}
            currentHour={currentHour}
            onOpenEvidenceModal={onOpenEvidenceModal}
          />
        </div>
      </div>

      {/* 4. Bottom Contextual Engineering Cards */}
      <BottomDashboardPanels
        component={selectedComponent}
        lotFingerprint={lotFingerprint}
        modelPerf={modelPerf}
        onOpenLotDetails={() => onNavigateTab && onNavigateTab('lots')}
        onOpenModelDetails={() => onNavigateTab && onNavigateTab('validation')}
        onOpenEvidenceModal={onOpenEvidenceModal}
      />
    </div>
  );
};
