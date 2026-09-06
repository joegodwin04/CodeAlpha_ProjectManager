import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  onIconClick,
  iconAriaLabel,
}) => {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-[#121526]/50 px-6 py-14 text-center">
      {onIconClick ? (
        <button
          type="button"
          onClick={onIconClick}
          aria-label={iconAriaLabel || 'Add item'}
          className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] hover:bg-violet-600/15 border border-white/[0.08] hover:border-violet-500/40 text-slate-400 hover:text-violet-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 shadow-sm"
        >
          <Icon className="h-6 w-6 transition-colors group-hover:text-violet-300" aria-hidden="true" />
        </button>
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] text-slate-500">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      )}
      <h3 className="mt-4 text-sm font-semibold text-slate-100 tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
