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
  onHeroDemo: () => void; // internal handler preserved
}

export const Header: React.FC<HeaderProps> = ({
  currentHour,
  isRunning,
  selectedComponentId = 'C-104',
  selectedLotId = 'LOT-A17',
  onStart,
  onPause,
  onReset,
  onHeroDemo
}) => {
  return (
    <header className="h-13 bg-white border-b border-slate-200/90 px-5 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-2xs">
      {/* LEFT: VIGIL-X Dynamic Reliability Sentinel */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="leading-tight">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-extrabold font-mono tracking-tight text-slate-900">
              VIGIL-X
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
            <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500">
              Dynamic Reliability Sentinel
            </span>
          </div>
          <div className="sm:hidden text-[10px] font-medium text-slate-500">
            Dynamic Reliability Sentinel
          </div>
        </div>
      </div>

      {/* CENTER: SIH26170 • Indian Space Research Organisation (ISRO) • Smart Automation */}
      <div className="hidden xl:flex items-center space-x-2 text-xs font-mono text-slate-500">
        <span className="font-bold text-slate-800">SIH26170</span>
        <span className="text-slate-300">•</span>
        <span className="font-medium text-slate-700">Indian Space Research Organisation (ISRO)</span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-400">Smart Automation</span>
      </div>

      {/* RIGHT: C-104 | LOT-A17 | 0h / 168h | Controls | SYSTEM ONLINE */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 text-xs">
        {/* Active Telemetry Identifier Pill */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-600 font-mono text-[11px]">
          <span className="font-bold text-slate-900">{selectedComponentId}</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-blue-700">{selectedLotId}</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-700">{currentHour.toFixed(0)}h / 168h</span>
        </div>

        {/* Compact Engineering Controls */}
        <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200/90 rounded-lg p-0.5">
          {isRunning ? (
            <button
              type="button"
              onClick={onPause}
              className="px-2.5 py-1 rounded-md text-amber-800 hover:bg-amber-100/70 font-mono font-bold transition flex items-center space-x-1 text-[11px]"
              title="Pause burn-in clock"
            >
              <Pause className="w-3.5 h-3.5 text-amber-700" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="px-2.5 py-1 rounded-md text-emerald-800 hover:bg-emerald-100/70 font-mono font-bold transition flex items-center space-x-1 text-[11px]"
              title="Start burn-in clock"
            >
              <Play className="w-3.5 h-3.5 text-emerald-700" />
              <span>START</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition"
            title="Reset burn-in to 0h"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* DEMO MODE: Distinct & Professional */}
          <button
            type="button"
            onClick={onHeroDemo}
            className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-[11px] transition flex items-center space-x-1 shadow-xs"
            title="Run deterministic VIGIL-X demonstration"
          >
            <Sparkles className="w-3 h-3 text-blue-200" />
            <span>DEMO MODE</span>
          </button>
        </div>

        {/* SYSTEM ONLINE Indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">SYSTEM ONLINE</span>
          <span className="sm:hidden">ONLINE</span>
        </div>

        {/* Engineering Operator Profile */}
        <div className="hidden lg:flex items-center space-x-1.5 pl-1 text-slate-700">
          <img
            src="/ref_avatar.png"
            alt="Operator"
            className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <span className="text-xs font-semibold text-slate-800">Team SIH</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
      </div>
    </header>
  );
};
