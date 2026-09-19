import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  Layers,
  Cpu,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  FileText
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenEvidenceModal: () => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenEvidenceModal,
  alertCount = 22
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'lab', label: 'Live Burn-In', icon: FlaskConical },
    { id: 'lots', label: 'Lot Intelligence', icon: Layers },
    { id: 'forensics', label: 'Component Forensics', icon: Cpu },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'alerts', label: 'Risk Alerts', icon: AlertTriangle, badge: alertCount > 0 ? String(alertCount) : undefined },
    { id: 'validation', label: 'Model Validation', icon: CheckSquare },
    { id: 'evidence', label: 'Evidence Chain', icon: FileText },
  ];

  const handleItemClick = (id: string) => {
    if (id === 'evidence') {
      onOpenEvidenceModal();
    } else {
      onTabChange(id);
    }
  };

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-200/90 h-screen sticky top-0 flex flex-col justify-between py-3.5 px-3 z-40 select-none overflow-y-auto">
      {/* Brand Header */}
      <div>
        <div
          className="flex items-center space-x-2.5 px-1.5 py-1 mb-4 cursor-pointer group"
          onClick={() => onTabChange('overview')}
        >
          {/* Engineering Geometric Logo */}
          <div className="w-8 h-8 rounded-lg border border-blue-200 bg-blue-50/80 flex items-center justify-center p-1 shrink-0 shadow-xs group-hover:border-blue-300 transition">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path
                d="M3 13L6.5 13L9.5 6L14 20L17.5 10L19.5 13L21 13"
                stroke="#1D4ED8"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-base font-extrabold font-mono tracking-tight text-slate-900 flex items-center space-x-1">
              <span>VIGIL-X</span>
            </div>
            <div className="text-[9px] font-semibold tracking-wide text-slate-500 truncate">
              Dynamic Reliability Sentinel
            </div>
          </div>
        </div>

        {/* Navigation Menu List */}
        <nav className="space-y-0.5" aria-label="Primary navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition duration-150 group relative ${
                  isTabActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isTabActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold font-mono shrink-0 ml-1.5">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mission / Rocket Visual Context */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="w-full rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50/60 p-2 shadow-xs">
          <div className="w-full h-24 rounded-lg overflow-hidden bg-white border border-slate-100 mb-2 flex items-center justify-center">
            <img
              src="/ref_rocket_full.png"
              alt="Aerospace Mission Vehicle"
              className="w-full h-full object-cover block"
            />
          </div>
          <div className="px-1">
            <div className="text-[10px] font-bold font-mono text-slate-800 tracking-tight truncate">
              SIH26170 • ISRO
            </div>
            <div className="text-[9px] text-slate-500 font-medium leading-normal mt-0.5">
              Component Burn-In Reliability
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
