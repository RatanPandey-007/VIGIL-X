import React, { useState, useRef, useCallback, ReactNode, ButtonHTMLAttributes, HTMLAttributes } from 'react';

export interface RippleData {
  id: number;
  x: number;
  y: number;
  size: number;
  color?: string;
}

/**
 * Hook to manage high-precision, pointer-aware liquid water refraction micro-interactions.
 * 40% more restrained: tightened radius, zero blur, subtle specular meniscus ring,
 * and rapid 320ms physical decay.
 */
export const useLiquidRipple = (duration = 320) => {
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const nextId = useRef(0);

  const triggerRipple = useCallback((e: React.PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>, color?: string) => {
    // Check reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    // Exact pointer coordinate relative to element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Precision-proportioned dimension (restrained to 1.25x max element dimension)
    const size = Math.max(rect.width, rect.height) * 1.25;

    const id = nextId.current++;
    setRipples((prev) => [...prev, { id, x, y, size, color }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, duration);
  }, [duration]);

  return { ripples, triggerRipple };
};

/**
 * Visual layer rendering the water droplet ripples
 */
export const RippleRenderer: React.FC<{ ripples: RippleData[] }> = ({ ripples }) => {
  if (ripples.length === 0) return null;

  return (
    <span className="absolute inset-0 overflow-hidden pointer-events-none z-10 rounded-[inherit]">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="water-ripple-layer"
          style={{
            left: `${r.x - r.size / 2}px`,
            top: `${r.y - r.size / 2}px`,
            width: `${r.size}px`,
            height: `${r.size}px`,
            ...(r.color ? { background: r.color } : {})
          }}
        />
      ))}
    </span>
  );
};

export interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber' | 'emerald';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  compressScale?: string;
  rippleColor?: string;
}

/**
 * Aerospace-grade physical instrument button.
 * Tactile micro-depression (0.5%) and subtle liquid meniscus highlight ring on click.
 */
export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(({
  children,
  onClick,
  onPointerDown,
  disabled,
  className = '',
  variant = 'secondary',
  size,
  compressScale = 'active:scale-[0.995]',
  rippleColor,
  type = 'button',
  ...props
}, ref) => {
  const { ripples, triggerRipple } = useLiquidRipple(320);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!disabled) {
      triggerRipple(e, rippleColor);
    }
    if (onPointerDown) {
      onPointerDown(e);
    }
  };

  const variantStyles = {
    primary: 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs border border-sky-600',
    secondary: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs hover:border-slate-300',
    ghost: 'bg-transparent hover:bg-slate-100/70 text-slate-700 border border-transparent',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-rose-600',
    amber: 'bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200 shadow-xs',
    emerald: 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 shadow-xs'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs rounded-lg',
    md: 'px-3.5 py-2 text-xs rounded-xl',
    lg: 'px-4 py-2.5 text-sm rounded-xl',
    icon: 'p-2 rounded-lg'
  };

  const appliedSize = size ? sizeStyles[size] : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none font-medium transition-all duration-120 ease-out outline-none ${compressScale} ${variantStyles[variant]} ${appliedSize} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      <RippleRenderer ripples={ripples} />
      <span className="relative z-0 inline-flex items-center space-x-1.5">{children}</span>
    </button>
  );
});

LiquidButton.displayName = 'LiquidButton';

export interface LiquidCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
  active?: boolean;
  compressScale?: string;
  rippleColor?: string;
}

/**
 * Physical tactile instrument card with subtle elevation and micro-interaction.
 */
export const LiquidCard: React.FC<LiquidCardProps> = ({
  children,
  onClick,
  onPointerDown,
  interactive = true,
  active = false,
  compressScale = 'active:scale-[0.997]',
  rippleColor,
  className = '',
  ...props
}) => {
  const { ripples, triggerRipple } = useLiquidRipple(300);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (interactive && onClick) {
      triggerRipple(e, rippleColor);
    }
    if (onPointerDown) {
      onPointerDown(e);
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onClick={onClick}
      className={`relative rounded-xl border transition-all duration-150 ease-out ${
        active
          ? 'bg-white border-sky-500 ring-1 ring-sky-500/15 shadow-xs'
          : interactive && onClick
          ? 'bg-white hover:bg-slate-50/40 border-slate-200 hover:border-slate-300 hover:shadow-liquid-hover cursor-pointer'
          : 'bg-white border-slate-200 shadow-liquid'
      } ${interactive && onClick ? compressScale : ''} ${className}`}
      {...props}
    >
      <RippleRenderer ripples={ripples} />
      <div className="relative z-0">{children}</div>
    </div>
  );
};

export interface LiquidTabProps {
  id?: string;
  label?: string;
  children?: ReactNode;
  active: boolean;
  onClick: (id?: any) => void;
  icon?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

/**
 * Precision gliding navigation tab with restrained physical feedback.
 */
export const LiquidTab: React.FC<LiquidTabProps> = ({
  id,
  label,
  children,
  active,
  onClick,
  icon,
  badge,
  className = ''
}) => {
  const { ripples, triggerRipple } = useLiquidRipple(260);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    triggerRipple(e);
  };

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onClick={() => onClick(id)}
      className={`relative px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-140 flex items-center space-x-2 select-none active:scale-[0.994] ${
        active
          ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs border border-sky-200/80'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border border-transparent'
      } ${className}`}
    >
      <RippleRenderer ripples={ripples} />
      {icon && <span className={`transition-colors duration-150 ${active ? 'text-sky-600' : 'text-slate-400'}`}>{icon}</span>}
      {label && <span className="relative z-0">{label}</span>}
      {children && <span className="relative z-0">{children}</span>}
      {badge && <span className="relative z-0 ml-1">{badge}</span>}
      {active && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-sky-600 rounded-full" />
      )}
    </button>
  );
};
