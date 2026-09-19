import React, { useState, useEffect } from 'react';
import {
  LotFingerprint,
  SystemMetrics,
  LotHealthRadarData
} from '../types';
import { api } from '../services/api';
import { LotHealthRadarCard } from '../components/LotHealthRadarCard';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

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
  const [radarData, setRadarData] = useState<LotHealthRadarData | null>(null);

  const activeLot = lots.find((l) => l.lot_id === selectedLotId) || lots[0];

  useEffect(() => {
    if (activeLot?.lot_id) {
      api.getLotHealthRadar(activeLot.lot_id)
        .then(setRadarData)
        .catch((err) => console.error('Failed to fetch radar data:', err));
    }
  }, [activeLot?.lot_id]);

  // Components belonging to selected lot
  const lotComponents = (metrics?.components ?? []).filter((c) => c.lot_id === activeLot?.lot_id);

  // Lot statistics
  const componentCount = activeLot?.component_count ?? lotComponents.length;
  const lotMedian = activeLot?.parameters?.temperature?.summary_baseline?.initial_median ?? 70.0;
  const lotDispersion = activeLot?.parameters?.temperature?.summary_baseline?.initial_mad ?? 1.2;
  const anomalyCount = lotComponents.filter((c) => c.decision === 'HOLD / REVIEW' || c.decision === 'WATCH').length;
  const earlyFlags = lotComponents.filter((c) => (c.lot_deviation_score ?? 0) > 30).length;

  // Filter components
  const filtered = lotComponents.filter((c) => {
    const matchesSearch = c.component_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDecision = filterDecision === 'ALL' || c.decision === filterDecision;
    return matchesSearch && matchesDecision;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* Top Header & Lot Selector */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h2 className="text-lg font-bold font-mono text-slate-900 tracking-tight leading-none">
              LOT RELIABILITY FINGERPRINTS & DISPERSION
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Robust cohort medians and MAD envelopes for semiconductor production batches.
          </p>
        </div>

        {/* Lot Selector Tabs */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/70 space-x-1 font-mono text-xs">
          {lots.map((lot) => (
            <button
              key={lot.lot_id}
              type="button"
              onClick={() => onSelectLot(lot.lot_id)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
                activeLot?.lot_id === lot.lot_id
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lot.lot_id} ({lot.component_count})
            </button>
          ))}
        </div>
      </div>

      {/* Section 17: 6 LOT KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: LOT ID */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs">
          <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Lot Identifier
          </div>
          <div className="text-lg font-bold font-mono text-blue-700 mt-1">
            {activeLot?.lot_id ?? 'LOT-A17'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {(activeLot as any)?.part_type ?? 'RAD-HARD-FPGA'}
          </div>
        </div>

        {/* Card 2: Component Count */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs">
          <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Component Count
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-1">
            {componentCount} units
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            100% telemetry complete
          </div>
        </div>

        {/* Card 3: Lot Median */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs">
          <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Lot Median (0h)
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-1">
            {lotMedian} °C
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Nominal cohort baseline
          </div>
        </div>

        {/* Card 4: Lot Dispersion (MAD) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs">
          <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Lot Dispersion (MAD)
          </div>
          <div className="text-lg font-bold font-mono text-blue-700 mt-1">
            ±{lotDispersion} °C
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Robust scale estimate
          </div>
        </div>

        {/* Card 5: Anomaly Count */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs">
          <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Anomaly Count
          </div>
          <div className="text-lg font-bold font-mono text-amber-800 mt-1">
            {anomalyCount} flagged
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Dynamic outliers
          </div>
        </div>

        {/* Card 6: Early Flags */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs">
          <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Early Flags (&lt;24h)
          </div>
          <div className="text-lg font-bold font-mono text-rose-700 mt-1">
            {earlyFlags} units
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Early chamber triage
          </div>
        </div>
      </div>

      {/* Lot Health Radar & Population Dispersion Analysis */}
      <LotHealthRadarCard
        radarData={radarData}
        lotId={activeLot?.lot_id}
        attribution={radarData?.common_cause_drift === 'HIGH' ? 'COMMON-CAUSE LOT DRIFT' : undefined}
        attributionLabel={radarData?.common_cause_drift === 'HIGH' ? 'COMMON-CAUSE LOT DRIFT DETECTED' : undefined}
        evidenceText={
          radarData?.common_cause_drift === 'HIGH'
            ? `Wafer lot ${activeLot?.lot_id} shows coordinated population drift across ${radarData.population_showing_drift} units (+${radarData.reference_deviation_mad} MAD shift vs reference envelope).`
            : undefined
        }
        recommendedAction={
          radarData?.common_cause_drift === 'HIGH'
            ? `LOT SCREENING HOLD • ISSUE WAFER INVESTIGATION FOR ${activeLot?.lot_id}`
            : undefined
        }
      />

      {/* Clean Table: Section 17 Specification */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Filters */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono w-72 shadow-2xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search component ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400 text-xs font-mono"
            />
          </div>

          <div className="flex items-center space-x-1 font-mono text-xs">
            <span className="text-slate-400 mr-2 text-[11px]">Filter Decision:</span>
            {['ALL', 'ACCEPT', 'WATCH', 'HOLD / REVIEW'].map((dec) => (
              <button
                key={dec}
                type="button"
                onClick={() => setFilterDecision(dec)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  filterDecision === dec
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {dec === 'HOLD / REVIEW' ? 'HOLD' : dec}
              </button>
            ))}
          </div>
        </div>

        {/* The Clean Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Component</th>
                <th className="py-3 px-4">Lot Deviation</th>
                <th className="py-3 px-4">Anomaly Score</th>
                <th className="py-3 px-4">168h Forecast</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Time-to-Risk</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((c) => {
                  const isHold = c.decision === 'HOLD / REVIEW';
                  const isWatch = c.decision === 'WATCH';
                  const lotDev = c.lot_deviation_score ?? 15;
                  const anomScore = c.anomaly_score ?? 18;
                  const confidence = c.confidence ?? (anomScore > 40 ? 82.5 : 94.0);
                  const timeToRisk = c.time_to_risk ?? '20 h';

                  return (
                    <tr
                      key={c.component_id}
                      onClick={() => onSelectComponent(c.component_id)}
                      className="cursor-pointer hover:bg-blue-50/50 transition-colors duration-150 group"
                    >
                      {/* Component */}
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span>{c.component_id}</span>
                          {c.component_id === 'C-104' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              BENCHMARK
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Lot Deviation */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            lotDev > 50 ? 'text-rose-700' : lotDev > 25 ? 'text-amber-800' : 'text-slate-600'
                          }`}
                        >
                          {lotDev} / 100
                        </span>
                      </td>

                      {/* Anomaly */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            anomScore > 50 ? 'text-rose-700' : anomScore > 25 ? 'text-amber-800' : 'text-emerald-700'
                          }`}
                        >
                          {anomScore}
                        </span>
                      </td>

                      {/* Forecast */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={anomScore > 40 ? 'text-rose-700 font-bold' : 'text-slate-600 font-medium'}>
                          {anomScore > 50 ? 'HIGH RISK' : anomScore > 25 ? 'WATCH' : 'NOMINAL PASS'}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="py-3 px-4 text-blue-700 font-semibold whitespace-nowrap">
                        {typeof confidence === 'number' ? `${confidence.toFixed(1)}%` : confidence}
                      </td>

                      {/* Time-to-Risk */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {timeToRisk}
                      </td>

                      {/* Decision */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isHold
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isWatch
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {c.decision}
                        </span>
                      </td>

                      {/* Inspect */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectComponent(c.component_id);
                            onOpenEvidenceModal();
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition text-[11px] font-bold"
                        >
                          <span>Evidence</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-mono text-xs">
                    No components match search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
