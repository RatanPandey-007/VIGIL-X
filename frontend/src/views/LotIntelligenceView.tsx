import React, { useState } from 'react';
import {
  LotFingerprint,
  SystemMetrics,
  ComponentEvaluation
} from '../types';
import {
  Layers,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Activity,
  Cpu
} from 'lucide-react';
import { DecisionBadge } from '../components/DecisionBadge';
import { LiquidButton, LiquidCard, LiquidTab } from '../components/LiquidInteraction';

interface LotIntelligenceViewProps {
  lots: LotFingerprint[];
  metrics: SystemMetrics | null;
  selectedLotId: string;
  onSelectLot: (lotId: string) => void;
  onSelectComponent: (cid: string) => void;
  onOpenEvidenceModal: () => void;
}

export const LotIntelligenceView: React.FC<LotIntelligenceViewProps> = ({
  lots,
  metrics,
  selectedLotId,
  onSelectLot,
  onSelectComponent,
  onOpenEvidenceModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState<string>('ALL');

  const activeLot = lots.find((l) => l.lot_id === selectedLotId) || lots[0];

  // Components belonging to selected lot
  const lotComponents = (metrics?.components ?? []).filter((c) => c.lot_id === activeLot?.lot_id);

  // Filter components
  const filtered = lotComponents.filter((c) => {
    const matchesSearch = c.component_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDecision = filterDecision === 'ALL' || c.decision === filterDecision;
    return matchesSearch && matchesDecision;
  });

  return (
    <div className="space-y-6">
      {/* Top Lot Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-mono text-slate-900 tracking-tight">
            LOT RELIABILITY FINGERPRINTS & COHORT INTELLIGENCE
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Robust statistics (Median & MAD) compute uncontaminated baseline envelopes across production lots.
          </p>
        </div>

        {/* Lot Switcher with LiquidTab */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 space-x-1 font-mono text-xs">
          {lots.map((lot) => (
            <LiquidTab
              key={lot.lot_id}
              active={activeLot?.lot_id === lot.lot_id}
              onClick={() => onSelectLot(lot.lot_id)}
              className="px-4 py-1.5 font-medium"
            >
              {lot.lot_id} ({lot.component_count} units)
            </LiquidTab>
          ))}
        </div>
      </div>

      {/* Lot KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <LiquidCard className="engineering-card rounded-xl p-4 border border-slate-200 bg-white shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Cohort Population</div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            {activeLot?.component_count ?? 0} components
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Statistical confidence 99%</div>
        </LiquidCard>

        <LiquidCard className="engineering-card rounded-xl p-4 border border-slate-200 bg-white shadow-xs">
          <div className="text-[11px] font-mono text-emerald-700 uppercase tracking-wider font-semibold">Lot Median Temp</div>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-1">
            {activeLot?.parameters?.temperature?.summary_baseline?.initial_median ?? 70.0} °C
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            MAD: ±{activeLot?.parameters?.temperature?.summary_baseline?.initial_mad ?? 1.2} °C
          </div>
        </LiquidCard>

        <LiquidCard className="engineering-card rounded-xl p-4 border border-slate-200 bg-white shadow-xs">
          <div className="text-[11px] font-mono text-sky-700 uppercase tracking-wider font-semibold">Median Leakage</div>
          <div className="text-xl font-bold text-sky-700 font-mono mt-1">
            {activeLot?.parameters?.standby_current?.summary_baseline?.initial_median ?? 28.5} µA
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            MAD: ±{activeLot?.parameters?.standby_current?.summary_baseline?.initial_mad ?? 1.5} µA
          </div>
        </LiquidCard>

        <LiquidCard className="engineering-card rounded-xl p-4 border border-slate-200 bg-white shadow-xs">
          <div className="text-[11px] font-mono text-amber-700 uppercase tracking-wider font-semibold">Outlier Count</div>
          <div className="text-xl font-bold text-amber-700 font-mono mt-1">
            {activeLot?.outlier_count ?? 0} flagged
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Exceeds 2.5 MAD</div>
        </LiquidCard>
      </div>

      {/* Lot Correlation Matrix */}
      {activeLot?.correlations && Object.keys(activeLot.correlations).length > 0 && (
        <div className="engineering-card rounded-xl p-5 border border-slate-200 bg-white shadow-xs">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 mb-3">
            Lot Parametric Correlation Matrix ({activeLot.lot_id} at 24h)
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-center text-xs font-mono">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[10px] uppercase">
                <tr>
                  <th className="py-2 px-3 text-left font-bold">Parameter</th>
                  {Object.keys(activeLot.correlations).map((k) => (
                    <th key={k} className="py-2 px-3 font-bold">{k.replace('_', ' ').slice(0, 7)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {Object.entries(activeLot.correlations).map(([rowK, rowVals]) => (
                  <tr key={rowK} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 text-left font-bold text-slate-800">
                      {rowK.replace('_', ' ')}
                    </td>
                    {Object.entries(rowVals).map(([colK, val]) => {
                      const num = Number(val);
                      const isHigh = Math.abs(num) > 0.6 && rowK !== colK;
                      return (
                        <td
                          key={colK}
                          className={`py-2 px-3 font-medium ${
                            rowK === colK
                              ? 'text-slate-400 bg-slate-50/50 font-normal'
                              : isHigh
                              ? 'text-sky-700 font-bold bg-sky-50'
                              : 'text-slate-600'
                          }`}
                        >
                          {num.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Component Table with Filter & Search */}
      <div className="engineering-card rounded-xl p-5 border border-slate-200 bg-white space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Component ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white w-48 transition"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono">
              {['ALL', 'ACCEPT', 'WATCH', 'HOLD / REVIEW'].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDecision(d)}
                  className={`px-2.5 py-1 rounded transition font-medium ${
                    filterDecision === d
                      ? 'bg-white text-sky-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Showing <strong className="text-slate-900 font-bold">{filtered.length}</strong> of {lotComponents.length} units in {activeLot?.lot_id}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3 font-bold">Component ID</th>
                <th className="py-2.5 px-3 font-bold">Part Type</th>
                <th className="py-2.5 px-3 font-bold">Temp (°C)</th>
                <th className="py-2.5 px-3 font-bold">Leakage (µA)</th>
                <th className="py-2.5 px-3 font-bold">Lot Deviation</th>
                <th className="py-2.5 px-3 font-bold">Anomaly Score</th>
                <th className="py-2.5 px-3 font-bold">Time-to-Risk</th>
                <th className="py-2.5 px-3 font-bold">Decision</th>
                <th className="py-2.5 px-3 text-right font-bold">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((c) => {
                const isHero = c.component_id === 'C-104';
                return (
                  <tr
                    key={c.component_id}
                    onClick={() => onSelectComponent(c.component_id)}
                    className={`cursor-pointer hover:bg-slate-50 transition ${
                      isHero ? 'bg-sky-50/50' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center space-x-1.5">
                      <span>{c.component_id}</span>
                      {isHero && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-100 text-sky-800 border border-sky-300 font-bold">
                          HERO
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{c.part_type}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{c.latest_temp}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{c.latest_leakage}</td>
                    <td className="py-2.5 px-3">
                      <span className={c.lot_deviation_score >= 35 ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                        {c.lot_deviation_score}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={c.anomaly_score >= 60 ? 'text-rose-700 font-bold' : c.anomaly_score >= 35 ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                        {c.anomaly_score}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-sky-700 font-bold">
                      {c.time_to_risk}
                    </td>
                    <td className="py-2.5 px-3">
                      <DecisionBadge decision={c.decision} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <LiquidButton
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComponent(c.component_id);
                          onOpenEvidenceModal();
                        }}
                        className="px-2.5 py-1 text-[11px] inline-flex items-center space-x-1 border-slate-200"
                      >
                        <span>Evidence</span>
                        <ExternalLink className="w-3 h-3" />
                      </LiquidButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
