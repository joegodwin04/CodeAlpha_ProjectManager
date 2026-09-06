import React from 'react';

const statusConfig = {
  // Project statuses
  Planning:   { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-300',   dot: 'bg-slate-400' },
  Active:     { bg: 'bg-blue-500/10 border-blue-500/25',  text: 'text-blue-400',    dot: 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]' },
  'On Hold':  { bg: 'bg-amber-500/10 border-amber-500/25', text: 'text-amber-400',   dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]' },
  Completed:  { bg: 'bg-emerald-500/10 border-emerald-500/25', text: 'text-emerald-400', dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' },
  // Task statuses
  Todo:          { bg: 'bg-slate-500/10 border-slate-500/20',   text: 'text-slate-300',   dot: 'bg-slate-400' },
  'In Progress': { bg: 'bg-violet-500/10 border-violet-500/25', text: 'text-violet-300', dot: 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.6)]' },
  Done:          { bg: 'bg-emerald-500/10 border-emerald-500/25', text: 'text-emerald-400', dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.Planning;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
};

export default StatusBadge;
