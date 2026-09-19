import React from 'react';
import {
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sun,
  ChevronDown
} from 'lucide-react';
import { SystemMetrics } from '../types';

interface HeaderProps {
  metrics: SystemMetrics | null;
  currentHour: number;
  isRunning: boolean;
  speed: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onHeroDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  currentHour,
  isRunning,
  speed,
  onStart,
  onPause,
  onReset,
  onSpeedChange,
  onHeroDemo
}) => {
  return (
    <header className="h-12 bg-transparent px-5 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Simulation & Dataset Disclaimer Matching Screenshot */}
      <div className="flex items-center space-x-2.5 text-xs">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] font-semibold text-[10px] tracking-wide shadow-xs">
          <AlertTriangle className="w-3 h-3 text-[#D97706]" />
          <span>SIMULATION / RESEARCH PROTOTYPE</span>
        </div>
        <span className="text-[#94A3B8] font-normal text-[11px] hidden sm:inline">
          Not real ISRO data • Synthetic burn-in dataset
        </span>
      </div>

      {/* Right: Simulation Micro-controls + System Online + Team SIH Profile */}
      <div className="flex items-center space-x-3">
        {/* Subtle Quick Actions (Play/Pause, Hero Demo) */}
        <div className="flex items-center space-x-1 bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-xs">
          {isRunning ? (
            <button
              onClick={onPause}
              className="p-1 rounded text-amber-700 hover:bg-amber-50 transition"
              title="Pause simulation"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onStart}
              className="p-1 rounded text-emerald-700 hover:bg-emerald-50 transition"
              title="Run simulation"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onReset}
            className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
            title="Reset to 0h"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onHeroDemo}
            className="px-2 py-0.5 text-[10px] font-mono font-bold text-sky-700 hover:bg-sky-50 rounded transition flex items-center space-x-1"
            title="Reset to 3-stage Hero scenario"
          >
            <Sparkles className="w-3 h-3 text-sky-600" />
            <span>Hero</span>
          </button>
        </div>

        {/* System Online Pill Matching Screenshot */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] text-xs font-semibold shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[11px]">System Online</span>
        </div>

        {/* Theme Toggle Sun Icon */}
        <button
          type="button"
          className="p-1 text-slate-400 hover:text-slate-600 transition"
          aria-label="Toggle theme"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Team User Profile Matching Screenshot */}
        <div className="flex items-center space-x-1.5 pl-1 cursor-pointer">
          <img
            src="/ref_avatar.png"
            alt="Team SIH"
            className="w-6 h-6 rounded-full object-cover border border-sky-200 shrink-0"
          />
          <span className="text-xs font-bold text-[#0F172A]">Team SIH</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
      </div>
    </header>
  );
};
