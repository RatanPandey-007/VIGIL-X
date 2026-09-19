import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  ShieldAlert,
  Cpu,
  Info
} from 'lucide-react';
import { LiquidCard } from '../components/LiquidInteraction';

export const TraditionalVsVigilXView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Rationale Header */}
      <div className="engineering-card rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
        <h2 className="text-base font-bold font-mono text-slate-900 tracking-tight">
          PARADIGM COMPARISON: CONVENTIONAL SCREENING VS VIGIL-X SENTINEL
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Why static pass/fail limits fail to catch subtle latent defects, and how dynamic lot-relative intelligence solves SIH26170.
        </p>
      </div>

      {/* Visual Workflow Comparison (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Traditional Conventional Screening */}
        <div className="engineering-card rounded-2xl p-6 border border-slate-200 space-y-4 bg-slate-50/70 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-sm font-bold font-mono text-slate-800">
              CONVENTIONAL SCREENING
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-200 text-slate-700 font-semibold border border-slate-300">
              Static Limit Standard
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <LiquidCard className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <strong className="text-slate-900 font-bold">1. Static Absolute Limits</strong>
                <p className="text-[11px] text-slate-500 font-sans font-medium">Hard threshold (e.g., Isb &lt; 85 µA, Temp &lt; 125°C).</p>
              </div>
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            </LiquidCard>

            <div className="flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            <LiquidCard className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <strong className="text-slate-900 font-bold">2. Blind to Lot Dispersion</strong>
                <p className="text-[11px] text-slate-500 font-sans font-medium">Abnormal unit in tight lot passes if below hard limit.</p>
              </div>
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            </LiquidCard>

            <div className="flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            <LiquidCard className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <strong className="text-slate-900 font-bold">3. Mandatory Full 168-Hour Run</strong>
                <p className="text-[11px] text-slate-500 font-sans font-medium">Must burn-in for all 168 hours before outcome is known.</p>
              </div>
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            </LiquidCard>

            <div className="flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            <LiquidCard className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <strong className="text-slate-900 font-bold">4. Late Discovery / Infant Mortality</strong>
                <p className="text-[11px] text-slate-500 font-sans font-medium">Defects escape to subsystem assembly or fail late in chamber.</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            </LiquidCard>
          </div>
        </div>

        {/* Column 2: VIGIL-X Architecture */}
        <div className="engineering-card rounded-2xl p-6 border border-sky-200 space-y-4 bg-sky-50/40 shadow-xs">
          <div className="flex items-center justify-between border-b border-sky-200 pb-3">
            <span className="text-sm font-bold font-mono text-sky-800">
              VIGIL-X DYNAMIC SENTINEL
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-sky-100 text-sky-800 font-bold border border-sky-300">
              Dual-Capability AI Platform
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <LiquidCard className="p-3.5 rounded-xl bg-white border border-sky-100 flex items-center justify-between shadow-xs">
              <div>
                <strong className="text-slate-900 font-bold">1. Lot Reliability Fingerprint</strong>
                <p className="text-[11px] text-slate-600 font-sans font-medium">Robust median & MAD envelopes catch lot-relative outliers.</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
            </LiquidCard>

            <div className="flex justify-center text-sky-500">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            <LiquidCard className="p-3.5 rounded-xl bg-white border border-sky-100 flex items-center justify-between shadow-xs">
              <div>
                <strong className="text-slate-900 font-bold">2. Module A Dynamic Anomaly Engine</strong>
                <p className="text-[11px] text-slate-600 font-sans font-medium">Hybrid ensemble scores deviation, slope, and multi-channel shifts.</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
            </LiquidCard>

            <div className="flex justify-center text-sky-500">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            <LiquidCard className="p-3.5 rounded-xl bg-white border border-sky-100 flex items-center justify-between shadow-xs">
              <div>
                <strong className="text-slate-900 font-bold">3. Module B Early 168h Drift Predictor</strong>
                <p className="text-[11px] text-slate-600 font-sans font-medium">Projects 168h outcome at 24h with residual uncertainty intervals.</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
            </LiquidCard>

            <div className="flex justify-center text-sky-500">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            <LiquidCard className="p-3.5 rounded-xl bg-white border border-sky-100 flex items-center justify-between shadow-xs">
              <div>
                <strong className="text-slate-900 font-bold">4. 8-Stage Reliability Evidence Chain</strong>
                <p className="text-[11px] text-slate-600 font-sans font-medium">Fully auditable rationale with Time-to-Risk and What-If sensitivity.</p>
              </div>
              <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
            </LiquidCard>
          </div>
        </div>
      </div>

      {/* Feature Capability Comparison Matrix */}
      <div className="engineering-card rounded-2xl p-6 border border-slate-200 bg-white space-y-4 shadow-xs">
        <h3 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">
          Capability Matrix
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3 font-bold">Evaluation Criteria</th>
                <th className="py-2.5 px-3 font-bold">Conventional Screening</th>
                <th className="py-2.5 px-3 font-bold text-sky-700">VIGIL-X Intelligence</th>
                <th className="py-2.5 px-3 font-bold">Space Screening Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-3 font-bold text-slate-900">Detection Basis</td>
                <td className="py-3 px-3 text-slate-500">Fixed static datasheet limits</td>
                <td className="py-3 px-3 text-sky-700 font-bold">Dynamic Lot-Relative Fingerprints</td>
                <td className="py-3 px-3 text-slate-700 font-medium">Catches subtle defects within limits</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-3 font-bold text-slate-900">Screening Decision Timing</td>
                <td className="py-3 px-3 text-slate-500">End of 168 hours</td>
                <td className="py-3 px-3 text-sky-700 font-bold">Early 24h Triage Prediction</td>
                <td className="py-3 px-3 text-slate-700 font-medium">88.4% earlier quarantine priority</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-3 font-bold text-slate-900">Trajectory Forecasting</td>
                <td className="py-3 px-3 text-slate-500">None (historical points only)</td>
                <td className="py-3 px-3 text-sky-700 font-bold">Gradient Regression (0-24h → 168h)</td>
                <td className="py-3 px-3 text-slate-700 font-medium">Anticipates 168h failure before occurrence</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-3 font-bold text-slate-900">Uncertainty Quantification</td>
                <td className="py-3 px-3 text-slate-500">None (binary 0/1)</td>
                <td className="py-3 px-3 text-sky-700 font-bold">90% Empirical Residual Band</td>
                <td className="py-3 px-3 text-slate-700 font-medium">Mandatory review for low confidence</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-3 font-bold text-slate-900">Time-to-Risk Estimation</td>
                <td className="py-3 px-3 text-slate-500">None</td>
                <td className="py-3 px-3 text-sky-700 font-bold">Dynamic Hours Calculation</td>
                <td className="py-3 px-3 text-slate-700 font-medium">Actionable remaining test runway</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-3 font-bold text-slate-900">Explainability & Audit</td>
                <td className="py-3 px-3 text-slate-500">Manual inspection of raw data</td>
                <td className="py-3 px-3 text-sky-700 font-bold">8-Stage Reliability Evidence Chain</td>
                <td className="py-3 px-3 text-slate-700 font-medium">Instant mission-assurance signoff</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
