import React from 'react';

const ProgressBar = ({ value = 0, size = 'md', showLabel = true }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const sizeClasses = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };
  const barColor = clampedValue === 100
    ? 'bg-emerald-500'
    : 'bg-gradient-to-r from-violet-500 to-purple-500';

  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex-1 ${sizeClasses[size]} rounded-full bg-white/[0.06] overflow-hidden`}>
        <div
          className={`${sizeClasses[size]} rounded-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%`, animation: 'progressFill 0.8s ease-out' }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-400 tabular-nums w-9 text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
