import React from 'react';

const ProgressBar = ({ value = 0, size = 'md', showLabel = true, className = '' }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const sizeClasses = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' };
  const barColor = clampedValue === 100
    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
    : 'bg-gradient-to-r from-violet-500 to-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`flex-1 ${sizeClasses[size]} rounded-full bg-white/[0.06] overflow-hidden`}>
        <div
          className={`${sizeClasses[size]} rounded-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-semibold text-slate-400 tabular-nums w-8 text-right shrink-0">
          {clampedValue}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
