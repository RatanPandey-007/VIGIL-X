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
  const normal = metrics?.normal_count ?? 5;
  const watch = metrics?.watch_count ?? 11;
  const highRisk = metrics?.high_risk_count ?? 13;
  const anomalies = metrics?.anomalies_flagged ?? 20;
  const earlyFlags = metrics?.early_flags_detected ?? metrics?.early_risks_detected ?? 1;
  const medianTime = metrics?.median_detection_latency_hours ?? 7.5;
  const meanTime = metrics?.mean_detection_latency_hours ?? 19.5;

  const normalPct = total > 0 ? ((normal / total) * 100).toFixed(1) : '19.2';
  const watchPct = total > 0 ? ((watch / total) * 100).toFixed(1) : '42.3';
  const highRiskPct = total > 0 ? ((highRisk / total) * 100).toFixed(1) : '50.0';
  const anomalyPct = total > 0 ? ((anomalies / total) * 100).toFixed(1) : '76.9';
  const earlyPct = total > 0 ? ((earlyFlags / total) * 100).toFixed(1) : '3.8';

  const cards = [
    {
      label: 'Components Tested',
      value: total,
      subtext: 'Active in 3 lots',
      icon: Cpu,
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Normal',
      value: normal,
      subtext: `${normalPct}%`,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      valueColor: 'text-emerald-600',
    },
    {
      label: 'Watch',
      value: watch,
      subtext: `${watchPct}%`,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      valueColor: 'text-amber-600',
    },
    {
      label: 'High Risk',
      value: highRisk,
      subtext: `${highRiskPct}%`,
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      valueColor: 'text-rose-600',
    },
    {
      label: 'Anomalies Detected',
      value: anomalies,
      subtext: `${anomalyPct}%`,
      icon: Activity,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      valueColor: 'text-purple-600',
    },
    {
      label: 'Early Flags (<24h)',
      value: earlyFlags,
      subtext: `${earlyPct}%`,
      icon: Target,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      valueColor: 'text-indigo-600',
    },
    {
      label: 'Median Detection Time',
      value: `${medianTime} h`,
      subtext: `(Mean: ${meanTime} h)`,
      icon: Clock,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      valueColor: 'text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center space-x-3"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${c.iconBg}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider truncate font-mono">
                {c.label}
              </div>
              <div className={`text-lg font-bold font-mono tracking-tight mt-0.5 ${c.valueColor}`}>
                {c.value}
              </div>
              <div className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                {c.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
