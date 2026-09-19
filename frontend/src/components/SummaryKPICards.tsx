import React from 'react';
import {
  Cpu,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  Target
} from 'lucide-react';
import { SystemMetrics } from '../types';

interface SummaryKPICardsProps {
  metrics: SystemMetrics | null;
}

export const SummaryKPICards: React.FC<SummaryKPICardsProps> = ({ metrics }) => {
  const total = metrics?.total_components ?? 26;
  const normal = metrics?.normal_count ?? 4;
  const watch = metrics?.watch_count ?? 9;
  const highRisk = metrics?.high_risk_count ?? 13;
  const anomalies = metrics?.anomalies_flagged ?? 22;
  const earlyFlags = metrics?.early_flags_detected ?? metrics?.early_risks_detected ?? 22;
  const medianTime = metrics?.median_detection_latency_hours ?? 4.0;
  const meanTime = metrics?.mean_detection_latency_hours ?? 7.9;

  const normalPct = total > 0 ? ((normal / total) * 100).toFixed(0) : '15';
  const watchPct = total > 0 ? ((watch / total) * 100).toFixed(0) : '35';
  const highRiskPct = total > 0 ? ((highRisk / total) * 100).toFixed(0) : '50';

  const cards = [
    {
      label: 'Components Tested',
      value: total,
      subtext: 'Active in 3 lots',
      icon: Cpu,
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Normal',
      value: normal,
      subtext: `${normalPct}% of lot cohort`,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      valueColor: 'text-emerald-700',
    },
    {
      label: 'Watch',
      value: watch,
      subtext: `${watchPct}% lot divergence`,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-800 border-amber-200',
      valueColor: 'text-amber-800',
    },
    {
      label: 'High Risk',
      value: highRisk,
      subtext: `${highRiskPct}% screening breach`,
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
      valueColor: 'text-rose-700',
    },
    {
      label: 'Anomalies',
      value: anomalies,
      subtext: 'Dynamic lot outliers',
      icon: Activity,
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Early Flags',
      value: earlyFlags,
      subtext: 'Triage at 24h gate',
      icon: Target,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
      valueColor: 'text-blue-700',
    },
    {
      label: 'Median Detection Time',
      value: `${medianTime} h`,
      subtext: `Mean: ${meanTime} h`,
      icon: Clock,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
      valueColor: 'text-blue-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex flex-col justify-between hover:border-slate-300 transition duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono truncate">
                {c.label}
              </span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center border shrink-0 ${c.iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className={`text-xl font-bold font-mono tracking-tight mt-2 ${c.valueColor}`}>
              {c.value}
            </div>
            <div className="text-[10px] font-medium text-slate-400 truncate mt-1">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
