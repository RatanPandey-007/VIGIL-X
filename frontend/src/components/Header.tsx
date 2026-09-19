import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Check,
  Cpu,
  Layers,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { SystemMetrics } from '../types';

export interface ScenarioOption {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
}

export const DEMO_SCENARIO_LIST: ScenarioOption[] = [
  {
    id: 'isolated_component',
    title: '1. Isolated Component Drift',
    subtitle: 'C-104 anomaly • Lot & test hardware nominal',
    icon: Cpu,
    badge: 'ISOLATED',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    id: 'lot_drift',
    title: '2. Common-Cause Lot Drift',
    subtitle: 'LOT-A17 72% drift vs simulated reference lots',
    icon: Layers,
    badge: 'LOT-WIDE',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  {
    id: 'test_system_drift',
    title: '3. Test-System Drift Suspected',
    subtitle: 'CHANNEL-A cross-lot correlation • Test hardware shift',
    icon: Wrench,
    badge: 'TEST-SYSTEM',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    id: 'combined_risk',
    title: '4. Combined Component + Lot Risk',
    subtitle: 'Dual-layer risk • Die defect + Wafer-lot drift',
    icon: AlertTriangle,
    badge: 'SYSTEMIC',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

interface HeaderProps {
  metrics: SystemMetrics | null;
  currentHour: number;
  isRunning: boolean;
  speed: number;
  selectedComponentId?: string;
  selectedLotId?: string;
  pageTitle?: string;
  activeScenario?: string;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onHeroDemo: () => void;
  onSelectScenario?: (scenarioId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentHour,
  isRunning,
  selectedComponentId = 'C-104',
  selectedLotId = 'LOT-A17',
  activeScenario = 'isolated_component',
  onStart,
  onPause,
  onReset,
  onHeroDemo,
  onSelectScenario
}) => {
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsScenarioMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* DEMO MODE: Split Button with Scenario Dropdown */}
          <div className="relative flex items-center" ref={menuRef}>
            <div className="inline-flex rounded-md shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={onHeroDemo}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-[11px] transition flex items-center space-x-1 border-r border-blue-500"
                title="Run deterministic VIGIL-X demonstration"
              >
                <Sparkles className="w-3 h-3 text-blue-200" />
                <span>DEMO MODE</span>
              </button>
              <button
                type="button"
                onClick={() => setIsScenarioMenuOpen(!isScenarioMenuOpen)}
                className="px-1.5 py-1 bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center"
                title="Select Root-Cause Demo Scenario"
              >
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isScenarioMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isScenarioMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-84 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                    Root-Cause Triangulation Scenarios
                  </span>
                  <span className="text-[10px] font-mono text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                    4 Deterministic
                  </span>
                </div>

                <div className="py-1">
                  {DEMO_SCENARIO_LIST.map((scen) => {
                    const Icon = scen.icon;
                    const isSelected = activeScenario === scen.id;
                    return (
                      <button
                        key={scen.id}
                        type="button"
                        onClick={() => {
                          if (onSelectScenario) {
                            onSelectScenario(scen.id);
                          } else {
                            onHeroDemo();
                          }
                          setIsScenarioMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start space-x-2.5 transition hover:bg-slate-50 ${
                          isSelected ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <div className={`mt-0.5 p-1 rounded-md shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${isSelected ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                              {scen.title}
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${scen.badgeColor}`}>
                              {scen.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            {scen.subtitle}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Adv. to 24h for active triage</span>
                  <span className="text-slate-400">ISRO SIH26170</span>
                </div>
              </div>
            )}
          </div>
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
