import React from 'react';
import { ScreeningDecision } from '../types';
import { CheckCircle, AlertTriangle, XOctagon } from 'lucide-react';

interface DecisionBadgeProps {
  decision: ScreeningDecision;
  size?: 'sm' | 'md' | 'lg';
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({ decision, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  if (decision === 'ACCEPT') {
    return (
      <span className={`inline-flex items-center space-x-1.5 rounded-md font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm ${sizeClasses[size]}`}>
        <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
        <span>ACCEPT</span>
      </span>
    );
  }

  if (decision === 'WATCH') {
    return (
      <span className={`inline-flex items-center space-x-1.5 rounded-md font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-sm ${sizeClasses[size]}`}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
        <span>WATCH</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 rounded-md font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-sm ${sizeClasses[size]}`}>
      <XOctagon className="w-3.5 h-3.5 shrink-0 text-rose-600" />
      <span>HOLD / REVIEW</span>
    </span>
  );
};
