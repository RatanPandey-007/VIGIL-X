import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import {
  SystemMetrics,
  ComponentEvaluation,
  LotFingerprint,
  ModelPerformanceData
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { EvidenceChainModal } from './components/EvidenceChainModal';
import { OverviewDashboard } from './views/OverviewDashboard';
import { LiveBurnInLab } from './views/LiveBurnInLab';
import { LotIntelligenceView } from './views/LotIntelligenceView';
import { ComponentForensicsView } from './views/ComponentForensicsView';
import { PredictionsView } from './views/PredictionsView';
import { RiskAlertsView } from './views/RiskAlertsView';
import { ModelValidationView } from './views/ModelValidationView';
import { TraditionalVsVigilXView } from './views/TraditionalVsVigilXView';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('C-104');
  const [componentDetails, setComponentDetails] = useState<ComponentEvaluation | null>(null);
  const [lots, setLots] = useState<LotFingerprint[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<string>('LOT-A17');
  const [modelPerf, setModelPerf] = useState<ModelPerformanceData | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<boolean>(false);

  const [currentHour, setCurrentHour] = useState<number>(0.0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(10);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch initial data
  const refreshAllData = useCallback(async () => {
    try {
      const [m, l, p] = await Promise.all([
        api.getMetrics(),
        api.getLots(),
        api.getModelPerformance()
      ]);
      setMetrics(m);
      setCurrentHour(m.current_hour);
      setIsRunning(m.is_running);
      setSpeed(m.speed_multiplier);
      setLots(l.lots);
      setApiError(null);
    } catch (err: any) {
      console.error('API error:', err);
      setApiError('Unable to connect to VIGIL-X Backend API. Ensure backend is running on http://127.0.0.1:8000.');
    }
  }, []);

  // Fetch details for selected component
  const refreshComponent = useCallback(async (cid: string) => {
    try {
      const details = await api.getComponentDetails(cid);
      setComponentDetails(details);
      setSelectedLotId(details.lot_id);
    } catch (err) {
      console.error(`Failed to fetch component ${cid}:`, err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshAllData();
    refreshComponent(selectedComponentId);
    api.getModelPerformance().then(setModelPerf).catch(console.error);
  }, [refreshAllData, refreshComponent, selectedComponentId]);

  // Polling loop when simulation is running or on interval
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const m = await api.getMetrics();
        setMetrics(m);
        setCurrentHour(m.current_hour);
        setIsRunning(m.is_running);
        setSpeed(m.speed_multiplier);

        // Also refresh selected component
        if (selectedComponentId) {
          const c = await api.getComponentDetails(selectedComponentId);
          setComponentDetails(c);
        }
      } catch (e) {
        // Suppress polling errors
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [selectedComponentId]);

  // Simulation handlers
  const handleStart = async () => {
    try {
      await api.startSimulation();
      setIsRunning(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePause = async () => {
    try {
      await api.pauseSimulation();
      setIsRunning(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetSimulation();
      setCurrentHour(0.0);
      setIsRunning(false);
      refreshComponent(selectedComponentId);
      refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpeedChange = async (s: number) => {
    try {
      await api.setSpeed(s);
      setSpeed(s);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInjectDefect = async () => {
    try {
      await api.injectDefect(selectedComponentId);
      await refreshComponent(selectedComponentId);
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleHeroDemo = async () => {
    try {
      await api.heroDemoReset();
      setSelectedComponentId('C-104');
      setSelectedLotId('LOT-A17');
      setCurrentHour(0.0);
      setIsRunning(false);
      await refreshComponent('C-104');
      await refreshAllData();
      setActiveTab('overview');
    } catch (e) {
      console.error(e);
    }
  };

  const activeLotFingerprint = lots.find((l) => l.lot_id === (componentDetails?.lot_id ?? selectedLotId)) || lots[0] || null;

  // Calculate live alert count
  const alertCount = (metrics?.components ?? []).filter(
    (c) => c.decision === 'HOLD / REVIEW' || c.decision === 'WATCH' || c.absolute_status === 'BREACHED'
  ).length;

  const pageTitleMap: Record<string, string> = {
    overview: 'Overview',
    lab: 'Live Burn-In',
    lots: 'Lot Intelligence',
    forensics: 'Component Forensics',
    predictions: 'Predictions',
    alerts: 'Risk Alerts',
    validation: 'Model Validation',
    comparison: 'Benchmarking'
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      {/* 1. Left Compact Navigation Rail (Section 4) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
        alertCount={alertCount}
      />

      {/* 2. Main Analytical Workspace */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Minimal Global Header (Section 5) */}
        <Header
          metrics={metrics}
          currentHour={currentHour}
          isRunning={isRunning}
          speed={speed}
          selectedComponentId={selectedComponentId}
          selectedLotId={selectedLotId}
          pageTitle={pageTitleMap[activeTab] || 'Overview'}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
          onHeroDemo={handleHeroDemo}
        />

        {/* API Error Banner */}
        {apiError && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2 text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={refreshAllData}
              className="flex items-center space-x-1 text-rose-900 font-mono font-bold hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Active Page View Container */}
        <main className="flex-1 p-3 sm:p-4 md:p-5 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewDashboard
              metrics={metrics}
              selectedComponent={componentDetails}
              lotFingerprint={activeLotFingerprint}
              modelPerf={modelPerf}
              currentHour={currentHour}
              onSelectComponent={(cid) => {
                setSelectedComponentId(cid);
                refreshComponent(cid);
              }}
              onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
              onNavigateTab={setActiveTab}
              onInjectDefect={handleInjectDefect}
            />
          )}

          {activeTab === 'lab' && (
            <LiveBurnInLab
              metrics={metrics}
              component={componentDetails}
              lotFingerprint={activeLotFingerprint}
              currentHour={currentHour}
              isRunning={isRunning}
              speed={speed}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onSpeedChange={handleSpeedChange}
              onInjectDefect={handleInjectDefect}
              onHeroDemo={handleHeroDemo}
              onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
              onSelectComponent={(cid) => {
                setSelectedComponentId(cid);
                refreshComponent(cid);
              }}
            />
          )}

          {activeTab === 'lots' && (
            <LotIntelligenceView
              lots={lots}
              metrics={metrics}
              selectedLotId={selectedLotId}
              onSelectLot={setSelectedLotId}
              onSelectComponent={(cid) => {
                setSelectedComponentId(cid);
                refreshComponent(cid);
                setActiveTab('overview');
              }}
              onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
            />
          )}

          {activeTab === 'forensics' && (
            <ComponentForensicsView
              component={componentDetails}
              lotFingerprint={activeLotFingerprint}
              currentHour={currentHour}
              onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
            />
          )}

          {activeTab === 'predictions' && (
            <PredictionsView
              component={componentDetails}
              lotFingerprint={activeLotFingerprint}
              modelPerf={modelPerf}
              currentHour={currentHour}
              metrics={metrics}
              onSelectComponent={(cid) => {
                setSelectedComponentId(cid);
                refreshComponent(cid);
              }}
              onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
            />
          )}

          {activeTab === 'alerts' && (
            <RiskAlertsView
              metrics={metrics}
              currentHour={currentHour}
              selectedComponentId={selectedComponentId}
              onSelectComponent={(cid) => {
                setSelectedComponentId(cid);
                refreshComponent(cid);
              }}
              onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'validation' && (
            <ModelValidationView performance={modelPerf} />
          )}

          {activeTab === 'comparison' && (
            <TraditionalVsVigilXView />
          )}
        </main>

        {/* Global Traceable Reliability Evidence Chain Modal (Section 22) */}
        <EvidenceChainModal
          isOpen={isEvidenceModalOpen}
          onClose={() => setIsEvidenceModalOpen(false)}
          evidenceChain={componentDetails?.evidence_chain ?? null}
        />
      </div>
    </div>
  );
};

export default App;
