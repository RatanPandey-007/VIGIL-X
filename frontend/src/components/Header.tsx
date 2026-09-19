import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { SystemMetrics } from '../types';

interface HeaderProps {
  metrics: SystemMetrics | null;
  currentHour: number;
  isRunning: boolean;
  speed: number;
  selectedComponentId?: string;
  selectedLotId?: string;
  pageTitle?: string;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onHeroDemo: () => void; // internal handler name preserved
}

export const Header: React.FC<HeaderProps> = ({
  currentHour,
  isRunning,
  selectedComponentId = 'C-104',
  selectedLotId = 'LOT-A17',
  pageTitle = 'Overview',
  onStart,
  onPause,
  onReset,
  onHeroDemo
}) => {
  return (
    <header className="h-13 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Clean Page / Context Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold font-mono text-slate-900 tracking-tight">
            {pageTitle}
          </span>
          <span className="text-slate-300 font-mono">/</span>
          <span className="text-xs font-mono text-slate-500 font-medium">
            Command Center
          </span>
        </div>
      </div>

      {/* Center: Mission / Problem Statement Context */}
      <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-slate-500">
        <span className="font-semibold text-slate-800">SIH26170</span>
        <span>•</span>
        <span>Indian Space Research Organisation (ISRO)</span>
        <span>•</span>
        <span className="text-slate-400">Smart Automation</span>
      </div>

      {/* Right: Telemetry Context, Controls & System Online */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Burn-in & Selected Component Pill */}
        <div className="hidden sm:flex items-center space-x-2.5 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-600 font-mono">
          <span className="text-slate-400 text-[11px]">Comp:</span>
          <span className="font-bold text-slate-900">{selectedComponentId}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400 text-[11px]">Lot:</span>
          <span className="font-semibold text-blue-700">{selectedLotId}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400 text-[11px]">Hour:</span>
          <span className="font-bold text-slate-900">{currentHour.toFixed(0)}h / 168h</span>
        </div>

        {/* Physical-style Simulation Controls */}
        <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200/90 rounded-lg p-0.5">
          {isRunning ? (
            <button
              type="button"
              onClick={onPause}
              className="px-2 py-1 rounded-md text-amber-800 hover:bg-amber-100/60 font-mono font-semibold transition flex items-center space-x-1 text-[11px]"
              title="Pause burn-in clock"
            >
              <Pause className="w-3.5 h-3.5 text-amber-700" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="px-2 py-1 rounded-md text-emerald-800 hover:bg-emerald-100/60 font-mono font-semibold transition flex items-center space-x-1 text-[11px]"
              title="Start burn-in clock"
            >
              <Play className="w-3.5 h-3.5 text-emerald-700" />
              <span>START</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
            title="Reset burn-in to 0h"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* DEMO MODE Button (Replacing all user-facing Hero references) */}
          <button
            type="button"
            onClick={onHeroDemo}
            className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-700 font-mono font-bold text-[11px] transition flex items-center space-x-1 shadow-2xs"
            title="Run deterministic VIGIL-X demonstration"
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>DEMO MODE</span>
          </button>
        </div>

        {/* SYSTEM ONLINE Indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>

        {/* Engineering Operator Profile */}
        <div className="flex items-center space-x-1.5 pl-1 text-slate-700">
          <img
            src="/ref_avatar.png"
            alt="Operator"
            className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <span className="text-xs font-semibold text-slate-800 hidden md:inline">Team SIH</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
      </div>
    </header>
  );
};
