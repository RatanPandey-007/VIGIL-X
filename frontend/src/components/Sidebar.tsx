import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  Layers,
  Cpu,
  TrendingUp,
  Bell,
  CheckSquare,
  FileText,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenEvidenceModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenEvidenceModal
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'lab', label: 'Live Burn-In Lab', icon: FlaskConical },
    { id: 'lots', label: 'Lot Intelligence', icon: Layers },
    { id: 'components', label: 'Components', icon: Cpu },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: '3' },
    { id: 'validation', label: 'Model Validation', icon: CheckSquare },
    { id: 'evidence', label: 'Evidence Chain', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    if (id === 'evidence') {
      onOpenEvidenceModal();
    } else if (id === 'components') {
      onTabChange('forensics');
    } else if (id === 'predictions') {
      onTabChange('overview');
    } else if (id === 'alerts') {
      onTabChange('overview');
    } else if (id === 'settings') {
      onTabChange('comparison');
    } else {
      onTabChange(id);
    }
  };

  return (
    <aside className="w-52 shrink-0 bg-white border-r border-slate-200/80 h-screen sticky top-0 flex flex-col justify-between py-3 px-3 z-40 select-none overflow-y-auto">
      {/* Top Brand Logo Matching Reference Screenshot */}
      <div>
        <div className="flex items-center space-x-2 px-1 py-1 mb-3 cursor-pointer" onClick={() => onTabChange('overview')}>
          {/* Exact Circular V-Wave Logo */}
          <div className="w-7 h-7 rounded-full border border-sky-300/80 bg-sky-50/50 flex items-center justify-center p-0.5 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path
                d="M3 13L6.5 13L9.5 6L14 20L17.5 10L19.5 13L21 13"
                stroke="#1D4ED8"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-base font-extrabold font-mono tracking-tight text-[#0F172A]">
              VIGIL-X
            </div>
            <div className="text-[9px] font-semibold text-slate-400 truncate">
              Dynamic Reliability Sentinel
            </div>
          </div>
        </div>

        {/* Navigation Menu List */}
        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isTabActive =
              activeTab === item.id ||
              (item.id === 'components' && activeTab === 'forensics') ||
              (item.id === 'settings' && activeTab === 'comparison');

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition duration-150 group ${
                  isTabActive
                    ? 'bg-[#EBF3FF] text-[#1D4ED8] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isTabActive ? 'text-[#1D4ED8]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Rocket Illustration Image from Screenshot */}
      <div className="mt-3 pt-2">
        <div className="w-full rounded-xl overflow-hidden border border-slate-100 shadow-xs bg-[#F8FAFC]">
          <img
            src="/ref_rocket_full.png"
            alt="VIGIL-X Aerospace Sentinel"
            className="w-full h-auto object-contain block"
          />
        </div>
      </div>
    </aside>
  );
};
