import React from 'react';

/**
 * High-fidelity 3D Integrated Circuit package render
 * Used in Hero banner and Current Component panel matching the reference screenshot.
 */
export const IcChipGraphic: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <div
    className={`relative shrink-0 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-slate-700/60 ${className}`}
    style={{ width: size, height: size }}
  >
    {/* Microchip Pins - Left/Right/Top/Bottom */}
    <div className="absolute inset-0 flex flex-col justify-around py-1.5 px-0.5 pointer-events-none opacity-80">
      {[...Array(6)].map((_, i) => (
        <div key={`l-${i}`} className="flex justify-between w-full">
          <div className="w-1.5 h-0.5 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 rounded-sm" />
          <div className="w-1.5 h-0.5 bg-gradient-to-l from-amber-300 via-amber-200 to-amber-400 rounded-sm" />
        </div>
      ))}
    </div>

    {/* Chip Silicon Die & Laser Etch */}
    <div className="relative z-10 w-[74%] h-[74%] rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50 p-1 flex flex-col justify-between shadow-inner">
      <div className="flex items-center justify-between">
        <div className="w-1 h-1 rounded-full bg-slate-400/80" /> {/* Pin 1 dot */}
        <div className="text-[6px] font-mono tracking-tighter text-slate-400">MIL-883</div>
      </div>
      <div className="text-center font-mono">
        <div className="text-[7px] font-bold text-sky-400 tracking-wider">RAD-HARD</div>
        <div className="text-[6px] text-slate-300 font-semibold tracking-tighter">FPGA-DSP</div>
      </div>
      <div className="text-[5px] font-mono text-slate-500 text-right">ISRO</div>
    </div>
  </div>
);

/**
 * VIGIL-X Brand Wave Logo
 */
export const VigilXLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="36" height="36" rx="9" fill="url(#vigil-grad)" />
    <path
      d="M7 19L11.5 19L14 11L18 25L21.5 15L23.5 20L28 20"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="vigil-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0284C7" />
        <stop offset="1" stopColor="#1E40AF" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Bottom Sidebar Rocket Graphic & Atmospheric Horizon
 * Matches the artwork at the bottom of the reference screenshot sidebar.
 */
export const RocketSidebarGraphic: React.FC = () => (
  <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-t from-sky-100 via-blue-50 to-white border border-sky-100/80 p-3 pt-6 shadow-xs flex flex-col justify-between min-h-[140px]">
    {/* Atmospheric Cloud Curve & Stars */}
    <div className="absolute inset-0 pointer-events-none opacity-60">
      <svg className="w-full h-full" viewBox="0 0 200 140" fill="none" preserveAspectRatio="none">
        <path
          d="M0 140C40 100 110 90 200 130V140H0Z"
          fill="url(#clouds-grad)"
        />
        <circle cx="150" cy="30" r="1" fill="#38BDF8" />
        <circle cx="170" cy="50" r="1.5" fill="#38BDF8" opacity="0.6" />
        <circle cx="130" cy="70" r="1" fill="#38BDF8" opacity="0.4" />
        <defs>
          <linearGradient id="clouds-grad" x1="100" y1="90" x2="100" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E0F2FE" stopOpacity="0.8" />
            <stop offset="1" stopColor="#BAE6FD" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    {/* Launch Vehicle Rocket Vector Illustration */}
    <div className="absolute left-4 bottom-5 pointer-events-none z-10 drop-shadow-md">
      <svg width="26" height="74" viewBox="0 0 26 74" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Needle Top */}
        <line x1="13" y1="0" x2="13" y2="12" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        {/* Fairing */}
        <path d="M13 12C10 16 8.5 22 8.5 26H17.5C17.5 22 16 16 13 12Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
        {/* Upper Stage Core */}
        <rect x="8.5" y="26" width="9" height="18" fill="#0284C7" />
        <rect x="8.5" y="44" width="9" height="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
        {/* Side Boosters */}
        <path d="M5.5 34L5.5 58H8.5V36L5.5 34Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="0.8" />
        <path d="M17.5 36V58H20.5L20.5 34L17.5 36Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="0.8" />
        {/* Nozzles */}
        <path d="M10 58L9 64H17L16 58H10Z" fill="#334155" />
        {/* Exhaust Plume */}
        <path d="M11 64C11 71 13 74 13 74C13 74 15 71 15 64H11Z" fill="#F59E0B" opacity="0.9" />
        <path d="M12 64C12 68 13 70 13 70C13 70 14 68 14 64H12Z" fill="#FEF08A" />
      </svg>
    </div>

    {/* Mission Slogan */}
    <div className="relative z-10 pl-10 text-left">
      <div className="text-[11px] font-bold text-slate-800 leading-snug">
        Smarter Monitoring.
      </div>
      <div className="text-[11px] font-bold text-sky-700 leading-snug">
        Safer Skies.
      </div>
      <div className="text-[10px] font-medium text-slate-500 leading-snug mt-0.5">
        Powered by AI.
      </div>
    </div>

    {/* Bottom ISRO Emblem & SIH Attribution */}
    <div className="relative z-10 flex items-center space-x-1.5 mt-2 pt-2 border-t border-sky-200/50">
      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-[9px] font-bold shadow-xs">
        🚀
      </div>
      <div className="text-[9px] font-mono font-bold text-slate-700 uppercase tracking-tighter">
        ISRO • SIH26170
      </div>
    </div>
  </div>
);
