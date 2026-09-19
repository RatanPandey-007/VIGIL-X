import React from 'react';
import {
  SystemMetrics,
  ComponentEvaluation,
  LotFingerprint,
  ModelPerformanceData
} from '../types';
import { HeroBannerCard } from '../components/HeroBannerCard';
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
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* 1. Top Hero Banner Card */}
      <HeroBannerCard
        component={selectedComponent}
        currentHour={currentHour}
      />

      {/* 2. Row of 7 Summary KPI Cards */}
      <SummaryKPICards metrics={metrics} />

      {/* 3. Main 2-Column Section: Live Burn-In Monitor (Left) & Current Component Forensics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Live Burn-In Monitor (~68% width / 8 cols on lg) */}
        <div className="lg:col-span-8">
          <LiveBurnInMonitorCard
            component={selectedComponent}
            lotFingerprint={lotFingerprint}
            currentHour={currentHour}
            metrics={metrics}
            onSelectComponent={onSelectComponent}
          />
        </div>

        {/* Right Column: Current Component Panel (~32% width / 4 cols on lg) */}
        <div className="lg:col-span-4">
          <CurrentComponentPanel
            component={selectedComponent}
            currentHour={currentHour}
            onOpenEvidenceModal={onOpenEvidenceModal}
          />
        </div>
      </div>

      {/* 4. Bottom Section: Channel Trends, Trajectory, Lot Intelligence, Model Performance */}
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
