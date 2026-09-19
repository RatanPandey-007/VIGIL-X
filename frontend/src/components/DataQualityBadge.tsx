import React from 'react';
import { DataQualityStatus } from '../types';
import { ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';

interface DataQualityBadgeProps {
  status: DataQualityStatus;
  score?: number;
}

export const DataQualityBadge: React.FC<DataQualityBadgeProps> = ({ status, score = 100 }) => {
  if (status === 'GOOD') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>DQ: GOOD ({score}%)</span>
      </span>
    );
  }

  if (status === 'WARNING') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-sm">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
        <span>DQ: WARNING ({score}%)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-sm">
      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
      <span>DQ: INVALID ({score}%)</span>
    </span>
  );
};
