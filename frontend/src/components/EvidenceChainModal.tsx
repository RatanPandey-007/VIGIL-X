import React, { useState } from 'react';
import {
  X,
  ArrowDown,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  GitCommit,
  Sparkles,
  Compass
} from 'lucide-react';
import { EvidenceChain, ScreeningDecision } from '../types';
import { LiquidButton, LiquidCard } from './LiquidInteraction';

interface EvidenceChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceChain: EvidenceChain | null;
}

export const EvidenceChainModal: React.FC<EvidenceChainModalProps> = ({
  isOpen,
  onClose,
  evidenceChain
}) => {
  const [activeTab, setActiveTab] = useState<'chain' | 'why' | 'whatif'>('chain');

  if (!isOpen || !evidenceChain) return null;

  const decision = evidenceChain.chain.find((s) => s.step_number === 8)?.decision as ScreeningDecision;
  const isHold = decision === 'HOLD / REVIEW';
  const isWatch = decision === 'WATCH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border shadow-sm ${
              isHold ? 'bg-rose-50 text-rose-700 border-rose-200' :
              isWatch ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 font-mono tracking-tight">
                  RELIABILITY EVIDENCE CHAIN
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-mono font-bold border border-sky-200">
                  {evidenceChain.component_id} ({evidenceChain.lot_id})
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Traceable 8-stage auditable screening explanation • Smart Automation
              </p>
            </div>
          </div>

          {/* Sub-view Switcher & Close */}
          <div className="flex items-center space-x-3">
            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-mono">
              <button
                onClick={() => setActiveTab('chain')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  activeTab === 'chain'
                    ? 'bg-white text-sky-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                8-Stage Trace
              </button>
              <button
                onClick={() => setActiveTab('why')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 font-medium ${
                  activeTab === 'why'
                    ? 'bg-white text-sky-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why? (Contributors)</span>
              </button>
              <button
                onClick={() => setActiveTab('whatif')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 font-medium ${
                  activeTab === 'whatif'
                    ? 'bg-white text-sky-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>What-If? (Sensitivity)</span>
              </button>
            </div>

            <LiquidButton
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 border-slate-200"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </LiquidButton>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          {/* 3 Status Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-slate-50/80 border border-slate-200 p-3 rounded-xl shadow-sm">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Absolute Engineering Status</div>
              <div className={`text-base font-bold mt-1 ${
                evidenceChain.absolute_engineering_status === 'BREACHED' ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                {evidenceChain.absolute_engineering_status ?? 'PASS'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Datasheet Physical Bounds</div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200 p-3 rounded-xl shadow-sm">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Lot-Relative Status</div>
              <div className={`text-base font-bold mt-1 ${
                evidenceChain.lot_relative_status === 'ANOMALOUS' ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {evidenceChain.lot_relative_status ?? 'ANOMALOUS'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Wafer Lot Dispersion (MAD)</div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200 p-3 rounded-xl shadow-sm">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">168h Forecast Status</div>
              <div className={`text-base font-bold mt-1 ${
                evidenceChain.forecast_status === 'HIGH RISK' ? 'text-rose-700' :
                evidenceChain.forecast_status === 'WATCH' ? 'text-amber-700' : 'text-sky-700'
              }`}>
                {evidenceChain.forecast_status ?? 'HIGH RISK'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Module B Extrapolation</div>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 text-xs shadow-sm">
            <div className="text-[11px] font-mono text-sky-700 uppercase tracking-wider mb-1 font-bold">
              Executive Screening Rationale
            </div>
            <p className="text-slate-800 leading-relaxed font-sans text-xs font-medium">
              {evidenceChain.executive_summary}
            </p>
          </div>

          {/* TAB 1: 8-STAGE EVIDENCE CHAIN */}
          {activeTab === 'chain' && (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
              {evidenceChain.chain.map((step) => {
                const isFinal = step.step_number === 8;
                return (
                  <div key={step.step_number} className="relative flex items-start space-x-4 pl-2">
                    {/* Step circle */}
                    <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 border shadow-sm ${
                      isFinal
                        ? isHold
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isWatch
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white text-sky-700 border-slate-300'
                    }`}>
                      {step.step_number}
                    </div>

                    {/* Step Card */}
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition duration-150">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {step.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          ['HOLD / REVIEW', 'HIGH RISK', 'AT RISK', 'BREACHED', 'BREACH', 'SIMULATED LIMIT BREACH'].includes(step.status)
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : ['WATCH', 'FLAGGED', 'DIVERGING', 'ELEVATED'].includes(step.status)
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : ['AWAITING 24h EARLY GATE', 'AWAITING DATA', 'NOT YET AVAILABLE'].includes(step.status)
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {step.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mb-2 font-medium">
                        {step.summary}
                      </p>

                      {/* Stage 6: Module B 168h Forecast Engineering Table */}
                      {step.step_number === 6 && (
                        step.table_data && step.table_data.length > 0 ? (
                          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/50 mt-2">
                            <table className="w-full text-left font-mono text-[11px]">
                              <thead className="bg-slate-100/90 text-slate-700 border-b border-slate-200">
                                <tr>
                                  <th className="px-3 py-1.5 font-bold">Parameter</th>
                                  <th className="px-3 py-1.5 font-medium text-slate-600">Observed</th>
                                  <th className="px-3 py-1.5 font-bold text-amber-700">Predicted 168h</th>
                                  <th className="px-3 py-1.5 font-medium text-slate-600">90% CI Interval</th>
                                  <th className="px-3 py-1.5 font-medium text-slate-600">Drift Velocity</th>
                                  <th className="px-3 py-1.5 font-bold">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200/60">
                                {step.table_data.map((row: any, rIdx: number) => (
                                  <tr key={rIdx} className="hover:bg-slate-100/50">
                                    <td className="px-3 py-1.5 text-slate-900 font-bold">{row.parameter}</td>
                                    <td className="px-3 py-1.5 text-slate-700 font-medium">{row.current}</td>
                                    <td className="px-3 py-1.5 font-bold text-amber-700">{row.predicted_168h}</td>
                                    <td className="px-3 py-1.5 text-slate-600">{row.interval}</td>
                                    <td className="px-3 py-1.5 text-slate-600">{row.drift_rate}</td>
                                    <td className="px-3 py-1.5">
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        row.status === 'BREACH' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                        row.status === 'WATCH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}>
                                        {row.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] font-mono text-sky-700 flex items-center space-x-2 mt-2 font-medium">
                            <span>MODULE B AWAITING 24h EARLY GATE • Insufficient early burn-in observations.</span>
                          </div>
                        )
                      )}

                      {/* Stage 2: Lot Baseline / Reliability Fingerprint Table */}
                      {step.step_number === 2 && step.table_data && (
                        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/50 mt-2">
                          <table className="w-full text-left font-mono text-[11px]">
                            <thead className="bg-slate-100/90 text-slate-700 border-b border-slate-200">
                              <tr>
                                <th className="px-3 py-1.5 font-bold">Parameter</th>
                                <th className="px-3 py-1.5 font-bold text-sky-700">Lot Median</th>
                                <th className="px-3 py-1.5 font-medium text-slate-600">2.5×MAD Normal Envelope</th>
                                <th className="px-3 py-1.5 font-medium text-slate-600">MAD Dispersion</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60">
                              {step.table_data.map((row: any, rIdx: number) => (
                                <tr key={rIdx} className="hover:bg-slate-100/50">
                                  <td className="px-3 py-1.5 text-slate-900 font-bold">{row.parameter}</td>
                                  <td className="px-3 py-1.5 text-sky-700 font-bold">{row.median}</td>
                                  <td className="px-3 py-1.5 text-slate-700">{row.envelope}</td>
                                  <td className="px-3 py-1.5 text-slate-500">{row.mad}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Other Steps: Formatted Parametric Metrics */}
                      {step.metrics && step.step_number !== 2 && step.step_number !== 6 && (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono grid grid-cols-2 sm:grid-cols-5 gap-2 text-slate-600 mt-2">
                          {Object.entries(step.metrics).map(([k, v]) => (
                            <div key={k} className="bg-white p-1.5 rounded border border-slate-200/60 shadow-xs">
                              <span className="text-slate-500 capitalize block text-[10px]">{k.replace('_', ' ')}:</span>
                              <span className="text-slate-900 font-bold">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Stage 09: Root-Cause Triangulation Diagnosis */}
              {evidenceChain.triangulation && (
                <div className="relative flex items-start space-x-4 pl-2">
                  <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 border shadow-sm bg-indigo-50 text-indigo-700 border-indigo-300">
                    9
                  </div>

                  <div className="flex-1 bg-white border border-indigo-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 transition duration-150">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold font-mono text-slate-900 flex items-center space-x-1.5">
                        <Compass className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Stage 09: Root-Cause Triangulation Diagnosis</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {evidenceChain.triangulation.attribution}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-2 font-medium">
                      {evidenceChain.triangulation.evidence_text}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400">Comp Signal: </span>
                        <strong className="text-slate-900">{evidenceChain.triangulation.component_signal.score.toFixed(0)}/100 ({evidenceChain.triangulation.component_signal.level})</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Lot Signal: </span>
                        <strong className="text-slate-900">{evidenceChain.triangulation.lot_signal.score.toFixed(0)}/100 ({evidenceChain.triangulation.lot_signal.level})</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Hardware Harness: </span>
                        <strong className="text-slate-900">{evidenceChain.triangulation.test_system_signal.score.toFixed(0)}/100 ({evidenceChain.triangulation.test_system_signal.shared_channel})</strong>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-indigo-900 font-bold">Action: {evidenceChain.triangulation.recommended_action}</span>
                      <span className="text-slate-400">Confidence: {evidenceChain.triangulation.confidence}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WHY? (CONTRIBUTORS) */}
          {activeTab === 'why' && (
            <div className="space-y-4">
              <div className="border border-slate-200 bg-white rounded-xl p-5 text-xs shadow-sm">
                <h3 className="text-sm font-bold font-mono text-slate-900 mb-2 flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>Why Did VIGIL-X Flag This Component?</span>
                </h3>
                <p className="text-slate-600 mb-4 font-medium">
                  Parametric sensitivity decomposition based on lot-relative robust Z-scores (MAD units) and trend slope divergence.
                </p>

                <div className="space-y-3">
                  {evidenceChain.why_contributors.map((c, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 font-mono text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            idx === 0 ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            idx === 1 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {c.rank}
                          </span>
                          <span className="font-bold text-slate-900 uppercase">{c.parameter}</span>
                        </div>
                        <div className="font-mono text-xs text-sky-700 font-bold">
                          {c.importance_pct}% Relative Contribution
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${c.importance_pct}%` }}
                        />
                      </div>

                      <div className="text-xs text-slate-700 flex justify-between items-center font-mono">
                        <span className="font-medium">{c.insight}</span>
                        <span className="text-slate-500 text-[11px] font-semibold">
                          Z: {c.robust_deviation_units} MAD units
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHAT-IF? (COUNTERFACTUAL SENSITIVITY) */}
          {activeTab === 'whatif' && (
            <div className="space-y-4">
              <div className="border border-slate-200 bg-white rounded-xl p-5 text-xs shadow-sm">
                <h3 className="text-sm font-bold font-mono text-slate-900 mb-2 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>What-If? Model-Based Counterfactual Sensitivity</span>
                </h3>
                <p className="text-slate-600 mb-4 font-medium">
                  Simulates the component's projected 168h trajectory if parametric drift matched nominal lot median behavior.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Scenario A: Current */}
                  <div className="bg-rose-50/40 border border-rose-200 rounded-xl p-4 font-mono shadow-xs">
                    <div className="flex items-center space-x-2 text-rose-700 font-bold mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{evidenceChain.what_if.scenario_a_current.label}</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500">Projected 168h State:</span>{' '}
                        <span className="text-rose-700 font-bold">
                          {evidenceChain.what_if.scenario_a_current.projected_168h_state}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Estimated Time-to-Risk:</span>{' '}
                        <span className="text-amber-700 font-bold">
                          {evidenceChain.what_if.scenario_a_current.time_to_risk}
                        </span>
                      </div>
                      <p className="text-slate-700 pt-2 border-t border-rose-100 font-sans font-medium">
                        {evidenceChain.what_if.scenario_a_current.outcome}
                      </p>
                    </div>
                  </div>

                  {/* Scenario B: Counterfactual */}
                  <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-4 font-mono shadow-xs">
                    <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{evidenceChain.what_if.scenario_b_counterfactual.label}</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500">Projected 168h State:</span>{' '}
                        <span className="text-emerald-700 font-bold">
                          {evidenceChain.what_if.scenario_b_counterfactual.projected_168h_state}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Estimated Time-to-Risk:</span>{' '}
                        <span className="text-slate-900 font-bold">
                          {evidenceChain.what_if.scenario_b_counterfactual.time_to_risk}
                        </span>
                      </div>
                      <p className="text-slate-700 pt-2 border-t border-emerald-100 font-sans font-medium">
                        {evidenceChain.what_if.scenario_b_counterfactual.outcome}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic mt-4 pt-3 border-t border-slate-200">
                  {evidenceChain.what_if.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">
            Rule Applied: <strong className="text-slate-900 font-mono font-bold">{evidenceChain.chain[7].applied_rule ?? 'DYNAMIC-03'}</strong>
          </span>
          <LiquidButton
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border-slate-200 text-slate-700 font-mono font-semibold"
          >
            Close Evidence Chain
          </LiquidButton>
        </div>
      </div>
    </div>
  );
};
